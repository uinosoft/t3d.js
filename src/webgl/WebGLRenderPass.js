import { WebGLPrograms } from './WebGLPrograms.js';
import { WebGLCapabilities } from './WebGLCapabilities.js';
import { WebGLConstants } from './WebGLConstants.js';
import { WebGLState } from './WebGLState.js';
import { WebGLTextures } from './WebGLTextures.js';
import { WebGLRenderBuffers } from './WebGLRenderBuffers.js';
import { WebGLRenderTargets } from './WebGLRenderTargets.js';
import { WebGLBuffers } from './WebGLBuffers.js';
import { WebGLGeometries } from './WebGLGeometries.js';
import { WebGLMaterials } from './WebGLMaterials.js';
import { WebGLVertexArrayBindings } from './WebGLVertexArrayBindings.js';
import { WebGLQueries } from './WebGLQueries.js';
import { Vector4 } from '../math/Vector4.js';
import { Matrix4 } from '../math/Matrix4.js';

const helpVector4 = new Vector4();
const helpMatrix4 = new Matrix4();

const influencesList = new WeakMap();
const morphInfluences = new Float32Array(8);

let _clippingPlanesData = new Float32Array([]);

function defaultGetGeometry(renderable) {
	return renderable.geometry;
}

function defaultGetMaterial(renderable) {
	return renderable.material;
}

function defaultIfRender(renderable) {
	return true;
}

function noop() { }

let _renderPassId = 0;

/**
 * WebGL Render Pass
 * @memberof t3d
 */
class WebGLRenderPass {

	/**
	 * @param {WebGLRenderingContext} gl
	 */
	constructor(gl) {
		this.gl = gl;

		this.id = 0;

		/**
		 * An object containing details about the capabilities of the current RenderingContext.
		 * @type {t3d.WebGLCapabilities}
		 */
		this.capabilities = null;

		/**
		 * The shader compiler options.
		 * @type {Object}
		 * @property {Boolean} checkErrors - Whether to use error checking when compiling shaders, defaults to true.
		 * @property {Boolean} compileAsynchronously - Whether to compile shaders asynchronously, defaults to false.
		 */
		this.shaderCompileOptions = {
			checkErrors: true,
			compileAsynchronously: false
		};

		this._textures = null;
		this._renderBuffers = null;
		this._renderTargets = null;
		this._buffers = null;
		this._geometries = null;
		this._programs = null;
		this._materials = null;
		this._state = null;
		this._vertexArrayBindings = null;
		this._queries = null;

		this.init();
	}

	/**
	 * Initialize the render pass.
	 * This method will be called automatically by the constructor.
	 * In the case of context lost, you can call this function to restart the render pass.
	 */
	init() {
		const gl = this.gl;
		const id = _renderPassId++;

		const capabilities = new WebGLCapabilities(gl);
		const constants = new WebGLConstants(gl, capabilities);
		const state = new WebGLState(gl, capabilities);
		const textures = new WebGLTextures(id, gl, state, capabilities, constants);
		const renderBuffers = new WebGLRenderBuffers(id, gl, capabilities, constants);
		const renderTargets = new WebGLRenderTargets(id, gl, state, capabilities, textures, renderBuffers, constants);
		const buffers = new WebGLBuffers(id, gl, capabilities);
		const vertexArrayBindings = new WebGLVertexArrayBindings(id, gl, capabilities, buffers);
		const geometries = new WebGLGeometries(id, gl, buffers, vertexArrayBindings);
		const programs = new WebGLPrograms(gl, state, capabilities);
		const materials = new WebGLMaterials(id, programs, vertexArrayBindings);
		const queries = new WebGLQueries(id, gl, capabilities);

		this.id = id;
		this.capabilities = capabilities;

		this._textures = textures;
		this._renderBuffers = renderBuffers;
		this._renderTargets = renderTargets;
		this._buffers = buffers;
		this._geometries = geometries;
		this._programs = programs;
		this._materials = materials;
		this._state = state;
		this._vertexArrayBindings = vertexArrayBindings;
		this._queries = queries;
	}

