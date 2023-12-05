import { ShaderPostPass, RenderTarget2D, Texture2D, ATTACHMENT, TEXTURE_FILTER, PIXEL_TYPE, BLEND_FACTOR, BLEND_TYPE, BLEND_EQUATION, ShaderLib, PBRMaterial, MATERIAL_TYPE } from 't3d';

// TODO: Share depth attachment with opaque render target
class DepthPeelingOITPass {

	constructor(width, height) {
		this._renderTarget1 = new RenderTarget2D(width, height);
		this._renderTarget2 = new RenderTarget2D(width, height);

		// 0: depth range, 1: front color, 2: back color
		this._renderTarget1.attach(createFloatColorTexture(), ATTACHMENT.COLOR_ATTACHMENT0);
		this._renderTarget1.attach(createFloatColorTexture(PIXEL_TYPE.HALF_FLOAT), ATTACHMENT.COLOR_ATTACHMENT1);
		this._renderTarget1.attach(createFloatColorTexture(PIXEL_TYPE.HALF_FLOAT), ATTACHMENT.COLOR_ATTACHMENT2);

		this._renderTarget2.attach(createFloatColorTexture(), ATTACHMENT.COLOR_ATTACHMENT0);
		this._renderTarget2.attach(createFloatColorTexture(PIXEL_TYPE.HALF_FLOAT), ATTACHMENT.COLOR_ATTACHMENT1);
		this._renderTarget2.attach(createFloatColorTexture(PIXEL_TYPE.HALF_FLOAT), ATTACHMENT.COLOR_ATTACHMENT2);

		this._depthClearRenderTarget1 = new RenderTarget2D(width, height);
		this._depthClearRenderTarget1.attach(this._renderTarget1._attachments[ATTACHMENT.COLOR_ATTACHMENT0], ATTACHMENT.COLOR_ATTACHMENT0);
		this._depthClearRenderTarget1.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		this._depthClearRenderTarget2 = new RenderTarget2D(width, height);
		this._depthClearRenderTarget2.attach(this._renderTarget2._attachments[ATTACHMENT.COLOR_ATTACHMENT0], ATTACHMENT.COLOR_ATTACHMENT0);
		this._depthClearRenderTarget2.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		this._backBlendRenderTarget = new RenderTarget2D(width, height);

		this._backBlendPass = new ShaderPostPass(DepthPeelingBackBlendShader);
		this._backBlendPass.material.transparent = true;
		this._backBlendPass.material.blending = BLEND_TYPE.CUSTOM;
		this._backBlendPass.material.blendEquationAlpha = BLEND_EQUATION.ADD;
		this._backBlendPass.material.blendEquation = BLEND_EQUATION.ADD;
		this._backBlendPass.material.blendSrc = BLEND_FACTOR.SRC_ALPHA;
		this._backBlendPass.material.blendDst = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;
		this._backBlendPass.material.blendSrcAlpha = BLEND_FACTOR.ONE;
		this._backBlendPass.material.blendDstAlpha = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;

		this._mixPass = new ShaderPostPass(DepthPeelingMixShader);
		this._mixPass.material.transparent = true;
		this._mixPass.material.blending = BLEND_TYPE.CUSTOM;
		this._mixPass.material.blendEquationAlpha = BLEND_EQUATION.ADD;
		this._mixPass.material.blendEquation = BLEND_EQUATION.ADD;
		this._mixPass.material.blendSrc = BLEND_FACTOR.ONE;
		this._mixPass.material.blendDst = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;
		this._mixPass.material.blendSrcAlpha = BLEND_FACTOR.ONE;
		this._mixPass.material.blendDstAlpha = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;
		this._mixPass.uniforms.uFrontColor = this._renderTarget2._attachments[ATTACHMENT.COLOR_ATTACHMENT1];
		this._mixPass.uniforms.uBackColor = this._backBlendRenderTarget._attachments[ATTACHMENT.COLOR_ATTACHMENT0];

		const renderInfos = { index: 0, frontColorTexture: null, depthPeelingTexture: null };
		this._renderInfos = renderInfos;

		this._renderOptions = {
			getMaterial: function(renderable) {
				const material = renderable.material;
				material.uniforms.frist = renderInfos.index + 1;
				material.uniforms.uFrontColor = renderInfos.frontColorTexture;
				material.uniforms.uDepth = renderInfos.depthPeelingTexture;
				return material;
			}
		};

		this.loop = 4;
	}

