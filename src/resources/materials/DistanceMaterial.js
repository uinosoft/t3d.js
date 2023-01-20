import { Material } from './Material.js';
import { MATERIAL_TYPE } from '../../const.js';

/**
 * A material for drawing geometry by distance.
 * @extends t3d.Material
 * @memberof t3d
 */
class DistanceMaterial extends Material {

	/**
	 * Create a DistanceMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.DISTANCE;
	}

}

export { DistanceMaterial };