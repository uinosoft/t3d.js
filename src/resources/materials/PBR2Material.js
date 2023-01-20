import { Material } from './Material.js';
import { MATERIAL_TYPE } from '../../const.js';
import { Color3 } from '../../math/Color3.js';

/**
 * A standard physically based material, using Specular-Glossiness workflow.
 * Physically based rendering (PBR) has recently become the standard in many 3D applications, such as Unity, Unreal and 3D Studio Max.
 * This approach differs from older approaches in that instead of using approximations for the way in which light interacts with a surface, a physically correct model is used.
 * The idea is that, instead of tweaking materials to look good under specific lighting, a material can	be created that will react 'correctly' under all lighting scenarios.
 * @extends t3d.Material
 * @memberof t3d
 */
class PBR2Material extends Material {

	/**
	 * Create a PBR2Material.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.PBR2;

		/**
		 * Specular color of the material.
		 * @type {Number}
		 * @default 0.5
		 */
		this.specular = new Color3(0x111111);

		/**
		 * Glossiness of the material.
		 * @type {Number}
		 * @default 0.5
		 */
		this.glossiness = 0.5;

		/**
		 * The RGB channel of this texture is used to alter the specular of the material.
		 * @type {t3d.Texture2D}
		 * @default null
		 */
		this.specularMap = null;

		/**
		 * The A channel of this texture is used to alter the glossiness of the material.
		 * @type {t3d.Texture2D}
		 * @default null
		 */
		this.glossinessMap = null;

		/**
		 * @default true
		 */
		this.acceptLight = true;
	}

	copy(source) {
		super.copy(source);

		this.specular = source.specular;
		this.glossiness = source.glossiness;
		this.specularMap = source.specularMap;
		this.glossinessMap = source.glossinessMap;

		return this;
	}

}

export { PBR2Material };