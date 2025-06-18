import { RenderTargetBase } from './RenderTargetBase.js';
import { RenderBuffer } from '../RenderBuffer.js';
import { TextureCube } from '../textures/TextureCube.js';
import { ATTACHMENT, PIXEL_FORMAT } from '../../const.js';

/**
 * Render Target that render to cube texture.
 * @extends RenderTargetBase
 */
class RenderTargetCube extends RenderTargetBase {

	/**
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 */
	constructor(width, height) {
		super(width, height);

		this._attachments = {};

		this.attach(new TextureCube(), ATTACHMENT.COLOR_ATTACHMENT0);
		this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		/**
		 * The activeCubeFace property corresponds to a cube side (PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5).
		 * @type {number}
		 * @default 0
		 */
		this.activeCubeFace = 0;

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
	 * @param  {TextureCube|RenderBuffer} target
	 * @param  {ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
	 */
	attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		if (target.isTextureCube) {
			let changed = false;

			for (let i = 0; i < 6; i++) {
				if (target.images[i] && target.images[i].rtt) {
					if (target.images[i].width !== this.width || target.images[i].height !== this.height) {
						target.images[i].width = this.width;
						target.images[i].height = this.height;
						changed = true;
					}
				} else {
					target.images[i] = { rtt: true, data: null, width: this.width, height: this.height };
					changed = true;
				}
			}

			if (changed) {
				target.version++;
			}
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

				if (target.isTextureCube) {
					for (let i = 0; i < 6; i++) {
						target.images[i] = { rtt: true, data: null, width: this.width, height: this.height };
					}
					target.version++;
				} else {
					target.resize(width, height);
				}
			}
		}
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
RenderTargetCube.prototype.isRenderTargetCube = true;

Object.defineProperties(RenderTargetCube.prototype, {

	texture: {

		set: function(texture) {
			if (texture) {
				if (texture.isTextureCube) {
					this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
				}
			} else {
				this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
			}
		},

		get: function() {
			const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
			return target.isTextureCube ? target : null;
		}

	}

});

export { RenderTargetCube };