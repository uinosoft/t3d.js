import { Vector3, Spherical, Plane, Box3 } from 't3d';

class ShadowAdapter {

	/**
	 * @param {Box3} box3
	 * @param {Sphere} out
	 */
	static getSphereByBox3(box3, out) {
		box3.getCenter(out.center);
		out.radius = out.center.distanceTo(box3.max);
	}

	/**
	 * @param {Camera} camera
	 * @param {Number} near
	 * @param {Number} distance
	 * @param {Sphere} out
	 */
	static getSphereByCamera(camera, near, distance, out) {
		this.getViewVertices(camera, near, near + distance, _clipVerticesBuffer);

		out.makeEmpty();
		for (let i = 0; i < _clipVerticesBuffer.length; i += 3) {
			_vec3_1.fromArray(_clipVerticesBuffer, i);
			out.expandByPoint(_vec3_1);
		}

		out.applyMatrix4(camera.worldMatrix);
	}

	/**
	 * @param {Box3} box3
	 * @param {Camera} camera
	 * @param {Number} near
	 * @param {Number} distance
	 * @param {Sphere} out
	 * @return {Polygon[]}
	 */
	static getSphereByBox3AndCamera(box3, camera, near, distance, out) {
		if (!camera.frustum.intersectsBox(box3)) {
			return;
		}

		// Update this polygon of shadow box.

		getBox3Polygons(box3);

		// Cutting the polygons of shadow box using the frustum.(Not including the near and far planes)

		let curPolygons = boxPolygons;
		const frustumPlanes = camera.frustum.planes;	// The near plane and the original plane are in the last two elements of the array.
		for (let i = 0, l = frustumPlanes.length - 2; i < l; i++) {
			const plane = frustumPlanes[i];
			curPolygons = clipPolygons(plane, curPolygons);
		}

		// Convert the intersection point to view space and find the closest intersection point to the near plane.

		let minZ = -Infinity;

		curPolygons.forEach(polygon => {
			for (let i = 0, l = polygon.verticesIndex; i < l; i++) {
				_vec3_1.copy(polygon.vertices[i]).applyMatrix4(camera.viewMatrix);
				minZ = Math.max(minZ, _vec3_1.z);
			}
		});

		// Based on the nearest intersection point of the near plane,
		// push back the length of distance, determine the position of the far plane,
		// and convert the far plane to the world coordinate system.

		farPlane.constant = Math.max(Math.abs(minZ), near) + distance;
		farPlane.normal.set(0, 0, 1);
		farPlane.applyMatrix4(camera.worldMatrix);

		// Using the far plane determined in the previous step, cut the curPolygons.

		curPolygons = clipPolygons(farPlane, curPolygons);

		// Compute the AABB bounding boxes for all intersections.

		_box3_1.makeEmpty();

		curPolygons.forEach(polygon => {
			for (let i = 0, l = polygon.verticesIndex; i < l; i++) {
				_box3_1.expandByPoint(polygon.vertices[i]);
			}
		})

		// Calculate the smallest bounding sphere through the bounding box.

		out.makeEmpty();
		_box3_1.getCenter(out.center);
		let maxRadiusSq = 0;
		curPolygons.forEach(polygon => {
			for (let i = 0, l = polygon.verticesIndex; i < l; i++) {
				maxRadiusSq = Math.max(maxRadiusSq, out.center.distanceToSquared(polygon.vertices[i]));
			}
		})
		out.radius = Math.sqrt(maxRadiusSq);

		polygonIndex = 0;

		return curPolygons;
	}

	/**
	 * @param {DirectionalLight} light
	 * @param {Number} phi
	 * @param {Number} theta
	 * @param {Sphere} sphere
	 * @param {Vector3} [up]
	 */
	static setDirectionalLight(light, phi, theta, sphere, up = _defaultUp) {
		spherical.phi = phi;
		spherical.theta = theta;
		spherical.radius = sphere.radius;

		const nearOffset = spherical.radius / 500;
		spherical.radius += nearOffset;

		light.position.setFromSpherical(spherical);

		light.position.add(sphere.center);
		light.lookAt(sphere.center, up);
		light.shadow.windowSize = sphere.radius * 2;
		light.shadow.cameraNear = nearOffset;
		light.shadow.cameraFar = nearOffset + sphere.radius * 2;
	}

