import { BLEND_TYPE, ShaderPostPass, RenderTarget2D, TEXTURE_FILTER, PIXEL_TYPE, PIXEL_FORMAT, ATTACHMENT } from 't3d';
import { CopyShader } from '../shaders/CopyShader.js';
import { LuminosityHighPassShader } from '../shaders/LuminosityHighPassShader.js';

/**
 * UnrealBloomPass is inspired by the bloom pass of Unreal Engine. It creates a
 * mip map chain of bloom textures and blurs them with different radii. Because
 * of the weighted combination of mips, and because larger blurs are done on
 * higher mips, this effect provides good quality and performance.
 *
 * Reference:
 * - https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
 */
class UnrealBloomPass {

	constructor(width, height) {
		this.tDiffuse = null;
		this.threshold = 0;
		this.strength = 1;
		this.radius = 0;
		this.toneMappingExposure = 1.;

		this.highlightPass = new ShaderPostPass(LuminosityHighPassShader);

		this.tempRenderTarget = createTempRenderTarget(width, height);

		//

		this.separableBlurPasses = [];
		for (let i = 0; i < 5; i++) {
			const kernelRadius = kernelSizeArray[i];

			const seperableBlurPass = new ShaderPostPass(seperableBlurShader);
			seperableBlurPass.material.defines.KERNEL_RADIUS = kernelRadius;

			for (let i = 0; i < kernelRadius; i++) {
				seperableBlurPass.uniforms.gaussianCoefficients.push(
					0.39894 * Math.exp(-0.5 * i * i / (kernelRadius * kernelRadius)) / kernelRadius
				);
			}

			this.separableBlurPasses.push(seperableBlurPass);
		}

		this.renderTargetsHorizontal = [];
		this.renderTargetsVertical = [];
		let resx = Math.round(width / 2);
		let resy = Math.round(height / 2);
		for (let i = 0; i < 5; i++) {
			const renderTargetHorizonal = createTempRenderTarget(resx, resy);
			this.renderTargetsHorizontal.push(renderTargetHorizonal);

			const renderTargetVertical = createTempRenderTarget(resx, resy);
			this.renderTargetsVertical.push(renderTargetVertical);

			this.separableBlurPasses[i].uniforms.invSize[0] = 1 / resx;
			this.separableBlurPasses[i].uniforms.invSize[1] = 1 / resy;

			resx = Math.round(resx / 2);
			resy = Math.round(resy / 2);
		}

		this.compositePass = new ShaderPostPass(compositeShader);
		this.compositePass.uniforms.blurTexture1 = this.renderTargetsVertical[0].texture;
		this.compositePass.uniforms.blurTexture2 = this.renderTargetsVertical[1].texture;
		this.compositePass.uniforms.blurTexture3 = this.renderTargetsVertical[2].texture;
		this.compositePass.uniforms.blurTexture4 = this.renderTargetsVertical[3].texture;
		this.compositePass.uniforms.blurTexture5 = this.renderTargetsVertical[4].texture;

		this.copyPass = new ShaderPostPass(CopyShader);
		this.copyPass.material.blending = BLEND_TYPE.ADD;
		this.copyPass.material.transparent = true;
		this.copyPass.material.premultipliedAlpha = true;
		this.copyPass.material.depthTest = false;
		this.copyPass.material.depthWrite = false;

		this.toneMappingPass = new ShaderPostPass(toneMappingShader);
	}

	update(renderer, sceneRenderTarget, outputRenderTarget) {
		// Step 1: highlight

		renderer.setRenderTarget(this.tempRenderTarget);
		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, true, false);
		this.highlightPass.uniforms.luminosityThreshold = this.threshold;
		this.highlightPass.uniforms.tDiffuse = sceneRenderTarget.texture;
		this.highlightPass.render(renderer);

		// Step 2: blur

		let inputRenderTarget = this.tempRenderTarget;

