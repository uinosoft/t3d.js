import { SpotLightShadow } from './SpotLightShadow.js';
import { Light } from '../Light.js';

/**
 * This light gets emitted from a single point in one direction, along a cone that increases in size the further from the light it gets.
 * This light can cast shadows - see the {@link SpotLightShadow} page for details.
 * @extends Light
 */
class SpotLight extends Light {

	/**
	 * @param {number} [color=0xffffff]
	 * @param {number} [intensity=1]
	 * @param {number} [distance=200]
	 * @param {number} [angle=Math.PI/6]
	 * @param {number} [penumbra=0]
	 * @param {number} [decay=1]
	 */
	constructor(color, intensity, distance, angle, penumbra, decay) {
		super(color, intensity);

		/**
		 * The amount the light dims along the distance of the light.
		 * @type {number}
		 * @default 1
		 */
		this.decay = (decay !== undefined) ? decay : 1;

		/**
		 * The distance from the light where the intensity is 0.
		 * @type {number}
		 * @default 200
		 */
		this.distance = (distance !== undefined) ? distance : 200;

		/**
		 * Percent of the spotlight cone that is attenuated due to penumbra.
		 * Takes values between zero and 1.
		 * @type {number}
		 * @default 0
		 */
		this.penumbra = (penumbra !== undefined) ? penumbra : 0;

		/**
		 * Maximum extent of the spotlight, in radians, from its direction.
		 * Should be no more than Math.PI/2.
		 * @type {number}
		 * @default Math.PI/6
		 */
		this.angle = (angle !== undefined) ? angle : Math.PI / 6;

		/**
		 * A {@link SpotLightShadow} used to calculate shadows for this light.
		 * @type {SpotLightShadow}
		 * @default SpotLightShadow()
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
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
SpotLight.prototype.isSpotLight = true;

export { SpotLight };