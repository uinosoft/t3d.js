import { PIXEL_FORMAT, PIXEL_TYPE } from '../../../../src/const.js';
import { GPUMemoryInfo } from '../../../../src/render/GPUMemoryInfo.js';
import { Texture2DArray } from '../../../../src/resources/textures/Texture2DArray.js';
import { WebGLConstants } from '../../../../src/webgl/WebGLConstants.js';
import { WebGLTextures } from '../../../../src/webgl/WebGLTextures.js';

QUnit.module('WebGLTextures');

QUnit.test('array layer updates use source data sizes and track storage', assert => {
	const cases = [
		['RGBA16F', PIXEL_FORMAT.RGBA, PIXEL_TYPE.FLOAT, Float32Array, 4, 8],
		['R32UI', PIXEL_FORMAT.RED_INTEGER, PIXEL_TYPE.UNSIGNED_INT, Uint32Array, 1, 4],
		['RGBA16I', PIXEL_FORMAT.RGBA_INTEGER, PIXEL_TYPE.SHORT, Int16Array, 4, 8]
	];
	for (const format of [PIXEL_FORMAT.RGBA, 'RGBA', 0x1908]) {
		for (const type of [PIXEL_TYPE.FLOAT, 'FLOAT', 0x1406]) {
			cases.push([PIXEL_FORMAT.RGBA32F, format, type, Float32Array, 4, 16]);
		}
	}

	for (const [internalformat, format, type, ArrayType, components, bytesPerTexel] of cases) {
		const label = `${internalformat} (${format}, ${type})`;
		let uploadCount = 0;
		const layerUploads = [];
		const gl = {
			RGBA: 0x1908, RED_INTEGER: 0x8D94, RGBA_INTEGER: 0x8D99,
			FLOAT: 0x1406, UNSIGNED_INT: 0x1405, SHORT: 0x1402,
			RGBA16F: 0x881A, RGBA32F: 0x8814, R32UI: 0x8236, RGBA16I: 0x8D88,
			createTexture() { return {} },
			deleteTexture() {},
			pixelStorei() {},
			texParameteri() {},
			texImage3D() { uploadCount++ },
			texSubImage3D(...args) { layerUploads.push(args) }
		};
		const state = { activeTexture() {}, bindTexture() {} };
		const capabilities = { version: 2, getExtension() { return {} } };
		const expectedFormat = internalformat === 'R32UI' ? gl.RED_INTEGER : internalformat === 'RGBA16I' ? gl.RGBA_INTEGER : gl.RGBA;
		const expectedType = internalformat === 'R32UI' ? gl.UNSIGNED_INT : internalformat === 'RGBA16I' ? gl.SHORT : gl.FLOAT;
		const memory = new GPUMemoryInfo();
		const textures = new WebGLTextures('test', gl, state, capabilities, new WebGLConstants(gl, capabilities), memory);
		const texture = new Texture2DArray();
		const layerElements = 2 * 2 * components;
		const data = new ArrayType(layerElements * 3);
		for (let i = 0; i < data.length; i++) data[i] = i;
		texture.image = { width: 2, height: 2, depth: 3, data };
		texture.format = format;
		texture.internalformat = internalformat;
		texture.type = type;

		const properties = textures.setTexture(texture);
		assert.strictEqual(uploadCount, 1, `${label} is initially uploaded once`);
		assert.strictEqual(memory.textureBytes, 12 * bytesPerTexel, `${label} counts GPU storage bytes`);

		textures.setTexture(texture);
		assert.strictEqual(uploadCount, 1, `${label} version is recorded after upload`);

		texture.layerUpdates.add(1);
		texture.layerUpdates.add(2);
		texture.version++;
		textures.setTexture(texture);

		assert.strictEqual(layerUploads.length, 2, `${label} updates both requested layers`);
		for (let i = 0; i < layerUploads.length; i++) {
			const layerIndex = i + 1;
			const layerData = layerUploads[i][10];
			assert.strictEqual(layerUploads[i][4], layerIndex, `${label} updates the requested z offset`);
			assert.strictEqual(layerUploads[i][8], expectedFormat, `${label} resolves the source format`);
			assert.strictEqual(layerUploads[i][9], expectedType, `${label} resolves the source type`);
			assert.deepEqual(
				Array.from(layerData),
				Array.from(data.subarray(layerIndex * layerElements, (layerIndex + 1) * layerElements)),
				`${label} uploads the entire source layer`
			);
		}
		assert.strictEqual(texture.layerUpdates.size, 0, `${label} clears completed layer updates`);
		assert.strictEqual(properties.__version, texture.version, `${label} records the new version`);
		assert.strictEqual(memory.textures, 1, `${label} layer updates retain a single allocation`);
		assert.strictEqual(memory.textureBytes, 12 * bytesPerTexel, `${label} updates preserve storage size`);

		texture.dispose();
		assert.strictEqual(memory.textures, 0, `${label} disposal releases the allocation`);
		assert.strictEqual(memory.textureBytes, 0, `${label} disposal removes storage bytes`);
	}
});
