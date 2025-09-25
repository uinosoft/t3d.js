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

	/**
	 * @override
	 */
	resizeAsAttachment(width, height) {
		let changed = false;

		for (let i = 0; i < 6; i++) {
			if (this.images[i] && this.images[i].rtt) {
				if (this.images[i].width !== width || this.images[i].height !== height) {
					this.images[i].width = width;
					this.images[i].height = height;
					changed = true;
				}
			} else {
				this.images[i] = { rtt: true, data: null, width, height };
				changed = true;
			}
		}

		if (changed) {
			this.version++;
		}
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