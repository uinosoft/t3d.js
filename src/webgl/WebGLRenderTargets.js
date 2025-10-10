import { ATTACHMENT } from '../const.js';
import { PropertyMap } from '../render/PropertyMap.js';

class WebGLRenderTargets extends PropertyMap {

	constructor(prefix, gl, state, capabilities, textures, renderBuffers, constants) {
		super(prefix);

		this._gl = gl;
		this._state = state;
		this._capabilities = capabilities;
		this._textures = textures;
		this._renderBuffers = renderBuffers;
		this._constants = constants;

		const that = this;

		function onRenderTargetDispose(event) {
			const renderTarget = event.target;

			renderTarget.removeEventListener('dispose', onRenderTargetDispose);

			const renderTargetProperties = that.get(renderTarget);

			if (renderTargetProperties.__webglFramebuffer && !renderTargetProperties.__external) {
				gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
			}

			that.delete(renderTarget);

			if (state.currentRenderTarget === renderTarget) {
				state.currentRenderTarget = null;
			}
		}

		this._onRenderTargetDispose = onRenderTargetDispose;
	}

	_setupRenderTarget(renderTarget) {
		const gl = this._gl;
		const state = this._state;
		const textures = this._textures;
		const renderBuffers = this._renderBuffers;
		const capabilities = this._capabilities;

		const renderTargetProperties = this.get(renderTarget);

		renderTarget.addEventListener('dispose', this._onRenderTargetDispose);

		const glFrameBuffer = gl.createFramebuffer();
		const drawBuffers = [];

		renderTargetProperties.__webglFramebuffer = glFrameBuffer;
		renderTargetProperties.__drawBuffers = drawBuffers;
		renderTargetProperties.__currentActiveMipmapLevel = renderTarget.activeMipmapLevel;
		renderTargetProperties.__currentActiveLayer = renderTarget.activeLayer;

		gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);

