import { PropertyMap } from '../render/PropertyMap.js';

export class WebGLTransformFeedback extends PropertyMap {

	constructor(prefix, gl, capabilities, buffers) {
		super(prefix);

		this._gl = gl;
		this._capabilities = capabilities;
		this._buffers = buffers;

		this._isWebGL2 = capabilities.version >= 2;
		this._tfCache = {};
		this._currenttf = null;
	}

	setup(geometry, program) {
		if (this._isWebGL2 && geometry.outBuffer) {
			const geometryProperties = this.get(geometry);

			if (geometryProperties._tf === undefined) {
				geometryProperties._tf = {};
				this._tfCache[geometry.id] = geometryProperties._tf;
			}

			let tf = geometryProperties._tf[program.id];
			if (!tf) {
				tf = geometryProperties._tf[program.id] = { version: -1, object: this._createTF() };
			}

			this._bindTransformFeedback(tf.object);

			if (tf.version !== geometry.version) {
				this._setupTransformFeedback(geometry);
				tf.version = geometry.version;
			}
		}
	}

	_createTF() {
		if (this._isWebGL2) {
			return this._gl.createTransformFeedback();
		}
		return null;
	}
	reset(force) {
		if (this._currenttf !== null || force) {
			this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK, null);
			this._currenttf = null;
		}
	}

	_bindTransformFeedback(tf) {
		if (this._currenttf !== tf) {
			this._gl.bindTransformFeedback(this._gl.TRANSFORM_FEEDBACK, tf);
			this._currenttf = tf;
		}
	}

	_setupTransformFeedback(geometry) {
		const gl = this._gl;
		const outBuffer = geometry.outBuffer;
		const buffers = this._buffers;
		if (outBuffer) {
			let index = 0;
			for (const name in outBuffer) {
				let bufferProperties = buffers.get(outBuffer[name]);
				if (!bufferProperties.glBuffer) {
					buffers.setBuffer(outBuffer[name], gl.ARRAY_BUFFER);
					bufferProperties = buffers.get(outBuffer[name]);
				}

				gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index++, bufferProperties.glBuffer);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			}
		}
	}

}