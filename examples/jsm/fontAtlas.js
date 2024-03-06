import { CanvasAtlas } from '../libs/canvas-atlas.module.js';
import TinySDF from '../libs/Tiny-sdf.js';
const defaultOptions = {
	padding: 1,
	fontSize: 72,
	buffer: 9,
	radius: 24,
	cutoff: 0.25,
	fontFamily: 'sans-serif',
	fontWeight: 'normal',
	fontStyle: 'normal',
	width: 2048,
	height: 2048,
	packer: 'CellSearch',
	cellWidth: 256,
	cellHeight: 256
};
class FontAtlas {

	/**
    * Create a canvas atlas instance.
    * @param {object} [options] - The options object.
    * @param {number} [options.fontSize=72] - The font size.
    * @param {number} [options.padding=9] - The padding.
    * @param {number} [options.buffer=9] - The buffer.
    * @param {number} [options.radius=24] - The radius.
    * @param {number} [options.cutoff=0.25] - The cutoff.
    * @param {string} [options.fontFamily='sans-serif'] - The font family.
    * @param {string} [options.fontWeight='normal'] - The font weight.
    * @param {string} [options.fontStyle='normal'] - The font style.
    * @param {number} [options.width=2048] - The width of the atlas.
    * @param {number} [options.height=2048] - The height of the atlas.
    * @param {string} [options.packer="CellSearch"] - The packer to use. "CellSearch" or "BinaryTree".
    * @param {number} [options.cellWidth=256] - The width of the cells. Only used when packer is "CellSearch".
    * @param {number} [options.cellHeight=256] - The height of the cells. Only used when packer is "CellSearch".
   */
	constructor(options = {}) {
		this.options = Object.assign({}, defaultOptions, options);
		this.canvasAtlas = new CanvasAtlas(this.options);
		this.tinySDF = new TinySDF(this.options);
		this.fontMap = new Map();
		this.font = {
			common: {
				base: 64,
				scaleW: this.options.width,
				scaleH: this.options.height
			},
			info: {
				size: this.options.fontSize
			},
			chars: [
			]
		};
		this.sdfCanvas = document.createElement('canvas');
	}

	update(text) {
		for (let i = 0; i < text.length; i++) {
			if (!this.fontMap.has(text[i])) {
				this.pushSprite(text[i]);
			}
		}
		return { font: this.font, atlas: this.canvasAtlas.canvas };
	}

	pushSprite(char) {
		const imageData = this.tinySDF.draw(char);
		const sdfData = imageData.data;
		const UnitData = new Uint8ClampedArray((imageData.width) * (imageData.height) * 4);
		for (let i = 0; i < sdfData.length; i++) {
			UnitData[i * 4] = sdfData[i];
			UnitData[i * 4 + 1] = sdfData[i];
			UnitData[i * 4 + 2] = sdfData[i];
			UnitData[i * 4 + 3] = 255;
		}
		const Data = new ImageData(UnitData, imageData.width, imageData.height);
		this.sdfCanvas.width = imageData.width;
		this.sdfCanvas.height = imageData.height;
		const sdfCtx = this.sdfCanvas.getContext('2d');

		sdfCtx.putImageData(Data, 0, 0);
		const imageInfo = {
			width: imageData.width,
			height: imageData.height,
			image: this.sdfCanvas
		};

		const sprite = this.canvasAtlas.createSprite(imageInfo.image, {
			x: 0,
			y: 0,
			w: imageInfo.width,
			h: imageInfo.height
		}, 4);
		this.fontMap.set(char, sprite);
		this.font.chars.push({
			char: char,
			id: char.charCodeAt(0),
			x: sprite.region.x + this.options.buffer,
			y: sprite.region.y + this.options.buffer,
			width: sprite.region.w - this.options.buffer * 2,
			height: sprite.region.h - this.options.buffer * 2,
			xoffset: 0,
			yoffset: (this.options.fontSize - this.options.buffer * 2 - sprite.region.h),
			xadvance: sprite.region.w - this.options.buffer * 2
		});
	}

	dispose() {
		this.canvasAtlas.clear();
		this.fontMap = null;
		this.font.chars.length = 0;
	}

}
export { FontAtlas };