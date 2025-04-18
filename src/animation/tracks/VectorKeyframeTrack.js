import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * Used for vector property track.
 * @extends KeyframeTrack
 */
class VectorKeyframeTrack extends KeyframeTrack {

	/**
	 * @param {Object3D} target
	 * @param {string} propertyPath
	 * @param {Array} times
	 * @param {Array} values
	 * @param {KeyframeInterpolant.constructor} [interpolant=LinearInterpolant]
	 */
	constructor(target, propertyPath, times, values, interpolant) {
		super(target, propertyPath, times, values, interpolant);
	}

}

/**
 * @readonly
 * @type {string}
 * @default 'vector'
 */
VectorKeyframeTrack.prototype.valueTypeName = 'vector';

export { VectorKeyframeTrack };