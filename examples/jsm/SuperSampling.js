/**
 * Super Sampling
 */

import {
	Matrix4,
	RenderTarget2D,
	ShaderPostPass,
	TEXTURE_FILTER
} from 't3d';
import { TAAShader } from './shaders/TAAShader.js';

class SuperSampling {

	constructor(width, height, samplingSize = 30) {
		this._samplingSize = samplingSize;

		const haltonSequence = [[0.5, 0.5]]; // first center

		for (let i = 0; i < this._samplingSize - 1; i++) {
			haltonSequence.push([
				halton(i, 2), halton(i, 3)
			]);
		}

		this._haltonSequence = haltonSequence;

		const prevFrame = new RenderTarget2D(width, height);
		prevFrame.texture.minFilter = TEXTURE_FILTER.LINEAR;
		prevFrame.texture.magFilter = TEXTURE_FILTER.LINEAR;
		prevFrame.texture.generateMipmaps = false;

		this._prevFrame = prevFrame;

		const output = new RenderTarget2D(width, height);
		output.texture.minFilter = TEXTURE_FILTER.LINEAR;
		output.texture.magFilter = TEXTURE_FILTER.LINEAR;
		output.texture.generateMipmaps = false;

		this._output = output;

		this._taaPass = new ShaderPostPass(TAAShader);
		this._taaPass.material.depthWrite = false;
		this._taaPass.material.depthTest = false;

		this._frame = 0;
	}

	resize(width, height) {
		this._prevFrame.resize(width, height);
		this._output.resize(width, height);
	}

	start() {
		this._frame = 0;
	}

	finished() {
		return this._frame >= this._samplingSize;
	}

	frame() {
		return this._frame;
	}

	/**
	 * Jitter camera projectionMatrix
	 * @param {Camera} camera
	 * @param {Number} width screen width
	 * @param {Number} height screen height
	 */
	jitterProjection(camera, width, height) {
		const offset = this._haltonSequence[this._frame];

		if (!offset) {
			console.error('SuperSampling: try to jitter camera after finished!', this._frame, this._haltonSequence.length);
		}

		translationMat.elements[12] = (offset[0] * 2.0 - 1.0) / width;
		translationMat.elements[13] = (offset[1] * 2.0 - 1.0) / height;

		camera.projectionMatrix.premultiply(translationMat);
	}

	/**
	 * @param {ThinRenderer} renderer
	 * @param {TextureBase} texture input texture
	 * @param {TextureBase} velocityTexture velocity texture
	 * @param {TextureBase} depthTexture depth texture
	 * @param {Boolean} [still=true]
	 * @return {TextureBase} output texture
	 */
	sample(renderer, texture, velocityTexture, depthTexture, still) {
		velocityTexture = (velocityTexture !== undefined) ? velocityTexture : null;
		still = (still !== undefined) ? still : true;

		const first = this._frame === 0;

		this._taaPass.uniforms['currTex'] = texture;
		this._taaPass.uniforms['prevTex'] = this._prevFrame.texture;
		this._taaPass.uniforms['velocityTex'] = velocityTexture;
		this._taaPass.uniforms['depthTex'] = depthTexture;
		this._taaPass.uniforms['texelSize'][0] = 1 / this._prevFrame.width;
		this._taaPass.uniforms['texelSize'][1] = 1 / this._prevFrame.height;
		this._taaPass.uniforms['still'] = !!still;
		this._taaPass.uniforms['stillBlending'] = first ? 0 : 0.9;
		this._taaPass.uniforms['motionBlending'] = first ? 0 : 0.2;

		renderer.setRenderTarget(this._output);

		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, true, true);

		this._taaPass.render(renderer);

		const temp = this._prevFrame;
		this._prevFrame = this._output;
		this._output = temp;

		this._frame++;

		return this._prevFrame.texture;
	}

	/**
	 * @return {TextureBase} output texture
	 */
	output() {
		return this._prevFrame.texture;
	}

}

const translationMat = new Matrix4();

// https://en.wikipedia.org/wiki/Halton_sequence halton sequence.
function halton(index, base) {
	let result = 0;
	let f = 1 / base;
	let i = index;
	while (i > 0) {
		result = result + f * (i % base);
		i = Math.floor(i / base);
		f = f / base;
	}
	return result;
}

export { SuperSampling };