	/**
	 * Clear buffers.
	 * @param {Boolean} [color=false]
	 * @param {Boolean} [depth=false]
	 * @param {Boolean} [stencil=false]
	 */
	clear(color, depth, stencil) {
		const gl = this.gl;

		let bits = 0;

		if (color === undefined || color) bits |= gl.COLOR_BUFFER_BIT;
		if (depth === undefined || depth) bits |= gl.DEPTH_BUFFER_BIT;
		if (stencil === undefined || stencil) bits |= gl.STENCIL_BUFFER_BIT;

		if (bits > 0) { // Prevent warning when bits is equal to zero
			gl.clear(bits);
		}
	}

	/**
	 * Sets the clear color and opacity.
	 * @param {Number} r
	 * @param {Number} g
	 * @param {Number} b
	 * @param {Number} a
	 * @param {Number} premultipliedAlpha
	 */
	setClearColor(r, g, b, a, premultipliedAlpha) {
		this._state.colorBuffer.setClear(r, g, b, a, premultipliedAlpha);
	}

	/**
	 * Returns a Vector4 instance with the current clear color and alpha.
	 * Note: Do not modify the value of Vector4, it is read-only.
	 * @return {t3d.Vector4}
	 */
	getClearColor() {
		return this._state.colorBuffer.getClear();
	}

	/**
	 * This method sets the active rendertarget.
	 * @param {t3d.RenderTargetBase} renderTarget The renderTarget that needs to be activated.
	 */
	setRenderTarget(renderTarget) {
		this._renderTargets.setRenderTarget(renderTarget);
	}

	/**
	 * Returns the current RenderTarget if there are; returns null otherwise.
	 * @return {t3d.RenderTargetBase|Null}
	 */
	getRenderTarget() {
		return this._state.currentRenderTarget;
	}

	/**
	 * Copy a frame buffer to another.
	 * This copy process can be used to perform multi-sampling (MSAA).
	 * @param {t3d.RenderTargetBase} read
	 * @param {t3d.RenderTargetBase} draw
	 * @param {Boolean} [color=true]
	 * @param {Boolean} [depth=true]
	 * @param {Boolean} [stencil=true]
	 */
	blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {
		this._renderTargets.blitRenderTarget(read, draw, color, depth, stencil);
	}

	/**
	 * Reads the pixel data from the current renderTarget into the buffer you pass in.
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} width
	 * @param {Number} height
	 * @param {TypedArray} buffer Uint8Array is the only destination type supported in all cases, other types are renderTarget and platform dependent.
	 */
	readRenderTargetPixels(x, y, width, height, buffer) {
		this._renderTargets.readRenderTargetPixels(x, y, width, height, buffer);
	}

	/**
	 * Generate mipmaps for the render target you pass in.
	 * @param {t3d.RenderTargetBase} renderTarget
	 */
	updateRenderTargetMipmap(renderTarget) {
		this._renderTargets.updateRenderTargetMipmap(renderTarget);
	}

	/**
	 * Bind webglTexture to t3d's texture.
	 * @param {t3d.TextureBase} texture
	 * @param {WebGLTexture} webglTexture
	 */
	setTextureExternal(texture, webglTexture) {
		this._textures.setTextureExternal(texture, webglTexture);
	}

	/**
	 * Bind webglRenderbuffer to t3d's renderBuffer.
	 * @param {t3d.RenderBuffer} renderBuffer
	 * @param {WebGLRenderbuffer} webglRenderbuffer
	 */
	setRenderBufferExternal(renderBuffer, webglRenderbuffer) {
		this._renderBuffers.setRenderBufferExternal(renderBuffer, webglRenderbuffer);
	}

	/**
	 * Bind webglBuffer to t3d's buffer.
	 * @param {t3d.Buffer} buffer
	 * @param {WebGLBuffer} webglBuffer
	 */
	setBufferExternal(buffer, webglBuffer) {
		this._buffers.setBufferExternal(buffer, webglBuffer);
	}

	/**
	 * Reset vertex array object bindings.
	 * @param {Boolean} [force=false]
	 */
	resetVertexArrayBindings(force) {
		this._vertexArrayBindings.reset(force);
	}

	/**
	 * Reset all render states.
	 */
	resetState() {
		this._state.reset();
	}

	/**
	 * Begin a query instance.
	 * @param {t3d.Query} query
	 * @param {t3d.QUERY_TYPE} target
	 */
	beginQuery(query, target) {
		this._queries.begin(query, target);
	}

	/**
	 * End a query instance.
	 * @param {t3d.Query} query
	 */
	endQuery(query) {
		this._queries.end(query);
	}

