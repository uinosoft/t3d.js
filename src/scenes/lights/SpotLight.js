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