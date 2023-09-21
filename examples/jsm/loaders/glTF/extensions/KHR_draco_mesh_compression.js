import { ATTRIBUTES, ACCESSOR_COMPONENT_TYPES } from '../Constants.js';

/**
 * KHR_draco_mesh_compression extension
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
export class KHR_draco_mesh_compression {

	static getGeometry(params, bufferViews, attributes, accessors, dracoLoader) {
		const { bufferView: bufferViewIndex, attributes: gltfAttributeMap } = params;

		if (!dracoLoader) {
			throw new Error('GLTFLoader: No DRACOLoader instance provided.');
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

		return new Promise(function(resolve) {
			dracoLoader.decodeDracoFile(bufferView, function(geometry) {
				for (const attributeName in geometry.attributes) {
					const attribute = geometry.attributes[attributeName];
					const normalized = attributeNormalizedMap[attributeName];

					if (normalized !== undefined) attribute.normalized = normalized;
				}

				resolve(geometry);
			}, attributeMap, attributeTypeMap);
		});
	}

}