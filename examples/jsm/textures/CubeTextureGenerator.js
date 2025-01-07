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
	TEXTURE_FILTER,
	ATTACHMENT
} from 't3d';
import { ReflectionProbe } from '../probes/ReflectionProbe.js';

class CubeTextureGenerator {

	constructor() {
		/**
		 * Add rotation to texture.
		 * @type {Euler}
		 */
		this.rotation = new Euler();

		/**
		 * Whether to generate mipmaps for the cube texture.
		 * @type {Boolean}
		 * @default true
		 */
		this.generateMipmaps = true;

		// init

		const geometry = new BoxGeometry(1, 1, 1);
		const material = new ShaderMaterial(EquirectangularToCubeShader);
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
	 * Generate a new CubeTexture from TextureCube.
	 * @param {TextureCube} source - The source texture.
	 * @param {TextureCube} [target] - The output texture. If not provided, a new cube texture will be created.
	 */
	fromTextureCube(source, target = new TextureCube()) {
		const generateMipmaps = this.generateMipmaps;

		target.copy(source);
		target.mipmaps = []; // clear old mipmaps

		target.generateMipmaps = generateMipmaps;
		target.minFilter = generateMipmaps ? TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR : TEXTURE_FILTER.LINEAR;
		target.magFilter = TEXTURE_FILTER.LINEAR;

		target.version++;

		return target;
	}

	/**
	 * Generate a new CubeTexture from Texture2D.
	 * @param {ThinRenderer} renderer - The renderer.
	 * @param {Texture2D} source - The source texture.
	 * @param {TextureCube} [target] - The output texture. If not provided, a new cube texture will be created.
	 */
	fromTexture2D(renderer, source, target = new TextureCube()) {
		const generateMipmaps = this.generateMipmaps;

		// Check capabilities

		const capabilities = renderer.capabilities;
		const isWebGL2 = capabilities.version > 1;

		if (isWebGL2) {
			capabilities.getExtension('EXT_color_buffer_float');
		} else {
			capabilities.getExtension('OES_texture_half_float');
			capabilities.getExtension('OES_texture_half_float_linear');
		}

		capabilities.getExtension('OES_texture_float_linear');
		capabilities.getExtension('EXT_color_buffer_half_float');

		// Calculate cube size

		const cubeSize = source.image.width / 4;

		// Prepare the target texture

		target.type = source.type;
		target.format = source.format;

		target.generateMipmaps = generateMipmaps;
		target.minFilter = generateMipmaps ? TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR : TEXTURE_FILTER.LINEAR;
		target.magFilter = TEXTURE_FILTER.LINEAR;

		// Prepare render target

		const renderTarget = new RenderTargetCube(cubeSize, cubeSize);
		renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		renderTarget.attach(target, ATTACHMENT.COLOR_ATTACHMENT0);

		// Prepare render stuff

		const reflectionProbe = new ReflectionProbe(renderTarget);
		this._dummyScene.add(reflectionProbe.camera);

		this._envMesh.material.cubeMap = source;
		this._envMesh.material.uniforms.environmentMap = source;
		this._envMesh.material.uniforms.envMapFlip = -1;

		// Render

		this._dummyScene.updateRenderStates(reflectionProbe.camera);

		reflectionProbe.render(renderer, this._dummyScene);

		// Clear render stuff

		renderTarget.detach(ATTACHMENT.COLOR_ATTACHMENT0);
		renderTarget.dispose();
		this._dummyScene.remove(reflectionProbe.camera);

		// Return the target texture

		return target;
	}

	/**
	 * Dispose of the CubeTextureGenerator.
	 */
	dispose() {
		this._envMesh.geometry.dispose();
		this._envMesh.material.dispose();
	}

}

const EquirectangularToCubeShader = {
	name: 'equirectangularToCube',

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

			gl_FragColor = texture2D(environmentMap, fract(uv));
		}
	`
};

export { CubeTextureGenerator };