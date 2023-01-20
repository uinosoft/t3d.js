import { Matrix4 } from './Matrix4.js';

const _matrix = new Matrix4();

/**
 * Euler class.
 * @memberof t3d
 */
class Euler {

	/**
	 * @param {Number} [x=0]
	 * @param {Number} [y=0]
	 * @param {Number} [z=0]
	 * @param {String} [order=t3d.Euler.DefaultOrder]
	 */
	constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;
	}

	/**
	 * @type {Number}
	 */
	get x() {
		return this._x;
	}

	/**
	 * @type {Number}
	 */
	set x(value) {
		this._x = value;
		this.onChangeCallback();
	}

	/**
	 * @type {Number}
	 */
	get y() {
		return this._y;
	}

	/**
	 * @type {Number}
	 */
	set y(value) {
		this._y = value;
		this.onChangeCallback();
	}

	/**
	 * @type {Number}
	 */
	get z() {
		return this._z;
	}

	/**
	 * @type {Number}
	 */
	set z(value) {
		this._z = value;
		this.onChangeCallback();
	}

	/**
	 * @type {String}
	 */
	get order() {
		return this._order;
	}

	/**
	 * @type {String}
	 */
	set order(value) {
		this._order = value;
		this.onChangeCallback();
	}

	/**
     * Returns a new Euler with the same parameters as this one.
	 * @return {t3d.Euler}
     */
	clone() {
		return new Euler(this._x, this._y, this._z, this._order);
	}

	/**
	 * Copies value of euler to this euler.
     * @param {t3d.Euler} euler
	 * @return {t3d.Euler}
     */
	copy(euler) {
		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;

		this.onChangeCallback();

		return this;
	}

	/**
     * @param {Number} x - the angle of the x axis in radians.
     * @param {Number} y - the angle of the y axis in radians.
     * @param {Number} z - the angle of the z axis in radians.
     * @param {String} order - (optional) a string representing the order that the rotations are applied.
	 * @return {t3d.Euler}
     */
	set(x = 0, y = 0, z = 0, order = this._order) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Sets the angles of this euler transform from a pure rotation matrix based on the orientation specified by order.
     * @param {t3d.Matrix4} m - a Matrix4 of which the upper 3x3 of matrix is a pure rotation matrix
     * @param {String} order - (optional) a string representing the order that the rotations are applied.
     * @param {Boolean} [update=true] - Whether to notify Euler angle has changed
	 * @return {t3d.Euler}
     */
	setFromRotationMatrix(m, order = this._order, update = true) {
		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements;
		const m11 = te[0], m12 = te[4], m13 = te[8];
		const m21 = te[1], m22 = te[5], m23 = te[9];
		const m31 = te[2], m32 = te[6], m33 = te[10];

		if (order === 'XYZ') {
			this._y = Math.asin(clamp(m13, -1, 1));

			if (Math.abs(m13) < 0.99999) {
				this._x = Math.atan2(-m23, m33);
				this._z = Math.atan2(-m12, m11);
			} else {
				this._x = Math.atan2(m32, m22);
				this._z = 0;
			}
		} else if (order === 'YXZ') {
			this._x = Math.asin(-clamp(m23, -1, 1));

			if (Math.abs(m23) < 0.99999) {
				this._y = Math.atan2(m13, m33);
				this._z = Math.atan2(m21, m22);
			} else {
				this._y = Math.atan2(-m31, m11);
				this._z = 0;
			}
		} else if (order === 'ZXY') {
			this._x = Math.asin(clamp(m32, -1, 1));

			if (Math.abs(m32) < 0.99999) {
				this._y = Math.atan2(-m31, m33);
				this._z = Math.atan2(-m12, m22);
			} else {
				this._y = 0;
				this._z = Math.atan2(m21, m11);
			}
		} else if (order === 'ZYX') {
			this._y = Math.asin(-clamp(m31, -1, 1));

			if (Math.abs(m31) < 0.99999) {
				this._x = Math.atan2(m32, m33);
				this._z = Math.atan2(m21, m11);
			} else {
				this._x = 0;
				this._z = Math.atan2(-m12, m22);
			}
		} else if (order === 'YZX') {
			this._z = Math.asin(clamp(m21, -1, 1));

			if (Math.abs(m21) < 0.99999) {
				this._x = Math.atan2(-m23, m22);
				this._y = Math.atan2(-m31, m11);
			} else {
				this._x = 0;
				this._y = Math.atan2(m13, m33);
			}
		} else if (order === 'XZY') {
			this._z = Math.asin(-clamp(m12, -1, 1));

			if (Math.abs(m12) < 0.99999) {
				this._x = Math.atan2(m32, m22);
				this._y = Math.atan2(m13, m11);
			} else {
				this._x = Math.atan2(-m23, m33);
				this._y = 0;
			}
		} else {
			console.warn('given unsupported order: ' + order);
		}

		this._order = order;

		if (update === true) this.onChangeCallback();

		return this;
	}

	/**
     * Sets the angles of this euler transform from a normalized quaternion based on the orientation specified by order.
	 * @param {t3d.Quaternion} q - a normalized quaternion.
	 * @param {String} order - (optional) a string representing the order that the rotations are applied.
	 * @param {Boolean} [update=true] - Whether to notify Euler angle has changed
	 * @return {t3d.Euler}
     */
	setFromQuaternion(q, order, update) {
		q.toMatrix4(_matrix);
		return this.setFromRotationMatrix(_matrix, order, update);
	}

	/**
	 * @param {Function} callback - When the Euler angle value changes, the callback method is triggered
	 * @return {t3d.Euler}
	 */
	onChange(callback) {
		this.onChangeCallback = callback;
		return this;
	}

	onChangeCallback() {}

}

/**
 * The order in which to apply rotations.
 * @readonly
 */
Euler.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];

/**
  * The default order in which to apply rotations.
  * @readonly
  */
Euler.DefaultOrder = 'XYZ';

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

export { Euler };