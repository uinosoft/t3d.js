import { ATTACHMENT, TEXTURE_FILTER } from '../const.js';
import { isPowerOfTwo } from '../base.js';
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

			if (renderTargetProperties.__webglFramebuffer) {
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

		if (renderTarget.isRenderTargetCube) {
			renderTargetProperties.__currentActiveCubeFace = renderTarget.activeCubeFace;
			renderTargetProperties.__currentActiveMipmapLevel = renderTarget.activeMipmapLevel;
		}

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

			if (attachment.isTexture2D) {
				const textureProperties = textures.setTexture2D(attachment);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_2D, textureProperties.__webglTexture, 0);
				state.bindTexture(gl.TEXTURE_2D, null);
			} else if (attachment.isTextureCube) {
				const textureProperties = textures.setTextureCube(attachment);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, renderTarget.activeMipmapLevel);
				state.bindTexture(gl.TEXTURE_CUBE_MAP, null);
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
			if (renderTarget.isRenderTargetBack) {
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

		if (renderTarget.isRenderTargetCube) {
			renderTargetProperties = this.get(renderTarget);
			const activeCubeFace = renderTarget.activeCubeFace;
			const activeMipmapLevel = renderTarget.activeMipmapLevel;
			if (renderTargetProperties.__currentActiveCubeFace !== activeCubeFace || renderTargetProperties.__currentActiveMipmapLevel !== activeMipmapLevel) {
				for (const attachTarget in renderTarget._attachments) {
					const attachment = renderTarget._attachments[attachTarget];
					if (attachment.isTextureCube) {
						const textureProperties = textures.get(attachment);
						gl.framebufferTexture2D(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], gl.TEXTURE_CUBE_MAP_POSITIVE_X + activeCubeFace, textureProperties.__webglTexture, activeMipmapLevel);
					}
				}
				renderTargetProperties.__currentActiveCubeFace = activeCubeFace;
				renderTargetProperties.__currentActiveMipmapLevel = activeMipmapLevel;
			}
		}
	}

	blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {
		const gl = this._gl;
		const capabilities = this._capabilities;

		if (capabilities.version < 2) {
			console.warn('WebGLRenderTargets: blitFramebuffer not support by WebGL' + capabilities.version);
			return;
		}

		const readBuffer = this.get(read).__webglFramebuffer;
		const drawBuffer = this.get(draw).__webglFramebuffer;
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

	readRenderTargetPixels(x, y, width, height, buffer) {
		const gl = this._gl;
		const state = this._state;
		const constants = this._constants;

		const renderTarget = state.currentRenderTarget;

		if (renderTarget && renderTarget.texture) {
			if ((x >= 0 && x <= (renderTarget.width - width)) && (y >= 0 && y <= (renderTarget.height - height))) {
				const glType = constants.getGLType(renderTarget.texture.type);
				const glFormat = constants.getGLFormat(renderTarget.texture.format);
				gl.readPixels(x, y, width, height, glFormat, glType, buffer);
			}
		} else {
			console.warn('WebGLRenderTargets.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not bound or texture not attached.');
		}
	}

	updateRenderTargetMipmap(renderTarget) {
		const gl = this._gl;
		const state = this._state;
		const capabilities = this._capabilities;

		const texture = renderTarget.texture;

		if (texture.generateMipmaps && texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR &&
			(_isPowerOfTwo(renderTarget) || capabilities.version >= 2)) {
			let glTarget = gl.TEXTURE_2D;
			if (texture.isTextureCube) glTarget = gl.TEXTURE_CUBE_MAP;
			if (texture.isTexture3D) glTarget = gl.TEXTURE_3D;

			const webglTexture = this._textures.get(texture).__webglTexture;

			state.bindTexture(glTarget, webglTexture);
			gl.generateMipmap(glTarget);
			state.bindTexture(glTarget, null);
		}
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

function _isPowerOfTwo(renderTarget) {
	return isPowerOfTwo(renderTarget.width) && isPowerOfTwo(renderTarget.height);
}

export { WebGLRenderTargets };