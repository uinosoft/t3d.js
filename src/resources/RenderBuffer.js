import { PIXEL_FORMAT } from '../const.js';
import { EventDispatcher } from '../EventDispatcher.js';

/**
 * Render Buffer can be attached to RenderTarget.
 * @extends EventDispatcher
 */
class RenderBuffer extends EventDispatcher {

	/**
	 * @param {number} width - The width of the render buffer.
	 * @param {number} height - The height of the render buffer.
	 * @param {PIXEL_FORMAT} [format=PIXEL_FORMAT.RGBA8] - The internal format of the render buffer.
	 * @param {number} [multipleSampling=0] - If bigger than zero, this renderBuffer will support multipleSampling. (Only usable in WebGL 2.0)
	 */
	constructor(width, height, format = PIXEL_FORMAT.RGBA8, multipleSampling = 0) {
		super();

		/**
		 * The width of the render buffer.
		 * @type {number}
		 */
		this.width = width;

		/**
		 * The height of the render buffer.
		 * @type {number}
		 */
		this.height = height;

		/**
		 * Render buffer texel storage data format.
		 * DEPTH_COMPONENT16: for depth attachments.
		 * DEPTH_STENCIL: for depth stencil attachments.
		 * RGBA8：for multiple sampled color attachments.
		 * DEPTH_COMPONENT16: for multiple sampled depth attachments.
		 * DEPTH24_STENCIL8: for multiple sampled depth stencil attachments.
		 * @type {PIXEL_FORMAT}
		 * @default PIXEL_FORMAT.RGBA8
		 */
		this.format = format;

		/**
		 * If bigger than zero, this renderBuffer will support multipleSampling. (Only usable in WebGL 2.0)
		 * A Render Target's attachments must have the same multipleSampling value.
		 * Texture can't be attached to the same render target with a multiple sampled render buffer.
		 * Max support 8.
		 * @type {number}
		 * @default 0
		 */
		this.multipleSampling = multipleSampling;
	}

	/**
	 * Resize the render buffer.
	 * @param {number} width - The width of the render buffer.
	 * @param {number} height - The height of the render buffer.
	 * @returns {boolean} - If size changed.
	 */
	resize(width, height) {
		if (this.width !== width || this.height !== height) {
			this.dispose();
			this.width = width;
			this.height = height;

			return true;
		}

		return false;
	}

	/**
	 * Returns a clone of this render buffer.
	 * @returns {RenderBuffer}
	 */
	clone() {
		return new this.constructor().copy(this);
	}

	/**
	 * Copy the given render buffer into this render buffer.
	 * @param {RenderBuffer} source - The render buffer to be copied.
	 * @returns {RenderBuffer}
	 */
	copy(source) {
		this.format = source.format;
		this.multipleSampling = source.multipleSampling;

		return this;
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
RenderBuffer.prototype.isRenderBuffer = true;

export { RenderBuffer };