		for (let i = 0; i < 5; i++) {
			this.separableBlurPasses[i].uniforms.colorTexture = inputRenderTarget.texture;
			this.separableBlurPasses[i].uniforms.direction[0] = 1;
			this.separableBlurPasses[i].uniforms.direction[1] = 0;
			renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
			renderer.setClearColor(0, 0, 0, 0);
			renderer.clear(true, true, false);
			this.separableBlurPasses[i].render(renderer);

			this.separableBlurPasses[i].uniforms.colorTexture = this.renderTargetsHorizontal[i].texture;
			this.separableBlurPasses[i].uniforms.direction[0] = 0;
			this.separableBlurPasses[i].uniforms.direction[1] = 1;
			renderer.setRenderTarget(this.renderTargetsVertical[i]);
			renderer.setClearColor(0, 0, 0, 0);
			renderer.clear(true, true, false);
			this.separableBlurPasses[i].render(renderer);
			inputRenderTarget = this.renderTargetsVertical[i];
		}

		// Step 3: composite all the mips

		renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, true, false);
		this.compositePass.uniforms.bloomRadius = this.radius;
		this.compositePass.uniforms.strength = this.strength;
		this.compositePass.render(renderer);

		// Step 4: blend it additively

		renderer.setRenderTarget(sceneRenderTarget);
		this.copyPass.uniforms.tDiffuse = this.renderTargetsHorizontal[0].texture;
		this.copyPass.render(renderer);

		// Step 5: color mapping  over the output render target

		renderer.setRenderTarget(outputRenderTarget);
		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, true, false);
		this.toneMappingPass.uniforms.tDiffuse = sceneRenderTarget.texture;
		this.toneMappingPass.uniforms.toneMappingExposure = this.toneMappingExposure;
		this.toneMappingPass.render(renderer);
	}

	dispose() {
		this.tempRenderTarget.dispose();

		for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
			this.renderTargetsHorizontal[i].dispose();
		}

		for (let i = 0; i < this.renderTargetsVertical.length; i++) {
			this.renderTargetsVertical[i].dispose();
		}

		for (let i = 0; i < this.separableBlurPasses.length; i++) {
			this.separableBlurPasses[i].dispose();
		}

		this.highlightPass.dispose();
		this.compositePass.dispose();
		this.copyPass.dispose();
	}

	resize(width, height) {
		this.tempRenderTarget.resize(width, height);

		let resx = Math.round(width / 2);
		let resy = Math.round(height / 2);
		for (let i = 0; i < 5; i++) {
			this.renderTargetsHorizontal[i].resize(resx, resy);
			this.renderTargetsVertical[i].resize(resx, resy);
			this.separableBlurPasses[i].uniforms.invSize = [1 / resx, 1 / resy];
			resx = Math.round(resx / 2);
			resy = Math.round(resy / 2);
		}
	}

}

UnrealBloomPass.supportWebGL1 = false;

const kernelSizeArray = [3, 5, 7, 9, 11];

function createTempRenderTarget(width, height) {
	const renderTarget = new RenderTarget2D(width, height);
	renderTarget.texture.type = PIXEL_TYPE.HALF_FLOAT;

	if (!UnrealBloomPass.supportWebGL1) {
		renderTarget.texture.format = PIXEL_FORMAT.RGB;
		renderTarget.texture.internalformat = PIXEL_FORMAT.R11F_G11F_B10F;
	}

	renderTarget.texture.minFilter = TEXTURE_FILTER.LINEAR;
	renderTarget.texture.generateMipmaps = false;
	renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
	return renderTarget;
}

