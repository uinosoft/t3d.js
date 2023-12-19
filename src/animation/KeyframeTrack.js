import { LinearInterpolant, StepInterpolant } from './KeyframeInterpolants.js';

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
	 * @param {t3d.KeyframeInterpolant.constructor} [interpolant=t3d.LinearInterpolant]
	 */
	constructor(target, propertyPath, times, values, interpolant = LinearInterpolant) {
		this.target = target;
		this.propertyPath = propertyPath;

		this.name = this.target.uuid + '.' + propertyPath;

		this.times = times;
		this.values = values;

		this.valueSize = 0;
		this.interpolant = null;

		// since 0.2.2, remove this after few versions later
		if (interpolant === true) {
			interpolant = LinearInterpolant;
		} else if (interpolant === false) {
			interpolant = StepInterpolant;
		}

		this.setInterpolant(interpolant);
	}

	/**
	 * Set interpolant for this keyframe track.
	 * @param {t3d.KeyframeInterpolant.constructor} interpolant
	 * @return {t3d.KeyframeTrack}
	 */
	setInterpolant(interpolant) {
		this.valueSize = interpolant.getValueSize.call(this);
		this.interpolant = interpolant;
		return this;
	}

	/**
	 * Get value at time.
	 * The value will be interpolated by interpolant if time is between keyframes.
	 * @param {Number} t - time
	 * @param {Array} outBuffer - output buffer
	 * @return {Array} output buffer
	 */
	getValue(t, outBuffer) {
		const interpolant = this.interpolant,
			times = this.times,
			tl = times.length;

		if (t <= times[0]) {
			return interpolant.copyValue.call(this, 0, outBuffer);
		} else if (t >= times[tl - 1]) {
			return interpolant.copyValue.call(this, tl - 1, outBuffer);
		}

		// TODO use index cache for better performance
		// https://github.com/mrdoob/three.js/blob/dev/src/math/Interpolant.js
		let i0 = tl - 1;
		while (t < times[i0] && i0 > 0) {
			i0--;
		}

		const duration = times[i0 + 1] - times[i0];
		const ratio = (t - times[i0]) / duration;
		return interpolant.interpolate.call(this, i0, ratio, duration, outBuffer);
	}

}

export { KeyframeTrack };