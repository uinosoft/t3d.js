import { MathUtils, Ray, Box3, Matrix3, Matrix4, Vector3, Frustum } from 't3d';

/**
 * An oriented bounding box (OBB) is a box that is aligned with the object's
 * local coordinate system. The OBB is defined by its center, halfSize and
 * rotation. The rotation matrix is a 3x3 matrix that defines the orientation
 * of the OBB. The halfSize vector defines the dimensions of the box along
 * each of its local axes.
 * @memberof t3d
 */
class OBB {

	/**
	 * Create an oriented bounding box.
	 * @param {Vector3} [center] - The center of the OBB.
	 * @param {Vector3} [halfSize] - The half size of the OBB.
	 * @param {Matrix3} [rotation] - The rotation of the OBB.
	 */
	constructor(center = new Vector3(), halfSize = new Vector3(), rotation = new Matrix3()) {
		this.center = center;
		this.halfSize = halfSize;
		this.rotation = rotation;
	}

	/**
	 * Set the center, half size and rotation of the OBB.
	 * @param {Vector3} center - The center of the OBB.
	 * @param {Vector3} halfSize - The half size of the OBB.
	 * @param {Matrix3} rotation - The rotation of the OBB.
	 * @returns {OBB}
	 */
	set(center, halfSize, rotation) {
		this.center = center;
		this.halfSize = halfSize;
		this.rotation = rotation;

		return this;
	}

	/**
	 * Copy the values from the given OBB.
	 * @param {OBB} obb - The OBB to copy.
	 * @returns {OBB}
	 */
	copy(obb) {
		this.center.copy(obb.center);
		this.halfSize.copy(obb.halfSize);
		this.rotation.copy(obb.rotation);

		return this;
	}

	/**
	 * Clone this OBB.
	 * @returns {OBB}
	 */
	clone() {
		return new this.constructor().copy(this);
	}

	/**
	 * Get the size of the OBB.
	 * @param {Vector3} result - The result vector.
	 * @returns {Vector3} The size of the OBB.
	 */
	getSize(result) {
		return result.copy(this.halfSize).multiplyScalar(2);
	}

	/**
	 * Check if the OBB is empty.
	 * @returns {boolean} Whether the OBB is empty.
	 */
	isEmpty() {
		return this.halfSize.x <= 0 || this.halfSize.y <= 0 || this.halfSize.z <= 0;
	}

	/**
	 * Make the OBB empty.
	 * @returns {OBB}
	 */
	makeEmpty() {
		this.center.set(0, 0, 0);
		this.halfSize.set(0, 0, 0);
		this.rotation.identity();
		return this;
	}

	/**
	 * Get the closest point on the OBB to the given point.
	 * Reference: Closest Point on OBB to Point in Real-Time Collision Detection
	 * by Christer Ericson (chapter 5.1.4)
	 * @param {Vector3} point - The point.
	 * @param {Vector3} result - The result vector.
	 * @returns {Vector3} The closest point on the OBB.
	 */
	clampPoint(point, result) {
		const halfSize = this.halfSize;

		v1.subVectors(point, this.center);
		this.rotation.extractBasis(xAxis, yAxis, zAxis);

		// start at the center position of the OBB

		result.copy(this.center);

		// project the target onto the OBB axes and walk towards that point

		const x = MathUtils.clamp(v1.dot(xAxis), -halfSize.x, halfSize.x);
		result.add(xAxis.multiplyScalar(x));

		const y = MathUtils.clamp(v1.dot(yAxis), -halfSize.y, halfSize.y);
		result.add(yAxis.multiplyScalar(y));

		const z = MathUtils.clamp(v1.dot(zAxis), -halfSize.z, halfSize.z);
		result.add(zAxis.multiplyScalar(z));

		return result;
	}

