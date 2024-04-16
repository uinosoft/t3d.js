import { DistanceTransform } from './math/DistanceTransform.js';

/**
 * DynamicFont uses the CharacterCanvas to obtain character pixels data and packages it into FontAtlas.
 * This class can be modified if more complete character management is required,
 * such as counting character references.
 */
class DynamicFont {

	/**
	 * Create a DynamicFont.
	 * @param {object} [options] - The options.
	 * @param {number} [options.fontSize=72] - The font size.
	 * @param {number} [options.width=1024] - The width of the atlas.
	 * @param {number} [options.height=1024] - The height of the atlas.
	 * @param {string} [options.fontFamily='sans-serif'] - The font family.
	 * @param {string} [options.fontWeight='normal'] - The font weight.
	 * @param {string} [options.fontStyle='normal'] - The font style.
	 * @param {boolean} [options.sdf=true] - Whether to use signed distance field.
	 */
	constructor({
		fontSize = 72,
		width = 2048,
		height = 2048,
		fontFamily = 'sans-serif',
		fontWeight = 'normal',
		fontStyle = 'normal',
		sdf = true
	} = {}) {
		this._charCanvas = new CharacterCanvas({
			fontSize,
			fontFamily, fontWeight, fontStyle,
			sdf
		});

		this._fontAtlas = new FontAtlas(width, height, this._charCanvas.size, sdf ? 'R2R' : 'RGBA2RGBA');

		this._font = {
			common: {
				scaleW: width,
				scaleH: height
			},
			info: {
				size: fontSize
			},
			chars: []
		};
	}

	/**
	 * Get the font data used by BitmapTextGeometry.
	 * @returns {object} - The font data.
	 */
	get fontData() {
		return this._font;
	}

	/**
	 * Get the atlas buffer.
	 * @returns {Uint8ClampedArray} - The atlas buffer.
	 */
	get atlasBuffer() {
		return this._fontAtlas.buffer;
	}

	/**
	 * Add characters to the atlas.
	 * @param {string} chars - The characters to add.
	 * @returns {boolean} - Returns true if new characters are added, otherwise returns false.
	 */
	addChars(chars) {
		let addFlag = false;

		for (let i = 0; i < chars.length; i++) {
			const char = chars[i];
			if (!this._fontAtlas.hasChar(char)) {
				if (this._addChar(char)) {
					addFlag = true;
				} else {
					console.warn(`DynamicFont: Failed to add char: ${char}, the atlas is full.`);
				}
			}
		}

		return addFlag;
	}

	/**
	 * Dispose the font data and atlas.
	 */
	dispose() {
		this._fontAtlas.clear();
		this._font.chars.length = 0;
	}

	_addChar(char) {
		const { _charCanvas, _fontAtlas, _font } = this;

		const { buffer, width, height, padding, glyphTop } = _charCanvas.draw(char);

		const successed = _fontAtlas.addChar(char, { buffer, width, height });

		if (!successed) {
			return false;
		}

		const { x, y, w, h } = _fontAtlas.getChar(char);

		const scaler = (char === 'j') ? 0.00001 : 1;

		_font.chars.push({
			char: char,
			id: char.charCodeAt(0),
			x: x + padding * scaler,
			y: y + padding * scaler,
			width: w - padding * 2 * scaler,
			height: h - padding * 2 * scaler,
			xoffset: 0,
			yoffset: -glyphTop,
			xadvance: w - padding * 2 * scaler // same as width
		});

		return true;
	}

}

/**
 * CharacterCanvas is used to draw a single character on a canvas,
 * and get the pixels data of the character.
 */
class CharacterCanvas {

	/**
	 * Create a CharacterCanvas.
	 * @param {object} [options] - The options of the CharacterCanvas.
	 * @param {number} [options.fontSize=72] - The font size.
	 * @param {string} [options.fontFamily='sans-serif'] - The font family.
	 * @param {string} [options.fontWeight='normal'] - The font weight.
	 * @param {string} [options.fontStyle='normal'] - The font style.
	 * @param {boolean} [options.sdf=true] - Whether to use signed distance field.
	 */
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
		ctx.fillStyle = sdf ? 'black' : 'white';

		this.dt = sdf ? new DistanceTransform(size * size, size) : null;

