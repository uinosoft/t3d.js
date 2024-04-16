import { Geometry, Buffer, Attribute } from 't3d';

/**
 * BitmapTextGeometry - generates a geometry for a bitmap text
 * reference: https://github.com/leochocolat/three-msdf-text-utils/blob/main/src/MSDFTextGeometry/index.js
 */
class BitmapTextGeometry extends Geometry {

	/**
	 * @param {Object|String} options - the options or text string to render
	 * @param {String} options.text - the text to layout. Newline characters (\n) will cause line breaks
	 * @param {Object} options.font - the BMFont definition which holds chars, kernings, etc
	 * @param {Number} [options.width=] - the desired width of the text box, causes word-wrapping and clipping in "pre" mode. Leave as undefined to remove
	 * @param {String} [options.mode=] - a mode for word-wrapper; can be 'pre' (maintain spacing), or 'nowrap' (collapse whitespace but only break on newline characters), otherwise assumes normal word-wrap behaviour (collapse whitespace, break at width or newlines)
	 * @param {String} [options.align='left'] - can be "left", "center" or "right"
	 * @param {Number} [options.letterSpacing=0] - the letter spacing in pixels
	 * @param {Number} [options.tabSize=4] - the number of spaces to use in a single tab
	 * @param {Number} [options.baseline=font.common.base] - the baseline height in pixels
	 * @param {Number} [options.lineHeight=font.common.lineHeight] - the line height in pixels
	 * @param {Boolean} [options.flipY=true] - whether the texture will be Y-flipped (default true)
	 */
	constructor(options) {
		super();

		// Set text as object property
		if (typeof options === 'string') options = { text: options };

		// use these as default values for any subsequent
		// calls to update()
		this._options = Object.assign({}, options);

		this._layout = null;
		this._visibleGlyphs = [];

		this.update(this._options);
	}

	get layout() {
		return this._layout;
	}

	get visibleGlyphs() {
		return this._visibleGlyphs;
	}

	update(options) {
		this.dispose();

		options = this._validateOptions(options);

		if (!options) return;

		this._layout = new TextLayout(options);

		// get vec2 texcoords
		const flipY = options.flipY !== false;

		// the desired BMFont data
		const font = options.font;

		// determine texture size from font file
		const texWidth = font.common.scaleW;
		const texHeight = font.common.scaleH;

		// get visible glyphs
		const glyphs = this._layout.glyphs.filter(glyph => {
			const bitmap = glyph.data;
			return bitmap.width * bitmap.height > 0;
		});

		// provide visible glyphs for convenience
		this._visibleGlyphs = glyphs;

		// get vertex data
		const attributes1 = attributes(glyphs, texWidth, texHeight, flipY, this._layout);
		const numIndices = glyphs.length * 6;
		const indices = new Array(numIndices);
		for (let i = 0, j = 0; i < numIndices; i += 6, j += 4) {
			indices[i + 0] = j + 0;
			indices[i + 1] = j + 1;
			indices[i + 2] = j + 2;
			indices[i + 3] = j + 0;
			indices[i + 4] = j + 2;
			indices[i + 5] = j + 3;
		}

		// set vertex data
		this.addAttribute('a_Position', new Attribute(new Buffer(attributes1.positions, 3)));
		this.addAttribute('a_Uv', new Attribute(new Buffer(attributes1.uvs, 2)));
		this.setIndex(indices);

		this.computeBoundingBox();
		this.computeBoundingSphere();
	}

	_validateOptions(options) {
		// Set text as object property
		if (typeof options === 'string') options = { text: options };

		// Use constructor defaults
		options = Object.assign({}, this._options, options);

		// Check for font property
		if (!options.font) throw new TypeError('must specify a { font } in options');

		return options;
	}

}

