/**
 * Super Sampling
 */

import {
	Matrix4,
	RenderTarget2D,
	ShaderPostPass,
	TEXTURE_FILTER
} from 't3d';
import { TAAShader } from "./shaders/TAAShader.js";

var SuperSampling = function(width, height, samplingSize) {
	this._samplingSize = samplingSize || 30;

	var haltonSequence = [[0.5, 0.5]]; // first center

	// https://en.wikipedia.org/wiki/Halton_sequence halton sequence.
	function halton(index, base) {
		var result = 0;
		var f = 1 / base;
		var i = index;
		while (i > 0) {
			result = result + f * (i % base);
			i = Math.floor(i / base);
			f = f / base;
		}
		return result;
	}

	for (var i = 0; i < this._samplingSize - 1; i++) {
		haltonSequence.push([
			halton(i, 2), halton(i, 3)
		]);
	}

	this._haltonSequence = haltonSequence;

	var prevFrame = new RenderTarget2D(width, height);
	prevFrame.texture.minFilter = TEXTURE_FILTER.LINEAR;
	prevFrame.texture.magFilter = TEXTURE_FILTER.LINEAR;
	prevFrame.texture.generateMipmaps = false;

	this._prevFrame = prevFrame;

	var output = new RenderTarget2D(width, height);
	output.texture.minFilter = TEXTURE_FILTER.LINEAR;
	output.texture.magFilter = TEXTURE_FILTER.LINEAR;
	output.texture.generateMipmaps = false;

	this._output = output;

	this._taaPass = new ShaderPostPass(TAAShader);
	this._taaPass.material.depthWrite = false;
	this._taaPass.material.depthTest = false;

	this._frame = 0;
}

SuperSampling.prototype = Object.assign(SuperSampling.prototype, {

	constructor: SuperSampling,

	resize: function(width, height) {
		this._prevFrame.resize(width, height);
		this._output.resize(width, height);
	},

	start: function() {
		this._frame = 0;
	},

	finished: function() {
		return this._frame >= this._samplingSize;
	},

	frame: function() {
		return this._frame;
	},

	/**
	 * Jitter camera projectionMatrix
	 * @param {t3d.Camera} camera
	 * @param {Number} width screen width
	 * @param {Number} height screen height
	 */
	jitterProjection: function(camera, width, height) {
		var offset = this._haltonSequence[this._frame];

		if (!offset) {
			console.error("SuperSampling: try to jitter camera after finished!", this._frame, this._haltonSequence.length);
		}

		var translationMat = new Matrix4();
		translationMat.elements[12] = (offset[0] * 2.0 - 1.0) / width;
		translationMat.elements[13] = (offset[1] * 2.0 - 1.0) / height;

		camera.projectionMatrix.premultiply(translationMat);
	},

	/**
	 * @param {t3d.Renderer} renderer
	 * @param {t3d.TextureBase} texture input texture
	 * @param {t3d.TextureBase} velocityTexture velocity texture
	 * @param {t3d.TextureBase} depthTexture depth texture
	 * @param {Boolean} [still=true]
	 * @return {t3d.TextureBase} output texture
	 */
	sample: function(renderer, texture, velocityTexture, depthTexture, still) {
		velocityTexture = (velocityTexture !== undefined) ? velocityTexture : null;
		still = (still !== undefined) ? still : true;

		var first = this._frame === 0;

		this._taaPass.uniforms["currTex"] = texture;
		this._taaPass.uniforms["prevTex"] = this._prevFrame.texture;
		this._taaPass.uniforms["velocityTex"] = velocityTexture;
		this._taaPass.uniforms["depthTex"] = depthTexture;
		this._taaPass.uniforms["texelSize"][0] = 1 / this._prevFrame.width;
		this._taaPass.uniforms["texelSize"][1] = 1 / this._prevFrame.height;
		this._taaPass.uniforms["still"] = !!still;
		this._taaPass.uniforms["stillBlending"] = first ? 0 : 0.9;
		this._taaPass.uniforms["motionBlending"] = first ? 0 : 0.2;

		renderer.renderPass.setRenderTarget(this._output);

		renderer.renderPass.setClearColor(0, 0, 0, 0);
		renderer.renderPass.clear(true, true, true);

		this._taaPass.render(renderer);

		var temp = this._prevFrame;
		this._prevFrame = this._output;
		this._output = temp;

		this._frame++;

		return this._prevFrame.texture;
	},

	/**
         * @return {t3d.TextureBase} output texture
         */
	output: function() {
		return this._prevFrame.texture;
	}

});

export { SuperSampling };