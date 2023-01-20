import { Material } from './Material.js';
import { MATERIAL_TYPE } from '../../const.js';

/**
 * A material for non-shiny surfaces, without specular highlights.
 * The material uses a non-physically based Lambertian model for calculating reflectance.
 * This can simulate some surfaces (such as untreated wood or stone) well, but cannot simulate shiny surfaces with specular highlights (such as varnished wood).
 * @extends t3d.Material
 * @memberof t3d
 */
class LambertMaterial extends Material {

	/**
	 * Create a LambertMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.LAMBERT;

		/**
		 * @default true
		 */
		this.acceptLight = true;
	}

}

export { LambertMaterial };