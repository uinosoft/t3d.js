import { KeyframeTrack } from '../KeyframeTrack.js';

/**
 * Used for vector property track.
 * @memberof t3d
 * @extends t3d.KeyframeTrack
 */
class VectorKeyframeTrack extends KeyframeTrack {

	/**
	 * @param {t3d.Object3D} target
	 * @param {String} propertyPath
	 * @param {Array} times
	 * @param {Array} values
	 * @param {Boolean} [interpolant=true]
	 */
	constructor(target, propertyPath, times, values, interpolant) {
		super(target, propertyPath, times, values, interpolant);
	}

}

/**
 * @readonly
 * @type {String}
 * @default 'vector'
 */
VectorKeyframeTrack.prototype.valueTypeName = 'vector';

export { VectorKeyframeTrack };