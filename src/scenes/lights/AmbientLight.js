import { Light } from '../Light.js';

/**
 * This light globally illuminates all objects in the scene equally.
 * This light cannot be used to cast shadows as it does not have a direction.
 * @memberof t3d
 * @extends t3d.Light
 */
class AmbientLight extends Light {

	/**
	 * @param {Number} [color=0xffffff]
	 * @param {Number} [intensity=1]
	 */
	constructor(color, intensity) {
		super(color, intensity);
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
AmbientLight.prototype.isAmbientLight = true;

export { AmbientLight };
