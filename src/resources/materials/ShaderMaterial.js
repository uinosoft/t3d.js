import { Material } from './Material.js';
import { cloneUniforms } from '../../base.js';

/**
 * A material rendered with custom shaders.
 * A shader is a small program written in GLSL that runs on the GPU.
 * @extends Material
 */
class ShaderMaterial extends Material {

	/**
	 * @param {object} shader - Shader object for the shader material.
	 * @param {string} shader.name - Name of the shader.
	 * @param {object} shader.defines - Defines of the shader.
	 * @param {object} shader.uniforms - Uniforms of the shader.
	 * @param {string} shader.vertexShader - Vertex shader GLSL code.
	 * @param {string} shader.fragmentShader - Fragment shader GLSL code.
	 */
	constructor(shader) {
		super();

		// Set values
		if (shader) {
			this.shaderName = shader.name;
			Object.assign(this.defines, shader.defines);
			this.uniforms = cloneUniforms(shader.uniforms);
			this.vertexShader = shader.vertexShader;
			this.fragmentShader = shader.fragmentShader;
		}
	}

}

export { ShaderMaterial };