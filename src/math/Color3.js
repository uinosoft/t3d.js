/**
 * Color3 Class.
 * @memberof t3d
 */
class Color3 {

	/**
	 * @param {Number} r - (optional) If arguments g and b are defined, the red component of the color.
	 * 						If they are not defined, it can be a hexadecimal triplet (recommended).
	 * @param {Number} g - (optional) If it is defined, the green component of the color.
	 * @param {Number} b - (optional) If it is defined, the blue component of the color.
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
     * @param {t3d.Color3} c1 - the starting Color.
     * @param {t3d.Color3} c2 - Color to interpolate towards.
     * @param {Number} ratio - interpolation factor, typically in the closed interval [0, 1].
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
     * @param {t3d.Color3} c - color to converge on.
     * @param {Number} ratio - interpolation factor in the closed interval [0, 1].
     */
	lerp(c, ratio) {
		this.lerpColors(this, c, ratio);
	}

	/**
     * Returns a new Color with the same r, g and b values as this one.
	 * @return {t3d.Color3}
     */
	clone() {
		return new Color3(this.r, this.g, this.b);
	}

	/**
	 * Copies the r, g and b parameters from v in to this color.
     * @param {t3d.Color3} v
	 * @return {t3d.Color3}
     */
	copy(v) {
		this.r = v.r;
		this.g = v.g;
		this.b = v.b;

		return this;
	}

	/**
     * Set from hex.
	 * @param {Number} hex - hexadecimal triplet format.
	 * @return {t3d.Color3}
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
	 * @return {Number}
     */
	getHex() {
		return clamp(this.r * 255, 0, 255) << 16 ^ clamp(this.g * 255, 0, 255) << 8 ^ clamp(this.b * 255, 0, 255) << 0;
	}

	/**
     * Sets this color from RGB values.
	 * @param {Number} r - Red channel value between 0.0 and 1.0.
	 * @param {Number} g - Green channel value between 0.0 and 1.0.
	 * @param {Number} b - Blue channel value between 0.0 and 1.0.
	 * @return {t3d.Color3}
     */
	setRGB(r, g, b) {
		this.r = r;
		this.g = g;
		this.b = b;

		return this;
	}

	/**
     * Set from HSL.
	 * @param {Number} h - hue value between 0.0 and 1.0
	 * @param {Number} s - saturation value between 0.0 and 1.0
	 * @param {Number} l - lightness value between 0.0 and 1.0
	 * @return {t3d.Color3}
     */
	setHSL(h, s, l) {
		// h,s,l ranges are in 0.0 - 1.0
		h = euclideanModulo(h, 1);
		s = Math.max(0, Math.min(1, s));
		l = Math.max(0, Math.min(1, l));

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
	 * @return {t3d.Color3}
	 */
	convertSRGBToLinear() {
		this.r = SRGBToLinear(this.r);
		this.g = SRGBToLinear(this.g);
		this.b = SRGBToLinear(this.b);
		return this;
	}

	/**
	 * Converts this color from linear space to sRGB space.
	 * @return {t3d.Color3}
	 */
	convertLinearToSRGB() {
		this.r = LinearToSRGB(this.r);
		this.g = LinearToSRGB(this.g);
		this.b = LinearToSRGB(this.b);
		return this;
	}

	/**
	 * Sets this color's components based on an array formatted like [ r, g, b ].
     * @param {Number[]} array - Array of floats in the form [ r, g, b ].
	 * @param {Number} [offset=0] - An offset into the array.
	 * @return {t3d.Color3}
     */
	fromArray(array, offset = 0) {
		this.r = array[offset];
		this.g = array[offset + 1];
		this.b = array[offset + 2];

		return this;
	}

	/**
	 * Returns an array of the form [ r, g, b ].
     * @param {Number[]} [array] - An array to store the color to.
	 * @param {Number} [offset=0] - An offset into the array.
	 * @return {Number[]}
     */
	toArray(array = [], offset = 0) {
		array[offset] = this.r;
		array[offset + 1] = this.g;
		array[offset + 2] = this.b;

		return array;
	}

}

function euclideanModulo(n, m) {
	return ((n % m) + m) % m;
}

function hue2rgb(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
	return p;
}

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function SRGBToLinear(c) {
	return (c < 0.04045) ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}

function LinearToSRGB(c) {
	return (c < 0.0031308) ? c * 12.92 : 1.055 * (Math.pow(c, 0.41666)) - 0.055;
}

export { Color3 };