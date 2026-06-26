import {
	PIXEL_FORMAT,
	PIXEL_TYPE,
	TEXTURE_FILTER,
	TEXEL_ENCODING_TYPE
} from 't3d';

/**
 * DDS Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/MSFT_texture_dds
 */
export class MSFT_texture_dds {

	static loadTextureData(url, ddsLoader) {
		return new Promise((resolve, reject) => {
			ddsLoader.load(url, textureData => {
				const { mipmaps, width, height, format, mipmapCount, isCubemap } = textureData;

				if (isCubemap) {
					reject(new Error('MSFT_texture_dds: Cubemap DDS textures are not supported.'));
					return;
				}

				if (!format || !mipmaps.length) {
					reject(new Error('MSFT_texture_dds: Invalid DDS texture data.'));
					return;
				}

				const isCompressed = format !== PIXEL_FORMAT.RGBA;

				resolve({
					image: { data: mipmaps[0].data, width, height, isCompressed },
					mipmaps,
					type: PIXEL_TYPE.UNSIGNED_BYTE,
					format,
					minFilter: mipmapCount === 1 ? TEXTURE_FILTER.LINEAR : TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR,
					magFilter: TEXTURE_FILTER.LINEAR,
					generateMipmaps: false,
					encoding: TEXEL_ENCODING_TYPE.LINEAR,
					premultiplyAlpha: false
				});
			}, undefined, reject);
		});
	}

}