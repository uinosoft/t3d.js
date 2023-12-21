import { Vector3 } from 't3d';
import { AStar } from './AStar.js';
import { isPointInPoly, triarea2, vequal } from './Utils.js';

class Pathfinding {

	// Returns a path between given start and end points. If a complete path
	// cannot be found, will return the nearest endpoint available.
	static findPath(startPosition, targetPosition, zone) {
		if (!zone) return;

		const groupID = zone.getGroup(startPosition);
		const nodes = zone.groups[groupID];
		const vertices = zone.vertices;

		if (!nodes || !vertices) return;

		// maybe stuck when its true
		const closestNode = getClosestNode(startPosition, nodes, vertices, true);
		const farthestNode = getClosestNode(targetPosition, nodes, vertices, true);

		// If we can't find any node, just go straight to the target
		if (!closestNode || !farthestNode) {
			return null;
		}

		const paths = AStar.search(nodes, closestNode, farthestNode);

		const getPortalFromTo = function(a, b) {
			for (let i = 0; i < a.neighbours.length; i++) {
				if (a.neighbours[i] === b.id) {
					return a.portals[i];
				}
			}
		};

		// We have the corridor, now pull the rope.
		const channel = new Channel();
		channel.push(startPosition);
		for (let i = 0; i < paths.length; i++) {
			const polygon = paths[i];
			const nextPolygon = paths[i + 1];

			if (nextPolygon) {
				const portals = getPortalFromTo(polygon, nextPolygon);
				channel.push(vertices[portals[0]], vertices[portals[1]]);
			}
		}
		channel.push(targetPosition);
		channel.stringPull();

		// Return the path, omitting first position (which is already known).
		const path = channel.path.map(c => new Vector3(c.x, c.y, c.z));
		path.shift();

		return path;
	}

}

export { Pathfinding };

class Channel {

	constructor() {
		this.portals = [];
	}

	push(p1, p2) {
		if (p2 === undefined) p2 = p1;
		this.portals.push({
			left: p1,
			right: p2
		});
	}

	stringPull() {
		const portals = this.portals;
		const pts = [];
		// Init scan state
		let portalApex, portalLeft, portalRight;
		let apexIndex = 0;
		let leftIndex = 0;
		let rightIndex = 0;

		portalApex = portals[0].left;
		portalLeft = portals[0].left;
		portalRight = portals[0].right;

		// Add start point.
		pts.push(portalApex);

		for (let i = 1; i < portals.length; i++) {
			const left = portals[i].left;
			const right = portals[i].right;

			// Update right vertex.
			if (triarea2(portalApex, portalRight, right) <= 0.0) {
				if (vequal(portalApex, portalRight) || triarea2(portalApex, portalLeft, right) > 0.0) {
					// Tighten the funnel.
					portalRight = right; //
					rightIndex = i;
				} else {
					// Right over left, insert left to path and restart scan from portal left point.
					pts.push(portalLeft);
					// Make current left the new apex.
					portalApex = portalLeft;
					apexIndex = leftIndex;
					// Reset portal
					portalRight = portalApex;
					rightIndex = apexIndex;
					// Restart scan
					i = apexIndex;
					continue;
				}
			}

			// Update left vertex.
			if (triarea2(portalApex, portalLeft, left) >= 0.0) {
				if (vequal(portalApex, portalLeft) || triarea2(portalApex, portalRight, left) < 0.0) {
					// Tighten the funnel.
					portalLeft = left;
					leftIndex = i;
				} else {
					// Left over right, insert right to path and restart scan from portal right point.
					pts.push(portalRight);
					// Make current right the new apex.
					portalApex = portalRight;
					apexIndex = rightIndex;
					// Reset portal
					portalLeft = portalApex;
					leftIndex = apexIndex;
					// Restart scan
					i = apexIndex;
					continue;
				}
			}
		}

		if (
			pts.length === 0 ||
            !vequal(pts[pts.length - 1], portals[portals.length - 1].left)
		) {
			// Append last point to path.
			pts.push(portals[portals.length - 1].left);
		}

		this.path = pts;
		return pts;
	}

}

// Returns the closest node to the target position.
function getClosestNode(position, nodes, vertices, checkPolygon = false) {
	let closestNode = null;
	let closestDistance = Infinity;

	nodes.forEach(node => {
		const distance = node.centroid.distanceToSquared(position);
		if (distance < closestDistance && (!checkPolygon || isVectorInPolygon(position, node, vertices))) {
			closestNode = node;
			closestDistance = distance;
		}
	});

	return closestNode;
}

function isVectorInPolygon(vector, polygon, vertices) {
	// reference point will be the centroid of the polygon
	// We need to rotate the vector as well as all the points which the polygon uses

	let lowestPoint = 100000;
	let highestPoint = -100000;

	const polygonVertices = [];

	polygon.vertexIds.forEach(vId => {
		lowestPoint = Math.min(vertices[vId].y, lowestPoint);
		highestPoint = Math.max(vertices[vId].y, highestPoint);
		polygonVertices.push(vertices[vId]);
	});

	if (
		vector.y < highestPoint + 0.5 &&
        vector.y > lowestPoint - 0.5 &&
        isPointInPoly(polygonVertices, vector)
	) {
		return true;
	}
	return false;
}