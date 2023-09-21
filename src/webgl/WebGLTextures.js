import { TEXTURE_FILTER, TEXTURE_WRAP } from '../const.js';
import { isPowerOfTwo, nearestPowerOfTwo } from '../base.js';
import { PropertyMap } from '../render/PropertyMap.js';

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

	setTexture2D(texture, slot) {
		const gl = this._gl;
		const state = this._state;
		const capabilities = this._capabilities;
		const constants = this._constants;

		if (slot !== undefined) {
			slot = gl.TEXTURE0 + slot;
		}

		const textureProperties = this.get(texture);

		if (texture.image && textureProperties.__version !== texture.version && (!texture.image.rtt || slot === undefined) && !textureProperties.__external) {
			if (textureProperties.__webglTexture === undefined) {
				texture.addEventListener('dispose', this._onTextureDispose);
				textureProperties.__webglTexture = gl.createTexture();
			}

			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_2D, textureProperties.__webglTexture);

			let image = texture.image;
			const isDom = domCheck(image);

			if (isDom) {
				image = clampToMaxSize(image, capabilities.maxTextureSize);

				if (textureNeedsPowerOfTwo(texture) && _isPowerOfTwo(image) === false && capabilities.version < 2) {
					image = makePowerOf2(image);
				}
			}

			const needFallback = !_isPowerOfTwo(image) && capabilities.version < 2;

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
			gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
			this._setTextureParameters(texture, needFallback);

			const glFormat = constants.getGLFormat(texture.format),
				glType = constants.getGLType(texture.type),
				glInternalFormat = (texture.internalformat !== null) ? constants.getGLInternalFormat(texture.internalformat) :
					getGLInternalFormat(gl, capabilities, glFormat, glType);

			const mipmaps = texture.mipmaps;
			let mipmap;

			if (isDom) {
				if (mipmaps.length > 0 && !needFallback) {
					for (let i = 0, il = mipmaps.length; i < il; i++) {
						mipmap = mipmaps[i];
						gl.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, mipmap);
					}

					texture.generateMipmaps = false;
					textureProperties.__maxMipLevel = mipmaps.length - 1;
				} else {
					gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image);
					textureProperties.__maxMipLevel = 0;
				}
			} else {
				if (mipmaps.length > 0 && !needFallback) {
					const isCompressed = image.isCompressed;

					for (let i = 0, il = mipmaps.length; i < il; i++) {
						mipmap = mipmaps[i];
						isCompressed ? gl.compressedTexImage2D(gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data)
							: gl.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, texture.border, glFormat, glType, mipmap.data);
					}

					texture.generateMipmaps = false;
					textureProperties.__maxMipLevel = mipmaps.length - 1;
				} else {
					gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, texture.border, glFormat, glType, image.data);
					textureProperties.__maxMipLevel = 0;
				}
			}

			if (texture.generateMipmaps && !needFallback) {
				this._generateMipmap(gl.TEXTURE_2D, texture, image.width, image.height);
			}

			textureProperties.__version = texture.version;

			return textureProperties;
		}

		state.activeTexture(slot);
		state.bindTexture(gl.TEXTURE_2D, textureProperties.__webglTexture);

		return textureProperties;
	}

	setTextureCube(texture, slot) {
		const gl = this._gl;
		const state = this._state;
		const capabilities = this._capabilities;
		const constants = this._constants;

		if (slot !== undefined) {
			slot = gl.TEXTURE0 + slot;
		}

		const textureProperties = this.get(texture);

		if (texture.images.length === 6 && textureProperties.__version !== texture.version && (!texture.images[0].rtt || slot === undefined) && !textureProperties.__external) {
			if (textureProperties.__webglTexture === undefined) {
				texture.addEventListener('dispose', this._onTextureDispose);
				textureProperties.__webglTexture = gl.createTexture();
			}

			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);

			const images = [];
			let needFallback = false;

			for (let i = 0; i < 6; i++) {
				let image = texture.images[i];
				const isDom = domCheck(image);

				if (isDom) {
					image = clampToMaxSize(image, capabilities.maxTextureSize);

					if (textureNeedsPowerOfTwo(texture) && _isPowerOfTwo(image) === false && capabilities.version < 2) {
						image = makePowerOf2(image);
					}
				}

				if (!_isPowerOfTwo(image) && capabilities.version < 2) {
					needFallback = true;
				}

				images[i] = image;
				image.__isDom = isDom;
			}

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
			gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
			this._setTextureParameters(texture, needFallback);

			const glFormat = constants.getGLFormat(texture.format),
				glType = constants.getGLType(texture.type),
				glInternalFormat = (texture.internalformat !== null) ? constants.getGLInternalFormat(texture.internalformat) :
					getGLInternalFormat(gl, capabilities, glFormat, glType);

			const mipmaps = texture.mipmaps;
			let mipmap;

			for (let i = 0; i < 6; i++) {
				const image = images[i];
				const isDom = image.__isDom;

				if (isDom) {
					if (mipmaps.length > 0 && !needFallback) {
						for (let j = 0, jl = mipmaps.length; j < jl; j++) {
							mipmap = mipmaps[j][i];
							gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, glFormat, glType, mipmap);
						}

						textureProperties.__maxMipLevel = mipmaps.length - 1;
						texture.generateMipmaps = false;
					} else {
						gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, glFormat, glType, image);
						textureProperties.__maxMipLevel = 0;
					}
				} else {
					if (mipmaps.length > 0 && !needFallback) {
						const isCompressed = image.isCompressed;

						for (let j = 0, jl = mipmaps.length; j < jl; j++) {
							mipmap = mipmaps[j][i];

							isCompressed ? gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data)
								: gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, texture.border, glFormat, glType, mipmap.data);
						}

						textureProperties.__maxMipLevel = mipmaps.length - 1;
						texture.generateMipmaps = false;
					} else {
						gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, image.width, image.height, texture.border, glFormat, glType, image.data);
						textureProperties.__maxMipLevel = 0;
					}
				}
			}

			if (texture.generateMipmaps && !needFallback) {
				this._generateMipmap(gl.TEXTURE_CUBE_MAP, texture, images[0].width, images[0].height);
			}

			textureProperties.__version = texture.version;

			return textureProperties;
		}

		state.activeTexture(slot);
		state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);

		return textureProperties;
	}

	setTexture3D(texture, slot) {
		const gl = this._gl;
		const state = this._state;
		const capabilities = this._capabilities;
		const constants = this._constants;

		if (capabilities.version < 2) {
			console.warn('Try to use Texture3D but browser not support WebGL2.0');
			return;
		}

		if (slot !== undefined) {
			slot = gl.TEXTURE0 + slot;
		}

		const textureProperties = this.get(texture);

		if (texture.image && textureProperties.__version !== texture.version && !textureProperties.__external) {
			if (textureProperties.__webglTexture === undefined) {
				texture.addEventListener('dispose', this._onTextureDispose);
				textureProperties.__webglTexture = gl.createTexture();
			}

			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_3D, textureProperties.__webglTexture);

			const image = texture.image;

			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
			gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
			this._setTextureParameters(texture, false);

			const glFormat = constants.getGLFormat(texture.format),
				glType = constants.getGLType(texture.type),
				glInternalFormat = (texture.internalformat !== null) ? constants.getGLInternalFormat(texture.internalformat) :
					getGLInternalFormat(gl, capabilities, glFormat, glType);

			gl.texImage3D(gl.TEXTURE_3D, 0, glInternalFormat, image.width, image.height, image.depth, texture.border, glFormat, glType, image.data);

			if (texture.generateMipmaps) {
				this._generateMipmap(gl.TEXTURE_3D, texture, image.width, image.height);
			}

			textureProperties.__version = texture.version;

			return textureProperties;
		}

		state.activeTexture(slot);
		state.bindTexture(gl.TEXTURE_3D, textureProperties.__webglTexture);

		return textureProperties;
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

	_setTextureParameters(texture, needFallback) {
		const gl = this._gl;
		const capabilities = this._capabilities;

		const wrappingToGL = this._wrappingToGL;
		const filterToGL = this._filterToGL;

		let textureType = gl.TEXTURE_2D;
		if (texture.isTextureCube) textureType = gl.TEXTURE_CUBE_MAP;
		if (texture.isTexture3D) textureType = gl.TEXTURE_3D;

		const parameters = getTextureParameters(texture, needFallback);

		gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, wrappingToGL[parameters[0]]);
		gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, wrappingToGL[parameters[1]]);

		if (texture.isTexture3D) {
			gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, wrappingToGL[parameters[2]]);
		}

		gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, filterToGL[parameters[3]]);
		gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, filterToGL[parameters[4]]);

		// anisotropy if EXT_texture_filter_anisotropic exist
		const extension = capabilities.anisotropyExt;
		if (extension) {
			gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(parameters[5], capabilities.maxAnisotropy));
		}

		if (capabilities.version >= 2) {
			if (parameters[6] !== undefined) {
				gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
				gl.texParameteri(textureType, gl.TEXTURE_COMPARE_FUNC, parameters[6]);
			} else {
				gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.NONE);
			}
		}
	}

	_generateMipmap(target, texture, width, height) {
		const gl = this._gl;

		gl.generateMipmap(target);

		const textureProperties = this.get(texture);
		// Note: Math.log( x ) * Math.LOG2E used instead of Math.log2( x ) which is not supported by IE11
		textureProperties.__maxMipLevel = Math.log(Math.max(width, height)) * Math.LOG2E;
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
	return isPowerOfTwo(image.width) && isPowerOfTwo(image.height);
}

