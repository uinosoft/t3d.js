import { TEXEL_ENCODING_TYPE, PBR2Material } from 't3d';
import { KHR_texture_transform } from "./KHR_texture_transform.js";

/**
 * KHR_materials_pbrSpecularGlossiness extension
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_pbrSpecularGlossiness
 */
export class KHR_materials_pbrSpecularGlossiness {

	static getMaterial() {
		return new PBR2Material();
	}

	static parseParams(material, params, textures) {
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
			}
			parseTextureTransform(material, 'diffuseMap', diffuseTexture.extensions);
		}

		material.glossiness = glossinessFactor !== undefined ? glossinessFactor : 1.0;

		if (Array.isArray(specularFactor)) {
			material.specular.fromArray(specularFactor);
		}

		if (specularGlossinessTexture) {
			material.glossinessMap = textures[specularGlossinessTexture.index];
			material.specularMap = textures[specularGlossinessTexture.index];
			parseTextureTransform(material, 'glossinessMap', specularGlossinessTexture.extensions);
			parseTextureTransform(material, 'specularMap', specularGlossinessTexture.extensions);
		}
	}

}

function parseTextureTransform(material, key, extensions = {}) {
	const extension = extensions.KHR_texture_transform;
	if (extension) {
		material[key] = KHR_texture_transform.transform(material[key], extension);
	}
}