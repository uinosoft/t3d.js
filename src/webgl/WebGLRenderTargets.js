import { ATTACHMENT, TEXTURE_FILTER } from '../const.js';
import { PropertyMap } from '../render/PropertyMap.js';
import { MathUtils } from '../math/MathUtils.js';

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

			if (renderTargetProperties.__readBuffer) {
				gl.deleteBuffer(renderTargetProperties.__readBuffer);
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

		if (renderTarget.isRenderTargetCube) {
			renderTargetProperties.__currentActiveCubeFace = renderTarget.activeCubeFace;
		}

		if (renderTarget.isRenderTarget3D || renderTarget.isRenderTarget2DArray) {
			renderTargetProperties.__currentActiveLayer = renderTarget.activeLayer;
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
				gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_2D, textureProperties.__webglTexture, renderTarget.activeMipmapLevel);
				state.bindTexture(gl.TEXTURE_2D, null);
			} else if (attachment.isTextureCube) {
				const textureProperties = textures.setTextureCube(attachment);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, renderTarget.activeMipmapLevel);
				state.bindTexture(gl.TEXTURE_CUBE_MAP, null);
			} else if (attachment.isTexture3D) {
				const textureProperties = textures.setTexture3D(attachment);
				gl.framebufferTextureLayer(gl.FRAMEBUFFER, glAttachTarget, textureProperties.__webglTexture, renderTarget.activeMipmapLevel, renderTarget.activeLayer);
				state.bindTexture(gl.TEXTURE_3D, null);
			} else if (attachment.isTexture2DArray) {
				const textureProperties = textures.setTexture2DArray(attachment);
				gl.framebufferTextureLayer(gl.FRAMEBUFFER, glAttachTarget, textureProperties.__webglTexture, renderTarget.activeMipmapLevel, renderTarget.activeLayer);
				state.bindTexture(gl.TEXTURE_2D_ARRAY, null);
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

		renderTargetProperties = this.get(renderTarget);

		if (renderTarget.isRenderTargetCube) {
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
		} else if (renderTarget.isRenderTarget3D || renderTarget.isRenderTarget2DArray) {
			const activeLayer = renderTarget.activeLayer;
			const activeMipmapLevel = renderTarget.activeMipmapLevel;
			if (renderTargetProperties.__currentActiveLayer !== activeLayer || renderTargetProperties.__currentActiveMipmapLevel !== activeMipmapLevel) {
				for (const attachTarget in renderTarget._attachments) {
					const attachment = renderTarget._attachments[attachTarget];
					if (attachment.isTexture3D || attachment.isTexture2DArray) {
						const textureProperties = textures.get(attachment);
						gl.framebufferTextureLayer(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], textureProperties.__webglTexture, activeMipmapLevel, activeLayer);
					}
				}
				renderTargetProperties.__currentActiveLayer = activeLayer;
				renderTargetProperties.__currentActiveMipmapLevel = activeMipmapLevel;
			}
		} else if (renderTarget.isRenderTarget2D) {
			const activeMipmapLevel = renderTarget.activeMipmapLevel;
			if (renderTargetProperties.__currentActiveMipmapLevel !== activeMipmapLevel) {
				for (const attachTarget in renderTarget._attachments) {
					const attachment = renderTarget._attachments[attachTarget];
					if (attachment.isTexture2D) {
						const textureProperties = textures.get(attachment);
						gl.framebufferTexture2D(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], gl.TEXTURE_2D, textureProperties.__webglTexture, activeMipmapLevel);
					}
				}
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

	readRenderTargetPixelsAsync(x, y, width, height, buffer) {
		const gl = this._gl;
		const state = this._state;
		const constants = this._constants;

		const renderTarget = state.currentRenderTarget;

		if (renderTarget && renderTarget.texture) {
			if ((x >= 0 && x <= (renderTarget.width - width)) && (y >= 0 && y <= (renderTarget.height - height))) {
				const renderTargetProperties = this.get(renderTarget);
				if (renderTargetProperties.__readBuffer === undefined) {
					renderTargetProperties.__readBuffer = gl.createBuffer();
				}
				gl.bindBuffer(gl.PIXEL_PACK_BUFFER, renderTargetProperties.__readBuffer);
				gl.bufferData(gl.PIXEL_PACK_BUFFER, buffer.byteLength, gl.STREAM_READ);

				const glType = constants.getGLType(renderTarget.texture.type);
				const glFormat = constants.getGLFormat(renderTarget.texture.format);
				gl.readPixels(x, y, width, height, glFormat, glType, 0);

				return _clientWaitAsync(gl).then(() => {
					if (!renderTargetProperties.__readBuffer) {
						return Promise.reject('Read Buffer is not valid.');
					}

					gl.bindBuffer(gl.PIXEL_PACK_BUFFER, renderTargetProperties.__readBuffer);
					gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, buffer);
					gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
					return buffer;
				});
			} else {
				return Promise.resolve(buffer);
			}
		} else {
			console.warn('WebGLRenderTargets.readRenderTargetPixelsAsync: readPixels from renderTarget failed. Framebuffer not bound or texture not attached.');
			return Promise.reject();
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
	return MathUtils.isPowerOfTwo(renderTarget.width) && MathUtils.isPowerOfTwo(renderTarget.height);
}

function _clientWaitAsync(gl) {
	const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

	gl.flush();

	return new Promise(function(resolve, reject) {
		function test() {
			const res = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);

			if (res === gl.WAIT_FAILED) {
				gl.deleteSync(sync);
				reject();
				return;
			}

			if (res === gl.TIMEOUT_EXPIRED) {
				requestAnimationFrame(test);
				return;
			}

			gl.deleteSync(sync);

			resolve();
		}

		test();
	});
}

export { WebGLRenderTargets };