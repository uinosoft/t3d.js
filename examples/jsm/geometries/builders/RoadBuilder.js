/**
 * RoadBuilder
 */
const RoadBuilder = {

	getGeometryData: function(data) {
		const corners = new Map();
		// calculate roads and get corners.
		const roadsData = parseRoadData(data, corners);
		calculateCorner(corners);

		const { edgeInfo, sidewalkInfo, crossroadInfo } = getVertices(roadsData, corners);

		return {
			main: edgeInfo,
			sidewalk: sidewalkInfo,
			corner: crossroadInfo
		};
	}

};

const vec2_1 = [], vec2_2 = [], vec2_3 = [], vec2_4 = [], vec2_5 = [],
	vec2_6 = [], vec2_7 = [], vec2_8 = [], vec2_9 = [], vec2_10 = [];

function parseRoadData(data, corners) {
	let roadsData = data.map(info => {
		const road = {
			startCorner: null,
			endCorner: null,

			startLeft: [],
			startRight: [],
			endLeft: [],
			endRight: [],

			fixPoints: [undefined, undefined, undefined, undefined],
			insideArcPoints: [undefined, undefined, undefined, undefined],
			sidewalkPoints: [undefined, undefined, undefined, undefined],
			tStartSidewalkPoints: [undefined, undefined, undefined, undefined],
			tEndSidewalkPoints: [undefined, undefined, undefined, undefined],

			dir: [],
			angle: 0,
			length: 0,
			halfWidth: info.width / 2,
			sidewalkWidth: info.sidewalkWidth,
			cornerRadius: info.cornerRadius,
			cornerSections: info.cornerSections,

			uvrepeat: info.uvrepeat ? info.uvrepeat.slice(0) : [1, 1]
		};

		const start = copyValue(vec2_1, info.points);
		const startKey = start[0] + '-' + start[1];
		let startCorner;
		if (corners.has(startKey)) {
			startCorner = corners.get(startKey);
		} else {
			startCorner = { position: start.slice(), roads: [], outsideArcPoints: [], insideArcPoints: [], sidewalkPoints: [] };
			corners.set(startKey, startCorner);
		}
		road.startCorner = startCorner;
		startCorner.roads.push(road);

		const end = copyValue(vec2_2, info.points, 2);
		const endKey = end[0] + '-' + end[1];
		let endCorner;
		if (corners.has(endKey)) {
			endCorner = corners.get(endKey);
		} else {
			endCorner = { position: end.slice(), roads: [], outsideArcPoints: [], insideArcPoints: [], sidewalkPoints: [] };
			corners.set(endKey, endCorner);
		}
		road.endCorner = endCorner;
		endCorner.roads.push(road);

		const dir = subVectors(vec2_3, end, start);
		const dirLength = getLength(dir);

		road.length = dirLength;
		if (dirLength !== 0) {
			normalize(dir);
			copyValue(road.dir, dir);
		}

		return road;
	});

	// don't draw when the length of the road is 0
	roadsData = roadsData.filter(road => {
		return road.dir.length > 0;
	});

	return roadsData;
}

