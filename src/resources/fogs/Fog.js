import { Color3 } from '../../math/Color3.js';

/**
 * Linear fog.
 * @memberof t3d
 */
class Fog {

	/**
	 * @param {Number} [color=0x000000] - The color of the fog.
	 * @param {Number} [near=1] - The near clip of the fog.
	 * @param {Number} [far=1000] - The far clip of the fog.
	 */
	constructor(color = 0x000000, near = 1, far = 1000) {
		/**
		 * The color of the fog.
		 * @type {t3d.Color3}
		 * @default t3d.Color3(0x000000)
		 */
		this.color = new Color3(color);

		/**
		 * The near clip of the fog.
		 * @type {Number}
		 * @default 1
		 */
		this.near = near;

		/**
		 * The far clip of the fog.
		 * @type {Number}
		 * @default 1000
		 */
		this.far = far;
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
Fog.prototype.isFog = true;

export { Fog };