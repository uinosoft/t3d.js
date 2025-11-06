import { MathUtils } from './MathUtils.js';
import { Matrix4 } from './Matrix4.js';

/**
 * Class for representing a Quaternion.
 */
class Quaternion {

	/**
	 * Constructs a new quaternion.
	 * @param {number} [x=0] - The x value of this quaternion.
	 * @param {number} [y=0] - The y value of this quaternion.
	 * @param {number} [z=0] - The z value of this quaternion.
	 * @param {number} [w=1] - The w value of this quaternion.
	 */
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
	}

	/**
	 * Interpolates between two quaternions via SLERP. This implementation assumes the
	 * quaternion data are managed in flat arrays.
	 * @param {Array<number>} dst - The destination array.
	 * @param {number} dstOffset - An offset into the destination array.
	 * @param {Array<number>} src0 - The source array of the first quaternion.
	 * @param {number} srcOffset0 - An offset into the first source array.
	 * @param {Array<number>} src1 -  The source array of the second quaternion.
	 * @param {number} srcOffset1 - An offset into the second source array.
	 * @param {number} t - The interpolation factor in the range `[0,1]`.
	 * @see {@link Quaternion#slerp}
	 */
	static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
		let x0 = src0[srcOffset0 + 0],
			y0 = src0[srcOffset0 + 1],
			z0 = src0[srcOffset0 + 2],
			w0 = src0[srcOffset0 + 3];

		let x1 = src1[srcOffset1 + 0],
			y1 = src1[srcOffset1 + 1],
			z1 = src1[srcOffset1 + 2],
			w1 = src1[srcOffset1 + 3];

		if (t <= 0) {
			dst[dstOffset + 0] = x0;
			dst[dstOffset + 1] = y0;
			dst[dstOffset + 2] = z0;
			dst[dstOffset + 3] = w0;

			return;
		}

		if (t >= 1) {
			dst[dstOffset + 0] = x1;
			dst[dstOffset + 1] = y1;
			dst[dstOffset + 2] = z1;
			dst[dstOffset + 3] = w1;

			return;
		}

		if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
			let dot = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;

			if (dot < 0) {
				x1 = -x1;
				y1 = -y1;
				z1 = -z1;
				w1 = -w1;

				dot = -dot;
			}

			let s = 1 - t;

			if (dot < 0.9995) {
				// slerp

				const theta = Math.acos(dot);
				const sin = Math.sin(theta);

				s = Math.sin(s * theta) / sin;
				t = Math.sin(t * theta) / sin;

				x0 = x0 * s + x1 * t;
				y0 = y0 * s + y1 * t;
				z0 = z0 * s + z1 * t;
				w0 = w0 * s + w1 * t;
			} else {
				// for small angles, lerp then normalize

				x0 = x0 * s + x1 * t;
				y0 = y0 * s + y1 * t;
				z0 = z0 * s + z1 * t;
				w0 = w0 * s + w1 * t;

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
	 * Multiplies two quaternions. This implementation assumes the quaternion data are managed
	 * in flat arrays.
	 * @param {Array<number>} dst - The destination array.
	 * @param {number} dstOffset - An offset into the destination array.
	 * @param {Array<number>} src0 - The source array of the first quaternion.
	 * @param {number} srcOffset0 - An offset into the first source array.
	 * @param {Array<number>} src1 -  The source array of the second quaternion.
	 * @param {number} srcOffset1 - An offset into the second source array.
	 * @returns {Array<number>} The destination array.
	 * @see {@link Quaternion#multiplyQuaternions}
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
	 * The x value of this quaternion.
	 * @type {number}
	 * @default 0
	 */
	get x() {
		return this._x;
	}

	set x(value) {
		this._x = value;
		this.onChangeCallback();
	}

	/**
	 * The y value of this quaternion.
	 * @type {number}
	 * @default 0
	 */
	get y() {
		return this._y;
	}

	set y(value) {
		this._y = value;
		this.onChangeCallback();
	}

	/**
	 * The z value of this quaternion.
	 * @type {number}
	 * @default 0
	 */
	get z() {
		return this._z;
	}

	set z(value) {
		this._z = value;
		this.onChangeCallback();
	}

	/**
	 * The w value of this quaternion.
	 * @type {number}
	 * @default 1
	 */
	get w() {
		return this._w;
	}

	set w(value) {
		this._w = value;
		this.onChangeCallback();
	}

	/**
	 * Sets the quaternion components.
	 * @param {number} x - The x value of this quaternion.
	 * @param {number} y - The y value of this quaternion.
	 * @param {number} z - The z value of this quaternion.
	 * @param {number} w - The w value of this quaternion.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	set(x, y, z, w) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Returns a new quaternion with copied values from this instance.
	 * @returns {Quaternion} A clone of this instance.
	 */
	clone() {
		return new Quaternion(this._x, this._y, this._z, this._w);
	}

	/**
	 * Copies the values of the given quaternion to this instance.
	 * @param {Quaternion} quaternion - The quaternion to copy.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	copy(quaternion) {
		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Sets this quaternion from the rotation specified by the given
	 * Euler angles.
	 * @param {Euler} euler - The Euler angles.
	 * @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
	 * @returns {Quaternion} A reference to this quaternion.
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
	 * Sets this quaternion from the given axis and angle.
	 * @param {Vector3} axis - The normalized axis.
	 * @param {number} angle - The angle in radians.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	setFromAxisAngle(axis, angle) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		const halfAngle = angle / 2, s = Math.sin(halfAngle);

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos(halfAngle);

		this.onChangeCallback();

		return this;
	}

	/**
	 * Sets this quaternion from the given rotation matrix.
	 * @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	setFromRotationMatrix(m) {
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

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
	 * Sets this quaternion to the rotation required to rotate the direction vector
	 * `vFrom` to the direction vector `vTo`.
	 * @param {Vector3} vFrom - The first (normalized) direction vector.
	 * @param {Vector3} vTo - The second (normalized) direction vector.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	setFromUnitVectors(vFrom, vTo) {
		// assumes direction vectors vFrom and vTo are normalized

		let r = vFrom.dot(vTo) + 1;

		if (r < 1e-8) {
			// vFrom and vTo point in opposite directions

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
	 * Returns the angle between this quaternion and the given one in radians.
	 * @param {Quaternion} q - The quaternion to compute the angle with.
	 * @returns {number} The angle in radians.
	 */
	angleTo(q) {
		return 2 * Math.acos(Math.abs(MathUtils.clamp(this.dot(q), -1, 1)));
	}

	/**
	 * Sets this quaternion to the identity quaternion; that is, to the
	 * quaternion that represents "no rotation".
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	identity() {
		return this.set(0, 0, 0, 1);
	}

	/**
	 * Returns the rotational conjugate of this quaternion. The conjugate of a
	 * quaternion represents the same rotation in the opposite direction about
	 * the rotational axis.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	conjugate() {
		this._x *= -1;
		this._y *= -1;
		this._z *= -1;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Calculates the dot product of this quaternion and the given one.
	 * @param {Quaternion} v - The quaternion to compute the dot product with.
	 * @returns {number} The result of the dot product.
	 */
	dot(v) {
		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
	}

	/**
	 * Computes the squared Euclidean length (straight-line length) of this quaternion,
	 * considered as a 4 dimensional vector. This can be useful if you are comparing the
	 * lengths of two quaternions, as this is a slightly more efficient calculation than
	 * {@link Quaternion#length}.
	 * @returns {number} The squared Euclidean length.
	 */
	lengthSq() {
		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
	}

	/**
	 * Computes the Euclidean length (straight-line length) of this quaternion,
	 * considered as a 4 dimensional vector.
	 * @returns {number} The Euclidean length.
	 */
	length() {
		return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
	}

	/**
	 * Normalizes this quaternion - that is, calculated the quaternion that performs
	 * the same rotation as this one, but has a length equal to `1`.
	 * @returns {Quaternion} A reference to this quaternion.
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
	 * Multiplies this quaternion by the given one.
	 * @param {Quaternion} q - The quaternion.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	multiply(q) {
		return this.multiplyQuaternions(this, q);
	}

	/**
	 * Pre-multiplies this quaternion by the given one.
	 * @param {Quaternion} q - The quaternion.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	premultiply(q) {
		return this.multiplyQuaternions(q, this);
	}

	/**
	 * Multiplies the given quaternions and stores the result in this instance.
	 * @param {Quaternion} a - The first quaternion.
	 * @param {Quaternion} b - The second quaternion.
	 * @returns {Quaternion} A reference to this quaternion.
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
	 * Linearly interpolates between two quaternions.
	 * @param {Quaternion} q1
	 * @param {Quaternion} q2
	 * @param {number} ratio
	 * @returns {Quaternion}
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
	 * Performs a spherical linear interpolation between quaternions.
	 * @param {Quaternion} qb - The target quaternion.
	 * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	slerp(qb, t) {
		if (t <= 0) return this;

		if (t >= 1) return this.copy(qb); // copy calls _onChangeCallback()

		let x = qb._x, y = qb._y, z = qb._z, w = qb._w;

		let dot = this.dot(qb);

		if (dot < 0) {
			x = -x;
			y = -y;
			z = -z;
			w = -w;

			dot = -dot;
		}

		let s = 1 - t;

		if (dot < 0.9995) {
			// slerp

			const theta = Math.acos(dot);
			const sin = Math.sin(theta);

			s = Math.sin(s * theta) / sin;
			t = Math.sin(t * theta) / sin;

			this._x = this._x * s + x * t;
			this._y = this._y * s + y * t;
			this._z = this._z * s + z * t;
			this._w = this._w * s + w * t;

			this._onChangeCallback();
		} else {
			// for small angles, lerp then normalize

			this._x = this._x * s + x * t;
			this._y = this._y * s + y * t;
			this._z = this._z * s + z * t;
			this._w = this._w * s + w * t;

			this.normalize(); // normalize calls _onChangeCallback()
		}

		return this;
	}

	/**
	 * Performs a spherical linear interpolation between the given quaternions
	 * and stores the result in this quaternion.
	 * @param {Quaternion} qa - The source quaternion.
	 * @param {Quaternion} qb - The target quaternion.
	 * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	slerpQuaternions(qa, qb, t) {
		return this.copy(qa).slerp(qb, t);
	}

	/**
	 * Returns `true` if this quaternion is equal with the given one.
	 * @param {Quaternion} quaternion - The quaternion to test for equality.
	 * @returns {boolean} Whether this quaternion is equal with the given one.
	 */
	equals(quaternion) {
		return (quaternion._x === this._x) && (quaternion._y === this._y) && (quaternion._z === this._z) && (quaternion._w === this._w);
	}

	/**
	 * Sets this quaternion's components from the given array.
	 * @param {Array<number>} array - An array holding the quaternion component values.
	 * @param {number} [offset=0] - The offset into the array.
	 * @param {boolean} [denormalize=false] - If true, denormalize the values, and array should be a typed array.
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	fromArray(array, offset = 0, denormalize = false) {
		let x = array[offset], y = array[offset + 1],
			z = array[offset + 2], w = array[offset + 3];

		if (denormalize) {
			x = MathUtils.denormalize(x, array);
			y = MathUtils.denormalize(y, array);
			z = MathUtils.denormalize(z, array);
			w = MathUtils.denormalize(w, array);
		}

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this.onChangeCallback();

		return this;
	}

	/**
	 * Writes the components of this quaternion to the given array. If no array is provided,
	 * the method returns a new instance.
	 * @param {Array<number>} [array=[]] - The target array holding the quaternion components.
	 * @param {number} [offset=0] - Index of the first element in the array.
	 * @param {boolean} [normalize=false] - If true, normalize the values, and array should be a typed array.
	 * @returns {Quaternion} The quaternion components.
	 */
	toArray(array = [], offset = 0, normalize = false) {
		let x = this._x, y = this._y,
			z = this._z, w = this._w;

		if (normalize) {
			x = MathUtils.normalize(x, array);
			y = MathUtils.normalize(y, array);
			z = MathUtils.normalize(z, array);
			w = MathUtils.normalize(w, array);
		}

		array[offset] = x;
		array[offset + 1] = y;
		array[offset + 2] = z;
		array[offset + 3] = w;

		return array;
	}

	/**
	 * Convert the current quaternion to a matrix4.
	 * @param {Matrix4} target - The target matrix to write the quaternion data to.
	 * @returns {Matrix4} The target matrix with the quaternion data written to it.
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
	 * Registers a callback that is called whenever the quaternion's
	 * angle value changes.
	 * @param {Function} callback - When the Quaternion angle value changes, the callback method is triggered
	 * @returns {Quaternion} A reference to this quaternion.
	 */
	onChange(callback) {
		this.onChangeCallback = callback;
		return this;
	}

	onChangeCallback() {}

	* [Symbol.iterator]() {
		yield this._x;
		yield this._y;
		yield this._z;
		yield this._w;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Quaternion.prototype.isQuaternion = true;

export { Quaternion };