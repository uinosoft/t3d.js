/**
 * BasisU Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
 */
export class KHR_texture_basisu {

	static loadTextureData(url, ktx2Loader) {
		return new Promise((resolve, reject) => {
			ktx2Loader.load(url, resolve, undefined, reject);
		});
	}

}