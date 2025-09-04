// Reference: https://stackblitz.com/edit/fft-2d?file=ocean%2Focean-field-builder.ts

import { RenderTarget2D, ATTACHMENT, TEXTURE_FILTER, TEXTURE_WRAP, ShaderPostPass } from 't3d';
import { createButterflyTexture } from './Butterfly.js';
import { OceanField } from './OceanField.js';
import { H0Shader } from './shaders/H0Shader.js';
import { createFloat2Texture, createFloat4Texture } from './Utils.js';

export class OceanFieldBuilder {

	constructor(renderer) {
		this.renderer = renderer;
		this.renderTarget = new RenderTarget2D(4, 4);
		this.butterflyTexture = new Map();
		this.noiseTexture = new Map();
		this.h0Pass = new ShaderPostPass(H0Shader);
	}

	build(params = {}) {
		const _params = {
			...defaultBuildParams,
			...params
		};

		const h0Textures = this.createH0Textures(_params.resolution);
		this.generateInitialSpectrum(h0Textures, _params);

		const butterflyTexture = this.getButterflyTexture(_params.resolution);

		return new OceanField(
			this.renderer,
			h0Textures,
			butterflyTexture,
			_params
		);
	}

	update(field, params = {}) {
		const _params = {
			...defaultBuildParams,
			...params
		};
		this.generateInitialSpectrum(field['h0Textures'], _params);
		this.updateField(field, _params);
		Object.assign(field, { params: _params });
	}

	updateField(field, params) {
		if (params.resolution !== field.params.resolution) {
			field.hkPass.uniforms.resolution = params.resolution;
			field.postfft2Pass.uniforms.N2 = params.resolution * params.resolution;
		}

		for (let i = 0; i < params.cascades.length; i++) {
			if (params.cascades[i].size !== field.hkPass.uniforms.sizes[i]) {
				field.hkPass.uniforms.sizes[i] = params.cascades[i].size;
			}
		}
	}

	createH0Textures(size) {
		return [
			createFloat4Texture(size, size),
			createFloat4Texture(size, size),
			createFloat4Texture(size, size)
		];
	}

	generateInitialSpectrum(h0Textures, params) {
		for (let slot = 0; slot < h0Textures.length; slot++) {
			this.renderTarget.attach(h0Textures[slot], ATTACHMENT.COLOR_ATTACHMENT0 + slot);
		}
		this.renderTarget.resize(params.resolution, params.resolution);
		this.renderer.setRenderTarget(this.renderTarget);

		this.h0Pass.uniforms.noise = this.getNoiseTexture(params.resolution, params.randomSeed);
		this.h0Pass.uniforms.resolution = params.resolution;
		this.h0Pass.uniforms.wind = params.wind;
		this.h0Pass.uniforms.alignment = params.alignment;

		for (let i = 0; i < params.cascades.length; i++) {
			this.h0Pass.uniforms.cascades[i].size = params.cascades[i].size;
			this.h0Pass.uniforms.cascades[i].strength = (params.cascades[i].strength * 0.081) / params.cascades[i].size ** 2;
			this.h0Pass.uniforms.cascades[i].minK = 2.0 * Math.PI / params.cascades[i].maxWave;
			this.h0Pass.uniforms.cascades[i].maxK = 2.0 * Math.PI / params.cascades[i].minWave;
		}

		this.h0Pass.render(this.renderer);
	}

	getNoiseTexture(size, randomSeed) {
		if (!this.noiseTexture.has(size)) {
			this.noiseTexture.set(
				size,
				createFloat2Texture(
					size,
					size,
					TEXTURE_FILTER.NEAREST,
					TEXTURE_WRAP.REPEAT
				)
			);
		}

		const texture = this.noiseTexture.get(size);
		texture.image.data = this.getNoise2d(size, randomSeed);
		texture.version++;

		return texture;
	}

	getButterflyTexture(size) {
		if (!this.butterflyTexture.has(size)) {
			const texture = createFloat4Texture(Math.log2(size), size);
			texture.image.data = createButterflyTexture(size);
			texture.version++;
			this.butterflyTexture.set(size, texture);
		}
		return this.butterflyTexture.get(size);
	}

	getNoise2d(size, randomSeed) {
		const mulberry32 = a => {
			return () => {
				let t = (a += 0x6d2b79f5);
				t = Math.imul(t ^ (t >>> 15), t | 1);
				t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
				return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
			};
		};
		const random = mulberry32(randomSeed);
		return Float32Array.from([...Array(size * size * 2)].map(() => random()));
	}

	dispose() {
		this.butterflyTexture.forEach(texture => texture.dispose());
		this.butterflyTexture.clear();
		this.noiseTexture.forEach(texture => texture.dispose());
		this.noiseTexture.clear();

		this.renderTarget.dispose();

		this.h0Pass.dispose();
	}

}

const defaultBuildParams = {
	cascades: [
		{
			size: 100.0,
			strength: 2.0,
			croppiness: -1.5,
			minWave: 1.0e-6,
			maxWave: 1.0e6
		},
		{
			size: 60.0,
			strength: 2.0,
			croppiness: -1.5,
			minWave: 1.0e-6,
			maxWave: 1.0e6
		},
		{
			size: 6.0,
			strength: 2.0,
			croppiness: -1.5,
			minWave: 1.0e-6,
			maxWave: 1.0e6
		}
	],
	resolution: 256,
	wind: [4.5, 2.5],
	alignment: 1.0,
	randomSeed: 0
};