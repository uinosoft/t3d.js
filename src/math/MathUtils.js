/**
 * An utility class for mathematical operations.
 */
class MathUtils {

	/**
	 * Method for generate uuid.
	 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
	 * @returns {string} - The uuid.
	 */
	static generateUUID() {
		const d0 = Math.random() * 0xffffffff | 0;
		const d1 = Math.random() * 0xffffffff | 0;
		const d2 = Math.random() * 0xffffffff | 0;
		const d3 = Math.random() * 0xffffffff | 0;
		const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
			_lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
			_lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
			_lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

		// .toUpperCase() here flattens concatenated strings to save heap memory space.
		return uuid.toUpperCase();
	}

	/**
	 * Returns a value linearly interpolated from two known points based on the given interval - t = 0 will return x and t = 1 will return y.
	 * @param {number} x - The first value.
	 * @param {number} y - The second value.
	 * @param {number} t - The interpolation factor.
	 * @returns {number} - The interpolated value.
	 */
	static lerp(x, y, t) {
		return x + (y - x) * t;
	}

	/**
	 * Clamps the value to be between min and max.
	 * @param {number} value - Value to be clamped.
	 * @param {number} min - The minimum value.
	 * @param {number} max - The maximum value.
	 * @returns {number} - The clamped value.
	 */
	static clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	/**
	 * Compute euclidean modulo of m % n.
	 * Refer to: https://en.wikipedia.org/wiki/Modulo_operation
	 * @param {number} n - The dividend.
	 * @param {number} m - The divisor.
	 * @returns {number} - The result of the modulo operation.
	 */
	static euclideanModulo(n, m) {
		return ((n % m) + m) % m;
	}

	/**
	 * Is this number a power of two.
	 * @param {number} value - The input number.
	 * @returns {boolean} - Is this number a power of two.
	 */
	static isPowerOfTwo(value) {
		return (value & (value - 1)) === 0 && value !== 0;
	}

	/**
	 * Return the nearest power of two number of this number.
	 * @param {number} value - The input number.
	 * @returns {number} - The result number.
	 */
	static nearestPowerOfTwo(value) {
		return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
	}

	/**
	 * Return the next power of two number of this number.
	 * @param {number} value - The input number.
	 * @returns {number} - The result number.
	 */
	static nextPowerOfTwo(value) {
		value--;
		value |= value >> 1;
		value |= value >> 2;
		value |= value >> 4;
		value |= value >> 8;
		value |= value >> 16;
		value++;

		return value;
	}

	/**
	 * Return the next power of two square size of this number.
	 * This method is usually used to calculate the minimum 2d texture size based on the pixel length.
	 * @param {number} value - The input number.
	 * @returns {number} - The result size.
	 */
	static nextPowerOfTwoSquareSize(value) {
		return this.nextPowerOfTwo(Math.ceil(Math.sqrt(value)));
	}

	/**
	 * Denormalizes a value based on the type of the provided array.
	 * @param {number} value - The value to be denormalized.
	 * @param {TypedArray} array - The typed array to determine the normalization factor.
	 * @returns {number} - The denormalized value.
	 * @throws {Error} - Throws an error if the array type is invalid.
	 */
	static denormalize(value, array) {
		switch (array.constructor) {
			case Float32Array:
				return value;
			case Uint32Array:
				return value / 4294967295.0;
			case Uint16Array:
				return value / 65535.0;
			case Uint8Array:
				return value / 255.0;
			case Int32Array:
				return Math.max(value / 2147483647.0, -1.0);
			case Int16Array:
				return Math.max(value / 32767.0, -1.0);
			case Int8Array:
				return Math.max(value / 127.0, -1.0);
			default:
				throw new Error('Invalid component type.');
		}
	}

	/**
	 * Normalizes a value based on the type of the provided array.
	 * @param {number} value - The value to be normalized.
	 * @param {TypedArray} array - The typed array to determine the normalization factor.
	 * @returns {number} - The normalized value.
	 * @throws {Error} - Throws an error if the array type is invalid.
	 */
	static normalize(value, array) {
		switch (array.constructor) {
			case Float32Array:
				return value;
			case Uint32Array:
				return Math.round(value * 4294967295.0);
			case Uint16Array:
				return Math.round(value * 65535.0);
			case Uint8Array:
				return Math.round(value * 255.0);
			case Int32Array:
				return Math.round(value * 2147483647.0);
			case Int16Array:
				return Math.round(value * 32767.0);
			case Int8Array:
				return Math.round(value * 127.0);
			default:
				throw new Error('Invalid component type.');
		}
	}

