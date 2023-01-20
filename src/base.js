const _lut = [];
for (let i = 0; i < 256; i++) {
	_lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
}

/**
 * Method for generate uuid.
 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 * @method
 * @name t3d.generateUUID
 * @return {String} - The uuid.
 */
export function generateUUID() {
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
 * Is this number a power of two.
 * @method
 * @name t3d.isPowerOfTwo
 * @param {Number} value - The input number.
 * @return {Boolean} - Is this number a power of two.
 */
export function isPowerOfTwo(value) {
	return (value & (value - 1)) === 0 && value !== 0;
}

/**
 * Return the nearest power of two number of this number.
 * @method
 * @name t3d.nearestPowerOfTwo
 * @param {Number} value - The input number.
 * @return {Number} - The result number.
 */
export function nearestPowerOfTwo(value) {
	return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
}

/**
 * Return the next power of two number of this number.
 * @method
 * @name t3d.nextPowerOfTwo
 * @param {Number} value - The input number.
 * @return {Number} - The result number.
 */
export function nextPowerOfTwo(value) {
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
 * Clone uniforms.
 * @method
 * @name t3d.cloneUniforms
 * @param {Object} value - The input uniforms.
 * @return {Object} - The output uniforms.
 */
export function cloneUniforms(uniforms_src) {
	const uniforms_dst = {};

	for (const name in uniforms_src) {
		const uniform_src = uniforms_src[name];
		if (Array.isArray(uniform_src) || ArrayBuffer.isView(uniform_src)) {
			uniforms_dst[name] = uniform_src.slice();
		} else {
			uniforms_dst[name] = uniform_src;
		}
	}

	return uniforms_dst;
}

/**
 * Clone json.
 * This is faster than JSON.parse(JSON.stringify()).
 * @method
 * @name t3d.cloneJson
 * @param {Object} obj - The input json.
 * @return {Object} - The output json.
 */
export function cloneJson(obj) {
	const newObj = Array.isArray(obj) ? [] : {};

	if (obj && typeof obj === 'object') {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				newObj[key] = (obj[key] && typeof obj[key] === 'object') ? cloneJson(obj[key]) : obj[key];
			}
		}
	}

	return newObj;
}