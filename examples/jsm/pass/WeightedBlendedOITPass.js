import { ShaderPostPass, RenderTarget2D, Texture2D, ATTACHMENT, TEXTURE_FILTER, PIXEL_TYPE, BLEND_FACTOR, BLEND_TYPE, ShaderLib, PBRMaterial, MATERIAL_TYPE } from 't3d';

// TODO: Share depth attachment with opaque render target
class WeightedBlendedOITPass {

	constructor(width, height) {
		this._renderTarget = new RenderTarget2D(width, height);
		this._renderTarget.texture.type = PIXEL_TYPE.FLOAT;
		this._renderTarget.texture.minFilter = TEXTURE_FILTER.NEAREST;
		this._renderTarget.texture.magFilter = TEXTURE_FILTER.NEAREST;
		this._renderTarget.texture.generateMipmaps = false;

		const accumulateAlphaTexture = new Texture2D();
		accumulateAlphaTexture.type = PIXEL_TYPE.FLOAT;
		accumulateAlphaTexture.minFilter = TEXTURE_FILTER.NEAREST;
		accumulateAlphaTexture.magFilter = TEXTURE_FILTER.NEAREST;
		accumulateAlphaTexture.generateMipmaps = false;

		this._renderTarget.attach(accumulateAlphaTexture, ATTACHMENT.COLOR_ATTACHMENT1);

		this._mixPass = new ShaderPostPass(WeightedBlendedMixShader);
		this._mixPass.material.transparent = true;
		this._mixPass.material.blending = BLEND_TYPE.CUSTOM;
		this._mixPass.material.blendEquationAlpha = BLEND_FACTOR.ADD;
		this._mixPass.material.blendSrc = BLEND_FACTOR.ONE;
		this._mixPass.material.blendDst = BLEND_FACTOR.ONE;
		this._mixPass.material.blendSrcAlpha = BLEND_FACTOR.ZERO;
		this._mixPass.material.blendDstAlpha = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;
		this._mixPass.uniforms['uAccumulate'] = this._renderTarget.texture;
		this._mixPass.uniforms['uAccumulateAlpha'] = accumulateAlphaTexture;

		const cameraInfos = { far: 1000, near: 0.1 };
		this._cameraInfos = cameraInfos;

		this._renderOptions = {
			getMaterial: function(renderable) {
				const material = renderable.material;
				material.uniforms.cameraFar = cameraInfos.far;
				material.uniforms.cameraNear = cameraInfos.near;
				return material;
			}
		};
	}

	setOutputEncoding(encoidng) {
		this._renderTarget.texture.encoding = encoidng;
	}

	resize(width, height) {
		this._renderTarget.resize(width, height);
	}

	dispose() {
		this._renderTarget.dispose();
		this._mixPass.dispose();
	}

	renderBuffer(renderer, scene, camera) {
		renderer.setRenderTarget(this._renderTarget);
		renderer.setClearColor(0, 0, 0, 1.0);
		renderer.clear(true, false, false);

		const renderStates = scene.getRenderStates(camera);
		const renderQueue = scene.getRenderQueue(camera);

		this._cameraInfos.far = renderStates.camera.far;
		this._cameraInfos.near = renderStates.camera.near;

		const renderOptions = this._renderOptions;

		renderer.beginRender();

		let renderQueueLayer;
		for (let i = 0, l = renderQueue.layerList.length; i < l; i++) {
			renderQueueLayer = renderQueue.layerList[i];
			renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, renderOptions);
		}

		renderer.endRender();
	}

	render(renderer) {
		this._mixPass.render(renderer);
	}

}

/** WeightedBlendedMixShader **/

const WeightedBlendedMixShader = {
	name: 'wb_oit_mix',

	uniforms: {
		'uAccumulate': null,
		'uAccumulateAlpha': null
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
		uniform sampler2D uAccumulate;
		uniform sampler2D uAccumulateAlpha;

		varying vec2 v_Uv;

		void main() {
			vec4 accum = texture2D(uAccumulate, v_Uv);

			float r = texture2D(uAccumulateAlpha, v_Uv).r;

			vec4 transparent = vec4(accum.rgb / clamp(r, 1e-4, 5e4), accum.a);

			gl_FragColor = (1.0 - transparent.a) * transparent;
		}
   `
};

/** WeightedBlendedOITMaterial **/

class WeightedBlendedOITMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.depthTest = false;
		this.depthWrite = true;

		this.transparent = true;

		this.blending = BLEND_TYPE.CUSTOM;
		this.blendEquationAlpha = BLEND_FACTOR.ADD;
		this.blendSrc = BLEND_FACTOR.ONE;
		this.blendDst = BLEND_FACTOR.ONE;
		this.blendSrcAlpha = BLEND_FACTOR.ZERO;
		this.blendDstAlpha = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;

		this.shaderName = 'wb_oit_mat';

		this.vertexShader = ShaderLib.pbr_vert;
		this.fragmentShader = fragmentShader;

		this.uniforms = {
			cameraFar: 1000,
			cameraNear: 0.1
		};
	}

}

let fragmentShader = ShaderLib.pbr_frag;

fragmentShader = fragmentShader.replace(
	'#include <clippingPlanes_pars_frag>',
	`
    #include <clippingPlanes_pars_frag>

    uniform float cameraFar;
    uniform float cameraNear;

    float weight(float a) {
        return clamp(pow(min(1.0, a * 10.0) + 0.01, 3.0) * 1e8 * pow(1.0 - gl_FragCoord.z * 0.9, 3.0), 1e-2, 3e3);
    }

    float alphaWeight(float a) {
        float z = (gl_FragCoord.z - (cameraFar + cameraNear) / 2.) / ((cameraFar - cameraNear) / 2.);

        // See Weighted Blended Order-Independent Transparency for examples of different weighting functions:
        // http://jcgt.org/published/0002/02/09/
        return pow(a + 0.01, 4.0) + max(1e-2, min(3.0 * 1e3, 0.003 / (1e-5 + pow(abs(z) / 200.0, 4.0))));
    }
    `
);

fragmentShader = fragmentShader.replace(
	'#include <end_frag>',
	`
    vec4 gl_FragColor = outColor;
    `
);

fragmentShader = fragmentShader.replace(
	'#include <dithering_frag>',
	`
    #include <dithering_frag>
	gl_FragColor.rgb *= gl_FragColor.a;
    float w = alphaWeight(gl_FragColor.a);
    gl_FragData[0] = vec4(gl_FragColor.rgb * w, gl_FragColor.a);
    gl_FragData[1] = vec4(gl_FragColor.a * w);
    `
);

export { WeightedBlendedOITPass, WeightedBlendedOITMaterial };