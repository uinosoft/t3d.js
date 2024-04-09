import { DistanceTransform } from './math/DistanceTransform.js';

/**
 * DynamicFont is used to create a dynamic font atlas.
 * TODO: font baseline measurement
 * TODO: multiple atlas support
 */
class DynamicFont {

	/**
	 * @param {object} [options] - The options object.
	 * @param {number} [options.fontSize=72] - The font size.
	 * @param {number} [options.width=1024] - The width of the atlas.
	 * @param {number} [options.height=1024] - The height of the atlas.
	 * @param {string} [options.fontFamily='sans-serif'] - The font family.
	 * @param {string} [options.fontWeight='normal'] - The font weight.
	 * @param {string} [options.fontStyle='normal'] - The font style.
	 */
	constructor({
		fontSize = 72,
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

		this.textAtlas = new TextAtlas(width, height);
		this._spriteMap = new Map();

		this._font = {
			common: {
				base: 64,
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

	get atlas() {
		return this.textAtlas.FontBuffer;
	}

	dispose() {
		this._spriteMap.clear();
		this._font.chars.length = 0;
	}

	_addChar(char) {
		const { _textCanvas, _spriteMap, _font } = this;

		const { width, height, padding, sdfRArray, glyphTop } = _textCanvas.drawChar(char);
		const sprite =	this.textAtlas.setFont({
			char: char,
			fontSize: _font.info.size,
			padding: _textCanvas.padding,
			buffer: sdfRArray,
			width,
			height
		}, 6);

		if (!sprite) {
			return false;
		}

		_spriteMap.set(char, sprite);

		const region = sprite.region;
		_font.chars.push({
			char: char,
			id: char.charCodeAt(0),
			x: region.x + padding,
			y: region.y + padding,
			width: region.w - padding * 2,
			height: region.h - padding * 2,
			xoffset: 0,
			yoffset: -glyphTop,
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
		this.ctx = ctx;
	}

	drawChar(char) {
		const { size, padding, distanceRadius, distanceCutoff, ctx, dt } = this;

		const {
			actualBoundingBoxAscent,
			actualBoundingBoxDescent,
			actualBoundingBoxLeft,
			actualBoundingBoxRight
		} = ctx.measureText(char);

		// The integer/pixel part of the top alignment is encoded in metrics.glyphTop
		// The remainder is implicitly encoded in the rasterization
		let glyphTop = Math.ceil(actualBoundingBoxAscent);

		// If the glyph overflows the canvas size, it will be clipped at the bottom/right
		let glyphWidth = Math.max(0, Math.min(size - padding, Math.ceil(actualBoundingBoxRight - actualBoundingBoxLeft)));
		let glyphHeight = Math.min(size - padding, glyphTop + Math.ceil(actualBoundingBoxDescent));

		// Handle space
		if (glyphWidth === 0 || glyphHeight === 0) {
			glyphWidth = Math.floor((size - padding) / 4);
			glyphHeight = size - 4 * padding;
			glyphTop = size;
		}

		const width = glyphWidth + 2 * padding;
		const height = glyphHeight + 2 * padding;

		ctx.clearRect(0, 0, width, height);
		ctx.fillText(char, padding, padding + glyphTop);

		const imageData = ctx.getImageData(0, 0, width, height);
		let sdfRArray;
		if (this.dt) {
			sdfRArray = dt.transform(imageData, { radius: distanceRadius, cutoff: distanceCutoff });
		} else {
			sdfRArray = convertRGBAToA(imageData.data, width, height);
		}


		return { width, height, padding, sdfRArray, glyphTop };
	}

}
function convertRGBAToA(data, width, height) {
	const result = new Uint8ClampedArray(width * height);
	for (let i = 0; i < data.length; i += 4) {
		result[i / 4 + 3] = data[i + 3];
	}
	return result;
}


class TextAtlas {

	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.fontMap = new Map();
		this.FontBuffer = new Uint8ClampedArray(width * height);
		this.region = {
			x: 0, y: 0, w: 0, h: 0
		};
	}

	get font() {
		return this._font;
	}

	setFont(options, padding = 4) {
		this.region.w = options.width;
		this.region.h = options.height;
		this.fontMap.set(options.char, {
			x: this.region.x,
			y: this.region.y,
			w: this.region.w + padding,
			h: this.region.h + padding
		});
		for (let i = this.region.x; i < this.region.x + this.region.w; i++) {
			for (let j = this.region.y; j < this.region.y + this.region.h; j++) {
				const index = (j * this.width + i);
				const bufferIndex = ((j - this.region.y) * this.region.w + (i - this.region.x));
				this.FontBuffer[index] = options.buffer[bufferIndex];
			}
		}
		this.region.x += options.fontSize + options.padding * 4;
		if (this.region.x > this.width - options.fontSize - options.padding * 4) {
			this.region.x = 0;
			this.region.y += options.fontSize + options.padding * 4;
		}
		return { region: this.fontMap.get(options.char) };
	}

}

export { DynamicFont };