	setOutputEncoding(encoidng) {
		this._renderTarget1.texture.encoding = encoidng;
		this._renderTarget2.texture.encoding = encoidng;
	}

	resize(width, height) {
		this._renderTarget1.resize(width, height);
		this._renderTarget2.resize(width, height);
		this._depthClearRenderTarget1.resize(width, height);
		this._depthClearRenderTarget2.resize(width, height);
		this._backBlendRenderTarget.resize(width, height);
	}

	dispose() {
		this._renderTarget1.dispose();
		this._renderTarget2.dispose();
		this._depthClearRenderTarget1.dispose();
		this._depthClearRenderTarget2.dispose();
		this._backBlendRenderTarget.dispose();

		this._backBlendPass.dispose();
		this._mixPass.dispose();
	}

	renderBuffer(renderer, scene, camera) {
		renderer.setRenderTarget(this._renderTarget1);
		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, false, false);

		renderer.setRenderTarget(this._renderTarget2);
		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, false, false);

		renderer.setRenderTarget(this._depthClearRenderTarget1);
		renderer.setClearColor(-99999, -99999, 0, 0);
		renderer.clear(true, false, false);

		renderer.setRenderTarget(this._depthClearRenderTarget2);
		renderer.setClearColor(-99999, -99999, 0, 0);
		renderer.clear(true, false, false);

		renderer.setRenderTarget(this._backBlendRenderTarget);
		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, false, false);

		for (let i = 0; i < this.loop; i++) {
			const writeRenderTarget = i % 2 === 0 ? this._renderTarget1 : this._renderTarget2;
			const depthClearRenderTarget = i % 2 === 0 ? this._depthClearRenderTarget1 : this._depthClearRenderTarget2;
			const readRenderTarget = i % 2 === 0 ? this._renderTarget2 : this._renderTarget1;

			// clear write render target

			renderer.setRenderTarget(writeRenderTarget);
			renderer.setClearColor(0, 0, 0, 0);
			renderer.clear(true, false, false);

			renderer.setRenderTarget(depthClearRenderTarget);
			renderer.setClearColor(-99999, -99999, 0, 0);
			renderer.clear(true, false, false);

			// render write render target

			renderer.setRenderTarget(writeRenderTarget);

			const renderStates = scene.getRenderStates(camera);
			const renderQueue = scene.getRenderQueue(camera);

			const renderOptions = this._renderOptions;

			this._renderInfos.index = i;
			this._renderInfos.frontColorTexture = readRenderTarget._attachments[ATTACHMENT.COLOR_ATTACHMENT1];
			this._renderInfos.depthPeelingTexture = readRenderTarget._attachments[ATTACHMENT.COLOR_ATTACHMENT0];

			renderer.beginRender();

			let renderQueueLayer;
			for (let j = 0, l = renderQueue.layerList.length; j < l; j++) {
				renderQueueLayer = renderQueue.layerList[j];
				renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, renderOptions);
			}

			renderer.endRender();

			// accumulate back color

			renderer.setRenderTarget(this._backBlendRenderTarget);
			this._backBlendPass.uniforms.uBackColor = writeRenderTarget._attachments[ATTACHMENT.COLOR_ATTACHMENT2];
			this._backBlendPass.render(renderer);
		}
	}

	render(renderer) {
		this._mixPass.render(renderer);
	}

}

function createFloatColorTexture(type = PIXEL_TYPE.FLOAT) {
	const texture = new Texture2D();
	texture.type = type;
	texture.minFilter = TEXTURE_FILTER.NEAREST;
	texture.magFilter = TEXTURE_FILTER.NEAREST;
	texture.generateMipmaps = false;
	return texture;
}

/** Shaders **/

