import {
	BoxGeometry,
	DRAW_SIDE,
	Mesh,
	RenderTargetCube,
	Scene,
	ShaderMaterial,
	TextureCube,
	Euler,
	Quaternion,
	PIXEL_FORMAT,
	PIXEL_TYPE,
	TEXTURE_FILTER,
	ATTACHMENT
} from 't3d';
import { ReflectionProbe } from '../probes/ReflectionProbe.js';

class CubeTxtureGenerator {

	/**
	 * Constructs a new CubeTxtureGenerator.
	 */
	constructor() {
		/**
		 * Add rotation to Texture2D.
		 * @type {Euler}
		 */
		this.rotation = new Euler();

		// init

		const geometry = new BoxGeometry(1, 1, 1);
		const material = new ShaderMaterial(cubeTxtureShader);
		material.side = DRAW_SIDE.BACK;

		const envMesh = new Mesh(geometry, material);
		envMesh.frustumCulled = false;

		const dummyScene = new Scene();
		dummyScene.add(envMesh);

		const quaternion = new Quaternion();
		this.rotation.onChange(() => { // auto sync rotation to dummyScene
			quaternion.setFromEuler(this.rotation);
			quaternion.toMatrix4(dummyScene.anchorMatrix);
		});

		this._envMesh = envMesh;
		this._dummyScene = dummyScene;
	}

	/**
	 * Generate a CubeTxtureGenerator from a Texture2D.
	 * @param {ThinRenderer} renderer - The renderer.
	 * @param {TextureCube|Texture2D} envMap - The Texture2D map.
	 * @param {TextureCube} [target] - The output texture. If not provided, a new cube texture will be created.
	 */
	generate(renderer, source, target = new TextureCube()) {
		// Check capabilities
		let cubeSize;
		if (source.isTextureCube) {
			target.copy(source);
			target.generateMipmaps = true;
			target.minFilter = TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;
			target.magFilter = TEXTURE_FILTER.LINEAR;
			target.version++;
			return target;
		} else {
			cubeSize = source.image.width / 4;
		}
		// Prepare the target texture

		target.type = PIXEL_TYPE.HALF_FLOAT;
		target.format = PIXEL_FORMAT.RGBA;
		target.generateMipmaps = true;
		target.minFilter = TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;
		target.magFilter = TEXTURE_FILTER.LINEAR;

		// Prepare render target

		const renderTarget = new RenderTargetCube(cubeSize, cubeSize);
		renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		renderTarget.attach(target, ATTACHMENT.COLOR_ATTACHMENT0);

		// Prepare render stuff

		const reflectionProbe = new ReflectionProbe(renderTarget);
		this._dummyScene.add(reflectionProbe.camera);

		const envMapFlip = -1;

		this._envMesh.material.cubeMap = source;
		this._envMesh.material.uniforms.environmentMap = source;
		this._envMesh.material.uniforms.envMapFlip = envMapFlip;

		// Render

		this._dummyScene.updateRenderStates(reflectionProbe.camera);

		reflectionProbe.render(renderer, this._dummyScene);
		// for (let j = 0; j < 6; j++) {
		// 	const imagesData = target.images[j];
		// 	imagesData.data = new Uint16Array(imagesData.width * imagesData.height * 4);
		// 	renderTarget.activeCubeFace = j;
		// 	renderer.setRenderTarget(renderTarget);
		// 	renderer.readRenderTargetPixels(0, 0, imagesData.width, imagesData.height, imagesData.data);
		// }

		// renderer.updateRenderTargetMipmap(renderTarget);

		// target.version++;

		// Clear render stuff

		renderTarget.detach(ATTACHMENT.COLOR_ATTACHMENT0);
		renderTarget.dispose();
		this._dummyScene.remove(reflectionProbe.camera);

		// Return the target texture

		return target;
	}

	/**
	 * Dispose of the CubeTxtureGenerator.
	 */
	dispose() {
		this._envMesh.material.uniforms.normalDistribution.dispose();

		this._envMesh.geometry.dispose();
		this._envMesh.material.dispose();
	}

}

const cubeTxtureShader = {
	name: 'cube_render',

	uniforms: {
		environmentMap: null,
		envMapFlip: 1
	},

	vertexShader: `
		#include <common_vert>
		varying vec3 vDir;
		void main() {
			vDir = (u_Model * vec4(a_Position, 0.0)).xyz;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
			gl_Position.z = gl_Position.w; // set z to camera.far
		}
	`,

	fragmentShader: `
		#include <common_frag>
        uniform sampler2D environmentMap;
        uniform float envMapFlip;
		varying vec3 vDir;

		void main() {
			vec3 V = normalize(vDir);
			V.x = -V.x;
			float phi = acos(V.y);
            float theta = envMapFlip * atan(V.x, V.z) + PI * 0.5;
            vec2 uv = vec2(theta / 2.0 / PI, -phi / PI);

			gl_FragColor =  mapTexelToLinear(texture2D(environmentMap, fract(uv)));
			#include <encodings_frag>
		}
	`
};

export { CubeTxtureGenerator };