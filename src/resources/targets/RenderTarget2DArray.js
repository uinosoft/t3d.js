import { RenderTargetBase } from './RenderTargetBase.js';
import { Texture2DArray } from '../textures/Texture2DArray.js';
import { ATTACHMENT } from '../../const.js';

/**
 * Render Target that render to 2d array texture.
 * @memberof t3d
 * @extends t3d.RenderTargetBase
 */
class RenderTarget2DArray extends RenderTargetBase {

	/**
	 * @param {Number} width - The width of the render target.
	 * @param {Number} height - The height of the render target.
	 * @param {Number} depth - The depth of the render target.
	 */
	constructor(width, height, depth) {
		super(width, height);

		this.depth = depth;

		this._attachments = {};

		this.attach(new Texture2DArray(), ATTACHMENT.COLOR_ATTACHMENT0);

		/**
		 * Specifies the layer.
		 * This is only available in WebGL2.
		 * @type {Number}
		 * @default 0
		 */
		this.activeLayer = 0;

		/**
		 * Specifies the active mipmap level.
		 * This is only available in WebGL2.
		 * @type {Number}
		 * @default 0
		 */
		this.activeMipmapLevel = 0;
	}

	/**
	 * Attach a texture(RTT) or renderbuffer to the framebuffer.
	 * Notice: For now, dynamic Attachment during rendering is not supported.
	 * @param  {t3d.Texture2DArray|t3d.RenderBuffer} target
	 * @param  {t3d.ATTACHMENT} [attachment=t3d.ATTACHMENT.COLOR_ATTACHMENT0]
	 */
	attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		if (target.isTexture2DArray) {
			if (target.image && target.image.rtt) {
				if (target.image.width !== this.width || target.image.height !== this.height || target.image.depth !== this.depth) {
					target.version++;
					target.image.width = this.width;
					target.image.height = this.height;
					target.image.depth = this.depth;
				}
			} else {
				target.version++;
				target.image = { rtt: true, data: null, width: this.width, height: this.height, depth: this.depth };
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
	 * Resize the render target.
	 * @param {Number} width - The width of the render target.
	 * @param {Number} height - The height of the render target.
	 * @param {Number} depth - The depth of the render target.
	 * @return {Boolean} - If size changed.
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
					target.image = { rtt: true, data: null, width: this.width, height: this.height, depth: this.depth };
					target.version++;
				} else {
					target.resize(width, height);
				}
			}
		}

		return changed;
	}

}

/**
 * @readonly
 * @type {Boolean}
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