	/**
	 * Records the current time into the corresponding query object.
	 * @param {t3d.Query} query
	 */
	queryCounter(query) {
		this._queries.counter(query);
	}

	/**
	 * Returns true if the timer query was disjoint, indicating that timing results are invalid.
	 * This is rare and might occur, for example, if the GPU was throttled while timing.
	 * @param {t3d.Query} query
	 * @return {Boolean} Returns true if the timer query was disjoint.
	 */
	isTimerQueryDisjoint(query) {
		return this._queries.isTimerDisjoint(query);
	}

	/**
	 * Check if the query result is available.
	 * @param {t3d.Query} query
	 * @return {Boolean} If query result is available.
	 */
	isQueryResultAvailable(query) {
		return this._queries.isResultAvailable(query);
	}

	/**
	 * Get the query result.
	 * @param {t3d.Query} query
	 * @return {Number} The query result.
	 */
	getQueryResult(query) {
		return this._queries.getResult(query);
	}

	/**
	 * Get the query result.
	 * @param {Object} renderable - The renderable item.
	 * @param {t3d.RenderStates} renderStates - The render states.
	 * @param {Object} [options=] - The render options.
	 */
	renderRenderableItem(renderable, renderStates, options) {
		const state = this._state;
		const capabilities = this.capabilities;
		const vertexArrayBindings = this._vertexArrayBindings;
		const textures = this._textures;
		const programs = this._programs;

		const getGeometry = options.getGeometry || defaultGetGeometry;
		const getMaterial = options.getMaterial || defaultGetMaterial;
		const beforeRender = options.beforeRender || noop;
		const afterRender = options.afterRender || noop;
		const ifRender = options.ifRender || defaultIfRender;
		const renderInfo = options.renderInfo;

		const sceneData = renderStates.scene;
		const lightData = renderStates.lights;
		const cameraData = renderStates.camera;

		const currentRenderTarget = state.currentRenderTarget;

		if (!ifRender(renderable)) {
			return;
		}

		const object = renderable.object;
		const material = getMaterial.call(this, renderable);
		const geometry = getGeometry.call(this, renderable);
		const group = renderable.group;
		const fog = material.fog ? sceneData.fog : null;
		const envMap = material.envMap !== undefined ? (material.envMap || sceneData.environment) : null;

		let clippingPlanesData = sceneData.clippingPlanesData;
		let numClippingPlanes = sceneData.numClippingPlanes;
		if (material.clippingPlanes && material.clippingPlanes.length > 0) {
			if (_clippingPlanesData.length < material.clippingPlanes.length * 4) {
				_clippingPlanesData = new Float32Array(material.clippingPlanes.length * 4);
			}
			clippingPlanesData = sceneData.setClippingPlanesData(material.clippingPlanes, _clippingPlanesData);
			numClippingPlanes = material.clippingPlanes.length;
		}

		object.onBeforeRender(renderable, material);
		beforeRender.call(this, renderable, material);

		// Check material version

		const materialProperties = this._materials.setMaterial(material);
		if (material.needsUpdate === false) {
			if (materialProperties.program === undefined) {
				material.needsUpdate = true;
			} else if (materialProperties.fog !== fog) {
				material.needsUpdate = true;
			} else if (materialProperties.envMap !== envMap) {
				material.needsUpdate = true;
			} else if (materialProperties.numClippingPlanes !== numClippingPlanes) {
				material.needsUpdate = true;
			} else if (materialProperties.logarithmicDepthBuffer !== sceneData.logarithmicDepthBuffer) {
				material.needsUpdate = true;
			} else if (renderStates.outputEncoding !== materialProperties.outputEncoding ||
				renderStates.gammaFactor !== materialProperties.gammaFactor) {
				material.needsUpdate = true;
			} else if (capabilities.version > 1 && sceneData.disableShadowSampler !== materialProperties.disableShadowSampler) {
				material.needsUpdate = true;
			} else {
				const acceptLight = material.acceptLight && lightData.totalNum > 0;
				if (acceptLight !== materialProperties.acceptLight) {
					material.needsUpdate = true;
				} else if (acceptLight) {
					if (!lightData.hash.compare(materialProperties.lightsHash) ||
						object.receiveShadow !== materialProperties.receiveShadow ||
						object.shadowType !== materialProperties.shadowType) {
						material.needsUpdate = true;
					}
				}
			}
		}

		// Update program if needed.

		if (material.needsUpdate) {
			const oldProgram = materialProperties.program;
			materialProperties.program = programs.getProgram(material, object, renderStates, this.shaderCompileOptions);
			if (oldProgram) { // release after new program is created.
				vertexArrayBindings.releaseByProgram(oldProgram);
				programs.releaseProgram(oldProgram);
			}

			materialProperties.fog = fog;
			materialProperties.envMap = envMap;
			materialProperties.logarithmicDepthBuffer = sceneData.logarithmicDepthBuffer;

			materialProperties.acceptLight = material.acceptLight;
			materialProperties.lightsHash = lightData.hash.copyTo(materialProperties.lightsHash);
			materialProperties.receiveShadow = object.receiveShadow;
			materialProperties.shadowType = object.shadowType;

			materialProperties.numClippingPlanes = numClippingPlanes;
			materialProperties.outputEncoding = renderStates.outputEncoding;
			materialProperties.gammaFactor = renderStates.gammaFactor;
			materialProperties.disableShadowSampler = sceneData.disableShadowSampler;

			material.needsUpdate = false;
		}

		const program = materialProperties.program;

		if (!program.isReady(capabilities.parallelShaderCompileExt)) return;

		state.setProgram(program);

		this._geometries.setGeometry(geometry);

		// update morph targets
		if (object.morphTargetInfluences) {
			this._updateMorphtargets(object, geometry, program);
		}

		vertexArrayBindings.setup(object, geometry, program);

		let refreshLights = false;
		if (program.lightId !== lightData.id || program.lightVersion !== lightData.version) {
			refreshLights = true;
			program.lightId = lightData.id;
			program.lightVersion = lightData.version;
		}

		let refreshCamera = false;
		if (program.cameraId !== cameraData.id || program.cameraVersion !== cameraData.version) {
			refreshCamera = true;
			program.cameraId = cameraData.id;
			program.cameraVersion = cameraData.version;
		}

		let refreshScene = false;
		if (program.sceneId !== sceneData.id || program.sceneVersion !== sceneData.version) {
			refreshScene = true;
			program.sceneId = sceneData.id;
			program.sceneVersion = sceneData.version;
		}

		const uniforms = program.getUniforms();

		// upload light uniforms
		if (material.acceptLight) {
			this._uploadLights(uniforms, lightData, sceneData.disableShadowSampler, refreshLights);
		}

		// upload bone matrices
		if (object.isSkinnedMesh) {
			this._uploadSkeleton(uniforms, object, sceneData);
		}

		// upload other uniforms
		for (let n = 0, ll = uniforms.seq.length; n < ll; n++) {
			const uniform = uniforms.seq[n];
			const key = uniform.id;
			const internalGroup = uniform.internalGroup;

			// upload custom uniforms
			if (material.uniforms && material.uniforms[key] !== undefined) {
				uniform.set(material.uniforms[key], textures);
				continue;
			}

			// u_Model: always upload this matrix
			if (internalGroup === 1) {
				let modelMatrix = object.worldMatrix;
				if (sceneData.useAnchorMatrix) {
					modelMatrix = helpMatrix4.copy(modelMatrix).premultiply(sceneData.anchorMatrixInverse);
				}
				uniform.set(modelMatrix.elements);
				continue;
			}

			// uniforms about camera data
			if (internalGroup === 2 && refreshCamera) {
				uniform.internalFun(cameraData);
				continue;
			}

			// uniforms about scene data
			if (internalGroup === 3 && refreshScene) {
				uniform.internalFun(sceneData);
				continue;
			}

			// uniforms about material
			if (internalGroup === 4) {
				uniform.internalFun(material, textures);
				continue;
			}

			// other internal uniforms
			if (internalGroup === 5) {
				if (key === 'u_PointScale') {
					const scale = currentRenderTarget.height * 0.5; // three.js do this
					uniform.set(scale);
				} else {
					uniform.internalFun(envMap, textures);
				}
				continue;
			}

			if (key === 'clippingPlanes') {
				uniform.set(clippingPlanesData);
			}
		}

		const frontFaceCW = object.worldMatrix.determinant() < 0;
		state.setMaterial(material, frontFaceCW);

		const viewport = helpVector4.set(
			currentRenderTarget.width,
			currentRenderTarget.height,
			currentRenderTarget.width,
			currentRenderTarget.height
		).multiply(cameraData.rect);

		viewport.z -= viewport.x;
		viewport.w -= viewport.y;

		viewport.x = Math.floor(viewport.x);
		viewport.y = Math.floor(viewport.y);
		viewport.z = Math.floor(viewport.z);
		viewport.w = Math.floor(viewport.w);

		state.viewport(viewport.x, viewport.y, viewport.z, viewport.w);

		this._draw(geometry, material, group, renderInfo);

		textures.resetTextureUnits();

		// Ensure depth buffer writing is enabled so it can be cleared on next render

		state.depthBuffer.setTest(true);
		state.depthBuffer.setMask(true);
		state.colorBuffer.setMask(true);

		afterRender(renderable);
		object.onAfterRender(renderable);
	}