function attributes(glyphs, texWidth, texHeight, flipY, layout) {
	const uvs = new Float32Array(glyphs.length * 4 * 2);
	const layoutUvs = new Float32Array(glyphs.length * 4 * 2);
	const positions = new Float32Array(glyphs.length * 4 * 3);
	const centers = new Float32Array(glyphs.length * 4 * 2);

	let i = 0;
	let j = 0;
	let k = 0;
	let l = 0;

	glyphs.forEach(function(glyph) {
		const bitmap = glyph.data;

		// UV
		const bw = (bitmap.x + bitmap.width);
		const bh = (bitmap.y + bitmap.height);

		// top left position
		const u0 = bitmap.x / texWidth;
		let v1 = bitmap.y / texHeight;
		const u1 = bw / texWidth;
		let v0 = bh / texHeight;

		if (flipY) {
			v1 = (texHeight - bitmap.y) / texHeight;
			v0 = (texHeight - bh) / texHeight;
		}

		// BL
		uvs[i++] = u0;
		uvs[i++] = v1;
		// TL
		uvs[i++] = u0;
		uvs[i++] = v0;
		// TR
		uvs[i++] = u1;
		uvs[i++] = v0;
		// BR
		uvs[i++] = u1;
		uvs[i++] = v1;

		// Layout UV: Text block UVS

		// BL
		layoutUvs[l++] = glyph.position[0] / layout.width;
		layoutUvs[l++] = (glyph.position[1] + layout.height) / layout.height;

		// TL
		layoutUvs[l++] = glyph.position[0] / layout.width;
		layoutUvs[l++] = (glyph.position[1] + layout.height + bitmap.height) / layout.height;
		// TR
		layoutUvs[l++] = (glyph.position[0] + bitmap.width) / layout.width;
		layoutUvs[l++] = (glyph.position[1] + layout.height + bitmap.height) / layout.height;
		// BR
		layoutUvs[l++] = (glyph.position[0] + bitmap.width) / layout.width;
		layoutUvs[l++] = (glyph.position[1] + layout.height) / layout.height;

		// Positions, Centers

		// bottom left position
		const x = glyph.position[0] + bitmap.xoffset;
		const y = glyph.position[1] + bitmap.yoffset;

		// quad size
		const w = bitmap.width;
		const h = bitmap.height;

		// Position

		// BL
		positions[j++] = x;
		positions[j++] = y;
		positions[j++] = 0;
		// TL
		positions[j++] = x;
		positions[j++] = y + h;
		positions[j++] = 0;
		// TR
		positions[j++] = x + w;
		positions[j++] = y + h;
		positions[j++] = 0;
		// BR
		positions[j++] = x + w;
		positions[j++] = y;
		positions[j++] = 0;

		// Center
		centers[k++] = x + w / 2;
		centers[k++] = y + h / 2;

		centers[k++] = x + w / 2;
		centers[k++] = y + h / 2;

		centers[k++] = x + w / 2;
		centers[k++] = y + h / 2;

		centers[k++] = x + w / 2;
		centers[k++] = y + h / 2;
	});

	return { uvs, layoutUvs, positions, centers };
}

/**
 *****************************************************************
 * TextLayout - https://github.com/leochocolat/three-msdf-text-utils/blob/main/src/MSDFTextGeometry/TextLayout.js
 * Dependencies: Word Wrapping
 *****************************************************************
 */

const X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z'];
const M_WIDTHS = ['m', 'w'];
const CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const TAB_ID = '\t'.charCodeAt(0);
const SPACE_ID = ' '.charCodeAt(0);
const ALIGN_LEFT = 0;
const ALIGN_CENTER = 1;
const ALIGN_RIGHT = 2;

class TextLayout {

	constructor(options = {}) {
		this.glyphs = [];
		this._measure = this.computeMetrics.bind(this);
		this.update(options);
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}

	get descender() {
		return this._descender;
	}

	get ascender() {
		return this._ascender;
	}

	get xHeight() {
		return this._xHeight;
	}

	get baseline() {
		return this._baseline;
	}

	get capHeight() {
		return this._capHeight;
	}

	get lineHeight() {
		return this._lineHeight;
	}

