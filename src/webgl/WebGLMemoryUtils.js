import { PIXEL_FORMAT, PIXEL_TYPE } from '../const.js';

function getTextureLevelByteLength(width, height, depth, format, type) {
	depth = depth || 1;

	const internalFormatByteLength = _sizedInternalFormatByteLengths.get(format);
	if (internalFormatByteLength !== undefined) {
		return width * height * depth * internalFormatByteLength;
	}

	return getTexture2DByteLength(width, height, format, type) * depth;
}

function getTextureByteLength(texture, textureProperties) {
	const width = textureProperties.__width || 0;
	const height = textureProperties.__height || 0;
	const baseDepth = texture.isTexture3D || texture.isTexture2DArray ? (texture.image.depth || 1) : 1;
	const faceCount = texture.isTextureCube ? 6 : 1;
	const maxMipLevel = Math.floor(textureProperties.__maxMipLevel || 0);
	// Storage size is determined by the sized internal format, not the upload type.
	const internalFormatByteLength = _sizedInternalFormatByteLengths.get(textureProperties.__glInternalFormat)
		|| _sizedInternalFormatByteLengths.get(texture.internalformat) || 0;

	let byteLength = 0;

	for (let level = 0; level <= maxMipLevel; level++) {
		const mipWidth = Math.max(width >> level, 1);
		const mipHeight = Math.max(height >> level, 1);
		const mipDepth = texture.isTexture3D ? Math.max(baseDepth >> level, 1) : baseDepth;

		const levelByteLength = internalFormatByteLength > 0
			? mipWidth * mipHeight * mipDepth * internalFormatByteLength
			: getTextureLevelByteLength(mipWidth, mipHeight, mipDepth, texture.format, texture.type);

		byteLength += levelByteLength * faceCount;
	}

	return byteLength;
}

function getRenderBufferByteLength(renderBuffer, capabilities) {
	const samples = renderBuffer.multipleSampling > 0 ? Math.min(renderBuffer.multipleSampling, capabilities.maxSamples) : 1;
	return renderBuffer.width * renderBuffer.height * getInternalFormatByteLength(renderBuffer.format) * samples;
}

function getInternalFormatByteLength(format) {
	const byteLength = _sizedInternalFormatByteLengths.get(format);
	if (byteLength !== undefined) return byteLength;

	switch (format) {
		case PIXEL_FORMAT.ALPHA:
		case PIXEL_FORMAT.LUMINANCE:
		case PIXEL_FORMAT.RED:
		case PIXEL_FORMAT.RED_INTEGER:
			return 1;
		case PIXEL_FORMAT.LUMINANCE_ALPHA:
		case PIXEL_FORMAT.RG:
		case PIXEL_FORMAT.RG_INTEGER:
			return 2;
		case PIXEL_FORMAT.RGB:
		case PIXEL_FORMAT.RGB_INTEGER:
			return 3;
		case PIXEL_FORMAT.RGBA:
		case PIXEL_FORMAT.RGBA_INTEGER:
		case PIXEL_FORMAT.DEPTH_COMPONENT:
		case PIXEL_FORMAT.DEPTH_STENCIL:
			return 4;
	}

	return 0;
}

