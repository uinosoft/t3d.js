import { Color3 } from '../../math/Color3.js';

/**
 * Exp2 fog.
 */
class FogExp2 {

	/**
	 * @param {number} [color=0x000000] - The color of the fog.
	 * @param {number} [density=0.00025] - The density of the exp2 fog.
	 */
	constructor(color = 0x000000, density = 0.00025) {
		/**
		 * The color of the fog.
		 * @type {Color3}
		 * @default Color3(0x000000)
		 */
		this.color = new Color3(color);

		/**
		 * The density of the exp2 fog.
		 * @type {number}
		 * @default 0.00025
		 */
		this.density = density;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
FogExp2.prototype.isFogExp2 = true;

export { FogExp2 };