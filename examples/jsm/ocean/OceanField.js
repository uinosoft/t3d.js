// Reference: https://stackblitz.com/edit/fft-2d?file=ocean%2Focean-field.ts

import { RenderTarget2D, TEXTURE_FILTER, ShaderPostPass, ATTACHMENT } from 't3d';
import { HkShader } from './shaders/HkShader.js';
import { FFT2HShader } from './shaders/FFT2HShader.js';
import { FFT2VShader } from './shaders/FFT2VShader.js';
import { PostFFT2Shader } from './shaders/PostFFT2Shader.js';
import { createFloat4Texture } from './Utils.js';

export class OceanField {

	constructor(renderer, h0Textures, butterflyTexture, params) {
		this.spectrumTextures;
		this.pingPongTextures;
		this.ifftTextures;
		this._dataMaps;
		this.spectrumRenderTarget;
		this.pingPongRenderTarget;
		this.postIfft2RenderTarget;
		this.hkPass;
		this.fft2hPass;
		this.fft2vPass;
		this.postfft2Pass;

		this.renderer = renderer;
		this.h0Textures = h0Textures;
		this.butterflyTexture = butterflyTexture;
		this.params = params;

		this.createTextures();
		this.createRenderTargets();
		this.createFFTPasses();
	}

	get dataMaps() {
		return this._dataMaps;
	}

	update(time) {
		this.generateSpectrum(time);
		this.ifft2();
		this.postIfft2();
	}

	dispose() {
		this.hkPass.dispose();
		this.fft2hPass.dispose();
		this.fft2vPass.dispose();
		this.postfft2Pass.dispose();
		this.spectrumRenderTarget.dispose();
		this.pingPongRenderTarget.dispose();
		this.postIfft2RenderTarget.dispose();
		this.h0Textures.forEach(texture => texture.dispose());
		this.spectrumTextures.forEach(texture => texture.dispose());
		this.pingPongTextures.forEach(texture => texture.dispose());
		this.ifftTextures && this.ifftTextures.forEach(texture => texture.dispose());
		this._dataMaps.forEach(texture => texture.dispose());
	}

	createFFTPasses() {
		this.hkPass = new ShaderPostPass(HkShader);
		this.hkPass.material.uniforms.resolution = this.params.resolution;
		for (let i = 0; i < this.params.cascades.length; i++) {
			this.hkPass.material.uniforms.sizes[i] = this.params.cascades[i].size;
		}

		this.fft2hPass = new ShaderPostPass(FFT2HShader);
		this.fft2vPass = new ShaderPostPass(FFT2VShader);

		this.postfft2Pass = new ShaderPostPass(PostFFT2Shader);
		this.postfft2Pass.material.uniforms['N2'] = this.params.resolution * this.params.resolution;
	}

	createTextures() {
		this.spectrumTextures = Array.from({ length: 6 }, () =>
			createFloat4Texture(this.params.resolution, this.params.resolution)
		);

		this.pingPongTextures = Array.from({ length: 6 }, () =>
			createFloat4Texture(this.params.resolution, this.params.resolution)
		);

		this._dataMaps = Array.from({ length: 6 }, () =>
			createFloat4Texture(this.params.resolution, this.params.resolution, TEXTURE_FILTER.LINEAR)
		);
	}

	createRenderTargets() {
		this.spectrumRenderTarget = new RenderTarget2D(this.params.resolution, this.params.resolution);
		for (let slot = 0; slot < this.spectrumTextures.length; slot++) {
			this.spectrumRenderTarget.attach(this.spectrumTextures[slot], ATTACHMENT.COLOR_ATTACHMENT0 + slot);
		}

		this.pingPongRenderTarget = new RenderTarget2D(this.params.resolution, this.params.resolution);
		for (let slot = 0; slot < this.pingPongTextures.length; slot++) {
			this.pingPongRenderTarget.attach(this.pingPongTextures[slot], ATTACHMENT.COLOR_ATTACHMENT0 + slot);
		}

		this.postIfft2RenderTarget = new RenderTarget2D(this.params.resolution, this.params.resolution);
		for (let slot = 0; slot < this._dataMaps.length; slot++) {
			this.postIfft2RenderTarget.attach(this._dataMaps[slot], ATTACHMENT.COLOR_ATTACHMENT0 + slot);
		}
	}