	/**
	 * Check if the OBB contains the given point.
	 * @param {Vector3} point - The point.
	 * @returns {boolean} Whether the OBB contains the point.
	 */
	containsPoint(point) {
		v1.subVectors(point, this.center);
		this.rotation.extractBasis(xAxis, yAxis, zAxis);

		// project v1 onto each axis and check if these points lie inside the OBB

		return Math.abs(v1.dot(xAxis)) <= this.halfSize.x &&
			Math.abs(v1.dot(yAxis)) <= this.halfSize.y &&
			Math.abs(v1.dot(zAxis)) <= this.halfSize.z;
	}

	/**
	 * Check if the OBB intersects the given Box3.
	 * @param {Box3} box3 - The Box3.
	 * @returns {boolean} Whether the OBB intersects the Box3.
	 */
	intersectsBox3(box3) {
		return this.intersectsOBB(obb.fromBox3(box3));
	}

	/**
	 * Check if the OBB intersects the given sphere.
	 * @param {Sphere} sphere - The sphere.
	 * @returns {boolean} Whether the OBB intersects the sphere.
	 */
	intersectsSphere(sphere) {
		// find the point on the OBB closest to the sphere center
		this.clampPoint(sphere.center, closestPoint);
		// if that point is inside the sphere, the OBB and sphere intersect
		return closestPoint.distanceToSquared(sphere.center) <= (sphere.radius * sphere.radius);
	}

