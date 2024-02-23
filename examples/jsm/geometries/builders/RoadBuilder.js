import { Vector2 } from 't3d';

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

const _vec2_1 = new Vector2();
const _vec2_2 = new Vector2();
const _vec2_3 = new Vector2();
const _vec2_4 = new Vector2();
const _vec2_5 = new Vector2();
const _vec2_6 = new Vector2();
const _vec2_7 = new Vector2();
const _vec2_8 = new Vector2();
const _vec2_9 = new Vector2();
const _vec2_10 = new Vector2();

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

		const start = _vec2_1.fromArray(info.points);
		const startKey = start.x + '-' + start.y;
		let startCorner;
		if (corners.has(startKey)) {
			startCorner = corners.get(startKey);
		} else {
			startCorner = { position: start.toArray([]), roads: [], outsideArcPoints: [], insideArcPoints: [], sidewalkPoints: [] };
			corners.set(startKey, startCorner);
		}
		road.startCorner = startCorner;
		startCorner.roads.push(road);

		const end = _vec2_2.fromArray(info.points, 2);
		const endKey = end.x + '-' + end.y;
		let endCorner;
		if (corners.has(endKey)) {
			endCorner = corners.get(endKey);
		} else {
			endCorner = { position: end.toArray([]), roads: [], outsideArcPoints: [], insideArcPoints: [], sidewalkPoints: [] };
			corners.set(endKey, endCorner);
		}
		road.endCorner = endCorner;
		endCorner.roads.push(road);

		const dir = _vec2_3.subVectors(end, start);
		const dirLength = dir.getLength();

		road.length = dirLength;
		if (dirLength !== 0) {
			dir.normalize().toArray(road.dir);
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
			if (road1.startCorner === corner) {
				_vec2_1.fromArray(road1.dir);
			} else {
				_vec2_1.fromArray(road1.dir).negate();
			}
			road1.angle = _vec2_1.angle();

			if (road2.startCorner === corner) {
				_vec2_2.fromArray(road2.dir);
			} else {
				_vec2_2.fromArray(road2.dir).negate();
			}
			road2.angle = _vec2_2.angle();

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

			const dirFromCorner1 = _vec2_4.fromArray(current.dir);
			if (current.startCorner !== corner) {
				dirFromCorner1.negate();
			}
			const dirFromCorner2 = _vec2_5.fromArray(next.dir);
			if (next.startCorner !== corner) {
				dirFromCorner2.negate();
			}
			const dot = dirFromCorner1.dot(dirFromCorner2);

			// fix corner
			if (0.9996 > dot && dot > -0.9996) {
				let currentFixIndex = 0;
				let nextFixIndex = 0;

				const currentLeft = _vec2_1.set(current.dir[1], -current.dir[0]).normalize().multiplyScalar(current.halfWidth);
				const currentP1 = _vec2_2.fromArray(corner.position), currentP2 = _vec2_3;
				if (current.startCorner === corner) {
					currentP2.fromArray(current.endCorner.position);

					currentP1.sub(currentLeft);
					currentP2.sub(currentLeft);

					currentFixIndex = 1;
				} else {
					currentP2.fromArray(current.startCorner.position);

					currentP1.add(currentLeft);
					currentP2.add(currentLeft);

					currentFixIndex = 2;
				}

				const nextLeft = _vec2_6.set(next.dir[1], -next.dir[0]).normalize().multiplyScalar(next.halfWidth);
				const nextP1 = _vec2_7.fromArray(corner.position), nextP2 = _vec2_8;
				if (next.startCorner === corner) {
					nextP2.fromArray(next.endCorner.position);

					nextP1.add(nextLeft);
					nextP2.add(nextLeft);

					nextFixIndex = 0;
				} else {
					nextP2.fromArray(next.startCorner.position);

					nextP1.sub(nextLeft);
					nextP2.sub(nextLeft);

					nextFixIndex = 3;
				}

				const intersectPoint = getIntersectPoint(currentP1, currentP2, nextP1, nextP2);

				current.fixPoints[currentFixIndex] = intersectPoint;
				next.fixPoints[nextFixIndex] = intersectPoint;

				// calculate bisector inner corner center
				const bisector = _vec2_8.fromArray(current.dir);
				if (currentFixIndex == 2) bisector.negate();
				_vec2_9.fromArray(next.dir);
				if (nextFixIndex == 3) _vec2_9.negate();
				bisector.add(_vec2_9).normalize();
				const isSameSide = bisector.dot(currentLeft) > 0;
				const isSameSide2 = bisector.dot(nextLeft) > 0;

				// calculate inner corner center
				const centerInner = _vec2_10.fromArray(corner.position);
				const theta = Math.acos(dot) / 2;
				const offsetCenter = bisector.multiplyScalar((current.halfWidth + current.cornerRadius) / Math.sin(theta));
				centerInner.add(offsetCenter);

				// calculate points on the corner of a sector
				// calculate the normal point outside the corner of the sector
				let currentoOutNormal = currentLeft.clone();
				let nextOutNormal = nextLeft.clone();
				if (isSameSide) {
					currentoOutNormal = currentoOutNormal.negate();
				}
				if (isSameSide2) {
					nextOutNormal = nextOutNormal.negate();
				}
				// calculate the rotate angle of the corner of the sector
				const roadAngleA = currentoOutNormal.angle();
				const roadAngleB = nextOutNormal.angle();
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
					_vec2_6.fromArray(inlinePoints[0]);
					const currentSidewalkP1 = _vec2_6.add(dirFromCorner1.normalize().multiplyScalar(current.sidewalkWidth));
					_vec2_7.fromArray(inlinePoints[current.cornerSections]);
					const nextSidewalkP1 = _vec2_7.add(dirFromCorner2.normalize().multiplyScalar(next.sidewalkWidth));
					current.insideArcPoints[currentFixIndex] = inlinePoints[0];
					next.insideArcPoints[nextFixIndex] = inlinePoints[current.cornerSections];

					current.sidewalkPoints[currentFixIndex] = currentSidewalkP1.toArray();
					next.sidewalkPoints[nextFixIndex] = nextSidewalkP1.toArray();

					let deltaAngle = dirFromCorner2.angle() - dirFromCorner1.angle();
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

				let deltaAngle = dirFromCorner2.angle() - dirFromCorner1.angle();
				if (deltaAngle < 0) deltaAngle = 2 * Math.PI + deltaAngle;

				if (corner.roads.length > 2 && deltaAngle == Math.PI) {
					const currentLeft = _vec2_1.set(current.dir[1], -current.dir[0]).normalize().multiplyScalar(current.halfWidth);
					const currentP1 = _vec2_2.fromArray(corner.position);
					currentP1.sub(currentLeft);

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
							next.tStartSidewalkPoints[2] = nextSidewalkP2.toArray();
							next.tStartSidewalkPoints[3] = nextSidewalkP1.toArray();
						} else {
							next.tEndSidewalkPoints[0] = nextarcP;
							next.tEndSidewalkPoints[1] = nextsideP;
							next.tEndSidewalkPoints[2] = nextSidewalkP2.toArray();
							next.tEndSidewalkPoints[3] = nextSidewalkP1.toArray();
						}
					};

					if (currentFixIndex === 1) {
						const currentSidewalkP1 = _vec2_6.fromArray(current.sidewalkPoints[0]);
						currentSidewalkP1.sub(currentLeft);
						currentSidewalkP1.sub(currentLeft);

						const currentSidewalkP2 = _vec2_7.fromArray(current.insideArcPoints[0]);
						currentSidewalkP2.sub(currentLeft);
						currentSidewalkP2.sub(currentLeft);
						current.tStartSidewalkPoints[0] = currentSidewalkP2.toArray();
						current.tStartSidewalkPoints[1] = currentSidewalkP1.toArray();
						current.tStartSidewalkPoints[2] = current.insideArcPoints[0];
						current.tStartSidewalkPoints[3] = current.sidewalkPoints[0];
						corner.insideArcPoints.push([currentSidewalkP2.x, currentSidewalkP2.y]);

						const { nextsideP, nextarcP } = getNextSideWalk(next);

						const nextSidewalkP1 = _vec2_8.fromArray(nextsideP);
						nextSidewalkP1.sub(currentLeft);
						nextSidewalkP1.sub(currentLeft);

						const nextSidewalkP2 = _vec2_9.fromArray(nextarcP);
						nextSidewalkP2.sub(currentLeft);
						nextSidewalkP2.sub(currentLeft);
						corner.insideArcPoints.push([nextSidewalkP2.x, nextSidewalkP2.y]);

						setNextSideWalk(nextFixIndex, next, nextarcP, nextsideP, nextSidewalkP1, nextSidewalkP2);
					}
					if (currentFixIndex === 2) {
						const currentSidewalkP1 = _vec2_6.fromArray(current.sidewalkPoints[3]);
						currentSidewalkP1.add(currentLeft);
						currentSidewalkP1.add(currentLeft);

						const currentSidewalkP2 = _vec2_7.fromArray(current.insideArcPoints[3]);
						currentSidewalkP2.add(currentLeft);
						currentSidewalkP2.add(currentLeft);

						current.tEndSidewalkPoints[0] = currentSidewalkP2.toArray();
						current.tEndSidewalkPoints[1] = currentSidewalkP1.toArray();
						current.tEndSidewalkPoints[2] = current.insideArcPoints[3];
						current.tEndSidewalkPoints[3] = current.sidewalkPoints[3];
						corner.insideArcPoints.push([currentSidewalkP2.x, currentSidewalkP2.y]);

						const { nextsideP, nextarcP } = getNextSideWalk(next);

						const nextSidewalkP1 = _vec2_8.fromArray(nextsideP);
						nextSidewalkP1.add(currentLeft);
						nextSidewalkP1.add(currentLeft);

						const nextSidewalkP2 = _vec2_9.fromArray(nextarcP);
						nextSidewalkP2.add(currentLeft);
						nextSidewalkP2.add(currentLeft);
						corner.insideArcPoints.push([nextSidewalkP2.x, nextSidewalkP2.y]);

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
		const start = _vec2_1.fromArray(road.startCorner.position);
		const end = _vec2_2.fromArray(road.endCorner.position);
		const dir = _vec2_3.fromArray(road.dir);

		const left = _vec2_4.set(dir.y, -dir.x).normalize().multiplyScalar(road.halfWidth);

		let startLeft, startRight, endLeft, endRight;
		let isOnewayRoad = false;
		if (road.startCorner.roads.length <= 2 && road.endCorner.roads.length <= 2) {
			isOnewayRoad = true;
		}

		if (road.fixPoints[0]) {
			road.startLeft = startLeft = road.sidewalkPoints[0];
		} else {
			_vec2_5.addVectors(start, left);
			if (road.sidewalkPoints[1]) {
				_vec2_5.fromArray(road.sidewalkPoints[1]);
				_vec2_5.add(left);
				_vec2_5.add(left);
			}
			startLeft = _vec2_5.toArray(road.startLeft);
		}

		if (road.fixPoints[1]) {
			road.startRight = startRight = road.sidewalkPoints[1];
		} else {
			_vec2_5.subVectors(start, left);
			if (road.sidewalkPoints[0]) {
				_vec2_5.fromArray(road.sidewalkPoints[0]);
				_vec2_5.sub(left);
				_vec2_5.sub(left);
			}
			startRight = _vec2_5.toArray(road.startRight);
		}

		if (road.fixPoints[2]) {
			road.endLeft = endLeft = road.sidewalkPoints[2];
		} else {
			_vec2_5.addVectors(end, left);
			if (road.sidewalkPoints[3]) {
				_vec2_5.fromArray(road.sidewalkPoints[3]);
				_vec2_5.add(left);
				_vec2_5.add(left);
			}
			endLeft = _vec2_5.toArray(road.endLeft);
		}

		if (road.fixPoints[3]) {
			road.endRight = endRight = road.sidewalkPoints[3];
		} else {
			_vec2_5.subVectors(end, left);
			if (road.sidewalkPoints[2]) {
				_vec2_5.fromArray(road.sidewalkPoints[2]);
				_vec2_5.sub(left);
				_vec2_5.sub(left);
			}
			endRight = _vec2_5.toArray(road.endRight);
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
			const A = _vec2_1.fromArray(cornerArcPoints[0]);
			const B = _vec2_2.fromArray(cornerArcPoints[1]);
			const C = _vec2_3.fromArray(cornerArcPoints[2]);
			const AB = _vec2_4.subVectors(B, A);
			const BC = _vec2_5.subVectors(C, B);

			if (AB.x * BC.y - AB.y * BC.x < 0) {
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
	const denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);

	const x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
		+ (b.y - a.y) * (d.x - c.x) * a.x
		- (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
	const y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
		+ (b.x - a.x) * (d.y - c.y) * a.y
		- (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

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
		points.push([center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle)]);
	}

	return points;
}

function calUv(startLeft, endLeft, startRight, endRight, uvs, uvs2, repeatX = 1, repeatY = 1) {
	_vec2_6.fromArray(startLeft);
	_vec2_7.fromArray(endLeft);
	const leftLength = _vec2_7.sub(_vec2_6).getLength();
	_vec2_6.fromArray(startRight);
	_vec2_7.fromArray(endRight);
	const rightLength = _vec2_7.sub(_vec2_6).getLength();

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

export { RoadBuilder };