	get linesTotal() {
		return this._linesTotal;
	}

	get lettersTotal() {
		return this._lettersTotal;
	}

	get wordsTotal() {
		return this._wordsTotal;
	}

	update(options) {
		options = Object.assign({ measure: this._measure }, options);

		this._options = options;
		this._options.tabSize = number(this._options.tabSize, 4);

		if (!options.font) { throw new Error('must provide a valid bitmap font') }

		const glyphs = this.glyphs;
		const text = options.text || '';
		const font = options.font;
		this._setupSpaceGlyphs(font);

		const lines = wordwrap(text, options);
		const minWidth = options.width || 0;

		const wordsTotal = text.split(' ').filter(word => word !== '\n').length;
		const lettersTotal = text.split('').filter(char => char !== '\n' && char !== ' ').length;

		// clear glyphs
		glyphs.length = 0;

		// get max line width
		const maxLineWidth = lines.reduce(function(prev, line) {
			return Math.max(prev, line.width, minWidth);
		}, 0);

		// the pen position
		let x = 0;
		let y = 0;
		const lineHeight = number(options.lineHeight, font.common.lineHeight);
		const baseline = number(options.baseline, font.common.base);
		const descender = lineHeight - baseline;
		const letterSpacing = options.letterSpacing || 0;
		const height = lineHeight * lines.length - descender;
		const align = getAlignType(this._options.align);

		// draw text along baseline
		y -= height;

		// the metrics for this text layout
		this._width = maxLineWidth;
		this._height = height;
		this._descender = lineHeight - baseline;
		this._baseline = baseline;
		this._xHeight = getXHeight(font);
		this._capHeight = getCapHeight(font);
		this._lineHeight = lineHeight;
		this._ascender = lineHeight - descender - this._xHeight;

		let wordIndex = 0;
		let letterIndex = 0;

		// layout each glyph
		lines.forEach((line, lineIndex) => {
			const start = line.start;
			const end = line.end;
			const lineWidth = line.width;
			const lineString = text.slice(start, end);

			const lineWordsTotal = lineString.split(' ').filter(item => item !== '').length;
			const lineLettersTotal = text.slice(start, end).split(' ').join('').length;
			let lineLetterIndex = 0;
			let lineWordIndex = 0;

			let lastGlyph;

			// for each glyph in that line...
			for (let i = start; i < end; i++) {
				const id = text.charCodeAt(i);
				const glyph = this.getGlyph(font, id);

				if (glyph) {
					if (lastGlyph) {
						x += getKerning(font, lastGlyph.id, glyph.id);
					}

					let tx = x;
					if (align === ALIGN_CENTER) {
						tx += (maxLineWidth - lineWidth) / 2;
					} else if (align === ALIGN_RIGHT) {
						tx += (maxLineWidth - lineWidth);
					}

					glyphs.push({
						position: [tx, y],
						data: glyph,
						index: i,
						// Line
						linesTotal: lines.length,
						lineIndex,
						lineLettersTotal,
						lineLetterIndex,
						lineWordsTotal,
						lineWordIndex,
						// Word
						wordsTotal,
						wordIndex,
						// Letter
						lettersTotal,
						letterIndex
					});

					if (glyph.id === SPACE_ID && (!lastGlyph || lastGlyph.id !== SPACE_ID)) {
						lineWordIndex++;
						wordIndex++;
					}

					if (glyph.id !== SPACE_ID) {
						lineLetterIndex++;
						letterIndex++;
					}

					// move pen forward
					x += glyph.xadvance + letterSpacing;
					lastGlyph = glyph;
				}
			}

			// next line down
			y += lineHeight;
			x = 0;
		});

		this._lettersTotal = lettersTotal;
		this._wordsTotal = wordsTotal;
		this._linesTotal = lines.length;
	}

	getGlyph(font, id) {
		const glyph = getGlyphById(font, id);

		if (glyph) {
			return glyph;
		} else if (id === TAB_ID) {
			return this._fallbackTabGlyph;
		} else if (id === SPACE_ID) {
			return this._fallbackSpaceGlyph;
		}

		return null;
	}

