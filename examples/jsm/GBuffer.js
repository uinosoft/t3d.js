/**
 * GBuffer
 */

import {
	ATTACHMENT,
	Matrix4,
	RenderTarget2D,
	SHADING_TYPE,
	ShaderMaterial,
	ShaderPostPass,
	Texture2D,
	PIXEL_FORMAT,
	PIXEL_TYPE,
	TEXTURE_FILTER
} from 't3d';

var GBuffer = (function() {
	var debugTypes = {
		normal: 0,
		depth: 1,
		position: 2,
		glossiness: 3,
		metalness: 4,
		albedo: 5,
		velocity: 6
	};

	var helpMatrix4 = new Matrix4();

	var MaterialCache = function() {
		var normalGlossinessMaterials = new Map();
		var albedoMetalnessMaterials = new Map();
		var motionMaterials = new Map();
		var MRTMaterials = new Map();

		var state = {};

		function generateMaterialState(renderable, result) {
			result.useFlatShading = !renderable.geometry.attributes["a_Normal"] || (renderable.material.shading === SHADING_TYPE.FLAT_SHADING);
			result.useDiffuseMap = !!renderable.material.diffuseMap;
			result.useRoughnessMap = !!renderable.material.roughnessMap;
			result.useMetalnessMap = !!renderable.material.metalnessMap;
			result.useSkinning = renderable.object.isSkinnedMesh && renderable.object.skeleton;
			result.morphTargets = !!renderable.object.morphTargetInfluences;
			result.morphNormals = !!renderable.object.morphTargetInfluences && renderable.object.geometry.morphAttributes.normal;
			result.drawMode = renderable.material.drawMode;
			result.isSkyBox = renderable.material.shaderName == 'skybox';
			var maxBones = 0;
			if (result.useSkinning) {
				if (renderable.object.skeleton.boneTexture) {
					maxBones = 1024;
				} else {
					maxBones = renderable.object.skeleton.bones.length;
				}
			}
			result.maxBones = maxBones;
		}

		function getMrtMaterial(renderable) {
			generateMaterialState(renderable, state);

			var material;
			var code = state.useFlatShading +
				"_" + state.useDiffuseMap +
				"_" + state.useRoughnessMap +
				"_" + state.useMetalnessMap +
				"_" + state.useSkinning +
				"_" + state.morphTargets +
				"_" + state.morphNormals;
			if (!MRTMaterials.has(code)) {
				material = new ShaderMaterial(GBufferShader.MRT);
				material.shading = state.useFlatShading ? SHADING_TYPE.FLAT_SHADING : SHADING_TYPE.SMOOTH_SHADING;
				material.alphaTest = state.useDiffuseMap ? 0.999 : 0; // ignore if alpha < 0.99
				MRTMaterials.set(code, material);
			} else {
				material = MRTMaterials.get(code);
			}

			material.diffuse.copy(renderable.material.diffuse);
			material.diffuseMap = renderable.material.diffuseMap;
			material.uniforms["roughness"] = renderable.material.roughness !== undefined ? renderable.material.roughness : 0.5;
			material.roughnessMap = renderable.material.roughnessMap;
			material.uniforms["metalness"] = renderable.material.metalness !== undefined ? renderable.material.metalness : 0.5;
			material.metalnessMap = renderable.material.metalnessMap;

			return material;
		}

		function getNormalGlossinessMaterial(renderable) {
			generateMaterialState(renderable, state);

			var material;
			var code = state.useFlatShading +
				"_" + state.useDiffuseMap +
				"_" + state.useRoughnessMap +
				"_" + state.useSkinning +
				"_" + state.morphTargets +
				"_" + state.morphNormals;
			if (!normalGlossinessMaterials.has(code)) {
				material = new ShaderMaterial(GBufferShader.normalGlossiness);
				material.shading = state.useFlatShading ? SHADING_TYPE.FLAT_SHADING : SHADING_TYPE.SMOOTH_SHADING;
				material.alphaTest = state.useDiffuseMap ? 0.999 : 0; // ignore if alpha < 0.99
				normalGlossinessMaterials.set(code, material);
			} else {
				material = normalGlossinessMaterials.get(code);
			}

			material.diffuseMap = renderable.material.diffuseMap;
			material.uniforms["roughness"] = renderable.material.roughness !== undefined ? renderable.material.roughness : 0.5;
			material.roughnessMap = renderable.material.roughnessMap;

			return material;
		}

		function getAlbedoMetalnessMaterial(renderable) {
			generateMaterialState(renderable, state);

			var material;
			var code = state.useFlatShading +
				"_" + state.useDiffuseMap +
				"_" + state.useMetalnessMap +
				"_" + state.useSkinning +
				"_" + state.morphTargets +
				"_" + state.morphNormals;
			if (!albedoMetalnessMaterials.has(code)) {
				material = new ShaderMaterial(GBufferShader.albedoMetalness);
				material.shading = state.useFlatShading ? SHADING_TYPE.FLAT_SHADING : SHADING_TYPE.SMOOTH_SHADING;
				material.alphaTest = state.useDiffuseMap ? 0.999 : 0; // ignore if alpha < 0.99
				albedoMetalnessMaterials.set(code, material);
			} else {
				material = albedoMetalnessMaterials.get(code);
			}

			material.diffuse.copy(renderable.material.diffuse);
			material.diffuseMap = renderable.material.diffuseMap;
			material.uniforms["metalness"] = renderable.material.metalness !== undefined ? renderable.material.metalness : 0.5;
			material.metalnessMap = renderable.material.metalnessMap;

			return material;
		}

		function getMotionMaterial(renderable) {
			generateMaterialState(renderable, state);

			var material;
			var code = state.useSkinning +
				"_" + state.maxBones +
				"_" + state.morphTargets +
				"_" + state.drawMode +
				"_" + state.isSkyBox;
			if (!motionMaterials.has(code)) {
				material = new ShaderMaterial(GBufferShader.motion);
				material.side = renderable.material.side;
				material.drawMode = renderable.material.drawMode;
				if (state.isSkyBox) {
					material.defines['IS_SKY'] = true;
				}
				motionMaterials.set(code, material);
			} else {
				material = motionMaterials.get(code);
			}

			if (renderable.object.userData['prevModel'] && renderable.object.userData['prevView'] && renderable.object.userData['prevProjection']) {
				helpMatrix4.fromArray(renderable.object.userData['prevModel']).toArray(material.uniforms['prevModel']);
				helpMatrix4.fromArray(renderable.object.userData['prevView']).toArray(material.uniforms['prevView']);
				helpMatrix4.fromArray(renderable.object.userData['prevProjection']).toArray(material.uniforms['prevProjection']);
				material.uniforms['firstRender'] = false;

				if (renderable.object.userData['prevBoneTexture']) {
					material.uniforms['prevBoneTexture'] = renderable.object.userData['prevBoneTexture'];
					material.uniforms['prevBoneTextureSize'] = renderable.object.userData['prevBoneTexture'].image.width;
				} else if (renderable.object.userData['prevBoneMatrices']) {
					material.uniforms['prevBoneMatrices'] = renderable.object.userData['prevBoneMatrices'];
				}
			} else {
				material.uniforms['firstRender'] = true;
			}

			return material;
		}

		return {
			getMrtMaterial: getMrtMaterial,
			getNormalGlossinessMaterial: getNormalGlossinessMaterial,
			getAlbedoMetalnessMaterial: getAlbedoMetalnessMaterial,
			getMotionMaterial: getMotionMaterial
		}
	}

	var materialCache = new MaterialCache();

	function GBuffer(width, height) {
		this._renderTarget1 = new RenderTarget2D(width, height);
		this._renderTarget1.texture.minFilter = TEXTURE_FILTER.NEAREST;
		this._renderTarget1.texture.magFilter = TEXTURE_FILTER.NEAREST;
		this._renderTarget1.texture.type = PIXEL_TYPE.HALF_FLOAT;
		this._renderTarget1.texture.generateMipmaps = false;

		this._depthTexture = new Texture2D();
		this._depthTexture.image = { data: null, width: 4, height: 4 };
		this._depthTexture.type = PIXEL_TYPE.UNSIGNED_INT_24_8; // higher precision for depth
		this._depthTexture.format = PIXEL_FORMAT.DEPTH_STENCIL;
		this._depthTexture.magFilter = TEXTURE_FILTER.NEAREST;
		this._depthTexture.minFilter = TEXTURE_FILTER.NEAREST;
		this._depthTexture.generateMipmaps = false;
		this._depthTexture.flipY = false;
		this._renderTarget1.attach(
			this._depthTexture,
			ATTACHMENT.DEPTH_STENCIL_ATTACHMENT
		);

		this._texture2 = new Texture2D();
		this._texture2.minFilter = TEXTURE_FILTER.LINEAR;
		this._texture2.magFilter = TEXTURE_FILTER.LINEAR;
		this._texture2.generateMipmaps = false;

		this._useMRT = false;

		this._renderTarget2 = new RenderTarget2D(width, height);
		this._renderTarget2.texture.minFilter = TEXTURE_FILTER.LINEAR;
		this._renderTarget2.texture.magFilter = TEXTURE_FILTER.LINEAR;
		this._renderTarget2.texture.generateMipmaps = false;

		this._renderTarget3 = new RenderTarget2D(width, height);
		this._renderTarget3.texture.type = PIXEL_TYPE.HALF_FLOAT;
		this._renderTarget3.texture.minFilter = TEXTURE_FILTER.NEAREST;
		this._renderTarget3.texture.magFilter = TEXTURE_FILTER.NEAREST;
		this._renderTarget3.texture.generateMipmaps = false;

		this._debugPass = new ShaderPostPass(GBufferShader.debug);

		this.enableNormalGlossiness = true;

		this.enableAlbedoMetalness = true;

		this.enableMotion = false;
	}

	Object.assign(GBuffer.prototype, {

		/**
         * Set G Buffer size.
         * @param {Number} width
         * @param {Number} height
         */
		resize: function(width, height) {
			this._renderTarget1.resize(width, height);
			this._renderTarget2.resize(width, height);
			this._renderTarget3.resize(width, height);
		},

		update: function(renderer, scene, camera) {
			var renderStates = scene.getRenderStates(camera);
			var renderQueueLayer = scene.getRenderQueue(camera).layerList[0]; // now just render layer 0

			// Use MRT if support
			if (renderer.capabilities.version >= 2) { // renderer.capabilities.getExtension('WEBGL_draw_buffers') has bug here
				if (!this._useMRT) {
					this._useMRT = true;

					// if (renderer.capabilities.version >= 2) {
					var ext = renderer.capabilities.getExtension("EXT_color_buffer_float");
					if (ext) {
						this._renderTarget1.texture.type = PIXEL_TYPE.HALF_FLOAT; // FLOAT ?
					} else {
						this._renderTarget1.texture.type = PIXEL_TYPE.UNSIGNED_BYTE;
					}

					this._depthTexture.type = PIXEL_TYPE.UNSIGNED_INT_24_8; // FLOAT_32_UNSIGNED_INT_24_8_REV
					// }

					this._renderTarget1.attach(
						this._texture2,
						ATTACHMENT.COLOR_ATTACHMENT1
					);
				}

				renderer.setRenderTarget(this._renderTarget1);

				renderer.setClearColor(0, 0, 0, 0);
				renderer.clear(true, true, true);

				renderer.beginRender();
				renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, {
					getMaterial: function(renderable) {
						return materialCache.getMrtMaterial(renderable);
					},
					ifRender: function(renderable) {
						return !!renderable.geometry.getAttribute("a_Normal");
					}
				});
				renderer.endRender();
			} else {
				// render normalDepthRenderTarget

				if (this.enableNormalGlossiness) {
					renderer.setRenderTarget(this._renderTarget1);

					renderer.setClearColor(0, 0, 0, 0);
					renderer.clear(true, true, true);

					renderer.beginRender();
					renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, {
						getMaterial: function(renderable) {
							return materialCache.getNormalGlossinessMaterial(renderable);
						},
						ifRender: function(renderable) {
							return !!renderable.geometry.getAttribute("a_Normal");
						}
					});
					renderer.endRender();
				}

				// render albedoMetalnessRenderTarget

				if (this.enableAlbedoMetalness) {
					renderer.setRenderTarget(this._renderTarget2);

					renderer.setClearColor(0, 0, 0, 0);
					renderer.clear(true, true, true);

					renderer.beginRender();
					renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, {
						getMaterial: function(renderable) {
							return materialCache.getAlbedoMetalnessMaterial(renderable);
						},
						ifRender: function(renderable) {
							return !!renderable.geometry.getAttribute("a_Normal");
						}
					});
					renderer.endRender();
				}
			}

			// render motionRenderTarget

			if (this.enableMotion) {
				renderer.setRenderTarget(this._renderTarget3);

				renderer.setClearColor(0, 0, 0, 0);
				renderer.clear(true, true, true);

				var renderConfig = {
					getMaterial: function(renderable) {
						return materialCache.getMotionMaterial(renderable);
					},
					afterRender: function(renderable) {
						if (!renderable.object.userData['prevModel']) {
							renderable.object.userData['prevModel'] = new Float32Array(16);
						}
						renderable.object.worldMatrix.toArray(renderable.object.userData['prevModel']);

						if (!renderable.object.userData['prevProjection']) {
							renderable.object.userData['prevProjection'] = new Float32Array(16);
						}
						helpMatrix4.copy(camera.viewMatrix).toArray(renderable.object.userData['prevView']);

						if (!renderable.object.userData['prevView']) {
							renderable.object.userData['prevView'] = new Float32Array(16);
						}
						helpMatrix4.copy(camera.projectionMatrix).toArray(renderable.object.userData['prevProjection']);

						if (renderable.object.skeleton) {
							if (renderable.object.skeleton.boneTexture) {
								if (!renderable.object.userData['prevBoneTexture']) {
									var oldTexture = renderable.object.skeleton.boneTexture;
									var newTexture = oldTexture.clone();
									newTexture.image = {
										width: oldTexture.image.width,
										height: oldTexture.image.height,
										data: new Float32Array(oldTexture.image.data.length)
									};
									renderable.object.userData['prevBoneTexture'] = newTexture;
								}

								renderable.object.userData['prevBoneTexture'].image.data.set(renderable.object.skeleton.boneTexture.image.data);
								renderable.object.userData['prevBoneTexture'].version++;
							} else {
								if (!renderable.object.userData['prevBoneMatrices']) {
									renderable.object.userData['prevBoneMatrices'] = new Float32Array(skeleton.boneMatrices.length);
								}
								renderable.object.userData['prevBoneMatrices'].set(skeleton.boneMatrices);
							}
						}

						// TODO support morph targets
					}
				};

				renderer.beginRender();
				renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, renderConfig);
				renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, renderConfig);
				renderer.endRender();
			}
		},

		/**
         * Debug output of gBuffer. Use `type` parameter to choos the debug output type, which can be:
         *
         * + 'normal'
         * + 'depth'
         * + 'position'
         * + 'glossiness'
         * + 'metalness'
         * + 'albedo'
		 * + 'velocity'
         *
         * @param {t3d.ThinRenderer} renderer
         * @param {t3d.Camera} camera
         * @param {String} [type='normal']
         */
		renderDebug: function(renderer, camera, type) {
			var currentRenderTarget = renderer.getRenderTarget();

			this._debugPass.uniforms["normalGlossinessTexture"] = this.getNormalGlossinessTexture();
			this._debugPass.uniforms["depthTexture"] = this.getDepthTexture();
			this._debugPass.uniforms["albedoMetalnessTexture"] = this.getAlbedoMetalnessTexture();
			this._debugPass.uniforms["motionTexture"] = this.getMotionTexture();
			this._debugPass.uniforms["debug"] = debugTypes[type] || 0;
			this._debugPass.uniforms["viewWidth"] = currentRenderTarget.width;
			this._debugPass.uniforms["viewHeight"] = currentRenderTarget.height;
			helpMatrix4.multiplyMatrices(camera.projectionMatrix, camera.viewMatrix).inverse();
			this._debugPass.uniforms["matProjViewInverse"].set(helpMatrix4.elements);
			this._debugPass.render(renderer);
		},

		/**
         * Get normal glossiness texture.
         * Channel storage:
         * + R: normal.x * 0.5 + 0.5
         * + G: normal.y * 0.5 + 0.5
         * + B: normal.z * 0.5 + 0.5
         * + A: glossiness
         * @return {Texture2D}
         */
		getNormalGlossinessTexture: function() {
			return this._renderTarget1.texture;
		},

		/**
         * Get depth texture.
         * Channel storage:
         * + R: depth
         * @return {TextureDepth}
         */
		getDepthTexture: function() {
			return this._depthTexture;
		},

		/**
         * Get albedo metalness texture.
         * Channel storage:
         * + R: albedo.r
         * + G: albedo.g
         * + B: albedo.b
         * + A: metalness
         * @return {Texture2D}
         */
		getAlbedoMetalnessTexture: function() {
			return this._useMRT ? this._texture2 : this._renderTarget2.texture;
		},

		/**
         * Get motion texture.
         * Channel storage:
         * + R: velocity.x
         * + G: velocity.y
         * @return {Texture2D}
         */
		getMotionTexture: function() {
			return this._renderTarget3.texture;
		},

		dispose: function() {
			this._renderTarget1.dispose();
			this._renderTarget2.dispose();
			this._renderTarget3.dispose();

			this._depthTexture.dispose();
			this._texture2.dispose();

			materialCache.MRTMaterials.forEach(material => material.dispose());
			materialCache.normalGlossinessMaterials.forEach(material => material.dispose());
			materialCache.albedoMetalnessMaterials.forEach(material => material.dispose());
			materialCache.motionMaterials.forEach(material => material.dispose());

			materialCache.MRTMaterials.clear();
			materialCache.normalGlossinessMaterials.clear();
			materialCache.albedoMetalnessMaterials.clear();
			materialCache.motionMaterials.clear();
		}

	});

	var GBufferShader = {

		normalGlossiness: {

			uniforms: {

				roughness: 0.5

			},

			vertexShader: [

				"#include <common_vert>",
				"#include <morphtarget_pars_vert>",
				"#include <skinning_pars_vert>",
				"#include <normal_pars_vert>",
				"#include <uv_pars_vert>",
				"void main() {",
				"	#include <uv_vert>",
				"	#include <begin_vert>",
				"	#include <morphtarget_vert>",
				"	#include <morphnormal_vert>",
				"	#include <skinning_vert>",
				"	#include <skinnormal_vert>",
				"	#include <normal_vert>",
				"	#include <pvm_vert>",
				"}"

			].join("\n"),

			fragmentShader: [

				"#include <common_frag>",
				"#include <diffuseMap_pars_frag>",

				"#include <uv_pars_frag>",

				"#include <packing>",
				"#include <normal_pars_frag>",

				"uniform float roughness;",

				"#ifdef USE_ROUGHNESSMAP",
				"	uniform sampler2D roughnessMap;",
				"#endif",

				"void main() {",
				"	#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)",
				"		vec4 texelColor = texture2D( diffuseMap, v_Uv );",

				"		float alpha = texelColor.a * u_Opacity;",
				"		if(alpha < ALPHATEST) discard;",
				"	#endif",

				"	vec3 normal = normalize(v_Normal);",

				"	float roughnessFactor = roughness;",
				"	#ifdef USE_ROUGHNESSMAP",
				"		roughnessFactor *= texture2D( roughnessMap, v_Uv ).g;",
				"	#endif",

				"	vec4 packedNormalGlossiness;",
				"	packedNormalGlossiness.xyz = normal * 0.5 + 0.5;",
				"	packedNormalGlossiness.w = clamp(1. - roughnessFactor, 0., 1.);",

				"	gl_FragColor = packedNormalGlossiness;",
				"}"

			].join("\n")

		},

		albedoMetalness: {

			uniforms: {

				metalness: 0.5

			},

			vertexShader: [
				"#include <common_vert>",
				"#include <uv_pars_vert>",
				"#include <color_pars_vert>",
				"#include <envMap_pars_vert>",
				"#include <morphtarget_pars_vert>",
				"#include <skinning_pars_vert>",
				"void main() {",
				"	#include <begin_vert>",
				"	#include <morphtarget_vert>",
				"	#include <skinning_vert>",
				"	#include <pvm_vert>",
				"	#include <uv_vert>",
				"	#include <color_vert>",
				"}"
			].join("\n"),

			fragmentShader: [

				"uniform vec3 u_Color;",
				"uniform float metalness;",

				"#include <uv_pars_frag>",
				"#include <diffuseMap_pars_frag>",

				"#ifdef USE_METALNESSMAP",
				"	uniform sampler2D metalnessMap;",
				"#endif",

				"void main() {",
				"	vec4 outColor = vec4( u_Color, 1.0 );",
				"	#include <diffuseMap_frag>",
				"	vec3 diffuseColor = outColor.xyz * outColor.a;",

				"	float metalnessFactor = metalness;",
				"	#ifdef USE_METALNESSMAP",
				"		metalnessFactor *= texture2D( metalnessMap, v_Uv ).b;",
				"	#endif",

				"	gl_FragColor = vec4( diffuseColor.xyz, metalnessFactor );",
				"}"

			].join("\n")

		},

		motion: {
			uniforms: {

				prevModel: new Float32Array(16),
				prevView: new Float32Array(16),
				prevProjection: new Float32Array(16),

				prevBoneTexture: null,
				prevBoneTextureSize: 256,
				prevBoneMatrices: new Float32Array(),

				firstRender: false

			},

			vertexShader: [
				"#include <common_vert>",
				"#include <morphtarget_pars_vert>",
				"#include <skinning_pars_vert>",

				"uniform mat4 prevModel;",
				"uniform mat4 prevView;",
				"uniform mat4 prevProjection;",

				"varying vec4 v_ScreenPosition;",
				"varying vec4 v_PrevScreenPosition;",

				"#ifdef USE_SKINNING",
				"	#ifdef BONE_TEXTURE",
				"		uniform sampler2D prevBoneTexture;",
				"		uniform int prevBoneTextureSize;",
				"		mat4 getPrevBoneMatrix(const in float i) {",
				"			float j = i * 4.0;",
				"			float x = mod( j, float( prevBoneTextureSize ) );",
				"			float y = floor( j / float( prevBoneTextureSize ) );",

				"			float dx = 1.0 / float( prevBoneTextureSize );",
				"			float dy = 1.0 / float( prevBoneTextureSize );",

				"			y = dy * ( y + 0.5 );",

				"			vec4 v1 = texture2D( prevBoneTexture, vec2( dx * ( x + 0.5 ), y ) );",
				"			vec4 v2 = texture2D( prevBoneTexture, vec2( dx * ( x + 1.5 ), y ) );",
				"			vec4 v3 = texture2D( prevBoneTexture, vec2( dx * ( x + 2.5 ), y ) );",
				"			vec4 v4 = texture2D( prevBoneTexture, vec2( dx * ( x + 3.5 ), y ) );",

				"			mat4 bone = mat4( v1, v2, v3, v4 );",

				"			return bone;",
				"		}",
				"	#else",
				"		uniform mat4 prevBoneMatrices[MAX_BONES];",
				"		mat4 getPrevBoneMatrix(const in float i) {",
				"			mat4 bone = prevBoneMatrices[int(i)];",
				"			return bone;",
				"		}",
				"	#endif",
				"#endif",
				"#ifdef IS_SKY",
				"	mat4 clearMat4Translate(mat4 m) {",
				"		mat4 outMatrix = m;",
				"		outMatrix[3].xyz = vec3(0., 0., 0.);",
				"		return outMatrix;",
				"	}",
				"#endif",
				"void main() {",
				"	#include <begin_vert>",

				"	vec3 prevTransformed = transformed;",

				"	#include <morphtarget_vert>",
				"	#include <skinning_vert>",
				"	#include <pvm_vert>",

				"	#ifdef USE_SKINNING",
				"		mat4 prevBoneMatX = getPrevBoneMatrix( skinIndex.x );",
				"		mat4 prevBoneMatY = getPrevBoneMatrix( skinIndex.y );",
				"		mat4 prevBoneMatZ = getPrevBoneMatrix( skinIndex.z );",
				"		mat4 prevBoneMatW = getPrevBoneMatrix( skinIndex.w );",

				"		vec4 prevSkinVertex = bindMatrix * vec4(prevTransformed, 1.0);",

				"		vec4 prevSkinned = vec4( 0.0 );",
				"		prevSkinned += prevBoneMatX * prevSkinVertex * skinWeight.x;",
				"		prevSkinned += prevBoneMatY * prevSkinVertex * skinWeight.y;",
				"		prevSkinned += prevBoneMatZ * prevSkinVertex * skinWeight.z;",
				"		prevSkinned += prevBoneMatW * prevSkinVertex * skinWeight.w;",
				"		prevSkinned = bindMatrixInverse * prevSkinned;",

				"		prevTransformed = prevSkinned.xyz / prevSkinned.w;",
				"	#endif",
				"	#ifdef IS_SKY",
				"		v_ScreenPosition = u_Projection * clearMat4Translate(u_View) * u_Model * vec4(transformed, 1.0);",
				"		v_PrevScreenPosition = prevProjection * clearMat4Translate(prevView) * prevModel * vec4(prevTransformed, 1.0);",
				"		gl_Position = u_Projection * clearMat4Translate(u_View) * u_Model * vec4(transformed, 1.0);",
				"		gl_Position.z = gl_Position.w;",
				"	#else",
				"		v_ScreenPosition = u_ProjectionView * u_Model * vec4(transformed, 1.0);",
				"		v_PrevScreenPosition = prevProjection * prevView * prevModel * vec4(prevTransformed, 1.0);",
				"	#endif",
				"}"
			].join("\n"),

			fragmentShader: [
				"uniform bool firstRender;",

				"varying vec4 v_ScreenPosition;",
				"varying vec4 v_PrevScreenPosition;",

				"void main() {",
				"	vec2 a = v_ScreenPosition.xy / v_ScreenPosition.w;",
				"	vec2 b = v_PrevScreenPosition.xy / v_PrevScreenPosition.w;",

				"	if (firstRender) {",
				"		gl_FragColor = vec4(0.0);",
				"	} else {",
				"		gl_FragColor = vec4((a - b) * 0.5 + 0.5, 0.0, 1.0);",
				"	}",
				"}"
			].join("\n"),
		},

		MRT: {

			uniforms: {

				roughness: 0.5,
				metalness: 0.5

			},

			vertexShader: [
				"#include <common_vert>",
				"#include <uv_pars_vert>",
				"#include <normal_pars_vert>",
				"#include <color_pars_vert>",
				"#include <envMap_pars_vert>",
				"#include <morphtarget_pars_vert>",
				"#include <skinning_pars_vert>",
				"void main() {",
				"	#include <begin_vert>",
				"	#include <morphtarget_vert>",
				"	#include <morphnormal_vert>",
				"	#include <skinning_vert>",
				"	#include <skinnormal_vert>",
				"	#include <pvm_vert>",
				"	#include <uv_vert>",
				"	#include <normal_vert>",
				"	#include <color_vert>",
				"}"
			].join("\n"),

			fragmentShader: [

				"#extension GL_EXT_draw_buffers : require",

				"#include <common_frag>",
				"#include <diffuseMap_pars_frag>",

				"#include <uv_pars_frag>",

				"#include <packing>",
				"#include <normal_pars_frag>",

				"uniform float roughness;",
				"uniform float metalness;",

				"#ifdef USE_ROUGHNESSMAP",
				"	uniform sampler2D roughnessMap;",
				"#endif",

				"#ifdef USE_METALNESSMAP",
				"	uniform sampler2D metalnessMap;",
				"#endif",

				"void main() {",
				"	vec4 outColor = vec4( u_Color, 1.0 );",
				"	#include <diffuseMap_frag>",
				"	vec3 diffuseColor = outColor.xyz * outColor.a;",

				"	float metalnessFactor = metalness;",
				"	#ifdef USE_METALNESSMAP",
				"		metalnessFactor *= texture2D( metalnessMap, v_Uv ).b;",
				"	#endif",

				"	gl_FragData[1] = vec4( outColor.xyz, metalnessFactor );",

				"	#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)",
				"		float alpha = outColor.a * u_Opacity;",
				"		if(alpha < ALPHATEST) discard;",
				"	#endif",

				"	vec3 normal = normalize(v_Normal);",

				"	float roughnessFactor = roughness;",
				"	#ifdef USE_ROUGHNESSMAP",
				"		roughnessFactor *= texture2D( roughnessMap, v_Uv ).g;",
				"	#endif",

				"	vec4 packedNormalGlossiness;",
				"	packedNormalGlossiness.xyz = normal * 0.5 + 0.5;",
				"	packedNormalGlossiness.w = clamp(1. - roughnessFactor, 0., 1.);",

				"	gl_FragData[0] = packedNormalGlossiness;",
				"}"

			].join("\n")

		},

		debug: {

			defines: {
				ARROW_TILE_SIZE: '32.0'
			},

			uniforms: {

				normalGlossinessTexture: null,
				depthTexture: null,
				albedoMetalnessTexture: null,
				motionTexture: null,

				debug: 0,

				viewWidth: 800,
				viewHeight: 600,

				velocityThreshold: 0.01,
				arrowScale: 4.8,

				matProjViewInverse: new Float32Array(16)

			},

			vertexShader: [

				"attribute vec3 a_Position;",

				"uniform mat4 u_ProjectionView;",
				"uniform mat4 u_Model;",

				"void main() {",

				"	gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

				"}"

			].join('\n'),

			fragmentShader: [

				"uniform sampler2D normalGlossinessTexture;",
				"uniform sampler2D depthTexture;",
				"uniform sampler2D albedoMetalnessTexture;",
				"uniform sampler2D motionTexture;",

				// DEBUG
				// - 0: normal
				// - 1: depth
				// - 2: position
				// - 3: glossiness
				// - 4: metalness
				// - 5: albedo
				// - 6: velocity
				"uniform int debug;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",
				"uniform mat4 matProjViewInverse;",

				"uniform float velocityThreshold;",
				"uniform float arrowScale;",

				// 2D vector field visualization by Matthias Reitinger, @mreitinger
				// Based on "2D vector field visualization by Morgan McGuire, http://casual-effects.com", shadertoy.com/view/4s23DG

				// Computes the center pixel of the tile containing pixel pos
				"vec2 arrowTileCenterCoord(vec2 pos) {",
				"	return (floor(pos / ARROW_TILE_SIZE) + 0.5) * ARROW_TILE_SIZE;",
				"}",

				// Computes the signed distance from a line segment
				"float line(vec2 p, vec2 p1, vec2 p2) {",
				"	vec2 center = (p1 + p2) * 0.5;",
				"	float len = length(p2 - p1);",
				"	vec2 dir = (p2 - p1) / len;",
				"	vec2 rel_p = p - center;",
				"	float dist1 = abs(dot(rel_p, vec2(dir.y, -dir.x)));",
				"	float dist2 = abs(dot(rel_p, dir)) - 0.5 * len;",
				"	return max(dist1, dist2);",
				"}",

				// v = field sampled at arrowTileCenterCoord(p), scaled by the length
				// desired in pixels for arrows
				// Returns a signed distance from the arrow
				"float arrow(vec2 p, vec2 v) {",
				// Make everything relative to the center, which may be fractional
				"	p -= arrowTileCenterCoord(p);",
				"	float mag_v = length(v), mag_p = length(p);",
				"	if (mag_v > 0.0) {",
				// Non-zero velocity case
				"		vec2 dir_v = v / mag_v;",
				// We can't draw arrows larger than the tile radius, so clamp magnitude.
				// Enforce a minimum length to help see direction
				"		mag_v = clamp(mag_v, 0.0, ARROW_TILE_SIZE * 0.5);",
				// Arrow tip location
				"		v = dir_v * mag_v;",
				// Signed distance from shaft
				"		float shaft = line(p, v, -v);",
				// Signed distance from head
				"		float head = min(line(p, v, 0.4 * v + 0.2 * vec2(-v.y, v.x)),",
				"						line(p, v, 0.4 * v + 0.2 * vec2(v.y, -v.x)));",
				"		return min(shaft, head);",
				"	} else {",
				// Signed distance from the center point
				"		return mag_p;",
				"	}",
				"}",

				"void main() {",

				"	vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );",

				"	vec4 texel1 = texture2D(normalGlossinessTexture, texCoord);",
				"	vec4 texel3 = texture2D(albedoMetalnessTexture, texCoord);",

				"	float glossiness = texel1.a;",
				"	float metalness = texel3.a;",

				"	vec3 N = texel1.rgb * 2.0 - 1.0;",

				// Depth buffer range is 0.0 - 1.0
				"	float z = texture2D(depthTexture, texCoord).r * 2.0 - 1.0;",

				"	vec2 xy = texCoord * 2.0 - 1.0;",

				"	vec4 projectedPos = vec4(xy, z, 1.0);",
				"	vec4 p4 = matProjViewInverse * projectedPos;",

				"	vec3 position = p4.xyz / p4.w;",

				"	vec3 albedo = texel3.rgb;",

				"	vec3 diffuseColor = albedo * (1.0 - metalness);",
				"	vec3 specularColor = mix(vec3(0.04), albedo, metalness);",

				"	if (debug == 0) {",
				"		gl_FragColor = vec4(N, 1.0);",
				"	} else if (debug == 1) {",
				"		if (dot(texel1.rgb, vec3(1.0)) == 0.0) {",
				"			discard;",
				"		}",
				"		gl_FragColor = vec4(vec3(z), 1.0);",
				"	} else if (debug == 2) {",
				"		if (dot(texel1.rgb, vec3(1.0)) == 0.0) {",
				"			discard;",
				"		}",
				"		gl_FragColor = vec4(position, 1.0);",
				"	} else if (debug == 3) {",
				"		gl_FragColor = vec4(vec3(glossiness), 1.0);",
				"	} else if (debug == 4) {",
				"		gl_FragColor = vec4(vec3(metalness), 1.0);",
				"	} else if (debug == 5) {",
				"		gl_FragColor = vec4(albedo, 1.0);",
				"	} else {",
				"		vec4 texel4 = texture2D(motionTexture, texCoord);",
				"		if(texel4.r == 0.){",
				"		  discard;",
				"		}",
				// shadertoy.com/view/ls2GWG
				"		float arrow_dist = arrow(gl_FragCoord.xy, (texel4.rg - 0.5) * ARROW_TILE_SIZE * arrowScale);",
				"		vec4 arrow_col = vec4(0, 0, 0, clamp(arrow_dist, 0.0, 1.0));",
				"		vec4 field_col = vec4(texel4.rg , 0.5, 1.0);",
				"		vec4 fColor = mix(vec4(1.0), field_col, arrow_col.a);",
				"		gl_FragColor = fColor;",
				"		if(length(texel4.rg - 0.5) < velocityThreshold){",
				"		  gl_FragColor = field_col;",
				"		}",
				"	}",
				"}"

			].join('\n')

		}


	};

	return GBuffer;
})();

export { GBuffer };