function calculateCorner(corners) {
	// sort roads: CCW
	corners.forEach(corner => {
		corner.roads.sort((road1, road2) => {
			copyValue(vec2_1, road1.dir);

			if (road1.startCorner !== corner) {
				negate(vec2_1);
			}
			road1.angle = calculateAngle(vec2_1);

			copyValue(vec2_2, road2.dir);

			if (road2.startCorner !== corner) {
				negate(vec2_2);
			}

			road2.angle = calculateAngle(vec2_2);

			return road1.angle - road2.angle;
		});

		// if there is a Straight line and it is not at the startpoint of the array, reorder the array, starting from the larger indexOfEndStraight, and increasing in the CW direction.
		let indexOfEndStraight;
		corner.roads.sort((road1, road2) => {
			if (Math.abs(road1.angle - road2.angle) == Math.PI) {
				indexOfEndStraight = corner.roads.indexOf(road1);
			}
			return 0;
		});
		if (indexOfEndStraight) {
			const endIndex = corner.roads.length - 1;
			// move elements from end to the begin
			for (let i = endIndex; i >= indexOfEndStraight; i--) {
				const currentRoad = corner.roads[endIndex];
				// remove currentRoad from its current position
				corner.roads.splice(endIndex, 1);
				// insert currentRoad at the beginning of the array
				corner.roads.unshift(currentRoad);
			}
		}

		// calculate fixed corner points
		for (let i = 0, l = corner.roads.length; i < l; i++) {
			const current = corner.roads[i];
			const next = corner.roads[(i + 1) % l];

			const dirFromCorner1 = copyValue(vec2_4, current.dir);
			if (current.startCorner !== corner) {
				negate(dirFromCorner1);
			}
			const dirFromCorner2 = copyValue(vec2_5, next.dir);
			if (next.startCorner !== corner) {
				negate(dirFromCorner2);
			}
			const dot = calculateDot(dirFromCorner1, dirFromCorner2);

			// fix corner
			if (0.9996 > dot && dot > -0.9996) {
				let currentFixIndex = 0;
				let nextFixIndex = 0;

				vec2_1[0] = current.dir[1];
				vec2_1[1] = -current.dir[0];

				normalize(vec2_1);

				const currentLeft = multiplyScalar(vec2_1, current.halfWidth);

				const currentP1 = copyValue(vec2_2, corner.position), currentP2 = vec2_3;
				if (current.startCorner === corner) {
					copyValue(currentP2, current.endCorner.position);

					subVector(currentP1, currentLeft);
					subVector(currentP2, currentLeft);

					currentFixIndex = 1;
				} else {
					copyValue(currentP2, current.startCorner.position);

					addVector(currentP1, currentLeft);
					addVector(currentP2, currentLeft);

					currentFixIndex = 2;
				}

				vec2_6[0] = next.dir[1];
				vec2_6[1] = -next.dir[0];

				normalize(vec2_6);

				const nextLeft = multiplyScalar(vec2_6, next.halfWidth);

				const nextP1 = copyValue(vec2_7, corner.position), nextP2 = vec2_8;

				if (next.startCorner === corner) {
					copyValue(nextP2, next.endCorner.position);

					addVector(nextP1, nextLeft);
					addVector(nextP2, nextLeft);


					nextFixIndex = 0;
				} else {
					copyValue(nextP2, next.endCorner.position);

					addVector(nextP1, nextLeft);
					addVector(nextP2, nextLeft);

					nextFixIndex = 3;
				}

				const intersectPoint = getIntersectPoint(currentP1, currentP2, nextP1, nextP2);

				current.fixPoints[currentFixIndex] = intersectPoint;
				next.fixPoints[nextFixIndex] = intersectPoint;

				// calculate bisector inner corner center

				const bisector = copyValue(vec2_8, current.dir);
				if (currentFixIndex == 2) negate(bisector);

				copyValue(vec2_9, next.dir);
				if (nextFixIndex == 3) negate(vec2_9);

				addVector(bisector, vec2_9);
				normalize(bisector);

				const isSameSide = calculateDot(bisector, currentLeft) > 0;
				const isSameSide2 = calculateDot(bisector, nextLeft) > 0;

				// calculate inner corner center

				const centerInner = copyValue(vec2_10, corner.position);
				const theta = Math.acos(dot) / 2;

				const offsetCenter = multiplyScalar(bisector, (current.halfWidth + current.cornerRadius) / Math.sin(theta));
				addVector(centerInner, offsetCenter);

				// calculate points on the corner of a sector
				// calculate the normal point outside the corner of the sector

				if (isSameSide) {
					negate(currentLeft);
				}

				if (isSameSide2) {
					negate(nextLeft);
				}

				// calculate the rotate angle of the corner of the sector

				const roadAngleA = calculateAngle(currentLeft);
				const roadAngleB = calculateAngle(nextLeft);
				let roadAngleDifference = (roadAngleB - roadAngleA);
				roadAngleDifference = clampAngle(roadAngleDifference);

				// calculate inside and outside sectors
				const inlinePoints = calculateSectionsPoints(centerInner, current.cornerRadius, roadAngleA, roadAngleDifference, current.cornerSections);
				const outlinePoints = calculateSectionsPoints(centerInner, current.cornerRadius + current.halfWidth * 2, roadAngleA, roadAngleDifference, current.cornerSections);

				if (corner.roads.length == 2) {
					// for non-cross line
					if (i === 0) {
						if (!isSameSide) {
							current.sidewalkPoints[currentFixIndex] = inlinePoints[0];
							next.sidewalkPoints[nextFixIndex] = inlinePoints[current.cornerSections];
						} else {
							current.sidewalkPoints[currentFixIndex] = outlinePoints[0];
							next.sidewalkPoints[nextFixIndex] = outlinePoints[current.cornerSections];
						}
					} else {
						if (!isSameSide) {
							current.sidewalkPoints[currentFixIndex] = outlinePoints[0];
							next.sidewalkPoints[nextFixIndex] = outlinePoints[current.cornerSections];
						} else {
							current.sidewalkPoints[currentFixIndex] = inlinePoints[0];
							next.sidewalkPoints[nextFixIndex] = inlinePoints[current.cornerSections];
						}
					}

					corner.insideArcPoints = inlinePoints;
					corner.outsideArcPoints = outlinePoints.reverse();
				} else {
					// for cross line
					copyValue(vec2_6, inlinePoints[0]);
					const currentSidewalkP1 = addVector(vec2_6, multiplyScalar(normalize(dirFromCorner1), current.sidewalkWidth));
					copyValue(vec2_7, inlinePoints[current.cornerSections]);
					const nextSidewalkP1 = addVector(vec2_7, multiplyScalar(normalize(dirFromCorner2), next.sidewalkWidth));
					current.insideArcPoints[currentFixIndex] = inlinePoints[0];
					next.insideArcPoints[nextFixIndex] = inlinePoints[current.cornerSections];

					current.sidewalkPoints[currentFixIndex] = currentSidewalkP1.slice();
					next.sidewalkPoints[nextFixIndex] = nextSidewalkP1.slice();

					let deltaAngle = calculateAngle(dirFromCorner2) - calculateAngle(dirFromCorner1);

					if (deltaAngle < 0) deltaAngle = 2 * Math.PI + deltaAngle;
					if (corner.roads.length > 2 && deltaAngle > Math.PI) {
						current.insideArcPoints[currentFixIndex] = outlinePoints[0];
						next.insideArcPoints[nextFixIndex] = outlinePoints[current.cornerSections];
						corner.insideArcPoints.push(...outlinePoints);
					} else {
						corner.insideArcPoints.push(...inlinePoints);
					}
				}
			} else {
				// straight line
				let currentFixIndex = 0;
				let nextFixIndex = 0;

				// clockwise
				if (current.startCorner === corner) {
					currentFixIndex = 1;
				} else {
					currentFixIndex = 2;
				}
				if (next.startCorner === corner) {
					nextFixIndex = 0;
				} else {
					nextFixIndex = 3;
				}

				let deltaAngle = calculateAngle(dirFromCorner2) - calculateAngle(dirFromCorner1);
				if (deltaAngle < 0) deltaAngle = 2 * Math.PI + deltaAngle;

				if (corner.roads.length > 2 && deltaAngle == Math.PI) {
					vec2_1[0] = current.dir[1];
					vec2_1[1] = -current.dir[0];

					const currentLeft = multiplyScalar(normalize(vec2_1), current.halfWidth);
					const currentP1 = copyValue(vec2_2, corner.position);
					subVector(currentP1, currentLeft);

					const getNextSideWalk = function(next) {
						let nextsideP, nextarcP;
						if (next.sidewalkPoints[1]) {
							nextsideP = next.sidewalkPoints[1];
							nextarcP = next.insideArcPoints[1];
						} else if (next.sidewalkPoints[2]) {
							nextsideP = next.sidewalkPoints[2];
							nextarcP = next.insideArcPoints[2];
						}
						return { nextsideP, nextarcP };
					};

					const setNextSideWalk = function(nextFixIndex, next, nextarcP, nextsideP, nextSidewalkP1, nextSidewalkP2) {
						if (nextFixIndex == 0) {
							next.tStartSidewalkPoints[0] = nextarcP;
							next.tStartSidewalkPoints[1] = nextsideP;
							next.tStartSidewalkPoints[2] = nextSidewalkP2.slice();
							next.tStartSidewalkPoints[3] = nextSidewalkP1.slice();
						} else {
							next.tEndSidewalkPoints[0] = nextarcP;
							next.tEndSidewalkPoints[1] = nextsideP;
							next.tEndSidewalkPoints[2] = nextSidewalkP2.slice();
							next.tEndSidewalkPoints[3] = nextSidewalkP1.slice();
						}
					};

					if (currentFixIndex === 1) {
						const currentSidewalkP1 = copyValue(vec2_6, current.sidewalkPoints[0]);
						subVector(currentSidewalkP1, currentLeft);
						subVector(currentSidewalkP1, currentLeft);

						const currentSidewalkP2 = copyValue(vec2_7, current.insideArcPoints[0]);
						subVector(currentSidewalkP2, currentLeft);
						subVector(currentSidewalkP2, currentLeft);

						current.tStartSidewalkPoints[0] = currentSidewalkP2.slice();
						current.tStartSidewalkPoints[1] = currentSidewalkP1.slice();
						current.tStartSidewalkPoints[2] = current.insideArcPoints[0];
						current.tStartSidewalkPoints[3] = current.sidewalkPoints[0];

						corner.insideArcPoints.push([currentSidewalkP2[0], currentSidewalkP2[1]]);

						const { nextsideP, nextarcP } = getNextSideWalk(next);

						const nextSidewalkP1 = copyValue(vec2_8, nextsideP);
						subVector(nextSidewalkP1, currentLeft);
						subVector(nextSidewalkP1, currentLeft);

						const nextSidewalkP2 = copyValue(vec2_9, nextarcP);
						subVector(nextSidewalkP2, currentLeft);
						subVector(nextSidewalkP2, currentLeft);

						corner.insideArcPoints.push([nextSidewalkP2[0], nextSidewalkP2[1]]);

						setNextSideWalk(nextFixIndex, next, nextarcP, nextsideP, nextSidewalkP1, nextSidewalkP2);
					}
					if (currentFixIndex === 2) {
						const currentSidewalkP1 = copyValue(vec2_6, current.sidewalkPoints[3]);
						addVector(currentSidewalkP1, currentLeft);
						addVector(currentSidewalkP1, currentLeft);

						const currentSidewalkP2 = copyValue(vec2_7, current.insideArcPoints[3]);
						addVector(currentSidewalkP2, currentLeft);
						addVector(currentSidewalkP2, currentLeft);

						current.tEndSidewalkPoints[0] = currentSidewalkP2.slice();
						current.tEndSidewalkPoints[1] = currentSidewalkP1.slice();
						current.tEndSidewalkPoints[2] = current.insideArcPoints[3];
						current.tEndSidewalkPoints[3] = current.sidewalkPoints[3];

						corner.insideArcPoints.push([currentSidewalkP2[0], currentSidewalkP2[1]]);

						const { nextsideP, nextarcP } = getNextSideWalk(next);

						const nextSidewalkP1 = copyValue(vec2_8, nextsideP);
						addVector(nextSidewalkP1, currentLeft);
						addVector(nextSidewalkP1, currentLeft);

						const nextSidewalkP2 = copyValue(vec2_9, nextarcP);
						addVector(nextSidewalkP2, currentLeft);
						addVector(nextSidewalkP2, currentLeft);

						corner.insideArcPoints.push([nextSidewalkP2[0], nextSidewalkP2[1]]);

						setNextSideWalk(nextFixIndex, next, nextarcP, nextsideP, nextSidewalkP1, nextSidewalkP2);
					}
				}
			}
		}
	});
}

