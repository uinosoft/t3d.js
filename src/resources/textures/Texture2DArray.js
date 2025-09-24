import { TextureBase } from './TextureBase.js';
import { TEXTURE_FILTER, PIXEL_FORMAT } from '../../const.js';

/**
 * Creates a 2d texture. (WebGL 2.0)
 * @extends TextureBase
 */
class Texture2DArray extends TextureBase {

	constructor() {
		super();

		/**
		 * Image data for this texture.
		 * @type {object}
		 * @default null
		 */
		this.image = { data: new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]), width: 2, height: 2, depth: 2 };

		/**
		 * @default PIXEL_FORMAT.RED
		 */
		this.format = PIXEL_FORMAT.RED;

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

		/**
		 * A set of all layers which need to be updated in the texture.
		 * @type {Set}
		 */
		this.layerUpdates = new Set();
	}

	/**
	 * Copy the given 2d texture into this texture.
	 * @param {Texture2DArray} source - The 2d texture to be copied.
	 * @returns {Texture2DArray}
	 */
	copy(source) {
		super.copy(source);

		this.image = source.image;

		return this;
	}

	/**
	 * @override
	 */
	resizeForRender(width, height, depth) {
		const resizeDepth = depth !== undefined;

		if (this.image && this.image.rtt) {
			if (
				this.image.width !== width
				|| this.image.height !== height
				|| (resizeDepth && this.image.depth !== depth)
			) {
				this.version++;
				this.image.width = width;
				this.image.height = height;
				if (resizeDepth) this.image.depth = depth;
			}
		} else {
			this.version++;
			const oldDepth = (this.image && this.image.depth) ? this.image.depth : 1;
			this.image = {
				rtt: true, data: null, width, height,
				depth: resizeDepth ? depth : oldDepth
			};
		}
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Texture2DArray.prototype.isTexture2DArray = true;

export { Texture2DArray };