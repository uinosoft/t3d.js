import { ATTRIBUTES } from "../Constants.js";

/**
 * KHR_draco_mesh_compression extension
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
export class KHR_draco_mesh_compression {

	static getGeometry(params, bufferViews, dracoLoader) {
		const { bufferView: bufferViewIndex, attributes: gltfAttributeMap } = params;

		if (!dracoLoader) {
			throw new Error('GLTFLoader: No DRACOLoader instance provided.');
		}

		const attributeMap = {};

		for (let attributeSemantic in gltfAttributeMap) {
			const attributeName = ATTRIBUTES[attributeSemantic] === undefined ? attributeSemantic : ATTRIBUTES[attributeSemantic];
			attributeMap[attributeName] = gltfAttributeMap[attributeSemantic];
		}

		const bufferView = bufferViews[bufferViewIndex];

		return new Promise(function(resolve) {
			dracoLoader.decodeDracoFile(bufferView, resolve, attributeMap);
		});
	}

}