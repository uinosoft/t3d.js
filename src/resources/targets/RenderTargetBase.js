import { EventDispatcher } from '../../EventDispatcher.js';

/**
 * Render Target is the wrapping class of gl.framebuffer.
 * @extends EventDispatcher
 * @abstract
 */
class RenderTargetBase extends EventDispatcher {

	/**
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 */
	constructor(width, height) {
		super();

		/**
		 * The width of the render target.
		 * @type {number}
		 */
		this.width = width;

		/**
		 * The height of the render target.
		 * @type {number}
		 */
		this.height = height;
	}

	/**
	 * Resize the render target.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 * @returns {boolean} - If size changed.
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
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
RenderTargetBase.prototype.isRenderTarget = true;

export { RenderTargetBase };