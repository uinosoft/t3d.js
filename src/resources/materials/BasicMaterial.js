import { Material } from './Material.js';
import { MATERIAL_TYPE } from '../../const.js';

/**
 * A material for drawing geometries in a simple shaded (flat or wireframe) way.
 * This material is not affected by lights.
 * @extends t3d.Material
 * @memberof t3d
 */
class BasicMaterial extends Material {

	/**
	 * Create a BasicMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.BASIC;
	}

}

export { BasicMaterial };