	computeMetrics(text, start, end, width) {
		const letterSpacing = this._options.letterSpacing || 0;
		const font = this._options.font;
		let curPen = 0;
		let curWidth = 0;
		let count = 0;
		let glyph;
		let lastGlyph;

		if (!font.chars || font.chars.length === 0) {
			return {
				start,
				end: start,
				width: 0
			};
		}

		end = Math.min(text.length, end);

		for (let i = start; i < end; i++) {
			const id = text.charCodeAt(i);
			glyph = this.getGlyph(font, id);

			if (glyph) {
				glyph.char = text[i];
				// move pen forward
				const kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
				curPen += kern;

				const nextPen = curPen + glyph.xadvance + letterSpacing;
				const nextWidth = curPen + glyph.width;

				// we've hit our limit; we can't move onto the next glyph
				if (nextWidth >= width || nextPen >= width) { break }

				// otherwise continue along our line
				curPen = nextPen;
				curWidth = nextWidth;
				lastGlyph = glyph;
			}
			count++;
		}

		// make sure rightmost edge lines up with rendered glyphs
		if (lastGlyph) { curWidth += lastGlyph.xoffset }

		return {
			start,
			end: start + count,
			width: curWidth
		};
	}

	/**
     * Private
     */
	_setupSpaceGlyphs(font) {
		// These are fallbacks, when the font doesn't include
		// ' ' or '\t' glyphs
		this._fallbackSpaceGlyph = null;
		this._fallbackTabGlyph = null;

		if (!font.chars || font.chars.length === 0) return;

		// try to get space glyph
		// then fall back to the 'm' or 'w' glyphs
		// then fall back to the first glyph available
		const space = getGlyphById(font, SPACE_ID) || getMGlyph(font) || font.chars[0];

		// and create a fallback for tab
		const tabWidth = this._options.tabSize * space.xadvance;
		this._fallbackSpaceGlyph = space;
		const spaceClone = Object.assign({}, space);
		this._fallbackTabGlyph = Object.assign(spaceClone, {
			x: 0,
			y: 0,
			xadvance: tabWidth,
			id: TAB_ID,
			xoffset: 0,
			yoffset: 0,
			width: 0,
			height: 0
		});
	}

}

function getGlyphById(font, id) {
	if (!font.chars || font.chars.length === 0) { return null }

	const glyphIdx = findChar(font.chars, id);

	if (glyphIdx >= 0) {
		const glyph = font.chars[glyphIdx];
		return glyph;
	}

	return null;
}

function getXHeight(font) {
	for (let i = 0; i < X_HEIGHTS.length; i++) {
		const id = X_HEIGHTS[i].charCodeAt(0);
		const idx = findChar(font.chars, id);
		if (idx >= 0) { return font.chars[idx].height }
	}
	return 0;
}

function getMGlyph(font) {
	for (let i = 0; i < M_WIDTHS.length; i++) {
		const id = M_WIDTHS[i].charCodeAt(0);
		const idx = findChar(font.chars, id);
		if (idx >= 0) { return font.chars[idx] }
	}
	return 0;
}

function getCapHeight(font) {
	for (let i = 0; i < CAP_HEIGHTS.length; i++) {
		const id = CAP_HEIGHTS[i].charCodeAt(0);
		const idx = findChar(font.chars, id);
		if (idx >= 0) { return font.chars[idx].height }
	}
	return 0;
}

function getKerning(font, left, right) {
	if (!font.kernings || font.kernings.length === 0) { return 0 }

	const table = font.kernings;
	for (let i = 0; i < table.length; i++) {
		const kern = table[i];
		if (kern.first === left && kern.second === right) { return kern.amount }
	}
	return 0;
}

function getAlignType(align) {
	if (align === 'center') { return ALIGN_CENTER } else if (align === 'right') { return ALIGN_RIGHT }
	return ALIGN_LEFT;
}

