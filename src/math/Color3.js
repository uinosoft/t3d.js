import { MathUtils } from './MathUtils.js';

/**
 * Color3 Class.
 */
class Color3 {

	/**
	 * @param {number} r - (optional) If arguments g and b are defined, the red component of the color.
	 * 						If they are not defined, it can be a hexadecimal triplet (recommended).
	 * @param {number} g - (optional) If it is defined, the green component of the color.
	 * @param {number} b - (optional) If it is defined, the blue component of the color.
	 */
	constructor(r, g, b) {
		this.r = 0;
		this.g = 0;
		this.b = 0;

		if (g === undefined && b === undefined) {
			return this.setHex(r);
		}

		this.setRGB(r, g, b);
	}

	/**
	 * Sets this color to be the color linearly interpolated
	 * between color1 and color2 where ratio is the percent distance along the line connecting the two colors
	 * - ratio = 0 will be color1, and ratio = 1 will be color2.
	 * @param {Color3} c1 - the starting Color.
	 * @param {Color3} c2 - Color to interpolate towards.
	 * @param {number} ratio - interpolation factor, typically in the closed interval [0, 1].
	 */
	lerpColors(c1, c2, ratio) {
		this.r = ratio * (c2.r - c1.r) + c1.r;
		this.g = ratio * (c2.g - c1.g) + c1.g;
		this.b = ratio * (c2.b - c1.b) + c1.b;
	}

	/**
	 * Linearly interpolates this color's RGB values toward the RGB values of the passed argument.
	 * The ratio argument can be thought of as the ratio between the two colors,
	 * where 0.0 is this color and 1.0 is the first argument.
	 * @param {Color3} c - color to converge on.
	 * @param {number} ratio - interpolation factor in the closed interval [0, 1].
	 */
	lerp(c, ratio) {
		this.lerpColors(this, c, ratio);
	}

	/**
	 * Returns a new Color with the same r, g and b values as this one.
	 * @returns {Color3}
	 */
	clone() {
		return new Color3(this.r, this.g, this.b);
	}

	/**
	 * Copies the r, g and b parameters from v in to this color.
	 * @param {Color3} v
	 * @returns {Color3}
	 */
	copy(v) {
		this.r = v.r;
		this.g = v.g;
		this.b = v.b;

		return this;
	}

	/**
	 * Set from hex.
	 * @param {number} hex - hexadecimal triplet format.
	 * @returns {Color3}
	 */
	setHex(hex) {
		hex = Math.floor(hex);

		this.r = (hex >> 16 & 255) / 255;
		this.g = (hex >> 8 & 255) / 255;
		this.b = (hex & 255) / 255;

		return this;
	}

	/**
	 * Returns the hexadecimal value of this color.
	 * @returns {number}
	 */
	getHex() {
		return MathUtils.clamp(this.r * 255, 0, 255) << 16 ^ MathUtils.clamp(this.g * 255, 0, 255) << 8 ^ MathUtils.clamp(this.b * 255, 0, 255) << 0;
	}

	/**
	 * Sets this color from RGB values.
	 * @param {number} r - Red channel value between 0.0 and 1.0.
	 * @param {number} g - Green channel value between 0.0 and 1.0.
	 * @param {number} b - Blue channel value between 0.0 and 1.0.
	 * @returns {Color3}
	 */
	setRGB(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;

		return this;
	}

	/**
	 * Set from HSL.
	 * @param {number} h - hue value between 0.0 and 1.0
	 * @param {number} s - saturation value between 0.0 and 1.0
	 * @param {number} l - lightness value between 0.0 and 1.0
	 * @returns {Color3}
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
	 * Converts this color from sRGB space to linear space.
	 * @returns {Color3}
	 */
	convertSRGBToLinear() {
		this.r = SRGBToLinear(this.r);
		this.g = SRGBToLinear(this.g);
		this.b = SRGBToLinear(this.b);
		return this;
	}

	/**
	 * Converts this color from linear space to sRGB space.
	 * @returns {Color3}
	 */
	convertLinearToSRGB() {
		this.r = LinearToSRGB(this.r);
		this.g = LinearToSRGB(this.g);
		this.b = LinearToSRGB(this.b);
		return this;
	}

	/**
	 * Sets this color's components based on an array formatted like [ r, g, b ].
	 * @param {number[]} array - Array of floats in the form [ r, g, b ].
	 * @param {number} [offset=0] - An offset into the array.
	 * @param {boolean} [denormalize=false] - if true, denormalize the values, and array should be a typed array.
	 * @returns {Color3}
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
	 * Returns an array of the form [ r, g, b ].
	 * @param {number[]} [array] - An array to store the color to.
	 * @param {number} [offset=0] - An offset into the array.
	 * @param {boolean} [normalize=false] - if true, normalize the values, and array should be a typed array.
	 * @returns {number[]}
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