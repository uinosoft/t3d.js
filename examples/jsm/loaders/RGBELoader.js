import { Loader, FileLoader, PIXEL_TYPE, PIXEL_FORMAT, TEXTURE_FILTER } from 't3d';

class RGBELoader extends Loader {

	constructor(manager) {
		super(manager);

		/**
		 * The loadingManager for the loader to use.
		 * @type {t3d.PIXEL_TYPE}
		 * @default t3d.PIXEL_TYPE.HALF_FLOAT
		 */
		this.type = PIXEL_TYPE.HALF_FLOAT;
	}

	load(url, onLoad, onProgress, onError) {
		const scope = this;

		const loader = new FileLoader(this.manager);
		loader.setResponseType('arraybuffer');
		loader.setRequestHeader(this.requestHeader);
		loader.setPath(this.path);
		loader.setWithCredentials(this.withCredentials);

		loader.load(url, function(buffer) {
			if (onLoad !== undefined) {
				onLoad(scope.parse(buffer));
			}
		}, onProgress, onError);
	}

	// adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html

	parse(buffer) {
		const byteArray = new Uint8Array(buffer);
		byteArray.pos = 0;
		const rgbe_header_info = RGBE_ReadHeader(byteArray);

		if (RGBE_RETURN_FAILURE !== rgbe_header_info) {
			const w = rgbe_header_info.width,
				h = rgbe_header_info.height,
				image_rgba_data = RGBE_ReadPixels_RLE(byteArray.subarray(byteArray.pos), w, h);
			if (RGBE_RETURN_FAILURE !== image_rgba_data) {
				let data, type;
				let numElements;
				if (this.type === PIXEL_TYPE.FLOAT) {
					numElements = image_rgba_data.length / 4;
					const floatArray = new Float32Array(numElements * 4);

					for (let j = 0; j < numElements; j++) {
						RGBEByteToRGBFloat(image_rgba_data, j * 4, floatArray, j * 4);
					}

					data = floatArray;
					type = PIXEL_TYPE.FLOAT;
				} else if (this.type === PIXEL_TYPE.HALF_FLOAT) {
					numElements = image_rgba_data.length / 4;
					const halfArray = new Uint16Array(numElements * 4);

					for (let j = 0; j < numElements; j++) {
						RGBEByteToRGBHalf(image_rgba_data, j * 4, halfArray, j * 4);
					}

					data = halfArray;
					type = PIXEL_TYPE.HALF_FLOAT;
				} else if (this.type === PIXEL_TYPE.UNSIGNED_BYTE) {
					data = image_rgba_data; // just copy
					type = PIXEL_TYPE.UNSIGNED_BYTE;
				} else {
					console.error('RGBELoader: unsupported type: ', this.type);
				}

				const floatType = (type === PIXEL_TYPE.FLOAT) || (type === PIXEL_TYPE.HALF_FLOAT);

				return {
					width: w, height: h,
					data: data,
					header: rgbe_header_info.string,
					gamma: rgbe_header_info.gamma,
					exposure: rgbe_header_info.exposure,
					format: PIXEL_FORMAT.RGBA, // deprecated
					internalformat: null, // deprecated
					type: type,
					generateMipmaps: floatType ? false : undefined,
					flipY: floatType ? true : undefined,
					minFilter: floatType ? TEXTURE_FILTER.LINEAR : undefined,
					magFilter: floatType ? TEXTURE_FILTER.LINEAR : undefined
				};
			}
		}
	}

}

