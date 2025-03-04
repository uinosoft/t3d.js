import { MathUtils } from './MathUtils.js';

/**
 * Color4 class
 */
class Color4 {

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} a
	 */
	constructor(r = 0, g = 0, b = 0, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	/**
	 * Set color from RGBA values
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 * @param {number} a
	 * @returns {Color4}
	 */
	setRGBA(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		return this;
	}

	/**
	 * Copies the r, g, b and a parameters from c in to this color.
	 * @param {Color4} c
	 * @returns {Color4}
	 */
	copy(c) {
		this.r = c.r;
		this.g = c.g;
		this.b = c.b;
		this.a = c.a;

		return this;
	}

	/**
	 * Returns a new Color4 with the same r, g, b and a values as this one.
	 * @returns {Color4}
	 */
	clone() {
		return new Color4(this.r, this.g, this.b, this.a);
	}

	/**
	 * Sets this color's components based on an array formatted like [ r, g, b, a ].
	 * @param {number[]} array - Array of floats in the form [ r, g, b, a ].
	 * @param {number} [offset=0] - An offset into the array.
	 * @param {boolean} [denormalize=false] - if true, denormalize the values, and array should be a typed array.
	 * @returns {Color4}
	 */
	fromArray(array, offset = 0, denormalize = false) {
		let r = array[offset], g = array[offset + 1], b = array[offset + 2], a = array[offset + 3];

		if (denormalize) {
			r = MathUtils.denormalize(r, array);
			g = MathUtils.denormalize(g, array);
			b = MathUtils.denormalize(b, array);
			a = MathUtils.denormalize(a, array);
		}

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		return this;
	}

	/**
	 * Returns an array of the form [ r, g, b, a ].
	 * @param {number[]} [array] - An array to store the color to.
	 * @param {number} [offset=0] - An offset into the array.
	 * @param {boolean} [normalize=false] - if true, normalize the values, and array should be a typed array.
	 * @returns {number[]}
	 */
	toArray(array = [], offset = 0, normalize = false) {
		let r = this.r, g = this.g, b = this.b, a = this.a;

		if (normalize) {
			r = MathUtils.normalize(r, array);
			g = MathUtils.normalize(g, array);
			b = MathUtils.normalize(b, array);
			a = MathUtils.normalize(a, array);
		}

		array[offset] = r;
		array[offset + 1] = g;
		array[offset + 2] = b;
		array[offset + 3] = a;

		return array;
	}

}

export { Color4 };