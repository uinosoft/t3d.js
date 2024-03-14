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
import { ThinRenderer } from '../render/ThinRenderer.js';

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

/**
 * The WebGL renderer.
 * @memberof t3d
 * @extends t3d.ThinRenderer
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
		 * @type {t3d.WebGLCapabilities}
		 */
		this.capabilities = {};

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
		const programs = new WebGLPrograms(gl, state, capabilities);
		const materials = new WebGLMaterials(prefix, programs, vertexArrayBindings);
		const queries = new WebGLQueries(prefix, gl, capabilities);

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
		this._renderTargets.readRenderTargetPixels(x, y, width, height, buffer);
		return Promise.resolve(buffer);
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
		const programs = this._programs;
		const passInfo = this._passInfo;

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

		if (!passInfo.enabled) {
			console.warn('WebGLRenderer: beginRender must be called before renderRenderableItem.');
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

		if (options.onlyCompile || !program.isReady(capabilities.parallelShaderCompileExt)) return;

		state.setProgram(program);

		this._geometries.setGeometry(geometry, passInfo);

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
			if (internalGroup === 4 && refreshMaterial) {
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

		afterRender(renderable);
		object.onAfterRender(renderable);
	}

	_uploadLights(uniforms, lights, disableShadowSampler, refresh) {
		const textures = this._textures;

		if (lights.useAmbient && refresh) {
			uniforms.set('u_AmbientLightColor', lights.ambient);
		}
		if (lights.useSphericalHarmonics && refresh) {
			uniforms.set('u_SphericalHarmonicsLightData', lights.sh);
		}
		if (lights.hemisNum > 0 && refresh) {
			uniforms.set('u_Hemi', lights.hemisphere);
		}

		if (lights.directsNum > 0) {
			if (refresh) uniforms.set('u_Directional', lights.directional);

			if (lights.directShadowNum > 0) {
				if (refresh) uniforms.set('u_DirectionalShadow', lights.directionalShadow);

				if (uniforms.has('directionalShadowMap')) {
					if (this.capabilities.version >= 2 && !disableShadowSampler) {
						uniforms.set('directionalShadowMap', lights.directionalShadowDepthMap, textures);
					} else {
						uniforms.set('directionalShadowMap', lights.directionalShadowMap, textures);
					}
					uniforms.set('directionalShadowMatrix', lights.directionalShadowMatrix);
				}

				if (uniforms.has('directionalDepthMap')) {
					uniforms.set('directionalDepthMap', lights.directionalShadowMap, textures);
				}
			}
		}

		if (lights.pointsNum > 0) {
			if (refresh) uniforms.set('u_Point', lights.point);

			if (lights.pointShadowNum > 0) {
				if (refresh) uniforms.set('u_PointShadow', lights.pointShadow);

				if (uniforms.has('pointShadowMap')) {
					uniforms.set('pointShadowMap', lights.pointShadowMap, textures);
					uniforms.set('pointShadowMatrix', lights.pointShadowMatrix);
				}
			}
		}

		if (lights.spotsNum > 0) {
			if (refresh) uniforms.set('u_Spot', lights.spot);

			if (lights.spotShadowNum > 0) {
				if (refresh) uniforms.set('u_SpotShadow', lights.spotShadow);

				if (uniforms.has('spotShadowMap')) {
					if (this.capabilities.version >= 2 && !disableShadowSampler) {
						uniforms.set('spotShadowMap', lights.spotShadowDepthMap, textures);
					} else {
						uniforms.set('spotShadowMap', lights.spotShadowMap, textures);
					}
					uniforms.set('spotShadowMatrix', lights.spotShadowMatrix);
				}

				if (uniforms.has('spotDepthMap')) {
					uniforms.set('spotDepthMap', lights.spotShadowMap, textures);
				}
			}
		}

		if (lights.rectAreaNum > 0) {
			if (refresh) uniforms.set('u_RectArea', lights.rectArea);

			if (lights.LTC1 && lights.LTC2) {
				uniforms.set('ltc_1', lights.LTC1, textures);
				uniforms.set('ltc_2', lights.LTC2, textures);
			} else {
				console.warn('WebGLRenderer: RectAreaLight.LTC1 and LTC2 need to be set before use.');
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