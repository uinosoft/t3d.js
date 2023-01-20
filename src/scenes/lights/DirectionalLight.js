import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Light } from '../Light.js';

/**
 * A light that gets emitted in a specific direction.
 * This light will behave as though it is infinitely far away and the rays produced from it are all parallel.
 * The common use case for this is to simulate daylight; the sun is far enough away that its position can be considered to be infinite, and all light rays coming from it are parallel.
 * This light can cast shadows - see the {@link t3d.DirectionalLightShadow} page for details.
 * @memberof t3d
 * @extends t3d.Light
 */
class DirectionalLight extends Light {

	/**
	 * @param {Number} [color=0xffffff]
	 * @param {Number} [intensity=1]
	 */
	constructor(color, intensity) {
		super(color, intensity);

		/**
		 * A {@link t3d.DirectionalLightShadow} used to calculate shadows for this light.
		 * @type {t3d.DirectionalLightShadow}
		 * @default t3d.DirectionalLightShadow()
		 */
		this.shadow = new DirectionalLightShadow();
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
DirectionalLight.prototype.isDirectionalLight = true;

export { DirectionalLight };