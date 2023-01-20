import { Color3 } from '../../math/Color3.js';

/**
 * Exp2 fog.
 * @memberof t3d
 */
class FogExp2 {

	/**
	 * @param {Number} [color=0x000000] - The color of the fog.
	 * @param {Number} [density=0.00025] - The density of the exp2 fog.
	 */
	constructor(color = 0x000000, density = 0.00025) {
		/**
		 * The color of the fog.
		 * @type {t3d.Color3}
		 * @default t3d.Color3(0x000000)
		 */
		this.color = new Color3(color);

		/**
		 * The density of the exp2 fog.
		 * @type {Number}
		 * @default 0.00025
		 */
		this.density = density;
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
FogExp2.prototype.isFogExp2 = true;

export { FogExp2 };