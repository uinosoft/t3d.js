const emptyString = "";

export class WebGLVertexArrayBindings {

	constructor(gl, properties, capabilities) {
		this._gl = gl;
		this._properties = properties;
		this._capabilities = capabilities;

		this._isWebGL2 = capabilities.version >= 2;
		this._vaoExt = capabilities.getExtension("OES_vertex_array_object");

		this._currentGeometryProgram = "";
		this._currentVAO = null;
	}

	setup(object, geometry, program) {
		const geometryProperties = this._properties.get(geometry);

		if (object.morphTargetInfluences) {
			this.reset();
			this._setupVertexAttributes(program, geometry);
			this._currentGeometryProgram = emptyString;
		} else if (this._isWebGL2 || this._vaoExt) { // use VAO
			let vao;
			if (!geometryProperties._vaos[program.id]) {
				vao = geometryProperties._vaos[program.id] = { version: -1, object: this._createVAO() };
			} else {
				vao = geometryProperties._vaos[program.id];
			}

			this._bindVAO(vao.object);

			if (vao.version !== geometry.version) {
				this._setupVertexAttributes(program, geometry);
				vao.version = geometry.version;
			}
		} else {
			const geometryProgram = program.id + "_" + geometry.id + "_" + geometry.version;
			if (geometryProgram !== this._currentGeometryProgram) {
				this._setupVertexAttributes(program, geometry);
				this._currentGeometryProgram = geometryProgram;
			}
		}
	}

	disposeVAO(vao) {
		if (this._isWebGL2) {
			this._gl.deleteVertexArray(vao);
		} else if (this._vaoExt) {
			this._vaoExt.deleteVertexArrayOES(vao);
		}
	}

	reset(force) {
		if (this._currentVAO !== null || force) {
			if (this._isWebGL2) {
				this._gl.bindVertexArray(null);
			} else if (this._vaoExt) {
				this._vaoExt.bindVertexArrayOES(null);
			}

			this._currentVAO = null;
		}

		if (this._currentGeometryProgram !== emptyString) {
			this._currentGeometryProgram = emptyString;
		}
	}

	_createVAO() {
		if (this._isWebGL2) {
			return this._gl.createVertexArray();
		} else if (this._vaoExt) {
			return this._vaoExt.createVertexArrayOES();
		}
		return null;
	}

	_bindVAO(vao) {
		if (this._currentVAO !== vao) {
			if (this._isWebGL2) {
				this._gl.bindVertexArray(vao);
			} else if (this._vaoExt) {
				this._vaoExt.bindVertexArrayOES(vao);
			}

			this._currentVAO = vao;
		}
	}

	_setupVertexAttributes(program, geometry) {
		const gl = this._gl;
		const isWebGL2 = this._isWebGL2;
		const attributes = program.getAttributes();
		const properties = this._properties;
		const capabilities = this._capabilities;

		for (const key in attributes) {
			const programAttribute = attributes[key];
			const geometryAttribute = geometry.getAttribute(key);
			if (geometryAttribute) {
				const size = geometryAttribute.size;

				if (programAttribute.count !== size) {
					console.warn("WebGLVertexArrayBindings: attribute " + key + " size not match! " + programAttribute.count + " : " + size);
				}

				const buffer = geometryAttribute.buffer;
				const bufferProperties = properties.get(buffer);

				const type = bufferProperties.type;
				if (programAttribute.format !== type) {
					// console.warn("WebGLVertexArrayBindings: attribute " + key + " type not match! " + programAttribute.format + " : " + type);
				}

				for (let i = 0, l = programAttribute.locationSize; i < l; i++) {
					gl.enableVertexAttribArray(programAttribute.location + i);
				}

				if (geometryAttribute.divisor > 0) { // use instancing
					for (let i = 0, l = programAttribute.locationSize; i < l; i++) {
						if (isWebGL2) {
							gl.vertexAttribDivisor(programAttribute.location + i, geometryAttribute.divisor);
						} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
							capabilities.getExtension('ANGLE_instanced_arrays').vertexAttribDivisorANGLE(programAttribute.location + i, geometryAttribute.divisor);
						} else {
							console.warn("vertexAttribDivisor not supported");
						}
					}
				}

				const bytesPerElement = bufferProperties.bytesPerElement;
				const glBuffer = bufferProperties.glBuffer;
				const stride = buffer.stride;
				const offset = geometryAttribute.offset;
				const normalized = geometryAttribute.normalized;

				gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

				if (programAttribute.count === stride && programAttribute.locationSize === 1) {
					gl.vertexAttribPointer(programAttribute.location, programAttribute.count, type, normalized, 0, 0);
				} else {
					for (let i = 0; i < programAttribute.locationSize; i++) {
						gl.vertexAttribPointer(
							programAttribute.location + i,
							programAttribute.count / programAttribute.locationSize,
							type,
							normalized,
							bytesPerElement * stride,
							bytesPerElement * (offset + (programAttribute.count / programAttribute.locationSize) * i)
						);
					}
				}
			} else {
				// console.warn("WebGLVertexArrayBindings: geometry attribute " + key + " not found!");
			}
		}

		// bind index if could
		if (geometry.index) {
			const indexBufferProperties = properties.get(geometry.index.buffer);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferProperties.glBuffer);
		}
	}

}