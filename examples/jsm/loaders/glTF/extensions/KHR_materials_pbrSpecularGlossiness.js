import { TEXEL_ENCODING_TYPE, PBR2Material } from 't3d';

/**
 * KHR_materials_pbrSpecularGlossiness extension
 * https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Archived/KHR_materials_pbrSpecularGlossiness/README.md
 */
export class KHR_materials_pbrSpecularGlossiness {

	static getMaterial() {
		return new PBR2Material();
	}

	static parseParams(material, params, textures, transformExt) {
		const { diffuseFactor, diffuseTexture, specularFactor, glossinessFactor, specularGlossinessTexture } = params;

		if (Array.isArray(diffuseFactor)) {
			material.diffuse.fromArray(diffuseFactor);
			material.opacity = diffuseFactor[3] || 1;
		}

		if (diffuseTexture) {
			material.diffuseMap = textures[diffuseTexture.index];
			material.diffuseMapCoord = diffuseTexture.texCoord || 0;
			if (material.diffuseMap) {
				material.diffuseMap.encoding = TEXEL_ENCODING_TYPE.SRGB;
				transformExt && transformExt.handleMaterialMap(material, 'diffuseMap', diffuseTexture);
			}
		}

		material.glossiness = glossinessFactor !== undefined ? glossinessFactor : 1.0;

		if (Array.isArray(specularFactor)) {
			material.specular.fromArray(specularFactor);
		}

		if (specularGlossinessTexture) {
			material.glossinessMap = textures[specularGlossinessTexture.index];
			material.specularMap = textures[specularGlossinessTexture.index];
			// specularGlossinessTexture transform not supported yet
		}
	}

}