import {
	ShaderPostPass,
	Texture2D,
	Vector3,
	PIXEL_TYPE,
	TEXTURE_FILTER,
	TEXTURE_WRAP
} from 't3d';
import { SSAOShader } from "../shaders/SSAOShader.js";

class SSAOPass extends ShaderPostPass {

	constructor() {
		super(SSAOShader);

		this._kernels = {};

		this.setNoiseSize(4);
		this.setKernelSize(12); // 12
	}

	setKernelSize(size, offset) {
		offset = (offset !== undefined) ? offset : 0;

		const code = size + "_" + offset;
		if (!this._kernels[code]) {
			this._kernels[code] = generateKernel(size, offset * size);
		}

		this.material.defines["KERNEL_SIZE"] = size;
		this.material.uniforms["kernel"] = this._kernels[code];
	}

	setNoiseSize(size) {
		let texture = this.material.uniforms["noiseTex"];
		if (!texture) {
			texture = generateNoiseTexture(size);
			this.material.uniforms["noiseTex"] = texture;
		} else {
			texture.image.data = generateNoiseData(size);
			texture.image.width = size;
			texture.image.height = size;
			texture.version++;
		}

		this.material.uniforms["noiseTexSize"] = [size, size];
	}

}

function generateNoiseData(size) {
	const data = new Uint8Array(size * size * 4);
	let n = 0;
	const v3 = new Vector3();
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			v3.set(Math.random() * 2 - 1, Math.random() * 2 - 1, 0).normalize();
			data[n++] = (v3.x * 0.5 + 0.5) * 255;
			data[n++] = (v3.y * 0.5 + 0.5) * 255;
			data[n++] = 0;
			data[n++] = 255;
		}
	}
	return data;
}

function generateNoiseTexture(size) {
	const texture = new Texture2D();

	texture.image = { data: generateNoiseData(size), width: size, height: size };

	texture.type = PIXEL_TYPE.UNSIGNED_BYTE;

	texture.magFilter = TEXTURE_FILTER.NEAREST;
	texture.minFilter = TEXTURE_FILTER.NEAREST;

	texture.wrapS = TEXTURE_WRAP.REPEAT;
	texture.wrapT = TEXTURE_WRAP.REPEAT;

	texture.generateMipmaps = false;
	texture.flipY = false;

	texture.version++;

	return texture;
}

// https://en.wikipedia.org/wiki/Halton_sequence halton sequence.
function halton(index, base) {
	let result = 0;
	let f = 1 / base;
	let i = index;
	while (i > 0) {
		result = result + f * (i % base);
		i = Math.floor(i / base);
		f = f / base;
	}
	return result;
}

function generateKernel(size, offset) {
	const kernel = new Float32Array(size * 3);
	offset = offset || 0;
	for (let i = 0; i < size; i++) {
		const phi = halton(i + offset, 2) * Math.PI;
		const theta = halton(i + offset, 3) * Math.PI;
		const r = Math.random();
		const x = Math.cos(phi) * Math.sin(theta) * r;
		const y = Math.cos(theta) * r;
		const z = Math.sin(phi) * Math.sin(theta) * r;

		kernel[i * 3] = x;
		kernel[i * 3 + 1] = y;
		kernel[i * 3 + 2] = z;
	}
	return kernel;
}

export { SSAOPass };