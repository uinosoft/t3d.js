import { Vector3 } from './Vector3.js';

/**
 * Represents an axis-aligned bounding box (AABB) in 3D space.
 */
class Box3 {

	/**
	 * @param {Vector3} min - (optional) Vector3 representing the lower (x, y, z) boundary of the box.
	 * 								Default is ( + Infinity, + Infinity, + Infinity ).
	 * @param {Vector3} max - (optional) Vector3 representing the upper (x, y, z) boundary of the box.
	 * 								Default is ( - Infinity, - Infinity, - Infinity ).
	 */
	constructor(min, max) {
		this.min = (min !== undefined) ? min : new Vector3(+Infinity, +Infinity, +Infinity);
		this.max = (max !== undefined) ? max : new Vector3(-Infinity, -Infinity, -Infinity);
	}

	/**
	 * Sets the lower and upper (x, y, z) boundaries of this box.
	 * @param {Vector3} min - Vector3 representing the lower (x, y, z) boundary of the box.
	 * @param {Vector3} max - Vector3 representing the lower upper (x, y, z) boundary of the box.
	 */
	set(min, max) {
		this.min.copy(min);
		this.max.copy(max);
	}

	/**
	 * Sets the upper and lower bounds of this box to include all of the points in points.
	 * @param {Vector3[]} points - Array of Vector3s that the resulting box will contain.
	 * @returns {Box3}
	 */
	setFromPoints(points) {
		this.makeEmpty();

		for (let i = 0, il = points.length; i < il; i++) {
			this.expandByPoint(points[i]);
		}

		return this;
	}

	/**
	 * Makes this box empty.
	 * @returns {Box3}
	 */
	makeEmpty() {
		this.min.x = this.min.y = this.min.z = +Infinity;
		this.max.x = this.max.y = this.max.z = -Infinity;

		return this;
	}

	/**
	 * Expands the boundaries of this box to include point.
	 * @param {Vector3} point - Vector3 that should be included in the box.
	 * @returns {Box3}
	 */
	expandByPoint(point) {
		this.min.min(point);
		this.max.max(point);

		return this;
	}

	/**
	 * Expands each dimension of the box by scalar. If negative, the dimensions of the box will be contracted.
	 * @param {number} scalar - Distance to expand the box by.
	 * @returns {Box3}
	 */
	expandByScalar(scalar) {
		this.min.addScalar(-scalar);
		this.max.addScalar(scalar);

		return this;
	}

	/**
	 * Expands the boundaries of this box to include box3.
	 * @param {Box3} box3 - Box that will be unioned with this box.
	 * @returns {Box3}
	 */
	expandByBox3(box3) {
		this.min.min(box3.min);
		this.max.max(box3.max);

		return this;
	}

	/**
	 * Sets the upper and lower bounds of this box to include all of the data in array.
	 * @param {number[]} array - An array of position data that the resulting box will envelop.
	 * @param {number} [gap=3]
	 * @param {number} [offset=0]
	 * @returns {Box3}
	 */
	setFromArray(array, gap = 3, offset = 0) {
		let minX = +Infinity;
		let minY = +Infinity;
		let minZ = +Infinity;

		let maxX = -Infinity;
		let maxY = -Infinity;
		let maxZ = -Infinity;

		for (let i = 0, l = array.length; i < l; i += gap) {
			const x = array[i + offset];
			const y = array[i + offset + 1];
			const z = array[i + offset + 2];

			if (x < minX) minX = x;
			if (y < minY) minY = y;
			if (z < minZ) minZ = z;

			if (x > maxX) maxX = x;
			if (y > maxY) maxY = y;
			if (z > maxZ) maxZ = z;
		}

		this.min.set(minX, minY, minZ);
		this.max.set(maxX, maxY, maxZ);

		return this;
	}

	/**
	 * Clamps the point within the bounds of this box.
	 * @param {Vector3} point - Vector3 to clamp.
	 * @param {Vector3} target - Vector3 to store the result in.
	 * @returns {Vector3}
	 */
	clampPoint(point, target) {
		return target.copy(point).min(this.max).max(this.min);
	}

	/**
	 * Returns the distance from any edge of this box to the specified point.
	 * If the point lies inside of this box, the distance will be 0.
	 * @param {Vector3} point - Vector3 to measure the distance to.
	 * @returns {number}
	 */
	distanceToPoint(point) {
		return this.clampPoint(point, _vec3_1).distanceTo(point);
	}

	/**
	 * Returns aMinimum Bounding Sphere for the box.
	 * @param {Sphere} target — the result will be copied into this Sphere.
	 * @returns {Sphere}
	 */
	getBoundingSphere(target) {
		if (this.isEmpty()) {
			target.makeEmpty();
		} else {
			this.getCenter(target.center);
			target.radius = this.getSize(_vec3_1).getLength() * 0.5;
		}

		return target;
	}

	/**
	 * Returns true if this box includes zero points within its bounds.
	 * @returns {boolean}
	 */
	isEmpty() {
		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
		return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
	}

	/**
	 * Returns true if this box and box share the same lower and upper bounds.
	 * @param {Box3} box - Box to compare with this one.
	 * @returns {boolean}
	 */
	equals(box) {
		return box.min.equals(this.min) && box.max.equals(this.max);
	}

	/**
	 * Returns the center point of the box as a Vector3.
	 * @param {Vector3} target - the result will be copied into this Vector3.
	 * @returns {Vector3}
	 */
	getCenter(target = new Vector3()) {
		return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
	}

	/**
	 * Returns the width, height and depth of this box.
	 * @param {Vector3} target - the result will be copied into this Vector3.
	 * @returns {Vector3}
	 */
	getSize(target = new Vector3()) {
		return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
	}

