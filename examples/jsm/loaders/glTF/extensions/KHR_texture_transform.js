/**
 * KHR_texture_transform extension
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export class KHR_texture_transform {

	static handleMaterialMap(material, mapType, textureDef) {
		if (!textureDef.extensions) return;

		const extDef = textureDef.extensions.KHR_texture_transform;

		if (!extDef) return;

		let offsetX = 0, offsetY = 0, repeatX = 1, repeatY = 1, rotation = 0;

		if (extDef.offset !== undefined) {
			offsetX = extDef.offset[0];
			offsetY = extDef.offset[1];
		}

		if (extDef.rotation !== undefined) {
			rotation = extDef.rotation;
		}

		if (extDef.scale !== undefined) {
			repeatX = extDef.scale[0];
			repeatY = extDef.scale[1];
		}

		const matrix = material[mapType + 'Transform'];
		if (matrix) {
			matrix.setUvTransform(offsetX, offsetY, repeatX, repeatY, rotation, 0, 0);
		}

		// If texCoord is present, it overrides the texture's texCoord
		if (extDef.texCoord !== undefined) {
			material[mapType + 'Coord'] = extDef.texCoord;
		}
	}

}