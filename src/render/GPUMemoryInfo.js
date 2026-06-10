/**
 * Statistics for GPU resources owned by the renderer.
 *
 * Note that WebGL does not expose real driver memory usage. These values are
 * estimates based on resources created and managed by the renderer.
 */
class GPUMemoryInfo {

	constructor() {
		this._records = false;
		this._bufferRecords = new Map();

		this.reset();
	}

	/**
	 * Whether GPU memory resource records are tracked.
	 * @type {boolean}
	 */
	get records() {
		return this._records;
	}

	set records(value) {
		this.setRecordsEnabled(value);
	}

	/**
	 * Enable or disable GPU memory resource records.
	 * @param {boolean} enabled - Whether to track resource records.
	 * @returns {GPUMemoryInfo}
	 */
	setRecordsEnabled(enabled) {
		this._records = enabled === true;

		if (!this._records) {
			this._bufferRecords.clear();
		}

		return this;
	}

	/**
	 * Reset all GPU memory statistics.
	 */
	reset() {
		this._bufferRecords.clear();

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

	/**
	 * Returns buffer records sorted by memory usage in descending order.
	 * @returns {object[]}
	 */
	getBufferRecords() {
		return Array.from(this._bufferRecords.values())
			.map(record => Object.assign({}, record))
			.sort((a, b) => b.bytes - a.bytes);
	}

	_updateBuffer(oldBytes, newBytes, buffer, bufferProperties) {
		this._updateCount('buffers', oldBytes, newBytes);
		this.bufferBytes += newBytes - oldBytes;
		this._updateTotalBytes();

		if (!this.records || buffer === undefined) return;

		this._updateBufferRecord(newBytes, buffer, bufferProperties);
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

	_updateBufferRecord(bytes, buffer, bufferProperties) {
		if (bytes === 0) {
			this._bufferRecords.delete(buffer.id);
			return;
		}

		const userData = buffer.userData || {};
		const label = userData.gpuMemoryLabel !== undefined ? userData.gpuMemoryLabel : (userData.label !== undefined ? userData.label : '');

		this._bufferRecords.set(buffer.id, {
			id: buffer.id,
			bytes: bytes,
			label: label,
			external: bufferProperties !== undefined && bufferProperties.__external === true,
			version: buffer.version
		});
	}

}

export { GPUMemoryInfo };
