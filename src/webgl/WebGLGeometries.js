// This class handles buffer creation and updating for geometries.
// When the geometry is released, release the corresponding buffer resources and VAO.
class WebGLGeometries {

	constructor(gl, properties, capabilities, vertexArrayBindings) {
		this._gl = gl;
		this._properties = properties;
		this._capabilities = capabilities;
		this._vertexArrayBindings = vertexArrayBindings;

		function onGeometryDispose(event) {
			const geometry = event.target;
			const geometryProperties = properties.get(geometry);

			geometry.removeEventListener('dispose', onGeometryDispose);

			if (geometry.index !== null) {
				removeBuffer(gl, properties, geometry.index.buffer);
			}

			for (const name in geometry.attributes) {
				removeBuffer(gl, properties, geometry.attributes[name].buffer);
			}

			for (const name in geometry.morphAttributes) {
				const array = geometry.morphAttributes[name];
				for (let i = 0, l = array.length; i < l; i++) {
					removeBuffer(gl, properties, array[i].buffer);
				}
			}

			for (const key in geometryProperties._vaos) {
				const vao = geometryProperties[key];
				if (vao) {
					vertexArrayBindings.disposeVAO(vao.object);
				}
			}

			geometryProperties._vaos = {};
			geometryProperties.created = false;

			properties.delete(geometry);
		}

		this._onGeometryDispose = onGeometryDispose;
	}

	setGeometry(geometry) {
		const gl = this._gl;
		const properties = this._properties;
		const capabilities = this._capabilities;
		const vertexArrayBindings = this._vertexArrayBindings;

		const geometryProperties = properties.get(geometry);

		if (!geometryProperties.created) {
			geometry.addEventListener('dispose', this._onGeometryDispose);
			geometryProperties.created = true;
			geometryProperties._vaos = {};
		}

		if (geometry.index !== null) {
			const buffer = geometry.index.buffer;
			const bufferProperties = properties.get(buffer);

			if (bufferProperties.glBuffer === undefined) {
				vertexArrayBindings.reset(); // Avoid polluting the binding state
				createGLBuffer(gl, bufferProperties, buffer, gl.ELEMENT_ARRAY_BUFFER);
			} else if (bufferProperties.version < buffer.version) {
				vertexArrayBindings.reset(); // Avoid polluting the binding state
				updateGLBuffer(gl, capabilities, bufferProperties.glBuffer, buffer, gl.ELEMENT_ARRAY_BUFFER);
				bufferProperties.version = buffer.version;
			}
		}

		for (const name in geometry.attributes) {
			updateBuffer(gl, properties, capabilities, geometry.attributes[name].buffer, gl.ARRAY_BUFFER);
		}

		for (const name in geometry.morphAttributes) {
			const array = geometry.morphAttributes[name];
			for (let i = 0, l = array.length; i < l; i++) {
				updateBuffer(gl, properties, capabilities, array[i].buffer, gl.ARRAY_BUFFER);
			}
		}

		return geometryProperties;
	}

	setBufferExternal(buffer, webglBuffer) {
		const gl = this._gl;
		const properties = this._properties;

		const bufferProperties = properties.get(buffer);

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

}

function getBufferType(gl, array) {
	let type = gl.FLOAT;

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
	}

	return type;
}

function createGLBuffer(gl, properties, buffer, bufferType) {
	const array = buffer.array;
	const usage = buffer.usage;

	const glBuffer = gl.createBuffer();

	gl.bindBuffer(bufferType, glBuffer);
	gl.bufferData(bufferType, array, usage);

	buffer.onUploadCallback();

	const type = getBufferType(gl, array);

	properties.glBuffer = glBuffer;
	properties.type = type;
	properties.bytesPerElement = array.BYTES_PER_ELEMENT;
	properties.version = buffer.version;
}

function updateGLBuffer(gl, capabilities, glBuffer, buffer, bufferType) {
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

function updateBuffer(gl, properties, capabilities, buffer, bufferType) {
	const bufferProperties = properties.get(buffer);

	if (bufferProperties.glBuffer === undefined) {
		createGLBuffer(gl, bufferProperties, buffer, bufferType);
	} else if (bufferProperties.version < buffer.version) {
		if (!!bufferProperties.__external) {
			delete bufferProperties.glBuffer;
			createGLBuffer(gl, bufferProperties, buffer, bufferType);
		} else {
			updateGLBuffer(gl, capabilities, bufferProperties.glBuffer, buffer, bufferType);
			bufferProperties.version = buffer.version;
		}
	}
}

function removeBuffer(gl, properties, buffer) {
	const bufferProperties = properties.get(buffer);

	if (bufferProperties.glBuffer && !bufferProperties.__external) {
		gl.deleteBuffer(bufferProperties.glBuffer);
	}

	properties.delete(buffer);
}

export { WebGLGeometries };