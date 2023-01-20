import {
	Texture2D,
	TEXTURE_FILTER,
	TEXTURE_WRAP
} from 't3d';
import { WEBGL_WRAPPINGS, WEBGL_FILTERS } from "../Constants.js";

export class TextureParser {

	static parse(context) {
		const { gltf, images } = context;

		if (!gltf.textures) return;

		// TODO need to cache textures by source and samplers?

		return Promise.all(
			gltf.textures.map(({ sampler, source = 0, name: textureName }, index) => {
				const image = images[source];
				const texture = new Texture2D();
				texture.image = image;
				texture.version++;
				texture.name = textureName || image.__name || `texture_${index}`;
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