import { PIXEL_FORMAT, PIXEL_TYPE } from '../../../../src/const.js';
import {
	getTextureLevelByteLength,
	getTextureByteLength,
	getRenderBufferByteLength,
	getInternalFormatByteLength
} from '../../../../src/webgl/WebGLMemoryUtils.js';

QUnit.module('WebGLMemoryUtils');

QUnit.test('getTextureLevelByteLength', assert => {
	assert.strictEqual(
		getTextureLevelByteLength(4, 4, 1, PIXEL_FORMAT.RGBA, PIXEL_TYPE.UNSIGNED_BYTE),
		64,
		'RGBA unsigned byte level uses 4 bytes per pixel'
	);

	assert.strictEqual(
		getTextureLevelByteLength(4, 4, 2, PIXEL_FORMAT.RED, PIXEL_TYPE.UNSIGNED_BYTE),
		32,
		'3D/array depth multiplies level byte length'
	);

	assert.strictEqual(
		getTextureLevelByteLength(8, 8, 1, PIXEL_FORMAT.RGB_S3TC_DXT1, PIXEL_TYPE.UNSIGNED_BYTE),
		32,
		'DXT1 compressed level uses 8-byte 4x4 blocks'
	);

	assert.strictEqual(
		getTextureLevelByteLength(5, 5, 1, PIXEL_FORMAT.RGBA_ASTC_4x4, PIXEL_TYPE.UNSIGNED_BYTE),
		64,
		'ASTC 4x4 compressed level rounds up to full blocks'
	);
});

QUnit.test('getTextureByteLength', assert => {
	const texture2D = {
		format: PIXEL_FORMAT.RGBA,
		internalformat: null,
		type: PIXEL_TYPE.UNSIGNED_BYTE,
		isTexture2D: true,
		isTextureCube: false,
		isTexture3D: false,
		isTexture2DArray: false
	};

	assert.strictEqual(
		getTextureByteLength(texture2D, { __width: 4, __height: 4, __maxMipLevel: 0 }),
		64,
		'2D texture byte length uses base level size'
	);

	assert.strictEqual(
		getTextureByteLength(texture2D, { __width: 4, __height: 4, __maxMipLevel: 2 }),
		84,
		'mipmapped texture byte length sums all tracked levels'
	);

	const cubeTexture = {
		format: PIXEL_FORMAT.RGBA,
		internalformat: null,
		type: PIXEL_TYPE.UNSIGNED_BYTE,
		isTexture2D: false,
		isTextureCube: true,
		isTexture3D: false,
		isTexture2DArray: false
	};

	assert.strictEqual(
		getTextureByteLength(cubeTexture, { __width: 2, __height: 2, __maxMipLevel: 0 }),
		96,
		'cube texture byte length includes six faces'
	);

	const texture3D = {
		format: PIXEL_FORMAT.RED,
		internalformat: null,
		type: PIXEL_TYPE.UNSIGNED_BYTE,
		image: { depth: 4 },
		isTexture2D: false,
		isTextureCube: false,
		isTexture3D: true,
		isTexture2DArray: false
	};

	assert.strictEqual(
		getTextureByteLength(texture3D, { __width: 4, __height: 4, __maxMipLevel: 1 }),
		72,
		'3D texture mip levels reduce width, height, and depth'
	);

	const texture2DArray = {
		format: PIXEL_FORMAT.RED,
		internalformat: null,
		type: PIXEL_TYPE.UNSIGNED_BYTE,
		image: { depth: 4 },
		isTexture2D: false,
		isTextureCube: false,
		isTexture3D: false,
		isTexture2DArray: true
	};

	assert.strictEqual(
		getTextureByteLength(texture2DArray, { __width: 4, __height: 4, __maxMipLevel: 1 }),
		80,
		'2D array texture mip levels keep layer depth unchanged'
	);
});

QUnit.test('getRenderBufferByteLength', assert => {
	assert.strictEqual(
		getRenderBufferByteLength({ width: 4, height: 4, format: PIXEL_FORMAT.RGBA8, multipleSampling: 0 }, { maxSamples: 4 }),
		64,
		'renderbuffer byte length uses internal format bytes per pixel'
	);

	assert.strictEqual(
		getRenderBufferByteLength({ width: 4, height: 4, format: PIXEL_FORMAT.RGBA8, multipleSampling: 8 }, { maxSamples: 4 }),
		256,
		'renderbuffer byte length clamps multisample count to capability max'
	);
});

QUnit.test('getInternalFormatByteLength', assert => {
	assert.strictEqual(getInternalFormatByteLength(PIXEL_FORMAT.R8), 1, 'R8 is 1 byte per pixel');
	assert.strictEqual(getInternalFormatByteLength(PIXEL_FORMAT.RGBA8), 4, 'RGBA8 is 4 bytes per pixel');
	assert.strictEqual(getInternalFormatByteLength(PIXEL_FORMAT.RGBA32F), 16, 'RGBA32F is 16 bytes per pixel');
	assert.strictEqual(getInternalFormatByteLength(-1), 0, 'unknown formats return 0');
});
