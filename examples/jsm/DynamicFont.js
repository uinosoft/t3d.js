import { DistanceTransform } from './math/DistanceTransform.js';

/**
 * DynamicFont is used to create a dynamic font atlas.
 * TODO: use data atlas instead of canvas atlas
 * TODO: font baseline measurement
 * TODO: remove convertRToRGBA
 * TODO: multiple atlas support
 */
class DynamicFont {

	/**
	 * @param {object} [options] - The options object.
	 * @param {number} [options.fontSize=72] - The font size.
	 * @param {number} [options.baseline=64] - The font baseline.
	 * @param {number} [options.width=1024] - The width of the atlas.
	 * @param {number} [options.height=1024] - The height of the atlas.
	 * @param {string} [options.fontFamily='sans-serif'] - The font family.
	 * @param {string} [options.fontWeight='normal'] - The font weight.
	 * @param {string} [options.fontStyle='normal'] - The font style.
	 */
	constructor({
		fontSize = 72,
		baseline = 64,
		width = 1024,
		height = 1024,
		fontFamily = 'sans-serif',
		fontWeight = 'normal',
		fontStyle = 'normal',
		sdf = true
	} = {}) {
		this._textCanvas = new TextCanvas({
			fontSize,
			fontFamily, fontWeight, fontStyle,
			sdf
		});

		this._canvasAtlas = null;
		this._spriteMap = new Map();

		this._font = {
			common: {
				base: baseline,
				scaleW: width,
				scaleH: height
			},
			info: {
				size: fontSize
			},
			chars: []
		};
	}

	get font() {
		return this._font;
	}

	get atlas() {
		return this._canvasAtlas.canvas;
	}

	setCanvasAtlas(canvasAtlas) {
		this._canvasAtlas = canvasAtlas;
	}

	addChars(chars) {
		let addFlag = false;

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i];
			if (!this._spriteMap.has(char)) {
				this._addChar(char);
				addFlag = true;
			}
		}

		return addFlag;
	}

	dispose() {
		this._canvasAtlas.clear();
		this._spriteMap.clear();
		this._font.chars.length = 0;
	}

	_addChar(char) {
		const { _textCanvas, _canvasAtlas, _spriteMap, _font } = this;

		const { canvas, width, height, padding } = _textCanvas.drawChar(char);

		const sprite = _canvasAtlas.createSprite(canvas, {
			x: 0,
			y: 0,
			w: width,
			h: height
		}, 4);

		if (!sprite) {
			return false;
		}

		_spriteMap.set(char, sprite);

		const region = sprite.region;
		const fontSize = _font.info.size;
		_font.chars.push({
			char: char,
			id: char.charCodeAt(0),
			x: region.x + padding,
			y: region.y + padding,
			width: region.w - padding * 2,
			height: region.h - padding * 2,
			xoffset: 0,
			yoffset: (fontSize - padding * 2 - region.h),
			xadvance: region.w - padding * 2
		});

		return true;
	}

}

class TextCanvas {

	constructor({
		fontSize = 72,
		fontFamily = 'sans-serif',
		fontWeight = 'normal',
		fontStyle = 'normal',
		sdf = true
	} = {}) {
		// make the canvas size big enough to both have the specified buffer around the glyph
		// for "halo", and account for some glyphs possibly being larger than their font size
		const padding = Math.floor(fontSize / 24 * 3);
		const size = fontSize + padding * 4;

		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = size;

		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
		ctx.textBaseline = 'alphabetic';
		ctx.textAlign = 'left'; // Necessary so that RTL text doesn't have different alignment
		ctx.fillStyle = 'black';

		this.dt = sdf ? new DistanceTransform(size * size, size) : null;

		this.size = size;
		this.padding = padding;
		this.distanceRadius = Math.floor(fontSize / 24 * 8);
		this.distanceCutoff = 0.25;
		this.canvas = canvas;
		this.ctx = ctx;
	}

	drawChar(char) {
		const { size, padding, distanceRadius, distanceCutoff, canvas, ctx, dt } = this;

		const {
			actualBoundingBoxAscent,
			actualBoundingBoxDescent,
			actualBoundingBoxLeft,
			actualBoundingBoxRight
		} = ctx.measureText(char);

		// The integer/pixel part of the top alignment is encoded in metrics.glyphTop
		// The remainder is implicitly encoded in the rasterization
		const glyphTop = Math.ceil(actualBoundingBoxAscent);

		// If the glyph overflows the canvas size, it will be clipped at the bottom/right
		let glyphWidth = Math.max(0, Math.min(size - padding, Math.ceil(actualBoundingBoxRight - actualBoundingBoxLeft)));
		let glyphHeight = Math.min(size - padding, glyphTop + Math.ceil(actualBoundingBoxDescent));

		// Handle space
		if (glyphWidth === 0 || glyphHeight === 0) {
			glyphWidth = Math.floor((size - padding) / 4);
			glyphHeight = size - 4 * padding;
		}

		const width = glyphWidth + 2 * padding;
		const height = glyphHeight + 2 * padding;

		ctx.clearRect(0, 0, width, height);
		ctx.fillText(char, padding, padding + glyphTop);

		if (dt) {
			const imageData = ctx.getImageData(0, 0, width, height);
			const sdfRArray = dt.transform(imageData, { radius: distanceRadius, cutoff: distanceCutoff });
			const sdfRGBAArray = convertRToRGBA(sdfRArray, width, height);
			ctx.putImageData(new ImageData(sdfRGBAArray, width, height), 0, 0);
		}

		return { canvas, width, height, padding };
	}

}

function convertRToRGBA(data, width, height) {
	const result = new Uint8ClampedArray(width * height * 4);
	for (let i = 0; i < data.length; i++) {
		result[i * 4] = data[i];
		result[i * 4 + 1] = data[i];
		result[i * 4 + 2] = data[i];
		result[i * 4 + 3] = 255;
	}
	return result;
}

export { DynamicFont };