function getVertices(roads, corners) {
	const edgeInfo = {
		positions: [],
		normals: [],
		uvs: [],
		uvs2: [],
		indices: []
	};

	const edgeIndices = edgeInfo.indices;
	const edgePositions = edgeInfo.positions;
	const edgeNormals = edgeInfo.normals;
	const edgeUvs = edgeInfo.uvs;
	const edgeUvs2 = edgeInfo.uvs2;

	const sidewalkInfo = {
		positions: [],
		normals: [],
		uvs: [],
		indices: []
	};

	const sidewalkIndices = sidewalkInfo.indices;
	const sidewalkPositions = sidewalkInfo.positions;
	const sidewalkNormals = sidewalkInfo.normals;
	const sidewalkUvs = sidewalkInfo.uvs;

	const crossroadInfo = {
		positions: [],
		normals: [],
		uvs: [],
		indices: []
	};

	const crossroadIndices = crossroadInfo.indices;
	const crossroadPositions = crossroadInfo.positions;
	const crossroadNormals = crossroadInfo.normals;
	const crossroadUvs = crossroadInfo.uvs;

	roads.forEach(road => {
		const start = copyValue(vec2_1, road.startCorner.position);
		const end = copyValue(vec2_2, road.endCorner.position);
		const dir = copyValue(vec2_3, road.dir);

		vec2_4[0] = dir[1];
		vec2_4[1] = -dir[0];
		const left = multiplyScalar(normalize(vec2_4), road.halfWidth);

		let startLeft, startRight, endLeft, endRight;
		let isOnewayRoad = false;
		if (road.startCorner.roads.length <= 2 && road.endCorner.roads.length <= 2) {
			isOnewayRoad = true;
		}

		if (road.fixPoints[0]) {
			road.startLeft = startLeft = road.sidewalkPoints[0];
		} else {
			addVectors(vec2_5, start, left);

			if (road.sidewalkPoints[1]) {
				copyValue(vec2_5, road.sidewalkPoints[1]);
				addVector(vec2_5, left);
				addVector(vec2_5, left);
			}

			startLeft = copyValue(road.startLeft, vec2_5);
		}

		if (road.fixPoints[1]) {
			road.startRight = startRight = road.sidewalkPoints[1];
		} else {
			subVectors(vec2_5, start, left);
			if (road.sidewalkPoints[0]) {
				copyValue(vec2_5, road.sidewalkPoints[0]);
				subVector(vec2_5, left);
				subVector(vec2_5, left);
			}

			startRight = copyValue(road.startRight, vec2_5);
		}

		if (road.fixPoints[2]) {
			road.endLeft = endLeft = road.sidewalkPoints[2];
		} else {
			addVectors(vec2_5, end, left);
			if (road.sidewalkPoints[3]) {
				copyValue(vec2_5, road.sidewalkPoints[3]);
				addVector(vec2_5, left);
				addVector(vec2_5, left);
			}

			endLeft = copyValue(road.endLeft, vec2_5);
		}

		if (road.fixPoints[3]) {
			road.endRight = endRight = road.sidewalkPoints[3];
		} else {
			subVectors(vec2_5, end, left);
			if (road.sidewalkPoints[2]) {
				copyValue(vec2_5, road.sidewalkPoints[2]);
				subVector(vec2_5, left);
				subVector(vec2_5, left);
			}

			endRight = copyValue(road.endRight, vec2_5);
		}

		const repeatX = road.uvrepeat[0] || 1;
		const repeatY = road.uvrepeat[1] || 1;

		edgePositions.push(endLeft[0], 0, endLeft[1]);
		edgePositions.push(startLeft[0], 0, startLeft[1]);
		edgePositions.push(endRight[0], 0, endRight[1]);
		edgePositions.push(startRight[0], 0, startRight[1]);

		// calculate uvs
		calUv(startLeft, endLeft, startRight, endRight, edgeUvs, edgeUvs2, repeatX, repeatY);

		// add sidewalk polygon vertices: two sidewalkPoints and two innerArcPoints
		if (!isOnewayRoad) {
			if (road.tStartSidewalkPoints[0]) {
				sidewalkPositions.push(road.tStartSidewalkPoints[3][0], 0, road.tStartSidewalkPoints[3][1]);
				sidewalkPositions.push(road.tStartSidewalkPoints[2][0], 0, road.tStartSidewalkPoints[2][1]);
				sidewalkPositions.push(road.tStartSidewalkPoints[1][0], 0, road.tStartSidewalkPoints[1][1]);
				sidewalkPositions.push(road.tStartSidewalkPoints[0][0], 0, road.tStartSidewalkPoints[0][1]);

				sidewalkUvs.push([1, 0]);
				sidewalkUvs.push([0, 0]);
				sidewalkUvs.push([1, 1]);
				sidewalkUvs.push([0, 1]);
			} else if (road.tEndSidewalkPoints[0]) {
				sidewalkPositions.push(road.tEndSidewalkPoints[0][0], 0, road.tEndSidewalkPoints[0][1]);
				sidewalkPositions.push(road.tEndSidewalkPoints[1][0], 0, road.tEndSidewalkPoints[1][1]);
				sidewalkPositions.push(road.tEndSidewalkPoints[2][0], 0, road.tEndSidewalkPoints[2][1]);
				sidewalkPositions.push(road.tEndSidewalkPoints[3][0], 0, road.tEndSidewalkPoints[3][1]);

				sidewalkUvs.push([1, 0]);
				sidewalkUvs.push([0, 0]);
				sidewalkUvs.push([1, 1]);
				sidewalkUvs.push([0, 1]);
			} else {
				if (road.insideArcPoints[0] && road.insideArcPoints[1] && road.insideArcPoints[2] && road.insideArcPoints[3]) {
					sidewalkPositions.push(road.insideArcPoints[2][0], 0, road.insideArcPoints[2][1]);
					sidewalkPositions.push(endLeft[0], 0, endLeft[1]);
					sidewalkPositions.push(road.insideArcPoints[3][0], 0, road.insideArcPoints[3][1]);
					sidewalkPositions.push(endRight[0], 0, endRight[1]);
					sidewalkUvs.push([1, 0]);
					sidewalkUvs.push([0, 0]);
					sidewalkUvs.push([1, 1]);
					sidewalkUvs.push([0, 1]);
					sidewalkNormals.push(0, 1, 0);
					sidewalkNormals.push(0, 1, 0);
					sidewalkNormals.push(0, 1, 0);
					sidewalkNormals.push(0, 1, 0);
				}
				if (road.insideArcPoints[0] && road.insideArcPoints[1]) {
					sidewalkPositions.push(startLeft[0], 0, startLeft[1]);
					sidewalkPositions.push(road.insideArcPoints[0][0], 0, road.insideArcPoints[0][1]);
					sidewalkPositions.push(startRight[0], 0, startRight[1]);
					sidewalkPositions.push(road.insideArcPoints[1][0], 0, road.insideArcPoints[1][1]);
				} else if (road.insideArcPoints[2] && road.insideArcPoints[3]) {
					sidewalkPositions.push(road.insideArcPoints[2][0], 0, road.insideArcPoints[2][1]);
					sidewalkPositions.push(endLeft[0], 0, endLeft[1]);
					sidewalkPositions.push(road.insideArcPoints[3][0], 0, road.insideArcPoints[3][1]);
					sidewalkPositions.push(endRight[0], 0, endRight[1]);
				}

				sidewalkUvs.push([1, 0]);
				sidewalkUvs.push([0, 0]);
				sidewalkUvs.push([1, 1]);
				sidewalkUvs.push([0, 1]);
			}

			sidewalkNormals.push(0, 1, 0);
			sidewalkNormals.push(0, 1, 0);
			sidewalkNormals.push(0, 1, 0);
			sidewalkNormals.push(0, 1, 0);

			for (let i = 0; i < sidewalkPositions.length / 12; i++) {
				sidewalkIndices.push(i * 4 + 0, i * 4 + 1, i * 4 + 2);
				sidewalkIndices.push(i * 4 + 1, i * 4 + 3, i * 4 + 2);
			}
		}
		edgeNormals.push(0, 1, 0);
		edgeNormals.push(0, 1, 0);
		edgeNormals.push(0, 1, 0);
		edgeNormals.push(0, 1, 0);
	});

	for (let i = 0; i < edgeInfo.positions.length / 12; i++) {
		edgeInfo.indices.push(i * 4 + 0, i * 4 + 1, i * 4 + 2);
		edgeInfo.indices.push(i * 4 + 1, i * 4 + 3, i * 4 + 2);
	}

	// fix corner edge
	corners.forEach(corner => {
		const cornerFixedPoints = [];
		const cornerArcPoints = [];
		const roadsidewalkPoints = [];
		cornerArcPoints.push(...corner.insideArcPoints);
		cornerArcPoints.push(...corner.outsideArcPoints);
		roadsidewalkPoints.push(...corner.sidewalkPoints);
		let repeatX, repeatY;

		corner.roads.forEach(road => {
			let point;
			if (road.startCorner === corner) {
				point = road.fixPoints[0];
				if (point === undefined && road.fixPoints[1] !== undefined) {
					point = road.startLeft;
				}
			} else {
				point = road.fixPoints[3];
				if (point === undefined && road.fixPoints[2] !== undefined) {
					point = road.endRight;
				}
			}
			if (point !== undefined) {
				cornerFixedPoints.push(point);
			}

			repeatX = road.uvrepeat[0] || 1;
			repeatY = road.uvrepeat[1] || 1;
		});

		const oldedgePositionsLength = edgePositions.length / 3;
		const newedgePositionsLength = oldedgePositionsLength + cornerArcPoints.length;
		const oldCrossVerticesLength = crossroadPositions.length / 3;
		const newCrossVerticesLength = oldCrossVerticesLength + cornerArcPoints.length;

		if (cornerFixedPoints.length === 2) {
			const A = copyValue(vec2_1, cornerArcPoints[0]);
			const B = copyValue(vec2_2, cornerArcPoints[1]);
			const C = copyValue(vec2_3, cornerArcPoints[2]);
			const AB = subVectors(vec2_4, B, A);
			const BC = subVectors(vec2_5, C, B);

			if (AB[0] * BC[1] - AB[1] * BC[0] < 0) {
				cornerArcPoints.reverse();
			}

			const firstHalf = cornerArcPoints.slice(0, cornerArcPoints.length / 2);
			const secondHalf = cornerArcPoints.slice(cornerArcPoints.length / 2).reverse();
			const linesuv1 = calculatelinesUV(firstHalf);
			const linesuv2 = calculatelinesUV(secondHalf);
			cornerArcPoints.forEach((point, index) => {
				edgePositions.push(point[0], 0, point[1]);
				if (index < cornerArcPoints.length / 2) {
					edgeUvs.push([linesuv1.uvs[index] * repeatX, 1 * repeatY]);
					edgeUvs2.push([linesuv1.uvs2[index], 1]);
				} else {
					edgeUvs.push([linesuv2.uvs[cornerArcPoints.length - 1 - index] * repeatX, 0]);
					edgeUvs2.push([linesuv2.uvs2[cornerArcPoints.length - 1 - index], 0]);
				}
				edgeNormals.push(0, 1, 0);
			});
			for (let i = 0; i < cornerArcPoints.length / 2; i++) {
				const arcIndex = i + oldedgePositionsLength;
				edgeIndices.push(newedgePositionsLength - i - 1, arcIndex + 1, newedgePositionsLength - i - 2);
				edgeIndices.push(arcIndex, arcIndex + 1, newedgePositionsLength - i - 1);
			}
		}

		if (cornerFixedPoints.length > 2) {
			const minPos = [Infinity, Infinity];
			const maxPos = [-Infinity, -Infinity];
			for (let i = 0; i < cornerArcPoints.length; i++) {
				if (cornerArcPoints[i][0] > maxPos[0]) maxPos[0] = cornerArcPoints[i][0];
				if (cornerArcPoints[i][1] > maxPos[1]) maxPos[1] = cornerArcPoints[i][1];
				if (cornerArcPoints[i][0] < minPos[0]) minPos[0] = cornerArcPoints[i][0];
				if (cornerArcPoints[i][1] < minPos[1]) minPos[1] = cornerArcPoints[i][1];
			}

			crossroadPositions.push(corner.position[0], 0, corner.position[1]);
			crossroadNormals.push(0, 1, 0);
			const uvs = [(corner.position[0] - minPos[0]) / (maxPos[0] - minPos[0]), (corner.position[1] - minPos[1])];
			crossroadUvs.push(uvs);
			cornerArcPoints.forEach(point => {
				crossroadPositions.push(point[0], 0, point[1]);
				const uvs = [(point[0] - minPos[0]) / (maxPos[0] - minPos[0]), (point[1] - minPos[1]) / (maxPos[1] - minPos[1])];
				crossroadUvs.push(uvs);
				crossroadNormals.push(0, 1, 0);
			});

			for (let i = oldCrossVerticesLength + 1; i < newCrossVerticesLength + 1; i++) {
				let j = (i + 1);
				if (i == newCrossVerticesLength) j = oldCrossVerticesLength + 1;
				crossroadIndices.push(oldCrossVerticesLength, j, i);
			}
		}
	});

	edgeInfo.uvs = edgeUvs.flat();
	edgeInfo.uvs2 = edgeUvs2.flat();
	sidewalkInfo.uvs = sidewalkUvs.flat();
	crossroadInfo.uvs = crossroadUvs.flat();

	return {
		edgeInfo,
		sidewalkInfo,
		crossroadInfo
	};
}