	_uploadLights(uniforms, lights, disableShadowSampler, refresh) {
		const textures = this._textures;

		if (lights.useAmbient && refresh) {
			uniforms.set("u_AmbientLightColor", lights.ambient);
		}
		if (lights.useSphericalHarmonics && refresh) {
			uniforms.set("u_SphericalHarmonicsLightData", lights.sh);
		}
		if (lights.hemisNum > 0 && refresh) {
			uniforms.set("u_Hemi", lights.hemisphere);
		}

		if (lights.directsNum > 0) {
			if (refresh) uniforms.set("u_Directional", lights.directional);

			if (lights.directShadowNum > 0) {
				if (refresh) uniforms.set("u_DirectionalShadow", lights.directionalShadow);

				if (uniforms.has("directionalShadowMap")) {
					if (this.capabilities.version >= 2 && !disableShadowSampler) {
						uniforms.set("directionalShadowMap", lights.directionalShadowDepthMap, textures);
					} else {
						uniforms.set("directionalShadowMap", lights.directionalShadowMap, textures);
					}
					uniforms.set("directionalShadowMatrix", lights.directionalShadowMatrix);
				}

				if (uniforms.has("directionalDepthMap")) {
					uniforms.set("directionalDepthMap", lights.directionalShadowMap, textures);
				}
			}
		}

		if (lights.pointsNum > 0) {
			if (refresh) uniforms.set("u_Point", lights.point);

			if (lights.pointShadowNum > 0) {
				if (refresh) uniforms.set("u_PointShadow", lights.pointShadow);

				if (uniforms.has("pointShadowMap")) {
					uniforms.set("pointShadowMap", lights.pointShadowMap, textures);
					uniforms.set("pointShadowMatrix", lights.pointShadowMatrix);
				}
			}
		}

		if (lights.spotsNum > 0) {
			if (refresh) uniforms.set("u_Spot", lights.spot);

			if (lights.spotShadowNum > 0) {
				if (refresh) uniforms.set("u_SpotShadow", lights.spotShadow);

				if (uniforms.has("spotShadowMap")) {
					if (this.capabilities.version >= 2 && !disableShadowSampler) {
						uniforms.set("spotShadowMap", lights.spotShadowDepthMap, textures);
					} else {
						uniforms.set("spotShadowMap", lights.spotShadowMap, textures);
					}
					uniforms.set("spotShadowMatrix", lights.spotShadowMatrix);
				}

				if (uniforms.has("spotDepthMap")) {
					uniforms.set("spotDepthMap", lights.spotShadowMap, textures);
				}
			}
		}
	}

