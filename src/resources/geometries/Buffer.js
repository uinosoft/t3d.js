import { cloneJson } from '../../base.js';
import { BUFFER_USAGE } from '../../const.js';

let _bufferId = 0;

/**
 * The Buffer contain the data that is used for the geometry of 3D models, animations, and skinning.
 */
class Buffer {

	/**
	 * @param {TypedArray} array -- A typed array with a shared buffer. Stores the geometry data.
	 * @param {number} stride -- The number of typed-array elements per vertex.
	 */
	constructor(array, stride) {
		/**
		 * Unique number for this buffer instance.
		 * @readonly
		 * @type {number}
		 */
		this.id = _bufferId++;

		/**
		 * An object that can be used to store custom data about the {@link Buffer}.
		 * It should not hold references to functions as these will not be cloned.
		 * @type {object}
		 * @default {}
		 */
		this.userData = {};

		/**
		 * A typed array with a shared buffer.
		 * Stores the geometry data.
		 * @type {TypedArray}
		 */
		this.array = array;

		/**
		 * The number of typed-array elements per vertex.
		 * @type {number}
		 */
		this.stride = stride;

		/**
		 * Gives the total number of elements in the array.
		 * @type {number}
		 */
		this.count = array !== undefined ? array.length / stride : 0;

		/**
		 * Defines the intended usage pattern of the data store for optimization purposes.
		 * Corresponds to the usage parameter of WebGLRenderingContext.bufferData().
		 * @type {BUFFER_USAGE}
		 * @default BUFFER_USAGE.STATIC_DRAW
		 */
		this.usage = BUFFER_USAGE.STATIC_DRAW;

		/**
		 * Object containing offset and count.
		 * @type {object}
		 * @default { offset: 0, count: - 1 }
		 */
		this.updateRange = { offset: 0, count: -1 };

		/**
		 * A version number, incremented every time the data is changed.
		 * @type {number}
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
	 * @param {Buffer} source - The buffer to be copied.
	 * @returns {Buffer}
	 */
	copy(source) {
		this.array = new source.array.constructor(source.array);
		this.userData = cloneJson(source.userData);
		this.stride = source.stride;
		this.count = source.array.length / this.stride;
		this.usage = source.usage;
		return this;
	}

	/**
	 * Return a copy of this buffer.
	 * @returns {Buffer}
	 */
	clone() {
		return new Buffer(this.array, this.stride).copy(this);
	}

}

export { Buffer };