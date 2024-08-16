import { ATTACHMENT, BoxGeometry, DRAW_SIDE, Mesh, PIXEL_FORMAT, PIXEL_TYPE, RenderTargetCube, Scene, ShaderMaterial, TextureCube } from 't3d';
import { ReflectionProbe } from '../probes/ReflectionProbe.js';

/**
 * RGBD decoder decodes RGBD cube texture to linear color space.
 */
export class RGBDDecoder {

	/**
	 * Constructs a new RGBD decoder.
	 */
	constructor() {
		const geometry = new BoxGeometry(1, 1, 1);
		const material = new ShaderMaterial(decodeShader);
		material.side = DRAW_SIDE.BACK;
		const envMesh = new Mesh(geometry, material);
		envMesh.frustumCulled = false;

		const dummyScene = new Scene();
		dummyScene.add(envMesh);

		this._envMesh = envMesh;
		this._dummyScene = dummyScene;
	}

	/**
	 * Decode the RGBD cube texture (in sRGB color space) to linear color space.
	 * @param {ThinRenderer} renderer - The renderer.
	 * @param {TextureCube} source - The source RGBD cube texture.
	 * @param {TextureCube} target - The target cube texture to store the decoded result.
	 * @return {TextureCube|Null} The target cube texture. This is a render texture, so you can't get the data from the mipmaps attribute directly.
	 */
	decode(renderer, source, target = new TextureCube()) {
		if (!source.isTextureCube) {
			console.error('RGBDDecoder: The source texture is not a cube texture.');
			return null;
		}

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

		// Calculate mipmaps number and cube size

		let cubeSize = source.images.length === 0 ? 16 : source.images[0].width;
		const mipmapNum = Math.floor(Math.log2(cubeSize));
		cubeSize = Math.pow(2, mipmapNum);

		// Prepare the target texture

		target.type = PIXEL_TYPE.HALF_FLOAT;
		target.format = PIXEL_FORMAT.RGBA;
		target.generateMipmaps = false;

		let mipmapSize = cubeSize;
		for (let i = 0; i < mipmapNum + 1; i++) {
			target.mipmaps[i] = [];
			for (let j = 0; j < 6; j++) {
				target.mipmaps[i].push({ width: mipmapSize, height: mipmapSize, data: null });
			}
			mipmapSize = mipmapSize / 2;
		}

		// Prepare render target

		const renderTarget = new RenderTargetCube(cubeSize, cubeSize);
		renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
		renderTarget.attach(target, ATTACHMENT.COLOR_ATTACHMENT0);

		// Prepare render stuff

		const reflectionProbe = new ReflectionProbe(renderTarget);
		this._dummyScene.add(reflectionProbe.camera);

		let envMapFlip = 1;
		if (source.images[0] && source.images[0].rtt) {
			envMapFlip = -1;
		}
		envMapFlip *= -1;

		this._envMesh.material.cubeMap = source;
		this._envMesh.material.uniforms.environmentMap = source;
		this._envMesh.material.uniforms.envMapFlip = envMapFlip;

		// Render mipmaps

		this._dummyScene.updateRenderStates(reflectionProbe.camera);

		for (let i = 0; i < mipmapNum + 1; i++) {
			this._envMesh.material.uniforms.level = i;

			renderTarget.activeMipmapLevel = i;
			reflectionProbe.render(renderer, this._dummyScene);
			reflectionProbe.camera.rect.z /= 2;
			reflectionProbe.camera.rect.w /= 2;
		}

		// Clear render stuff

		renderTarget.detach(ATTACHMENT.COLOR_ATTACHMENT0);
		renderTarget.dispose();
		this._dummyScene.remove(reflectionProbe.camera);

		// Return the target texture

		return target;
	}

}

const decodeShader = {
	name: 'rgbd_decode',
	defines: {},
	uniforms: {
		environmentMap: null,
		envMapFlip: -1,
		level: 0
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

        uniform samplerCube environmentMap;
        uniform float level;
		uniform float envMapFlip;

		varying vec3 vDir;

        vec3 RGBDToLinear(vec4 rgbd) {
			rgbd = sRGBToLinear(rgbd);
            return rgbd.rgb / rgbd.a;
        }

        void main() {
            vec3 dir = normalize(vDir);
            vec3 coordVec = vec3(envMapFlip * dir.x, dir.yz);

            vec3 color;
			#ifdef TEXTURE_LOD_EXT
				color = RGBDToLinear(textureCubeLodEXT(environmentMap, coordVec, level));
			#else
				color = RGBDToLinear(textureCube(environmentMap, coordVec, level));
			#endif

            gl_FragColor = vec4(color, 1.0);
        }
    `
};