		this.size = size;
		this.padding = padding;
		this.distanceRadius = Math.floor(fontSize / 24 * 8);
		this.distanceCutoff = 0.25;
		this.ctx = ctx;
	}

	/**
	 * Draw a character on the canvas and get the pixels of the character.
	 * @param {string} char - The character to draw.
	 * @returns {object} - The pixel information of the character.
	 * @returns {Uint8ClampedArray} returns.buffer - The pixel information buffer of the character.
	 * @returns {number} returns.width - The width of the character pixel information.
	 * @returns {number} returns.height - The height of the character pixel information.
	 * @returns {number} returns.padding - The padding of the character pixel information.
	 * @returns {number} returns.glyphTop - The baseline to the top of the highest bounding box of the glyphs used to render the text.
	 */
	draw(char) {
		const { size, padding, distanceRadius, distanceCutoff, ctx, dt } = this;

		const {
			actualBoundingBoxAscent, // The distance from the baseline to the top of the highest bounding box of the glyphs used to render the text.
			actualBoundingBoxDescent, // The distance from the baseline to the bottom of the lowest bounding box of the glyphs used to render the text.
			actualBoundingBoxLeft, // The distance from the origin to the left of the leftmost glyph of the text.
			actualBoundingBoxRight // The distance from the origin to the right of the rightmost glyph of the text.
		} = ctx.measureText(char);

		// The integer/pixel part of the top alignment is encoded in metrics.glyphTop
		// The remainder is implicitly encoded in the rasterization
		let glyphTop = Math.ceil(actualBoundingBoxAscent);

		// If the glyph overflows the canvas size, it will be clipped at the bottom/right
		let glyphWidth = Math.max(0, Math.min(size - padding, Math.ceil(actualBoundingBoxRight - actualBoundingBoxLeft)));
		let glyphHeight = Math.min(size - padding, glyphTop + Math.ceil(actualBoundingBoxDescent));

		// handle space and tab
		if (glyphWidth === 0 || glyphHeight === 0) {
			glyphTop = 0;
			glyphWidth = Math.floor(size / 2 - padding * 2); // half font size
			glyphHeight = 0;
		}

		const width = Math.min(glyphWidth + 2 * padding, size);
		const height = Math.min(glyphHeight + 2 * padding, size);

		ctx.clearRect(0, 0, width, height);
		ctx.fillText(char, padding, padding + glyphTop);

		const imageData = ctx.getImageData(0, 0, width, height);

		let buffer;
		if (dt) {
			buffer = dt.transform(imageData, { radius: distanceRadius, cutoff: distanceCutoff });
		} else {
			buffer = new Uint8ClampedArray(imageData.data);
		}

		return { buffer, width, height, padding, glyphTop };
	}

}

/**
 * FontAtlas is responsible for caching all used character pixels data.
 */
class FontAtlas {

	/**
	 * Create a FontAtlas.
	 * @param {number} width - The width of the atlas.
	 * @param {number} height - The height of the atlas.
	 * @param {number} charSize - The size of each character.
	 * @param {string} [channel='R2R'] - The channel of the atlas. 'R2R', 'RGB2RGBA' or 'RGBA2RGBA'.
	 */
	constructor(width, height, charSize, channel = 'R2R') {
		this.width = width;
		this.height = height;

		this._charSize = charSize;

		this._maxCol = Math.floor(width / charSize);
		this._maxRow = Math.floor(height / charSize);
		this._indexManager = new IndexManager(this._maxCol * this._maxRow);

		this._fontMap = new Map();
		this._fontBuffer = new Uint8ClampedArray(width * height * (channel === 'R2R' ? 1 : 4));

		this._copyMethod = CopyMethods[channel];
		this._clearMethod = ClearMethods[channel];
	}

