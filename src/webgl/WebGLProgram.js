import { WebGLUniforms } from './WebGLUniforms.js';
import { WebGLAttribute } from './WebGLAttribute.js';

let programIdCount = 0;

class WebGLProgram {

	constructor(gl, vshader, fshader) {
		// create shaders

		const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
		const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);

		// create a program object

		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		// check errors

		if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
			const programLog = gl.getProgramInfoLog(program).trim();

			const vertexErrors = getShaderErrors(gl, vertexShader, 'VERTEX');
			const fragmentErrors = getShaderErrors(gl, fragmentShader, 'FRAGMENT');

			console.error(
				'THREE.WebGLProgram: Shader Error ' + gl.getError() + ' - ' +
				'VALIDATE_STATUS ' + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + '\n\n' +
				'Program Info Log: ' + programLog + '\n' +
				vertexErrors + '\n' +
				fragmentErrors
			)
		}

		// here we can delete shaders,
		// according to the documentation: https://www.opengl.org/sdk/docs/man/html/glLinkProgram.xhtml

		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		// set up caching for uniforms

		let cachedUniforms;

		this.getUniforms = function () {
			if (cachedUniforms === undefined) {
				cachedUniforms = new WebGLUniforms(gl, program);
			}
			return cachedUniforms;
		}

		// set up caching for attributes

		let cachedAttributes;

		this.getAttributes = function () {
			if (cachedAttributes === undefined) {
				cachedAttributes = extractAttributes(gl, program);
			}
			return cachedAttributes;
		}

		// free program

		this.dispose = function () {
			gl.deleteProgram(program);
			this.program = undefined;
		}

		//

		this.id = programIdCount++;
		this.usedTimes = 1;
		this.code = "";
		this.gl = gl;
		this.vshaderSource = vshader;
		this.fshaderSource = fshader;
		this.program = program;
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