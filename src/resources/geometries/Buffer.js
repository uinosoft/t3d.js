import { BUFFER_USAGE } from '../../const.js';

/**
 * The Buffer contain the data that is used for the geometry of 3D models, animations, and skinning.
 * @memberof t3d
 */
class Buffer {

	/**
	 * @param {TypedArray} array -- A typed array with a shared buffer. Stores the geometry data.
     * @param {Number} stride -- The number of typed-array elements per vertex.
	 */
	constructor(array, stride) {
		/**
         * A typed array with a shared buffer.
         * Stores the geometry data.
         * @type {TypedArray}
         */
		this.array = array;

		/**
         * The number of typed-array elements per vertex.
         * @type {Number}
         */
		this.stride = stride;

		/**
         * Gives the total number of elements in the array.
         * @type {Number}
         */
		this.count = array !== undefined ? array.length / stride : 0;

		/**
         * Defines the intended usage pattern of the data store for optimization purposes.
         * Corresponds to the usage parameter of WebGLRenderingContext.bufferData().
         * @type {t3d.BUFFER_USAGE}
         * @default t3d.BUFFER_USAGE.STATIC_DRAW
         */
		this.usage = BUFFER_USAGE.STATIC_DRAW;

		/**
         * Object containing offset and count.
         * @type {Object}
         * @default { offset: 0, count: - 1 }
         */
		this.updateRange = { offset: 0, count: -1 };

		/**
         * A version number, incremented every time the data is changed.
         * @type {Number}
         * @default 0
         */
		this.version = 0;
	}

	/**
	 * A callback function that is executed after the Renderer has transferred the attribute array data to the GPU.
	 */
	onUploadCallback() {}

	/**
	 * Copies another Buffer to this Buffer.
	 * @param {t3d.Buffer} source - The buffer to be copied.
	 * @return {t3d.Buffer}
	 */
	copy(source) {
		this.array = new source.array.constructor(source.array);
		this.stride = source.stride;
		this.count = source.array.length / this.stride;
		this.usage = source.usage;
		return this;
	}

	/**
	 * Return a copy of this buffer.
	 * @return {t3d.Buffer}
	 */
	clone() {
		const array = new this.array.constructor(this.array);
		const ib = new Buffer(array, this.stride);
		ib.usage = this.usage;
		return ib;
	}

}

export { Buffer };