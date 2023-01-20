/**
 * The vector 4 class
 * @memberof t3d
 */
class Vector4 {

	/**
	 * @param {Number} [x=0] - the x value of this vector.
	 * @param {Number} [y=0] - the y value of this vector.
	 * @param {Number} [z=0] - the z value of this vector.
	 * @param {Number} [w=1] - the w value of this vector.
	 */
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	/**
	 * Sets this vector to be the vector linearly interpolated between v1 and v2
	 * where ratio is the percent distance along the line connecting the two vectors
	 * - ratio = 0 will be v1, and ratio = 1 will be v2.
	 * @param {t3d.Vector4} v1 - the starting Vector4.
	 * @param {t3d.Vector4} v2 - Vector4 to interpolate towards.
	 * @param {Number} ratio - interpolation factor, typically in the closed interval [0, 1].
	 * @return {t3d.Vector4}
	 */
	lerpVectors(v1, v2, ratio) {
		return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
	}

	/**
	 * Sets the x, y, z and w components of this vector.
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 * @param {Number} w
	 * @return {t3d.Vector4}
	 */
	set(x = 0, y = 0, z = 0, w = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;
	}

	/**
	 * Converts this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but length 1.
	 * @return {t3d.Vector4}
	 */
	normalize() {
		return this.multiplyScalar(1 / (this.getLength() || 1));
	}

	/**
	 * Multiplies this vector by scalar s.
	 * @param {Number} scalar
	 * @return {t3d.Vector4}
	 */
	multiplyScalar(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		this.w *= scalar;

		return this;
	}

	/**
	 * Calculates the dot product of this vector and v.
	 * @param {t3d.Vector4} v
	 * @return {t3d.Vector4}
	 */
	dot(v) {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	}

	/**
	 * Computes the square of the Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
	 * If you are comparing the lengths of vectors, you should compare the length squared instead
	 * as it is slightly more efficient to calculate.
	 * @return {Number}
	 */
	getLengthSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}

	/**
	 * Computes the Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
	 * @return {Number}
	 */
	getLength() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}

	/**
	 * Computes the {@link https://en.wikipedia.org/wiki/Taxicab_geometry|Manhattan length}  from (0, 0, 0, 0) to (x, y, z, w).
	 * @return {Number}
	 */
	getManhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	}

	/**
	 * Multiplies this vector by 4 x 4 m.
	 * @param {t3d.Matrix4} m
	 * @return {t3d.Vector4}
	 */
	applyMatrix4(m) {
		const x = this.x, y = this.y, z = this.z, w = this.w;
		const e = m.elements;

		this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
		this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
		this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
		this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

		return this;
	}

	/**
	 * Checks for strict equality of this vector and v.
	 * @param {t3d.Vector4} v
	 * @return {Boolean}
	 */
	equals(v) {
		return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z) && (v.w === this.w));
	}

	/**
	 * Adds v to this vector.
	 * @param {t3d.Vector4} v
	 * @return {t3d.Vector4}
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;

		return this;
	}

	/**
	 * Multiplies this vector by v.
	 * @param {t3d.Vector4} v
	 * @return {t3d.Vector4}
	 */
	multiply(v) {
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		this.w *= v.w;

		return this;
	}

	/**
	 * Sets this vector to a - b.
	 * @param {t3d.Vector4} a
	 * @param {t3d.Vector4} b
	 * @return {t3d.Vector4}
	 */
	subVectors(a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		this.w = a.w - b.w;

		return this;
	}

	/**
	 * Sets this vector's x value to be array[ offset + 0 ],
	 * y value to be array[ offset + 1 ] z value to be array[ offset + 2 ]
	 * and w value to be array[ offset + 3 ].
	 * @param {Number[]} array - the source array.
	 * @param {Number} [offset=0] - offset into the array.
	 * @return {t3d.Vector4}
	 */
	fromArray(array, offset = 0) {
		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
		this.w = array[offset + 3];

		return this;
	}

	/**
	 * Returns an array [x, y, z, w], or copies x, y, z and w into the provided array.
	 * @param {Number[]} [array] - array to store this vector to. If this is not provided, a new array will be created.
	 * @param {Number} [offset=0] - offset into the array.
	 * @return {Number[]}
	 */
	toArray(array = [], offset = 0) {
		array[offset] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;
		array[offset + 3] = this.w;

		return array;
	}

	/**
	 * Returns a new Vector4 with the same x, y, z and w values as this one.
	 * @return {t3d.Vector4}
	 */
	clone() {
		return new Vector4(this.x, this.y, this.z, this.w);
	}

	/**
	 * Copies the values of the passed Vector4's x, y, z and w properties to this Vector4.
	 * @param {t3d.Vector4} v
	 * @return {t3d.Vector4}
	 */
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = (v.w !== undefined) ? v.w : 1;

		return this;
	}

}

export { Vector4 };