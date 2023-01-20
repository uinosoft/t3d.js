import { PIXEL_TYPE, PIXEL_FORMAT } from '../const.js';

class WebGLConstants {

	constructor(gl, capabilities) {
		this._gl = gl;
		this._capabilities = capabilities;
	}

	getGLType(type) {
		const gl = this._gl;
		const capabilities = this._capabilities;
		const isWebGL2 = capabilities.version >= 2;

		if (type === PIXEL_TYPE.UNSIGNED_BYTE) return gl.UNSIGNED_BYTE;
		if (type === PIXEL_TYPE.UNSIGNED_SHORT_5_6_5) return gl.UNSIGNED_SHORT_5_6_5;
		if (type === PIXEL_TYPE.UNSIGNED_SHORT_4_4_4_4) return gl.UNSIGNED_SHORT_4_4_4_4;
		if (type === PIXEL_TYPE.UNSIGNED_SHORT_5_5_5_1) return gl.UNSIGNED_SHORT_5_5_5_1;

		let extension;

		if (!isWebGL2) {
			if (type === PIXEL_TYPE.UNSIGNED_SHORT || type === PIXEL_TYPE.UNSIGNED_INT ||
				type === PIXEL_TYPE.UNSIGNED_INT_24_8) {
				extension = capabilities.getExtension('WEBGL_depth_texture');
				if (extension) {
					if (type === PIXEL_TYPE.UNSIGNED_SHORT) return gl.UNSIGNED_SHORT;
					if (type === PIXEL_TYPE.UNSIGNED_INT) return gl.UNSIGNED_INT;
					if (type === PIXEL_TYPE.UNSIGNED_INT_24_8) return extension.UNSIGNED_INT_24_8_WEBGL;
				} else {
					console.warn('extension WEBGL_depth_texture is not support.');
					return null;
				}
			}

			if (type === PIXEL_TYPE.FLOAT) {
				extension = capabilities.getExtension('OES_texture_float');
				if (extension) {
					return gl.FLOAT;
				} else {
					console.warn('extension OES_texture_float is not support.');
					return null;
				}
			}

			if (type === PIXEL_TYPE.HALF_FLOAT) {
				extension = capabilities.getExtension('OES_texture_half_float');
				if (extension) {
					return extension.HALF_FLOAT_OES;
				} else {
					console.warn('extension OES_texture_half_float is not support.');
					return null;
				}
			}
		} else {
			if (type === PIXEL_TYPE.UNSIGNED_SHORT) return gl.UNSIGNED_SHORT;
			if (type === PIXEL_TYPE.UNSIGNED_INT) return gl.UNSIGNED_INT;
			if (type === PIXEL_TYPE.UNSIGNED_INT_24_8) return gl.UNSIGNED_INT_24_8;
			if (type === PIXEL_TYPE.FLOAT) return gl.FLOAT;
			if (type === PIXEL_TYPE.HALF_FLOAT) return gl.HALF_FLOAT;
			if (type === PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV) return gl.FLOAT_32_UNSIGNED_INT_24_8_REV;

			if (type === PIXEL_TYPE.BYTE) return gl.BYTE;
			if (type === PIXEL_TYPE.SHORT) return gl.SHORT;
			if (type === PIXEL_TYPE.INT) return gl.INT;

			// does not include:
			// UNSIGNED_INT_2_10_10_10_REV
			// UNSIGNED_INT_10F_11F_11F_REV
			// UNSIGNED_INT_5_9_9_9_REV
		}

		return (gl[type] !== undefined) ? gl[type] : type;
	}

