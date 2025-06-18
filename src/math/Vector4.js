import { MathUtils } from './MathUtils.js';

/**
 * The vector 4 class
 */
class Vector4 {

	/**
	 * @param {number} [x=0] - the x value of this vector.
	 * @param {number} [y=0] - the y value of this vector.
	 * @param {number} [z=0] - the z value of this vector.
	 * @param {number} [w=1] - the w value of this vector.
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
	 * @param {Vector4} v1 - the starting Vector4.
	 * @param {Vector4} v2 - Vector4 to interpolate towards.
	 * @param {number} ratio - interpolation factor, typically in the closed interval [0, 1].
	 * @returns {Vector4}
	 */
	lerpVectors(v1, v2, ratio) {
		return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
	}

	/**
	 * Sets the x, y, z and w components of this vector.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @param {number} w
	 * @returns {Vector4}
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
	 * @returns {Vector4}
	 */
	normalize() {
		return this.multiplyScalar(1 / (this.getLength() || 1));
	}

	/**
	 * Multiplies this vector by scalar s.
	 * @param {number} scalar
	 * @returns {Vector4}
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
	 * @param {Vector4} v
	 * @returns {Vector4}
	 */
	dot(v) {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	}

	/**
	 * Computes the square of the Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
	 * If you are comparing the lengths of vectors, you should compare the length squared instead
	 * as it is slightly more efficient to calculate.
	 * @returns {number}
	 */
	getLengthSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}

	/**
	 * Computes the Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
	 * @returns {number}
	 */
	getLength() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}

	/**
	 * Computes the {@link https://en.wikipedia.org/wiki/Taxicab_geometry|Manhattan length}  from (0, 0, 0, 0) to (x, y, z, w).
	 * @returns {number}
	 */
	getManhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	}

	/**
	 * Multiplies this vector by 4 x 4 m.
	 * @param {Matrix4} m
	 * @returns {Vector4}
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
	 * Sets this vector to the position represented by the matrix m.
	 * @param {Matrix4} m
	 * @returns {Vector4}
	 */
	setFromMatrixPosition(m) {
		const e = m.elements;

		this.x = e[12];
		this.y = e[13];
		this.z = e[14];
		this.w = e[15];

		return this;
	}

	/**
	 * Checks for strict equality of this vector and v.
	 * @param {Vector4} v
	 * @returns {boolean}
	 */
	equals(v) {
		return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z) && (v.w === this.w));
	}

	/**
	 * Adds v to this vector.
	 * @param {Vector4} v
	 * @returns {Vector4}
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
	 * @param {Vector4} v
	 * @returns {Vector4}
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
	 * @param {Vector4} a
	 * @param {Vector4} b
	 * @returns {Vector4}
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
	 * @param {number[]} array - the source array.
	 * @param {number} [offset=0] - offset into the array.
	 * @param {boolean} [denormalize=false] - if true, denormalize the values, and array should be a typed array.
	 * @returns {Vector4}
	 */
	fromArray(array, offset = 0, denormalize = false) {
		let x = array[offset], y = array[offset + 1],
			z = array[offset + 2], w = array[offset + 3];

		if (denormalize) {
			x = MathUtils.denormalize(x, array);
			y = MathUtils.denormalize(y, array);
			z = MathUtils.denormalize(z, array);
			w = MathUtils.denormalize(w, array);
		}

		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;
	}

	/**
	 * Returns an array [x, y, z, w], or copies x, y, z and w into the provided array.
	 * @param {number[]} [array] - array to store this vector to. If this is not provided, a new array will be created.
	 * @param {number} [offset=0] - offset into the array.
	 * @param {boolean} [normalize=false] - if true, normalize the values, and array should be a typed array.
	 * @returns {number[]}
	 */
	toArray(array = [], offset = 0, normalize = false) {
		let x = this.x, y = this.y,
			z = this.z, w = this.w;

		if (normalize) {
			x = MathUtils.normalize(x, array);
			y = MathUtils.normalize(y, array);
			z = MathUtils.normalize(z, array);
			w = MathUtils.normalize(w, array);
		}

		array[offset] = x;
		array[offset + 1] = y;
		array[offset + 2] = z;
		array[offset + 3] = w;

		return array;
	}

	/**
	 * Rounds the x, y, z and w values of this vector to the nearest integer value.
	 * @returns {Vector4}
	 */
	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		this.w = Math.round(this.w);

		return this;
	}

	/**
	 * Returns a new Vector4 with the same x, y, z and w values as this one.
	 * @returns {Vector4}
	 */
	clone() {
		return new Vector4(this.x, this.y, this.z, this.w);
	}

	/**
	 * Copies the values of the passed Vector4's x, y, z and w properties to this Vector4.
	 * @param {Vector4} v
	 * @returns {Vector4}
	 */
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = (v.w !== undefined) ? v.w : 1;

		return this;
	}

	* [Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
		yield this.w;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Vector4.prototype.isVector4 = true;

export { Vector4 };