	_uploadSkeleton(uniforms, object, sceneData) {
		if (object.skeleton && object.skeleton.bones.length > 0) {
			const skeleton = object.skeleton;
			const capabilities = this.capabilities;

			if (capabilities.maxVertexTextures > 0 && (!!capabilities.getExtension('OES_texture_float') || capabilities.version >= 2)) {
				if (skeleton.boneTexture === undefined) {
					skeleton.generateBoneTexture(capabilities.version >= 2);
				}

				uniforms.set("boneTexture", skeleton.boneTexture, this._textures);
				uniforms.set("boneTextureSize", skeleton.boneTexture.image.width);
			} else {
				uniforms.set("boneMatrices", skeleton.boneMatrices);
			}

			uniforms.set("bindMatrix", object.bindMatrix.elements);

			helpMatrix4.copy(object.bindMatrixInverse);
			if (sceneData.useAnchorMatrix) {
				helpMatrix4.multiply(sceneData.anchorMatrix); // convert to anchor space
			}
			uniforms.set("bindMatrixInverse", helpMatrix4.elements);
		}
	}

	_updateMorphtargets(object, geometry, program) {
		const objectInfluences = object.morphTargetInfluences;

		if (!influencesList.has(geometry)) {
			influencesList.set(geometry, objectInfluences.slice(0));
		}

		const morphTargets = geometry.morphAttributes.position;
		const morphNormals = geometry.morphAttributes.normal;

		// Remove current morphAttributes

		const influences = influencesList.get(geometry);

		for (let i = 0; i < influences.length; i++) {
			const influence = influences[i];

			if (influence !== 0) {
				if (morphTargets) geometry.removeAttribute('morphTarget' + i);
				if (morphNormals) geometry.removeAttribute('morphNormal' + i);
			}
		}

		// Collect influences

		for (let i = 0; i < objectInfluences.length; i++) {
			influences[i] = objectInfluences[i];
		}

		influences.length = objectInfluences.length;

		// Add morphAttributes

		let count = 0;

		for (let i = 0; i < influences.length; i++) {
			const influence = influences[i];

			if (influence > 0) {
				if (morphTargets) geometry.addAttribute('morphTarget' + count, morphTargets[i]);
				if (morphNormals) geometry.addAttribute('morphNormal' + count, morphNormals[i]);

				morphInfluences[count] = influence;

				count++;
			}
		}

		for (; count < 8; count++) {
			morphInfluences[count] = 0;
		}

		program.getUniforms().set('morphTargetInfluences', morphInfluences);
	}