	generateSpectrum(time) {
		this.hkPass.uniforms.h0Texture0 = this.h0Textures[0];
		this.hkPass.uniforms.h0Texture1 = this.h0Textures[1];
		this.hkPass.uniforms.h0Texture2 = this.h0Textures[2];
		this.hkPass.uniforms.t = time;
		this.renderer.setRenderTarget(this.spectrumRenderTarget);
		this.hkPass.render(this.renderer);
	}

	ifft2() {
		const phases = Math.log2(this.params.resolution);
		const pingPongTextures = [this.spectrumTextures, this.pingPongTextures];
		const pingPongRenderTargets = [this.pingPongRenderTarget, this.spectrumRenderTarget];

		// horizontal ifft
		let pingPong = 0;
		this.fft2hPass.material.uniforms['butterfly'] = this.butterflyTexture;

		for (let phase = 0; phase < phases; phase++) {
			this.renderer.setRenderTarget(pingPongRenderTargets[pingPong]);
			this.fft2hPass.uniforms.phase = phase;
			this.fft2hPass.uniforms.spectrum0 = pingPongTextures[pingPong][0];
			this.fft2hPass.uniforms.spectrum1 = pingPongTextures[pingPong][1];
			this.fft2hPass.uniforms.spectrum2 = pingPongTextures[pingPong][2];
			this.fft2hPass.uniforms.spectrum3 = pingPongTextures[pingPong][3];
			this.fft2hPass.uniforms.spectrum4 = pingPongTextures[pingPong][4];
			this.fft2hPass.uniforms.spectrum5 = pingPongTextures[pingPong][5];
			this.fft2hPass.render(this.renderer);
			pingPong = (pingPong + 1) % 2;
		}

		// vertical ifft
		this.fft2vPass.material.uniforms['butterfly'] = this.butterflyTexture;

		for (let phase = 0; phase < phases; phase++) {
			this.renderer.setRenderTarget(pingPongRenderTargets[pingPong]);
			this.fft2vPass.uniforms.phase = phase;
			this.fft2vPass.uniforms.spectrum0 = pingPongTextures[pingPong][0];
			this.fft2vPass.uniforms.spectrum1 = pingPongTextures[pingPong][1];
			this.fft2vPass.uniforms.spectrum2 = pingPongTextures[pingPong][2];
			this.fft2vPass.uniforms.spectrum3 = pingPongTextures[pingPong][3];
			this.fft2vPass.uniforms.spectrum4 = pingPongTextures[pingPong][4];
			this.fft2vPass.uniforms.spectrum5 = pingPongTextures[pingPong][5];
			this.fft2vPass.render(this.renderer);
			pingPong = (pingPong + 1) % 2;
		}

		this.ifftTextures = pingPongTextures[pingPong];
	}

	postIfft2() {
		this.postfft2Pass.uniforms.ifft0 = this.ifftTextures[0];
		this.postfft2Pass.uniforms.ifft1 = this.ifftTextures[1];
		this.postfft2Pass.uniforms.ifft2 = this.ifftTextures[2];
		this.postfft2Pass.uniforms.ifft3 = this.ifftTextures[3];
		this.postfft2Pass.uniforms.ifft4 = this.ifftTextures[4];
		this.postfft2Pass.uniforms.ifft5 = this.ifftTextures[5];
		this.renderer.setRenderTarget(this.postIfft2RenderTarget);
		this.postfft2Pass.render(this.renderer);
	}

}