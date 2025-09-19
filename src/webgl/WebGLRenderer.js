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
import { WebGLQuerySets } from './WebGLQuerySets.js';
import { WebGLLights } from './WebGLLights.js';
import { Vector4 } from '../math/Vector4.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Matrix3 } from '../math/Matrix3.js';
import { MathUtils } from '../math/MathUtils.js';
import { ThinRenderer } from '../render/ThinRenderer.js';
import { LightingGroup } from '../render/LightingGroup.js';
import { TEXTURE_FILTER } from '../const.js';

const helpVector4 = new Vector4();
const helpMatrix3 = new Matrix3();
const helpMatrix4 = new Matrix4();

const influencesList = new WeakMap();
const morphInfluences = new Float32Array(8);

const _envData = { map: null, diffuse: 1, specular: 1 };
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

const _emptyLightingGroup = new LightingGroup();

function getLightingGroup(lighting, material) {
	if (!material.acceptLight) {
		return _emptyLightingGroup;
	}

	const lightingGroup = lighting.getGroup(material.lightingGroup);
	if (lightingGroup && lightingGroup.totalNum > 0) {
		return lightingGroup;
	}

	return _emptyLightingGroup;
}

function clientWaitAsync(gl) {
	const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

	gl.flush();

	return new Promise(function(resolve, reject) {
		function test() {
			const res = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);

			if (res === gl.WAIT_FAILED) {
				gl.deleteSync(sync);
				reject();
				return;
			}

			if (res === gl.TIMEOUT_EXPIRED) {
				requestAnimationFrame(test);
				return;
			}

			gl.deleteSync(sync);

			resolve();
		}

		test();
	});
}

/**
 * The WebGL renderer.
 * @extends ThinRenderer
 */
class WebGLRenderer extends ThinRenderer {

	/**
	 * Create a WebGLRenderer.
	 * @param {WebGLRenderingContext} [context] - The WebGL Rendering Context privided by canvas.
	 * If not provided, you must call {@link WebGLRenderer.init} method with a valid context
	 * before using this renderer.
	 */
	constructor(context) {
		super();

		/**
		 * An object containing details about the capabilities of the current RenderingContext.
		 * @type {WebGLCapabilities}
		 */
		this.capabilities = {};

		this._textures = null;
		this._renderBuffers = null;
		this._renderTargets = null;
		this._buffers = null;
		this._geometries = null;
		this._lights = null;
		this._programs = null;
		this._materials = null;
		this._state = null;
		this._vertexArrayBindings = null;

		if (context) {
			this.init(context);
		}

		// Cache current material if beginRender is called.
		this._currentMaterial = null;
	}

	init(context, options = {}) {
		if (!context) {
			context = this.context;
		}

		if (!context) {
			throw new Error('WebGLRenderer.init: context must be provided.');
		}

		this.context = context;

		const prefix = `_gl${this.increaseId()}`;

		const capabilities = new WebGLCapabilities(context);
		const constants = new WebGLConstants(context, capabilities);
		const state = new WebGLState(context, capabilities);
		const textures = new WebGLTextures(prefix, context, state, capabilities, constants);
		const renderBuffers = new WebGLRenderBuffers(prefix, context, capabilities, constants);
		const renderTargets = new WebGLRenderTargets(prefix, context, state, capabilities, textures, renderBuffers, constants);
		const buffers = new WebGLBuffers(prefix, context, capabilities);
		const vertexArrayBindings = new WebGLVertexArrayBindings(prefix, context, capabilities, buffers);
		const geometries = new WebGLGeometries(prefix, context, buffers, vertexArrayBindings);
		const lights = new WebGLLights(prefix, capabilities, textures);
		const programs = new WebGLPrograms(context, state, capabilities);
		const materials = new WebGLMaterials(prefix, programs, vertexArrayBindings);
		const querySets = new WebGLQuerySets(prefix, context, capabilities);

		this.capabilities = capabilities;

		this._constants = constants;
		this._textures = textures;
		this._renderBuffers = renderBuffers;
		this._renderTargets = renderTargets;
		this._buffers = buffers;
		this._geometries = geometries;
		this._lights = lights;
		this._programs = programs;
		this._materials = materials;
		this._state = state;
		this._vertexArrayBindings = vertexArrayBindings;
		this._querySets = querySets;

		return Promise.resolve(this);
	}

