import { PropertyMap } from '../render/PropertyMap.js';

class WebGLBuffers extends PropertyMap {

	constructor(prefix, gl, capabilities) {
		super(prefix);

		this._gl = gl;
		this._capabilities = capabilities;
	}

	setBuffer(buffer, bufferType, vertexArrayBindings) {
		const bufferProperties = this.get(buffer);

		const needCreate = bufferProperties.glBuffer === undefined;

		if (!needCreate && bufferProperties.version === buffer.version) return;

		// Avoid polluting the binding state
		if (vertexArrayBindings) {
			vertexArrayBindings.reset();
		}

		if (needCreate || bufferProperties.__external) {
			// Because Buffer does not have a dispose interface at present,
			// when the version increases, the external is automatically closed
			this._createGLBuffer(bufferProperties, buffer, bufferType);
		} else {
			this._updateGLBuffer(bufferProperties.glBuffer, buffer, bufferType);
			bufferProperties.version = buffer.version;
		}
	}

	removeBuffer(buffer) {
		const gl = this._gl;

		const bufferProperties = this.get(buffer);

		if (bufferProperties.glBuffer && !bufferProperties.__external) {
			gl.deleteBuffer(bufferProperties.glBuffer);
		}

		this.delete(buffer);
	}

	setBufferExternal(buffer, webglBuffer) {
		const gl = this._gl;

		const bufferProperties = this.get(buffer);

		if (!bufferProperties.__external) {
			if (bufferProperties.glBuffer) {
				gl.deleteBuffer(bufferProperties.glBuffer);
			}
		}

		const type = getBufferType(gl, buffer.array);

		bufferProperties.glBuffer = webglBuffer;
		bufferProperties.type = type;
		bufferProperties.bytesPerElement = buffer.array.BYTES_PER_ELEMENT;
		bufferProperties.version = buffer.version;

		bufferProperties.__external = true;
	}

	_createGLBuffer(bufferProperties, buffer, bufferType) {
		const gl = this._gl;

		const array = buffer.array;
		const usage = buffer.usage;

		const glBuffer = gl.createBuffer();

		gl.bindBuffer(bufferType, glBuffer);
		gl.bufferData(bufferType, array, usage);

		buffer.onUploadCallback();

		const type = getBufferType(gl, array);

		bufferProperties.glBuffer = glBuffer;
		bufferProperties.type = type;
		bufferProperties.bytesPerElement = array.BYTES_PER_ELEMENT;
		bufferProperties.version = buffer.version;

		bufferProperties.__external = false;
	}

	_updateGLBuffer(glBuffer, buffer, bufferType) {
		const gl = this._gl;
		const capabilities = this._capabilities;

		const array = buffer.array;
		const updateRange = buffer.updateRange;

		gl.bindBuffer(bufferType, glBuffer);

		if (updateRange.count === -1) {
			// Not using update ranges
			gl.bufferSubData(bufferType, 0, array);
		} else {
			if (capabilities.version >= 2) {
				gl.bufferSubData(bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
					array, updateRange.offset, updateRange.count);
			} else {
				gl.bufferSubData(bufferType, updateRange.offset * array.BYTES_PER_ELEMENT,
					array.subarray(updateRange.offset, updateRange.offset + updateRange.count));
			}

			updateRange.count = -1; // reset range
		}
	}

}

function getBufferType(gl, array) {
	let type;

	if (array instanceof Float32Array) {
		type = gl.FLOAT;
	} else if (array instanceof Float64Array) {
		console.warn('Unsupported data buffer format: Float64Array.');
	} else if (array instanceof Uint16Array) {
		type = gl.UNSIGNED_SHORT;
	} else if (array instanceof Int16Array) {
		type = gl.SHORT;
	} else if (array instanceof Uint32Array) {
		type = gl.UNSIGNED_INT;
	} else if (array instanceof Int32Array) {
		type = gl.INT;
	} else if (array instanceof Int8Array) {
		type = gl.BYTE;
	} else if (array instanceof Uint8Array) {
		type = gl.UNSIGNED_BYTE;
	} else {
		type = gl.FLOAT;
	}

	return type;
}

export { WebGLBuffers };