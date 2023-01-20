import { KeyframeTrack } from '../KeyframeTrack.js';
import { Quaternion } from '../../math/Quaternion.js';

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
	 * @param {Boolean} [interpolant=true]
	 */
	constructor(target, propertyPath, times, values, interpolant) {
		super(target, propertyPath, times, values, interpolant);
	}

	_interpolate(index0, ratio, outBuffer) {
		const values = this.values;

		if (this.interpolant) {
			Quaternion.slerpFlat(outBuffer, 0, values, index0 * 4, values, (index0 + 1) * 4, ratio)
		} else {
			this._copyValue(index0, outBuffer);
		}

		return outBuffer;
	}

}

/**
 * @readonly
 * @type {String}
 * @default 'quaternion'
 */
QuaternionKeyframeTrack.prototype.valueTypeName = 'quaternion';

export { QuaternionKeyframeTrack };