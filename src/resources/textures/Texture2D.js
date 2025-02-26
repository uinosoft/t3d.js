import { TextureBase } from './TextureBase.js';

/**
 * Creates a 2d texture.
 * @extends TextureBase
 */
class Texture2D extends TextureBase {

	constructor() {
		super();

		/**
		 * Image data for this texture.
		 * @type {null | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | object}
		 * @default null
		 */
		this.image = null;
	}

	/**
	 * Copy the given 2d texture into this texture.
	 * @param {Texture2D} source - The 2d texture to be copied.
	 * @returns {Texture2D}
	 */
	copy(source) {
		super.copy(source);

		this.image = source.image;

		return this;
	}

}

/**
 * @readonly
 * @type {boolean}
 * @default true
 */
Texture2D.prototype.isTexture2D = true;

export { Texture2D };