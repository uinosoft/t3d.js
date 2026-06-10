import { PIXEL_FORMAT, PIXEL_TYPE } from '../const.js';

function getTextureLevelByteLength(width, height, depth, format, type) {
	depth = depth || 1;

	try {
		return getTexture2DByteLength(width, height, format, type) * depth;
	} catch (e) {
		const internalFormatByteLength = getInternalFormatByteLength(format);
		if (internalFormatByteLength > 0) {
			return width * height * depth * internalFormatByteLength;
		}

		throw e;
	}
}

function getTextureByteLength(texture, textureProperties) {
	const width = textureProperties.__width || 0;
	const height = textureProperties.__height || 0;
	const baseDepth = texture.isTexture3D || texture.isTexture2DArray ? (texture.image.depth || 1) : 1;
	const faceCount = texture.isTextureCube ? 6 : 1;
	const maxMipLevel = Math.floor(textureProperties.__maxMipLevel || 0);
	const format = texture.internalformat !== null ? texture.internalformat : texture.format;

	let byteLength = 0;

	for (let level = 0; level <= maxMipLevel; level++) {
		const mipWidth = Math.max(width >> level, 1);
		const mipHeight = Math.max(height >> level, 1);
		const mipDepth = texture.isTexture3D ? Math.max(baseDepth >> level, 1) : baseDepth;

		byteLength += getTextureLevelByteLength(mipWidth, mipHeight, mipDepth, format, texture.type) * faceCount;
	}

	return byteLength;
}

function getRenderBufferByteLength(renderBuffer, capabilities) {
	const samples = renderBuffer.multipleSampling > 0 ? Math.min(renderBuffer.multipleSampling, capabilities.maxSamples) : 1;
	return renderBuffer.width * renderBuffer.height * getInternalFormatByteLength(renderBuffer.format) * samples;
}

function getInternalFormatByteLength(format) {
	switch (format) {
		case PIXEL_FORMAT.R8:
		case PIXEL_FORMAT.ALPHA:
		case PIXEL_FORMAT.LUMINANCE:
		case PIXEL_FORMAT.RED:
		case PIXEL_FORMAT.RED_INTEGER:
		case PIXEL_FORMAT.STENCIL_INDEX8:
			return 1;
		case PIXEL_FORMAT.R16F:
		case PIXEL_FORMAT.RG8:
		case PIXEL_FORMAT.LUMINANCE_ALPHA:
		case PIXEL_FORMAT.RG:
		case PIXEL_FORMAT.RG_INTEGER:
		case PIXEL_FORMAT.RGBA4:
		case PIXEL_FORMAT.RGB5_A1:
		case PIXEL_FORMAT.DEPTH_COMPONENT16:
			return 2;
		case PIXEL_FORMAT.RGB8:
		case PIXEL_FORMAT.RGB:
		case PIXEL_FORMAT.RGB_INTEGER:
		case PIXEL_FORMAT.DEPTH_COMPONENT24:
			return 3;
		case PIXEL_FORMAT.R32F:
		case PIXEL_FORMAT.RG16F:
		case PIXEL_FORMAT.RGBA8:
		case PIXEL_FORMAT.RGBA:
		case PIXEL_FORMAT.RGBA_INTEGER:
		case PIXEL_FORMAT.R11F_G11F_B10F:
		case PIXEL_FORMAT.DEPTH_COMPONENT:
		case PIXEL_FORMAT.DEPTH_COMPONENT32F:
		case PIXEL_FORMAT.DEPTH_STENCIL:
		case PIXEL_FORMAT.DEPTH24_STENCIL8:
			return 4;
		case PIXEL_FORMAT.RG32F:
		case PIXEL_FORMAT.RGB16F:
		case PIXEL_FORMAT.RGBA16F:
		case PIXEL_FORMAT.DEPTH32F_STENCIL8:
			return 8;
		case PIXEL_FORMAT.RGB32F:
			return 12;
		case PIXEL_FORMAT.RGBA32F:
			return 16;
	}

	return 0;
}

function getTexture2DByteLength(width, height, format, type) {
	const typeByteLength = getTextureTypeByteLength(type);

	switch (format) {
		// https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
		case PIXEL_FORMAT.DEPTH_COMPONENT:
			return width * height * typeByteLength.byteLength;
		case PIXEL_FORMAT.DEPTH_STENCIL:
			return width * height * getDepthStencilTypeByteLength(type);
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

const _tempTypeByteLength = { byteLength: 0, components: 0 };
function getTextureTypeByteLength(type) {
	switch (type) {
		case PIXEL_TYPE.UNSIGNED_BYTE:
		case PIXEL_TYPE.BYTE:
			_tempTypeByteLength.byteLength = 1;
			_tempTypeByteLength.components = 1;
			return _tempTypeByteLength;
		case PIXEL_TYPE.UNSIGNED_SHORT:
		case PIXEL_TYPE.SHORT:
		case PIXEL_TYPE.HALF_FLOAT:
			_tempTypeByteLength.byteLength = 2;
			_tempTypeByteLength.components = 1;
			return _tempTypeByteLength;
		case PIXEL_TYPE.UNSIGNED_SHORT_5_6_5:
			_tempTypeByteLength.byteLength = 2;
			_tempTypeByteLength.components = 3;
			return _tempTypeByteLength;
		case PIXEL_TYPE.UNSIGNED_SHORT_4_4_4_4:
		case PIXEL_TYPE.UNSIGNED_SHORT_5_5_5_1:
			_tempTypeByteLength.byteLength = 2;
			_tempTypeByteLength.components = 4;
			return _tempTypeByteLength;
		case PIXEL_TYPE.UNSIGNED_INT:
		case PIXEL_TYPE.INT:
		case PIXEL_TYPE.FLOAT:
			_tempTypeByteLength.byteLength = 4;
			_tempTypeByteLength.components = 1;
			return _tempTypeByteLength;
	}
	throw new Error(`Unknown texture type ${type}.`);
}

function getDepthStencilTypeByteLength(type) {
	switch (type) {
		case PIXEL_TYPE.UNSIGNED_INT_24_8:
			return 4;
		case PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV:
			return 8;
	}

	return getTextureTypeByteLength(type).byteLength;
}

export { getTextureLevelByteLength, getTextureByteLength, getRenderBufferByteLength, getInternalFormatByteLength };
