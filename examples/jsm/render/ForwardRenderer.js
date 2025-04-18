import {
	RenderTargetBack,
	ShadowMapPass,
	WebGLRenderer
} from 't3d';

/**
 * A simple Forward WebGL Renderer.
 * @memberof t3d
 */
class ForwardRenderer extends WebGLRenderer {

	/**
	 * @param {HTMLCanvasElement} view - The canvas elements.
	 * @param {object} [options] - The {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext options for webgl context}.
	 */
	constructor(view, options) {
		const defaultContextParams = {
			antialias: true, // antialias
			alpha: false, // effect performance, default false
			// premultipliedAlpha: false, // effect performance, default false
			stencil: true
		};

		const gl = view.getContext('webgl2', options || defaultContextParams) || view.getContext('webgl', options || defaultContextParams);

		super(gl);

		if (this.capabilities.version < 2) {
			console.info('ForwardRenderer use WebGL1 because of your browser not support WebGL2.');
		}

		this.backRenderTarget = new RenderTargetBack(view);

		this.shadowMapPass = new ShadowMapPass();

		/**
		 * Defines whether the shadow pass should automatically update.
		 * @type {boolean}
		 * @default true
		 */
		this.shadowAutoUpdate = true;

		/**
		 * If {@link ForwardRenderer.shadowAutoUpdate} is set true and this set true, shadow will update and set this to false automatically.
		 * @type {boolean}
		 * @default true
		 */
		this.shadowNeedsUpdate = true;

		/**
		 * Defines whether the scene should automatically update its matrix.
		 * @type {boolean}
		 * @default true
		 */
		this.matrixAutoUpdate = true;

		/**
		 * Defines whether the scene should automatically update its render states.
		 * @type {boolean}
		 * @default true
		 */
		this.renderStatesAutoUpdate = true;

		/**
		 * Defines whether the scene should automatically update its render queue.
		 * @type {boolean}
		 * @default true
		 */
		this.renderQueueAutoUpdate = true;

		/**
		 * Defines whether the renderer should automatically clear its output before rendering a frame.
		 * @type {boolean}
		 * @default true
		 */
		this.autoClear = true;
	}

	/**
	 * Render a scene using a camera.
	 * The render is done to the renderTarget (if specified) or to the canvas as usual.
	 * @param {Scene} scene - The scene.
	 * @param {Camera} camera - The camera.
	 * @param {RenderTargetBase} [renderTarget] - The render is done to the renderTarget (if specified) or to the canvas as usual.
	 * @param {boolean} [forceClear=false] - If set true, the depth, stencil and color buffers will be cleared before rendering even if the renderer's autoClear property is false.
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
		this.setRenderTarget(renderTarget);

		if (this.autoClear || forceClear) {
			this.clear(true, true, true);
		}

		this.renderScene(scene, camera);

		if (renderTarget.texture) {
			this.updateRenderTargetMipmap(renderTarget);
		}
	}

}

export { ForwardRenderer };