	/**
	 * Converts float to half float.
	 * @param {number} val - The float value.
	 * @returns {number} - The half float value.
	 */
	static toHalfFloat(val) {
		if (Math.abs(val) > 65504) {
			console.warn('MathUtils.toHalfFloat(): Value out of range.');
			val = this.clamp(val, -65504, 65504);
		}

		_tables.floatView[0] = val;
		const f = _tables.uint32View[0];
		const e = (f >> 23) & 0x1ff;
		return _tables.baseTable[e] + ((f & 0x007fffff) >> _tables.shiftTable[e]);
	}

	/**
	 * Converts half float to float.
	 * @param {number} val - The half float value.
	 * @returns {number} - The float value.
	 */
	static fromHalfFloat(val) {
		const m = val >> 10;
		_tables.uint32View[0] = _tables.mantissaTable[_tables.offsetTable[m] + (val & 0x3ff)] + _tables.exponentTable[m];
		return _tables.floatView[0];
	}

}

const _lut = [];
for (let i = 0; i < 256; i++) {
	_lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

// Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf

const _tables = _generateTables();

function _generateTables() {
	// float32 to float16 helpers

	const buffer = new ArrayBuffer(4);
	const floatView = new Float32Array(buffer);
	const uint32View = new Uint32Array(buffer);

	const baseTable = new Uint32Array(512);
	const shiftTable = new Uint32Array(512);

	for (let i = 0; i < 256; ++i) {
		const e = i - 127;

		if (e < -27) { // very small number (0, -0)
			baseTable[i] = 0x0000;
			baseTable[i | 0x100] = 0x8000;
			shiftTable[i] = 24;
			shiftTable[i | 0x100] = 24;
		} else if (e < -14) { // small number (denorm)
			baseTable[i] = 0x0400 >> (-e - 14);
			baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
			shiftTable[i] = -e - 1;
			shiftTable[i | 0x100] = -e - 1;
		} else if (e <= 15) { // normal number
			baseTable[i] = (e + 15) << 10;
			baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
			shiftTable[i] = 13;
			shiftTable[i | 0x100] = 13;
		} else if (e < 128) { // large number (Infinity, -Infinity)
			baseTable[i] = 0x7c00;
			baseTable[i | 0x100] = 0xfc00;
			shiftTable[i] = 24;
			shiftTable[i | 0x100] = 24;
		} else { // stay (NaN, Infinity, -Infinity)
			baseTable[i] = 0x7c00;
			baseTable[i | 0x100] = 0xfc00;
			shiftTable[i] = 13;
			shiftTable[i | 0x100] = 13;
		}
	}

	// float16 to float32 helpers

	const mantissaTable = new Uint32Array(2048);
	const exponentTable = new Uint32Array(64);
	const offsetTable = new Uint32Array(64);

	for (let i = 1; i < 1024; ++i) {
		let m = i << 13; // zero pad mantissa bits
		let e = 0; // zero exponent

		// normalized
		while ((m & 0x00800000) === 0) {
			m <<= 1;
			e -= 0x00800000; // decrement exponent
		}

		m &= ~0x00800000; // clear leading 1 bit
		e += 0x38800000; // adjust bias

		mantissaTable[i] = m | e;
	}

	for (let i = 1024; i < 2048; ++i) {
		mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
	}

	for (let i = 1; i < 31; ++i) {
		exponentTable[i] = i << 23;
	}

	exponentTable[31] = 0x47800000;
	exponentTable[32] = 0x80000000;

	for (let i = 33; i < 63; ++i) {
		exponentTable[i] = 0x80000000 + ((i - 32) << 23);
	}

	exponentTable[63] = 0xc7800000;

	for (let i = 1; i < 64; ++i) {
		if (i !== 32) {
			offsetTable[i] = 1024;
		}
	}

	return {
		floatView: floatView,
		uint32View: uint32View,
		baseTable: baseTable,
		shiftTable: shiftTable,
		mantissaTable: mantissaTable,
		exponentTable: exponentTable,
		offsetTable: offsetTable
	};
}

export { MathUtils };