const DepthPeelingBackBlendShader = {
	name: 'dp_oit_back_blend',

	uniforms: {
		uBackColor: null
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
		uniform sampler2D uBackColor;

		varying vec2 v_Uv;

		void main() {
			gl_FragColor = texture2D(uBackColor, v_Uv);
			if (gl_FragColor.a == 0.0) {
				discard;
			}
		}
   `
};

const DepthPeelingMixShader = {
	name: 'dp_oit_mix',

	uniforms: {
		uFrontColor: null,
		uBackColor: null
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
		uniform sampler2D uFrontColor;
		uniform sampler2D uBackColor;

		varying vec2 v_Uv;

		void main() {
			vec4 frontColor = texture2D(uFrontColor, v_Uv);
			vec4 backColor = texture2D(uBackColor, v_Uv);
			float alphaMultiplier = 1.0 - frontColor.a;
			gl_FragColor = vec4(frontColor.rgb + alphaMultiplier * backColor.rgb, frontColor.a + backColor.a);
		}
   `
};

/** DepthPeelingOITMaterial **/

class DepthPeelingOITMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.depthTest = false;
		this.depthWrite = false;

		this.transparent = true;

		this.blending = BLEND_TYPE.CUSTOM;
		this.blendEquationAlpha = BLEND_EQUATION.MAX;
		this.blendEquation = BLEND_EQUATION.MAX;
		this.blendSrc = BLEND_FACTOR.ONE;
		this.blendDst = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;
		this.blendSrcAlpha = BLEND_FACTOR.ONE;
		this.blendDstAlpha = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;

		this.shaderName = 'dp_oit_mat';

		this.vertexShader = ShaderLib.pbr_vert;
		this.fragmentShader = fragmentShader;

		this.uniforms = {
			uFrontColor: null,
			uDepth: null,
			frist: 1
		};
	}

}

let fragmentShader = ShaderLib.pbr_frag;

fragmentShader = fragmentShader.replace(
	'#include <clippingPlanes_pars_frag>',
	`
    #include <clippingPlanes_pars_frag>

    uniform sampler2D uDepth;
    uniform sampler2D uFrontColor;
    uniform float frist;

    #define MAX_DEPTH 99999.0
	`
);

fragmentShader = fragmentShader.replace(
	'#include <clippingPlanes_frag>',
	`
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);
    vec2 lastDepth;
    if (frist == 1.0) {
        lastDepth = vec2(0., 1.0);
    }else{
        lastDepth = texelFetch(uDepth, fragCoord, 0).rg;
    }
   
    vec4 lastFrontColor = texelFetch(uFrontColor, fragCoord, 0);
    // depth value always increases
    // so we can use MAX blend equation
    gl_FragData[0].rg = vec2(-MAX_DEPTH);

    // front color always increases
    // so we can use MAX blend equation
    gl_FragData[1] = lastFrontColor;
    // back color is separately blend afterwards each pass
    gl_FragData[2] = vec4(0.0);
    float nearestDepth = -lastDepth.x;
    float furthestDepth = lastDepth.y;
    
    float alphaMultiplier = 1.0 - lastFrontColor.a;

    if (gl_FragCoord.z < nearestDepth || gl_FragCoord.z > furthestDepth) {
        // Skip this depth since it's been peeled.
        return;
    }

    if (gl_FragCoord.z > nearestDepth && gl_FragCoord.z < furthestDepth) {
        // This needs to be peeled.
        // The ones remaining after MAX blended for 
        // all need-to-peel will be peeled next pass.
        pc_fragData0 = vec4(-gl_FragCoord.z, gl_FragCoord.z, 0.0, 1.0);
        return;
    }

    #include <clippingPlanes_frag>
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

    // dual depth peeling
    // write to back and front color buffer
    if (gl_FragCoord.z == nearestDepth) {
        pc_fragData1.rgb += gl_FragColor.rgb * gl_FragColor.a * alphaMultiplier;
        pc_fragData1.a = 1.0 - alphaMultiplier * (1.0 - gl_FragColor.a);
    } else {
        pc_fragData2 += gl_FragColor;
    }
    `
);

export { DepthPeelingOITPass, DepthPeelingOITMaterial };