import { TextureBase } from './TextureBase.js';
import { PIXEL_FORMAT, PIXEL_TYPE, TEXTURE_WRAP, TEXTURE_FILTER } from '../../const.js';

/**
 * Creates a 3D texture. (WebGL 2.0)
 * @extends TextureBase
 */
class Texture3D extends TextureBase {

	constructor() {
		super();

		/**
		 * Image data for this texture.
		 * @type {object}
		 */
		this.image = { data: new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]), width: 2, height: 2, depth: 2 };

		/**
		 * This defines how the texture is wrapped in the depth direction.
		 * @type {TEXTURE_WRAP}
		 * @default TEXTURE_WRAP.CLAMP_TO_EDGE
		 */
		this.wrapR = TEXTURE_WRAP.CLAMP_TO_EDGE;

		/**
		 * @default PIXEL_FORMAT.RED
		 */
		this.format = PIXEL_FORMAT.RED;

		/**
		 * @default PIXEL_TYPE.UNSIGNED_BYTE
		 */
		this.type = PIXEL_TYPE.UNSIGNED_BYTE;

		/**
		 * @default TEXTURE_FILTER.NEAREST
		 */
		this.magFilter = TEXTURE_FILTER.NEAREST;

		/**
		 * @default TEXTURE_FILTER.NEAREST
		 */
		this.minFilter = TEXTURE_FILTER.NEAREST;

		/**
		 * @default false
		 */
		this.generateMipmaps = false;

		/**
		 * @default false
		 */
		this.flipY = false;

		/**
		 * @default 1
		 */
		this.unpackAlignment = 1;
	}

	/**
	 * Copy the given 3d texture into this texture.
	 * @param {Texture3D} source - The 3d texture to be copied.
	 * @returns {Texture3D}
	 */
	copy(source) {
		super.copy(source);

		this.image = source.image;

		return this;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Texture3D.prototype.isTexture3D = true;

export { Texture3D };