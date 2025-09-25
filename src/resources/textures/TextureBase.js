import { cloneJson } from '../../base.js';
import { PIXEL_FORMAT, PIXEL_TYPE, TEXTURE_FILTER, TEXTURE_WRAP, TEXEL_ENCODING_TYPE } from '../../const.js';
import { EventDispatcher } from '../../EventDispatcher.js';

let _textureId = 0;

/**
 * Create a texture to apply to a surface or as a reflection or refraction map.
 * @abstract
 * @extends EventDispatcher
 */
class TextureBase extends EventDispatcher {

	constructor() {
		super();

		/**
		 * Unique number for this texture instance.
		 * @readonly
		 * @type {number}
		 */
		this.id = _textureId++;

		/**
		 * An object that can be used to store custom data about the {@link TextureBase}.
		 * It should not hold references to functions as these will not be cloned.
		 * @type {object}
		 * @default {}
		 */
		this.userData = {};

		/**
		 * Array of user-specified mipmaps (optional).
		 * @type {HTMLImageElement[] | object[]}
		 * @default []
		 */
		this.mipmaps = [];

		/**
		 * WebGLTexture border.
		 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D WebGLTexture texImage2D()}.
		 * Must be zero.
		 * @type {number}
		 */
		this.border = 0;

		/**
		 * WebGLTexture texel data format.
		 * @type {PIXEL_FORMAT}
		 * @default PIXEL_FORMAT.RGBA
		 */
		this.format = PIXEL_FORMAT.RGBA;

		/**
		 * The default value is null, the texture's internal format will be obtained using a combination of .format and .type.
		 * Users can also specify a specific internalFormat.
		 * @type {null | PIXEL_FORMAT}
		 * @default null
		 */
		this.internalformat = null;

		/**
		 * WebGLTexture texel data type.
		 * @type {PIXEL_TYPE}
		 * @default PIXEL_TYPE.UNSIGNED_BYTE
		 */
		this.type = PIXEL_TYPE.UNSIGNED_BYTE;

		/**
		 * How the texture is sampled when a texel covers more than one pixel.
		 * @type {TEXTURE_FILTER}
		 * @default TEXTURE_FILTER.LINEAR
		 */
		this.magFilter = TEXTURE_FILTER.LINEAR;

		/**
		 * How the texture is sampled when a texel covers less than one pixel.
		 * @type {TEXTURE_FILTER}
		 * @default TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR
		 */
		this.minFilter = TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;

		/**
		 * This defines how the texture is wrapped horizontally and corresponds to U in UV mapping.
		 * @type {TEXTURE_WRAP}
		 * @default TEXTURE_WRAP.CLAMP_TO_EDGE
		 */
		this.wrapS = TEXTURE_WRAP.CLAMP_TO_EDGE;

		/**
		 * This defines how the texture is wrapped vertically and corresponds to V in UV mapping.
		 * @type {TEXTURE_WRAP}
		 * @default TEXTURE_WRAP.CLAMP_TO_EDGE
		 */
		this.wrapT = TEXTURE_WRAP.CLAMP_TO_EDGE;

		/**
		 * The number of samples taken along the axis through the pixel that has the highest density of texels.
		 * A higher value gives a less blurry result than a basic mipmap, at the cost of more texture samples being used.
		 * Use {@link WebGLcapabilities#maxAnisotropy} to find the maximum valid anisotropy value for the GPU; this value is usually a power of 2.
		 * @type {number}
		 * @default 1
		 */
		this.anisotropy = 1;

		/**
		 * Use for shadow sampler (WebGL 2.0 Only).
		 * @type {COMPARE_FUNC | undefined}
		 * @default undefined
		 */
		this.compare = undefined;

		/**
		 * Whether to generate mipmaps (if possible) for a texture.
		 * Set this to false if you are creating mipmaps manually.
		 * @type {boolean}
		 * @default true
		 */
		this.generateMipmaps = true;

		/**
		 * texture pixel encoding.
		 * @type {TEXEL_ENCODING_TYPE}
		 * @default TEXEL_ENCODING_TYPE.LINEAR
		 */
		this.encoding = TEXEL_ENCODING_TYPE.LINEAR;

		/**
		 * If set to true, the texture is flipped along the vertical axis when uploaded to the GPU.
		 * Default is true to flips the image's Y axis to match the WebGL texture coordinate space.
		 * Note that this property has no effect for ImageBitmap. You need to configure on bitmap creation instead.
		 * @type {boolean}
		 * @default true
		 */
		this.flipY = true;

		/**
		 * If set to true, the alpha channel, if present, is multiplied into the color channels when the texture is uploaded to the GPU.
		 * Note that this property has no effect for ImageBitmap. You need to configure on bitmap creation instead.
		 * @type {boolean}
		 * @default false
		 */
		this.premultiplyAlpha = false;

		/**
		 * Specifies the alignment requirements for the start of each pixel row in memory.
		 * The allowable values are 1 (byte-alignment), 2 (rows aligned to even-numbered bytes), 4 (word-alignment), and 8 (rows start on double-word boundaries).
		 * @type {number}
		 * @default 4
		 */
		this.unpackAlignment = 4;

		/**
		 * version code increse if texture changed.
		 * if version is still 0, this texture will be skiped.
		 * @type {number}
		 * @default 0
		 */
		this.version = 0;
	}

	/**
	 * Returns a clone of this texture.
	 * @returns {TextureBase}
	 */
	clone() {
		return new this.constructor().copy(this);
	}

	/**
	 * Copy the given texture into this texture.
	 * @param {TextureBase} source - The texture to be copied.
	 * @returns {TextureBase}
	 */
	copy(source) {
		this.userData = cloneJson(source.userData);

		this.mipmaps = source.mipmaps.slice(0);

		this.border = source.border;
		this.format = source.format;
		this.internalformat = source.internalformat;
		this.type = source.type;
		this.magFilter = source.magFilter;
		this.minFilter = source.minFilter;
		this.wrapS = source.wrapS;
		this.wrapT = source.wrapT;
		this.anisotropy = source.anisotropy;
		this.compare = source.compare;
		this.generateMipmaps = source.generateMipmaps;
		this.encoding = source.encoding;
		this.flipY = source.flipY;
		this.premultiplyAlpha = source.premultiplyAlpha;
		this.unpackAlignment = source.unpackAlignment;

		this.version = source.version;

		return this;
	}

	/**
	 * Dispatches a dispose event.
	 */
	dispose() {
		this.dispatchEvent({ type: 'dispose' });

		this.version = 0;
	}

	/**
	 * Resize the texture for use as a render target attachment.
	 * @param {number} width - The new width of the texture.
	 * @param {number} height - The new height of the texture.
	 * @param {number} [depth] - The new depth of the texture.
	 * Only {@link Texture3D} and {@link Texture2DArray} will use this parameter.
	 * If not specified, the depth will not be changed.
	 */
	resizeAsAttachment(width, height, depth) {}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
TextureBase.prototype.isTexture = true;

export { TextureBase };