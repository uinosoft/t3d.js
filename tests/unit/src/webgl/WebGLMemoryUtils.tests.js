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

QUnit.test('integer texture internal formats', assert => {
	for (const [internalformat, format, type, expected] of [
		['R32UI', PIXEL_FORMAT.RED_INTEGER, PIXEL_TYPE.UNSIGNED_INT, 65536],
		[0x8236, PIXEL_FORMAT.RED_INTEGER, PIXEL_TYPE.UNSIGNED_INT, 65536],
		['RGBA16I', PIXEL_FORMAT.RGBA_INTEGER, PIXEL_TYPE.SHORT, 131072],
		[0x8D88, PIXEL_FORMAT.RGBA_INTEGER, PIXEL_TYPE.SHORT, 131072]
	]) {
		assert.strictEqual(
			getTextureByteLength({ internalformat, format, type }, { __width: 128, __height: 128 }),
			expected,
			`${internalformat} uses its integer storage size`
		);
	}
});

QUnit.test('storage size differs from upload data size', assert => {
	for (const [internalformat, format, type, storageBytes, uploadBytes] of [
		[PIXEL_FORMAT.RGBA16F, PIXEL_FORMAT.RGBA, PIXEL_TYPE.FLOAT, 128, 256],
		['RGBA16F', PIXEL_FORMAT.RGBA, PIXEL_TYPE.FLOAT, 128, 256],
		['RGBA4', PIXEL_FORMAT.RGBA, PIXEL_TYPE.UNSIGNED_BYTE, 32, 64],
		[PIXEL_FORMAT.RGB16F, PIXEL_FORMAT.RGB, PIXEL_TYPE.FLOAT, 96, 192]
	]) {
		assert.strictEqual(
			getTextureByteLength({ internalformat, format, type }, { __width: 4, __height: 4 }),
			storageBytes,
			`${internalformat} estimates GPU storage independently of upload type`
		);
		assert.strictEqual(
			getTextureLevelByteLength(4, 4, 1, format, type),
			uploadBytes,
			`${internalformat} upload size follows the source format and type`
		);
	}
});

QUnit.test('resolved internal format and fallback', assert => {
	const texture = { internalformat: null, format: PIXEL_FORMAT.RGBA, type: PIXEL_TYPE.FLOAT };
	const properties = { __width: 4, __height: 4, __glInternalFormat: 0x881A }; // RGBA16F

	assert.strictEqual(getTextureByteLength(texture, properties), 128, 'resolved sized format determines storage');

	texture.internalformat = 'RGBA32F';
	assert.strictEqual(getTextureByteLength(texture, properties), 128, 'uploaded format takes precedence over requested format');

	properties.__glInternalFormat = 0x1908; // RGBA (unsized)
	texture.internalformat = null;
	assert.strictEqual(getTextureByteLength(texture, properties), 256, 'unsized format falls back to source format and type');

	texture.internalformat = 'UNKNOWN_INTERNAL_FORMAT';
	assert.strictEqual(getTextureByteLength(texture, properties), 256, 'unrecognized format falls back to source format and type');

	texture.format = PIXEL_FORMAT.RGBA_S3TC_DXT5;
	texture.type = PIXEL_TYPE.UNSIGNED_BYTE;
	texture.internalformat = 'COMPRESSED_RGBA_S3TC_DXT5_EXT';
	properties.__glInternalFormat = 0x83F3;
	properties.__maxMipLevel = 2;
	assert.strictEqual(getTextureByteLength(texture, properties), 48, 'compressed mipmaps retain block size calculations');
});

QUnit.test('explicit internal formats include faces, depth and mipmaps', assert => {
	const texture = { internalformat: 'R32UI', format: PIXEL_FORMAT.RED_INTEGER, type: PIXEL_TYPE.UNSIGNED_INT };
	const properties = { __width: 4, __height: 4, __maxMipLevel: 2 };

	assert.strictEqual(getTextureByteLength(texture, properties), 84, 'sized 2D format sums mip levels');

	texture.isTextureCube = true;
	assert.strictEqual(getTextureByteLength(texture, properties), 504, 'sized cube format includes all six faces');

	texture.isTextureCube = false;
	texture.isTexture3D = true;
	texture.image = { depth: 4 };
	assert.strictEqual(getTextureByteLength(texture, properties), 292, 'sized 3D format reduces depth at each mip level');

	texture.isTexture3D = false;
	texture.isTexture2DArray = true;
	assert.strictEqual(getTextureByteLength(texture, properties), 336, 'sized array format retains layer count at each mip level');
});

QUnit.test('depth-stencil upload types', assert => {
	assert.strictEqual(
		getTextureLevelByteLength(4, 4, 1, PIXEL_FORMAT.DEPTH_STENCIL, PIXEL_TYPE.UNSIGNED_INT_24_8),
		64,
		'packed depth-stencil upload uses four bytes per pixel'
	);
	assert.strictEqual(
		getTextureLevelByteLength(4, 4, 1, PIXEL_FORMAT.DEPTH_STENCIL, PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV),
		128,
		'float depth-stencil upload uses eight bytes per pixel'
	);
});