function getIntersectPoint(a, b, c, d) {
	const denominator = (b[1] - a[1]) * (d[0] - c[0]) - (a[0] - b[0]) * (c[1] - d[1]);

	const x = ((b[0] - a[0]) * (d[0] - c[0]) * (c[1] - a[1])
		+ (b[1] - a[1]) * (d[0] - c[0]) * a[0]
		- (d[1] - c[1]) * (b[0] - a[0]) * c[0]) / denominator;
	const y = -((b[1] - a[1]) * (d[1] - c[1]) * (c[0] - a[0])
		+ (b[0] - a[0]) * (d[1] - c[1]) * a[1]
		- (d[0] - c[0]) * (b[1] - a[1]) * c[1]) / denominator;

	return [x, y];
}

function clampAngle(angle) {
	angle = angle % (Math.PI * 2);
	if (angle > Math.PI) angle -= Math.PI * 2;
	if (angle < -Math.PI) angle += Math.PI * 2;
	return angle;
}

function calculateSectionsPoints(center, radius, roadAngleA, roadAngleDifference, sections) {
	const angleStep = roadAngleDifference / sections;
	const points = [];
	for (let i = 0; i <= sections; i++) {
		const angle = roadAngleA + angleStep * i;
		points.push([center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)]);
	}

	return points;
}

