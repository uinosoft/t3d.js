import { KeyframeTrack } from '../KeyframeTrack.js';
import { QuaternionLinearInterpolant } from '../KeyframeInterpolants.js';

/**
 * Used for quaternion property track.
 * @extends KeyframeTrack
 */
class QuaternionKeyframeTrack extends KeyframeTrack {

	/**
	 * @param {Object3D} target
	 * @param {string} propertyPath
	 * @param {Array} times
	 * @param {Array} values
	 * @param {KeyframeInterpolant.constructor} [interpolant=QuaternionLinearInterpolant]
	 */
	constructor(target, propertyPath, times, values, interpolant = QuaternionLinearInterpolant) {
		// since 0.2.2, remove this after few versions later
		if (interpolant === true) {
			interpolant = QuaternionLinearInterpolant;
		}

		super(target, propertyPath, times, values, interpolant);
	}

}

/**
 * @readonly
 * @type {string}
 * @default 'quaternion'
 */
QuaternionKeyframeTrack.prototype.valueTypeName = 'quaternion';

export { QuaternionKeyframeTrack };