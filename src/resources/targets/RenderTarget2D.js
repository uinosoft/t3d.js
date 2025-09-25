import { RenderTargetBase } from './RenderTargetBase.js';
import { RenderBuffer } from '../RenderBuffer.js';
import { Texture2D } from '../textures/Texture2D.js';
import { ATTACHMENT, PIXEL_FORMAT } from '../../const.js';

/**
 * Render Target that render to 2d texture.
 * @extends RenderTargetBase
 */
class RenderTarget2D extends RenderTargetBase {

	/**
	 * Create a new RenderTarget2D.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 */
	constructor(width, height) {
		super(width, height);

		this._attachments = {};

		this.attach(new Texture2D(), ATTACHMENT.COLOR_ATTACHMENT0);
		this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

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
	 * @param  {Texture2D|RenderBuffer} target
	 * @param  {ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
	 */
	attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		if (target.isTexture2D) {
			target.resizeAsAttachment(this.width, this.height);
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
	 * @override
	 */
	resize(width, height) {
		const changed = super.resize(width, height);

		if (changed) {
			this.dispose(false);

			for (const attachment in this._attachments) {
				const target = this._attachments[attachment];

				if (target.isTexture2D) {
					target.resizeAsAttachment(this.width, this.height);
				} else {
					target.resize(width, height);
				}
			}
		}

		return changed;
	}

	/**
	 * Dispose the render target.
	 * @param {boolean} [disposeAttachments=true] whether to dispose textures and render buffers attached on this render target.
	 */
	dispose(disposeAttachments = true) {
		super.dispose();

		if (disposeAttachments) {
			for (const attachment in this._attachments) {
				this._attachments[attachment].dispose();
			}
		}
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
RenderTarget2D.prototype.isRenderTarget2D = true;

Object.defineProperties(RenderTarget2D.prototype, {

	texture: {

		set: function(texture) {
			if (texture) {
				if (texture.isTexture2D) {
					this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
				}
			} else {
				this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
			}
		},

		get: function() {
			const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
			return target.isTexture2D ? target : null;
		}

	}

});

export { RenderTarget2D };