import { RenderTargetBase } from './RenderTargetBase.js';
import { RenderBuffer } from '../RenderBuffer.js';
import { Texture2D } from '../textures/Texture2D.js';
import { ATTACHMENT, PIXEL_FORMAT } from '../../const.js';

/**
 * Render Target that render to 2d texture.
 * @memberof t3d
 * @extends t3d.RenderTargetBase
 */
class RenderTarget2D extends RenderTargetBase {

	/**
	 * @param {Number} width - The width of the render target.
	 * @param {Number} height - The height of the render target.
	 */
	constructor(width, height) {
		super(width, height);

		this._attachments = {};

		this.attach(new Texture2D(), ATTACHMENT.COLOR_ATTACHMENT0);
		this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
	}

	/**
	 * Attach a texture(RTT) or renderbuffer to the framebuffer.
	 * Notice: For now, dynamic Attachment during rendering is not supported.
	 * @param  {t3d.Texture2D|t3d.RenderBuffer} target
	 * @param  {t3d.ATTACHMENT} [attachment=t3d.ATTACHMENT.COLOR_ATTACHMENT0]
	 */
	attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		if (target.isTexture) {
			if (target.image && target.image.rtt) {
				if (target.image.width !== this.width || target.image.height !== this.height) {
					target.version++;
					target.image.width = this.width;
					target.image.height = this.height;
				}
			} else {
				target.version++;
				target.image = { rtt: true, data: null, width: this.width, height: this.height };
			}
		} else {
			target.resize(this.width, this.height);
		}

		this._attachments[attachment] = target;
	}

	/**
	 * Detach a texture(RTT) or renderbuffer.
	 * @param  {t3d.ATTACHMENT} [attachment=t3d.ATTACHMENT.COLOR_ATTACHMENT0]
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

				if (target.isTexture) {
					target.image = { rtt: true, data: null, width: this.width, height: this.height };
					target.version++;
				} else {
					target.resize(width, height);
				}
			}
		}

		return changed;
	}

	/**
	 * Dispose the render target.
	 * @param {Boolean} [disposeAttachments=true] whether to dispose textures and render buffers attached on this render target.
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
 * @readonly
 * @type {Boolean}
 * @default true
 */
RenderTarget2D.prototype.isRenderTarget2D = true;

Object.defineProperties(RenderTarget2D.prototype, {

	texture: {

		set: function(texture) {
			if (texture) {
				if (texture.isTexture) {
					this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
				}
			} else {
				this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
			}
		},

		get: function() {
			const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
			return target.isTexture ? target : null;
		}

	}

});

export { RenderTarget2D };