	getGLFormat(format) {
		const gl = this._gl;
		const capabilities = this._capabilities;

		if (format === PIXEL_FORMAT.RGB) return gl.RGB;
		if (format === PIXEL_FORMAT.RGBA) return gl.RGBA;
		if (format === PIXEL_FORMAT.ALPHA) return gl.ALPHA;
		if (format === PIXEL_FORMAT.LUMINANCE) return gl.LUMINANCE;
		if (format === PIXEL_FORMAT.LUMINANCE_ALPHA) return gl.LUMINANCE_ALPHA;
		if (format === PIXEL_FORMAT.DEPTH_COMPONENT) return gl.DEPTH_COMPONENT;
		if (format === PIXEL_FORMAT.DEPTH_STENCIL) return gl.DEPTH_STENCIL;
		if (format === PIXEL_FORMAT.RED) return gl.RED;

		if (format === PIXEL_FORMAT.RED_INTEGER) return gl.RED_INTEGER;
		if (format === PIXEL_FORMAT.RG) return gl.RG;
		if (format === PIXEL_FORMAT.RG_INTEGER) return gl.RG_INTEGER;
		if (format === PIXEL_FORMAT.RGB_INTEGER) return gl.RGB_INTEGER;
		if (format === PIXEL_FORMAT.RGBA_INTEGER) return gl.RGBA_INTEGER;

		let extension;

		// S3TC
		if (format === PIXEL_FORMAT.RGB_S3TC_DXT1 || format === PIXEL_FORMAT.RGBA_S3TC_DXT1 ||
            format === PIXEL_FORMAT.RGBA_S3TC_DXT3 || format === PIXEL_FORMAT.RGBA_S3TC_DXT5) {
			extension = capabilities.getExtension('WEBGL_compressed_texture_s3tc');
			if (extension) {
				if (format === PIXEL_FORMAT.RGB_S3TC_DXT1) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
				if (format === PIXEL_FORMAT.RGBA_S3TC_DXT1) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
				if (format === PIXEL_FORMAT.RGBA_S3TC_DXT3) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
				if (format === PIXEL_FORMAT.RGBA_S3TC_DXT5) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
			} else {
				console.warn('extension WEBGL_compressed_texture_s3tc is not support.');
				return null;
			}
		}

		// PVRTC
		if (format === PIXEL_FORMAT.RGB_PVRTC_4BPPV1 || format === PIXEL_FORMAT.RGB_PVRTC_2BPPV1 ||
            format === PIXEL_FORMAT.RGBA_PVRTC_4BPPV1 || format === PIXEL_FORMAT.RGBA_PVRTC_2BPPV1) {
			extension = capabilities.getExtension('WEBGL_compressed_texture_pvrtc');
			if (extension) {
				if (format === PIXEL_FORMAT.RGB_PVRTC_4BPPV1) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
				if (format === PIXEL_FORMAT.RGB_PVRTC_2BPPV1) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
				if (format === PIXEL_FORMAT.RGBA_PVRTC_4BPPV1) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
				if (format === PIXEL_FORMAT.RGBA_PVRTC_2BPPV1) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
			} else {
				console.warn('extension WEBGL_compressed_texture_pvrtc is not support.');
				return null;
			}
		}

		// ETC1
		if (format === PIXEL_FORMAT.RGB_ETC1) {
			extension = capabilities.getExtension('WEBGL_compressed_texture_etc1');
			if (extension) {
				return extension.COMPRESSED_RGB_ETC1_WEBGL;
			} else {
				console.warn('extension WEBGL_compressed_texture_etc1 is not support.');
				return null;
			}
		}

		// ASTC
		if (format === PIXEL_FORMAT.RGBA_ASTC_4x4) {
			extension = capabilities.getExtension('WEBGL_compressed_texture_astc');
			if (extension) {
				return extension.COMPRESSED_RGBA_ASTC_4x4_KHR;
			} else {
				console.warn('extension WEBGL_compressed_texture_astc is not support.');
				return null;
			}
		}

		// BPTC
		if (format === PIXEL_FORMAT.RGBA_BPTC) {
			extension = capabilities.getExtension('EXT_texture_compression_bptc');
			if (extension) {
				return extension.COMPRESSED_RGBA_BPTC_UNORM_EXT;
			} else {
				console.warn('extension EXT_texture_compression_bptc is not support.');
				return null;
			}
		}

		return (gl[format] !== undefined) ? gl[format] : format;
	}

