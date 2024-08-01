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
					const { KHR_texture_basisu } = params.extensions;

					if (KHR_texture_basisu) {
						sourceIndex = KHR_texture_basisu.source;
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

				if (isTextureData) {
					const { image, mipmaps, type, format, minFilter, magFilter, generateMipmaps, encoding, premultiplyAlpha } = images[sourceIndex];

					texture.image = image;
					texture.mipmaps = mipmaps;
					texture.type = type;
					texture.format = format;
					texture.minFilter = minFilter;
					texture.magFilter = magFilter;
					texture.generateMipmaps = generateMipmaps;
					texture.encoding = encoding;
					texture.premultiplyAlpha = premultiplyAlpha;
				} else {
					texture.image = images[sourceIndex];
				}

				texture.version++;
				texture.name = textureName || texture.image.__name || `texture_${index}`;
				texture.flipY = false;

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

	texture.magFilter = WEBGL_FILTERS[magFilter] || TEXTURE_FILTER.LINEAR;
	texture.minFilter = WEBGL_FILTERS[minFilter] || TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;
	texture.wrapS = WEBGL_WRAPPINGS[wrapS] || TEXTURE_WRAP.REPEAT;
	texture.wrapT = WEBGL_WRAPPINGS[wrapT] || TEXTURE_WRAP.REPEAT;
}