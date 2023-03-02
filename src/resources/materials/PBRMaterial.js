import { Material } from './Material.js';
import { MATERIAL_TYPE } from '../../const.js';
import { Vector2 } from '../../math/Vector2.js';

/**
 * A standard physically based material, using Metallic-Roughness workflow.
 * Physically based rendering (PBR) has recently become the standard in many 3D applications, such as Unity, Unreal and 3D Studio Max.
 * This approach differs from older approaches in that instead of using approximations for the way in which light interacts with a surface, a physically correct model is used.
 * The idea is that, instead of tweaking materials to look good under specific lighting, a material can	be created that will react 'correctly' under all lighting scenarios.
 * @extends t3d.Material
 * @memberof t3d
 */
class PBRMaterial extends Material {

	/**
	 * Create a PBRMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.PBR;

		/**
		 * How rough the material appears. 0.0 means a smooth mirror reflection, 1.0 means fully diffuse.
		 * If roughnessMap is also provided, both values are multiplied.
		 * @type {Number}
		 * @default 0.5
		 */
		this.roughness = 0.5;

		/**
		 * How much the material is like a metal.
		 * Non-metallic materials such as wood or stone use 0.0, metallic use 1.0, with nothing (usually) in between.
		 * A value between 0.0 and 1.0 could be used for a rusty metal look. If metalnessMap is also provided, both values are multiplied.
		 * @type {Number}
		 * @default 0.5
		 */
		this.metalness = 0.5;

		/**
		 * The green channel of this texture is used to alter the roughness of the material.
		 * @type {t3d.Texture2D}
		 * @default null
		 */
		this.roughnessMap = null;

		/**
		 * The blue channel of this texture is used to alter the metalness of the material.
		 * @type {t3d.Texture2D}
		 * @default null
		 */
		this.metalnessMap = null;

		/**
		 * The strength of a clearcoat layer on a material surface.
		 * When clearcoatFactor is set to 0.0, it indicates that there is no clearcoat present.
		 * When it is set to 1.0, it indicates a very strong clearcoat that-
		 * will cause the reflection and refraction effects on the surface of the object to become more prominent.
		 * @type {Number}
		 * @default 0.0
		 */
		this.clearcoat = 0.0;

		/**
		 * A texture property that allows for the modulation of the strength or roughness of the clearcoat layer.
		 * @type {t3d.Texture2D}
		 * @default null
		 */
		this.clearcoatMap = null;

		/**
		 * The roughness of a clearcoat layer on a material surface.
		 * When clearcoatRoughness is set to 0.0, the clearcoat layer will appear perfectly smooth and reflective-
		 * and 0.0 represents a rough, textured clearcoat layer.
		 * Adjusting the clearcoatRoughness can achieve a wide range of effects and create more realistic materials.
		 * @type {Number}
		 * @default 0.0
		 */
		this.clearcoatRoughness = 0.0;

		/**
		 * A texture that will be applied to the clearcoat layer of a material to simulate the roughness of the surface.
		 * @type {t3d.Texture2D}
		 * @default null
		 */
		this.clearcoatRoughnessMap = null;

		/**
		 * Adjust the normal map's strength or intensity.
		 * Affect the amount of bumpiness or surface detail that is visible on the clearcoat layer.
		 * Typical ranges are 0-1.
		 * @type {Number}
		 * @default 1
		 */
		this.clearcoatNormalScale = new Vector2(1, 1);

		/**
		 * The texture that modulates the clearcoat layer's surface normal.
		 * @type {t3d.Texture2D}
		 * @default null
		 */
		this.clearcoatNormalMap = null;

		/**
		 * @default true
		 */
		this.acceptLight = true;
	}

	copy(source) {
		super.copy(source);

		this.roughness = source.roughness;
		this.metalness = source.metalness;
		this.roughnessMap = source.roughnessMap;
		this.metalnessMap = source.metalnessMap;

		this.clearcoat = source.clearcoat;
		this.clearcoatMap = source.clearcoatMap;
		this.clearcoatRoughness = source.clearcoatRoughness;
		this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
		this.clearcoatNormalScale.copy(source.clearcoatNormalScale);

		return this;
	}

}

export { PBRMaterial };