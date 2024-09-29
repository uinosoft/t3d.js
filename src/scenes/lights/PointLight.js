import { PointLightShadow } from './PointLightShadow.js';
import { Light } from '../Light.js';

/**
 * A light that gets emitted from a single point in all directions.
 * A common use case for this is to replicate the light emitted from a bare lightbulb.
 * This light can cast shadows - see {@link t3d.PointLightShadow} page for details.
 * @memberof t3d
 * @extends t3d.Light
 */
class PointLight extends Light {

	/**
	 * @param {Number} [color=0xffffff]
	 * @param {Number} [intensity=1]
	 * @param {Number} [distance=200]
	 * @param {Number} [decay=1]
	 */
	constructor(color, intensity, distance, decay) {
		super(color, intensity);

		/**
		 * The amount the light dims along the distance of the light.
		 * @type {Number}
		 * @default 1
		 */
		this.decay = (decay !== undefined) ? decay : 1;

		/**
		 * The distance from the light where the intensity is 0.
		 * @type {Number}
		 * @default 200
		 */
		this.distance = (distance !== undefined) ? distance : 200;

		/**
		 * A {@link t3d.PointLightShadow} used to calculate shadows for this light.
		 * @type {t3d.PointLightShadow}
		 * @default t3d.PointLightShadow()
		 */
		this.shadow = new PointLightShadow();
	}

	set power(value) {
		// ref: equation (17) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		// compute the light's luminous power (in lumens) from its intensity (in candela)
		// for an isotropic light source, luminous power (lm) = 4 π * luminous intensity (cd)
		this.intensity = value / (Math.PI * 4);
	}

	get power() {
		return this.intensity * Math.PI * 4;
	}

	copy(source) {
		super.copy(source);

		this.shadow.copy(source.shadow);

		return this;
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
PointLight.prototype.isPointLight = true;

export { PointLight };