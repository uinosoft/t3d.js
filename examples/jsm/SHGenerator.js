import {
	Vector3,
	Color3,
	RenderTargetCube,
	Scene,
	PIXEL_TYPE,
	PIXEL_FORMAT,
	SphericalHarmonics3
} from 't3d';
import { SkyBox } from './objects/SkyBox.js';
import { ReflectionProbe } from './probes/ReflectionProbe.js';

class SHGenerator {

	static fromCubeTexture(renderer, envMap, out = new SphericalHarmonics3()) {
		const imageWidth = 256;
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

		const textureType = PIXEL_TYPE.UNSIGNED_BYTE,
			ArrayCtor = Uint8Array,
			format = PIXEL_FORMAT.RGBA;

		const cubeRenderTarget = new RenderTargetCube(256, 256);
		cubeRenderTarget.texture.type = textureType;
		cubeRenderTarget.texture.format = format;

		const dummyScene = new Scene();
		const skyEnv = new SkyBox(envMap);
		const reflectionProbe = new ReflectionProbe(cubeRenderTarget);
		dummyScene.add(skyEnv);
		dummyScene.add(reflectionProbe.camera);

		let totalWeight = 0;

		const coord = new Vector3();

		const dir = new Vector3();

		const color = new Color3();

		const shBasis = [0, 0, 0, 0, 0, 0, 0, 0, 0];

		const sh = out;
		const shCoefficients = sh.coefficients;
		reflectionProbe.render(renderer, dummyScene);
		for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
			const data = new ArrayCtor(cubeRenderTarget.width * cubeRenderTarget.height * 4);
			cubeRenderTarget.activeCubeFace = faceIndex;
			renderer.setRenderTarget(cubeRenderTarget);
			renderer.readRenderTargetPixels(0, 0, cubeRenderTarget.width, cubeRenderTarget.height, data);
			const pixelSize = 2 / imageWidth;

			for (let i = 0, il = data.length; i < il; i += 4) { // RGBA assumed
				// pixel color
				color.setRGB(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);

				// convert to linear color space
				convertColorToLinear(color, cubeRenderTarget.texture.encoding);

				// pixel coordinate on unit cube

				const pixelIndex = i / 4;

				const col = -1 + (pixelIndex % imageWidth + 0.5) * pixelSize;

				const row = 1 - (Math.floor(pixelIndex / imageWidth) + 0.5) * pixelSize;

				switch (faceIndex) {
					case 0: coord.set(1, row, -col); break;

					case 1: coord.set(-1, row, col); break;

					case 2: coord.set(col, 1, -row); break;

					case 3: coord.set(col, -1, row); break;

					case 4: coord.set(col, row, 1); break;

					case 5: coord.set(-col, row, -1); break;
				}

				// weight assigned to this pixel

				const lengthSq = coord.getLengthSquared();

				const weight = 4 / (Math.sqrt(lengthSq) * lengthSq);

				totalWeight += weight;

				// direction vector to this pixel
				dir.copy(coord).normalize();

				// evaluate SH basis functions in direction dir
				SphericalHarmonics3.getBasisAt(dir, shBasis);

				// accummuulate
				for (let j = 0; j < 9; j++) {
					shCoefficients[j].x += shBasis[j] * color.r * weight;
					shCoefficients[j].y += shBasis[j] * color.g * weight;
					shCoefficients[j].z += shBasis[j] * color.b * weight;
				}
			}
		}

		cubeRenderTarget.dispose();

		// normalize
		const norm = (4 * Math.PI) / totalWeight;
		for (let j = 0; j < 9; j++) {
			shCoefficients[j].x *= norm;
			shCoefficients[j].y *= norm;
			shCoefficients[j].z *= norm;
		}

		return out;
	}

	static fromColors(color1, color2, out = new SphericalHarmonics3()) {
		const sky = new Vector3(color1.r, color1.g, color1.b);
		const ground = new Vector3(color2.r, color2.g, color2.b);

		// without extra factor of PI in the shader, should = 1 / Math.sqrt( Math.PI );
		const c0 = Math.sqrt(Math.PI);
		const c1 = c0 * Math.sqrt(0.75);

		out.coefficients[0].copy(sky).add(ground).multiplyScalar(c0);
		out.coefficients[1].copy(sky).sub(ground).multiplyScalar(c1);

		return out;
	}

	static fromColor(color, out = new SphericalHarmonics3()) {
		// without extra factor of PI in the shader, would be 2 / Math.sqrt( Math.PI );
		out.coefficients[0].set(color.r, color.g, color.b).multiplyScalar(2 * Math.sqrt(Math.PI));
		return out;
	}

}

function convertColorToLinear(color, encoding) {
	if (encoding !== 'linear') 	{
		color.convertSRGBToLinear();
	}
	return color;
}

export { SHGenerator };