QUnit.test('source format and type aliases', assert => {
	for (const [formats, types, expected] of [
		[[PIXEL_FORMAT.RGBA, 'RGBA', 0x1908], [PIXEL_TYPE.FLOAT, 'FLOAT', 0x1406], 256],
		[[PIXEL_FORMAT.RGBA, 'RGBA', 0x1908], [PIXEL_TYPE.HALF_FLOAT, 'HALF_FLOAT', 0x140B, 0x8D61], 128],
		[[PIXEL_FORMAT.RED_INTEGER, 'RED_INTEGER', 0x8D94], [PIXEL_TYPE.UNSIGNED_INT, 'UNSIGNED_INT', 0x1405], 64],
		[[PIXEL_FORMAT.RGBA_INTEGER, 'RGBA_INTEGER', 0x8D99], [PIXEL_TYPE.SHORT, 'SHORT', 0x1402], 128],
		[[PIXEL_FORMAT.RGB, 'RGB', 0x1907], [PIXEL_TYPE.UNSIGNED_SHORT_5_6_5, 'UNSIGNED_SHORT_5_6_5', 0x8363], 32],
		[[PIXEL_FORMAT.RGBA, 'RGBA', 0x1908], ['UNSIGNED_INT_2_10_10_10_REV', 0x8368], 64],
		[[PIXEL_FORMAT.RGB, 'RGB', 0x1907], ['UNSIGNED_INT_10F_11F_11F_REV', 0x8C3B], 64],
		[[PIXEL_FORMAT.RGB, 'RGB', 0x1907], ['UNSIGNED_INT_5_9_9_9_REV', 0x8C3E], 64],
		[[PIXEL_FORMAT.DEPTH_STENCIL, 'DEPTH_STENCIL', 0x84F9], [PIXEL_TYPE.UNSIGNED_INT_24_8, 'UNSIGNED_INT_24_8', 0x84FA], 64],
		[[PIXEL_FORMAT.DEPTH_STENCIL, 'DEPTH_STENCIL', 0x84F9], [PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV, 'FLOAT_32_UNSIGNED_INT_24_8_REV', 0x8DAD], 128]
	]) {
		for (const format of formats) {
			for (const type of types) {
				assert.strictEqual(
					getTextureLevelByteLength(4, 4, 1, format, type),
					expected,
					`${format} and ${type} use the expected source data size`
				);
			}
		}
	}

	assert.strictEqual(
		getTextureByteLength({ internalformat: null, format: 'RGBA', type: 0x1406 }, { __width: 4, __height: 4 }),
		256,
		'unsized storage estimates also accept source format and type aliases'
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

	assert.strictEqual(
		getRenderBufferByteLength({ width: 4, height: 4, format: 'RGBA16I', multipleSampling: 4 }, { maxSamples: 4 }),
		512,
		'string integer renderbuffer format includes its sample count'
	);
});

QUnit.test('getInternalFormatByteLength', assert => {
	assert.strictEqual(getInternalFormatByteLength(PIXEL_FORMAT.R8), 1, 'R8 is 1 byte per pixel');
	assert.strictEqual(getInternalFormatByteLength(PIXEL_FORMAT.RGBA8), 4, 'RGBA8 is 4 bytes per pixel');
	assert.strictEqual(getInternalFormatByteLength(PIXEL_FORMAT.RGBA32F), 16, 'RGBA32F is 16 bytes per pixel');
	assert.strictEqual(getInternalFormatByteLength(PIXEL_FORMAT.RGB16F), 6, 'RGB16F has three two-byte components');
	assert.strictEqual(getInternalFormatByteLength(-1), 0, 'unknown formats return 0');
});

QUnit.test('string and native GL sized internal formats', assert => {
	for (const [name, glFormat, expected] of [
		['R32UI', 0x8236, 4],
		['RGBA16I', 0x8D88, 8],
		['RG8I', 0x8237, 2],
		['RGB16UI', 0x8D77, 6],
		['RGBA32UI', 0x8D70, 16],
		['R8_SNORM', 0x8F94, 1],
		['SRGB8_ALPHA8', 0x8C43, 4],
		['RGB565', 0x8D62, 2],
		['RGB10_A2UI', 0x906F, 4],
		['RGB9_E5', 0x8C3D, 4],
		['RGB16F', 0x881B, 6],
		['DEPTH_COMPONENT24', 0x81A6, 3],
		['DEPTH32F_STENCIL8', 0x8CAD, 8]
	]) {
		assert.strictEqual(getInternalFormatByteLength(name), expected, `${name} string has the expected texel size`);
		assert.strictEqual(getInternalFormatByteLength(glFormat), expected, `${name} native GL enum has the expected texel size`);
	}
});
