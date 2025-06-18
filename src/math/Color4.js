import { MathUtils } from './MathUtils.js';

/**
 * A Color4 instance is represented by RGBA components.
 */
class Color4 {

	/**
	 * Constructs a new four-component color.
	 * @param {number} [r=0] - The red value.
	 * @param {number} [g=0] - The green value.
	 * @param {number} [b=0] - The blue value.
	 * @param {number} [a=1] - The alpha value.
	 */
	constructor(r = 0, g = 0, b = 0, a = 1) {
		/**
		 * The red component.
		 * @type {number}
		 * @default 0
		 */
		this.r = r;

		/**
		 * The green component.
		 * @type {number}
		 * @default 0
		 */
		this.g = g;

		/**
		 * The blue component.
		 * @type {number}
		 * @default 0
		 */
		this.b = b;

		/**
		 * The alpha component.
		 * @type {number}
		 * @default 1
		 */
		this.a = a;
	}

	/**
	 * Sets this color from RGBA values.
	 * @param {number} r - Red channel value between 0.0 and 1.0.
	 * @param {number} g - Green channel value between 0.0 and 1.0.
	 * @param {number} b - Blue channel value between 0.0 and 1.0.
	 * @param {number} a - Alpha channel value between 0.0 and 1.0.
	 * @returns {Color4} A reference to this color.
	 */
	setRGBA(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;

		return this;
	}

	/**
	 * Returns a new color with copied values from this instance.
	 * @returns {Color4} A clone of this instance.
	 */
	clone() {
		return new Color4(this.r, this.g, this.b, this.a);
	}

	/**
	 * Copies the values of the given color to this instance.
	 * @param {Color4} color - The color to copy.
	 * @returns {Color4} A clone of this instance.
	 */
	copy(color) {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		this.a = color.a;

		return this;
	}

	/**
	 * Sets this color's RGBA components from the given array.
	 * @param {number[]} array - An array holding the RGBA values.
	 * @param {number} [offset=0] - The offset into the array.
	 * @param {boolean} [denormalize=false] - If true, denormalize the values, and array should be a typed array.
	 * @returns {Color4} A reference to this color.
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
	 * Writes the RGBA components of this color to the given array. If no array is provided,
	 * the method returns a new instance.
	 * @param {number[]} [array=[]] - The target array holding the color components.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @param {boolean} [normalize=false] - If true, normalize the values, and array should be a typed array.
	 * @returns {number[]} The color components.
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

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Color4.prototype.isColor4 = true;

export { Color4 };