	/**
	 * @param {Camera} camera
	 * @param {Number} clipNear
	 * @param {Number} clipFar
	 * @param {Array} out
	 */
	static getViewVertices(camera, clipNear, clipFar, out) {
		const projectionMatrix = camera.projectionMatrix;
		const projectionMatrixInverse = camera.projectionMatrixInverse;
		const isOrthographic = projectionMatrix.elements[2 * 4 + 3] === 0;

		clipVertices.near.forEach(function (v, i) {
			_vec3_1.copy(v);
			_vec3_1.applyMatrix4(projectionMatrixInverse);

			const absZ = Math.abs(_vec3_1.z);
			if (isOrthographic) {
				_vec3_1.z *= Math.min(clipNear / absZ, 1.0);
			} else {
				_vec3_1.multiplyScalar(Math.min(clipNear / absZ, 1.0));
			}

			_vec3_1.toArray(out, i * 3);
		});

		clipVertices.far.forEach(function (v, i) {
			_vec3_1.copy(v);
			_vec3_1.applyMatrix4(projectionMatrixInverse);

			const absZ = Math.abs(_vec3_1.z);
			if (isOrthographic) {
				_vec3_1.z *= Math.min(clipFar / absZ, 1.0);
			} else {
				_vec3_1.multiplyScalar(Math.min(clipFar / absZ, 1.0));
			}

			_vec3_1.toArray(out, 12 + i * 3);
		});
	}

}

const _vec3_1 = new Vector3();
const _box3_1 = new Box3();

const spherical = new Spherical();

const farPlane = new Plane();

const _defaultUp = new Vector3(0, 1, 0);

const _clipVerticesBuffer = new Array(24);

// 3 --- 0  clipVertices.near/far order
// |     |
// 2 --- 1
// clip space spans from [-1, 1]
const clipVertices = {
	near: [
		new Vector3(1, 1, -1),
		new Vector3(1, -1, -1),
		new Vector3(-1, -1, -1),
		new Vector3(-1, 1, -1)
	],
	far: [
		new Vector3(1, 1, 1),
		new Vector3(1, -1, 1),
		new Vector3(-1, -1, 1),
		new Vector3(-1, 1, 1)
	]
};

class Polygon {

	constructor() {
		this.plane = new Plane();
		this.vertices = [];
		this.verticesIndex = 0;
	}

	begin() {
		this.verticesIndex = 0;
		return this;
	}

	pushVertex(vector3) {
		let vertex = this.vertices[this.verticesIndex];

		if (!vertex) {
			vertex = new Vector3();
			this.vertices[this.verticesIndex] = vertex;
		}

		vertex.copy(vector3);
		this.verticesIndex++;

		return this;
	}

	end() {
		const plane = this.plane;
		const vertices = this.vertices;

		plane.normal.copy(vertices[1]).sub(vertices[0]).cross(_vec3_1.copy(vertices[2]).sub(vertices[0])).normalize();
		plane.constant = plane.normal.dot(vertices[0]);

		return this;
	}

}

const polygonPool = [];
let polygonIndex = 0;

function getPolygon() {
	let polygon = polygonPool[polygonIndex];

	if (!polygon) {
		polygon = new Polygon();
		polygonPool[polygonIndex] = polygon;
	}

	polygonIndex++;

	return polygon;
}

function revertPolygon() {
	polygonIndex--;
}

const EPSILON = 1e-5;
const COPLANAR = 0;
const FRONT = 1;
const BACK = 2;
const SPANNING = 3;

const types = [];

