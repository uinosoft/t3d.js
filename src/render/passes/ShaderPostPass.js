import { Scene } from '../../scenes/Scene.js';
import { Camera } from '../../scenes/Camera.js';
import { Mesh } from '../../scenes/Mesh.js';
import { Vector3 } from '../../math/Vector3.js';
import { Geometry } from '../../resources/geometries/Geometry.js';
import { Attribute } from '../../resources/geometries/Attribute.js';
import { Buffer } from '../../resources/geometries/Buffer.js';
import { ShaderMaterial } from '../../resources/materials/ShaderMaterial.js';

/**
 * Shader post pass.
 * @memberof t3d
 */
class ShaderPostPass {

	/**
	 * @param {Object} shader - Shader object for the shader material.
	 * @param {String} shader.name - Name of the shader.
	 * @param {Object} shader.defines - Defines of the shader.
	 * @param {Object} shader.uniforms - Uniforms of the shader.
	 * @param {String} shader.vertexShader - Vertex shader GLSL code.
	 * @param {String} shader.fragmentShader - Fragment shader GLSL code.
	 */
	constructor(shader) {
		const scene = new Scene();

		const camera = this.camera = new Camera();
		camera.frustumCulled = false;
		camera.position.set(0, 0, 1);
		camera.lookAt(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
		camera.setOrtho(-1, 1, -1, 1, 0.1, 2);
		scene.add(camera);

		const geometry = this.geometry = new Geometry(); // fullscreen triangle
		geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array([-1, 3, 0, -1, -1, 0, 3, -1, 0]), 3)));
		geometry.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array([0, 2, 0, 0, 2, 0]), 2)));

		const material = this.material = new ShaderMaterial(shader);
		this.uniforms = material.uniforms;

		const plane = new Mesh(geometry, material);
		plane.frustumCulled = false;
		scene.add(plane);

		// static scene

		scene.updateMatrix();

		this.renderStates = scene.updateRenderStates(camera);

		const renderQueue = scene.updateRenderQueue(camera, false, false);
		this.renderQueueLayer = renderQueue.layerList[0];

		this.renderConfig = {};
	}

	/**
	 * Render the post pass.
	 * @param {t3d.ThinRenderer} renderer
	 */
	render(renderer) {
		renderer.beginRender();
		renderer.renderRenderableList(this.renderQueueLayer.opaque, this.renderStates, this.renderConfig);
		renderer.endRender();
	}

	/**
	 * Dispose the post pass.
	 */
	dispose() {
		this.geometry.dispose();
		this.material.dispose();
	}

}

export { ShaderPostPass };