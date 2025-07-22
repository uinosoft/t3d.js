import { Matrix4, Quaternion, Vector3 } from 't3d';

/**
 * LockedTrack class allows an object to track a target position
 * while keeping a specified axis locked in a certain direction.
 */
class LockedTrack {

	/**
	 * Creates an instance of LockedTrack.
	 * @param {Object3D} object - The object to be tracked.
	 */
	constructor(object) {
		/**
		 * The object to track.
		 * @type {Object3D}
		 */
		this.object = object;

		/**
		 * Target position to track.
		 * @type {Vector3}
		 */
		this.target = new Vector3();

		/**
		 * Axis that points to the target.
		 * @type {Vector3}
		 */
		this.trackAxis = new Vector3(0, 0, 1);

		/**
		 * Axis that points upward.
		 * @type {Vector3}
		 */
		this.lockedAxis = new Vector3(0, 1, 0);
	}

	/**
	 * Update the object's rotation to track the target position.
	 */
	update() {
		const object = this.object;
		const target = this.target;

		_inverseMatrix.copy(object.worldMatrix).invert().premultiply(object.matrix);

		_localTarget.copy(target).applyMatrix4(_inverseMatrix);
		_localDirection.copy(_localTarget).normalize();

		_z_axis.set(0, 0, 1);
		_correctionQuat.setFromUnitVectors(_z_axis, this.trackAxis);

		_forward.copy(_localDirection).applyQuaternion(_correctionQuat.conjugate());
		_up.copy(this.lockedAxis);
		_side.crossVectors(_up, _forward).normalize();

		if (_side.getLengthSquared() < 0.0001) {
			_side.crossVectors(this.trackAxis, _forward).normalize();
		}

		_forward.crossVectors(_side, _up).normalize();

		_lookAtMatrix.makeBasis(_side, _up, _forward);
		object.quaternion.setFromRotationMatrix(_lookAtMatrix);

		object.updateMatrix(true);
	}

}

const _inverseMatrix = new Matrix4();

const _localTarget = new Vector3();
const _localDirection = new Vector3();

const _correctionQuat = new Quaternion();
const _z_axis = new Vector3(0, 0, 1);

const _forward = new Vector3();
const _up = new Vector3();
const _side = new Vector3();

const _lookAtMatrix = new Matrix4();

export { LockedTrack };