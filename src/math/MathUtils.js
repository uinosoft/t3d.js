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
	 * Clamps the value to be between min and max.
	 * @param {Number} value - Value to be clamped.
	 * @param {Number} min - The minimum value.
	 * @param {Number} max - The maximum value.
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

}

const _lut = [];
for (let i = 0; i < 256; i++) {
	_lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

export { MathUtils };