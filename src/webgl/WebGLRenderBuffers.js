import { PropertyMap } from '../render/PropertyMap.js';

class WebGLRenderBuffers extends PropertyMap {

	constructor(prefix, gl, capabilities, constants) {
		super(prefix);

		this._gl = gl;
		this._capabilities = capabilities;
		this._constants = constants;

		const that = this;

		function onRenderBufferDispose(event) {
			const renderBuffer = event.target;

			renderBuffer.removeEventListener('dispose', onRenderBufferDispose);

			const renderBufferProperties = that.get(renderBuffer);

			if (renderBufferProperties.__webglRenderbuffer && !renderBufferProperties.__external) {
				gl.deleteRenderbuffer(renderBufferProperties.__webglRenderbuffer);
			}

			that.delete(renderBuffer);
		}

		this._onRenderBufferDispose = onRenderBufferDispose;
	}

	setRenderBuffer(renderBuffer) {
		const gl = this._gl;
		const capabilities = this._capabilities;
		const constants = this._constants;

		const renderBufferProperties = this.get(renderBuffer);

		if (renderBufferProperties.__webglRenderbuffer === undefined) {
			renderBuffer.addEventListener('dispose', this._onRenderBufferDispose);

			renderBufferProperties.__webglRenderbuffer = gl.createRenderbuffer();

			gl.bindRenderbuffer(gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);

			const glFormat = constants.getGLInternalFormat(renderBuffer.format);

			if (renderBuffer.multipleSampling > 0) {
				if (capabilities.version < 2) {
					console.error('render buffer multipleSampling is not support in webgl 1.0.');
				}
				gl.renderbufferStorageMultisample(gl.RENDERBUFFER, Math.min(renderBuffer.multipleSampling, capabilities.maxSamples), glFormat, renderBuffer.width, renderBuffer.height);
			} else {
				gl.renderbufferStorage(gl.RENDERBUFFER, glFormat, renderBuffer.width, renderBuffer.height);
			}
		} else {
			gl.bindRenderbuffer(gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);
		}

		return renderBufferProperties;
	}

	setRenderBufferExternal(renderBuffer, webglRenderbuffer) {
		const gl = this._gl;

		const renderBufferProperties = this.get(renderBuffer);

		if (!renderBufferProperties.__external) {
			if (renderBufferProperties.__webglRenderbuffer) {
				gl.deleteRenderbuffer(renderBufferProperties.__webglRenderbuffer);
			} else {
				renderBuffer.addEventListener('dispose', this._onRenderBufferDispose);
			}
		}

		renderBufferProperties.__webglRenderbuffer = webglRenderbuffer;
		renderBufferProperties.__external = true;
	}

}

export { WebGLRenderBuffers };