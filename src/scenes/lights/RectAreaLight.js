import { Light } from '../Light.js';

/**
 * RectAreaLight emits light uniformly across the face a rectangular plane.
 * This light can be used to simulate light sources such as bright windows or strip lighting.
 * Important Notes:
 * - There is no shadow support.
 * - Only PBRMaterial are supported.
 * - You have to set LTC1 and LTC2 in RectAreaLight before using it.
 * @memberof t3d
 * @extends t3d.Light
 */
class RectAreaLight extends Light {

	/**
	 * @param {Number} [color=0xffffff]
	 * @param {Number} [intensity=1]
	 * @param {Number} [width=10]
	 * @param {Number} [height=10]
	 */
	constructor(color, intensity, width = 10, height = 10) {
		super(color, intensity);

		/**
		 * The width of the light.
		 * @type {Number}
		 * @default 10
		 */
		this.width = width;

		/**
		 * The height of the light.
		 * @type {Number}
		 * @default 10
		 */
		this.height = height;
	}

	/**
	 * The light's power.
	 * Power is the luminous power of the light measured in lumens (lm).
	 * Changing the power will also change the light's intensity.
	 * @type {Number}
	 */
	get power() {
		// compute the light's luminous power (in lumens) from its intensity (in nits)
		return this.intensity * this.width * this.height * Math.PI;
	}

	set power(power) {
		// set the light's intensity (in nits) from the desired luminous power (in lumens)
		this.intensity = power / (this.width * this.height * Math.PI);
	}

	copy(source) {
		super.copy(source);

		this.width = source.width;
		this.height = source.height;

		return this;
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
RectAreaLight.prototype.isRectAreaLight = true;

/**
 * The first LTC (Linearly Transformed Cosines).
 * If you want to use RectAreaLight, you have to set this before using it.
 * @type {Null|t3d.Texture2D}
 */
RectAreaLight.LTC1 = null;

/**
 * The second LTC (Linearly Transformed Cosines).
 * If you want to use RectAreaLight, you have to set this before using it.
 * @type {Null|t3d.Texture2D}
 */
RectAreaLight.LTC2 = null;

export { RectAreaLight };