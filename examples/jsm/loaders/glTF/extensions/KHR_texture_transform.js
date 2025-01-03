/**
 * KHR_texture_transform extension
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export class KHR_texture_transform {

	static handleMaterialMap(material, mapType, textureDef) {
		if (!textureDef.extensions) return;

		const extDef = textureDef.extensions.KHR_texture_transform;

		if (!extDef) return;

		// If texCoord is present, it overrides the texture's texCoord
		if (extDef.texCoord !== undefined) {
			material[mapType + 'Coord'] = extDef.texCoord;
		}

		const transform = material[mapType + 'Transform'];

		if (!transform) return;

		if (extDef.offset !== undefined) {
			transform.offset.fromArray(extDef.offset);
		}

		if (extDef.rotation !== undefined) {
			transform.rotation = extDef.rotation;
		}

		if (extDef.scale !== undefined) {
			transform.scale.fromArray(extDef.scale);
		}

		transform.updateMatrix();
	}

}