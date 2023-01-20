import {
	RenderTargetBack,
	ShadowMapPass,
	Renderer
} from 't3d';

/**
 * A simple Forward Renderer.
 * @memberof t3d
 */
class ForwardRenderer extends Renderer {

	/**
	 * @param {HTMLCanvasElement} view - The canvas elements.
	 * @param {Object} [options=] - The {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext options for webgl context}.
	 */
	constructor(view, options) {
		const defaultContextParams = {
			antialias: true, // antialias
			alpha: false, // effect performance, default false
			// premultipliedAlpha: false, // effect performance, default false
			stencil: true
		};

		const gl = view.getContext("webgl2", options || defaultContextParams) || view.getContext("webgl", options || defaultContextParams);

		super(gl);

		console.info("ForwardRenderer use WebGL Version: " + this.renderPass.capabilities.version);

		this.backRenderTarget = new RenderTargetBack(view);

		this.shadowMapPass = new ShadowMapPass();

		/**
		 * Defines whether the shadow pass should automatically update.
		 * @type {Boolean}
		 * @default true
		 */
		this.shadowAutoUpdate = true;

		/**
		 * If {@link ForwardRenderer.shadowAutoUpdate} is set true and this set true, shadow will update and set this to false automatically.
		 * @type {Boolean}
		 * @default true
		 */
		this.shadowNeedsUpdate = true;

		/**
		 * Defines whether the scene should automatically update its matrix.
		 * @type {Boolean}
		 * @default true
		 */
		this.matrixAutoUpdate = true;

		/**
		 * Defines whether the scene should automatically update its render states.
		 * @type {Boolean}
		 * @default true
		 */
		this.renderStatesAutoUpdate = true;

		/**
		 * Defines whether the scene should automatically update its render queue.
		 * @type {Boolean}
		 * @default true
		 */
		this.renderQueueAutoUpdate = true;

		/**
		 * Defines whether the renderer should automatically clear its output before rendering a frame.
		 * @type {Boolean}
		 * @default true
		 */
		this.autoClear = true;
	}

	/**
	 * Render a scene using a camera.
	 * The render is done to the renderTarget (if specified) or to the canvas as usual.
	 * @param {t3d.Scene} scene - The scene.
	 * @param {t3d.Camera} camera - The camera.
	 * @param {t3d.RenderTargetBase} [renderTarget=] - The render is done to the renderTarget (if specified) or to the canvas as usual.
	 * @param {Boolean} [forceClear=false] - If set true, the depth, stencil and color buffers will be cleared before rendering even if the renderer's autoClear property is false.
	 */
	render(scene, camera, renderTarget, forceClear) {
		this.matrixAutoUpdate && scene.updateMatrix();

		this.renderStatesAutoUpdate && scene.updateRenderStates(camera);
		this.renderQueueAutoUpdate && scene.updateRenderQueue(camera);

		if (this.shadowAutoUpdate || this.shadowNeedsUpdate) {
			this.shadowMapPass.render(this, scene);

			this.shadowNeedsUpdate = false;
		}

		if (renderTarget === undefined) {
			renderTarget = this.backRenderTarget;
		}
		this.renderPass.setRenderTarget(renderTarget);

		if (this.autoClear || forceClear) {
			this.renderPass.clear(true, true, true);
		}

		this.renderScene(scene, camera);

		if (!!renderTarget.texture) {
			this.renderPass.updateRenderTargetMipmap(renderTarget);
		}
	}

}

export { ForwardRenderer };