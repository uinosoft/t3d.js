import { Vector3, Plane, Matrix4, DRAW_MODE } from 't3d';
import { isPointInPoly } from './Utils.js';
import { TriangleSoup } from '../math/TriangleSoup.js';

class Zone {

	static createFromTriangleSoup(triangleSoup) {
		const navMesh = _buildPolygonsFromTriangleSoup(triangleSoup);

		const zone = new Zone();

		navMesh.vertices.forEach(v => {
			v.x = roundNumber(v.x, 2);
			v.y = roundNumber(v.y, 2);
			v.z = roundNumber(v.z, 2);
		});

		zone.vertices = navMesh.vertices;

		const groups = _buildPolygonGroups(navMesh);
		// TODO: This block represents a large portion of navigation mesh construction time
		// and could probably be optimized. For example, construct portals while
		// determining the neighbor graph.
		zone.groups = new Array(groups.length);
		groups.forEach((group, groupIndex) => {
			const indexByPolygon = new Map(); // { polygon: index in group }
			group.forEach((poly, polyIndex) => {
				indexByPolygon.set(poly, polyIndex);
			});

			const newGroup = new Array(group.length);
			group.forEach((poly, polyIndex) => {
				const neighbourIndices = [];
				poly.neighbours.forEach(n =>
					neighbourIndices.push(indexByPolygon.get(n))
				);

				// Build a portal list to each neighbour
				const portals = [];
				poly.neighbours.forEach(n =>
					portals.push(_getSharedVerticesInOrder(poly, n))
				);

				const centroid = new Vector3(0, 0, 0);
				centroid.add(zone.vertices[poly.vertexIds[0]]);
				centroid.add(zone.vertices[poly.vertexIds[1]]);
				centroid.add(zone.vertices[poly.vertexIds[2]]);
				centroid.multiplyScalar(1 / 3);
				centroid.x = roundNumber(centroid.x, 2);
				centroid.y = roundNumber(centroid.y, 2);
				centroid.z = roundNumber(centroid.z, 2);

				newGroup[polyIndex] = {
					id: polyIndex,
					neighbours: neighbourIndices,
					vertexIds: poly.vertexIds,
					centroid: centroid,
					portals: portals
				};
			});

			zone.groups[groupIndex] = newGroup;
		});

		return zone;
	}

	// deprecated since v0.4.1
	static createFromGeometry(geometry, tolerance = 1e-4) {
		console.warn('Zone.createFromGeometry has been deprecated, use Zone.createFromTriangleSoup instead.');

		const fakeMesh = {
			geometry,
			material: { drawMode: DRAW_MODE.TRIANGLES }
		};

		const triangleSoup = new TriangleSoup();
		triangleSoup.addMesh(fakeMesh, new Matrix4());
		triangleSoup.mergeVertices(tolerance);

		return this.createFromTriangleSoup(triangleSoup);
	}

	constructor() {
		this.vertices = [];
		this.groups = [];
	}

	// Returns closest node group ID for given position.
	getGroup(position, checkPolygon = false) {
		let closestNodeGroup = null;
		let distance = Math.pow(50, 2); // Is the distance too large here?
		for (let i = 0; i < this.groups.length; i++) {
			const group = this.groups[i];
			for (const node of group) {
				if (checkPolygon) {
					const a = this.vertices[node.vertexIds[0]];
					const b = this.vertices[node.vertexIds[1]];
					const c = this.vertices[node.vertexIds[2]];

					// setFromCoplanarPointsToPlane
					const normal = _vector1.subVectors(c, b).cross(_vector2.subVectors(a, b)).normalize();
					_plane.setFromNormalAndCoplanarPoint(normal, a);

					if (Math.abs(_plane.distanceToPoint(position)) < 0.01) {
						const poly = [a, b, c];
						if (isPointInPoly(poly, position)) {
							return i;
						}
					}
				}
				const measuredDistance = node.centroid.distanceToSquared(position);
				if (measuredDistance < distance) {
					closestNodeGroup = i;
					distance = measuredDistance;
				}
			}
		}
		return closestNodeGroup;
	}

}

export { Zone };

const _vector1 = new Vector3();
const _vector2 = new Vector3();
const _plane = new Plane();

