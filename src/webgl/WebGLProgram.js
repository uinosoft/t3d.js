import { WebGLUniforms } from './WebGLUniforms.js';
import { WebGLAttribute } from './WebGLAttribute.js';

let programIdCount = 0;

class WebGLProgram {

	constructor(gl, vshader, fshader) {
		this.gl = gl;
		this.vshaderSource = vshader;
		this.fshaderSource = fshader;

		this.id = programIdCount++;
		this.usedTimes = 1;

		this.code = '';
		this.name = '';

		this.lightId = -1;
		this.lightVersion = -1;
		this.cameraId = -1;
		this.cameraVersion = -1;
		this.sceneId = -1;
		this.sceneVersion = -1;

		this.program;

		this._checkErrors = true;
		this._compileAsynchronously = false;
		this._status = 0;

		let program, vertexShader, fragmentShader;

		// compile program
		this.compile = function(options) {
			// create shaders

			vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
			fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);

			// create a program object

			program = gl.createProgram();
			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);

			this.program = program;

			// set properties

			this._checkErrors = options.checkErrors;
			this._compileAsynchronously = options.compileAsynchronously;
			this._status = 1;

			// here we can delete shaders,
			// according to the documentation: https://www.opengl.org/sdk/docs/man/html/glLinkProgram.xhtml

			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
		};

		// check if program is ready to be used
		this.isReady = function(parallelShaderCompileExt) {
			if (this._status === 1) {
				if (this._compileAsynchronously && parallelShaderCompileExt) {
					if (gl.getProgramParameter(program, parallelShaderCompileExt.COMPLETION_STATUS_KHR)) {
						this._status = 2;
						this._tryCheckErrors();
					}
				} else {
					this._status = 2;
					this._tryCheckErrors();
				}
			}

			return this._status === 2;
		};

		this._tryCheckErrors = function() {
			if (!this._checkErrors) return;

			if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
				const programLog = gl.getProgramInfoLog(program).trim();

				const vertexErrors = getShaderErrors(gl, vertexShader, 'VERTEX');
				const fragmentErrors = getShaderErrors(gl, fragmentShader, 'FRAGMENT');

				this.program = undefined;
				this._status = 0;

				console.error(
					'Shader Error ' + gl.getError() + ' - ' +
					'VALIDATE_STATUS ' + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + '\n\n' +
					'Shader Name: ' + this.name + '\n' +
					'Program Info Log: ' + programLog + '\n' +
					vertexErrors + '\n' +
					fragmentErrors
				);
			}
		};

		// set up caching for uniforms

		let cachedUniforms;

		this.getUniforms = function() {
			if (cachedUniforms === undefined) {
				cachedUniforms = new WebGLUniforms(gl, program);
			}
			return cachedUniforms;
		};

		// set up caching for attributes

		let cachedAttributes;

		this.getAttributes = function() {
			if (cachedAttributes === undefined) {
				cachedAttributes = extractAttributes(gl, program);
			}
			return cachedAttributes;
		};

		// free program

		this.dispose = function() {
			gl.deleteProgram(program);
			this.program = undefined;
			this._status = 0;
		};
	}

}

function handleSource(string, errorLine) {
	const lines = string.split('\n');
	const lines2 = [];

	const from = Math.max(errorLine - 6, 0);
	const to = Math.min(errorLine + 6, lines.length);

	for (let i = from; i < to; i++) {
		const line = i + 1;
		lines2.push(`${line === errorLine ? '>' : ' '} ${line}: ${lines[i]}`);
	}

	return lines2.join('\n');
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

function getShaderErrors(gl, shader, type) {
	const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	const errors = gl.getShaderInfoLog(shader).trim();

	if (status && errors === '') return '';

	const errorMatches = /ERROR: 0:(\d+)/.exec(errors);

	if (errorMatches) {
		// --enable-privileged-webgl-extension
		// console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

		const errorLine = parseInt(errorMatches[1]);
		return type + '\n\n' + errors + '\n\n' + handleSource(gl.getShaderSource(shader), errorLine);
	} else {
		return errors;
	}
}

// extract attributes
function extractAttributes(gl, program) {
	const attributes = {};

	const totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

	for (let i = 0; i < totalAttributes; i++) {
		const attribData = gl.getActiveAttrib(program, i);
		attributes[attribData.name] = new WebGLAttribute(gl, program, attribData);
	}

	return attributes;
}

export { WebGLProgram };