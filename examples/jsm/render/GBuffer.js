import {
	ATTACHMENT,
	RenderTarget2D,
	SHADING_TYPE,
	ShaderMaterial,
	Texture2D,
	PIXEL_FORMAT,
	PIXEL_TYPE,
	TEXTURE_FILTER
} from 't3d';

class GBuffer {

	constructor(width, height) {
		const renderTarget = new RenderTarget2D(width, height);

		// rg: normal, b: metalness, a: roughness
		const textureA = renderTarget.texture;
		textureA.format = PIXEL_FORMAT.RGBA;
		textureA.type = PIXEL_TYPE.HALF_FLOAT;
		textureA.magFilter = TEXTURE_FILTER.NEAREST;
		textureA.minFilter = TEXTURE_FILTER.NEAREST;
		textureA.generateMipmaps = false;

		// rgb: albedo, a: ao
		const textureB = new Texture2D();
		textureB.format = PIXEL_FORMAT.RGBA;
		textureB.type = PIXEL_TYPE.UNSIGNED_BYTE;
		textureB.magFilter = TEXTURE_FILTER.LINEAR;
		textureB.minFilter = TEXTURE_FILTER.LINEAR;
		textureB.generateMipmaps = false;

		// rgb: emissive, a: unused
		const textureC = new Texture2D();
		textureC.format = PIXEL_FORMAT.RGBA;
		textureC.type = PIXEL_TYPE.HALF_FLOAT;
		textureC.magFilter = TEXTURE_FILTER.LINEAR;
		textureC.minFilter = TEXTURE_FILTER.LINEAR;
		textureC.generateMipmaps = false;

		// depth stencil
		const depthStencilTexture = new Texture2D();
		depthStencilTexture.format = PIXEL_FORMAT.DEPTH_STENCIL;
		depthStencilTexture.type = PIXEL_TYPE.UNSIGNED_INT_24_8;
		depthStencilTexture.magFilter = TEXTURE_FILTER.NEAREST;
		depthStencilTexture.minFilter = TEXTURE_FILTER.NEAREST;
		depthStencilTexture.generateMipmaps = false;
		depthStencilTexture.flipY = false;

		renderTarget.attach(textureB, ATTACHMENT.COLOR_ATTACHMENT1);
		renderTarget.attach(textureC, ATTACHMENT.COLOR_ATTACHMENT2);
		renderTarget.attach(depthStencilTexture, ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		this._renderTarget = renderTarget;

		this._renderOptions = {
			getMaterial: function(renderable) {
				return materialCache.getMaterial(renderable);
			},
			ifRender: function(renderable) {
				return renderable.material.shaderName != 'skybox';
			}
		};

		this._currentRenderStates = null;

		this.layers = [0];
	}

	supportMRT(renderer) {
		const capabilities = renderer.capabilities;

		if (capabilities.version >= 2) {
			return true;
		}

		// WEBGL_draw_buffers has bug here
		// if (capabilities.getExtension('WEBGL_draw_buffers')) {
		// 	return true;
		// }

		return false;
	}

	resize(width, height) {
		this._renderTarget.resize(width, height);
	}

	update(renderer, scene, camera) {
		const renderStates = scene.getRenderStates(camera);
		const renderQueue = scene.getRenderQueue(camera);

		renderer.setRenderTarget(this._renderTarget);
		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, true, true);

		renderer.beginRender();

		const layers = this.layers;
		layers.forEach(layerId => {
			const renderQueueLayer = renderQueue.getLayer(layerId);
			renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, this._renderOptions);
		});

		renderer.endRender();

		this._currentRenderStates = renderStates;
	}

	getCurrentRenderStates() {
		return this._currentRenderStates;
	}

	getTextureA() {
		return this._renderTarget.texture;
	}

	getTextureB() {
		return this._renderTarget._attachments[ATTACHMENT.COLOR_ATTACHMENT1];
	}

	getTextureC() {
		return this._renderTarget._attachments[ATTACHMENT.COLOR_ATTACHMENT2];
	}

	getDepthTexture() {
		return this._renderTarget._attachments[ATTACHMENT.DEPTH_STENCIL_ATTACHMENT];
	}

	dispose() {
		this._renderTarget.dispose();
		materialCache.dispose();
	}

}

class MaterialCache {

	constructor() {
		this._map = new Map();
		this._state = {};
	}

	_getState(renderable) {
		const state = this._state;

		state.useFlatShading = !renderable.geometry.attributes['a_Normal'] || (renderable.material.shading === SHADING_TYPE.FLAT_SHADING);
		state.useDiffuseMap = !!renderable.material.diffuseMap;
		state.useRoughnessMap = !!renderable.material.roughnessMap;
		state.useMetalnessMap = !!renderable.material.metalnessMap;
		state.useAOMap = !!renderable.material.aoMap;
		state.useEmissiveMap = !!renderable.material.emissiveMap;
		state.useSkinning = renderable.object.isSkinnedMesh && renderable.object.skeleton;
		state.morphTargets = !!renderable.object.morphTargetInfluences;
		state.morphNormals = !!renderable.object.morphTargetInfluences && renderable.object.geometry.morphAttributes.normal;
		state.drawMode = renderable.material.drawMode;
		let maxBones = 0;
		if (state.useSkinning) {
			if (renderable.object.skeleton.boneTexture) {
				maxBones = 1024;
			} else {
				maxBones = renderable.object.skeleton.bones.length;
			}
		}
		state.maxBones = maxBones;
	}

