import { TEXTURE_FILTER, TEXTURE_WRAP, PIXEL_FORMAT, PIXEL_TYPE } from '../const.js';
import { PropertyMap } from '../render/PropertyMap.js';
import { MathUtils } from '../math/MathUtils.js';

class WebGLTextures extends PropertyMap {

	constructor(prefix, gl, state, capabilities, constants) {
		super(prefix);

		this._gl = gl;
		this._state = state;
		this._capabilities = capabilities;
		this._constants = constants;

		this._usedTextureUnits = 0;

		const that = this;

		function onTextureDispose(event) {
			const texture = event.target;
			const textureProperties = that.get(texture);

			texture.removeEventListener('dispose', onTextureDispose);

			if (textureProperties.__webglTexture && !textureProperties.__external) {
				gl.deleteTexture(textureProperties.__webglTexture);
			}

			if (textureProperties.__readBuffer) {
				gl.deleteBuffer(textureProperties.__readBuffer);
			}

			that.delete(texture);
		}

		this._onTextureDispose = onTextureDispose;

		this._wrappingToGL = {
			[TEXTURE_WRAP.REPEAT]: gl.REPEAT,
			[TEXTURE_WRAP.CLAMP_TO_EDGE]: gl.CLAMP_TO_EDGE,
			[TEXTURE_WRAP.MIRRORED_REPEAT]: gl.MIRRORED_REPEAT
		};

		this._filterToGL = {
			[TEXTURE_FILTER.NEAREST]: gl.NEAREST,
			[TEXTURE_FILTER.LINEAR]: gl.LINEAR,
			[TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST]: gl.NEAREST_MIPMAP_NEAREST,
			[TEXTURE_FILTER.LINEAR_MIPMAP_NEAREST]: gl.LINEAR_MIPMAP_NEAREST,
			[TEXTURE_FILTER.NEAREST_MIPMAP_LINEAR]: gl.NEAREST_MIPMAP_LINEAR,
			[TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR]: gl.LINEAR_MIPMAP_LINEAR
		};
	}

	allocTexUnit() {
		const textureUnit = this._usedTextureUnits++;

		if (textureUnit >= this._capabilities.maxTextures) {
			console.warn('trying to use ' + textureUnit + ' texture units while this GPU supports only ' + this._capabilities.maxTextures);
		}

		return textureUnit;
	}

	resetTextureUnits() {
		this._usedTextureUnits = 0;
	}

	setTexture(texture, slot) {
		const gl = this._gl;
		const capabilities = this._capabilities;
		const constants = this._constants;
		const state = this._state;

		if ((texture.isTexture3D || texture.isTexture2DArray) && capabilities.version < 2) {
			console.warn('WebGLTextures: Texture3D/Texture2DArray is not supported in WebGL1.0.');
			return;
		}

		if (slot !== undefined) {
			slot = gl.TEXTURE0 + slot;
		}

		const textureProperties = this.get(texture);

		const textureTarget = getTextureTarget(gl, texture);

		const hasImage = texture.isTextureCube ? texture.images.length === 6 : !!texture.image;
		let singleImage = texture.isTextureCube ? texture.images[0] : texture.image;

		if (
			hasImage
			&& textureProperties.__version !== texture.version
			// Do not initialize rtt texture, unless slot is undefined,
			// which means the caller just wants to bind the texture to the framebuffer, not use it for sampling.
			&& (!singleImage.rtt || slot === undefined)
			// Do not initialize external texture
			&& !textureProperties.__external
		) {
			if (textureProperties.__webglTexture === undefined) {
				texture.addEventListener('dispose', this._onTextureDispose);
				textureProperties.__webglTexture = gl.createTexture();
				textureProperties.__webglTarget = textureTarget;
			}

			if (
				capabilities.version < 2 && texture.isTexture2D
				&& !_isPowerOfTwo(singleImage) && textureNeedsPowerOfTwo(texture)
				&& domCheck(singleImage)
			) {
				singleImage = makePowerOf2(singleImage);
			}

			const needFallback = capabilities.version < 2 && !_isPowerOfTwo(singleImage);
			const uploadMipmaps = texture.mipmaps.length > 0 && !needFallback;

			const glFormat = constants.getGLFormat(texture.format),
				glType = constants.getGLType(texture.type),
				glInternalFormat = (texture.internalformat !== null) ? constants.getGLInternalFormat(texture.internalformat) :
					getGLInternalFormat(gl, capabilities, glFormat, glType);

			textureProperties.__glFormat = glFormat;
			textureProperties.__glType = glType;
			textureProperties.__glInternalFormat = glInternalFormat;
			textureProperties.__width = singleImage.width;
			textureProperties.__height = singleImage.height;
			textureProperties.__maxMipLevel = uploadMipmaps ? texture.mipmaps.length - 1 : 0;

			state.activeTexture(slot);
			state.bindTexture(textureTarget, textureProperties.__webglTexture);

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
			gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

			this._setTextureParameters(texture, textureTarget, needFallback);

			if (texture.isTexture2D) {
				this._upload2DImage(texture, textureProperties, uploadMipmaps, singleImage);
			} else if (texture.isTextureCube) {
				this._uploadCubeImages(texture, textureProperties, uploadMipmaps);
			} else if (texture.isTexture3D) {
				this._upload3DImage(texture, textureProperties);
			} else if (texture.isTexture2DArray) {
				this._upload2DArrayImage(texture, textureProperties);
			}

			if (texture.generateMipmaps && !uploadMipmaps && !needFallback) {
				this.generateMipmaps(texture);
			}

			textureProperties.__version = texture.version;

			return textureProperties;
		}

		state.activeTexture(slot);
		state.bindTexture(textureTarget, textureProperties.__webglTexture);

		return textureProperties;
	}