	/**
	 * Add a character to the atlas.
	 * @param {string} char - The character to add.
	 * @param {object} originCharData - The pixel information of the character.
	 * @param {Uint8ClampedArray|Uint8Array} originCharData.buffer - The pixel information buffer of the character.
	 * @param {number} originCharData.width - The width of the character pixel information.
	 * @param {number} originCharData.height - The height of the character pixel information.
	 * @returns {boolean} - Returns true if the character is added successfully, otherwise returns false.
	 */
	addChar(char, originCharData) {
		if (!this._indexManager.canAllocate()) {
			return false;
		}

		const { buffer, width, height } = originCharData;
		const writeIndex = this._indexManager.allocate();

		const charInfo = {
			i: writeIndex,
			x: (writeIndex % this._maxCol) * this._charSize,
			y: Math.floor(writeIndex / this._maxCol) * this._charSize,
			w: width,
			h: height
		};

		this._fontMap.set(char, charInfo);

		const copyMethod = this._copyMethod;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const targetIndex = (charInfo.x + x) + (charInfo.y + y) * this.width;
				const sourceIndex = x + y * width;
				copyMethod(buffer, this._fontBuffer, sourceIndex, targetIndex);
			}
		}

		return true;
	}

	/**
	 * Remove a character from the atlas.
	 * @param {string} char - The character to remove.
	 */
	removeChar(char) {
		if (!this._fontMap.has(char)) {
			return;
		}

		const charInfo = this._fontMap.get(char);
		this._indexManager.free(charInfo.i);
		this._fontMap.delete(char);

		const { x, y, w, h } = charInfo;
		const clearMethod = this._clearMethod;
		for (let j = y; j < y + h; j++) {
			for (let i = x; i < x + w; i++) {
				clearMethod(this._fontBuffer, i + j * this.width);
			}
		}
	}

	/**
	 * Clear all characters in the atlas.
	 * This method will clear all character information in the atlas.
	 * After calling this method, the atlas will be empty.
	 * You can add new characters to the atlas after calling this method.
	 */
	clear() {
		this._fontMap.clear();
		this._indexManager.reset(this._maxCol * this._maxRow);

		this._fontBuffer.fill(0);
	}

	/**
	 * Get the character information.
	 * @param {string} char - The character to get.
	 * @returns {object} - The character information.
	 * @returns {number} returns.i - The index of the character in the atlas.
	 * @returns {number} returns.x - The x position of the character in the atlas.
	 * @returns {number} returns.y - The y position of the character in the atlas.
	 * @returns {number} returns.w - The width of the character pixel information.
	 * @returns {number} returns.h - The height of the character pixel information.
	 */
	getChar(char) {
		return this._fontMap.get(char);
	}

	/**
	 * Check if the atlas has a character.
	 * @param {string} char - The character to check.
	 * @returns {boolean} - Returns true if the atlas has the character, otherwise returns false.
	 */
	hasChar(char) {
		return this._fontMap.has(char);
	}

	/**
	 * Get the buffer of the atlas.
	 * The buffer is a Uint8ClampedArray that contains the pixels data of the atlas.
	 * @returns {Uint8ClampedArray} - The buffer of the atlas.
	 */
	get buffer() {
		return this._fontBuffer;
	}

}

const CopyMethods = {
	'R2R': function(sourceBuffer, targetBuffer, sourceIndex, targetIndex) {
		targetBuffer[targetIndex] = sourceBuffer[sourceIndex];
	},
	'RGB2RGBA': function(sourceBuffer, targetBuffer, sourceIndex, targetIndex) {
		targetBuffer[targetIndex * 4] = sourceBuffer[sourceIndex * 3];
		targetBuffer[targetIndex * 4 + 1] = sourceBuffer[sourceIndex * 3 + 1];
		targetBuffer[targetIndex * 4 + 2] = sourceBuffer[sourceIndex * 3 + 2];
		targetBuffer[targetIndex * 4 + 3] = 255;
	},
	'RGBA2RGBA': function(sourceBuffer, targetBuffer, sourceIndex, targetIndex) {
		targetBuffer[targetIndex * 4] = sourceBuffer[sourceIndex * 4];
		targetBuffer[targetIndex * 4 + 1] = sourceBuffer[sourceIndex * 4 + 1];
		targetBuffer[targetIndex * 4 + 2] = sourceBuffer[sourceIndex * 4 + 2];
		targetBuffer[targetIndex * 4 + 3] = sourceBuffer[sourceIndex * 4 + 3];
	}
};

const ClearMethods = {
	'R2R': function(buffer, index) {
		buffer[index] = 0;
	},
	'RGB2RGBA': function(buffer, index) {
		buffer[index * 4] = 0;
		buffer[index * 4 + 1] = 0;
		buffer[index * 4 + 2] = 0;
		buffer[index * 4 + 3] = 0;
	},
	'RGBA2RGBA': function(buffer, index) {
		buffer[index * 4] = 0;
		buffer[index * 4 + 1] = 0;
		buffer[index * 4 + 2] = 0;
		buffer[index * 4 + 3] = 0;
	}
};

/**
 * A simple index manager that manages the allocation and release of indexes.
 */
class IndexManager {

	constructor(max) {
		this.availabel = [];
		this.reset(max);
	}

	canAllocate() {
		return this.availabel.length > 0;
	}

	allocate() {
		return this.availabel.pop();
	}

	free(index) {
		this.availabel.push(index);
	}

	reset(max) {
		this.availabel = Array.from({ length: max }, (_, i) => i).reverse();
	}

}

export { DynamicFont, CharacterCanvas, FontAtlas };