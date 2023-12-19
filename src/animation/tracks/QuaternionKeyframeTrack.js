import { KeyframeTrack } from '../KeyframeTrack.js';
import { QuaternionLinearInterpolant } from '../KeyframeInterpolants.js';

/**
 * Used for quaternion property track.
 * @memberof t3d
 * @extends t3d.KeyframeTrack
 */
class QuaternionKeyframeTrack extends KeyframeTrack {

	/**
	 * @param {t3d.Object3D} target
	 * @param {String} propertyPath
	 * @param {Array} times
	 * @param {Array} values
	 * @param {t3d.KeyframeInterpolant.constructor} [interpolant=t3d.QuaternionLinearInterpolant]
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
 * @type {String}
 * @default 'quaternion'
 */
QuaternionKeyframeTrack.prototype.valueTypeName = 'quaternion';

export { QuaternionKeyframeTrack };