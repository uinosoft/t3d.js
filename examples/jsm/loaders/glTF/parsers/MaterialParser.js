import {
	PBRMaterial,
	DRAW_SIDE,
	TEXEL_ENCODING_TYPE
} from 't3d';
import { ALPHA_MODES } from '../Constants.js';

export class MaterialParser {

	static parse(context, loader) {
		const { gltf, textures } = context;

		if (!gltf.materials) return;

		const transformExt = loader.extensions.get('KHR_texture_transform');

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
				name = ''
			} = gltf.materials[i];

			let material = null;

			const materialExtNames = loader.autoParseConfig.materials;

			// TODO: refactor invoke method
			for (let j = 0; j < materialExtNames.length; j++) {
				const extName = materialExtNames[j];

				const extParams = extensions[extName];
				const ext = loader.extensions.get(extName);

				if (extParams && ext && ext.getMaterial) {
					material = ext.getMaterial();
					break;
				}
			}

			material = material || new PBRMaterial();
			material.name = name;

			for (let j = 0; j < materialExtNames.length; j++) {
				const extName = materialExtNames[j];

				const extParams = extensions[extName];
				const ext = loader.extensions.get(extName);

				if (extParams && ext && ext.parseParams) {
					ext.parseParams(material, extParams, textures, transformExt);
				}
			}

			const { KHR_materials_unlit, KHR_materials_pbrSpecularGlossiness } = extensions;

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
						transformExt && transformExt.handleMaterialMap(material, 'diffuseMap', baseColorTexture);
					}
				}

				if (!KHR_materials_unlit && !KHR_materials_pbrSpecularGlossiness) {
					material.metalness = metallicFactor !== undefined ? metallicFactor : 1;
					material.roughness = roughnessFactor !== undefined ? roughnessFactor : 1;
					if (metallicRoughnessTexture) {
						material.metalnessMap = textures[metallicRoughnessTexture.index];
						material.roughnessMap = textures[metallicRoughnessTexture.index];
						// metallicRoughnessTexture transform not supported yet
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
					transformExt && transformExt.handleMaterialMap(material, 'emissiveMap', emissiveTexture);
				}
			}

			if (occlusionTexture) {
				material.aoMap = textures[occlusionTexture.index];
				material.aoMapCoord = occlusionTexture.texCoord || 0;
				if (occlusionTexture.strength !== undefined) {
					material.aoMapIntensity = occlusionTexture.strength;
				}
				if (material.aoMap) {
					transformExt && transformExt.handleMaterialMap(material, 'aoMap', occlusionTexture);
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

					// normal map transform not supported yet
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