/**
 * KHR_texture_transform extension
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
export class KHR_texture_transform {

	static transform(matrix, transform) {
		let offsetX = 0, offsetY = 0, repeatX = 1, repeatY = 1, rotation = 0;

		if (transform.offset !== undefined) {
			offsetX = transform.offset[0];
			offsetY = transform.offset[1];
		}

		if (transform.rotation !== undefined) {
			rotation = transform.rotation;
		}

		if (transform.scale !== undefined) {
			repeatX = transform.scale[0];
			repeatY = transform.scale[1];
		}

		matrix.setUvTransform(offsetX, offsetY, repeatX, repeatY, rotation, 0, 0);

		if (transform.texCoord !== undefined) {
			console.warn('Custom UV sets in KHR_texture_transform extension not yet supported.');
		}
	}

}