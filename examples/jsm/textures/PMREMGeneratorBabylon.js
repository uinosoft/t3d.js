import {
	BoxGeometry,
	DRAW_SIDE,
	Mesh,
	RenderTargetCube,
	Scene,
	ShaderMaterial,
	ShaderPostPass,
	RenderTarget2D,
	TextureCube,
	Euler,
	Quaternion,
	PIXEL_FORMAT,
	PIXEL_TYPE,
	TEXTURE_FILTER,
	ATTACHMENT
} from 't3d';
import { ReflectionProbe } from '../probes/ReflectionProbe.js';
import { CubeTxtureGenerator } from './CubeTxtureGenerator.js';


/**
 * This class generates a Prefiltered, Mipmapped Radiance Environment Map.
 * Reference to:
 * http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
 * https://github.com/pissang/claygl/blob/master/src/util/cubemap.js
 * https://github.com/mrdoob/three.js/blob/dev/src/extras/PMREMGenerator.js
 * https://threejs.org/examples/?q=mipmap#webgl_materials_cubemap_render_to_mipmaps
 */
class PMREMGenerator2 {

	/**
	 * Constructs a new PMREMGenerator.
	 * @param {number} [sampleSize=512] - The sample size for the normal distribution.
	 */
	constructor(sampleSize = 512) {
		/**
		 * Add rotation to the environment map.
		 * @type {Euler}
		 */
		this.rotation = new Euler();

		/**
		 * Whether to use the legacy(webgl1) method to generate PMREM.
		 * @type {boolean}
		 * @default false
		 */
		this.legacy = false;

		// init

		const geometry = new BoxGeometry(1, 1, 1);
		const material = new ShaderMaterial(prefilterShader);
		material.side = DRAW_SIDE.BACK;
		material.defines.SAMPLE_NUMBER = sampleSize;
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
		this._generateCubeTexture = null;

		this.NnrmalDistributionPass = new ShaderPostPass(NnrmalDistributionShader);
		this.tempRenderTarget = new RenderTarget2D(1024, 256);
		this.tempRenderTarget.texture.type = PIXEL_TYPE.FLOAT;
		this.tempRenderTarget.texture.minFilter = TEXTURE_FILTER.NEAREST;
		this.tempRenderTarget.texture.magFilter = TEXTURE_FILTER.NEAREST;
		this.tempRenderTarget.texture.generateMipmaps = false;
	}

	/**
	 * Generate a PMREM from a cubeMap or equirectangular environment texture.
	 * @param {ThinRenderer} renderer - The renderer.
	 * @param {TextureCube|Texture2D} envMap - The environment map.
	 * @param {TextureCube} [target] - The output texture. If not provided, a new cube texture will be created.
	 */
	prefilter(renderer, source, target = new TextureCube()) {
		// Check capabilities

		if (!this._envMesh.material.uniforms.normalDistribution) {
			renderer.setRenderTarget(this.tempRenderTarget);
			this.NnrmalDistributionPass.render(renderer);
			this._envMesh.material.uniforms.normalDistribution = this.tempRenderTarget.texture;
		}

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

		const legacy = this.legacy || !isWebGL2;

		// Generate textureCube

		if (!this._generateCubeTexture) {
			this._generateCubeTexture = new CubeTxtureGenerator();
		}
		source = this._generateCubeTexture.generate(renderer, source);
		// return source;

		// Calculate mipmaps number and cube size

		let cubeSize = source.images[0].width;

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

		if (legacy) {
			renderTarget.texture.type = PIXEL_TYPE.HALF_FLOAT;
			renderTarget.texture.format = PIXEL_FORMAT.RGBA;
			renderTarget.texture.generateMipmaps = false;
		} else {
			renderTarget.attach(target, ATTACHMENT.COLOR_ATTACHMENT0);
		}

		// Prepare render stuff

		const reflectionProbe = new ReflectionProbe(renderTarget);
		this._dummyScene.add(reflectionProbe.camera);

		let envMapFlip = 1;

		if (!legacy) {
			envMapFlip *= -1;
		}

		this._envMesh.material.cubeMap = source;
		this._envMesh.material.uniforms.environmentMap = source;
		this._envMesh.material.uniforms.envMapFlip = envMapFlip;

		// Render mipmaps

		this._dummyScene.updateRenderStates(reflectionProbe.camera);
		this._envMesh.material.uniforms.resolution = cubeSize;
		for (let i = 0; i < mipmapNum + 1; i++) {
			if (i === 0) {
				this._envMesh.material.uniforms.roughness = 0.000001;
			} else {
				this._envMesh.material.uniforms.roughness = Math.pow(2, (i / 0.8)) / Math.pow(2, mipmapNum + 1);
			}

			if (legacy) {
				reflectionProbe.render(renderer, this._dummyScene);
				for (let j = 0; j < 6; j++) {
					const mipmapData = target.mipmaps[i][j];
					mipmapData.data = new Uint16Array(mipmapData.width * mipmapData.height * 4);
					renderTarget.activeCubeFace = j;
					renderer.setRenderTarget(renderTarget);
					renderer.readRenderTargetPixels(0, 0, mipmapData.width, mipmapData.height, mipmapData.data);
					if (i === 0) {
						target.images[j] = mipmapData;
					}
				}
				renderTarget.resize(renderTarget.width / 2, renderTarget.height / 2);
			} else {
				renderTarget.activeMipmapLevel = i;
				reflectionProbe.render(renderer, this._dummyScene);
				reflectionProbe.camera.rect.z /= 2;
				reflectionProbe.camera.rect.w /= 2;
			}
		}

		legacy && target.version++;

		// Clear render stuff

		!legacy && renderTarget.detach(ATTACHMENT.COLOR_ATTACHMENT0);
		renderTarget.dispose();
		this._dummyScene.remove(reflectionProbe.camera);

		// Return the target texture

		return target;
	}

