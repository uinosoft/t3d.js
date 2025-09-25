import { RenderTargetBase } from './RenderTargetBase.js';
import { RenderBuffer } from '../RenderBuffer.js';
import { Texture2D } from '../textures/Texture2D.js';
import { TextureCube } from '../textures/TextureCube.js';
import { Texture3D } from '../textures/Texture3D.js';
import { Texture2DArray } from '../textures/Texture2DArray.js';
import { ATTACHMENT, PIXEL_FORMAT } from '../../const.js';

/**
 * Render Target that render to offscreen textures or renderbuffers.
 * @extends RenderTargetBase
 */
class OffscreenRenderTarget extends RenderTargetBase {

	/**
	 * Create a new OffscreenRenderTarget.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 */
	constructor(width, height) {
		super(width, height);

		/**
		 * The active layer index for rendering.
		 * For cube render targets, this represents the active cube face.
		 * @type {number}
		 * @default 0
		 */
		this.activeLayer = 0;

		/**
		 * The active mipmap level for rendering.
		 * Not supported in WebGL1.
		 * @type {number}
		 * @default 0
		 */
		this.activeMipmapLevel = 0;

		this._attachments = {};
	}

	/**
	 * Resize the render target to the specified dimensions.
	 * This will resize all attached attachments.
	 * @param {number} width - The new width of the render target.
	 * @param {number} height - The new height of the render target.
	 * @param {number} [depth] - **DEPRECATED**: Depth parameter is no longer used.
	 * Individual textures manage their own depth dimensions.
	 */
	resize(width, height, depth) {
		if (arguments.length > 2) {
			console.warn('OffscreenRenderTarget.resize(): The depth parameter is deprecated. ' +
				'RenderTarget no longer manages texture depth as it is not required by the rendering backend. ' +
				'Use texture.resizeAsAttachment() directly to control texture dimensions.');
		}

		if (this.width === width && this.height === height) return;

		this.width = width;
		this.height = height;

		this.dispose(false);

		for (const attachment in this._attachments) {
			const target = this._attachments[attachment];

			if (target.isTexture) {
				target.resizeAsAttachment(width, height);
			} else {
				target.resize(width, height);
			}
		}
	}

	/**
	 * Dispose the render target.
	 * @param {boolean} [disposeAttachments=true] - Whether to dispose attachments as well.
	 */
	dispose(disposeAttachments = true) {
		this.dispatchEvent({ type: 'dispose' });

		if (disposeAttachments) {
			for (const attachment in this._attachments) {
				this._attachments[attachment].dispose();
			}
		}
	}

	/**
	 * Attach a texture(RTT) or renderbuffer to the framebuffer.
	 * Notice: For now, dynamic Attachment during rendering is not supported.
	 * @param  {TextureBase|RenderBuffer} target - The texture or renderbuffer to attach.
	 * @param  {ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0] - The attachment point.
	 * @returns {OffscreenRenderTarget} Self for chaining.
	 */
	attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		if (target.isTexture) {
			target.resizeAsAttachment(this.width, this.height);
		} else {
			target.resize(this.width, this.height);
		}

		this._attachments[attachment] = target;

		return this;
	}

	/**
	 * Detach a texture(RTT) or renderbuffer.
	 * @param  {ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0] - The attachment point to detach.
	 * @returns {OffscreenRenderTarget} Self for chaining.
	 */
	detach(attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		delete this._attachments[attachment];
		return this;
	}

	/**
	 * Get the attached attachment at the specified attachment point.
	 * @param  {ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0] - The attachment point.
	 * @returns {TextureBase|RenderBuffer|null} The attached texture or renderbuffer.
	 */
	getAttachment(attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
		return this._attachments[attachment] || null;
	}

	/**
	 * The main texture attachment which is the first color attachment.
	 * @type {TextureBase|null}
	 */
	set texture(texture) {
		if (texture && texture.isTexture) {
			this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
		} else {
			this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
		}
	}

	get texture() {
		const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
		return target && target.isTexture ? target : null;
	}

	/**
	 * An alias for {@link OffscreenRenderTarget#activeLayer}. Specifically represents
	 * the currently rendered cube face (0-5) when using cube textures.
	 * @type {number}
	 */
	set activeCubeFace(value) {
		this.activeLayer = value;
	}

	get activeCubeFace() {
		return this.activeLayer;
	}

	/**
	 * Create a simple offscreen render target with a color texture and
	 * a depth-stencil renderbuffer.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 * @returns {OffscreenRenderTarget} The created offscreen render target.
	 */
	static create2D(width, height) {
		const renderTarget = new OffscreenRenderTarget(width, height);
		renderTarget.attach(new Texture2D(), ATTACHMENT.COLOR_ATTACHMENT0);
		renderTarget.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
		return renderTarget;
	}

	/**
	 * Create a simple offscreen render target with a cube color texture and
	 * a depth-stencil renderbuffer.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 * @returns {OffscreenRenderTarget} The created offscreen render target.
	 */
	static createCube(width, height) {
		const renderTarget = new OffscreenRenderTarget(width, height);
		renderTarget.attach(new TextureCube(), ATTACHMENT.COLOR_ATTACHMENT0);
		renderTarget.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
		return renderTarget;
	}

	/**
	 * Create a simple offscreen render target with a 3D color texture.
	 * Note: No depth-stencil attachment is created by default.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 * @param {number} depth - The depth of the 3D texture.
	 * @returns {OffscreenRenderTarget} The created offscreen render target.
	 */
	static create3D(width, height, depth) {
		const renderTarget = new OffscreenRenderTarget(width, height);
		const texture = new Texture3D();
		texture.resizeAsAttachment(width, height, depth);
		renderTarget.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
		return renderTarget;
	}

	/**
	 * Create a simple offscreen render target with a 2D array color texture.
	 * Note: No depth-stencil attachment is created by default.
	 * @param {number} width - The width of the render target.
	 * @param {number} height - The height of the render target.
	 * @param {number} depth - The depth of the 2D array texture (number of layers).
	 * @returns {OffscreenRenderTarget} The created offscreen render target.
	 */
	static create2DArray(width, height, depth) {
		const renderTarget = new OffscreenRenderTarget(width, height);
		const texture = new Texture2DArray();
		texture.resizeAsAttachment(width, height, depth);
		renderTarget.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
		return renderTarget;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
OffscreenRenderTarget.prototype.isOffscreenRenderTarget = true;

export { OffscreenRenderTarget };