const
	// RGBE_RETURN_SUCCESS = 0,
	RGBE_RETURN_FAILURE = -1,

	/* default error routine.  change this to change error handling */
	rgbe_read_error = 1,
	rgbe_write_error = 2,
	rgbe_format_error = 3,
	rgbe_memory_error = 4,
	rgbe_error = function(rgbe_error_code, msg) {
		switch (rgbe_error_code) {
			case rgbe_read_error:
				console.error("RGBELoader Read Error: " + (msg || ''));
				break;
			case rgbe_write_error:
				console.error("RGBELoader Write Error: " + (msg || ''));
				break;
			case rgbe_format_error:
				console.error("RGBELoader Bad File Format: " + (msg || ''));
				break;
			case rgbe_memory_error:
			default:
				console.error("RGBELoader: Error: " + (msg || ''));
		}
		return RGBE_RETURN_FAILURE;
	},

	/* offsets to red, green, and blue components in a data (float) pixel */
	// RGBE_DATA_RED = 0,
	// RGBE_DATA_GREEN = 1,
	// RGBE_DATA_BLUE = 2,

	/* number of floats per pixel, use 4 since stored in rgba image format */
	// RGBE_DATA_SIZE = 4,

	/* flags indicating which fields in an rgbe_header_info are valid */
	RGBE_VALID_PROGRAMTYPE = 1,
	RGBE_VALID_FORMAT = 2,
	RGBE_VALID_DIMENSIONS = 4,

	NEWLINE = "\n",

	fgets = function(buffer, lineLimit, consume) {
		const chunkSize = 128;

		lineLimit = !lineLimit ? 1024 : lineLimit;
		let p = buffer.pos,
			i = -1, len = 0, s = '',
			chunk = String.fromCharCode.apply(null, new Uint16Array(buffer.subarray(p, p + chunkSize)));
		while ((0 > (i = chunk.indexOf(NEWLINE))) && (len < lineLimit) && (p < buffer.byteLength)) {
			s += chunk; len += chunk.length;
			p += chunkSize;
			chunk += String.fromCharCode.apply(null, new Uint16Array(buffer.subarray(p, p + chunkSize)));
		}

		if (-1 < i) {
			/* for (i=l-1; i>=0; i--) {
			byteCode = m.charCodeAt(i);
			if (byteCode > 0x7f && byteCode <= 0x7ff) byteLen++;
			else if (byteCode > 0x7ff && byteCode <= 0xffff) byteLen += 2;
			if (byteCode >= 0xDC00 && byteCode <= 0xDFFF) i--; //trail surrogate
		} */
			if (false !== consume) buffer.pos += len + i + 1;
			return s + chunk.slice(0, i);
		}
		return false;
	},

	/* minimal header reading.  modify if you want to parse more information */
	RGBE_ReadHeader = function (buffer) {
		// regexes to parse header info fields
		const magic_token_re = /^#\?(\S+)$/,
			gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,
			exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,
			format_re = /^\s*FORMAT=(\S+)\s*$/,
			dimensions_re = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,

			// RGBE format header struct
			header = {
				valid: 0, /* indicate which fields are valid */
				string: '', /* the actual header string */
				comments: '', /* comments found in header */
				programtype: 'RGBE', /* listed at beginning of file to identify it after "#?". defaults to "RGBE" */
				format: '', /* RGBE format, default 32-bit_rle_rgbe */
				gamma: 1.0, /* image has already been gamma corrected with given gamma. defaults to 1.0 (no correction) */
				exposure: 1.0, /* a value of 1.0 in an image corresponds to <exposure> watts/steradian/m^2. defaults to 1.0 */
				width: 0, height: 0 /* image dimensions, width/height */
			};

		let line, match;

		if (buffer.pos >= buffer.byteLength || !(line = fgets(buffer))) {
			return rgbe_error(rgbe_read_error, "no header found");
		}
		/* if you want to require the magic token then uncomment the next line */
		if (!(match = line.match(magic_token_re))) {
			return rgbe_error(rgbe_format_error, "bad initial token");
		}
		header.valid |= RGBE_VALID_PROGRAMTYPE;
		header.programtype = match[1];
		header.string += line + "\n";

		while (true) {
			line = fgets(buffer);
			if (false === line) break;
			header.string += line + "\n";

			if ('#' === line.charAt(0)) {
				header.comments += line + "\n";
				continue; // comment line
			}

			if (match = line.match(gamma_re)) {
				header.gamma = parseFloat(match[1]);
			}
			if (match = line.match(exposure_re)) {
				header.exposure = parseFloat(match[1]);
			}
			if (match = line.match(format_re)) {
				header.valid |= RGBE_VALID_FORMAT;
				header.format = match[1];// '32-bit_rle_rgbe';
			}
			if (match = line.match(dimensions_re)) {
				header.valid |= RGBE_VALID_DIMENSIONS;
				header.height = parseInt(match[1], 10);
				header.width = parseInt(match[2], 10);
			}

			if ((header.valid & RGBE_VALID_FORMAT) && (header.valid & RGBE_VALID_DIMENSIONS)) break;
		}

		if (!(header.valid & RGBE_VALID_FORMAT)) {
			return rgbe_error(rgbe_format_error, "missing format specifier");
		}
		if (!(header.valid & RGBE_VALID_DIMENSIONS)) {
			return rgbe_error(rgbe_format_error, "missing image size specifier");
		}

		return header;
	},

	RGBE_ReadPixels_RLE = function (buffer, w, h) {
		const scanline_width = w;

		if (
			// run length encoding is not allowed so read flat
			((scanline_width < 8) || (scanline_width > 0x7fff)) ||
			// this file is not run length encoded
			((2 !== buffer[0]) || (2 !== buffer[1]) || (buffer[2] & 0x80))
		) {
			// return the flat buffer
			return new Uint8Array(buffer);
		}

		if (scanline_width !== ((buffer[2] << 8) | buffer[3])) {
			return rgbe_error(rgbe_format_error, "wrong scanline width");
		}

		const data_rgba = new Uint8Array(4 * w * h);

		if (!data_rgba.length) {
			return rgbe_error(rgbe_memory_error, "unable to allocate buffer space");
		}

		let offset = 0, pos = 0;

		const ptr_end = 4 * scanline_width;
		const rgbeStart = new Uint8Array(4);
		const scanline_buffer = new Uint8Array(ptr_end);
		let num_scanlines = h;

		// read in each successive scanline
		while ((num_scanlines > 0) && (pos < buffer.byteLength)) {
			if (pos + 4 > buffer.byteLength) {
				return rgbe_error(rgbe_read_error);
			}

			rgbeStart[0] = buffer[pos++];
			rgbeStart[1] = buffer[pos++];
			rgbeStart[2] = buffer[pos++];
			rgbeStart[3] = buffer[pos++];

			if ((2 != rgbeStart[0]) || (2 != rgbeStart[1]) || (((rgbeStart[2] << 8) | rgbeStart[3]) != scanline_width)) {
				return rgbe_error(rgbe_format_error, "bad rgbe scanline format");
			}

			// read each of the four channels for the scanline into the buffer
			// first red, then green, then blue, then exponent
			let ptr = 0, count;

			while ((ptr < ptr_end) && (pos < buffer.byteLength)) {
				count = buffer[pos++];
				const isEncodedRun = count > 128;
				if (isEncodedRun) count -= 128;

				if ((0 === count) || (ptr + count > ptr_end)) {
					return rgbe_error(rgbe_format_error, "bad scanline data");
				}

				if (isEncodedRun) {
					// a (encoded) run of the same value
					const byteValue = buffer[pos++];
					for (let i = 0; i < count; i++) {
						scanline_buffer[ptr++] = byteValue;
					}
					// ptr += count;
				} else {
					// a literal-run
					scanline_buffer.set(buffer.subarray(pos, pos + count), ptr);
					ptr += count; pos += count;
				}
			}


			// now convert data from buffer into rgba
			// first red, then green, then blue, then exponent (alpha)
			const l = scanline_width; // scanline_buffer.byteLength;
			for (let i = 0; i < l; i++) {
				let off = 0;
				data_rgba[offset] = scanline_buffer[i + off];
				off += scanline_width; // 1;
				data_rgba[offset + 1] = scanline_buffer[i + off];
				off += scanline_width; // 1;
				data_rgba[offset + 2] = scanline_buffer[i + off];
				off += scanline_width; // 1;
				data_rgba[offset + 3] = scanline_buffer[i + off];
				offset += 4;
			}

			num_scanlines--;
		}

		return data_rgba;
	};

