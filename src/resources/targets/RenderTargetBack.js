import { RenderTargetBase } from './RenderTargetBase.js';

/**
 * Render Target that render to canvas element.
 * @extends RenderTargetBase
 */
class RenderTargetBack extends RenderTargetBase {

	/**
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

	resize(width, height) {
		this.view.width = width;
		this.view.height = height;

		this.width = width;
		this.height = height;
	}

	dispose() {
		// TODO dispose canvas?
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