	generateMipmaps(texture) {
		const gl = this._gl;

		const textureProperties = this.get(texture);

		gl.generateMipmap(textureProperties.__webglTarget);

		const width = textureProperties.__width, height = textureProperties.__height;
		// Note: Math.log( x ) * Math.LOG2E used instead of Math.log2( x ) which is not supported by IE11
		textureProperties.__maxMipLevel = Math.log(Math.max(width, height)) * Math.LOG2E;
	}

	setTextureExternal(texture, webglTexture) {
		const gl = this._gl;

		const textureProperties = this.get(texture);

		if (!textureProperties.__external) {
			if (textureProperties.__webglTexture) {
				gl.deleteTexture(textureProperties.__webglTexture);
			} else {
				texture.addEventListener('dispose', this._onTextureDispose);
			}
		}

		textureProperties.__webglTexture = webglTexture;
		textureProperties.__external = true;
	}

	_setTextureParameters(texture, textureType, needFallback) {
		const gl = this._gl;
		const capabilities = this._capabilities;

		const wrappingToGL = this._wrappingToGL;
		const filterToGL = this._filterToGL;

		let wrapS = texture.wrapS,
			wrapT = texture.wrapT,
			wrapR = texture.wrapR,
			magFilter = texture.magFilter,
			minFilter = texture.minFilter;

		// fix for non power of 2 image in WebGL 1.0
		if (needFallback) {
			wrapS = TEXTURE_WRAP.CLAMP_TO_EDGE;
			wrapT = TEXTURE_WRAP.CLAMP_TO_EDGE;

			if (texture.isTexture3D) {
				wrapR = TEXTURE_WRAP.CLAMP_TO_EDGE;
			}

			if (texture.wrapS !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.wrapT !== TEXTURE_WRAP.CLAMP_TO_EDGE) {
				console.warn('Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to TEXTURE_WRAP.CLAMP_TO_EDGE.', texture);
			}

			magFilter = filterFallback(texture.magFilter);
			minFilter = filterFallback(texture.minFilter);

			if (
				(texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR) ||
				(texture.magFilter !== TEXTURE_FILTER.NEAREST && texture.magFilter !== TEXTURE_FILTER.LINEAR)
			) {
				console.warn('Texture is not power of two. Texture.minFilter and Texture.magFilter should be set to TEXTURE_FILTER.NEAREST or TEXTURE_FILTER.LINEAR.', texture);
			}
		}

		gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, wrappingToGL[wrapS]);
		gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, wrappingToGL[wrapT]);

		if (texture.isTexture3D) {
			gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, wrappingToGL[wrapR]);
		}

		gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, filterToGL[magFilter]);
		gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, filterToGL[minFilter]);

		// anisotropy if EXT_texture_filter_anisotropic exist
		const extension = capabilities.anisotropyExt;
		if (extension) {
			gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, capabilities.maxAnisotropy));
		}

		if (capabilities.version >= 2) {
			if (texture.compare !== undefined) {
				gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
				gl.texParameteri(textureType, gl.TEXTURE_COMPARE_FUNC, texture.compare);
			} else {
				gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.NONE);
			}
		}
	}

	_upload2DImage(texture, textureProperties, uploadMipmaps, image) {
		const gl = this._gl;

		const glTarget = textureProperties.__webglTarget,
			glFormat = textureProperties.__glFormat,
			glType = textureProperties.__glType,
			glInternalFormat = textureProperties.__glInternalFormat;

		if (domCheck(image)) {
			if (uploadMipmaps) {
				const mipmaps = texture.mipmaps;
				for (let level = 0, l = mipmaps.length; level < l; level++) {
					gl.texImage2D(glTarget, level, glInternalFormat, glFormat, glType, mipmaps[level]);
				}
			} else {
				gl.texImage2D(glTarget, 0, glInternalFormat, glFormat, glType, image);
			}
		} else {
			if (uploadMipmaps) {
				const isCompressed = image.isCompressed;
				const mipmaps = texture.mipmaps;
				let mipmap;
				for (let level = 0, l = mipmaps.length; level < l; level++) {
					mipmap = mipmaps[level];
					if (isCompressed) {
						gl.compressedTexImage2D(glTarget, level, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data);
					} else {
						gl.texImage2D(glTarget, level, glInternalFormat, mipmap.width, mipmap.height, texture.border, glFormat, glType, mipmap.data);
					}
				}
			} else {
				gl.texImage2D(glTarget, 0, glInternalFormat, image.width, image.height, texture.border, glFormat, glType, image.data);
			}
		}
	}

	_uploadCubeImages(texture, textureProperties, uploadMipmaps) {
		const gl = this._gl;

		const glFormat = textureProperties.__glFormat,
			glType = textureProperties.__glType,
			glInternalFormat = textureProperties.__glInternalFormat;

		const images = texture.images;
		for (let face = 0; face < 6; face++) {
			const image = images[face];
			const glTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + face;
			if (domCheck(image)) {
				if (uploadMipmaps) {
					const mipmaps = texture.mipmaps;
					for (let level = 0, l = mipmaps.length; level < l; level++) {
						gl.texImage2D(glTarget, level, glInternalFormat, glFormat, glType, mipmaps[level][face]);
					}
				} else {
					gl.texImage2D(glTarget, 0, glInternalFormat, glFormat, glType, image);
				}
			} else {
				if (uploadMipmaps) {
					const isCompressed = image.isCompressed;
					const mipmaps = texture.mipmaps;
					let mipmap;
					for (let level = 0, l = mipmaps.length; level < l; level++) {
						mipmap = mipmaps[level][face];
						if (isCompressed) {
							gl.compressedTexImage2D(glTarget, level, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data);
						} else {
							gl.texImage2D(glTarget, level, glInternalFormat, mipmap.width, mipmap.height, texture.border, glFormat, glType, mipmap.data);
						}
					}
				} else {
					gl.texImage2D(glTarget, 0, glInternalFormat, image.width, image.height, texture.border, glFormat, glType, image.data);
				}
			}
		}
	}

	_upload3DImage(texture, textureProperties) {
		const gl = this._gl;

		const glTarget = textureProperties.__webglTarget,
			glFormat = textureProperties.__glFormat,
			glType = textureProperties.__glType,
			glInternalFormat = textureProperties.__glInternalFormat;

		const image = texture.image;

		gl.texImage3D(glTarget, 0, glInternalFormat, image.width, image.height, image.depth, texture.border, glFormat, glType, image.data);
	}

	_upload2DArrayImage(texture, textureProperties) {
		const gl = this._gl;

		const glTarget = textureProperties.__webglTarget,
			glFormat = textureProperties.__glFormat,
			glType = textureProperties.__glType,
			glInternalFormat = textureProperties.__glInternalFormat;

		const image = texture.image;

		if (texture.layerUpdates.size > 0) {
			for (const layerIndex of texture.layerUpdates) {
				const layerByteLength = getByteLength(image.width, image.height, texture.format, texture.type);
				const layerData = image.data.subarray(
					layerIndex * layerByteLength / image.data.BYTES_PER_ELEMENT,
					(layerIndex + 1) * layerByteLength / image.data.BYTES_PER_ELEMENT
				);
				gl.texSubImage3D(glTarget, 0, 0, 0, layerIndex, image.width, image.height, 1, glFormat, glType, layerData);
			}
			texture.layerUpdates.clear();
		} else {
			gl.texImage3D(glTarget, 0, glInternalFormat, image.width, image.height, image.depth, texture.border, glFormat, glType, image.data);
		}
	}

}

