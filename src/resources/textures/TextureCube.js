import { TextureBase } from './TextureBase.js';

/**
 * Creates a cube texture.
 * @memberof t3d
 * @extends t3d.TextureBase
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
	 * @param {t3d.TextureCube} source - The cube texture to be copied.
	 * @return {t3d.TextureCube}
	 */
	copy(source) {
		super.copy(source);

		this.images = source.images.slice(0);

		return this;
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
TextureCube.prototype.isTextureCube = true;

export { TextureCube };