	getGLInternalFormat(internalFormat) {
		const gl = this._gl;
		const capabilities = this._capabilities;

		const isWebGL2 = capabilities.version >= 2;

		if (internalFormat === PIXEL_FORMAT.RGBA4) return gl.RGBA4;
		if (internalFormat === PIXEL_FORMAT.RGB5_A1) return gl.RGB5_A1;
		if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT16) return gl.DEPTH_COMPONENT16;
		if (internalFormat === PIXEL_FORMAT.STENCIL_INDEX8) return gl.STENCIL_INDEX8;
		if (internalFormat === PIXEL_FORMAT.DEPTH_STENCIL) return gl.DEPTH_STENCIL;

		// does not include:
		// RGB565

		let extension;

		if (!isWebGL2) {
			if (internalFormat === PIXEL_FORMAT.RGBA32F || internalFormat === PIXEL_FORMAT.RGB32F) {
				extension = capabilities.getExtension('WEBGL_color_buffer_float');
				if (extension) {
					if (internalFormat === PIXEL_FORMAT.RGBA32F) return extension.RGBA32F_EXT;
					if (internalFormat === PIXEL_FORMAT.RGB32F) return extension.RGB32F_EXT;
				} else {
					console.warn('extension WEBGL_color_buffer_float is not support.');
					return null;
				}
			}
		} else {
			if (internalFormat === PIXEL_FORMAT.R8) return gl.R8;
			if (internalFormat === PIXEL_FORMAT.RG8) return gl.RG8;
			if (internalFormat === PIXEL_FORMAT.RGB8) return gl.RGB8;
			if (internalFormat === PIXEL_FORMAT.RGBA8) return gl.RGBA8;
			if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT24) return gl.DEPTH_COMPONENT24;
			if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT32F) return gl.DEPTH_COMPONENT32F;
			if (internalFormat === PIXEL_FORMAT.DEPTH24_STENCIL8) return gl.DEPTH24_STENCIL8;
			if (internalFormat === PIXEL_FORMAT.DEPTH32F_STENCIL8) return gl.DEPTH32F_STENCIL8;

			// does not include:
			// R8UI R8I R16UI R16I R32UI R32I RG8UI RG8I RG16UI RG16I RG32UI RG32I SRGB8_ALPHA8
			// RGB10_A2 RGBA8UI RGBA8I RGB10_A2UI RGBA16UI RGBA16I RGBA32I RGBA32UI

			if (internalFormat === PIXEL_FORMAT.R16F || internalFormat === PIXEL_FORMAT.RG16F ||
				internalFormat === PIXEL_FORMAT.RGB16F || internalFormat === PIXEL_FORMAT.RGBA16F ||
				internalFormat === PIXEL_FORMAT.R32F || internalFormat === PIXEL_FORMAT.RG32F ||
				internalFormat === PIXEL_FORMAT.RGB32F || internalFormat === PIXEL_FORMAT.RGBA32F) {
				extension = capabilities.getExtension('EXT_color_buffer_float');
				if (extension) {
					if (internalFormat === PIXEL_FORMAT.R16F) return gl.R16F;
					if (internalFormat === PIXEL_FORMAT.RG16F) return gl.RG16F;
					if (internalFormat === PIXEL_FORMAT.RGB16F) return gl.RGB16F;
					if (internalFormat === PIXEL_FORMAT.RGBA16F) return gl.RGBA16F;
					if (internalFormat === PIXEL_FORMAT.R32F) return gl.R32F;
					if (internalFormat === PIXEL_FORMAT.RG32F) return gl.RG32F;
					if (internalFormat === PIXEL_FORMAT.RGB32F) return gl.RGB32F;
					if (internalFormat === PIXEL_FORMAT.RGBA32F) return gl.RGBA32F;
					// does not include:
					// R11F_G11F_B10F
				} else {
					console.warn('extension EXT_color_buffer_float is not support.');
					return null;
				}
			}
		}

		return (gl[internalFormat] !== undefined) ? gl[internalFormat] : internalFormat;
	}

}

export { WebGLConstants };