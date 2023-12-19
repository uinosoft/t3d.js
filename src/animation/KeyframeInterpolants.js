import { Quaternion } from '../math/Quaternion.js';

/**
 * Interpolant serves as the base class for all interpolation algorithms.
 * It defines a set of static methods that are intended to be invoked by a keyframe track for the purpose of interpolation.
 * @memberof t3d
 * @abstract
 */
class KeyframeInterpolant {

	/**
	 * Get the value size for keyframe values.
	 * @return {Number} - the value size.
	 */
	static getValueSize() {
		return this.values.length / this.times.length;
	}

	/**
	 * Interpolate the value for the specified time.
	 * @param {Number} index0 - the index of the first keyframe.
	 * @param {Number} ratio - the ratio (0-1) of the time passed between the first keyframe and the next keyframe.
	 * @param {Number} duration - the duration time between the first keyframe and the next keyframe.
	 * @param {Array} outBuffer - the output buffer to store the interpolated value.
	 * @return {Array} - the output buffer to store the interpolated value.
	 */
	static interpolate(index0, ratio, duration, outBuffer) {
		throw new Error('Interpolant: call to abstract method');
	}

	/**
	 * Copy the value for the specified index.
	 * @param {Number} index - the index of the keyframe.
	 * @param {Array} outBuffer - the output buffer to store the copied value.
	 * @return {Array} - the output buffer to store the copied value.
	 */
	static copyValue(index, outBuffer) {
		const values = this.values,
			valueSize = this.valueSize,
			offset = valueSize * index;

		for (let i = 0; i < valueSize; i++) {
			outBuffer[i] = values[offset + i];
		}

		return outBuffer;
	}

}

/**
 * Step (Discrete) interpolation of keyframe values.
 * @memberof t3d
 * @extends t3d.KeyframeInterpolant
 */
class StepInterpolant extends KeyframeInterpolant {

	static interpolate(index0, ratio, duration, outBuffer) {
		const values = this.values,
			valueSize = this.valueSize,
			offset = valueSize * index0;

		for (let i = 0; i < valueSize; i++) {
			outBuffer[i] = values[offset + i];
		}

		return outBuffer;
	}

}

/**
 * Linear interpolation of keyframe values.
 * @memberof t3d
 * @extends t3d.KeyframeInterpolant
 */
class LinearInterpolant extends KeyframeInterpolant {

	static interpolate(index0, ratio, duration, outBuffer) {
		const values = this.values,
			valueSize = this.valueSize,

			offset0 = index0 * valueSize,
			offset1 = (index0 + 1) * valueSize;

		let value1, value2;

		for (let i = 0; i < valueSize; i++) {
			value1 = values[offset0 + i];
			value2 = values[offset1 + i];

			if (value1 !== undefined && value2 !== undefined) {
				outBuffer[i] = value1 * (1 - ratio) + value2 * ratio;
			} else {
				outBuffer[i] = value1;
			}
		}

		return outBuffer;
	}

}

/**
 * Quaternion Linear interpolation of keyframe values.
 * @memberof t3d
 * @extends t3d.KeyframeInterpolant
 */
class QuaternionLinearInterpolant extends KeyframeInterpolant {

	static interpolate(index0, ratio, duration, outBuffer) {
		const values = this.values,
			valueSize = this.valueSize;

		Quaternion.slerpFlat(outBuffer, 0, values, index0 * valueSize, values, (index0 + 1) * valueSize, ratio);

		return outBuffer;
	}

}

/**
 * Cubic spline interpolation of keyframe values.
 * @memberof t3d
 * @extends t3d.KeyframeInterpolant
 */
class CubicSplineInterpolant extends KeyframeInterpolant {

	static getValueSize() {
		return this.values.length / this.times.length / 3;
	}

	static interpolate(index0, ratio, duration, outBuffer) {
		const values = this.values,
			valueSize = this.valueSize,

			valueSize2 = valueSize * 2,
			valueSize3 = valueSize * 3,

			rr = ratio * ratio,
			rrr = rr * ratio,

			offset0 = index0 * valueSize3,
			offset1 = offset0 + valueSize3,

			s2 = -2 * rrr + 3 * rr,
			s3 = rrr - rr,
			s0 = 1 - s2,
			s1 = s3 - rr + ratio;

		// Layout of keyframe output values for CUBICSPLINE animations:
		//   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
		for (let i = 0; i < valueSize; i++) {
			const p0 = values[offset0 + i + valueSize], // splineVertex_k
				m0 = values[offset0 + i + valueSize2] * duration, // outTangent_k * (t_k+1 - t_k)
				p1 = values[offset1 + i + valueSize], // splineVertex_k+1
				m1 = values[offset1 + i] * duration; // inTangent_k+1 * (t_k+1 - t_k)

			outBuffer[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
		}

		return outBuffer;
	}

	static copyValue(index, outBuffer) {
		const values = this.values,
			valueSize = this.valueSize,
			offset = valueSize * index * 3 + valueSize;

		for (let i = 0; i < valueSize; i++) {
			outBuffer[i] = values[offset + i];
		}

		return outBuffer;
	}

}

/**
 * Quaternion Cubic spline interpolation of keyframe values.
 * @memberof t3d
 * @extends t3d.CubicSplineInterpolant
 */
class QuaternionCubicSplineInterpolant extends CubicSplineInterpolant {

	static interpolate(index0, ratio, duration, outBuffer) {
		const result = super.interpolate(index0, ratio, duration, outBuffer);

		_q.fromArray(result).normalize().toArray(result);

		return result;
	}

}

const _q = new Quaternion();

export { KeyframeInterpolant, StepInterpolant, LinearInterpolant, QuaternionLinearInterpolant, CubicSplineInterpolant, QuaternionCubicSplineInterpolant };