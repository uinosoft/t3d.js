import { RenderTargetBase } from './RenderTargetBase.js';

/**
 * Render Target that render to canvas element.
 * @memberof t3d
 * @extends t3d.RenderTargetBase
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
 * @readonly
 * @type {Boolean}
 * @default true
 */
RenderTargetBack.prototype.isRenderTargetBack = true;

export { RenderTargetBack };