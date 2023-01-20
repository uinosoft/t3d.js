import { Vector3 } from './Vector3.js';

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

/**
 * Represents an axis-aligned bounding box (AABB) in 3D space.
 * @memberof t3d
 */
class Box3 {

	/**
	 * @param {t3d.Vector3} min - (optional) Vector3 representing the lower (x, y, z) boundary of the box.
	 * 								Default is ( + Infinity, + Infinity, + Infinity ).
	 * @param {t3d.Vector3} max - (optional) Vector3 representing the upper (x, y, z) boundary of the box.
	 * 								Default is ( - Infinity, - Infinity, - Infinity ).
	 */
	constructor(min, max) {
		this.min = (min !== undefined) ? min : new Vector3(+Infinity, +Infinity, +Infinity);
		this.max = (max !== undefined) ? max : new Vector3(-Infinity, -Infinity, -Infinity);
	}

	/**
	 * Sets the lower and upper (x, y, z) boundaries of this box.
	 * @param {t3d.Vector3} min - Vector3 representing the lower (x, y, z) boundary of the box.
	 * @param {t3d.Vector3} max - Vector3 representing the lower upper (x, y, z) boundary of the box.
	 */
	set(min, max) {
		this.min.copy(min);
		this.max.copy(max);
	}

	/**
	 * Sets the upper and lower bounds of this box to include all of the points in points.
	 * @param {t3d.Vector3[]} points - Array of Vector3s that the resulting box will contain.
	 * @return {t3d.Box3}
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
	 * @return {t3d.Box3}
	 */
	makeEmpty() {
		this.min.x = this.min.y = this.min.z = +Infinity;
		this.max.x = this.max.y = this.max.z = -Infinity;

		return this;
	}

	/**
	 * Expands the boundaries of this box to include point.
	 * @param {t3d.Vector3} point - Vector3 that should be included in the box.
	 * @return {t3d.Box3}
	 */
	expandByPoint(point) {
		this.min.min(point);
		this.max.max(point);

		return this;
	}

	/**
	 * Expands each dimension of the box by scalar. If negative, the dimensions of the box will be contracted.
	 * @param {Number} scalar - Distance to expand the box by.
	 * @return {t3d.Box3}
	 */
	expandByScalar(scalar) {
		this.min.addScalar(-scalar);
		this.max.addScalar(scalar);

		return this;
	}

	/**
	 * Expands the boundaries of this box to include box3.
	 * @param {t3d.Box3} box3 - Box that will be unioned with this box.
	 * @return {t3d.Box3}
	 */
	expandByBox3(box3) {
		this.min.min(box3.min);
		this.max.max(box3.max);

		return this;
	}

	/**
	 * Sets the upper and lower bounds of this box to include all of the data in array.
	 * @param {Number[]} array - An array of position data that the resulting box will envelop.
	 * @param {Number} [gap=3]
	 * @param {Number} [offset=0]
	 * @return {t3d.Box3}
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
	 * Returns true if this box includes zero points within its bounds.
	 * @return {Boolean}
	 */
	isEmpty() {
		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
		return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
	}

	/**
	 * Returns true if this box and box share the same lower and upper bounds.
	 * @param {t3d.Box3} box - Box to compare with this one.
	 * @return {Boolean}
	 */
	equals(box) {
		return box.min.equals(this.min) && box.max.equals(this.max);
	}

	/**
	 * Returns the center point of the box as a Vector3.
	 * @param {t3d.Vector3} optionalTarget - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
	 */
	getCenter(optionalTarget) {
		const result = optionalTarget || new Vector3();
		return this.isEmpty() ? result.set(0, 0, 0) : result.addVectors(this.min, this.max).multiplyScalar(0.5);
	}

	/**
	 * Transforms this Box3 with the supplied matrix.
	 * @param {t3d.Matrix4} matrix - The Matrix4 to apply
	 * @return {t3d.Box3}
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
	 * Returns a new Box3 with the same min and max as this one.
	 * @return {t3d.Box3}
	 */
	clone() {
		return new Box3().copy(this);
	}

	/**
	 * Copies the min and max from box to this box.
	 * @param {t3d.Box3} box - Box3 to copy.
	 * @return {t3d.Box3}
	 */
	copy(box) {
		this.min.copy(box.min);
		this.max.copy(box.max);

		return this;
	}

}

export { Box3 };