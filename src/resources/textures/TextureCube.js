import { TextureBase } from './TextureBase.js';

/**
 * Creates a cube texture.
 * @extends TextureBase
 */
class TextureCube extends TextureBase {

	constructor() {
		super();

		/**
		 * Images data for this texture.
		 * @type {HTMLImageElement[]}
		 * @default []
		 */
		this.images = [];

		/**
		 * @default false
		 */
		this.flipY = false;
	}

	/**
	 * Copy the given cube texture into this texture.
	 * @param {TextureCube} source - The cube texture to be copied.
	 * @returns {TextureCube}
	 */
	copy(source) {
		super.copy(source);

		this.images = source.images.slice(0);

		return this;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
TextureCube.prototype.isTextureCube = true;

export { TextureCube };