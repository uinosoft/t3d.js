import { EventDispatcher } from '../../EventDispatcher.js';

/**
 * Render Target is the wrapping class of gl.framebuffer.
 * @memberof t3d
 * @extends t3d.EventDispatcher
 * @abstract
 */
class RenderTargetBase extends EventDispatcher {

	/**
	 * @param {Number} width - The width of the render target.
	 * @param {Number} height - The height of the render target.
	 */
	constructor(width, height) {
		super();

		/**
		 * The width of the render target.
		 * @type {Number}
		 */
		this.width = width;

		/**
		 * The height of the render target.
		 * @type {Number}
		 */
		this.height = height;
	}

	/**
	 * Resize the render target.
	 * @param {Number} width - The width of the render target.
	 * @param {Number} height - The height of the render target.
	 * @return {Boolean} - If size changed.
	 */
	resize(width, height) {
		if (this.width !== width || this.height !== height) {
			this.width = width;
			this.height = height;
			return true;
		}

		return false;
	}

	/**
	 * Dispatches a dispose event.
	 */
	dispose() {
		this.dispatchEvent({ type: 'dispose' });
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
RenderTargetBase.prototype.isRenderTarget = true;

export { RenderTargetBase };