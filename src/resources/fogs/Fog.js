import { Color3 } from '../../math/Color3.js';

/**
 * Linear fog.
 */
class Fog {

	/**
	 * @param {number} [color=0x000000] - The color of the fog.
	 * @param {number} [near=1] - The near clip of the fog.
	 * @param {number} [far=1000] - The far clip of the fog.
	 */
	constructor(color = 0x000000, near = 1, far = 1000) {
		/**
		 * The color of the fog.
		 * @type {Color3}
		 * @default Color3(0x000000)
		 */
		this.color = new Color3(color);

		/**
		 * The near clip of the fog.
		 * @type {number}
		 * @default 1
		 */
		this.near = near;

		/**
		 * The far clip of the fog.
		 * @type {number}
		 * @default 1000
		 */
		this.far = far;
	}

}

/**
 * @readonly
 * @type {boolean}
 * @default true
 */
Fog.prototype.isFog = true;

export { Fog };