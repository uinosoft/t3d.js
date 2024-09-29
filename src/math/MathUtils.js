/**
 * An utility class for mathematical operations.
 */
class MathUtils {

	/**
	 * Method for generate uuid.
	 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
	 * @return {String} - The uuid.
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
	 * @param {Number} x - The first value.
	 * @param {Number} y - The second value.
	 * @param {Number} t - The interpolation factor.
	 * @return {Number} - The interpolated value.
	 */
	static lerp(x, y, t) {
		return x + (y - x) * t;
	}

	/**
	 * Clamps the value to be between min and max.
	 * @param {Number} value - Value to be clamped.
	 * @param {Number} min - The minimum value.
	 * @param {Number} max - The maximum value.
	 * @return {Number} - The clamped value.
	 */
	static clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	/**
	 * Compute euclidean modulo of m % n.
	 * Refer to: https://en.wikipedia.org/wiki/Modulo_operation
	 * @param {Number} n - The dividend.
	 * @param {Number} m - The divisor.
	 * @return {Number} - The result of the modulo operation.
	 */
	static euclideanModulo(n, m) {
		return ((n % m) + m) % m;
	}

	/**
	 * Is this number a power of two.
	 * @param {Number} value - The input number.
	 * @return {Boolean} - Is this number a power of two.
	 */
	static isPowerOfTwo(value) {
		return (value & (value - 1)) === 0 && value !== 0;
	}

	/**
	 * Return the nearest power of two number of this number.
	 * @param {Number} value - The input number.
	 * @return {Number} - The result number.
	 */
	static nearestPowerOfTwo(value) {
		return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
	}

	/**
	 * Return the next power of two number of this number.
	 * @param {Number} value - The input number.
	 * @return {Number} - The result number.
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
	 * Denormalizes a value based on the type of the provided array.
	 * @param {Number} value - The value to be denormalized.
	 * @param {TypedArray} array - The typed array to determine the normalization factor.
	 * @returns {Number} - The denormalized value.
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
	 * @param {Number} value - The value to be normalized.
	 * @param {TypedArray} array - The typed array to determine the normalization factor.
	 * @returns {Number} - The normalized value.
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

}

const _lut = [];
for (let i = 0; i < 256; i++) {
	_lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

export { MathUtils };