function findChar(array, value, start) {
	start = start || 0;
	for (let i = start; i < array.length; i++) {
		if (array[i].id === value) {
			return i;
		}
	}
	return -1;
}

function number(num, def) {
	return typeof num === 'number' ? num : (typeof def === 'number' ? def : 0);
}

/**
 *****************************************************************
 * Word Wrapping - https://github.com/mattdesl/word-wrapper
 * Modified to support chinese characters
 *****************************************************************
 */

const newline = /\n/;
const newlineChar = '\n';
const whitespace = /\s/;
const letter = /[a-zA-Z]/;

function wordwrap(text, opt = {}) {
	// zero width results in nothing visible
	if (opt.width === 0 && opt.mode !== 'nowrap') {
		return [];
	}

	text = text || '';
	const width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE;
	const start = Math.max(0, opt.start || 0);
	const end = typeof opt.end === 'number' ? opt.end : text.length;
	const mode = opt.mode;

	const measure = opt.measure || monospace;
	if (mode === 'pre') {
		return pre(measure, text, start, end, width);
	} else {
		return greedy(measure, text, start, end, width, mode);
	}
}

function idxOf(text, chr, start, end) {
	const idx = text.indexOf(chr, start);
	if (idx === -1 || idx > end) {
		return end;
	}
	return idx;
}

function isWhitespace(chr) {
	return whitespace.test(chr);
}

function pre(measure, text, start, end, width) {
	const lines = [];
	let lineStart = start;
	for (let i = start; i < end && i < text.length; i++) {
		const chr = text.charAt(i);
		const isNewline = newline.test(chr);

		// If we've reached a newline, then step down a line
		// Or if we've reached the EOF
		if (isNewline || i === end - 1) {
			const lineEnd = isNewline ? i : i + 1;
			const measured = measure(text, lineStart, lineEnd, width);
			lines.push(measured);

			lineStart = i + 1;
		}
	}
	return lines;
}

function greedy(measure, text, start, end, width, mode) {
	// A greedy word wrapper based on LibGDX algorithm
	// https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
	const lines = [];

	let testWidth = width;
	// if 'nowrap' is specified, we only wrap on newline chars
	if (mode === 'nowrap') {
		testWidth = Number.MAX_VALUE;
	}

	let newParagraph = start;

	while (start < end && start < text.length) {
		// get next newline position
		const newLine = idxOf(text, newlineChar, start, end);

		// eat whitespace at start of line
		while (start < newLine) {
			if (!isWhitespace(text.charAt(start))) {
				break;
			}
			if (start === newParagraph) {
				break;
			}
			start++;
		}

		newParagraph = newLine + 1;

		// determine visible # of glyphs for the available width
		const measured = measure(text, start, newLine, testWidth);

		let lineEnd = start + (measured.end - measured.start);
		let nextStart = lineEnd + newlineChar.length;

		// if we had to cut the line before the next newline...
		if (lineEnd < newLine) {
			// find char to break on
			while (lineEnd > start) {
				if (!letter.test(text.charAt(lineEnd))) { // if not a letter, break
					break;
				}
				lineEnd--;
			}
			if (lineEnd === start) {
				if (nextStart > start + newlineChar.length) {
					nextStart--;
				}
				lineEnd = nextStart; // If no characters to break, show all.
			} else {
				nextStart = lineEnd;
				// eat whitespace at end of line
				while (lineEnd > start) {
					if (!isWhitespace(text.charAt(lineEnd - newlineChar.length))) {
						break;
					}
					lineEnd--;
				}
			}
		}
		if (lineEnd >= start) {
			const result = measure(text, start, lineEnd, testWidth);
			lines.push(result);
		}
		start = nextStart;
	}
	return lines;
}

// determines the visible number of glyphs within a given width
function monospace(text, start, end, width) {
	const glyphs = Math.min(width, end - start);
	return {
		start: start,
		end: start + glyphs
	};
}

export { BitmapTextGeometry };