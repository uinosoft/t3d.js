/**
 * The Attribute add structural information to Buffer.
 * This class stores data for an attribute (such as vertex positions, face indices, normals, colors, UVs, and any custom attributes ) associated with a Geometry, which allows for more efficient passing of data to the GPU.
 * Data is stored as vectors of any length (defined by size).
 */
class Attribute {

	/**
	 * @param {Buffer} buffer - The Buffer instance passed in the constructor.
	 * @param {number} [size=buffer.stride] - The number of values of the array that should be associated with a particular vertex. For instance, if this attribute is storing a 3-component vector (such as a position, normal, or color), then size should be 3.
	 * @param {number} [offset=0] - The offset in the underlying array buffer where an item starts.
	 * @param {boolean} [normalized=false] - Indicates how the underlying data in the buffer maps to the values in the GLSL shader code.
	 */
	constructor(buffer, size = buffer.stride, offset = 0, normalized = false) {
		/**
		 * The Buffer instance passed in the constructor.
		 * @type {Buffer}
		 */
		this.buffer = buffer;

		/**
		 * The number of values of the buffer that should be associated with the attribute.
		 * @type {number}
		 * @default buffer.stride
		 */
		this.size = size;

		/**
		 * The offset in the underlying buffer where an item starts.
		 * @type {number}
		 * @default 0
		 */
		this.offset = offset;

		/**
		 * Indicates how the underlying data in the buffer maps to the values in the GLSL shader code.
		 * @type {boolean}
		 * @default false
		 */
		this.normalized = normalized;

		/**
		 * Instance cadence, the number of instances drawn for each vertex in the buffer, non-instance attributes must be 0.
		 * @type {number}
		 * @default 0
		 */
		this.divisor = 0;
	}

	/**
	 * Copy the parameters from the passed attribute.
	 * @param {Attribute} source - The attribute to be copied.
	 * @returns {Attribute}
	 */
	copy(source) {
		this.buffer = source.buffer;
		this.size = source.size;
		this.offset = source.offset;
		this.normalized = source.normalized;
		this.divisor = source.divisor;
		return this;
	}

	/**
	 * Return a new attribute with the same parameters as this attribute.
	 * @param {object} buffers - A WeakMap to save shared buffers.
	 * @returns {Attribute}
	 */
	clone(buffers) {
		let attribute;

		if (!buffers) {
			console.warn('Attribute.clone(): now requires a WeakMap as an argument to save shared buffers.');

			attribute = new Attribute(this.buffer.clone(), this.size, this.offset, this.normalized);
			attribute.divisor = this.divisor;
			return attribute;
		}

		if (!buffers.has(this.buffer)) {
			buffers.set(this.buffer, this.buffer.clone());
		}

		attribute = new Attribute(buffers.get(this.buffer), this.size, this.offset, this.normalized);
		attribute.divisor = this.divisor;
		return attribute;
	}

}

export { Attribute };