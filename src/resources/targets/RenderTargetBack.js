import { RenderTargetBase } from './RenderTargetBase.js';

/**
 * Render Target that render to screen (canvas).
 * @extends RenderTargetBase
 */
class RenderTargetBack extends RenderTargetBase {

	/**
	 * Create a new RenderTargetBack.
	 * @param {HTMLCanvasElement} view - The canvas element which the Render Target rendered to.
	 */
	constructor(view) {
		super(view.width, view.height);

		/**
		 * The canvas element which the Render Target rendered to.
		 * @type {HTMLCanvasElement}
		 */
		this.view = view;
	}

	/**
	 * Resizes the render target to the specified dimensions.
	 * This method will set the width and height properties of the canvas.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 */
	resize(width, height) {
		this.view.width = width;
		this.view.height = height;

		this.width = width;
		this.height = height;
	}

	/**
	 * Dispatches a dispose event.
	 */
	dispose() {
		this.dispatchEvent({ type: 'dispose' });
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
RenderTargetBack.prototype.isRenderTargetBack = true;

export { RenderTargetBack };