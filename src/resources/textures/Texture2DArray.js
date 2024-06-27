import { TextureBase } from './TextureBase.js';
import { TEXTURE_FILTER, PIXEL_FORMAT } from '../../const.js';

/**
 * Creates a 2d texture. (WebGL 2.0)
 * @memberof t3d
 * @extends t3d.TextureBase
 */
class Texture2DArray extends TextureBase {

	constructor() {
		super();

		/**
		 * Image data for this texture.
		 * @type {Object}
		 * @default null
		 */
		this.image = { data: new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]), width: 2, height: 2, depth: 2 };

		/**
		 * @default t3d.PIXEL_FORMAT.RED
		 */
		this.format = PIXEL_FORMAT.RED;

		/**
		 * @default t3d.TEXTURE_FILTER.NEAREST
		 */
		this.magFilter = TEXTURE_FILTER.NEAREST;

		/**
		 * @default t3d.TEXTURE_FILTER.NEAREST
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

		/**
		 * A set of all layers which need to be updated in the texture.
		 * @type {Set}
		 */
		this.layerUpdates = new Set();
	}

	/**
	 * Copy the given 2d texture into this texture.
	 * @param {t3d.Texture2DArray} source - The 2d texture to be copied.
	 * @return {t3d.Texture2DArray}
	 */
	copy(source) {
		super.copy(source);

		this.image = source.image;

		return this;
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
Texture2DArray.prototype.isTexture2DArray = true;

export { Texture2DArray };