	beginRender(renderTarget) {
		super.beginRender(renderTarget);

		if (renderTarget) {
			this._renderTargets.setRenderTarget(renderTarget);

			const gl = this.context;
			const state = this._state;

			let clearBits = 0;

			if (renderTarget.clearColor) {
				state.colorBuffer.setClear(
					renderTarget.colorClearValue.r,
					renderTarget.colorClearValue.g,
					renderTarget.colorClearValue.b,
					renderTarget.colorClearValue.a
				);
				clearBits |= gl.COLOR_BUFFER_BIT;
			}

			if (renderTarget.clearDepth) {
				state.depthBuffer.setClear(renderTarget.depthClearValue);
				clearBits |= gl.DEPTH_BUFFER_BIT;
			}

			if (renderTarget.clearStencil) {
				state.stencilBuffer.setClear(renderTarget.stencilClearValue);
				clearBits |= gl.STENCIL_BUFFER_BIT;
			}

			if (clearBits > 0) { // Prevent warning when bits is equal to zero
				gl.clear(clearBits);
			}

			this._currentOcclusionQuerySet = renderTarget.occlusionQuerySet;
			this._currentTimestampWrites.querySet = renderTarget.timestampWrites.querySet;
			this._currentTimestampWrites.beginningOfPassWriteIndex = renderTarget.timestampWrites.beginningOfPassWriteIndex;
			this._currentTimestampWrites.endOfPassWriteIndex = renderTarget.timestampWrites.endOfPassWriteIndex;
		}

		if (this._currentOcclusionQuerySet) {
			this._querySets.setQuerySet(this._currentOcclusionQuerySet);
		}

		if (this._currentTimestampWrites.querySet) {
			this._querySets.setQuerySet(this._currentTimestampWrites.querySet);

			if (this.capabilities.canUseTimestamp) {
				this._querySets.queryCounter(
					this._currentTimestampWrites.querySet,
					this._currentTimestampWrites.beginningOfPassWriteIndex
				);
			} else { // fallback to use TIME_ELAPSED_EXT
				this._querySets.beginQuery(
					this._currentTimestampWrites.querySet,
					this._currentTimestampWrites.endOfPassWriteIndex
				);
			}
		}
	}

	endRender() {
		if (this._currentTimestampWrites.querySet) {
			if (this.capabilities.canUseTimestamp) {
				this._querySets.queryCounter(
					this._currentTimestampWrites.querySet,
					this._currentTimestampWrites.endOfPassWriteIndex
				);
			} else { // fallback to use TIME_ELAPSED_EXT
				this._querySets.endQuery(this._currentTimestampWrites.querySet);
			}
		}

		// Ensure depth buffer writing is enabled so it can be cleared on next render
		const state = this._state;
		state.depthBuffer.setTest(true);
		state.depthBuffer.setMask(true);
		state.colorBuffer.setMask(true);

		this._currentMaterial = null;

		super.endRender();
	}

