import { KeyframeTrack } from '../KeyframeTrack.js';
import { StepInterpolant } from '../KeyframeInterpolants.js';

/**
 * Used for string property track.
 * @extends KeyframeTrack
 */
class StringKeyframeTrack extends KeyframeTrack {

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
 * @default 'string'
 */
StringKeyframeTrack.prototype.valueTypeName = 'string';

export { StringKeyframeTrack };