function getTexture2DByteLength(width, height, format, type) {
	format = _textureFormatAliases.get(format) || format;

	const typeByteLength = getTextureTypeByteLength(type);

	switch (format) {
		// https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
		case PIXEL_FORMAT.DEPTH_COMPONENT:
		case PIXEL_FORMAT.DEPTH_STENCIL:
			return width * height * typeByteLength.byteLength;
		case PIXEL_FORMAT.STENCIL_INDEX8:
		case PIXEL_FORMAT.ALPHA:
		case PIXEL_FORMAT.LUMINANCE:
			return width * height;
		case PIXEL_FORMAT.LUMINANCE_ALPHA:
			return width * height * 2;
		case PIXEL_FORMAT.RED:
		case PIXEL_FORMAT.RED_INTEGER:
			return ((width * height) / typeByteLength.components) * typeByteLength.byteLength;
		case PIXEL_FORMAT.RG:
		case PIXEL_FORMAT.RG_INTEGER:
			return ((width * height * 2) / typeByteLength.components) * typeByteLength.byteLength;
		case PIXEL_FORMAT.RGB:
		case PIXEL_FORMAT.RGB_INTEGER:
			return ((width * height * 3) / typeByteLength.components) * typeByteLength.byteLength;
		case PIXEL_FORMAT.RGBA:
		case PIXEL_FORMAT.RGBA_INTEGER:
			return ((width * height * 4) / typeByteLength.components) * typeByteLength.byteLength;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
		case PIXEL_FORMAT.RGB_S3TC_DXT1:
		case PIXEL_FORMAT.RGBA_S3TC_DXT1:
			return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
		case PIXEL_FORMAT.RGBA_S3TC_DXT3:
		case PIXEL_FORMAT.RGBA_S3TC_DXT5:
			return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
		case PIXEL_FORMAT.RGB_PVRTC_2BPPV1:
		case PIXEL_FORMAT.RGBA_PVRTC_2BPPV1:
			return (Math.max(width, 16) * Math.max(height, 8)) / 4;
		case PIXEL_FORMAT.RGB_PVRTC_4BPPV1:
		case PIXEL_FORMAT.RGBA_PVRTC_4BPPV1:
			return (Math.max(width, 8) * Math.max(height, 8)) / 2;

		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
		case PIXEL_FORMAT.RGB_ETC1:
			return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
		// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
		case PIXEL_FORMAT.RGBA_ASTC_4x4:
			return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
		// https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
		case PIXEL_FORMAT.RGBA_BPTC:
		case PIXEL_FORMAT.RGB_BPTC_SIGNED_FORMAT:
		case PIXEL_FORMAT.RGB_BPTC_UNSIGNED_FORMAT:
			return Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
	}

	throw new Error(
		`Unable to determine texture byte length for ${format} format.`
	);
}

function getTextureTypeByteLength(type) {
	const byteLength = _textureTypeByteLengths.get(type);
	if (byteLength !== undefined) return byteLength;

	throw new Error(`Unknown texture type ${type}.`);
}

// Accept the same source format and type representations as WebGLConstants.
const _textureFormatAliases = new Map();
for (const [name, glFormat] of [
	['DEPTH_COMPONENT', 0x1902],
	['DEPTH_STENCIL', 0x84F9],
	['ALPHA', 0x1906],
	['RED', 0x1903],
	['RGB', 0x1907],
	['RGBA', 0x1908],
	['LUMINANCE', 0x1909],
	['LUMINANCE_ALPHA', 0x190A],
	['RED_INTEGER', 0x8D94],
	['RG', 0x8227],
	['RG_INTEGER', 0x8228],
	['RGB_INTEGER', 0x8D98],
	['RGBA_INTEGER', 0x8D99]
]) {
	_textureFormatAliases.set(name, PIXEL_FORMAT[name]);
	_textureFormatAliases.set(glFormat, PIXEL_FORMAT[name]);
}

const _textureTypeByteLengths = new Map();
for (const [name, glType, byteLength, components] of [
	['UNSIGNED_BYTE', 0x1401, 1, 1],
	['BYTE', 0x1400, 1, 1],
	['UNSIGNED_SHORT', 0x1403, 2, 1],
	['SHORT', 0x1402, 2, 1],
	['HALF_FLOAT', 0x140B, 2, 1],
	['HALF_FLOAT_OES', 0x8D61, 2, 1],
	['UNSIGNED_SHORT_5_6_5', 0x8363, 2, 3],
	['UNSIGNED_SHORT_4_4_4_4', 0x8033, 2, 4],
	['UNSIGNED_SHORT_5_5_5_1', 0x8034, 2, 4],
	['UNSIGNED_INT', 0x1405, 4, 1],
	['INT', 0x1404, 4, 1],
	['FLOAT', 0x1406, 4, 1],
	['UNSIGNED_INT_2_10_10_10_REV', 0x8368, 4, 4],
	['UNSIGNED_INT_10F_11F_11F_REV', 0x8C3B, 4, 3],
	['UNSIGNED_INT_5_9_9_9_REV', 0x8C3E, 4, 3],
	['UNSIGNED_INT_24_8', 0x84FA, 4, 2],
	['FLOAT_32_UNSIGNED_INT_24_8_REV', 0x8DAD, 8, 2]
]) {
	const info = { byteLength, components };
	_textureTypeByteLengths.set(name, info);
	_textureTypeByteLengths.set(glType, info);
	if (PIXEL_TYPE[name] !== undefined) {
		_textureTypeByteLengths.set(PIXEL_TYPE[name], info);
	}
}

