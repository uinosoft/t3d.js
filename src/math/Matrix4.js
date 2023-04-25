import { Vector3 } from './Vector3.js';

/**
 * 4x4 matrix class.
 * @constructor
 * @memberof t3d
 */
class Matrix4 {

	/**
	 * Create a 4x4 matrix.
	 */
	constructor() {
		// Keep Matrix elements in double precision for added precision
		// https:// github.com/mrdoob/three.js/pull/10702
		this.elements = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	}

	/**
	 * Resets this matrix to the identity matrix.
	 * @return {t3d.Matrix4}
	 */
	identity() {
		return this.set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		);
	}

	/**
	 * Check if the current matrix is identity.
	 * @returns {Boolean} true is the matrix is the identity matrix
	 */
	isIdentity() {
		const te = this.elements;
		return te[0] === 1 && te[4] === 0 && te[8] === 0 && te[12] === 0
			&& te[1] === 0 && te[5] === 1 && te[9] === 0 && te[13] === 0
			&& te[2] === 0 && te[6] === 0 && te[10] === 1 && te[14] === 0
			&& te[3] === 0 && te[7] === 0 && te[11] === 0 && te[15] === 1;
	}

	/**
	 * Set the elements of this matrix to the supplied row-major values n11, n12, ... n44.
	 * @param {Number} n11
	 * @param {Number} n12
	 * @param {Number} n13
	 * @param {Number} n14
	 * @param {Number} n21
	 * @param {Number} n22
	 * @param {Number} n23
	 * @param {Number} n24
	 * @param {Number} n31
	 * @param {Number} n32
	 * @param {Number} n33
	 * @param {Number} n34
	 * @param {Number} n41
	 * @param {Number} n42
	 * @param {Number} n43
	 * @param {Number} n44
	 * @return {t3d.Matrix4}
	 */
	set(n11, n12, n13, n14, n21, n22, n23, n24,
		n31, n32, n33, n34,
		n41, n42, n43, n44) {
		const ele = this.elements;

		ele[0] = n11; ele[4] = n12; ele[8] = n13; ele[12] = n14;
		ele[1] = n21; ele[5] = n22; ele[9] = n23; ele[13] = n24;
		ele[2] = n31; ele[6] = n32; ele[10] = n33; ele[14] = n34;
		ele[3] = n41; ele[7] = n42; ele[11] = n43; ele[15] = n44;

		return this;
	}

	/**
	 * Creates a new Matrix4 with identical elements to this one.
	 * @return {t3d.Matrix4}
	 */
	clone() {
		return new Matrix4().fromArray(this.elements);
	}

	/**
	 * Copies the elements of matrix m into this matrix.
	 * @param {t3d.Matrix4} m
	 * @return {t3d.Matrix4}
	 */
	copy(m) {
		const te = this.elements;
		const me = m.elements;

		te[0] = me[0]; te[1] = me[1]; te[2] = me[2]; te[3] = me[3];
		te[4] = me[4]; te[5] = me[5]; te[6] = me[6]; te[7] = me[7];
		te[8] = me[8]; te[9] = me[9]; te[10] = me[10]; te[11] = me[11];
		te[12] = me[12]; te[13] = me[13]; te[14] = me[14]; te[15] = me[15];

		return this;
	}

	/**
	 * Sets this matrix as a translation transform.
	 * @param {Number} x - the amount to translate in the X axis.
	 * @param {Number} y - the amount to translate in the Y axis.
	 * @param {Number} z - the amount to translate in the Z axis.
	 * @return {t3d.Matrix4}
	 */
	makeTranslation(x, y, z) {
		return this.set(
			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1
		);
	}

	/**
	 * Post-multiplies this matrix by m.
	 * @param {t3d.Matrix4} m
	 * @return {t3d.Matrix4}
	 */
	multiply(m) {
		return this.multiplyMatrices(this, m);
	}

	/**
	 * Pre-multiplies this matrix by m.
	 * @param {t3d.Matrix4} m
	 * @return {t3d.Matrix4}
	 */
	premultiply(m) {
		return this.multiplyMatrices(m, this);
	}

	/**
	 * Sets this matrix to a x b.
	 * @param {t3d.Matrix4} a
	 * @param {t3d.Matrix4} b
	 * @return {t3d.Matrix4}
	 */
	multiplyMatrices(a, b) {
		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;

		const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
		const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
		const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
		const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

		const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
		const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
		const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
		const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

		te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;
	}

	/**
	 * Transposes this matrix.
	 * @return {t3d.Matrix4}
	 */
	transpose() {
		const te = this.elements;
		let tmp;

		tmp = te[1]; te[1] = te[4]; te[4] = tmp;
		tmp = te[2]; te[2] = te[8]; te[8] = tmp;
		tmp = te[6]; te[6] = te[9]; te[9] = tmp;

		tmp = te[3]; te[3] = te[12]; te[12] = tmp;
		tmp = te[7]; te[7] = te[13]; te[13] = tmp;
		tmp = te[11]; te[11] = te[14]; te[14] = tmp;

		return this;
	}

	/**
	 * Take the inverse of this matrix
	 * @return {t3d.Matrix4}
	 */
	inverse() {
		return this.getInverse(this);
	}

	/**
	 * Take the inverse of the matrix
	 * @return {t3d.Matrix4}
	 */
	getInverse(m) {
		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		const te = this.elements, me = m.elements,

			n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
			n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
			n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
			n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

			t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
			t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
			t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
			t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

		const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

		if (det === 0) {
			console.warn('Matrix4: can not invert matrix, determinant is 0');
			return this.identity();
		}

		const detInv = 1 / det;

		te[0] = t11 * detInv;
		te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
		te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
		te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

		te[4] = t12 * detInv;
		te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
		te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
		te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

		te[8] = t13 * detInv;
		te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
		te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
		te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

		te[12] = t14 * detInv;
		te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
		te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
		te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

		return this;
	}

	/**
	 * Make transform from position&scale&quaternion(Quaternion).
	 * @param {t3d.Vector3} position
	 * @param {t3d.Vector3} scale
	 * @param {t3d.Quaternion} quaternion
	 * @return {t3d.Matrix4}
	 */
	transform(position, scale, quaternion) {
		const te = this.elements;

		const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
		const x2 = x + x,	y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		const sx = scale.x, sy = scale.y, sz = scale.z;

		te[0] = (1 - (yy + zz)) * sx;
		te[1] = (xy + wz) * sx;
		te[2] = (xz - wy) * sx;
		te[3] = 0;

		te[4] = (xy - wz) * sy;
		te[5] = (1 - (xx + zz)) * sy;
		te[6] = (yz + wx) * sy;
		te[7] = 0;

		te[8] = (xz + wy) * sz;
		te[9] = (yz - wx) * sz;
		te[10] = (1 - (xx + yy)) * sz;
		te[11] = 0;

		te[12] = position.x;
		te[13] = position.y;
		te[14] = position.z;
		te[15] = 1;

		return this;
	}

	/**
	 * Sets the rotation component of this matrix to the rotation specified by q, as outlined here.
	 * @param {t3d.Quaternion} q
	 * @return {t3d.Matrix4}
	 */
	makeRotationFromQuaternion(q) {
		const te = this.elements;

		const x = q.x, y = q.y, z = q.z, w = q.w;
		const x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		te[0] = 1 - (yy + zz);
		te[4] = xy - wz;
		te[8] = xz + wy;

		te[1] = xy + wz;
		te[5] = 1 - (xx + zz);
		te[9] = yz - wx;

		te[2] = xz - wy;
		te[6] = yz + wx;
		te[10] = 1 - (xx + yy);

		// last column
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;

		// bottom row
		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;

		return this;
	}

	/**
	 * Extracts the rotation component of the supplied matrix m into this matrix's rotation component.
	 * @return {t3d.Matrix4}
	 */
	extractRotation(m) {
		// this method does not support reflection matrices

		const te = this.elements;
		const me = m.elements;

		const scaleX = 1 / _vec3_1.setFromMatrixColumn(m, 0).getLength();
		const scaleY = 1 / _vec3_1.setFromMatrixColumn(m, 1).getLength();
		const scaleZ = 1 / _vec3_1.setFromMatrixColumn(m, 2).getLength();

		te[0] = me[0] * scaleX;
		te[1] = me[1] * scaleX;
		te[2] = me[2] * scaleX;
		te[3] = 0;

		te[4] = me[4] * scaleY;
		te[5] = me[5] * scaleY;
		te[6] = me[6] * scaleY;
		te[7] = 0;

		te[8] = me[8] * scaleZ;
		te[9] = me[9] * scaleZ;
		te[10] = me[10] * scaleZ;
		te[11] = 0;

		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;

		return this;
	}

	/**
	 * Constructs a rotation matrix, looking from eye towards center oriented by the up vector.
	 * @param {t3d.Vector3} eye
	 * @param {t3d.Vector3} target
	 * @param {t3d.Vector3} update
	 * @return {t3d.Matrix4}
	 */
	lookAtRH(eye, target, up) {
		const te = this.elements;

		_z.subVectors(eye, target);

		if (_z.getLengthSquared() === 0) {
			// eye and target are in the same position
			_z.z = 1;
		}

		_z.normalize();
		_x.crossVectors(up, _z);

		if (_x.getLengthSquared() === 0) {
			// up and z are parallel

			if (Math.abs(up.z) === 1) {
				_z.x += 0.0001;
			} else {
				_z.z += 0.0001;
			}

			_z.normalize();
			_x.crossVectors(up, _z);
		}

		_x.normalize();
		_y.crossVectors(_z, _x);

		te[0] = _x.x; te[4] = _y.x; te[8] = _z.x;
		te[1] = _x.y; te[5] = _y.y; te[9] = _z.y;
		te[2] = _x.z; te[6] = _y.z; te[10] = _z.z;

		return this;
	}

	/**
	 * Decomposes this matrix into it's position, quaternion and scale components.
	 * @param {t3d.Vector3} position
	 * @param {t3d.Quaternion} quaternion
	 * @param {t3d.Vector3} scale
	 * @return {t3d.Matrix4}
	 */
	decompose(position, quaternion, scale) {
		const te = this.elements;

		let sx = _vec3_1.set(te[0], te[1], te[2]).getLength();
		const sy = _vec3_1.set(te[4], te[5], te[6]).getLength();
		const sz = _vec3_1.set(te[8], te[9], te[10]).getLength();

		// if determine is negative, we need to invert one scale
		const det = this.determinant();
		if (det < 0) {
			sx = -sx;
		}

		position.x = te[12];
		position.y = te[13];
		position.z = te[14];

		// scale the rotation part
		_mat4_1.copy(this);

		const invSX = 1 / sx;
		const invSY = 1 / sy;
		const invSZ = 1 / sz;

		_mat4_1.elements[0] *= invSX;
		_mat4_1.elements[1] *= invSX;
		_mat4_1.elements[2] *= invSX;

		_mat4_1.elements[4] *= invSY;
		_mat4_1.elements[5] *= invSY;
		_mat4_1.elements[6] *= invSY;

		_mat4_1.elements[8] *= invSZ;
		_mat4_1.elements[9] *= invSZ;
		_mat4_1.elements[10] *= invSZ;

		quaternion.setFromRotationMatrix(_mat4_1);

		scale.x = sx;
		scale.y = sy;
		scale.z = sz;

		return this;
	}

	/**
	 * Computes and returns the determinant of this matrix.
	 * @return {Number}
	 */
	determinant() {
		const te = this.elements;

		const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
		const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
		const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
		const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

		// TODO: make this more efficient
		// ( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n41 * (+n14 * n23 * n32 -
				n13 * n24 * n32 -
				n14 * n22 * n33 +
				n12 * n24 * n33 +
				n13 * n22 * n34 -
				n12 * n23 * n34
			) +
			n42 * (+n11 * n23 * n34 -
				n11 * n24 * n33 +
				n14 * n21 * n33 -
				n13 * n21 * n34 +
				n13 * n24 * n31 -
				n14 * n23 * n31
			) +
			n43 * (+n11 * n24 * n32 -
				n11 * n22 * n34 -
				n14 * n21 * n32 +
				n12 * n21 * n34 +
				n14 * n22 * n31 -
				n12 * n24 * n31
			) +
			n44 * (-n13 * n22 * n31 -
				n11 * n23 * n32 +
				n11 * n22 * n33 +
				n13 * n21 * n32 -
				n12 * n21 * n33 +
				n12 * n23 * n31
			)

		);
	}

	/**
	 * Sets the elements of this matrix based on an array in column-major format.
	 * @param {Number[]} array
	 * @param {Number} [offset=0]
	 * @return {t3d.Matrix4}
	 */
	fromArray(array, offset = 0) {
		for (let i = 0; i < 16; i++) {
			this.elements[i] = array[i + offset];
		}

		return this;
	}

	/**
	 * Gets the maximum scale value of the 3 axes.
	 * @return {Number}
	 */
	getMaxScaleOnAxis() {
		const te = this.elements;

		const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
		const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
		const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

		return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
	}

	/**
	 * Sets this matrix as rotation transform around axis by theta radians.
	 * @param {t3d.Vector3} axis
	 * @param {Number} angle
	 * @return {t3d.Matrix4}
	 */
	makeRotationAxis(axis, angle) {
		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		const c = Math.cos(angle);
		const s = Math.sin(angle);
		const t = 1 - c;
		const x = axis.x, y = axis.y, z = axis.z;
		const tx = t * x, ty = t * y;

		return this.set(
			tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1
		);
	}

	/**
	 * Return true if this matrix and m are equal.
	 * @param {t3d.Matrix4} m
	 * @return {Boolean}
	 */
	equals(m) {
		const te = this.elements;
		const me = m.elements;

		for (let i = 0; i < 16; i++) {
			if (te[i] !== me[i]) return false;
		}

		return true;
	}

	/**
	 * Writes the elements of this matrix to an array in column-major format.
	 * @param {Number[]} [array]
	 * @param {Number} [offset=0]
	 * @return {Number[]}
	 */
	toArray(array = [], offset = 0) {
		const te = this.elements;

		array[offset] = te[0];
		array[offset + 1] = te[1];
		array[offset + 2] = te[2];
		array[offset + 3] = te[3];

		array[offset + 4] = te[4];
		array[offset + 5] = te[5];
		array[offset + 6] = te[6];
		array[offset + 7] = te[7];

		array[offset + 8] = te[8];
		array[offset + 9] = te[9];
		array[offset + 10] = te[10];
		array[offset + 11] = te[11];

		array[offset + 12] = te[12];
		array[offset + 13] = te[13];
		array[offset + 14] = te[14];
		array[offset + 15] = te[15];

		return array;
	}

}

const _vec3_1 = new Vector3();
const _mat4_1 = new Matrix4();

const _x = new Vector3();
const _y = new Vector3();
const _z = new Vector3();

export { Matrix4 };