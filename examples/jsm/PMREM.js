import {
	BoxGeometry,
	DRAW_SIDE,
	Mesh,
	RenderTargetCube,
	Scene,
	ShaderMaterial,
	Texture2D,
	TextureCube,
	PIXEL_FORMAT,
	PIXEL_TYPE,
	TEXTURE_FILTER
} from 't3d';

import { ReflectionProbe } from './probes/ReflectionProbe.js';

/**
 * This class generates a Prefiltered, Mipmapped Radiance Environment Map
 * (PMREM) from a cubeMap or equirectangular environment texture.
 * Refer to: http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
 * Refer to: https://github.com/mrdoob/three.js/blob/dev/src/extras/PMREMGenerator.js
 */
class PMREM {

	/**
	 * @param {t3d.Renderer} renderer
	 * @param {t3d.TextureCube|t3d.Texture2D} envMap
	 * @param {Object} [textureOpts]
	 * @param {Number} [textureOpts.sampleSize=1024]
	 * @param {t3d.TextureCube} [textureOpts.outputTexture]
	 * @return {TextureCube}
	 */
	static prefilterEnvironmentMap(renderer, envMap, textureOpts = {}) {
		const sampleSize = textureOpts.sampleSize || 1024;

		const isCubeMap = envMap.isTextureCube;

		let cubeSize;
		if (isCubeMap) {
			cubeSize = envMap.images.length === 0 ? 16 : envMap.images[0].width;
		} else {
			cubeSize = envMap.image.width / 4;
		}

		const mipmapNum = Math.floor(Math.log2(cubeSize));
		cubeSize = Math.pow(2, mipmapNum);

		const capabilities = renderer.renderPass.capabilities;
		const isWebGL2 = capabilities.version > 1;

		if (isWebGL2) {
			capabilities.getExtension('EXT_color_buffer_float');
		} else {
			capabilities.getExtension('OES_texture_half_float');
			capabilities.getExtension('OES_texture_half_float_linear');
		}

		capabilities.getExtension('OES_texture_float_linear');
		capabilities.getExtension('EXT_color_buffer_half_float');

		let textureType = PIXEL_TYPE.HALF_FLOAT,
			ArrayCtor = Uint16Array,
			format = PIXEL_FORMAT.RGBA;

		const prefilteredCubeMap = textureOpts.outputTexture || new TextureCube();
		prefilteredCubeMap.type = textureType;
		prefilteredCubeMap.format = format;
		prefilteredCubeMap.generateMipmaps = false;

		const target = new RenderTargetCube(cubeSize, cubeSize);
		target.texture.type = textureType;
		target.texture.format = format;
		target.texture.magFilter = TEXTURE_FILTER.LINEAR;
		target.texture.minFilter = TEXTURE_FILTER.LINEAR;
		target.texture.generateMipmaps = false;

		const normalDistributionTexture = generateNormalDistribution(renderer.renderPass.capabilities, 256, sampleSize);

		const reflectionProbe = new ReflectionProbe(target);

		const dummyScene = new Scene();

		const geometry = new BoxGeometry(1, 1, 1);
		const material = new ShaderMaterial(prefilterShader);
		material.side = DRAW_SIDE.BACK;
		material.cubeMap = envMap;
		const skyEnv = new Mesh(geometry, material);
		skyEnv.frustumCulled = false;
		material.uniforms.environmentMap = envMap;
		if (isCubeMap) {
			material.uniforms.envMapFlip = (envMap.images[0] && envMap.images[0].rtt) ? -1 : 1;
			material.defines.PANORAMA = false;
		} else {
			material.uniforms.envMapFlip = 1;
			material.defines.PANORAMA = true;
		}
		material.uniforms.normalDistribution = normalDistributionTexture;
		reflectionProbe.camera.add(skyEnv);
		dummyScene.add(reflectionProbe.camera);

		for (let i = 0; i < mipmapNum + 1; i++) {
			material.uniforms.roughness = Math.max(i - 1, 0) / mipmapNum;
			reflectionProbe.render(renderer, dummyScene);

			prefilteredCubeMap.mipmaps[i] = [];
			for (let j = 0; j < 6; j++) {
				const pixels = new ArrayCtor(target.width * target.height * 4);
				target.activeCubeFace = j;
				renderer.renderPass.setRenderTarget(target);
				renderer.renderPass.readRenderTargetPixels(0, 0, target.width, target.height, pixels);
				if (i === 0) {
					prefilteredCubeMap.images[j] = { width: target.width, height: target.height, data: pixels };
				}
				prefilteredCubeMap.mipmaps[i].push({ width: target.width, height: target.height, data: pixels });
			}

			target.resize(target.width / 2, target.height / 2);
		}

		target.dispose();
		geometry.dispose();
		material.dispose();
		normalDistributionTexture.dispose();

		prefilteredCubeMap.version++;

		return prefilteredCubeMap;
	}

}

