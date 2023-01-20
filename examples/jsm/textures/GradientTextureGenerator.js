import { Texture2D, TEXTURE_FILTER } from 't3d';

// TODO Optimize: Avoid canvas creation, use Data buffer instead.
class GradientTextureGenerator {

	constructor(width = 256, height = 1) {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');

		const texture = new Texture2D();
		texture.magFilter = texture.minFilter = TEXTURE_FILTER.LINEAR;
		texture.generateMipmaps = false;
		texture.image = canvas;

		this._canvas = canvas;
		this._context = context;
		this._texture = texture;
	}

	gradient(gradientData) {
		const width = this._canvas.width;
		const height = this._canvas.height;
		const context = this._context;
		const texture = this._texture;

		const gradient = context.createLinearGradient(0, 0, width, 0);
		for (let i in gradientData) {
			gradient.addColorStop(+i, gradientData[i]);
		}
		context.fillStyle = gradient;
		context.fillRect(0, 0, width, height);

		texture.version++;

		return this;
	}

	getTexture() {
		return this._texture;
	}

}

export { GradientTextureGenerator };