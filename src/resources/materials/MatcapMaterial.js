import { Material } from './Material.js';
import { MATERIAL_TYPE } from '../../const.js';

/**
 * MatcapMaterial is defined by a MatCap (or Lit Sphere) texture, which encodes the material color and shading.
 * MatcapMaterial does not respond to lights since the matcap image file encodes baked lighting.
 * It will cast a shadow onto an object that receives shadows (and shadow clipping works), but it will not self-shadow or receive shadows.
 * @extends t3d.Material
 * @memberof t3d
 */
class MatcapMaterial extends Material {

	/**
	 * Create a MatcapMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.MATCAP;

		/**
		 * The matcap map.
		 * @type {t3d.Texture2D}
		 * @default null
		 */
		this.matcap = null;
	}

	copy(source) {
		super.copy(source);

		this.matcap = source.matcap;

		return this;
	}

}

export { MatcapMaterial };