	renderRenderableItem(renderable, renderStates, options) {
		const state = this._state;
		const capabilities = this.capabilities;
		const vertexArrayBindings = this._vertexArrayBindings;
		const textures = this._textures;
		const passInfo = this._passInfo;

		const getGeometry = options.getGeometry || defaultGetGeometry;
		const getMaterial = options.getMaterial || defaultGetMaterial;
		const beforeRender = options.beforeRender;
		const afterRender = options.afterRender;
		const ifRender = options.ifRender || defaultIfRender;
		const renderInfo = options.renderInfo;

		const sceneData = renderStates.scene;
		const cameraData = renderStates.camera;

		const currentRenderTarget = state.currentRenderTarget;

		if (!ifRender(renderable)) {
			return;
		}

		if (!passInfo.enabled) {
			console.warn('WebGLRenderer: beginRender must be called before renderRenderableItem.');
			return;
		}

		const object = renderable.object;
		const material = getMaterial.call(this, renderable);
		const geometry = getGeometry.call(this, renderable);
		const group = renderable.group;
		const fog = material.fog ? sceneData.fog : null;

		const lightingGroup = getLightingGroup(renderStates.lighting, material);
		const lightingState = this._lights.setLightingGroup(lightingGroup, passInfo, this.lightingOptions, cameraData).state;
		const hasLighting = lightingState.hasLight();
		const hasShadow = lightingState.hasShadow() && object.receiveShadow;

		_envData.map = material.envMap !== undefined ? (material.envMap || sceneData.environment) : null;
		_envData.diffuse = sceneData.envDiffuseIntensity * material.envMapIntensity;
		_envData.specular = sceneData.envSpecularIntensity * material.envMapIntensity;

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
		beforeRender && beforeRender.call(this, renderable, material);

		// Check material version

		const materialProperties = this._materials.setMaterial(material);

		if (material.needsUpdate === false) {
			if (materialProperties.currentProgram === undefined) {
				material.needsUpdate = true;
			} else if (materialProperties.fog !== fog) {
				material.needsUpdate = true;
			} else if (materialProperties.envMap !== _envData.map) {
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
				if (hasLighting !== materialProperties.hasLighting) {
					material.needsUpdate = true;
				} else if (hasLighting) {
					if (!lightingState.compare(materialProperties.lightingFactors)) {
						material.needsUpdate = true;
					} else if (hasShadow !== materialProperties.hasShadow) {
						material.needsUpdate = true;
					} else if (hasShadow) {
						material.needsUpdate = materialProperties.shadowType !== object.shadowType;
					}
				}
			}
		}

		// Update program if needed.

		if (material.needsUpdate) {
			this._materials.updateProgram(material, object, lightingState, renderStates, this.shaderCompileOptions);

			materialProperties.fog = fog;
			materialProperties.envMap = _envData.map;
			materialProperties.logarithmicDepthBuffer = sceneData.logarithmicDepthBuffer;

			materialProperties.hasLighting = hasLighting;
			materialProperties.lightingFactors = lightingState.copyTo(materialProperties.lightingFactors);
			materialProperties.hasShadow = hasShadow;
			materialProperties.shadowType = object.shadowType;

			materialProperties.numClippingPlanes = numClippingPlanes;
			materialProperties.outputEncoding = renderStates.outputEncoding;
			materialProperties.gammaFactor = renderStates.gammaFactor;
			materialProperties.disableShadowSampler = sceneData.disableShadowSampler;

			material.needsUpdate = false;
		}

		const program = materialProperties.currentProgram;

		if (options.onlyCompile || !program.isReady(capabilities.parallelShaderCompileExt)) return;

		state.setProgram(program);

		this._geometries.setGeometry(geometry, passInfo);

		// update morph targets
		if (object.morphTargetInfluences) {
			this._updateMorphtargets(object, geometry, program);
		}

		vertexArrayBindings.setup(object, geometry, program);

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

		let refreshMaterial = true;
		if (!material.forceUpdateUniforms) {
			if (materialProperties.pass !== passInfo.count) {
				materialProperties.pass = passInfo.count;
			} else {
				refreshMaterial = this._currentMaterial !== material;
			}
		}
		this._currentMaterial = material;

		const uniforms = program.getUniforms();

		// upload light uniforms
		if (hasLighting) {
			this._lights.uploadUniforms(program, lightingGroup, sceneData.disableShadowSampler);
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
			if (internalGroup === 4 && refreshMaterial) {
				uniform.internalFun(material, textures);
				continue;
			}

			// uniforms about environment map
			if (internalGroup === 5) {
				uniform.internalFun(_envData, textures);
				continue;
			}

			// other internal uniforms
			if (key === 'clippingPlanes') {
				uniform.set(clippingPlanesData);
			} else if (key === 'u_RenderTargetSize') {
				uniform.setValue(currentRenderTarget.width, currentRenderTarget.height);
			}
		}

		const frontFaceCW = helpMatrix3.setFromMatrix4(object.worldMatrix).determinant() < 0;
		state.setMaterial(material, frontFaceCW);

		const viewport = helpVector4.set(
			currentRenderTarget.width,
			currentRenderTarget.height,
			currentRenderTarget.width,
			currentRenderTarget.height
		).multiply(cameraData.rect);

		viewport.z -= viewport.x;
		viewport.w -= viewport.y;

		state.viewport(viewport.round());

		this._draw(geometry, material, group, renderInfo);

		textures.resetTextureUnits();

		afterRender && afterRender.call(this, renderable);
		object.onAfterRender(renderable);
	}

	blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {
		this._renderTargets.blitRenderTarget(read, draw, color, depth, stencil);
	}

	generateMipmaps(texture) {
		const state = this._state;
		const capabilities = this.capabilities;
		const textures = this._textures;

		const textureProperties = textures.get(texture);

		if (!textureProperties.__webglTexture) return;

		const powerOfTwo = MathUtils.isPowerOfTwo(textureProperties.__width)
			&& MathUtils.isPowerOfTwo(textureProperties.__height);

		if (
			texture.generateMipmaps
			&& texture.minFilter !== TEXTURE_FILTER.NEAREST
			&& texture.minFilter !== TEXTURE_FILTER.LINEAR
			&& (powerOfTwo || capabilities.version >= 2)
		) {
			const target = textureProperties.__webglTarget;
			state.bindTexture(target, textureProperties.__webglTexture);
			textures.generateMipmaps(texture);
			state.bindTexture(target, null);
		}
	}

	readTexturePixels(texture, x, y, width, height, buffer, zIndex = 0, mipLevel = 0) {
		const gl = this.context;
		const constants = this._constants;
		const state = this._state;
		const renderTargets = this._renderTargets;
		const textures = this._textures;

		if (!this._bindTextureToDummyFrameBuffer(texture, zIndex, mipLevel)) {
			return Promise.reject('WebGLRenderer.readTexturePixels: Unsupported texture.');
		}

		const glType = constants.getGLType(texture.type);
		const glFormat = constants.getGLFormat(texture.format);

		const textureProperties = textures.get(texture);
		if (textureProperties.__readBuffer === undefined) {
			textureProperties.__readBuffer = gl.createBuffer();
		}
		gl.bindBuffer(gl.PIXEL_PACK_BUFFER, textureProperties.__readBuffer);
		gl.bufferData(gl.PIXEL_PACK_BUFFER, buffer.byteLength, gl.STREAM_READ);

		gl.readPixels(x, y, width, height, glFormat, glType, 0);

		// restore framebuffer binding
		const framebuffer = (state.currentRenderTarget && !state.currentRenderTarget.isRenderTargetBack) ?
			renderTargets.get(state.currentRenderTarget).__webglFramebuffer : null;
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		return clientWaitAsync(gl).then(() => {
			if (!textureProperties.__readBuffer) {
				throw new Error('WebGLRenderer.readTexturePixels: Texture has been disposed.');
			}

			gl.bindBuffer(gl.PIXEL_PACK_BUFFER, textureProperties.__readBuffer);
			gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, buffer);
			gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

			return buffer;
		});
	}

	readTexturePixelsSync(texture, x, y, width, height, buffer, zIndex = 0, mipLevel = 0) {
		const gl = this.context;
		const constants = this._constants;
		const state = this._state;
		const renderTargets = this._renderTargets;

		if (!this._bindTextureToDummyFrameBuffer(texture, zIndex, mipLevel)) {
			console.warn('WebGLRenderer.readTexturePixels: Unsupported texture.');
			return buffer;
		}

		const glType = constants.getGLType(texture.type);
		const glFormat = constants.getGLFormat(texture.format);

		gl.readPixels(x, y, width, height, glFormat, glType, buffer);

		// restore framebuffer binding
		const framebuffer = (state.currentRenderTarget && !state.currentRenderTarget.isRenderTargetBack) ?
			renderTargets.get(state.currentRenderTarget).__webglFramebuffer : null;
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		return buffer;
	}

	resetVertexArrayBindings(force) {
		this._vertexArrayBindings.reset(force);
	}

	resetState() {
		this._state.reset();
	}

	beginOcclusionQuery(index) {
		const querySet = this._currentOcclusionQuerySet;
		if (!querySet) return;
		this._querySets.beginQuery(querySet, index);
	}

	endOcclusionQuery() {
		const querySet = this._currentOcclusionQuerySet;
		if (!querySet) return;
		this._querySets.endQuery(querySet);
	}

	async readQuerySetResults(querySet, dstBuffer, firstQuery = 0, queryCount = querySet.count) {
		return this._querySets.readQuerySetResults(querySet, dstBuffer, firstQuery, queryCount);
	}

	/**
	 * Bind webglTexture to Texture.
	 * @param {TextureBase} texture
	 * @param {WebGLTexture} webglTexture
	 */
	setTextureExternal(texture, webglTexture) {
		this._textures.setTextureExternal(texture, webglTexture);
	}

	/**
	 * Bind webglRenderbuffer to RenderBuffer.
	 * @param {RenderBuffer} renderBuffer
	 * @param {WebGLRenderbuffer} webglRenderbuffer
	 */
	setRenderBufferExternal(renderBuffer, webglRenderbuffer) {
		this._renderBuffers.setRenderBufferExternal(renderBuffer, webglRenderbuffer);
	}

	/**
	 * Bind webglBuffer to Buffer.
	 * @param {Buffer} buffer
	 * @param {WebGLBuffer} webglBuffer
	 */
	setBufferExternal(buffer, webglBuffer) {
		this._buffers.setBufferExternal(buffer, webglBuffer);
	}

	/**
	 * Bind webglFramebuffer to RenderTarget.
	 * @param {RenderTarget} renderTarget
	 * @param {WebGLFramebuffer} webglFramebuffer
	 */
	setFramebufferExternal(renderTarget, webglFramebuffer) {
		this._renderTargets.setFramebufferExternal(renderTarget, webglFramebuffer);
	}

	_uploadSkeleton(uniforms, object, sceneData) {
		if (object.skeleton && object.skeleton.bones.length > 0) {
			const skeleton = object.skeleton;
			const capabilities = this.capabilities;

			if (capabilities.maxVertexTextures > 0 && (!!capabilities.getExtension('OES_texture_float') || capabilities.version >= 2)) {
				if (skeleton.boneTexture === undefined) {
					skeleton.generateBoneTexture(capabilities.version >= 2);
				}

				uniforms.set('boneTexture', skeleton.boneTexture, this._textures);
				uniforms.set('boneTextureSize', skeleton.boneTexture.image.width);
			} else {
				uniforms.set('boneMatrices', skeleton.boneMatrices);
			}

			uniforms.set('bindMatrix', object.bindMatrix.elements);

			helpMatrix4.copy(object.bindMatrixInverse);
			if (sceneData.useAnchorMatrix) {
				helpMatrix4.multiply(sceneData.anchorMatrix); // convert to anchor space
			}
			uniforms.set('bindMatrixInverse', helpMatrix4.elements);
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
		const gl = this.context;
		const capabilities = this.capabilities;
		const buffers = this._buffers;

		const instanceCount = geometry.instanceCount;
		const useInstancing = instanceCount >= 0;
		const useGroup = !!group;
		const useMultiDraw = useGroup && group.multiDrawCount !== undefined;
		const useIndexBuffer = geometry.index !== null;

		let drawStart = 0;
		let drawCount = Infinity;

		if (!useMultiDraw) {
			const position = geometry.getAttribute('a_Position');

			if (useIndexBuffer) {
				drawCount = geometry.index.buffer.count;
			} else if (position) {
				drawCount = position.buffer.count;
			}

			if (useGroup) {
				drawStart = Math.max(drawStart, group.start);
				drawCount = Math.min(drawCount, group.count);
			}

			if (drawCount < 0 || drawCount === Infinity) return;
		}

		if (useIndexBuffer) {
			const indexBufferProperties = buffers.get(geometry.index.buffer);
			const bytesPerElement = indexBufferProperties.bytesPerElement;
			const type = indexBufferProperties.type;

			if (type === gl.UNSIGNED_INT) {
				if (capabilities.version < 2 && !capabilities.getExtension('OES_element_index_uint')) {
					console.warn('WebGLRenderer: draw elements type not support UNSIGNED_INT!');
				}
			}

			if (useInstancing) {
				if (instanceCount <= 0) return;

				if (capabilities.version >= 2) {
					gl.drawElementsInstanced(material.drawMode, drawCount, type, drawStart * bytesPerElement, instanceCount);
				} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
					capabilities.getExtension('ANGLE_instanced_arrays').drawElementsInstancedANGLE(material.drawMode, drawCount, type, drawStart * bytesPerElement, instanceCount);
				} else {
					console.warn('WebGLRenderer: using instanced draw but hardware does not support.');
					return;
				}
			} else if (useMultiDraw) {
				if (group.multiDrawCount <= 0) return;

				const extension = capabilities.getExtension('WEBGL_multi_draw');

				if (!extension) {
					console.warn('WebGLRenderer: using multi draw but hardware does not support extension WEBGL_multi_draw.');
					return;
				}

				extension.multiDrawElementsWEBGL(material.drawMode, group.multiDrawCounts, 0, type, group.multiDrawStarts, 0, group.multiDrawCount);
			} else {
				gl.drawElements(material.drawMode, drawCount, type, drawStart * bytesPerElement);
			}
		} else {
			if (useInstancing) {
				if (instanceCount <= 0) return;

				if (capabilities.version >= 2) {
					gl.drawArraysInstanced(material.drawMode, drawStart, drawCount, instanceCount);
				} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
					capabilities.getExtension('ANGLE_instanced_arrays').drawArraysInstancedANGLE(material.drawMode, drawStart, drawCount, instanceCount);
				} else {
					console.warn('WebGLRenderer: using instanced draw but hardware does not support.');
					return;
				}
			} else if (useMultiDraw) {
				if (group.multiDrawCount <= 0) return;

				const extension = capabilities.getExtension('WEBGL_multi_draw');

				if (!extension) {
					console.warn('WebGLRenderer: using multi draw but hardware does not support extension WEBGL_multi_draw.');
					return;
				}

				extension.multiDrawArraysWEBGL(material.drawMode, group.multiDrawStarts, 0, group.multiDrawCounts, 0, group.multiDrawCount);
			} else {
				gl.drawArrays(material.drawMode, drawStart, drawCount);
			}
		}

		if (renderInfo) {
			if (useMultiDraw) {
				drawCount = 0;
				for (let i = 0; i < group.multiDrawCount; i++) {
					drawCount += group.multiDrawCounts[i];
				}
			}
			renderInfo.update(drawCount, material.drawMode, instanceCount < 0 ? 1 : instanceCount);
		}
	}

	_bindTextureToDummyFrameBuffer(texture, zIndex, mipLevel) {
		const gl = this.context;
		const textures = this._textures;
		const state = this._state;

		if (!this._dummyFrameBuffer) {
			this._dummyFrameBuffer = gl.createFramebuffer();
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, this._dummyFrameBuffer);

		if (texture.isTexture2D) {
			const textureProperties = textures.setTexture2D(texture);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureProperties.__webglTexture, mipLevel);
			state.bindTexture(gl.TEXTURE_2D, null);
		} else if (texture.isTextureCube) {
			const textureProperties = textures.setTextureCube(texture);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + zIndex, textureProperties.__webglTexture, mipLevel);
			state.bindTexture(gl.TEXTURE_CUBE_MAP, null);
		} else if (texture.isTexture3D) {
			const textureProperties = textures.setTexture3D(texture);
			gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, textureProperties.__webglTexture, mipLevel, zIndex);
			state.bindTexture(gl.TEXTURE_3D, null);
		} else if (texture.isTexture2DArray) {
			const textureProperties = textures.setTexture2DArray(texture);
			gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, textureProperties.__webglTexture, mipLevel, zIndex);
			state.bindTexture(gl.TEXTURE_2D_ARRAY, null);
		} else {
			return false;
		}

		return true;
	}

}

export { WebGLRenderer };