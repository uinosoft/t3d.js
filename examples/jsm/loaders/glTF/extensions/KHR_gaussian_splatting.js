import { ATTRIBUTES, ACCESSOR_COMPONENT_TYPES } from '../Constants.js';
/**
 * KHR_gaussian_splatting extension
 * https://github.com/CesiumGS/glTF/blob/draft-splat-spz/extensions/2.0/Khronos/KHR_gaussian_splatting
 */
export class KHR_gaussian_splatting {

	static getGeometry(params, bufferViews, attributes, accessors, spzLoader) {
		const bufferViewIndex = params.extensions.KHR_gaussian_splatting_compression_spz_2.bufferView;
		const gltfAttributeMap = attributes;


		if (!spzLoader) {
			throw new Error('GLTFLoader: No SPZLoader instance provided.');
		}

		const attributeMap = {};

		for (const attributeSemantic in gltfAttributeMap) {
			const attributeName = ATTRIBUTES[attributeSemantic] === undefined ? attributeSemantic : ATTRIBUTES[attributeSemantic];
			attributeMap[attributeName] = gltfAttributeMap[attributeSemantic];
		}

		const attributeNormalizedMap = {};
		const attributeTypeMap = {};

		for (const attributeNameItem in attributes) {
			const attributeName = ATTRIBUTES[attributeNameItem] || attributeNameItem.toLowerCase();

			if (gltfAttributeMap[attributeNameItem] !== undefined) {
				const accessorDef = accessors[attributes[attributeNameItem]];
				const componentType = ACCESSOR_COMPONENT_TYPES[accessorDef.componentType];

				attributeTypeMap[attributeName] = componentType.name;
				attributeNormalizedMap[attributeName] = accessorDef.normalized === true;
			}
		}

		const bufferView = bufferViews[bufferViewIndex];

		return new Promise(async function(resolve, reject) {
			try {
				const bufferViewTypedArray = new Uint8Array(bufferView);
				const gcloud = await spzLoader(bufferViewTypedArray, {
					unpackOptions: { coordinateSystem: 'UNSPECIFIED' }
				});
				const splatBuffer = KHR_gaussian_splatting.convertInternalDataToSplat(gcloud.numPoints, gcloud.positions, gcloud.rotations, gcloud.scales, gcloud.alphas, gcloud.colors);
				splatBuffer._isSplatBuffer = true;
				resolve(splatBuffer);
			} catch (error) {
				reject(new Error('Failed to load SPZ: ' + error.message));
			}
		});
	}
	static convertInternalDataToSplat(vertexCount, positions, rotations, scales, alphas, colors) {
		const rgbaColors = new Uint8Array(vertexCount * 4);
		for (let i = 0; i < vertexCount; i++) {
			rgbaColors[i * 4 + 0] = colors[i * 3 + 0] * 255;
			rgbaColors[i * 4 + 1] = colors[i * 3 + 1] * 255;
			rgbaColors[i * 4 + 2] = colors[i * 3 + 2] * 255;
			rgbaColors[i * 4 + 3] = alphas[i] * 255;
		}

		return {
			vertexCount,
			positions,
			rotations,
			scales,
			colors: rgbaColors
		};
	}
}