function textureNeedsPowerOfTwo(texture) {
	return (texture.wrapS !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.wrapT !== TEXTURE_WRAP.CLAMP_TO_EDGE) ||
		(texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR);
}

function filterFallback(filter) {
	if (filter === TEXTURE_FILTER.NEAREST || filter === TEXTURE_FILTER.NEAREST_MIPMAP_LINEAR || filter === TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST) {
		return TEXTURE_FILTER.NEAREST;
	}

	return TEXTURE_FILTER.LINEAR;
}

function _isPowerOfTwo(image) {
	return MathUtils.isPowerOfTwo(image.width) && MathUtils.isPowerOfTwo(image.height);
}

let _canvas;
function makePowerOf2(image) {
	if (_canvas === undefined) _canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

	_canvas.width = MathUtils.nearestPowerOfTwo(image.width);
	_canvas.height = MathUtils.nearestPowerOfTwo(image.height);

	const context = _canvas.getContext('2d');
	context.drawImage(image, 0, 0, _canvas.width, _canvas.height);

	console.warn('image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + _canvas.width + 'x' + _canvas.height, image);

	return _canvas;
}

function getGLInternalFormat(gl, capabilities, glFormat, glType) {
	const isWebGL2 = capabilities.version >= 2;

	if (isWebGL2 === false) return glFormat;

	let glInternalFormat = glFormat;

	if (glFormat === gl.RED) {
		if (glType === gl.FLOAT) glInternalFormat = gl.R32F;
		if (glType === gl.HALF_FLOAT) glInternalFormat = gl.R16F;
		if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.R8;
	}

	if (glFormat === gl.RG) {
		if (glType === gl.FLOAT) glInternalFormat = gl.RG32F;
		if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RG16F;
		if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RG8;
	}

	if (glFormat === gl.RGB) {
		if (glType === gl.FLOAT) glInternalFormat = gl.RGB32F;
		if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RGB16F;
		if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RGB8;
	}

	if (glFormat === gl.RGBA) {
		if (glType === gl.FLOAT) glInternalFormat = gl.RGBA32F;
		if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RGBA16F;
		if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RGBA8;
		if (glType === gl.UNSIGNED_SHORT_4_4_4_4) glInternalFormat = gl.RGBA4;
		if (glType === gl.UNSIGNED_SHORT_5_5_5_1) glInternalFormat = gl.RGB5_A1;
	}

	if (glFormat === gl.DEPTH_COMPONENT || glFormat === gl.DEPTH_STENCIL) {
		glInternalFormat = gl.DEPTH_COMPONENT16;
		if (glType === gl.FLOAT) glInternalFormat = gl.DEPTH_COMPONENT32F;
		if (glType === gl.UNSIGNED_INT) glInternalFormat = gl.DEPTH_COMPONENT24;
		if (glType === gl.UNSIGNED_INT_24_8) glInternalFormat = gl.DEPTH24_STENCIL8;
		if (glType === gl.FLOAT_32_UNSIGNED_INT_24_8_REV) glInternalFormat = gl.DEPTH32F_STENCIL8;
	}

	if (glInternalFormat === gl.R16F || glInternalFormat === gl.R32F ||
		glInternalFormat === gl.RG16F || glInternalFormat === gl.RG32F ||
		glInternalFormat === gl.RGB16F || glInternalFormat === gl.RGB32F ||
		glInternalFormat === gl.RGBA16F || glInternalFormat === gl.RGBA32F) {
		capabilities.getExtension('EXT_color_buffer_float');
	}

	return glInternalFormat;
}

function domCheck(image) {
	return (typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement)
		|| (typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement)
		|| (typeof HTMLVideoElement !== 'undefined' && image instanceof HTMLVideoElement)
		|| (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap);
}

function getByteLength(width, height, format, type) {
	const typeByteLength = getTextureTypeByteLength(type);

	switch (format) {
		// https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
		case PIXEL_FORMAT.ALPHA:
			return width * height;
		case PIXEL_FORMAT.LUMINANCE:
			return width * height;
		case PIXEL_FORMAT.LUMINANCE_ALPHA:
			return width * height * 2;
		case PIXEL_FORMAT.RED:
			return ((width * height) / typeByteLength.components) * typeByteLength.byteLength;
		case PIXEL_FORMAT.RED_INTEGER:
			return ((width * height) / typeByteLength.components) * typeByteLength.byteLength;
		case PIXEL_FORMAT.RG:
			return ((width * height * 2) / typeByteLength.components) * typeByteLength.byteLength;
		case PIXEL_FORMAT.RG_INTEGER:
			return ((width * height * 2) / typeByteLength.components) * typeByteLength.byteLength;
		case PIXEL_FORMAT.RGB:
			return ((width * height * 3) / typeByteLength.components) * typeByteLength.byteLength;
		case PIXEL_FORMAT.RGBA:
			return ((width * height * 4) / typeByteLength.components) * typeByteLength.byteLength;
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
		case PIXEL_TYPE.ByteType:
			_tempTypeByteLength.byteLength = 1;
			_tempTypeByteLength.components = 1;
			return _tempTypeByteLength;
		case PIXEL_TYPE.UNSIGNED_SHORT:
		case PIXEL_TYPE.SHORT:
		case PIXEL_TYPE.HALF_FLOAT:
			_tempTypeByteLength.byteLength = 2;
			_tempTypeByteLength.components = 1;
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

function getTextureTarget(gl, texture) {
	if (texture.isTexture2D) {
		return gl.TEXTURE_2D;
	} else if (texture.isTextureCube) {
		return gl.TEXTURE_CUBE_MAP;
	} else if (texture.isTexture3D) {
		return gl.TEXTURE_3D;
	} else if (texture.isTexture2DArray) {
		return gl.TEXTURE_2D_ARRAY;
	} else {
		return gl.TEXTURE_2D;
	}
}

export { WebGLTextures };