function makePowerOf2(image) {
	if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
		const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		canvas.width = nearestPowerOfTwo(image.width);
		canvas.height = nearestPowerOfTwo(image.height);

		const context = canvas.getContext('2d');
		context.drawImage(image, 0, 0, canvas.width, canvas.height);

		console.warn('image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);

		return canvas;
	}

	return image;
}

function clampToMaxSize(image, maxSize) {
	if (image.width > maxSize || image.height > maxSize) {
		// console.warn('image is too big (' + image.width + 'x' + image.height + '). max size is ' + maxSize + 'x' + maxSize, image);
		// return image;

		// Warning: Scaling through the canvas will only work with images that use
		// premultiplied alpha.

		const scale = maxSize / Math.max(image.width, image.height);

		const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		canvas.width = Math.floor(image.width * scale);
		canvas.height = Math.floor(image.height * scale);

		const context = canvas.getContext('2d');
		context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

		console.warn('image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);

		return canvas;
	}

	return image;
}

function getTextureParameters(texture, needFallback) {
	let wrapS = texture.wrapS,
		wrapT = texture.wrapT,
		wrapR = texture.wrapR,
		magFilter = texture.magFilter,
		minFilter = texture.minFilter;

	const anisotropy = texture.anisotropy,
		compare = texture.compare;

	// fix for non power of 2 image in WebGL 1.0
	if (needFallback) {
		wrapS = TEXTURE_WRAP.CLAMP_TO_EDGE;
		wrapT = TEXTURE_WRAP.CLAMP_TO_EDGE;

		if (texture.isTexture3D) {
			wrapR = TEXTURE_WRAP.CLAMP_TO_EDGE;
		}

		if (texture.wrapS !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.wrapT !== TEXTURE_WRAP.CLAMP_TO_EDGE) {
			console.warn('Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to t3d.TEXTURE_WRAP.CLAMP_TO_EDGE.', texture);
		}

		magFilter = filterFallback(texture.magFilter);
		minFilter = filterFallback(texture.minFilter);

		if (
			(texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR) ||
            (texture.magFilter !== TEXTURE_FILTER.NEAREST && texture.magFilter !== TEXTURE_FILTER.LINEAR)
		) {
			console.warn('Texture is not power of two. Texture.minFilter and Texture.magFilter should be set to t3d.TEXTURE_FILTER.NEAREST or t3d.TEXTURE_FILTER.LINEAR.', texture);
		}
	}

	return [wrapS, wrapT, wrapR, magFilter, minFilter, anisotropy, compare];
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

export { WebGLTextures };