	getMaterial(renderable) {
		const state = this._state;

		this._getState(renderable);

		const key = JSON.stringify(state); // TODO slow

		let material = this._map.get(key);

		if (!material) {
			material = new ShaderMaterial(gBufferShader);
			material.shading = state.useFlatShading ? SHADING_TYPE.FLAT_SHADING : SHADING_TYPE.SMOOTH_SHADING;
			material.alphaTest = state.useDiffuseMap ? 0.999 : 0; // ignore if alpha < 0.99
			this._map.set(key, material);
		}

		material.diffuse.copy(renderable.material.diffuse);
		material.diffuseMap = renderable.material.diffuseMap;
		material.uniforms.roughness = renderable.material.roughness !== undefined ? renderable.material.roughness : 0.5;
		material.roughnessMap = renderable.material.roughnessMap;
		material.uniforms.metalness = renderable.material.metalness !== undefined ? renderable.material.metalness : 0.5;
		material.metalnessMap = renderable.material.metalnessMap;

		material.aoMap = renderable.material.aoMap;
		if (state.useAOMap) {
			material.aoMapIntensity = renderable.material.aoMapIntensity;
			material.aoMapCoord = renderable.material.aoMapCoord; // TODO move coord to state
			material.aoMapTransform.copy(renderable.material.aoMapTransform);
		}

		material.emissive.copy(renderable.material.emissive);
		material.emissiveMap = renderable.material.emissiveMap;
		if (state.useEmissiveMap) {
			material.emissiveMapCoord = renderable.material.emissiveMapCoord; // TODO move coord to state
			material.emissiveMapTransform.copy(renderable.material.emissiveMapTransform);
		}

		return material;
	}

	dispose() {
		this._map.forEach(material => material.dispose());
		this._map.clear();
	}

}

const materialCache = new MaterialCache();

const gBufferShader = {
	name: 'gbuffer_mrt',
	defines: {},
	uniforms: {
		roughness: 0.5,
		metalness: 0.5
	},
	vertexShader: `
		#include <common_vert>
		#include <morphtarget_pars_vert>
		#include <skinning_pars_vert>
		#include <normal_pars_vert>
		#include <uv_pars_vert>
		#include <modelPos_pars_vert>
		#include <aoMap_pars_vert>
		#include <emissiveMap_pars_vert>
		void main() {
			#include <begin_vert>
			#include <morphtarget_vert>
			#include <morphnormal_vert>
			#include <skinning_vert>
			#include <skinnormal_vert>
			#include <normal_vert>
			#include <pvm_vert>
			#include <uv_vert>
			#include <modelPos_vert>
			#include <aoMap_vert>
			#include <emissiveMap_vert>
		}
	`,
	fragmentShader: `
		#include <common_frag>
		#include <diffuseMap_pars_frag>

		#include <uv_pars_frag>

		#include <packing>
		#include <normal_pars_frag>

		uniform vec3 emissive;

		uniform float roughness;
		uniform float metalness;

		#ifdef USE_ROUGHNESSMAP
			uniform sampler2D roughnessMap;
		#endif

		#ifdef USE_METALNESSMAP
			uniform sampler2D metalnessMap;
		#endif

		#include <modelPos_pars_frag>

		#include <aoMap_pars_frag>
		#include <emissiveMap_pars_frag>

		vec2 unitVectorToOctahedron(vec3 v) {
			vec2 p = v.xy / dot(vec3(1.0), abs(v));
			return v.z < 0.0 ? (1.0 - abs(p.yx)) * sign(p.xy) : p;
		}

		void main() {
			vec4 outColor = vec4(u_Color, 1.0);
			#include <diffuseMap_frag>

			#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)
				float alpha = outColor.a * u_Opacity;
				if(alpha < ALPHATEST) discard;
			#endif

			#ifdef FLAT_SHADED
				vec3 fdx = dFdx(v_modelPos);
				vec3 fdy = dFdy(v_modelPos);
				vec3 normal = normalize(cross(fdx, fdy));
			#else
				vec3 normal = normalize(v_Normal);
				#ifdef DOUBLE_SIDED
					normal = normal * (float(gl_FrontFacing) * 2.0 - 1.0);
				#endif 
			#endif

			float roughnessFactor = roughness;
			#ifdef USE_ROUGHNESSMAP
				roughnessFactor *= texture2D(roughnessMap, v_Uv).g;
			#endif

			float metalnessFactor = metalness;
			#ifdef USE_METALNESSMAP
				metalnessFactor *= texture2D(metalnessMap, v_Uv).b;
			#endif

			float ambientOcclusion = 0.0;
			#ifdef USE_AOMAP
				ambientOcclusion = (1.0 - texture2D(aoMap, vAOMapUV).r) * aoMapIntensity;
			#endif

			vec3 totalEmissiveRadiance = emissive;
			#include <emissiveMap_frag>

			vec2 packedNormal = unitVectorToOctahedron(normal);

			gl_FragData[0] = vec4(packedNormal, metalnessFactor, roughnessFactor);
			gl_FragData[1] = vec4(outColor.rgb, ambientOcclusion);
			gl_FragData[2] = vec4(totalEmissiveRadiance, 1.0);
		}
	`
};

export { GBuffer };