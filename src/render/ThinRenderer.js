import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';

let _rendererId = 0;

/**
 * Base class for WebGL and WebGPU renderers.
 */
class ThinRenderer {

	/**
	 * @param {WebGLRenderingContext|WebGPURenderingContext} context - The Rendering Context privided by canvas.
	 */
	constructor(context) {
		this.id = _rendererId++;

		/**
		 * The Rendering Context privided by canvas.
		 * @type {WebGLRenderingContext|WebGPURenderingContext}
		 */
		this.context = context;

		/**
		 * An object containing details about the capabilities of the current RenderingContext.
		 * @type {object}
		 */
		this.capabilities = {};

		/**
		 * The shader compiler options.
		 * @type {object}
		 * @property {boolean} checkErrors - Whether to use error checking when compiling shaders, defaults to true.
		 * @property {boolean} compileAsynchronously - Whether to compile shaders asynchronously, defaults to false.
		 * @property {number} maxMaterialPrograms - The maximum number of programs that one material can cache, defaults to 5.
		 */
		this.shaderCompileOptions = {
			checkErrors: true,
			compileAsynchronously: false,
			maxMaterialPrograms: 5
		};

		/**
		 * The lighting options.
		 * @type {object}
		 * @property {object} clustered - The clustered lighting options.
		 * @property {boolean} clustered.enabled - Whether to use clustered lighting, defaults to false.
		 * @property {number} clustered.maxClusterLights - The maximum number of lights, defaults to 1024.
		 * @property {boolean} clustered.useFloatPrecision - Whether the lights are stored as floats, defaults to false (half floats).
		 * @property {Vector3} clustered.gridDimensions - The number of cells in each dimension, defaults to Vector3(16, 8, 32).
		 * @property {number} clustered.maxLightsPerCell - The maximum number of lights per cell, defaults to 256.
		 * @property {Vector2} clustered.zClip - The near and far clipping planes for the cells, defaults to Vector2(-1, -1) (clip based on camera near and far planes).
		 * @property {number} clustered.version - The version of the clustered lighting options. If the options change, the version should be incremented, defaults to 0.
		 */
		this.lightingOptions = {
			clustered: {
				enabled: false,
				maxClusterLights: 1024,
				useFloatPrecision: false,
				gridDimensions: new Vector3(16, 8, 32),
				maxLightsPerCell: 256,
				zClip: new Vector2(-1, -1),
				version: 0
			}
		};

		this._passInfo = {
			// Whether the renderer is in the process of pass rendering.
			// If true, means that the beginRender method has been called but the endRender method has not been called.
			enabled: false,
			// The pass rendering count
			count: 0
		};

		this._currentOcclusionQuerySet = null;

		this._currentTimestampWrites = {
			querySet: null,
			beginningOfPassWriteIndex: -1,
			endOfPassWriteIndex: -1
		};
	}

	/**
	 * Begin rendering.
	 * @param {RenderTargetBase} renderTarget - The render target to render to.
	 */
	beginRender(renderTarget) {
		this._passInfo.enabled = true;
	}

	/**
	 * End rendering.
	 */
	endRender() {
		this._passInfo.enabled = false;
		this._passInfo.count++;

		// Automatically clear the occlusion query set and timestamp writes
		this._currentOcclusionQuerySet = null;
		this._currentTimestampWrites.querySet = null;
	}

	/**
	 * @typedef {object} RenderOptions - The render options for renderRenderableItem and renderRenderableList methods.
	 * @property {Function} getGeometry - (Optional) Get renderable geometry.
	 * @property {Function} getMaterial - (Optional) Get renderable material.
	 * @property {Function} beforeRender - (Optional) Before render each renderable item.
	 * @property {Function} afterRender - (Optional) After render each renderable item.
	 * @property {Function} ifRender - (Optional) If render the renderable item.
	 * @property {RenderInfo} renderInfo - (Optional) Render info for collect information.
	 * @property {boolean} onlyCompile - (Optional) Only compile shader, do not render.
	 */

	/**
	 * Render a single renderable item with render states.
	 * @param {object} renderable - The renderable item.
	 * @param {RenderStates} renderStates - The render states.
	 * @param {RenderOptions} [options] - The render options for this render task.
	 */
	renderRenderableItem(renderable, renderStates, options) {}

	/**
	 * Render a single renderable list with render states.
	 * @param {Array} renderables - Array of renderable.
	 * @param {RenderStates} renderStates - Render states.
	 * @param {RenderOptions} [options] - The render options for this render task.
	 */
	renderRenderableList(renderables, renderStates, options = {}) {
		for (let i = 0, l = renderables.length; i < l; i++) {
			this.renderRenderableItem(renderables[i], renderStates, options);
		}
	}