		for (const attachTarget in renderTarget._attachments) {
			const glAttachTarget = attachTargetToGL[attachTarget];

			if (glAttachTarget === gl.DEPTH_ATTACHMENT || glAttachTarget === gl.DEPTH_STENCIL_ATTACHMENT) {
				if (capabilities.version < 2 && !capabilities.getExtension('WEBGL_depth_texture')) {
					console.warn('WebGLRenderTargets: extension WEBGL_depth_texture is not support.');
				}
			} else if (glAttachTarget !== gl.STENCIL_ATTACHMENT) {
				drawBuffers.push(glAttachTarget);
			}

			const attachment = renderTarget._attachments[attachTarget];

			if (attachment.isTexture) {
				const textureProperties = textures.setTexture(attachment);
				if (attachment.isTexture2D) {
					gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_2D, textureProperties.__webglTexture, renderTarget.activeMipmapLevel);
				} else if (attachment.isTextureCube) {
					gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeLayer, textureProperties.__webglTexture, renderTarget.activeMipmapLevel);
				} else if (attachment.isTexture3D || attachment.isTexture2DArray) {
					gl.framebufferTextureLayer(gl.FRAMEBUFFER, glAttachTarget, textureProperties.__webglTexture, renderTarget.activeMipmapLevel, renderTarget.activeLayer);
				}
				state.bindTexture(textureProperties.__webglTarget, null);
			} else {
				const renderBufferProperties = renderBuffers.setRenderBuffer(attachment);
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, glAttachTarget, gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);
			}
		}

		drawBuffers.sort(drawBufferSort);

		if (capabilities.version >= 2) {
			gl.drawBuffers(drawBuffers);
		} else if (capabilities.getExtension('WEBGL_draw_buffers')) {
			capabilities.getExtension('WEBGL_draw_buffers').drawBuffersWEBGL(drawBuffers);
		}
	}

	setRenderTarget(renderTarget) {
		const gl = this._gl;
		const state = this._state;
		const textures = this._textures;

		let renderTargetProperties;

		if (state.currentRenderTarget !== renderTarget) {
			if (renderTarget.isScreenRenderTarget) {
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			} else {
				renderTargetProperties = this.get(renderTarget);

				if (renderTargetProperties.__webglFramebuffer === undefined) {
					this._setupRenderTarget(renderTarget);
				} else {
					gl.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
				}
			}
			state.currentRenderTarget = renderTarget;
		}

		renderTargetProperties = this.get(renderTarget);

		if (renderTargetProperties.__external) return;

		const activeLayer = renderTarget.activeLayer;
		const activeMipmapLevel = renderTarget.activeMipmapLevel;
		if (renderTargetProperties.__currentActiveLayer !== activeLayer || renderTargetProperties.__currentActiveMipmapLevel !== activeMipmapLevel) {
			for (const attachTarget in renderTarget._attachments) {
				const attachment = renderTarget._attachments[attachTarget];

				if (!attachment.isTexture) continue;

				const textureProperties = textures.get(attachment);

				if (attachment.isTexture2D) {
					gl.framebufferTexture2D(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], gl.TEXTURE_2D, textureProperties.__webglTexture, activeMipmapLevel);
				} else if (attachment.isTextureCube) {
					gl.framebufferTexture2D(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], gl.TEXTURE_CUBE_MAP_POSITIVE_X + activeLayer, textureProperties.__webglTexture, activeMipmapLevel);
				} else if (attachment.isTexture3D || attachment.isTexture2DArray) {
					gl.framebufferTextureLayer(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], textureProperties.__webglTexture, activeMipmapLevel, activeLayer);
				}
			}
			renderTargetProperties.__currentActiveLayer = activeLayer;
			renderTargetProperties.__currentActiveMipmapLevel = activeMipmapLevel;
		}
	}

	blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {
		const gl = this._gl;
		const state = this._state;
		const capabilities = this._capabilities;

		if (capabilities.version < 2) {
			console.warn('WebGLRenderTargets: blitFramebuffer not support by WebGL' + capabilities.version);
			return;
		}

		let needRestoreFramebuffer = false;

		let readBuffer = this.get(read).__webglFramebuffer;
		if (!readBuffer) {
			this._setupRenderTarget(read);
			readBuffer = this.get(read).__webglFramebuffer;
			needRestoreFramebuffer = true;
		}

		let drawBuffer = this.get(draw).__webglFramebuffer;
		if (!drawBuffer) {
			this._setupRenderTarget(draw);
			drawBuffer = this.get(draw).__webglFramebuffer;
			needRestoreFramebuffer = true;
		}

		if (needRestoreFramebuffer) { // restore framebuffer binding
			const framebuffer = (state.currentRenderTarget && !state.currentRenderTarget.isScreenRenderTarget) ?
				this.get(state.currentRenderTarget).__webglFramebuffer : null;
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		}

		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readBuffer);
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, drawBuffer);

		let mask = 0;
		if (color) mask |= gl.COLOR_BUFFER_BIT;
		if (depth) mask |= gl.DEPTH_BUFFER_BIT;
		if (stencil) mask |= gl.STENCIL_BUFFER_BIT;

		// gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);

		gl.blitFramebuffer(
			0, 0, read.width, read.height,
			0, 0, draw.width, draw.height,
			mask, gl.NEAREST
		);
	}

	setFramebufferExternal(renderTarget, webglFramebuffer) {
		const renderTargetProperties = this.get(renderTarget);

		if (!renderTargetProperties.__external) {
			if (renderTargetProperties.__webglFramebuffer) {
				this._gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
			} else {
				renderTarget.addEventListener('dispose', this._onRenderTargetDispose);
			}
		}

		renderTargetProperties.__webglFramebuffer = webglFramebuffer;
		renderTargetProperties.__external = true;
	}

}

const attachTargetToGL = {
	[ATTACHMENT.COLOR_ATTACHMENT0]: 0x8CE0,
	[ATTACHMENT.COLOR_ATTACHMENT1]: 0x8CE1,
	[ATTACHMENT.COLOR_ATTACHMENT2]: 0x8CE2,
	[ATTACHMENT.COLOR_ATTACHMENT3]: 0x8CE3,
	[ATTACHMENT.COLOR_ATTACHMENT4]: 0x8CE4,
	[ATTACHMENT.COLOR_ATTACHMENT5]: 0x8CE5,
	[ATTACHMENT.COLOR_ATTACHMENT6]: 0x8CE6,
	[ATTACHMENT.COLOR_ATTACHMENT7]: 0x8CE7,
	[ATTACHMENT.COLOR_ATTACHMENT8]: 0x8CE8,
	[ATTACHMENT.COLOR_ATTACHMENT9]: 0x8CE9,
	[ATTACHMENT.COLOR_ATTACHMENT10]: 0x8CEA,
	[ATTACHMENT.COLOR_ATTACHMENT11]: 0x8CEB,
	[ATTACHMENT.COLOR_ATTACHMENT12]: 0x8CEC,
	[ATTACHMENT.COLOR_ATTACHMENT13]: 0x8CED,
	[ATTACHMENT.COLOR_ATTACHMENT14]: 0x8CEE,
	[ATTACHMENT.COLOR_ATTACHMENT15]: 0x8CEF,
	[ATTACHMENT.DEPTH_ATTACHMENT]: 0x8D00,
	[ATTACHMENT.STENCIL_ATTACHMENT]: 0x8D20,
	[ATTACHMENT.DEPTH_STENCIL_ATTACHMENT]: 0x821A
};

function drawBufferSort(a, b) {
	return a - b;
}

export { WebGLRenderTargets };