/**
 * The 3x3 matrix class.
 */
class Matrix3 {

	/**
	 * Create a 3x3 matrix.
	 */
	constructor() {
		this.elements = [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
	}

	/**
	 * Sets the 3x3 matrix values to the given row-major sequence of values.
	 * @param {number} n11 - value to put in row 1, col 1.
	 * @param {number} n12 - value to put in row 1, col 2.
	 * @param {number} n13 - value to put in row 1, col 3.
	 * @param {number} n21 - value to put in row 2, col 1.
	 * @param {number} n22 - value to put in row 2, col 2.
	 * @param {number} n23 - value to put in row 2, col 3.
	 * @param {number} n31 - value to put in row 3, col 1.
	 * @param {number} n32 - value to put in row 3, col 2.
	 * @param {number} n33 - value to put in row 3, col 3.
	 * @returns {Matrix3}
	 */
	set(n11, n12, n13,
		n21, n22, n23,
		n31, n32, n33) {
		const ele = this.elements;

		ele[0] = n11;
		ele[3] = n12;
		ele[6] = n13;

		ele[1] = n21;
		ele[4] = n22;
		ele[7] = n23;

		ele[2] = n31;
		ele[5] = n32;
		ele[8] = n33;

		return this;
	}

	/**
	 * Resets this matrix to the 3x3 identity matrix
	 * @returns {Matrix3}
	 */
	identity() {
		return this.set(
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		);
	}

	/**
	 * Checks if the matrix is an identity matrix.
	 * @returns {boolean} - True if the matrix is an identity matrix, false otherwise.
	 */
	isIdentity() {
		const te = this.elements;
		return te[0] === 1 && te[3] === 0 && te[6] === 0
			&& te[1] === 0 && te[4] === 1 && te[7] === 0
			&& te[2] === 0 && te[5] === 0 && te[8] === 1;
	}

	/**
	 * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
	 * You can not invert with a determinant of zero. If you attempt this, the method produces
	 * a zero matrix instead.
	 * @returns {Matrix3} A reference to this matrix.
	 */
	invert() {
		const te = this.elements,

			n11 = te[0], n21 = te[1], n31 = te[2],
			n12 = te[3], n22 = te[4], n32 = te[5],
			n13 = te[6], n23 = te[7], n33 = te[8],

			t11 = n33 * n22 - n32 * n23,
			t12 = n32 * n13 - n33 * n12,
			t13 = n23 * n12 - n22 * n13,

			det = n11 * t11 + n21 * t12 + n31 * t13;

		if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);

		const detInv = 1 / det;

		te[0] = t11 * detInv;
		te[1] = (n31 * n23 - n33 * n21) * detInv;
		te[2] = (n32 * n21 - n31 * n22) * detInv;

		te[3] = t12 * detInv;
		te[4] = (n33 * n11 - n31 * n13) * detInv;
		te[5] = (n31 * n12 - n32 * n11) * detInv;

		te[6] = t13 * detInv;
		te[7] = (n21 * n13 - n23 * n11) * detInv;
		te[8] = (n22 * n11 - n21 * n12) * detInv;

		return this;
	}

	/**
	 * Transposes this matrix in place.
	 * @returns {Matrix3}
	 */
	transpose() {
		let tmp;
		const m = this.elements;

		tmp = m[1]; m[1] = m[3]; m[3] = tmp;
		tmp = m[2]; m[2] = m[6]; m[6] = tmp;
		tmp = m[5]; m[5] = m[7]; m[7] = tmp;

		return this;
	}

	/**
	 * Return true if this matrix and m are equal.
	 * @param {Matrix3} matrix
	 * @returns {boolean}
	 */
	equals(matrix) {
		const te = this.elements;
		const me = matrix.elements;

		for (let i = 0; i < 9; i++) {
			if (te[i] !== me[i]) return false;
		}

		return true;
	}

	/**
	 * Sets the elements of this matrix based on an array in column-major format.
	 * @param {number[]} array
	 * @param {number} [offset=0]
	 * @returns {Matrix3}
	 */
	fromArray(array, offset = 0) {
		for (let i = 0; i < 9; i++) {
			this.elements[i] = array[i + offset];
		}

		return this;
	}

	/**
	 * Writes the elements of this matrix to an array in column-major format.
	 * @param {number[]} [array]
	 * @param {number} [offset=0]
	 * @returns {number[]}
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

		return array;
	}

	/**
	 * Creates a new Matrix3 and with identical elements to this one.
	 * @returns {Matrix3}
	 */
	clone() {
		return new Matrix3().fromArray(this.elements);
	}

