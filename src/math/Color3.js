import { MathUtils } from './MathUtils.js';

/**
 * A Color3 instance is represented by RGB components.
 */
class Color3 {

	/**
	 * Constructs a new three-component color.
	 * @param {number} [r] - The red component of the color. If `g` and `b` are not provided, it can be a hexadecimal triplet.
	 * @param {number} [g] - The green component.
	 * @param {number} [b] - The blue component.
	 */
	constructor(r, g, b) {
		/**
		 * The red component.
		 * @type {number}
		 * @default 0
		 */
		this.r = 0;

		/**
		 * The green component.
		 * @type {number}
		 * @default 0
		 */
		this.g = 0;

		/**
		 * The blue component.
		 * @type {number}
		 * @default 0
		 */
		this.b = 0;

		if (g === undefined && b === undefined) {
			this.setHex(r);
		} else {
			this.setRGB(r, g, b);
		}
	}

	/**
	 * Sets this color from a hexadecimal value.
	 * @param {number} hex - The hexadecimal value.
	 * @returns {Color3} A reference to this color.
	 */
	setHex(hex) {
		hex = Math.floor(hex);

		this.r = (hex >> 16 & 255) / 255;
		this.g = (hex >> 8 & 255) / 255;
		this.b = (hex & 255) / 255;

		return this;
	}

	/**
	 * Sets this color from RGB values.
	 * @param {number} r - Red channel value between 0.0 and 1.0.
	 * @param {number} g - Green channel value between 0.0 and 1.0.
	 * @param {number} b - Blue channel value between 0.0 and 1.0.
	 * @returns {Color3} A reference to this color.
	 */
	setRGB(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;

		return this;
	}

	/**
	 * Set this color from HSL values.
	 * @param {number} h - Hue value between 0.0 and 1.0.
	 * @param {number} s - Saturation value between 0.0 and 1.0.
	 * @param {number} l - Lightness value between 0.0 and 1.0.
	 * @returns {Color3} A reference to this color.
	 */
	setHSL(h, s, l) {
		// h,s,l ranges are in 0.0 - 1.0
		h = MathUtils.euclideanModulo(h, 1);
		s = MathUtils.clamp(s, 0, 1);
		l = MathUtils.clamp(l, 0, 1);

		if (s === 0) {
			this.r = this.g = this.b = l;
		} else {
			const p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
			const q = (2 * l) - p;

			this.r = hue2rgb(q, p, h + 1 / 3);
			this.g = hue2rgb(q, p, h);
			this.b = hue2rgb(q, p, h - 1 / 3);
		}

		return this;
	}

	/**
	 * Returns a new color with copied values from this instance.
	 * @returns {Color3} A clone of this instance.
	 */
	clone() {
		return new this.constructor(this.r, this.g, this.b);
	}

	/**
	 * Copies the values of the given color to this instance.
	 * @param {Color3} color - The color to copy.
	 * @returns {Color3} A reference to this color.
	 */
	copy(color) {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

		return this;
	}

	/**
	 * Converts this color from sRGB space to linear space.
	 * @returns {Color3} A reference to this color.
	 */
	convertSRGBToLinear() {
		this.r = SRGBToLinear(this.r);
		this.g = SRGBToLinear(this.g);
		this.b = SRGBToLinear(this.b);
		return this;
	}

	/**
	 * Converts this color from linear space to sRGB space.
	 * @returns {Color3} A reference to this color.
	 */
	convertLinearToSRGB() {
		this.r = LinearToSRGB(this.r);
		this.g = LinearToSRGB(this.g);
		this.b = LinearToSRGB(this.b);
		return this;
	}

	/**
	 * Returns the hexadecimal value of this color.
	 * @returns {number} The hexadecimal value.
	 */
	getHex() {
		return MathUtils.clamp(this.r * 255, 0, 255) << 16 ^ MathUtils.clamp(this.g * 255, 0, 255) << 8 ^ MathUtils.clamp(this.b * 255, 0, 255) << 0;
	}

	/**
	 * Linearly interpolates this color's RGB values toward the RGB values of the
	 * given color. The alpha argument can be thought of as the ratio between
	 * the two colors, where 0.0 is this color and 1.0 is the first argument.
	 * @param {Color3} color - The color to converge on.
	 * @param {number} alpha - The interpolation factor in the closed interval [0,1].
	 * @returns {Color3} A reference to this color.
	 */
	lerp(color, alpha) {
		return this.lerpColors(this, color, alpha);
	}

	/**
	 * Linearly interpolates between the given colors and stores the result in this instance.
	 * The alpha argument can be thought of as the ratio between the two colors, where 0.0
	 * is the first and 1.0 is the second color.
	 * @param {Color3} color1 - The first color.
	 * @param {Color3} color2 - The second color.
	 * @param {number} alpha - The interpolation factor in the closed interval [0,1].
	 * @returns {Color3} A reference to this color.
	 */
	lerpColors(color1, color2, alpha) {
		this.r = MathUtils.lerp(color1.r, color2.r, alpha);
		this.g = MathUtils.lerp(color1.g, color2.g, alpha);
		this.b = MathUtils.lerp(color1.b, color2.b, alpha);
		return this;
	}

	/**
	 * Sets this color's RGB components from the given array.
	 * @param {number[]} array - An array holding the RGB values.
	 * @param {number} [offset=0] - The offset into the array.
	 * @param {boolean} [denormalize=false] - If true, denormalize the values, and array should be a typed array.
	 * @returns {Color3} A reference to this color.
	 */
	fromArray(array, offset = 0, denormalize = false) {
		let r = array[offset], g = array[offset + 1], b = array[offset + 2];

		if (denormalize) {
			r = MathUtils.denormalize(r, array);
			g = MathUtils.denormalize(g, array);
			b = MathUtils.denormalize(b, array);
		}

		this.r = r;
		this.g = g;
		this.b = b;

		return this;
	}

	/**
	 * Writes the RGB components of this color to the given array. If no array is provided,
	 * the method returns a new instance.
	 * @param {number[]} [array=[]] - The target array holding the color components.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @param {boolean} [normalize=false] - If true, normalize the values, and array should be a typed array.
	 * @returns {number[]} The color components.
	 */
	toArray(array = [], offset = 0, normalize = false) {
		let r = this.r, g = this.g, b = this.b;

		if (normalize) {
			r = MathUtils.normalize(r, array);
			g = MathUtils.normalize(g, array);
			b = MathUtils.normalize(b, array);
		}

		array[offset] = r;
		array[offset + 1] = g;
		array[offset + 2] = b;

		return array;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Color3.prototype.isColor3 = true;

function hue2rgb(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
	return p;
}

function SRGBToLinear(c) {
	return (c < 0.04045) ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

function LinearToSRGB(c) {
	return (c < 0.0031308) ? c * 12.92 : 1.055 * (Math.pow(c, 0.41666)) - 0.055;
}

export { Color3 };