	_draw(geometry, material, group, renderInfo) {
		const gl = this.gl;
		const capabilities = this.capabilities;
		const buffers = this._buffers;

		const useIndexBuffer = geometry.index !== null;
		const position = geometry.getAttribute("a_Position");

		let drawStart = 0;
		let drawCount = Infinity;
		if (useIndexBuffer) {
			drawCount = geometry.index.buffer.count;
		} else if (position) {
			drawCount = position.buffer.count;
		}
		const groupStart = group ? group.start : 0;
		const groupCount = group ? group.count : Infinity;
		drawStart = Math.max(drawStart, groupStart);
		drawCount = Math.min(drawCount, groupCount);

		if (drawCount < 0 || drawCount === Infinity) return;

		const instanceCount = geometry.instanceCount;
		const useInstancing = instanceCount >= 0;

		if (useIndexBuffer) {
			const indexBufferProperties = buffers.get(geometry.index.buffer);
			const bytesPerElement = indexBufferProperties.bytesPerElement;
			const type = indexBufferProperties.type;

			if (type === gl.UNSIGNED_INT) {
				if (capabilities.version < 2 && !capabilities.getExtension('OES_element_index_uint')) {
					console.warn("draw elements type not support UNSIGNED_INT!");
				}
			}

			if (useInstancing) {
				if (instanceCount > 0) {
					if (capabilities.version >= 2) {
						gl.drawElementsInstanced(material.drawMode, drawCount, type, drawStart * bytesPerElement, instanceCount);
					} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
						capabilities.getExtension('ANGLE_instanced_arrays').drawElementsInstancedANGLE(material.drawMode, drawCount, type, drawStart * bytesPerElement, instanceCount);
					} else {
						console.warn("no support instanced draw.");
						return;
					}
				}
			} else {
				gl.drawElements(material.drawMode, drawCount, type, drawStart * bytesPerElement);
			}
		} else {
			if (useInstancing) {
				if (instanceCount > 0) {
					if (capabilities.version >= 2) {
						gl.drawArraysInstanced(material.drawMode, drawStart, drawCount, instanceCount);
					} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
						capabilities.getExtension('ANGLE_instanced_arrays').drawArraysInstancedANGLE(material.drawMode, drawStart, drawCount, instanceCount);
					} else {
						console.warn("no support instanced draw.");
						return;
					}
				}
			} else {
				gl.drawArrays(material.drawMode, drawStart, drawCount);
			}
		}

		if (!!renderInfo) {
			renderInfo.update(drawCount, material.drawMode, instanceCount < 0 ? 1 : instanceCount);
		}
	}

}

export { WebGLRenderPass };