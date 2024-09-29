import { SpotLightShadow } from './SpotLightShadow.js';
import { Light } from '../Light.js';

/**
 * This light gets emitted from a single point in one direction, along a cone that increases in size the further from the light it gets.
 * This light can cast shadows - see the {@link t3d.SpotLightShadow} page for details.
 * @memberof t3d
 * @extends t3d.Light
 */
class SpotLight extends Light {

	/**
	 * @param {Number} [color=0xffffff]
	 * @param {Number} [intensity=1]
	 * @param {Number} [distance=200]
	 * @param {Number} [angle=Math.PI/6]
	 * @param {Number} [penumbra=0]
	 * @param {Number} [decay=1]
	 */
	constructor(color, intensity, distance, angle, penumbra, decay) {
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
		 * Percent of the spotlight cone that is attenuated due to penumbra.
		 * Takes values between zero and 1.
		 * @type {Number}
		 * @default 0
		 */
		this.penumbra = (penumbra !== undefined) ? penumbra : 0;

		/**
		 * Maximum extent of the spotlight, in radians, from its direction.
		 * Should be no more than Math.PI/2.
		 * @type {Number}
		 * @default Math.PI/6
		 */
		this.angle = (angle !== undefined) ? angle : Math.PI / 6;

		/**
		 * A {@link t3d.SpotLightShadow} used to calculate shadows for this light.
		 * @type {t3d.SpotLightShadow}
		 * @default t3d.SpotLightShadow()
		 */
		this.shadow = new SpotLightShadow();
	}

	set power(power) {
		// ref: equation (17) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		// compute the light's luminous power (in lumens) from its intensity (in candela)
		// by convention for a spotlight, luminous power (lm) = π * luminous intensity (cd)
		this.intensity = power / Math.PI;
	}

	get power() {
		return this.intensity * Math.PI;
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
SpotLight.prototype.isSpotLight = true;

export { SpotLight };