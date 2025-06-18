import { PointLightShadow } from './PointLightShadow.js';
import { Light } from '../Light.js';

/**
 * A light that gets emitted from a single point in all directions.
 * A common use case for this is to replicate the light emitted from a bare lightbulb.
 * This light can cast shadows - see {@link PointLightShadow} page for details.
 * @extends Light
 */
class PointLight extends Light {

	/**
	 * @param {number} [color=0xffffff]
	 * @param {number} [intensity=1]
	 * @param {number} [distance=200]
	 * @param {number} [decay=1]
	 */
	constructor(color, intensity, distance, decay) {
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
		 * A {@link PointLightShadow} used to calculate shadows for this light.
		 * @type {PointLightShadow}
		 * @default PointLightShadow()
		 */
		this.shadow = new PointLightShadow();
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
PointLight.prototype.isPointLight = true;

export { PointLight };