const seperableBlurShader = {
	name: 'seperableBlur',

	defines: {
		KERNEL_RADIUS: 5
	},

	uniforms: {
		colorTexture: null,
		invSize: [1 / 512, 1 / 512], // inverse texture size
		direction: [0.5, 0.5],
		gaussianCoefficients: [] // precomputed Gaussian Coefficients
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;

		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;
		varying vec2 v_Uv;

		void main() {
			v_Uv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
		}
	`,

	fragmentShader: `
		uniform sampler2D colorTexture;
		uniform vec2 invSize;
		uniform vec2 direction;
		uniform float gaussianCoefficients[KERNEL_RADIUS];
		varying vec2 v_Uv;
		void main() {
			float weightSum = gaussianCoefficients[0];
			vec3 diffuseSum = texture2D(colorTexture, v_Uv).rgb * weightSum;
			for(int i = 1; i < KERNEL_RADIUS; i ++) {
				float x = float(i);
				float w = gaussianCoefficients[i];
				vec2 uvOffset = direction * invSize * x;
				vec3 sample1 = texture2D(colorTexture, v_Uv + uvOffset).rgb;
				vec3 sample2 = texture2D(colorTexture, v_Uv - uvOffset).rgb;
				diffuseSum += (sample1 + sample2) * w;
				weightSum += 2.0 * w;
			}
			gl_FragColor = vec4(diffuseSum / weightSum, 0.0);
		}
	`
};

const compositeShader = {
	name: 'composite',

	defines: {},

	uniforms: {
		blurTexture1: null,
		blurTexture2: null,
		blurTexture3: null,
		blurTexture4: null,
		blurTexture5: null,
		bloomFactors: [1., 0.8, 0.6, 0.4, 0.2],
		bloomRadius: 0.0,
		strength: 1
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;

		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;

		varying vec2 v_Uv;

		void main() {
			v_Uv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
		}
	`,

	fragmentShader: `
		uniform sampler2D blurTexture1;
		uniform sampler2D blurTexture2;
		uniform sampler2D blurTexture3;
		uniform sampler2D blurTexture4;
		uniform sampler2D blurTexture5;
		uniform float strength;
		uniform float bloomRadius;
		uniform float bloomFactors[5];

		varying vec2 v_Uv;
	
		float lerpBloomFactor(const in float factor) {
			float mirrorFactor = 1.2 - factor;
			return mix(factor, mirrorFactor, bloomRadius);
		}

		void main() {
			float factor0 = lerpBloomFactor(bloomFactors[0]);
			float factor1 = lerpBloomFactor(bloomFactors[1]);
			float factor2 = lerpBloomFactor(bloomFactors[2]);
			float factor3 = lerpBloomFactor(bloomFactors[3]);
			float factor4 = lerpBloomFactor(bloomFactors[4]);
			gl_FragColor = strength * (factor0 * texture2D(blurTexture1, v_Uv) +
				factor1 * texture2D(blurTexture2, v_Uv) +
				factor2 * texture2D(blurTexture3, v_Uv) +
				factor3 * texture2D(blurTexture4, v_Uv) +
				factor4 * texture2D(blurTexture5, v_Uv));
		}
	`
};

const toneMappingShader = {
	name: 'toneMapping',

	defines: {},

	uniforms: {
		tDiffuse: null,
		opacity: 1.0,
		toneMappingExposure: 1.
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;

		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;

		varying vec2 v_Uv;

		void main() {
			v_Uv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
		}
	`,

	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform float opacity;
		uniform float toneMappingExposure;

		varying vec2 v_Uv;

		vec3 RRTAndODTFit(vec3 v) {
			vec3 a = v * (v + 0.0245786) - 0.000090537;
			vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
			return a / b;
		}

		vec3 ReinhardToneMapping(vec3 color) {
			color *= toneMappingExposure;
			return saturate(color / (vec3(1.0) + color));
		}

		void main() {
			gl_FragColor = texture2D(tDiffuse, v_Uv) * opacity;
			gl_FragColor.rgb = ReinhardToneMapping(gl_FragColor.rgb);
			gl_FragColor = LinearTosRGB(gl_FragColor);
		}
	`
};

export { UnrealBloomPass };