	/**
	 * Copies the elements of matrix m into this matrix.
	 * @param {Matrix3} m
	 * @returns {Matrix3}
	 */
	copy(m) {
		const te = this.elements;
		const me = m.elements;

		te[0] = me[0]; te[1] = me[1]; te[2] = me[2];
		te[3] = me[3]; te[4] = me[4]; te[5] = me[5];
		te[6] = me[6]; te[7] = me[7]; te[8] = me[8];

		return this;
	}

	/**
	 * Post-multiplies this matrix by m.
	 * @param {Matrix3} m
	 * @returns {Matrix3}
	 */
	multiply(m) {
		return this.multiplyMatrices(this, m);
	}

	/**
	 * Pre-multiplies this matrix by m.
	 * @param {Matrix3} m
	 * @returns {Matrix3}
	 */
	premultiply(m) {
		return this.multiplyMatrices(m, this);
	}

	/**
	 * Sets this matrix to a x b.
	 * @param {Matrix3} a
	 * @param {Matrix3} b
	 * @returns {Matrix3}
	 */
	multiplyMatrices(a, b) {
		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;

		const a11 = ae[0], a12 = ae[3], a13 = ae[6];
		const a21 = ae[1], a22 = ae[4], a23 = ae[7];
		const a31 = ae[2], a32 = ae[5], a33 = ae[8];

		const b11 = be[0], b12 = be[3], b13 = be[6];
		const b21 = be[1], b22 = be[4], b23 = be[7];
		const b31 = be[2], b32 = be[5], b33 = be[8];

		te[0] = a11 * b11 + a12 * b21 + a13 * b31;
		te[3] = a11 * b12 + a12 * b22 + a13 * b32;
		te[6] = a11 * b13 + a12 * b23 + a13 * b33;

		te[1] = a21 * b11 + a22 * b21 + a23 * b31;
		te[4] = a21 * b12 + a22 * b22 + a23 * b32;
		te[7] = a21 * b13 + a22 * b23 + a23 * b33;

		te[2] = a31 * b11 + a32 * b21 + a33 * b31;
		te[5] = a31 * b12 + a32 * b22 + a33 * b32;
		te[8] = a31 * b13 + a32 * b23 + a33 * b33;

		return this;
	}

	/**
	 * Transform 2D
	 * @param {number} x - position.x
	 * @param {number} y - position.y
	 * @param {number} scaleX - scale.x
	 * @param {number} scaleY - scale.y
	 * @param {number} rotation - rotation
	 * @param {number} anchorX - anchor.x
	 * @param {number} anchorY - anchor.y
	 * @returns {Matrix3}
	 */
	transform(x, y, scaleX, scaleY, rotation, anchorX, anchorY) {
		const te = this.elements;

		const cr = Math.cos(rotation);
		const sr = Math.sin(rotation);

		te[0] = cr * scaleX;
		te[3] = -sr * scaleY;
		te[6] = x;

		te[1] = sr * scaleX;
		te[4] = cr * scaleY;
		te[7] = y;

		te[2] = 0;
		te[5] = 0;
		te[8] = 1;

		if (anchorX || anchorY) {
			// prepend the anchor offset:
			te[6] -= anchorX * te[0] + anchorY * te[3];
			te[7] -= anchorX * te[1] + anchorY * te[4];
		}

		return this;
	}

	/**
	 * Set the transformation matrix of uv coordinates
	 * @param {number} tx
	 * @param {number} ty
	 * @param {number} sx
	 * @param {number} sy
	 * @param {number} rotation
	 * @param {number} cx
	 * @param {number} cy
	 * @returns {Matrix3}
	 */
	setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
		const c = Math.cos(rotation);
		const s = Math.sin(rotation);

		return this.set(
			sx * c, sx * s, -sx * (c * cx + s * cy) + cx + tx,
			-sy * s, sy * c, -sy * (-s * cx + c * cy) + cy + ty,
			0, 0, 1
		);
	}

	/**
	 * Sets the matri3 planes from the matrix4.
	 * @param {Matrix4} m
	 * @returns {Matrix3}
	 */
	setFromMatrix4(m) {
		const me = m.elements;

		return this.set(
			me[0], me[4], me[8],
			me[1], me[5], me[9],
			me[2], me[6], me[10]
		);
	}

	/**
	 * Extracts the basis vectors from the matrix.
	 * @param {Vector3} xAxis
	 * @param {Vector3} yAxis
	 * @param {Vector3} zAxis
	 * @returns {Matrix3}
	 */
	extractBasis(xAxis, yAxis, zAxis) {
		const te = this.elements;

		xAxis.fromArray(te);
		yAxis.fromArray(te, 3);
		zAxis.fromArray(te, 6);

		return this;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Matrix3.prototype.isMatrix3 = true;

export { Matrix3 };