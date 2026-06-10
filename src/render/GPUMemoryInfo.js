/**
 * Statistics for GPU resources owned by the renderer.
 *
 * Note that WebGL does not expose real driver memory usage. These values are
 * estimates based on resources created and managed by the renderer.
 */
class GPUMemoryInfo {

	constructor() {
		this.reset();
	}

	/**
	 * Reset all GPU memory statistics.
	 */
	reset() {
		/**
		 * Number of GPU buffers.
		 * @type {number}
		 */
		this.buffers = 0;

		/**
		 * Number of GPU textures.
		 * @type {number}
		 */
		this.textures = 0;

		/**
		 * Number of GPU renderbuffers.
		 * @type {number}
		 */
		this.renderBuffers = 0;

		/**
		 * Number of GPU framebuffers.
		 * @type {number}
		 */
		this.frameBuffers = 0;

		/**
		 * Number of GPU programs.
		 * @type {number}
		 */
		this.programs = 0;

		/**
		 * Estimated byte length of GPU buffers.
		 * @type {number}
		 */
		this.bufferBytes = 0;

		/**
		 * Estimated byte length of GPU textures.
		 * @type {number}
		 */
		this.textureBytes = 0;

		/**
		 * Estimated byte length of GPU renderbuffers.
		 * @type {number}
		 */
		this.renderBufferBytes = 0;

		/**
		 * Estimated byte length of GPU readback buffers.
		 * @type {number}
		 */
		this.readBufferBytes = 0;

		/**
		 * Estimated total byte length of GPU memory.
		 * @type {number}
		 */
		this.totalBytes = 0;
	}

	_updateBuffer(oldBytes, newBytes) {
		this._updateCount('buffers', oldBytes, newBytes);
		this.bufferBytes += newBytes - oldBytes;
		this._updateTotalBytes();
	}

	_updateTexture(oldBytes, newBytes) {
		this._updateCount('textures', oldBytes, newBytes);
		this.textureBytes += newBytes - oldBytes;
		this._updateTotalBytes();
	}

	_updateRenderBuffer(oldBytes, newBytes) {
		this._updateCount('renderBuffers', oldBytes, newBytes);
		this.renderBufferBytes += newBytes - oldBytes;
		this._updateTotalBytes();
	}

	_updateReadBuffer(oldBytes, newBytes) {
		this.readBufferBytes += newBytes - oldBytes;
		this._updateTotalBytes();
	}

	_updateFramebuffer(delta) {
		this.frameBuffers += delta;
	}

	_updateProgram(delta) {
		this.programs += delta;
	}

	_updateCount(key, oldBytes, newBytes) {
		if (oldBytes === 0 && newBytes > 0) {
			this[key]++;
		} else if (oldBytes > 0 && newBytes === 0) {
			this[key]--;
		}
	}

	_updateTotalBytes() {
		this.totalBytes = this.bufferBytes + this.textureBytes + this.renderBufferBytes + this.readBufferBytes;
	}

}

export { GPUMemoryInfo };