const RGBEByteToRGBFloat = function (sourceArray, sourceOffset, destArray, destOffset) {
	const e = sourceArray[sourceOffset + 3];
	const scale = Math.pow(2.0, e - 128.0) / 255.0;

	destArray[destOffset + 0] = sourceArray[sourceOffset + 0] * scale;
	destArray[destOffset + 1] = sourceArray[sourceOffset + 1] * scale;
	destArray[destOffset + 2] = sourceArray[sourceOffset + 2] * scale;
	destArray[destOffset + 3] = 1;
};

const RGBEByteToRGBHalf = function (sourceArray, sourceOffset, destArray, destOffset) {
	const e = sourceArray[sourceOffset + 3];
	const scale = Math.pow(2.0, e - 128.0) / 255.0;

	// clamping to 65504, the maximum representable value in float16
	destArray[destOffset + 0] = toHalfFloat(Math.min(sourceArray[sourceOffset + 0] * scale, 65504));
	destArray[destOffset + 1] = toHalfFloat(Math.min(sourceArray[sourceOffset + 1] * scale, 65504));
	destArray[destOffset + 2] = toHalfFloat(Math.min(sourceArray[sourceOffset + 2] * scale, 65504));
	destArray[destOffset + 3] = toHalfFloat(1);
};

const _floatView = new Float32Array(1);
const _int32View = new Int32Array(_floatView.buffer);

function toHalfFloat(val) {
	if (val > 65504) {
		console.warn('toHalfFloat(): value exceeds 65504.');

		val = 65504; // maximum representable value in float16
	}

	// Source: http://gamedev.stackexchange.com/questions/17326/conversion-of-a-number-from-single-precision-floating-point-representation-to-a/17410#17410

	/* This method is faster than the OpenEXR implementation (very often
	* used, eg. in Ogre), with the additional benefit of rounding, inspired
	* by James Tursa?s half-precision code. */

	_floatView[0] = val;
	const x = _int32View[0];

	let bits = (x >> 16) & 0x8000; /* Get the sign */
	let m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
	const e = (x >> 23) & 0xff; /* Using int is faster here */

	/* If zero, or denormal, or exponent underflows too much for a denormal
		* half, return signed zero. */
	if (e < 103) return bits;

	/* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
	if (e > 142) {
		bits |= 0x7c00;
		/* If exponent was 0xff and one mantissa bit was set, it means NaN,
					* not Inf, so make sure we set one mantissa bit too. */
		bits |= ((e == 255) ? 0 : 1) && (x & 0x007fffff);
		return bits;
	}

	/* If exponent underflows but not too much, return a denormal */
	if (e < 113) {
		m |= 0x0800;
		/* Extra rounding may overflow and set mantissa to 0 and exponent
			* to 1, which is OK. */
		bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
		return bits;
	}

	bits |= ((e - 112) << 10) | (m >> 1);
	/* Extra rounding. An overflow will set mantissa to 0 and increment
		* the exponent, which is OK. */
	bits += m & 1;
	return bits;
}

export { RGBELoader }