import { Light } from '../Light.js';
import { Color3 } from '../../math/Color3.js';

/**
 * A light source positioned directly above the scene, with color fading from the sky color to the ground color.
 * This light cannot be used to cast shadows.
 * @memberof t3d
 * @extends t3d.Light
 */
class HemisphereLight extends Light {

	/**
	 * @param {Number} [skyColor=0xffffff] - Hexadecimal color of the sky.
	 * @param {Number} [groundColor=0xffffff] - Hexadecimal color of the ground.
	 * @param {Number} [intensity=1] - numeric value of the light's strength/intensity.
	 */
	constructor(skyColor, groundColor, intensity) {
		super(skyColor, intensity);

		/**
		 * Color of the ground.
		 * @type {t3d.Color3}
     	 * @default t3d.Color3(0xffffff)
		 */
		this.groundColor = new Color3(groundColor !== undefined ? groundColor : 0xffffff);
	}

	copy(source) {
		super.copy(source);

		this.groundColor.copy(source.groundColor);
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
HemisphereLight.prototype.isHemisphereLight = true;

export { HemisphereLight };