const prefilterShader = {

	name: 'rmrem',

	defines: {
		PANORAMA: false,
		SAMPLE_NUMBER: 1024
	},

	uniforms: {
		environmentMap: null,
		normalDistribution: null,
		roughness: 0.5,
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
		#ifdef PANORAMA
			uniform sampler2D environmentMap;
		#else
			uniform samplerCube environmentMap;
		#endif
		uniform sampler2D normalDistribution;
		uniform float roughness;
		uniform float envMapFlip;
		varying vec3 vDir;

		vec3 importanceSampleNormal(float i, float roughness, vec3 N) {
			vec3 H = texture2D(normalDistribution, vec2(roughness, i)).rgb;
		
			vec3 upVector = abs(N.y) > 0.999 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
			vec3 tangentX = normalize(cross(N, upVector));
			vec3 tangentZ = cross(N, tangentX);
			// Tangent to world space
			return normalize(tangentX * H.x + N * H.y + tangentZ * H.z);
		}

		void main() {
			vec3 V = normalize(vDir);

			vec3 N = V;

			vec3 prefilteredColor = vec3(0.0);
			float totalWeight = 0.0;
			float fMaxSampleNumber = float(SAMPLE_NUMBER);

			for (int i = 0; i < SAMPLE_NUMBER; i++) {
				vec3 H = importanceSampleNormal(float(i) / fMaxSampleNumber, roughness, N);
				vec3 L = reflect(-V, H);
		
				float NoL = clamp(dot(N, L), 0.0, 1.0);
				if (NoL > 0.0) {
					#ifdef PANORAMA
						float phi = acos(L.y);
						float theta = envMapFlip * atan(L.x, L.z) + PI * 0.5;
						vec2 uv = vec2(theta / 2.0 / PI, -phi / PI);
						prefilteredColor += mapTexelToLinear(texture2D(environmentMap, fract(uv))).rgb * NoL;
					#else
						prefilteredColor += mapTexelToLinear(textureCube(environmentMap, vec3(envMapFlip * L.x, L.yz))).rgb * NoL;
					#endif
					totalWeight += NoL;
				}
			}

			gl_FragColor = vec4(prefilteredColor / totalWeight, 1.0);
			#include <encodings_frag>
		}
	`

};

function generateNormalDistribution(capabilities, roughnessLevels, sampleSize) {
	// GLSL not support bit operation, use lookup instead
	// V -> i / N, U -> roughness
	roughnessLevels = roughnessLevels || 256;
	sampleSize = sampleSize || 1024;

	const normalDistribution = new Texture2D();

	const pixels = new Float32Array(sampleSize * roughnessLevels * 4);
	normalDistribution.image = { width: roughnessLevels, height: sampleSize, data: pixels };

	normalDistribution.type = PIXEL_TYPE.FLOAT;
	normalDistribution.minFilter = TEXTURE_FILTER.NEAREST;
	normalDistribution.magFilter = TEXTURE_FILTER.NEAREST;
	normalDistribution.generateMipmaps = false;

	normalDistribution.version++;

	const tmp = [];

	// function sortFunc(a, b) {
	//     return Math.abs(b) - Math.abs(a);
	// }

	for (let j = 0; j < roughnessLevels; j++) {
		const roughness = j / roughnessLevels;
		const a = roughness * roughness;

		for (let i = 0; i < sampleSize; i++) {
			// http://holger.dammertz.org/stuff/notes_HammersleyOnHemisphere.html
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
			// http://stackoverflow.com/questions/1908492/unsigned-integer-in-javascript
			// http://stackoverflow.com/questions/1822350/what-is-the-javascript-operator-and-how-do-you-use-it
			let y = (i << 16 | i >>> 16) >>> 0;
			y = ((y & 1431655765) << 1 | (y & 2863311530) >>> 1) >>> 0;
			y = ((y & 858993459) << 2 | (y & 3435973836) >>> 2) >>> 0;
			y = ((y & 252645135) << 4 | (y & 4042322160) >>> 4) >>> 0;
			y = (((y & 16711935) << 8 | (y & 4278255360) >>> 8) >>> 0) / 4294967296;

			// CDF
			const cosTheta = Math.sqrt((1 - y) / (1 + (a * a - 1.0) * y));
			tmp[i] = cosTheta;
		}

		for (let i = 0; i < sampleSize; i++) {
			const offset = (i * roughnessLevels + j) * 4;
			const cosTheta = tmp[i];
			const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta);
			const x = i / sampleSize;
			const phi = 2.0 * Math.PI * x;
			pixels[offset] = sinTheta * Math.cos(phi);
			pixels[offset + 1] = cosTheta;
			pixels[offset + 2] = sinTheta * Math.sin(phi);
			pixels[offset + 3] = 1.0;
		}
	}

	return normalDistribution;
}

export { PMREM };