function calUv(startLeft, endLeft, startRight, endRight, uvs, uvs2, repeatX = 1, repeatY = 1) {
	copyValue(vec2_6, startLeft);
	copyValue(vec2_7, endLeft);
	const leftLength = getLength(subVector(vec2_7, vec2_6));

	copyValue(vec2_6, startRight);
	copyValue(vec2_7, endRight);
	const rightLength = getLength(subVector(vec2_7, vec2_6));

	uvs.push([leftLength * repeatX, 0 * repeatY]);
	uvs2.push([1, 0]);
	uvs.push([0, 0]);
	uvs2.push([0, 0]);

	uvs.push([rightLength * repeatX, 1 * repeatY]);
	uvs2.push([1, 1]);
	uvs.push([0, 1 * repeatY]);
	uvs2.push([0, 1]);
}

function calculatelinesUV(points) {
	let totalLength = 0;
	const uvs = [];
	let uvs2 = [];
	uvs.push(0);
	for (let i = 0; i < points.length - 1; i++) {
		const point1 = points[i];
		const point2 = points[i + 1];

		// calculate the distance between two points
		const distance = Math.sqrt(
			Math.pow(point2[0] - point1[0], 2) +
			Math.pow(point2[1] - point1[1], 2)
		);
		// add distance to total length
		totalLength += distance;
		uvs.push(totalLength);
	}
	uvs2 = uvs.slice(0);
	// normalize UV map by total length
	for (let i = 0; i < uvs.length; i++) {
		uvs[i] /= totalLength;
	}

	return { uvs2, uvs };
}

