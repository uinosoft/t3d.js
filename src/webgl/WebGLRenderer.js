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
import { WebGLLights } from './WebGLLights.js';
import { Vector4 } from '../math/Vector4.js';
import { Matrix4 } from '../math/Matrix4.js';
import { ThinRenderer } from '../render/ThinRenderer.js';
import { LightingGroup } from '../render/LightingGroup.js';

const helpVector4 = new Vector4();
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

/**
 * The WebGL renderer.
 * @extends ThinRenderer
 */
class WebGLRenderer extends ThinRenderer {

	/**
	 * Create a WebGL renderer.
	 * @param {WebGLRenderingContext} context - The Rendering Context privided by canvas.
	 */
	constructor(context) {
		super(context);

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
		this._queries = null;

		this.init();

		// Cache current material if beginRender is called.
		this._currentMaterial = null;
	}

	/**
	 * Initialize the renderer.
	 * This method will be called automatically by the constructor.
	 * In the case of context lost, you can call this function to restart the renderer.
	 */
	init() {
		const gl = this.context;

		const prefix = `_gl${this.increaseId()}`;

		const capabilities = new WebGLCapabilities(gl);
		const constants = new WebGLConstants(gl, capabilities);
		const state = new WebGLState(gl, capabilities);
		const textures = new WebGLTextures(prefix, gl, state, capabilities, constants);
		const renderBuffers = new WebGLRenderBuffers(prefix, gl, capabilities, constants);
		const renderTargets = new WebGLRenderTargets(prefix, gl, state, capabilities, textures, renderBuffers, constants);
		const buffers = new WebGLBuffers(prefix, gl, capabilities);
		const vertexArrayBindings = new WebGLVertexArrayBindings(prefix, gl, capabilities, buffers);
		const geometries = new WebGLGeometries(prefix, gl, buffers, vertexArrayBindings);
		const lights = new WebGLLights(prefix, capabilities, textures);
		const programs = new WebGLPrograms(gl, state, capabilities);
		const materials = new WebGLMaterials(prefix, programs, vertexArrayBindings);
		const queries = new WebGLQueries(prefix, gl, capabilities);

		this.capabilities = capabilities;

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
		this._queries = queries;
	}

	endRender() {
		super.endRender();

		this._currentMaterial = null;

		// Ensure depth buffer writing is enabled so it can be cleared on next render

		const state = this._state;
		state.depthBuffer.setTest(true);
		state.depthBuffer.setMask(true);
		state.colorBuffer.setMask(true);
	}

	clear(color, depth, stencil) {
		const gl = this.context;

		let bits = 0;

		if (color === undefined || color) bits |= gl.COLOR_BUFFER_BIT;
		if (depth === undefined || depth) bits |= gl.DEPTH_BUFFER_BIT;
		if (stencil === undefined || stencil) bits |= gl.STENCIL_BUFFER_BIT;

		if (bits > 0) { // Prevent warning when bits is equal to zero
			gl.clear(bits);
		}
	}

	setClearColor(r, g, b, a, premultipliedAlpha) {
		this._state.colorBuffer.setClear(r, g, b, a, premultipliedAlpha);
	}

	getClearColor() {
		return this._state.colorBuffer.getClear();
	}

	setRenderTarget(renderTarget) {
		this._renderTargets.setRenderTarget(renderTarget);
	}

	getRenderTarget() {
		return this._state.currentRenderTarget;
	}

	blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {
		this._renderTargets.blitRenderTarget(read, draw, color, depth, stencil);
	}

	readRenderTargetPixels(x, y, width, height, buffer) {
		if (this.asyncReadPixel) {
			return this._renderTargets.readRenderTargetPixelsAsync(x, y, width, height, buffer);
		} else {
			this._renderTargets.readRenderTargetPixels(x, y, width, height, buffer);
			return Promise.resolve(buffer);
		}
	}

	updateRenderTargetMipmap(renderTarget) {
		this._renderTargets.updateRenderTargetMipmap(renderTarget);
	}

	setTextureExternal(texture, webglTexture) {
		this._textures.setTextureExternal(texture, webglTexture);
	}

	setRenderBufferExternal(renderBuffer, webglRenderbuffer) {
		this._renderBuffers.setRenderBufferExternal(renderBuffer, webglRenderbuffer);
	}

	setBufferExternal(buffer, webglBuffer) {
		this._buffers.setBufferExternal(buffer, webglBuffer);
	}

	resetVertexArrayBindings(force) {
		this._vertexArrayBindings.reset(force);
	}

	resetState() {
		this._state.reset();
	}

	beginQuery(query, target) {
		this._queries.begin(query, target);
	}

	endQuery(query) {
		this._queries.end(query);
	}

	queryCounter(query) {
		this._queries.counter(query);
	}

	isTimerQueryDisjoint(query) {
		return this._queries.isTimerDisjoint(query);
	}

	isQueryResultAvailable(query) {
		return this._queries.isResultAvailable(query);
	}

	getQueryResult(query) {
		return this._queries.getResult(query);
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
			if (key === 'u_PointScale') {
				// TODO: remove this after 0.5.0, use u_RenderTargetSize instead
				const scale = currentRenderTarget.height * 0.5;
				uniform.set(scale);
			} else if (key === 'clippingPlanes') {
				uniform.set(clippingPlanesData);
			} else if (key === 'u_RenderTargetSize') {
				uniform.setValue(currentRenderTarget.width, currentRenderTarget.height);
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

		state.viewport(viewport.round());

		this._draw(geometry, material, group, renderInfo);

		textures.resetTextureUnits();

		afterRender && afterRender.call(this, renderable);
		object.onAfterRender(renderable);
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

}

export { WebGLRenderer };