import { Light } from '../Light.js';

/**
 * This light globally illuminates all objects in the scene equally.
 * This light cannot be used to cast shadows as it does not have a direction.
 * @extends Light
 */
class AmbientLight extends Light {

	/**
	 * @param {number} [color=0xffffff]
	 * @param {number} [intensity=1]
	 */
	constructor(color, intensity) {
		super(color, intensity);
	}

}

/**
 * @readonly
 * @type {boolean}
 * @default true
 */
AmbientLight.prototype.isAmbientLight = true;

export { AmbientLight };
