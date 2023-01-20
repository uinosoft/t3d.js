import {
	PBRMaterial,
	DRAW_SIDE,
	TEXEL_ENCODING_TYPE
} from 't3d';
import { KHR_materials_unlit as _KHR_materials_unlit } from '../extensions/KHR_materials_unlit.js';
import { KHR_materials_pbrSpecularGlossiness as _KHR_materials_pbrSpecularGlossiness } from '../extensions/KHR_materials_pbrSpecularGlossiness.js';
import { KHR_texture_transform } from '../extensions/KHR_texture_transform.js';
import { ALPHA_MODES } from "../Constants.js";

export class MaterialParser {

	static parse(context) {
		const { gltf, textures } = context;

		if (!gltf.materials) return;

		const materials = [];
		for (let i = 0; i < gltf.materials.length; i++) {
			const {
				extensions = {},
				pbrMetallicRoughness,
				normalTexture,
				occlusionTexture,
				emissiveTexture,
				emissiveFactor,
				alphaMode,
				alphaCutoff,
				doubleSided,
				name = ""
			} = gltf.materials[i];

			const { KHR_materials_unlit, KHR_materials_pbrSpecularGlossiness } = extensions;

			let material = null;
			if (KHR_materials_unlit) {
				material = _KHR_materials_unlit.getMaterial();
			} else if (KHR_materials_pbrSpecularGlossiness) {
				material = _KHR_materials_pbrSpecularGlossiness.getMaterial();
				_KHR_materials_pbrSpecularGlossiness.parseParams(material, KHR_materials_pbrSpecularGlossiness, textures);
			} else {
				material = new PBRMaterial();
			}

			material.name = name;

			if (pbrMetallicRoughness) {
				const { baseColorFactor, baseColorTexture, metallicFactor, roughnessFactor, metallicRoughnessTexture } = pbrMetallicRoughness;

				if (Array.isArray(baseColorFactor)) {
					material.diffuse.fromArray(baseColorFactor);
					material.opacity = (baseColorFactor[3] !== undefined) ? baseColorFactor[3] : 1;
				}

				if (baseColorTexture) {
					material.diffuseMap = textures[baseColorTexture.index];
					material.diffuseMapCoord = baseColorTexture.texCoord || 0;
					if (material.diffuseMap) {
						material.diffuseMap.encoding = TEXEL_ENCODING_TYPE.SRGB;
						parseTextureTransform(material, 'diffuseMap', baseColorTexture.extensions);
					}
				}

				if (!KHR_materials_unlit && !KHR_materials_pbrSpecularGlossiness) {
					material.metalness = metallicFactor !== undefined ? metallicFactor : 1;
					material.roughness = roughnessFactor !== undefined ? roughnessFactor : 1;
					if (metallicRoughnessTexture) {
						material.metalnessMap = textures[metallicRoughnessTexture.index];
						material.roughnessMap = textures[metallicRoughnessTexture.index];
						// parseTextureTransform(material, 'metalnessMap', metallicRoughnessTexture.extensions);
						// parseTextureTransform(material, 'roughnessMap', metallicRoughnessTexture.extensions);
					}
				}
			}

			if (emissiveFactor) {
				material.emissive.fromArray(emissiveFactor);
			}

			if (emissiveTexture) {
				material.emissiveMap = textures[emissiveTexture.index];
				material.emissiveMapCoord = emissiveTexture.texCoord || 0;
				if (material.emissiveMap) {
					material.emissiveMap.encoding = TEXEL_ENCODING_TYPE.SRGB;
					parseTextureTransform(material, 'emissiveMap', emissiveTexture.extensions);
				}
			}

			if (occlusionTexture) {
				material.aoMap = textures[occlusionTexture.index];
				material.aoMapCoord = occlusionTexture.texCoord || 0;
				if (occlusionTexture.strength !== undefined) {
					material.aoMapIntensity = occlusionTexture.strength;
				}
				if (material.aoMap) {
					parseTextureTransform(material, 'aoMap', occlusionTexture.extensions);
				}
			}

			if (!KHR_materials_unlit) {
				if (normalTexture) {
					material.normalMap = textures[normalTexture.index];

					material.normalScale.set(1, -1);
					if (normalTexture.scale !== undefined) {
						// fix flip y for normal map
						// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
						material.normalScale.set(normalTexture.scale, -normalTexture.scale);
					}

					if (material.normalMap) {
						// parseTextureTransform(material, 'normalMap', normalTexture.extensions);
					}
				}
			}

			material.side = doubleSided === true ? DRAW_SIDE.DOUBLE : DRAW_SIDE.FRONT;

			if (alphaMode === ALPHA_MODES.BLEND) {
				material.transparent = true;
			} else {
				material.transparent = false;

				if (alphaMode === ALPHA_MODES.MASK) {
					material.alphaTest = alphaCutoff !== undefined ? alphaCutoff : 0.5;
				}
			}

			materials[i] = material;
		}

		context.materials = materials;
	}

}

function parseTextureTransform(material, key, extensions = {}) {
	const extension = extensions.KHR_texture_transform;
	if (extension) {
		KHR_texture_transform.transform(material[key + 'Transform'], extension);
	}
}