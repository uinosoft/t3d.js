import {
	Texture2D,
	TEXTURE_FILTER,
	TEXTURE_WRAP,
} from 't3d';
import { WEBGL_WRAPPINGS, WEBGL_FILTERS } from '../Constants.js';

export class TextureParser {

	static parse(context) {
		const { gltf, images } = context;

		if (!gltf.textures) return;

		// TODO need to cache textures by source and samplers?

		return Promise.all(
			gltf.textures.map((params, index) => {
				const { sampler, source = 0, name: textureName } = params;

				const texture = new Texture2D();

				if (params.extensions) {
					const { KHR_texture_basisu } = params.extensions;
					if (KHR_texture_basisu) {
						const transcodeResult = images[KHR_texture_basisu.source];

						const { image, mipmaps, type, format, minFilter, magFilter, generateMipmaps, encoding, premultiplyAlpha } = transcodeResult;
						texture.image = image;
						texture.mipmaps = mipmaps;
						texture.type = type;
						texture.format = format;
						texture.minFilter = minFilter;
						texture.magFilter = magFilter;
						texture.generateMipmaps = generateMipmaps;
						texture.encoding = encoding;
						texture.premultiplyAlpha = premultiplyAlpha;
					} else if (Object.values(params.extensions).length && Object.values(params.extensions)[0].hasOwnProperty('source')) {
						texture.image = images[Object.values(params.extensions)[0].source];
					} else {
						console.error('GLTFLoader: Couldn\'t load texture');
						return null;
					}
				} else {
					texture.image = images[source];
				}

				texture.version++;
				texture.name = textureName || texture.image.__name || `texture_${index}`;
				texture.flipY = false;

				const samplers = gltf.samplers || {};
				parseSampler(texture, samplers[sampler]);

				return texture;
			})
		).then(textures => {
			context.textures = textures;
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