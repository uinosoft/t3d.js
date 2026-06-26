import {
	Texture2D,
	TEXTURE_FILTER,
	TEXTURE_WRAP
} from 't3d';
import { WEBGL_WRAPPINGS, WEBGL_FILTERS } from '../Constants.js';

export class TextureParser {

	static parse(context) {
		const { gltf, images } = context;

		if (!gltf.textures) return;

		const textureCache = new Map();

		return Promise.all(
			gltf.textures.map((params, index) => {
				const { sampler, source = 0, name: textureName } = params;

				let sourceIndex = source, isTextureData = false;

				if (params.extensions) {
					const { KHR_texture_basisu, MSFT_texture_dds } = params.extensions;

					if (KHR_texture_basisu) {
						sourceIndex = KHR_texture_basisu.source;
						isTextureData = true;
					} else if (MSFT_texture_dds) {
						sourceIndex = MSFT_texture_dds.source;
						isTextureData = true;
					} else if (Object.values(params.extensions).length && Object.values(params.extensions)[0].hasOwnProperty('source')) {
						sourceIndex = Object.values(params.extensions)[0].source;
					} else {
						console.warn('GLTFLoader: unknown texture extension');
					}
				}

				const cacheKey = sourceIndex + ':' + sampler;

				if (textureCache.has(cacheKey)) {
					return textureCache.get(cacheKey);
				}

				const texture = new Texture2D();
				const image = images[sourceIndex];

				if (image && image.__loadError) {
					throw image.__loadError;
				}

				if (isTextureData) {
					const { image: textureImage, mipmaps, type, format, minFilter, magFilter, generateMipmaps, encoding, premultiplyAlpha } = image;

					texture.image = textureImage;
					texture.mipmaps = mipmaps;
					texture.type = type;
					texture.format = format;
					texture.minFilter = minFilter;
					texture.magFilter = magFilter;
					texture.generateMipmaps = generateMipmaps;
					texture.encoding = encoding;
					texture.premultiplyAlpha = premultiplyAlpha;
				} else {
					texture.image = image;
				}

				texture.version++;
				texture.name = textureName || texture.image.__name || `texture_${index}`;
				texture.flipY = false;

				const { mimeType, uri = '' } = gltf.images[sourceIndex];
				texture.userData.mimeType = mimeType || getImageURIMimeType(uri);

				const samplers = gltf.samplers || {};
				parseSampler(texture, samplers[sampler]);

				textureCache.set(cacheKey, texture);

				return texture;
			})
		).then(textures => {
			context.textures = textures;
			textureCache.clear();
		});
	}

}

function parseSampler(texture, sampler = {}) {
	const { magFilter, minFilter, wrapS, wrapT } = sampler;

	texture.magFilter = WEBGL_FILTERS[magFilter] || texture.magFilter || TEXTURE_FILTER.LINEAR;
	texture.minFilter = WEBGL_FILTERS[minFilter] || texture.minFilter || TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;
	texture.wrapS = WEBGL_WRAPPINGS[wrapS] || TEXTURE_WRAP.REPEAT;
	texture.wrapT = WEBGL_WRAPPINGS[wrapT] || TEXTURE_WRAP.REPEAT;
}

// only for jpeg, png, webp
// because other should get mimeType from glTF image object
function getImageURIMimeType(uri) {
	if (uri.startsWith('data:image/')) { // early return for data URIs
		if (uri.startsWith('data:image/jpeg')) return 'image/jpeg';
		if (uri.startsWith('data:image/webp')) return 'image/webp';
		return 'image/png';
	} else {
		if (uri.search(/\.jpe?g($|\?)/i) > 0) return 'image/jpeg';
		if (uri.search(/\.webp($|\?)/i) > 0) return 'image/webp';
		if (uri.search(/\.dds($|\?)/i) > 0) return 'image/vnd-ms.dds';
		return 'image/png';
	}
}