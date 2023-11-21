import { Texture2D, TEXTURE_FILTER } from 't3d';

class GradientTextureGenerator {

	constructor(width = 256) {
		const texture = new Texture2D();
		texture.image = { data: null, width: width, height: 1 };
		texture.magFilter = texture.minFilter = TEXTURE_FILTER.LINEAR;
		texture.generateMipmaps = false;
		this._texture = texture;
	}

	gradient(colorGradient) {
		const texture = this._texture;
		texture.image.data = colorGradient.getUint8Array(texture.image.width);
		texture.version++;
		return this;
	}

	getTexture() {
		return this._texture;
	}

}

export { GradientTextureGenerator };