/**
 * Base class for property track.
 * @memberof t3d
 * @abstract
 */
class KeyframeTrack {

	/**
	 * @param {t3d.Object3D} target
	 * @param {String} propertyPath
	 * @param {Array} times
	 * @param {Array} values
	 * @param {Boolean} [interpolant=true]
	 */
	constructor(target, propertyPath, times, values, interpolant = true) {
		this.target = target;
		this.propertyPath = propertyPath;

		this.name = this.target.uuid + '.' + propertyPath;

		this.times = times;
		this.values = values;

		this.valueSize = values.length / times.length;

		this.interpolant = interpolant;
	}

	getValue(t, outBuffer) {
		const times = this.times,
			tl = times.length;

		if (t <= times[0]) {
			return this._copyValue(0, outBuffer);
		} else if (t >= times[tl - 1]) {
			return this._copyValue(tl - 1, outBuffer);
		}

		// TODO optimize
		// https://github.com/mrdoob/three.js/blob/dev/src/math/Interpolant.js
		let i0 = tl - 1;
		while (t < times[i0] && i0 > 0) {
			i0--;
		}

		const ratio = (t - times[i0]) / (times[i0 + 1] - times[i0]);
		return this._interpolate(i0, ratio, outBuffer);
	}

	_interpolate(index0, ratio, outBuffer) {
		const values = this.values,
			valueSize = this.valueSize;

		let value1, value2;

		for (let i = 0; i < valueSize; i++) {
			value1 = values[index0 * valueSize + i];
			value2 = values[(index0 + 1) * valueSize + i];

			if (this.interpolant) {
				if (value1 !== undefined && value2 !== undefined) {
					outBuffer[i] = value1 * (1 - ratio) + value2 * ratio;
				} else {
					outBuffer[i] = value1;
				}
			} else {
				outBuffer[i] = value1;
			}
		}

		return outBuffer;
	}

	_copyValue(index, outBuffer) {
		const values = this.values,
			valueSize = this.valueSize,
			offset = valueSize * index;

		for (let i = 0; i < valueSize; i++) {
			outBuffer[i] = values[offset + i];
		}

		return outBuffer;
	}

}

export { KeyframeTrack };