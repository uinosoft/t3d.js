import { KeyframeTrack } from '../KeyframeTrack.js';
import { StepInterpolant } from '../KeyframeInterpolants.js';

/**
 * Used for boolean property track.
 * @memberof t3d
 * @extends t3d.KeyframeTrack
 */
class BooleanKeyframeTrack extends KeyframeTrack {

	/**
	 * @param {t3d.Object3D} target
	 * @param {String} propertyPath
	 * @param {Array} times
	 * @param {Array} values
	 * @param {t3d.KeyframeInterpolant.constructor} [interpolant=t3d.StepInterpolant]
	 */
	constructor(target, propertyPath, times, values, interpolant = StepInterpolant) {
		// since 0.2.2, remove this after few versions later
		if (interpolant === true) {
			interpolant = StepInterpolant;
		}

		super(target, propertyPath, times, values, interpolant);
	}

}

/**
 * @readonly
 * @type {String}
 * @default 'bool'
 */
BooleanKeyframeTrack.prototype.valueTypeName = 'bool';

export { BooleanKeyframeTrack };