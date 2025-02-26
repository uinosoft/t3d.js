import { KeyframeTrack } from '../KeyframeTrack.js';
import { StepInterpolant } from '../KeyframeInterpolants.js';

/**
 * Used for boolean property track.
 * @extends KeyframeTrack
 */
class BooleanKeyframeTrack extends KeyframeTrack {

	/**
	 * @param {Object3D} target
	 * @param {string} propertyPath
	 * @param {Array} times
	 * @param {Array} values
	 * @param {KeyframeInterpolant.constructor} [interpolant=StepInterpolant]
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
 * @type {string}
 * @default 'bool'
 */
BooleanKeyframeTrack.prototype.valueTypeName = 'bool';

export { BooleanKeyframeTrack };