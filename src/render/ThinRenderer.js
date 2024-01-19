let _rendererId = 0;

/**
 * Base class for WebGL and WebGPU renderers.
 * @memberof t3d
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
		 * @type {Object}
		 */
		this.capabilities = {};

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

		this._passInfo = {
			// Whether the renderer is in the process of pass rendering.
			// If true, means that the beginRender method has been called but the endRender method has not been called.
			enabled: false,
			// The pass rendering count
			count: 0
		};
	}

	/**
	 * Begin rendering.
	 */
	beginRender() {
		this._passInfo.enabled = true;
	}

	/**
	 * End rendering.
	 */
	endRender() {
		this._passInfo.enabled = false;
		this._passInfo.count++;
	}

	/**
	 * @typedef {Object} t3d.RenderOptions - The render options for renderRenderableItem and renderRenderableList methods.
	 * @property {Function} getGeometry - (Optional) Get renderable geometry.
	 * @property {Function} getMaterial - (Optional) Get renderable material.
	 * @property {Function} beforeRender - (Optional) Before render each renderable item.
	 * @property {Function} afterRender - (Optional) After render each renderable item.
	 * @property {Function} ifRender - (Optional) If render the renderable item.
	 * @property {t3d.RenderInfo} renderInfo - (Optional) Render info for collect information.
	 * @property {Boolean} onlyCompile - (Optional) Only compile shader, do not render.
	 */

	/**
	 * Render a single renderable item with render states.
	 * @param {Object} renderable - The renderable item.
	 * @param {t3d.RenderStates} renderStates - The render states.
	 * @param {t3d.RenderOptions} [options=] - The render options for this render task.
	 */
	renderRenderableItem(renderable, renderStates, options) {}

	/**
	 * Render a single renderable list with render states.
	 * @param {Array} renderables - Array of renderable.
	 * @param {t3d.RenderStates} renderStates - Render states.
	 * @param {t3d.RenderOptions} [options=] - The render options for this render task.
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
	 * @param {t3d.Scene} scene - The scene to render.
	 * @param {t3d.Camera} camera - The camera used to render the scene.
	 * @param {t3d.RenderOptions} [options=] - The render options for this scene render task.
	 */
	renderScene(scene, camera, options = {}) {
		const renderStates = scene.getRenderStates(camera);
		const renderQueue = scene.getRenderQueue(camera);

		this.beginRender();

		let renderQueueLayer;
		for (let i = 0, l = renderQueue.layerList.length; i < l; i++) {
			renderQueueLayer = renderQueue.layerList[i];
			this.renderRenderableList(renderQueueLayer.opaque, renderStates, options);
			this.renderRenderableList(renderQueueLayer.transparent, renderStates, options);
		}

		this.endRender();
	}

	/**
	 * Clear the color, depth and stencil buffers.
	 * @param {Boolean} [color=false] - Clear color buffer.
	 * @param {Boolean} [depth=false] - Clear depth buffer.
	 * @param {Boolean} [stencil=false] - Clear stencil buffer.
	 */
	clear(color, depth, stencil) {}

	/**
	 * Set clear color.
	 * @param {Number} r - Red component in the range 0.0 - 1.0.
	 * @param {Number} g - Green component in the range 0.0 - 1.0.
	 * @param {Number} b - Blue component in the range 0.0 - 1.0.
	 * @param {Number} a - Alpha component in the range 0.0 - 1.0.
	 * @param {Number} premultipliedAlpha - Whether the alpha is premultiplied.
	 */
	setClearColor(r, g, b, a, premultipliedAlpha) {}

	/**
	 * Returns a Vector4 instance with the current clear color and alpha.
	 * Note: Do not modify the value of Vector4, it is read-only.
	 * @return {t3d.Vector4}
	 */
	getClearColor() {}

	/**
	 * This method sets the active rendertarget.
	 * @param {t3d.RenderTargetBase} renderTarget The renderTarget that needs to be activated.
	 */
	setRenderTarget(renderTarget) {}

	/**
	 * Returns the current RenderTarget if there are; returns null otherwise.
	 * @return {t3d.RenderTargetBase|Null}
	 */
	getRenderTarget() {}

	/**
	 * Copy a frame buffer to another.
	 * This copy process can be used to perform multi-sampling (MSAA).
	 * @param {t3d.RenderTargetBase} read - The source renderTarget.
	 * @param {t3d.RenderTargetBase} draw - The destination renderTarget.
	 * @param {Boolean} [color=true] - Copy color buffer.
	 * @param {Boolean} [depth=true] - Copy depth buffer.
	 * @param {Boolean} [stencil=true] - Copy stencil buffer.
	 */
	blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {}

	/**
	 * Reads the pixel data from the current renderTarget into the buffer you pass in.
	 * @param {Number} x - The x coordinate of the rectangle to read from.
	 * @param {Number} y - The y coordinate of the rectangle to read from.
	 * @param {Number} width - The width of the rectangle to read from.
	 * @param {Number} height - The height of the rectangle to read from.
	 * @param {TypedArray} buffer Uint8Array is the only destination type supported in all cases, other types are renderTarget and platform dependent.
	 * @return {Promise<TypedArray>} A promise that resolves with the passed in buffer after it has been filled with the pixel data.
	 */
	readRenderTargetPixels(x, y, width, height, buffer) {}

	/**
	 * Generate mipmaps for the renderTarget you pass in.
	 * @param {t3d.RenderTargetBase} renderTarget - The renderTarget to update.
	 */
	updateRenderTargetMipmap(renderTarget) {}

	/**
	 * Bind webglTexture to t3d's texture.
	 * @param {t3d.TextureBase} texture
	 * @param {WebGLTexture} webglTexture
	 */
	setTextureExternal(texture, webglTexture) {}

	/**
	 * Bind webglRenderbuffer to t3d's renderBuffer.
	 * @param {t3d.RenderBuffer} renderBuffer
	 * @param {WebGLRenderbuffer} webglRenderbuffer
	 */
	setRenderBufferExternal(renderBuffer, webglRenderbuffer) {}

	/**
	 * Bind webglBuffer to t3d's buffer.
	 * @param {t3d.Buffer} buffer
	 * @param {WebGLBuffer} webglBuffer
	 */
	setBufferExternal(buffer, webglBuffer) {}

	/**
	 * Reset vertex array object bindings.
	 * @param {Boolean} [force=false] - Whether clear the current vertex array object.
	 */
	resetVertexArrayBindings(force) {}

	/**
	 * Reset all render states cached in this renderer.
	 * This is useful when you use multiple renderers in one application.
	 */
	resetState() {}

	/**
	 * Begin a query instance.
	 * @param {t3d.Query} query
	 * @param {t3d.QUERY_TYPE} target
	 */
	beginQuery(query, target) {}

	/**
	 * End a query instance.
	 * @param {t3d.Query} query
	 */
	endQuery(query) {}

	/**
	 * Records the current time into the corresponding query object.
	 * @param {t3d.Query} query
	 */
	queryCounter(query) {}

	/**
	 * Returns true if the timer query was disjoint, indicating that timing results are invalid.
	 * This is rare and might occur, for example, if the GPU was throttled while timing.
	 * @param {t3d.Query} query
	 * @return {Boolean} Returns true if the timer query was disjoint.
	 */
	isTimerQueryDisjoint(query) {}

	/**
	 * Check if the query result is available.
	 * @param {t3d.Query} query
	 * @return {Boolean} If query result is available.
	 */
	isQueryResultAvailable(query) {}

	/**
	 * Get the query result.
	 * @param {t3d.Query} query
	 * @return {Number} The query result.
	 */
	getQueryResult(query) {}

	/**
	 * Used for context lost and restored.
	 * @protected
	 */
	increaseId() {
		this.id = _rendererId++;
		return this.id;
	}

}

export { ThinRenderer };