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