	/**
	 * Get the 8 corner points of the bounding box, the order is as follows:
	 *   7-------3
	 *  /|      /|
	 * 4-------0 |
	 * | |     | |
	 * | 6-----|-2
	 * |/      |/
	 * 5-------1
	 * @param {Vector3[]} points - The array to store the points.
	 * @returns {Vector3[]} The array of points.
	 */
	getPoints(points) {
		const minX = this.min.x, minY = this.min.y, minZ = this.min.z;
		const maxX = this.max.x, maxY = this.max.y, maxZ = this.max.z;

		points[0].set(maxX, maxY, maxZ);
		points[1].set(maxX, minY, maxZ);
		points[2].set(maxX, minY, minZ);
		points[3].set(maxX, maxY, minZ);
		points[4].set(minX, maxY, maxZ);
		points[5].set(minX, minY, maxZ);
		points[6].set(minX, minY, minZ);
		points[7].set(minX, maxY, minZ);

		return points;
	}

	/**
	 * Computes the union of this box and box,
	 * setting the upper bound of this box to the greater of the two boxes' upper bounds and the lower bound of this box to the lesser of the two boxes' lower bounds.
	 * @param {Box3} box - Box that will be unioned with this box.
	 * @returns {Box3}
	 */
	union(box) {
		this.min.min(box.min);
		this.max.max(box.max);
		return this;
	}

	/**
	 * Transforms this Box3 with the supplied matrix.
	 * @param {Matrix4} matrix - The Matrix4 to apply
	 * @returns {Box3}
	 */
	applyMatrix4(matrix) {
		// transform of empty box is an empty box.
		if (this.isEmpty()) return this;

		// NOTE: I am using a binary pattern to specify all 2^3 combinations below
		_points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix); // 000
		_points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix); // 001
		_points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix); // 010
		_points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix); // 011
		_points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix); // 100
		_points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix); // 101
		_points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix); // 110
		_points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix); // 111

		this.setFromPoints(_points);

		return this;
	}

	/**
	 * Returns true if the specified point lies within or on the boundaries of this box.
	 * @param {Vector3} point - Vector3 to check for inclusion.
	 * @returns {boolean}
	 */
	containsPoint(point) {
		return point.x < this.min.x || point.x > this.max.x ||
			point.y < this.min.y || point.y > this.max.y ||
			point.z < this.min.z || point.z > this.max.z ? false : true;
	}

	/**
	 * Determines whether or not this box intersects triangle.
	 * @param {Triangle} triangle - Triangle to check for intersection against.
	 * @returns {boolean}
	 */
	intersectsTriangle(triangle) {
		if (this.isEmpty()) {
			return false;
		}

		// compute box center and extents
		this.getCenter(_center);
		_extents.subVectors(this.max, _center);

		// translate triangle to aabb origin
		_v0.subVectors(triangle.a, _center);
		_v1.subVectors(triangle.b, _center);
		_v2.subVectors(triangle.c, _center);

		// compute edge vectors for triangle
		_f0.subVectors(_v1, _v0);
		_f1.subVectors(_v2, _v1);
		_f2.subVectors(_v0, _v2);

		// test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
		// make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
		// axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
		let axes = [
			0, -_f0.z, _f0.y, 0, -_f1.z, _f1.y, 0, -_f2.z, _f2.y,
			_f0.z, 0, -_f0.x, _f1.z, 0, -_f1.x, _f2.z, 0, -_f2.x,
			-_f0.y, _f0.x, 0, -_f1.y, _f1.x, 0, -_f2.y, _f2.x, 0
		];
		if (!satForAxes(axes, _v0, _v1, _v2, _extents)) {
			return false;
		}

		// test 3 face normals from the aabb
		axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
		if (!satForAxes(axes, _v0, _v1, _v2, _extents)) {
			return false;
		}

		// finally testing the face normal of the triangle
		// use already existing triangle edge vectors here
		_triangleNormal.crossVectors(_f0, _f1);
		axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];

		return satForAxes(axes, _v0, _v1, _v2, _extents);
	}

	/**
	 * Returns a new Box3 with the same min and max as this one.
	 * @returns {Box3}
	 */
	clone() {
		return new Box3().copy(this);
	}

	/**
	 * Copies the min and max from box to this box.
	 * @param {Box3} box - Box3 to copy.
	 * @returns {Box3}
	 */
	copy(box) {
		this.min.copy(box.min);
		this.max.copy(box.max);

		return this;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Box3.prototype.isBox3 = true;

const _points = [
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3(),
	new Vector3()
];

const _vec3_1 = new Vector3();

// triangle centered vertices

const _v0 = new Vector3();
const _v1 = new Vector3();
const _v2 = new Vector3();

// triangle edge vectors

const _f0 = new Vector3();
const _f1 = new Vector3();
const _f2 = new Vector3();

const _center = new Vector3();
const _extents = new Vector3();
const _triangleNormal = new Vector3();
const _testAxis = new Vector3();

function satForAxes(axes, v0, v1, v2, extents) {
	for (let i = 0, j = axes.length - 3; i <= j; i += 3) {
		_testAxis.fromArray(axes, i);
		// project the aabb onto the separating axis
		const r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z);
		// project all 3 vertices of the triangle onto the separating axis
		const p0 = v0.dot(_testAxis);
		const p1 = v1.dot(_testAxis);
		const p2 = v2.dot(_testAxis);
		// actual test, basically see if either of the most extreme of the triangle points intersects r
		if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
			// points of the projected triangle are outside the projected half-length of the aabb
			// the axis is separating and we can exit
			return false;
		}
	}

	return true;
}

export { Box3 };