import { Light } from '../Light.js';
import { Color3 } from '../../math/Color3.js';

/**
 * A light source positioned directly above the scene, with color fading from the sky color to the ground color.
 * This light cannot be used to cast shadows.
 * @extends Light
 */
class HemisphereLight extends Light {

	/**
	 * @param {number} [skyColor=0xffffff] - Hexadecimal color of the sky.
	 * @param {number} [groundColor=0xffffff] - Hexadecimal color of the ground.
	 * @param {number} [intensity=1] - numeric value of the light's strength/intensity.
	 */
	constructor(skyColor, groundColor, intensity) {
		super(skyColor, intensity);

		/**
		 * Color of the ground.
		 * @type {Color3}
		 * @default Color3(0xffffff)
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
 * @type {boolean}
 * @default true
 */
HemisphereLight.prototype.isHemisphereLight = true;

export { HemisphereLight };