	/**
	 * Check if the OBB intersects the given OBB.
	 * Reference: OBB-OBB Intersection in Real-Time Collision Detection
	 * by Christer Ericson (chapter 4.4.1)
	 * @param {OBB} obb - The OBB.
	 * @param {number} [epsilon=Number.EPSILON] - A small number to counteract arithmetic errors.
	 * @returns {boolean} Whether the OBB intersects the OBB.
	 */
	intersectsOBB(obb, epsilon = Number.EPSILON) {
		// prepare data structures (the code uses the same nomenclature like the reference)

		a.c = this.center;
		a.e[0] = this.halfSize.x;
		a.e[1] = this.halfSize.y;
		a.e[2] = this.halfSize.z;
		this.rotation.extractBasis(a.u[0], a.u[1], a.u[2]);

		b.c = obb.center;
		b.e[0] = obb.halfSize.x;
		b.e[1] = obb.halfSize.y;
		b.e[2] = obb.halfSize.z;
		obb.rotation.extractBasis(b.u[0], b.u[1], b.u[2]);

		// compute rotation matrix expressing b in a's coordinate frame

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				R[i][j] = a.u[i].dot(b.u[j]);
			}
		}

		// compute translation vector

		v1.subVectors(b.c, a.c);

		// bring translation into a's coordinate frame

		t[0] = v1.dot(a.u[0]);
		t[1] = v1.dot(a.u[1]);
		t[2] = v1.dot(a.u[2]);

		// compute common subexpressions. Add in an epsilon term to
		// counteract arithmetic errors when two edges are parallel and
		// their cross product is (near) null

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				AbsR[i][j] = Math.abs(R[i][j]) + epsilon;
			}
		}

		let ra, rb;

		// test axes L = A0, L = A1, L = A2

		for (let i = 0; i < 3; i++) {
			ra = a.e[i];
			rb = b.e[0] * AbsR[i][0] + b.e[1] * AbsR[i][1] + b.e[2] * AbsR[i][2];
			if (Math.abs(t[i]) > ra + rb) return false;
		}

		// test axes L = B0, L = B1, L = B2

		for (let i = 0; i < 3; i++) {
			ra = a.e[0] * AbsR[0][i] + a.e[1] * AbsR[1][i] + a.e[2] * AbsR[2][i];
			rb = b.e[i];
			if (Math.abs(t[0] * R[0][i] + t[1] * R[1][i] + t[2] * R[2][i]) > ra + rb) return false;
		}

		// test axis L = A0 x B0

		ra = a.e[1] * AbsR[2][0] + a.e[2] * AbsR[1][0];
		rb = b.e[1] * AbsR[0][2] + b.e[2] * AbsR[0][1];
		if (Math.abs(t[2] * R[1][0] - t[1] * R[2][0]) > ra + rb) return false;

		// test axis L = A0 x B1

		ra = a.e[1] * AbsR[2][1] + a.e[2] * AbsR[1][1];
		rb = b.e[0] * AbsR[0][2] + b.e[2] * AbsR[0][0];
		if (Math.abs(t[2] * R[1][1] - t[1] * R[2][1]) > ra + rb) return false;

		// test axis L = A0 x B2

		ra = a.e[1] * AbsR[2][2] + a.e[2] * AbsR[1][2];
		rb = b.e[0] * AbsR[0][1] + b.e[1] * AbsR[0][0];
		if (Math.abs(t[2] * R[1][2] - t[1] * R[2][2]) > ra + rb) return false;

		// test axis L = A1 x B0

		ra = a.e[0] * AbsR[2][0] + a.e[2] * AbsR[0][0];
		rb = b.e[1] * AbsR[1][2] + b.e[2] * AbsR[1][1];
		if (Math.abs(t[0] * R[2][0] - t[2] * R[0][0]) > ra + rb) return false;

		// test axis L = A1 x B1

		ra = a.e[0] * AbsR[2][1] + a.e[2] * AbsR[0][1];
		rb = b.e[0] * AbsR[1][2] + b.e[2] * AbsR[1][0];
		if (Math.abs(t[0] * R[2][1] - t[2] * R[0][1]) > ra + rb) return false;

		// test axis L = A1 x B2

		ra = a.e[0] * AbsR[2][2] + a.e[2] * AbsR[0][2];
		rb = b.e[0] * AbsR[1][1] + b.e[1] * AbsR[1][0];
		if (Math.abs(t[0] * R[2][2] - t[2] * R[0][2]) > ra + rb) return false;

		// test axis L = A2 x B0

		ra = a.e[0] * AbsR[1][0] + a.e[1] * AbsR[0][0];
		rb = b.e[1] * AbsR[2][2] + b.e[2] * AbsR[2][1];
		if (Math.abs(t[1] * R[0][0] - t[0] * R[1][0]) > ra + rb) return false;

		// test axis L = A2 x B1

		ra = a.e[0] * AbsR[1][1] + a.e[1] * AbsR[0][1];
		rb = b.e[0] * AbsR[2][2] + b.e[2] * AbsR[2][0];
		if (Math.abs(t[1] * R[0][1] - t[0] * R[1][1]) > ra + rb) return false;

		// test axis L = A2 x B2

		ra = a.e[0] * AbsR[1][2] + a.e[1] * AbsR[0][2];
		rb = b.e[0] * AbsR[2][1] + b.e[1] * AbsR[2][0];
		if (Math.abs(t[1] * R[0][2] - t[0] * R[1][2]) > ra + rb) return false;

		// since no separating axis is found, the OBBs must be intersecting

		return true;
	}

	/**
	 * Check if the OBB intersects the given plane.
	 * Reference: Testing Box Against Plane in Real-Time Collision Detection
	 * by Christer Ericson (chapter 5.2.3)
	 * @param {Plane} plane - The plane.
	 * @returns {boolean} Whether the OBB intersects the plane.
	 */
	intersectsPlane(plane) {
		this.rotation.extractBasis(xAxis, yAxis, zAxis);

		// compute the projection interval radius of this OBB onto L(t) = this->center + t * p.normal;

		const r = this.halfSize.x * Math.abs(plane.normal.dot(xAxis)) +
				this.halfSize.y * Math.abs(plane.normal.dot(yAxis)) +
				this.halfSize.z * Math.abs(plane.normal.dot(zAxis));

		// compute distance of the OBB's center from the plane

		const d = plane.normal.dot(this.center) - plane.constant;

		// Intersection occurs when distance d falls within [-r,+r] interval

		return Math.abs(d) <= r;
	}

	/**
	 * Performs a ray/OBB intersection test and stores the intersection point
	 * to the given 3D vector. If no intersection is detected, *null* is returned.
	 * @param {Ray} ray - The ray.
	 * @param {Vector3} result - The result vector.
	 * @returns {Vector3 | null} The intersection point or *null*.
	 */
	intersectRay(ray, result) {
		// the idea is to perform the intersection test in the local space
		// of the OBB.

		this.toBoundingBoxAndTransform(aabb, matrix);

		// transform ray to the local space of the OBB

		localRay.copy(ray).applyMatrix4(inverse.getInverse(matrix));

		// perform ray <-> AABB intersection test

		if (localRay.intersectBox(aabb, result)) {
			// transform the intersection point back to world space
			return result.applyMatrix4(matrix);
		} else {
			return null;
		}
	}

	/**
	 * Performs a ray/OBB intersection test. Returns either true or false if
	 * there is a intersection or not.
	 * @param {Ray} ray - The ray.
	 * @returns {boolean} Whether the ray intersects the OBB.
	 */
	intersectsRay(ray) {
		return this.intersectRay(ray, v1) !== null;
	}

	/**
	 * Set the OBB from a Box3, the OBB will be axis-aligned.
	 * @param {Box3} box3 - The Box3.
	 * @returns {OBB}
	 */
	fromBox3(box3) {
		box3.getCenter(this.center);
		box3.getSize(this.halfSize).multiplyScalar(0.5);

		this.rotation.identity();

		return this;
	}

	/**
	 * Check if this OBB equals the given OBB.
	 * @param {OBB} obb - The OBB to check against.
	 * @returns {boolean} Whether this OBB equals
	 */
	equals(obb) {
		return obb.center.equals(this.center) &&
			obb.halfSize.equals(this.halfSize) &&
			obb.rotation.equals(this.rotation);
	}

	/**
	 * Apply a 4x4 transformation matrix to the OBB.
	 * @param {Matrix4} matrix - The transformation matrix.
	 * @returns {OBB}
	 */
	applyMatrix4(matrix) {
		const e = matrix.elements;

		let sx = v1.set(e[0], e[1], e[2]).getLength();
		const sy = v1.set(e[4], e[5], e[6]).getLength();
		const sz = v1.set(e[8], e[9], e[10]).getLength();

		const det = matrix.determinant();
		if (det < 0) sx = -sx;

		rotationMatrix.setFromMatrix4(matrix);

		const invSX = 1 / sx;
		const invSY = 1 / sy;
		const invSZ = 1 / sz;

		rotationMatrix.elements[0] *= invSX;
		rotationMatrix.elements[1] *= invSX;
		rotationMatrix.elements[2] *= invSX;

		rotationMatrix.elements[3] *= invSY;
		rotationMatrix.elements[4] *= invSY;
		rotationMatrix.elements[5] *= invSY;

		rotationMatrix.elements[6] *= invSZ;
		rotationMatrix.elements[7] *= invSZ;
		rotationMatrix.elements[8] *= invSZ;

		this.rotation.multiply(rotationMatrix);

		this.halfSize.x *= sx;
		this.halfSize.y *= sy;
		this.halfSize.z *= sz;

		// https://github.com/mrdoob/three.js/issues/21753
		this.center.applyMatrix4(matrix);

		return this;
	}

	/**
	 * Set the OBB from center point and axis vectors.
	 * @param {Vector3} center - The center of the OBB.
	 * @param {Vector3} axisX - The x-axis of the OBB.
	 * @param {Vector3} axisY - The y-axis of the OBB.
	 * @param {Vector3} axisZ - The z-axis of the OBB.
	 * @returns {OBB}
	 */
	setFromCenterAndAxes(center, axisX, axisY, axisZ) {
		xAxis.copy(axisX);
		yAxis.copy(axisY);
		zAxis.copy(axisZ);

		const scaleX = xAxis.getLength();
		const scaleY = yAxis.getLength();
		const scaleZ = zAxis.getLength();

		xAxis.normalize();
		yAxis.normalize();
		zAxis.normalize();

		// handle the case where the box has a dimension of 0 in one axis
		if (scaleX === 0) {
			xAxis.crossVectors(yAxis, zAxis);
		}

		if (scaleY === 0) {
			yAxis.crossVectors(xAxis, zAxis);
		}

		if (scaleZ === 0) {
			zAxis.crossVectors(xAxis, yAxis);
		}

		this.rotation.set(
			xAxis.x, yAxis.x, zAxis.x,
			xAxis.y, yAxis.y, zAxis.y,
			xAxis.z, yAxis.z, zAxis.z
		);

		this.center.copy(center);

		this.halfSize.set(scaleX, scaleY, scaleZ);

		return this;
	}

	/**
	 * Get the axis-aligned bounding box (AABB) and transformation matrix of the OBB,
	 * the bounding box center is always at (0, 0, 0) because center offset is stored in the Matrix4.
	 * @param {Box3} box3 - The Box3.
	 * @param {Matrix4} matrix - The Matrix4.
	 * @returns {OBB}
	 */
	toBoundingBoxAndTransform(box3, matrix) {
		box3.min.copy(this.halfSize).negate();
		box3.max.copy(this.halfSize);

		matrix.setFromMatrix3(this.rotation);
		this.center.toArray(matrix.elements, 12);

		return this;
	}

	/**
	 * Get the 8 corner points of the OBB, the order is same as Box3.getPoints().
	 * @param {Vector3[]} points - The array to store the points.
	 * @returns {Vector3[]} The array of points.
	 */
	getPoints(points) {
		this.toBoundingBoxAndTransform(aabb, matrix);

		aabb.getPoints(points);

		for (let i = 0; i < 8; i++) {
			points[i].applyMatrix4(matrix);
		}

		return points;
	}

	/**
	 * Get the 6 planes of the OBB.
	 * @param {Plane[]} planes - The array to store the planes.
	 * @returns {Plane[]} The array of planes.
	 */
	getPlanes(planes) {
		this.toBoundingBoxAndTransform(aabb, matrix);

		const worldMin = aabb.min.applyMatrix4(matrix);
		const worldMax = aabb.max.applyMatrix4(matrix);

		v1.set(0, 0, 1).applyMatrix3(this.rotation).normalize();
		planes[0].setFromNormalAndCoplanarPoint(v1, worldMin);
		planes[1].setFromNormalAndCoplanarPoint(v1, worldMax);
		planes[1].normal.negate();
		planes[1].constant *= -1;

		v1.set(0, 1, 0).applyMatrix3(this.rotation).normalize();
		planes[2].setFromNormalAndCoplanarPoint(v1, worldMin);
		planes[3].setFromNormalAndCoplanarPoint(v1, worldMax);
		planes[3].normal.negate();
		planes[3].constant *= -1;

		v1.set(1, 0, 0).applyMatrix3(this.rotation).normalize();
		planes[4].setFromNormalAndCoplanarPoint(v1, worldMin);
		planes[5].setFromNormalAndCoplanarPoint(v1, worldMax);
		planes[5].normal.negate();
		planes[5].constant *= -1;

		return planes;
	}

	/**
	 * Check if the OBB intersects the given frustum.
	 * @param {Frustum} frustum - The frustum.
	 * @returns {boolean} Whether the OBB intersects the frustum.
	 */
	intersectsFrustum(frustum) {
		// the idea is to perform the intersection test in the local space
		// of the OBB.

		this.toBoundingBoxAndTransform(aabb, matrix);

		localFrustum.copy(frustum).applyMatrix4(inverse.getInverse(matrix));

		return localFrustum.intersectsBox(aabb);
	}

}

// helper variables

const a = {
	c: null, // center
	u: [new Vector3(), new Vector3(), new Vector3()], // basis vectors
	e: [] // half width
};

const b = {
	c: null, // center
	u: [new Vector3(), new Vector3(), new Vector3()], // basis vectors
	e: [] // half width
};

const R = [[], [], []];
const AbsR = [[], [], []];
const t = [];

const xAxis = new Vector3();
const yAxis = new Vector3();
const zAxis = new Vector3();
const v1 = new Vector3();
const closestPoint = new Vector3();
const rotationMatrix = new Matrix3();
const aabb = new Box3();
const matrix = new Matrix4();
const inverse = new Matrix4();
const localRay = new Ray();
const localFrustum = new Frustum();

const obb = new OBB();

export { OBB };