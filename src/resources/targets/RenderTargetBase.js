import { EventDispatcher } from '../../EventDispatcher.js';
import { Color4 } from '../../math/Color4.js';

/**
 * RenderTargetBase is an abstract class representing a rendering target,
 * which encapsulates the configuration for a render pass,
 * including clear states, attachments, and other rendering parameters.
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

		/**
		 * Whether to clear the color buffer before rendering to this render target.
		 * @type {boolean}
		 * @default true
		 */
		this.clearColor = true;

		/**
		 * Whether to clear the depth buffer before rendering to this render target.
		 * @type {boolean}
		 * @default true
		 */
		this.clearDepth = true;

		/**
		 * Whether to clear the stencil buffer before rendering to this render target.
		 * @type {boolean}
		 * @default true
		 */
		this.clearStencil = true;

		/**
		 * Clear color value.
		 * @type {Color4}
		 */
		this.colorClearValue = new Color4(0, 0, 0, 0);

		/**
		 * Clear depth value.
		 * @type {number}
		 * @default 1
		 */
		this.depthClearValue = 1;

		/**
		 * Clear stencil value.
		 * @type {number}
		 * @default 0
		 */
		this.stencilClearValue = 0;

		/**
		 * A querySet that will store the occlusion query results. If null, occlusion queries are disabled.
		 * @type {QuerySet|null}
		 * @default null
		 */
		this.occlusionQuerySet = null;

		/**
		 * An array of objects defining where and when timestamp query values will be written.
		 * @type {object}
		 * @property {QuerySet|null} querySet - A timestamp querySet. If null, timestamp queries are disabled.
		 * @property {number} beginningOfPassWriteIndex - A number specifying the query index in querySet where the timestamp at the beginning of the render pass will be written.
		 * @property {number} endOfPassWriteIndex - A number specifying the query index in querySet where the timestamp at the end of the render pass will be written.
		 */
		this.timestampWrites = {
			querySet: null,
			beginningOfPassWriteIndex: 0,
			endOfPassWriteIndex: 1
		};
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

	/**
	 * Sets the clear state.
	 * @param {boolean} [color] - Whether to clear the color buffer.
	 * @param {boolean} [depth] - Whether to clear the depth buffer.
	 * @param {boolean} [stencil] - Whether to clear the stencil buffer.
	 * @returns {RenderTargetBase} A reference to this render target.
	 */
	setClear(color, depth, stencil) {
		this.clearColor = color !== undefined ? color : this.clearColor;
		this.clearDepth = depth !== undefined ? depth : this.clearDepth;
		this.clearStencil = stencil !== undefined ? stencil : this.clearStencil;
		return this;
	}

	/**
	 * Sets the clear values.
	 * @param {number} r - Red channel value between 0.0 and 1.0.
	 * @param {number} g - Green channel value between 0.0 and 1.0.
	 * @param {number} b - Blue channel value between 0.0 and 1.0.
	 * @param {number} a - Alpha channel value between 0.0 and 1.0.
	 * @returns {RenderTargetBase} A reference to this render target.
	 */
	setColorClearValue(r, g, b, a) {
		this.colorClearValue.setRGBA(r, g, b, a);
		return this;
	}

	/**
	 * Sets the clear depth value.
	 * @param {number} depth - The depth value.
	 * @returns {RenderTargetBase} A reference to this render target.
	 */
	setDepthClearValue(depth) {
		this.depthClearValue = depth;
		return this;
	}

	/**
	 * Sets the clear stencil value.
	 * @param {number} stencil - The stencil value.
	 * @returns {RenderTargetBase} A reference to this render target.
	 */
	setStencilClearValue(stencil) {
		this.stencilClearValue = stencil;
		return this;
	}

	/**
	 * Sets the occlusion query set.
	 * @param {QuerySet|null} querySet - The occlusion query set. If null, occlusion queries are disabled.
	 * @returns {RenderTargetBase} A reference to this render target.
	 */
	setOcclusionQuerySet(querySet) {
		this.occlusionQuerySet = querySet;
		return this;
	}

	/**
	 * Sets the timestamp query set and the query indices.
	 * @param {QuerySet|null} querySet - The timestamp query set. If null, timestamp queries are disabled.
	 * @param {number} [beginIndex=0] - The query index in querySet where the timestamp at the beginning of the render pass will be written.
	 * @param {number} [endIndex=1] - The query index in querySet where the timestamp at the end of the render pass will be written.
	 * @returns {RenderTargetBase} A reference to this render target.
	 */
	setTimestampWrites(querySet, beginIndex = 0, endIndex = 1) {
		this.timestampWrites.querySet = querySet;
		this.timestampWrites.beginningOfPassWriteIndex = beginIndex;
		this.timestampWrites.endOfPassWriteIndex = endIndex;
		return this;
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