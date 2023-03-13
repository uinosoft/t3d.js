import { PBRMaterial, Vector2 } from 't3d';
import { KHR_texture_transform } from "./KHR_texture_transform.js";
/**
 * Clearcoat Materials Extension
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
export class KHR_materials_clearcoat {

	static getMaterial() {
		return new PBRMaterial();
	}

	static parseParams(material, extension, textures) {
		const { clearcoatFactor, clearcoatTexture, clearcoatRoughnessFactor, clearcoatRoughnessTexture, clearcoatNormalTexture } = extension;

		if (clearcoatFactor) {
			material.clearcoat = clearcoatFactor;
		}
		if (clearcoatTexture) {
			material.clearcoatMap = textures[clearcoatTexture.index];
			parseTextureTransform(material, 'clearcoatMap', clearcoatTexture.extensions);
		}
		if (clearcoatRoughnessFactor) {
			material.clearcoatRoughness = clearcoatRoughnessFactor;
		}
		if (clearcoatRoughnessTexture) {
			material.clearcoatRoughnessMap = textures[clearcoatRoughnessTexture.index];
			parseTextureTransform(material, 'clearcoatRoughnessMap', clearcoatRoughnessTexture.extensions);
		}
		if (clearcoatNormalTexture) {
			material.clearcoatNormalMap = textures[clearcoatNormalTexture.index];
			parseTextureTransform(material, 'clearcoatNormalMap', clearcoatNormalTexture.extensions);
			if (clearcoatNormalTexture.scale) {
				const scale = clearcoatNormalTexture.scale;
				material.clearcoatNormalScale = new Vector2(scale, scale);
			}
		}
	}

}

function parseTextureTransform(material, key, extensions = {}) {
	const extension = extensions.KHR_texture_transform;
	if (extension) {
		material[key] = KHR_texture_transform.transform(material[key], extension);
	}
}