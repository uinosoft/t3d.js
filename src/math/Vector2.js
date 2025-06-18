import { MathUtils } from './MathUtils.js';

/**
 * The vector 2 class
 */
class Vector2 {

	/**
	 * @param {number} [x=0] - the x value of this vector.
	 * @param {number} [y=0] - the y value of this vector.
	 */
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Sets the x and y components of this vector.
	 * @param {number} x
	 * @param {number} y
	 * @returns {Vector2}
	 */
	set(x = 0, y = 0) {
		this.x = x;
		this.y = y;

		return this;
	}

	/**
	 * Sets this vector to be the vector linearly interpolated between v1 and v2
	 * where ratio is the percent distance along the line connecting the two vectors
	 * - ratio = 0 will be v1, and ratio = 1 will be v2.
	 * @param {Vector2} v1 - the starting Vector2.
	 * @param {Vector2} v2 - Vector2 to interpolate towards.
	 * @param {number} ratio - interpolation factor, typically in the closed interval [0, 1].
	 * @returns {Vector2}
	 */
	lerpVectors(v1, v2, ratio) {
		return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
	}

	/**
	 * If this vector's x or y value is greater than v's x or y value, replace that value with the corresponding min value.
	 * @param {Vector2} v
	 * @returns {Vector2}
	 */
	min(v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);

		return this;
	}

	/**
	 * If this vector's x or y value is less than v's x or y value, replace that value with the corresponding max value.
	 * @param {Vector2} v
	 * @returns {Vector2}
	 */
	max(v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);

		return this;
	}

	/**
	 * Computes the Euclidean length (straight-line length) from (0, 0) to (x, y).
	 * @returns {number}
	 */
	getLength() {
		return Math.sqrt(this.getLengthSquared());
	}

	/**
	 * Computes the square of the Euclidean length (straight-line length) from (0, 0) to (x, y).
	 * If you are comparing the lengths of vectors, you should compare the length squared instead
	 * as it is slightly more efficient to calculate.
	 * @returns {number}
	 */
	getLengthSquared() {
		return this.x * this.x + this.y * this.y;
	}

	/**
	 * Converts this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but length 1.
	 * @param {number} [thickness=1]
	 * @returns {Vector2}
	 */
	normalize(thickness = 1) {
		const length = this.getLength() || 1;
		const invLength = thickness / length;

		this.x *= invLength;
		this.y *= invLength;

		return this;
	}

	/**
	 * Subtracts v from the vector.
	 * @param {Vector2} a
	 * @param {Vector2} target - the result vector2
	 * @returns {Vector2}
	 */
	subtract(a, target = new Vector2()) {
		return target.set(this.x - a.x, this.y - a.y);
	}

	/**
	 * Subtracts v from this vector.
	 * @param {Vector2} v
	 * @returns {Vector2}
	 */
	sub(v) {
		this.x -= v.x;
		this.y -= v.y;

		return this;
	}

	/**
	 * Copies the values of the passed Vector2's x and y properties to this Vector2.
	 * @param {Vector2} v
	 * @returns {Vector2}
	 */
	copy(v) {
		this.x = v.x;
		this.y = v.y;

		return this;
	}

	/**
	 * Sets this vector to a + b.
	 * @param {Vector2} a
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	addVectors(a, b) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;
	}

	/**
	 * Sets this vector to a - b.
	 * @param {Vector2} a
	 * @param {Vector2} b
	 * @returns {Vector2}
	 */
	subVectors(a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;
	}

	/**
	 * Multiplies this vector by scalar.
	 * @param {number} scalar
	 * @returns {Vector2}
	 */
	multiplyScalar(scalar) {
		this.x *= scalar;
		this.y *= scalar;

		return this;
	}

	/**
	 * Computes the squared distance from this vector to v. If you are just comparing the distance with
	 * another distance, you should compare the distance squared instead as it is slightly more efficient to calculate.
	 * @param {Vector2} v
	 * @returns {number}
	 */
	distanceToSquared(v) {
		const dx = this.x - v.x,
			dy = this.y - v.y;

		return dx * dx + dy * dy;
	}

	/**
	 * Computes the distance from this vector to v.
	 * @param {Vector2} v
	 * @returns {number}
	 */
	distanceTo(v) {
		return Math.sqrt(this.distanceToSquared(v));
	}

	/**
	 * Sets this vector's x value to be array[ offset ] and y value to be array[ offset + 1 ].
	 * @param {number[]} array - the source array.
	 * @param {number} [offset=0] - offset into the array.
	 * @param {boolean} [denormalize=false] - if true, denormalize the values, and array should be a typed array.
	 * @returns {Vector2}
	 */
	fromArray(array, offset = 0, denormalize = false) {
		let x = array[offset], y = array[offset + 1];

		if (denormalize) {
			x = MathUtils.denormalize(x, array);
			y = MathUtils.denormalize(y, array);
		}

		this.x = x;
		this.y = y;

		return this;
	}

	/**
	 * Sets this array[ offset ] value to be vector's x and array[ offset + 1 ] to be vector's y.
	 * @param {number[]} [array] - the target array.
	 * @param {number} [offset=0] - offset into the array.
	 * @param {boolean} [normalize=false] - if true, normalize the values, and array should be a typed array.
	 * @returns {number[]}
	 */
	toArray(array = [], offset = 0, normalize = false) {
		let x = this.x, y = this.y;

		if (normalize) {
			x = MathUtils.normalize(x, array);
			y = MathUtils.normalize(y, array);
		}

		array[offset] = x;
		array[offset + 1] = y;

		return array;
	}

	/**
	 * Adds v to this vector.
	 * @param {Vector2} v
	 * @returns {Vector2}
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;

		return this;
	}

	/**
	 * Computes the angle in radians of this vector with respect to the positive x-axis.
	 * @returns {number}
	 */
	angle() {
		// computes the angle in radians with respect to the positive x-axis

		// let angle = Math.atan2(this.y, this.x);
		// if (angle < 0) angle += 2 * Math.PI;
		// return angle;

		return Math.atan2(-this.y, -this.x) + Math.PI;
	}

	/**
	 * Inverts this vector - i.e. sets x = -x, y = -y.
	 * @returns {Vector2}
	 */
	negate() {
		this.x = -this.x;
		this.y = -this.y;

		return this;
	}

	/**
	 * Calculate the dot product of this vector and v.
	 * @param {Vector2} a
	 * @returns {number}
	 */
	dot(a) {
		return this.x * a.x + this.y * a.y;
	}

	/**
	 * Checks for strict equality of this vector and v.
	 * @param {Vector2} v
	 * @returns {boolean}
	 */
	equals(v) {
		return ((v.x === this.x) && (v.y === this.y));
	}

	/**
	 * Returns a new Vector2 with the same x and y values as this one.
	 * @returns {Vector2}
	 */
	clone() {
		return new Vector2(this.x, this.y);
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Vector2.prototype.isVector2 = true;

export { Vector2 };