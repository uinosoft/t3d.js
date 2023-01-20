import { Material } from './Material.js';
import { MATERIAL_TYPE } from '../../const.js';

/**
 * A material for drawing geometry by depth.
 * Depth is based off of the camera near and far plane. White is nearest, black is farthest.
 * @extends t3d.Material
 * @memberof t3d
 */
class DepthMaterial extends Material {

	/**
	 * Create a DepthMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.DEPTH;

		/**
		 * Encoding for depth packing.
		 * @type {Boolean}
		 * @default false
		 */
		this.packToRGBA = false;
	}

}

export { DepthMaterial };