function _buildPolygonsFromTriangleSoup(triangleSoup) {
	const polygons = [];
	const vertices = [];

	const { positions, indices } = triangleSoup;

	// Constructing the neighbor graph brute force is O(n²). To avoid that,
	// create a map from vertices to the polygons that contain them, and use it
	// while connecting polygons. This reduces complexity to O(n*m), where 'm'
	// is related to connectivity of the mesh.

	/** Array of polygon objects by vertex index. */
	const vertexPolygonMap = [];

	for (let i = 0, l = positions.length; i < l; i += 3) {
		const vertex = new Vector3();
		vertex.fromArray(positions, i);
		vertices.push(vertex);
		vertexPolygonMap[i / 3] = [];
	}

	// Convert the faces into a custom format that supports more than 3 vertices
	for (let i = 0, l = indices.length; i < l; i += 3) {
		_vector1.fromArray(indices, i);
		const a = _vector1.x;
		const b = _vector1.y;
		const c = _vector1.z;
		const poly = { vertexIds: [a, b, c], neighbours: null };
		polygons.push(poly);
		vertexPolygonMap[a].push(poly);
		vertexPolygonMap[b].push(poly);
		vertexPolygonMap[c].push(poly);
	}

	// Build a list of adjacent polygons
	polygons.forEach(polygon => {
		polygon.neighbours = _buildPolygonNeighbours(polygon, vertexPolygonMap);
	});

	return {
		polygons: polygons,
		vertices: vertices
	};
}

function _buildPolygonNeighbours(polygon, vertexPolygonMap) {
	const neighbours = new Set();

	const groupA = vertexPolygonMap[polygon.vertexIds[0]];
	const groupB = vertexPolygonMap[polygon.vertexIds[1]];
	const groupC = vertexPolygonMap[polygon.vertexIds[2]];

	// It's only necessary to iterate groups A and B. Polygons contained only
	// in group C cannot share a >1 vertex with this polygon.
	// IMPORTANT: Bublé cannot compile for-of loops.
	groupA.forEach(candidate => {
		if (candidate === polygon) return;
		if (groupB.includes(candidate) || groupC.includes(candidate)) {
			neighbours.add(candidate);
		}
	});
	groupB.forEach(candidate => {
		if (candidate === polygon) return;
		if (groupC.includes(candidate)) {
			neighbours.add(candidate);
		}
	});

	return neighbours;
}

function _buildPolygonGroups(navigationMesh) {
	const polygons = navigationMesh.polygons;
	const polygonGroups = [];
	polygons.forEach(polygon => {
		if (polygon.group !== undefined) {
			// this polygon is already part of a group
			polygonGroups[polygon.group].push(polygon);
		} else {
			// we need to make a new group and spread its ID to neighbors
			polygon.group = polygonGroups.length;
			_spreadGroupId(polygon);
			polygonGroups.push([polygon]);
		}
	});

	return polygonGroups;
}

function _spreadGroupId(seed) {
	let nextBatch = new Set([seed]);

	while (nextBatch.size > 0) {
		const batch = nextBatch;
		nextBatch = new Set();

		batch.forEach(polygon => {
			polygon.group = seed.group;
			polygon.neighbours.forEach(neighbour => {
				if (neighbour.group === undefined) {
					nextBatch.add(neighbour);
				}
			});
		});
	}
}

function _getSharedVerticesInOrder(a, b) {
	const aList = a.vertexIds;
	const a0 = aList[0];
	const a1 = aList[1];
	const a2 = aList[2];

	const bList = b.vertexIds;
	const shared0 = bList.includes(a0);
	const shared1 = bList.includes(a1);
	const shared2 = bList.includes(a2);

	// it seems that we shouldn't have an a and b with <2 shared vertices here unless there's a bug
	// in the neighbor identification code, or perhaps a malformed input geometry; 3 shared vertices
	// is a kind of embarrassing but possible geometry we should handle
	if (shared0 && shared1 && shared2) {
		return Array.from(aList);
	} else if (shared0 && shared1) {
		return [a0, a1];
	} else if (shared1 && shared2) {
		return [a1, a2];
	} else if (shared0 && shared2) {
		return [a2, a0]; // this ordering will affect the string pull algorithm later, not clear if significant
	} else {
		console.warn(
			'Error processing navigation mesh neighbors; neighbors with <2 shared vertices found.'
		);
		return [];
	}
}

function roundNumber(value, decimals) {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
}