// WebGL sized internal formats: name, native GL enum, and logical bytes per texel.
const _sizedInternalFormatByteLengths = new Map();
for (const [name, glFormat, byteLength] of [
	['R8', 0x8229, 1],
	['R8_SNORM', 0x8F94, 1],
	['R16F', 0x822D, 2],
	['R32F', 0x822E, 4],
	['R8UI', 0x8232, 1],
	['R8I', 0x8231, 1],
	['R16UI', 0x8234, 2],
	['R16I', 0x8233, 2],
	['R32UI', 0x8236, 4],
	['R32I', 0x8235, 4],
	['RG8', 0x822B, 2],
	['RG8_SNORM', 0x8F95, 2],
	['RG16F', 0x822F, 4],
	['RG32F', 0x8230, 8],
	['RG8UI', 0x8238, 2],
	['RG8I', 0x8237, 2],
	['RG16UI', 0x823A, 4],
	['RG16I', 0x8239, 4],
	['RG32UI', 0x823C, 8],
	['RG32I', 0x823B, 8],
	['RGB8', 0x8051, 3],
	['SRGB8', 0x8C41, 3],
	['RGB565', 0x8D62, 2],
	['RGB8_SNORM', 0x8F96, 3],
	['R11F_G11F_B10F', 0x8C3A, 4],
	['RGB9_E5', 0x8C3D, 4],
	['RGB16F', 0x881B, 6],
	['RGB32F', 0x8815, 12],
	['RGB8UI', 0x8D7D, 3],
	['RGB8I', 0x8D8F, 3],
	['RGB16UI', 0x8D77, 6],
	['RGB16I', 0x8D89, 6],
	['RGB32UI', 0x8D71, 12],
	['RGB32I', 0x8D83, 12],
	['RGBA8', 0x8058, 4],
	['SRGB8_ALPHA8', 0x8C43, 4],
	['RGBA8_SNORM', 0x8F97, 4],
	['RGB5_A1', 0x8057, 2],
	['RGBA4', 0x8056, 2],
	['RGB10_A2', 0x8059, 4],
	['RGBA16F', 0x881A, 8],
	['RGBA32F', 0x8814, 16],
	['RGBA8UI', 0x8D7C, 4],
	['RGBA8I', 0x8D8E, 4],
	['RGB10_A2UI', 0x906F, 4],
	['RGBA16UI', 0x8D76, 8],
	['RGBA16I', 0x8D88, 8],
	['RGBA32I', 0x8D82, 16],
	['RGBA32UI', 0x8D70, 16],
	['DEPTH_COMPONENT16', 0x81A5, 2],
	['DEPTH_COMPONENT24', 0x81A6, 3],
	['DEPTH_COMPONENT32F', 0x8CAC, 4],
	['DEPTH24_STENCIL8', 0x88F0, 4],
	['DEPTH32F_STENCIL8', 0x8CAD, 8],
	['STENCIL_INDEX8', 0x8D48, 1]
]) {
	_sizedInternalFormatByteLengths.set(name, byteLength);
	_sizedInternalFormatByteLengths.set(glFormat, byteLength);
	if (PIXEL_FORMAT[name] !== undefined) {
		_sizedInternalFormatByteLengths.set(PIXEL_FORMAT[name], byteLength);
	}
}

export { getTextureLevelByteLength, getTextureByteLength, getRenderBufferByteLength, getInternalFormatByteLength };