function splitPolygon(plane, polygon, outPolygons) {
	// Classify each point as well as the entire polygon into one of the above
	// four classes.
	let polygonType = 0;
	types.length = 0;

	for (let i = 0; i < polygon.verticesIndex; i++) {
		const t = plane.normal.dot(polygon.vertices[i]) + plane.constant;
		const type = t < -EPSILON ? BACK : t > EPSILON ? FRONT : COPLANAR;
		polygonType |= type;
		types.push(type);
	}

	// Put the polygon in the correct list, splitting it when necessary.
	switch (polygonType) {
		case COPLANAR:
			if (plane.normal.dot(polygon.plane.normal) > 0) {
				outPolygons.push(polygon);
			}
			break;
		case FRONT:
			outPolygons.push(polygon);
			break;
		case SPANNING: {
			const _polygon = getPolygon();
			_polygon.begin();

			for (let i = 0; i < polygon.verticesIndex; i++) {
				const j = (i + 1) % polygon.verticesIndex;

				const ti = types[i],
					tj = types[j];
				const vi = polygon.vertices[i],
					vj = polygon.vertices[j];

				if (ti != BACK) _polygon.pushVertex(vi);
				if ((ti | tj) == SPANNING) {
					const t = -(plane.constant + plane.normal.dot(vi)) / plane.normal.dot(_vec3_1.copy(vj).sub(vi));
					const v = _vec3_1.lerpVectors(vi, vj, t);

					_polygon.pushVertex(v);
				}
			}

			if (_polygon.verticesIndex >= 3) {
				_polygon.end();
				outPolygons.push(_polygon);
			} else {
				revertPolygon();
			}
			break;
		}
		default:
			break;
	}
}

function clipPolygons(plane, polygons, outPolygons = []) {
	for (let i = 0, l = polygons.length; i < l; i++) {
		splitPolygon(plane, polygons[i], outPolygons);
	}

	return outPolygons;
}

const boxPoints_0 = new Vector3();
const boxPoints_1 = new Vector3();
const boxPoints_2 = new Vector3();
const boxPoints_3 = new Vector3();
const boxPoints_4 = new Vector3();
const boxPoints_5 = new Vector3();
const boxPoints_6 = new Vector3();
const boxPoints_7 = new Vector3();

const boxPolygons = [];

function getBox3Polygons(box3) {
	const minX = box3.min.x, minY = box3.min.y, minZ = box3.min.z;
	const maxX = box3.max.x, maxY = box3.max.y, maxZ = box3.max.z;

	boxPoints_0.set(maxX, maxY, maxZ);
	boxPoints_1.set(maxX, minY, maxZ);
	boxPoints_2.set(maxX, minY, minZ);
	boxPoints_3.set(maxX, maxY, minZ);
	boxPoints_4.set(minX, maxY, maxZ);
	boxPoints_5.set(minX, minY, maxZ);
	boxPoints_6.set(minX, minY, minZ);
	boxPoints_7.set(minX, maxY, minZ);

	boxPolygons[0] = getPolygon().begin().pushVertex(boxPoints_0).pushVertex(boxPoints_1).pushVertex(boxPoints_2).pushVertex(boxPoints_3).end();
	boxPolygons[1] = getPolygon().begin().pushVertex(boxPoints_4).pushVertex(boxPoints_7).pushVertex(boxPoints_6).pushVertex(boxPoints_5).end();
	boxPolygons[2] = getPolygon().begin().pushVertex(boxPoints_0).pushVertex(boxPoints_3).pushVertex(boxPoints_7).pushVertex(boxPoints_4).end();
	boxPolygons[3] = getPolygon().begin().pushVertex(boxPoints_1).pushVertex(boxPoints_2).pushVertex(boxPoints_6).pushVertex(boxPoints_5).end();
	boxPolygons[4] = getPolygon().begin().pushVertex(boxPoints_0).pushVertex(boxPoints_4).pushVertex(boxPoints_5).pushVertex(boxPoints_1).end();
	boxPolygons[5] = getPolygon().begin().pushVertex(boxPoints_3).pushVertex(boxPoints_7).pushVertex(boxPoints_6).pushVertex(boxPoints_2).end();
}

export { ShadowAdapter };