	/**
	 * Render a scene with a particular camera.
	 * This method will render all layers in scene's RenderQueue by default.
	 * If you need a customized rendering process, it is recommended to use renderRenderableList method.
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera used to render the scene.
	 * @param {RenderTargetBase} renderTarget - The render target to render to.
	 * @param {RenderOptions} [options] - The render options for this scene render task.
	 */
	renderScene(scene, camera, renderTarget, options = {}) {
		// Compatibility handling: if there are only 3 arguments,
		// and the third is not a RenderTarget, treat it as options.
		if (arguments.length === 3 && (!renderTarget || !renderTarget.isRenderTarget)) {
			options = renderTarget;
			renderTarget = null;
		}

		const renderStates = scene.getRenderStates(camera);
		const renderQueue = scene.getRenderQueue(camera);

		this.beginRender(renderTarget);

		let renderQueueLayer;
		for (let i = 0, l = renderQueue.layerList.length; i < l; i++) {
			renderQueueLayer = renderQueue.layerList[i];
			this.renderRenderableList(renderQueueLayer.opaque, renderStates, options);
			this.renderRenderableList(renderQueueLayer.transparent, renderStates, options);
		}

		this.endRender();
	}

	/**
	 * Copy a frame buffer to another.
	 * This copy process can be used to perform multi-sampling (MSAA).
	 * @param {RenderTargetBase} read - The source renderTarget.
	 * @param {RenderTargetBase} draw - The destination renderTarget.
	 * @param {boolean} [color=true] - Copy color buffer.
	 * @param {boolean} [depth=true] - Copy depth buffer.
	 * @param {boolean} [stencil=true] - Copy stencil buffer.
	 */
	blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {}

	/**
	 * Generate mipmaps for the renderTarget you pass in.
	 * @param {RenderTargetBase} renderTarget - The renderTarget to update.
	 */
	updateRenderTargetMipmap(renderTarget) {}

	/**
	 * Read pixels from a texture.
	 * This is an asynchronous operation. See {@link ThinRenderer#readTexturePixelsSync} for the synchronous version.
	 * @param {TextureBase} texture - The texture to read from.
	 * @param {number} x - The x coordinate of the rectangle to read from.
	 * @param {number} y - The y coordinate of the rectangle to read from.
	 * @param {number} width - The width of the rectangle to read from.
	 * @param {number} height - The height of the rectangle to read from.
	 * @param {TypedArray} buffer - The buffer to store the pixel data.
	 * @param {number} [zIndex=0] - For CubeTexture, the face index; for Texture3D/TextureArray, the layer/slice index.
	 * @param {number} [mipLevel=0] - The mip level to read.
	 * @returns {Promise<TypedArray>} A promise that resolves with the passed in buffer after it has been filled with the pixel data.
	 */
	readTexturePixels(texture, x, y, width, height, buffer, zIndex = 0, mipLevel = 0) {}

	/**
	 * Read pixels from a texture.
	 * This is a synchronous operation. See {@link ThinRenderer#readTexturePixels} for the asynchronous version.
	 * @param {TextureBase} texture - The texture to read from.
	 * @param {number} x - The x coordinate of the rectangle to read from.
	 * @param {number} y - The y coordinate of the rectangle to read from.
	 * @param {number} width - The width of the rectangle to read from.
	 * @param {number} height - The height of the rectangle to read from.
	 * @param {TypedArray} buffer - The buffer to store the pixel data.
	 * @param {number} [zIndex=0] - For CubeTexture, the face index; for Texture3D/TextureArray, the layer/slice index.
	 * @param {number} [mipLevel=0] - The mip level to read.
	 * @returns {TypedArray} The passed in buffer after it has been filled with the pixel data.
	 */
	readTexturePixelsSync(texture, x, y, width, height, buffer, zIndex = 0, mipLevel = 0) {}

	/**
	 * Reset vertex array object bindings.
	 * @param {boolean} [force=false] - Whether clear the current vertex array object.
	 */
	resetVertexArrayBindings(force) {}

	/**
	 * Reset all render states cached in this renderer.
	 * This is useful when you use multiple renderers in one application.
	 */
	resetState() {}

	/**
	 * Begin an occlusion query.
	 * @param {number} index - The query index in the current occlusion query set.
	 */
	beginOcclusionQuery(index) {}

	/**
	 * End the current occlusion query.
	 */
	endOcclusionQuery() {}

	/**
	 * Read back the results of a query set.
	 * This is an asynchronous operation.
	 * @param {QuerySet} querySet - The query set to read from.
	 * @param {Array|TypedArray} dstBuffer - The buffer to store the results.
	 * @param {number} [firstQuery=0] - The first query index to read.
	 * @param {number} [queryCount=querySet.count] - The number of queries to read.
	 * @returns {Promise<Array|TypedArray>} A promise that resolves with the passed in buffer after it has been filled with the results.
	 */
	readQuerySetResults(querySet, dstBuffer, firstQuery = 0, queryCount = querySet.count) {}

	/**
	 * Used for context lost and restored.
	 * @protected
	 * @returns {number}
	 */
	increaseId() {
		this.id = _rendererId++;
		return this.id;
	}

}

export { ThinRenderer };