	/**
	 * Dispose of the PMREMGenerator.
	 */
	dispose() {
		this._envMesh.material.uniforms.normalDistribution.dispose();

		this._envMesh.geometry.dispose();
		this._envMesh.material.dispose();
	}


}

const prefilterShader = {
	name: 'pmrem',

	defines: {
		SAMPLE_NUMBER: 1024
	},

	uniforms: {
		environmentMap: null,
		normalDistribution: null,
		roughness: 0.5,
		envMapFlip: -1,
		resolution: 512
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

		uniform sampler2D normalDistribution;
		uniform float roughness;
		uniform float envMapFlip;
		uniform float resolution;
		varying vec3 vDir;

		const float K = 4.;

		vec3 importanceSampleNormal(float i, float roughness) {
			vec3 H = texture2D(normalDistribution, vec2(roughness, i)).rgb;
			return H;
		}

		float normalDistributionFunction_TrowbridgeReitzGGX(float NdotH, float alphaG) {
			float a2 = alphaG * alphaG;
			float d = NdotH * NdotH * (a2 - 1.0) + 1.0;
			return a2 / (PI * d * d);
		}

		float log4(float x) {
			return log2(x) / 2.;
		}

		void main() {
			vec3 V = normalize(vDir);

			vec3 N = V;

			mat3 R;

			vec3 up = abs(N.y) > 0.999 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
			R[0] = normalize(cross(up, N));
			R[2] = cross(N, R[0]);
			R[1] = N;

			vec3 prefilteredColor = vec3(0.0);
			float totalWeight = 0.0;
			float fMaxSampleNumber = float(SAMPLE_NUMBER);
			float dim0 = resolution;
			float omegaP = (4. * PI) / (6. * dim0 * dim0);
			for (int i = 0; i < SAMPLE_NUMBER; i++) {
				vec3 H = texture2D(normalDistribution, vec2(float(i) / fMaxSampleNumber, roughness)).rgb;
				H = normalize(R * H);

				vec3 L = normalize(reflect(-V, H));

				// float NoY = H.y;
				// float NoY2 = H.y * H.y;
				// float NoL = 2. * NoY2 - 1.;

				float NoL = clamp(dot(N, L), 0.0, 1.0);
				float NoH = normalize(dot(N, H));

				// vec3 L = vec3(2. * NoY * H.x, 2. * NoY * H.z, -NoL);
				// L = normalize(L);
				if (NoL > 0.0) {
					float pdf_inversed = 4. / normalDistributionFunction_TrowbridgeReitzGGX(NoH, roughness);
					float omegaS = 1./ fMaxSampleNumber * pdf_inversed;
					float l = log4(omegaS) - log4(omegaP) + log4(K);
					float mipLevel = clamp(float(l), 0.0, log2(resolution) - 2.0);
					prefilteredColor += mapTexelToLinear(textureCube(environmentMap, vec3(envMapFlip * L.x, L.yz), mipLevel)).rgb * NoL;
					totalWeight += NoL;
				}
			}

			gl_FragColor = vec4(prefilteredColor / totalWeight, 1.0);
			#include <encodings_frag>
		}
	`
};

const NnrmalDistributionShader = {
	uniforms: {
		sampleSize: 1024
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;

		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;

		varying vec2 v_Uv;

		void main() {
			v_Uv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
		}
	`,

	fragmentShader: `
		uniform int sampleSize;
		varying vec2 v_Uv;

		float radicalInverse_VdC(uint bits) {
			bits = (bits << 16u) | (bits >> 16u);
			bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
			bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
			bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
			bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
			return float(bits) * 2.3283064365386963e-10;
			// / 0x100000000
		}
		vec2 hammersley(uint i, uint N) {
			return vec2(float(i)/float(N), radicalInverse_VdC(i));
		}

		vec3 hemisphereImportanceSampleDggx(vec2 u, float a) {
			// pdf = D(a) * cosTheta
			float phi = 2. * PI * u.x;
			// NOTE: (aa-1) == (a-1)(a+1) produces better fp accuracy

			float cosTheta2 = (1. - u.y) / (1. + (a + 1.) * ((a - 1.) * u.y));
			float cosTheta = sqrt(cosTheta2);
			float sinTheta = sqrt(1. - cosTheta2);
			return vec3(sinTheta * cos(phi), cosTheta, sinTheta * sin(phi));
		}

		vec3 getValue(vec2 uv){
			float i = uv.x * float(sampleSize);
			vec2 b = hammersley(uint(i), uint(sampleSize));
			vec3 value = hemisphereImportanceSampleDggx(b, uv.y);
			return value;
		}
		void main() {
			vec3 data = getValue(v_Uv);
			gl_FragColor = vec4(data, 1.0);
		}
	`
};

export { PMREMGenerator2 };