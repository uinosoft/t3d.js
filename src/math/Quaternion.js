import { Matrix4 } from './Matrix4.js';

/**
 * The Quaternion class
 * @memberof t3d
 */
class Quaternion {

	/**
	 * @param {Number} [x=0] - x coordinate
	 * @param {Number} [y=0] - y coordinate
	 * @param {Number} [z=0] - z coordinate
	 * @param {Number} [w=1] - w coordinate
	 */
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
	}

	/**
	 * Slerp method, operates directly on flat arrays of numbers.
	 * @param {Number[]} dst - The output array.
	 * @param {Number} dstOffset - An offset into the output array.
	 * @param {Number[]} src0 - The source array of the starting quaternion.
	 * @param {Number} srcOffset0 - An offset into the array src0.
	 * @param {Number[]} src1 - The source array of the target quatnerion.
	 * @param {Number} srcOffset1 - An offset into the array src1.
	 * @param {Number} t - Normalized interpolation factor (between 0 and 1).
	 */
	static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
		// fuzz-free, array-based Quaternion SLERP operation

		let x0 = src0[srcOffset0 + 0],
			y0 = src0[srcOffset0 + 1],
			z0 = src0[srcOffset0 + 2],
			w0 = src0[srcOffset0 + 3];

		const x1 = src1[srcOffset1 + 0],
			y1 = src1[srcOffset1 + 1],
			z1 = src1[srcOffset1 + 2],
			w1 = src1[srcOffset1 + 3];

		if (t === 0) {
			dst[dstOffset] = x0;
			dst[dstOffset + 1] = y0;
			dst[dstOffset + 2] = z0;
			dst[dstOffset + 3] = w0;
			return;
		}

		if (t === 1) {
			dst[dstOffset] = x1;
			dst[dstOffset + 1] = y1;
			dst[dstOffset + 2] = z1;
			dst[dstOffset + 3] = w1;
			return;
		}

		if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
			let s = 1 - t;

			const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
				dir = (cos >= 0 ? 1 : -1),
				sqrSin = 1 - cos * cos;

			// Skip the Slerp for tiny steps to avoid numeric problems:
			if (sqrSin > Number.EPSILON) {
				const sin = Math.sqrt(sqrSin),
					len = Math.atan2(sin, cos * dir);

				s = Math.sin(s * len) / sin;
				t = Math.sin(t * len) / sin;
			}

			const tDir = t * dir;

			x0 = x0 * s + x1 * tDir;
			y0 = y0 * s + y1 * tDir;
			z0 = z0 * s + z1 * tDir;
			w0 = w0 * s + w1 * tDir;

			// Normalize in case we just did a lerp:
			if (s === 1 - t) {
				const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);

				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;
			}
		}

		dst[dstOffset] = x0;
		dst[dstOffset + 1] = y0;
		dst[dstOffset + 2] = z0;
		dst[dstOffset + 3] = w0;
	}

	/**
	 * Multipley quaternions, but operates directly on flat arrays of numbers.
	 * @param {Number[]} dst - The output array.
	 * @param {Number} dstOffset - An offset into the output array.
	 * @param {Number[]} src0 - The source array of the starting quaternion.
	 * @param {Number} srcOffset0 - An offset into the array src0.
	 * @param {Number[]} src1 - The source array of the target quatnerion.
	 * @param {Number} srcOffset1 - An offset into the array src1.
	 * @return {Number[]}
	 */
	static multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
		const x0 = src0[srcOffset0];
		const y0 = src0[srcOffset0 + 1];
		const z0 = src0[srcOffset0 + 2];
		const w0 = src0[srcOffset0 + 3];

		const x1 = src1[srcOffset1];
		const y1 = src1[srcOffset1 + 1];
		const z1 = src1[srcOffset1 + 2];
		const w1 = src1[srcOffset1 + 3];

		dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
		dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
		dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
		dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

		return dst;
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
	 * @type {Number}
	 */
	get w() {
		return this._w;
	}

	/**
	 * @type {Number}
	 */
	set w(value) {
		this._w = value;
		this.onChangeCallback();
	}

	/**
	 * Normalizes this quaternion - that is, calculated the quaternion that performs the same rotation as this one,
	 * but has length equal to 1.
	 * @return {t3d.Quaternion}
	 */
	normalize() {
		let l = this.length();

		if (l === 0) {
			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;
		} else {
			l = 1 / l;

			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;
		}

		this.onChangeCallback();

		return this;
	}

	/**
	 * Computes the Euclidean length (straight-line length) of this quaternion, considered as a 4 dimensional vector.
	 * @return {Number}
	 */
	length() {
		return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
	}

	/**
	 * Linearly interpolates between two quaternions.
	 * @param {t3d.Quaternion} q1
	 * @param {t3d.Quaternion} q2
	 * @param {Number} ratio
	 * @return {t3d.Quaternion}
	 */
	lerpQuaternions(q1, q2, ratio) {
		if (ratio === 0) return this.copy(q1);
		if (ratio === 1) return this.copy(q2);

		const w1 = q1._w, x1 = q1._x, y1 = q1._y, z1 = q1._z;
		let w2 = q2._w, x2 = q2._x, y2 = q2._y, z2 = q2._z;

		const dot = w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2;

		// shortest direction
		if (dot < 0) {
			w2 = -w2;
			x2 = -x2;
			y2 = -y2;
			z2 = -z2;
		}

		this._w = w1 + ratio * (w2 - w1);
		this._x = x1 + ratio * (x2 - x1);
		this._y = y1 + ratio * (y2 - y1);
		this._z = z1 + ratio * (z2 - z1);

		const len = 1.0 / Math.sqrt(this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z);

		this._w *= len;
		this._x *= len;
		this._y *= len;
		this._z *= len;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Spherically interpolates between two quaternions
	 * providing an interpolation between rotations with constant angle change rate.
	 * @param {t3d.Quaternion} q1
	 * @param {t3d.Quaternion} q2
	 * @param {Number} ratio
	 * @return {t3d.Quaternion}
	 */
	slerpQuaternions(q1, q2, ratio) {
		if (ratio === 0) return this.copy(q1);
		if (ratio === 1) return this.copy(q2);

		const w1 = q1._w, x1 = q1._x, y1 = q1._y, z1 = q1._z;
		let w2 = q2._w, x2 = q2._x, y2 = q2._y, z2 = q2._z;

		let dot = w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2;

		// shortest direction
		if (dot < 0) {
			dot = -dot;
			w2 = -w2;
			x2 = -x2;
			y2 = -y2;
			z2 = -z2;
		}

		if (dot < 0.95) {
			const angle = Math.acos(dot);
			const s = 1 / Math.sin(angle);
			const s1 = Math.sin(angle * (1 - ratio)) * s;
			const s2 = Math.sin(angle * ratio) * s;

			this._w = w1 * s1 + w2 * s2;
			this._x = x1 * s1 + x2 * s2;
			this._y = y1 * s1 + y2 * s2;
			this._z = z1 * s1 + z2 * s2;
		} else {
			// nearly identical angle, interpolate linearly
			this._w = w1 + ratio * (w2 - w1);
			this._x = x1 + ratio * (x2 - x1);
			this._y = y1 + ratio * (y2 - y1);
			this._z = z1 + ratio * (z2 - z1);

			const len = 1.0 / Math.sqrt(this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z);

			this._w *= len;
			this._x *= len;
			this._y *= len;
			this._z *= len;
		}

		this.onChangeCallback();

		return this;
	}

	/**
	 * Sets x, y, z, w properties of this quaternion.
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 * @param {Number} w
	 * @return {t3d.Quaternion}
	 */
	set(x = 0, y = 0, z = 0, w = 1) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Creates a new Quaternion with identical x, y, z and w properties to this one.
	 * @return {t3d.Quaternion}
	 */
	clone() {
		return new Quaternion(this._x, this._y, this._z, this._w);
	}

	/**
	 * Copies the x, y, z and w properties of q into this quaternion.
	 * @param {t3d.Quaternion} quaternion
	 * @return {t3d.Quaternion}
	 */
	copy(quaternion) {
		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = (quaternion.w !== undefined) ? quaternion.w : 1;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Sets this quaternion from the rotation specified by Euler angle.
	 * @param {t3d.Euler} euler
	 * @param {Boolean} [update=true] - Whether to notify quaternion angle has changed
	 * @return {t3d.Quaternion}
	 */
	setFromEuler(euler, update = true) {
		const c1 = Math.cos(euler._x / 2);
		const c2 = Math.cos(euler._y / 2);
		const c3 = Math.cos(euler._z / 2);
		const s1 = Math.sin(euler._x / 2);
		const s2 = Math.sin(euler._y / 2);
		const s3 = Math.sin(euler._z / 2);

		const order = euler._order;

		if (order === 'XYZ') {
			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if (order === 'YXZ') {
			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;
		} else if (order === 'ZXY') {
			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if (order === 'ZYX') {
			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;
		} else if (order === 'YZX') {
			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;
		} else if (order === 'XZY') {
			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;
		}

		if (update === true) this.onChangeCallback();

		return this;
	}

	/**
	 * Sets this quaternion from rotation component of m.
	 * @param {t3d.Matrix4} m
	 * @return {t3d.Quaternion}
	 */
	setFromRotationMatrix(m) {
		const te = m.elements,

			m11 = te[0], m12 = te[4], m13 = te[8],
			m21 = te[1], m22 = te[5], m23 = te[9],
			m31 = te[2], m32 = te[6], m33 = te[10],

			trace = m11 + m22 + m33;

		let	s;

		if (trace > 0) {
			s = 0.5 / Math.sqrt(trace + 1.0);

			this._w = 0.25 / s;
			this._x = (m32 - m23) * s;
			this._y = (m13 - m31) * s;
			this._z = (m21 - m12) * s;
		} else if (m11 > m22 && m11 > m33) {
			s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

			this._w = (m32 - m23) / s;
			this._x = 0.25 * s;
			this._y = (m12 + m21) / s;
			this._z = (m13 + m31) / s;
		} else if (m22 > m33) {
			s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

			this._w = (m13 - m31) / s;
			this._x = (m12 + m21) / s;
			this._y = 0.25 * s;
			this._z = (m23 + m32) / s;
		} else {
			s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

			this._w = (m21 - m12) / s;
			this._x = (m13 + m31) / s;
			this._y = (m23 + m32) / s;
			this._z = 0.25 * s;
		}

		this.onChangeCallback();

		return this;
	}

	/**
	 * vFrom and vTo are assumed to be normalized.
	 * @param {t3d.Vector3} vFrom
	 * @param {t3d.Vector3} vTo
	 * @return {t3d.Quaternion}
	 */
	setFromUnitVectors(vFrom, vTo) {
		// http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

		// assumes direction vectors vFrom and vTo are normalized

		let r = vFrom.dot(vTo) + 1;

		if (r < Number.EPSILON) {
			r = 0;

			if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
				this._x = -vFrom.y;
				this._y = vFrom.x;
				this._z = 0;
				this._w = r;
			} else {
				this._x = 0;
				this._y = -vFrom.z;
				this._z = vFrom.y;
				this._w = r;
			}
		} else {
			// crossVectors(vFrom, vTo); // inlined to avoid cyclic dependency on Vector3

			this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
			this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
			this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
			this._w = r;
		}

		return this.normalize();
	}

	/**
	 * Multiplies this quaternion by q.
	 * @param {t3d.Quaternion} q
	 * @return {t3d.Quaternion}
	 */
	multiply(q) {
		return this.multiplyQuaternions(this, q);
	}

	/**
	 * Pre-multiplies this quaternion by q.
	 * @param {t3d.Quaternion} q
	 * @return {t3d.Quaternion}
	 */
	premultiply(q) {
		return this.multiplyQuaternions(q, this);
	}

	/**
	 * Sets this quaternion to a x b.
	 * @param {t3d.Quaternion} a
	 * @param {t3d.Quaternion} b
	 * @return {t3d.Quaternion}
	 */
	multiplyQuaternions(a, b) {
		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Convert the current quaternion to a matrix4
	 * @param {t3d.Matrix4} target
	 * @return {t3d.Matrix4}
	 */
	toMatrix4(target = new Matrix4()) {
		const ele = target.elements;

		const xy2 = 2.0 * this._x * this._y, xz2 = 2.0 * this._x * this._z, xw2 = 2.0 * this._x * this._w;
		const yz2 = 2.0 * this._y * this._z, yw2 = 2.0 * this._y * this._w, zw2 = 2.0 * this._z * this._w;
		const xx = this._x * this._x, yy = this._y * this._y, zz = this._z * this._z, ww = this._w * this._w;

		ele[0] = xx - yy - zz + ww;
		ele[4] = xy2 - zw2;
		ele[8] = xz2 + yw2;
		ele[12] = 0;
		ele[1] = xy2 + zw2;
		ele[5] = -xx + yy - zz + ww;
		ele[9] = yz2 - xw2;
		ele[13] = 0;
		ele[2] = xz2 - yw2;
		ele[6] = yz2 + xw2;
		ele[10] = -xx - yy + zz + ww;
		ele[14] = 0;
		ele[3] = 0.0;
		ele[7] = 0.0;
		ele[11] = 0;
		ele[15] = 1;

		return target;
	}

	/**
	 * Returns the rotational conjugate of this quaternion.
	 * The conjugate of a quaternion represents the same rotation in the opposite direction about the rotational axis.
	 * @return {t3d.Quaternion}
	 */
	conjugate() {
		this._x *= -1;
		this._y *= -1;
		this._z *= -1;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Calculates the dot product of quaternions v and this one.
	 * @param {t3d.Quaternion} v
	 * @return {t3d.Quaternion}
	 */
	dot(v) {
		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
	}

	/**
	 * Set quaternion from axis angle
	 * @param {t3d.Vector3} axis
	 * @param {Number} angle
	 * @return {t3d.Quaternion}
	 */
	setFromAxisAngle(axis, angle) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		const halfAngle = angle / 2, s = Math.sin(halfAngle);

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos(halfAngle);

		this.onChangeCallback();

		return this;
	}

	/**
	 * Sets this quaternion's x, y, z and w properties from an array.
	 * @param {Number[]} - array of format (x, y, z, w) used to construct the quaternion.
	 * @param {Number} [offset=0] - an offset into the array.
	 * @return {t3d.Quaternion}
	 */
	fromArray(array, offset = 0) {
		this._x = array[offset];
		this._y = array[offset + 1];
		this._z = array[offset + 2];
		this._w = array[offset + 3];

		this.onChangeCallback();

		return this;
	}

	/**
	 * Returns the numerical elements of this quaternion in an array of format [x, y, z, w].
	 * @param {Number[]} [array] - An array to store the quaternion. If not specified, a new array will be created.
	 * @param {Number} [offset=0] - An offset into the array.
	 * @return {t3d.Quaternion}
	 */
	toArray(array = [], offset = 0) {
		array[offset] = this._x;
		array[offset + 1] = this._y;
		array[offset + 2] = this._z;
		array[offset + 3] = this._w;

		return array;
	}

	/**
	 * @param {Function} callback - When the Quaternion angle value changes, the callback method is triggered
	 * @return {t3d.Quaternion}
	 */
	onChange(callback) {
		this.onChangeCallback = callback;
		return this;
	}

	onChangeCallback() {}

}

export { Quaternion };