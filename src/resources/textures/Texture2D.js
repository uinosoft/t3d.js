import { TextureBase } from './TextureBase.js';

/**
 * Creates a 2d texture.
 * @memberof t3d
 * @extends t3d.TextureBase
 */
class Texture2D extends TextureBase {

	constructor() {
		super();

		/**
		 * Image data for this texture.
		 * @type {null|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|ImageBitmap|Object}
		 * @default null
		 */
		this.image = null;
	}

	/**
	 * Copy the given 2d texture into this texture.
	 * @param {t3d.Texture2D} source - The 2d texture to be copied.
	 * @return {t3d.Texture2D}
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
Texture2D.prototype.isTexture2D = true;

export { Texture2D };