function copyValue(v1, v2, offset = 0) {
	v1[0] = v2[offset];
	v1[1] = v2[offset + 1];
	return v1;
}

function getLength(v) {
	return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

function normalize(vector, thickness = 1) {
	const length = getLength(vector) || 1;
	const invLength = thickness / length;

	vector[0] *= invLength;
	vector[1] *= invLength;

	return vector;
}

function calculateAngle(vector) {
	return Math.atan2(-vector[1], -vector[0]) + Math.PI;
}

function multiplyScalar(vector, scalar) {
	vector[0] *= scalar;
	vector[1] *= scalar;

	return vector;
}

function negate(vector) {
	vector[0] = -vector[0];
	vector[1] = -vector[1];
	return vector;
}

function subVectors(v0, v1, v2) {
	v0[0] = v1[0] - v2[0];
	v0[1] = v1[1] - v2[1];

	return v0;
}

function calculateDot(v1, v2) {
	return v1[0] * v2[0] + v1[1] * v2[1];
}

function subVector(v1, v2) {
	v1[0] -= v2[0];
	v1[1] -= v2[1];
	return v1;
}

function addVector(v1, v2) {
	v1[0] += v2[0];
	v1[1] += v2[1];
	return v1;
}

function addVectors(v0, v1, v2) {
	v0[0] = v1[0] + v2[0];
	v0[1] = v1[1] + v2[1];
	return v0;
}

export { RoadBuilder };