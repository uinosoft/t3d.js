import { Material } from './Material.js';
import { MATERIAL_TYPE } from '../../const.js';
import { Color3 } from '../../math/Color3.js';

/**
 * A material for shiny surfaces with specular highlights.
 * The material uses a non-physically based Blinn-Phong model for calculating reflectance.
 * Unlike the Lambertian model used in the {@link LambertMaterial} this can simulate shiny surfaces with specular highlights (such as varnished wood).
 * @extends Material
 */
class PhongMaterial extends Material {

	/**
	 * Create a PhongMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.PHONG;

		/**
		 * How shiny the {@link PhongMaterial#specular} highlight is; a higher value gives a sharper highlight.
		 * @type {number}
		 * @default 30
		 */
		this.shininess = 30;

		/**
		 * Specular color of the material.
		 * This defines how shiny the material is and the color of its shine.
		 * @type {Color3}
		 * @default Color(0x111111)
		 */
		this.specular = new Color3(0x111111);

		/**
		 * The specular map value affects both how much the specular surface highlight contributes and how much of the environment map affects the surface.
		 * @type {Texture2D}
		 * @default null
		 */
		this.specularMap = null;

		/**
		 * @default true
		 */
		this.acceptLight = true;
	}

	copy(source) {
		super.copy(source);

		this.shininess = source.shininess;
		this.specular.copy(source.specular);
		this.specularMap = source.specularMap;

		return this;
	}

}

export { PhongMaterial };