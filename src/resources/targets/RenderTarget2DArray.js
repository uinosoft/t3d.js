import { RenderTargetBase } from './RenderTargetBase.js';
import { Texture2DArray } from '../textures/Texture2DArray.js';
import { ATTACHMENT } from '../../const.js';

/**
 * Render Target that render to 2d array texture.
 * @extends RenderTargetBase
 */
class RenderTarget2DArray extends RenderTargetBase {

	/**
	 * Create a new RenderTarget2DArray.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 * @param {number} depth - The depth of the render target.
	 */
	constructor(width, height, depth) {
		super(width, height);

		this.depth = depth;

		this._attachments = {};

		this.attach(new Texture2DArray(), ATTACHMENT.COLOR_ATTACHMENT0);

		/**
		 * Specifies the layer.
		 * This is only available in WebGL2.
		 * @type {number}
		 * @default 0
		 */
		this.activeLayer = 0;

		/**
		 * Specifies the active mipmap level.
		 * This is only available in WebGL2.
		 * @type {number}
		 * @default 0
		 */
		this.activeMipmapLevel = 0;
	}

	/**
	 * Attach a texture(RTT) or renderbuffer to the framebuffer.
	 * Notice: For now, dynamic Attachment during rendering is not supported.
	 * @param  {Texture2DArray|RenderBuffer} target
	 * @param  {ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
	 */
	attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		if (target.isTexture2DArray) {
			target.resizeAsAttachment(this.width, this.height, this.depth);
		} else {
			target.resize(this.width, this.height);
		}

		this._attachments[attachment] = target;
	}

	/**
	 * Detach a texture(RTT) or renderbuffer.
	 * @param  {ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
	 */
	detach(attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		delete this._attachments[attachment];
	}

	/**
	 * Resize the render target.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 * @param {number} depth - The depth of the render target.
	 * @returns {boolean} - If size changed.
	 */
	resize(width, height, depth) {
		let changed = false;

		if (this.width !== width || this.height !== height || this.depth !== depth) {
			this.width = width;
			this.height = height;
			this.depth = depth;
			changed = true;
		}

		if (changed) {
			this.dispose(false);

			for (const attachment in this._attachments) {
				const target = this._attachments[attachment];

				if (target.isTexture2DArray) {
					target.resizeAsAttachment(this.width, this.height, this.depth);
				} else {
					target.resize(width, height);
				}
			}
		}

		return changed;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
RenderTarget2DArray.prototype.isRenderTarget2DArray = true;

Object.defineProperties(RenderTarget2DArray.prototype, {

	texture: {

		set: function(texture) {
			if (texture) {
				if (texture.isTexture2DArray) {
					this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
				}
			} else {
				this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
			}
		},

		get: function() {
			const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
			return target.isTexture2DArray ? target : null;
		}

	}

});

export { RenderTarget2DArray };