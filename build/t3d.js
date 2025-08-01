/**
 * @license
 * Copyright 2021-present uino
 * SPDX-License-Identifier: BSD-3-Clause
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.t3d = {}));
})(this, (function (exports) { 'use strict';

	/**
	 * An utility class for mathematical operations.
	 */
	class MathUtils {
		/**
		 * Method for generate uuid.
		 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
		 * @returns {string} - The uuid.
		 */
		static generateUUID() {
			const d0 = Math.random() * 0xffffffff | 0;
			const d1 = Math.random() * 0xffffffff | 0;
			const d2 = Math.random() * 0xffffffff | 0;
			const d3 = Math.random() * 0xffffffff | 0;
			const uuid = _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' + _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' + _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] + _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

			// .toUpperCase() here flattens concatenated strings to save heap memory space.
			return uuid.toUpperCase();
		}

		/**
		 * Returns a value linearly interpolated from two known points based on the given interval - t = 0 will return x and t = 1 will return y.
		 * @param {number} x - The first value.
		 * @param {number} y - The second value.
		 * @param {number} t - The interpolation factor.
		 * @returns {number} - The interpolated value.
		 */
		static lerp(x, y, t) {
			return x + (y - x) * t;
		}

		/**
		 * Clamps the value to be between min and max.
		 * @param {number} value - Value to be clamped.
		 * @param {number} min - The minimum value.
		 * @param {number} max - The maximum value.
		 * @returns {number} - The clamped value.
		 */
		static clamp(value, min, max) {
			return Math.max(min, Math.min(max, value));
		}

		/**
		 * Compute euclidean modulo of m % n.
		 * Refer to: https://en.wikipedia.org/wiki/Modulo_operation
		 * @param {number} n - The dividend.
		 * @param {number} m - The divisor.
		 * @returns {number} - The result of the modulo operation.
		 */
		static euclideanModulo(n, m) {
			return (n % m + m) % m;
		}

		/**
		 * Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>`
		 * for the given value.
		 * @param {number} x - The value to be mapped.
		 * @param {number} a1 - Minimum value for range A.
		 * @param {number} a2 - Maximum value for range A.
		 * @param {number} b1 - Minimum value for range B.
		 * @param {number} b2 - Maximum value for range B.
		 * @returns {number} The mapped value.
		 */
		static mapLinear(x, a1, a2, b1, b2) {
			return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
		}

		/**
		 * Is this number a power of two.
		 * @param {number} value - The input number.
		 * @returns {boolean} - Is this number a power of two.
		 */
		static isPowerOfTwo(value) {
			return (value & value - 1) === 0 && value !== 0;
		}

		/**
		 * Return the nearest power of two number of this number.
		 * @param {number} value - The input number.
		 * @returns {number} - The result number.
		 */
		static nearestPowerOfTwo(value) {
			return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
		}

		/**
		 * Return the next power of two number of this number.
		 * @param {number} value - The input number.
		 * @returns {number} - The result number.
		 */
		static nextPowerOfTwo(value) {
			value--;
			value |= value >> 1;
			value |= value >> 2;
			value |= value >> 4;
			value |= value >> 8;
			value |= value >> 16;
			value++;
			return value;
		}

		/**
		 * Return the next power of two square size of this number.
		 * This method is usually used to calculate the minimum 2d texture size based on the pixel length.
		 * @param {number} value - The input number.
		 * @returns {number} - The result size.
		 */
		static nextPowerOfTwoSquareSize(value) {
			return this.nextPowerOfTwo(Math.ceil(Math.sqrt(value)));
		}

		/**
		 * Denormalizes a value based on the type of the provided array.
		 * @param {number} value - The value to be denormalized.
		 * @param {TypedArray} array - The typed array to determine the normalization factor.
		 * @returns {number} - The denormalized value.
		 * @throws {Error} - Throws an error if the array type is invalid.
		 */
		static denormalize(value, array) {
			switch (array.constructor) {
				case Float32Array:
					return value;
				case Uint32Array:
					return value / 4294967295.0;
				case Uint16Array:
					return value / 65535.0;
				case Uint8Array:
					return value / 255.0;
				case Int32Array:
					return Math.max(value / 2147483647.0, -1);
				case Int16Array:
					return Math.max(value / 32767.0, -1);
				case Int8Array:
					return Math.max(value / 127.0, -1);
				default:
					throw new Error('Invalid component type.');
			}
		}

		/**
		 * Normalizes a value based on the type of the provided array.
		 * @param {number} value - The value to be normalized.
		 * @param {TypedArray} array - The typed array to determine the normalization factor.
		 * @returns {number} - The normalized value.
		 * @throws {Error} - Throws an error if the array type is invalid.
		 */
		static normalize(value, array) {
			switch (array.constructor) {
				case Float32Array:
					return value;
				case Uint32Array:
					return Math.round(value * 4294967295.0);
				case Uint16Array:
					return Math.round(value * 65535.0);
				case Uint8Array:
					return Math.round(value * 255.0);
				case Int32Array:
					return Math.round(value * 2147483647.0);
				case Int16Array:
					return Math.round(value * 32767.0);
				case Int8Array:
					return Math.round(value * 127.0);
				default:
					throw new Error('Invalid component type.');
			}
		}

		/**
		 * Converts float to half float.
		 * @param {number} val - The float value.
		 * @returns {number} - The half float value.
		 */
		static toHalfFloat(val) {
			if (Math.abs(val) > 65504) {
				console.warn('MathUtils.toHalfFloat(): Value out of range.');
				val = this.clamp(val, -65504, 65504);
			}
			_tables.floatView[0] = val;
			const f = _tables.uint32View[0];
			const e = f >> 23 & 0x1ff;
			return _tables.baseTable[e] + ((f & 0x007fffff) >> _tables.shiftTable[e]);
		}

		/**
		 * Converts half float to float.
		 * @param {number} val - The half float value.
		 * @returns {number} - The float value.
		 */
		static fromHalfFloat(val) {
			const m = val >> 10;
			_tables.uint32View[0] = _tables.mantissaTable[_tables.offsetTable[m] + (val & 0x3ff)] + _tables.exponentTable[m];
			return _tables.floatView[0];
		}
	}
	const _lut = [];
	for (let i = 0; i < 256; i++) {
		_lut[i] = (i < 16 ? '0' : '') + i.toString(16);
	}

	// Fast Half Float Conversions, http://www.fox-toolkit.org/ftp/fasthalffloatconversion.pdf

	const _tables = _generateTables();
	function _generateTables() {
		// float32 to float16 helpers

		const buffer = new ArrayBuffer(4);
		const floatView = new Float32Array(buffer);
		const uint32View = new Uint32Array(buffer);
		const baseTable = new Uint32Array(512);
		const shiftTable = new Uint32Array(512);
		for (let i = 0; i < 256; ++i) {
			const e = i - 127;
			if (e < -27) {
				// very small number (0, -0)
				baseTable[i] = 0x0000;
				baseTable[i | 0x100] = 0x8000;
				shiftTable[i] = 24;
				shiftTable[i | 0x100] = 24;
			} else if (e < -14) {
				// small number (denorm)
				baseTable[i] = 0x0400 >> -e - 14;
				baseTable[i | 0x100] = 0x0400 >> -e - 14 | 0x8000;
				shiftTable[i] = -e - 1;
				shiftTable[i | 0x100] = -e - 1;
			} else if (e <= 15) {
				// normal number
				baseTable[i] = e + 15 << 10;
				baseTable[i | 0x100] = e + 15 << 10 | 0x8000;
				shiftTable[i] = 13;
				shiftTable[i | 0x100] = 13;
			} else if (e < 128) {
				// large number (Infinity, -Infinity)
				baseTable[i] = 0x7c00;
				baseTable[i | 0x100] = 0xfc00;
				shiftTable[i] = 24;
				shiftTable[i | 0x100] = 24;
			} else {
				// stay (NaN, Infinity, -Infinity)
				baseTable[i] = 0x7c00;
				baseTable[i | 0x100] = 0xfc00;
				shiftTable[i] = 13;
				shiftTable[i | 0x100] = 13;
			}
		}

		// float16 to float32 helpers

		const mantissaTable = new Uint32Array(2048);
		const exponentTable = new Uint32Array(64);
		const offsetTable = new Uint32Array(64);
		for (let i = 1; i < 1024; ++i) {
			let m = i << 13; // zero pad mantissa bits
			let e = 0; // zero exponent

			// normalized
			while ((m & 0x00800000) === 0) {
				m <<= 1;
				e -= 0x00800000; // decrement exponent
			}
			m &= -8388609; // clear leading 1 bit
			e += 0x38800000; // adjust bias

			mantissaTable[i] = m | e;
		}
		for (let i = 1024; i < 2048; ++i) {
			mantissaTable[i] = 0x38000000 + (i - 1024 << 13);
		}
		for (let i = 1; i < 31; ++i) {
			exponentTable[i] = i << 23;
		}
		exponentTable[31] = 0x47800000;
		exponentTable[32] = 0x80000000;
		for (let i = 33; i < 63; ++i) {
			exponentTable[i] = 0x80000000 + (i - 32 << 23);
		}
		exponentTable[63] = 0xc7800000;
		for (let i = 1; i < 64; ++i) {
			if (i !== 32) {
				offsetTable[i] = 1024;
			}
		}
		return {
			floatView: floatView,
			uint32View: uint32View,
			baseTable: baseTable,
			shiftTable: shiftTable,
			mantissaTable: mantissaTable,
			exponentTable: exponentTable,
			offsetTable: offsetTable
		};
	}

	/**
	 * Class representing a 3D vector.
	 */
	class Vector3 {
		/**
		 * Constructs a new 3D vector.
		 * @param {number} [x=0] - The x value of this vector.
		 * @param {number} [y=0] - The y value of this vector.
		 * @param {number} [z=0] - The z value of this vector.
		 */
		constructor(x = 0, y = 0, z = 0) {
			/**
			 * The x value of this vector.
			 * @type {number}
			 */
			this.x = x;

			/**
			 * The y value of this vector.
			 * @type {number}
			 */
			this.y = y;

			/**
			 * The z value of this vector.
			 * @type {number}
			 */
			this.z = z;
		}

		/**
		 * Sets the vector components.
		 * @param {number} x - The value of the x component.
		 * @param {number} y - The value of the y component.
		 * @param {number} z - The value of the z component.
		 * @returns {Vector3} A reference to this vector.
		 */
		set(x = 0, y = 0, z = 0) {
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		/**
		 * Sets the vector components to the same value.
		 * @param {number} scalar - The value to set for all vector components.
		 * @returns {Vector3} A reference to this vector.
		 */
		setScalar(scalar) {
			this.x = scalar;
			this.y = scalar;
			this.z = scalar;
			return this;
		}

		/**
		 * Returns a new vector with copied values from this instance.
		 * @returns {Vector3} A clone of this instance.
		 */
		clone() {
			return new Vector3(this.x, this.y, this.z);
		}

		/**
		 * Copies the values of the given vector to this instance.
		 * @param {Vector3} v - The vector to copy.
		 * @returns {Vector3} A reference to this vector.
		 */
		copy(v) {
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			return this;
		}

		/**
		 * Adds the given vector to this instance.
		 * @param {Vector3} v - The vector to add.
		 * @returns {Vector3} A reference to this vector.
		 */
		add(v) {
			this.x += v.x;
			this.y += v.y;
			this.z += v.z;
			return this;
		}

		/**
		 * Adds the given scalar value to all components of this instance.
		 * @param {number} s - The scalar to add.
		 * @returns {Vector3} A reference to this vector.
		 */
		addScalar(s) {
			this.x += s;
			this.y += s;
			this.z += s;
			return this;
		}

		/**
		 * Adds the given vectors and stores the result in this instance.
		 * @param {Vector3} a - The first vector.
		 * @param {Vector3} b - The second vector.
		 * @returns {Vector3} A reference to this vector.
		 */
		addVectors(a, b) {
			this.x = a.x + b.x;
			this.y = a.y + b.y;
			this.z = a.z + b.z;
			return this;
		}

		/**
		 * Adds the given vector scaled by the given factor to this instance.
		 * @param {Vector3|Vector4} v - The vector.
		 * @param {number} s - The factor that scales `v`.
		 * @returns {Vector3} A reference to this vector.
		 */
		addScaledVector(v, s) {
			this.x += v.x * s;
			this.y += v.y * s;
			this.z += v.z * s;
			return this;
		}

		/**
		 * Subtracts the given vector from this instance.
		 * @param {Vector3} v - The vector to subtract.
		 * @returns {Vector3} A reference to this vector.
		 */
		sub(v) {
			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;
			return this;
		}

		/**
		 * Subtracts the given vectors and stores the result in this instance.
		 * @param {Vector3} a - The first vector.
		 * @param {Vector3} b - The second vector.
		 * @returns {Vector3} A reference to this vector.
		 */
		subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			return this;
		}

		/**
		 * Multiplies the given vector with this instance.
		 * @param {Vector3} v - The vector to multiply.
		 * @returns {Vector3} A reference to this vector.
		 */
		multiply(v) {
			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;
			return this;
		}

		/**
		 * Multiplies the given scalar value with all components of this instance.
		 * @param {number} scalar - The scalar to multiply.
		 * @returns {Vector3} A reference to this vector.
		 */
		multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			return this;
		}

		/**
		 * Multiplies this vector with the given 3x3 matrix.
		 * @param {Matrix3} m - The 3x3 matrix.
		 * @returns {Vector3} A reference to this vector.
		 */
		applyMatrix3(m) {
			const x = this.x,
				y = this.y,
				z = this.z;
			const e = m.elements;
			this.x = e[0] * x + e[3] * y + e[6] * z;
			this.y = e[1] * x + e[4] * y + e[7] * z;
			this.z = e[2] * x + e[5] * y + e[8] * z;
			return this;
		}

		/**
		 * Multiplies this vector (with an implicit 1 in the 4th dimension) by m, and
		 * divides by perspective.
		 * @param {Matrix4} m - The matrix to apply.
		 * @returns {Vector3} A reference to this vector.
		 */
		applyMatrix4(m) {
			const x = this.x,
				y = this.y,
				z = this.z;
			const e = m.elements;
			const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
			this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
			this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
			this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
			return this;
		}

		/**
		 * Applies the given Quaternion to this vector.
		 * @param {Quaternion} q - The Quaternion.
		 * @returns {Vector3} A reference to this vector.
		 */
		applyQuaternion(q) {
			const x = this.x,
				y = this.y,
				z = this.z;
			const qx = q._x,
				qy = q._y,
				qz = q._z,
				qw = q._w;

			// calculate quat * vector

			const ix = qw * x + qy * z - qz * y;
			const iy = qw * y + qz * x - qx * z;
			const iz = qw * z + qx * y - qy * x;
			const iw = -qx * x - qy * y - qz * z;

			// calculate result * inverse quat

			this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
			this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
			this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
			return this;
		}

		/**
		 * Projects this vector from world space into the camera's normalized
		 * device coordinate (NDC) space.
		 * @param {Camera} camera - The camera.
		 * @returns {Vector3} A reference to this vector.
		 */
		project(camera) {
			return this.applyMatrix4(camera.projectionViewMatrix);
		}

		/**
		 * Unprojects this vector from the camera's normalized device coordinate (NDC)
		 * space into world space.
		 * @param {Camera} camera - The camera.
		 * @returns {Vector3} A reference to this vector.
		 */
		unproject(camera) {
			return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.worldMatrix);
		}

		/**
		 * Transforms the direction of this vector by a matrix (the upper left 3 x 3
		 * subset of the given 4x4 matrix and then normalizes the result.
		 * @param {Matrix4} m - The matrix.
		 * @returns {Vector3} A reference to this vector.
		 */
		transformDirection(m) {
			// input: Matrix4 affine matrix
			// vector interpreted as a direction

			const x = this.x,
				y = this.y,
				z = this.z;
			const e = m.elements;
			this.x = e[0] * x + e[4] * y + e[8] * z;
			this.y = e[1] * x + e[5] * y + e[9] * z;
			this.z = e[2] * x + e[6] * y + e[10] * z;
			return this.normalize();
		}

		/**
		 * If this vector's x, y or z value is greater than the given vector's x, y or z
		 * value, replace that value with the corresponding min value.
		 * @param {Vector3} v - The vector.
		 * @returns {Vector3} A reference to this vector.
		 */
		min(v) {
			this.x = Math.min(this.x, v.x);
			this.y = Math.min(this.y, v.y);
			this.z = Math.min(this.z, v.z);
			return this;
		}

		/**
		 * If this vector's x, y or z value is less than the given vector's x, y or z
		 * value, replace that value with the corresponding max value.
		 * @param {Vector3} v - The vector.
		 * @returns {Vector3} A reference to this vector.
		 */
		max(v) {
			this.x = Math.max(this.x, v.x);
			this.y = Math.max(this.y, v.y);
			this.z = Math.max(this.z, v.z);
			return this;
		}

		/**
		 * Inverts this vector - i.e. sets x = -x, y = -y and z = -z.
		 * @returns {Vector3} A reference to this vector.
		 */
		negate() {
			this.x = -this.x;
			this.y = -this.y;
			this.z = -this.z;
			return this;
		}

		/**
		 * Calculates the dot product of the given vector with this instance.
		 * @param {Vector3} v - The vector to compute the dot product with.
		 * @returns {number} The result of the dot product.
		 */
		dot(v) {
			return this.x * v.x + this.y * v.y + this.z * v.z;
		}

		/**
		 * Computes the square of the Euclidean length (straight-line length) from
		 * (0, 0, 0) to (x, y, z). If you are comparing the lengths of vectors, you should
		 * compare the length squared instead as it is slightly more efficient to calculate.
		 * @returns {number} The square length of this vector.
		 */
		getLengthSquared() {
			return this.x * this.x + this.y * this.y + this.z * this.z;
		}

		/**
		 * Computes the	Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
		 * @returns {number} The length of this vector.
		 */
		getLength() {
			return Math.sqrt(this.getLengthSquared());
		}

		/**
		 * Converts this vector to a unit vector - that is, sets it equal to a vector
		 * with the same direction as this one, but with a vector length of `1`.
		 * @param {number} [thickness=1]
		 * @returns {Vector3} A reference to this vector.
		 */
		normalize(thickness = 1) {
			const length = this.getLength() || 1;
			const invLength = thickness / length;
			this.x *= invLength;
			this.y *= invLength;
			this.z *= invLength;
			return this;
		}

		/**
		 * Linearly interpolates between the given vector and this instance, where
		 * alpha is the percent distance along the line - alpha = 0 will be this
		 * vector, and alpha = 1 will be the given one.
		 * @param {Vector3} v - The vector to interpolate towards.
		 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
		 * @returns {Vector3} A reference to this vector.
		 */
		lerp(v, alpha) {
			this.x += (v.x - this.x) * alpha;
			this.y += (v.y - this.y) * alpha;
			this.z += (v.z - this.z) * alpha;
			return this;
		}

		/**
		 * Linearly interpolates between the given vectors, where alpha is the percent
		 * distance along the line - alpha = 0 will be first vector, and alpha = 1 will
		 * be the second one. The result is stored in this instance.
		 * @param {Vector3} v1 - The first vector.
		 * @param {Vector3} v2 - The second vector.
		 * @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
		 * @returns {Vector3} A reference to this vector.
		 */
		lerpVectors(v1, v2, alpha) {
			this.x = v1.x + (v2.x - v1.x) * alpha;
			this.y = v1.y + (v2.y - v1.y) * alpha;
			this.z = v1.z + (v2.z - v1.z) * alpha;
			return this;
		}

		/**
		 * Calculates the cross product of the given vector with this instance.
		 * @param {Vector3} v - The vector to compute the cross product with.
		 * @returns {Vector3} The result of the cross product.
		 */
		cross(v) {
			return this.crossVectors(this, v);
		}

		/**
		 * Calculates the cross product of the given vectors and stores the result
		 * in this instance.
		 * @param {Vector3} a - The first vector.
		 * @param {Vector3} b - The second vector.
		 * @returns {Vector3} A reference to this vector.
		 */
		crossVectors(a, b) {
			const ax = a.x,
				ay = a.y,
				az = a.z;
			const bx = b.x,
				by = b.y,
				bz = b.z;
			this.x = ay * bz - az * by;
			this.y = az * bx - ax * bz;
			this.z = ax * by - ay * bx;
			return this;
		}

		/**
		 * Reflects this vector off a plane orthogonal to the given normal vector.
		 * @param {Vector3} normal - The (normalized) normal vector.
		 * @returns {Vector3} A reference to this vector.
		 */
		reflect(normal) {
			return this.sub(_vector$2.copy(normal).multiplyScalar(2 * this.dot(normal)));
		}

		/**
		 * Scales this vector along the given direction vector by the given scale factor.
		 * @param {Vector3} direction - The (normalized) direction vector to scale along.
		 * @param {number} scale - The scale factor.
		 * @returns {Vector3} A reference to this vector.
		 */
		scaleAlong(direction, scale) {
			_vector$2.copy(direction).multiplyScalar(this.dot(direction));
			return this.sub(_vector$2).addScaledVector(_vector$2, scale);
		}

		/**
		 * Returns the angle between the given vector and this instance in radians.
		 * @param {Vector3} v - The vector to compute the angle with.
		 * @returns {number} The angle in radians.
		 */
		angleTo(v) {
			const denominator = Math.sqrt(this.getLengthSquared() * v.getLengthSquared());
			if (denominator === 0) return Math.PI / 2;
			const theta = this.dot(v) / denominator;

			// clamp, to handle numerical problems

			return Math.acos(MathUtils.clamp(theta, -1, 1));
		}

		/**
		 * Computes the distance from the given vector to this instance.
		 * @param {Vector3} v - The vector to compute the distance to.
		 * @returns {number} The distance.
		 */
		distanceTo(v) {
			return Math.sqrt(this.distanceToSquared(v));
		}

		/**
		 * Computes the squared distance from the given vector to this instance.
		 * If you are just comparing the distance with another distance, you should compare
		 * the distance squared instead as it is slightly more efficient to calculate.
		 * @param {Vector3} v - The vector to compute the squared distance to.
		 * @returns {number} The squared distance.
		 */
		distanceToSquared(v) {
			const dx = this.x - v.x,
				dy = this.y - v.y,
				dz = this.z - v.z;
			return dx * dx + dy * dy + dz * dz;
		}

		/**
		 * Sets the vector components from the given spherical coordinates.
		 * @param {Spherical} s - The spherical coordinates.
		 * @returns {Vector3} A reference to this vector.
		 */
		setFromSpherical(s) {
			const sinPhiRadius = Math.sin(s.phi) * s.radius;
			this.x = sinPhiRadius * Math.sin(s.theta);
			this.y = Math.cos(s.phi) * s.radius;
			this.z = sinPhiRadius * Math.cos(s.theta);
			return this;
		}

		/**
		 * Sets the vector components to the position elements of the
		 * given transformation matrix.
		 * @param {Matrix4} m - The 4x4 matrix.
		 * @returns {Vector3} A reference to this vector.
		 */
		setFromMatrixPosition(m) {
			const e = m.elements;
			this.x = e[12];
			this.y = e[13];
			this.z = e[14];
			return this;
		}

		/**
		 * Sets the vector components to the scale elements of the
		 * given transformation matrix.
		 * @param {Matrix4} m - The 4x4 matrix.
		 * @returns {Vector3} A reference to this vector.
		 */
		setFromMatrixScale(m) {
			const sx = this.setFromMatrixColumn(m, 0).getLength();
			const sy = this.setFromMatrixColumn(m, 1).getLength();
			const sz = this.setFromMatrixColumn(m, 2).getLength();
			return this.set(sx, sy, sz);
		}

		/**
		 * Sets the vector components from the specified matrix column.
		 * @param {Matrix4} m - The 4x4 matrix.
		 * @param {number} index - The column index.
		 * @returns {Vector3} A reference to this vector.
		 */
		setFromMatrixColumn(m, index) {
			return this.fromArray(m.elements, index * 4);
		}

		/**
		 * Returns `true` if this vector is equal with the given one.
		 * @param {Vector3} v - The vector to test for equality.
		 * @returns {boolean} Whether this vector is equal with the given one.
		 */
		equals(v) {
			return v.x === this.x && v.y === this.y && v.z === this.z;
		}

		/**
		 * Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`
		 * and z value to be `array[ offset + 2 ]`.
		 * @param {Array<number>} array - An array holding the vector component values.
		 * @param {number} [offset=0] - The offset into the array.
		 * @param {boolean} [denormalize=false] - If true, denormalize the values, and array should be a typed array.
		 * @returns {Vector3} A reference to this vector.
		 */
		fromArray(array, offset = 0, denormalize = false) {
			let x = array[offset],
				y = array[offset + 1],
				z = array[offset + 2];
			if (denormalize) {
				x = MathUtils.denormalize(x, array);
				y = MathUtils.denormalize(y, array);
				z = MathUtils.denormalize(z, array);
			}
			this.x = x;
			this.y = y;
			this.z = z;
			return this;
		}

		/**
		 * Writes the components of this vector to the given array. If no array is provided,
		 * the method returns a new instance.
		 * @param {Array<number>} [array=[]] - The target array holding the vector components.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @param {boolean} [normalize=false] - if true, normalize the values, and array should be a typed array.
		 * @returns {Array<number>} The vector components.
		 */
		toArray(array = [], offset = 0, normalize = false) {
			let x = this.x,
				y = this.y,
				z = this.z;
			if (normalize) {
				x = MathUtils.normalize(x, array);
				y = MathUtils.normalize(y, array);
				z = MathUtils.normalize(z, array);
			}
			array[offset] = x;
			array[offset + 1] = y;
			array[offset + 2] = z;
			return array;
		}
		*[Symbol.iterator]() {
			yield this.x;
			yield this.y;
			yield this.z;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Vector3.prototype.isVector3 = true;
	const _vector$2 = new Vector3();

	/**
	 * Represents a 4x4 matrix.
	 */
	class Matrix4 {
		/**
		 * Constructs a new 4x4 matrix.
		 */
		constructor() {
			/**
			 * A column-major list of matrix values.
			 * @type {Array<number>}
			 */
			this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
		}

		/**
		 * Sets the elements of the matrix.The arguments are supposed to be
		 * in row-major order.
		 * @param {number} [n11] - 1-1 matrix element.
		 * @param {number} [n12] - 1-2 matrix element.
		 * @param {number} [n13] - 1-3 matrix element.
		 * @param {number} [n14] - 1-4 matrix element.
		 * @param {number} [n21] - 2-1 matrix element.
		 * @param {number} [n22] - 2-2 matrix element.
		 * @param {number} [n23] - 2-3 matrix element.
		 * @param {number} [n24] - 2-4 matrix element.
		 * @param {number} [n31] - 3-1 matrix element.
		 * @param {number} [n32] - 3-2 matrix element.
		 * @param {number} [n33] - 3-3 matrix element.
		 * @param {number} [n34] - 3-4 matrix element.
		 * @param {number} [n41] - 4-1 matrix element.
		 * @param {number} [n42] - 4-2 matrix element.
		 * @param {number} [n43] - 4-3 matrix element.
		 * @param {number} [n44] - 4-4 matrix element.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
			const ele = this.elements;
			ele[0] = n11;
			ele[4] = n12;
			ele[8] = n13;
			ele[12] = n14;
			ele[1] = n21;
			ele[5] = n22;
			ele[9] = n23;
			ele[13] = n24;
			ele[2] = n31;
			ele[6] = n32;
			ele[10] = n33;
			ele[14] = n34;
			ele[3] = n41;
			ele[7] = n42;
			ele[11] = n43;
			ele[15] = n44;
			return this;
		}

		/**
		 * Sets this matrix to the 4x4 identity matrix.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		identity() {
			return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
		}

		/**
		 * Checks if the matrix is an identity matrix.
		 * @returns {boolean} - True if the matrix is an identity matrix, false otherwise.
		 */
		isIdentity() {
			const te = this.elements;
			return te[0] === 1 && te[4] === 0 && te[8] === 0 && te[12] === 0 && te[1] === 0 && te[5] === 1 && te[9] === 0 && te[13] === 0 && te[2] === 0 && te[6] === 0 && te[10] === 1 && te[14] === 0 && te[3] === 0 && te[7] === 0 && te[11] === 0 && te[15] === 1;
		}

		/**
		 * Returns a matrix with copied values from this instance.
		 * @returns {Matrix4} A clone of this instance.
		 */
		clone() {
			return new Matrix4().fromArray(this.elements);
		}

		/**
		 * Copies the values of the given matrix to this instance.
		 * @param {Matrix4} m - The matrix to copy.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		copy(m) {
			const te = this.elements;
			const me = m.elements;
			te[0] = me[0];
			te[1] = me[1];
			te[2] = me[2];
			te[3] = me[3];
			te[4] = me[4];
			te[5] = me[5];
			te[6] = me[6];
			te[7] = me[7];
			te[8] = me[8];
			te[9] = me[9];
			te[10] = me[10];
			te[11] = me[11];
			te[12] = me[12];
			te[13] = me[13];
			te[14] = me[14];
			te[15] = me[15];
			return this;
		}

		/**
		 * Set the upper 3x3 elements of this matrix to the values of given 3x3 matrix.
		 * @param {Matrix3} m - The 3x3 matrix.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		setFromMatrix3(m) {
			const me = m.elements;
			return this.set(me[0], me[3], me[6], 0, me[1], me[4], me[7], 0, me[2], me[5], me[8], 0, 0, 0, 0, 1);
		}

		/**
		 * Extracts the basis of this matrix into the three axis vectors provided.
		 * @param {Vector3} xAxis - The basis's x axis.
		 * @param {Vector3} yAxis - The basis's y axis.
		 * @param {Vector3} zAxis - The basis's z axis.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		extractBasis(xAxis, yAxis, zAxis) {
			xAxis.setFromMatrixColumn(this, 0);
			yAxis.setFromMatrixColumn(this, 1);
			zAxis.setFromMatrixColumn(this, 2);
			return this;
		}

		/**
		 * Sets the given basis vectors to this matrix.
		 * @param {Vector3} xAxis - The basis's x axis.
		 * @param {Vector3} yAxis - The basis's y axis.
		 * @param {Vector3} zAxis - The basis's z axis.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		makeBasis(xAxis, yAxis, zAxis) {
			this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
			return this;
		}

		/**
		 * Extracts the rotation component of the given matrix
		 * into this matrix's rotation component.
		 *
		 * Note: This method does not support reflection matrices.
		 * @param {Matrix4} m - The matrix.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		extractRotation(m) {
			const te = this.elements;
			const me = m.elements;
			const scaleX = 1 / _vec3_1$6.setFromMatrixColumn(m, 0).getLength();
			const scaleY = 1 / _vec3_1$6.setFromMatrixColumn(m, 1).getLength();
			const scaleZ = 1 / _vec3_1$6.setFromMatrixColumn(m, 2).getLength();
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
		 * Sets the rotation component (the upper left 3x3 matrix) of this matrix to
		 * the rotation specified by the given Euler angles. The rest of
		 * the matrix is set to the identity. Depending on the {@link Euler#order},
		 * there are six possible outcomes. See [this page]{@link https://en.wikipedia.org/wiki/Euler_angles#Rotation_matrix}
		 * for a complete list.
		 * @param {Euler} euler - The Euler angles.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		makeRotationFromEuler(euler) {
			const te = this.elements;
			const x = euler.x,
				y = euler.y,
				z = euler.z;
			const a = Math.cos(x),
				b = Math.sin(x);
			const c = Math.cos(y),
				d = Math.sin(y);
			const e = Math.cos(z),
				f = Math.sin(z);
			if (euler.order === 'XYZ') {
				const ae = a * e,
					af = a * f,
					be = b * e,
					bf = b * f;
				te[0] = c * e;
				te[4] = -c * f;
				te[8] = d;
				te[1] = af + be * d;
				te[5] = ae - bf * d;
				te[9] = -b * c;
				te[2] = bf - ae * d;
				te[6] = be + af * d;
				te[10] = a * c;
			} else if (euler.order === 'YXZ') {
				const ce = c * e,
					cf = c * f,
					de = d * e,
					df = d * f;
				te[0] = ce + df * b;
				te[4] = de * b - cf;
				te[8] = a * d;
				te[1] = a * f;
				te[5] = a * e;
				te[9] = -b;
				te[2] = cf * b - de;
				te[6] = df + ce * b;
				te[10] = a * c;
			} else if (euler.order === 'ZXY') {
				const ce = c * e,
					cf = c * f,
					de = d * e,
					df = d * f;
				te[0] = ce - df * b;
				te[4] = -a * f;
				te[8] = de + cf * b;
				te[1] = cf + de * b;
				te[5] = a * e;
				te[9] = df - ce * b;
				te[2] = -a * d;
				te[6] = b;
				te[10] = a * c;
			} else if (euler.order === 'ZYX') {
				const ae = a * e,
					af = a * f,
					be = b * e,
					bf = b * f;
				te[0] = c * e;
				te[4] = be * d - af;
				te[8] = ae * d + bf;
				te[1] = c * f;
				te[5] = bf * d + ae;
				te[9] = af * d - be;
				te[2] = -d;
				te[6] = b * c;
				te[10] = a * c;
			} else if (euler.order === 'YZX') {
				const ac = a * c,
					ad = a * d,
					bc = b * c,
					bd = b * d;
				te[0] = c * e;
				te[4] = bd - ac * f;
				te[8] = bc * f + ad;
				te[1] = f;
				te[5] = a * e;
				te[9] = -b * e;
				te[2] = -d * e;
				te[6] = ad * f + bc;
				te[10] = ac - bd * f;
			} else if (euler.order === 'XZY') {
				const ac = a * c,
					ad = a * d,
					bc = b * c,
					bd = b * d;
				te[0] = c * e;
				te[4] = -f;
				te[8] = d * e;
				te[1] = ac * f + bd;
				te[5] = a * e;
				te[9] = ad * f - bc;
				te[2] = bc * f - ad;
				te[6] = b * e;
				te[10] = bd * f + ac;
			}

			// bottom row
			te[3] = 0;
			te[7] = 0;
			te[11] = 0;

			// last column
			te[12] = 0;
			te[13] = 0;
			te[14] = 0;
			te[15] = 1;
			return this;
		}

		/**
		 * Sets the rotation component of this matrix to the rotation specified by q, as outlined here.
		 * @param {Quaternion} q
		 * @returns {Matrix4}
		 */
		makeRotationFromQuaternion(q) {
			return this.compose(_zero, q, _one);
		}

		/**
		 * Constructs a rotation matrix, looking from eye towards center oriented by the up vector.
		 * @param {Vector3} eye - The eye vector.
		 * @param {Vector3} target - The target vector.
		 * @param {Vector3} up - The up vector.
		 * @returns {Matrix4} A reference to this matrix.
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
			te[0] = _x.x;
			te[4] = _y.x;
			te[8] = _z.x;
			te[1] = _x.y;
			te[5] = _y.y;
			te[9] = _z.y;
			te[2] = _x.z;
			te[6] = _y.z;
			te[10] = _z.z;
			return this;
		}

		/**
		 * Post-multiplies this matrix by the given 4x4 matrix.
		 * @param {Matrix4} m - The matrix to multiply with.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		multiply(m) {
			return this.multiplyMatrices(this, m);
		}

		/**
		 * Pre-multiplies this matrix by the given 4x4 matrix.
		 * @param {Matrix4} m - The matrix to multiply with.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		premultiply(m) {
			return this.multiplyMatrices(m, this);
		}

		/**
		 * Multiples the given 4x4 matrices and stores the result
		 * in this matrix.
		 * @param {Matrix4} a - The first matrix.
		 * @param {Matrix4} b - The second matrix.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		multiplyMatrices(a, b) {
			const ae = a.elements;
			const be = b.elements;
			const te = this.elements;
			const a11 = ae[0],
				a12 = ae[4],
				a13 = ae[8],
				a14 = ae[12];
			const a21 = ae[1],
				a22 = ae[5],
				a23 = ae[9],
				a24 = ae[13];
			const a31 = ae[2],
				a32 = ae[6],
				a33 = ae[10],
				a34 = ae[14];
			const a41 = ae[3],
				a42 = ae[7],
				a43 = ae[11],
				a44 = ae[15];
			const b11 = be[0],
				b12 = be[4],
				b13 = be[8],
				b14 = be[12];
			const b21 = be[1],
				b22 = be[5],
				b23 = be[9],
				b24 = be[13];
			const b31 = be[2],
				b32 = be[6],
				b33 = be[10],
				b34 = be[14];
			const b41 = be[3],
				b42 = be[7],
				b43 = be[11],
				b44 = be[15];
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
		 * Computes and returns the determinant of this matrix.
		 * Based on the method outlined [here]{@link http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.html}.
		 * @returns {number} The determinant.
		 */
		determinant() {
			const te = this.elements;
			const n11 = te[0],
				n12 = te[4],
				n13 = te[8],
				n14 = te[12];
			const n21 = te[1],
				n22 = te[5],
				n23 = te[9],
				n24 = te[13];
			const n31 = te[2],
				n32 = te[6],
				n33 = te[10],
				n34 = te[14];
			const n41 = te[3],
				n42 = te[7],
				n43 = te[11],
				n44 = te[15];

			// TODO: make this more efficient

			return n41 * (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) + n42 * (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) + n43 * (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) + n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31);
		}

		/**
		 * Transposes this matrix in place.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		transpose() {
			const te = this.elements;
			let tmp;
			tmp = te[1];
			te[1] = te[4];
			te[4] = tmp;
			tmp = te[2];
			te[2] = te[8];
			te[8] = tmp;
			tmp = te[6];
			te[6] = te[9];
			te[9] = tmp;
			tmp = te[3];
			te[3] = te[12];
			te[12] = tmp;
			tmp = te[7];
			te[7] = te[13];
			te[13] = tmp;
			tmp = te[11];
			te[11] = te[14];
			te[14] = tmp;
			return this;
		}

		/**
		 * Sets the position component for this matrix from the given vector,
		 * without affecting the rest of the matrix.
		 * @param {number|Vector3} x - The x component of the vector or alternatively the vector object.
		 * @param {number} y - The y component of the vector.
		 * @param {number} z - The z component of the vector.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		setPosition(x, y, z) {
			const te = this.elements;
			if (x.isVector3) {
				te[12] = x.x;
				te[13] = x.y;
				te[14] = x.z;
			} else {
				te[12] = x;
				te[13] = y;
				te[14] = z;
			}
			return this;
		}

		/**
		 * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
		 * You can not invert with a determinant of zero. If you attempt this, the method produces
		 * a zero matrix instead.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		invert() {
			// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
			const te = this.elements,
				n11 = te[0],
				n21 = te[1],
				n31 = te[2],
				n41 = te[3],
				n12 = te[4],
				n22 = te[5],
				n32 = te[6],
				n42 = te[7],
				n13 = te[8],
				n23 = te[9],
				n33 = te[10],
				n43 = te[11],
				n14 = te[12],
				n24 = te[13],
				n34 = te[14],
				n44 = te[15],
				t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
				t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
				t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
				t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
			const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
			if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
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
		 * Gets the maximum scale value of the three axes.
		 * @returns {number} The maximum scale.
		 */
		getMaxScaleOnAxis() {
			const te = this.elements;
			const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
			const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
			const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
			return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
		}

		/**
		 * Sets this matrix as a translation transform from the given vector.
		 * @param {number|Vector3} x - The amount to translate in the X axis or alternatively a translation vector.
		 * @param {number} y - The amount to translate in the Y axis.
		 * @param {number} z - The amount to translate in the z axis.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		makeTranslation(x, y, z) {
			if (x.isVector3) {
				this.set(1, 0, 0, x.x, 0, 1, 0, x.y, 0, 0, 1, x.z, 0, 0, 0, 1);
			} else {
				this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
			}
			return this;
		}

		/**
		 * Sets this matrix as a rotational transformation around the given axis by
		 * the given angle.
		 * This is a somewhat controversial but mathematically sound alternative to
		 * rotating via Quaternions. See the discussion [here]{@link https://www.gamedev.net/articles/programming/math-and-physics/do-we-really-need-quaternions-r1199}.
		 * @param {Vector3} axis - The normalized rotation axis.
		 * @param {number} angle - The rotation in radians.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		makeRotationAxis(axis, angle) {
			// Based on http://www.gamedev.net/reference/articles/article1199.asp

			const c = Math.cos(angle);
			const s = Math.sin(angle);
			const t = 1 - c;
			const x = axis.x,
				y = axis.y,
				z = axis.z;
			const tx = t * x,
				ty = t * y;
			return this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);
		}

		/**
		 * Sets this matrix as a scale transformation.
		 * @param {number} x - The amount to scale in the X axis.
		 * @param {number} y - The amount to scale in the Y axis.
		 * @param {number} z - The amount to scale in the Z axis.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		makeScale(x, y, z) {
			return this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
		}

		/**
		 * Sets this matrix to the transformation composed of the given position,
		 * rotation (Quaternion) and scale.
		 * @param {Vector3} position - The position vector.
		 * @param {Quaternion} quaternion - The rotation as a Quaternion.
		 * @param {Vector3} scale - The scale vector.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		compose(position, quaternion, scale) {
			const te = this.elements;
			const x = quaternion._x,
				y = quaternion._y,
				z = quaternion._z,
				w = quaternion._w;
			const x2 = x + x,
				y2 = y + y,
				z2 = z + z;
			const xx = x * x2,
				xy = x * y2,
				xz = x * z2;
			const yy = y * y2,
				yz = y * z2,
				zz = z * z2;
			const wx = w * x2,
				wy = w * y2,
				wz = w * z2;
			const sx = scale.x,
				sy = scale.y,
				sz = scale.z;
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
		 * Decomposes this matrix into its position, rotation and scale components
		 * and provides the result in the given objects.
		 * Note: Not all matrices are decomposable in this way. For example, if an
		 * object has a non-uniformly scaled parent, then the object's world matrix
		 * may not be decomposable, and this method may not be appropriate.
		 * @param {Vector3} position - The position vector.
		 * @param {Quaternion} quaternion - The rotation as a Quaternion.
		 * @param {Vector3} scale - The scale vector.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		decompose(position, quaternion, scale) {
			const te = this.elements;
			let sx = _vec3_1$6.set(te[0], te[1], te[2]).getLength();
			const sy = _vec3_1$6.set(te[4], te[5], te[6]).getLength();
			const sz = _vec3_1$6.set(te[8], te[9], te[10]).getLength();

			// if determine is negative, we need to invert one scale
			const det = this.determinant();
			if (det < 0) {
				sx = -sx;
			}
			position.x = te[12];
			position.y = te[13];
			position.z = te[14];

			// scale the rotation part
			_mat4_1$3.copy(this);
			const invSX = 1 / sx;
			const invSY = 1 / sy;
			const invSZ = 1 / sz;
			_mat4_1$3.elements[0] *= invSX;
			_mat4_1$3.elements[1] *= invSX;
			_mat4_1$3.elements[2] *= invSX;
			_mat4_1$3.elements[4] *= invSY;
			_mat4_1$3.elements[5] *= invSY;
			_mat4_1$3.elements[6] *= invSY;
			_mat4_1$3.elements[8] *= invSZ;
			_mat4_1$3.elements[9] *= invSZ;
			_mat4_1$3.elements[10] *= invSZ;
			quaternion.setFromRotationMatrix(_mat4_1$3);
			scale.x = sx;
			scale.y = sy;
			scale.z = sz;
			return this;
		}

		/**
		 * Returns `true` if this matrix is equal with the given one.
		 * @param {Matrix4} matrix - The matrix to test for equality.
		 * @returns {boolean} Whether this matrix is equal with the given one.
		 */
		equals(matrix) {
			const te = this.elements;
			const me = matrix.elements;
			for (let i = 0; i < 16; i++) {
				if (te[i] !== me[i]) return false;
			}
			return true;
		}

		/**
		 * Sets the elements of the matrix from the given array.
		 * @param {Array<number>} array - The matrix elements in column-major order.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @returns {Matrix4} A reference to this matrix.
		 */
		fromArray(array, offset = 0) {
			for (let i = 0; i < 16; i++) {
				this.elements[i] = array[i + offset];
			}
			return this;
		}

		/**
		 * Writes the elements of this matrix to the given array. If no array is provided,
		 * the method returns a new instance.
		 * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @returns {Array<number>} The matrix elements in column-major order.
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

		/**
		 * Linearly interpolates between two matrix4.
		 * @param {Matrix4} m1
		 * @param {Matrix4} m2
		 * @param {number} ratio
		 * @returns {Matrix4}
		 */
		lerpMatrices(m1, m2, ratio) {
			if (ratio === 0) return this.copy(m1);
			if (ratio === 1) return this.copy(m2);
			const te = this.elements,
				te1 = m1.elements,
				te2 = m2.elements;
			for (let i = 0; i < 16; i++) {
				te[i] = te1[i] * (1 - ratio) + te2[i] * ratio;
			}
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Matrix4.prototype.isMatrix4 = true;
	const _vec3_1$6 = new Vector3();
	const _mat4_1$3 = new Matrix4();
	const _zero = new Vector3(0, 0, 0);
	const _one = new Vector3(1, 1, 1);
	const _x = new Vector3();
	const _y = new Vector3();
	const _z = new Vector3();

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
		 * quaternion data are managed	in flat arrays.
		 * @param {Array<number>} dst - The destination array.
		 * @param {number} dstOffset - An offset into the destination array.
		 * @param {Array<number>} src0 - The source array of the first quaternion.
		 * @param {number} srcOffset0 - An offset into the first source array.
		 * @param {Array<number>} src1 -	The source array of the second quaternion.
		 * @param {number} srcOffset1 - An offset into the second source array.
		 * @param {number} t - The interpolation factor in the range `[0,1]`.
		 * @see {@link Quaternion#slerp}
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
					dir = cos >= 0 ? 1 : -1,
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
		 * Multiplies two quaternions. This implementation assumes the quaternion data are managed
		 * in flat arrays.
		 * @param {Array<number>} dst - The destination array.
		 * @param {number} dstOffset - An offset into the destination array.
		 * @param {Array<number>} src0 - The source array of the first quaternion.
		 * @param {number} srcOffset0 - An offset into the first source array.
		 * @param {Array<number>} src1 -	The source array of the second quaternion.
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

			const halfAngle = angle / 2,
				s = Math.sin(halfAngle);
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
				m11 = te[0],
				m12 = te[4],
				m13 = te[8],
				m21 = te[1],
				m22 = te[5],
				m23 = te[9],
				m31 = te[2],
				m32 = te[6],
				m33 = te[10],
				trace = m11 + m22 + m33;
			let s;
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

			const qax = a._x,
				qay = a._y,
				qaz = a._z,
				qaw = a._w;
			const qbx = b._x,
				qby = b._y,
				qbz = b._z,
				qbw = b._w;
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
			const w1 = q1._w,
				x1 = q1._x,
				y1 = q1._y,
				z1 = q1._z;
			let w2 = q2._w,
				x2 = q2._x,
				y2 = q2._y,
				z2 = q2._z;
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
			if (t === 0) return this;
			if (t === 1) return this.copy(qb);
			const x = this._x,
				y = this._y,
				z = this._z,
				w = this._w;

			// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

			let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;
			if (cosHalfTheta < 0) {
				this._w = -qb._w;
				this._x = -qb._x;
				this._y = -qb._y;
				this._z = -qb._z;
				cosHalfTheta = -cosHalfTheta;
			} else {
				this.copy(qb);
			}
			if (cosHalfTheta >= 1.0) {
				this._w = w;
				this._x = x;
				this._y = y;
				this._z = z;
				return this;
			}
			const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
			if (sqrSinHalfTheta <= Number.EPSILON) {
				const s = 1 - t;
				this._w = s * w + t * this._w;
				this._x = s * x + t * this._x;
				this._y = s * y + t * this._y;
				this._z = s * z + t * this._z;
				this.normalize(); // normalize calls onChangeCallback()

				return this;
			}
			const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
			const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
			const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
				ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
			this._w = w * ratioA + this._w * ratioB;
			this._x = x * ratioA + this._x * ratioB;
			this._y = y * ratioA + this._y * ratioB;
			this._z = z * ratioA + this._z * ratioB;
			this.onChangeCallback();
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
			return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
		}

		/**
		 * Sets this quaternion's components from the given array.
		 * @param {Array<number>} array - An array holding the quaternion component values.
		 * @param {number} [offset=0] - The offset into the array.
		 * @param {boolean} [denormalize=false] - If true, denormalize the values, and array should be a typed array.
		 * @returns {Quaternion} A reference to this quaternion.
		 */
		fromArray(array, offset = 0, denormalize = false) {
			let x = array[offset],
				y = array[offset + 1],
				z = array[offset + 2],
				w = array[offset + 3];
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
			let x = this._x,
				y = this._y,
				z = this._z,
				w = this._w;
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
			const xy2 = 2.0 * this._x * this._y,
				xz2 = 2.0 * this._x * this._z,
				xw2 = 2.0 * this._x * this._w;
			const yz2 = 2.0 * this._y * this._z,
				yw2 = 2.0 * this._y * this._w,
				zw2 = 2.0 * this._z * this._w;
			const xx = this._x * this._x,
				yy = this._y * this._y,
				zz = this._z * this._z,
				ww = this._w * this._w;
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
		*[Symbol.iterator]() {
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

	/**
	 * Interpolant serves as the base class for all interpolation algorithms.
	 * It defines a set of static methods that are intended to be invoked by a keyframe track for the purpose of interpolation.
	 * @abstract
	 */
	class KeyframeInterpolant {
		/**
		 * Get the value size for keyframe values.
		 * @returns {number} - the value size.
		 */
		static getValueSize() {
			return this.values.length / this.times.length;
		}

		/**
		 * Interpolate the value for the specified time.
		 * @param {number} index0 - the index of the first keyframe.
		 * @param {number} ratio - the ratio (0-1) of the time passed between the first keyframe and the next keyframe.
		 * @param {number} duration - the duration time between the first keyframe and the next keyframe.
		 * @param {Array} outBuffer - the output buffer to store the interpolated value.
		 * @returns {Array} - the output buffer to store the interpolated value.
		 */
		static interpolate(index0, ratio, duration, outBuffer) {
			throw new Error('Interpolant: call to abstract method');
		}

		/**
		 * Copy the value for the specified index.
		 * @param {number} index - the index of the keyframe.
		 * @param {Array} outBuffer - the output buffer to store the copied value.
		 * @returns {Array} - the output buffer to store the copied value.
		 */
		static copyValue(index, outBuffer) {
			const values = this.values,
				valueSize = this.valueSize,
				offset = valueSize * index;
			for (let i = 0; i < valueSize; i++) {
				outBuffer[i] = values[offset + i];
			}
			return outBuffer;
		}
	}

	/**
	 * Step (Discrete) interpolation of keyframe values.
	 * @extends KeyframeInterpolant
	 */
	class StepInterpolant extends KeyframeInterpolant {
		static interpolate(index0, ratio, duration, outBuffer) {
			const values = this.values,
				valueSize = this.valueSize,
				offset = valueSize * index0;
			for (let i = 0; i < valueSize; i++) {
				outBuffer[i] = values[offset + i];
			}
			return outBuffer;
		}
	}

	/**
	 * Linear interpolation of keyframe values.
	 * @extends KeyframeInterpolant
	 */
	class LinearInterpolant extends KeyframeInterpolant {
		static interpolate(index0, ratio, duration, outBuffer) {
			const values = this.values,
				valueSize = this.valueSize,
				offset0 = index0 * valueSize,
				offset1 = (index0 + 1) * valueSize;
			let value1, value2;
			for (let i = 0; i < valueSize; i++) {
				value1 = values[offset0 + i];
				value2 = values[offset1 + i];
				if (value1 !== undefined && value2 !== undefined) {
					outBuffer[i] = value1 * (1 - ratio) + value2 * ratio;
				} else {
					outBuffer[i] = value1;
				}
			}
			return outBuffer;
		}
	}

	/**
	 * Quaternion Linear interpolation of keyframe values.
	 * @extends KeyframeInterpolant
	 */
	class QuaternionLinearInterpolant extends KeyframeInterpolant {
		static interpolate(index0, ratio, duration, outBuffer) {
			const values = this.values,
				valueSize = this.valueSize;
			Quaternion.slerpFlat(outBuffer, 0, values, index0 * valueSize, values, (index0 + 1) * valueSize, ratio);
			return outBuffer;
		}
	}

	/**
	 * Cubic spline interpolation of keyframe values.
	 * @extends KeyframeInterpolant
	 */
	class CubicSplineInterpolant extends KeyframeInterpolant {
		static getValueSize() {
			return this.values.length / this.times.length / 3;
		}
		static interpolate(index0, ratio, duration, outBuffer) {
			const values = this.values,
				valueSize = this.valueSize,
				valueSize2 = valueSize * 2,
				valueSize3 = valueSize * 3,
				rr = ratio * ratio,
				rrr = rr * ratio,
				offset0 = index0 * valueSize3,
				offset1 = offset0 + valueSize3,
				s2 = -2 * rrr + 3 * rr,
				s3 = rrr - rr,
				s0 = 1 - s2,
				s1 = s3 - rr + ratio;

			// Layout of keyframe output values for CUBICSPLINE animations:
			//	 [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
			for (let i = 0; i < valueSize; i++) {
				const p0 = values[offset0 + i + valueSize],
					// splineVertex_k
					m0 = values[offset0 + i + valueSize2] * duration,
					// outTangent_k * (t_k+1 - t_k)
					p1 = values[offset1 + i + valueSize],
					// splineVertex_k+1
					m1 = values[offset1 + i] * duration; // inTangent_k+1 * (t_k+1 - t_k)

				outBuffer[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
			}
			return outBuffer;
		}
		static copyValue(index, outBuffer) {
			const values = this.values,
				valueSize = this.valueSize,
				offset = valueSize * index * 3 + valueSize;
			for (let i = 0; i < valueSize; i++) {
				outBuffer[i] = values[offset + i];
			}
			return outBuffer;
		}
	}

	/**
	 * Quaternion Cubic spline interpolation of keyframe values.
	 * @extends CubicSplineInterpolant
	 */
	class QuaternionCubicSplineInterpolant extends CubicSplineInterpolant {
		static interpolate(index0, ratio, duration, outBuffer) {
			const result = super.interpolate(index0, ratio, duration, outBuffer);
			_q.fromArray(result).normalize().toArray(result);
			return result;
		}
	}
	const _q = new Quaternion();

	/**
	 * Base class for property track.
	 * @abstract
	 */
	class KeyframeTrack {
		/**
		 * @param {Object3D|Material} target
		 * @param {string} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {KeyframeInterpolant.constructor} [interpolant=LinearInterpolant]
		 */
		constructor(target, propertyPath, times, values, interpolant = LinearInterpolant) {
			this.target = target;
			this.propertyPath = propertyPath;
			this.name = this.target.uuid + '.' + propertyPath;
			this.times = times;
			this.values = values;
			this.valueSize = 0;
			this.interpolant = null;

			// since 0.2.2, remove this after few versions later
			if (interpolant === true) {
				interpolant = LinearInterpolant;
			} else if (interpolant === false) {
				interpolant = StepInterpolant;
			}
			this.setInterpolant(interpolant);
		}

		/**
		 * Set interpolant for this keyframe track.
		 * @param {KeyframeInterpolant.constructor} interpolant
		 * @returns {KeyframeTrack}
		 */
		setInterpolant(interpolant) {
			this.valueSize = interpolant.getValueSize.call(this);
			this.interpolant = interpolant;
			return this;
		}

		/**
		 * Get value at time.
		 * The value will be interpolated by interpolant if time is between keyframes.
		 * @param {number} t - time
		 * @param {Array} outBuffer - output buffer
		 * @returns {Array} output buffer
		 */
		getValue(t, outBuffer) {
			const interpolant = this.interpolant,
				times = this.times,
				tl = times.length;
			if (t <= times[0]) {
				return interpolant.copyValue.call(this, 0, outBuffer);
			} else if (t >= times[tl - 1]) {
				return interpolant.copyValue.call(this, tl - 1, outBuffer);
			}

			// TODO use index cache for better performance
			// https://github.com/mrdoob/three.js/blob/dev/src/math/Interpolant.js
			let i0 = tl - 1;
			while (t < times[i0] && i0 > 0) {
				i0--;
			}
			const duration = times[i0 + 1] - times[i0];
			const ratio = (t - times[i0]) / duration;
			return interpolant.interpolate.call(this, i0, ratio, duration, outBuffer);
		}
	}

	/**
	 * Used for boolean property track.
	 * @extends KeyframeTrack
	 */
	class BooleanKeyframeTrack extends KeyframeTrack {
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
	 * @default 'bool'
	 */
	BooleanKeyframeTrack.prototype.valueTypeName = 'bool';

	/**
	 * Used for color property track.
	 * @extends KeyframeTrack
	 */
	class ColorKeyframeTrack extends KeyframeTrack {
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
	 * @default 'color'
	 */
	ColorKeyframeTrack.prototype.valueTypeName = 'color';

	/**
	 * Used for number property track.
	 * @extends KeyframeTrack
	 */
	class NumberKeyframeTrack extends KeyframeTrack {
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
	 * @default 'number'
	 */
	NumberKeyframeTrack.prototype.valueTypeName = 'number';

	/**
	 * Used for quaternion property track.
	 * @extends KeyframeTrack
	 */
	class QuaternionKeyframeTrack extends KeyframeTrack {
		/**
		 * @param {Object3D} target
		 * @param {string} propertyPath
		 * @param {Array} times
		 * @param {Array} values
		 * @param {KeyframeInterpolant.constructor} [interpolant=QuaternionLinearInterpolant]
		 */
		constructor(target, propertyPath, times, values, interpolant = QuaternionLinearInterpolant) {
			// since 0.2.2, remove this after few versions later
			if (interpolant === true) {
				interpolant = QuaternionLinearInterpolant;
			}
			super(target, propertyPath, times, values, interpolant);
		}
	}

	/**
	 * @readonly
	 * @type {string}
	 * @default 'quaternion'
	 */
	QuaternionKeyframeTrack.prototype.valueTypeName = 'quaternion';

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

	/**
	 * Enum for material Type.
	 * @readonly
	 * @enum {string}
	 */
	const MATERIAL_TYPE = {
		BASIC: 'basic',
		LAMBERT: 'lambert',
		PHONG: 'phong',
		PBR: 'pbr',
		PBR2: 'pbr2',
		POINT: 'point',
		LINE: 'line',
		SHADER: 'shader',
		DEPTH: 'depth',
		DISTANCE: 'distance'
	};

	/**
	 * Enum for blend Type.
	 * @readonly
	 * @enum {string}
	 */
	const BLEND_TYPE = {
		NONE: 'none',
		NORMAL: 'normal',
		ADD: 'add',
		SUB: 'sub',
		MUL: 'mul',
		CUSTOM: 'custom'
	};

	/**
	 * Enum for blend equation.
	 * @readonly
	 * @enum {number}
	 */
	const BLEND_EQUATION = {
		ADD: 100,
		SUBTRACT: 101,
		REVERSE_SUBTRACT: 102,
		/** Only webgl2 */
		MIN: 103,
		MAX: 104
	};

	/**
	 * Enum for blend factor.
	 * @readonly
	 * @enum {number}
	 */
	const BLEND_FACTOR = {
		ZERO: 200,
		ONE: 201,
		SRC_COLOR: 202,
		SRC_ALPHA: 203,
		SRC_ALPHA_SATURATE: 204,
		DST_COLOR: 205,
		DST_ALPHA: 206,
		ONE_MINUS_SRC_COLOR: 207,
		ONE_MINUS_SRC_ALPHA: 208,
		ONE_MINUS_DST_COLOR: 209,
		ONE_MINUS_DST_ALPHA: 210
	};

	/**
	 * Enum for cull face Type.
	 * @readonly
	 * @enum {string}
	 */
	const CULL_FACE_TYPE = {
		NONE: 'none',
		FRONT: 'front',
		BACK: 'back',
		FRONT_AND_BACK: 'front_and_back'
	};

	/**
	 * Enum for draw side.
	 * @readonly
	 * @enum {string}
	 */
	const DRAW_SIDE = {
		FRONT: 'front',
		BACK: 'back',
		DOUBLE: 'double'
	};

	/**
	 * Enum for shading side.
	 * @readonly
	 * @enum {string}
	 */
	const SHADING_TYPE = {
		SMOOTH_SHADING: 'smooth_shading',
		FLAT_SHADING: 'flat_shading'
	};

	/**
	 * Enum for pixel format.
	 * @readonly
	 * @enum {number}
	 */
	const PIXEL_FORMAT = {
		DEPTH_COMPONENT: 1000,
		DEPTH_STENCIL: 1001,
		STENCIL_INDEX8: 1002,
		ALPHA: 1003,
		RED: 1004,
		RGB: 1005,
		RGBA: 1006,
		LUMINANCE: 1007,
		LUMINANCE_ALPHA: 1008,
		/** Only webgl2 */
		RED_INTEGER: 1010,
		RG: 1011,
		RG_INTEGER: 1012,
		RGB_INTEGER: 1013,
		RGBA_INTEGER: 1014,
		/** Only internal formats and webgl2 */
		R32F: 1100,
		R16F: 1101,
		R8: 1102,
		RG32F: 1103,
		RG16F: 1104,
		RG8: 1105,
		RGB32F: 1106,
		RGB16F: 1107,
		RGB8: 1108,
		RGBA32F: 1109,
		RGBA16F: 1110,
		RGBA8: 1111,
		RGBA4: 1112,
		RGB5_A1: 1113,
		DEPTH_COMPONENT32F: 1114,
		DEPTH_COMPONENT24: 1115,
		DEPTH_COMPONENT16: 1116,
		DEPTH24_STENCIL8: 1117,
		DEPTH32F_STENCIL8: 1118,
		R11F_G11F_B10F: 1119,
		/** For compressed texture formats */
		RGB_S3TC_DXT1: 1200,
		RGBA_S3TC_DXT1: 1201,
		RGBA_S3TC_DXT3: 1202,
		RGBA_S3TC_DXT5: 1203,
		RGB_PVRTC_4BPPV1: 1204,
		RGB_PVRTC_2BPPV1: 1205,
		RGBA_PVRTC_4BPPV1: 1206,
		RGBA_PVRTC_2BPPV1: 1207,
		RGB_ETC1: 1208,
		RGBA_ASTC_4x4: 1209,
		RGBA_BPTC: 1210
	};

	/**
	 * Enum for pixel Type.
	 * @readonly
	 * @enum {number}
	 */
	const PIXEL_TYPE = {
		UNSIGNED_BYTE: 1500,
		UNSIGNED_SHORT_5_6_5: 1501,
		UNSIGNED_SHORT_4_4_4_4: 1502,
		UNSIGNED_SHORT_5_5_5_1: 1503,
		UNSIGNED_SHORT: 1504,
		UNSIGNED_INT: 1505,
		UNSIGNED_INT_24_8: 1506,
		FLOAT: 1507,
		HALF_FLOAT: 1508,
		FLOAT_32_UNSIGNED_INT_24_8_REV: 1509,
		BYTE: 1510,
		SHORT: 1511,
		INT: 1512
	};

	/**
	 * Enum for texture filter.
	 * @readonly
	 * @enum {number}
	 */
	const TEXTURE_FILTER = {
		NEAREST: 1600,
		LINEAR: 1601,
		NEAREST_MIPMAP_NEAREST: 1602,
		LINEAR_MIPMAP_NEAREST: 1603,
		NEAREST_MIPMAP_LINEAR: 1604,
		LINEAR_MIPMAP_LINEAR: 1605
	};

	/**
	 * Enum for texture wrap.
	 * @readonly
	 * @enum {number}
	 */
	const TEXTURE_WRAP = {
		REPEAT: 1700,
		CLAMP_TO_EDGE: 1701,
		MIRRORED_REPEAT: 1702
	};

	/**
	 * Enum for compare function.
	 * @readonly
	 * @enum {number}
	 */
	const COMPARE_FUNC = {
		LEQUAL: 0x0203,
		GEQUAL: 0x0206,
		LESS: 0x0201,
		GREATER: 0x0204,
		EQUAL: 0x0202,
		NOTEQUAL: 0x0205,
		ALWAYS: 0x0207,
		NEVER: 0x0200
	};

	/**
	 * Enum for operation.
	 * @readonly
	 * @enum {number}
	 */
	const OPERATION = {
		KEEP: 0x1E00,
		REPLACE: 0x1E01,
		INCR: 0x1E02,
		DECR: 0x1E03,
		INVERT: 0x150A,
		INCR_WRAP: 0x8507,
		DECR_WRAP: 0x8508
	};

	/**
	 * Enum for Shadow Type.
	 * @readonly
	 * @enum {string}
	 */
	const SHADOW_TYPE = {
		HARD: 'hard',
		POISSON_SOFT: 'poisson_soft',
		PCF3_SOFT: 'pcf3_soft',
		PCF5_SOFT: 'pcf5_soft',
		/** Only webgl2 */
		PCSS16_SOFT: 'pcss16_soft',
		PCSS32_SOFT: 'pcss32_soft',
		PCSS64_SOFT: 'pcss64_soft'
	};

	/**
	 * Enum for Texel Encoding Type.
	 * @readonly
	 * @enum {string}
	 */
	const TEXEL_ENCODING_TYPE = {
		LINEAR: 'linear',
		SRGB: 'sRGB',
		GAMMA: 'Gamma'
	};

	/**
	 * Enum for Envmap Combine Type.
	 * @readonly
	 * @enum {string}
	 */
	const ENVMAP_COMBINE_TYPE = {
		MULTIPLY: 'ENVMAP_BLENDING_MULTIPLY',
		MIX: 'ENVMAP_BLENDING_MIX',
		ADD: 'ENVMAP_BLENDING_ADD'
	};

	/**
	 * Enum for Draw Mode.
	 * @readonly
	 * @enum {number}
	 */
	const DRAW_MODE = {
		POINTS: 0,
		LINES: 1,
		LINE_LOOP: 2,
		LINE_STRIP: 3,
		TRIANGLES: 4,
		TRIANGLE_STRIP: 5,
		TRIANGLE_FAN: 6
	};

	/**
	 * Enum for Vertex Color.
	 * @readonly
	 * @enum {number}
	 */
	const VERTEX_COLOR = {
		NONE: 0,
		RGB: 1,
		RGBA: 2
	};

	/**
	 * Enum for ATTACHMENT
	 * @readonly
	 * @enum {number}
	 */
	const ATTACHMENT = {
		COLOR_ATTACHMENT0: 2000,
		COLOR_ATTACHMENT1: 2001,
		COLOR_ATTACHMENT2: 2002,
		COLOR_ATTACHMENT3: 2003,
		COLOR_ATTACHMENT4: 2004,
		COLOR_ATTACHMENT5: 2005,
		COLOR_ATTACHMENT6: 2006,
		COLOR_ATTACHMENT7: 2007,
		COLOR_ATTACHMENT8: 2008,
		COLOR_ATTACHMENT9: 2009,
		COLOR_ATTACHMENT10: 2010,
		COLOR_ATTACHMENT11: 2011,
		COLOR_ATTACHMENT12: 2012,
		COLOR_ATTACHMENT13: 2013,
		COLOR_ATTACHMENT14: 2014,
		COLOR_ATTACHMENT15: 2015,
		DEPTH_ATTACHMENT: 2020,
		STENCIL_ATTACHMENT: 2021,
		DEPTH_STENCIL_ATTACHMENT: 2030
	};

	/**
	 * Enum for BUFFER_USAGE
	 * @readonly
	 * @enum {number}
	 */
	const BUFFER_USAGE = {
		STREAM_DRAW: 35040,
		STREAM_READ: 35041,
		STREAM_COPY: 35042,
		STATIC_DRAW: 35044,
		STATIC_READ: 35045,
		STATIC_COPY: 35046,
		DYNAMIC_DRAW: 35048,
		DYNAMIC_READ: 35049,
		DYNAMIC_COPY: 35050
	};

	/**
	 * Enum for QUERY_TYPE
	 * @readonly
	 * @enum {number}
	 */
	const QUERY_TYPE = {
		ANY_SAMPLES_PASSED: 7000,
		ANY_SAMPLES_PASSED_CONSERVATIVE: 7001,
		TIME_ELAPSED: 7002
	};

	/**
	 * JavaScript events for custom objects.
	 */
	class EventDispatcher {
		/**
		 * Adds a listener to an event type.
		 * @param {string} type - The type of event to listen to.
		 * @param {Function} listener - The function that gets called when the event is fired.
		 */
		addEventListener(type, listener) {
			if (this._listeners === undefined) this._listeners = {};
			const listeners = this._listeners;
			if (listeners[type] === undefined) {
				listeners[type] = [];
			}
			if (listeners[type].indexOf(listener) === -1) {
				listeners[type].push(listener);
			}
		}

		/**
		 * Removes a listener from an event type.
		 * @param {string} type - The type of the listener that gets removed.
		 * @param {Function} listener - The listener function that gets removed.
		 */
		removeEventListener(type, listener) {
			const listeners = this._listeners;
			if (listeners === undefined) return;
			const listenerArray = listeners[type];
			if (listenerArray !== undefined) {
				const index = listenerArray.indexOf(listener);
				if (index !== -1) {
					listenerArray.splice(index, 1);
				}
			}
		}

		/**
		 * Fire an event.
		 * @param {object} event - The event that gets fired.
		 */
		dispatchEvent(event) {
			const listeners = this._listeners;
			if (listeners === undefined) return;
			const listenerArray = listeners[event.type];
			if (listenerArray !== undefined) {
				event.target = this;

				// Make a copy, in case listeners are removed while iterating.
				const array = listenerArray.slice(0);
				for (let i = 0, l = array.length; i < l; i++) {
					array[i].call(this, event);
				}
				event.target = null;
			}
		}
	}

	/**
	 * AnimationAction wraps AnimationClip and is mainly responsible for the update logic of time.
	 * You can extend other functions by inheriting this class, such as repeat playback, pingpang, etc.
	 * And since this class inherits from EventDispatcher, animation events can also be extended.
	 * @extends EventDispatcher
	 */
	class AnimationAction extends EventDispatcher {
		/**
		 * @param {KeyframeClip} clip - The keyframe clip for this action.
		 */
		constructor(clip) {
			super();

			/**
			 * The keyframe clip for this action.
			 * @type {KeyframeClip}
			 */
			this.clip = clip;

			/**
			 * The degree of influence of this action (in the interval [0, 1]).
			 * Values can be used to blend between several actions.
			 * @type {number}
			 * @default 0
			 */
			this.weight = 0;

			/**
			 * The local time of this action (in seconds).
			 * @type {number}
			 */
			this.time = 0;

			/**
			 * The blend mode for this action, currently only two values BLEND_TYPE.NORMAL and BLEND_TYPE.ADD are available.
			 * @type {BLEND_TYPE}
			 * @default {BLEND_TYPE.NORMAL}
			 */
			this.blendMode = BLEND_TYPE.NORMAL;
		}

		/**
		 * Update time.
		 * @param {number} deltaTime - The delta time in seconds.
		 */
		update(deltaTime) {
			this.time += deltaTime;
			const endTime = this.clip.duration;
			if (endTime === 0) {
				this.time = 0;
				return;
			}
			if (this.time > endTime) {
				this.time = this.time % endTime;
			}
			if (this.time < 0) {
				this.time = this.time % endTime + endTime;
			}
		}
	}

	/**
	 * This holds a reference to a real property in the scene graph; used internally.
	 * Binding property and value, mixer for multiple values.
	 */
	class PropertyBindingMixer {
		/**
		 * @param {Object3D|Material} target
		 * @param {string} propertyPath
		 * @param {string} typeName - vector/bool/string/quaternion/number/color
		 * @param {number} valueSize
		 */
		constructor(target, propertyPath, typeName, valueSize) {
			this.target = null;
			this.property = '';
			this.parseBinding(target, propertyPath);
			this.valueSize = valueSize;
			let BufferType = Float64Array;
			let mixFunction, mixFunctionAdditive, setIdentity;
			switch (typeName) {
				case 'quaternion':
					mixFunction = slerp;
					mixFunctionAdditive = slerpAdditive;
					setIdentity = setIdentityQuaternion;
					break;
				case 'string':
				case 'bool':
					BufferType = Array;
					mixFunction = select;
					mixFunctionAdditive = select;
					setIdentity = setIdentityOther;
					break;
				default:
					mixFunction = lerp;
					mixFunctionAdditive = lerpAdditive;
					setIdentity = setIdentityNumeric;
			}

			// [ incoming | accu | orig | addAccu ]
			this.buffer = new BufferType(valueSize * 4);
			this._mixBufferFunction = mixFunction;
			this._mixBufferFunctionAdditive = mixFunctionAdditive;
			this._setIdentity = setIdentity;
			this.cumulativeWeight = 0;
			this.cumulativeWeightAdditive = 0;
		}
		parseBinding(target, propertyPath) {
			propertyPath = propertyPath.split('.');
			if (propertyPath.length > 1) {
				let property = target[propertyPath[0]];
				for (let index = 1; index < propertyPath.length - 1; index++) {
					property = property[propertyPath[index]];
				}
				this.property = propertyPath[propertyPath.length - 1];
				this.target = property;
			} else {
				this.property = propertyPath[0];
				this.target = target;
			}
		}

		/**
		 * Remember the state of the bound property and copy it to both accus.
		 */
		saveOriginalState() {
			const buffer = this.buffer,
				stride = this.valueSize,
				originalValueOffset = stride * 2;

			// get value
			if (this.valueSize > 1) {
				if (this.target[this.property].toArray) {
					this.target[this.property].toArray(buffer, originalValueOffset);
				} else {
					setArray(buffer, this.target[this.property], originalValueOffset, this.valueSize);
				}
			} else {
				this.target[this.property] = buffer[originalValueOffset];
			}

			// accu[0..1] := orig -- initially detect changes against the original
			for (let i = stride, e = originalValueOffset; i !== e; ++i) {
				buffer[i] = buffer[originalValueOffset + i % stride];
			}

			// Add to identify for additive
			this._setIdentity(buffer, stride * 3, stride, originalValueOffset);
			this.cumulativeWeight = 0;
			this.cumulativeWeightAdditive = 0;
		}

		/**
		 * Apply the state previously taken via 'saveOriginalState' to the binding.
		 */
		restoreOriginalState() {
			const buffer = this.buffer,
				stride = this.valueSize,
				originalValueOffset = stride * 2;

			// accu[0..1] := orig -- initially detect changes against the original
			for (let i = stride, e = originalValueOffset; i !== e; ++i) {
				buffer[i] = buffer[originalValueOffset + i % stride];
			}
			this.apply();
		}

		/**
		 * Accumulate value.
		 * @param {number} weight
		 */
		accumulate(weight) {
			const buffer = this.buffer,
				stride = this.valueSize,
				offset = stride;
			let currentWeight = this.cumulativeWeight;
			if (currentWeight === 0) {
				for (let i = 0; i !== stride; ++i) {
					buffer[offset + i] = buffer[i];
				}
				currentWeight = weight;
			} else {
				currentWeight += weight;
				const mix = weight / currentWeight;
				this._mixBufferFunction(buffer, offset, 0, mix, stride);
			}
			this.cumulativeWeight = currentWeight;
		}

		/**
		 * Additive Accumulate value.
		 * @param {number} weight
		 */
		accumulateAdditive(weight) {
			const buffer = this.buffer,
				stride = this.valueSize,
				offset = stride * 3;
			if (this.cumulativeWeightAdditive === 0) {
				this._setIdentity(buffer, offset, stride, stride * 2);
			}
			this._mixBufferFunctionAdditive(buffer, offset, 0, weight, stride);
			this.cumulativeWeightAdditive += weight;
		}

		/**
		 * Apply to scene graph.
		 */
		apply() {
			const buffer = this.buffer,
				stride = this.valueSize,
				weight = this.cumulativeWeight,
				weightAdditive = this.cumulativeWeightAdditive;
			this.cumulativeWeight = 0;
			this.cumulativeWeightAdditive = 0;
			if (weight < 1) {
				// accuN := accuN + original * ( 1 - cumulativeWeight )
				const originalValueOffset = stride * 2;
				this._mixBufferFunction(buffer, stride, originalValueOffset, 1 - weight, stride);
			}
			if (weightAdditive > 0) {
				// accuN := accuN + additive accuN
				this._mixBufferFunctionAdditive(buffer, stride, 3 * stride, 1, stride);
			}

			// set value
			if (this.valueSize > 1) {
				if (this.target[this.property].fromArray) {
					this.target[this.property].fromArray(buffer, stride);
				} else {
					getArray(this.target[this.property], buffer, stride, this.valueSize);
				}
			} else {
				this.target[this.property] = buffer[stride];
			}
			if (this.target.isTransformUV) {
				this.target.needsUpdate = true;
			}
		}
	}

	// Mix functions

	function select(buffer, dstOffset, srcOffset, t, stride) {
		if (t >= 0.5) {
			for (let i = 0; i !== stride; ++i) {
				buffer[dstOffset + i] = buffer[srcOffset + i];
			}
		}
	}
	function slerp(buffer, dstOffset, srcOffset, t) {
		Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, srcOffset, t);
	}
	const tempQuternionBuffer = new Float64Array(4);
	function slerpAdditive(buffer, dstOffset, srcOffset, t) {
		// Store result in tempQuternionBuffer
		Quaternion.multiplyQuaternionsFlat(tempQuternionBuffer, 0, buffer, dstOffset, buffer, srcOffset);
		// Slerp to the result
		Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, tempQuternionBuffer, 0, t);
	}
	function lerp(buffer, dstOffset, srcOffset, t, stride) {
		const s = 1 - t;
		for (let i = 0; i !== stride; ++i) {
			const j = dstOffset + i;
			buffer[j] = buffer[j] * s + buffer[srcOffset + i] * t;
		}
	}
	function lerpAdditive(buffer, dstOffset, srcOffset, t, stride) {
		for (let i = 0; i !== stride; ++i) {
			const j = dstOffset + i;
			buffer[j] = buffer[j] + buffer[srcOffset + i] * t;
		}
	}

	// identity
	function setIdentityNumeric(buffer, offset, stride) {
		for (let i = 0; i < stride; i++) {
			buffer[offset + i] = 0;
		}
	}
	function setIdentityQuaternion(buffer, offset) {
		setIdentityNumeric(buffer, offset, 3);
		buffer[offset + 3] = 1;
	}
	function setIdentityOther(buffer, offset, stride, copyOffset) {
		for (let i = 0; i < stride; i++) {
			buffer[offset + i] = buffer[copyOffset + i];
		}
	}

	// get array
	function getArray(target, source, stride, count) {
		for (let i = 0; i < count; i++) {
			target[i] = source[stride + i];
		}
	}
	function setArray(target, source, stride, count) {
		for (let i = 0; i < count; i++) {
			target[stride + i] = source[i];
		}
	}

	/**
	 * The AnimationMixer is a player for animations on a particular object in the scene.
	 * When multiple objects in the scene are animated independently, one AnimationMixer may be used for each object.
	 */
	class AnimationMixer {
		constructor() {
			this._actions = [];
			this._bindings = {};
		}

		/**
		 * Add an action to this mixer.
		 * @param {AnimationAction} action - The action to add.
		 */
		addAction(action) {
			if (this._actions.indexOf(action) !== -1) {
				console.warn('AnimationMixer.addAction(): already has the action, clip name is <' + action.clip.name + '>.');
				return;
			}
			this._actions.push(action);
			const tracks = action.clip.tracks;
			for (let i = 0; i < tracks.length; i++) {
				const track = tracks[i];
				const trackName = track.name;
				if (!this._bindings[trackName]) {
					const binding = new PropertyBindingMixer(track.target, track.propertyPath, track.valueTypeName, track.valueSize);
					this._bindings[trackName] = {
						binding,
						referenceCount: 0,
						active: false,
						cachedActive: false
					};
				}
				this._bindings[trackName].referenceCount++;
			}
		}

		/**
		 * Remove an action from this mixer.
		 * @param {AnimationAction} action - The action to be removed.
		 */
		removeAction(action) {
			const index = this._actions.indexOf(action);
			if (index === -1) {
				console.warn('AnimationMixer.removeAction(): action not found in this mixer, clip name is <' + action.clip.name + '>.');
				return;
			}
			if (action.weight > 0) {
				console.warn('AnimationMixer.removeAction(): make sure action\'s weight is zero before removing it.');
				return;
			}
			this._actions.splice(index, 1);
			const tracks = action.clip.tracks;
			for (let i = 0; i < tracks.length; i++) {
				const trackName = tracks[i].name;
				const bindingInfo = this._bindings[trackName];
				if (bindingInfo) {
					if (--bindingInfo.referenceCount <= 0) {
						if (bindingInfo.cachedActive) {
							bindingInfo.binding.restoreOriginalState();
						}
						delete this._bindings[trackName];
					}
				}
			}
		}

		/**
		 * Whether has this action.
		 * @param {AnimationAction} action - The action.
		 * @returns {boolean}
		 */
		hasAction(action) {
			return this._actions.indexOf(action) > -1;
		}

		/**
		 * Get all actions.
		 * @returns {AnimationAction[]}
		 */
		getActions() {
			return this._actions;
		}

		/**
		 * Advances the global mixer time and updates the animation.
		 * @param {number} deltaTime - The delta time in seconds.
		 */
		update(deltaTime) {
			// Mark active to false for all bindings.

			for (const bindingName in this._bindings) {
				this._bindings[bindingName].active = false;
			}

			// Update the time of actions with a weight greater than 1
			// And accumulate those bindings

			for (let i = 0, l = this._actions.length; i < l; i++) {
				const action = this._actions[i];
				if (action.weight > 0) {
					action.update(deltaTime);
					const tracks = action.clip.tracks;
					for (let j = 0, tl = tracks.length; j < tl; j++) {
						const track = tracks[j];
						const bindingInfo = this._bindings[track.name];
						const binding = bindingInfo.binding;
						bindingInfo.active = true;
						if (!bindingInfo.cachedActive) {
							bindingInfo.binding.saveOriginalState();
							bindingInfo.cachedActive = true;
						}
						track.getValue(action.time, binding.buffer);
						if (action.blendMode === BLEND_TYPE.ADD) {
							binding.accumulateAdditive(action.weight);
						} else {
							binding.accumulate(action.weight);
						}
					}
				}
			}

			// Apply all bindings.

			for (const bindingName in this._bindings) {
				const bindingInfo = this._bindings[bindingName];
				if (bindingInfo.active) {
					bindingInfo.binding.apply();
				} else {
					if (bindingInfo.cachedActive) {
						bindingInfo.binding.restoreOriginalState();
						bindingInfo.cachedActive = false;
					}
				}
			}
		}
	}

	/**
	 * An KeyframeClip is a reusable set of keyframe tracks which represent an animation.
	 */
	class KeyframeClip {
		/**
		 * @param {string} [name=''] - A name for this clip.
		 * @param {KeyframeTrack[]} [tracks=[]] - An array of KeyframeTracks.
		 * @param {number} [duration] - The duration of this clip (in seconds). If not passed, the duration will be calculated from the passed tracks array.
		 */
		constructor(name = '', tracks = [], duration = -1) {
			/**
			 * A name for this clip.
			 * @type {string}
			 */
			this.name = name;

			/**
			 * An array of KeyframeTracks.
			 * @type {KeyframeTrack[]}
			 */
			this.tracks = tracks;

			/**
			 * The duration of this clip (in seconds).
			 * If a negative value is passed, the duration will be calculated from the passed tracks array.
			 * @type {number}
			 */
			this.duration = duration;
			if (this.duration < 0) {
				this.resetDuration();
			}
		}

		/**
		 * Sets the duration of the clip to the duration of its longest KeyframeTrack.
		 * @returns {KeyframeClip}
		 */
		resetDuration() {
			const tracks = this.tracks;
			let duration = 0;
			for (let i = 0, l = tracks.length; i < l; i++) {
				const track = tracks[i];
				duration = Math.max(duration, track.times[track.times.length - 1]);
			}
			this.duration = duration;
			return this;
		}
	}

	/**
	 * Handles and keeps track of loaded and pending data. A default global
	 * instance of this class is created and used by loaders if not supplied
	 * manually.
	 * In general that should be sufficient, however there are times when it can
	 * be useful to have separate loaders - for example if you want to show
	 * separate loading bars for objects and textures.
	 * ```js
	 * const manager = new LoadingManager(
	 *	 () => console.log('All items loaded!'),
	 *	 (url, itemsLoaded, itemsTotal) => {
	 *		 console.log(`Loaded ${itemsLoaded} of ${itemsTotal} items`);
	 *	 },
	 *	 url => console.error(`Error loading ${url}`)
	 * );
	 * ```
	 */
	class LoadingManager {
		/**
		 * Constructs a new loading manager.
		 * @param {Function} [onLoad] - Executes when all items have been loaded.
		 * @param {Function} [onProgress] - Executes when single items have been loaded.
		 * @param {Function} [onError] - Executes when an error occurs.
		 */
		constructor(onLoad, onProgress, onError) {
			this.isLoading = false;
			this.itemsLoaded = 0;
			this.itemsTotal = 0;
			this.urlModifier = undefined;

			/**
			 * Executes when an item starts loading.
			 * @type {Function|undefined}
			 * @default undefined
			 */
			this.onStart = undefined;

			/**
			 * Executes when all items have been loaded.
			 * @type {Function|undefined}
			 * @default undefined
			 */
			this.onLoad = onLoad;

			/**
			 * Executes when single items have been loaded.
			 * @type {Function|undefined}
			 * @default undefined
			 */
			this.onProgress = onProgress;

			/**
			 * Executes when an error occurs.
			 * @type {Function|undefined}
			 * @default undefined
			 */
			this.onError = onError;
		}

		/**
		 * This should be called by any loader using the manager when the loader
		 * starts loading an item.
		 * @param {string} url - The URL to load.
		 */
		itemStart(url) {
			this.itemsTotal++;
			if (this.isLoading === false) {
				if (this.onStart !== undefined) {
					this.onStart(url, this.itemsLoaded, this.itemsTotal);
				}
			}
			this.isLoading = true;
		}

		/**
		 * This should be called by any loader using the manager when the loader
		 * ended loading an item.
		 * @param {string} url - The URL of the loaded item.
		 */
		itemEnd(url) {
			this.itemsLoaded++;
			if (this.onProgress !== undefined) {
				this.onProgress(url, this.itemsLoaded, this.itemsTotal);
			}
			if (this.itemsLoaded === this.itemsTotal) {
				this.isLoading = false;
				if (this.onLoad !== undefined) {
					this.onLoad();
				}
			}
		}

		/**
		 * This should be called by any loader using the manager when the loader
		 * encounters an error when loading an item.
		 * @param {string} url - The URL of the item that produces an error.
		 */
		itemError(url) {
			if (this.onError !== undefined) {
				this.onError(url);
			}
		}

		/**
		 * Given a URL, uses the URL modifier callback (if any) and returns a
		 * resolved URL. If no URL modifier is set, returns the original URL.
		 * @param {string} url - The URL to load.
		 * @returns {string} The resolved URL.
		 */
		resolveURL(url) {
			if (this.urlModifier) {
				return this.urlModifier(url);
			}
			return url;
		}

		/**
		 * If provided, the callback will be passed each resource URL before a
		 * request is sent. The callback may return the original URL, or a new URL to
		 * override loading behavior. This behavior can be used to load assets from
		 * .ZIP files, drag-and-drop APIs, and Data URIs.
		 * @param {Function} transform - URL modifier callback. Called with an URL and must return a resolved URL.
		 * @returns {LoadingManager} A reference to this loading manager.
		 * @example
		 * const blobs = { 'fish.gltf': blob1, 'diffuse.png': blob2, 'normal.png': blob3 };
		 *
		 * const manager = new LoadingManager();
		 *
		 * // Initialize loading manager with URL callback.
		 * const objectURLs = [];
		 * manager.setURLModifier(url => {
		 * 	 url = URL.createObjectURL(blobs[url]);
		 * 	 objectURLs.push(url);
		 * 	 return url;
		 * });
		 *
		 * // Load as usual, then revoke the blob URLs.
		 * const loader = new GLTFLoader(manager);
		 * loader.load('fish.gltf', gltf => {
		 * 	 scene.add(gltf.scene);
		 * 	 objectURLs.forEach(url => URL.revokeObjectURL(url));
		 * });
		 */
		setURLModifier(transform) {
			this.urlModifier = transform;
			return this;
		}
	}

	/**
	 * The global default loading manager.
	 * @type {LoadingManager}
	 */
	const DefaultLoadingManager = new LoadingManager();

	/**
	 * Abstract base class for loaders.
	 * @abstract
	 */
	class Loader {
		/**
		 * Constructs a new Loader.
		 * @param {LoadingManager} [manager=DefaultLoadingManager] - The loading manager.
		 */
		constructor(manager) {
			/**
			 * The loading manager.
			 * @type {LoadingManager}
			 * @default DefaultLoadingManager
			 */
			this.manager = manager !== undefined ? manager : DefaultLoadingManager;

			/**
			 * The crossOrigin string to implement CORS for loading the url from a
			 * different domain that allows CORS.
			 * @type {string}
			 * @default 'anonymous'
			 */
			this.crossOrigin = 'anonymous';

			/**
			 * Whether the XMLHttpRequest uses credentials.
			 * @type {boolean}
			 * @default false
			 */
			this.withCredentials = false;

			/**
			 * The base path from which the asset will be loaded.
			 * @type {string}
			 * @default ''
			 */
			this.path = '';

			/**
			 * The [request header]{@link https://developer.mozilla.org/en-US/docs/Glossary/Request_header}
			 * used in HTTP request.
			 * @type {object}
			 * @default {}
			 */
			this.requestHeader = {};
		}

		/**
		 * This method needs to be implement by all concrete loaders.
		 * It holds the logic for loading the asset from the backend.
		 * @param {string} url - The path/URL of the file to be loaded.
		 * @param {Function} onLoad - Executed when the loading process has been finished.
		 * @param {onProgressCallback} [onProgress] - Executed while the loading is in progress.
		 * @param {onErrorCallback} [onError] - Executed when errors occur.
		 */
		load(url, onLoad, onProgress, onError) {}

		/**
		 * A async version of {@link Loader#load}.
		 * @param {string} url - The path/URL of the file to be loaded.
		 * @param {Function} [onProgress] - Executed while the loading is in progress.
		 * @returns {Promise} A Promise that resolves when the asset has been loaded.
		 */
		loadAsync(url, onProgress) {
			const scope = this;
			return new Promise(function (resolve, reject) {
				scope.load(url, resolve, onProgress, reject);
			});
		}

		/**
		 * Sets the `crossOrigin` String to implement CORS for loading the URL
		 * from a different domain that allows CORS.
		 * @param {string} crossOrigin - The `crossOrigin` value.
		 * @returns {Loader} A reference to this instance.
		 */
		setCrossOrigin(crossOrigin) {
			this.crossOrigin = crossOrigin;
			return this;
		}

		/**
		 * Whether the XMLHttpRequest uses credentials such as cookies, authorization
		 * headers or TLS client certificates, see [XMLHttpRequest.withCredentials]{@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials}.
		 * Note: This setting has no effect if you are loading files locally or from the same domain.
		 * @param {boolean} value - The `withCredentials` value.
		 * @returns {Loader} A reference to this instance.
		 */
		setWithCredentials(value) {
			this.withCredentials = value;
			return this;
		}

		/**
		 * Sets the base path for the asset.
		 * @param {string} path - The base path.
		 * @returns {Loader} A reference to this instance.
		 */
		setPath(path) {
			this.path = path;
			return this;
		}

		/**
		 * Sets the given request header.
		 * @param {object} requestHeader - A [request header]{@link https://developer.mozilla.org/en-US/docs/Glossary/Request_header}
		 * for configuring the HTTP request.
		 * @returns {Loader} A reference to this instance.
		 */
		setRequestHeader(requestHeader) {
			this.requestHeader = requestHeader;
			return this;
		}
	}

	/**
	 * A low level class for loading resources with the Fetch API, used internally by
	 * most loaders. It can also be used directly to load any file type that does
	 * not have a loader.
	 * ```js
	 * const loader = new FileLoader();
	 * const data = await loader.loadAsync('example.txt');
	 * ```
	 * @extends Loader
	 */
	class FileLoader extends Loader {
		/**
		 * Constructs a new file loader.
		 * @param {LoadingManager} [manager] - The loading manager.
		 */
		constructor(manager) {
			super(manager);

			/**
			 * The expected response type. See {@link FileLoader.setResponseType}.
			 * @type {'arraybuffer'|'blob'|'document'|'json'|''}
			 * @default ''
			 */
			this.responseType = '';

			/**
			 * The expected mimeType. See {@link FileLoader.setMimeType}.
			 * @type {string}
			 * @default ''
			 */
			this.mimeType = '';
		}

		/**
		 * Starts loading from the given URL and pass the loaded response to the `onLoad()` callback.
		 * @param {string} url — The path/URL of the file to be loaded. This can also be a data URI.
		 * @param {Function} [onLoad] — Executed when the loading process has been finished. The argument is the loaded data.
		 * @param {onProgressCallback} [onProgress] — Executed while the loading is in progress.
		 * @param {onErrorCallback} [onError] — Executed when errors occur.
		 */
		load(url, onLoad, onProgress, onError) {
			if (url === undefined) url = '';
			if (this.path != undefined) url = this.path + url;
			url = this.manager.resolveURL(url);

			// create request
			const req = new Request(url, {
				headers: new Headers(this.requestHeader),
				credentials: this.withCredentials ? 'include' : 'same-origin'
				// An abort controller could be added within a future PR
			});

			// record states ( avoid data race )
			const mimeType = this.mimeType;
			const responseType = this.responseType;

			// start the fetch
			fetch(req).then(response => {
				if (response.status === 200 || response.status === 0) {
					// Some browsers return HTTP Status 0 when using non-http protocol
					// e.g. 'file://' or 'data://'. Handle as success.

					if (response.status === 0) {
						console.warn('FileLoader: HTTP Status 0 received.');
					}

					// Workaround: Checking if response.body === undefined for Alipay browser #23548

					if (typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined) {
						return response;
					}
					const reader = response.body.getReader();

					// Nginx needs X-File-Size check
					// https://serverfault.com/questions/482875/why-does-nginx-remove-content-length-header-for-chunked-content
					const contentLength = response.headers.get('X-File-Size') || response.headers.get('Content-Length');
					const total = contentLength ? parseInt(contentLength) : 0;
					const lengthComputable = total !== 0;
					let loaded = 0;

					// periodically read data into the new stream tracking while download progress
					const stream = new ReadableStream({
						start(controller) {
							readData();
							function readData() {
								reader.read().then(({
									done,
									value
								}) => {
									if (done) {
										controller.close();
									} else {
										loaded += value.byteLength;
										const event = new ProgressEvent('progress', {
											lengthComputable,
											loaded,
											total
										});
										if (onProgress) onProgress(event);
										controller.enqueue(value);
										readData();
									}
								}, error => {
									controller.error(error);
								});
							}
						}
					});
					return new Response(stream);
				} else {
					throw new HttpError(`fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`, response);
				}
			}).then(response => {
				switch (responseType) {
					case 'arraybuffer':
						return response.arrayBuffer();
					case 'blob':
						return response.blob();
					case 'document':
						return response.text().then(text => {
							const parser = new DOMParser();
							return parser.parseFromString(text, mimeType);
						});
					case 'json':
						return response.json();
					default:
						if (mimeType === '') {
							return response.text();
						} else {
							// sniff encoding
							const re = /charset="?([^;"\s]*)"?/i;
							const exec = re.exec(mimeType);
							const label = exec && exec[1] ? exec[1].toLowerCase() : undefined;
							const decoder = new TextDecoder(label);
							return response.arrayBuffer().then(ab => decoder.decode(ab));
						}
				}
			}).then(data => {
				if (onLoad) onLoad(data);
			}).catch(err => {
				onError && onError(err);
				this.manager.itemError(url);
			}).finally(() => {
				this.manager.itemEnd(url);
			});
			this.manager.itemStart(url);
		}

		/**
		 * Sets the expected response type.
		 * @param {'arraybuffer'|'blob'|'document'|'json'|''} value - The response type.
		 * @returns {FileLoader} A reference to this file loader.
		 */
		setResponseType(value) {
			this.responseType = value;
			return this;
		}

		/**
		 * Sets the expected mime type of the loaded file.
		 * @param {string} value - The mime type.
		 * @returns {FileLoader} A reference to this file loader.
		 */
		setMimeType(value) {
			this.mimeType = value;
			return this;
		}
	}
	class HttpError extends Error {
		constructor(message, response) {
			super(message);
			this.response = response;
		}
	}

	/**
	 * A loader for loading images. The class loads images with the HTML `Image` API.
	 * Please note that 'ImageLoader' not support progress events.
	 * ```js
	 * const loader = new ImageLoader();
	 * const image = await loader.loadAsync('image.png');
	 * ```
	 * @extends Loader
	 */
	class ImageLoader extends Loader {
		/**
		 * Constructs a new image loader.
		 * @param {LoadingManager} [manager] - The loading manager.
		 */
		constructor(manager) {
			super(manager);
		}

		/**
		 * Starts loading from the given URL and passes the loaded image
		 * to the `onLoad()` callback. The method also returns a new `Image` object which can
		 * directly be used for texture creation. If you do it this way, the texture
		 * may pop up in your scene once the respective loading process is finished.
		 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
		 * @param {Function} [onLoad] - Executed when the loading process has been finished. The argument is an `HTMLImageElement`.
		 * @param {onProgressCallback} [onProgress] - Unsupported in this loader.
		 * @param {onErrorCallback} [onError] - Executed when errors occur.
		 * @returns {HTMLImageElement} The image.
		 */
		load(url, onLoad, onProgress, onError) {
			if (url === undefined) url = '';
			if (this.path !== undefined) url = this.path + url;
			url = this.manager.resolveURL(url);
			const scope = this;
			const image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');
			function onImageLoad() {
				removeEventListeners();
				if (onLoad) onLoad(this);
				scope.manager.itemEnd(url);
			}
			function onImageError(event) {
				removeEventListeners();
				if (onError) onError(event);
				scope.manager.itemError(url);
				scope.manager.itemEnd(url);
			}
			function removeEventListeners() {
				image.removeEventListener('load', onImageLoad, false);
				image.removeEventListener('error', onImageError, false);
			}
			image.addEventListener('load', onImageLoad, false);
			image.addEventListener('error', onImageError, false);
			if (url.slice(0, 5) !== 'data:') {
				if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin;
			}
			scope.manager.itemStart(url);
			image.src = url;
			return image;
		}
	}

	/**
	 * The vector 2 class
	 */
	class Vector2 {
		/**
		 * @param {number} [x=0] - the x value of this vector.
		 * @param {number} [y=0] - the y value of this vector.
		 */
		constructor(x = 0, y = 0) {
			this.x = x;
			this.y = y;
		}

		/**
		 * Sets the x and y components of this vector.
		 * @param {number} x
		 * @param {number} y
		 * @returns {Vector2}
		 */
		set(x = 0, y = 0) {
			this.x = x;
			this.y = y;
			return this;
		}

		/**
		 * Sets this vector to be the vector linearly interpolated between v1 and v2
		 * where ratio is the percent distance along the line connecting the two vectors
		 * - ratio = 0 will be v1, and ratio = 1 will be v2.
		 * @param {Vector2} v1 - the starting Vector2.
		 * @param {Vector2} v2 - Vector2 to interpolate towards.
		 * @param {number} ratio - interpolation factor, typically in the closed interval [0, 1].
		 * @returns {Vector2}
		 */
		lerpVectors(v1, v2, ratio) {
			return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
		}

		/**
		 * If this vector's x or y value is greater than v's x or y value, replace that value with the corresponding min value.
		 * @param {Vector2} v
		 * @returns {Vector2}
		 */
		min(v) {
			this.x = Math.min(this.x, v.x);
			this.y = Math.min(this.y, v.y);
			return this;
		}

		/**
		 * If this vector's x or y value is less than v's x or y value, replace that value with the corresponding max value.
		 * @param {Vector2} v
		 * @returns {Vector2}
		 */
		max(v) {
			this.x = Math.max(this.x, v.x);
			this.y = Math.max(this.y, v.y);
			return this;
		}

		/**
		 * Computes the Euclidean length (straight-line length) from (0, 0) to (x, y).
		 * @returns {number}
		 */
		getLength() {
			return Math.sqrt(this.getLengthSquared());
		}

		/**
		 * Computes the square of the Euclidean length (straight-line length) from (0, 0) to (x, y).
		 * If you are comparing the lengths of vectors, you should compare the length squared instead
		 * as it is slightly more efficient to calculate.
		 * @returns {number}
		 */
		getLengthSquared() {
			return this.x * this.x + this.y * this.y;
		}

		/**
		 * Converts this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but length 1.
		 * @param {number} [thickness=1]
		 * @returns {Vector2}
		 */
		normalize(thickness = 1) {
			const length = this.getLength() || 1;
			const invLength = thickness / length;
			this.x *= invLength;
			this.y *= invLength;
			return this;
		}

		/**
		 * Subtracts v from the vector.
		 * @param {Vector2} a
		 * @param {Vector2} target - the result vector2
		 * @returns {Vector2}
		 */
		subtract(a, target = new Vector2()) {
			return target.set(this.x - a.x, this.y - a.y);
		}

		/**
		 * Subtracts v from this vector.
		 * @param {Vector2} v
		 * @returns {Vector2}
		 */
		sub(v) {
			this.x -= v.x;
			this.y -= v.y;
			return this;
		}

		/**
		 * Copies the values of the passed Vector2's x and y properties to this Vector2.
		 * @param {Vector2} v
		 * @returns {Vector2}
		 */
		copy(v) {
			this.x = v.x;
			this.y = v.y;
			return this;
		}

		/**
		 * Sets this vector to a + b.
		 * @param {Vector2} a
		 * @param {Vector2} b
		 * @returns {Vector2}
		 */
		addVectors(a, b) {
			this.x = a.x + b.x;
			this.y = a.y + b.y;
			return this;
		}

		/**
		 * Sets this vector to a - b.
		 * @param {Vector2} a
		 * @param {Vector2} b
		 * @returns {Vector2}
		 */
		subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			return this;
		}

		/**
		 * Multiplies this vector by scalar.
		 * @param {number} scalar
		 * @returns {Vector2}
		 */
		multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			return this;
		}

		/**
		 * Computes the squared distance from this vector to v. If you are just comparing the distance with
		 * another distance, you should compare the distance squared instead as it is slightly more efficient to calculate.
		 * @param {Vector2} v
		 * @returns {number}
		 */
		distanceToSquared(v) {
			const dx = this.x - v.x,
				dy = this.y - v.y;
			return dx * dx + dy * dy;
		}

		/**
		 * Computes the distance from this vector to v.
		 * @param {Vector2} v
		 * @returns {number}
		 */
		distanceTo(v) {
			return Math.sqrt(this.distanceToSquared(v));
		}

		/**
		 * Sets this vector's x value to be array[ offset ] and y value to be array[ offset + 1 ].
		 * @param {number[]} array - the source array.
		 * @param {number} [offset=0] - offset into the array.
		 * @param {boolean} [denormalize=false] - if true, denormalize the values, and array should be a typed array.
		 * @returns {Vector2}
		 */
		fromArray(array, offset = 0, denormalize = false) {
			let x = array[offset],
				y = array[offset + 1];
			if (denormalize) {
				x = MathUtils.denormalize(x, array);
				y = MathUtils.denormalize(y, array);
			}
			this.x = x;
			this.y = y;
			return this;
		}

		/**
		 * Sets this array[ offset ] value to be vector's x and array[ offset + 1 ] to be vector's y.
		 * @param {number[]} [array] - the target array.
		 * @param {number} [offset=0] - offset into the array.
		 * @param {boolean} [normalize=false] - if true, normalize the values, and array should be a typed array.
		 * @returns {number[]}
		 */
		toArray(array = [], offset = 0, normalize = false) {
			let x = this.x,
				y = this.y;
			if (normalize) {
				x = MathUtils.normalize(x, array);
				y = MathUtils.normalize(y, array);
			}
			array[offset] = x;
			array[offset + 1] = y;
			return array;
		}

		/**
		 * Adds v to this vector.
		 * @param {Vector2} v
		 * @returns {Vector2}
		 */
		add(v) {
			this.x += v.x;
			this.y += v.y;
			return this;
		}

		/**
		 * Computes the angle in radians of this vector with respect to the positive x-axis.
		 * @returns {number}
		 */
		angle() {
			// computes the angle in radians with respect to the positive x-axis

			// let angle = Math.atan2(this.y, this.x);
			// if (angle < 0) angle += 2 * Math.PI;
			// return angle;

			return Math.atan2(-this.y, -this.x) + Math.PI;
		}

		/**
		 * Inverts this vector - i.e. sets x = -x, y = -y.
		 * @returns {Vector2}
		 */
		negate() {
			this.x = -this.x;
			this.y = -this.y;
			return this;
		}

		/**
		 * Calculate the dot product of this vector and v.
		 * @param {Vector2} a
		 * @returns {number}
		 */
		dot(a) {
			return this.x * a.x + this.y * a.y;
		}

		/**
		 * Checks for strict equality of this vector and v.
		 * @param {Vector2} v
		 * @returns {boolean}
		 */
		equals(v) {
			return v.x === this.x && v.y === this.y;
		}

		/**
		 * Returns a new Vector2 with the same x and y values as this one.
		 * @returns {Vector2}
		 */
		clone() {
			return new Vector2(this.x, this.y);
		}
		*[Symbol.iterator]() {
			yield this.x;
			yield this.y;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Vector2.prototype.isVector2 = true;

	/**
	 * Represents an axis-aligned bounding box (AABB) in 2D space.
	 */
	class Box2 {
		/**
		 * @param {Vector2} min - (optional) Vector2 representing the lower (x, y) boundary of the box.
		 * 								Default is ( + Infinity, + Infinity ).
		 * @param {Vector2} max - (optional) Vector2 representing the upper (x, y) boundary of the box.
		 * 								Default is ( - Infinity, - Infinity ).
		 */
		constructor(min, max) {
			this.min = min !== undefined ? min : new Vector2(+Infinity, +Infinity);
			this.max = max !== undefined ? max : new Vector2(-Infinity, -Infinity);
		}

		/**
		 * @param {number} x1
		 * @param {number} y1
		 * @param {number} x2
		 * @param {number} y2
		 */
		set(x1, y1, x2, y2) {
			this.min.set(x1, y1);
			this.max.set(x2, y2);
		}

		/**
		 * Returns a new Box2 with the same min and max as this one.
		 * @returns {Box2}
		 */
		clone() {
			return new Box2().copy(this);
		}

		/**
		 * Copies the min and max from box to this box.
		 * @param {Box2} box
		 * @returns {Box2}
		 */
		copy(box) {
			this.min.copy(box.min);
			this.max.copy(box.max);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Box2.prototype.isBox2 = true;

	/**
	 * Represents an axis-aligned bounding box (AABB) in 3D space.
	 */
	class Box3 {
		/**
		 * @param {Vector3} min - (optional) Vector3 representing the lower (x, y, z) boundary of the box.
		 * 								Default is ( + Infinity, + Infinity, + Infinity ).
		 * @param {Vector3} max - (optional) Vector3 representing the upper (x, y, z) boundary of the box.
		 * 								Default is ( - Infinity, - Infinity, - Infinity ).
		 */
		constructor(min, max) {
			this.min = min !== undefined ? min : new Vector3(+Infinity, +Infinity, +Infinity);
			this.max = max !== undefined ? max : new Vector3(-Infinity, -Infinity, -Infinity);
		}

		/**
		 * Sets the lower and upper (x, y, z) boundaries of this box.
		 * @param {Vector3} min - Vector3 representing the lower (x, y, z) boundary of the box.
		 * @param {Vector3} max - Vector3 representing the lower upper (x, y, z) boundary of the box.
		 */
		set(min, max) {
			this.min.copy(min);
			this.max.copy(max);
		}

		/**
		 * Sets the upper and lower bounds of this box to include all of the points in points.
		 * @param {Vector3[]} points - Array of Vector3s that the resulting box will contain.
		 * @returns {Box3}
		 */
		setFromPoints(points) {
			this.makeEmpty();
			for (let i = 0, il = points.length; i < il; i++) {
				this.expandByPoint(points[i]);
			}
			return this;
		}

		/**
		 * Makes this box empty.
		 * @returns {Box3}
		 */
		makeEmpty() {
			this.min.x = this.min.y = this.min.z = +Infinity;
			this.max.x = this.max.y = this.max.z = -Infinity;
			return this;
		}

		/**
		 * Expands the boundaries of this box to include point.
		 * @param {Vector3} point - Vector3 that should be included in the box.
		 * @returns {Box3}
		 */
		expandByPoint(point) {
			this.min.min(point);
			this.max.max(point);
			return this;
		}

		/**
		 * Expands each dimension of the box by scalar. If negative, the dimensions of the box will be contracted.
		 * @param {number} scalar - Distance to expand the box by.
		 * @returns {Box3}
		 */
		expandByScalar(scalar) {
			this.min.addScalar(-scalar);
			this.max.addScalar(scalar);
			return this;
		}

		/**
		 * Expands the boundaries of this box to include box3.
		 * @param {Box3} box3 - Box that will be unioned with this box.
		 * @returns {Box3}
		 */
		expandByBox3(box3) {
			this.min.min(box3.min);
			this.max.max(box3.max);
			return this;
		}

		/**
		 * Sets the upper and lower bounds of this box to include all of the data in array.
		 * @param {number[]} array - An array of position data that the resulting box will envelop.
		 * @param {number} [gap=3]
		 * @param {number} [offset=0]
		 * @returns {Box3}
		 */
		setFromArray(array, gap = 3, offset = 0) {
			let minX = +Infinity;
			let minY = +Infinity;
			let minZ = +Infinity;
			let maxX = -Infinity;
			let maxY = -Infinity;
			let maxZ = -Infinity;
			for (let i = 0, l = array.length; i < l; i += gap) {
				const x = array[i + offset];
				const y = array[i + offset + 1];
				const z = array[i + offset + 2];
				if (x < minX) minX = x;
				if (y < minY) minY = y;
				if (z < minZ) minZ = z;
				if (x > maxX) maxX = x;
				if (y > maxY) maxY = y;
				if (z > maxZ) maxZ = z;
			}
			this.min.set(minX, minY, minZ);
			this.max.set(maxX, maxY, maxZ);
			return this;
		}

		/**
		 * Clamps the point within the bounds of this box.
		 * @param {Vector3} point - Vector3 to clamp.
		 * @param {Vector3} target - Vector3 to store the result in.
		 * @returns {Vector3}
		 */
		clampPoint(point, target) {
			return target.copy(point).min(this.max).max(this.min);
		}

		/**
		 * Returns the distance from any edge of this box to the specified point.
		 * If the point lies inside of this box, the distance will be 0.
		 * @param {Vector3} point - Vector3 to measure the distance to.
		 * @returns {number}
		 */
		distanceToPoint(point) {
			return this.clampPoint(point, _vec3_1$5).distanceTo(point);
		}

		/**
		 * Returns aMinimum Bounding Sphere for the box.
		 * @param {Sphere} target — the result will be copied into this Sphere.
		 * @returns {Sphere}
		 */
		getBoundingSphere(target) {
			if (this.isEmpty()) {
				target.makeEmpty();
			} else {
				this.getCenter(target.center);
				target.radius = this.getSize(_vec3_1$5).getLength() * 0.5;
			}
			return target;
		}

		/**
		 * Returns true if this box includes zero points within its bounds.
		 * @returns {boolean}
		 */
		isEmpty() {
			// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
			return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
		}

		/**
		 * Returns true if this box and box share the same lower and upper bounds.
		 * @param {Box3} box - Box to compare with this one.
		 * @returns {boolean}
		 */
		equals(box) {
			return box.min.equals(this.min) && box.max.equals(this.max);
		}

		/**
		 * Returns the center point of the box as a Vector3.
		 * @param {Vector3} target - the result will be copied into this Vector3.
		 * @returns {Vector3}
		 */
		getCenter(target = new Vector3()) {
			return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
		}

		/**
		 * Returns the width, height and depth of this box.
		 * @param {Vector3} target - the result will be copied into this Vector3.
		 * @returns {Vector3}
		 */
		getSize(target = new Vector3()) {
			return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
		}

		/**
		 * Get the 8 corner points of the bounding box, the order is as follows:
		 *	 7-------3
		 *	/|			/|
		 * 4-------0 |
		 * | |		 | |
		 * | 6-----|-2
		 * |/			|/
		 * 5-------1
		 * @param {Vector3[]} points - The array to store the points.
		 * @returns {Vector3[]} The array of points.
		 */
		getPoints(points) {
			const minX = this.min.x,
				minY = this.min.y,
				minZ = this.min.z;
			const maxX = this.max.x,
				maxY = this.max.y,
				maxZ = this.max.z;
			points[0].set(maxX, maxY, maxZ);
			points[1].set(maxX, minY, maxZ);
			points[2].set(maxX, minY, minZ);
			points[3].set(maxX, maxY, minZ);
			points[4].set(minX, maxY, maxZ);
			points[5].set(minX, minY, maxZ);
			points[6].set(minX, minY, minZ);
			points[7].set(minX, maxY, minZ);
			return points;
		}

		/**
		 * Computes the union of this box and box,
		 * setting the upper bound of this box to the greater of the two boxes' upper bounds and the lower bound of this box to the lesser of the two boxes' lower bounds.
		 * @param {Box3} box - Box that will be unioned with this box.
		 * @returns {Box3}
		 */
		union(box) {
			this.min.min(box.min);
			this.max.max(box.max);
			return this;
		}

		/**
		 * Transforms this Box3 with the supplied matrix.
		 * @param {Matrix4} matrix - The Matrix4 to apply
		 * @returns {Box3}
		 */
		applyMatrix4(matrix) {
			// transform of empty box is an empty box.
			if (this.isEmpty()) return this;

			// NOTE: I am using a binary pattern to specify all 2^3 combinations below
			_points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix); // 000
			_points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix); // 001
			_points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix); // 010
			_points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix); // 011
			_points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix); // 100
			_points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix); // 101
			_points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix); // 110
			_points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix); // 111

			this.setFromPoints(_points);
			return this;
		}

		/**
		 * Returns true if the specified point lies within or on the boundaries of this box.
		 * @param {Vector3} point - Vector3 to check for inclusion.
		 * @returns {boolean}
		 */
		containsPoint(point) {
			return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y || point.z < this.min.z || point.z > this.max.z ? false : true;
		}

		/**
		 * Determines whether or not this box intersects triangle.
		 * @param {Triangle} triangle - Triangle to check for intersection against.
		 * @returns {boolean}
		 */
		intersectsTriangle(triangle) {
			if (this.isEmpty()) {
				return false;
			}

			// compute box center and extents
			this.getCenter(_center);
			_extents.subVectors(this.max, _center);

			// translate triangle to aabb origin
			_v0$1.subVectors(triangle.a, _center);
			_v1$1.subVectors(triangle.b, _center);
			_v2$1.subVectors(triangle.c, _center);

			// compute edge vectors for triangle
			_f0.subVectors(_v1$1, _v0$1);
			_f1.subVectors(_v2$1, _v1$1);
			_f2.subVectors(_v0$1, _v2$1);

			// test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
			// make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
			// axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
			let axes = [0, -_f0.z, _f0.y, 0, -_f1.z, _f1.y, 0, -_f2.z, _f2.y, _f0.z, 0, -_f0.x, _f1.z, 0, -_f1.x, _f2.z, 0, -_f2.x, -_f0.y, _f0.x, 0, -_f1.y, _f1.x, 0, -_f2.y, _f2.x, 0];
			if (!satForAxes(axes, _v0$1, _v1$1, _v2$1, _extents)) {
				return false;
			}

			// test 3 face normals from the aabb
			axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
			if (!satForAxes(axes, _v0$1, _v1$1, _v2$1, _extents)) {
				return false;
			}

			// finally testing the face normal of the triangle
			// use already existing triangle edge vectors here
			_triangleNormal.crossVectors(_f0, _f1);
			axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];
			return satForAxes(axes, _v0$1, _v1$1, _v2$1, _extents);
		}

		/**
		 * Returns a new Box3 with the same min and max as this one.
		 * @returns {Box3}
		 */
		clone() {
			return new Box3().copy(this);
		}

		/**
		 * Copies the min and max from box to this box.
		 * @param {Box3} box - Box3 to copy.
		 * @returns {Box3}
		 */
		copy(box) {
			this.min.copy(box.min);
			this.max.copy(box.max);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Box3.prototype.isBox3 = true;
	const _points = [new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3(), new Vector3()];
	const _vec3_1$5 = new Vector3();

	// triangle centered vertices

	const _v0$1 = new Vector3();
	const _v1$1 = new Vector3();
	const _v2$1 = new Vector3();

	// triangle edge vectors

	const _f0 = new Vector3();
	const _f1 = new Vector3();
	const _f2 = new Vector3();
	const _center = new Vector3();
	const _extents = new Vector3();
	const _triangleNormal = new Vector3();
	const _testAxis = new Vector3();
	function satForAxes(axes, v0, v1, v2, extents) {
		for (let i = 0, j = axes.length - 3; i <= j; i += 3) {
			_testAxis.fromArray(axes, i);
			// project the aabb onto the separating axis
			const r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z);
			// project all 3 vertices of the triangle onto the separating axis
			const p0 = v0.dot(_testAxis);
			const p1 = v1.dot(_testAxis);
			const p2 = v2.dot(_testAxis);
			// actual test, basically see if either of the most extreme of the triangle points intersects r
			if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
				// points of the projected triangle are outside the projected half-length of the aabb
				// the axis is separating and we can exit
				return false;
			}
		}
		return true;
	}

	/**
	 * A Color3 instance is represented by RGB components.
	 */
	class Color3 {
		/**
		 * Constructs a new three-component color.
		 * @param {number} [r] - The red component of the color. If `g` and `b` are not provided, it can be a hexadecimal triplet.
		 * @param {number} [g] - The green component.
		 * @param {number} [b] - The blue component.
		 */
		constructor(r, g, b) {
			/**
			 * The red component.
			 * @type {number}
			 * @default 0
			 */
			this.r = 0;

			/**
			 * The green component.
			 * @type {number}
			 * @default 0
			 */
			this.g = 0;

			/**
			 * The blue component.
			 * @type {number}
			 * @default 0
			 */
			this.b = 0;
			if (g === undefined && b === undefined) {
				this.setHex(r);
			} else {
				this.setRGB(r, g, b);
			}
		}

		/**
		 * Sets this color from a hexadecimal value.
		 * @param {number} hex - The hexadecimal value.
		 * @returns {Color3} A reference to this color.
		 */
		setHex(hex) {
			hex = Math.floor(hex);
			this.r = (hex >> 16 & 255) / 255;
			this.g = (hex >> 8 & 255) / 255;
			this.b = (hex & 255) / 255;
			return this;
		}

		/**
		 * Sets this color from RGB values.
		 * @param {number} r - Red channel value between 0.0 and 1.0.
		 * @param {number} g - Green channel value between 0.0 and 1.0.
		 * @param {number} b - Blue channel value between 0.0 and 1.0.
		 * @returns {Color3} A reference to this color.
		 */
		setRGB(r, g, b) {
			this.r = r;
			this.g = g;
			this.b = b;
			return this;
		}

		/**
		 * Set this color from HSL values.
		 * @param {number} h - Hue value between 0.0 and 1.0.
		 * @param {number} s - Saturation value between 0.0 and 1.0.
		 * @param {number} l - Lightness value between 0.0 and 1.0.
		 * @returns {Color3} A reference to this color.
		 */
		setHSL(h, s, l) {
			// h,s,l ranges are in 0.0 - 1.0
			h = MathUtils.euclideanModulo(h, 1);
			s = MathUtils.clamp(s, 0, 1);
			l = MathUtils.clamp(l, 0, 1);
			if (s === 0) {
				this.r = this.g = this.b = l;
			} else {
				const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
				const q = 2 * l - p;
				this.r = hue2rgb(q, p, h + 1 / 3);
				this.g = hue2rgb(q, p, h);
				this.b = hue2rgb(q, p, h - 1 / 3);
			}
			return this;
		}

		/**
		 * Returns a new color with copied values from this instance.
		 * @returns {Color3} A clone of this instance.
		 */
		clone() {
			return new this.constructor(this.r, this.g, this.b);
		}

		/**
		 * Copies the values of the given color to this instance.
		 * @param {Color3} color - The color to copy.
		 * @returns {Color3} A reference to this color.
		 */
		copy(color) {
			this.r = color.r;
			this.g = color.g;
			this.b = color.b;
			return this;
		}

		/**
		 * Converts this color from sRGB space to linear space.
		 * @returns {Color3} A reference to this color.
		 */
		convertSRGBToLinear() {
			this.r = SRGBToLinear(this.r);
			this.g = SRGBToLinear(this.g);
			this.b = SRGBToLinear(this.b);
			return this;
		}

		/**
		 * Converts this color from linear space to sRGB space.
		 * @returns {Color3} A reference to this color.
		 */
		convertLinearToSRGB() {
			this.r = LinearToSRGB(this.r);
			this.g = LinearToSRGB(this.g);
			this.b = LinearToSRGB(this.b);
			return this;
		}

		/**
		 * Returns the hexadecimal value of this color.
		 * @returns {number} The hexadecimal value.
		 */
		getHex() {
			return MathUtils.clamp(this.r * 255, 0, 255) << 16 ^ MathUtils.clamp(this.g * 255, 0, 255) << 8 ^ MathUtils.clamp(this.b * 255, 0, 255) << 0;
		}

		/**
		 * Linearly interpolates this color's RGB values toward the RGB values of the
		 * given color. The alpha argument can be thought of as the ratio between
		 * the two colors, where 0.0 is this color and 1.0 is the first argument.
		 * @param {Color3} color - The color to converge on.
		 * @param {number} alpha - The interpolation factor in the closed interval [0,1].
		 * @returns {Color3} A reference to this color.
		 */
		lerp(color, alpha) {
			return this.lerpColors(this, color, alpha);
		}

		/**
		 * Linearly interpolates between the given colors and stores the result in this instance.
		 * The alpha argument can be thought of as the ratio between the two colors, where 0.0
		 * is the first and 1.0 is the second color.
		 * @param {Color3} color1 - The first color.
		 * @param {Color3} color2 - The second color.
		 * @param {number} alpha - The interpolation factor in the closed interval [0,1].
		 * @returns {Color3} A reference to this color.
		 */
		lerpColors(color1, color2, alpha) {
			this.r = MathUtils.lerp(color1.r, color2.r, alpha);
			this.g = MathUtils.lerp(color1.g, color2.g, alpha);
			this.b = MathUtils.lerp(color1.b, color2.b, alpha);
			return this;
		}

		/**
		 * Sets this color's RGB components from the given array.
		 * @param {number[]} array - An array holding the RGB values.
		 * @param {number} [offset=0] - The offset into the array.
		 * @param {boolean} [denormalize=false] - If true, denormalize the values, and array should be a typed array.
		 * @returns {Color3} A reference to this color.
		 */
		fromArray(array, offset = 0, denormalize = false) {
			let r = array[offset],
				g = array[offset + 1],
				b = array[offset + 2];
			if (denormalize) {
				r = MathUtils.denormalize(r, array);
				g = MathUtils.denormalize(g, array);
				b = MathUtils.denormalize(b, array);
			}
			this.r = r;
			this.g = g;
			this.b = b;
			return this;
		}

		/**
		 * Writes the RGB components of this color to the given array. If no array is provided,
		 * the method returns a new instance.
		 * @param {number[]} [array=[]] - The target array holding the color components.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @param {boolean} [normalize=false] - If true, normalize the values, and array should be a typed array.
		 * @returns {number[]} The color components.
		 */
		toArray(array = [], offset = 0, normalize = false) {
			let r = this.r,
				g = this.g,
				b = this.b;
			if (normalize) {
				r = MathUtils.normalize(r, array);
				g = MathUtils.normalize(g, array);
				b = MathUtils.normalize(b, array);
			}
			array[offset] = r;
			array[offset + 1] = g;
			array[offset + 2] = b;
			return array;
		}
		*[Symbol.iterator]() {
			yield this.r;
			yield this.g;
			yield this.b;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Color3.prototype.isColor3 = true;
	function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
		return p;
	}
	function SRGBToLinear(c) {
		return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
	}
	function LinearToSRGB(c) {
		return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
	}

	/**
	 * A Color4 instance is represented by RGBA components.
	 */
	class Color4 {
		/**
		 * Constructs a new four-component color.
		 * @param {number} [r=0] - The red value.
		 * @param {number} [g=0] - The green value.
		 * @param {number} [b=0] - The blue value.
		 * @param {number} [a=1] - The alpha value.
		 */
		constructor(r = 0, g = 0, b = 0, a = 1) {
			/**
			 * The red component.
			 * @type {number}
			 * @default 0
			 */
			this.r = r;

			/**
			 * The green component.
			 * @type {number}
			 * @default 0
			 */
			this.g = g;

			/**
			 * The blue component.
			 * @type {number}
			 * @default 0
			 */
			this.b = b;

			/**
			 * The alpha component.
			 * @type {number}
			 * @default 1
			 */
			this.a = a;
		}

		/**
		 * Sets this color from RGBA values.
		 * @param {number} r - Red channel value between 0.0 and 1.0.
		 * @param {number} g - Green channel value between 0.0 and 1.0.
		 * @param {number} b - Blue channel value between 0.0 and 1.0.
		 * @param {number} a - Alpha channel value between 0.0 and 1.0.
		 * @returns {Color4} A reference to this color.
		 */
		setRGBA(r, g, b, a) {
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a;
			return this;
		}

		/**
		 * Returns a new color with copied values from this instance.
		 * @returns {Color4} A clone of this instance.
		 */
		clone() {
			return new Color4(this.r, this.g, this.b, this.a);
		}

		/**
		 * Copies the values of the given color to this instance.
		 * @param {Color4} color - The color to copy.
		 * @returns {Color4} A clone of this instance.
		 */
		copy(color) {
			this.r = color.r;
			this.g = color.g;
			this.b = color.b;
			this.a = color.a;
			return this;
		}

		/**
		 * Sets this color's RGBA components from the given array.
		 * @param {number[]} array - An array holding the RGBA values.
		 * @param {number} [offset=0] - The offset into the array.
		 * @param {boolean} [denormalize=false] - If true, denormalize the values, and array should be a typed array.
		 * @returns {Color4} A reference to this color.
		 */
		fromArray(array, offset = 0, denormalize = false) {
			let r = array[offset],
				g = array[offset + 1],
				b = array[offset + 2],
				a = array[offset + 3];
			if (denormalize) {
				r = MathUtils.denormalize(r, array);
				g = MathUtils.denormalize(g, array);
				b = MathUtils.denormalize(b, array);
				a = MathUtils.denormalize(a, array);
			}
			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a;
			return this;
		}

		/**
		 * Writes the RGBA components of this color to the given array. If no array is provided,
		 * the method returns a new instance.
		 * @param {number[]} [array=[]] - The target array holding the color components.
		 * @param {number} [offset=0] - Index of the first element in the array.
		 * @param {boolean} [normalize=false] - If true, normalize the values, and array should be a typed array.
		 * @returns {number[]} The color components.
		 */
		toArray(array = [], offset = 0, normalize = false) {
			let r = this.r,
				g = this.g,
				b = this.b,
				a = this.a;
			if (normalize) {
				r = MathUtils.normalize(r, array);
				g = MathUtils.normalize(g, array);
				b = MathUtils.normalize(b, array);
				a = MathUtils.normalize(a, array);
			}
			array[offset] = r;
			array[offset + 1] = g;
			array[offset + 2] = b;
			array[offset + 3] = a;
			return array;
		}
		*[Symbol.iterator]() {
			yield this.r;
			yield this.g;
			yield this.b;
			yield this.a;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Color4.prototype.isColor4 = true;

	const _matrix$1 = new Matrix4();

	/**
	 * Euler class.
	 */
	class Euler {
		/**
		 * @param {number} [x=0]
		 * @param {number} [y=0]
		 * @param {number} [z=0]
		 * @param {string} [order=Euler.DefaultOrder]
		 */
		constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
			this._x = x;
			this._y = y;
			this._z = z;
			this._order = order;
		}

		/**
		 * @type {number}
		 */
		get x() {
			return this._x;
		}

		/**
		 * @type {number}
		 */
		set x(value) {
			this._x = value;
			this.onChangeCallback();
		}

		/**
		 * @type {number}
		 */
		get y() {
			return this._y;
		}

		/**
		 * @type {number}
		 */
		set y(value) {
			this._y = value;
			this.onChangeCallback();
		}

		/**
		 * @type {number}
		 */
		get z() {
			return this._z;
		}

		/**
		 * @type {number}
		 */
		set z(value) {
			this._z = value;
			this.onChangeCallback();
		}

		/**
		 * @type {string}
		 */
		get order() {
			return this._order;
		}

		/**
		 * @type {string}
		 */
		set order(value) {
			this._order = value;
			this.onChangeCallback();
		}

		/**
		 * Returns a new Euler with the same parameters as this one.
		 * @returns {Euler}
		 */
		clone() {
			return new Euler(this._x, this._y, this._z, this._order);
		}

		/**
		 * Copies value of euler to this euler.
		 * @param {Euler} euler
		 * @returns {Euler}
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
		 * @param {number} x - the angle of the x axis in radians.
		 * @param {number} y - the angle of the y axis in radians.
		 * @param {number} z - the angle of the z axis in radians.
		 * @param {string} order - (optional) a string representing the order that the rotations are applied.
		 * @returns {Euler}
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
		 * @param {Matrix4} m - a Matrix4 of which the upper 3x3 of matrix is a pure rotation matrix
		 * @param {string} order - (optional) a string representing the order that the rotations are applied.
		 * @param {boolean} [update=true] - Whether to notify Euler angle has changed
		 * @returns {Euler}
		 */
		setFromRotationMatrix(m, order = this._order, update = true) {
			// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

			const te = m.elements;
			const m11 = te[0],
				m12 = te[4],
				m13 = te[8];
			const m21 = te[1],
				m22 = te[5],
				m23 = te[9];
			const m31 = te[2],
				m32 = te[6],
				m33 = te[10];
			if (order === 'XYZ') {
				this._y = Math.asin(MathUtils.clamp(m13, -1, 1));
				if (Math.abs(m13) < 0.99999) {
					this._x = Math.atan2(-m23, m33);
					this._z = Math.atan2(-m12, m11);
				} else {
					this._x = Math.atan2(m32, m22);
					this._z = 0;
				}
			} else if (order === 'YXZ') {
				this._x = Math.asin(-MathUtils.clamp(m23, -1, 1));
				if (Math.abs(m23) < 0.99999) {
					this._y = Math.atan2(m13, m33);
					this._z = Math.atan2(m21, m22);
				} else {
					this._y = Math.atan2(-m31, m11);
					this._z = 0;
				}
			} else if (order === 'ZXY') {
				this._x = Math.asin(MathUtils.clamp(m32, -1, 1));
				if (Math.abs(m32) < 0.99999) {
					this._y = Math.atan2(-m31, m33);
					this._z = Math.atan2(-m12, m22);
				} else {
					this._y = 0;
					this._z = Math.atan2(m21, m11);
				}
			} else if (order === 'ZYX') {
				this._y = Math.asin(-MathUtils.clamp(m31, -1, 1));
				if (Math.abs(m31) < 0.99999) {
					this._x = Math.atan2(m32, m33);
					this._z = Math.atan2(m21, m11);
				} else {
					this._x = 0;
					this._z = Math.atan2(-m12, m22);
				}
			} else if (order === 'YZX') {
				this._z = Math.asin(MathUtils.clamp(m21, -1, 1));
				if (Math.abs(m21) < 0.99999) {
					this._x = Math.atan2(-m23, m22);
					this._y = Math.atan2(-m31, m11);
				} else {
					this._x = 0;
					this._y = Math.atan2(m13, m33);
				}
			} else if (order === 'XZY') {
				this._z = Math.asin(-MathUtils.clamp(m12, -1, 1));
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
		 * @param {Quaternion} q - a normalized quaternion.
		 * @param {string} order - (optional) a string representing the order that the rotations are applied.
		 * @param {boolean} [update=true] - Whether to notify Euler angle has changed
		 * @returns {Euler}
		 */
		setFromQuaternion(q, order, update) {
			q.toMatrix4(_matrix$1);
			return this.setFromRotationMatrix(_matrix$1, order, update);
		}

		/**
		 * @param {Function} callback - When the Euler angle value changes, the callback method is triggered
		 * @returns {Euler}
		 */
		onChange(callback) {
			this.onChangeCallback = callback;
			return this;
		}
		onChangeCallback() {}
		*[Symbol.iterator]() {
			yield this._x;
			yield this._y;
			yield this._z;
			yield this._order;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Euler.prototype.isEuler = true;

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

	/**
	 * The 3x3 matrix class.
	 */
	class Matrix3 {
		/**
		 * Create a 3x3 matrix.
		 */
		constructor() {
			this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1];
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
		set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
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
			return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
		}

		/**
		 * Checks if the matrix is an identity matrix.
		 * @returns {boolean} - True if the matrix is an identity matrix, false otherwise.
		 */
		isIdentity() {
			const te = this.elements;
			return te[0] === 1 && te[3] === 0 && te[6] === 0 && te[1] === 0 && te[4] === 1 && te[7] === 0 && te[2] === 0 && te[5] === 0 && te[8] === 1;
		}

		/**
		 * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
		 * You can not invert with a determinant of zero. If you attempt this, the method produces
		 * a zero matrix instead.
		 * @returns {Matrix3} A reference to this matrix.
		 */
		invert() {
			const te = this.elements,
				n11 = te[0],
				n21 = te[1],
				n31 = te[2],
				n12 = te[3],
				n22 = te[4],
				n32 = te[5],
				n13 = te[6],
				n23 = te[7],
				n33 = te[8],
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
			tmp = m[1];
			m[1] = m[3];
			m[3] = tmp;
			tmp = m[2];
			m[2] = m[6];
			m[6] = tmp;
			tmp = m[5];
			m[5] = m[7];
			m[7] = tmp;
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
			te[0] = me[0];
			te[1] = me[1];
			te[2] = me[2];
			te[3] = me[3];
			te[4] = me[4];
			te[5] = me[5];
			te[6] = me[6];
			te[7] = me[7];
			te[8] = me[8];
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
			const a11 = ae[0],
				a12 = ae[3],
				a13 = ae[6];
			const a21 = ae[1],
				a22 = ae[4],
				a23 = ae[7];
			const a31 = ae[2],
				a32 = ae[5],
				a33 = ae[8];
			const b11 = be[0],
				b12 = be[3],
				b13 = be[6];
			const b21 = be[1],
				b22 = be[4],
				b23 = be[7];
			const b31 = be[2],
				b32 = be[5],
				b33 = be[8];
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
			return this.set(sx * c, sx * s, -sx * (c * cx + s * cy) + cx + tx, -sy * s, sy * c, -sy * (-s * cx + c * cy) + cy + ty, 0, 0, 1);
		}

		/**
		 * Sets the matri3 planes from the matrix4.
		 * @param {Matrix4} m
		 * @returns {Matrix3}
		 */
		setFromMatrix4(m) {
			const me = m.elements;
			return this.set(me[0], me[4], me[8], me[1], me[5], me[9], me[2], me[6], me[10]);
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

	const _vec3_1$4 = new Vector3();
	const _vec3_2$1 = new Vector3();
	const _mat3_1$1 = new Matrix3();

	/**
	 * A two dimensional surface that extends infinitely in 3d space,
	 * represented in Hessian normal form by a unit length normal vector and a constant.
	 */
	class Plane {
		/**
		 * Constructs a new Plane.
		 * @param {Vector3} [normal=Vector3(1, 0, 0)] - A unit length Vector3 defining the normal of the plane.
		 * @param {number} [constant=0] - The signed distance from the origin to the plane.
		 */
		constructor(normal = new Vector3(1, 0, 0), constant = 0) {
			this.normal = normal;
			this.constant = constant;
		}

		/**
		 * Solve a system of equations to find the point where the three planes intersect.
		 * @param {Plane} p1 - The first plane.
		 * @param {Plane} p2 - The second plane.
		 * @param {Plane} p3 - The third plane.
		 * @param {Vector3} target - The result will be copied into this Vector3.
		 * @returns {Vector3}
		 */
		static intersectPlanes(p1, p2, p3, target) {
			// Create the matrix using the normals of the planes as rows
			_mat3_1$1.set(p1.normal.x, p1.normal.y, p1.normal.z, p2.normal.x, p2.normal.y, p2.normal.z, p3.normal.x, p3.normal.y, p3.normal.z);

			// Create the vector using the constants of the planes
			target.set(-p1.constant, -p2.constant, -p3.constant);

			// Solve for X by applying the inverse matrix to vector
			target.applyMatrix3(_mat3_1$1.invert());
			return target;
		}

		/**
		 * Sets this plane's normal and constant properties by copying the values from the given normal.
		 * @param {Vector3} normal - a unit length Vector3 defining the normal of the plane.
		 * @param {number} constant - the signed distance from the origin to the plane. Default is 0.
		 * @returns {Plane}
		 */
		set(normal, constant) {
			this.normal.copy(normal);
			this.constant = constant;
			return this;
		}

		/**
		 * Set the individual components that define the plane.
		 * @param {number} x - x value of the unit length normal vector.
		 * @param {number} y - y value of the unit length normal vector.
		 * @param {number} z - z value of the unit length normal vector.
		 * @param {number} w - the value of the plane's constant property.
		 * @returns {Plane}
		 */
		setComponents(x, y, z, w) {
			this.normal.set(x, y, z);
			this.constant = w;
			return this;
		}

		/**
		 * Sets the plane's properties as defined by a normal and an arbitrary coplanar point.
		 * @param {Vector3} normal - a unit length Vector3 defining the normal of the plane.
		 * @param {Vector3} point - Vector3
		 * @returns {Plane}
		 */
		setFromNormalAndCoplanarPoint(normal, point) {
			this.normal.copy(normal);
			this.constant = -point.dot(this.normal);
			return this;
		}

		/**
		 * Defines the plane based on the 3 provided points.
		 * The winding order is assumed to be counter-clockwise, and determines the direction of the normal.
		 * @param {Vector3} a - first point on the plane.
		 * @param {Vector3} b - second point on the plane.
		 * @param {Vector3} c - third point on the plane.
		 * @returns {Plane}
		 */
		setFromCoplanarPoints(a, b, c) {
			const normal = _vec3_1$4.subVectors(c, b).cross(_vec3_2$1.subVectors(a, b)).normalize();
			// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?
			this.setFromNormalAndCoplanarPoint(normal, a);
			return this;
		}

		/**
		 * Normalizes the normal vector, and adjusts the constant value accordingly.
		 * @returns {Plane}
		 */
		normalize() {
			// Note: will lead to a divide by zero if the plane is invalid.

			const inverseNormalLength = 1.0 / this.normal.getLength();
			this.normal.multiplyScalar(inverseNormalLength);
			this.constant *= inverseNormalLength;
			return this;
		}

		/**
		 * Returns the signed distance from the point to the plane.
		 * @param {Vector3} point
		 * @returns {number}
		 */
		distanceToPoint(point) {
			return this.normal.dot(point) + this.constant;
		}

		/**
		 * Projects a point onto the plane.
		 * @param {Vector3} point - the Vector3 to project onto the plane.
		 * @param {Vector3} [target] - the result will be copied into this Vector3.
		 * @returns {Vector3}
		 */
		projectPoint(point, target = new Vector3()) {
			return target.copy(point).addScaledVector(this.normal, -this.distanceToPoint(point));
		}

		/**
		 * Reflects a point through the plane.
		 * @param {Vector3} point - the Vector3 to reflect through the plane.
		 * @param {Vector3} [target] - the result will be copied into this Vector3.
		 * @returns {Vector3}
		 */
		mirrorPoint(point, target = new Vector3()) {
			const distance = this.distanceToPoint(point);
			return target.copy(point).addScaledVector(this.normal, -2 * distance);
		}

		/**
		 * Returns a Vector3 coplanar to the plane, by calculating the projection of the normal vector at the origin onto the plane.
		 * @param {Vector3} [target]
		 * @returns {Vector3}
		 */
		coplanarPoint(target = new Vector3()) {
			return target.copy(this.normal).multiplyScalar(-this.constant);
		}

		/**
		 * Returns a new plane with the same normal and constant as this one.
		 * @returns {Plane}
		 */
		clone() {
			return new Plane().copy(this);
		}

		/**
		 * Copies the values of the passed plane's normal and constant properties to this plane.
		 * @param {Plane} plane
		 * @returns {Plane}
		 */
		copy(plane) {
			this.normal.copy(plane.normal);
			this.constant = plane.constant;
			return this;
		}

		/**
		 * Apply a Matrix4 to the plane. The matrix must be an affine, homogeneous transform.
		 * @param {Matrix4} matrix - the Matrix4 to apply.
		 * @param {Matrix3} [optionalNormalMatrix] - (optional) pre-computed normal Matrix3 of the Matrix4 being applied.
		 * @returns {Plane}
		 */
		applyMatrix4(matrix, optionalNormalMatrix) {
			const normalMatrix = optionalNormalMatrix || _mat3_1$1.setFromMatrix4(matrix).invert().transpose();
			const referencePoint = this.coplanarPoint(_vec3_1$4).applyMatrix4(matrix);
			const normal = this.normal.applyMatrix3(normalMatrix).normalize();
			this.constant = -referencePoint.dot(normal);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Plane.prototype.isPlane = true;

	const _vec3_1$3 = new Vector3();
	const _mat3_1 = new Matrix3();

	/**
	 * Frustums are used to determine what is inside the camera's field of view.
	 * They help speed up the rendering process - objects which lie outside a camera's frustum can safely be excluded from rendering.
	 */
	class Frustum {
		/**
		 * @param {Plane} p0 - (optional) defaults to a new Plane.
		 * @param {Plane} p1 - (optional) defaults to a new Plane.
		 * @param {Plane} p2 - (optional) defaults to a new Plane.
		 * @param {Plane} p3 - (optional) defaults to a new Plane.
		 * @param {Plane} p4 - (optional) defaults to a new Plane.
		 * @param {Plane} p5 - (optional) defaults to a new Plane.
		 */
		constructor(p0 = new Plane(), p1 = new Plane(), p2 = new Plane(), p3 = new Plane(), p4 = new Plane(), p5 = new Plane()) {
			this.planes = [p0, p1, p2, p3, p4, p5];
		}

		/**
		 * Sets the frustum from the passed planes. No plane order is implied.
		 * @param {Plane} p0 - (optional) defaults to a new Plane.
		 * @param {Plane} p1 - (optional) defaults to a new Plane.
		 * @param {Plane} p2 - (optional) defaults to a new Plane.
		 * @param {Plane} p3 - (optional) defaults to a new Plane.
		 * @param {Plane} p4 - (optional) defaults to a new Plane.
		 * @param {Plane} p5 - (optional) defaults to a new Plane.
		 * @returns {Frustum}
		 */
		set(p0, p1, p2, p3, p4, p5) {
			const planes = this.planes;
			planes[0].copy(p0);
			planes[1].copy(p1);
			planes[2].copy(p2);
			planes[3].copy(p3);
			planes[4].copy(p4);
			planes[5].copy(p5);
			return this;
		}

		/**
		 * Sets the frustum planes from the matrix.
		 * @param {Matrix4} m - a Matrix4 used to set the planes
		 * @returns {Frustum}
		 */
		setFromMatrix(m) {
			const planes = this.planes;
			const me = m.elements;
			const me0 = me[0],
				me1 = me[1],
				me2 = me[2],
				me3 = me[3];
			const me4 = me[4],
				me5 = me[5],
				me6 = me[6],
				me7 = me[7];
			const me8 = me[8],
				me9 = me[9],
				me10 = me[10],
				me11 = me[11];
			const me12 = me[12],
				me13 = me[13],
				me14 = me[14],
				me15 = me[15];
			planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
			planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
			planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
			planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
			planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
			planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
			return this;
		}

		/**
		 * Return true if sphere intersects with this frustum.
		 * @param {Sphere} sphere - Sphere to check for intersection.
		 * @returns {boolean}
		 */
		intersectsSphere(sphere) {
			const planes = this.planes;
			const center = sphere.center;
			const negRadius = -sphere.radius;
			for (let i = 0; i < 6; i++) {
				const distance = planes[i].distanceToPoint(center);
				if (distance < negRadius) {
					return false;
				}
			}
			return true;
		}

		/**
		 * Return true if box intersects with this frustum.
		 * @param {Box3} box - Box3 to check for intersection.
		 * @returns {boolean}
		 */
		intersectsBox(box) {
			const planes = this.planes;
			for (let i = 0; i < 6; i++) {
				const plane = planes[i];

				// corner at max distance

				_vec3_1$3.x = plane.normal.x > 0 ? box.max.x : box.min.x;
				_vec3_1$3.y = plane.normal.y > 0 ? box.max.y : box.min.y;
				_vec3_1$3.z = plane.normal.z > 0 ? box.max.z : box.min.z;

				// if both outside plane, no intersection

				if (plane.distanceToPoint(_vec3_1$3) < 0) {
					return false;
				}
			}
			return true;
		}

		/**
		 * Apply a matrix4x4 to the frustum.
		 * @param {Matrix4} matrix - Matrix4 to apply to the frustum.
		 * @returns {Frustum}
		 */
		applyMatrix4(matrix) {
			const planes = this.planes;
			const normalMatrix = _mat3_1.setFromMatrix4(matrix).invert().transpose();
			for (let i = 0; i < 6; i++) {
				planes[i].applyMatrix4(matrix, normalMatrix);
			}
			return this;
		}

		/**
		 * Return a new Frustum with the same parameters as this one.
		 * @returns {Frustum}
		 */
		clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * Copies the properties of the passed frustum into this one.
		 * @param {Frustum} frustum - The frustum to copy
		 * @returns {Frustum}
		 */
		copy(frustum) {
			const planes = this.planes;
			for (let i = 0; i < 6; i++) {
				planes[i].copy(frustum.planes[i]);
			}
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Frustum.prototype.isFrustum = true;

	const _vec3_1$2 = new Vector3();
	const _diff = new Vector3();
	const _edge1 = new Vector3();
	const _edge2 = new Vector3();
	const _normal = new Vector3();

	/**
	 * A ray that emits from an origin in a certain direction. This is used by
	 * {@link Raycaster} to assist with raycasting. Raycasting is used for
	 * mouse picking (working out what objects in the 3D space the mouse is over)
	 * amongst other things.
	 */
	class Ray {
		/**
		 * Constructs a new ray.
		 * @param {Vector3} [origin=(0,0,0)] - The origin of the ray.
		 * @param {Vector3} [direction=(0,0,-1)] - The (normalized) direction of the ray.
		 */
		constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1)) {
			/**
			 * The origin of the ray.
			 * @type {Vector3}
			 */
			this.origin = origin;

			/**
			 * The (normalized) direction of the ray.
			 * @type {Vector3}
			 */
			this.direction = direction;
		}

		/**
		 * Sets the ray's components by copying the given values.
		 * @param {Vector3} origin - The origin.
		 * @param {Vector3} direction - The direction.
		 * @returns {Ray} A reference to this ray.
		 */
		set(origin, direction) {
			this.origin.copy(origin);
			this.direction.copy(direction);
			return this;
		}

		/**
		 * Copies the values of the given ray to this instance.
		 * @param {Ray} ray - The ray to copy.
		 * @returns {Ray} A reference to this ray.
		 */
		copy(ray) {
			this.origin.copy(ray.origin);
			this.direction.copy(ray.direction);
			return this;
		}

		/**
		 * Returns a vector that is located at a given distance along this ray.
		 * @param {number} t - The distance along the ray to retrieve a position for.
		 * @param {Vector3} target - The target vector that is used to store the method's result.
		 * @returns {Vector3} A position on the ray.
		 */
		at(t, target = new Vector3()) {
			return target.copy(this.origin).addScaledVector(this.direction, t);
		}

		/**
		 * Shift the origin of this ray along its direction by the given distance.
		 * @param {number} t - The distance along the ray to interpolate.
		 * @returns {Ray} A reference to this ray.
		 */
		recast(t) {
			this.origin.copy(this.at(t, _vec3_1$2));
			return this;
		}

		/**
		 * Returns the point along this ray that is closest to the given point.
		 * @param {Vector3} point - A point in 3D space to get the closet location on the ray for.
		 * @param {Vector3} target - The target vector that is used to store the method's result.
		 * @returns {Vector3} The closest point on this ray.
		 */
		closestPointToPoint(point, target) {
			target.subVectors(point, this.origin);
			const directionDistance = target.dot(this.direction);
			if (directionDistance < 0) {
				return target.copy(this.origin);
			}
			return target.copy(this.origin).addScaledVector(this.direction, directionDistance);
		}

		/**
		 * Returns the distance of the closest approach between this ray and the given point.
		 * @param {Vector3} point - A point in 3D space to compute the distance to.
		 * @returns {number} The distance.
		 */
		distanceToPoint(point) {
			return Math.sqrt(this.distanceSqToPoint(point));
		}

		/**
		 * Returns the squared distance of the closest approach between this ray and the given point.
		 * @param {Vector3} point - A point in 3D space to compute the distance to.
		 * @returns {number} The squared distance.
		 */
		distanceSqToPoint(point) {
			const directionDistance = _vec3_1$2.subVectors(point, this.origin).dot(this.direction);
			if (directionDistance < 0) {
				return this.origin.distanceToSquared(point);
			}
			_vec3_1$2.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
			return _vec3_1$2.distanceToSquared(point);
		}

		/**
		 * Intersects this ray with the given sphere, returning the intersection
		 * point or `null` if there is no intersection.
		 * @param {Sphere} sphere - The sphere to intersect.
		 * @param {Vector3} target - The target vector that is used to store the method's result.
		 * @returns {?Vector3} The intersection point.
		 */
		intersectSphere(sphere, target) {
			_vec3_1$2.subVectors(sphere.center, this.origin);
			const tca = _vec3_1$2.dot(this.direction);
			const d2 = _vec3_1$2.dot(_vec3_1$2) - tca * tca;
			const radius2 = sphere.radius * sphere.radius;
			if (d2 > radius2) {
				return null;
			}
			const thc = Math.sqrt(radius2 - d2);

			// t0 = first intersect point - entrance on front of sphere
			const t0 = tca - thc;

			// t1 = second intersect point - exit point on back of sphere
			const t1 = tca + thc;

			// test to see if both t0 and t1 are behind the ray - if so, return null
			if (t0 < 0 && t1 < 0) {
				return null;
			}

			// test to see if t0 is behind the ray:
			// if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
			// in order to always return an intersect point that is in front of the ray.
			if (t0 < 0) {
				return this.at(t1, target);
			}

			// else t0 is in front of the ray, so return the first collision point scaled by t0
			return this.at(t0, target);
		}

		/**
		 * Returns `true` if this ray intersects with the given sphere.
		 * @param {Sphere} sphere - The sphere to intersect.
		 * @returns {boolean} Whether this ray intersects with the given sphere or not.
		 */
		intersectsSphere(sphere) {
			if (sphere.radius < 0) return false; // handle empty spheres
			return this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius;
		}

		/**
		 * Computes the distance from the ray's origin to the given plane. Returns `null` if the ray
		 * does not intersect with the plane.
		 * @param {Plane} plane - The plane to compute the distance to.
		 * @returns {?number} Whether this ray intersects with the given sphere or not.
		 */
		distanceToPlane(plane) {
			const denominator = plane.normal.dot(this.direction);
			if (denominator === 0) {
				// line is coplanar, return origin
				if (plane.distanceToPoint(this.origin) === 0) {
					return 0;
				}

				// Null is preferable to undefined since undefined means.... it is undefined
				return null;
			}
			const t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;

			// Return if the ray never intersects the plane
			return t >= 0 ? t : null;
		}

		/**
		 * Intersects this ray with the given plane, returning the intersection
		 * point or `null` if there is no intersection.
		 * @param {Plane} plane - The plane to intersect.
		 * @param {Vector3} target - The target vector that is used to store the method's result.
		 * @returns {?Vector3} The intersection point.
		 */
		intersectPlane(plane, target) {
			const t = this.distanceToPlane(plane);
			if (t === null) {
				return null;
			}
			return this.at(t, target);
		}

		/**
		 * Returns `true` if this ray intersects with the given plane.
		 * @param {Plane} plane - The plane to intersect.
		 * @returns {boolean} Whether this ray intersects with the given plane or not.
		 */
		intersectsPlane(plane) {
			// check if the ray lies on the plane first
			const distToPoint = plane.distanceToPoint(this.origin);
			if (distToPoint === 0) {
				return true;
			}
			const denominator = plane.normal.dot(this.direction);
			if (denominator * distToPoint < 0) {
				return true;
			}

			// ray origin is behind the plane (and is pointing behind it)
			return false;
		}

		/**
		 * Intersects this ray with the given bounding box, returning the intersection
		 * point or `null` if there is no intersection.
		 * @param {Box3} box - The box to intersect.
		 * @param {Vector3} target - The target vector that is used to store the method's result.
		 * @returns {?Vector3} The intersection point.
		 */
		intersectBox(box, target) {
			let tmin, tmax, tymin, tymax, tzmin, tzmax;
			const invdirx = 1 / this.direction.x,
				invdiry = 1 / this.direction.y,
				invdirz = 1 / this.direction.z;
			const origin = this.origin;
			if (invdirx >= 0) {
				tmin = (box.min.x - origin.x) * invdirx;
				tmax = (box.max.x - origin.x) * invdirx;
			} else {
				tmin = (box.max.x - origin.x) * invdirx;
				tmax = (box.min.x - origin.x) * invdirx;
			}
			if (invdiry >= 0) {
				tymin = (box.min.y - origin.y) * invdiry;
				tymax = (box.max.y - origin.y) * invdiry;
			} else {
				tymin = (box.max.y - origin.y) * invdiry;
				tymax = (box.min.y - origin.y) * invdiry;
			}
			if (tmin > tymax || tymin > tmax) return null;

			// These lines also handle the case where tmin or tmax is NaN
			// (result of 0 * Infinity). x !== x returns true if x is NaN

			if (tymin > tmin || tmin !== tmin) tmin = tymin;
			if (tymax < tmax || tmax !== tmax) tmax = tymax;
			if (invdirz >= 0) {
				tzmin = (box.min.z - origin.z) * invdirz;
				tzmax = (box.max.z - origin.z) * invdirz;
			} else {
				tzmin = (box.max.z - origin.z) * invdirz;
				tzmax = (box.min.z - origin.z) * invdirz;
			}
			if (tmin > tzmax || tzmin > tmax) return null;
			if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
			if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

			// return point closest to the ray (positive side)

			if (tmax < 0) return null;
			return this.at(tmin >= 0 ? tmin : tmax, target);
		}

		/**
		 * Returns `true` if this ray intersects with the given box.
		 * @param {Box3} box - The box to intersect.
		 * @returns {boolean} Whether this ray intersects with the given box or not.
		 */
		intersectsBox(box) {
			return this.intersectBox(box, _vec3_1$2) !== null;
		}

		/**
		 * Intersects this ray with the given triangle, returning the intersection
		 * point or `null` if there is no intersection.
		 * @param {Vector3} a - The first vertex of the triangle.
		 * @param {Vector3} b - The second vertex of the triangle.
		 * @param {Vector3} c - The third vertex of the triangle.
		 * @param {boolean} backfaceCulling - Whether to use backface culling or not.
		 * @param {Vector3} target - The target vector that is used to store the method's result.
		 * @returns {?Vector3} The intersection point.
		 */
		intersectTriangle(a, b, c, backfaceCulling, target) {
			// Compute the offset origin, edges, and normal.

			// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

			_edge1.subVectors(b, a);
			_edge2.subVectors(c, a);
			_normal.crossVectors(_edge1, _edge2);

			// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
			// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
			//	 |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
			//	 |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
			//	 |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
			let DdN = this.direction.dot(_normal);
			let sign;
			if (DdN > 0) {
				if (backfaceCulling) return null;
				sign = 1;
			} else if (DdN < 0) {
				sign = -1;
				DdN = -DdN;
			} else {
				return null;
			}
			_diff.subVectors(this.origin, a);
			const DdQxE2 = sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2));

			// b1 < 0, no intersection
			if (DdQxE2 < 0) {
				return null;
			}
			const DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff));

			// b2 < 0, no intersection
			if (DdE1xQ < 0) {
				return null;
			}

			// b1+b2 > 1, no intersection
			if (DdQxE2 + DdE1xQ > DdN) {
				return null;
			}

			// Line intersects triangle, check if ray does.
			const QdN = -sign * _diff.dot(_normal);

			// t < 0, no intersection
			if (QdN < 0) {
				return null;
			}

			// Ray intersects triangle.
			return this.at(QdN / DdN, target);
		}

		/**
		 * Transforms this ray with the given 4x4 transformation matrix.
		 * @param {Matrix4} matrix4 - The transformation matrix.
		 * @returns {Ray} A reference to this ray.
		 */
		applyMatrix4(matrix4) {
			this.origin.applyMatrix4(matrix4);
			this.direction.transformDirection(matrix4);
			return this;
		}

		/**
		 * Returns `true` if this ray is equal with the given one.
		 * @param {Ray} ray - The ray to test for equality.
		 * @returns {boolean} Whether this ray is equal with the given one.
		 */
		equals(ray) {
			return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
		}

		/**
		 * Returns a new ray with copied values from this instance.
		 * @returns {Ray} A clone of this instance.
		 */
		clone() {
			return new this.constructor().copy(this);
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Ray.prototype.isRay = true;

	const _box3_1 = new Box3();
	const _vec3_1$1 = new Vector3();
	const _vec3_2 = new Vector3();

	/**
	 * A sphere defined by a center and radius.
	 */
	class Sphere {
		/**
		 * @param {Vector3} [center=Vector3(0, 0, 0)] - center of the sphere.
		 * @param {number} [radius=-1] - radius of the sphere.
		 */
		constructor(center = new Vector3(), radius = -1) {
			this.center = center;
			this.radius = radius;
		}

		/**
		 * Sets the center and radius properties of this sphere.
		 * @param {Vector3} center - center of the sphere.
		 * @param {number} radius - radius of the sphere.
		 * @returns {Sphere}
		 */
		set(center, radius) {
			this.center.copy(center);
			this.radius = radius;
			return this;
		}

		/**
		 * Computes the minimum bounding sphere for an array of points.
		 * If optionalCenteris given, it is used as the sphere's center.
		 * Otherwise, the center of the axis-aligned bounding box encompassing points is calculated.
		 * @param {Vector3[]} points - an Array of Vector3 positions.
		 * @param {Vector3} [optionalCenter] - the center of the sphere.
		 * @returns {Sphere}
		 */
		setFromPoints(points, optionalCenter) {
			const center = this.center;
			if (optionalCenter !== undefined) {
				center.copy(optionalCenter);
			} else {
				_box3_1.setFromPoints(points).getCenter(center);
			}
			let maxRadiusSq = 0;
			for (let i = 0, il = points.length; i < il; i++) {
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
			}
			this.radius = Math.sqrt(maxRadiusSq);
			return this;
		}

		/**
		 * Computes the minimum bounding sphere for an array of points.
		 * @param {number[]} array - an Array of Vector3 positions.
		 * @param {number} [gap=3] - array gap.
		 * @param {number} [offset=0] - array offset.
		 * @returns {Sphere}
		 */
		setFromArray(array, gap = 3, offset = 0) {
			const center = this.center;
			_box3_1.setFromArray(array, gap).getCenter(center);
			let maxRadiusSq = 0;
			for (let i = 0, l = array.length; i < l; i += gap) {
				_vec3_1$1.fromArray(array, i + offset);
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vec3_1$1));
			}
			this.radius = Math.sqrt(maxRadiusSq);
			return this;
		}

		/**
		 * Transforms this sphere with the provided Matrix4.
		 * @param {Matrix4} matrix - the Matrix4 to apply
		 * @returns {Matrix4}
		 */
		applyMatrix4(matrix) {
			this.center.applyMatrix4(matrix);
			this.radius = this.radius * matrix.getMaxScaleOnAxis();
			return this;
		}

		/**
		 * Returns aMinimum Bounding Box for the sphere.
		 * @param {Box3} target — the result will be copied into this Box3.
		 * @returns {Box3}
		 */
		getBoundingBox(target) {
			if (this.isEmpty()) {
				// Empty sphere produces empty bounding box
				target.makeEmpty();
				return target;
			}
			target.set(this.center, this.center);
			target.expandByScalar(this.radius);
			return target;
		}

		/**
		 * Checks to see if the sphere is empty (the radius set to a negative number).
		 * Spheres with a radius of 0 contain only their center point and are not considered to be empty.
		 * @returns {boolean}
		 */
		isEmpty() {
			return this.radius < 0;
		}

		/**
		 * Makes the sphere empty by setting center to (0, 0, 0) and radius to -1.
		 * @returns {Sphere}
		 */
		makeEmpty() {
			this.center.set(0, 0, 0);
			this.radius = -1;
			return this;
		}

		/**
		 * Checks to see if the sphere contains the provided point inclusive of the surface of the sphere.
		 * @param {Vector3} point - The point to check for containment.
		 * @returns {boolean}
		 */
		containsPoint(point) {
			return point.distanceToSquared(this.center) <= this.radius * this.radius;
		}

		/**
		 * Returns the closest distance from the boundary of the sphere to the point.
		 * If the sphere contains the point, the distance will be negative.
		 * @param {Vector3} point - The point to calculate the distance to.
		 * @returns {number}
		 */
		distanceToPoint(point) {
			return point.distanceTo(this.center) - this.radius;
		}

		/**
		 * Expands the boundaries of this sphere to include point.
		 * @param {Vector3} point - The vector3 that should be included in the sphere.
		 * @returns {Sphere}
		 */
		expandByPoint(point) {
			if (this.isEmpty()) {
				this.center.copy(point);
				this.radius = 0;
				return this;
			}
			_vec3_1$1.subVectors(point, this.center);
			const lengthSq = _vec3_1$1.getLengthSquared();
			if (lengthSq > this.radius * this.radius) {
				// calculate the minimal sphere
				const length = Math.sqrt(lengthSq);
				const delta = (length - this.radius) * 0.5;
				this.center.addScaledVector(_vec3_1$1, delta / length);
				this.radius += delta;
			}
			return this;
		}

		/**
		 * Expands this sphere to enclose both the original sphere and the given sphere.
		 * @param {Sphere} sphere - The sphere to include.
		 * @returns {Sphere} A reference to this sphere.
		 */
		union(sphere) {
			if (sphere.isEmpty()) {
				return this;
			}
			if (this.isEmpty()) {
				this.copy(sphere);
				return this;
			}
			if (this.center.equals(sphere.center)) {
				this.radius = Math.max(this.radius, sphere.radius);
			} else {
				_vec3_2.subVectors(sphere.center, this.center).normalize().multiplyScalar(sphere.radius);
				this.expandByPoint(_vec3_1$1.addVectors(sphere.center, _vec3_2));
				this.expandByPoint(_vec3_1$1.addVectors(sphere.center, _vec3_2));
			}
			return this;
		}

		/**
		 * Returns a new sphere with the same center and radius as this one.
		 * @returns {Sphere}
		 */
		clone() {
			return new Sphere().copy(this);
		}

		/**
		 * Copies the values of the passed sphere's center and radius properties to this sphere.
		 * @param {Sphere} sphere
		 * @returns {Sphere}
		 */
		copy(sphere) {
			this.center.copy(sphere.center);
			this.radius = sphere.radius;
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Sphere.prototype.isSphere = true;

	/**
	 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
	 *
	 * The poles (phi) are at the positive and negative y axis.
	 * The equator starts at positive z.
	 */
	class Spherical {
		/**
		 * @param {number} [radius=1] - the radius, or the Euclidean distance (straight-line distance) from the point to the origin. Default is 1.0.
		 * @param {number} [phi=0] - - polar angle in radians from the y (up) axis. Default is 0.
		 * @param {number} [theta=0] - - equator angle in radians around the y (up) axis. Default is 0.
		 */
		constructor(radius = 1, phi = 0, theta = 0) {
			this.radius = radius;
			this.phi = phi; // up / down towards top and bottom pole
			this.theta = theta; // around the equator of the sphere
		}

		/**
		 * Sets values of this spherical's radius, phi and theta properties.
		 * @param {number} radius
		 * @param {number} phi
		 * @param {number} theta
		 * @returns {Spherical}
		 */
		set(radius, phi, theta) {
			this.radius = radius;
			this.phi = phi;
			this.theta = theta;
			return this;
		}

		/**
		 * Copies the values of the passed Spherical's radius, phi and theta properties to this spherical.
		 * @param {Spherical} other
		 * @returns {Spherical}
		 */
		copy(other) {
			this.radius = other.radius;
			this.phi = other.phi;
			this.theta = other.theta;
			return this;
		}

		/**
		 * Returns a new spherical with the same radius, phi and theta properties as this one.
		 * @returns {Spherical}
		 */
		clone() {
			return new Spherical().copy(this);
		}

		/**
		 * Restrict phi to be betwee EPS and PI-EPS.
		 * @returns {Spherical}
		 */
		makeSafe() {
			const EPS = 0.000001;
			this.phi = MathUtils.clamp(this.phi, EPS, Math.PI - EPS);
			return this;
		}

		/**
		 * Sets values of this spherical's radius, phi and theta properties from the Vector3.
		 * @param {Vector3} vec3
		 * @returns {Spherical}
		 */
		setFromVector3(vec3) {
			this.radius = vec3.getLength();
			if (this.radius === 0) {
				this.theta = 0;
				this.phi = 0;
			} else {
				this.theta = Math.atan2(vec3.x, vec3.z); // equator angle around y-up axis
				this.phi = Math.acos(MathUtils.clamp(vec3.y / this.radius, -1, 1)); // polar angle
			}
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Spherical.prototype.isSpherical = true;

	/**
	 * Primary reference: https://graphics.stanford.edu/papers/envmap/envmap.pdf
	 * Secondary reference: https://www.ppsloan.org/publications/StupidSH36.pdf
	 * 3-band SH defined by 9 coefficients.
	 */
	class SphericalHarmonics3 {
		/**
		 * Creates a new instance of SphericalHarmonics3.
		 */
		constructor() {
			/**
			 * An array holding the (9) SH coefficients.
			 * A single coefficient is represented as an instance of Vector3.
			 * @type {Array}
			 */
			this.coefficients = [];
			for (let i = 0; i < 9; i++) {
				this.coefficients.push(new Vector3());
			}
		}

		/**
		 * Set this sphericalHarmonics3 value.
		 * @param {Vector3[]} coefficients An array of SH coefficients.
		 * @returns {SphericalHarmonics3}
		 */
		set(coefficients) {
			for (let i = 0; i < 9; i++) {
				this.coefficients[i].copy(coefficients[i]);
			}
			return this;
		}

		/**
		 * Sets all SH coefficients to 0.
		 * @returns {SphericalHarmonics3}
		 */
		zero() {
			for (let i = 0; i < 9; i++) {
				this.coefficients[i].set(0, 0, 0);
			}
			return this;
		}

		/**
		 * Returns the radiance in the direction of the given normal.
		 * @param {Vector3} normal - The normal vector (assumed to be unit length).
		 * @param {Vector3} target - The result vector.
		 * @returns {Vector3}
		 */
		getAt(normal, target) {
			// normal is assumed to be unit length

			const x = normal.x,
				y = normal.y,
				z = normal.z;
			const coeff = this.coefficients;

			// band 0
			target.copy(coeff[0]).multiplyScalar(0.282095);

			// band 1
			target.addScaledVector(coeff[1], 0.488603 * y);
			target.addScaledVector(coeff[2], 0.488603 * z);
			target.addScaledVector(coeff[3], 0.488603 * x);

			// band 2
			target.addScaledVector(coeff[4], 1.092548 * (x * y));
			target.addScaledVector(coeff[5], 1.092548 * (y * z));
			target.addScaledVector(coeff[6], 0.315392 * (3.0 * z * z - 1.0));
			target.addScaledVector(coeff[7], 1.092548 * (x * z));
			target.addScaledVector(coeff[8], 0.546274 * (x * x - y * y));
			return target;
		}

		/**
		 * Reference: https://graphics.stanford.edu/papers/envmap/envmap.pdf
		 * Returns the irradiance (radiance convolved with cosine lobe) in the direction of the given normal.
		 * @param {Vector3} normal - The normal vector (assumed to be unit length).
		 * @param {Vector3} target - The result vector.
		 * @returns {Vector3}
		 */
		getIrradianceAt(normal, target) {
			// normal is assumed to be unit length

			const x = normal.x,
				y = normal.y,
				z = normal.z;
			const coeff = this.coefficients;

			// band 0
			target.copy(coeff[0]).multiplyScalar(0.886227); // π * 0.282095

			// band 1
			target.addScaledVector(coeff[1], 2.0 * 0.511664 * y); // ( 2 * π / 3 ) * 0.488603
			target.addScaledVector(coeff[2], 2.0 * 0.511664 * z);
			target.addScaledVector(coeff[3], 2.0 * 0.511664 * x);

			// band 2
			target.addScaledVector(coeff[4], 2.0 * 0.429043 * x * y); // ( π / 4 ) * 1.092548
			target.addScaledVector(coeff[5], 2.0 * 0.429043 * y * z);
			target.addScaledVector(coeff[6], 0.743125 * z * z - 0.247708); // ( π / 4 ) * 0.315392 * 3
			target.addScaledVector(coeff[7], 2.0 * 0.429043 * x * z);
			target.addScaledVector(coeff[8], 0.429043 * (x * x - y * y)); // ( π / 4 ) * 0.546274

			return target;
		}

		/**
		 * Adds the given SH to this instance.
		 * @param {SphericalHarmonics3} sh - The SH to add.
		 * @returns {SphericalHarmonics3}
		 */
		add(sh) {
			for (let i = 0; i < 9; i++) {
				this.coefficients[i].add(sh.coefficients[i]);
			}
			return this;
		}

		/**
		 * A convenience method for performing .add() and .scale() at once.
		 * @param {SphericalHarmonics3} sh - The SH to add.
		 * @param {Vector3} s - The scale factor.
		 * @returns {SphericalHarmonics3}
		 */
		addScaledSH(sh, s) {
			for (let i = 0; i < 9; i++) {
				this.coefficients[i].addScaledVector(sh.coefficients[i], s);
			}
			return this;
		}

		/**
		 * Multiply the s to this SphericalHarmonics3.
		 * @param {number} s - The scale factor.
		 * @returns {SphericalHarmonics3}
		 */
		scale(s) {
			for (let i = 0; i < 9; i++) {
				this.coefficients[i].multiplyScalar(s);
			}
			return this;
		}

		/**
		 * Linear interpolates between the given SH and this instance by the given alpha factor.
		 * Sets this coefficients vector to be the vector linearly interpolated between v1 and v2
		 * where alpha is the percent distance along the line connecting the two vectors
		 * - alpha = 0 will be v1, and alpha = 1 will be v2.
		 * @param {SphericalHarmonics3} sh - The SH to interpolate with.
		 * @param {number} alpha - The alpha factor.
		 * @returns {SphericalHarmonics3}
		 */
		lerp(sh, alpha) {
			for (let i = 0; i < 9; i++) {
				this.coefficients[i].lerpVectors(this.coefficients[i], sh.coefficients[i], alpha);
			}
			return this;
		}

		/**
		 * Returns true if the given SH and this instance have equal coefficients.
		 * @param {SphericalHarmonics3} sh - The SH to compare with.
		 * @returns {boolean}
		 */
		equals(sh) {
			for (let i = 0; i < 9; i++) {
				if (!this.coefficients[i].equals(sh.coefficients[i])) {
					return false;
				}
			}
			return true;
		}

		/**
		 * Copies the given SH to this instance.
		 * @param {SphericalHarmonics3} sh - The SH to compare with.
		 * @returns {SphericalHarmonics3}
		 */
		copy(sh) {
			return this.set(sh.coefficients);
		}

		/**
		 * Returns a new instance of SphericalHarmonics3 with equal coefficients.
		 * @returns {SphericalHarmonics3}
		 */
		clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * Sets the coefficients of this instance from the given array.
		 * @param {number[]} array - The array holding the numbers of the SH coefficients.
		 * @param {number} [offset=0] - The array offset.
		 * @returns {SphericalHarmonics3}
		 */
		fromArray(array, offset = 0) {
			const coefficients = this.coefficients;
			for (let i = 0; i < 9; i++) {
				coefficients[i].fromArray(array, offset + i * 3);
			}
			return this;
		}

		/**
		 * Returns an array with the coefficients, or copies them into the provided array.
		 * The coefficients are represented as numbers.
		 * @param {number[]} [array] - The target array.
		 * @param {number} [offset=0] - The array offset.
		 * @returns {number[]}
		 */
		toArray(array = [], offset = 0) {
			const coefficients = this.coefficients;
			for (let i = 0; i < 9; i++) {
				coefficients[i].toArray(array, offset + i * 3);
			}
			return array;
		}

		/**
		 * Computes the SH basis for the given normal vector.
		 * @param {Vector3} normal - The normal vector (assumed to be unit length).
		 * @param {number[]} shBasis - The resulting SH basis.
		 */
		static getBasisAt(normal, shBasis) {
			// normal is assumed to be unit length

			const x = normal.x,
				y = normal.y,
				z = normal.z;

			// band 0
			shBasis[0] = 0.282095;

			// band 1
			shBasis[1] = 0.488603 * y;
			shBasis[2] = 0.488603 * z;
			shBasis[3] = 0.488603 * x;

			// band 2
			shBasis[4] = 1.092548 * x * y;
			shBasis[5] = 1.092548 * y * z;
			shBasis[6] = 0.315392 * (3 * z * z - 1);
			shBasis[7] = 1.092548 * x * z;
			shBasis[8] = 0.546274 * (x * x - y * y);
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	SphericalHarmonics3.prototype.isSphericalHarmonics3 = true;

	const _v0 = new Vector3();
	const _v1 = new Vector3();
	const _v2 = new Vector3();
	const _v3 = new Vector3();

	/**
	 * A geometric triangle as defined by three Vector3s representing its three corners.
	 */
	class Triangle {
		/**
		 * @param {Vector3} [a] - the first corner of the triangle. Default is a Vector3 at (0, 0, 0).
		 * @param {Vector3} [b] - the second corner of the triangle. Default is a Vector3 at (0, 0, 0).
		 * @param {Vector3} [c] - the final corner of the triangle. Default is a Vector3 at (0, 0, 0).
		 */
		constructor(a = new Vector3(), b = new Vector3(), c = new Vector3()) {
			this.a = a;
			this.b = b;
			this.c = c;
		}

		/**
		 * Calculate the normal vector of the triangle.
		 * @param {Vector3} a
		 * @param {Vector3} b
		 * @param {Vector3} c
		 * @param {Vector3} [optionalTarget]
		 * @returns {Vector3}
		 */
		static normal(a, b, c, optionalTarget) {
			const result = optionalTarget || new Vector3();
			result.subVectors(c, b);
			_v0.subVectors(a, b);
			result.cross(_v0);
			const resultLengthSq = result.getLengthSquared();
			if (resultLengthSq > 0) {
				return result.multiplyScalar(1 / Math.sqrt(resultLengthSq));
			}
			return result.set(0, 0, 0);
		}

		/**
		 * static/instance method to calculate barycentric coordinates.
		 * based on: http://www.blackpawn.com/texts/pointinpoly/default.html
		 * @param {Vector3} point - Vector3
		 * @param {Vector3} a
		 * @param {Vector3} b
		 * @param {Vector3} c
		 * @param {Vector3} [target] - the result will be copied into this Vector3.
		 * @returns {Vector3}
		 */
		static barycoordFromPoint(point, a, b, c, target) {
			_v0.subVectors(c, a);
			_v1.subVectors(b, a);
			_v2.subVectors(point, a);
			const dot00 = _v0.dot(_v0);
			const dot01 = _v0.dot(_v1);
			const dot02 = _v0.dot(_v2);
			const dot11 = _v1.dot(_v1);
			const dot12 = _v1.dot(_v2);
			const denom = dot00 * dot11 - dot01 * dot01;
			const result = target || new Vector3();

			// collinear or singular triangle
			if (denom === 0) {
				// arbitrary location outside of triangle?
				// not sure if this is the best idea, maybe should be returning undefined
				return result.set(-2, -1, -1);
			}
			const invDenom = 1 / denom;
			const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
			const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

			// barycentric coordinates must always sum to 1
			return result.set(1 - u - v, v, u);
		}

		/**
		 * Returns true if the passed point, when projected onto the plane of the triangle, lies within the triangle.
		 * @param {Vector3} point
		 * @param {Vector3} a
		 * @param {Vector3} b
		 * @param {Vector3} c
		 * @returns {Vector3}
		 */
		static containsPoint(point, a, b, c) {
			this.barycoordFromPoint(point, a, b, c, _v3);
			return _v3.x >= 0 && _v3.y >= 0 && _v3.x + _v3.y <= 1;
		}

		/**
		 * Sets the triangle's a, b and c properties to the passed vector3s.
		 * @param {Vector3} a
		 * @param {Vector3} b
		 * @param {Vector3} c
		 * @returns {Triangle}
		 */
		set(a, b, c) {
			this.a.copy(a);
			this.b.copy(b);
			this.c.copy(c);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Triangle.prototype.isTriangle = true;

	/**
	 * The vector 4 class
	 */
	class Vector4 {
		/**
		 * @param {number} [x=0] - the x value of this vector.
		 * @param {number} [y=0] - the y value of this vector.
		 * @param {number} [z=0] - the z value of this vector.
		 * @param {number} [w=1] - the w value of this vector.
		 */
		constructor(x = 0, y = 0, z = 0, w = 1) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
		}

		/**
		 * Sets this vector to be the vector linearly interpolated between v1 and v2
		 * where ratio is the percent distance along the line connecting the two vectors
		 * - ratio = 0 will be v1, and ratio = 1 will be v2.
		 * @param {Vector4} v1 - the starting Vector4.
		 * @param {Vector4} v2 - Vector4 to interpolate towards.
		 * @param {number} ratio - interpolation factor, typically in the closed interval [0, 1].
		 * @returns {Vector4}
		 */
		lerpVectors(v1, v2, ratio) {
			return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
		}

		/**
		 * Sets the x, y, z and w components of this vector.
		 * @param {number} x
		 * @param {number} y
		 * @param {number} z
		 * @param {number} w
		 * @returns {Vector4}
		 */
		set(x = 0, y = 0, z = 0, w = 1) {
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		}

		/**
		 * Converts this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but length 1.
		 * @returns {Vector4}
		 */
		normalize() {
			return this.multiplyScalar(1 / (this.getLength() || 1));
		}

		/**
		 * Multiplies this vector by scalar s.
		 * @param {number} scalar
		 * @returns {Vector4}
		 */
		multiplyScalar(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			this.w *= scalar;
			return this;
		}

		/**
		 * Calculates the dot product of this vector and v.
		 * @param {Vector4} v
		 * @returns {Vector4}
		 */
		dot(v) {
			return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
		}

		/**
		 * Computes the square of the Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
		 * If you are comparing the lengths of vectors, you should compare the length squared instead
		 * as it is slightly more efficient to calculate.
		 * @returns {number}
		 */
		getLengthSquared() {
			return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
		}

		/**
		 * Computes the Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
		 * @returns {number}
		 */
		getLength() {
			return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
		}

		/**
		 * Computes the {@link https://en.wikipedia.org/wiki/Taxicab_geometry|Manhattan length}	from (0, 0, 0, 0) to (x, y, z, w).
		 * @returns {number}
		 */
		getManhattanLength() {
			return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
		}

		/**
		 * Multiplies this vector by 4 x 4 m.
		 * @param {Matrix4} m
		 * @returns {Vector4}
		 */
		applyMatrix4(m) {
			const x = this.x,
				y = this.y,
				z = this.z,
				w = this.w;
			const e = m.elements;
			this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
			this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
			this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
			this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
			return this;
		}

		/**
		 * Sets this vector to the position represented by the matrix m.
		 * @param {Matrix4} m
		 * @returns {Vector4}
		 */
		setFromMatrixPosition(m) {
			const e = m.elements;
			this.x = e[12];
			this.y = e[13];
			this.z = e[14];
			this.w = e[15];
			return this;
		}

		/**
		 * Checks for strict equality of this vector and v.
		 * @param {Vector4} v
		 * @returns {boolean}
		 */
		equals(v) {
			return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
		}

		/**
		 * Adds v to this vector.
		 * @param {Vector4} v
		 * @returns {Vector4}
		 */
		add(v) {
			this.x += v.x;
			this.y += v.y;
			this.z += v.z;
			this.w += v.w;
			return this;
		}

		/**
		 * Multiplies this vector by v.
		 * @param {Vector4} v
		 * @returns {Vector4}
		 */
		multiply(v) {
			this.x *= v.x;
			this.y *= v.y;
			this.z *= v.z;
			this.w *= v.w;
			return this;
		}

		/**
		 * Sets this vector to a - b.
		 * @param {Vector4} a
		 * @param {Vector4} b
		 * @returns {Vector4}
		 */
		subVectors(a, b) {
			this.x = a.x - b.x;
			this.y = a.y - b.y;
			this.z = a.z - b.z;
			this.w = a.w - b.w;
			return this;
		}

		/**
		 * Sets this vector's x value to be array[ offset + 0 ],
		 * y value to be array[ offset + 1 ] z value to be array[ offset + 2 ]
		 * and w value to be array[ offset + 3 ].
		 * @param {number[]} array - the source array.
		 * @param {number} [offset=0] - offset into the array.
		 * @param {boolean} [denormalize=false] - if true, denormalize the values, and array should be a typed array.
		 * @returns {Vector4}
		 */
		fromArray(array, offset = 0, denormalize = false) {
			let x = array[offset],
				y = array[offset + 1],
				z = array[offset + 2],
				w = array[offset + 3];
			if (denormalize) {
				x = MathUtils.denormalize(x, array);
				y = MathUtils.denormalize(y, array);
				z = MathUtils.denormalize(z, array);
				w = MathUtils.denormalize(w, array);
			}
			this.x = x;
			this.y = y;
			this.z = z;
			this.w = w;
			return this;
		}

		/**
		 * Returns an array [x, y, z, w], or copies x, y, z and w into the provided array.
		 * @param {number[]} [array] - array to store this vector to. If this is not provided, a new array will be created.
		 * @param {number} [offset=0] - offset into the array.
		 * @param {boolean} [normalize=false] - if true, normalize the values, and array should be a typed array.
		 * @returns {number[]}
		 */
		toArray(array = [], offset = 0, normalize = false) {
			let x = this.x,
				y = this.y,
				z = this.z,
				w = this.w;
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
		 * Rounds the x, y, z and w values of this vector to the nearest integer value.
		 * @returns {Vector4}
		 */
		round() {
			this.x = Math.round(this.x);
			this.y = Math.round(this.y);
			this.z = Math.round(this.z);
			this.w = Math.round(this.w);
			return this;
		}

		/**
		 * Returns a new Vector4 with the same x, y, z and w values as this one.
		 * @returns {Vector4}
		 */
		clone() {
			return new Vector4(this.x, this.y, this.z, this.w);
		}

		/**
		 * Copies the values of the passed Vector4's x, y, z and w properties to this Vector4.
		 * @param {Vector4} v
		 * @returns {Vector4}
		 */
		copy(v) {
			this.x = v.x;
			this.y = v.y;
			this.z = v.z;
			this.w = v.w !== undefined ? v.w : 1;
			return this;
		}
		*[Symbol.iterator]() {
			yield this.x;
			yield this.y;
			yield this.z;
			yield this.w;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Vector4.prototype.isVector4 = true;

	/**
	 * Clone uniforms.
	 * @function
	 * @name cloneUniforms
	 * @param {object} uniforms_src - The input uniforms.
	 * @returns {object} - The output uniforms.
	 */
	function cloneUniforms(uniforms_src) {
		const uniforms_dst = {};
		for (const name in uniforms_src) {
			const uniform_src = uniforms_src[name];
			if (Array.isArray(uniform_src) || ArrayBuffer.isView(uniform_src)) {
				uniforms_dst[name] = uniform_src.slice();
			} else {
				uniforms_dst[name] = uniform_src;
			}
		}
		return uniforms_dst;
	}

	/**
	 * Clone json.
	 * This is faster than JSON.parse(JSON.stringify()).
	 * @function
	 * @name cloneJson
	 * @param {object} obj - The input json.
	 * @returns {object} - The output json.
	 */
	function cloneJson(obj) {
		const newObj = Array.isArray(obj) ? [] : {};
		if (obj && typeof obj === 'object') {
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					newObj[key] = obj[key] && typeof obj[key] === 'object' ? cloneJson(obj[key]) : obj[key];
				}
			}
		}
		return newObj;
	}

	let _object3DId = 0;
	const _mat4_1$2 = new Matrix4();

	/**
	 * This is the base class for most objects,
	 * and provides a set of properties and methods for manipulating objects in 3D space.
	 */
	class Object3D {
		constructor() {
			/**
			 * Unique number for this object instance.
			 * @readonly
			 * @type {number}
			 */
			this.id = _object3DId++;

			/**
			 * UUID of this object instance.
			 * This gets automatically assigned, so this shouldn't be edited.
			 * @type {string}
			 */
			this.uuid = MathUtils.generateUUID();

			/**
			 * Optional name of the object (doesn't need to be unique).
			 * @type {string}
			 * @default ""
			 */
			this.name = '';

			/**
			 * A Vector3 representing the object's local position.
			 * @type {Vector3}
			 * @default Vector3(0, 0, 0)
			 */
			this.position = new Vector3();

			/**
			 * The object's local scale.
			 * @type {Vector3}
			 * @default Vector3(1, 1, 1)
			 */
			this.scale = new Vector3(1, 1, 1);

			/**
			 * Object's local rotation as an {@link Euler}, in radians.
			 * @type {Euler}
			 * @default Euler(0, 0, 0)
			 */
			this.euler = new Euler();

			/**
			 * Object's local rotation as a {@link Quaternion}.
			 * @type {Quaternion}
			 * @default Quaternion(0, 0, 0, 1)
			 */
			this.quaternion = new Quaternion();

			// bind euler and quaternion
			const euler = this.euler,
				quaternion = this.quaternion;
			euler.onChange(function () {
				quaternion.setFromEuler(euler, false);
			});
			quaternion.onChange(function () {
				euler.setFromQuaternion(quaternion, undefined, false);
			});

			/**
			 * The local transform matrix.
			 * @type {Matrix4}
			 */
			this.matrix = new Matrix4();

			/**
			 * The global transform of the object.
			 * If the Object3D has no parent, then it's identical to the local transform {@link Object3D#matrix}.
			 * @type {Matrix4}
			 */
			this.worldMatrix = new Matrix4();

			/**
			 * Object's parent in the scene graph.
			 * An object can have at most one parent.
			 * @type {Object3D[]}
			 */
			this.children = new Array();

			/**
			 * Object's parent in the scene graph.
			 * An object can have at most one parent.
			 * @type {Object3D}
			 */
			this.parent = null;

			/**
			 * Whether the object gets rendered into shadow map.
			 * @type {boolean}
			 * @default false
			 */
			this.castShadow = false;

			/**
			 * Whether the material receives shadows.
			 * @type {boolean}
			 * @default false
			 */
			this.receiveShadow = false;

			/**
			 * Defines shadow map type.
			 * Note: In webgl1 or {@link Scene#disableShadowSampler} is true, soft shadow types will fallback to POISSON_SOFT without warning.
			 * Note: Point light only support POISSON_SOFT for now.
			 * @type {SHADOW_TYPE}
			 * @default SHADOW_TYPE.PCF3_SOFT
			 */
			this.shadowType = SHADOW_TYPE.PCF3_SOFT;

			/**
			 * When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
			 * Otherwise the object gets rendered every frame even if it isn't visible.
			 * @type {boolean}
			 * @default true
			 */
			this.frustumCulled = true;

			/**
			 * Object gets rendered if true.
			 * @type {boolean}
			 * @default true
			 */
			this.visible = true;

			/**
			 * This value allows the default rendering order of scene graph objects to be overridden although opaque and transparent objects remain sorted independently.
			 * Sorting is from lowest to highest renderOrder.
			 * @type {number}
			 * @default 0
			 */
			this.renderOrder = 0;

			/**
			 * Render layer of this object.
			 * RenderQueue will dispatch all renderable objects to the corresponding RenderQueueLayer according to object.renderLayer.
			 * @type {number}
			 * @default 0
			 */
			this.renderLayer = 0;

			/**
			 * Whether it can be collected into the Render Queue.
			 * @type {boolean}
			 * @default true
			 */
			this.renderable = true;

			/**
			 * An object that can be used to store custom data about the {@link Object3D}.
			 * It should not hold references to functions as these will not be cloned.
			 * @type {object}
			 * @default {}
			 */
			this.userData = {};

			/**
			 * When this is set, it calculates the matrix of position, (rotation or quaternion) and scale every frame and also recalculates the worldMatrix property.
			 * @type {boolean}
			 * @default true
			 */
			this.matrixAutoUpdate = true;

			/**
			 * When this is set, it calculates the matrix in that frame and resets this property to false.
			 * @type {boolean}
			 * @default true
			 */
			this.matrixNeedsUpdate = true;

			/**
			 * When this is set, it calculates the world matrix in that frame and resets this property to false.
			 * @type {boolean}
			 * @default true
			 */
			this.worldMatrixNeedsUpdate = true;
		}

		/**
		 * An optional callback that is executed immediately before the Object3D is rendered.
		 */
		onBeforeRender() {}

		/**
		 * An optional callback that is executed immediately after the Object3D is rendered.
		 */
		onAfterRender() {}

		/**
		 * Add object as child of this object.
		 * @param {Object3D} object
		 */
		add(object) {
			if (object === this) {
				console.error('Object3D.add: object can\'t be added as a child of itself.', object);
				return;
			}
			if (object.parent !== null) {
				object.parent.remove(object);
			}
			object.parent = this;
			this.children.push(object);
			object.worldMatrixNeedsUpdate = true;
		}

		/**
		 * Remove object as child of this object.
		 * @param {Object3D} object
		 */
		remove(object) {
			const index = this.children.indexOf(object);
			if (index !== -1) {
				object.parent = null;
				this.children.splice(index, 1);
				object.worldMatrixNeedsUpdate = true;
			}
		}

		/**
		 * Searches through the object's children and returns the first with a matching name.
		 * Note that for most objects the name is an empty string by default.
		 * You will have to set it manually to make use of this method.
		 * @param {string} name - String to match to the children's {@link Object3D#name} property.
		 * @returns {Object3D}
		 */
		getObjectByName(name) {
			return this.getObjectByProperty('name', name);
		}

		/**
		 * Searches through the object's children and returns the first with a property that matches the value given.
		 * @param {string} name - the property name to search for.
		 * @param {number} value - value of the given property.
		 * @returns {Object3D}
		 */
		getObjectByProperty(name, value) {
			if (this[name] === value) return this;
			for (let i = 0, l = this.children.length; i < l; i++) {
				const child = this.children[i];
				const object = child.getObjectByProperty(name, value);
				if (object !== undefined) {
					return object;
				}
			}
			return undefined;
		}

		/**
		 * Update the local transform.
		 * @param {boolean} force
		 */
		updateMatrix(force) {
			if (this.matrixAutoUpdate || this.matrixNeedsUpdate) {
				this.matrix.compose(this.position, this.quaternion, this.scale);
				this.matrixNeedsUpdate = false;
				this.worldMatrixNeedsUpdate = true;
			}
			if (this.worldMatrixNeedsUpdate || force) {
				this.worldMatrix.copy(this.matrix);
				if (this.parent) {
					const parentMatrix = this.parent.worldMatrix;
					this.worldMatrix.premultiply(parentMatrix);
				}
				this.worldMatrixNeedsUpdate = false;
				force = true;
			}
			const children = this.children;
			for (let i = 0, l = children.length; i < l; i++) {
				children[i].updateMatrix(force);
			}
		}

		/**
		 * Returns a vector representing the direction of object's positive z-axis in world space.
		 * This call must be after {@link Object3D#updateMatrix}.
		 * @param {Vector3} [optionalTarget] — the result will be copied into this Vector3.
		 * @returns {Vector3} - the result.
		 */
		getWorldDirection(optionalTarget = new Vector3()) {
			const e = this.worldMatrix.elements;
			return optionalTarget.set(e[8], e[9], e[10]).normalize();
		}

		/**
		 * Rotates the object to face a point in local space.
		 * @param {Vector3} target - A vector representing a position in local space.
		 * @param {Vector3} up — A vector representing the up direction in local space.
		 */
		lookAt(target, up) {
			_mat4_1$2.lookAtRH(target, this.position, up);
			this.quaternion.setFromRotationMatrix(_mat4_1$2);
		}

		/**
		 * Method to get intersections between a casted ray and this object.
		 * @abstract
		 * @param {Ray} ray - The {@link Ray} instance.
		 * @param {Array} intersects - output intersects array.
		 */
		raycast(ray, intersects) {}

		/**
		 * Executes the callback on this object and all descendants.
		 * @param {Function} callback - A function with as first argument an object3D object.
		 */
		traverse(callback) {
			callback(this);
			const children = this.children;
			for (let i = 0, l = children.length; i < l; i++) {
				children[i].traverse(callback);
			}
		}

		/**
		 * Returns a clone of this object and optionally all descendants.
		 * @param {Function} [recursive=true] - if true, descendants of the object are also cloned.
		 * @returns {Object3D}
		 */
		clone(recursive) {
			return new this.constructor().copy(this, recursive);
		}

		/**
		 * Copy the given object into this object.
		 * @param {Object3D} source - The object to be copied.
		 * @param {boolean} [recursive=true] - if true, descendants of the object are also copied.
		 * @returns {Object3D}
		 */
		copy(source, recursive = true) {
			this.name = source.name;
			this.position.copy(source.position);
			this.quaternion.copy(source.quaternion);
			this.scale.copy(source.scale);
			this.matrix.copy(source.matrix);
			this.worldMatrix.copy(source.worldMatrix);
			this.castShadow = source.castShadow;
			this.receiveShadow = source.receiveShadow;
			this.shadowType = source.shadowType;
			this.frustumCulled = source.frustumCulled;
			this.visible = source.visible;
			this.renderOrder = source.renderOrder;
			this.renderLayer = source.renderLayer;
			this.renderable = source.renderable;
			this.userData = cloneJson(source.userData);
			if (recursive === true) {
				for (let i = 0; i < source.children.length; i++) {
					const child = source.children[i];
					this.add(child.clone());
				}
			}
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Object3D.prototype.isObject3D = true;

	const _plane_1 = new Plane();
	let _sceneDataId = 0;

	/**
	 * SceneData collect all render states about scene, Including lights.
	 */
	class SceneData {
		constructor() {
			this.id = _sceneDataId++;
			this.version = 0;
			this.useAnchorMatrix = false;
			this.anchorMatrix = new Matrix4();
			this.anchorMatrixInverse = new Matrix4();
			this.disableShadowSampler = false;
			this.logarithmicDepthBuffer = false;
			this.fog = null;
			this.environment = null;
			this.envDiffuseIntensity = 1;
			this.envSpecularIntensity = 1;
			this.clippingPlanesData = new Float32Array([]);
			this.numClippingPlanes = 0;
		}

		/**
		 * Update scene data.
		 * @param {Scene} scene
		 */
		update(scene) {
			this.useAnchorMatrix = !scene.anchorMatrix.isIdentity();
			this.anchorMatrix.copy(scene.anchorMatrix);
			this.anchorMatrixInverse.copy(scene.anchorMatrix).invert();
			this.disableShadowSampler = scene.disableShadowSampler;
			this.logarithmicDepthBuffer = scene.logarithmicDepthBuffer;
			this.fog = scene.fog;
			this.environment = scene.environment;
			this.envDiffuseIntensity = scene.envDiffuseIntensity;
			this.envSpecularIntensity = scene.envSpecularIntensity;
			if (this.clippingPlanesData.length < scene.clippingPlanes.length * 4) {
				this.clippingPlanesData = new Float32Array(scene.clippingPlanes.length * 4);
			}
			this.setClippingPlanesData(scene.clippingPlanes, this.clippingPlanesData);
			this.numClippingPlanes = scene.clippingPlanes.length;
			this.version++;
		}
		setClippingPlanesData(clippingPlanes, clippingPlanesData) {
			for (let i = 0; i < clippingPlanes.length; i++) {
				_plane_1.copy(clippingPlanes[i]);
				if (this.useAnchorMatrix) {
					_plane_1.applyMatrix4(this.anchorMatrixInverse);
				}
				clippingPlanesData[i * 4 + 0] = _plane_1.normal.x;
				clippingPlanesData[i * 4 + 1] = _plane_1.normal.y;
				clippingPlanesData[i * 4 + 2] = _plane_1.normal.z;
				clippingPlanesData[i * 4 + 3] = _plane_1.constant;
			}
			return clippingPlanesData;
		}
	}

	/**
	 * Abstract base class for lights
	 * - The light's direction is defined as the 3-vector (0.0, 0,0, -1.0), that is, an untransformed light points down the -Z axis.
	 * - all other light types inherit the properties and methods described here.
	 * @abstract
	 * @extends Object3D
	 */
	class Light extends Object3D {
		/**
		 * @param {number} [color=0xffffff]
		 * @param {number} [intensity=1]
		 */
		constructor(color = 0xffffff, intensity = 1) {
			super();

			/**
			 * Color of the light.
			 * @type {Color3}
			 * @default Color3(0xffffff)
			 */
			this.color = new Color3(color);

			/**
			 * The light's intensity, or strength.
			 * @type {number}
			 * @default 1
			 */
			this.intensity = intensity;

			/**
			 * Group mask of the light, indicating which lighting group the light belongs to. Default is 1 (binary 0001), meaning the light belongs to lighting group 0.
			 * For example, to make the light effective in both lighting group 0 and lighting group 1, set groupMask to 3 (binary 0011).
			 * Used in conjunction with {@link Material#lightingGroup}.
			 * @type {number}
			 * @default 1
			 */
			this.groupMask = 1;
		}

		/**
		 * Set light direction, this func will set quaternion of this light.
		 * @param {Vector3} target - The target that the light look at.
		 * @param {Vector3} up - The up direction of the light.
		 */
		lookAt(target, up) {
			_mat4_1$1.lookAtRH(this.position, target, up);
			this.quaternion.setFromRotationMatrix(_mat4_1$1);
		}

		/**
		 * Copies properties from the source light into this one.
		 * @param {Light} source - The source light.
		 * @returns {Light} - This light.
		 */
		copy(source) {
			super.copy(source);
			this.color.copy(source.color);
			this.intensity = source.intensity;
			this.groupMask = source.groupMask;
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Light.prototype.isLight = true;
	const _mat4_1$1 = new Matrix4();

	/**
	 * RectAreaLight emits light uniformly across the face a rectangular plane.
	 * This light can be used to simulate light sources such as bright windows or strip lighting.
	 * Important Notes:
	 * - There is no shadow support.
	 * - Only PBRMaterial are supported.
	 * - You have to set LTC1 and LTC2 in RectAreaLight before using it.
	 * @extends Light
	 */
	class RectAreaLight extends Light {
		/**
		 * @param {number} [color=0xffffff]
		 * @param {number} [intensity=1]
		 * @param {number} [width=10]
		 * @param {number} [height=10]
		 */
		constructor(color, intensity, width = 10, height = 10) {
			super(color, intensity);

			/**
			 * The width of the light.
			 * @type {number}
			 * @default 10
			 */
			this.width = width;

			/**
			 * The height of the light.
			 * @type {number}
			 * @default 10
			 */
			this.height = height;
		}

		/**
		 * The light's power.
		 * Power is the luminous power of the light measured in lumens (lm).
		 * Changing the power will also change the light's intensity.
		 * @type {number}
		 */
		get power() {
			// compute the light's luminous power (in lumens) from its intensity (in nits)
			return this.intensity * this.width * this.height * Math.PI;
		}
		set power(power) {
			// set the light's intensity (in nits) from the desired luminous power (in lumens)
			this.intensity = power / (this.width * this.height * Math.PI);
		}
		copy(source) {
			super.copy(source);
			this.width = source.width;
			this.height = source.height;
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	RectAreaLight.prototype.isRectAreaLight = true;

	/**
	 * The first LTC (Linearly Transformed Cosines).
	 * If you want to use RectAreaLight, you have to set this before using it.
	 * @type {null | Texture2D}
	 */
	RectAreaLight.LTC1 = null;

	/**
	 * The second LTC (Linearly Transformed Cosines).
	 * If you want to use RectAreaLight, you have to set this before using it.
	 * @type {null | Texture2D}
	 */
	RectAreaLight.LTC2 = null;

	class LightingGroup extends EventDispatcher {
		constructor() {
			super();
			this.id = _lightingGroupId++;

			// Light collection array

			this.lights = [];

			// Data caches

			this.ambient = new Float32Array([0, 0, 0]);
			this.sh = new Float32Array(27);
			this.hemisphere = [];
			this.directional = [];
			this.directionalShadow = [];
			this.directionalShadowMap = [];
			this.directionalShadowDepthMap = [];
			this.directionalShadowMatrix = new Float32Array(0);
			this.point = [];
			this.pointShadow = [];
			this.pointShadowMap = [];
			this.pointShadowMatrix = new Float32Array(0);
			this.spot = [];
			this.spotShadow = [];
			this.spotShadowMap = [];
			this.spotShadowDepthMap = [];
			this.spotShadowMatrix = new Float32Array(0);
			this.rectArea = [];
			this.LTC1 = null;
			this.LTC2 = null;

			// Status

			this.useAmbient = false;
			this.useSphericalHarmonics = false;
			this.hemisNum = 0;
			this.directsNum = 0;
			this.pointsNum = 0;
			this.spotsNum = 0;
			this.rectAreaNum = 0;
			this.directShadowNum = 0;
			this.pointShadowNum = 0;
			this.spotShadowNum = 0;
			this.totalNum = 0;
			this.shadowsNum = 0;

			// Version

			this.version = 0;
		}
		begin() {
			this.totalNum = 0;
			this.shadowsNum = 0;
		}
		push(light, shadow) {
			this.lights[this.totalNum++] = light;
			if (shadow) {
				this.shadowsNum++;
			}
		}
		end(sceneData) {
			this.lights.length = this.totalNum;
			this._setupCache(sceneData);
			this.version++;
		}
		dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		}
		_setupCache(sceneData) {
			for (let i = 0; i < 3; i++) {
				this.ambient[i] = 0;
			}
			for (let i = 0; i < this.sh.length; i++) {
				this.sh[i] = 0;
			}
			this.useAmbient = false;
			this.useSphericalHarmonics = false;
			this.hemisNum = 0;
			this.directsNum = 0;
			this.pointsNum = 0;
			this.spotsNum = 0;
			this.rectAreaNum = 0;
			this.directShadowNum = 0;
			this.pointShadowNum = 0;
			this.spotShadowNum = 0;
			this.LTC1 = null;
			this.LTC2 = null;

			// Setup Uniforms

			for (let i = 0, l = this.lights.length; i < l; i++) {
				const light = this.lights[i];
				if (light.isAmbientLight) {
					this._doAddAmbientLight(light);
				} else if (light.isHemisphereLight) {
					this._doAddHemisphereLight(light, sceneData);
				} else if (light.isDirectionalLight) {
					this._doAddDirectLight(light, sceneData);
				} else if (light.isPointLight) {
					this._doAddPointLight(light, sceneData);
				} else if (light.isSpotLight) {
					this._doAddSpotLight(light, sceneData);
				} else if (light.isSphericalHarmonicsLight) {
					this._doAddSphericalHarmonicsLight(light);
				} else if (light.isRectAreaLight) {
					this._doAddRectAreaLight(light, sceneData);
				}
			}
			const directShadowNum = this.directShadowNum;
			if (directShadowNum > 0) {
				this.directionalShadowMap.length = directShadowNum;
				this.directionalShadowDepthMap.length = directShadowNum;
				tempDirectionalShadowMatrices.length = directShadowNum;
				if (this.directionalShadowMatrix.length !== directShadowNum * 16) {
					this.directionalShadowMatrix = new Float32Array(directShadowNum * 16);
				}
				for (let i = 0; i < directShadowNum; i++) {
					tempDirectionalShadowMatrices[i].toArray(this.directionalShadowMatrix, i * 16);
				}
			}
			const pointShadowNum = this.pointShadowNum;
			if (pointShadowNum > 0) {
				this.pointShadowMap.length = pointShadowNum;
				tempPointShadowMatrices.length = pointShadowNum;
				if (this.pointShadowMatrix.length !== pointShadowNum * 16) {
					this.pointShadowMatrix = new Float32Array(pointShadowNum * 16);
				}
				for (let i = 0; i < pointShadowNum; i++) {
					tempPointShadowMatrices[i].toArray(this.pointShadowMatrix, i * 16);
				}
			}
			const spotShadowNum = this.spotShadowNum;
			if (spotShadowNum > 0) {
				this.spotShadowMap.length = spotShadowNum;
				this.spotShadowDepthMap.length = spotShadowNum;
				tempSpotShadowMatrices.length = spotShadowNum;
				if (this.spotShadowMatrix.length !== spotShadowNum * 16) {
					this.spotShadowMatrix = new Float32Array(spotShadowNum * 16);
				}
				for (let i = 0; i < spotShadowNum; i++) {
					tempSpotShadowMatrices[i].toArray(this.spotShadowMatrix, i * 16);
				}
			}
			if (this.rectAreaNum > 0) {
				this.LTC1 = RectAreaLight.LTC1;
				this.LTC2 = RectAreaLight.LTC2;
			}
		}
		_doAddAmbientLight(object) {
			const intensity = object.intensity;
			const color = object.color;
			this.ambient[0] += color.r * intensity;
			this.ambient[1] += color.g * intensity;
			this.ambient[2] += color.b * intensity;
			this.useAmbient = true;
		}
		_doAddSphericalHarmonicsLight(object) {
			const intensity = object.intensity;
			const sh = object.sh.coefficients;
			for (let i = 0; i < sh.length; i += 1) {
				this.sh[i * 3] += sh[i].x * intensity;
				this.sh[i * 3 + 1] += sh[i].y * intensity;
				this.sh[i * 3 + 2] += sh[i].z * intensity;
			}
			this.useSphericalHarmonics = true;
		}
		_doAddHemisphereLight(object, sceneData) {
			const intensity = object.intensity;
			const skyColor = object.color;
			const groundColor = object.groundColor;
			const useAnchorMatrix = sceneData.useAnchorMatrix;
			const cache = getLightCache(object);
			cache.skyColor[0] = skyColor.r * intensity;
			cache.skyColor[1] = skyColor.g * intensity;
			cache.skyColor[2] = skyColor.b * intensity;
			cache.groundColor[0] = groundColor.r * intensity;
			cache.groundColor[1] = groundColor.g * intensity;
			cache.groundColor[2] = groundColor.b * intensity;
			const e = object.worldMatrix.elements;
			const direction = helpVector3.set(e[4], e[5], e[6]).normalize();
			if (useAnchorMatrix) {
				direction.transformDirection(sceneData.anchorMatrixInverse);
			}
			direction.toArray(cache.direction);
			this.hemisphere[this.hemisNum++] = cache;
		}
		_doAddDirectLight(object, sceneData) {
			const intensity = object.intensity;
			const color = object.color;
			const useAnchorMatrix = sceneData.useAnchorMatrix;
			const cache = getLightCache(object);
			cache.color[0] = color.r * intensity;
			cache.color[1] = color.g * intensity;
			cache.color[2] = color.b * intensity;
			const direction = object.getWorldDirection(helpVector3);
			if (useAnchorMatrix) {
				direction.transformDirection(sceneData.anchorMatrixInverse);
			}
			direction.multiplyScalar(-1).toArray(cache.direction);
			if (object.castShadow) {
				const shadow = object.shadow;
				const shadowCache = getShadowCache(object);
				shadowCache.shadowBias[0] = shadow.bias;
				shadowCache.shadowBias[1] = shadow.normalBias;
				shadowCache.shadowMapSize[0] = shadow.mapSize.x;
				shadowCache.shadowMapSize[1] = shadow.mapSize.y;
				shadowCache.shadowParams[0] = shadow.radius;
				shadowCache.shadowParams[1] = shadow.frustumEdgeFalloff;
				this.directionalShadow[this.directShadowNum++] = shadowCache;
				shadow.update(object);
				shadow.updateMatrix();
				if (useAnchorMatrix) {
					shadow.matrix.multiply(sceneData.anchorMatrix);
				}
				this.directionalShadowMap[this.directsNum] = shadow.map;
				this.directionalShadowDepthMap[this.directsNum] = shadow.depthMap;
				tempDirectionalShadowMatrices[this.directsNum] = shadow.matrix;
			}
			this.directional[this.directsNum++] = cache;
		}
		_doAddPointLight(object, sceneData) {
			const intensity = object.intensity;
			const color = object.color;
			const distance = object.distance;
			const decay = object.decay;
			const useAnchorMatrix = sceneData.useAnchorMatrix;
			const cache = getLightCache(object);
			cache.color[0] = color.r * intensity;
			cache.color[1] = color.g * intensity;
			cache.color[2] = color.b * intensity;
			cache.distance = distance;
			cache.decay = decay;
			const position = helpVector3.setFromMatrixPosition(object.worldMatrix);
			if (useAnchorMatrix) {
				position.applyMatrix4(sceneData.anchorMatrixInverse);
			}
			cache.position[0] = position.x;
			cache.position[1] = position.y;
			cache.position[2] = position.z;
			if (object.castShadow) {
				const shadow = object.shadow;
				const shadowCache = getShadowCache(object);
				shadowCache.shadowBias[0] = shadow.bias;
				shadowCache.shadowBias[1] = shadow.normalBias;
				shadowCache.shadowMapSize[0] = shadow.mapSize.x;
				shadowCache.shadowMapSize[1] = shadow.mapSize.y;
				shadowCache.shadowParams[0] = shadow.radius;
				shadowCache.shadowParams[1] = 0;
				shadowCache.shadowCameraRange[0] = shadow.cameraNear;
				shadowCache.shadowCameraRange[1] = shadow.cameraFar;
				this.pointShadow[this.pointShadowNum++] = shadowCache;
				shadow.update(object, 0);
				shadow.matrix.makeTranslation(-position.x, -position.y, -position.z); // for point light

				this.pointShadowMap[this.pointsNum] = shadow.map;
				tempPointShadowMatrices[this.pointsNum] = shadow.matrix;
			}
			this.point[this.pointsNum++] = cache;
		}
		_doAddSpotLight(object, sceneData) {
			const intensity = object.intensity;
			const color = object.color;
			const distance = object.distance;
			const decay = object.decay;
			const useAnchorMatrix = sceneData.useAnchorMatrix;
			const cache = getLightCache(object);
			cache.color[0] = color.r * intensity;
			cache.color[1] = color.g * intensity;
			cache.color[2] = color.b * intensity;
			cache.distance = distance;
			cache.decay = decay;
			const position = helpVector3.setFromMatrixPosition(object.worldMatrix);
			if (useAnchorMatrix) {
				position.applyMatrix4(sceneData.anchorMatrixInverse);
			}
			cache.position[0] = position.x;
			cache.position[1] = position.y;
			cache.position[2] = position.z;
			const direction = object.getWorldDirection(helpVector3);
			if (useAnchorMatrix) {
				direction.transformDirection(sceneData.anchorMatrixInverse);
			}
			direction.multiplyScalar(-1).toArray(cache.direction);
			const coneCos = Math.cos(object.angle);
			const penumbraCos = Math.cos(object.angle * (1 - object.penumbra));
			cache.coneCos = coneCos;
			cache.penumbraCos = penumbraCos;
			if (object.castShadow) {
				const shadow = object.shadow;
				const shadowCache = getShadowCache(object);
				shadowCache.shadowBias[0] = shadow.bias;
				shadowCache.shadowBias[1] = shadow.normalBias;
				shadowCache.shadowMapSize[0] = shadow.mapSize.x;
				shadowCache.shadowMapSize[1] = shadow.mapSize.y;
				shadowCache.shadowParams[0] = shadow.radius;
				shadowCache.shadowParams[1] = shadow.frustumEdgeFalloff;
				this.spotShadow[this.spotShadowNum++] = shadowCache;
				shadow.update(object);
				shadow.updateMatrix();
				if (useAnchorMatrix) {
					shadow.matrix.multiply(sceneData.anchorMatrix);
				}
				this.spotShadowMap[this.spotsNum] = shadow.map;
				this.spotShadowDepthMap[this.spotsNum] = shadow.depthMap;
				tempSpotShadowMatrices[this.spotsNum] = shadow.matrix;
			}
			this.spot[this.spotsNum++] = cache;
		}
		_doAddRectAreaLight(object, sceneData) {
			const intensity = object.intensity;
			const color = object.color;
			const halfHeight = object.height;
			const halfWidth = object.width;
			const useAnchorMatrix = sceneData.useAnchorMatrix;
			const cache = getLightCache(object);
			cache.color[0] = color.r * intensity;
			cache.color[1] = color.g * intensity;
			cache.color[2] = color.b * intensity;
			const position = helpVector3.setFromMatrixPosition(object.worldMatrix);
			if (useAnchorMatrix) {
				position.applyMatrix4(sceneData.anchorMatrixInverse);
			}
			cache.position[0] = position.x;
			cache.position[1] = position.y;
			cache.position[2] = position.z;

			// extract rotation of light to derive width/height half vectors
			helpMatrix4$1.copy(object.worldMatrix);
			if (useAnchorMatrix) {
				helpMatrix4$1.premultiply(sceneData.anchorMatrixInverse);
			}
			helpMatrix4$1.extractRotation(helpMatrix4$1);
			const halfWidthPos = helpVector3.set(halfWidth * 0.5, 0.0, 0.0);
			halfWidthPos.applyMatrix4(helpMatrix4$1);
			cache.halfWidth[0] = halfWidthPos.x;
			cache.halfWidth[1] = halfWidthPos.y;
			cache.halfWidth[2] = halfWidthPos.z;
			const halfHeightPos = helpVector3.set(0.0, halfHeight * 0.5, 0.0);
			halfHeightPos.applyMatrix4(helpMatrix4$1);
			cache.halfHeight[0] = halfHeightPos.x;
			cache.halfHeight[1] = halfHeightPos.y;
			cache.halfHeight[2] = halfHeightPos.z;
			this.rectArea[this.rectAreaNum++] = cache;
		}
	}

	// Variables

	let _lightingGroupId = 0;
	const helpVector3 = new Vector3();
	const helpMatrix4$1 = new Matrix4();
	const tempDirectionalShadowMatrices = [];
	const tempPointShadowMatrices = [];
	const tempSpotShadowMatrices = [];

	// Light caches

	const lightCaches = new WeakMap();
	function getLightCache(light) {
		if (lightCaches.has(light)) {
			return lightCaches.get(light);
		}
		let cache;
		if (light.isHemisphereLight) {
			cache = {
				direction: new Float32Array(3),
				skyColor: new Float32Array([0, 0, 0]),
				groundColor: new Float32Array([0, 0, 0])
			};
		} else if (light.isDirectionalLight) {
			cache = {
				direction: new Float32Array(3),
				color: new Float32Array([0, 0, 0])
			};
		} else if (light.isPointLight) {
			cache = {
				position: new Float32Array(3),
				color: new Float32Array([0, 0, 0]),
				distance: 0,
				decay: 0
			};
		} else if (light.isSpotLight) {
			cache = {
				position: new Float32Array(3),
				direction: new Float32Array(3),
				color: new Float32Array([0, 0, 0]),
				distance: 0,
				coneCos: 0,
				penumbraCos: 0,
				decay: 0
			};
		} else if (light.isRectAreaLight) {
			cache = {
				position: new Float32Array(3),
				color: new Float32Array([0, 0, 0]),
				halfWidth: new Float32Array(3),
				halfHeight: new Float32Array(3)
			};
		}
		lightCaches.set(light, cache);
		return cache;
	}

	// Shadow caches

	const shadowCaches = new WeakMap();
	function getShadowCache(light) {
		if (shadowCaches.has(light)) {
			return shadowCaches.get(light);
		}
		let cache;
		if (light.isDirectionalLight) {
			cache = {
				shadowBias: new Float32Array(2),
				// [bias, normalBias]
				shadowMapSize: new Float32Array(2),
				// [width, height]
				shadowParams: new Float32Array(2) // [radius, frustumEdgeFalloff]
			};
		} else if (light.isPointLight) {
			cache = {
				shadowBias: new Float32Array(2),
				// [bias, normalBias]
				shadowMapSize: new Float32Array(2),
				// [width, height]
				shadowParams: new Float32Array(2),
				// [radius, 0]
				shadowCameraRange: new Float32Array(2) // [cameraNear, cameraFar]
			};
		} else if (light.isSpotLight) {
			cache = {
				shadowBias: new Float32Array(2),
				// [bias, normalBias]
				shadowMapSize: new Float32Array(2),
				// [width, height]
				shadowParams: new Float32Array(2) // [radius, frustumEdgeFalloff]
			};
		}
		shadowCaches.set(light, cache);
		return cache;
	}

	class LightingData {
		constructor() {
			this.lightsArray = [];
			this.shadowsNum = 0;
			this.groupList = [];
			this.groupList.push(new LightingGroup()); // create default group 0

			this._locked = true;
		}
		getGroup(id) {
			return this.groupList[id];
		}
		setMaxGroupCount(max) {
			max = Math.max(1, max); // at least one group

			const groupList = this.groupList;
			const oldMax = groupList.length;
			if (max < oldMax) {
				for (let i = max; i < oldMax; i++) {
					groupList[i].dispose();
				}
				groupList.length = max;
			} else if (max > oldMax) {
				for (let i = oldMax; i < max; i++) {
					groupList.push(new LightingGroup());
				}
			}
		}
		begin() {
			if (!this._locked) {
				console.warn('LightingData: begin() called without end().');
			}
			this.lightsArray.length = 0;
			this.shadowsNum = 0;
			this._locked = false;
		}
		collect(light) {
			if (this._locked) return;
			this.lightsArray.push(light);
			if (castShadow(light)) {
				this.shadowsNum++;
			}
		}
		end(sceneData) {
			const lightsArray = this.lightsArray;
			const shadowsNum = this.shadowsNum;
			const groupList = this.groupList;
			lightsArray.sort(shadowCastingLightsFirst);
			let i, l;
			for (i = 0, l = groupList.length; i < l; i++) {
				groupList[i].begin();
			}
			for (i = 0, l = lightsArray.length; i < l; i++) {
				this._distribute(lightsArray[i], i < shadowsNum);
			}
			for (i = 0, l = groupList.length; i < l; i++) {
				groupList[i].end(sceneData);
			}
			this._locked = true;
		}
		_distribute(light, shadow) {
			const groupMask = light.groupMask;
			const groupList = this.groupList;

			// optimize for single group
			if (groupList.length === 1 && groupMask & 1) {
				groupList[0].push(light, shadow);
				return;
			}
			for (let i = 0, l = groupList.length; i < l; i++) {
				const mask = 1 << i;
				if (groupMask < mask) break;
				if (groupMask & mask) {
					groupList[i].push(light, shadow);
				}
			}
		}
	}
	function shadowCastingLightsFirst(lightA, lightB) {
		const a = castShadow(lightA) ? 1 : 0;
		const b = castShadow(lightB) ? 1 : 0;
		return b - a;
	}
	function castShadow(light) {
		return light.shadow && light.castShadow;
	}

	function _isPerspectiveMatrix$1(m) {
		return m.elements[11] === -1;
	}
	let _cameraDataId = 0;

	/**
	 * RenderStates collect all render states about scene and camera.
	 */
	class RenderStates {
		constructor(sceneData, lightingData) {
			this.scene = sceneData;
			this.lighting = lightingData;
			this.camera = {
				id: _cameraDataId++,
				version: 0,
				near: 0,
				far: 0,
				position: new Vector3(),
				logDepthCameraNear: 0,
				logDepthBufFC: 0,
				viewMatrix: new Matrix4(),
				projectionMatrix: new Matrix4(),
				projectionViewMatrix: new Matrix4(),
				rect: new Vector4(0, 0, 1, 1)
			};
			this.gammaFactor = 2.0;
			this.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;
		}

		/**
		 * Update render states about camera.
		 * @param {Camera} camera
		 */
		updateCamera(camera) {
			const sceneData = this.scene;
			const cameraData = this.camera;
			const projectionMatrix = camera.projectionMatrix;
			let cameraNear = 0,
				cameraFar = 0;
			if (_isPerspectiveMatrix$1(projectionMatrix)) {
				cameraNear = projectionMatrix.elements[14] / (projectionMatrix.elements[10] - 1);
				cameraFar = projectionMatrix.elements[14] / (projectionMatrix.elements[10] + 1);
			} else {
				cameraNear = (projectionMatrix.elements[14] + 1) / projectionMatrix.elements[10];
				cameraFar = (projectionMatrix.elements[14] - 1) / projectionMatrix.elements[10];
			}
			cameraData.near = cameraNear;
			cameraData.far = cameraFar;
			if (sceneData.logarithmicDepthBuffer) {
				cameraData.logDepthCameraNear = cameraNear;
				cameraData.logDepthBufFC = 2.0 / (Math.log(cameraFar - cameraNear + 1.0) * Math.LOG2E);
			} else {
				cameraData.logDepthCameraNear = 0;
				cameraData.logDepthBufFC = 0;
			}
			cameraData.position.setFromMatrixPosition(camera.worldMatrix);
			if (sceneData.useAnchorMatrix) {
				cameraData.position.applyMatrix4(sceneData.anchorMatrixInverse);
			}
			cameraData.viewMatrix.copy(camera.viewMatrix);
			if (sceneData.useAnchorMatrix) {
				cameraData.viewMatrix.multiply(sceneData.anchorMatrix);
			}
			cameraData.projectionMatrix.copy(projectionMatrix);
			cameraData.projectionViewMatrix.copy(projectionMatrix).multiply(cameraData.viewMatrix);
			cameraData.rect.copy(camera.rect);
			cameraData.version++;
			this.gammaFactor = camera.gammaFactor;
			this.outputEncoding = camera.outputEncoding;
		}
	}

	/**
	 * RenderQueueLayer holds all the renderable objects.
	 * Now has an opaque list and a transparent list.
	 */
	class RenderQueueLayer {
		/**
		 * @param {number} id - layer id.
		 */
		constructor(id) {
			this.id = id;
			this.opaque = [];
			this.opaqueCount = 0;
			this.transparent = [];
			this.transparentCount = 0;
			this._cache = [];
			this._cacheIndex = 0;
			this._lastCacheIndex = 0;
			this.opaqueSortCompareFn = defaultOpaqueSortCompare;
			this.transparentSortCompareFn = defaultTransparentSortCompare;
		}
		begin() {
			this._cacheIndex = 0;
			this.opaqueCount = 0;
			this.transparentCount = 0;
		}
		end() {
			this.opaque.length = this.opaqueCount;
			this.transparent.length = this.transparentCount;

			// Clear references from inactive renderables in the list
			const cacheIndex = this._cacheIndex,
				lastCacheIndex = this._lastCacheIndex;
			if (lastCacheIndex > cacheIndex) {
				const cache = this._cache;
				for (let i = cacheIndex; i < lastCacheIndex; i++) {
					const renderable = cache[i];
					renderable.object = null;
					renderable.geometry = null;
					renderable.material = null;
					renderable.group = null;
				}
			}
			this._lastCacheIndex = cacheIndex;
		}
		addRenderable(object, geometry, material, z, group) {
			const cache = this._cache;
			let renderable = cache[this._cacheIndex];
			if (renderable === undefined) {
				renderable = {
					object: object,
					geometry: geometry,
					material: material,
					z: z,
					renderOrder: object.renderOrder,
					group: group
				};
				cache[this._cacheIndex] = renderable;
			} else {
				renderable.object = object;
				renderable.geometry = geometry;
				renderable.material = material;
				renderable.z = z;
				renderable.renderOrder = object.renderOrder;
				renderable.group = group;
			}
			if (material.transparent) {
				this.transparent[this.transparentCount] = renderable;
				this.transparentCount++;
			} else {
				this.opaque[this.opaqueCount] = renderable;
				this.opaqueCount++;
			}
			this._cacheIndex++;
		}
		sort() {
			this.opaque.sort(this.opaqueSortCompareFn);
			quickSort(this.transparent, 0, this.transparent.length, this.transparentSortCompareFn);
		}
	}
	function defaultOpaqueSortCompare(a, b) {
		if (a.renderOrder !== b.renderOrder) {
			return a.renderOrder - b.renderOrder;
		} else if (a.material.id !== b.material.id) {
			return a.material.id - b.material.id;
		} else {
			return a.id - b.id;
		}
	}
	function defaultTransparentSortCompare(a, b) {
		if (a.renderOrder !== b.renderOrder) {
			return a.renderOrder - b.renderOrder;
		} else if (a.z !== b.z) {
			return b.z - a.z;
		} else if (a.material.id !== b.material.id) {
			// fix Unstable sort below chrome version 7.0
			// if render same object with different materials
			return a.material.id - b.material.id;
		} else {
			return a.id - b.id;
		}
	}

	// Reference github.com/ant-galaxy/oasis-engine/blob/main/packages/core/src/RenderPipeline/RenderQueue.ts
	// quickSort is faster when sorting highly randomized arrays,
	// but for sorting lowly randomized arrays, Array.prototype.sort is faster,
	// so quickSort is more suitable for transparent list sorting.

	function quickSort(a, from, to, compareFunc) {
		while (true) {
			// Insertion sort is faster for short arrays.
			if (to - from <= 10) {
				insertionSort(a, from, to, compareFunc);
				return;
			}
			const third_index = from + to >> 1;
			// Find a pivot as the median of first, last and middle element.
			let v0 = a[from];
			let v1 = a[to - 1];
			let v2 = a[third_index];
			const c01 = compareFunc(v0, v1);
			if (c01 > 0) {
				const tmp = v0;
				v0 = v1;
				v1 = tmp;
			}
			const c02 = compareFunc(v0, v2);
			if (c02 >= 0) {
				const tmp = v0;
				v0 = v2;
				v2 = v1;
				v1 = tmp;
			} else {
				const c12 = compareFunc(v1, v2);
				if (c12 > 0) {
					const tmp = v1;
					v1 = v2;
					v2 = tmp;
				}
			}
			a[from] = v0;
			a[to - 1] = v2;
			const pivot = v1;
			let low_end = from + 1; // Upper bound of elements lower than pivot.
			let high_start = to - 1; // Lower bound of elements greater than pivot.
			a[third_index] = a[low_end];
			a[low_end] = pivot;

			// From low_end to i are elements equal to pivot.
			// From i to high_start are elements that haven't been compared yet.
			partition: for (let i = low_end + 1; i < high_start; i++) {
				let element = a[i];
				let order = compareFunc(element, pivot);
				if (order < 0) {
					a[i] = a[low_end];
					a[low_end] = element;
					low_end++;
				} else if (order > 0) {
					do {
						high_start--;
						if (high_start == i) break partition;
						const top_elem = a[high_start];
						order = compareFunc(top_elem, pivot);
					} while (order > 0);
					a[i] = a[high_start];
					a[high_start] = element;
					if (order < 0) {
						element = a[i];
						a[i] = a[low_end];
						a[low_end] = element;
						low_end++;
					}
				}
			}
			if (to - high_start < low_end - from) {
				quickSort(a, high_start, to, compareFunc);
				to = low_end;
			} else {
				quickSort(a, from, low_end, compareFunc);
				from = high_start;
			}
		}
	}
	function insertionSort(a, from, to, compareFunc) {
		for (let i = from + 1; i < to; i++) {
			let j;
			const element = a[i];
			for (j = i - 1; j >= from; j--) {
				const tmp = a[j];
				const order = compareFunc(tmp, element);
				if (order > 0) {
					a[j + 1] = tmp;
				} else {
					break;
				}
			}
			a[j + 1] = element;
		}
	}

	/**
	 * RenderQueue is used to collect all renderable items, lights and skeletons from the scene.
	 * Renderable items will be dispatched to the corresponding RenderQueueLayer according to the object's renderLayer property.
	 */
	class RenderQueue {
		constructor() {
			this.layerMap = new Map();
			this.layerList = [];
			this.skeletons = new Set();

			// to optimize the performance of the next push, cache the last layer used
			this._lastLayer = this.createLayer(0);
		}
		begin() {
			for (let i = 0, l = this.layerList.length; i < l; i++) {
				this.layerList[i].begin();
			}
			this.skeletons.clear();
		}
		end() {
			for (let i = 0, l = this.layerList.length; i < l; i++) {
				this.layerList[i].end();
				this.layerList[i].sort();
			}
		}
		push(object, camera) {
			// collect skeleton if exists
			if (object.skeleton) {
				this.skeletons.add(object.skeleton);
			}
			_vec4.setFromMatrixPosition(object.worldMatrix).applyMatrix4(camera.projectionViewMatrix);
			const clipZ = _vec4.z;
			const layerId = object.renderLayer || 0;
			let layer = this._lastLayer;
			if (layer.id !== layerId) {
				layer = this.layerMap.get(layerId);
				if (!layer) {
					layer = this.createLayer(layerId);
				}
				this._lastLayer = layer;
			}
			if (Array.isArray(object.material)) {
				const groups = object.geometry.groups;
				for (let i = 0; i < groups.length; i++) {
					const group = groups[i];
					const groupMaterial = object.material[group.materialIndex];
					if (groupMaterial) {
						layer.addRenderable(object, object.geometry, groupMaterial, clipZ, group);
					}
				}
			} else {
				layer.addRenderable(object, object.geometry, object.material, clipZ);
			}
		}

		/**
		 * Set a render queue layer.
		 * @param {number} id - The layer id.
		 * @param {RenderQueueLayer} layer - The layer to set.
		 */
		setLayer(id, layer) {
			this.layerMap.set(id, layer);
			this.layerList.push(layer);
			this.layerList.sort(sortLayer);
		}

		/**
		 * Create and set a render queue layer.
		 * @param {number} id - The layer id.
		 * @returns {RenderQueueLayer}
		 */
		createLayer(id) {
			const layer = new RenderQueueLayer(id);
			this.setLayer(id, layer);
			return layer;
		}

		/**
		 * Get the render queue layer.
		 * @param {number} id - The layer id.
		 * @returns {RenderQueueLayer}
		 */
		getLayer(id) {
			return this.layerMap.get(id);
		}

		/**
		 * Remove the render queue layer.
		 * @param {number} id - The layer id.
		 */
		removeLayer(id) {
			const layer = this.layerMap.get(id);
			if (layer) {
				this.layerMap.delete(id);
				const index = this.layerList.indexOf(layer);
				if (index !== -1) {
					this.layerList.splice(index, 1);
				}
				if (this._lastLayer === id) {
					this._lastLayer = null;
				}
			}
		}
	}
	const _vec4 = new Vector4();
	function sortLayer(a, b) {
		return a.id - b.id;
	}

	/**
	 * RenderCollector traverses the scene graph and collects all necessary rendering information.
	 * It manages scene data, lighting data, and per-camera render states/queues.
	 */
	class RenderCollector {
		/**
		 * Creates a new RenderCollector instance.
		 * In most cases, RenderCollector does not need to be created manually,
		 * as Scene will automatically create one. See {@link Scene#collector}.
		 */
		constructor() {
			// collects scene and lighting data for single scene

			this.sceneData = new SceneData();
			this.lightingData = new LightingData();

			// collects render states and render queues for each camera

			this._renderStatesMap = new WeakMap();
			this._renderQueueMap = new WeakMap();

			// internal states

			this._lightingNeedsUpdate = true;
			this._skeletonVersion = 1;
			const _boundingSphere = new Sphere();

			/**
			 * Visibility checking function called during scene traversal.
			 * Determines whether an object should be included in the render queue.
			 * Can be overridden to implement custom culling logic (LOD, distance, etc.).
			 * @param {Object3D} object - The object to test for visibility.
			 * @param {Camera} camera - The camera to test against.
			 * @returns {boolean} True if the object should be rendered, false to cull it.
			 * @type {Function}
			 * @example
			 * // Custom visibility check that always returns true
			 * collector.checkVisibility = function(object, camera) {
			 *		 return true;
			 * };
			 */
			this.checkVisibility = function (object, camera) {
				if (!object.renderable) {
					return false;
				}
				if (!object.frustumCulled || !camera.frustumCulled) {
					return true;
				}
				_boundingSphere.copy(object.geometry.boundingSphere).applyMatrix4(object.worldMatrix);
				return camera.frustum.intersectsSphere(_boundingSphere);
			};
		}

		/**
		 * Setting this property to `true` indicates the lighting data needs to be updated.
		 * Lighting data updates are triggered by the {@link RenderCollector#traverseAndCollect} method.
		 * @type {boolean}
		 * @default false
		 * @param {boolean} value
		 */
		set lightingNeedsUpdate(value) {
			if (value) {
				this._lightingNeedsUpdate = true;
			}
		}

		/**
		 * Setting this property to `true` indicates all skeletons in the scene should be updated.
		 * Skeleton updates are triggered by the {@link RenderCollector#traverseAndCollect} method.
		 * @type {boolean}
		 * @default false
		 * @param {boolean} value
		 */
		set skeletonNeedsUpdate(value) {
			if (value) {
				this._skeletonVersion++;
			}
		}

		/**
		 * Get the RenderStates for the scene and camera.
		 * If the RenderStates for the camera does not exist, it will be created.
		 * @param {Camera} camera - The render camera.
		 * @returns {RenderStates} The target render states.
		 */
		getRenderStates(camera) {
			let renderStates = this._renderStatesMap.get(camera);
			if (!renderStates) {
				// every camera has its own RenderStates
				// but they share the same scene and lighting data
				renderStates = new RenderStates(this.sceneData, this.lightingData);
				this._renderStatesMap.set(camera, renderStates);
			}
			return renderStates;
		}

		/**
		 * Get the RenderQueue for the scene and camera.
		 * If the RenderQueue for the camera does not exist, it will be created.
		 * @param {Camera} camera - The render camera.
		 * @returns {RenderQueue} The target render queue.
		 */
		getRenderQueue(camera) {
			let renderQueue = this._renderQueueMap.get(camera);
			if (!renderQueue) {
				renderQueue = new RenderQueue();
				this._renderQueueMap.set(camera, renderQueue);
			}
			return renderQueue;
		}

		/**
		 * Traverse the scene and collect all renderable objects, lights and skeletons.
		 * This method will update the RenderQueue and RenderStates for the camera.
		 * @param {Scene} scene - The scene to traverse.
		 * @param {Camera} camera - The camera to collect renderable objects for.
		 * @returns {RenderQueue} The collected render queue.
		 */
		traverseAndCollect(scene, camera) {
			const sceneData = this.sceneData;
			const lightingData = this.lightingData;
			const lightingNeedsUpdate = this._lightingNeedsUpdate;
			const renderQueue = this.getRenderQueue(camera);
			if (lightingNeedsUpdate) {
				lightingData.begin();
			}
			renderQueue.begin();
			this._traverseAndCollect(scene, camera, renderQueue);
			renderQueue.end();
			if (lightingNeedsUpdate) {
				lightingData.end(sceneData);
				this._lightingNeedsUpdate = false;
			}

			// Since skeletons may be referenced by different mesh,
			// it is necessary to collect skeletons in the scene in order to avoid repeated updates.
			// For IOS platform, we should try to avoid repeated texture updates within one frame,
			// otherwise the performance will be seriously degraded.
			const skeletonVersion = this._skeletonVersion;
			for (const skeleton of _skeletons) {
				// Skeleton version ensures uncollected skeletons will be updated in subsequent frames
				if (skeleton._version !== skeletonVersion) {
					skeleton.updateBones(sceneData);
					skeleton._version = skeletonVersion;
				}
			}
			_skeletons.clear();
			return renderQueue;
		}
		_traverseAndCollect(object, camera, renderQueue) {
			if (!object.visible) {
				return;
			}
			if (object.isMesh) {
				if (this.checkVisibility(object, camera)) {
					renderQueue.push(object, camera);
					if (object.skeleton) {
						_skeletons.add(object.skeleton);
					}
				}
			} else if (object.isLight) {
				this.lightingData.collect(object);
			}
			const children = object.children;
			for (let i = 0, l = children.length; i < l; i++) {
				this._traverseAndCollect(children[i], camera, renderQueue);
			}
		}
	}
	const _skeletons = new Set();

	/**
	 * Scenes allow you to set up what and where is to be rendered,
	 * this is where you place objects, lights and cameras.
	 * @extends Object3D
	 */
	class Scene extends Object3D {
		/**
		 * Create a scene.
		 */
		constructor() {
			super();

			/**
			 * A {@link Fog} instance defining the type of fog that affects everything rendered in the scene.
			 * @type {Fog}
			 * @default null
			 */
			this.fog = null;

			/**
			 * Sets the environment map for all materials in the scene.
			 * However, it's not possible to overwrite an existing texture assigned to Material.envMap.
			 * @type {TextureCube | null}
			 * @default null
			 */
			this.environment = null;

			/**
			 * The diffuse intensity of the environment map.
			 * @type {number}
			 * @default 1
			 */
			this.envDiffuseIntensity = 1;

			/**
			 * The specular intensity of the environment map.
			 * This value is multiplied with the envMapIntensity of the material to get the final intensity.
			 * @type {number}
			 * @default 1
			 */
			this.envSpecularIntensity = 1;

			/**
			 * User-defined clipping planes specified as {@link Plane} objects in world space.
			 * These planes apply to the scene.
			 * Points in space whose dot product with the plane is negative are cut away.
			 * @type {Plane[]}
			 * @default []
			 */
			this.clippingPlanes = [];

			/**
			 * Defines whether disable shadow sampler feature.
			 * Shader with sampler2DShadow uniforms may cause unknown error on some android phones, set disableShadowSampler to true to avoid these bugs.
			 * When this property is set to true, soft shadow types will fallback to POISSON_SOFT without warning.
			 * @type {boolean}
			 * @default false
			 */
			this.disableShadowSampler = false;

			/**
			 * whether to use a logarithmic depth buffer. It may be neccesary to use this if dealing with huge differences in scale in a single scene.
			 * Note that this setting uses gl_FragDepth if available which disables the Early Fragment Test optimization and can cause a decrease in performance.
			 * @type {boolean}
			 * @default false
			 */
			this.logarithmicDepthBuffer = false;

			/**
			 * The anchor matrix of the world coordinate system.
			 * If it is not an identity matrix, the actual lighting calculating and the world position in the shader, will be in the anchor coordinate system.
			 * By setting this property, you can solve the floating point precision problem caused by the rendering object far away from the origin of the world coordinate system.
			 * In addition, by setting the rotation, it can also repair the direction of the reflection.
			 * @type {Matrix4}
			 */
			this.anchorMatrix = new Matrix4();

			/**
			 * A {@link RenderCollector} instance for this scene.
			 * @type {RenderCollector}
			 */
			this.collector = new RenderCollector();
		}

		/**
		 * The maximum number of lighting groups.
		 * @type {number}
		 * @default 1
		 */
		set maxLightingGroups(value) {
			this.collector.lightingData.setMaxGroupCount(value);
		}
		get maxLightingGroups() {
			return this.collector.lightingData.groupList.length;
		}

		/**
		 * Get {@link RenderStates} for the scene and camera.
		 * The RenderStates will be updated by calling {@link Scene#updateRenderStates}.
		 * The light data in RenderStates will be empty unless calling {@link Scene#updateRenderQueue}.
		 * @param {Camera} camera - The camera.
		 * @returns {RenderQueue} - The target render queue.
		 */
		getRenderStates(camera) {
			return this.collector.getRenderStates(camera);
		}

		/**
		 * Get {@link RenderQueue} for the scene and camera.
		 * The RenderQueue will be updated by calling {@link Scene#updateRenderQueue}.
		 * @param {Camera} camera - The camera.
		 * @returns {RenderQueue} - The target render queue.
		 */
		getRenderQueue(camera) {
			return this.collector.getRenderQueue(camera);
		}

		/**
		 * Update {@link RenderStates} for the scene and camera.
		 * The lighting data in RenderStates will be empty unless calling {@link Scene#updateRenderQueue}.
		 * @param {Camera} camera - The camera.
		 * @param {boolean} [updateScene=true] - Whether to update scene data.
		 * @returns {RenderStates} - The result render states.
		 */
		updateRenderStates(camera, updateScene = true) {
			const collector = this.collector;
			if (updateScene) {
				collector.sceneData.update(this);
			}
			const renderStates = collector.getRenderStates(camera);
			renderStates.updateCamera(camera);
			return renderStates;
		}

		/**
		 * Update {@link RenderQueue} for the scene and camera.
		 * Collect all visible meshes (and lights) from scene graph, and push meshes to render queue.
		 * Light data will be stored in RenderStates.
		 * @param {Camera} camera - The camera.
		 * @param {boolean} [collectLights=true] - Whether to collect light data.
		 * @param {boolean} [updateSkeletons=true] - Whether to update skeletons.
		 * @returns {RenderQueue} - The result render queue.
		 */
		updateRenderQueue(camera, collectLights = true, updateSkeletons = true) {
			const collector = this.collector;
			collector.lightingNeedsUpdate = collectLights;
			collector.skeletonNeedsUpdate = updateSkeletons;
			return collector.traverseAndCollect(this, camera);
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Scene.prototype.isScene = true;

	/**
	 * The camera used for rendering a 3D scene.
	 * The camera's direction is defined as the 3-vector (0.0, 0,0, -1.0), that is, an untransformed camera points down the -Z axis.
	 * @extends Object3D
	 */
	class Camera extends Object3D {
		/**
		 * Create a camera.
		 */
		constructor() {
			super();

			/**
			 * This is the inverse of worldMatrix.
			 * The matrix may be different from the value passed in the shader, scene.anchorMatrix is not considered here.
			 * @type {Matrix4}
			 */
			this.viewMatrix = new Matrix4();

			/**
			 * This is the matrix which contains the projection.
			 * @type {Matrix4}
			 */
			this.projectionMatrix = new Matrix4();

			/**
			 * This is the matrix which contains the projection.
			 * @type {Matrix4}
			 */
			this.projectionMatrixInverse = new Matrix4();

			/**
			 * This is the matrix which contains the projection and view matrix.
			 * The matrix may be different from the value passed in the shader, scene.anchorMatrix is not considered here.
			 * @type {Matrix4}
			 */
			this.projectionViewMatrix = new Matrix4();

			/**
			 * The frustum of the camera.
			 * @type {Frustum}
			 */
			this.frustum = new Frustum();

			/**
			 * The factor of gamma.
			 * @type {number}
			 * @default 2.0
			 */
			this.gammaFactor = 2.0;

			/**
			 * Output pixel encoding.
			 * @type {TEXEL_ENCODING_TYPE}
			 * @default TEXEL_ENCODING_TYPE.LINEAR
			 */
			this.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;

			/**
			 * Where on the screen is the camera rendered in normalized coordinates.
			 * The values in rect range from zero (left/bottom) to one (right/top).
			 * @type {Vector4}
			 * @default Vector4(0, 0, 1, 1)
			 */
			this.rect = new Vector4(0, 0, 1, 1);

			/**
			 * When this is set, it checks every frame if objects are in the frustum of the camera before rendering objects.
			 * Otherwise objects gets rendered every frame even if it isn't visible.
			 * @type {boolean}
			 * @default true
			 */
			this.frustumCulled = true;
		}

		/**
		 * Set view by look at, this func will set quaternion of this camera.
		 * @param {Vector3} target - The target that the camera look at.
		 * @param {Vector3} up - The up direction of the camera.
		 */
		lookAt(target, up) {
			_mat4_1.lookAtRH(this.position, target, up);
			this.quaternion.setFromRotationMatrix(_mat4_1);
		}

		/**
		 * Set orthographic projection matrix.
		 * @param {number} left — Camera frustum left plane.
		 * @param {number} right — Camera frustum right plane.
		 * @param {number} bottom — Camera frustum bottom plane.
		 * @param {number} top — Camera frustum top plane.
		 * @param {number} near — Camera frustum near plane.
		 * @param {number} far — Camera frustum far plane.
		 */
		setOrtho(left, right, bottom, top, near, far) {
			this.projectionMatrix.set(2 / (right - left), 0, 0, -(right + left) / (right - left), 0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom), 0, 0, -2 / (far - near), -(far + near) / (far - near), 0, 0, 0, 1);
			this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
		}

		/**
		 * Set perspective projection matrix.
		 * @param {number} fov — Camera frustum vertical field of view.
		 * @param {number} aspect — Camera frustum aspect ratio.
		 * @param {number} near — Camera frustum near plane.
		 * @param {number} far — Camera frustum far plane.
		 */
		setPerspective(fov, aspect, near, far) {
			this.projectionMatrix.set(1 / (aspect * Math.tan(fov / 2)), 0, 0, 0, 0, 1 / Math.tan(fov / 2), 0, 0, 0, 0, -(far + near) / (far - near), -2 * far * near / (far - near), 0, 0, -1, 0);
			this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
		}
		getWorldDirection(optionalTarget = new Vector3()) {
			return super.getWorldDirection(optionalTarget).negate();
		}
		updateMatrix(force) {
			Object3D.prototype.updateMatrix.call(this, force);
			this.viewMatrix.copy(this.worldMatrix).invert(); // update view matrix

			this.projectionViewMatrix.multiplyMatrices(this.projectionMatrix, this.viewMatrix); // get PV matrix
			this.frustum.setFromMatrix(this.projectionViewMatrix); // update frustum
		}
		copy(source, recursive) {
			Object3D.prototype.copy.call(this, source, recursive);
			this.viewMatrix.copy(source.viewMatrix);
			this.projectionMatrix.copy(source.projectionMatrix);
			this.projectionMatrixInverse.copy(source.projectionMatrixInverse);
			this.frustum.copy(source.frustum);
			this.gammaFactor = source.gammaFactor;
			this.outputEncoding = source.outputEncoding;
			this.rect.copy(source.rect);
			this.frustumCulled = source.frustumCulled;
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Camera.prototype.isCamera = true;
	const _mat4_1 = new Matrix4();

	const _sphere = new Sphere();
	const _inverseMatrix = new Matrix4();
	const _ray = new Ray();
	const _barycoord = new Vector3();
	const _vA = new Vector3();
	const _vB = new Vector3();
	const _vC = new Vector3();
	const _tempA = new Vector3();
	const _morphA = new Vector3();
	const _uvA = new Vector2();
	const _uvB = new Vector2();
	const _uvC = new Vector2();
	const _intersectionPoint = new Vector3();
	const _intersectionPointWorld = new Vector3();

	/**
	 * Class representing triangular polygon mesh based objects.
	 * Also serves as a base for other classes such as {@link SkinnedMesh}.
	 * @extends Object3D
	 */
	class Mesh extends Object3D {
		/**
		 * @param {Geometry} geometry — an instance of {@link Geometry}.
		 * @param {Material} material - a single or an array of {@link Material}.
		 */
		constructor(geometry, material) {
			super();

			/**
			 * an instance of {@link Geometry}.
			 * @type {Geometry}
			 */
			this.geometry = geometry;

			/**
			 * a single or an array of {@link Material}.
			 * @type {Material|Material[]}
			 */
			this.material = material;

			/**
			 * An array of weights typically from 0-1 that specify how much of the morph is applied.
			 * @type {number[] | null}
			 * @default null
			 */
			this.morphTargetInfluences = null;
		}

		/**
		 * Get the local-space position of the vertex at the given index,
		 * taking into account the current animation state of both morph targets and skinning.
		 * @param {number} index - The index of the vertex.
		 * @param {Vector3} target - The target vector.
		 * @returns {Vector3} The target vector.
		 */
		getVertexPosition(index, target) {
			const geometry = this.geometry;
			const position = geometry.getAttribute('a_Position');
			const morphPosition = geometry.morphAttributes.position;
			target.fromArray(position.buffer.array, index * position.buffer.stride + position.offset);
			const morphInfluences = this.morphTargetInfluences;
			if (morphPosition && morphInfluences) {
				_morphA.set(0, 0, 0);
				for (let i = 0, il = morphPosition.length; i < il; i++) {
					const influence = morphInfluences[i];
					const morphAttribute = morphPosition[i];
					if (influence === 0) continue;
					_tempA.fromArray(morphAttribute.buffer.array, index * morphAttribute.buffer.stride + morphAttribute.offset);
					_morphA.addScaledVector(_tempA, influence);
				}
				target.add(_morphA);
			}
			return target;
		}
		raycast(ray, intersects) {
			const geometry = this.geometry;
			const material = this.material;
			const worldMatrix = this.worldMatrix;
			_sphere.copy(geometry.boundingSphere);
			_sphere.applyMatrix4(worldMatrix);
			if (!ray.intersectsSphere(_sphere)) {
				return;
			}
			_inverseMatrix.copy(worldMatrix).invert();
			_ray.copy(ray).applyMatrix4(_inverseMatrix);
			if (!_ray.intersectsBox(geometry.boundingBox)) {
				return;
			}
			const position = geometry.getAttribute('a_Position');
			if (!position) {
				return;
			}
			const uv = geometry.getAttribute('a_Uv');
			const groups = geometry.groups;
			let intersection;
			if (geometry.index) {
				const index = geometry.index.buffer.array;
				if (Array.isArray(material)) {
					for (let i = 0, il = groups.length; i < il; i++) {
						const group = groups[i];
						const groupMaterial = material[group.materialIndex];
						const start = group.start;
						const end = Math.min(index.length, group.start + group.count);
						for (let j = start, jl = end; j < jl; j += 3) {
							const a = index[j];
							const b = index[j + 1];
							const c = index[j + 2];
							intersection = checkGeometryIntersection(this, groupMaterial, ray, _ray, uv, a, b, c);
							if (intersection) {
								intersection.faceIndex = Math.floor(i / 3);
								intersection.face.materialIndex = group.materialIndex;
								intersects.push(intersection);
							}
						}
					}
				} else {
					for (let i = 0, il = index.length; i < il; i += 3) {
						const a = index[i];
						const b = index[i + 1];
						const c = index[i + 2];
						intersection = checkGeometryIntersection(this, material, ray, _ray, uv, a, b, c);
						if (intersection) {
							intersection.faceIndex = Math.floor(i / 3);
							intersects.push(intersection);
						}
					}
				}
			} else {
				if (Array.isArray(material)) {
					for (let i = 0, il = groups.length; i < il; i++) {
						const group = groups[i];
						const groupMaterial = material[group.materialIndex];
						const start = group.start;
						const end = Math.min(position.buffer.count, group.start + group.count);
						for (let j = start, jl = end; j < jl; j += 3) {
							const a = j;
							const b = j + 1;
							const c = j + 2;
							intersection = checkGeometryIntersection(this, groupMaterial, ray, _ray, uv, a, b, c);
							if (intersection) {
								intersection.faceIndex = Math.floor(i / 3);
								intersection.face.materialIndex = group.materialIndex;
								intersects.push(intersection);
							}
						}
					}
				} else {
					for (let i = 0, il = position.buffer.count; i < il; i += 3) {
						const a = i;
						const b = i + 1;
						const c = i + 2;
						intersection = checkGeometryIntersection(this, material, ray, _ray, uv, a, b, c);
						if (intersection) {
							intersection.faceIndex = Math.floor(i / 3);
							intersects.push(intersection);
						}
					}
				}
			}
		}
		copy(source) {
			super.copy(source);
			if (source.morphTargetInfluences) {
				this.morphTargetInfluences = source.morphTargetInfluences.slice();
			}
			return this;
		}
		clone() {
			return new this.constructor(this.geometry, this.material).copy(this);
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Mesh.prototype.isMesh = true;
	function checkGeometryIntersection(object, material, ray, _ray, uv, a, b, c) {
		object.getVertexPosition(a, _vA);
		object.getVertexPosition(b, _vB);
		object.getVertexPosition(c, _vC);
		const intersection = checkIntersection(object, material, ray, _ray, _vA, _vB, _vC, _intersectionPoint);
		if (intersection) {
			let array;
			let bufferStride;
			let attributeOffset;
			if (uv) {
				array = uv.buffer.array;
				bufferStride = uv.buffer.stride;
				attributeOffset = uv.offset;
				_uvA.fromArray(array, a * bufferStride + attributeOffset);
				_uvB.fromArray(array, b * bufferStride + attributeOffset);
				_uvC.fromArray(array, c * bufferStride + attributeOffset);
				intersection.uv = uvIntersection(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC);
			}
			const face = {
				a: a,
				b: b,
				c: c,
				normal: new Vector3()
			};
			Triangle.normal(_vA, _vB, _vC, face.normal);
			intersection.face = face;
		}
		return intersection;
	}
	function uvIntersection(point, p1, p2, p3, uv1, uv2, uv3) {
		Triangle.barycoordFromPoint(point, p1, p2, p3, _barycoord);
		uv1.multiplyScalar(_barycoord.x);
		uv2.multiplyScalar(_barycoord.y);
		uv3.multiplyScalar(_barycoord.z);
		uv1.add(uv2).add(uv3);
		return uv1.clone();
	}
	function checkIntersection(object, material, ray, localRay, pA, pB, pC, point) {
		let intersect;
		if (material.side === DRAW_SIDE.BACK) {
			intersect = localRay.intersectTriangle(pC, pB, pA, true, point);
		} else {
			intersect = localRay.intersectTriangle(pA, pB, pC, material.side !== DRAW_SIDE.DOUBLE, point);
		}
		if (intersect === null) return null;
		_intersectionPointWorld.copy(point);
		_intersectionPointWorld.applyMatrix4(object.worldMatrix);
		const distance = ray.origin.distanceTo(_intersectionPointWorld);
		return {
			distance: distance,
			point: _intersectionPointWorld.clone(),
			object: object
		};
	}

	/**
	 * The Attribute add structural information to Buffer.
	 * This class stores data for an attribute (such as vertex positions, face indices, normals, colors, UVs, and any custom attributes ) associated with a Geometry, which allows for more efficient passing of data to the GPU.
	 * Data is stored as vectors of any length (defined by size).
	 */
	class Attribute {
		/**
		 * @param {Buffer} buffer - The Buffer instance passed in the constructor.
		 * @param {number} [size=buffer.stride] - The number of values of the array that should be associated with a particular vertex. For instance, if this attribute is storing a 3-component vector (such as a position, normal, or color), then size should be 3.
		 * @param {number} [offset=0] - The offset in the underlying array buffer where an item starts.
		 * @param {boolean} [normalized=false] - Indicates how the underlying data in the buffer maps to the values in the GLSL shader code.
		 */
		constructor(buffer, size = buffer.stride, offset = 0, normalized = false) {
			/**
			 * The Buffer instance passed in the constructor.
			 * @type {Buffer}
			 */
			this.buffer = buffer;

			/**
			 * The number of values of the buffer that should be associated with the attribute.
			 * @type {number}
			 * @default buffer.stride
			 */
			this.size = size;

			/**
			 * The offset in the underlying buffer where an item starts.
			 * @type {number}
			 * @default 0
			 */
			this.offset = offset;

			/**
			 * Indicates how the underlying data in the buffer maps to the values in the GLSL shader code.
			 * @type {boolean}
			 * @default false
			 */
			this.normalized = normalized;

			/**
			 * Instance cadence, the number of instances drawn for each vertex in the buffer, non-instance attributes must be 0.
			 * @type {number}
			 * @default 0
			 */
			this.divisor = 0;
		}

		/**
		 * Copy the parameters from the passed attribute.
		 * @param {Attribute} source - The attribute to be copied.
		 * @returns {Attribute}
		 */
		copy(source) {
			this.buffer = source.buffer;
			this.size = source.size;
			this.offset = source.offset;
			this.normalized = source.normalized;
			this.divisor = source.divisor;
			return this;
		}

		/**
		 * Return a new attribute with the same parameters as this attribute.
		 * @param {object} buffers - A WeakMap to save shared buffers.
		 * @returns {Attribute}
		 */
		clone(buffers) {
			let attribute;
			if (!buffers) {
				console.warn('Attribute.clone(): now requires a WeakMap as an argument to save shared buffers.');
				attribute = new Attribute(this.buffer.clone(), this.size, this.offset, this.normalized);
				attribute.divisor = this.divisor;
				return attribute;
			}
			if (!buffers.has(this.buffer)) {
				buffers.set(this.buffer, this.buffer.clone());
			}
			attribute = new Attribute(buffers.get(this.buffer), this.size, this.offset, this.normalized);
			attribute.divisor = this.divisor;
			return attribute;
		}
	}

	/**
	 * The Buffer contain the data that is used for the geometry of 3D models, animations, and skinning.
	 */
	class Buffer {
		/**
		 * @param {TypedArray} array -- A typed array with a shared buffer. Stores the geometry data.
		 * @param {number} stride -- The number of typed-array elements per vertex.
		 */
		constructor(array, stride) {
			/**
			 * A typed array with a shared buffer.
			 * Stores the geometry data.
			 * @type {TypedArray}
			 */
			this.array = array;

			/**
			 * The number of typed-array elements per vertex.
			 * @type {number}
			 */
			this.stride = stride;

			/**
			 * Gives the total number of elements in the array.
			 * @type {number}
			 */
			this.count = array !== undefined ? array.length / stride : 0;

			/**
			 * Defines the intended usage pattern of the data store for optimization purposes.
			 * Corresponds to the usage parameter of WebGLRenderingContext.bufferData().
			 * @type {BUFFER_USAGE}
			 * @default BUFFER_USAGE.STATIC_DRAW
			 */
			this.usage = BUFFER_USAGE.STATIC_DRAW;

			/**
			 * Object containing offset and count.
			 * @type {object}
			 * @default { offset: 0, count: - 1 }
			 */
			this.updateRange = {
				offset: 0,
				count: -1
			};

			/**
			 * A version number, incremented every time the data is changed.
			 * @type {number}
			 * @default 0
			 */
			this.version = 0;
		}

		/**
		 * A callback function that is executed after the Renderer has transferred the attribute array data to the GPU.
		 */
		onUploadCallback() {}

		/**
		 * Copies another Buffer to this Buffer.
		 * @param {Buffer} source - The buffer to be copied.
		 * @returns {Buffer}
		 */
		copy(source) {
			this.array = new source.array.constructor(source.array);
			this.stride = source.stride;
			this.count = source.array.length / this.stride;
			this.usage = source.usage;
			return this;
		}

		/**
		 * Return a copy of this buffer.
		 * @returns {Buffer}
		 */
		clone() {
			const array = new this.array.constructor(this.array);
			const ib = new Buffer(array, this.stride);
			ib.usage = this.usage;
			return ib;
		}
	}

	let _geometryId = 0;
	const _vector$1 = new Vector3();
	const _offset = new Vector3();
	const _sum = new Vector3();
	const _box3 = new Box3();
	const _boxMorphTargets = new Box3();

	/**
	 * An efficient representation of mesh, line, or point geometry.
	 * Includes vertex positions, face indices, normals, colors, UVs, and custom attributes within buffers, reducing the cost of passing all this data to the GPU.
	 * To read and edit data in {@link Geometry#attributes}.
	 * @extends EventDispatcher
	 */
	class Geometry extends EventDispatcher {
		/**
		 * Create a geometry.
		 */
		constructor() {
			super();

			/**
			 * Unique number for this geometry instance.
			 * @readonly
			 * @type {number}
			 */
			this.id = _geometryId++;

			/**
			 * UUID of this geometry instance.
			 * This gets automatically assigned, so this shouldn't be edited.
			 * @readonly
			 * @type {string}
			 */
			this.uuid = MathUtils.generateUUID();

			/**
			 * This hashmap has as id the name of the attribute to be set and as value the buffer to set it to.
			 * Rather than accessing this property directly, use {@link Geometry#addAttribute} and {@link Geometry#getAttribute} to access attributes of this geometry.
			 * @type {object}
			 */
			this.attributes = {};

			/**
			 * Hashmap of Attributes Array for morph targets.
			 * @type {object}
			 */
			this.morphAttributes = {};

			/**
			 * Allows for vertices to be re-used across multiple triangles; this is called using "indexed triangles" and each triangle is associated with the indices of three vertices.
			 * This attribute therefore stores the index of each vertex for each triangular face.
			 * If this attribute is not set, the renderer assumes that each three contiguous positions represent a single triangle.
			 * @type {Attribute | null}
			 */
			this.index = null;

			/**
			 * Bounding box for the bufferGeometry, which can be calculated with {@link Geometry#computeBoundingBox}.
			 * @type {Box3}
			 * @default Box3()
			 */
			this.boundingBox = new Box3();

			/**
			 * Bounding sphere for the bufferGeometry, which can be calculated with {@link Geometry#computeBoundingSphere}.
			 * @type {Sphere}
			 * @default Sphere()
			 */
			this.boundingSphere = new Sphere();

			/**
			 * Split the geometry into groups, each of which will be rendered in a separate WebGL draw call. This allows an array of materials to be used with the geometry.
			 * Each group is an object of the form: { start: Integer, count: Integer, materialIndex: Integer },
			 * or { multiDrawStarts: Integer[], multiDrawCounts: Integer[], multiDrawCount: Integer, materialIndex: Integer } if multiDraw is available.
			 * @type {Array}
			 * @default []
			 */
			this.groups = [];

			/**
			 * The number of instances to be rendered. If set to -1 (default), instanced rendering is disabled.
			 * This property is used for instanced rendering, where multiple copies of the geometry
			 * are drawn with a single draw call.
			 * @type {number}
			 * @default -1
			 */
			this.instanceCount = -1;

			/**
			 * A version number, incremented every time the attribute object or index object changes to mark VAO drity.
			 * @type {number}
			 * @default 0
			 */
			this.version = 0;
		}

		/**
		 * Adds an attribute to this geometry.
		 * Use this rather than the attributes property.
		 * @param {string} name
		 * @param {Attribute} attribute
		 */
		addAttribute(name, attribute) {
			this.attributes[name] = attribute;
		}

		/**
		 * Returns the attribute with the specified name.
		 * @param {string} name
		 * @returns {Attribute}
		 */
		getAttribute(name) {
			return this.attributes[name];
		}

		/**
		 * Removes the attribute with the specified name.
		 * @param {string} name
		 */
		removeAttribute(name) {
			delete this.attributes[name];
		}

		/**
		 * Set the {@link Geometry#index} buffer.
		 * @param {Array | Attribute | null} index
		 */
		setIndex(index) {
			if (Array.isArray(index)) {
				const typedArray = new (arrayMax(index) > 65535 ? Uint32Array : Uint16Array)(index);
				this.index = new Attribute(new Buffer(typedArray, 1));
			} else {
				this.index = index;
			}
		}

		/**
		 * Adds a group to this geometry; see the {@link Geometry#groups} for details.
		 * @param {number} start
		 * @param {number} count
		 * @param {number} [materialIndex=0]
		 */
		addGroup(start, count, materialIndex = 0) {
			this.groups.push({
				start: start,
				count: count,
				materialIndex: materialIndex
			});
		}

		/**
		 * Clears all groups.
		 */
		clearGroups() {
			this.groups = [];
		}

		/**
		 * Computes bounding box of the geometry, updating {@link Geometry#boundingBox}.
		 * Bounding boxes aren't computed by default. They need to be explicitly computed.
		 */
		computeBoundingBox() {
			const position = this.attributes['a_Position'] || this.attributes['position'];
			if (position) {
				this.boundingBox.setFromArray(position.buffer.array, position.buffer.stride, position.offset);
			}
			const morphAttributesPosition = this.morphAttributes.position;
			if (morphAttributesPosition) {
				for (let i = 0; i < morphAttributesPosition.length; i++) {
					const morphAttribute = morphAttributesPosition[i];
					_box3.setFromArray(morphAttribute.buffer.array, morphAttribute.buffer.stride, morphAttribute.offset);
					_vector$1.addVectors(this.boundingBox.min, _box3.min);
					this.boundingBox.expandByPoint(_vector$1);
					_vector$1.addVectors(this.boundingBox.max, _box3.max);
					this.boundingBox.expandByPoint(_vector$1);
				}
			}
		}

		/**
		 * Computes bounding sphere of the geometry, updating {@link Geometry#boundingSphere}.
		 * Bounding spheres aren't computed by default. They need to be explicitly computed.
		 */
		computeBoundingSphere() {
			const position = this.attributes['a_Position'] || this.attributes['position'];
			const morphAttributesPosition = this.morphAttributes.position;
			if (!position) {
				return;
			}
			const bufferStride = position.buffer.stride;
			const positionOffset = position.offset;
			if (morphAttributesPosition) {
				_box3.setFromArray(position.buffer.array, bufferStride, positionOffset);
				for (let i = 0; i < morphAttributesPosition.length; i++) {
					const morphAttribute = morphAttributesPosition[i];
					_boxMorphTargets.setFromArray(morphAttribute.buffer.array, morphAttribute.buffer.stride, morphAttribute.offset);
					_vector$1.addVectors(_box3.min, _boxMorphTargets.min);
					_box3.expandByPoint(_vector$1);
					_vector$1.addVectors(_box3.max, _boxMorphTargets.max);
					_box3.expandByPoint(_vector$1);
				}
				const center = this.boundingSphere.center;
				_box3.getCenter(center);
				let maxRadiusSq = 0;
				for (let i = 0; i < position.buffer.count; i++) {
					_offset.fromArray(position.buffer.array, i * bufferStride + positionOffset);
					maxRadiusSq = center.distanceToSquared(_offset);
					for (let j = 0; j < morphAttributesPosition.length; j++) {
						const morphAttribute = morphAttributesPosition[j];
						_vector$1.fromArray(morphAttribute.buffer.array, i * morphAttribute.buffer.stride + morphAttribute.offset);
						_sum.addVectors(_offset, _vector$1);
						const offsetLengthSq = center.distanceToSquared(_sum);

						// TODO The maximum radius cannot be obtained here
						if (offsetLengthSq > maxRadiusSq) {
							maxRadiusSq = offsetLengthSq;
							_offset.add(_vector$1);
						}
					}
				}
				this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
			} else {
				this.boundingSphere.setFromArray(position.buffer.array, bufferStride, positionOffset);
			}
		}

		/**
		 * Disposes the object from memory.
		 * You need to call this when you want the BufferGeometry removed while the application is running.
		 */
		dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		}

		/**
		 * Copies another Geometry to this Geometry.
		 * @param {Geometry} source - The geometry to be copied.
		 * @returns {Geometry}
		 */
		copy(source) {
			let name, i, l;

			// reset

			this.index = null;
			this.attributes = {};
			this.morphAttributes = {};
			this.groups = [];
			const buffers = new WeakMap(); // used for storing cloned, shared buffers

			// index

			const index = source.index;
			if (index !== null) {
				this.setIndex(index.clone(buffers));
			}

			// attributes

			const attributes = source.attributes;
			for (name in attributes) {
				const attribute = attributes[name];
				this.addAttribute(name, attribute.clone(buffers));
			}

			// morph attributes

			const morphAttributes = source.morphAttributes;
			for (name in morphAttributes) {
				const array = [];
				const morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

				for (i = 0, l = morphAttribute.length; i < l; i++) {
					array.push(morphAttribute[i].clone(buffers));
				}
				this.morphAttributes[name] = array;
			}

			// groups

			const groups = source.groups;
			for (i = 0, l = groups.length; i < l; i++) {
				const group = groups[i];
				this.addGroup(group.start, group.count, group.materialIndex);
			}

			// boundings
			this.boundingBox.copy(source.boundingBox);
			this.boundingSphere.copy(source.boundingSphere);

			// instance count
			this.instanceCount = source.instanceCount;
			return this;
		}

		/**
		 * Creates a clone of this Geometry.
		 * @returns {Geometry}
		 */
		clone() {
			return new Geometry().copy(this);
		}
	}
	function arrayMax(array) {
		if (array.length === 0) return -Infinity;
		let max = array[0];
		for (let i = 1, l = array.length; i < l; ++i) {
			if (array[i] > max) max = array[i];
		}
		return max;
	}

	/**
	 * A transform object for UV coordinates.
	 * @extends Matrix3
	 */
	class TransformUV extends Matrix3 {
		/**
		 * Create a new TransformUV object.
		 */
		constructor() {
			super();
			this.offset = new Vector2(0, 0);
			this.scale = new Vector2(1, 1);
			this.center = new Vector2(0, 0);
			this.rotation = 0;
			this.needsUpdate = false;
		}

		/**
		 * Update the matrix for UV transformation based on the offset, scale, rotation and center.
		 * If needsUpdate is false, this method will do nothing.
		 * @returns {TransformUV} This object.
		 */
		update() {
			if (!this.needsUpdate) return this;
			this.needsUpdate = false;
			this.updateMatrix();
			return this;
		}

		/**
		 * Update the matrix for UV transformation based on the offset, scale, rotation and center.
		 * This method will always update the matrix regardless of the needsUpdate flag.
		 * @returns {TransformUV} This object.
		 */
		updateMatrix() {
			return this.setUvTransform(this.offset.x, this.offset.y, this.scale.x, this.scale.y, this.rotation, this.center.x, this.center.y);
		}

		/**
		 * Copy the properties of another TransformUV object.
		 * @param {TransformUV|Matrix3} source - The object to copy the properties from.
		 * @returns {TransformUV} This object.
		 */
		copy(source) {
			super.copy(source);

			// in case source is only a Matrix3 object (without additional properties)
			if (!source.isTransformUV) return this;
			this.offset.copy(source.offset);
			this.scale.copy(source.scale);
			this.center.copy(source.center);
			this.rotation = source.rotation;
			this.needsUpdate = source.needsUpdate;
			return this;
		}

		/**
		 * Clone this TransformUV object.
		 * @returns {TransformUV} The cloned object.
		 */
		clone() {
			return new this.constructor().copy(this);
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	TransformUV.prototype.isTransformUV = true;

	let _materialId = 0;

	/**
	 * Abstract base class for materials.
	 * Materials describe the appearance of {@link Object3D}.
	 * They are defined in a (mostly) renderer-independent way, so you don't have to rewrite materials if you decide to use a different renderer.
	 * The following properties and methods are inherited by all other material types (although they may have different defaults).
	 * @abstract
	 * @extends EventDispatcher
	 */
	class Material extends EventDispatcher {
		constructor() {
			super();

			/**
			 * Unique number for this material instance.
			 * @readonly
			 * @type {number}
			 */
			this.id = _materialId++;

			/**
			 * UUID of this material instance.
			 * This gets automatically assigned, so this shouldn't be edited.
			 * @type {string}
			 */
			this.uuid = MathUtils.generateUUID();

			/**
			 * Type of the material.
			 * @type {MATERIAL_TYPE}
			 * @default MATERIAL_TYPE.SHADER
			 */
			this.type = MATERIAL_TYPE.SHADER;

			/**
			 * Custom shader name. This naming can help ShaderMaterial to optimize the length of the index hash string.
			 * It is valid only when the material type is MATERIAL_TYPE.SHADER.
			 * Otherwise, if the material is a built-in type, the name of the shader will always be equal to the material type.
			 * @type {string}
			 * @default ""
			 */
			this.shaderName = '';

			/**
			 * Custom defines of the shader.
			 * Only valid when the material type is MATERIAL_TYPE.SHADER.
			 * @type {object}
			 * @default {}
			 */
			this.defines = {};

			/**
			 * Custom uniforms of the shader.
			 * Only valid when the material type is MATERIAL_TYPE.SHADER.
			 * @type {object}
			 * @default {}
			 */
			this.uniforms = {};

			/**
			 * Custom GLSL code for vertex shader.
			 * Only valid when the material type is MATERIAL_TYPE.SHADER.
			 * @type {string}
			 * @default ""
			 */
			this.vertexShader = '';

			/**
			 * Custom GLSL code for fragment shader.
			 * Only valid when the material type is MATERIAL_TYPE.SHADER.
			 * @type {string}
			 * @default ""
			 */
			this.fragmentShader = '';

			/**
			 * Override the renderer's default precision for this material.
			 * Can be "highp", "mediump" or "lowp".
			 * @type {string}
			 * @default null
			 */
			this.precision = null;

			/**
			 * The bitmask of UV coordinate channels to use for the external texture.
			 * This will be combined with the internal UV coordinate mask collected from the renderer by default.
			 * Finally, it will be used to determine which UV coordinate attribute to use and to generate the shader code.
			 * @type {number}
			 * @default 0
			 */
			this.extUvCoordMask = 0;

			/**
			 * Defines whether this material is transparent.
			 * This has an effect on rendering as transparent objects need special treatment and are rendered after non-transparent objects.
			 * When set to true, the extent to which the material is transparent is controlled by setting it's blending property.
			 * @type {boolean}
			 * @default false
			 */
			this.transparent = false;

			/**
			 * Which blending to use when displaying objects with this material.
			 * This must be set to BLEND_TYPE.CUSTOM to use custom blendSrc, blendDst or blendEquation.
			 * @type {BLEND_TYPE}
			 * @default BLEND_TYPE.NORMAL
			 */
			this.blending = BLEND_TYPE.NORMAL;

			/**
			 * Blending source.
			 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {BLEND_FACTOR}
			 * @default BLEND_FACTOR.SRC_ALPHA
			 */
			this.blendSrc = BLEND_FACTOR.SRC_ALPHA;

			/**
			 * Blending destination.
			 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {BLEND_FACTOR}
			 * @default BLEND_FACTOR.ONE_MINUS_SRC_ALPHA
			 */
			this.blendDst = BLEND_FACTOR.ONE_MINUS_SRC_ALPHA;

			/**
			 * Blending equation to use when applying blending.
			 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {BLEND_EQUATION}
			 * @default BLEND_EQUATION.ADD
			 */
			this.blendEquation = BLEND_EQUATION.ADD;

			/**
			 * The transparency of the {@link Material#blendSrc}.
			 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {BLEND_FACTOR}
			 * @default null
			 */
			this.blendSrcAlpha = null;

			/**
			 * The transparency of the {@link Material#blendDst}.
			 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {BLEND_FACTOR}
			 * @default null
			 */
			this.blendDstAlpha = null;

			/**
			 * The tranparency of the {@link Material#blendEquation}.
			 * The {@link Material#blending} must be set to BLEND_TYPE.CUSTOM for this to have any effect.
			 * @type {BLEND_EQUATION}
			 * @default null
			 */
			this.blendEquationAlpha = null;

			/**
			 * Whether to premultiply the alpha (transparency) value.
			 * @type {boolean}
			 * @default false
			 */
			this.premultipliedAlpha = false;

			/**
			 * Defines whether vertex coloring is used.
			 * @type {VERTEX_COLOR}
			 * @default VERTEX_COLOR.NONE
			 */
			this.vertexColors = VERTEX_COLOR.NONE;

			/**
			 * Defines whether precomputed vertex tangents, which must be provided in a vec4 "tangent" attribute, are used.
			 * When disabled, tangents are derived automatically.
			 * Using precomputed tangents will give more accurate normal map details in some cases, such as with mirrored UVs.
			 * @type {boolean}
			 * @default false
			 */
			this.vertexTangents = false;

			/**
			 * Float in the range of 0.0 - 1.0 indicating how transparent the material is.
			 * A value of 0.0 indicates fully transparent, 1.0 is fully opaque.
			 * @type {number}
			 * @default 1
			 */
			this.opacity = 1;

			/**
			 * The diffuse color.
			 * @type {Color3}
			 * @default Color3(0xffffff)
			 */
			this.diffuse = new Color3(0xffffff);

			/**
			 * The diffuse map.
			 * @type {Texture2D}
			 * @default null
			 */
			this.diffuseMap = null;

			/**
			 * Define the UV chanel for the diffuse map to use starting from 0 and defaulting to 0.
			 * @type {number}
			 * @default 0
			 */
			this.diffuseMapCoord = 0;

			/**
			 * The uv-transform matrix of diffuse map.
			 * This will also affect other maps that cannot be individually specified uv transform, such as normalMap, bumpMap, etc.
			 * @type {TransformUV}
			 * @default TransformUV()
			 */
			this.diffuseMapTransform = new TransformUV();

			/**
			 * The alpha map.
			 * @type {Texture2D}
			 * @default null
			 */
			this.alphaMap = null;

			/**
			 * Define the UV chanel for the alpha map to use starting from 0 and defaulting to 0.
			 * @type {number}
			 * @default 0
			 */
			this.alphaMapCoord = 0;

			/**
			 * The uv-transform matrix of alpha map.
			 * @type {TransformUV}
			 * @default TransformUV()
			 */
			this.alphaMapTransform = new TransformUV();

			/**
			 * Emissive (light) color of the material, essentially a solid color unaffected by other lighting.
			 * @type {Color3}
			 * @default Color3(0x000000)
			 */
			this.emissive = new Color3(0x000000);

			/**
			 * Set emissive (glow) map.
			 * The emissive map color is modulated by the emissive color.
			 * If you have an emissive map, be sure to set the emissive color to something other than black.
			 * @type {Texture2D}
			 * @default null
			 */
			this.emissiveMap = null;

			/**
			 * Define the UV chanel for the emissive map to use starting from 0 and defaulting to 0.
			 * @type {number}
			 * @default 0
			 */
			this.emissiveMapCoord = 0;

			/**
			 * The uv-transform matrix of emissive map.
			 * @type {TransformUV}
			 * @default TransformUV()
			 */
			this.emissiveMapTransform = new TransformUV();

			/**
			 * The red channel of this texture is used as the ambient occlusion map.
			 * @type {Texture2D}
			 * @default null
			 */
			this.aoMap = null;

			/**
			 * Intensity of the ambient occlusion effect.
			 * @type {number}
			 * @default 1
			 */
			this.aoMapIntensity = 1.0;

			/**
			 * Define the UV chanel for the ao map to use starting from 0 and defaulting to 0.
			 * @type {number}
			 * @default 0
			 */
			this.aoMapCoord = 0;

			/**
			 * The uv-transform matrix of ao map.
			 * @type {TransformUV}
			 * @default TransformUV()
			 */
			this.aoMapTransform = new TransformUV();

			/**
			 * The normal map.
			 * @type {Texture2D}
			 * @default null
			 */
			this.normalMap = null;

			/**
			 * How much the normal map affects the material. Typical ranges are 0-1.
			 * @type {Vector2}
			 * @default Vector2(1,1)
			 */
			this.normalScale = new Vector2(1, 1);

			/**
			 * The texture to create a bump map.
			 * The black and white values map to the perceived depth in relation to the lights. Bump doesn't actually affect the geometry of the object, only the lighting.
			 * @type {Texture2D}
			 * @default null
			 */
			this.bumpMap = null;

			/**
			 * How much the bump map affects the material.
			 * Typical ranges are 0-1.
			 * @type {number}
			 * @default 1
			 */
			this.bumpScale = 1;

			/**
			 * The environment map.
			 * If set to undefined, then the material will not inherit envMap from scene.environment.
			 * @type {TextureCube|null|undefined}
			 * @default null
			 */
			this.envMap = null;

			/**
			 * Scales the effect of the environment map by multiplying its color.
			 * This can effect both the diffuse and specular components of environment map.
			 * @type {number}
			 * @default 1
			 */
			this.envMapIntensity = 1;

			/**
			 * How to combine the result of the surface's color with the environment map, if any.
			 * This has no effect in a {@link PBRMaterial}.
			 * @type {ENVMAP_COMBINE_TYPE}
			 * @default ENVMAP_COMBINE_TYPE.MULTIPLY
			 */
			this.envMapCombine = ENVMAP_COMBINE_TYPE.MULTIPLY;

			/**
			 * Which depth function to use. See the {@link COMPARE_FUNC} constants for all possible values.
			 * @type {COMPARE_FUNC}
			 * @default COMPARE_FUNC.LEQUAL
			 */
			this.depthFunc = COMPARE_FUNC.LEQUAL;

			/**
			 * Whether to have depth test enabled when rendering this material.
			 * @type {boolean}
			 * @default true
			 */
			this.depthTest = true;

			/**
			 * Whether rendering this material has any effect on the depth buffer.
			 * When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.
			 * @type {boolean}
			 * @default true
			 */
			this.depthWrite = true;

			/**
			 * Whether to render the material's color.
			 * This can be used in conjunction with a mesh's renderOrder property to create invisible objects that occlude other objects.
			 * @type {boolean}
			 * @default true
			 */
			this.colorWrite = true;

			/**
			 * Whether stencil operations are performed against the stencil buffer.
			 * In order to perform writes or comparisons against the stencil buffer this value must be true.
			 * @type {boolean}
			 * @default false
			 */
			this.stencilTest = false;

			/**
			 * The bit mask to use when writing to the stencil buffer.
			 * @type {number}
			 * @default 0xFF
			 */
			this.stencilWriteMask = 0xff;

			/**
			 * The stencil comparison function to use.
			 * See the {@link COMPARE_FUNC} constants for all possible values.
			 * @type {COMPARE_FUNC}
			 * @default COMPARE_FUNC.ALWAYS
			 */
			this.stencilFunc = COMPARE_FUNC.ALWAYS;

			/**
			 * The value to use when performing stencil comparisons or stencil operations.
			 * @type {number}
			 * @default 0
			 */
			this.stencilRef = 0;

			/**
			 * The bit mask to use when comparing against the stencil buffer.
			 * @type {number}
			 * @default 0xFF
			 */
			this.stencilFuncMask = 0xff;

			/**
			 * Which stencil operation to perform when the comparison function returns false.
			 * See the {@link OPERATION} constants for all possible values.
			 * @type {OPERATION}
			 * @default OPERATION.KEEP
			 */
			this.stencilFail = OPERATION.KEEP;

			/**
			 * Which stencil operation to perform when the comparison function returns true but the depth test fails.
			 * See the {@link OPERATION} constants for all possible values.
			 * @type {OPERATION}
			 * @default OPERATION.KEEP
			 */
			this.stencilZFail = OPERATION.KEEP;

			/**
			 * Which stencil operation to perform when the comparison function returns true and the depth test passes.
			 * See the {@link OPERATION} constants for all possible values.
			 * @type {OPERATION}
			 * @default OPERATION.KEEP
			 */
			this.stencilZPass = OPERATION.KEEP;

			/**
			 * The stencil comparison function to use.
			 * See the {@link COMPARE_FUNC} constants for all possible values.
			 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
			 * @type {COMPARE_FUNC|null}
			 * @default null
			 */
			this.stencilFuncBack = null;

			/**
			 * The value to use when performing stencil comparisons or stencil operations.
			 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
			 * @type {number | null}
			 * @default null
			 */
			this.stencilRefBack = null;

			/**
			 * The bit mask to use when comparing against the stencil buffer.
			 * You can explicitly specify the two-sided stencil function state by defining stencilFuncBack, stencilRefBack and stencilFuncMaskBack.
			 * @type {number | null}
			 * @default null
			 */
			this.stencilFuncMaskBack = null;

			/**
			 * Which stencil operation to perform when the comparison function returns false.
			 * See the {@link OPERATION} constants for all possible values.
			 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
			 * @type {OPERATION|null}
			 * @default null
			 */
			this.stencilFailBack = null;

			/**
			 * Which stencil operation to perform when the comparison function returns true but the depth test fails.
			 * See the {@link OPERATION} constants for all possible values.
			 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
			 * @type {OPERATION|null}
			 * @default null
			 */
			this.stencilZFailBack = null;

			/**
			 * Which stencil operation to perform when the comparison function returns true and the depth test passes.
			 * See the {@link OPERATION} constants for all possible values.
			 * You can explicitly specify the two-sided stencil op state by defining stencilFailBack, stencilZFailBack and stencilZPassBack.
			 * @type {OPERATION|null}
			 * @default null
			 */
			this.stencilZPassBack = null;

			/**
			 * User-defined clipping planes specified as Plane objects in world space.
			 * These planes apply to the objects this material is attached to.
			 * Points in space whose signed distance to the plane is negative are clipped (not rendered).
			 * @type {Plane[]}
			 * @default null
			 */
			this.clippingPlanes = null;

			/**
			 * Sets the alpha value to be used when running an alpha test.
			 * The material will not be renderered if the opacity is lower than this value.
			 * @type {number}
			 * @default 0
			 */
			this.alphaTest = 0;

			/**
			 * Enables alpha to coverage.
			 * Can only be used when MSAA is enabled.
			 * @type {boolean}
			 * @default false
			 */
			this.alphaToCoverage = false;

			/**
			 * Defines which side of faces will be rendered - front, back or double.
			 * @type {DRAW_SIDE}
			 * @default DRAW_SIDE.FRONT
			 */
			this.side = DRAW_SIDE.FRONT;

			/**
			 * Whether to use polygon offset.
			 * This corresponds to the GL_POLYGON_OFFSET_FILL WebGL feature.
			 * @type {boolean}
			 * @default false
			 */
			this.polygonOffset = false;

			/**
			 * Sets the polygon offset factor.
			 * @type {number}
			 * @default 0
			 */
			this.polygonOffsetFactor = 0;

			/**
			 * Sets the polygon offset units.
			 * @type {number}
			 * @default 0
			 */
			this.polygonOffsetUnits = 0;

			/**
			 * Define whether the material is rendered with flat shading or smooth shading.
			 * @type {SHADING_TYPE}
			 * @default SHADING_TYPE.SMOOTH_SHADING
			 */
			this.shading = SHADING_TYPE.SMOOTH_SHADING;

			/**
			 * Whether to apply dithering to the color to remove the appearance of banding.
			 * @type {boolean}
			 * @default false
			 */
			this.dithering = false;

			/**
			 * Whether the material is affected by lights.
			 * If set true, renderer will try to upload light uniforms.
			 * @type {boolean}
			 * @default false
			 */
			this.acceptLight = false;

			/**
			 * The lighting group of the material.
			 * Used in conjunction with {@link Light#groupMask}.
			 * @type {number}
			 * @default 0
			 */
			this.lightingGroup = 0;

			/**
			 * Whether the material is affected by fog.
			 * @type {boolean}
			 * @default true
			 */
			this.fog = true;

			/**
			 * Determines how the mesh triangles are constructed from the vertices.
			 * @type {DRAW_MODE}
			 * @default DRAW_MODE.TRIANGLES
			 */
			this.drawMode = DRAW_MODE.TRIANGLES;

			/**
			 * Whether the material uniforms need to be updated every draw call.
			 * If set false, the material uniforms are only updated once per frame , this can help optimize performance.
			 * @type {boolean}
			 * @default true
			 */
			this.forceUpdateUniforms = true;

			/**
			 * Specifies that the material needs to be recompiled.
			 * This property is automatically set to true when instancing a new material.
			 * @type {boolean}
			 * @default true
			 */
			this.needsUpdate = true;
		}

		/**
		 * Copy the parameters from the passed material into this material.
		 * @param {Material} source - The material to be copied.
		 * @returns {Material}
		 */
		copy(source) {
			this.shaderName = source.shaderName;
			this.defines = Object.assign({}, source.defines);
			this.uniforms = cloneUniforms(source.uniforms);
			this.vertexShader = source.vertexShader;
			this.fragmentShader = source.fragmentShader;
			this.precision = source.precision;
			this.extUvCoordMask = source.extUvCoordMask;
			this.transparent = source.transparent;
			this.blending = source.blending;
			this.blendSrc = source.blendSrc;
			this.blendDst = source.blendDst;
			this.blendEquation = source.blendEquation;
			this.blendSrcAlpha = source.blendSrcAlpha;
			this.blendDstAlpha = source.blendDstAlpha;
			this.blendEquationAlpha = source.blendEquationAlpha;
			this.premultipliedAlpha = source.premultipliedAlpha;
			this.vertexColors = source.vertexColors;
			this.vertexTangents = source.vertexTangents;
			this.opacity = source.opacity;
			this.diffuse.copy(source.diffuse);
			this.diffuseMap = source.diffuseMap;
			this.diffuseMapCoord = source.diffuseMapCoord;
			this.diffuseMapTransform.copy(source.diffuseMapTransform);
			this.alphaMap = source.alphaMap;
			this.alphaMapCoord = source.alphaMapCoord;
			this.alphaMapTransform.copy(source.alphaMapTransform);
			this.emissive.copy(source.emissive);
			this.emissiveMap = source.emissiveMap;
			this.emissiveMapCoord = source.emissiveMapCoord;
			this.emissiveMapTransform.copy(source.emissiveMapTransform);
			this.aoMap = source.aoMap;
			this.aoMapIntensity = source.aoMapIntensity;
			this.aoMapCoord = source.aoMapCoord;
			this.aoMapTransform.copy(source.aoMapTransform);
			this.normalMap = source.normalMap;
			this.normalScale.copy(source.normalScale);
			this.bumpMap = source.bumpMap;
			this.bumpScale = source.bumpScale;
			this.envMap = source.envMap;
			this.envMapIntensity = source.envMapIntensity;
			this.envMapCombine = source.envMapCombine;
			this.depthFunc = source.depthFunc;
			this.depthTest = source.depthTest;
			this.depthWrite = source.depthWrite;
			this.colorWrite = source.colorWrite;
			this.stencilTest = source.stencilTest;
			this.stencilWriteMask = source.stencilWriteMask;
			this.stencilFunc = source.stencilFunc;
			this.stencilRef = source.stencilRef;
			this.stencilFuncMask = source.stencilFuncMask;
			this.stencilFail = source.stencilFail;
			this.stencilZFail = source.stencilZFail;
			this.stencilZPass = source.stencilZPass;
			this.stencilFuncBack = source.stencilFuncBack;
			this.stencilRefBack = source.stencilRefBack;
			this.stencilFuncMaskBack = source.stencilFuncMaskBack;
			this.stencilFailBack = source.stencilFailBack;
			this.stencilZFailBack = source.stencilZFailBack;
			this.stencilZPassBack = source.stencilZPassBack;
			this.clippingPlanes = source.clippingPlanes;
			this.alphaTest = source.alphaTest;
			this.alphaToCoverage = source.alphaToCoverage;
			this.side = source.side;
			this.polygonOffset = source.polygonOffset;
			this.polygonOffsetFactor = source.polygonOffsetFactor;
			this.polygonOffsetUnits = source.polygonOffsetUnits;
			this.shading = source.shading;
			this.dithering = source.dithering;
			this.acceptLight = source.acceptLight;
			this.lightingGroup = source.lightingGroup;
			this.fog = source.fog;
			this.drawMode = source.drawMode;
			return this;
		}

		/**
		 * Return a new material with the same parameters as this material.
		 * @returns {Material}
		 */
		clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * This disposes the material.
		 * Textures of a material don't get disposed. These needs to be disposed by Texture.
		 */
		dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		}
	}

	/**
	 * A material rendered with custom shaders.
	 * A shader is a small program written in GLSL that runs on the GPU.
	 * @extends Material
	 */
	class ShaderMaterial extends Material {
		/**
		 * @param {object} shader - Shader object for the shader material.
		 * @param {string} shader.name - Name of the shader.
		 * @param {object} shader.defines - Defines of the shader.
		 * @param {object} shader.uniforms - Uniforms of the shader.
		 * @param {string} shader.vertexShader - Vertex shader GLSL code.
		 * @param {string} shader.fragmentShader - Fragment shader GLSL code.
		 */
		constructor(shader) {
			super();

			// Set values
			if (shader) {
				this.shaderName = shader.name;
				Object.assign(this.defines, shader.defines);
				this.uniforms = cloneUniforms(shader.uniforms);
				this.vertexShader = shader.vertexShader;
				this.fragmentShader = shader.fragmentShader;
			}
		}
	}

	/**
	 * Shader post pass.
	 */
	class ShaderPostPass {
		/**
		 * @param {object} shader - Shader object for the shader material.
		 * @param {string} shader.name - Name of the shader.
		 * @param {object} shader.defines - Defines of the shader.
		 * @param {object} shader.uniforms - Uniforms of the shader.
		 * @param {string} shader.vertexShader - Vertex shader GLSL code.
		 * @param {string} shader.fragmentShader - Fragment shader GLSL code.
		 */
		constructor(shader) {
			const scene = new Scene();
			const camera = this.camera = new Camera();
			camera.frustumCulled = false;
			camera.position.set(0, 0, 1);
			camera.lookAt(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
			camera.setOrtho(-1, 1, -1, 1, 0.1, 2);
			scene.add(camera);
			const geometry = this.geometry = new Geometry(); // fullscreen triangle
			geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array([-1, 3, 0, -1, -1, 0, 3, -1, 0]), 3)));
			geometry.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array([0, 2, 0, 0, 2, 0]), 2)));
			const material = this.material = new ShaderMaterial(shader);
			this.uniforms = material.uniforms;
			const plane = new Mesh(geometry, material);
			plane.frustumCulled = false;
			scene.add(plane);

			// static scene

			scene.updateMatrix();
			this.renderStates = scene.updateRenderStates(camera);
			const renderQueue = scene.updateRenderQueue(camera, false, false);
			this.renderQueueLayer = renderQueue.layerList[0];
			this.renderConfig = {};
		}

		/**
		 * Render the post pass.
		 * @param {ThinRenderer} renderer
		 */
		render(renderer) {
			renderer.beginRender();
			renderer.renderRenderableList(this.renderQueueLayer.opaque, this.renderStates, this.renderConfig);
			renderer.endRender();
		}

		/**
		 * Dispose the post pass.
		 */
		dispose() {
			this.geometry.dispose();
			this.material.dispose();
		}
	}

	/**
	 * A material for drawing geometry by depth.
	 * Depth is based off of the camera near and far plane. White is nearest, black is farthest.
	 * @extends Material
	 */
	class DepthMaterial extends Material {
		/**
		 * Create a DepthMaterial.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.DEPTH;

			/**
			 * Encoding for depth packing.
			 * @type {boolean}
			 * @default false
			 */
			this.packToRGBA = false;
		}
	}

	/**
	 * A material for drawing geometry by distance.
	 * @extends Material
	 */
	class DistanceMaterial extends Material {
		/**
		 * Create a DistanceMaterial.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.DISTANCE;
		}
	}

	/**
	 * Shadow map pass.
	 */
	class ShadowMapPass {
		constructor() {
			/**
			 * Get depth material function.
			 * Override this to use custom depth material.
			 * @type {Function}
			 */
			this.getDepthMaterial = _getDepthMaterial;

			/**
			 * Get distance material function.
			 * Override this to use custom distance material.
			 * @type {Function}
			 */
			this.getDistanceMaterial = _getDistanceMaterial;

			/**
			 * Define which render layers will produce shadows.
			 * If the value is Null, it means that all render layers will produce shadows.
			 * @type {null | Array}
			 * @default null
			 */
			this.shadowLayers = null;

			/**
			 * Whether transparent objects can cast shadows.
			 * @type {boolean}
			 * @default false
			 */
			this.transparentShadow = false;
			const state = {
				isPointLight: false,
				light: null
			};
			this._state = state;
			const that = this;
			this._renderOptions = {
				getGeometry: null,
				getMaterial: function (renderable) {
					return state.isPointLight ? that.getDistanceMaterial(renderable, state.light) : that.getDepthMaterial(renderable, state.light);
				},
				ifRender: function (renderable) {
					return state.light.groupMask & 1 << renderable.material.lightingGroup && renderable.object.castShadow;
				}
			};
		}

		/**
		 * Get geometry function for shadow render options.
		 * @type {null | Function}
		 */
		set getGeometry(func) {
			if (func) {
				this._renderOptions.getGeometry = func;
			} else {
				delete this._renderOptions.getGeometry;
			}
		}
		get getGeometry() {
			return this._renderOptions.getGeometry;
		}

		/**
		 * The if render function for shadow render options.
		 * @type {Function}
		 */
		set ifRender(func) {
			if (func) {
				this._renderOptions.ifRender = func;
			} else {
				delete this._renderOptions.ifRender;
			}
		}
		get ifRender() {
			return this._renderOptions.ifRender;
		}

		/**
		 * Render shadow map.
		 * @param {ThinRenderer} renderer
		 * @param {Scene} scene
		 */
		render(renderer, scene) {
			oldClearColor.copy(renderer.getClearColor());
			renderer.setClearColor(1, 1, 1, 1);
			const lightingData = scene.collector.lightingData;
			const lightsArray = lightingData.lightsArray;
			const shadowsNum = lightingData.shadowsNum;
			for (let i = 0; i < shadowsNum; i++) {
				const light = lightsArray[i];
				const shadow = light.shadow;
				if (shadow.autoUpdate === false && shadow.needsUpdate === false) continue;
				const camera = shadow.camera;
				const shadowTarget = shadow.renderTarget;
				const isPointLight = light.isPointLight;
				const faces = isPointLight ? 6 : 1;
				this._state.isPointLight = isPointLight;
				this._state.light = light;
				const renderOptions = this._renderOptions;
				shadow.prepareDepthMap(!scene.disableShadowSampler, renderer.capabilities);
				for (let j = 0; j < faces; j++) {
					if (isPointLight) {
						shadow.update(light, j);
						shadowTarget.activeCubeFace = j;
					}
					renderer.setRenderTarget(shadowTarget);
					renderer.clear(true, true);
					const renderStates = scene.updateRenderStates(camera, j === 0);
					const renderQueue = scene.updateRenderQueue(camera, false, false);
					renderer.beginRender();
					for (let k = 0; k < renderQueue.layerList.length; k++) {
						const renderQueueLayer = renderQueue.layerList[k];
						if (this.shadowLayers !== null && this.shadowLayers.indexOf(renderQueueLayer.id) === -1) continue;
						renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, renderOptions);
						if (this.transparentShadow) {
							renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, renderOptions);
						}
					}
					renderer.endRender();
				}

				// set generateMipmaps false
				// renderer.updateRenderTargetMipmap(shadowTarget);

				shadow.needsUpdate = false;
			}
			renderer.setClearColor(oldClearColor.x, oldClearColor.y, oldClearColor.z, oldClearColor.w);
		}
	}
	const oldClearColor = new Vector4();
	const shadowSide = {
		'front': DRAW_SIDE.BACK,
		'back': DRAW_SIDE.FRONT,
		'double': DRAW_SIDE.DOUBLE
	};
	const depthMaterials = {};
	const distanceMaterials = {};
	function _getDepthMaterial(renderable, light) {
		const useSkinning = !!renderable.object.skeleton;
		const useMorphing = renderable.geometry.morphAttributes.position && renderable.geometry.morphAttributes.position.length > 0;
		const clippingPlanes = renderable.material.clippingPlanes;
		const numClippingPlanes = clippingPlanes && clippingPlanes.length > 0 ? clippingPlanes.length : 0;
		const index = useMorphing << 0 | useSkinning << 1;
		let materials = depthMaterials[index];
		if (materials === undefined) {
			materials = {};
			depthMaterials[index] = materials;
		}
		let material = materials[numClippingPlanes];
		if (material === undefined) {
			material = new DepthMaterial();
			material.packToRGBA = true;
			materials[numClippingPlanes] = material;
		}
		material.side = shadowSide[renderable.material.side];
		material.clippingPlanes = renderable.material.clippingPlanes;
		material.drawMode = renderable.material.drawMode;
		return material;
	}
	function _getDistanceMaterial(renderable, light) {
		const useSkinning = !!renderable.object.skeleton;
		const useMorphing = renderable.geometry.morphAttributes.position && renderable.geometry.morphAttributes.position.length > 0;
		const clippingPlanes = renderable.material.clippingPlanes;
		const numClippingPlanes = clippingPlanes && clippingPlanes.length > 0 ? clippingPlanes.length : 0;
		const index = useMorphing << 0 | useSkinning << 1;
		let materials = distanceMaterials[index];
		if (materials === undefined) {
			materials = {};
			distanceMaterials[index] = materials;
		}
		let material = materials[numClippingPlanes];
		if (material === undefined) {
			material = new DistanceMaterial();
			materials[numClippingPlanes] = material;
		}
		material.side = shadowSide[renderable.material.side];
		material.uniforms['nearDistance'] = light.shadow.cameraNear;
		material.uniforms['farDistance'] = light.shadow.cameraFar;
		material.clippingPlanes = renderable.material.clippingPlanes;
		material.drawMode = renderable.material.drawMode;
		return material;
	}

	/**
	 * PropertyMap is a helper class for storing properties on objects.
	 * Instead of using a Map, we store the property map directly on the object itself,
	 * which provides better lookup performance.
	 * This is generally used to store the gpu resources corresponding to objects.
	 */
	class PropertyMap {
		/**
		 * Create a new PropertyMap.
		 * @param {string} prefix - The prefix of the properties name.
		 */
		constructor(prefix) {
			this._key = prefix + '$';
			this._count = 0;
		}

		/**
		 * Get the properties of the object.
		 * If the object does not have properties, create a new one.
		 * @param {object} object - The object to get properties.
		 * @returns {object} - The properties of the object.
		 */
		get(object) {
			const key = this._key;
			let properties = object[key];
			if (properties === undefined) {
				properties = {};
				object[key] = properties;
				this._count++;
			}
			return properties;
		}

		/**
		 * Delete the properties of the object.
		 * @param {object} object - The object to delete properties.
		 */
		delete(object) {
			const key = this._key;
			const properties = object[key];
			if (properties) {
				this._count--;
				delete object[key];
			}
		}

		/**
		 * Get the number of objects that have properties.
		 * @returns {number} - The number of objects that have properties.
		 */
		size() {
			return this._count;
		}
	}

	/**
	 * Render info collector.
	 * If you want to collect information about the rendering of this frame,
	 * pass an instance of RenderInfo to RenderOption when calling renderRenderableList.
	 */
	class RenderInfo {
		constructor() {
			const render = {
				calls: 0,
				triangles: 0,
				lines: 0,
				points: 0
			};

			// A series of function use for collect information.
			const updateFuncs = [function updatePoints(instanceCount, count) {
				render.points += instanceCount * count;
			}, function updateLines(instanceCount, count) {
				render.lines += instanceCount * (count / 2);
			}, function updateLineLoop(instanceCount, count) {
				render.lines += instanceCount * count;
			}, function updateLineStrip(instanceCount, count) {
				render.lines += instanceCount * (count - 1);
			}, function updateTriangles(instanceCount, count) {
				render.triangles += instanceCount * (count / 3);
			}, function updateTriangleStrip(instanceCount, count) {
				render.triangles += instanceCount * (count - 2);
			}, function updateTriangleFan(instanceCount, count) {
				render.triangles += instanceCount * (count - 2);
			}];

			/**
			 * Method of update render info.
			 * This method will be executed after each draw.
			 * @private
			 * @param {number} count
			 * @param {DRAW_MODE} mode
			 * @param {number} instanceCount
			 */
			this.update = function (count, mode, instanceCount) {
				render.calls++;
				updateFuncs[mode](instanceCount, count);
			};

			/**
			 * Reset the render info.
			 * Call this method whenever you have finished to render a single frame.
			 */
			this.reset = function () {
				render.calls = 0;
				render.triangles = 0;
				render.lines = 0;
				render.points = 0;
			};

			/**
			 * A series of statistical information of rendering process, include calls, triangles, lines and points.
			 * @type {object}
			 */
			this.render = render;
		}
	}

	let _rendererId = 0;

	/**
	 * Base class for WebGL and WebGPU renderers.
	 */
	class ThinRenderer {
		/**
		 * @param {WebGLRenderingContext|WebGPURenderingContext} context - The Rendering Context privided by canvas.
		 */
		constructor(context) {
			this.id = _rendererId++;

			/**
			 * The Rendering Context privided by canvas.
			 * @type {WebGLRenderingContext|WebGPURenderingContext}
			 */
			this.context = context;

			/**
			 * An object containing details about the capabilities of the current RenderingContext.
			 * @type {object}
			 */
			this.capabilities = {};

			/**
			 * The shader compiler options.
			 * @type {object}
			 * @property {boolean} checkErrors - Whether to use error checking when compiling shaders, defaults to true.
			 * @property {boolean} compileAsynchronously - Whether to compile shaders asynchronously, defaults to false.
			 * @property {number} maxMaterialPrograms - The maximum number of programs that one material can cache, defaults to 5.
			 */
			this.shaderCompileOptions = {
				checkErrors: true,
				compileAsynchronously: false,
				maxMaterialPrograms: 5
			};

			/**
			 * The lighting options.
			 * @type {object}
			 * @property {object} clustered - The clustered lighting options.
			 * @property {boolean} clustered.enabled - Whether to use clustered lighting, defaults to false.
			 * @property {number} clustered.maxClusterLights - The maximum number of lights, defaults to 1024.
			 * @property {boolean} clustered.useFloatPrecision - Whether the lights are stored as floats, defaults to false (half floats).
			 * @property {Vector3} clustered.gridDimensions - The number of cells in each dimension, defaults to Vector3(16, 8, 32).
			 * @property {number} clustered.maxLightsPerCell - The maximum number of lights per cell, defaults to 256.
			 * @property {Vector2} clustered.zClip - The near and far clipping planes for the cells, defaults to Vector2(-1, -1) (clip based on camera near and far planes).
			 * @property {number} clustered.version - The version of the clustered lighting options. If the options change, the version should be incremented, defaults to 0.
			 */
			this.lightingOptions = {
				clustered: {
					enabled: false,
					maxClusterLights: 1024,
					useFloatPrecision: false,
					gridDimensions: new Vector3(16, 8, 32),
					maxLightsPerCell: 256,
					zClip: new Vector2(-1, -1),
					version: 0
				}
			};

			/**
			 * Whether to perform readPixel operations asynchronously.
			 * @type {boolean}
			 * @default false
			 */
			this.asyncReadPixel = false;
			this._passInfo = {
				// Whether the renderer is in the process of pass rendering.
				// If true, means that the beginRender method has been called but the endRender method has not been called.
				enabled: false,
				// The pass rendering count
				count: 0
			};
		}

		/**
		 * Begin rendering.
		 */
		beginRender() {
			this._passInfo.enabled = true;
		}

		/**
		 * End rendering.
		 */
		endRender() {
			this._passInfo.enabled = false;
			this._passInfo.count++;
		}

		/**
		 * @typedef {object} RenderOptions - The render options for renderRenderableItem and renderRenderableList methods.
		 * @property {Function} getGeometry - (Optional) Get renderable geometry.
		 * @property {Function} getMaterial - (Optional) Get renderable material.
		 * @property {Function} beforeRender - (Optional) Before render each renderable item.
		 * @property {Function} afterRender - (Optional) After render each renderable item.
		 * @property {Function} ifRender - (Optional) If render the renderable item.
		 * @property {RenderInfo} renderInfo - (Optional) Render info for collect information.
		 * @property {boolean} onlyCompile - (Optional) Only compile shader, do not render.
		 */

		/**
		 * Render a single renderable item with render states.
		 * @param {object} renderable - The renderable item.
		 * @param {RenderStates} renderStates - The render states.
		 * @param {RenderOptions} [options] - The render options for this render task.
		 */
		renderRenderableItem(renderable, renderStates, options) {}

		/**
		 * Render a single renderable list with render states.
		 * @param {Array} renderables - Array of renderable.
		 * @param {RenderStates} renderStates - Render states.
		 * @param {RenderOptions} [options] - The render options for this render task.
		 */
		renderRenderableList(renderables, renderStates, options = {}) {
			for (let i = 0, l = renderables.length; i < l; i++) {
				this.renderRenderableItem(renderables[i], renderStates, options);
			}
		}

		/**
		 * Render a scene with a particular camera.
		 * This method will render all layers in scene's RenderQueue by default.
		 * If you need a customized rendering process, it is recommended to use renderRenderableList method.
		 * @param {Scene} scene - The scene to render.
		 * @param {Camera} camera - The camera used to render the scene.
		 * @param {RenderOptions} [options] - The render options for this scene render task.
		 */
		renderScene(scene, camera, options = {}) {
			const renderStates = scene.getRenderStates(camera);
			const renderQueue = scene.getRenderQueue(camera);
			this.beginRender();
			let renderQueueLayer;
			for (let i = 0, l = renderQueue.layerList.length; i < l; i++) {
				renderQueueLayer = renderQueue.layerList[i];
				this.renderRenderableList(renderQueueLayer.opaque, renderStates, options);
				this.renderRenderableList(renderQueueLayer.transparent, renderStates, options);
			}
			this.endRender();
		}

		/**
		 * Clear the color, depth and stencil buffers.
		 * @param {boolean} [color=false] - Clear color buffer.
		 * @param {boolean} [depth=false] - Clear depth buffer.
		 * @param {boolean} [stencil=false] - Clear stencil buffer.
		 */
		clear(color, depth, stencil) {}

		/**
		 * Set clear color.
		 * @param {number} r - Red component in the range 0.0 - 1.0.
		 * @param {number} g - Green component in the range 0.0 - 1.0.
		 * @param {number} b - Blue component in the range 0.0 - 1.0.
		 * @param {number} a - Alpha component in the range 0.0 - 1.0.
		 * @param {number} premultipliedAlpha - Whether the alpha is premultiplied.
		 */
		setClearColor(r, g, b, a, premultipliedAlpha) {}

		/**
		 * Returns a Vector4 instance with the current clear color and alpha.
		 * Note: Do not modify the value of Vector4, it is read-only.
		 * @returns {Vector4}
		 */
		getClearColor() {}

		/**
		 * This method sets the active rendertarget.
		 * @param {RenderTargetBase} renderTarget The renderTarget that needs to be activated.
		 */
		setRenderTarget(renderTarget) {}

		/**
		 * Returns the current RenderTarget if there are; returns null otherwise.
		 * @returns {RenderTargetBase | null}
		 */
		getRenderTarget() {}

		/**
		 * Copy a frame buffer to another.
		 * This copy process can be used to perform multi-sampling (MSAA).
		 * @param {RenderTargetBase} read - The source renderTarget.
		 * @param {RenderTargetBase} draw - The destination renderTarget.
		 * @param {boolean} [color=true] - Copy color buffer.
		 * @param {boolean} [depth=true] - Copy depth buffer.
		 * @param {boolean} [stencil=true] - Copy stencil buffer.
		 */
		blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {}

		/**
		 * Reads the pixel data from the current render target into the provided buffer.
		 * The Renderer.asyncReadPixel property determines whether this operation is synchronous or asynchronous.
		 * To maintain consistency, this method always returns a Promise object.
		 * @param {number} x - The x coordinate of the rectangle to read from.
		 * @param {number} y - The y coordinate of the rectangle to read from.
		 * @param {number} width - The width of the rectangle to read from.
		 * @param {number} height - The height of the rectangle to read from.
		 * @param {TypedArray} buffer Uint8Array is the only destination type supported in all cases, other types are renderTarget and platform dependent.
		 * @returns {Promise<TypedArray>} A promise that resolves with the passed in buffer after it has been filled with the pixel data.
		 */
		readRenderTargetPixels(x, y, width, height, buffer) {}

		/**
		 * Generate mipmaps for the renderTarget you pass in.
		 * @param {RenderTargetBase} renderTarget - The renderTarget to update.
		 */
		updateRenderTargetMipmap(renderTarget) {}

		/**
		 * Bind webglTexture to Texture.
		 * @param {TextureBase} texture
		 * @param {WebGLTexture} webglTexture
		 */
		setTextureExternal(texture, webglTexture) {}

		/**
		 * Bind webglRenderbuffer to RenderBuffer.
		 * @param {RenderBuffer} renderBuffer
		 * @param {WebGLRenderbuffer} webglRenderbuffer
		 */
		setRenderBufferExternal(renderBuffer, webglRenderbuffer) {}

		/**
		 * Bind webglBuffer to Buffer.
		 * @param {Buffer} buffer
		 * @param {WebGLBuffer} webglBuffer
		 */
		setBufferExternal(buffer, webglBuffer) {}

		/**
		 * Reset vertex array object bindings.
		 * @param {boolean} [force=false] - Whether clear the current vertex array object.
		 */
		resetVertexArrayBindings(force) {}

		/**
		 * Reset all render states cached in this renderer.
		 * This is useful when you use multiple renderers in one application.
		 */
		resetState() {}

		/**
		 * Begin a query instance.
		 * @param {Query} query
		 * @param {QUERY_TYPE} target
		 */
		beginQuery(query, target) {}

		/**
		 * End a query instance.
		 * @param {Query} query
		 */
		endQuery(query) {}

		/**
		 * Records the current time into the corresponding query object.
		 * @param {Query} query
		 */
		queryCounter(query) {}

		/**
		 * Returns true if the timer query was disjoint, indicating that timing results are invalid.
		 * This is rare and might occur, for example, if the GPU was throttled while timing.
		 * @param {Query} query
		 * @returns {boolean} Returns true if the timer query was disjoint.
		 */
		isTimerQueryDisjoint(query) {}

		/**
		 * Check if the query result is available.
		 * @param {Query} query
		 * @returns {boolean} If query result is available.
		 */
		isQueryResultAvailable(query) {}

		/**
		 * Get the query result.
		 * @param {Query} query
		 * @returns {number} The query result.
		 */
		getQueryResult(query) {}

		/**
		 * Used for context lost and restored.
		 * @protected
		 * @returns {number}
		 */
		increaseId() {
			this.id = _rendererId++;
			return this.id;
		}
	}

	/**
	 * Linear fog.
	 */
	class Fog {
		/**
		 * @param {number} [color=0x000000] - The color of the fog.
		 * @param {number} [near=1] - The near clip of the fog.
		 * @param {number} [far=1000] - The far clip of the fog.
		 */
		constructor(color = 0x000000, near = 1, far = 1000) {
			/**
			 * The color of the fog.
			 * @type {Color3}
			 * @default Color3(0x000000)
			 */
			this.color = new Color3(color);

			/**
			 * The near clip of the fog.
			 * @type {number}
			 * @default 1
			 */
			this.near = near;

			/**
			 * The far clip of the fog.
			 * @type {number}
			 * @default 1000
			 */
			this.far = far;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Fog.prototype.isFog = true;

	/**
	 * Exp2 fog.
	 */
	class FogExp2 {
		/**
		 * @param {number} [color=0x000000] - The color of the fog.
		 * @param {number} [density=0.00025] - The density of the exp2 fog.
		 */
		constructor(color = 0x000000, density = 0.00025) {
			/**
			 * The color of the fog.
			 * @type {Color3}
			 * @default Color3(0x000000)
			 */
			this.color = new Color3(color);

			/**
			 * The density of the exp2 fog.
			 * @type {number}
			 * @default 0.00025
			 */
			this.density = density;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	FogExp2.prototype.isFogExp2 = true;

	/**
	 * BoxGeometry is the quadrilateral primitive geometry class.
	 * It is typically used for creating a cube or irregular quadrilateral of the dimensions provided with the 'width', 'height', and 'depth' constructor arguments.
	 * @extends Geometry
	 */
	class BoxGeometry extends Geometry {
		/**
		 * @param {number} [width=1] - Width of the sides on the X axis.
		 * @param {number} [height=1] - Height of the sides on the Y axis.
		 * @param {number} [depth=1] - Depth of the sides on the Z axis.
		 * @param {number} [widthSegments=1] - Number of segmented faces along the width of the sides.
		 * @param {number} [heightSegments=1] - Number of segmented faces along the height of the sides.
		 * @param {number} [depthSegments=1] - Number of segmented faces along the depth of the sides.
		 */
		constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
			super();
			const scope = this;

			// segments

			widthSegments = Math.floor(widthSegments);
			heightSegments = Math.floor(heightSegments);
			depthSegments = Math.floor(depthSegments);

			// buffers

			const indices = [];
			const vertices = [];
			const normals = [];
			const uvs = [];

			// helper variables

			let numberOfVertices = 0;
			let groupStart = 0;

			// build each side of the box geometry

			buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, 0); // px
			buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, 1); // nx
			buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
			buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, 3); // ny
			buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, 4); // pz
			buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, 5); // nz

			// build geometry

			this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {
				const segmentWidth = width / gridX;
				const segmentHeight = height / gridY;
				const widthHalf = width / 2;
				const heightHalf = height / 2;
				const depthHalf = depth / 2;
				const gridX1 = gridX + 1;
				const gridY1 = gridY + 1;
				let vertexCounter = 0;
				let groupCount = 0;
				const vector = new Vector3();

				// generate vertices, normals and uvs

				for (let iy = 0; iy < gridY1; iy++) {
					const y = iy * segmentHeight - heightHalf;
					for (let ix = 0; ix < gridX1; ix++) {
						const x = ix * segmentWidth - widthHalf;

						// set values to correct vector component

						vector[u] = x * udir;
						vector[v] = y * vdir;
						vector[w] = depthHalf;

						// now apply vector to vertex buffer

						vertices.push(vector.x, vector.y, vector.z);

						// set values to correct vector component

						vector[u] = 0;
						vector[v] = 0;
						vector[w] = depth > 0 ? 1 : -1;

						// now apply vector to normal buffer

						normals.push(vector.x, vector.y, vector.z);

						// uvs

						uvs.push(ix / gridX);
						uvs.push(1 - iy / gridY);

						// counters

						vertexCounter += 1;
					}
				}

				// indices

				// 1. you need three indices to draw a single face
				// 2. a single segment consists of two faces
				// 3. so we need to generate six (2*3) indices per segment

				for (let iy = 0; iy < gridY; iy++) {
					for (let ix = 0; ix < gridX; ix++) {
						const a = numberOfVertices + ix + gridX1 * iy;
						const b = numberOfVertices + ix + gridX1 * (iy + 1);
						const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
						const d = numberOfVertices + (ix + 1) + gridX1 * iy;

						// faces

						indices.push(a, b, d);
						indices.push(b, c, d);

						// increase counter

						groupCount += 6;
					}
				}

				// add a group to the geometry. this will ensure multi material support

				scope.addGroup(groupStart, groupCount, materialIndex);

				// calculate new start value for groups

				groupStart += groupCount;

				// update total number of vertices

				numberOfVertices += vertexCounter;
			}
			this.computeBoundingBox();
			this.computeBoundingSphere();
		}
	}

	/**
	 * A class for generating cylinder geometries.
	 * @extends Geometry
	 */
	class CylinderGeometry extends Geometry {
		/**
		 * @param {number} [radiusTop=1] — Radius of the cylinder at the top.
		 * @param {number} [radiusBottom=1] — Radius of the cylinder at the bottom.
		 * @param {number} [height=1] — Height of the cylinder.
		 * @param {number} [radialSegments=8] — Number of segmented faces around the circumference of the cylinder.
		 * @param {number} [heightSegments=1] — Number of rows of faces along the height of the cylinder.
		 * @param {number} [openEnded=false] — A Boolean indicating whether the ends of the cylinder are open or capped. Default is false, meaning capped.
		 * @param {number} [thetaStart=0] — Start angle for first segment, default = 0 (three o'clock position).
		 * @param {number} [thetaLength=2*Pi] — The central angle, often called theta, of the circular sector. The default is 2*Pi, which makes for a complete cylinder.
		 */
		constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2) {
			super();
			const scope = this;
			radialSegments = Math.floor(radialSegments);
			heightSegments = Math.floor(heightSegments);

			// buffers

			const indices = [];
			const vertices = [];
			const normals = [];
			const uvs = [];

			// helper variables

			let index = 0;
			const indexArray = [];
			const halfHeight = height / 2;
			let groupStart = 0;

			// generate geometry

			generateTorso();
			if (openEnded === false) {
				if (radiusTop > 0) generateCap(true);
				if (radiusBottom > 0) generateCap(false);
			}

			// build geometry

			this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			function generateTorso() {
				const normal = new Vector3();
				const vertex = new Vector3();
				let groupCount = 0;
				let x, y;

				// this will be used to calculate the normal
				const slope = (radiusBottom - radiusTop) / height;

				// generate vertices, normals and uvs

				for (y = 0; y <= heightSegments; y++) {
					const indexRow = [];
					const v = y / heightSegments;

					// calculate the radius of the current row

					const radius = v * (radiusBottom - radiusTop) + radiusTop;
					for (x = 0; x <= radialSegments; x++) {
						const u = x / radialSegments;
						const theta = u * thetaLength + thetaStart;
						const sinTheta = Math.sin(theta);
						const cosTheta = Math.cos(theta);

						// vertex

						vertex.x = radius * sinTheta;
						vertex.y = -v * height + halfHeight;
						vertex.z = radius * cosTheta;
						vertices.push(vertex.x, vertex.y, vertex.z);

						// normal

						normal.set(sinTheta, slope, cosTheta).normalize();
						normals.push(normal.x, normal.y, normal.z);

						// uv

						uvs.push(u, 1 - v);

						// save index of vertex in respective row

						indexRow.push(index++);
					}

					// now save vertices of the row in our index array

					indexArray.push(indexRow);
				}

				// generate indices

				for (x = 0; x < radialSegments; x++) {
					for (y = 0; y < heightSegments; y++) {
						// we use the index array to access the correct indices

						const a = indexArray[y][x];
						const b = indexArray[y + 1][x];
						const c = indexArray[y + 1][x + 1];
						const d = indexArray[y][x + 1];

						// faces

						if (radiusTop > 0 || y !== 0) {
							indices.push(a, b, d);
							groupCount += 3;
						}
						if (radiusBottom > 0 || y !== heightSegments - 1) {
							indices.push(b, c, d);
							groupCount += 3;
						}
					}
				}

				// add a group to the geometry. this will ensure multi material support

				scope.addGroup(groupStart, groupCount, 0);

				// calculate new start value for groups

				groupStart += groupCount;
			}
			function generateCap(top) {
				// save the index of the first center vertex
				const centerIndexStart = index;
				const uv = new Vector2();
				const vertex = new Vector3();
				let groupCount = 0;
				let x;
				const radius = top === true ? radiusTop : radiusBottom;
				const sign = top === true ? 1 : -1;

				// first we generate the center vertex data of the cap.
				// because the geometry needs one set of uvs per face,
				// we must generate a center vertex per face/segment

				for (x = 1; x <= radialSegments; x++) {
					// vertex

					vertices.push(0, halfHeight * sign, 0);

					// normal

					normals.push(0, sign, 0);

					// uv

					uvs.push(0.5, 0.5);

					// increase index

					index++;
				}

				// save the index of the last center vertex
				const centerIndexEnd = index;

				// now we generate the surrounding vertices, normals and uvs

				for (x = 0; x <= radialSegments; x++) {
					const u = x / radialSegments;
					const theta = u * thetaLength + thetaStart;
					const cosTheta = Math.cos(theta);
					const sinTheta = Math.sin(theta);

					// vertex

					vertex.x = radius * sinTheta;
					vertex.y = halfHeight * sign;
					vertex.z = radius * cosTheta;
					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal

					normals.push(0, sign, 0);

					// uv

					uv.x = cosTheta * 0.5 + 0.5;
					uv.y = sinTheta * 0.5 * sign + 0.5;
					uvs.push(uv.x, uv.y);

					// increase index

					index++;
				}

				// generate indices

				for (x = 0; x < radialSegments; x++) {
					const c = centerIndexStart + x;
					const i = centerIndexEnd + x;
					if (top === true) {
						// face top
						indices.push(i, i + 1, c);
					} else {
						// face bottom
						indices.push(i + 1, i, c);
					}
					groupCount += 3;
				}

				// add a group to the geometry. this will ensure multi material support

				scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);

				// calculate new start value for groups

				groupStart += groupCount;
			}
			this.computeBoundingBox();
			this.computeBoundingSphere();
		}
	}

	/**
	 * A class for generating plane geometries.
	 * @extends Geometry
	 */
	class PlaneGeometry extends Geometry {
		/**
		 * @param {number} [width=1] — Width along the X axis.
		 * @param {number} [height=1] — Height along the Y axis.
		 * @param {number} [widthSegments=1]
		 * @param {number} [heightSegments=1]
		 */
		constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
			super();
			const width_half = width / 2;
			const height_half = height / 2;
			const gridX = Math.floor(widthSegments);
			const gridY = Math.floor(heightSegments);
			const gridX1 = gridX + 1;
			const gridY1 = gridY + 1;
			const segment_width = width / gridX;
			const segment_height = height / gridY;
			let ix, iy;

			// buffers

			const indices = [];
			const vertices = [];
			const normals = [];
			const uvs = [];

			// generate vertices, normals and uvs

			for (iy = 0; iy < gridY1; iy++) {
				const y = iy * segment_height - height_half;
				for (ix = 0; ix < gridX1; ix++) {
					const x = ix * segment_width - width_half;
					vertices.push(x, 0, y);
					normals.push(0, 1, 0);
					uvs.push(ix / gridX);
					uvs.push(1 - iy / gridY);
				}
			}

			// indices

			for (iy = 0; iy < gridY; iy++) {
				for (ix = 0; ix < gridX; ix++) {
					const a = ix + gridX1 * iy;
					const b = ix + gridX1 * (iy + 1);
					const c = ix + 1 + gridX1 * (iy + 1);
					const d = ix + 1 + gridX1 * iy;

					// faces

					indices.push(a, b, d);
					indices.push(b, c, d);
				}
			}

			// build geometry

			this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			this.computeBoundingBox();
			this.computeBoundingSphere();
		}
	}

	/**
	 * A class for generating sphere geometries.
	 * The geometry is created by sweeping and calculating vertexes around the Y axis (horizontal sweep) and the Z axis (vertical sweep).
	 * Thus, incomplete spheres (akin to 'sphere slices') can be created through the use of different values of phiStart, phiLength, thetaStart and thetaLength, in order to define the points in which we start (or end) calculating those vertices.
	 * @extends Geometry
	 */
	class SphereGeometry extends Geometry {
		/**
		 * @param {number} [radius=1] — sphere radius. Default is 1.
		 * @param {number} [widthSegments=8] — number of horizontal segments. Minimum value is 3, and the default is 8.
		 * @param {number} [heightSegments=6] — number of vertical segments. Minimum value is 2, and the default is 6.
		 * @param {number} [phiStart=0] — specify horizontal starting angle. Default is 0.
		 * @param {number} [phiLength=Math.PI*2] — specify horizontal sweep angle size. Default is Math.PI * 2.
		 * @param {number} [thetaStart=0] — specify vertical starting angle. Default is 0.
		 * @param {number} [thetaLength=Math.PI] — specify vertical sweep angle size. Default is Math.PI.
		 */
		constructor(radius = 1, widthSegments = 8, heightSegments = 6, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
			super();
			widthSegments = Math.max(3, Math.floor(widthSegments));
			heightSegments = Math.max(2, Math.floor(heightSegments));
			const thetaEnd = thetaStart + thetaLength;
			let ix, iy;
			let index = 0;
			const grid = [];
			const vertex = new Vector3();
			const normal = new Vector3();

			// buffers

			const indices = [];
			const vertices = [];
			const normals = [];
			const uvs = [];

			// generate vertices, normals and uvs

			for (iy = 0; iy <= heightSegments; iy++) {
				const verticesRow = [];
				const v = iy / heightSegments;

				// special case for the poles
				// https://github.com/mrdoob/three.js/pull/16043

				let uOffset = 0;
				if (iy == 0 && thetaStart == 0) {
					uOffset = 0.5 / widthSegments;
				} else if (iy == heightSegments && thetaEnd == Math.PI) {
					uOffset = -0.5 / widthSegments;
				}
				for (ix = 0; ix <= widthSegments; ix++) {
					const u = ix / widthSegments;

					// vertex

					vertex.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
					vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
					vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal

					normal.copy(vertex).normalize();
					normals.push(normal.x, normal.y, normal.z);

					// uv

					uvs.push(u + uOffset, 1 - v);
					verticesRow.push(index++);
				}
				grid.push(verticesRow);
			}

			// indices

			for (iy = 0; iy < heightSegments; iy++) {
				for (ix = 0; ix < widthSegments; ix++) {
					const a = grid[iy][ix + 1];
					const b = grid[iy][ix];
					const c = grid[iy + 1][ix];
					const d = grid[iy + 1][ix + 1];
					if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
					if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
				}
			}
			this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			this.computeBoundingBox();
			this.computeBoundingSphere();
		}
	}

	/**
	 * Creates a torus knot, the particular shape of which is defined by a pair of coprime integers, p and q.
	 * If p and q are not coprime, the result will be a torus link.
	 * @extends Geometry
	 */
	class TorusKnotGeometry extends Geometry {
		/**
		 * @param {number} [radius=1] — Radius of the torus. Default is 1.
		 * @param {number} [tube=0.4] — Radius of the tube. Default is 0.4.
		 * @param {number} [tubularSegments=64] — Default is 64.
		 * @param {number} [radialSegments=8] — Default is 8.
		 * @param {number} [p=2] — This value determines, how many times the geometry winds around its axis of rotational symmetry. Default is 2.
		 * @param {number} [q=3] — This value determines, how many times the geometry winds around a circle in the interior of the torus. Default is 3.
		 */
		constructor(radius = 1, tube = 0.4, tubularSegments = 64, radialSegments = 8, p = 2, q = 3) {
			super();
			tubularSegments = Math.floor(tubularSegments);
			radialSegments = Math.floor(radialSegments);

			// buffers

			const indices = [];
			const vertices = [];
			const normals = [];
			const uvs = [];

			// helper variables

			let i, j;
			const vertex = new Vector3();
			const normal = new Vector3();
			const P1 = new Vector3();
			const P2 = new Vector3();
			const B = new Vector3();
			const T = new Vector3();
			const N = new Vector3();

			// generate vertices, normals and uvs

			for (i = 0; i <= tubularSegments; ++i) {
				// the radian "u" is used to calculate the position on the torus curve of the current tubular segement

				const u = i / tubularSegments * p * Math.PI * 2;

				// now we calculate two points. P1 is our current position on the curve, P2 is a little farther ahead.
				// these points are used to create a special "coordinate space", which is necessary to calculate the correct vertex positions

				calculatePositionOnCurve(u, p, q, radius, P1);
				calculatePositionOnCurve(u + 0.01, p, q, radius, P2);

				// calculate orthonormal basis

				T.subVectors(P2, P1);
				N.addVectors(P2, P1);
				B.crossVectors(T, N);
				N.crossVectors(B, T);

				// normalize B, N. T can be ignored, we don't use it

				B.normalize();
				N.normalize();
				for (j = 0; j <= radialSegments; ++j) {
					// now calculate the vertices. they are nothing more than an extrusion of the torus curve.
					// because we extrude a shape in the xy-plane, there is no need to calculate a z-value.

					const v = j / radialSegments * Math.PI * 2;
					const cx = -tube * Math.cos(v);
					const cy = tube * Math.sin(v);

					// now calculate the final vertex position.
					// first we orient the extrusion with our basis vectos, then we add it to the current position on the curve

					vertex.x = P1.x + (cx * N.x + cy * B.x);
					vertex.y = P1.y + (cx * N.y + cy * B.y);
					vertex.z = P1.z + (cx * N.z + cy * B.z);
					vertices.push(vertex.x, vertex.y, vertex.z);

					// normal (P1 is always the center/origin of the extrusion, thus we can use it to calculate the normal)

					normal.subVectors(vertex, P1).normalize();
					normals.push(normal.x, normal.y, normal.z);

					// uv

					uvs.push(i / tubularSegments);
					uvs.push(j / radialSegments);
				}
			}

			// generate indices

			for (j = 1; j <= tubularSegments; j++) {
				for (i = 1; i <= radialSegments; i++) {
					// indices

					const a = (radialSegments + 1) * (j - 1) + (i - 1);
					const b = (radialSegments + 1) * j + (i - 1);
					const c = (radialSegments + 1) * j + i;
					const d = (radialSegments + 1) * (j - 1) + i;

					// faces

					indices.push(a, b, d);
					indices.push(b, c, d);
				}
			}

			// build geometry

			this.setIndex(new Attribute(new Buffer(vertices.length / 3 > 65536 ? new Uint32Array(indices) : new Uint16Array(indices), 1)));
			this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
			this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
			this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));
			this.computeBoundingBox();
			this.computeBoundingSphere();

			// this function calculates the current position on the torus curve

			function calculatePositionOnCurve(u, p, q, radius, position) {
				const cu = Math.cos(u);
				const su = Math.sin(u);
				const quOverP = q / p * u;
				const cs = Math.cos(quOverP);
				position.x = radius * (2 + cs) * 0.5 * cu;
				position.y = radius * (2 + cs) * su * 0.5;
				position.z = radius * Math.sin(quOverP) * 0.5;
			}
		}
	}

	/**
	 * A material for drawing geometries in a simple shaded (flat or wireframe) way.
	 * This material is not affected by lights.
	 * @extends Material
	 */
	class BasicMaterial extends Material {
		/**
		 * Create a BasicMaterial.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.BASIC;
		}
	}

	/**
	 * A material for non-shiny surfaces, without specular highlights.
	 * The material uses a non-physically based Lambertian model for calculating reflectance.
	 * This can simulate some surfaces (such as untreated wood or stone) well, but cannot simulate shiny surfaces with specular highlights (such as varnished wood).
	 * @extends Material
	 */
	class LambertMaterial extends Material {
		/**
		 * Create a LambertMaterial.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.LAMBERT;

			/**
			 * @default true
			 */
			this.acceptLight = true;
		}
	}

	/**
	 * A material for drawing wireframe-style geometries.
	 * @extends Material
	 */
	class LineMaterial extends Material {
		/**
		 * Create a LineMaterial.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.LINE;

			/**
			 * Controls line thickness.
			 * Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms linewidth will always be 1 regardless of the set value.
			 * @type {number}
			 * @default 1
			 */
			this.lineWidth = 1;

			/**
			 * Set draw mode to LINES / LINE_LOOP / LINE_STRIP
			 * @type {DRAW_MODE}
			 * @default DRAW_MODE.LINES
			 */
			this.drawMode = DRAW_MODE.LINES;
		}
		copy(source) {
			super.copy(source);
			this.lineWidth = source.lineWidth;
			return this;
		}
	}

	/**
	 * A standard physically based material, using Specular-Glossiness workflow.
	 * Physically based rendering (PBR) has recently become the standard in many 3D applications, such as Unity, Unreal and 3D Studio Max.
	 * This approach differs from older approaches in that instead of using approximations for the way in which light interacts with a surface, a physically correct model is used.
	 * The idea is that, instead of tweaking materials to look good under specific lighting, a material can	be created that will react 'correctly' under all lighting scenarios.
	 * @extends Material
	 */
	class PBR2Material extends Material {
		/**
		 * Create a PBR2Material.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.PBR2;

			/**
			 * Specular color of the material.
			 * @type {number}
			 * @default 0.5
			 */
			this.specular = new Color3(0x111111);

			/**
			 * Glossiness of the material.
			 * @type {number}
			 * @default 0.5
			 */
			this.glossiness = 0.5;

			/**
			 * The RGB channel of this texture is used to alter the specular of the material.
			 * @type {Texture2D}
			 * @default null
			 */
			this.specularMap = null;

			/**
			 * The A channel of this texture is used to alter the glossiness of the material.
			 * @type {Texture2D}
			 * @default null
			 */
			this.glossinessMap = null;

			/**
			 * @default true
			 */
			this.acceptLight = true;
		}
		copy(source) {
			super.copy(source);
			this.specular = source.specular;
			this.glossiness = source.glossiness;
			this.specularMap = source.specularMap;
			this.glossinessMap = source.glossinessMap;
			return this;
		}
	}

	/**
	 * A standard physically based material, using Metallic-Roughness workflow.
	 * Physically based rendering (PBR) has recently become the standard in many 3D applications, such as Unity, Unreal and 3D Studio Max.
	 * This approach differs from older approaches in that instead of using approximations for the way in which light interacts with a surface, a physically correct model is used.
	 * The idea is that, instead of tweaking materials to look good under specific lighting, a material can	be created that will react 'correctly' under all lighting scenarios.
	 * @extends Material
	 */
	class PBRMaterial extends Material {
		/**
		 * Create a PBRMaterial.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.PBR;

			/**
			 * How rough the material appears. 0.0 means a smooth mirror reflection, 1.0 means fully diffuse.
			 * If roughnessMap is also provided, both values are multiplied.
			 * @type {number}
			 * @default 0.5
			 */
			this.roughness = 0.5;

			/**
			 * How much the material is like a metal.
			 * Non-metallic materials such as wood or stone use 0.0, metallic use 1.0, with nothing (usually) in between.
			 * A value between 0.0 and 1.0 could be used for a rusty metal look. If metalnessMap is also provided, both values are multiplied.
			 * @type {number}
			 * @default 0.5
			 */
			this.metalness = 0.5;

			/**
			 * The green channel of this texture is used to alter the roughness of the material.
			 * @type {Texture2D}
			 * @default null
			 */
			this.roughnessMap = null;

			/**
			 * The blue channel of this texture is used to alter the metalness of the material.
			 * @type {Texture2D}
			 * @default null
			 */
			this.metalnessMap = null;

			/**
			 * The strength of a clearcoat layer on a material surface.
			 * When clearcoatFactor is set to 0.0, it indicates that there is no clearcoat present.
			 * When it is set to 1.0, it indicates a very strong clearcoat that-
			 * will cause the reflection and refraction effects on the surface of the object to become more prominent.
			 * @type {number}
			 * @default 0.0
			 */
			this.clearcoat = 0.0;

			/**
			 * A texture property that allows for the modulation of the strength or roughness of the clearcoat layer.
			 * @type {Texture2D}
			 * @default null
			 */
			this.clearcoatMap = null;

			/**
			 * The roughness of a clearcoat layer on a material surface.
			 * When clearcoatRoughness is set to 0.0, the clearcoat layer will appear perfectly smooth and reflective-
			 * and 0.0 represents a rough, textured clearcoat layer.
			 * Adjusting the clearcoatRoughness can achieve a wide range of effects and create more realistic materials.
			 * @type {number}
			 * @default 0.0
			 */
			this.clearcoatRoughness = 0.0;

			/**
			 * A texture that will be applied to the clearcoat layer of a material to simulate the roughness of the surface.
			 * @type {Texture2D}
			 * @default null
			 */
			this.clearcoatRoughnessMap = null;

			/**
			 * Adjust the normal map's strength or intensity.
			 * Affect the amount of bumpiness or surface detail that is visible on the clearcoat layer.
			 * Typical ranges are 0-1.
			 * @type {number}
			 * @default 1
			 */
			this.clearcoatNormalScale = new Vector2(1, 1);

			/**
			 * The texture that modulates the clearcoat layer's surface normal.
			 * @type {Texture2D}
			 * @default null
			 */
			this.clearcoatNormalMap = null;

			/**
			 * @default true
			 */
			this.acceptLight = true;
		}
		copy(source) {
			super.copy(source);
			this.roughness = source.roughness;
			this.metalness = source.metalness;
			this.roughnessMap = source.roughnessMap;
			this.metalnessMap = source.metalnessMap;
			this.clearcoat = source.clearcoat;
			this.clearcoatMap = source.clearcoatMap;
			this.clearcoatRoughness = source.clearcoatRoughness;
			this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
			this.clearcoatNormalScale.copy(source.clearcoatNormalScale);
			return this;
		}
	}

	/**
	 * A material for shiny surfaces with specular highlights.
	 * The material uses a non-physically based Blinn-Phong model for calculating reflectance.
	 * Unlike the Lambertian model used in the {@link LambertMaterial} this can simulate shiny surfaces with specular highlights (such as varnished wood).
	 * @extends Material
	 */
	class PhongMaterial extends Material {
		/**
		 * Create a PhongMaterial.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.PHONG;

			/**
			 * How shiny the {@link PhongMaterial#specular} highlight is; a higher value gives a sharper highlight.
			 * @type {number}
			 * @default 30
			 */
			this.shininess = 30;

			/**
			 * Specular color of the material.
			 * This defines how shiny the material is and the color of its shine.
			 * @type {Color3}
			 * @default Color(0x111111)
			 */
			this.specular = new Color3(0x111111);

			/**
			 * The specular map value affects both how much the specular surface highlight contributes and how much of the environment map affects the surface.
			 * @type {Texture2D}
			 * @default null
			 */
			this.specularMap = null;

			/**
			 * @default true
			 */
			this.acceptLight = true;
		}
		copy(source) {
			super.copy(source);
			this.shininess = source.shininess;
			this.specular.copy(source.specular);
			this.specularMap = source.specularMap;
			return this;
		}
	}

	/**
	 * The default material used by Points.
	 * @extends Material
	 */
	class PointsMaterial extends Material {
		/**
		 * Create a PointsMaterial.
		 */
		constructor() {
			super();
			this.type = MATERIAL_TYPE.POINT;

			/**
			 * Sets the size of the points.
			 * @type {number}
			 * @default 1
			 */
			this.size = 1;

			/**
			 * Specify whether points' size is attenuated by the camera depth. (Perspective camera only.)
			 * @type {boolean}
			 * @default true
			 */
			this.sizeAttenuation = true;

			/**
			 * Set draw mode to POINTS.
			 * @type {DRAW_MODE}
			 * @default DRAW_MODE.POINTS
			 */
			this.drawMode = DRAW_MODE.POINTS;
		}
		copy(source) {
			super.copy(source);
			this.size = source.size;
			this.sizeAttenuation = source.sizeAttenuation;
			return this;
		}
	}

	/**
	 * Render Target is the wrapping class of gl.framebuffer.
	 * @extends EventDispatcher
	 * @abstract
	 */
	class RenderTargetBase extends EventDispatcher {
		/**
		 * @param {number} width - The width of the render target.
		 * @param {number} height - The height of the render target.
		 */
		constructor(width, height) {
			super();

			/**
			 * The width of the render target.
			 * @type {number}
			 */
			this.width = width;

			/**
			 * The height of the render target.
			 * @type {number}
			 */
			this.height = height;
		}

		/**
		 * Resize the render target.
		 * @param {number} width - The width of the render target.
		 * @param {number} height - The height of the render target.
		 * @returns {boolean} - If size changed.
		 */
		resize(width, height) {
			if (this.width !== width || this.height !== height) {
				this.width = width;
				this.height = height;
				return true;
			}
			return false;
		}

		/**
		 * Dispatches a dispose event.
		 */
		dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	RenderTargetBase.prototype.isRenderTarget = true;

	/**
	 * Render Buffer can be attached to RenderTarget.
	 * @extends EventDispatcher
	 */
	class RenderBuffer extends EventDispatcher {
		/**
		 * @param {number} width - The width of the render buffer.
		 * @param {number} height - The height of the render buffer.
		 * @param {PIXEL_FORMAT} [format=PIXEL_FORMAT.RGBA8] - The internal format of the render buffer.
		 * @param {number} [multipleSampling=0] - If bigger than zero, this renderBuffer will support multipleSampling. (Only usable in WebGL 2.0)
		 */
		constructor(width, height, format = PIXEL_FORMAT.RGBA8, multipleSampling = 0) {
			super();

			/**
			 * The width of the render buffer.
			 * @type {number}
			 */
			this.width = width;

			/**
			 * The height of the render buffer.
			 * @type {number}
			 */
			this.height = height;

			/**
			 * Render buffer texel storage data format.
			 * DEPTH_COMPONENT16: for depth attachments.
			 * DEPTH_STENCIL: for depth stencil attachments.
			 * RGBA8：for multiple sampled color attachments.
			 * DEPTH_COMPONENT16: for multiple sampled depth attachments.
			 * DEPTH24_STENCIL8: for multiple sampled depth stencil attachments.
			 * @type {PIXEL_FORMAT}
			 * @default PIXEL_FORMAT.RGBA8
			 */
			this.format = format;

			/**
			 * If bigger than zero, this renderBuffer will support multipleSampling. (Only usable in WebGL 2.0)
			 * A Render Target's attachments must have the same multipleSampling value.
			 * Texture can't be attached to the same render target with a multiple sampled render buffer.
			 * Max support 8.
			 * @type {number}
			 * @default 0
			 */
			this.multipleSampling = multipleSampling;
		}

		/**
		 * Resize the render buffer.
		 * @param {number} width - The width of the render buffer.
		 * @param {number} height - The height of the render buffer.
		 * @returns {boolean} - If size changed.
		 */
		resize(width, height) {
			if (this.width !== width || this.height !== height) {
				this.dispose();
				this.width = width;
				this.height = height;
				return true;
			}
			return false;
		}

		/**
		 * Returns a clone of this render buffer.
		 * @returns {RenderBuffer}
		 */
		clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * Copy the given render buffer into this render buffer.
		 * @param {RenderBuffer} source - The render buffer to be copied.
		 * @returns {RenderBuffer}
		 */
		copy(source) {
			this.format = source.format;
			this.multipleSampling = source.multipleSampling;
			return this;
		}

		/**
		 * Dispatches a dispose event.
		 */
		dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	RenderBuffer.prototype.isRenderBuffer = true;

	let _textureId = 0;

	/**
	 * Create a texture to apply to a surface or as a reflection or refraction map.
	 * @abstract
	 * @extends EventDispatcher
	 */
	class TextureBase extends EventDispatcher {
		constructor() {
			super();

			/**
			 * Unique number for this texture instance.
			 * @readonly
			 * @type {number}
			 */
			this.id = _textureId++;

			/**
			 * An object that can be used to store custom data about the {@link TextureBase}.
			 * It should not hold references to functions as these will not be cloned.
			 * @type {object}
			 * @default {}
			 */
			this.userData = {};

			/**
			 * Array of user-specified mipmaps (optional).
			 * @type {HTMLImageElement[] | object[]}
			 * @default []
			 */
			this.mipmaps = [];

			/**
			 * WebGLTexture border.
			 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D WebGLTexture texImage2D()}.
			 * Must be zero.
			 * @type {number}
			 */
			this.border = 0;

			/**
			 * WebGLTexture texel data format.
			 * @type {PIXEL_FORMAT}
			 * @default PIXEL_FORMAT.RGBA
			 */
			this.format = PIXEL_FORMAT.RGBA;

			/**
			 * The default value is null, the texture's internal format will be obtained using a combination of .format and .type.
			 * Users can also specify a specific internalFormat.
			 * @type {null | PIXEL_FORMAT}
			 * @default null
			 */
			this.internalformat = null;

			/**
			 * WebGLTexture texel data type.
			 * @type {PIXEL_TYPE}
			 * @default PIXEL_TYPE.UNSIGNED_BYTE
			 */
			this.type = PIXEL_TYPE.UNSIGNED_BYTE;

			/**
			 * How the texture is sampled when a texel covers more than one pixel.
			 * @type {TEXTURE_FILTER}
			 * @default TEXTURE_FILTER.LINEAR
			 */
			this.magFilter = TEXTURE_FILTER.LINEAR;

			/**
			 * How the texture is sampled when a texel covers less than one pixel.
			 * @type {TEXTURE_FILTER}
			 * @default TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR
			 */
			this.minFilter = TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;

			/**
			 * This defines how the texture is wrapped horizontally and corresponds to U in UV mapping.
			 * @type {TEXTURE_WRAP}
			 * @default TEXTURE_WRAP.CLAMP_TO_EDGE
			 */
			this.wrapS = TEXTURE_WRAP.CLAMP_TO_EDGE;

			/**
			 * This defines how the texture is wrapped vertically and corresponds to V in UV mapping.
			 * @type {TEXTURE_WRAP}
			 * @default TEXTURE_WRAP.CLAMP_TO_EDGE
			 */
			this.wrapT = TEXTURE_WRAP.CLAMP_TO_EDGE;

			/**
			 * The number of samples taken along the axis through the pixel that has the highest density of texels.
			 * A higher value gives a less blurry result than a basic mipmap, at the cost of more texture samples being used.
			 * Use {@link WebGLcapabilities#maxAnisotropy} to find the maximum valid anisotropy value for the GPU; this value is usually a power of 2.
			 * @type {number}
			 * @default 1
			 */
			this.anisotropy = 1;

			/**
			 * Use for shadow sampler (WebGL 2.0 Only).
			 * @type {COMPARE_FUNC | undefined}
			 * @default undefined
			 */
			this.compare = undefined;

			/**
			 * Whether to generate mipmaps (if possible) for a texture.
			 * Set this to false if you are creating mipmaps manually.
			 * @type {boolean}
			 * @default true
			 */
			this.generateMipmaps = true;

			/**
			 * texture pixel encoding.
			 * @type {TEXEL_ENCODING_TYPE}
			 * @default TEXEL_ENCODING_TYPE.LINEAR
			 */
			this.encoding = TEXEL_ENCODING_TYPE.LINEAR;

			/**
			 * If set to true, the texture is flipped along the vertical axis when uploaded to the GPU.
			 * Default is true to flips the image's Y axis to match the WebGL texture coordinate space.
			 * Note that this property has no effect for ImageBitmap. You need to configure on bitmap creation instead.
			 * @type {boolean}
			 * @default true
			 */
			this.flipY = true;

			/**
			 * If set to true, the alpha channel, if present, is multiplied into the color channels when the texture is uploaded to the GPU.
			 * Note that this property has no effect for ImageBitmap. You need to configure on bitmap creation instead.
			 * @type {boolean}
			 * @default false
			 */
			this.premultiplyAlpha = false;

			/**
			 * Specifies the alignment requirements for the start of each pixel row in memory.
			 * The allowable values are 1 (byte-alignment), 2 (rows aligned to even-numbered bytes), 4 (word-alignment), and 8 (rows start on double-word boundaries).
			 * @type {number}
			 * @default 4
			 */
			this.unpackAlignment = 4;

			/**
			 * version code increse if texture changed.
			 * if version is still 0, this texture will be skiped.
			 * @type {number}
			 * @default 0
			 */
			this.version = 0;
		}

		/**
		 * Returns a clone of this texture.
		 * @returns {TextureBase}
		 */
		clone() {
			return new this.constructor().copy(this);
		}

		/**
		 * Copy the given texture into this texture.
		 * @param {TextureBase} source - The texture to be copied.
		 * @returns {TextureBase}
		 */
		copy(source) {
			this.userData = cloneJson(source.userData);
			this.mipmaps = source.mipmaps.slice(0);
			this.border = source.border;
			this.format = source.format;
			this.internalformat = source.internalformat;
			this.type = source.type;
			this.magFilter = source.magFilter;
			this.minFilter = source.minFilter;
			this.wrapS = source.wrapS;
			this.wrapT = source.wrapT;
			this.anisotropy = source.anisotropy;
			this.compare = source.compare;
			this.generateMipmaps = source.generateMipmaps;
			this.encoding = source.encoding;
			this.flipY = source.flipY;
			this.premultiplyAlpha = source.premultiplyAlpha;
			this.unpackAlignment = source.unpackAlignment;
			this.version = source.version;
			return this;
		}

		/**
		 * Dispatches a dispose event.
		 */
		dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
			this.version = 0;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	TextureBase.prototype.isTexture = true;

	/**
	 * Creates a 2d texture.
	 * @extends TextureBase
	 */
	class Texture2D extends TextureBase {
		constructor() {
			super();

			/**
			 * Image data for this texture.
			 * @type {null | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | object}
			 * @default null
			 */
			this.image = null;
		}

		/**
		 * Copy the given 2d texture into this texture.
		 * @param {Texture2D} source - The 2d texture to be copied.
		 * @returns {Texture2D}
		 */
		copy(source) {
			super.copy(source);
			this.image = source.image;
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Texture2D.prototype.isTexture2D = true;

	/**
	 * Render Target that render to 2d texture.
	 * @extends RenderTargetBase
	 */
	class RenderTarget2D extends RenderTargetBase {
		/**
		 * @param {number} width - The width of the render target.
		 * @param {number} height - The height of the render target.
		 */
		constructor(width, height) {
			super(width, height);
			this._attachments = {};
			this.attach(new Texture2D(), ATTACHMENT.COLOR_ATTACHMENT0);
			this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

			/**
			 * Specifies the active mipmap level.
			 * This is only available in WebGL2.
			 * @type {number}
			 * @default 0
			 */
			this.activeMipmapLevel = 0;
		}

		/**
		 * Attach a texture(RTT) or renderbuffer to the framebuffer.
		 * Notice: For now, dynamic Attachment during rendering is not supported.
		 * @param	{Texture2D|RenderBuffer} target
		 * @param	{ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
			if (target.isTexture2D) {
				if (target.image && target.image.rtt) {
					if (target.image.width !== this.width || target.image.height !== this.height) {
						target.version++;
						target.image.width = this.width;
						target.image.height = this.height;
					}
				} else {
					target.version++;
					target.image = {
						rtt: true,
						data: null,
						width: this.width,
						height: this.height
					};
				}
			} else {
				target.resize(this.width, this.height);
			}
			this._attachments[attachment] = target;
		}

		/**
		 * Detach a texture(RTT) or renderbuffer.
		 * @param	{ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		detach(attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
			delete this._attachments[attachment];
		}

		/**
		 * @override
		 */
		resize(width, height) {
			const changed = super.resize(width, height);
			if (changed) {
				this.dispose(false);
				for (const attachment in this._attachments) {
					const target = this._attachments[attachment];
					if (target.isTexture2D) {
						target.image = {
							rtt: true,
							data: null,
							width: this.width,
							height: this.height
						};
						target.version++;
					} else {
						target.resize(width, height);
					}
				}
			}
			return changed;
		}

		/**
		 * Dispose the render target.
		 * @param {boolean} [disposeAttachments=true] whether to dispose textures and render buffers attached on this render target.
		 */
		dispose(disposeAttachments = true) {
			super.dispose();
			if (disposeAttachments) {
				for (const attachment in this._attachments) {
					this._attachments[attachment].dispose();
				}
			}
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	RenderTarget2D.prototype.isRenderTarget2D = true;
	Object.defineProperties(RenderTarget2D.prototype, {
		texture: {
			set: function (texture) {
				if (texture) {
					if (texture.isTexture2D) {
						this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
					}
				} else {
					this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
				}
			},
			get: function () {
				const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
				return target.isTexture2D ? target : null;
			}
		}
	});

	/**
	 * Creates a 2d texture. (WebGL 2.0)
	 * @extends TextureBase
	 */
	class Texture2DArray extends TextureBase {
		constructor() {
			super();

			/**
			 * Image data for this texture.
			 * @type {object}
			 * @default null
			 */
			this.image = {
				data: new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
				width: 2,
				height: 2,
				depth: 2
			};

			/**
			 * @default PIXEL_FORMAT.RED
			 */
			this.format = PIXEL_FORMAT.RED;

			/**
			 * @default TEXTURE_FILTER.NEAREST
			 */
			this.magFilter = TEXTURE_FILTER.NEAREST;

			/**
			 * @default TEXTURE_FILTER.NEAREST
			 */
			this.minFilter = TEXTURE_FILTER.NEAREST;

			/**
			 * @default false
			 */
			this.generateMipmaps = false;

			/**
			 * @default false
			 */
			this.flipY = false;

			/**
			 * @default 1
			 */
			this.unpackAlignment = 1;

			/**
			 * A set of all layers which need to be updated in the texture.
			 * @type {Set}
			 */
			this.layerUpdates = new Set();
		}

		/**
		 * Copy the given 2d texture into this texture.
		 * @param {Texture2DArray} source - The 2d texture to be copied.
		 * @returns {Texture2DArray}
		 */
		copy(source) {
			super.copy(source);
			this.image = source.image;
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Texture2DArray.prototype.isTexture2DArray = true;

	/**
	 * Render Target that render to 2d array texture.
	 * @extends RenderTargetBase
	 */
	class RenderTarget2DArray extends RenderTargetBase {
		/**
		 * @param {number} width - The width of the render target.
		 * @param {number} height - The height of the render target.
		 * @param {number} depth - The depth of the render target.
		 */
		constructor(width, height, depth) {
			super(width, height);
			this.depth = depth;
			this._attachments = {};
			this.attach(new Texture2DArray(), ATTACHMENT.COLOR_ATTACHMENT0);

			/**
			 * Specifies the layer.
			 * This is only available in WebGL2.
			 * @type {number}
			 * @default 0
			 */
			this.activeLayer = 0;

			/**
			 * Specifies the active mipmap level.
			 * This is only available in WebGL2.
			 * @type {number}
			 * @default 0
			 */
			this.activeMipmapLevel = 0;
		}

		/**
		 * Attach a texture(RTT) or renderbuffer to the framebuffer.
		 * Notice: For now, dynamic Attachment during rendering is not supported.
		 * @param	{Texture2DArray|RenderBuffer} target
		 * @param	{ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
			if (target.isTexture2DArray) {
				if (target.image && target.image.rtt) {
					if (target.image.width !== this.width || target.image.height !== this.height || target.image.depth !== this.depth) {
						target.version++;
						target.image.width = this.width;
						target.image.height = this.height;
						target.image.depth = this.depth;
					}
				} else {
					target.version++;
					target.image = {
						rtt: true,
						data: null,
						width: this.width,
						height: this.height,
						depth: this.depth
					};
				}
			} else {
				target.resize(this.width, this.height);
			}
			this._attachments[attachment] = target;
		}

		/**
		 * Detach a texture(RTT) or renderbuffer.
		 * @param	{ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		detach(attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
			delete this._attachments[attachment];
		}

		/**
		 * Resize the render target.
		 * @param {number} width - The width of the render target.
		 * @param {number} height - The height of the render target.
		 * @param {number} depth - The depth of the render target.
		 * @returns {boolean} - If size changed.
		 */
		resize(width, height, depth) {
			let changed = false;
			if (this.width !== width || this.height !== height || this.depth !== depth) {
				this.width = width;
				this.height = height;
				this.depth = depth;
				changed = true;
			}
			if (changed) {
				this.dispose(false);
				for (const attachment in this._attachments) {
					const target = this._attachments[attachment];
					if (target.isTexture2DArray) {
						target.image = {
							rtt: true,
							data: null,
							width: this.width,
							height: this.height,
							depth: this.depth
						};
						target.version++;
					} else {
						target.resize(width, height);
					}
				}
			}
			return changed;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	RenderTarget2DArray.prototype.isRenderTarget2DArray = true;
	Object.defineProperties(RenderTarget2DArray.prototype, {
		texture: {
			set: function (texture) {
				if (texture) {
					if (texture.isTexture2DArray) {
						this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
					}
				} else {
					this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
				}
			},
			get: function () {
				const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
				return target.isTexture2DArray ? target : null;
			}
		}
	});

	/**
	 * Creates a 3D texture. (WebGL 2.0)
	 * @extends TextureBase
	 */
	class Texture3D extends TextureBase {
		constructor() {
			super();

			/**
			 * Image data for this texture.
			 * @type {object}
			 */
			this.image = {
				data: new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]),
				width: 2,
				height: 2,
				depth: 2
			};

			/**
			 * This defines how the texture is wrapped in the depth direction.
			 * @type {TEXTURE_WRAP}
			 * @default TEXTURE_WRAP.CLAMP_TO_EDGE
			 */
			this.wrapR = TEXTURE_WRAP.CLAMP_TO_EDGE;

			/**
			 * @default PIXEL_FORMAT.RED
			 */
			this.format = PIXEL_FORMAT.RED;

			/**
			 * @default PIXEL_TYPE.UNSIGNED_BYTE
			 */
			this.type = PIXEL_TYPE.UNSIGNED_BYTE;

			/**
			 * @default TEXTURE_FILTER.NEAREST
			 */
			this.magFilter = TEXTURE_FILTER.NEAREST;

			/**
			 * @default TEXTURE_FILTER.NEAREST
			 */
			this.minFilter = TEXTURE_FILTER.NEAREST;

			/**
			 * @default false
			 */
			this.generateMipmaps = false;

			/**
			 * @default false
			 */
			this.flipY = false;

			/**
			 * @default 1
			 */
			this.unpackAlignment = 1;
		}

		/**
		 * Copy the given 3d texture into this texture.
		 * @param {Texture3D} source - The 3d texture to be copied.
		 * @returns {Texture3D}
		 */
		copy(source) {
			super.copy(source);
			this.image = source.image;
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Texture3D.prototype.isTexture3D = true;

	/**
	 * Render Target that render to 3d texture.
	 * @extends RenderTargetBase
	 */
	class RenderTarget3D extends RenderTargetBase {
		/**
		 * @param {number} width - The width of the render target.
		 * @param {number} height - The height of the render target.
		 * @param {number} depth - The depth of the render target.
		 */
		constructor(width, height, depth) {
			super(width, height);
			this.depth = depth;
			this._attachments = {};
			this.attach(new Texture3D(), ATTACHMENT.COLOR_ATTACHMENT0);

			/**
			 * Specifies the layer.
			 * This is only available in WebGL2.
			 * @type {number}
			 * @default 0
			 */
			this.activeLayer = 0;

			/**
			 * Specifies the active mipmap level.
			 * This is only available in WebGL2.
			 * @type {number}
			 * @default 0
			 */
			this.activeMipmapLevel = 0;
		}

		/**
		 * Attach a texture(RTT) or renderbuffer to the framebuffer.
		 * Notice: For now, dynamic Attachment during rendering is not supported.
		 * @param	{Texture3D|RenderBuffer} target
		 * @param	{ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
			if (target.isTexture3D) {
				if (target.image && target.image.rtt) {
					if (target.image.width !== this.width || target.image.height !== this.height || target.image.depth !== this.depth) {
						target.version++;
						target.image.width = this.width;
						target.image.height = this.height;
						target.image.depth = this.depth;
					}
				} else {
					target.version++;
					target.image = {
						rtt: true,
						data: null,
						width: this.width,
						height: this.height,
						depth: this.depth
					};
				}
			} else {
				target.resize(this.width, this.height);
			}
			this._attachments[attachment] = target;
		}

		/**
		 * Detach a texture(RTT) or renderbuffer.
		 * @param	{ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		detach(attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
			delete this._attachments[attachment];
		}

		/**
		 * Resize the render target.
		 * @param {number} width - The width of the render target.
		 * @param {number} height - The height of the render target.
		 * @param {number} depth - The depth of the render target.
		 * @returns {boolean} - If size changed.
		 */
		resize(width, height, depth) {
			let changed = false;
			if (this.width !== width || this.height !== height || this.depth !== depth) {
				this.width = width;
				this.height = height;
				this.depth = depth;
				changed = true;
			}
			if (changed) {
				this.dispose(false);
				for (const attachment in this._attachments) {
					const target = this._attachments[attachment];
					if (target.isTexture3D) {
						target.image = {
							rtt: true,
							data: null,
							width: this.width,
							height: this.height,
							depth: this.depth
						};
						target.version++;
					} else {
						target.resize(width, height);
					}
				}
			}
			return changed;
		}

		/**
		 * Dispose the render target.
		 * @param {boolean} [disposeAttachments=true] whether to dispose textures and render buffers attached on this render target.
		 */
		dispose(disposeAttachments = true) {
			super.dispose();
			if (disposeAttachments) {
				for (const attachment in this._attachments) {
					this._attachments[attachment].dispose();
				}
			}
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	RenderTarget3D.prototype.isRenderTarget3D = true;
	Object.defineProperties(RenderTarget3D.prototype, {
		texture: {
			set: function (texture) {
				if (texture) {
					if (texture.isTexture3D) {
						this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
					}
				} else {
					this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
				}
			},
			get: function () {
				const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
				return target.isTexture3D ? target : null;
			}
		}
	});

	/**
	 * Render Target that render to canvas element.
	 * @extends RenderTargetBase
	 */
	class RenderTargetBack extends RenderTargetBase {
		/**
		 * @param {HTMLCanvasElement} view - The canvas element which the Render Target rendered to.
		 */
		constructor(view) {
			super(view.width, view.height);

			/**
			 * The canvas element which the Render Target rendered to.
			 * @type {HTMLCanvasElement}
			 */
			this.view = view;
		}
		resize(width, height) {
			this.view.width = width;
			this.view.height = height;
			this.width = width;
			this.height = height;
		}
		dispose() {
			// TODO dispose canvas?
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	RenderTargetBack.prototype.isRenderTargetBack = true;

	/**
	 * Creates a cube texture.
	 * @extends TextureBase
	 */
	class TextureCube extends TextureBase {
		constructor() {
			super();

			/**
			 * Images data for this texture.
			 * @type {HTMLImageElement[]}
			 * @default []
			 */
			this.images = [];

			/**
			 * @default false
			 */
			this.flipY = false;
		}

		/**
		 * Copy the given cube texture into this texture.
		 * @param {TextureCube} source - The cube texture to be copied.
		 * @returns {TextureCube}
		 */
		copy(source) {
			super.copy(source);
			this.images = source.images.slice(0);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	TextureCube.prototype.isTextureCube = true;

	/**
	 * Render Target that render to cube texture.
	 * @extends RenderTargetBase
	 */
	class RenderTargetCube extends RenderTargetBase {
		/**
		 * @param {number} width - The width of the render target.
		 * @param {number} height - The height of the render target.
		 */
		constructor(width, height) {
			super(width, height);
			this._attachments = {};
			this.attach(new TextureCube(), ATTACHMENT.COLOR_ATTACHMENT0);
			this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

			/**
			 * The activeCubeFace property corresponds to a cube side (PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5).
			 * @type {number}
			 * @default 0
			 */
			this.activeCubeFace = 0;

			/**
			 * Specifies the active mipmap level.
			 * This is only available in WebGL2.
			 * @type {number}
			 * @default 0
			 */
			this.activeMipmapLevel = 0;
		}

		/**
		 * Attach a texture(RTT) or renderbuffer to the framebuffer.
		 * Notice: For now, dynamic Attachment during rendering is not supported.
		 * @param	{TextureCube|RenderBuffer} target
		 * @param	{ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		attach(target, attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
			if (target.isTextureCube) {
				let changed = false;
				for (let i = 0; i < 6; i++) {
					if (target.images[i] && target.images[i].rtt) {
						if (target.images[i].width !== this.width || target.images[i].height !== this.height) {
							target.images[i].width = this.width;
							target.images[i].height = this.height;
							changed = true;
						}
					} else {
						target.images[i] = {
							rtt: true,
							data: null,
							width: this.width,
							height: this.height
						};
						changed = true;
					}
				}
				if (changed) {
					target.version++;
				}
			} else {
				target.resize(this.width, this.height);
			}
			this._attachments[attachment] = target;
		}

		/**
		 * Detach a texture(RTT) or renderbuffer.
		 * @param	{ATTACHMENT} [attachment=ATTACHMENT.COLOR_ATTACHMENT0]
		 */
		detach(attachment = ATTACHMENT.COLOR_ATTACHMENT0) {
			delete this._attachments[attachment];
		}

		/**
		 * @override
		 */
		resize(width, height) {
			const changed = super.resize(width, height);
			if (changed) {
				this.dispose(false);
				for (const attachment in this._attachments) {
					const target = this._attachments[attachment];
					if (target.isTextureCube) {
						for (let i = 0; i < 6; i++) {
							target.images[i] = {
								rtt: true,
								data: null,
								width: this.width,
								height: this.height
							};
						}
						target.version++;
					} else {
						target.resize(width, height);
					}
				}
			}
		}

		/**
		 * Dispose the render target.
		 * @param {boolean} [disposeAttachments=true] whether to dispose textures and render buffers attached on this render target.
		 */
		dispose(disposeAttachments = true) {
			super.dispose();
			if (disposeAttachments) {
				for (const attachment in this._attachments) {
					this._attachments[attachment].dispose();
				}
			}
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	RenderTargetCube.prototype.isRenderTargetCube = true;
	Object.defineProperties(RenderTargetCube.prototype, {
		texture: {
			set: function (texture) {
				if (texture) {
					if (texture.isTextureCube) {
						this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
					}
				} else {
					this.detach(ATTACHMENT.COLOR_ATTACHMENT0);
				}
			},
			get: function () {
				const target = this._attachments[ATTACHMENT.COLOR_ATTACHMENT0];
				return target.isTextureCube ? target : null;
			}
		}
	});

	let _queryId = 0;

	/**
	 * A Query object provides single unified API for using WebGL asynchronus queries,
	 * which include query objects ('Occlusion' and 'Transform Feedback') and timer queries.
	 * @extends EventDispatcher
	 */
	class Query extends EventDispatcher {
		constructor() {
			super();
			this.id = _queryId++;
		}

		/**
		 * Disposes the Query object.
		 * Rejects any pending query.
		 */
		dispose() {
			this.dispatchEvent({
				type: 'dispose'
			});
		}
	}

	/**
	 * This class is designed to assist with raycasting. Raycasting is used for
	 * mouse picking (working out what objects in the 3d space the mouse is over)
	 * amongst other things.
	 */
	class Raycaster {
		/**
		 * Constructs a new raycaster.
		 * @param {Vector3} origin — The origin vector where the ray casts from.
		 * @param {Vector3} direction — The (normalized) direction vector that gives direction to the ray.
		 */
		constructor(origin, direction) {
			/**
			 * The ray used for raycasting.
			 * @type {Ray}
			 */
			this.ray = new Ray(origin, direction);
		}

		/**
		 * Updates the ray with a new origin and direction by copying the values from the arguments.
		 * @param {Vector3} origin — The origin vector where the ray casts from.
		 * @param {Vector3} direction — The (normalized) direction vector that gives direction to the ray.
		 */
		set(origin, direction) {
			// direction is assumed to be normalized (for accurate distance calculations)
			this.ray.set(origin, direction);
		}

		/**
		 * Uses the given coordinates and camera to compute a new origin and direction for the internal ray.
		 * @param {Vector2} coords — 2D coordinates of the mouse, in normalized device coordinates (NDC).
		 * X and Y components should be between `-1` and `1`.
		 * @param {Camera} camera — The camera from which the ray should originate.
		 */
		setFromCamera(coords, camera) {
			if (camera.projectionMatrix.elements[11] === -1) {
				// perspective
				this.ray.origin.setFromMatrixPosition(camera.worldMatrix);
				this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(this.ray.origin).normalize();
			} else {
				// orthographic
				// set origin in plane of camera
				// projectionMatrix.elements[14] = (near + far) / (near - far)
				this.ray.origin.set(coords.x, coords.y, camera.projectionMatrix.elements[14]).unproject(camera);
				this.ray.direction.set(0, 0, -1).transformDirection(camera.worldMatrix);
			}
		}

		/**
		 * Checks all intersection between the ray and the object with or without the
		 * descendants. Intersections are returned sorted by distance, closest first.
		 * An array of intersections is returned: [ { distance, point, face, faceIndex, object, uv }, ... ]
		 * @param {Object3D} object — The 3D object to check for intersection with the ray.
		 * @param {boolean} [recursive=false] — If set to `true`, it also checks all descendants.
		 * Otherwise it only checks intersection with the object.
		 * @param {object[]} [intersects=[]] - The target array that holds the result of the method.
		 * @returns {object[]} An array holding the intersection points.
		 */
		intersectObject(object, recursive = false, intersects = []) {
			intersect(object, this, intersects, recursive);
			intersects.sort(ascSort);
			return intersects;
		}

		/**
		 * Checks all intersection between the ray and the objects with or without
		 * the descendants. Intersections are returned sorted by distance, closest first.
		 * An array of intersections is returned: [ { distance, point, face, faceIndex, object, uv }, ... ]
		 * @param {Object3D[]} objects — The 3D objects to check for intersection with the ray.
		 * @param {boolean} [recursive=false] — If set to `true`, it also checks all descendants.
		 * Otherwise it only checks intersection with the object.
		 * @param {object[]} [intersects=[]] - The target array that holds the result of the method.
		 * @returns {object[]} An array holding the intersection points.
		 */
		intersectObjects(objects, recursive = false, intersects = []) {
			for (let i = 0, l = objects.length; i < l; i++) {
				intersect(objects[i], this, intersects, recursive);
			}
			intersects.sort(ascSort);
			return intersects;
		}
	}
	function ascSort(a, b) {
		return a.distance - b.distance;
	}
	function intersect(object, raycaster, intersects, recursive) {
		let propagate = true;
		const result = object.raycast(raycaster.ray, intersects);
		if (result === false) propagate = false;
		if (propagate === true && recursive === true) {
			const children = object.children;
			for (let i = 0, l = children.length; i < l; i++) {
				intersect(children[i], raycaster, intersects, true);
			}
		}
	}

	const _offsetMatrix = new Matrix4();

	/**
	 * Use an array of bones to create a skeleton that can be used by a {@link SkinnedMesh}.
	 */
	class Skeleton {
		/**
		 * @param {Bone[]} bones
		 * @param {Matrix4[]} boneInverses
		 */
		constructor(bones, boneInverses) {
			/**
			 * The array of bones.
			 * @type {Bone[]}
			 */
			this.bones = bones.slice(0);

			/**
			 * An array of Matrix4s that represent the inverse of the worldMatrix of the individual bones.
			 * @type {Matrix4[]}
			 */
			this.boneInverses = boneInverses;

			/**
			 * The array buffer holding the bone data.
			 * @type {Float32Array}
			 */
			this.boneMatrices = new Float32Array(16 * this.bones.length);

			/**
			 * The {@link Texture2D} holding the bone data when using a vertex texture.
			 * Use vertex texture to update boneMatrices, by that way, we can use more bones on phone.
			 * @type {Texture2D|undefined}
			 * @default undefined
			 */
			this.boneTexture = undefined;
			this._version = 0;
		}

		/**
		 * Returns the skeleton to the base pose.
		 */
		pose() {
			const boneInverses = this.boneInverses;
			for (let i = 0; i < this.bones.length; i++) {
				const bone = this.bones[i];
				bone.worldMatrix.copy(boneInverses[i]).invert();
			}
			for (let i = 0; i < this.bones.length; i++) {
				const bone = this.bones[i];
				if (bone.parent && bone.parent.isBone) {
					bone.matrix.copy(bone.parent.worldMatrix).invert();
					bone.matrix.multiply(bone.worldMatrix);
				} else {
					bone.matrix.copy(bone.worldMatrix);
				}
				bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);
			}
		}

		/**
		 * Clone skeleton.
		 * @returns {Skeleton}
		 */
		clone() {
			return new Skeleton(this.bones, this.boneInverses);
		}

		/**
		 * Updates the boneMatrices and boneTexture after changing the bones.
		 * This is called automatically if the skeleton is used with a SkinnedMesh.
		 * @ignore
		 */
		updateBones(sceneData) {
			const useAnchorMatrix = sceneData.useAnchorMatrix;
			const anchorMatrixInverse = sceneData.anchorMatrixInverse;
			const boneInverses = this.boneInverses;
			for (let i = 0; i < this.bones.length; i++) {
				const bone = this.bones[i];
				_offsetMatrix.multiplyMatrices(bone.worldMatrix, boneInverses[i]);
				if (useAnchorMatrix) {
					_offsetMatrix.premultiply(anchorMatrixInverse);
				}
				_offsetMatrix.toArray(this.boneMatrices, i * 16);
			}
			if (this.boneTexture !== undefined) {
				this.boneTexture.version++;
			}
		}
		generateBoneTexture() {
			let size = MathUtils.nextPowerOfTwoSquareSize(this.bones.length * 4);
			size = Math.max(size, 4);
			const boneMatrices = new Float32Array(size * size * 4);
			boneMatrices.set(this.boneMatrices);
			const boneTexture = new Texture2D();
			boneTexture.image = {
				data: boneMatrices,
				width: size,
				height: size
			};
			boneTexture.format = PIXEL_FORMAT.RGBA;
			boneTexture.type = PIXEL_TYPE.FLOAT;
			boneTexture.magFilter = TEXTURE_FILTER.NEAREST;
			boneTexture.minFilter = TEXTURE_FILTER.NEAREST;
			boneTexture.generateMipmaps = false;
			boneTexture.flipY = false;
			this.boneMatrices = boneMatrices;
			this.boneTexture = boneTexture;
		}
	}

	/**
	 * This light globally illuminates all objects in the scene equally.
	 * This light cannot be used to cast shadows as it does not have a direction.
	 * @extends Light
	 */
	class AmbientLight extends Light {
		/**
		 * @param {number} [color=0xffffff]
		 * @param {number} [intensity=1]
		 */
		constructor(color, intensity) {
			super(color, intensity);
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	AmbientLight.prototype.isAmbientLight = true;

	/**
	 * Serves as a base class for the other shadow classes.
	 * @abstract
	 */
	class LightShadow {
		constructor() {
			/**
			 * The light's view of the world.
			 * This is used to generate a depth map of the scene; objects behind other objects from the light's perspective will be in shadow.
			 * @type {Camera}
			 */
			this.camera = new Camera();

			/**
			 * Model to shadow camera space, to compute location and depth in shadow map. Stored in a {@link Matrix4}.
			 * This is computed internally during rendering.
			 * @type {Matrix4}
			 */
			this.matrix = new Matrix4();

			/**
			 * Shadow map bias, how much to add or subtract from the normalized depth when deciding whether a surface is in shadow.
			 * Very tiny adjustments here (in the order of 0.0001) may help reduce artefacts in shadows.
			 * @type {number}
			 * @default 0
			 */
			this.bias = 0;

			/**
			 * Defines how much the position used to query the shadow map is offset along the object normal.
			 * Increasing this value can be used to reduce shadow acne especially in large scenes where light shines onto geometry at a shallow angle.
			 * The cost is that shadows may appear distorted.
			 * @type {number}
			 * @default 0
			 */
			this.normalBias = 0;

			/**
			 * Setting this to values greater than 1 will blur the edges of the shadow.
			 * High values will cause unwanted banding effects in the shadows - a greater mapSize will allow for a higher value to be used here before these effects become visible.
			 * Note that this has no effect if the {@link Object3D#shadowType} is set to PCF or PCSS.
			 * @type {number}
			 * @default 1
			 */
			this.radius = 1;

			/**
			 * Shadow camera near.
			 * @type {number}
			 * @default 1
			 */
			this.cameraNear = 1;

			/**
			 * Shadow camera far.
			 * @type {number}
			 * @default 500
			 */
			this.cameraFar = 500;

			/**
			 * A {@link Vector2} defining the width and height of the shadow map.
			 * Higher values give better quality shadows at the cost of computation time.
			 * Values must be powers of 2.
			 * @type {Vector2}
			 * @default Vector2(512, 512)
			 */
			this.mapSize = new Vector2(512, 512);

			/**
			 * Enables automatic updates of the light's shadow.
			 * If you do not require dynamic lighting / shadows, you may set this to false.
			 * @type {boolean}
			 * @default true
			 */
			this.autoUpdate = true;

			/**
			 * When set to true, shadow maps will be updated in the next ShadowMapPass.render call.
			 * If you have set .autoUpdate to false, you will need to set this property to true and then make a ShadowMapPass.render call to update the light's shadow.
			 * @type {boolean}
			 * @default false
			 */
			this.needsUpdate = false;
			this.renderTarget = null;
			this.map = null;
			this.depthMap = null;
		}
		update(light, face) {}
		updateMatrix() {
			const matrix = this.matrix;
			const camera = this.camera;

			// matrix * 0.5 + 0.5, after identity, range is 0 ~ 1 instead of -1 ~ 1
			matrix.set(0.5, 0.0, 0.0, 0.5, 0.0, 0.5, 0.0, 0.5, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0, 1.0);
			matrix.multiply(camera.projectionMatrix);
			matrix.multiply(camera.viewMatrix);
		}
		copy(source) {
			this.camera.copy(source.camera);
			this.matrix.copy(source.matrix);
			this.bias = source.bias;
			this.normalBias = source.normalBias;
			this.radius = source.radius;
			this.cameraNear = source.cameraNear;
			this.cameraFar = source.cameraFar;
			this.mapSize.copy(source.mapSize);
			return this;
		}
		clone() {
			return new this.constructor().copy(this);
		}
		prepareDepthMap(_enable, _capabilities) {}
	}

	/**
	 * This is used internally by DirectionalLights for calculating shadows.
	 * @extends LightShadow
	 */
	class DirectionalLightShadow extends LightShadow {
		constructor() {
			super();

			/**
			 * The cast shadow window size.
			 * @type {number}
			 * @default 500
			 */
			this.windowSize = 500;

			/**
			 * Controls the extent to which the shadows fade out at the edge of the frustum.
			 * If the value is greater than 0, the shadow fades out from center to all sides of shadow texture (radial fade out),
			 * if the value is less than 0, the shadow will fade out from the y+ direction (vertical fade out).
			 * @type {number}
			 * @default 0
			 */
			this.frustumEdgeFalloff = 0.0;
			this.renderTarget = new RenderTarget2D(this.mapSize.x, this.mapSize.y);
			const map = this.renderTarget.texture;
			map.generateMipmaps = false;
			map.minFilter = TEXTURE_FILTER.NEAREST;
			map.magFilter = TEXTURE_FILTER.NEAREST;
			const depthTexture = new Texture2D();
			depthTexture.type = PIXEL_TYPE.UNSIGNED_INT;
			depthTexture.format = PIXEL_FORMAT.DEPTH_COMPONENT;
			depthTexture.magFilter = TEXTURE_FILTER.LINEAR;
			depthTexture.minFilter = TEXTURE_FILTER.LINEAR;
			depthTexture.compare = COMPARE_FUNC.LESS;
			depthTexture.generateMipmaps = false;
			const depthBuffer = new RenderBuffer(this.mapSize.x, this.mapSize.y, PIXEL_FORMAT.DEPTH_COMPONENT16);
			this.renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
			this.renderTarget.attach(depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
			this.map = map;
			this.depthMap = depthTexture;
			this._depthBuffer = depthBuffer;
		}
		update(light) {
			this._updateCamera(light);
			if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
				this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
			}
		}
		_updateCamera(light) {
			const camera = this.camera;
			camera.matrix.copy(light.worldMatrix);
			camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
			camera.updateMatrix();
			const halfWindowSize = this.windowSize / 2;
			camera.setOrtho(-halfWindowSize, halfWindowSize, -halfWindowSize, halfWindowSize, this.cameraNear, this.cameraFar);
		}
		copy(source) {
			super.copy(source);
			this.windowSize = source.windowSize;
			this.frustumEdgeFalloff = source.frustumEdgeFalloff;
			return this;
		}
		prepareDepthMap(enable, capabilities) {
			const useDepthMap = enable && capabilities.version >= 2;
			const renderTarget = this.renderTarget;
			const attachments = renderTarget._attachments;
			const depthMapAttached = attachments[ATTACHMENT.DEPTH_ATTACHMENT] === this.depthMap;
			if (useDepthMap === depthMapAttached) return;
			if (useDepthMap) {
				if (capabilities.getExtension('OES_texture_float_linear')) {
					this.depthMap.type = PIXEL_TYPE.FLOAT;
				}
				renderTarget.dispose();
				renderTarget.attach(this.depthMap, ATTACHMENT.DEPTH_ATTACHMENT);
			} else {
				renderTarget.dispose();
				renderTarget.attach(this._depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
			}
		}
	}

	/**
	 * A light that gets emitted in a specific direction.
	 * This light will behave as though it is infinitely far away and the rays produced from it are all parallel.
	 * The common use case for this is to simulate daylight; the sun is far enough away that its position can be considered to be infinite, and all light rays coming from it are parallel.
	 * This light can cast shadows - see the {@link DirectionalLightShadow} page for details.
	 * @extends Light
	 */
	class DirectionalLight extends Light {
		/**
		 * @param {number} [color=0xffffff]
		 * @param {number} [intensity=1]
		 */
		constructor(color, intensity) {
			super(color, intensity);

			/**
			 * A {@link DirectionalLightShadow} used to calculate shadows for this light.
			 * @type {DirectionalLightShadow}
			 * @default DirectionalLightShadow()
			 */
			this.shadow = new DirectionalLightShadow();
		}
		copy(source) {
			super.copy(source);
			this.shadow.copy(source.shadow);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	DirectionalLight.prototype.isDirectionalLight = true;

	/**
	 * A light source positioned directly above the scene, with color fading from the sky color to the ground color.
	 * This light cannot be used to cast shadows.
	 * @extends Light
	 */
	class HemisphereLight extends Light {
		/**
		 * @param {number} [skyColor=0xffffff] - Hexadecimal color of the sky.
		 * @param {number} [groundColor=0xffffff] - Hexadecimal color of the ground.
		 * @param {number} [intensity=1] - numeric value of the light's strength/intensity.
		 */
		constructor(skyColor, groundColor, intensity) {
			super(skyColor, intensity);

			/**
			 * Color of the ground.
			 * @type {Color3}
			 * @default Color3(0xffffff)
			 */
			this.groundColor = new Color3(groundColor !== undefined ? groundColor : 0xffffff);
		}
		copy(source) {
			super.copy(source);
			this.groundColor.copy(source.groundColor);
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	HemisphereLight.prototype.isHemisphereLight = true;

	/**
	 * This is used internally by PointLights for calculating shadows.
	 * @extends LightShadow
	 */
	class PointLightShadow extends LightShadow {
		constructor() {
			super();
			this.renderTarget = new RenderTargetCube(this.mapSize.x, this.mapSize.y);
			const map = this.renderTarget.texture;
			map.generateMipmaps = false;
			map.minFilter = TEXTURE_FILTER.NEAREST;
			map.magFilter = TEXTURE_FILTER.NEAREST;
			this.map = map;
			this._targets = [new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1)];
			this._ups = [new Vector3(0, -1, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1), new Vector3(0, -1, 0), new Vector3(0, -1, 0)];
			this._lookTarget = new Vector3();
		}
		update(light, face) {
			this._updateCamera(light, face);
			if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
				this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
			}
		}
		_updateCamera(light, face) {
			const camera = this.camera;
			const lookTarget = this._lookTarget;
			const targets = this._targets;
			const ups = this._ups;

			// set camera position and lookAt(rotation)
			camera.position.setFromMatrixPosition(light.worldMatrix);
			lookTarget.set(targets[face].x + camera.position.x, targets[face].y + camera.position.y, targets[face].z + camera.position.z);
			camera.lookAt(lookTarget, ups[face]);

			// update view matrix
			camera.updateMatrix();

			// update projection
			camera.setPerspective(90 / 180 * Math.PI, 1, this.cameraNear, this.cameraFar);
		}
	}

	/**
	 * A light that gets emitted from a single point in all directions.
	 * A common use case for this is to replicate the light emitted from a bare lightbulb.
	 * This light can cast shadows - see {@link PointLightShadow} page for details.
	 * @extends Light
	 */
	class PointLight extends Light {
		/**
		 * @param {number} [color=0xffffff]
		 * @param {number} [intensity=1]
		 * @param {number} [distance=200]
		 * @param {number} [decay=1]
		 */
		constructor(color, intensity, distance, decay) {
			super(color, intensity);

			/**
			 * The amount the light dims along the distance of the light.
			 * @type {number}
			 * @default 1
			 */
			this.decay = decay !== undefined ? decay : 1;

			/**
			 * The distance from the light where the intensity is 0.
			 * @type {number}
			 * @default 200
			 */
			this.distance = distance !== undefined ? distance : 200;

			/**
			 * A {@link PointLightShadow} used to calculate shadows for this light.
			 * @type {PointLightShadow}
			 * @default PointLightShadow()
			 */
			this.shadow = new PointLightShadow();
		}
		copy(source) {
			super.copy(source);
			this.shadow.copy(source.shadow);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	PointLight.prototype.isPointLight = true;

	/**
	 * This light globally all objects in the scene equally.
	 * This light depends on spherical harmonics.
	 * @extends Light
	 */
	class SphericalHarmonicsLight extends Light {
		/**
		 * Creates a new SphericalHarmonicsLight.
		 * @param {SphericalHarmonics3} [sh = new SphericalHarmonics3()]
		 * @param {number} [intensity = 1]
		 */
		constructor(sh = new SphericalHarmonics3(), intensity = 1) {
			super(undefined, intensity);

			/**
			 * An instance of SphericalHarmonics3.
			 * @type {SphericalHarmonics3}
			 */
			this.sh = sh;
		}
		copy(source) {
			super.copy(source);
			this.sh.copy(source.sh);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	SphericalHarmonicsLight.prototype.isSphericalHarmonicsLight = true;

	/**
	 * This is used internally by SpotLights for calculating shadows.
	 * @extends LightShadow
	 */
	class SpotLightShadow extends LightShadow {
		constructor() {
			super();

			/**
			 * Controls the extent to which the shadows fade out at the edge of the frustum.
			 * @type {number}
			 * @default 0
			 */
			this.frustumEdgeFalloff = 0.0;
			this.renderTarget = new RenderTarget2D(this.mapSize.x, this.mapSize.y);
			const map = this.renderTarget.texture;
			map.generateMipmaps = false;
			map.minFilter = TEXTURE_FILTER.NEAREST;
			map.magFilter = TEXTURE_FILTER.NEAREST;
			const depthTexture = new Texture2D();
			depthTexture.type = PIXEL_TYPE.UNSIGNED_INT;
			depthTexture.format = PIXEL_FORMAT.DEPTH_COMPONENT;
			depthTexture.magFilter = TEXTURE_FILTER.LINEAR;
			depthTexture.minFilter = TEXTURE_FILTER.LINEAR;
			depthTexture.compare = COMPARE_FUNC.LESS;
			depthTexture.generateMipmaps = false;
			const depthBuffer = new RenderBuffer(this.mapSize.x, this.mapSize.y, PIXEL_FORMAT.DEPTH_COMPONENT16);
			this.renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
			this.renderTarget.attach(depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
			this.map = map;
			this.depthMap = depthTexture;
			this._depthBuffer = depthBuffer;
		}
		update(light) {
			this._updateCamera(light);
			if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
				this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
			}
		}
		_updateCamera(light) {
			const camera = this.camera;
			camera.matrix.copy(light.worldMatrix);
			camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
			camera.updateMatrix();
			camera.setPerspective(light.angle * 2, 1, this.cameraNear, this.cameraFar);
		}
		copy(source) {
			super.copy(source);
			this.frustumEdgeFalloff = source.frustumEdgeFalloff;
			return this;
		}
		prepareDepthMap(enable, capabilities) {
			const useDepthMap = enable && capabilities.version >= 2;
			const renderTarget = this.renderTarget;
			const attachments = renderTarget._attachments;
			const depthMapAttached = attachments[ATTACHMENT.DEPTH_ATTACHMENT] === this.depthMap;
			if (useDepthMap === depthMapAttached) return;
			if (useDepthMap) {
				if (capabilities.getExtension('OES_texture_float_linear')) {
					this.depthMap.type = PIXEL_TYPE.FLOAT;
				}
				renderTarget.dispose();
				renderTarget.attach(this.depthMap, ATTACHMENT.DEPTH_ATTACHMENT);
			} else {
				renderTarget.dispose();
				renderTarget.attach(this._depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
			}
		}
	}

	/**
	 * This light gets emitted from a single point in one direction, along a cone that increases in size the further from the light it gets.
	 * This light can cast shadows - see the {@link SpotLightShadow} page for details.
	 * @extends Light
	 */
	class SpotLight extends Light {
		/**
		 * @param {number} [color=0xffffff]
		 * @param {number} [intensity=1]
		 * @param {number} [distance=200]
		 * @param {number} [angle=Math.PI/6]
		 * @param {number} [penumbra=0]
		 * @param {number} [decay=1]
		 */
		constructor(color, intensity, distance, angle, penumbra, decay) {
			super(color, intensity);

			/**
			 * The amount the light dims along the distance of the light.
			 * @type {number}
			 * @default 1
			 */
			this.decay = decay !== undefined ? decay : 1;

			/**
			 * The distance from the light where the intensity is 0.
			 * @type {number}
			 * @default 200
			 */
			this.distance = distance !== undefined ? distance : 200;

			/**
			 * Percent of the spotlight cone that is attenuated due to penumbra.
			 * Takes values between zero and 1.
			 * @type {number}
			 * @default 0
			 */
			this.penumbra = penumbra !== undefined ? penumbra : 0;

			/**
			 * Maximum extent of the spotlight, in radians, from its direction.
			 * Should be no more than Math.PI/2.
			 * @type {number}
			 * @default Math.PI/6
			 */
			this.angle = angle !== undefined ? angle : Math.PI / 6;

			/**
			 * A {@link SpotLightShadow} used to calculate shadows for this light.
			 * @type {SpotLightShadow}
			 * @default SpotLightShadow()
			 */
			this.shadow = new SpotLightShadow();
		}
		copy(source) {
			super.copy(source);
			this.shadow.copy(source.shadow);
			return this;
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	SpotLight.prototype.isSpotLight = true;

	/**
	 * A bone which is part of a Skeleton.
	 * The skeleton in turn is used by the SkinnedMesh.
	 * Bones are almost identical to a blank Object3D.
	 * Bone acturely is a joint.
	 * The position means joint position.
	 * Mesh transform is based this joint space.
	 * @extends Object3D
	 */
	class Bone extends Object3D {
		constructor() {
			super();
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	Bone.prototype.isBone = true;

	/**
	 * A mesh that has a {@link Skeleton} with bones that can then be used to animate the vertices of the geometry.
	 * The material must support skinning.
	 * @extends Mesh
	 */
	class SkinnedMesh extends Mesh {
		constructor(geometry, material) {
			super(geometry, material);

			/**
			 * Skeleton created from the bones of the Geometry.
			 * @type {Skeleton}
			 */
			this.skeleton = undefined;

			/**
			 * Either "attached" or "detached".
			 * "attached" uses the {@link SkinnedMesh#worldMatrix} property for the base transform matrix of the bones.
			 * "detached" uses the {@link SkinnedMesh#bindMatrix}.
			 * @type {string}
			 * @default "attached"
			 */
			this.bindMode = 'attached';

			/**
			 * The base matrix that is used for the bound bone transforms.
			 * @type {Matrix4}
			 */
			this.bindMatrix = new Matrix4();

			/**
			 * The base matrix that is used for resetting the bound bone transforms.
			 * @type {Matrix4}
			 */
			this.bindMatrixInverse = new Matrix4();
		}

		/**
		 * Bind a skeleton to the skinned mesh.
		 * The bindMatrix gets saved to .bindMatrix property and the .bindMatrixInverse gets calculated.
		 * @param {Skeleton} skeleton - Skeleton created from a Bones tree.
		 * @param {Matrix4} [bindMatrix] - Matrix4 that represents the base transform of the skeleton.
		 */
		bind(skeleton, bindMatrix) {
			this.skeleton = skeleton;
			if (bindMatrix === undefined) {
				this.updateMatrix();
				bindMatrix = this.worldMatrix;
			}
			this.bindMatrix.copy(bindMatrix);
			this.bindMatrixInverse.copy(bindMatrix).invert();
		}
		updateMatrix(force) {
			super.updateMatrix(force);
			if (this.bindMode === 'attached') {
				this.bindMatrixInverse.copy(this.worldMatrix).invert();
			} else if (this.bindMode === 'detached') {
				this.bindMatrixInverse.copy(this.bindMatrix).invert();
			} else {
				console.warn('SkinnedMesh: Unrecognized bindMode: ' + this.bindMode);
			}
		}
		copy(source) {
			super.copy(source);
			this.bindMode = source.bindMode;
			this.bindMatrix.copy(source.bindMatrix);
			this.bindMatrixInverse.copy(source.bindMatrixInverse);
			this.skeleton = source.skeleton;
			return this;
		}
		getVertexPosition(index, target) {
			super.getVertexPosition(index, target);
			this.applyBoneTransform(index, target);
			return target;
		}

		/**
		 * Applies the bone transform associated with the given index to the given position vector.
		 * Returns the updated vector.
		 * @param {number} index - The index of the vertex.
		 * @param {Vector3} target - The target vector.
		 * @returns {Vector3} The target vector.
		 */
		applyBoneTransform(index, target) {
			const skeleton = this.skeleton;
			const geometry = this.geometry;
			const skinIndex = geometry.attributes.skinIndex;
			const skinWeight = geometry.attributes.skinWeight;
			_skinIndex.fromArray(skinIndex.buffer.array, index * skinIndex.size);
			_skinWeight.fromArray(skinWeight.buffer.array, index * skinWeight.size);
			_basePosition.copy(target).applyMatrix4(this.bindMatrix);
			target.set(0, 0, 0);
			for (let i = 0; i < 4; i++) {
				const weight = getComponent(_skinWeight, i);
				if (weight < Number.EPSILON) continue;
				const boneIndex = getComponent(_skinIndex, i);
				if (!skeleton.bones[boneIndex]) continue;
				_matrix.multiplyMatrices(skeleton.bones[boneIndex].worldMatrix, skeleton.boneInverses[boneIndex]);
				target.addScaledVector(_vector.copy(_basePosition).applyMatrix4(_matrix), weight);
			}
			return target.applyMatrix4(this.bindMatrixInverse);
		}
	}

	/**
	 * This flag can be used for type testing.
	 * @readonly
	 * @type {boolean}
	 * @default true
	 */
	SkinnedMesh.prototype.isSkinnedMesh = true;
	const _basePosition = new Vector3();
	const _skinIndex = new Vector4();
	const _skinWeight = new Vector4();
	const _vector = new Vector3();
	const _matrix = new Matrix4();
	function getComponent(vec, index) {
		switch (index) {
			case 0:
				return vec.x;
			case 1:
				return vec.y;
			case 2:
				return vec.z;
			case 3:
				return vec.w;
			default:
				throw new Error('index is out of range: ' + index);
		}
	}

	var alphaTest_frag = "#ifdef ALPHATEST\n\tif (outColor.a < u_AlphaTest) discard;\n\toutColor.a = u_Opacity;\n#endif";

	var alphaTest_pars_frag = "#ifdef ALPHATEST\n\tuniform float u_AlphaTest;\n#endif";

	var aoMap_pars_frag = "#ifdef USE_AOMAP\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n\tvarying vec2 vAOMapUV;\n#endif";

	var aoMap_pars_vert = "#ifdef USE_AOMAP\n\tuniform mat3 aoMapUVTransform;\n\tvarying vec2 vAOMapUV;\n#endif";

	var aoMap_vert = "#ifdef USE_AOMAP\n\tvAOMapUV = (aoMapUVTransform * vec3(AOMAP_UV, 1.)).xy;\n#endif";

	var aoMap_frag = "\n#ifdef USE_AOMAP\n		float ambientOcclusion = (texture2D(aoMap, vAOMapUV).r - 1.0) * aoMapIntensity + 1.0;\n		\n		reflectedLight.indirectDiffuse *= ambientOcclusion;\n		#if defined(USE_ENV_MAP) && defined(USE_PBR)\n				float dotNV = saturate(dot(N, V));\n				reflectedLight.indirectSpecular *= computeSpecularOcclusion(dotNV, ambientOcclusion, roughness);\n		#endif\n#endif";

	var begin_frag = "vec4 outColor = vec4(u_Color, u_Opacity);";

	var begin_vert = "vec3 transformed = vec3(a_Position);\nvec3 objectNormal = vec3(a_Normal);\n#ifdef USE_TANGENT\n		vec3 objectTangent = vec3(a_Tangent.xyz);\n#endif";

	var bsdfs = "\nvec3 BRDF_Diffuse_Lambert(vec3 diffuseColor) {\n		return RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick(const in vec3 specularColor, const in float dotLH) {\n\tfloat fresnel = exp2((-5.55473 * dotLH - 6.98316) * dotLH);\n\treturn (1.0 - specularColor) * fresnel + specularColor;\n}\nfloat D_BlinnPhong(const in float shininess, const in float dotNH) {\n\treturn RECIPROCAL_PI * (shininess * 0.5 + 1.0) * pow(dotNH, shininess);\n}\nfloat G_BlinnPhong_Implicit() {\n\treturn 0.25;\n}\nvec3 BRDF_Specular_BlinnPhong(vec3 specularColor, vec3 N, vec3 L, vec3 V, float shininess) {\n		vec3 H = normalize(L + V);\n		float dotNH = saturate(dot(N, H));\n		float dotLH = saturate(dot(L, H));\n		vec3 F = F_Schlick(specularColor, dotLH);\n		float G = G_BlinnPhong_Implicit();\n		float D = D_BlinnPhong(shininess, dotNH);\n		return F * G * D;\n}\nfloat D_GGX(const in float alpha, const in float dotNH) {\n\tfloat a2 = pow2(alpha);\n\tfloat denom = pow2(dotNH) * (a2 - 1.0) + 1.0;\treturn RECIPROCAL_PI * a2 / pow2(denom);\n}\nfloat G_GGX_SmithCorrelated(const in float alpha, const in float dotNL, const in float dotNV) {\n\tfloat a2 = pow2(alpha);\n\tfloat gv = dotNL * sqrt(a2 + (1.0 - a2) * pow2(dotNV));\n\tfloat gl = dotNV * sqrt(a2 + (1.0 - a2) * pow2(dotNL));\n\treturn 0.5 / max(gv + gl, EPSILON);\n}\nvec3 BRDF_Specular_GGX(vec3 specularColor, vec3 N, vec3 L, vec3 V, float roughness) {\n\tfloat alpha = pow2(roughness);\n\tvec3 H = normalize(L + V);\n\tfloat dotNL = saturate(dot(N, L));\n\tfloat dotNV = saturate(dot(N, V));\n\tfloat dotNH = saturate(dot(N, H));\n\tfloat dotLH = saturate(dot(L, H));\n\tvec3 F = F_Schlick(specularColor, dotLH);\n\tfloat G = G_GGX_SmithCorrelated(alpha, dotNL, dotNV);\n\tfloat D = D_GGX(alpha, dotNH);\n\treturn F * G * D;\n}\nvec2 integrateSpecularBRDF(const in float dotNV, const in float roughness) {\n\tconst vec4 c0 = vec4(-1, -0.0275, -0.572, 0.022);\n\tconst vec4 c1 = vec4(1, 0.0425, 1.04, -0.04);\n\tvec4 r = roughness * c0 + c1;\n\tfloat a004 = min(r.x * r.x, exp2(-9.28 * dotNV)) * r.x + r.y;\n\treturn vec2(-1.04, 1.04) * a004 + r.zw;\n}\nvec3 F_Schlick_RoughnessDependent(const in vec3 F0, const in float dotNV, const in float roughness) {\n\tfloat fresnel = exp2((-5.55473 * dotNV - 6.98316) * dotNV);\n\tvec3 Fr = max(vec3(1.0 - roughness), F0) - F0;\n\treturn Fr * fresnel + F0;\n}\nvec3 BRDF_Specular_GGX_Environment(const in vec3 N, const in vec3 V, const in vec3 specularColor, const in float roughness) {\n\tfloat dotNV = saturate(dot(N, V));\n\tvec2 brdf = integrateSpecularBRDF(dotNV, roughness);\n\treturn specularColor * brdf.x + brdf.y;\n}\nvoid BRDF_Specular_Multiscattering_Environment(const in vec3 N, const in vec3 V, const in vec3 specularColor, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter) {\n\tfloat dotNV = saturate(dot(N, V));\n\tvec3 F = F_Schlick_RoughnessDependent(specularColor, dotNV, roughness);\n\tvec2 brdf = integrateSpecularBRDF(dotNV, roughness);\n\tvec3 FssEss = F * brdf.x + brdf.y;\n\tfloat Ess = brdf.x + brdf.y;\n\tfloat Ems = 1.0 - Ess;\n\tvec3 Favg = specularColor + (1.0 - specularColor) * 0.047619;\tvec3 Fms = FssEss * Favg / (1.0 - Ems * Favg);\n\tsingleScatter += FssEss;\n\tmultiScatter += Fms * Ems;\n}";

	var bumpMap_pars_frag = "#ifdef USE_BUMPMAP\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\tvec2 dHdxy_fwd(vec2 uv) {\n\t\tvec2 dSTdx = dFdx( uv );\n\t\tvec2 dSTdy = dFdy( uv );\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, uv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, uv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, uv + dSTdy ).x - Hll;\n\t\treturn vec2( dBx, dBy );\n\t}\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {\n\t\tvec3 vSigmaX = vec3( dFdx( surf_pos.x ), dFdx( surf_pos.y ), dFdx( surf_pos.z ) );\n\t\tvec3 vSigmaY = vec3( dFdy( surf_pos.x ), dFdy( surf_pos.y ), dFdy( surf_pos.z ) );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\t\tfloat fDet = dot( vSigmaX, R1 );\n\t\tfDet *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\t}\n#endif";

	var clippingPlanes_frag = "\n#if NUM_CLIPPING_PLANES > 0\n		vec4 plane;\n		#pragma unroll_loop_start\n		for (int i = 0; i < NUM_CLIPPING_PLANES; i++) {\n				plane = clippingPlanes[i];\n				if ( dot( -v_modelPos, plane.xyz ) > plane.w ) discard;\n		}\n		#pragma unroll_loop_end\n#endif";

	var clippingPlanes_pars_frag = "#if NUM_CLIPPING_PLANES > 0\n		uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif";

	var color_frag = "#ifdef USE_VCOLOR_RGB\n		outColor.rgb *= v_Color;\n#endif\n#ifdef USE_VCOLOR_RGBA\n		outColor *= v_Color;\n#endif";

	var color_pars_frag = "#ifdef USE_VCOLOR_RGB\n		varying vec3 v_Color;\n#endif\n#ifdef USE_VCOLOR_RGBA\n		varying vec4 v_Color;\n#endif";

	var color_pars_vert = "#ifdef USE_VCOLOR_RGB\n		attribute vec3 a_Color;\n		varying vec3 v_Color;\n#endif\n#ifdef USE_VCOLOR_RGBA\n		attribute vec4 a_Color;\n		varying vec4 v_Color;\n#endif";

	var color_vert = "#if defined(USE_VCOLOR_RGB) || defined(USE_VCOLOR_RGBA)\n		v_Color = a_Color;\n#endif";

	var common_frag = "uniform mat4 u_View;\nuniform float u_Opacity;\nuniform vec3 u_Color;\nuniform vec3 u_CameraPosition;\nbool isPerspectiveMatrix( mat4 m ) {\n\treturn m[ 2 ][ 3 ] == - 1.0;\n}\nstruct ReflectedLight {\n\tvec3 directDiffuse;\n\tvec3 directSpecular;\n\tvec3 indirectDiffuse;\n\tvec3 indirectSpecular;\n};";

	var common_vert = "attribute vec3 a_Position;\nattribute vec3 a_Normal;\n#ifdef USE_TANGENT\n\tattribute vec4 a_Tangent;\n#endif\n#include <transpose>\n#include <inverse>\nuniform mat4 u_Projection;\nuniform mat4 u_View;\nuniform mat4 u_Model;\nuniform mat4 u_ProjectionView;\nuniform vec3 u_CameraPosition;\n#define EPSILON 1e-6\n#ifdef USE_MORPHTARGETS\n		attribute vec3 morphTarget0;\n		attribute vec3 morphTarget1;\n		attribute vec3 morphTarget2;\n		attribute vec3 morphTarget3;\n		#ifdef USE_MORPHNORMALS\n		\tattribute vec3 morphNormal0;\n		\tattribute vec3 morphNormal1;\n		\tattribute vec3 morphNormal2;\n		\tattribute vec3 morphNormal3;\n		#else\n		\tattribute vec3 morphTarget4;\n		\tattribute vec3 morphTarget5;\n		\tattribute vec3 morphTarget6;\n		\tattribute vec3 morphTarget7;\n		#endif\n#endif\nbool isPerspectiveMatrix( mat4 m ) {\n\treturn m[ 2 ][ 3 ] == - 1.0;\n}";

	var diffuseMap_frag = "#ifdef USE_DIFFUSE_MAP\n		outColor *= mapTexelToLinear(texture2D(diffuseMap, vDiffuseMapUV));\n#endif";

	var diffuseMap_pars_frag = "#ifdef USE_DIFFUSE_MAP\n		uniform sampler2D diffuseMap;\n		varying vec2 vDiffuseMapUV;\n#endif";

	var diffuseMap_vert = "#ifdef USE_DIFFUSE_MAP\n		vDiffuseMapUV = (uvTransform * vec3(DIFFUSEMAP_UV, 1.)).xy;\n#endif";

	var diffuseMap_pars_vert = "#ifdef USE_DIFFUSE_MAP\n		varying vec2 vDiffuseMapUV;\n#endif";

	var emissiveMap_frag = "#ifdef USE_EMISSIVEMAP\n\tvec4 emissiveColor = emissiveMapTexelToLinear(texture2D(emissiveMap, vEmissiveMapUV));\n\ttotalEmissiveRadiance *= emissiveColor.rgb;\n#endif";

	var emissiveMap_pars_frag = "#ifdef USE_EMISSIVEMAP\n\tuniform sampler2D emissiveMap;\n\tvarying vec2 vEmissiveMapUV;\n#endif";

	var emissiveMap_vert = "#ifdef USE_EMISSIVEMAP\n\tvEmissiveMapUV = (emissiveMapUVTransform * vec3(EMISSIVEMAP_UV, 1.)).xy;\n#endif";

	var emissiveMap_pars_vert = "#ifdef USE_EMISSIVEMAP\n\tuniform mat3 emissiveMapUVTransform;\n\tvarying vec2 vEmissiveMapUV;\n#endif";

	var encodings_frag = "gl_FragColor = linearToOutputTexel(gl_FragColor);";

	var encodings_pars_frag = "vec4 LinearToLinear(in vec4 value) {\n\treturn value;\n}\nvec4 GammaToLinear(in vec4 value, in float gammaFactor) {\n\treturn vec4(pow(value.xyz, vec3(gammaFactor)), value.w);\n}\nvec4 LinearToGamma(in vec4 value, in float gammaFactor) {\n\treturn vec4(pow(value.xyz, vec3(1.0 / gammaFactor)), value.w);\n}\nvec4 sRGBToLinear(in vec4 value) {\n\treturn vec4(mix(pow(value.rgb * 0.9478672986 + vec3(0.0521327014), vec3(2.4)), value.rgb * 0.0773993808, vec3(lessThanEqual(value.rgb, vec3(0.04045)))), value.w);\n}\nvec4 LinearTosRGB(in vec4 value) {\n\treturn vec4(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))), value.w);\n}";

	var end_frag = "gl_FragColor = outColor;";

	var envMap_frag = "#ifdef USE_ENV_MAP\n		vec3 envDir;\n		#ifdef USE_VERTEX_ENVDIR\n				envDir = v_EnvDir;\n		#else\n				envDir = reflect(normalize(v_modelPos - u_CameraPosition), N);\n		#endif\n		vec4 envColor = textureCube(envMap, vec3(envMapParams.z * envDir.x, envDir.yz));\n		envColor = envMapTexelToLinear( envColor );\n		#ifdef ENVMAP_BLENDING_MULTIPLY\n\t\toutColor = mix(outColor, envColor * outColor, envMapParams.y);\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\t\toutColor = mix(outColor, envColor, envMapParams.y);\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\t\toutColor += envColor * envMapParams.y;\n\t#endif\n#endif";

	var envMap_pars_frag = "#ifdef USE_ENV_MAP\n		#ifdef USE_VERTEX_ENVDIR\n				varying vec3 v_EnvDir;\n		#endif\n		uniform samplerCube envMap;\n		uniform vec3 envMapParams;\n		uniform int maxMipLevel;\n#endif";

	var envMap_pars_vert = "#ifdef USE_ENV_MAP\n		#ifdef USE_VERTEX_ENVDIR\n				varying vec3 v_EnvDir;\n		#endif\n#endif";

	var envMap_vert = "\n#ifdef USE_ENV_MAP\n		#ifdef USE_VERTEX_ENVDIR\n				vec3 transformedNormal = (transposeMat4(inverseMat4(u_Model)) * vec4(objectNormal, 0.0)).xyz;\n				transformedNormal = normalize(transformedNormal);\n				v_EnvDir = reflect(normalize(worldPosition.xyz - u_CameraPosition), transformedNormal);\n		#endif\n#endif";

	var fog_frag = "#ifdef USE_FOG\n		float depth = gl_FragCoord.z / gl_FragCoord.w;\n		#ifdef USE_EXP2_FOG\n				float fogFactor = 1.0 - exp(-u_FogDensity * u_FogDensity * depth * depth);\n		#else\n				float fogFactor = smoothstep(u_FogNear, u_FogFar, depth);\n		#endif\n		gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, fogFactor);\n#endif";

	var fog_pars_frag = "#ifdef USE_FOG\n		uniform vec3 u_FogColor;\n		#ifdef USE_EXP2_FOG\n				uniform float u_FogDensity;\n		#else\n				uniform float u_FogNear;\n				uniform float u_FogFar;\n		#endif\n#endif";

	var inverse = "mat4 inverseMat4(mat4 m) {\n		float\n		a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n		a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n		a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n		a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n		b00 = a00 * a11 - a01 * a10,\n		b01 = a00 * a12 - a02 * a10,\n		b02 = a00 * a13 - a03 * a10,\n		b03 = a01 * a12 - a02 * a11,\n		b04 = a01 * a13 - a03 * a11,\n		b05 = a02 * a13 - a03 * a12,\n		b06 = a20 * a31 - a21 * a30,\n		b07 = a20 * a32 - a22 * a30,\n		b08 = a20 * a33 - a23 * a30,\n		b09 = a21 * a32 - a22 * a31,\n		b10 = a21 * a33 - a23 * a31,\n		b11 = a22 * a33 - a23 * a32,\n		det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n		return mat4(\n				a11 * b11 - a12 * b10 + a13 * b09,\n				a02 * b10 - a01 * b11 - a03 * b09,\n				a31 * b05 - a32 * b04 + a33 * b03,\n				a22 * b04 - a21 * b05 - a23 * b03,\n				a12 * b08 - a10 * b11 - a13 * b07,\n				a00 * b11 - a02 * b08 + a03 * b07,\n				a32 * b02 - a30 * b05 - a33 * b01,\n				a20 * b05 - a22 * b02 + a23 * b01,\n				a10 * b10 - a11 * b08 + a13 * b06,\n				a01 * b08 - a00 * b10 - a03 * b06,\n				a30 * b04 - a31 * b02 + a33 * b00,\n				a21 * b02 - a20 * b04 - a23 * b00,\n				a11 * b07 - a10 * b09 - a12 * b06,\n				a00 * b09 - a01 * b07 + a02 * b06,\n				a31 * b01 - a30 * b03 - a32 * b00,\n				a20 * b03 - a21 * b01 + a22 * b00) / det;\n}";

	var light_frag = "\n#if (defined(USE_PHONG) || defined(USE_PBR))\n		vec3 V = normalize(u_CameraPosition - v_modelPos);\n#endif\n#ifdef USE_PBR\n		#ifdef USE_PBR2\n				vec3 diffuseColor = outColor.xyz;\n				vec3 specularColor = specularFactor.xyz;\n				float roughness = max(1.0 - glossinessFactor, 0.0525);\n		#else\n				vec3 diffuseColor = outColor.xyz * (1.0 - metalnessFactor);\n				vec3 specularColor = mix(vec3(0.04), outColor.xyz, metalnessFactor);\n				float roughness = max(roughnessFactor, 0.0525);\n		#endif\n		vec3 dxy = max(abs(dFdx(geometryNormal)), abs(dFdy(geometryNormal)));\n		float geometryRoughness = max(max(dxy.x, dxy.y), dxy.z);\n		roughness += geometryRoughness;\n		roughness = min(roughness, 1.0);\n		#ifdef USE_CLEARCOAT\n				float clearcoat = u_Clearcoat;\n				float clearcoatRoughness = u_ClearcoatRoughness;\n				#ifdef USE_CLEARCOATMAP\n\t\t		clearcoat *= texture2D(clearcoatMap, v_Uv).x;\n				#endif\n				#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\t\t		clearcoatRoughness *= texture2D(clearcoatRoughnessMap, v_Uv).y;\n\t		#endif\n				clearcoat = saturate(clearcoat);\n				clearcoatRoughness = max(clearcoatRoughness, 0.0525);\n\t		clearcoatRoughness += geometryRoughness;\n\t		clearcoatRoughness = min(clearcoatRoughness, 1.0);\n		#endif\n#else\n		vec3 diffuseColor = outColor.xyz;\n		#ifdef USE_PHONG\n				vec3 specularColor = u_SpecularColor.xyz;\n				float shininess = u_Specular;\n		#endif\n#endif\nvec3 L;\nfloat falloff;\nfloat dotNL;\nvec3 irradiance;\nfloat clearcoatDHR;\n#ifdef USE_CLEARCOAT\n		float ccDotNL;\n		vec3 ccIrradiance;\n#endif\n#if NUM_DIR_LIGHTS > 0\n		#pragma unroll_loop_start\n		for (int i = 0; i < NUM_DIR_LIGHTS; i++) {\n				L = normalize(-u_Directional[i].direction);\n				falloff = 1.0;\n				#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_DIR_SHADOWS)\n						#ifdef USE_PCSS_SOFT_SHADOW\n								falloff *= getShadowWithPCSS(directionalDepthMap[i], directionalShadowMap[i], vDirectionalShadowCoord[i], u_DirectionalShadow[i].shadowMapSize, u_DirectionalShadow[i].shadowBias, u_DirectionalShadow[i].shadowParams);\n						#else\n								falloff *= getShadow(directionalShadowMap[i], vDirectionalShadowCoord[i], u_DirectionalShadow[i].shadowMapSize, u_DirectionalShadow[i].shadowBias, u_DirectionalShadow[i].shadowParams);\n						#endif\n				#endif\n				dotNL = saturate(dot(N, L));\n				irradiance = u_Directional[i].color * falloff * dotNL * PI;\n				#ifdef USE_CLEARCOAT				\n						ccDotNL = saturate(dot(clearcoatNormal, L));\n						ccIrradiance = ccDotNL * u_Directional[i].color * falloff	* PI;\n						clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n						reflectedLight.directSpecular += ccIrradiance * clearcoat * BRDF_Specular_GGX(specularColor, clearcoatNormal, L, V, clearcoatRoughness);\n				#else\n						clearcoatDHR = 0.0;\n				#endif\n				reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);\n				#ifdef USE_PHONG\n						reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(specularColor, N, L, V, shininess) * specularStrength;\n				#endif\n				#ifdef USE_PBR\n						reflectedLight.directSpecular += (1.0 - clearcoatDHR) * irradiance * BRDF_Specular_GGX(specularColor, N, L, V, roughness);\n				#endif\n		}\n		#pragma unroll_loop_end\n#endif\n#if NUM_POINT_LIGHTS > 0\n		vec3 worldV;\n		#pragma unroll_loop_start\n		for (int i = 0; i < NUM_POINT_LIGHTS; i++) {\n				worldV = v_modelPos - u_Point[i].position;\n				L = -worldV;\n				falloff = pow(clamp(1. - length(L) / u_Point[i].distance, 0.0, 1.0), u_Point[i].decay);\n				L = normalize(L);\n				#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_POINT_SHADOWS)\n						falloff *= getPointShadow(pointShadowMap[i], vPointShadowCoord[i], u_PointShadow[i].shadowMapSize, u_PointShadow[i].shadowBias, u_PointShadow[i].shadowParams, u_PointShadow[i].shadowCameraRange);\n				#endif\n				dotNL = saturate(dot(N, L));\n				irradiance = u_Point[i].color * falloff * dotNL * PI;\n				#ifdef USE_CLEARCOAT				\n						ccDotNL = saturate(dot(clearcoatNormal, L));\n						ccIrradiance = ccDotNL *	u_Point[i].color * falloff	* PI;\n						clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n						reflectedLight.directSpecular += ccIrradiance * clearcoat * BRDF_Specular_GGX(specularColor, clearcoatNormal, L, V, clearcoatRoughness);\n				#else\n						clearcoatDHR = 0.0;\n				#endif\n				reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);\n				#ifdef USE_PHONG\n						reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(specularColor, N, L, V, shininess) * specularStrength;\n				#endif\n				#ifdef USE_PBR\n						reflectedLight.directSpecular += (1.0 - clearcoatDHR) * irradiance * BRDF_Specular_GGX(specularColor, N, L, V, roughness);\n				#endif\n		}\n		#pragma unroll_loop_end\n#endif\n#if NUM_SPOT_LIGHTS > 0\n		float lightDistance;\n		float angleCos;\n		#pragma unroll_loop_start\n		for (int i = 0; i < NUM_SPOT_LIGHTS; i++) {\n				L = u_Spot[i].position - v_modelPos;\n				lightDistance = length(L);\n				L = normalize(L);\n				angleCos = dot(L, -normalize(u_Spot[i].direction));\n				falloff = smoothstep(u_Spot[i].coneCos, u_Spot[i].penumbraCos, angleCos);\n				falloff *= pow(clamp(1. - lightDistance / u_Spot[i].distance, 0.0, 1.0), u_Spot[i].decay);\n				#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_SPOT_SHADOWS)\n						#ifdef USE_PCSS_SOFT_SHADOW\n								falloff *= getShadowWithPCSS(spotDepthMap[i], spotShadowMap[i], vSpotShadowCoord[i], u_SpotShadow[i].shadowMapSize, u_SpotShadow[i].shadowBias, u_SpotShadow[i].shadowParams);\n						#else\n								falloff *= getShadow(spotShadowMap[i], vSpotShadowCoord[i], u_SpotShadow[i].shadowMapSize, u_SpotShadow[i].shadowBias, u_SpotShadow[i].shadowParams);\n						#endif\n				#endif\n				dotNL = saturate(dot(N, L));\n				irradiance = u_Spot[i].color * falloff * dotNL * PI;\n				#ifdef USE_CLEARCOAT				\n						ccDotNL = saturate(dot(clearcoatNormal, L));\n						ccIrradiance = ccDotNL *	u_Spot[i].color * falloff	* PI;\n						clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n						reflectedLight.directSpecular += ccIrradiance * clearcoat * BRDF_Specular_GGX(specularColor, clearcoatNormal, L, V, clearcoatRoughness);\n				#else\n						clearcoatDHR = 0.0;\n				#endif\n				reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);\n				#ifdef USE_PHONG\n						reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(specularColor, N, L, V, shininess) * specularStrength;\n				#endif\n				#ifdef USE_PBR\n						reflectedLight.directSpecular += (1.0 - clearcoatDHR) * irradiance * BRDF_Specular_GGX(specularColor, N, L, V, roughness);\n				#endif\n		}\n		#pragma unroll_loop_end\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n		vec3 RectAreaLightDirectSpecular;\n		vec3 RectAreaLightDirectDiffuse;\n		vec3 rectCoords[4];\n		#pragma unroll_loop_start\n		for (int i = 0; i < NUM_RECT_AREA_LIGHTS; i++) {\n				LTC_RectCoords(u_RectArea[i].position, u_RectArea[i].halfWidth, u_RectArea[i].halfHeight, rectCoords);\n				reflectedLight.directDiffuse += u_RectArea[i].color * LTC_Diffuse(diffuseColor, N, V, v_modelPos, rectCoords);\n				#ifdef USE_PBR\n						reflectedLight.directSpecular += u_RectArea[i].color * LTC_Specular(specularColor, N, V, v_modelPos, rectCoords, roughness);\n				#endif\n		}\n		#pragma unroll_loop_end\n#endif\n#ifdef USE_CLUSTERED_LIGHTS\n		vec4 positionView = u_View * vec4(v_modelPos, 1.0);\n		float perspectiveFactor = step(0.0, cellsTransformFactors.z);\n		float halfFrustumHeight = -cellsTransformFactors.z * mix(1.0, positionView.z, perspectiveFactor);\n		float halfFrustumWidth = halfFrustumHeight * cellsTransformFactors.w;\n		vec3 cellCoords;\n		cellCoords.z = floor(log(-positionView.z) * cellsTransformFactors.x + cellsTransformFactors.y);\n		cellCoords.y = floor((positionView.y / (2.0 * halfFrustumHeight) + 0.5) * cells.y);\n		cellCoords.x = floor((positionView.x / (2.0 * halfFrustumWidth) + 0.5) * cells.x);\n		if(!(any(lessThan(cellCoords, vec3(0.0))) || any(greaterThanEqual(cellCoords, cells)))) {\n				float cellIndex = dot(cellsDotData, cellCoords);\n				float clusterV = floor(cellIndex * cellsTextureSize.y);\n				float clusterU = cellIndex - (clusterV * cellsTextureSize.x);\n				int size = textureSize(lightsTexture, 0).x;\n				ClusteredPointLight clusteredPointLight;\n				ClusteredSpotLight clusteredSpotLight;\n				vec3 clusteredLightColor;\n				float clusteredLightDistance;\n				float clusteredAngleCos;\n				for (int lightCellIndex = 0; lightCellIndex < maxLightsPerCell; lightCellIndex++) {\n						float lightIndex = texelFetch(cellsTexture, ivec2(int(clusterU) + lightCellIndex, clusterV), 0).x;\n						if (lightIndex <= 0.0) break;\n						int lightOffset = int(lightIndex - 1.) * 4;\n						ivec2 lightDataCoords = ivec2(lightOffset % size, lightOffset / size);\n						vec4 lightData0 = texelFetch(lightsTexture, lightDataCoords, 0);\n						if (lightData0.x == 1.0) {\n								getPointLightFromTexture(lightDataCoords, lightData0, clusteredPointLight);\n								L = clusteredPointLight.position - v_modelPos;\n								clusteredLightDistance = length(L);\n								L = normalize(L);\n								falloff = pow(clamp(1. - clusteredLightDistance / clusteredPointLight.distance, 0.0, 1.0), clusteredPointLight.decay);\n								clusteredLightColor = clusteredPointLight.color;\n						} else if (lightData0.x == 2.0) {\n								getSpotLightFromTexture(lightDataCoords, lightData0, clusteredSpotLight);\n								L = clusteredSpotLight.position - v_modelPos;\n								clusteredLightDistance = length(L);\n								L = normalize(L);\n								clusteredAngleCos = dot(L, -normalize(clusteredSpotLight.direction));\n								falloff = smoothstep(clusteredSpotLight.coneCos, clusteredSpotLight.penumbraCos, clusteredAngleCos);\n								falloff *= pow(clamp(1. - clusteredLightDistance / clusteredSpotLight.distance, 0.0, 1.0), clusteredSpotLight.decay);\n								clusteredLightColor = clusteredSpotLight.color;\n						}\n						dotNL = saturate(dot(N, L));\n						irradiance = clusteredLightColor * falloff * dotNL * PI;\n						#ifdef USE_CLEARCOAT\n								ccDotNL = saturate(dot(clearcoatNormal, L));\n								ccIrradiance = ccDotNL * clusteredLightColor * falloff * PI;\n								clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n								reflectedLight.directSpecular += ccIrradiance * clearcoat * BRDF_Specular_GGX(specularColor, clearcoatNormal, L, V, clearcoatRoughness);\n						#else\n								clearcoatDHR = 0.0;\n						#endif\n						reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);\n						#ifdef USE_PHONG\n								reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(specularColor, N, L, V, shininess) * specularStrength;\n						#endif\n						#ifdef USE_PBR\n								reflectedLight.directSpecular += (1.0 - clearcoatDHR) * irradiance * BRDF_Specular_GGX(specularColor, N, L, V, roughness);\n						#endif\n				}\n		}\n#endif\nvec3 indirectIrradiance = vec3(0., 0., 0.);	 \n#ifdef USE_AMBIENT_LIGHT\n		indirectIrradiance += u_AmbientLightColor * PI;\n#endif\n#ifdef USE_SPHERICALHARMONICS_LIGHT\n		indirectIrradiance += getLightProbeIrradiance(u_SphericalHarmonicsLightData, N);\n#endif\n#if NUM_HEMI_LIGHTS > 0\n		float hemiDiffuseWeight;\n		#pragma unroll_loop_start\n		for (int i = 0; i < NUM_HEMI_LIGHTS; i++) {\n				L = normalize(u_Hemi[i].direction);\n				dotNL = dot(N, L);\n				hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n				indirectIrradiance += mix(u_Hemi[i].groundColor, u_Hemi[i].skyColor, hemiDiffuseWeight) * PI;\n		}\n		#pragma unroll_loop_end\n#endif\nreflectedLight.indirectDiffuse += indirectIrradiance * BRDF_Diffuse_Lambert(diffuseColor);\n#if defined(USE_ENV_MAP) && defined(USE_PBR)\n		vec3 iblIrradiance = vec3(0., 0., 0.);\n		vec3 indirectRadiance = vec3(0., 0., 0.);\n		vec3 clearcoatRadiance = vec3(0., 0., 0.);\n		vec3 envDir;\n		#ifdef USE_VERTEX_ENVDIR\n				envDir = v_EnvDir;\n		#else\n				envDir = reflect(normalize(v_modelPos - u_CameraPosition), N);\n		#endif\n		iblIrradiance += getLightProbeIndirectIrradiance(maxMipLevel, N);\n		indirectRadiance += getLightProbeIndirectRadiance(roughness, maxMipLevel, N, envDir);\n		#ifdef USE_CLEARCOAT\n				vec3 clearcoatDir = reflect(normalize(v_modelPos - u_CameraPosition), clearcoatNormal);\n				clearcoatRadiance += getLightProbeIndirectRadiance(clearcoatRoughness, maxMipLevel, clearcoatNormal, clearcoatDir);\n		#endif\n		#ifdef USE_CLEARCOAT\n				float ccDotNV = saturate(dot(clearcoatNormal, V));\n				reflectedLight.indirectSpecular += clearcoatRadiance * clearcoat * BRDF_Specular_GGX_Environment(clearcoatNormal, V, specularColor, clearcoatRoughness);\n				ccDotNL = ccDotNV;\n				clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);\n		#else\n				clearcoatDHR = 0.0;\n		#endif\n		float clearcoatInv = 1.0 - clearcoatDHR;\n		vec3 singleScattering = vec3(0.0);\n		vec3 multiScattering = vec3(0.0);\n		vec3 cosineWeightedIrradiance = iblIrradiance * RECIPROCAL_PI;\n		BRDF_Specular_Multiscattering_Environment(N, V, specularColor, roughness, singleScattering, multiScattering);\n		vec3 diffuse = diffuseColor * (1.0 - (singleScattering + multiScattering));\n		reflectedLight.indirectSpecular += clearcoatInv * indirectRadiance * singleScattering;\n		reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;\n		reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;\n#endif";

	var light_pars_frag = "#ifdef USE_AMBIENT_LIGHT\n		uniform vec3 u_AmbientLightColor;\n#endif\n#ifdef USE_SPHERICALHARMONICS_LIGHT\n		uniform vec3 u_SphericalHarmonicsLightData[9];\n#endif\n#ifdef USE_CLEARCOAT\n		float clearcoatDHRApprox(const in float roughness, const in float dotNL) {\n				return 0.04 + (1.0 - 0.16) * (pow(1.0 - dotNL, 5.0) * pow(1.0 - roughness, 2.0));\n		}\n#endif\n#if NUM_HEMI_LIGHTS > 0\n		struct HemisphereLight {\n				vec3 direction;\n				vec3 skyColor;\n\t\tvec3 groundColor;\n		};\n		uniform HemisphereLight u_Hemi[NUM_HEMI_LIGHTS];\n#endif\n#if NUM_DIR_LIGHTS > 0\n		struct DirectLight {\n				vec3 direction;\n				vec3 color;\n		};\n		uniform DirectLight u_Directional[NUM_DIR_LIGHTS];\n#endif\n#if NUM_POINT_LIGHTS > 0\n		struct PointLight {\n				vec3 position;\n				vec3 color;\n				float distance;\n				float decay;\n		};\n		uniform PointLight u_Point[NUM_POINT_LIGHTS];\n#endif\n#if NUM_SPOT_LIGHTS > 0\n		struct SpotLight {\n				vec3 position;\n				vec3 color;\n				float distance;\n				float decay;\n				float coneCos;\n				float penumbraCos;\n				vec3 direction;\n		};\n		uniform SpotLight u_Spot[NUM_SPOT_LIGHTS];\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n		struct RectAreaLight {\n				vec3 position;\n				vec3 color;\n\t\tvec3 halfWidth;\n\t\tvec3 halfHeight;\n		};\n		uniform RectAreaLight u_RectArea[NUM_RECT_AREA_LIGHTS];\n\tuniform sampler2D ltc_1;\tuniform sampler2D ltc_2;\n		void LTC_RectCoords(const in vec3 lightPos, const in vec3 halfWidth, const in vec3 halfHeight, inout vec3 rectCoords[4]) {\n				rectCoords[0] = lightPos + halfWidth - halfHeight;				rectCoords[1] = lightPos - halfWidth - halfHeight;\n				rectCoords[2] = lightPos - halfWidth + halfHeight;\n				rectCoords[3] = lightPos + halfWidth + halfHeight;\n		}\n		vec2 LTC_Uv(const in vec3 N, const in vec3 V, const in float roughness) {\n				const float LUT_SIZE = 64.0; \n				const float LUT_SCALE = (LUT_SIZE - 1.0) / LUT_SIZE;\n				const float LUT_BIAS = 0.5 / LUT_SIZE;\n				float dotNV = saturate(dot(N, V));\n				vec2 uv = vec2(roughness, sqrt(1.0 - dotNV));\n				uv = uv * LUT_SCALE + LUT_BIAS;\n				return uv;\n		}\n		vec3 LTC_EdgeVectorFormFactor(const in vec3 v1, const in vec3 v2) {\n				float x = dot(v1, v2);\n				float y = abs(x);\n				float a = 0.8543985 + (0.4965155 + 0.0145206 * y) * y;\n				float b = 3.4175940 + (4.1616724 + y) * y;\n				float v = a / b;\n				float theta_sintheta = (x > 0.0) ? v : 0.5 * inversesqrt(max(1.0 - x * x, 1e-7)) - v;\n				return cross(v1, v2) * theta_sintheta;\n		}\n		float LTC_ClippedSphereFormFactor(const in vec3 f) {\n				float l = length(f);\n				return max((l * l + f.z) / (l + 1.0), 0.0);\n		}\n		vec3 LTC_Evaluate(const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[4]) {\n				vec3 v1 = rectCoords[1] - rectCoords[0];\n				vec3 v2 = rectCoords[3] - rectCoords[0];\n				vec3 lightNormal = cross(v1, v2);\n				if(dot(lightNormal, P - rectCoords[0]) < 0.0) return vec3(0.0);\n				vec3 T1, T2;\n				T1 = normalize(V - N * dot(V, N));\n				T2 = - cross(N, T1);\n				mat3 mat = mInv * mat3(\n						T1.x, T2.x, N.x,\n						T1.y, T2.y, N.y,\n						T1.z, T2.z, N.z\n				);\n				vec3 coords[4];\n				coords[0] = mat * (rectCoords[0] - P);\n				coords[1] = mat * (rectCoords[1] - P);\n				coords[2] = mat * (rectCoords[2] - P);\n				coords[3] = mat * (rectCoords[3] - P);\n				coords[0] = normalize(coords[0]);\n				coords[1] = normalize(coords[1]);\n				coords[2] = normalize(coords[2]);\n				coords[3] = normalize(coords[3]);\n				vec3 vectorFormFactor = vec3(0.0);\n				vectorFormFactor += LTC_EdgeVectorFormFactor(coords[0], coords[1]);\n				vectorFormFactor += LTC_EdgeVectorFormFactor(coords[1], coords[2]);\n				vectorFormFactor += LTC_EdgeVectorFormFactor(coords[2], coords[3]);\n				vectorFormFactor += LTC_EdgeVectorFormFactor(coords[3], coords[0]);\n				float result = LTC_ClippedSphereFormFactor(vectorFormFactor);\n				return vec3(result);\n		}\n		vec3 LTC_Diffuse(const in vec3 diffuseColor, const in vec3 N, const in vec3 V, const in vec3 P, const in vec3 rectCoords[4]) {\n				return diffuseColor * LTC_Evaluate(N, V, P, mat3(1.0), rectCoords);\n		}\n		vec3 LTC_Specular(const in vec3 specularColor, const in vec3 N, const in vec3 V, const in vec3 P, const in vec3 rectCoords[4], const in float roughness) {\n				vec2 ltc_uv = LTC_Uv(N, V, roughness);\n				vec4 t1 = texture2D(ltc_1, ltc_uv);\n				vec4 t2 = texture2D(ltc_2, ltc_uv);\n				mat3 mInv = mat3(\n						vec3(t1.x, 0, t1.y),\n						vec3(0, 1, 0),\n						vec3(t1.z, 0, t1.w)\n				);\n				vec3 fresnel = (specularColor * t2.x + (vec3(1.0) - specularColor) * t2.y);\n				return fresnel * LTC_Evaluate(N, V, P, mInv, rectCoords);\n		}\n#endif\n#if defined(USE_PBR) && defined(USE_ENV_MAP)\n		vec3 getLightProbeIndirectIrradiance(const in int maxMIPLevel, const in vec3 N) {\n				vec3 coordVec = vec3(envMapParams.z * N.x, N.yz);\n		\t#ifdef TEXTURE_LOD_EXT\n		\t\tvec4 envMapColor = textureCubeLodEXT(envMap, coordVec, float(maxMIPLevel));\n		\t#else\n		\t\tvec4 envMapColor = textureCube(envMap, coordVec, float(maxMIPLevel));\n		\t#endif\n				envMapColor = envMapTexelToLinear(envMapColor);\n				return PI * envMapColor.rgb * envMapParams.x;\n		}\n		float getSpecularMIPLevel(const in float roughness, const in int maxMIPLevel) {\n		\tfloat maxMIPLevelScalar = float(maxMIPLevel);\n				float sigma = PI * roughness * roughness / (1.0 + roughness);\n				float desiredMIPLevel = maxMIPLevelScalar + log2(sigma);\n		\treturn clamp(desiredMIPLevel, 0.0, maxMIPLevelScalar);\n		}\n		vec3 getLightProbeIndirectRadiance(const in float roughness, const in int maxMIPLevel, const in vec3 normal, const in vec3 envDir) {\n				float specularMIPLevel = getSpecularMIPLevel(roughness, maxMIPLevel);\n				vec3 coordVec = normalize(mix(envDir, normal, roughness * roughness));\n				coordVec.x *= envMapParams.z;\n				#ifdef TEXTURE_LOD_EXT\n		\t\tvec4 envMapColor = textureCubeLodEXT(envMap, coordVec, specularMIPLevel);\n		\t#else\n		\t\tvec4 envMapColor = textureCube(envMap, coordVec, specularMIPLevel);\n		\t#endif\n				envMapColor = envMapTexelToLinear(envMapColor);\n				return envMapColor.rgb * envMapParams.y;\n		}\n		float computeSpecularOcclusion(const in float dotNV, const in float ambientOcclusion, const in float roughness) {\n		\treturn saturate(pow(dotNV + ambientOcclusion, exp2(-16.0 * roughness - 1.0)) - 1.0 + ambientOcclusion);\n		}\n#endif\n#ifdef USE_SPHERICALHARMONICS_LIGHT\n		vec3 shGetIrradianceAt(in vec3 normal, in vec3 shCoefficients[9]) {\n				float x = normal.x, y = normal.y, z = normal.z;\n				vec3 result = shCoefficients[0] * 0.886227;\n				result += shCoefficients[1] * 2.0 * 0.511664 * y;\n				result += shCoefficients[2] * 2.0 * 0.511664 * z;\n				result += shCoefficients[3] * 2.0 * 0.511664 * x;\n				result += shCoefficients[4] * 2.0 * 0.429043 * x * y;\n				result += shCoefficients[5] * 2.0 * 0.429043 * y * z;\n				result += shCoefficients[6] * (0.743125 * z * z - 0.247708);\n				result += shCoefficients[7] * 2.0 * 0.429043 * x * z;\n				result += shCoefficients[8] * 0.429043 * (x * x - y * y);\n				return result;\n		}\n		vec3 getLightProbeIrradiance(const in vec3 lightProbe[9], const in vec3 normal) {\n				vec3 irradiance = shGetIrradianceAt(normal, lightProbe);\n				return irradiance;\n		}\n#endif\n#ifdef USE_CLUSTERED_LIGHTS\n		uniform vec3 cells;\n		uniform int maxLightsPerCell;\n		uniform vec3 cellsDotData;\n		uniform vec3 cellsTextureSize;\n		uniform vec4 cellsTransformFactors;\n		uniform sampler2D cellsTexture;\n		uniform sampler2D lightsTexture;\n		struct ClusteredPointLight {\n				vec3 position;\n				vec3 color;\n				float distance;\n				float decay;\n		};\n		struct ClusteredSpotLight {\n				vec3 position;\n				vec3 color;\n				float distance;\n				float decay;\n				vec3 direction;\n				float coneCos;\n				float penumbraCos;\n		};\n		void getPointLightFromTexture(ivec2 lightDataCoords, vec4 lightData0, inout ClusteredPointLight pointLight) {\n				vec4 lightData1 = texelFetch(lightsTexture, lightDataCoords + ivec2(1, 0), 0);\n				vec4 lightData2 = texelFetch(lightsTexture, lightDataCoords + ivec2(2, 0), 0);\n				pointLight.color = lightData1.xyz;\n				pointLight.decay = lightData1.w;\n				pointLight.position = lightData2.xyz;\n				pointLight.distance = lightData2.w;\n		}\n		void getSpotLightFromTexture(ivec2 lightDataCoords, vec4 lightData0, inout ClusteredSpotLight spotLight) {\n				vec4 lightData1 = texelFetch(lightsTexture, lightDataCoords + ivec2(1, 0), 0);\n				vec4 lightData2 = texelFetch(lightsTexture, lightDataCoords + ivec2(2, 0), 0);\n				vec4 lightData3 = texelFetch(lightsTexture, lightDataCoords + ivec2(3, 0), 0);\n				spotLight.color = lightData1.xyz;\n				spotLight.decay = lightData1.w;\n				spotLight.position = lightData2.xyz;\n				spotLight.distance = lightData2.w;\n				spotLight.direction = lightData3.xyz;\n				spotLight.coneCos = lightData3.w;\n				spotLight.penumbraCos = lightData0.y;\n		}\n#endif";

	var alphamap_pars_frag = "#ifdef USE_ALPHA_MAP\n\tuniform sampler2D alphaMap;\n\tvarying vec2 vAlphaMapUV;\n#endif";

	var alphamap_frag = "#ifdef USE_ALPHA_MAP\n\toutColor.a *= texture2D(alphaMap, vAlphaMapUV).g;\n#endif";

	var alphamap_pars_vert = "#ifdef USE_ALPHA_MAP\n		uniform mat3 alphaMapUVTransform;\n\tvarying vec2 vAlphaMapUV;\n#endif";

	var alphamap_vert = "#ifdef USE_ALPHA_MAP\n\tvAlphaMapUV = (alphaMapUVTransform * vec3(ALPHAMAP_UV, 1.)).xy;\n#endif";

	var normalMap_pars_frag = "#ifdef USE_NORMAL_MAP\n		uniform sampler2D normalMap;\n		uniform vec2 normalScale;\n#endif\n#if defined(USE_NORMAL_MAP) || defined(USE_CLEARCOAT_NORMALMAP)\n		#if defined(USE_TANGENT) && !defined(FLAT_SHADED)\n				#define USE_TBN\n		#else\n				#include <tsn>\n		#endif\n#endif";

	var normal_frag = "\n#ifdef FLAT_SHADED\n		vec3 fdx = dFdx(v_modelPos);\n		vec3 fdy = dFdy(v_modelPos);\n		vec3 N = normalize(cross(fdx, fdy));\n#else\n		vec3 N = normalize(v_Normal);\n		#ifdef DOUBLE_SIDED\n				N = N * (float(gl_FrontFacing) * 2.0 - 1.0);\n		#endif\n#endif\n#ifdef USE_TBN\n\tvec3 tangent = normalize(v_Tangent);\n\tvec3 bitangent = normalize(v_Bitangent);\n\t#ifdef DOUBLE_SIDED\n\t\ttangent = tangent * (float(gl_FrontFacing) * 2.0 - 1.0);\n\t\tbitangent = bitangent * (float(gl_FrontFacing) * 2.0 - 1.0);\n\t#endif\n\tmat3 tspace = mat3(tangent, bitangent, N);\n#endif\nvec3 geometryNormal = N;\n#ifdef USE_NORMAL_MAP\n		vec3 mapN = texture2D(normalMap, v_Uv).rgb * 2.0 - 1.0;\n		mapN.xy *= normalScale;\n		#ifdef USE_TBN\n				N = normalize(tspace * mapN);\n		#else\n				mapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);\n				N = normalize(tsn(N, v_modelPos, v_Uv) * mapN);\n		#endif\n#elif defined(USE_BUMPMAP)\n		N = perturbNormalArb(v_modelPos, N, dHdxy_fwd(v_Uv));\n#endif\n#ifdef USE_CLEARCOAT\n\tvec3 clearcoatNormal = geometryNormal;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tvec3 clearcoatMapN = texture2D(clearcoatNormalMap, v_Uv).xyz * 2.0 - 1.0;\n\tclearcoatMapN.xy *= clearcoatNormalScale;\n\t#ifdef USE_TBN\n\t\tclearcoatNormal = normalize(tspace * clearcoatMapN);\n\t#else\n\t\tclearcoatMapN.xy *= (float(gl_FrontFacing) * 2.0 - 1.0);\n\t\tclearcoatNormal = normalize(tsn(clearcoatNormal, v_modelPos, v_Uv) * clearcoatMapN);\n\t#endif\n#endif";

	var normal_pars_frag = "#ifndef FLAT_SHADED\n		varying vec3 v_Normal;\n		#ifdef USE_TANGENT\n				varying vec3 v_Tangent;\n\t\tvarying vec3 v_Bitangent;\n		#endif\n#endif";

	var normal_pars_vert = "#ifndef FLAT_SHADED\n		varying vec3 v_Normal;\n		#ifdef USE_TANGENT\n				varying vec3 v_Tangent;\n\t\tvarying vec3 v_Bitangent;\n		#endif\n#endif";

	var normal_vert = "#ifndef FLAT_SHADED\n		v_Normal = (transposeMat4(inverseMat4(u_Model)) * vec4(objectNormal, 0.0)).xyz;\n		#ifdef FLIP_SIDED\n		\tv_Normal = - v_Normal;\n		#endif\n		#ifdef USE_TANGENT\n				v_Tangent = (transposeMat4(inverseMat4(u_Model)) * vec4(objectTangent, 0.0)).xyz;\n				#ifdef FLIP_SIDED\n						v_Tangent = - v_Tangent;\n				#endif\n				v_Bitangent = normalize(cross(v_Normal, v_Tangent) * a_Tangent.w);\n		#endif\n#endif";

	var packing = "const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,	256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n		vec4 r = vec4( fract( v * PackFactors ), v );\n		r.yzw -= r.xyz * ShiftRight8;		return r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n		return dot( v, UnpackFactors );\n}";

	var premultipliedAlpha_frag = "#ifdef USE_PREMULTIPLIED_ALPHA\n		gl_FragColor.rgb = gl_FragColor.rgb * gl_FragColor.a;\n#endif";

	var pvm_vert = "vec4 worldPosition = u_Model * vec4(transformed, 1.0);\ngl_Position = u_ProjectionView * worldPosition;";

	var dithering_frag = "#if defined( DITHERING )\n\tgl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif";

	var dithering_pars_frag = "#if defined( DITHERING )\n\tvec3 dithering( vec3 color ) {\n\t\tfloat grid_position = rand( gl_FragCoord.xy );\n\t\tvec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n\t\tdither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n\t\treturn color + dither_shift_RGB;\n\t}\n#endif";

	var shadow = "#ifdef USE_SHADOW_SAMPLER\n		float computeShadow(sampler2DShadow shadowMap, vec3 shadowCoord) {\n				return texture2D( shadowMap, shadowCoord );\n		}\n#else\n		float computeShadow(sampler2D shadowMap, vec3 shadowCoord) {\n				return step(shadowCoord.z, unpackRGBAToDepth(texture2D(shadowMap, shadowCoord.xy)));\n		}\n#endif\nfloat computeShadowWithPoissonSampling(sampler2DShadow shadowMap, vec3 shadowCoord, float texelSize) {\n		vec3 poissonDisk[4];\n		poissonDisk[0] = vec3(-0.94201624, -0.39906216, 0);\n		poissonDisk[1] = vec3(0.94558609, -0.76890725, 0);\n		poissonDisk[2] = vec3(-0.094184101, -0.92938870, 0);\n		poissonDisk[3] = vec3(0.34495938, 0.29387760, 0);\n		return computeShadow(shadowMap, shadowCoord + poissonDisk[0] * texelSize) * 0.25 +\n				computeShadow(shadowMap, shadowCoord + poissonDisk[1] * texelSize) * 0.25 +\n				computeShadow(shadowMap, shadowCoord + poissonDisk[2] * texelSize) * 0.25 +\n				computeShadow(shadowMap, shadowCoord + poissonDisk[3] * texelSize) * 0.25;\n}\nfloat computeShadowWithPCF1(sampler2DShadow shadowSampler, vec3 shadowCoord) {\n		return computeShadow(shadowSampler, shadowCoord);\n}\nfloat computeShadowWithPCF3(sampler2DShadow shadowSampler, vec3 shadowCoord, vec2 shadowMapSizeAndInverse) {\n		vec2 uv = shadowCoord.xy * shadowMapSizeAndInverse.x;		uv += 0.5;		vec2 st = fract(uv);		vec2 base_uv = floor(uv) - 0.5;		base_uv *= shadowMapSizeAndInverse.y;\n		vec2 uvw0 = 3. - 2. * st;\n		vec2 uvw1 = 1. + 2. * st;\n		vec2 u = vec2((2. - st.x) / uvw0.x - 1., st.x / uvw1.x + 1.) * shadowMapSizeAndInverse.y;\n		vec2 v = vec2((2. - st.y) / uvw0.y - 1., st.y / uvw1.y + 1.) * shadowMapSizeAndInverse.y;\n		float shadow = 0.;\n		shadow += uvw0.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[0]), shadowCoord.z));\n		shadow += uvw1.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[0]), shadowCoord.z));\n		shadow += uvw0.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[1]), shadowCoord.z));\n		shadow += uvw1.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[1]), shadowCoord.z));\n		shadow = shadow / 16.;\n		return shadow;\n}\nfloat computeShadowWithPCF5(sampler2DShadow shadowSampler, vec3 shadowCoord, vec2 shadowMapSizeAndInverse) {\n		vec2 uv = shadowCoord.xy * shadowMapSizeAndInverse.x;		uv += 0.5;		vec2 st = fract(uv);		vec2 base_uv = floor(uv) - 0.5;		base_uv *= shadowMapSizeAndInverse.y;\n		vec2 uvw0 = 4. - 3. * st;\n		vec2 uvw1 = vec2(7.);\n		vec2 uvw2 = 1. + 3. * st;\n		vec3 u = vec3((3. - 2. * st.x) / uvw0.x - 2., (3. + st.x) / uvw1.x, st.x / uvw2.x + 2.) * shadowMapSizeAndInverse.y;\n		vec3 v = vec3((3. - 2. * st.y) / uvw0.y - 2., (3. + st.y) / uvw1.y, st.y / uvw2.y + 2.) * shadowMapSizeAndInverse.y;\n		float shadow = 0.;\n		shadow += uvw0.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[0]), shadowCoord.z));\n		shadow += uvw1.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[0]), shadowCoord.z));\n		shadow += uvw2.x * uvw0.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[2], v[0]), shadowCoord.z));\n		shadow += uvw0.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[1]), shadowCoord.z));\n		shadow += uvw1.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[1]), shadowCoord.z));\n		shadow += uvw2.x * uvw1.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[2], v[1]), shadowCoord.z));\n		shadow += uvw0.x * uvw2.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[0], v[2]), shadowCoord.z));\n		shadow += uvw1.x * uvw2.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[1], v[2]), shadowCoord.z));\n		shadow += uvw2.x * uvw2.y * computeShadow(shadowSampler, vec3(base_uv.xy + vec2(u[2], v[2]), shadowCoord.z));\n		shadow = shadow / 144.;\n		return shadow;\n}\nfloat computeFallOff(float value, vec2 clipSpace, float frustumEdgeFalloff) {\n		float factor = mix(clipSpace.y * abs(clipSpace.y), dot(clipSpace, clipSpace), step(0., frustumEdgeFalloff));\n		float mask = smoothstep(1.0 - abs(frustumEdgeFalloff), 1.00000012, clamp(factor, 0., 1.));\n		return mix(value, 1.0, mask);\n}\nfloat getShadow(sampler2DShadow shadowMap, vec4 shadowCoord, vec2 shadowMapSize, vec2 shadowBias, vec2 shadowParams) {\n		shadowCoord.xyz /= shadowCoord.w;\n		shadowCoord.z += shadowBias.x;\n		bvec4 inFrustumVec = bvec4 (shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0);\n		bool inFrustum = all(inFrustumVec);\n		bvec2 frustumTestVec = bvec2(inFrustum, shadowCoord.z <= 1.0);\n		bool frustumTest = all(frustumTestVec);\n		float shadow = 1.0;\n		if (frustumTest) {\n				#ifdef USE_HARD_SHADOW\n						shadow = computeShadow(shadowMap, shadowCoord.xyz);\n				#else\n						#ifdef USE_PCF3_SOFT_SHADOW\n								vec2 shadowMapSizeAndInverse = vec2(shadowMapSize.x, 1. / shadowMapSize.x);\n								shadow = computeShadowWithPCF3(shadowMap, shadowCoord.xyz, shadowMapSizeAndInverse);\n						#else\n								#ifdef USE_PCF5_SOFT_SHADOW\n										vec2 shadowMapSizeAndInverse = vec2(shadowMapSize.x, 1. / shadowMapSize.x);\n										shadow = computeShadowWithPCF5(shadowMap, shadowCoord.xyz, shadowMapSizeAndInverse);\n								#else\n										float texelSize = shadowParams.x * 0.5 / shadowMapSize.x;\n										shadow = computeShadowWithPoissonSampling(shadowMap, shadowCoord.xyz, texelSize);\n								#endif\n						#endif\n				#endif\n				shadow = computeFallOff(shadow, shadowCoord.xy * 2. - 1., shadowParams.y);\n		}\n		return shadow;\n}\nfloat textureCubeCompare(samplerCube depths, vec3 uv, float compare) {\n		return step(compare, unpackRGBAToDepth(textureCube(depths, uv)));\n}\nfloat getPointShadow(samplerCube shadowMap, vec4 shadowCoord, vec2 shadowMapSize, vec2 shadowBias, vec2 shadowParams, vec2 shadowCameraRange) {\n		float shadow = 1.0;\n		vec3 lightToPosition = shadowCoord.xyz;\n		float lightToPositionLength = length(lightToPosition);\n		if (lightToPositionLength - shadowCameraRange.y <= 0.0 && lightToPositionLength - shadowCameraRange.x >= 0.0) {\n				float dp = (lightToPositionLength - shadowCameraRange.x) / (shadowCameraRange.y - shadowCameraRange.x);\n				dp += shadowBias.x;\n\t\tvec3 bd3D = normalize(lightToPosition);\n				#ifdef USE_HARD_SHADOW\n						shadow = textureCubeCompare(shadowMap, bd3D, dp);\n				#else\n						float texelSize = shadowParams.x * 0.5 / shadowMapSize.x;\n						vec2 offset = vec2(-1.0, 1.0) * texelSize;\n						shadow = (\n								textureCubeCompare(shadowMap, bd3D + offset.xyy, dp) +\n								textureCubeCompare(shadowMap, bd3D + offset.yyy, dp) +\n								textureCubeCompare(shadowMap, bd3D + offset.xyx, dp) +\n								textureCubeCompare(shadowMap, bd3D + offset.yyx, dp) +\n								textureCubeCompare(shadowMap, bd3D, dp) +\n								textureCubeCompare(shadowMap, bd3D + offset.xxy, dp) +\n								textureCubeCompare(shadowMap, bd3D + offset.yxy, dp) +\n								textureCubeCompare(shadowMap, bd3D + offset.xxx, dp) +\n								textureCubeCompare(shadowMap, bd3D + offset.yxx, dp)\n						) * (1.0 / 9.0);\n				#endif\n		}\n		return shadow;\n}\n#ifdef USE_PCSS_SOFT_SHADOW\n		const vec3 PoissonSamplers32[64] = vec3[64](\n				vec3(0.06407013, 0.05409927, 0.),\n				vec3(0.7366577, 0.5789394, 0.),\n				vec3(-0.6270542, -0.5320278, 0.),\n				vec3(-0.4096107, 0.8411095, 0.),\n				vec3(0.6849564, -0.4990818, 0.),\n				vec3(-0.874181, -0.04579735, 0.),\n				vec3(0.9989998, 0.0009880066, 0.),\n				vec3(-0.004920578, -0.9151649, 0.),\n				vec3(0.1805763, 0.9747483, 0.),\n				vec3(-0.2138451, 0.2635818, 0.),\n				vec3(0.109845, 0.3884785, 0.),\n				vec3(0.06876755, -0.3581074, 0.),\n				vec3(0.374073, -0.7661266, 0.),\n				vec3(0.3079132, -0.1216763, 0.),\n				vec3(-0.3794335, -0.8271583, 0.),\n				vec3(-0.203878, -0.07715034, 0.),\n				vec3(0.5912697, 0.1469799, 0.),\n				vec3(-0.88069, 0.3031784, 0.),\n				vec3(0.5040108, 0.8283722, 0.),\n				vec3(-0.5844124, 0.5494877, 0.),\n				vec3(0.6017799, -0.1726654, 0.),\n				vec3(-0.5554981, 0.1559997, 0.),\n				vec3(-0.3016369, -0.3900928, 0.),\n				vec3(-0.5550632, -0.1723762, 0.),\n				vec3(0.925029, 0.2995041, 0.),\n				vec3(-0.2473137, 0.5538505, 0.),\n				vec3(0.9183037, -0.2862392, 0.),\n				vec3(0.2469421, 0.6718712, 0.),\n				vec3(0.3916397, -0.4328209, 0.),\n				vec3(-0.03576927, -0.6220032, 0.),\n				vec3(-0.04661255, 0.7995201, 0.),\n				vec3(0.4402924, 0.3640312, 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.),\n				vec3(0., 0., 0.)\n		);\n		const vec3 PoissonSamplers64[64] = vec3[64](\n				vec3(-0.613392, 0.617481, 0.),\n				vec3(0.170019, -0.040254, 0.),\n				vec3(-0.299417, 0.791925, 0.),\n				vec3(0.645680, 0.493210, 0.),\n				vec3(-0.651784, 0.717887, 0.),\n				vec3(0.421003, 0.027070, 0.),\n				vec3(-0.817194, -0.271096, 0.),\n				vec3(-0.705374, -0.668203, 0.),\n				vec3(0.977050, -0.108615, 0.),\n				vec3(0.063326, 0.142369, 0.),\n				vec3(0.203528, 0.214331, 0.),\n				vec3(-0.667531, 0.326090, 0.),\n				vec3(-0.098422, -0.295755, 0.),\n				vec3(-0.885922, 0.215369, 0.),\n				vec3(0.566637, 0.605213, 0.),\n				vec3(0.039766, -0.396100, 0.),\n				vec3(0.751946, 0.453352, 0.),\n				vec3(0.078707, -0.715323, 0.),\n				vec3(-0.075838, -0.529344, 0.),\n				vec3(0.724479, -0.580798, 0.),\n				vec3(0.222999, -0.215125, 0.),\n				vec3(-0.467574, -0.405438, 0.),\n				vec3(-0.248268, -0.814753, 0.),\n				vec3(0.354411, -0.887570, 0.),\n				vec3(0.175817, 0.382366, 0.),\n				vec3(0.487472, -0.063082, 0.),\n				vec3(-0.084078, 0.898312, 0.),\n				vec3(0.488876, -0.783441, 0.),\n				vec3(0.470016, 0.217933, 0.),\n				vec3(-0.696890, -0.549791, 0.),\n				vec3(-0.149693, 0.605762, 0.),\n				vec3(0.034211, 0.979980, 0.),\n				vec3(0.503098, -0.308878, 0.),\n				vec3(-0.016205, -0.872921, 0.),\n				vec3(0.385784, -0.393902, 0.),\n				vec3(-0.146886, -0.859249, 0.),\n				vec3(0.643361, 0.164098, 0.),\n				vec3(0.634388, -0.049471, 0.),\n				vec3(-0.688894, 0.007843, 0.),\n				vec3(0.464034, -0.188818, 0.),\n				vec3(-0.440840, 0.137486, 0.),\n				vec3(0.364483, 0.511704, 0.),\n				vec3(0.034028, 0.325968, 0.),\n				vec3(0.099094, -0.308023, 0.),\n				vec3(0.693960, -0.366253, 0.),\n				vec3(0.678884, -0.204688, 0.),\n				vec3(0.001801, 0.780328, 0.),\n				vec3(0.145177, -0.898984, 0.),\n				vec3(0.062655, -0.611866, 0.),\n				vec3(0.315226, -0.604297, 0.),\n				vec3(-0.780145, 0.486251, 0.),\n				vec3(-0.371868, 0.882138, 0.),\n				vec3(0.200476, 0.494430, 0.),\n				vec3(-0.494552, -0.711051, 0.),\n				vec3(0.612476, 0.705252, 0.),\n				vec3(-0.578845, -0.768792, 0.),\n				vec3(-0.772454, -0.090976, 0.),\n				vec3(0.504440, 0.372295, 0.),\n				vec3(0.155736, 0.065157, 0.),\n				vec3(0.391522, 0.849605, 0.),\n				vec3(-0.620106, -0.328104, 0.),\n				vec3(0.789239, -0.419965, 0.),\n				vec3(-0.545396, 0.538133, 0.),\n				vec3(-0.178564, -0.596057, 0.)\n		);\n		float getRand(vec2 seed) {\n				return fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453);\n		}\n		float computeShadowWithPCSS(sampler2D depthSampler, sampler2DShadow shadowSampler, vec3 shadowCoord, float shadowMapSizeInverse, float lightSizeUV, int searchTapCount, int pcfTapCount, vec3[64] poissonSamplers) {\n				float depthMetric = shadowCoord.z;\n				float blockerDepth = 0.0;\n				float sumBlockerDepth = 0.0;\n				float numBlocker = 0.0;\n				for (int i = 0; i < searchTapCount; i++) {\n						blockerDepth = unpackRGBAToDepth(texture(depthSampler, shadowCoord.xy + (lightSizeUV * shadowMapSizeInverse * PoissonSamplers32[i].xy)));\n						if (blockerDepth < depthMetric) {\n								sumBlockerDepth += blockerDepth;\n								numBlocker++;\n						}\n				}\n				if (numBlocker < 1.0) {\n						return 1.0;\n				}\n				float avgBlockerDepth = sumBlockerDepth / numBlocker;\n				float AAOffset = shadowMapSizeInverse * 10.;\n				float penumbraRatio = ((depthMetric - avgBlockerDepth) + AAOffset);\n				float filterRadius = penumbraRatio * lightSizeUV * shadowMapSizeInverse;\n				float random = getRand(shadowCoord.xy);				float rotationAngle = random * 3.1415926;\n				vec2 rotationVector = vec2(cos(rotationAngle), sin(rotationAngle));\n				float shadow = 0.;\n				for (int i = 0; i < pcfTapCount; i++) {\n						vec3 offset = poissonSamplers[i];\n						offset = vec3(offset.x * rotationVector.x - offset.y * rotationVector.y, offset.y * rotationVector.x + offset.x * rotationVector.y, 0.);\n						shadow += texture(shadowSampler, shadowCoord + offset * filterRadius);\n				}\n				shadow /= float(pcfTapCount);\n				shadow = mix(shadow, 1., depthMetric - avgBlockerDepth);\n				return shadow;\n		}\n		float getShadowWithPCSS(sampler2D depthSampler, sampler2DShadow shadowMap, vec4 shadowCoord, vec2 shadowMapSize, vec2 shadowBias, vec2 shadowParams) {\n				shadowCoord.xyz /= shadowCoord.w;\n				shadowCoord.z += shadowBias.x;\n				bvec4 inFrustumVec = bvec4 (shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0);\n				bool inFrustum = all(inFrustumVec);\n				bvec2 frustumTestVec = bvec2(inFrustum, shadowCoord.z <= 1.0);\n				bool frustumTest = all(frustumTestVec);\n				float shadow = 1.0;\n				if (frustumTest) {\n						#ifdef USE_PCSS16_SOFT_SHADOW\n								shadow = computeShadowWithPCSS(depthSampler, shadowMap, shadowCoord.xyz, 1. / shadowMapSize.x, 0.1 * shadowMapSize.x, 16, 16, PoissonSamplers32);\n						#else\n								#ifdef USE_PCSS32_SOFT_SHADOW\n										shadow = computeShadowWithPCSS(depthSampler, shadowMap, shadowCoord.xyz, 1. / shadowMapSize.x, 0.1 * shadowMapSize.x, 16, 32, PoissonSamplers32);\n								#else\n										shadow = computeShadowWithPCSS(depthSampler, shadowMap, shadowCoord.xyz, 1. / shadowMapSize.x, 0.1 * shadowMapSize.x, 32, 64, PoissonSamplers64);\n								#endif\n						#endif\n						shadow = computeFallOff(shadow, shadowCoord.xy * 2. - 1., shadowParams.y);\n				}\n				return shadow;\n		}\n#endif";

	var shadowMap_frag = "#ifdef USE_SHADOW\n#endif";

	var shadowMap_pars_frag = "#ifdef USE_SHADOW\n\t#if NUM_DIR_SHADOWS > 0\n\t\tuniform sampler2DShadow directionalShadowMap[NUM_DIR_SHADOWS];\n\t\tvarying vec4 vDirectionalShadowCoord[NUM_DIR_SHADOWS];\n\t\t#ifdef USE_PCSS_SOFT_SHADOW\n\t\t\tuniform sampler2D directionalDepthMap[NUM_DIR_SHADOWS];\n\t\t#endif\n\t\tstruct DirectLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t};\n\t\tuniform DirectLightShadow u_DirectionalShadow[NUM_DIR_SHADOWS];\n\t#endif\n\t#if NUM_POINT_SHADOWS > 0\n\t\tuniform samplerCube pointShadowMap[NUM_POINT_SHADOWS];\n\t\tvarying vec4 vPointShadowCoord[NUM_POINT_SHADOWS];\n\t\tstruct PointLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t\tvec2 shadowCameraRange;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow u_PointShadow[NUM_POINT_SHADOWS];\n\t#endif\n\t#if NUM_SPOT_SHADOWS > 0\n\t\tuniform sampler2DShadow spotShadowMap[NUM_SPOT_SHADOWS];\n\t\tvarying vec4 vSpotShadowCoord[NUM_SPOT_SHADOWS];\n\t\t#ifdef USE_PCSS_SOFT_SHADOW\n\t\t\tuniform sampler2D spotDepthMap[NUM_SPOT_SHADOWS];\n\t\t#endif\n\t\tstruct SpotLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t};\n\t\tuniform SpotLightShadow u_SpotShadow[NUM_SPOT_SHADOWS];\n\t#endif\n\t#include <packing>\n\t#include <shadow>\n#endif";

	var shadowMap_pars_vert = "#ifdef USE_SHADOW\n\t#if NUM_DIR_SHADOWS > 0\n\t\tuniform mat4 directionalShadowMatrix[NUM_DIR_SHADOWS];\n\t\tvarying vec4 vDirectionalShadowCoord[NUM_DIR_SHADOWS];\n\t\tstruct DirectLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t};\n\t\tuniform DirectLightShadow u_DirectionalShadow[NUM_DIR_SHADOWS];\n\t#endif\n\t#if NUM_POINT_SHADOWS > 0\n\t\tuniform mat4 pointShadowMatrix[NUM_POINT_SHADOWS];\n\t\tvarying vec4 vPointShadowCoord[NUM_POINT_SHADOWS];\n\t\tstruct PointLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t\tvec2 shadowCameraRange;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow u_PointShadow[NUM_POINT_SHADOWS];\n\t#endif\n\t#if NUM_SPOT_SHADOWS > 0\n\t\tuniform mat4 spotShadowMatrix[NUM_SPOT_SHADOWS];\n\t\tvarying vec4 vSpotShadowCoord[NUM_SPOT_SHADOWS];\n\t\tstruct SpotLightShadow {\n\t\t\tvec2 shadowBias;\n\t\t\tvec2 shadowMapSize;\n\t\t\tvec2 shadowParams;\n\t\t};\n\t\tuniform SpotLightShadow u_SpotShadow[NUM_SPOT_SHADOWS];\n\t#endif\n#endif";

	var shadowMap_vert = "\n#ifdef USE_SHADOW\n\tvec3 shadowWorldNormal = (transposeMat4(inverseMat4(u_Model)) * vec4(objectNormal, 0.0)).xyz;\n\tshadowWorldNormal = normalize(shadowWorldNormal);\n\t#ifdef FLIP_SIDED\n\t\tshadowWorldNormal = -shadowWorldNormal;\n\t#endif\n\tvec4 shadowWorldPosition;\n\t#if NUM_DIR_SHADOWS > 0\n\t\t#pragma unroll_loop_start\n\t\tfor (int i = 0; i < NUM_DIR_SHADOWS; i++) {\n\t\t\tshadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_DirectionalShadow[i].shadowBias[1], 0);\n\t\t\tvDirectionalShadowCoord[i] = directionalShadowMatrix[i] * shadowWorldPosition;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_POINT_SHADOWS > 0\n\t\t#pragma unroll_loop_start\n\t\tfor (int i = 0; i < NUM_POINT_SHADOWS; i++) {\n\t\t\tshadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_PointShadow[i].shadowBias[1], 0);\n\t\t\tvPointShadowCoord[i] = pointShadowMatrix[i] * shadowWorldPosition;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_SPOT_SHADOWS > 0\n\t\t#pragma unroll_loop_start\n\t\tfor (int i = 0; i < NUM_SPOT_SHADOWS; i++) {\n\t\t\tshadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_SpotShadow[i].shadowBias[1], 0);\n\t\t\tvSpotShadowCoord[i] = spotShadowMatrix[i] * shadowWorldPosition;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n#endif";

	var morphnormal_vert = "#ifdef USE_MORPHNORMALS\n\tobjectNormal += morphNormal0 * morphTargetInfluences[ 0 ];\n\tobjectNormal += morphNormal1 * morphTargetInfluences[ 1 ];\n\tobjectNormal += morphNormal2 * morphTargetInfluences[ 2 ];\n\tobjectNormal += morphNormal3 * morphTargetInfluences[ 3 ];\n#endif";

	var morphtarget_pars_vert = "#ifdef USE_MORPHTARGETS\n\t#ifndef USE_MORPHNORMALS\n\tuniform float morphTargetInfluences[ 8 ];\n\t#else\n\tuniform float morphTargetInfluences[ 4 ];\n\t#endif\n#endif";

	var morphtarget_vert = "#ifdef USE_MORPHTARGETS\n\ttransformed += morphTarget0 * morphTargetInfluences[ 0 ];\n\ttransformed += morphTarget1 * morphTargetInfluences[ 1 ];\n\ttransformed += morphTarget2 * morphTargetInfluences[ 2 ];\n\ttransformed += morphTarget3 * morphTargetInfluences[ 3 ];\n\t#ifndef USE_MORPHNORMALS\n				transformed += morphTarget4 * morphTargetInfluences[ 4 ];\n				transformed += morphTarget5 * morphTargetInfluences[ 5 ];\n				transformed += morphTarget6 * morphTargetInfluences[ 6 ];\n				transformed += morphTarget7 * morphTargetInfluences[ 7 ];\n\t#endif\n#endif";

	var skinning_pars_vert = "#ifdef USE_SKINNING\n		attribute vec4 skinIndex;\n\tattribute vec4 skinWeight;\n		uniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n		#ifdef BONE_TEXTURE\n				uniform sampler2D boneTexture;\n				uniform int boneTextureSize;\n				mat4 getBoneMatrix( const in float i ) {\n						float j = i * 4.0;\n						float x = mod( j, float( boneTextureSize ) );\n						float y = floor( j / float( boneTextureSize ) );\n						float dx = 1.0 / float( boneTextureSize );\n						float dy = 1.0 / float( boneTextureSize );\n						y = dy * ( y + 0.5 );\n						vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n						vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n						vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n						vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n						mat4 bone = mat4( v1, v2, v3, v4 );\n						return bone;\n				}\n		#else\n				uniform mat4 boneMatrices[MAX_BONES];\n				mat4 getBoneMatrix(const in float i) {\n						mat4 bone = boneMatrices[int(i)];\n						return bone;\n				}\n		#endif\n#endif";

	var skinning_vert = "#ifdef USE_SKINNING\n		mat4 boneMatX = getBoneMatrix( skinIndex.x );\n		mat4 boneMatY = getBoneMatrix( skinIndex.y );\n		mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n		mat4 boneMatW = getBoneMatrix( skinIndex.w );\n		vec4 skinVertex = bindMatrix * vec4(transformed, 1.0);\n		vec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\tskinned = bindMatrixInverse * skinned;\n		transformed = skinned.xyz / skinned.w;\n#endif";

	var skinnormal_vert = "#ifdef USE_SKINNING\n		mat4 skinMatrix = mat4( 0.0 );\n		skinMatrix += skinWeight.x * boneMatX;\n		skinMatrix += skinWeight.y * boneMatY;\n		skinMatrix += skinWeight.z * boneMatZ;\n		skinMatrix += skinWeight.w * boneMatW;\n		skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n		objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n		#ifdef USE_TANGENT\n\t\tobjectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n\t#endif\n#endif";

	var specularMap_frag = "float specularStrength;\n#ifdef USE_SPECULARMAP\n\tvec4 texelSpecular = texture2D( specularMap, v_Uv );\n\tspecularStrength = texelSpecular.r;\n#else\n\tspecularStrength = 1.0;\n#endif";

	var specularMap_pars_frag = "#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif";

	var transpose = "mat4 transposeMat4(mat4 inMatrix) {\n		vec4 i0 = inMatrix[0];\n		vec4 i1 = inMatrix[1];\n		vec4 i2 = inMatrix[2];\n		vec4 i3 = inMatrix[3];\n		mat4 outMatrix = mat4(\n				vec4(i0.x, i1.x, i2.x, i3.x),\n				vec4(i0.y, i1.y, i2.y, i3.y),\n				vec4(i0.z, i1.z, i2.z, i3.z),\n				vec4(i0.w, i1.w, i2.w, i3.w)\n		);\n		return outMatrix;\n}";

	var tsn = "mat3 tsn(vec3 N, vec3 V, vec2 uv) {\n		vec3 q0 = dFdx(V.xyz);\n		vec3 q1 = dFdy(V.xyz);\n		vec2 st0 = dFdx(uv.xy);\n		vec2 st1 = dFdy(uv.xy);\n		float scale = sign(st1.y * st0.x - st0.y * st1.x);\n		vec3 S = normalize((q0 * st1.y - q1 * st0.y) * scale);\n		vec3 T = normalize((-q0 * st1.x + q1 * st0.x) * scale);\n		return mat3(S, T, N);\n}";

	var uv_pars_frag = "#ifdef USE_UV1\n		varying vec2 v_Uv;\n#endif";

	var uv_pars_vert = "#if defined(USE_UV) || defined(USE_UV1)\n		uniform mat3 uvTransform;\n#endif\n#ifdef USE_UV1\n		attribute vec2 a_Uv;\n		varying vec2 v_Uv;\n#endif";

	var uv_vert = "#ifdef USE_UV1\n		v_Uv = (uvTransform * vec3(a_Uv, 1.)).xy;\n#endif";

	var modelPos_pars_frag = "varying vec3 v_modelPos;";

	var modelPos_pars_vert = "varying vec3 v_modelPos;";

	var modelPos_vert = "\nv_modelPos = worldPosition.xyz;";

	var logdepthbuf_frag = "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tgl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif";

	var logdepthbuf_pars_frag = "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tuniform float logDepthBufFC;\n\tvarying float vFragDepth;\n\tvarying float vIsPerspective;\n#endif";

	var logdepthbuf_pars_vert = "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tuniform float logDepthCameraNear;\n\t\tvarying float vFragDepth;\n\t\tvarying float vIsPerspective;\n\t#else\n\t\tuniform float logDepthBufFC;\n\t\tuniform float logDepthCameraNear;\n\t#endif\n#endif";

	var logdepthbuf_vert = "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvFragDepth = 1.0 + gl_Position.w - logDepthCameraNear;\n\t\tvIsPerspective = float( isPerspectiveMatrix( u_Projection ) );\n\t#else\n\t\tif ( isPerspectiveMatrix( u_Projection ) ) {\n\t\t\tgl_Position.z = log2( max( EPSILON, gl_Position.w - logDepthCameraNear + 1.0 ) ) * logDepthBufFC - 1.0;\n\t\t\tgl_Position.z *= gl_Position.w;\n\t\t}\n\t#endif\n#endif";

	var clearcoat_pars_frag = "#ifdef USE_CLEARCOAT\n\tuniform float u_Clearcoat;\n\tuniform float u_ClearcoatRoughness;\n#endif\n#ifdef USE_CLEARCOATMAP\n\tuniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\tuniform sampler2D clearcoatRoughnessMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tuniform sampler2D clearcoatNormalMap;\n\tuniform vec2 clearcoatNormalScale;\n#endif";

	const ShaderChunk = {
		alphaTest_frag: alphaTest_frag,
		alphaTest_pars_frag: alphaTest_pars_frag,
		aoMap_pars_frag: aoMap_pars_frag,
		aoMap_pars_vert: aoMap_pars_vert,
		aoMap_vert: aoMap_vert,
		aoMap_frag: aoMap_frag,
		begin_frag: begin_frag,
		begin_vert: begin_vert,
		bsdfs: bsdfs,
		bumpMap_pars_frag: bumpMap_pars_frag,
		clippingPlanes_frag: clippingPlanes_frag,
		clippingPlanes_pars_frag: clippingPlanes_pars_frag,
		color_frag: color_frag,
		color_pars_frag: color_pars_frag,
		color_pars_vert: color_pars_vert,
		color_vert: color_vert,
		common_frag: common_frag,
		common_vert: common_vert,
		diffuseMap_frag: diffuseMap_frag,
		diffuseMap_pars_frag: diffuseMap_pars_frag,
		diffuseMap_vert: diffuseMap_vert,
		diffuseMap_pars_vert: diffuseMap_pars_vert,
		emissiveMap_frag: emissiveMap_frag,
		emissiveMap_pars_frag: emissiveMap_pars_frag,
		emissiveMap_vert: emissiveMap_vert,
		emissiveMap_pars_vert: emissiveMap_pars_vert,
		encodings_frag: encodings_frag,
		encodings_pars_frag: encodings_pars_frag,
		end_frag: end_frag,
		envMap_frag: envMap_frag,
		envMap_pars_frag: envMap_pars_frag,
		envMap_pars_vert: envMap_pars_vert,
		envMap_vert: envMap_vert,
		fog_frag: fog_frag,
		fog_pars_frag: fog_pars_frag,
		inverse: inverse,
		light_frag: light_frag,
		light_pars_frag: light_pars_frag,
		alphamap_pars_frag: alphamap_pars_frag,
		alphamap_frag: alphamap_frag,
		alphamap_pars_vert: alphamap_pars_vert,
		alphamap_vert: alphamap_vert,
		normalMap_pars_frag: normalMap_pars_frag,
		normal_frag: normal_frag,
		normal_pars_frag: normal_pars_frag,
		normal_pars_vert: normal_pars_vert,
		normal_vert: normal_vert,
		packing: packing,
		premultipliedAlpha_frag: premultipliedAlpha_frag,
		pvm_vert: pvm_vert,
		dithering_frag: dithering_frag,
		dithering_pars_frag: dithering_pars_frag,
		shadow: shadow,
		shadowMap_frag: shadowMap_frag,
		shadowMap_pars_frag: shadowMap_pars_frag,
		shadowMap_pars_vert: shadowMap_pars_vert,
		shadowMap_vert: shadowMap_vert,
		morphnormal_vert: morphnormal_vert,
		morphtarget_pars_vert: morphtarget_pars_vert,
		morphtarget_vert: morphtarget_vert,
		skinning_pars_vert: skinning_pars_vert,
		skinning_vert: skinning_vert,
		skinnormal_vert: skinnormal_vert,
		specularMap_frag: specularMap_frag,
		specularMap_pars_frag: specularMap_pars_frag,
		transpose: transpose,
		tsn: tsn,
		uv_pars_frag: uv_pars_frag,
		uv_pars_vert: uv_pars_vert,
		uv_vert: uv_vert,
		modelPos_pars_frag: modelPos_pars_frag,
		modelPos_pars_vert: modelPos_pars_vert,
		modelPos_vert: modelPos_vert,
		logdepthbuf_frag: logdepthbuf_frag,
		logdepthbuf_pars_frag: logdepthbuf_pars_frag,
		logdepthbuf_pars_vert: logdepthbuf_pars_vert,
		logdepthbuf_vert: logdepthbuf_vert,
		clearcoat_pars_frag: clearcoat_pars_frag
	};

	var basic_frag = "#include <common_frag>\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <alphaTest_pars_frag>\n#include <modelPos_pars_frag>\n#if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)\n		#include <normalMap_pars_frag>\n		#include <normal_pars_frag>		\n#endif\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <fog_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		reflectedLight.indirectDiffuse += vec3(1.0);\n		#include <aoMap_frag>\n		reflectedLight.indirectDiffuse *= outColor.xyz;\n		outColor.xyz = reflectedLight.indirectDiffuse;\n		#if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)\n				#include <normal_frag>\n		#endif\n		#include <envMap_frag>\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n}";

	var basic_vert = "#include <common_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <diffuseMap_pars_vert>\n#include <modelPos_pars_vert>\n#if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)\n		#include <normal_pars_vert>\n#endif\n#include <envMap_pars_vert>\n#include <aoMap_pars_vert>\n#include <alphamap_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <skinning_vert>\n		#include <pvm_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <diffuseMap_vert>\n		#include <modelPos_vert>\n		#ifdef USE_ENV_MAP\n				#include <morphnormal_vert>\n				#include <skinnormal_vert>\n				#ifndef USE_VERTEX_ENVDIR\n						#include <normal_vert>\n				#endif	\n		#endif\n		#include <envMap_vert>\n		#include <aoMap_vert>\n		#include <alphamap_vert>\n}";

	var depth_frag = "#include <common_frag>\n#include <diffuseMap_pars_frag>\n#include <alphaTest_pars_frag>\n#include <modelPos_pars_frag>\n#include <uv_pars_frag>\n#include <packing>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)\n				vec4 texelColor = texture2D( diffuseMap, v_Uv );\n				float alpha = texelColor.a * u_Opacity;\n				if(alpha < u_AlphaTest) discard;\n		#endif\n		#include <logdepthbuf_frag>\n		\n		#ifdef DEPTH_PACKING_RGBA\n				gl_FragColor = packDepthToRGBA(gl_FragCoord.z);\n		#else\n				gl_FragColor = vec4( vec3( 1.0 - gl_FragCoord.z ), u_Opacity );\n		#endif\n}";

	var depth_vert = "#include <common_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <uv_pars_vert>\n#include <modelPos_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <uv_vert>\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <skinning_vert>\n		#include <pvm_vert>\n		#include <logdepthbuf_vert>\n		#include <modelPos_vert>\n}";

	var distance_frag = "#include <common_frag>\nuniform float nearDistance;\nuniform float farDistance;\n#include <modelPos_pars_frag>\n#include <packing>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		\n		float dist = length( v_modelPos - u_CameraPosition );\n\tdist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n\tdist = saturate( dist );\n		gl_FragColor = packDepthToRGBA(dist);\n}";

	var distance_vert = "#include <common_vert>\n#include <modelPos_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <skinning_vert>\n		#include <pvm_vert>\n		#include <modelPos_vert>\n}";

	var lambert_frag = "#define USE_LAMBERT\n#include <common_frag>\n#include <dithering_pars_frag>\nuniform vec3 emissive;\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <normalMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <alphaTest_pars_frag>\n#include <bumpMap_pars_frag>\n#include <light_pars_frag>\n#include <normal_pars_frag>\n#include <modelPos_pars_frag>\n#include <bsdfs>\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <shadowMap_pars_frag>\n#include <fog_pars_frag>\n#include <emissiveMap_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		#include <light_frag>\n		#include <aoMap_frag>\n		outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n		#include <envMap_frag>\n		#include <shadowMap_frag>\n		vec3 totalEmissiveRadiance = emissive;\n		#include <emissiveMap_frag>\n		outColor.xyz += totalEmissiveRadiance;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var lambert_vert = "#define USE_LAMBERT\n#include <common_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <diffuseMap_pars_vert>\n#include <modelPos_pars_vert>\n#include <envMap_pars_vert>\n#include <aoMap_pars_vert>\n#include <alphamap_pars_vert>\n#include <emissiveMap_pars_vert>\n#include <shadowMap_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <pvm_vert>\n		#include <normal_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <diffuseMap_vert>\n		#include <modelPos_vert>\n		#include <envMap_vert>\n		#include <aoMap_vert>\n		#include <alphamap_vert>\n		#include <emissiveMap_vert>\n		#include <shadowMap_vert>\n}";

	var normaldepth_frag = "#include <common_frag>\n#include <diffuseMap_pars_frag>\n#include <alphaTest_pars_frag>\n#include <uv_pars_frag>\n#include <packing>\n#include <normal_pars_frag>\n#include <logdepthbuf_pars_frag>\nvoid main() {\n		#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)\n				vec4 texelColor = texture2D( diffuseMap, v_Uv );\n				float alpha = texelColor.a * u_Opacity;\n				if(alpha < u_AlphaTest) discard;\n		#endif\n		#include <logdepthbuf_frag>\n		vec4 packedNormalDepth;\n		packedNormalDepth.xyz = normalize(v_Normal) * 0.5 + 0.5;\n		packedNormalDepth.w = gl_FragCoord.z;\n		gl_FragColor = packedNormalDepth;\n}";

	var normaldepth_vert = "#include <common_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <uv_vert>\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <normal_vert>\n		#include <pvm_vert>\n		#include <logdepthbuf_vert>\n}";

	var pbr_frag = "#define USE_PBR\n#include <common_frag>\n#include <dithering_pars_frag>\nuniform float u_Metalness;\n#ifdef USE_METALNESSMAP\n\tuniform sampler2D metalnessMap;\n#endif\nuniform float u_Roughness;\n#ifdef USE_ROUGHNESSMAP\n\tuniform sampler2D roughnessMap;\n#endif\nuniform vec3 emissive;\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <alphaTest_pars_frag>\n#include <normalMap_pars_frag>\n#include <bumpMap_pars_frag>\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <light_pars_frag>\n#include <normal_pars_frag>\n#include <clearcoat_pars_frag>\n#include <modelPos_pars_frag>\n#include <bsdfs>\n#include <shadowMap_pars_frag>\n#include <fog_pars_frag>\n#include <emissiveMap_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		float roughnessFactor = u_Roughness;\n		#ifdef USE_ROUGHNESSMAP\n		\tvec4 texelRoughness = texture2D( roughnessMap, v_Uv );\n		\troughnessFactor *= texelRoughness.g;\n		#endif\n		float metalnessFactor = u_Metalness;\n		#ifdef USE_METALNESSMAP\n		\tvec4 texelMetalness = texture2D( metalnessMap, v_Uv );\n		\tmetalnessFactor *= texelMetalness.b;\n		#endif\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		#include <light_frag>\n		#include <aoMap_frag>\n		outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n		#include <shadowMap_frag>\n		vec3 totalEmissiveRadiance = emissive;\n		#include <emissiveMap_frag>\n		outColor.xyz += totalEmissiveRadiance;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var pbr2_frag = "#define USE_PBR\n#define USE_PBR2\n#include <common_frag>\n#include <dithering_pars_frag>\nuniform vec3 u_SpecularColor;\n#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif\nuniform float glossiness;\n#ifdef USE_GLOSSINESSMAP\n\tuniform sampler2D glossinessMap;\n#endif\nuniform vec3 emissive;\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <alphaTest_pars_frag>\n#include <normalMap_pars_frag>\n#include <bumpMap_pars_frag>\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <light_pars_frag>\n#include <normal_pars_frag>\n#include <modelPos_pars_frag>\n#include <bsdfs>\n#include <shadowMap_pars_frag>\n#include <fog_pars_frag>\n#include <emissiveMap_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		vec3 specularFactor = u_SpecularColor;\n		#ifdef USE_SPECULARMAP\n				vec4 texelSpecular = texture2D(specularMap, v_Uv);\n				texelSpecular = sRGBToLinear(texelSpecular);\n				specularFactor *= texelSpecular.rgb;\n		#endif\n		float glossinessFactor = glossiness;\n		#ifdef USE_GLOSSINESSMAP\n				vec4 texelGlossiness = texture2D(glossinessMap, v_Uv);\n				glossinessFactor *= texelGlossiness.a;\n		#endif\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		#include <light_frag>\n		#include <aoMap_frag>\n		outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n		#include <shadowMap_frag>\n		vec3 totalEmissiveRadiance = emissive;\n		#include <emissiveMap_frag>\n		outColor.xyz += totalEmissiveRadiance;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var pbr_vert = "#define USE_PBR\n#include <common_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <diffuseMap_pars_vert>\n#include <modelPos_pars_vert>\n#include <envMap_pars_vert>\n#include <aoMap_pars_vert>\n#include <alphamap_pars_vert>\n#include <emissiveMap_pars_vert>\n#include <shadowMap_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <pvm_vert>\n		#include <normal_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <diffuseMap_vert>\n		#include <modelPos_vert>\n		#include <envMap_vert>\n		#include <aoMap_vert>\n		#include <alphamap_vert>\n		#include <emissiveMap_vert>\n		#include <shadowMap_vert>\n}";

	var phong_frag = "#define USE_PHONG\n#include <common_frag>\n#include <dithering_pars_frag>\nuniform float u_Specular;\nuniform vec3 u_SpecularColor;\n#include <specularMap_pars_frag>\nuniform vec3 emissive;\n#include <uv_pars_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <alphamap_pars_frag>\n#include <alphaTest_pars_frag>\n#include <normalMap_pars_frag>\n#include <bumpMap_pars_frag>\n#include <light_pars_frag>\n#include <normal_pars_frag>\n#include <modelPos_pars_frag>\n#include <bsdfs>\n#include <envMap_pars_frag>\n#include <aoMap_pars_frag>\n#include <shadowMap_pars_frag>\n#include <fog_pars_frag>\n#include <emissiveMap_pars_frag>\n#include <logdepthbuf_pars_frag>\n#include <clippingPlanes_pars_frag>\nvoid main() {\n		#include <clippingPlanes_frag>\n		#include <logdepthbuf_frag>\n		#include <begin_frag>\n		#include <color_frag>\n		#include <diffuseMap_frag>\n		#include <alphamap_frag>\n		#include <alphaTest_frag>\n		#include <normal_frag>\n		#include <specularMap_frag>\n		ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));\n		#include <light_frag>\n		#include <aoMap_frag>\n		outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n		#include <envMap_frag>\n		#include <shadowMap_frag>\n		vec3 totalEmissiveRadiance = emissive;\n		#include <emissiveMap_frag>\n		outColor.xyz += totalEmissiveRadiance;\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n		#include <dithering_frag>\n}";

	var phong_vert = "#define USE_PHONG\n#include <common_vert>\n#include <normal_pars_vert>\n#include <uv_pars_vert>\n#include <color_pars_vert>\n#include <diffuseMap_pars_vert>\n#include <modelPos_pars_vert>\n#include <envMap_pars_vert>\n#include <aoMap_pars_vert>\n#include <alphamap_pars_vert>\n#include <emissiveMap_pars_vert>\n#include <shadowMap_pars_vert>\n#include <morphtarget_pars_vert>\n#include <skinning_pars_vert>\n#include <logdepthbuf_pars_vert>\nvoid main() {\n		#include <begin_vert>\n		#include <morphtarget_vert>\n		#include <morphnormal_vert>\n		#include <skinning_vert>\n		#include <skinnormal_vert>\n		#include <pvm_vert>\n		#include <normal_vert>\n		#include <logdepthbuf_vert>\n		#include <uv_vert>\n		#include <color_vert>\n		#include <diffuseMap_vert>\n		#include <modelPos_vert>\n		#include <envMap_vert>\n		#include <aoMap_vert>\n		#include <alphamap_vert>\n		#include <emissiveMap_vert>\n		#include <shadowMap_vert>\n}";

	var point_frag = "#include <common_frag>\n#include <color_pars_frag>\n#include <diffuseMap_pars_frag>\n#include <fog_pars_frag>\n#include <logdepthbuf_pars_frag>\nvoid main() {\n		#include <begin_frag>\n		#include <color_frag>\n		#include <logdepthbuf_frag>\n		#ifdef USE_DIFFUSE_MAP\n				outColor *= texture2D(diffuseMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));\n		#endif\n		#include <end_frag>\n		#include <encodings_frag>\n		#include <premultipliedAlpha_frag>\n		#include <fog_frag>\n}";

	var point_vert = "#include <common_vert>\n#include <color_pars_vert>\n#include <logdepthbuf_pars_vert>\nuniform float u_PointSize;\nuniform vec2 u_RenderTargetSize;\nvoid main() {\n		#include <begin_vert>\n		#include <pvm_vert>\n		#include <color_vert>\n		vec4 mvPosition = u_View * u_Model * vec4(transformed, 1.0);\n		#ifdef USE_SIZEATTENUATION\n				gl_PointSize = u_PointSize * (u_RenderTargetSize.y * 0.5 / -mvPosition.z);\n		#else\n				gl_PointSize = u_PointSize;\n		#endif\n		#include <logdepthbuf_vert>\n}";

	const ShaderLib = {
		basic_frag: basic_frag,
		basic_vert: basic_vert,
		depth_frag: depth_frag,
		depth_vert: depth_vert,
		distance_frag: distance_frag,
		distance_vert: distance_vert,
		lambert_frag: lambert_frag,
		lambert_vert: lambert_vert,
		normaldepth_frag: normaldepth_frag,
		normaldepth_vert: normaldepth_vert,
		pbr_frag: pbr_frag,
		pbr_vert: pbr_vert,
		pbr2_frag: pbr2_frag,
		pbr2_vert: pbr_vert,
		phong_frag: phong_frag,
		phong_vert: phong_vert,
		point_frag: point_frag,
		point_vert: point_vert
	};

	class WebGLAttribute {
		constructor(gl, program, attributeData) {
			this.gl = gl;
			this.name = attributeData.name;
			this.type = attributeData.type;
			this.size = attributeData.size;
			this.location = gl.getAttribLocation(program, this.name);
			this.count = getAttributeCount(gl, this.type);
			this.format = getAttributeFormat(gl, this.type);
			this.locationSize = 1;
			if (this.type === gl.FLOAT_MAT2) this.locationSize = 2;
			if (this.type === gl.FLOAT_MAT3) this.locationSize = 3;
			if (this.type === gl.FLOAT_MAT4) this.locationSize = 4;
		}
	}
	function getAttributeCount(gl, type) {
		switch (type) {
			case gl.FLOAT:
			case gl.INT:
			case gl.UNSIGNED_INT:
				return 1;
			case gl.FLOAT_VEC2:
			case gl.INT_VEC2:
				return 2;
			case gl.FLOAT_VEC3:
			case gl.INT_VEC3:
				return 3;
			case gl.FLOAT_VEC4:
			case gl.INT_VEC4:
				return 4;
			case gl.FLOAT_MAT2:
				return 4;
			case gl.FLOAT_MAT3:
				return 9;
			case gl.FLOAT_MAT4:
				return 16;
			default:
				return 0;
		}
	}
	function getAttributeFormat(gl, type) {
		switch (type) {
			case gl.FLOAT:
			case gl.FLOAT_VEC2:
			case gl.FLOAT_VEC3:
			case gl.FLOAT_VEC4:
			case gl.FLOAT_MAT2:
			case gl.FLOAT_MAT3:
			case gl.FLOAT_MAT4:
				return gl.FLOAT;
			case gl.INT:
			case gl.INT_VEC2:
			case gl.INT_VEC3:
			case gl.INT_VEC4:
				return gl.INT;
			case gl.UNSIGNED_INT:
				return gl.UNSIGNED_INT;
			default:
				return gl.FLOAT;
		}
	}

	class WebGLCapabilities {
		constructor(gl) {
			this._gl = gl;
			this._extensions = {};

			// webgl version

			this.version = parseFloat(/^WebGL (\d)/.exec(gl.getParameter(gl.VERSION))[1]);

			// texture filter anisotropic extension
			// this extension is available to both, WebGL1 and WebGL2 contexts.

			const anisotropyExt = this.getExtension('EXT_texture_filter_anisotropic');
			this.anisotropyExt = anisotropyExt;
			this.maxAnisotropy = anisotropyExt !== null ? gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;

			// query extension

			let timerQuery = null,
				canUseTimestamp = false;
			try {
				if (this.version > 1) {
					timerQuery = this.getExtension('EXT_disjoint_timer_query_webgl2');
					if (timerQuery) {
						canUseTimestamp = !!gl.getQuery(timerQuery.TIMESTAMP_EXT, timerQuery.QUERY_COUNTER_BITS_EXT);
					}
				} else {
					timerQuery = this.getExtension('EXT_disjoint_timer_query');
					if (timerQuery) {
						canUseTimestamp = !!timerQuery.getQueryEXT(timerQuery.TIMESTAMP_EXT, timerQuery.QUERY_COUNTER_BITS_EXT);
					}
				}
			} catch (err) {
				console.warn(err);
			}
			this.timerQuery = timerQuery;
			this.canUseTimestamp = canUseTimestamp;

			// parallel_shader_compile

			this.parallelShaderCompileExt = this.getExtension('KHR_parallel_shader_compile');

			// others

			this.maxPrecision = getMaxPrecision(gl, 'highp');
			this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
			this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
			this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
			this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
			this.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
			this.maxSamples = this.version > 1 ? gl.getParameter(gl.MAX_SAMPLES) : 1;
			this.lineWidthRange = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
		}
		getExtension(name) {
			const gl = this._gl;
			const extensions = this._extensions;
			if (extensions[name] !== undefined) {
				return extensions[name];
			}
			let ext = null;
			for (const prefix of vendorPrefixes) {
				ext = gl.getExtension(prefix + name);
				if (ext) {
					break;
				}
			}
			extensions[name] = ext;
			return ext;
		}
	}
	const vendorPrefixes = ['', 'WEBKIT_', 'MOZ_'];
	function getMaxPrecision(gl, precision) {
		if (precision === 'highp') {
			if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
				return 'highp';
			}
			precision = 'mediump';
		}
		if (precision === 'mediump') {
			if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
				return 'mediump';
			}
		}
		return 'lowp';
	}

	// This class handles buffer creation and updating for geometries.
	class WebGLGeometries extends PropertyMap {
		constructor(prefix, gl, buffers, vertexArrayBindings) {
			super(prefix);
			this._gl = gl;
			this._buffers = buffers;
			this._vertexArrayBindings = vertexArrayBindings;
			const that = this;
			function onGeometryDispose(event) {
				const geometry = event.target;
				const geometryProperties = that.get(geometry);
				geometry.removeEventListener('dispose', onGeometryDispose);
				if (geometry.index !== null) {
					buffers.removeBuffer(geometry.index.buffer);
				}
				for (const name in geometry.attributes) {
					buffers.removeBuffer(geometry.attributes[name].buffer);
				}
				for (const name in geometry.morphAttributes) {
					const array = geometry.morphAttributes[name];
					for (let i = 0, l = array.length; i < l; i++) {
						buffers.removeBuffer(array[i].buffer);
					}
				}
				vertexArrayBindings.releaseByGeometry(geometry);
				geometryProperties.created = false;
				that.delete(geometry);
			}
			this._onGeometryDispose = onGeometryDispose;
		}
		setGeometry(geometry, passInfo) {
			const gl = this._gl;
			const buffers = this._buffers;
			const geometryProperties = this.get(geometry);

			// If in pass rendering, skip the geometry if it has been set in this pass.
			if (geometryProperties.pass === passInfo.count) {
				return;
			}
			geometryProperties.pass = passInfo.count;
			if (!geometryProperties.created) {
				geometry.addEventListener('dispose', this._onGeometryDispose);
				geometryProperties.created = true;
			}
			if (geometry.index !== null) {
				buffers.setBuffer(geometry.index.buffer, gl.ELEMENT_ARRAY_BUFFER, this._vertexArrayBindings);
			}
			for (const name in geometry.attributes) {
				buffers.setBuffer(geometry.attributes[name].buffer, gl.ARRAY_BUFFER);
			}
			for (const name in geometry.morphAttributes) {
				const array = geometry.morphAttributes[name];
				for (let i = 0, l = array.length; i < l; i++) {
					buffers.setBuffer(array[i].buffer, gl.ARRAY_BUFFER);
				}
			}
			return geometryProperties;
		}
	}

	// Build-in uniforms

	const internalUniforms = {
		'u_Model': [1, null],
		'u_Projection': [2, function (cameraData) {
			this.set(cameraData.projectionMatrix.elements);
		}],
		'u_View': [2, function (cameraData) {
			this.set(cameraData.viewMatrix.elements);
		}],
		'u_ProjectionView': [2, function (cameraData) {
			this.set(cameraData.projectionViewMatrix.elements);
		}],
		'u_CameraPosition': [2, function (cameraData) {
			this.setValue(cameraData.position.x, cameraData.position.y, cameraData.position.z);
		}],
		'logDepthBufFC': [2, function (cameraData) {
			this.set(cameraData.logDepthBufFC);
		}],
		'logDepthCameraNear': [2, function (cameraData) {
			this.set(cameraData.logDepthCameraNear);
		}],
		'u_FogColor': [3, function (sceneData) {
			const color = sceneData.fog.color;
			this.setValue(color.r, color.g, color.b);
		}],
		'u_FogDensity': [3, function (sceneData) {
			this.set(sceneData.fog.density);
		}],
		'u_FogNear': [3, function (sceneData) {
			this.set(sceneData.fog.near);
		}],
		'u_FogFar': [3, function (sceneData) {
			this.set(sceneData.fog.far);
		}],
		'u_Color': [4, function (material, textures) {
			const color = material.diffuse;
			this.setValue(color.r, color.g, color.b);
		}],
		'u_Opacity': [4, function (material, textures) {
			this.set(material.opacity);
		}],
		'u_AlphaTest': [4, function (material, textures) {
			this.set(material.alphaTest);
		}],
		'diffuseMap': [4, function (material, textures) {
			this.set(material.diffuseMap, textures);
		}],
		'alphaMap': [4, function (material, textures) {
			this.set(material.alphaMap, textures);
		}],
		'alphaMapUVTransform': [4, function (material, textures) {
			const transform = material.alphaMapTransform;
			transform.isTransformUV && transform.update();
			this.set(transform.elements);
		}],
		'normalMap': [4, function (material, textures) {
			this.set(material.normalMap, textures);
		}],
		'normalScale': [4, function (material, textures) {
			this.setValue(material.normalScale.x, material.normalScale.y);
		}],
		'bumpMap': [4, function (material, textures) {
			this.set(material.bumpMap, textures);
		}],
		'bumpScale': [4, function (material, textures) {
			this.set(material.bumpScale);
		}],
		'cubeMap': [4, function (material, textures) {
			this.set(material.cubeMap, textures);
		}],
		'u_Specular': [4, function (material, textures) {
			this.set(material.shininess);
		}],
		'u_SpecularColor': [4, function (material, textures) {
			const color = material.specular;
			this.setValue(color.r, color.g, color.b);
		}],
		'specularMap': [4, function (material, textures) {
			this.set(material.specularMap, textures);
		}],
		'aoMap': [4, function (material, textures) {
			this.set(material.aoMap, textures);
		}],
		'aoMapIntensity': [4, function (material, textures) {
			this.set(material.aoMapIntensity);
		}],
		'aoMapUVTransform': [4, function (material, textures) {
			const transform = material.aoMapTransform;
			transform.isTransformUV && transform.update();
			this.set(transform.elements);
		}],
		'u_Roughness': [4, function (material, textures) {
			this.set(material.roughness);
		}],
		'roughnessMap': [4, function (material, textures) {
			this.set(material.roughnessMap, textures);
		}],
		'u_Metalness': [4, function (material, textures) {
			this.set(material.metalness);
		}],
		'metalnessMap': [4, function (material, textures) {
			this.set(material.metalnessMap, textures);
		}],
		'u_Clearcoat': [4, function (material, textures) {
			this.set(material.clearcoat);
		}],
		'u_ClearcoatRoughness': [4, function (material, textures) {
			this.set(material.clearcoatRoughness);
		}],
		'clearcoatMap': [4, function (material, textures) {
			this.set(material.clearcoatMap, textures);
		}],
		'clearcoatRoughnessMap': [4, function (material, textures) {
			this.set(material.clearcoatRoughnessMap, textures);
		}],
		'clearcoatNormalMap': [4, function (material, textures) {
			this.set(material.clearcoatNormalMap, textures);
		}],
		'clearcoatNormalScale': [4, function (material, textures) {
			this.setValue(material.clearcoatNormalScale.x, material.clearcoatNormalScale.y);
		}],
		'glossiness': [4, function (material, textures) {
			this.set(material.glossiness);
		}],
		'glossinessMap': [4, function (material, textures) {
			this.set(material.glossinessMap, textures);
		}],
		'emissive': [4, function (material, textures) {
			const color = material.emissive;
			this.setValue(color.r, color.g, color.b);
		}],
		'emissiveMap': [4, function (material, textures) {
			this.set(material.emissiveMap, textures);
		}],
		'emissiveMapUVTransform': [4, function (material, textures) {
			const transform = material.emissiveMapTransform;
			transform.isTransformUV && transform.update();
			this.set(transform.elements);
		}],
		'uvTransform': [4, function (material, textures) {
			const transform = material.diffuseMapTransform;
			transform.isTransformUV && transform.update();
			this.set(transform.elements);
		}],
		'u_PointSize': [4, function (material, textures) {
			this.set(material.size);
		}],
		'envMap': [5, function (envData, textures) {
			this.set(envData.map, textures);
		}],
		'envMapParams': [5, function (envData, textures) {
			this.setValue(envData.diffuse, envData.specular, envData.map.images[0] && envData.map.images[0].rtt ? 1 : -1);
		}],
		'maxMipLevel': [5, function (envData, textures) {
			this.set(textures.get(envData.map).__maxMipLevel || 8);
		}]
	};

	// Empty textures

	const emptyTexture = new Texture2D();
	emptyTexture.image = {
		data: new Uint8Array([1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1]),
		width: 2,
		height: 2
	};
	emptyTexture.magFilter = TEXTURE_FILTER.NEAREST;
	emptyTexture.minFilter = TEXTURE_FILTER.NEAREST;
	emptyTexture.generateMipmaps = false;
	emptyTexture.version++;
	const emptyShadowTexture = new Texture2D();
	emptyShadowTexture.image = {
		data: null,
		width: 2,
		height: 2
	};
	emptyShadowTexture.version++;
	emptyShadowTexture.type = PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV;
	emptyShadowTexture.format = PIXEL_FORMAT.DEPTH_STENCIL;
	emptyShadowTexture.magFilter = TEXTURE_FILTER.NEAREST;
	emptyShadowTexture.minFilter = TEXTURE_FILTER.NEAREST;
	emptyShadowTexture.compare = COMPARE_FUNC.LESS;
	emptyShadowTexture.generateMipmaps = false;
	emptyShadowTexture.version++;
	const emptyTexture3d = new Texture3D();
	const emptyTexture2dArray = new Texture2DArray();
	const emptyCubeTexture = new TextureCube();

	// Array helpers

	function arraysEqual(a, b) {
		if (a.length !== b.length) return false;
		for (let i = 0, l = a.length; i < l; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}
	function copyArray(a, b) {
		for (let i = 0, l = b.length; i < l; i++) {
			a[i] = b[i];
		}
	}

	// Texture unit allocation

	const arrayCacheI32 = [];
	function allocTexUnits(textures, n) {
		let r = arrayCacheI32[n];
		if (r === undefined) {
			r = new Int32Array(n);
			arrayCacheI32[n] = r;
		}
		for (let i = 0; i !== n; ++i) {
			r[i] = textures.allocTexUnit();
		}
		return r;
	}

	// Helper to pick the right setter for uniform

	function generateSetter(uniform, pureArray) {
		const gl = uniform.gl;
		const type = uniform.type;
		const location = uniform.location;
		const cache = uniform.cache;
		switch (type) {
			case gl.FLOAT:
				uniform.setValue = function (value) {
					if (cache[0] === value) return;
					gl.uniform1f(location, value);
					cache[0] = value;
				};
				if (pureArray) {
					uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniform1fv(location, value);
						copyArray(cache, value);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.SAMPLER_2D:
			case gl.SAMPLER_2D_SHADOW:
			case gl.INT_SAMPLER_2D:
			case gl.UNSIGNED_INT_SAMPLER_2D:
				uniform.setValue = function (value, textures) {
					const unit = textures.allocTexUnit();
					textures.setTexture2D(value || (type === gl.SAMPLER_2D_SHADOW ? emptyShadowTexture : emptyTexture), unit);
					if (cache[0] === unit) return;
					gl.uniform1i(location, unit);
					cache[0] = unit;
				};
				if (pureArray) {
					uniform.set = function (value, textures) {
						const n = value.length;
						const units = allocTexUnits(textures, n);
						for (let i = 0; i !== n; ++i) {
							textures.setTexture2D(value[i] || (type === gl.SAMPLER_2D_SHADOW ? emptyShadowTexture : emptyTexture), units[i]);
						}
						if (arraysEqual(cache, units)) return;
						gl.uniform1iv(location, units);
						copyArray(cache, units);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.SAMPLER_2D_ARRAY:
			case gl.SAMPLER_2D_ARRAY_SHADOW:
			case gl.INT_SAMPLER_2D_ARRAY:
			case gl.UNSIGNED_INT_SAMPLER_2D_ARRAY:
				uniform.setValue = function (value, textures) {
					const unit = textures.allocTexUnit();
					textures.setTexture2DArray(value || emptyTexture2dArray, unit);
					if (cache[0] === unit) return;
					gl.uniform1i(location, unit);
					cache[0] = unit;
				};
				if (pureArray) {
					uniform.set = function (value, textures) {
						const n = value.length;
						const units = allocTexUnits(textures, n);
						for (let i = 0; i !== n; ++i) {
							textures.setTexture2DArray(value[i] || emptyTexture2dArray, units[i]);
						}
						if (arraysEqual(cache, units)) return;
						gl.uniform1iv(location, units);
						copyArray(cache, units);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.SAMPLER_CUBE:
			case gl.SAMPLER_CUBE_SHADOW:
				uniform.setValue = function (value, textures) {
					const unit = textures.allocTexUnit();
					textures.setTextureCube(value || emptyCubeTexture, unit);
					if (cache[0] === unit) return;
					gl.uniform1i(location, unit);
					cache[0] = unit;
				};
				if (pureArray) {
					uniform.set = function (value, textures) {
						const n = value.length;
						const units = allocTexUnits(textures, n);
						for (let i = 0; i !== n; ++i) {
							textures.setTextureCube(value[i] || emptyCubeTexture, units[i]);
						}
						if (arraysEqual(cache, units)) return;
						gl.uniform1iv(location, units);
						copyArray(cache, units);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.SAMPLER_3D:
				uniform.setValue = function (value, textures) {
					const unit = textures.allocTexUnit();
					textures.setTexture3D(value || emptyTexture3d, unit);
					if (cache[0] === unit) return;
					gl.uniform1i(location, unit);
					cache[0] = unit;
				};
				if (pureArray) {
					uniform.set = function (value, textures) {
						const n = value.length;
						const units = allocTexUnits(textures, n);
						for (let i = 0; i !== n; ++i) {
							textures.setTexture3D(value[i] || emptyTexture3d, units[i]);
						}
						if (arraysEqual(cache, units)) return;
						gl.uniform1iv(location, units);
						copyArray(cache, units);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.BOOL:
			case gl.INT:
				uniform.setValue = function (value) {
					if (cache[0] === value) return;
					gl.uniform1i(location, value);
					cache[0] = value;
				};
				if (pureArray) {
					uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniform1iv(location, value);
						copyArray(cache, value);
					};
				} else {
					uniform.set = uniform.setValue;
				}
				break;
			case gl.FLOAT_VEC2:
				uniform.setValue = function (p1, p2) {
					if (cache[0] !== p1 || cache[1] !== p2) {
						gl.uniform2f(location, p1, p2);
						cache[0] = p1;
						cache[1] = p2;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform2fv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.BOOL_VEC2:
			case gl.INT_VEC2:
				uniform.setValue = function (p1, p2) {
					if (cache[0] !== p1 || cache[1] !== p2) {
						gl.uniform2i(location, p1, p2);
						cache[0] = p1;
						cache[1] = p2;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform2iv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.FLOAT_VEC3:
				uniform.setValue = function (p1, p2, p3) {
					if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3) {
						gl.uniform3f(location, p1, p2, p3);
						cache[0] = p1;
						cache[1] = p2;
						cache[2] = p3;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform3fv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.BOOL_VEC3:
			case gl.INT_VEC3:
				uniform.setValue = function (p1, p2, p3) {
					if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3) {
						gl.uniform3i(location, p1, p2, p3);
						cache[0] = p1;
						cache[1] = p2;
						cache[2] = p3;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform3iv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.FLOAT_VEC4:
				uniform.setValue = function (p1, p2, p3, p4) {
					if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3 || cache[3] !== p4) {
						gl.uniform4f(location, p1, p2, p3, p4);
						cache[0] = p1;
						cache[1] = p2;
						cache[2] = p3;
						cache[3] = p4;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform4fv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.BOOL_VEC4:
			case gl.INT_VEC4:
				uniform.setValue = function (p1, p2, p3, p4) {
					if (cache[0] !== p1 || cache[1] !== p2 || cache[2] !== p3 || cache[3] !== p4) {
						gl.uniform4i(location, p1, p2, p3, p4);
						cache[0] = p1;
						cache[1] = p2;
						cache[2] = p3;
						cache[3] = p4;
					}
				};
				uniform.set = function (value) {
					if (arraysEqual(cache, value)) return;
					gl.uniform4iv(location, value);
					copyArray(cache, value);
				};
				break;
			case gl.FLOAT_MAT2:
				if (pureArray) {
					uniform.setValue = uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniformMatrix2fv(location, false, value);
						copyArray(cache, value);
					};
				} else {
					uniform.setValue = uniform.set = function (value) {
						if (cache[0] !== value[0] || cache[1] !== value[1] || cache[2] !== value[2] || cache[3] !== value[3]) {
							gl.uniformMatrix2fv(location, false, value);
							cache[0] = value[0];
							cache[1] = value[1];
							cache[2] = value[2];
							cache[3] = value[3];
						}
					};
				}
				break;
			case gl.FLOAT_MAT3:
				if (pureArray) {
					uniform.setValue = uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniformMatrix3fv(location, false, value);
						copyArray(cache, value);
					};
				} else {
					uniform.setValue = uniform.set = function (value) {
						if (cache[0] !== value[0] || cache[1] !== value[1] || cache[2] !== value[2] || cache[3] !== value[3] || cache[4] !== value[4] || cache[5] !== value[5] || cache[6] !== value[6] || cache[7] !== value[7] || cache[8] !== value[8]) {
							gl.uniformMatrix3fv(location, false, value);
							cache[0] = value[0];
							cache[1] = value[1];
							cache[2] = value[2];
							cache[3] = value[3];
							cache[4] = value[4];
							cache[5] = value[5];
							cache[6] = value[6];
							cache[7] = value[7];
							cache[8] = value[8];
						}
					};
				}
				break;
			case gl.FLOAT_MAT4:
				if (pureArray) {
					uniform.setValue = uniform.set = function (value) {
						if (arraysEqual(cache, value)) return;
						gl.uniformMatrix4fv(location, false, value);
						copyArray(cache, value);
					};
				} else {
					uniform.setValue = uniform.set = function (value) {
						if (cache[0] !== value[0] || cache[1] !== value[1] || cache[2] !== value[2] || cache[3] !== value[3] || cache[4] !== value[4] || cache[5] !== value[5] || cache[6] !== value[6] || cache[7] !== value[7] || cache[8] !== value[8] || cache[9] !== value[9] || cache[10] !== value[10] || cache[11] !== value[11] || cache[12] !== value[12] || cache[13] !== value[13] || cache[14] !== value[14] || cache[15] !== value[15]) {
							gl.uniformMatrix4fv(location, false, value);
							cache[0] = value[0];
							cache[1] = value[1];
							cache[2] = value[2];
							cache[3] = value[3];
							cache[4] = value[4];
							cache[5] = value[5];
							cache[6] = value[6];
							cache[7] = value[7];
							cache[8] = value[8];
							cache[9] = value[9];
							cache[10] = value[10];
							cache[11] = value[11];
							cache[12] = value[12];
							cache[13] = value[13];
							cache[14] = value[14];
							cache[15] = value[15];
						}
					};
				}
				break;
		}
	}

	// --- Uniform Classes ---

	class SingleUniform {
		constructor(gl, id, activeInfo, location) {
			this.gl = gl;
			this.id = id;
			this.type = activeInfo.type;

			// this.size = activeInfo.size; // always be 1

			this.location = location;
			this.setValue = undefined;
			this.set = undefined;
			this.cache = [];
			generateSetter(this);

			// internal

			this.internalGroup = 0;
			this.internalFun = null;
			const internal = internalUniforms[id];
			if (internal) {
				this.internalGroup = internal[0];
				this.internalFun = internal[1];
			}
		}
	}
	class PureArrayUniform {
		constructor(gl, id, activeInfo, location) {
			this.gl = gl;
			this.id = id;
			this.type = activeInfo.type;
			this.size = activeInfo.size;
			this.location = location;
			this.setValue = undefined;
			this.set = undefined;
			this.cache = [];
			generateSetter(this, true);
		}
	}
	class UniformContainer {
		constructor() {
			this.seq = [];
			this.map = {};
		}
	}
	class StructuredUniform extends UniformContainer {
		constructor(id) {
			super();
			this.id = id;
		}
		set(value, textures) {
			const seq = this.seq;
			for (let i = 0, n = seq.length; i !== n; ++i) {
				const u = seq[i];
				u.set(value[u.id], textures);
			}
		}
	}

	// --- Top-level ---

	// Parser - builds up the property tree from the path strings

	const RePathPart = /(\w+)(\])?(\[|\.)?/g;

	// extracts
	// 	- the identifier (member name or array index)
	//	- followed by an optional right bracket (found when array index)
	//	- followed by an optional left bracket or dot (type of subscript)
	//
	// Note: These portions can be read in a non-overlapping fashion and
	// allow straightforward parsing of the hierarchy that WebGL encodes
	// in the uniform names.

	function addUniform(container, uniformObject) {
		container.seq.push(uniformObject);
		container.map[uniformObject.id] = uniformObject;
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform
	function parseUniform(gl, activeInfo, location, container) {
		const path = activeInfo.name,
			pathLength = path.length;

		// reset RegExp object, because of the early exit of a previous run
		RePathPart.lastIndex = 0;
		while (true) {
			const match = RePathPart.exec(path),
				matchEnd = RePathPart.lastIndex;
			let id = match[1];
			const idIsIndex = match[2] === ']',
				subscript = match[3];
			if (idIsIndex) id = id | 0; // convert to integer

			if (subscript === undefined || subscript === '[' && matchEnd + 2 === pathLength) {
				// bare name or "pure" bottom-level array "[0]" suffix
				addUniform(container, subscript === undefined ? new SingleUniform(gl, id, activeInfo, location) : new PureArrayUniform(gl, id, activeInfo, location));
				break;
			} else {
				// step into inner node / create it in case it doesn't exist
				const map = container.map;
				let next = map[id];
				if (next === undefined) {
					next = new StructuredUniform(id);
					addUniform(container, next);
				}
				container = next;
			}
		}
	}

	// Root Container

	class WebGLUniforms extends UniformContainer {
		constructor(gl, program) {
			super();
			const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
			for (let i = 0; i < n; ++i) {
				const info = gl.getActiveUniform(program, i),
					addr = gl.getUniformLocation(program, info.name);
				parseUniform(gl, info, addr, this);
			}
		}
		set(name, value, textures) {
			const u = this.map[name];
			if (u !== undefined) u.set(value, textures);
		}
		has(name) {
			return !!this.map[name];
		}
	}

	let programIdCount = 0;
	class WebGLProgram {
		constructor(gl, vshader, fshader) {
			this.gl = gl;
			this.vshaderSource = vshader;
			this.fshaderSource = fshader;
			this.id = programIdCount++;
			this.usedTimes = 1;
			this.code = '';
			this.name = '';
			this.lightId = -1;
			this.lightVersion = -1;
			this.cameraId = -1;
			this.cameraVersion = -1;
			this.sceneId = -1;
			this.sceneVersion = -1;
			this.program;
			this._checkErrors = true;
			this._compileAsynchronously = false;
			this._status = 0;
			let program, vertexShader, fragmentShader;

			// compile program
			this.compile = function (options) {
				// create shaders

				vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
				fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);

				// create a program object

				program = gl.createProgram();
				gl.attachShader(program, vertexShader);
				gl.attachShader(program, fragmentShader);
				gl.linkProgram(program);
				this.program = program;

				// set properties

				this._checkErrors = options.checkErrors;
				this._compileAsynchronously = options.compileAsynchronously;
				this._status = 1;

				// here we can delete shaders,
				// according to the documentation: https://www.opengl.org/sdk/docs/man/html/glLinkProgram.xhtml

				gl.deleteShader(vertexShader);
				gl.deleteShader(fragmentShader);
			};

			// check if program is ready to be used
			this.isReady = function (parallelShaderCompileExt) {
				if (this._status === 1) {
					if (this._compileAsynchronously && parallelShaderCompileExt) {
						if (gl.getProgramParameter(program, parallelShaderCompileExt.COMPLETION_STATUS_KHR)) {
							this._status = 2;
							this._tryCheckErrors();
						}
					} else {
						this._status = 2;
						this._tryCheckErrors();
					}
				}
				return this._status === 2;
			};
			this._tryCheckErrors = function () {
				if (!this._checkErrors) return;
				if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
					const programLog = gl.getProgramInfoLog(program).trim();
					const vertexErrors = getShaderErrors(gl, vertexShader, 'VERTEX');
					const fragmentErrors = getShaderErrors(gl, fragmentShader, 'FRAGMENT');
					this.program = undefined;
					this._status = 0;
					console.error('Shader Error ' + gl.getError() + ' - ' + 'VALIDATE_STATUS ' + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + '\n\n' + 'Shader Name: ' + this.name + '\n' + 'Program Info Log: ' + programLog + '\n' + vertexErrors + '\n' + fragmentErrors);
				}
			};

			// set up caching for uniforms

			let cachedUniforms;
			this.getUniforms = function () {
				if (cachedUniforms === undefined) {
					cachedUniforms = new WebGLUniforms(gl, program);
				}
				return cachedUniforms;
			};

			// set up caching for attributes

			let cachedAttributes;
			this.getAttributes = function () {
				if (cachedAttributes === undefined) {
					cachedAttributes = extractAttributes(gl, program);
				}
				return cachedAttributes;
			};

			// free program

			this.dispose = function () {
				gl.deleteProgram(program);
				this.program = undefined;
				this._status = 0;
			};
		}
	}
	function handleSource(string, errorLine) {
		const lines = string.split('\n');
		const lines2 = [];
		const from = Math.max(errorLine - 6, 0);
		const to = Math.min(errorLine + 6, lines.length);
		for (let i = from; i < to; i++) {
			const line = i + 1;
			lines2.push(`${line === errorLine ? '>' : ' '} ${line}: ${lines[i]}`);
		}
		return lines2.join('\n');
	}
	function loadShader(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	}
	function getShaderErrors(gl, shader, type) {
		const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		const errors = gl.getShaderInfoLog(shader).trim();
		if (status && errors === '') return '';
		const errorMatches = /ERROR: 0:(\d+)/.exec(errors);
		if (errorMatches) {
			// --enable-privileged-webgl-extension
			// console.log( '**' + type + '**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( shader ) );

			const errorLine = parseInt(errorMatches[1]);
			return type + '\n\n' + errors + '\n\n' + handleSource(gl.getShaderSource(shader), errorLine);
		} else {
			return errors;
		}
	}

	// extract attributes
	function extractAttributes(gl, program) {
		const attributes = {};
		const totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < totalAttributes; i++) {
			const attribData = gl.getActiveAttrib(program, i);
			attributes[attribData.name] = new WebGLAttribute(gl, program, attribData);
		}
		return attributes;
	}

	class WebGLPrograms {
		constructor(gl, state, capabilities) {
			this._gl = gl;
			this._state = state;
			this._capabilities = capabilities;
			this._programs = [];
		}
		getProgram(material, props, programCode, compileOptions) {
			const programs = this._programs;
			let program;
			for (let p = 0, pl = programs.length; p < pl; p++) {
				const programInfo = programs[p];
				if (programInfo.code === programCode) {
					program = programInfo;
					++program.usedTimes;
					break;
				}
			}
			if (program === undefined) {
				const customDefines = generateDefines(material.defines);
				const vertexShader = ShaderLib[material.type + '_vert'] || material.vertexShader || ShaderLib.basic_vert;
				const fragmentShader = ShaderLib[material.type + '_frag'] || material.fragmentShader || ShaderLib.basic_frag;
				program = createProgram(this._gl, customDefines, props, vertexShader, fragmentShader);
				program.name = props.shaderName;
				program.compile(compileOptions);
				program.code = programCode;
				programs.push(program);
			}
			return program;
		}
		releaseProgram(program) {
			if (--program.usedTimes === 0) {
				const programs = this._programs;

				// Remove from unordered set
				const index = programs.indexOf(program);
				programs[index] = programs[programs.length - 1];
				programs.pop();

				// Free WebGL resources
				program.dispose(this._gl);
			}
		}
		generateProps(material, object, lightingState, renderStates) {
			const state = this._state;
			const capabilities = this._capabilities;
			const fog = material.fog ? renderStates.scene.fog : null;
			const envMap = material.envMap !== undefined ? material.envMap || renderStates.scene.environment : null;
			const logarithmicDepthBuffer = renderStates.scene.logarithmicDepthBuffer;
			const disableShadowSampler = renderStates.scene.disableShadowSampler;
			const numClippingPlanes = material.clippingPlanes && material.clippingPlanes.length > 0 ? material.clippingPlanes.length : renderStates.scene.numClippingPlanes;
			const HAS_CLEARCOAT = material.clearcoat > 0;
			const HAS_DIFFUSEMAP = !!material.diffuseMap;
			const HAS_ALPHAMAP = !!material.alphaMap;
			const HAS_EMISSIVEMAP = !!material.emissiveMap;
			const HAS_AOMAP = !!material.aoMap;
			const HAS_NORMALMAP = !!material.normalMap;
			const HAS_BUMPMAP = !!material.bumpMap;
			const HAS_SPECULARMAP = !!material.specularMap;
			const HAS_ROUGHNESSMAP = !!material.roughnessMap;
			const HAS_METALNESSMAP = !!material.metalnessMap;
			const HAS_GLOSSINESSMAP = !!material.glossinessMap;
			const HAS_ENVMAP = !!envMap;
			const HAS_CLEARCOATMAP = HAS_CLEARCOAT && !!material.clearcoatMap;
			const HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !!material.clearcoatRoughnessMap;
			const HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !!material.clearcoatNormalMap;
			_activeMapCoords = material.extUvCoordMask; // reset

			const props = {}; // cache this props?

			props.shaderName = material.type === MATERIAL_TYPE.SHADER && material.shaderName ? material.shaderName : material.type;

			// capabilities

			props.version = capabilities.version;
			props.precision = material.precision || capabilities.maxPrecision;
			props.useStandardDerivatives = capabilities.version >= 2 || !!capabilities.getExtension('OES_standard_derivatives') || !!capabilities.getExtension('GL_OES_standard_derivatives');
			props.useShaderTextureLOD = capabilities.version >= 2 || !!capabilities.getExtension('EXT_shader_texture_lod');

			// maps

			props.useDiffuseMap = HAS_DIFFUSEMAP;
			props.useAlphaMap = HAS_ALPHAMAP;
			props.useEmissiveMap = HAS_EMISSIVEMAP;
			props.useAOMap = HAS_AOMAP;
			props.useNormalMap = HAS_NORMALMAP;
			props.useBumpMap = HAS_BUMPMAP;
			props.useSpecularMap = HAS_SPECULARMAP;
			props.useRoughnessMap = HAS_ROUGHNESSMAP;
			props.useMetalnessMap = HAS_METALNESSMAP;
			props.useGlossinessMap = HAS_GLOSSINESSMAP;
			props.useEnvMap = HAS_ENVMAP;
			props.envMapCombine = HAS_ENVMAP && material.envMapCombine;
			props.useClearcoat = HAS_CLEARCOAT;
			props.useClearcoatMap = HAS_CLEARCOATMAP;
			props.useClearcoatRoughnessMap = HAS_CLEARCOAT_ROUGHNESSMAP;
			props.useClearcoatNormalMap = HAS_CLEARCOAT_NORMALMAP;
			props.diffuseMapUv = HAS_DIFFUSEMAP && getUVChannel(material.diffuseMapCoord);
			props.alphaMapUv = HAS_ALPHAMAP && getUVChannel(material.alphaMapCoord);
			props.emissiveMapUv = HAS_EMISSIVEMAP && getUVChannel(material.emissiveMapCoord);
			props.aoMapUv = HAS_AOMAP && getUVChannel(material.aoMapCoord);
			if (HAS_NORMALMAP || HAS_BUMPMAP || HAS_SPECULARMAP || HAS_ROUGHNESSMAP || HAS_METALNESSMAP || HAS_GLOSSINESSMAP || HAS_CLEARCOATMAP || HAS_CLEARCOAT_ROUGHNESSMAP || HAS_CLEARCOAT_NORMALMAP) {
				_activeMapCoords |= 1 << 0; // these maps use uv coord 0 by default
			}
			props.activeMapCoords = _activeMapCoords;

			// lights

			lightingState.setProgramProps(props, object.receiveShadow);
			props.useShadowSampler = capabilities.version >= 2 && !disableShadowSampler;
			props.shadowType = object.shadowType;
			if (!props.useShadowSampler && props.shadowType !== SHADOW_TYPE.HARD) {
				props.shadowType = SHADOW_TYPE.POISSON_SOFT;
			}
			props.dithering = material.dithering;

			// encoding

			const currentRenderTarget = state.currentRenderTarget;
			props.gammaFactor = renderStates.gammaFactor;
			props.outputEncoding = currentRenderTarget.texture ? getTextureEncodingFromMap(currentRenderTarget.texture) : renderStates.outputEncoding;
			props.diffuseMapEncoding = getTextureEncodingFromMap(material.diffuseMap || material.cubeMap);
			props.envMapEncoding = getTextureEncodingFromMap(envMap);
			props.emissiveMapEncoding = getTextureEncodingFromMap(material.emissiveMap);

			// other

			props.alphaTest = material.alphaTest > 0;
			props.premultipliedAlpha = material.premultipliedAlpha;
			props.useVertexColors = material.vertexColors;
			props.useVertexTangents = !!material.normalMap && material.vertexTangents;
			props.numClippingPlanes = numClippingPlanes;
			props.flatShading = material.shading === SHADING_TYPE.FLAT_SHADING;
			props.fog = !!fog;
			props.fogExp2 = !!fog && fog.isFogExp2;
			props.sizeAttenuation = material.sizeAttenuation;
			props.doubleSided = material.side === DRAW_SIDE.DOUBLE;
			props.flipSided = material.side === DRAW_SIDE.BACK;
			props.packDepthToRGBA = material.packToRGBA;
			props.logarithmicDepthBuffer = !!logarithmicDepthBuffer;
			props.rendererExtensionFragDepth = capabilities.version >= 2 || !!capabilities.getExtension('EXT_frag_depth');

			// morph targets

			props.morphTargets = !!object.morphTargetInfluences;
			props.morphNormals = !!object.morphTargetInfluences && object.geometry.morphAttributes.normal;

			// skinned mesh

			const useSkinning = object.isSkinnedMesh && object.skeleton;
			const maxVertexUniformVectors = capabilities.maxVertexUniformVectors;
			const useVertexTexture = capabilities.maxVertexTextures > 0 && (!!capabilities.getExtension('OES_texture_float') || capabilities.version >= 2);
			let maxBones = 0;
			if (useVertexTexture) {
				maxBones = 1024;
			} else {
				maxBones = object.skeleton ? object.skeleton.bones.length : 0;
				if (maxBones * 16 > maxVertexUniformVectors) {
					console.warn('Program: too many bones (' + maxBones + '), current cpu only support ' + Math.floor(maxVertexUniformVectors / 16) + ' bones!!');
					maxBones = Math.floor(maxVertexUniformVectors / 16);
				}
			}
			props.useSkinning = useSkinning;
			props.bonesNum = maxBones;
			props.useVertexTexture = useVertexTexture;
			return props;
		}
		generateProgramCode(props, material) {
			let code = '';
			for (const key in props) {
				code += props[key] + '_';
			}
			for (const name in material.defines) {
				code += name + '_' + material.defines[name] + '_';
			}

			// If the material type is SHADER and there is no shader Name,
			// use the entire shader code as part of the signature
			if (material.type === MATERIAL_TYPE.SHADER && !material.shaderName) {
				code += material.vertexShader;
				code += material.fragmentShader;
			}
			return code;
		}
	}

	// Helper functions

	function generateDefines(defines) {
		const chunks = [];
		for (const name in defines) {
			const value = defines[name];
			if (value === false) continue;
			chunks.push('#define ' + name + ' ' + value);
		}
		return chunks.join('\n');
	}
	let _activeMapCoords = 0; // bit mask

	function getUVChannel(coord) {
		_activeMapCoords |= 1 << coord;
		if (coord === 0) return 'a_Uv';
		return `a_Uv${coord + 1}`; // a_Uv2, a_Uv3, a_Uv4, ...
	}
	function getTextureEncodingFromMap(map) {
		let encoding;
		if (!map) {
			encoding = TEXEL_ENCODING_TYPE.LINEAR;
		} else if (map.encoding) {
			encoding = map.encoding;
		}
		return encoding;
	}
	function getEncodingComponents(encoding) {
		switch (encoding) {
			case TEXEL_ENCODING_TYPE.LINEAR:
				return ['Linear', '(value)'];
			case TEXEL_ENCODING_TYPE.SRGB:
				return ['sRGB', '(value)'];
			case TEXEL_ENCODING_TYPE.GAMMA:
				return ['Gamma', '(value, float(GAMMA_FACTOR))'];
			default:
				console.error('unsupported encoding: ' + encoding);
		}
	}
	function getTexelDecodingFunction(functionName, encoding) {
		const components = getEncodingComponents(encoding);
		return 'vec4 ' + functionName + '(vec4 value) { return ' + components[0] + 'ToLinear' + components[1] + '; }';
	}
	function getTexelEncodingFunction(functionName, encoding) {
		const components = getEncodingComponents(encoding);
		return 'vec4 ' + functionName + '(vec4 value) { return LinearTo' + components[0] + components[1] + '; }';
	}
	function uvAttributes(activeMapCoords) {
		let str = '';
		for (let i = 1; i < 8; i++) {
			// skip uv0
			if (activeMapCoords & 1 << i) {
				str += 'attribute vec2 a_Uv' + (i + 1) + ';';
				if (i !== 7) str += '\n';
			}
		}
		return str;
	}
	function createProgram(gl, defines, props, vertex, fragment) {
		let prefixVertex = ['precision ' + props.precision + ' float;', 'precision ' + props.precision + ' int;',
		// depth texture may have precision problem on iOS device.
		'precision ' + props.precision + ' sampler2D;', props.version >= 2 ? 'precision ' + props.precision + ' isampler2D;' : '', props.version >= 2 ? 'precision ' + props.precision + ' usampler2D;' : '', '#define SHADER_NAME ' + props.shaderName, defines, props.version >= 2 ? '#define WEBGL2' : '',
		// maps

		props.useDiffuseMap ? '#define USE_DIFFUSE_MAP' : '', props.useAlphaMap ? '#define USE_ALPHA_MAP' : '', props.useEmissiveMap ? '#define USE_EMISSIVEMAP' : '', props.useAOMap ? '#define USE_AOMAP' : '', props.useNormalMap ? '#define USE_NORMAL_MAP' : '', props.useBumpMap ? '#define USE_BUMPMAP' : '', props.useSpecularMap ? '#define USE_SPECULARMAP' : '', props.useRoughnessMap ? '#define USE_ROUGHNESSMAP' : '', props.useMetalnessMap ? '#define USE_METALNESSMAP' : '', props.useGlossinessMap ? '#define USE_GLOSSINESSMAP' : '', props.useEnvMap ? '#define USE_ENV_MAP' : '', props.diffuseMapUv ? '#define DIFFUSEMAP_UV ' + props.diffuseMapUv : '', props.alphaMapUv ? '#define ALPHAMAP_UV ' + props.alphaMapUv : '', props.emissiveMapUv ? '#define EMISSIVEMAP_UV ' + props.emissiveMapUv : '', props.aoMapUv ? '#define AOMAP_UV ' + props.aoMapUv : '', props.activeMapCoords > 0 ? '#define USE_UV' : '', props.activeMapCoords & 1 ? '#define USE_UV1' : '', uvAttributes(props.activeMapCoords),
		// lights

		props.useAmbientLight ? '#define USE_AMBIENT_LIGHT' : '', props.useSphericalHarmonicsLight ? '#define USE_SPHERICALHARMONICS_LIGHT' : '', props.useShadow ? '#define USE_SHADOW' : '',
		// other

		props.useVertexColors == VERTEX_COLOR.RGB ? '#define USE_VCOLOR_RGB' : '', props.useVertexColors == VERTEX_COLOR.RGBA ? '#define USE_VCOLOR_RGBA' : '', props.useVertexTangents ? '#define USE_TANGENT' : '', props.flatShading ? '#define FLAT_SHADED' : '', props.fog ? '#define USE_FOG' : '', props.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '', props.flipSided ? '#define FLIP_SIDED' : '', props.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '', props.logarithmicDepthBuffer && props.rendererExtensionFragDepth ? '#define USE_LOGDEPTHBUF_EXT' : '',
		// morph targets

		props.morphTargets ? '#define USE_MORPHTARGETS' : '', props.morphNormals && props.flatShading === false ? '#define USE_MORPHNORMALS' : '',
		// skinned mesh

		props.useSkinning ? '#define USE_SKINNING' : '', props.bonesNum > 0 ? '#define MAX_BONES ' + props.bonesNum : '', props.useVertexTexture ? '#define BONE_TEXTURE' : '', '\n'].filter(filterEmptyLine).join('\n');
		let prefixFragment = [
		// use dfdx and dfdy must enable OES_standard_derivatives
		props.useStandardDerivatives && props.version < 2 ? '#extension GL_OES_standard_derivatives : enable' : '', props.useShaderTextureLOD && props.version < 2 ? '#extension GL_EXT_shader_texture_lod : enable' : '', props.logarithmicDepthBuffer && props.rendererExtensionFragDepth && props.version < 2 ? '#extension GL_EXT_frag_depth : enable' : '', 'precision ' + props.precision + ' float;', 'precision ' + props.precision + ' int;',
		// depth texture may have precision problem on iOS device.
		'precision ' + props.precision + ' sampler2D;', props.version >= 2 ? 'precision ' + props.precision + ' isampler2D;' : '', props.version >= 2 ? 'precision ' + props.precision + ' usampler2D;' : '', props.version >= 2 ? 'precision ' + props.precision + ' sampler2DShadow;' : '', props.version >= 2 ? 'precision ' + props.precision + ' samplerCubeShadow;' : '', '#define SHADER_NAME ' + props.shaderName, '#define PI 3.14159265359', '#define EPSILON 1e-6', 'float pow2(const in float x) { return x * x; }', '#define LOG2 1.442695', '#define RECIPROCAL_PI 0.31830988618', '#define saturate(a) clamp(a, 0.0, 1.0)', '#define whiteCompliment(a) (1.0 - saturate(a))',
		// expects values in the range of [0,1] x [0,1], returns values in the [0,1] range.
		// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
		'highp float rand(const in vec2 uv) {', '	const highp float a = 12.9898, b = 78.233, c = 43758.5453;', '	highp float dt = dot(uv.xy, vec2(a, b)), sn = mod(dt, PI);', '	return fract(sin(sn) * c);', '}', defines, props.version >= 2 ? '#define WEBGL2' : '', props.useShadowSampler ? '#define USE_SHADOW_SAMPLER' : '#define sampler2DShadow sampler2D', props.useShaderTextureLOD ? '#define TEXTURE_LOD_EXT' : '',
		// maps

		props.useDiffuseMap ? '#define USE_DIFFUSE_MAP' : '', props.useAlphaMap ? '#define USE_ALPHA_MAP' : '', props.useEmissiveMap ? '#define USE_EMISSIVEMAP' : '', props.useAOMap ? '#define USE_AOMAP' : '', props.useNormalMap ? '#define USE_NORMAL_MAP' : '', props.useBumpMap ? '#define USE_BUMPMAP' : '', props.useSpecularMap ? '#define USE_SPECULARMAP' : '', props.useRoughnessMap ? '#define USE_ROUGHNESSMAP' : '', props.useMetalnessMap ? '#define USE_METALNESSMAP' : '', props.useGlossinessMap ? '#define USE_GLOSSINESSMAP' : '', props.useEnvMap ? '#define USE_ENV_MAP' : '', props.envMapCombine ? '#define ' + props.envMapCombine : '', props.useClearcoat ? '#define USE_CLEARCOAT' : '', props.useClearcoatMap ? '#define USE_CLEARCOATMAP' : '', props.useClearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '', props.useClearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '', props.activeMapCoords & 1 ? '#define USE_UV1' : '',
		// lights

		props.useAmbientLight ? '#define USE_AMBIENT_LIGHT' : '', props.useSphericalHarmonicsLight ? '#define USE_SPHERICALHARMONICS_LIGHT' : '', props.useClusteredLights ? '#define USE_CLUSTERED_LIGHTS' : '', props.useShadow ? '#define USE_SHADOW' : '', props.shadowType === SHADOW_TYPE.HARD ? '#define USE_HARD_SHADOW' : '', props.shadowType === SHADOW_TYPE.POISSON_SOFT ? '#define USE_POISSON_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCF3_SOFT ? '#define USE_PCF3_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCF5_SOFT ? '#define USE_PCF5_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCSS16_SOFT ? '#define USE_PCSS16_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCSS32_SOFT ? '#define USE_PCSS32_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCSS64_SOFT ? '#define USE_PCSS64_SOFT_SHADOW' : '', props.shadowType === SHADOW_TYPE.PCSS16_SOFT || props.shadowType === SHADOW_TYPE.PCSS32_SOFT || props.shadowType === SHADOW_TYPE.PCSS64_SOFT ? '#define USE_PCSS_SOFT_SHADOW' : '', props.dithering ? '#define DITHERING' : '',
		// encoding

		ShaderChunk['encodings_pars_frag'], '#define GAMMA_FACTOR ' + props.gammaFactor, getTexelEncodingFunction('linearToOutputTexel', props.outputEncoding), getTexelDecodingFunction('mapTexelToLinear', props.diffuseMapEncoding), props.useEnvMap ? getTexelDecodingFunction('envMapTexelToLinear', props.envMapEncoding) : '', props.useEmissiveMap ? getTexelDecodingFunction('emissiveMapTexelToLinear', props.emissiveMapEncoding) : '',
		// other

		props.alphaTest ? '#define ALPHATEST' : '', props.premultipliedAlpha ? '#define USE_PREMULTIPLIED_ALPHA' : '', props.useVertexColors == VERTEX_COLOR.RGB ? '#define USE_VCOLOR_RGB' : '', props.useVertexColors == VERTEX_COLOR.RGBA ? '#define USE_VCOLOR_RGBA' : '', props.useVertexTangents ? '#define USE_TANGENT' : '', props.flatShading ? '#define FLAT_SHADED' : '', props.fog ? '#define USE_FOG' : '', props.fogExp2 ? '#define USE_EXP2_FOG' : '', props.doubleSided ? '#define DOUBLE_SIDED' : '', props.packDepthToRGBA ? '#define DEPTH_PACKING_RGBA' : '', props.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '', props.logarithmicDepthBuffer && props.rendererExtensionFragDepth ? '#define USE_LOGDEPTHBUF_EXT' : '', '\n'].filter(filterEmptyLine).join('\n');
		let vshader = vertex;
		let fshader = fragment;
		vshader = parseIncludes(vshader);
		fshader = parseIncludes(fshader);
		vshader = replaceLightNums(vshader, props);
		fshader = replaceLightNums(fshader, props);
		vshader = replaceClippingPlaneNums(vshader, props);
		fshader = replaceClippingPlaneNums(fshader, props);
		vshader = unrollLoops(vshader);
		fshader = unrollLoops(fshader);

		// enable glsl version 300 es for webgl ^2.0
		if (props.version > 1) {
			// extract vertex extensions and insert after version strings later
			// because it must be at the top of the shader
			const vertexExtensions = vshader.match(extensionPattern);
			if (vertexExtensions) {
				vshader = vshader.replace(extensionPattern, '');
			}
			prefixVertex = ['#version 300 es', vertexExtensions ? vertexExtensions.join('\n') : '', '#define attribute in', '#define varying out', '#define texture2D texture'].join('\n') + '\n' + prefixVertex;
			fshader = fshader.replace('#extension GL_EXT_draw_buffers : require', '');

			// replace gl_FragData by layout
			let i = 0;
			const layout = [];
			while (fshader.indexOf('gl_FragData[' + i + ']') > -1) {
				fshader = fshader.replace('gl_FragData[' + i + ']', 'pc_fragData' + i);
				layout.push('layout(location = ' + i + ') out highp vec4 pc_fragData' + i + ';');
				i++;
			}
			prefixFragment = ['#version 300 es', '#define varying in', fshader.indexOf('layout') > -1 || layout.length > 0 ? '' : 'out highp vec4 pc_fragColor;', '#define gl_FragColor pc_fragColor', '#define gl_FragDepthEXT gl_FragDepth', '#define texture2D texture', '#define textureCube texture', '#define texture2DProj textureProj', '#define texture2DLodEXT textureLod', '#define texture2DProjLodEXT textureProjLod', '#define textureCubeLodEXT textureLod', '#define texture2DGradEXT textureGrad', '#define texture2DProjGradEXT textureProjGrad', '#define textureCubeGradEXT textureGrad', layout.join('\n')].join('\n') + '\n' + prefixFragment;
		}
		vshader = prefixVertex + vshader;
		fshader = prefixFragment + fshader;
		return new WebGLProgram(gl, vshader, fshader);
	}
	const parseIncludes = function (string) {
		const pattern = /#include +<([\w\d.]+)>/g;
		function replace(match, include) {
			const replace = ShaderChunk[include];
			if (replace === undefined) {
				throw new Error('Can not resolve #include <' + include + '>');
			}
			return parseIncludes(replace);
		}
		return string.replace(pattern, replace);
	};
	function filterEmptyLine(string) {
		return string !== '';
	}
	function replaceLightNums(string, parameters) {
		return string.replace(/NUM_HEMI_LIGHTS/g, parameters.hemisphereLightNum).replace(/NUM_DIR_LIGHTS/g, parameters.directLightNum).replace(/NUM_SPOT_LIGHTS/g, parameters.spotLightNum).replace(/NUM_POINT_LIGHTS/g, parameters.pointLightNum).replace(/NUM_RECT_AREA_LIGHTS/g, parameters.rectAreaLightNum).replace(/NUM_DIR_SHADOWS/g, parameters.directShadowNum).replace(/NUM_SPOT_SHADOWS/g, parameters.spotShadowNum).replace(/NUM_POINT_SHADOWS/g, parameters.pointShadowNum);
	}
	function replaceClippingPlaneNums(string, parameters) {
		return string.replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes);
	}
	const unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
	function loopReplacer(match, start, end, snippet) {
		let string = '';
		for (let i = parseInt(start); i < parseInt(end); i++) {
			string += snippet.replace(/\[\s*i\s*\]/g, '[' + i + ']').replace(/UNROLLED_LOOP_INDEX/g, i);
		}
		return string;
	}
	function unrollLoops(string) {
		return string.replace(unrollLoopPattern, loopReplacer);
	}
	const extensionPattern = /#extension .*/g;

	class WebGLQueries extends PropertyMap {
		constructor(prefix, gl, capabilities) {
			super(prefix);
			this._gl = gl;
			this._capabilities = capabilities;
			const timerQuery = capabilities.timerQuery;
			const that = this;
			const onQueryDispose = event => {
				const query = event.target;
				const queryProperties = that.get(query);
				query.removeEventListener('dispose', onQueryDispose);
				if (queryProperties._webglQuery) {
					if (capabilities.version > 1) {
						gl.deleteQuery(queryProperties._webglQuery);
					} else {
						timerQuery.deleteQueryEXT(queryProperties._webglQuery);
					}
				}
				that.delete(query);
			};
			this._onQueryDispose = onQueryDispose;
			this._typeToGL = {
				[QUERY_TYPE.ANY_SAMPLES_PASSED]: 0x8C2F,
				[QUERY_TYPE.ANY_SAMPLES_PASSED_CONSERVATIVE]: 0x8D6A,
				[QUERY_TYPE.TIME_ELAPSED]: 0x88BF
			};
		}
		_get(query) {
			const capabilities = this._capabilities;
			const queryProperties = this.get(query);
			if (queryProperties._webglQuery === undefined) {
				query.addEventListener('dispose', this._onQueryDispose);
				queryProperties._webglQuery = capabilities.version > 1 ? this._gl.createQuery() : capabilities.timerQuery.createQueryEXT();
				queryProperties._target = null;
				queryProperties._result = null;
			}
			return queryProperties;
		}
		begin(query, target) {
			const capabilities = this._capabilities;
			const typeToGL = this._typeToGL;
			const queryProperties = this._get(query);
			if (capabilities.version > 1) {
				this._gl.beginQuery(typeToGL[target], queryProperties._webglQuery);
			} else {
				capabilities.timerQuery.beginQueryEXT(typeToGL[target], queryProperties._webglQuery);
			}
			queryProperties._target = target;
			queryProperties._result = null; // clear the last result.
		}
		end(query) {
			const capabilities = this._capabilities;
			const typeToGL = this._typeToGL;
			const queryProperties = this._get(query);
			if (capabilities.version > 1) {
				this._gl.endQuery(typeToGL[queryProperties._target]);
			} else {
				capabilities.timerQuery.endQueryEXT(typeToGL[queryProperties._target]);
			}
		}
		counter(query) {
			const timerQuery = this._capabilities.timerQuery;
			const queryProperties = this._get(query);
			timerQuery.queryCounterEXT(queryProperties._webglQuery, timerQuery.TIMESTAMP_EXT);
			queryProperties._target = timerQuery.TIMESTAMP_EXT;
			queryProperties._result = null; // clear the last result.
		}
		isResultAvailable(query) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			const timerQuery = capabilities.timerQuery;
			const queryProperties = this._get(query);
			let available;
			if (capabilities.version > 1) {
				available = gl.getQueryParameter(queryProperties._webglQuery, gl.QUERY_RESULT_AVAILABLE);
			} else {
				available = timerQuery.getQueryObjectEXT(queryProperties._webglQuery, timerQuery.QUERY_RESULT_AVAILABLE);
			}
			return available;
		}
		isTimerDisjoint() {
			return this._gl.getParameter(this._capabilities.timerQuery.GPU_DISJOINT_EXT);
		}
		getResult(query) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			const timerQuery = capabilities.timerQuery;
			const queryProperties = this._get(query);
			if (queryProperties._result === null) {
				if (capabilities.version > 1) {
					queryProperties._result = gl.getQueryParameter(queryProperties._webglQuery, gl.QUERY_RESULT);
				} else {
					queryProperties._result = timerQuery.getQueryObjectEXT(queryProperties._webglQuery, timerQuery.QUERY_RESULT_EXT);
				}
			}
			return queryProperties._result;
		}
	}

	class WebGLConstants {
		constructor(gl, capabilities) {
			this._gl = gl;
			this._capabilities = capabilities;
		}
		getGLType(type) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			const isWebGL2 = capabilities.version >= 2;
			if (type === PIXEL_TYPE.UNSIGNED_BYTE) return gl.UNSIGNED_BYTE;
			if (type === PIXEL_TYPE.UNSIGNED_SHORT_5_6_5) return gl.UNSIGNED_SHORT_5_6_5;
			if (type === PIXEL_TYPE.UNSIGNED_SHORT_4_4_4_4) return gl.UNSIGNED_SHORT_4_4_4_4;
			if (type === PIXEL_TYPE.UNSIGNED_SHORT_5_5_5_1) return gl.UNSIGNED_SHORT_5_5_5_1;
			let extension;
			if (!isWebGL2) {
				if (type === PIXEL_TYPE.UNSIGNED_SHORT || type === PIXEL_TYPE.UNSIGNED_INT || type === PIXEL_TYPE.UNSIGNED_INT_24_8) {
					extension = capabilities.getExtension('WEBGL_depth_texture');
					if (extension) {
						if (type === PIXEL_TYPE.UNSIGNED_SHORT) return gl.UNSIGNED_SHORT;
						if (type === PIXEL_TYPE.UNSIGNED_INT) return gl.UNSIGNED_INT;
						if (type === PIXEL_TYPE.UNSIGNED_INT_24_8) return extension.UNSIGNED_INT_24_8_WEBGL;
					} else {
						console.warn('extension WEBGL_depth_texture is not support.');
						return null;
					}
				}
				if (type === PIXEL_TYPE.FLOAT) {
					extension = capabilities.getExtension('OES_texture_float');
					if (extension) {
						return gl.FLOAT;
					} else {
						console.warn('extension OES_texture_float is not support.');
						return null;
					}
				}
				if (type === PIXEL_TYPE.HALF_FLOAT) {
					extension = capabilities.getExtension('OES_texture_half_float');
					if (extension) {
						return extension.HALF_FLOAT_OES;
					} else {
						console.warn('extension OES_texture_half_float is not support.');
						return null;
					}
				}
			} else {
				if (type === PIXEL_TYPE.UNSIGNED_SHORT) return gl.UNSIGNED_SHORT;
				if (type === PIXEL_TYPE.UNSIGNED_INT) return gl.UNSIGNED_INT;
				if (type === PIXEL_TYPE.UNSIGNED_INT_24_8) return gl.UNSIGNED_INT_24_8;
				if (type === PIXEL_TYPE.FLOAT) return gl.FLOAT;
				if (type === PIXEL_TYPE.HALF_FLOAT) return gl.HALF_FLOAT;
				if (type === PIXEL_TYPE.FLOAT_32_UNSIGNED_INT_24_8_REV) return gl.FLOAT_32_UNSIGNED_INT_24_8_REV;
				if (type === PIXEL_TYPE.BYTE) return gl.BYTE;
				if (type === PIXEL_TYPE.SHORT) return gl.SHORT;
				if (type === PIXEL_TYPE.INT) return gl.INT;

				// does not include:
				// UNSIGNED_INT_2_10_10_10_REV
				// UNSIGNED_INT_10F_11F_11F_REV
				// UNSIGNED_INT_5_9_9_9_REV
			}
			return gl[type] !== undefined ? gl[type] : type;
		}
		getGLFormat(format) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			if (format === PIXEL_FORMAT.RGB) return gl.RGB;
			if (format === PIXEL_FORMAT.RGBA) return gl.RGBA;
			if (format === PIXEL_FORMAT.ALPHA) return gl.ALPHA;
			if (format === PIXEL_FORMAT.LUMINANCE) return gl.LUMINANCE;
			if (format === PIXEL_FORMAT.LUMINANCE_ALPHA) return gl.LUMINANCE_ALPHA;
			if (format === PIXEL_FORMAT.DEPTH_COMPONENT) return gl.DEPTH_COMPONENT;
			if (format === PIXEL_FORMAT.DEPTH_STENCIL) return gl.DEPTH_STENCIL;
			if (format === PIXEL_FORMAT.RED) return gl.RED;
			if (format === PIXEL_FORMAT.RED_INTEGER) return gl.RED_INTEGER;
			if (format === PIXEL_FORMAT.RG) return gl.RG;
			if (format === PIXEL_FORMAT.RG_INTEGER) return gl.RG_INTEGER;
			if (format === PIXEL_FORMAT.RGB_INTEGER) return gl.RGB_INTEGER;
			if (format === PIXEL_FORMAT.RGBA_INTEGER) return gl.RGBA_INTEGER;
			let extension;

			// S3TC
			if (format === PIXEL_FORMAT.RGB_S3TC_DXT1 || format === PIXEL_FORMAT.RGBA_S3TC_DXT1 || format === PIXEL_FORMAT.RGBA_S3TC_DXT3 || format === PIXEL_FORMAT.RGBA_S3TC_DXT5) {
				extension = capabilities.getExtension('WEBGL_compressed_texture_s3tc');
				if (extension) {
					if (format === PIXEL_FORMAT.RGB_S3TC_DXT1) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
					if (format === PIXEL_FORMAT.RGBA_S3TC_DXT1) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
					if (format === PIXEL_FORMAT.RGBA_S3TC_DXT3) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
					if (format === PIXEL_FORMAT.RGBA_S3TC_DXT5) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
				} else {
					console.warn('extension WEBGL_compressed_texture_s3tc is not support.');
					return null;
				}
			}

			// PVRTC
			if (format === PIXEL_FORMAT.RGB_PVRTC_4BPPV1 || format === PIXEL_FORMAT.RGB_PVRTC_2BPPV1 || format === PIXEL_FORMAT.RGBA_PVRTC_4BPPV1 || format === PIXEL_FORMAT.RGBA_PVRTC_2BPPV1) {
				extension = capabilities.getExtension('WEBGL_compressed_texture_pvrtc');
				if (extension) {
					if (format === PIXEL_FORMAT.RGB_PVRTC_4BPPV1) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
					if (format === PIXEL_FORMAT.RGB_PVRTC_2BPPV1) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
					if (format === PIXEL_FORMAT.RGBA_PVRTC_4BPPV1) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
					if (format === PIXEL_FORMAT.RGBA_PVRTC_2BPPV1) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
				} else {
					console.warn('extension WEBGL_compressed_texture_pvrtc is not support.');
					return null;
				}
			}

			// ETC1
			if (format === PIXEL_FORMAT.RGB_ETC1) {
				extension = capabilities.getExtension('WEBGL_compressed_texture_etc1');
				if (extension) {
					return extension.COMPRESSED_RGB_ETC1_WEBGL;
				} else {
					console.warn('extension WEBGL_compressed_texture_etc1 is not support.');
					return null;
				}
			}

			// ASTC
			if (format === PIXEL_FORMAT.RGBA_ASTC_4x4) {
				extension = capabilities.getExtension('WEBGL_compressed_texture_astc');
				if (extension) {
					return extension.COMPRESSED_RGBA_ASTC_4x4_KHR;
				} else {
					console.warn('extension WEBGL_compressed_texture_astc is not support.');
					return null;
				}
			}

			// BPTC
			if (format === PIXEL_FORMAT.RGBA_BPTC) {
				extension = capabilities.getExtension('EXT_texture_compression_bptc');
				if (extension) {
					return extension.COMPRESSED_RGBA_BPTC_UNORM_EXT;
				} else {
					console.warn('extension EXT_texture_compression_bptc is not support.');
					return null;
				}
			}
			return gl[format] !== undefined ? gl[format] : format;
		}
		getGLInternalFormat(internalFormat) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			const isWebGL2 = capabilities.version >= 2;
			if (internalFormat === PIXEL_FORMAT.RGBA4) return gl.RGBA4;
			if (internalFormat === PIXEL_FORMAT.RGB5_A1) return gl.RGB5_A1;
			if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT16) return gl.DEPTH_COMPONENT16;
			if (internalFormat === PIXEL_FORMAT.STENCIL_INDEX8) return gl.STENCIL_INDEX8;
			if (internalFormat === PIXEL_FORMAT.DEPTH_STENCIL) return gl.DEPTH_STENCIL;

			// does not include:
			// RGB565

			let extension;
			if (!isWebGL2) {
				if (internalFormat === PIXEL_FORMAT.RGBA32F || internalFormat === PIXEL_FORMAT.RGB32F) {
					extension = capabilities.getExtension('WEBGL_color_buffer_float');
					if (extension) {
						if (internalFormat === PIXEL_FORMAT.RGBA32F) return extension.RGBA32F_EXT;
						if (internalFormat === PIXEL_FORMAT.RGB32F) return extension.RGB32F_EXT;
					} else {
						console.warn('extension WEBGL_color_buffer_float is not support.');
						return null;
					}
				}
			} else {
				if (internalFormat === PIXEL_FORMAT.R8) return gl.R8;
				if (internalFormat === PIXEL_FORMAT.RG8) return gl.RG8;
				if (internalFormat === PIXEL_FORMAT.RGB8) return gl.RGB8;
				if (internalFormat === PIXEL_FORMAT.RGBA8) return gl.RGBA8;
				if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT24) return gl.DEPTH_COMPONENT24;
				if (internalFormat === PIXEL_FORMAT.DEPTH_COMPONENT32F) return gl.DEPTH_COMPONENT32F;
				if (internalFormat === PIXEL_FORMAT.DEPTH24_STENCIL8) return gl.DEPTH24_STENCIL8;
				if (internalFormat === PIXEL_FORMAT.DEPTH32F_STENCIL8) return gl.DEPTH32F_STENCIL8;

				// does not include:
				// R8UI R8I R16UI R16I R32UI R32I RG8UI RG8I RG16UI RG16I RG32UI RG32I SRGB8_ALPHA8
				// RGB10_A2 RGBA8UI RGBA8I RGB10_A2UI RGBA16UI RGBA16I RGBA32I RGBA32UI

				if (internalFormat === PIXEL_FORMAT.R16F || internalFormat === PIXEL_FORMAT.RG16F || internalFormat === PIXEL_FORMAT.RGB16F || internalFormat === PIXEL_FORMAT.RGBA16F || internalFormat === PIXEL_FORMAT.R32F || internalFormat === PIXEL_FORMAT.RG32F || internalFormat === PIXEL_FORMAT.RGB32F || internalFormat === PIXEL_FORMAT.RGBA32F || internalFormat === PIXEL_FORMAT.R11F_G11F_B10F) {
					extension = capabilities.getExtension('EXT_color_buffer_float');
					if (extension) {
						if (internalFormat === PIXEL_FORMAT.R16F) return gl.R16F;
						if (internalFormat === PIXEL_FORMAT.RG16F) return gl.RG16F;
						if (internalFormat === PIXEL_FORMAT.RGB16F) return gl.RGB16F;
						if (internalFormat === PIXEL_FORMAT.RGBA16F) return gl.RGBA16F;
						if (internalFormat === PIXEL_FORMAT.R32F) return gl.R32F;
						if (internalFormat === PIXEL_FORMAT.RG32F) return gl.RG32F;
						if (internalFormat === PIXEL_FORMAT.RGB32F) return gl.RGB32F;
						if (internalFormat === PIXEL_FORMAT.RGBA32F) return gl.RGBA32F;
						if (internalFormat === PIXEL_FORMAT.R11F_G11F_B10F) return gl.R11F_G11F_B10F;
					} else {
						console.warn('extension EXT_color_buffer_float is not support.');
						return null;
					}
				}
			}
			return gl[internalFormat] !== undefined ? gl[internalFormat] : internalFormat;
		}
	}

	function createTexture(gl, type, target, count) {
		const data = new Uint8Array(4); // 4 is required to match default unpack alignment of 4.
		const texture = gl.createTexture();
		gl.bindTexture(type, texture);
		gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		for (let i = 0; i < count; i++) {
			gl.texImage2D(target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
		}
		return texture;
	}
	function ColorBuffer(gl) {
		let locked = false;
		const color = new Vector4();
		let currentColorMask = null;
		const currentColorClear = new Vector4(0, 0, 0, 0);
		return {
			setMask: function (colorMask) {
				if (currentColorMask !== colorMask && !locked) {
					gl.colorMask(colorMask, colorMask, colorMask, colorMask);
					currentColorMask = colorMask;
				}
			},
			setLocked: function (lock) {
				locked = lock;
			},
			setClear: function (r, g, b, a, premultipliedAlpha) {
				if (premultipliedAlpha === true) {
					r *= a;
					g *= a;
					b *= a;
				}
				color.set(r, g, b, a);
				if (currentColorClear.equals(color) === false) {
					gl.clearColor(r, g, b, a);
					currentColorClear.copy(color);
				}
			},
			getClear: function () {
				return currentColorClear;
			},
			reset: function () {
				locked = false;
				currentColorMask = null;
				currentColorClear.set(-1, 0, 0, 0); // set to invalid state
			}
		};
	}
	function DepthBuffer(gl, state) {
		let locked = false;
		let currentDepthMask = null;
		let currentDepthFunc = null;
		let currentDepthClear = null;
		return {
			setTest: function (depthTest) {
				if (depthTest) {
					state.enable(gl.DEPTH_TEST);
				} else {
					state.disable(gl.DEPTH_TEST);
				}
			},
			setMask: function (depthMask) {
				if (currentDepthMask !== depthMask && !locked) {
					gl.depthMask(depthMask);
					currentDepthMask = depthMask;
				}
			},
			setFunc: function (depthFunc) {
				if (currentDepthFunc !== depthFunc) {
					gl.depthFunc(depthFunc);
					currentDepthFunc = depthFunc;
				}
			},
			setLocked: function (lock) {
				locked = lock;
			},
			setClear: function (depth) {
				if (currentDepthClear !== depth) {
					gl.clearDepth(depth);
					currentDepthClear = depth;
				}
			},
			reset: function () {
				locked = false;
				currentDepthMask = null;
				currentDepthFunc = null;
				currentDepthClear = null;
			}
		};
	}
	function StencilBuffer(gl, state) {
		let locked = false;
		let currentStencilMask = null;
		let currentStencilFunc = null;
		let currentStencilRef = null;
		let currentStencilFuncMask = null;
		let currentStencilFail = null;
		let currentStencilZFail = null;
		let currentStencilZPass = null;
		let currentStencilFuncBack = null;
		let currentStencilRefBack = null;
		let currentStencilFuncMaskBack = null;
		let currentStencilFailBack = null;
		let currentStencilZFailBack = null;
		let currentStencilZPassBack = null;
		let currentStencilClear = null;
		return {
			setTest: function (stencilTest) {
				if (stencilTest) {
					state.enable(gl.STENCIL_TEST);
				} else {
					state.disable(gl.STENCIL_TEST);
				}
			},
			setMask: function (stencilMask) {
				if (currentStencilMask !== stencilMask && !locked) {
					gl.stencilMask(stencilMask);
					currentStencilMask = stencilMask;
				}
			},
			setFunc: function (stencilFunc, stencilRef, stencilMask, stencilFuncBack, stencilRefBack, stencilMaskBack) {
				if (currentStencilFunc !== stencilFunc || currentStencilRef !== stencilRef || currentStencilFuncMask !== stencilMask || currentStencilFuncBack !== stencilFuncBack || currentStencilRefBack !== stencilRefBack || currentStencilFuncMaskBack !== stencilMaskBack) {
					if (stencilFuncBack === null || stencilRefBack === null || stencilMaskBack === null) {
						gl.stencilFunc(stencilFunc, stencilRef, stencilMask);
					} else {
						gl.stencilFuncSeparate(gl.FRONT, stencilFunc, stencilRef, stencilMask);
						gl.stencilFuncSeparate(gl.BACK, stencilFuncBack, stencilRefBack, stencilMaskBack);
					}
					currentStencilFunc = stencilFunc;
					currentStencilRef = stencilRef;
					currentStencilFuncMask = stencilMask;
					currentStencilFuncBack = stencilFuncBack;
					currentStencilRefBack = stencilRefBack;
					currentStencilFuncMaskBack = stencilMaskBack;
				}
			},
			setOp: function (stencilFail, stencilZFail, stencilZPass, stencilFailBack, stencilZFailBack, stencilZPassBack) {
				if (currentStencilFail !== stencilFail || currentStencilZFail !== stencilZFail || currentStencilZPass !== stencilZPass || currentStencilFailBack !== stencilFailBack || currentStencilZFailBack !== stencilZFailBack || currentStencilZPassBack !== stencilZPassBack) {
					if (stencilFailBack === null || stencilZFailBack === null || stencilZPassBack === null) {
						gl.stencilOp(stencilFail, stencilZFail, stencilZPass);
					} else {
						gl.stencilOpSeparate(gl.FRONT, stencilFail, stencilZFail, stencilZPass);
						gl.stencilOpSeparate(gl.BACK, stencilFailBack, stencilZFailBack, stencilZPassBack);
					}
					currentStencilFail = stencilFail;
					currentStencilZFail = stencilZFail;
					currentStencilZPass = stencilZPass;
					currentStencilFailBack = stencilFailBack;
					currentStencilZFailBack = stencilZFailBack;
					currentStencilZPassBack = stencilZPassBack;
				}
			},
			setLocked: function (lock) {
				locked = lock;
			},
			setClear: function (stencil) {
				if (currentStencilClear !== stencil) {
					gl.clearStencil(stencil);
					currentStencilClear = stencil;
				}
			},
			reset: function () {
				locked = false;
				currentStencilMask = null;
				currentStencilFunc = null;
				currentStencilRef = null;
				currentStencilFuncMask = null;
				currentStencilFail = null;
				currentStencilZFail = null;
				currentStencilZPass = null;
				currentStencilFuncBack = null;
				currentStencilRefBack = null;
				currentStencilFuncMaskBack = null;
				currentStencilFailBack = null;
				currentStencilZFailBack = null;
				currentStencilZPassBack = null;
				currentStencilClear = null;
			}
		};
	}
	class WebGLState {
		constructor(gl, capabilities) {
			this.gl = gl;
			this.capabilities = capabilities;
			this.colorBuffer = new ColorBuffer(gl);
			this.depthBuffer = new DepthBuffer(gl, this);
			this.stencilBuffer = new StencilBuffer(gl, this);
			this.states = {};
			this.currentBlending = null;
			this.currentBlendEquation = null;
			this.currentBlendSrc = null;
			this.currentBlendDst = null;
			this.currentBlendEquationAlpha = null;
			this.currentBlendSrcAlpha = null;
			this.currentBlendDstAlpha = null;
			this.currentPremultipliedAlpha = null;
			this.currentFlipSided = false;
			this.currentCullFace = null;
			const viewportParam = gl.getParameter(gl.VIEWPORT);
			this.currentViewport = new Vector4().fromArray(viewportParam);
			this.currentLineWidth = null;
			this.currentPolygonOffsetFactor = null;
			this.currentPolygonOffsetUnits = null;
			this.currentProgram = null;
			this.currentBoundBuffers = {};
			this.currentRenderTarget = null; // used in WebGLRenderTargets

			this.currentTextureSlot = null;
			this.currentBoundTextures = {};
			this.emptyTextures = {};
			this.emptyTextures[gl.TEXTURE_2D] = createTexture(gl, gl.TEXTURE_2D, gl.TEXTURE_2D, 1);
			this.emptyTextures[gl.TEXTURE_CUBE_MAP] = createTexture(gl, gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6);
			this.blendEquationToGL = {
				[BLEND_EQUATION.ADD]: gl.FUNC_ADD,
				[BLEND_EQUATION.SUBTRACT]: gl.FUNC_SUBTRACT,
				[BLEND_EQUATION.REVERSE_SUBTRACT]: gl.FUNC_REVERSE_SUBTRACT,
				[BLEND_EQUATION.MIN]: gl.MIN,
				[BLEND_EQUATION.MAX]: gl.MAX
			};
			this.blendFactorToGL = {
				[BLEND_FACTOR.ZERO]: gl.ZERO,
				[BLEND_FACTOR.ONE]: gl.ONE,
				[BLEND_FACTOR.SRC_COLOR]: gl.SRC_COLOR,
				[BLEND_FACTOR.SRC_ALPHA]: gl.SRC_ALPHA,
				[BLEND_FACTOR.SRC_ALPHA_SATURATE]: gl.SRC_ALPHA_SATURATE,
				[BLEND_FACTOR.DST_COLOR]: gl.DST_COLOR,
				[BLEND_FACTOR.DST_ALPHA]: gl.DST_ALPHA,
				[BLEND_FACTOR.ONE_MINUS_SRC_COLOR]: gl.ONE_MINUS_SRC_COLOR,
				[BLEND_FACTOR.ONE_MINUS_SRC_ALPHA]: gl.ONE_MINUS_SRC_ALPHA,
				[BLEND_FACTOR.ONE_MINUS_DST_COLOR]: gl.ONE_MINUS_DST_COLOR,
				[BLEND_FACTOR.ONE_MINUS_DST_ALPHA]: gl.ONE_MINUS_DST_ALPHA
			};

			// init

			this.colorBuffer.setClear(0, 0, 0, 1);
			this.depthBuffer.setClear(1);
			this.stencilBuffer.setClear(0);
			this.depthBuffer.setTest(true);
			this.depthBuffer.setFunc(COMPARE_FUNC.LEQUAL);
			this.setFlipSided(false);
			this.setCullFace(CULL_FACE_TYPE.BACK);
		}
		enable(id) {
			if (this.states[id] !== true) {
				this.gl.enable(id);
				this.states[id] = true;
			}
		}
		disable(id) {
			if (this.states[id] !== false) {
				this.gl.disable(id);
				this.states[id] = false;
			}
		}
		setBlending(blend, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, premultipliedAlpha) {
			const gl = this.gl;
			if (blend === BLEND_TYPE.NONE) {
				this.disable(gl.BLEND);
				return;
			}
			this.enable(gl.BLEND);
			if (blend !== BLEND_TYPE.CUSTOM) {
				if (blend !== this.currentBlending || premultipliedAlpha !== this.currentPremultipliedAlpha) {
					if (this.currentBlendEquation !== BLEND_EQUATION.ADD || this.currentBlendEquationAlpha !== BLEND_EQUATION.ADD) {
						gl.blendEquation(gl.FUNC_ADD);
						this.currentBlendEquation = BLEND_EQUATION.ADD;
						this.currentBlendEquationAlpha = BLEND_EQUATION.ADD;
					}
					if (blend === BLEND_TYPE.NORMAL) {
						if (premultipliedAlpha) {
							gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
						} else {
							gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
						}
					} else if (blend === BLEND_TYPE.ADD) {
						if (premultipliedAlpha) {
							gl.blendFunc(gl.ONE, gl.ONE);
						} else {
							gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
						}
					} else if (blend === BLEND_TYPE.SUB) {
						gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
					} else if (blend === BLEND_TYPE.MUL) {
						if (premultipliedAlpha) {
							gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
						} else {
							gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
						}
					} else {
						console.error('WebGLState: Invalid blending: ', blend);
					}
				}
				this.currentBlendSrc = null;
				this.currentBlendDst = null;
				this.currentBlendSrcAlpha = null;
				this.currentBlendDstAlpha = null;
			} else {
				blendEquationAlpha = blendEquationAlpha || blendEquation;
				blendSrcAlpha = blendSrcAlpha || blendSrc;
				blendDstAlpha = blendDstAlpha || blendDst;
				const equationToGL = this.blendEquationToGL;
				const factorToGL = this.blendFactorToGL;
				if (blendEquation !== this.currentBlendEquation || blendEquationAlpha !== this.currentBlendEquationAlpha) {
					gl.blendEquationSeparate(equationToGL[blendEquation], equationToGL[blendEquationAlpha]);
					this.currentBlendEquation = blendEquation;
					this.currentBlendEquationAlpha = blendEquationAlpha;
				}
				if (blendSrc !== this.currentBlendSrc || blendDst !== this.currentBlendDst || blendSrcAlpha !== this.currentBlendSrcAlpha || blendDstAlpha !== this.currentBlendDstAlpha) {
					gl.blendFuncSeparate(factorToGL[blendSrc], factorToGL[blendDst], factorToGL[blendSrcAlpha], factorToGL[blendDstAlpha]);
					this.currentBlendSrc = blendSrc;
					this.currentBlendDst = blendDst;
					this.currentBlendSrcAlpha = blendSrcAlpha;
					this.currentBlendDstAlpha = blendDstAlpha;
				}
			}
			this.currentBlending = blend;
			this.currentPremultipliedAlpha = premultipliedAlpha;
		}
		setFlipSided(flipSided) {
			const gl = this.gl;
			if (this.currentFlipSided !== flipSided) {
				if (flipSided) {
					gl.frontFace(gl.CW);
				} else {
					gl.frontFace(gl.CCW);
				}
				this.currentFlipSided = flipSided;
			}
		}
		setCullFace(cullFace) {
			const gl = this.gl;
			if (cullFace !== CULL_FACE_TYPE.NONE) {
				this.enable(gl.CULL_FACE);
				if (cullFace !== this.currentCullFace) {
					if (cullFace === CULL_FACE_TYPE.BACK) {
						gl.cullFace(gl.BACK);
					} else if (cullFace === CULL_FACE_TYPE.FRONT) {
						gl.cullFace(gl.FRONT);
					} else {
						gl.cullFace(gl.FRONT_AND_BACK);
					}
				}
			} else {
				this.disable(gl.CULL_FACE);
			}
			this.currentCullFace = cullFace;
		}
		viewport(viewport) {
			const currentViewport = this.currentViewport;
			if (currentViewport.equals(viewport)) return;
			this.gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
			currentViewport.copy(viewport);
		}
		setLineWidth(width) {
			if (width !== this.currentLineWidth) {
				const lineWidthRange = this.capabilities.lineWidthRange;
				if (lineWidthRange[0] <= width && width <= lineWidthRange[1]) {
					this.gl.lineWidth(width);
				} else {
					console.warn('GL_ALIASED_LINE_WIDTH_RANGE is [' + lineWidthRange[0] + ',' + lineWidthRange[1] + '], but set to ' + width + '.');
				}
				this.currentLineWidth = width;
			}
		}
		setPolygonOffset(polygonOffset, factor, units) {
			const gl = this.gl;
			if (polygonOffset) {
				this.enable(gl.POLYGON_OFFSET_FILL);
				if (this.currentPolygonOffsetFactor !== factor || this.currentPolygonOffsetUnits !== units) {
					gl.polygonOffset(factor, units);
					this.currentPolygonOffsetFactor = factor;
					this.currentPolygonOffsetUnits = units;
				}
			} else {
				this.disable(gl.POLYGON_OFFSET_FILL);
			}
		}
		setProgram(program) {
			if (this.currentProgram !== program) {
				this.gl.useProgram(program.program);
				this.currentProgram = program;
			}
		}
		bindBuffer(type, buffer) {
			const gl = this.gl;
			const boundBuffer = this.currentBoundBuffers[type];
			if (boundBuffer !== buffer) {
				gl.bindBuffer(type, buffer);
				this.currentBoundBuffers[type] = buffer;
			}
		}
		activeTexture(slot) {
			const gl = this.gl;
			if (slot === undefined) {
				slot = gl.TEXTURE0 + this.capabilities.maxTextures - 1;
			}
			if (this.currentTextureSlot !== slot) {
				gl.activeTexture(slot);
				this.currentTextureSlot = slot;
			}
		}
		bindTexture(type, texture) {
			const gl = this.gl;
			if (this.currentTextureSlot === null) {
				this.activeTexture();
			}
			let boundTexture = this.currentBoundTextures[this.currentTextureSlot];
			if (boundTexture === undefined) {
				boundTexture = {
					type: undefined,
					texture: undefined
				};
				this.currentBoundTextures[this.currentTextureSlot] = boundTexture;
			}
			if (boundTexture.type !== type || boundTexture.texture !== texture) {
				gl.bindTexture(type, texture || this.emptyTextures[type]);
				boundTexture.type = type;
				boundTexture.texture = texture;
			}
		}
		reset() {
			const gl = this.gl;
			gl.colorMask(true, true, true, true);
			gl.clearColor(0, 0, 0, 0);
			gl.depthMask(true);
			gl.depthFunc(gl.LESS);
			gl.clearDepth(1);
			gl.stencilMask(0xffffffff);
			gl.stencilFunc(gl.ALWAYS, 0, 0xffffffff);
			gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
			gl.clearStencil(0);
			gl.disable(gl.BLEND);
			gl.disable(gl.CULL_FACE);
			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.POLYGON_OFFSET_FILL);
			gl.disable(gl.SCISSOR_TEST);
			gl.disable(gl.STENCIL_TEST);
			gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
			gl.blendEquation(gl.FUNC_ADD);
			gl.blendFunc(gl.ONE, gl.ZERO);
			gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
			gl.cullFace(gl.BACK);
			gl.frontFace(gl.CCW);

			// gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			gl.lineWidth(1);
			gl.polygonOffset(0, 0);
			gl.useProgram(null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.activeTexture(gl.TEXTURE0);
			this.colorBuffer.reset();
			this.depthBuffer.reset();
			this.stencilBuffer.reset();
			this.states = {};
			this.currentBlending = null;
			this.currentBlendEquation = null;
			this.currentBlendSrc = null;
			this.currentBlendDst = null;
			this.currentBlendEquationAlpha = null;
			this.currentBlendSrcAlpha = null;
			this.currentBlendDstAlpha = null;
			this.currentPremultipliedAlpha = null;
			this.currentFlipSided = false;
			this.currentCullFace = null;
			this.currentViewport.set(0, 0, gl.canvas.width, gl.canvas.height);
			this.currentLineWidth = null;
			this.currentPolygonOffsetFactor = null;
			this.currentPolygonOffsetUnits = null;
			this.currentProgram = null;
			this.currentBoundBuffers = {};
			this.currentRenderTarget = null; // used in WebGLRenderTargets

			this.currentTextureSlot = null;
			this.currentBoundTextures = {};
		}
		setMaterial(material, frontFaceCW) {
			this.setCullFace(material.side === DRAW_SIDE.DOUBLE ? CULL_FACE_TYPE.NONE : CULL_FACE_TYPE.BACK);
			let flipSided = material.side === DRAW_SIDE.BACK;
			if (frontFaceCW) flipSided = !flipSided;
			this.setFlipSided(flipSided);
			if (material.blending === BLEND_TYPE.NORMAL && material.transparent === false) {
				this.setBlending(BLEND_TYPE.NONE);
			} else {
				this.setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha);
			}
			this.depthBuffer.setFunc(material.depthFunc);
			this.depthBuffer.setTest(material.depthTest);
			this.depthBuffer.setMask(material.depthWrite);
			this.colorBuffer.setMask(material.colorWrite);
			const stencilTest = material.stencilTest;
			this.stencilBuffer.setTest(stencilTest);
			if (stencilTest) {
				this.stencilBuffer.setMask(material.stencilWriteMask);
				this.stencilBuffer.setFunc(material.stencilFunc, material.stencilRef, material.stencilFuncMask, material.stencilFuncBack, material.stencilRefBack, material.stencilFuncMaskBack);
				this.stencilBuffer.setOp(material.stencilFail, material.stencilZFail, material.stencilZPass, material.stencilFailBack, material.stencilZFailBack, material.stencilZPassBack);
			}
			this.setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);
			if (material.lineWidth !== undefined) {
				this.setLineWidth(material.lineWidth);
			}
			material.alphaToCoverage === true ? this.enable(this.gl.SAMPLE_ALPHA_TO_COVERAGE) : this.disable(this.gl.SAMPLE_ALPHA_TO_COVERAGE);
		}
	}

	class WebGLTextures extends PropertyMap {
		constructor(prefix, gl, state, capabilities, constants) {
			super(prefix);
			this._gl = gl;
			this._state = state;
			this._capabilities = capabilities;
			this._constants = constants;
			this._usedTextureUnits = 0;
			const that = this;
			function onTextureDispose(event) {
				const texture = event.target;
				const textureProperties = that.get(texture);
				texture.removeEventListener('dispose', onTextureDispose);
				if (textureProperties.__webglTexture && !textureProperties.__external) {
					gl.deleteTexture(textureProperties.__webglTexture);
				}
				that.delete(texture);
			}
			this._onTextureDispose = onTextureDispose;
			this._wrappingToGL = {
				[TEXTURE_WRAP.REPEAT]: gl.REPEAT,
				[TEXTURE_WRAP.CLAMP_TO_EDGE]: gl.CLAMP_TO_EDGE,
				[TEXTURE_WRAP.MIRRORED_REPEAT]: gl.MIRRORED_REPEAT
			};
			this._filterToGL = {
				[TEXTURE_FILTER.NEAREST]: gl.NEAREST,
				[TEXTURE_FILTER.LINEAR]: gl.LINEAR,
				[TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST]: gl.NEAREST_MIPMAP_NEAREST,
				[TEXTURE_FILTER.LINEAR_MIPMAP_NEAREST]: gl.LINEAR_MIPMAP_NEAREST,
				[TEXTURE_FILTER.NEAREST_MIPMAP_LINEAR]: gl.NEAREST_MIPMAP_LINEAR,
				[TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR]: gl.LINEAR_MIPMAP_LINEAR
			};
		}
		allocTexUnit() {
			const textureUnit = this._usedTextureUnits++;
			if (textureUnit >= this._capabilities.maxTextures) {
				console.warn('trying to use ' + textureUnit + ' texture units while this GPU supports only ' + this._capabilities.maxTextures);
			}
			return textureUnit;
		}
		resetTextureUnits() {
			this._usedTextureUnits = 0;
		}
		setTexture2D(texture, slot) {
			const gl = this._gl;
			const state = this._state;
			const capabilities = this._capabilities;
			const constants = this._constants;
			if (slot !== undefined) {
				slot = gl.TEXTURE0 + slot;
			}
			const textureProperties = this.get(texture);
			if (texture.image && textureProperties.__version !== texture.version && (!texture.image.rtt || slot === undefined) && !textureProperties.__external) {
				if (textureProperties.__webglTexture === undefined) {
					texture.addEventListener('dispose', this._onTextureDispose);
					textureProperties.__webglTexture = gl.createTexture();
				}
				state.activeTexture(slot);
				state.bindTexture(gl.TEXTURE_2D, textureProperties.__webglTexture);
				let image = texture.image;
				const isDom = domCheck(image);
				if (isDom) {
					image = clampToMaxSize(image, capabilities.maxTextureSize);
					if (textureNeedsPowerOfTwo(texture) && _isPowerOfTwo$1(image) === false && capabilities.version < 2) {
						image = makePowerOf2(image);
					}
				}
				const needFallback = !_isPowerOfTwo$1(image) && capabilities.version < 2;
				this._setPixelStores(texture);
				this._setTextureParameters(texture, needFallback);
				const glFormat = constants.getGLFormat(texture.format),
					glType = constants.getGLType(texture.type),
					glInternalFormat = texture.internalformat !== null ? constants.getGLInternalFormat(texture.internalformat) : getGLInternalFormat(gl, capabilities, glFormat, glType);
				const mipmaps = texture.mipmaps;
				let mipmap;
				if (isDom) {
					if (mipmaps.length > 0 && !needFallback) {
						for (let i = 0, il = mipmaps.length; i < il; i++) {
							mipmap = mipmaps[i];
							gl.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, mipmap);
						}
						texture.generateMipmaps = false;
						textureProperties.__maxMipLevel = mipmaps.length - 1;
					} else {
						gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image);
						textureProperties.__maxMipLevel = 0;
					}
				} else {
					if (mipmaps.length > 0 && !needFallback) {
						const isCompressed = image.isCompressed;
						for (let i = 0, il = mipmaps.length; i < il; i++) {
							mipmap = mipmaps[i];
							isCompressed ? gl.compressedTexImage2D(gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data) : gl.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, mipmap.width, mipmap.height, texture.border, glFormat, glType, mipmap.data);
						}
						texture.generateMipmaps = false;
						textureProperties.__maxMipLevel = mipmaps.length - 1;
					} else {
						gl.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, image.width, image.height, texture.border, glFormat, glType, image.data);
						textureProperties.__maxMipLevel = 0;
					}
				}
				if (texture.generateMipmaps && !needFallback) {
					this._generateMipmap(gl.TEXTURE_2D, texture, image.width, image.height);
				}
				textureProperties.__version = texture.version;
				return textureProperties;
			}
			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_2D, textureProperties.__webglTexture);
			return textureProperties;
		}
		setTextureCube(texture, slot) {
			const gl = this._gl;
			const state = this._state;
			const capabilities = this._capabilities;
			const constants = this._constants;
			if (slot !== undefined) {
				slot = gl.TEXTURE0 + slot;
			}
			const textureProperties = this.get(texture);
			if (texture.images.length === 6 && textureProperties.__version !== texture.version && (!texture.images[0].rtt || slot === undefined) && !textureProperties.__external) {
				if (textureProperties.__webglTexture === undefined) {
					texture.addEventListener('dispose', this._onTextureDispose);
					textureProperties.__webglTexture = gl.createTexture();
				}
				state.activeTexture(slot);
				state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
				const images = [];
				let needFallback = false;
				for (let i = 0; i < 6; i++) {
					let image = texture.images[i];
					const isDom = domCheck(image);
					if (isDom) {
						image = clampToMaxSize(image, capabilities.maxTextureSize);
						if (textureNeedsPowerOfTwo(texture) && _isPowerOfTwo$1(image) === false && capabilities.version < 2) {
							image = makePowerOf2(image);
						}
					}
					if (!_isPowerOfTwo$1(image) && capabilities.version < 2) {
						needFallback = true;
					}
					images[i] = image;
					image.__isDom = isDom;
				}
				this._setPixelStores(texture);
				this._setTextureParameters(texture, needFallback);
				const glFormat = constants.getGLFormat(texture.format),
					glType = constants.getGLType(texture.type),
					glInternalFormat = texture.internalformat !== null ? constants.getGLInternalFormat(texture.internalformat) : getGLInternalFormat(gl, capabilities, glFormat, glType);
				const mipmaps = texture.mipmaps;
				let mipmap;
				for (let i = 0; i < 6; i++) {
					const image = images[i];
					const isDom = image.__isDom;
					if (isDom) {
						if (mipmaps.length > 0 && !needFallback) {
							for (let j = 0, jl = mipmaps.length; j < jl; j++) {
								mipmap = mipmaps[j][i];
								gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, glFormat, glType, mipmap);
							}
							textureProperties.__maxMipLevel = mipmaps.length - 1;
							texture.generateMipmaps = false;
						} else {
							gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, glFormat, glType, image);
							textureProperties.__maxMipLevel = 0;
						}
					} else {
						if (mipmaps.length > 0 && !needFallback) {
							const isCompressed = image.isCompressed;
							for (let j = 0, jl = mipmaps.length; j < jl; j++) {
								mipmap = mipmaps[j][i];
								isCompressed ? gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, 0, mipmap.data) : gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glInternalFormat, mipmap.width, mipmap.height, texture.border, glFormat, glType, mipmap.data);
							}
							textureProperties.__maxMipLevel = mipmaps.length - 1;
							texture.generateMipmaps = false;
						} else {
							gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glInternalFormat, image.width, image.height, texture.border, glFormat, glType, image.data);
							textureProperties.__maxMipLevel = 0;
						}
					}
				}
				if (texture.generateMipmaps && !needFallback) {
					this._generateMipmap(gl.TEXTURE_CUBE_MAP, texture, images[0].width, images[0].height);
				}
				textureProperties.__version = texture.version;
				return textureProperties;
			}
			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
			return textureProperties;
		}
		setTexture3D(texture, slot) {
			const gl = this._gl;
			const state = this._state;
			const capabilities = this._capabilities;
			const constants = this._constants;
			if (capabilities.version < 2) {
				console.warn('Try to use Texture3D but browser not support WebGL2.0');
				return;
			}
			if (slot !== undefined) {
				slot = gl.TEXTURE0 + slot;
			}
			const textureProperties = this.get(texture);
			if (texture.image && textureProperties.__version !== texture.version && !textureProperties.__external) {
				if (textureProperties.__webglTexture === undefined) {
					texture.addEventListener('dispose', this._onTextureDispose);
					textureProperties.__webglTexture = gl.createTexture();
				}
				state.activeTexture(slot);
				state.bindTexture(gl.TEXTURE_3D, textureProperties.__webglTexture);
				this._setPixelStores(texture);
				this._setTextureParameters(texture, false);
				const image = texture.image;
				const glFormat = constants.getGLFormat(texture.format),
					glType = constants.getGLType(texture.type),
					glInternalFormat = texture.internalformat !== null ? constants.getGLInternalFormat(texture.internalformat) : getGLInternalFormat(gl, capabilities, glFormat, glType);
				gl.texImage3D(gl.TEXTURE_3D, 0, glInternalFormat, image.width, image.height, image.depth, texture.border, glFormat, glType, image.data);
				if (texture.generateMipmaps) {
					this._generateMipmap(gl.TEXTURE_3D, texture, image.width, image.height);
				}
				textureProperties.__version = texture.version;
				return textureProperties;
			}
			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_3D, textureProperties.__webglTexture);
			return textureProperties;
		}
		setTexture2DArray(texture, slot) {
			const gl = this._gl;
			const state = this._state;
			const capabilities = this._capabilities;
			const constants = this._constants;
			if (capabilities.version < 2) {
				console.warn('Try to use Texture2DArray but browser not support WebGL2.0');
				return;
			}
			if (slot !== undefined) {
				slot = gl.TEXTURE0 + slot;
			}
			const textureProperties = this.get(texture);
			if (texture.image && textureProperties.__version !== texture.version && !textureProperties.__external) {
				if (textureProperties.__webglTexture === undefined) {
					texture.addEventListener('dispose', this._onTextureDispose);
					textureProperties.__webglTexture = gl.createTexture();
				}
				state.activeTexture(slot);
				state.bindTexture(gl.TEXTURE_2D_ARRAY, textureProperties.__webglTexture);
				this._setPixelStores(texture);
				this._setTextureParameters(texture, false);
				const image = texture.image;
				const glFormat = constants.getGLFormat(texture.format),
					glType = constants.getGLType(texture.type),
					glInternalFormat = texture.internalformat !== null ? constants.getGLInternalFormat(texture.internalformat) : getGLInternalFormat(gl, capabilities, glFormat, glType);
				if (texture.layerUpdates.size > 0) {
					for (const layerIndex of texture.layerUpdates) {
						const layerByteLength = getByteLength(image.width, image.height, texture.format, texture.type);
						const layerData = image.data.subarray(layerIndex * layerByteLength / image.data.BYTES_PER_ELEMENT, (layerIndex + 1) * layerByteLength / image.data.BYTES_PER_ELEMENT);
						gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layerIndex, image.width, image.height, 1, glFormat, glType, layerData);
					}
					texture.layerUpdates.clear();
				} else {
					gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, glInternalFormat, image.width, image.height, image.depth, texture.border, glFormat, glType, image.data);
				}
				if (texture.generateMipmaps) {
					this._generateMipmap(gl.TEXTURE_2D_ARRAY, texture, image.width, image.height);
				}
				textureProperties.__version = texture.version;
				return textureProperties;
			}
			state.activeTexture(slot);
			state.bindTexture(gl.TEXTURE_2D_ARRAY, textureProperties.__webglTexture);
			return textureProperties;
		}
		setTextureExternal(texture, webglTexture) {
			const gl = this._gl;
			const textureProperties = this.get(texture);
			if (!textureProperties.__external) {
				if (textureProperties.__webglTexture) {
					gl.deleteTexture(textureProperties.__webglTexture);
				} else {
					texture.addEventListener('dispose', this._onTextureDispose);
				}
			}
			textureProperties.__webglTexture = webglTexture;
			textureProperties.__external = true;
		}
		_setPixelStores(texture) {
			const gl = this._gl;
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
			gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
			gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
		}
		_setTextureParameters(texture, needFallback) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			const wrappingToGL = this._wrappingToGL;
			const filterToGL = this._filterToGL;
			let textureType = gl.TEXTURE_2D;
			if (texture.isTextureCube) textureType = gl.TEXTURE_CUBE_MAP;
			if (texture.isTexture3D) textureType = gl.TEXTURE_3D;
			if (texture.isTexture2DArray) textureType = gl.TEXTURE_2D_ARRAY;
			let wrapS = texture.wrapS,
				wrapT = texture.wrapT,
				wrapR = texture.wrapR,
				magFilter = texture.magFilter,
				minFilter = texture.minFilter;

			// fix for non power of 2 image in WebGL 1.0
			if (needFallback) {
				wrapS = TEXTURE_WRAP.CLAMP_TO_EDGE;
				wrapT = TEXTURE_WRAP.CLAMP_TO_EDGE;
				if (texture.isTexture3D) {
					wrapR = TEXTURE_WRAP.CLAMP_TO_EDGE;
				}
				if (texture.wrapS !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.wrapT !== TEXTURE_WRAP.CLAMP_TO_EDGE) {
					console.warn('Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to TEXTURE_WRAP.CLAMP_TO_EDGE.', texture);
				}
				magFilter = filterFallback(texture.magFilter);
				minFilter = filterFallback(texture.minFilter);
				if (texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR || texture.magFilter !== TEXTURE_FILTER.NEAREST && texture.magFilter !== TEXTURE_FILTER.LINEAR) {
					console.warn('Texture is not power of two. Texture.minFilter and Texture.magFilter should be set to TEXTURE_FILTER.NEAREST or TEXTURE_FILTER.LINEAR.', texture);
				}
			}
			gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, wrappingToGL[wrapS]);
			gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, wrappingToGL[wrapT]);
			if (texture.isTexture3D) {
				gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, wrappingToGL[wrapR]);
			}
			gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, filterToGL[magFilter]);
			gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, filterToGL[minFilter]);

			// anisotropy if EXT_texture_filter_anisotropic exist
			const extension = capabilities.anisotropyExt;
			if (extension) {
				gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, capabilities.maxAnisotropy));
			}
			if (capabilities.version >= 2) {
				if (texture.compare !== undefined) {
					gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
					gl.texParameteri(textureType, gl.TEXTURE_COMPARE_FUNC, texture.compare);
				} else {
					gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.NONE);
				}
			}
		}
		_generateMipmap(target, texture, width, height) {
			const gl = this._gl;
			gl.generateMipmap(target);
			const textureProperties = this.get(texture);
			// Note: Math.log( x ) * Math.LOG2E used instead of Math.log2( x ) which is not supported by IE11
			textureProperties.__maxMipLevel = Math.log(Math.max(width, height)) * Math.LOG2E;
		}
	}
	function textureNeedsPowerOfTwo(texture) {
		return texture.wrapS !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.wrapT !== TEXTURE_WRAP.CLAMP_TO_EDGE || texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR;
	}
	function filterFallback(filter) {
		if (filter === TEXTURE_FILTER.NEAREST || filter === TEXTURE_FILTER.NEAREST_MIPMAP_LINEAR || filter === TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST) {
			return TEXTURE_FILTER.NEAREST;
		}
		return TEXTURE_FILTER.LINEAR;
	}
	function _isPowerOfTwo$1(image) {
		return MathUtils.isPowerOfTwo(image.width) && MathUtils.isPowerOfTwo(image.height);
	}
	function makePowerOf2(image) {
		if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
			const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			canvas.width = MathUtils.nearestPowerOfTwo(image.width);
			canvas.height = MathUtils.nearestPowerOfTwo(image.height);
			const context = canvas.getContext('2d');
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			console.warn('image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);
			return canvas;
		}
		return image;
	}
	function clampToMaxSize(image, maxSize) {
		if (image.width > maxSize || image.height > maxSize) {
			// console.warn('image is too big (' + image.width + 'x' + image.height + '). max size is ' + maxSize + 'x' + maxSize, image);
			// return image;

			// Warning: Scaling through the canvas will only work with images that use
			// premultiplied alpha.

			const scale = maxSize / Math.max(image.width, image.height);
			const canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			canvas.width = Math.floor(image.width * scale);
			canvas.height = Math.floor(image.height * scale);
			const context = canvas.getContext('2d');
			context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
			console.warn('image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);
			return canvas;
		}
		return image;
	}
	function getGLInternalFormat(gl, capabilities, glFormat, glType) {
		const isWebGL2 = capabilities.version >= 2;
		if (isWebGL2 === false) return glFormat;
		let glInternalFormat = glFormat;
		if (glFormat === gl.RED) {
			if (glType === gl.FLOAT) glInternalFormat = gl.R32F;
			if (glType === gl.HALF_FLOAT) glInternalFormat = gl.R16F;
			if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.R8;
		}
		if (glFormat === gl.RG) {
			if (glType === gl.FLOAT) glInternalFormat = gl.RG32F;
			if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RG16F;
			if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RG8;
		}
		if (glFormat === gl.RGB) {
			if (glType === gl.FLOAT) glInternalFormat = gl.RGB32F;
			if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RGB16F;
			if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RGB8;
		}
		if (glFormat === gl.RGBA) {
			if (glType === gl.FLOAT) glInternalFormat = gl.RGBA32F;
			if (glType === gl.HALF_FLOAT) glInternalFormat = gl.RGBA16F;
			if (glType === gl.UNSIGNED_BYTE) glInternalFormat = gl.RGBA8;
			if (glType === gl.UNSIGNED_SHORT_4_4_4_4) glInternalFormat = gl.RGBA4;
			if (glType === gl.UNSIGNED_SHORT_5_5_5_1) glInternalFormat = gl.RGB5_A1;
		}
		if (glFormat === gl.DEPTH_COMPONENT || glFormat === gl.DEPTH_STENCIL) {
			glInternalFormat = gl.DEPTH_COMPONENT16;
			if (glType === gl.FLOAT) glInternalFormat = gl.DEPTH_COMPONENT32F;
			if (glType === gl.UNSIGNED_INT) glInternalFormat = gl.DEPTH_COMPONENT24;
			if (glType === gl.UNSIGNED_INT_24_8) glInternalFormat = gl.DEPTH24_STENCIL8;
			if (glType === gl.FLOAT_32_UNSIGNED_INT_24_8_REV) glInternalFormat = gl.DEPTH32F_STENCIL8;
		}
		if (glInternalFormat === gl.R16F || glInternalFormat === gl.R32F || glInternalFormat === gl.RG16F || glInternalFormat === gl.RG32F || glInternalFormat === gl.RGB16F || glInternalFormat === gl.RGB32F || glInternalFormat === gl.RGBA16F || glInternalFormat === gl.RGBA32F) {
			capabilities.getExtension('EXT_color_buffer_float');
		}
		return glInternalFormat;
	}
	function domCheck(image) {
		return typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement || typeof HTMLVideoElement !== 'undefined' && image instanceof HTMLVideoElement || typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap;
	}
	function getByteLength(width, height, format, type) {
		const typeByteLength = getTextureTypeByteLength(type);
		switch (format) {
			// https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glTexImage2D.xhtml
			case PIXEL_FORMAT.ALPHA:
				return width * height;
			case PIXEL_FORMAT.LUMINANCE:
				return width * height;
			case PIXEL_FORMAT.LUMINANCE_ALPHA:
				return width * height * 2;
			case PIXEL_FORMAT.RED:
				return width * height / typeByteLength.components * typeByteLength.byteLength;
			case PIXEL_FORMAT.RED_INTEGER:
				return width * height / typeByteLength.components * typeByteLength.byteLength;
			case PIXEL_FORMAT.RG:
				return width * height * 2 / typeByteLength.components * typeByteLength.byteLength;
			case PIXEL_FORMAT.RG_INTEGER:
				return width * height * 2 / typeByteLength.components * typeByteLength.byteLength;
			case PIXEL_FORMAT.RGB:
				return width * height * 3 / typeByteLength.components * typeByteLength.byteLength;
			case PIXEL_FORMAT.RGBA:
				return width * height * 4 / typeByteLength.components * typeByteLength.byteLength;
			case PIXEL_FORMAT.RGBA_INTEGER:
				return width * height * 4 / typeByteLength.components * typeByteLength.byteLength;

			// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_s3tc_srgb/
			case PIXEL_FORMAT.RGB_S3TC_DXT1:
			case PIXEL_FORMAT.RGBA_S3TC_DXT1:
				return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
			case PIXEL_FORMAT.RGBA_S3TC_DXT3:
			case PIXEL_FORMAT.RGBA_S3TC_DXT5:
				return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;

			// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_pvrtc/
			case PIXEL_FORMAT.RGB_PVRTC_2BPPV1:
			case PIXEL_FORMAT.RGBA_PVRTC_2BPPV1:
				return Math.max(width, 16) * Math.max(height, 8) / 4;
			case PIXEL_FORMAT.RGB_PVRTC_4BPPV1:
			case PIXEL_FORMAT.RGBA_PVRTC_4BPPV1:
				return Math.max(width, 8) * Math.max(height, 8) / 2;

			// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_etc/
			case PIXEL_FORMAT.RGB_ETC1:
				return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 8;
			// https://registry.khronos.org/webgl/extensions/WEBGL_compressed_texture_astc/
			case PIXEL_FORMAT.RGBA_ASTC_4x4:
				return Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4) * 16;
			// https://registry.khronos.org/webgl/extensions/EXT_texture_compression_bptc/
			case PIXEL_FORMAT.RGBA_BPTC:
				return Math.ceil(width / 4) * Math.ceil(height / 4) * 16;
		}
		throw new Error(`Unable to determine texture byte length for ${format} format.`);
	}
	const _tempTypeByteLength = {
		byteLength: 0,
		components: 0
	};
	function getTextureTypeByteLength(type) {
		switch (type) {
			case PIXEL_TYPE.UNSIGNED_BYTE:
			case PIXEL_TYPE.ByteType:
				_tempTypeByteLength.byteLength = 1;
				_tempTypeByteLength.components = 1;
				return _tempTypeByteLength;
			case PIXEL_TYPE.UNSIGNED_SHORT:
			case PIXEL_TYPE.SHORT:
			case PIXEL_TYPE.HALF_FLOAT:
				_tempTypeByteLength.byteLength = 2;
				_tempTypeByteLength.components = 1;
				return _tempTypeByteLength;
			case PIXEL_TYPE.UNSIGNED_SHORT_4_4_4_4:
			case PIXEL_TYPE.UNSIGNED_SHORT_5_5_5_1:
				_tempTypeByteLength.byteLength = 2;
				_tempTypeByteLength.components = 4;
				return _tempTypeByteLength;
			case PIXEL_TYPE.UNSIGNED_INT:
			case PIXEL_TYPE.INT:
			case PIXEL_TYPE.FLOAT:
				_tempTypeByteLength.byteLength = 4;
				_tempTypeByteLength.components = 1;
				return _tempTypeByteLength;
		}
		throw new Error(`Unknown texture type ${type}.`);
	}

	class WebGLRenderBuffers extends PropertyMap {
		constructor(prefix, gl, capabilities, constants) {
			super(prefix);
			this._gl = gl;
			this._capabilities = capabilities;
			this._constants = constants;
			const that = this;
			function onRenderBufferDispose(event) {
				const renderBuffer = event.target;
				renderBuffer.removeEventListener('dispose', onRenderBufferDispose);
				const renderBufferProperties = that.get(renderBuffer);
				if (renderBufferProperties.__webglRenderbuffer && !renderBufferProperties.__external) {
					gl.deleteRenderbuffer(renderBufferProperties.__webglRenderbuffer);
				}
				that.delete(renderBuffer);
			}
			this._onRenderBufferDispose = onRenderBufferDispose;
		}
		setRenderBuffer(renderBuffer) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			const constants = this._constants;
			const renderBufferProperties = this.get(renderBuffer);
			if (renderBufferProperties.__webglRenderbuffer === undefined) {
				renderBuffer.addEventListener('dispose', this._onRenderBufferDispose);
				renderBufferProperties.__webglRenderbuffer = gl.createRenderbuffer();
				gl.bindRenderbuffer(gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);
				const glFormat = constants.getGLInternalFormat(renderBuffer.format);
				if (renderBuffer.multipleSampling > 0) {
					if (capabilities.version < 2) {
						console.error('render buffer multipleSampling is not support in webgl 1.0.');
					}
					gl.renderbufferStorageMultisample(gl.RENDERBUFFER, Math.min(renderBuffer.multipleSampling, capabilities.maxSamples), glFormat, renderBuffer.width, renderBuffer.height);
				} else {
					gl.renderbufferStorage(gl.RENDERBUFFER, glFormat, renderBuffer.width, renderBuffer.height);
				}
			} else {
				gl.bindRenderbuffer(gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);
			}
			return renderBufferProperties;
		}
		setRenderBufferExternal(renderBuffer, webglRenderbuffer) {
			const gl = this._gl;
			const renderBufferProperties = this.get(renderBuffer);
			if (!renderBufferProperties.__external) {
				if (renderBufferProperties.__webglRenderbuffer) {
					gl.deleteRenderbuffer(renderBufferProperties.__webglRenderbuffer);
				} else {
					renderBuffer.addEventListener('dispose', this._onRenderBufferDispose);
				}
			}
			renderBufferProperties.__webglRenderbuffer = webglRenderbuffer;
			renderBufferProperties.__external = true;
		}
	}

	class WebGLRenderTargets extends PropertyMap {
		constructor(prefix, gl, state, capabilities, textures, renderBuffers, constants) {
			super(prefix);
			this._gl = gl;
			this._state = state;
			this._capabilities = capabilities;
			this._textures = textures;
			this._renderBuffers = renderBuffers;
			this._constants = constants;
			const that = this;
			function onRenderTargetDispose(event) {
				const renderTarget = event.target;
				renderTarget.removeEventListener('dispose', onRenderTargetDispose);
				const renderTargetProperties = that.get(renderTarget);
				if (renderTargetProperties.__webglFramebuffer) {
					gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
				}
				if (renderTargetProperties.__readBuffer) {
					gl.deleteBuffer(renderTargetProperties.__readBuffer);
				}
				that.delete(renderTarget);
				if (state.currentRenderTarget === renderTarget) {
					state.currentRenderTarget = null;
				}
			}
			this._onRenderTargetDispose = onRenderTargetDispose;
		}
		_setupRenderTarget(renderTarget) {
			const gl = this._gl;
			const state = this._state;
			const textures = this._textures;
			const renderBuffers = this._renderBuffers;
			const capabilities = this._capabilities;
			const renderTargetProperties = this.get(renderTarget);
			renderTarget.addEventListener('dispose', this._onRenderTargetDispose);
			const glFrameBuffer = gl.createFramebuffer();
			const drawBuffers = [];
			renderTargetProperties.__webglFramebuffer = glFrameBuffer;
			renderTargetProperties.__drawBuffers = drawBuffers;
			renderTargetProperties.__currentActiveMipmapLevel = renderTarget.activeMipmapLevel;
			if (renderTarget.isRenderTargetCube) {
				renderTargetProperties.__currentActiveCubeFace = renderTarget.activeCubeFace;
			}
			if (renderTarget.isRenderTarget3D || renderTarget.isRenderTarget2DArray) {
				renderTargetProperties.__currentActiveLayer = renderTarget.activeLayer;
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
			for (const attachTarget in renderTarget._attachments) {
				const glAttachTarget = attachTargetToGL[attachTarget];
				if (glAttachTarget === gl.DEPTH_ATTACHMENT || glAttachTarget === gl.DEPTH_STENCIL_ATTACHMENT) {
					if (capabilities.version < 2 && !capabilities.getExtension('WEBGL_depth_texture')) {
						console.warn('WebGLRenderTargets: extension WEBGL_depth_texture is not support.');
					}
				} else if (glAttachTarget !== gl.STENCIL_ATTACHMENT) {
					drawBuffers.push(glAttachTarget);
				}
				const attachment = renderTarget._attachments[attachTarget];
				if (attachment.isTexture2D) {
					const textureProperties = textures.setTexture2D(attachment);
					gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_2D, textureProperties.__webglTexture, renderTarget.activeMipmapLevel);
					state.bindTexture(gl.TEXTURE_2D, null);
				} else if (attachment.isTextureCube) {
					const textureProperties = textures.setTextureCube(attachment);
					gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachTarget, gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, renderTarget.activeMipmapLevel);
					state.bindTexture(gl.TEXTURE_CUBE_MAP, null);
				} else if (attachment.isTexture3D) {
					const textureProperties = textures.setTexture3D(attachment);
					gl.framebufferTextureLayer(gl.FRAMEBUFFER, glAttachTarget, textureProperties.__webglTexture, renderTarget.activeMipmapLevel, renderTarget.activeLayer);
					state.bindTexture(gl.TEXTURE_3D, null);
				} else if (attachment.isTexture2DArray) {
					const textureProperties = textures.setTexture2DArray(attachment);
					gl.framebufferTextureLayer(gl.FRAMEBUFFER, glAttachTarget, textureProperties.__webglTexture, renderTarget.activeMipmapLevel, renderTarget.activeLayer);
					state.bindTexture(gl.TEXTURE_2D_ARRAY, null);
				} else {
					const renderBufferProperties = renderBuffers.setRenderBuffer(attachment);
					gl.framebufferRenderbuffer(gl.FRAMEBUFFER, glAttachTarget, gl.RENDERBUFFER, renderBufferProperties.__webglRenderbuffer);
				}
			}
			drawBuffers.sort(drawBufferSort);
			if (capabilities.version >= 2) {
				gl.drawBuffers(drawBuffers);
			} else if (capabilities.getExtension('WEBGL_draw_buffers')) {
				capabilities.getExtension('WEBGL_draw_buffers').drawBuffersWEBGL(drawBuffers);
			}
		}
		setRenderTarget(renderTarget) {
			const gl = this._gl;
			const state = this._state;
			const textures = this._textures;
			let renderTargetProperties;
			if (state.currentRenderTarget !== renderTarget) {
				if (renderTarget.isRenderTargetBack) {
					gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				} else {
					renderTargetProperties = this.get(renderTarget);
					if (renderTargetProperties.__webglFramebuffer === undefined) {
						this._setupRenderTarget(renderTarget);
					} else {
						gl.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
					}
				}
				state.currentRenderTarget = renderTarget;
			}
			renderTargetProperties = this.get(renderTarget);
			if (renderTarget.isRenderTargetCube) {
				const activeCubeFace = renderTarget.activeCubeFace;
				const activeMipmapLevel = renderTarget.activeMipmapLevel;
				if (renderTargetProperties.__currentActiveCubeFace !== activeCubeFace || renderTargetProperties.__currentActiveMipmapLevel !== activeMipmapLevel) {
					for (const attachTarget in renderTarget._attachments) {
						const attachment = renderTarget._attachments[attachTarget];
						if (attachment.isTextureCube) {
							const textureProperties = textures.get(attachment);
							gl.framebufferTexture2D(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], gl.TEXTURE_CUBE_MAP_POSITIVE_X + activeCubeFace, textureProperties.__webglTexture, activeMipmapLevel);
						}
					}
					renderTargetProperties.__currentActiveCubeFace = activeCubeFace;
					renderTargetProperties.__currentActiveMipmapLevel = activeMipmapLevel;
				}
			} else if (renderTarget.isRenderTarget3D || renderTarget.isRenderTarget2DArray) {
				const activeLayer = renderTarget.activeLayer;
				const activeMipmapLevel = renderTarget.activeMipmapLevel;
				if (renderTargetProperties.__currentActiveLayer !== activeLayer || renderTargetProperties.__currentActiveMipmapLevel !== activeMipmapLevel) {
					for (const attachTarget in renderTarget._attachments) {
						const attachment = renderTarget._attachments[attachTarget];
						if (attachment.isTexture3D || attachment.isTexture2DArray) {
							const textureProperties = textures.get(attachment);
							gl.framebufferTextureLayer(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], textureProperties.__webglTexture, activeMipmapLevel, activeLayer);
						}
					}
					renderTargetProperties.__currentActiveLayer = activeLayer;
					renderTargetProperties.__currentActiveMipmapLevel = activeMipmapLevel;
				}
			} else if (renderTarget.isRenderTarget2D) {
				const activeMipmapLevel = renderTarget.activeMipmapLevel;
				if (renderTargetProperties.__currentActiveMipmapLevel !== activeMipmapLevel) {
					for (const attachTarget in renderTarget._attachments) {
						const attachment = renderTarget._attachments[attachTarget];
						if (attachment.isTexture2D) {
							const textureProperties = textures.get(attachment);
							gl.framebufferTexture2D(gl.FRAMEBUFFER, attachTargetToGL[attachTarget], gl.TEXTURE_2D, textureProperties.__webglTexture, activeMipmapLevel);
						}
					}
					renderTargetProperties.__currentActiveMipmapLevel = activeMipmapLevel;
				}
			}
		}
		blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			if (capabilities.version < 2) {
				console.warn('WebGLRenderTargets: blitFramebuffer not support by WebGL' + capabilities.version);
				return;
			}
			const readBuffer = this.get(read).__webglFramebuffer;
			const drawBuffer = this.get(draw).__webglFramebuffer;
			gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readBuffer);
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, drawBuffer);
			let mask = 0;
			if (color) mask |= gl.COLOR_BUFFER_BIT;
			if (depth) mask |= gl.DEPTH_BUFFER_BIT;
			if (stencil) mask |= gl.STENCIL_BUFFER_BIT;

			// gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 0.0]);

			gl.blitFramebuffer(0, 0, read.width, read.height, 0, 0, draw.width, draw.height, mask, gl.NEAREST);
		}
		readRenderTargetPixels(x, y, width, height, buffer) {
			const gl = this._gl;
			const state = this._state;
			const constants = this._constants;
			const renderTarget = state.currentRenderTarget;
			if (renderTarget && renderTarget.texture) {
				if (x >= 0 && x <= renderTarget.width - width && y >= 0 && y <= renderTarget.height - height) {
					const glType = constants.getGLType(renderTarget.texture.type);
					const glFormat = constants.getGLFormat(renderTarget.texture.format);
					gl.readPixels(x, y, width, height, glFormat, glType, buffer);
				}
			} else {
				console.warn('WebGLRenderTargets.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not bound or texture not attached.');
			}
		}
		readRenderTargetPixelsAsync(x, y, width, height, buffer) {
			const gl = this._gl;
			const state = this._state;
			const constants = this._constants;
			const renderTarget = state.currentRenderTarget;
			if (renderTarget && renderTarget.texture) {
				if (x >= 0 && x <= renderTarget.width - width && y >= 0 && y <= renderTarget.height - height) {
					const renderTargetProperties = this.get(renderTarget);
					if (renderTargetProperties.__readBuffer === undefined) {
						renderTargetProperties.__readBuffer = gl.createBuffer();
					}
					gl.bindBuffer(gl.PIXEL_PACK_BUFFER, renderTargetProperties.__readBuffer);
					gl.bufferData(gl.PIXEL_PACK_BUFFER, buffer.byteLength, gl.STREAM_READ);
					const glType = constants.getGLType(renderTarget.texture.type);
					const glFormat = constants.getGLFormat(renderTarget.texture.format);
					gl.readPixels(x, y, width, height, glFormat, glType, 0);
					return _clientWaitAsync(gl).then(() => {
						if (!renderTargetProperties.__readBuffer) {
							return Promise.reject('Read Buffer is not valid.');
						}
						gl.bindBuffer(gl.PIXEL_PACK_BUFFER, renderTargetProperties.__readBuffer);
						gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, buffer);
						gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
						return buffer;
					});
				} else {
					return Promise.resolve(buffer);
				}
			} else {
				console.warn('WebGLRenderTargets.readRenderTargetPixelsAsync: readPixels from renderTarget failed. Framebuffer not bound or texture not attached.');
				return Promise.reject();
			}
		}
		updateRenderTargetMipmap(renderTarget) {
			const gl = this._gl;
			const state = this._state;
			const capabilities = this._capabilities;
			const texture = renderTarget.texture;
			if (texture.generateMipmaps && texture.minFilter !== TEXTURE_FILTER.NEAREST && texture.minFilter !== TEXTURE_FILTER.LINEAR && (_isPowerOfTwo(renderTarget) || capabilities.version >= 2)) {
				let glTarget = gl.TEXTURE_2D;
				if (texture.isTextureCube) glTarget = gl.TEXTURE_CUBE_MAP;
				if (texture.isTexture3D) glTarget = gl.TEXTURE_3D;
				const webglTexture = this._textures.get(texture).__webglTexture;
				state.bindTexture(glTarget, webglTexture);
				gl.generateMipmap(glTarget);
				state.bindTexture(glTarget, null);
			}
		}
	}
	const attachTargetToGL = {
		[ATTACHMENT.COLOR_ATTACHMENT0]: 0x8CE0,
		[ATTACHMENT.COLOR_ATTACHMENT1]: 0x8CE1,
		[ATTACHMENT.COLOR_ATTACHMENT2]: 0x8CE2,
		[ATTACHMENT.COLOR_ATTACHMENT3]: 0x8CE3,
		[ATTACHMENT.COLOR_ATTACHMENT4]: 0x8CE4,
		[ATTACHMENT.COLOR_ATTACHMENT5]: 0x8CE5,
		[ATTACHMENT.COLOR_ATTACHMENT6]: 0x8CE6,
		[ATTACHMENT.COLOR_ATTACHMENT7]: 0x8CE7,
		[ATTACHMENT.COLOR_ATTACHMENT8]: 0x8CE8,
		[ATTACHMENT.COLOR_ATTACHMENT9]: 0x8CE9,
		[ATTACHMENT.COLOR_ATTACHMENT10]: 0x8CEA,
		[ATTACHMENT.COLOR_ATTACHMENT11]: 0x8CEB,
		[ATTACHMENT.COLOR_ATTACHMENT12]: 0x8CEC,
		[ATTACHMENT.COLOR_ATTACHMENT13]: 0x8CED,
		[ATTACHMENT.COLOR_ATTACHMENT14]: 0x8CEE,
		[ATTACHMENT.COLOR_ATTACHMENT15]: 0x8CEF,
		[ATTACHMENT.DEPTH_ATTACHMENT]: 0x8D00,
		[ATTACHMENT.STENCIL_ATTACHMENT]: 0x8D20,
		[ATTACHMENT.DEPTH_STENCIL_ATTACHMENT]: 0x821A
	};
	function drawBufferSort(a, b) {
		return a - b;
	}
	function _isPowerOfTwo(renderTarget) {
		return MathUtils.isPowerOfTwo(renderTarget.width) && MathUtils.isPowerOfTwo(renderTarget.height);
	}
	function _clientWaitAsync(gl) {
		const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
		gl.flush();
		return new Promise(function (resolve, reject) {
			function test() {
				const res = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);
				if (res === gl.WAIT_FAILED) {
					gl.deleteSync(sync);
					reject();
					return;
				}
				if (res === gl.TIMEOUT_EXPIRED) {
					requestAnimationFrame(test);
					return;
				}
				gl.deleteSync(sync);
				resolve();
			}
			test();
		});
	}

	class WebGLBuffers extends PropertyMap {
		constructor(prefix, gl, capabilities) {
			super(prefix);
			this._gl = gl;
			this._capabilities = capabilities;
		}
		setBuffer(buffer, bufferType, vertexArrayBindings) {
			const bufferProperties = this.get(buffer);
			const needCreate = bufferProperties.glBuffer === undefined;
			if (!needCreate && bufferProperties.version === buffer.version) return;

			// Avoid polluting the binding state
			if (vertexArrayBindings) {
				vertexArrayBindings.reset();
			}
			if (needCreate || bufferProperties.__external) {
				// Because Buffer does not have a dispose interface at present,
				// when the version increases, the external is automatically closed
				this._createGLBuffer(bufferProperties, buffer, bufferType);
			} else {
				this._updateGLBuffer(bufferProperties.glBuffer, buffer, bufferType);
				bufferProperties.version = buffer.version;
			}
		}
		removeBuffer(buffer) {
			const gl = this._gl;
			const bufferProperties = this.get(buffer);
			if (bufferProperties.glBuffer && !bufferProperties.__external) {
				gl.deleteBuffer(bufferProperties.glBuffer);
			}
			this.delete(buffer);
		}
		setBufferExternal(buffer, webglBuffer) {
			const gl = this._gl;
			const bufferProperties = this.get(buffer);
			if (!bufferProperties.__external) {
				if (bufferProperties.glBuffer) {
					gl.deleteBuffer(bufferProperties.glBuffer);
				}
			}
			const type = getBufferType(gl, buffer.array);
			bufferProperties.glBuffer = webglBuffer;
			bufferProperties.type = type;
			bufferProperties.bytesPerElement = buffer.array.BYTES_PER_ELEMENT;
			bufferProperties.version = buffer.version;
			bufferProperties.__external = true;
		}
		_createGLBuffer(bufferProperties, buffer, bufferType) {
			const gl = this._gl;
			const array = buffer.array;
			const usage = buffer.usage;
			const glBuffer = gl.createBuffer();
			gl.bindBuffer(bufferType, glBuffer);
			gl.bufferData(bufferType, array, usage);
			buffer.onUploadCallback();
			const type = getBufferType(gl, array);
			bufferProperties.glBuffer = glBuffer;
			bufferProperties.type = type;
			bufferProperties.bytesPerElement = array.BYTES_PER_ELEMENT;
			bufferProperties.version = buffer.version;
			bufferProperties.__external = false;
			buffer.updateRange.count = -1; // reset range
		}
		_updateGLBuffer(glBuffer, buffer, bufferType) {
			const gl = this._gl;
			const capabilities = this._capabilities;
			const array = buffer.array;
			const updateRange = buffer.updateRange;
			gl.bindBuffer(bufferType, glBuffer);
			if (updateRange.count === -1) {
				// Not using update ranges
				gl.bufferSubData(bufferType, 0, array);
			} else {
				if (capabilities.version >= 2) {
					gl.bufferSubData(bufferType, updateRange.offset * array.BYTES_PER_ELEMENT, array, updateRange.offset, updateRange.count);
				} else {
					gl.bufferSubData(bufferType, updateRange.offset * array.BYTES_PER_ELEMENT, array.subarray(updateRange.offset, updateRange.offset + updateRange.count));
				}
				updateRange.count = -1; // reset range
			}
		}
	}
	function getBufferType(gl, array) {
		let type;
		if (array instanceof Float32Array) {
			type = gl.FLOAT;
		} else if (array instanceof Float64Array) {
			console.warn('Unsupported data buffer format: Float64Array.');
		} else if (array instanceof Uint16Array) {
			type = gl.UNSIGNED_SHORT;
		} else if (array instanceof Int16Array) {
			type = gl.SHORT;
		} else if (array instanceof Uint32Array) {
			type = gl.UNSIGNED_INT;
		} else if (array instanceof Int32Array) {
			type = gl.INT;
		} else if (array instanceof Int8Array) {
			type = gl.BYTE;
		} else if (array instanceof Uint8Array) {
			type = gl.UNSIGNED_BYTE;
		} else {
			type = gl.FLOAT;
		}
		return type;
	}

	class WebGLMaterials extends PropertyMap {
		constructor(prefix, programs, vertexArrayBindings) {
			super(prefix);
			const that = this;
			function onMaterialDispose(event) {
				const material = event.target;
				const materialProperties = that.get(material);
				material.removeEventListener('dispose', onMaterialDispose);
				const programList = materialProperties.programList;
				if (programList !== undefined) {
					for (let i = 0, l = programList.length; i < l; i++) {
						const program = programList[i];
						vertexArrayBindings.releaseByProgram(program);
						programs.releaseProgram(program);
					}
				}
				that.delete(material);
			}
			this._onMaterialDispose = onMaterialDispose;
			this._programs = programs;
			this._vertexArrayBindings = vertexArrayBindings;
		}
		setMaterial(material) {
			const materialProperties = this.get(material);
			if (materialProperties.programList === undefined) {
				material.addEventListener('dispose', this._onMaterialDispose);
				materialProperties.programList = [];
			}

			// Set other material properties in renderer

			return materialProperties;
		}
		updateProgram(material, object, lightingState, renderStates, shaderCompileOptions) {
			const programs = this._programs;
			const vertexArrayBindings = this._vertexArrayBindings;
			const materialProperties = this.get(material);
			const props = programs.generateProps(material, object, lightingState, renderStates);
			const programCode = programs.generateProgramCode(props, material);
			const programList = materialProperties.programList;
			let targetProgram = findProgram(programList, programCode);
			if (targetProgram === null) {
				targetProgram = programs.getProgram(material, props, programCode, shaderCompileOptions);
				programList.unshift(targetProgram);
				if (programList.length > shaderCompileOptions.maxMaterialPrograms) {
					// release the last program
					const lastProgram = programList.pop();
					vertexArrayBindings.releaseByProgram(lastProgram);
					programs.releaseProgram(lastProgram);
				}
			}
			materialProperties.currentProgram = targetProgram;
		}
	}
	function findProgram(list, code) {
		let index = 0,
			target = null;
		for (let l = list.length; index < l; index++) {
			const program = list[index];
			if (program.code === code) {
				target = program;
				break;
			}
		}

		// move to the first
		if (target !== null && index > 0) {
			for (let i = index; i > 0; i--) {
				list[i] = list[i - 1];
			}
			list[0] = target;
		}
		return target;
	}

	const emptyString = '';
	class WebGLVertexArrayBindings extends PropertyMap {
		constructor(prefix, gl, capabilities, buffers) {
			super(prefix);
			this._gl = gl;
			this._capabilities = capabilities;
			this._buffers = buffers;
			this._isWebGL2 = capabilities.version >= 2;
			this._vaoExt = capabilities.getExtension('OES_vertex_array_object');
			this._vaoCache = {}; // save vao cache here for releaseByProgram() method
			this._currentGeometryProgram = '';
			this._currentVAO = null;
		}
		setup(object, geometry, program) {
			if (object.morphTargetInfluences) {
				this.reset();
				this._setupVertexAttributes(program, geometry);
				this._currentGeometryProgram = emptyString;
			} else if (this._isWebGL2 || this._vaoExt) {
				// use VAO
				const geometryProperties = this.get(geometry);
				if (geometryProperties._vaos === undefined) {
					geometryProperties._vaos = {};
					this._vaoCache[geometry.id] = geometryProperties._vaos;
				}
				let vao = geometryProperties._vaos[program.id];
				if (!vao) {
					vao = geometryProperties._vaos[program.id] = {
						version: -1,
						object: this._createVAO()
					};
				}
				this._bindVAO(vao.object);
				if (vao.version !== geometry.version) {
					this._setupVertexAttributes(program, geometry);
					vao.version = geometry.version;
				}
			} else {
				const geometryProgram = program.id + '_' + geometry.id + '_' + geometry.version;
				if (geometryProgram !== this._currentGeometryProgram) {
					this._setupVertexAttributes(program, geometry);
					this._currentGeometryProgram = geometryProgram;
				}
			}
		}
		releaseByGeometry(geometry) {
			const geometryProperties = this.get(geometry);
			const vaos = geometryProperties._vaos;
			if (vaos) {
				for (const programId in vaos) {
					const vao = vaos[programId];
					if (!vao) continue;
					this._disposeVAO(vao.object);
				}
				delete geometryProperties._vaos;
				delete this._vaoCache[geometry.id];
			}
		}
		releaseByProgram(program) {
			for (const geometryId in this._vaoCache) {
				const vaos = this._vaoCache[geometryId];
				if (vaos) {
					const vao = vaos[program.id];
					if (!vao) continue;
					this._disposeVAO(vao.object);
					delete vaos[program.id];
				}
			}
		}
		reset(force) {
			if (this._currentVAO !== null || force) {
				if (this._isWebGL2) {
					this._gl.bindVertexArray(null);
				} else if (this._vaoExt) {
					this._vaoExt.bindVertexArrayOES(null);
				}
				this._currentVAO = null;
			}
			if (this._currentGeometryProgram !== emptyString) {
				this._currentGeometryProgram = emptyString;
			}
		}
		_createVAO() {
			if (this._isWebGL2) {
				return this._gl.createVertexArray();
			} else if (this._vaoExt) {
				return this._vaoExt.createVertexArrayOES();
			}
			return null;
		}
		_bindVAO(vao) {
			if (this._currentVAO !== vao) {
				if (this._isWebGL2) {
					this._gl.bindVertexArray(vao);
				} else if (this._vaoExt) {
					this._vaoExt.bindVertexArrayOES(vao);
				}
				this._currentVAO = vao;
			}
		}
		_disposeVAO(vao) {
			if (this._isWebGL2) {
				this._gl.deleteVertexArray(vao);
			} else if (this._vaoExt) {
				this._vaoExt.deleteVertexArrayOES(vao);
			}
		}
		_setupVertexAttributes(program, geometry) {
			const gl = this._gl;
			const isWebGL2 = this._isWebGL2;
			const attributes = program.getAttributes();
			const capabilities = this._capabilities;
			const buffers = this._buffers;
			for (const key in attributes) {
				const programAttribute = attributes[key];
				const geometryAttribute = geometry.getAttribute(key);
				if (geometryAttribute) {
					const size = geometryAttribute.size;
					if (programAttribute.count !== size) {
						console.warn('WebGLVertexArrayBindings: attribute ' + key + ' size not match! ' + programAttribute.count + ' : ' + size);
					}
					const buffer = geometryAttribute.buffer;
					const bufferProperties = buffers.get(buffer);
					const type = bufferProperties.type;
					const integer = isWebGL2 && (programAttribute.format === gl.INT || programAttribute.format === gl.UNSIGNED_INT);
					for (let i = 0, l = programAttribute.locationSize; i < l; i++) {
						gl.enableVertexAttribArray(programAttribute.location + i);
					}
					if (geometryAttribute.divisor > 0) {
						// use instancing
						for (let i = 0, l = programAttribute.locationSize; i < l; i++) {
							if (isWebGL2) {
								gl.vertexAttribDivisor(programAttribute.location + i, geometryAttribute.divisor);
							} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
								capabilities.getExtension('ANGLE_instanced_arrays').vertexAttribDivisorANGLE(programAttribute.location + i, geometryAttribute.divisor);
							} else {
								console.warn('vertexAttribDivisor not supported');
							}
						}
					}
					const bytesPerElement = bufferProperties.bytesPerElement;
					const glBuffer = bufferProperties.glBuffer;
					const stride = buffer.stride;
					const offset = geometryAttribute.offset;
					const normalized = geometryAttribute.normalized;
					gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
					if (programAttribute.count === stride && programAttribute.locationSize === 1) {
						this._vertexAttribPointer(programAttribute.location, programAttribute.count, type, normalized, 0, 0, integer);
					} else {
						for (let i = 0; i < programAttribute.locationSize; i++) {
							this._vertexAttribPointer(programAttribute.location + i, programAttribute.count / programAttribute.locationSize, type, normalized, bytesPerElement * stride, bytesPerElement * (offset + programAttribute.count / programAttribute.locationSize * i), integer);
						}
					}
				}
			}

			// bind index if could
			if (geometry.index) {
				const indexBufferProperties = buffers.get(geometry.index.buffer);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferProperties.glBuffer);
			}
		}
		_vertexAttribPointer(index, size, type, normalized, stride, offset, integer) {
			const gl = this._gl;
			if (integer) {
				gl.vertexAttribIPointer(index, size, type, stride, offset);
			} else {
				gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
			}
		}
	}

	class WebGLClusteredLighting {
		constructor(options) {
			this.lightsTexture = new LightsTexture();
			this.lightsTexture.initLights(options.maxClusterLights, options.useFloatPrecision ? PIXEL_TYPE.FLOAT : PIXEL_TYPE.HALF_FLOAT);
			this.cellsTexture = new CellsTexture();
			this.cellsTexture.initCells(options.gridDimensions, options.maxLightsPerCell);
			this._zClip = options.zClip.clone();
			this._cellsTextureEmpty = false;
			this.cellsTransform = {
				clips: [0, 0],
				// near, far
				factors: [0, 0, 0, 0],
				// logFactor1, logFactor2, persp:tan(fov/2)|ortho:-height/2, aspect
				perspective: true
			};
		}
		dispose() {
			this._cellsTextureEmpty = false;
			this.cellsTexture.dispose();
			this.lightsTexture.dispose();
		}
		setOptions(options) {
			this.lightsTexture.updateLights(options.maxClusterLights, options.useFloatPrecision ? PIXEL_TYPE.FLOAT : PIXEL_TYPE.HALF_FLOAT);
			this.cellsTexture.updateCells(options.gridDimensions, options.maxLightsPerCell);
			this._zClip.copy(options.zClip);
		}
		update(lightingGroup, cameraData, lightsNeedsUpdate = true) {
			this._updateCellsTransform(cameraData);
			this.cellsTexture.resetLightIndices();
			const cellsTable = this.cellsTexture.cellsInfo.table;
			const cellsTransform = this.cellsTransform;
			let lightIndicesWritten = false;
			for (let i = 0; i < lightingGroup.pointsNum; i++) {
				const pointLight = lightingGroup.point[i];
				getPointLightBoundingSphere(pointLight, _lightSphere);
				_lightSphere.center.applyMatrix4(cameraData.viewMatrix);
				_lightSphere.center.z *= -1;
				if (getCellsRange(_lightSphere, cellsTable, cellsTransform, _cellsRange)) {
					lightIndicesWritten = this.cellsTexture.setLightIndex(_cellsRange, i) || lightIndicesWritten;
					lightsNeedsUpdate && this.lightsTexture.setPointLight(i, pointLight);
				}
			}
			for (let i = 0; i < lightingGroup.spotsNum; i++) {
				const spotLight = lightingGroup.spot[i];
				getSpotLightBoundingSphere(spotLight, _lightSphere);
				_lightSphere.center.applyMatrix4(cameraData.viewMatrix);
				_lightSphere.center.z *= -1;
				if (getCellsRange(_lightSphere, cellsTable, cellsTransform, _cellsRange)) {
					lightIndicesWritten = this.cellsTexture.setLightIndex(_cellsRange, i + lightingGroup.pointsNum) || lightIndicesWritten;
					lightsNeedsUpdate && this.lightsTexture.setSpotLight(i + lightingGroup.pointsNum, spotLight);
				}
			}
			lightIndicesWritten && lightsNeedsUpdate && this.lightsTexture.version++;
			(lightIndicesWritten || !this._cellsTextureEmpty) && this.cellsTexture.version++;
			this._cellsTextureEmpty = !lightIndicesWritten;
		}
		_updateCellsTransform(cameraData) {
			const {
				clips,
				factors
			} = this.cellsTransform;
			this._zClip.toArray(clips);
			clips[0] = clips[0] > 0 ? clips[0] : cameraData.near;
			clips[1] = clips[1] > 0 ? clips[1] : cameraData.far;
			const cz = this.cellsTexture.cellsInfo.table[2];
			const _logFarNear = Math.log(clips[1] / clips[0]);
			factors[0] = cz / _logFarNear;
			factors[1] = -cz * Math.log(clips[0]) / _logFarNear;
			const perspective = _isPerspectiveMatrix(cameraData.projectionMatrix);
			const elements = cameraData.projectionMatrix.elements;
			factors[2] = (perspective ? 1 : -1) / elements[5]; // persp: tan(fov / 2), ortho: -height / 2
			factors[3] = elements[5] / elements[0]; // aspect: (width / height)

			this.cellsTransform.perspective = perspective;
		}
	}
	class CellsTexture extends Texture2D {
		constructor() {
			super();
			this.format = PIXEL_FORMAT.RED;
			this.type = PIXEL_TYPE.HALF_FLOAT;
			this.magFilter = TEXTURE_FILTER.NEAREST;
			this.minFilter = TEXTURE_FILTER.NEAREST;
			this.generateMipmaps = false;
			this.flipY = false;
			this.unpackAlignment = 1;
			this.cellsInfo = {
				table: [],
				maxLightsPerCell: 0,
				textureSize: [],
				dotData: []
			};
			this._counts = null;
		}
		initCells(cellTable, maxLightsPerCell) {
			const numCells = cellTable.x * cellTable.y * cellTable.z;
			const numPixels = numCells * maxLightsPerCell;

			// TODO - better texture size calculation
			let width = Math.ceil(Math.sqrt(numPixels));
			width = Math.ceil(width / maxLightsPerCell) * maxLightsPerCell;
			const height = Math.ceil(numPixels / width);
			const data = new Uint16Array(width * height);
			this.image = {
				data,
				width,
				height
			};
			cellTable.toArray(this.cellsInfo.table);
			this.cellsInfo.maxLightsPerCell = maxLightsPerCell;
			this.cellsInfo.textureSize[0] = width;
			this.cellsInfo.textureSize[1] = 1 / width;
			this.cellsInfo.textureSize[2] = 1 / height;
			this.cellsInfo.dotData[0] = maxLightsPerCell;
			this.cellsInfo.dotData[1] = cellTable.x * cellTable.z * maxLightsPerCell;
			this.cellsInfo.dotData[2] = cellTable.x * maxLightsPerCell;
			this._counts = new Int32Array(numCells);
		}
		updateCells(cellTable, maxLightsPerCell) {
			const cellsInfo = this.cellsInfo;
			if (_vec3_1.fromArray(cellsInfo.table).equals(cellTable) && cellsInfo.maxLightsPerCell === maxLightsPerCell) {
				return;
			}
			this.dispose();
			this.initCells(cellTable, maxLightsPerCell);
			this.version++;
		}
		resetLightIndices() {
			this.image.data.fill(0);
			this._counts.fill(0);
		}
		setLightIndex(cellsRange, index) {
			const data = this.image.data;
			const counts = this._counts;
			const {
				table,
				maxLightsPerCell
			} = this.cellsInfo;
			const {
				min,
				max
			} = cellsRange;
			let needsUpdate = false;
			for (let x = min.x; x <= max.x; x++) {
				for (let z = min.z; z <= max.z; z++) {
					for (let y = min.y; y <= max.y; y++) {
						const idx = x + table[0] * (z + y * table[2]);
						const count = counts[idx];
						if (count < maxLightsPerCell) {
							const offset = idx * maxLightsPerCell + count;
							data[offset] = MathUtils.toHalfFloat(index + 1); // 0 is reserved for empty cell, so we offset by 1
							counts[idx]++;
							needsUpdate = true;
						}
					}
				}
			}
			return needsUpdate;
		}
	}
	class LightsTexture extends Texture2D {
		constructor() {
			super();
			this.format = PIXEL_FORMAT.RGBA;
			this.magFilter = TEXTURE_FILTER.NEAREST;
			this.minFilter = TEXTURE_FILTER.NEAREST;
			this.generateMipmaps = false;
			this.flipY = false;
		}
		initLights(maxLights, type) {
			const size = lightsTextureSize(maxLights);
			const arrayType = type === PIXEL_TYPE.FLOAT ? Float32Array : Uint16Array;
			const data = new arrayType(size * size * 4); // eslint-disable-line new-cap

			this.image = {
				data,
				width: size,
				height: size
			};
			this.type = type;
		}
		updateLights(maxLights, type) {
			const size = lightsTextureSize(maxLights);
			if (size === this.image.width && type === this.type) return;
			this.dispose();
			this.initLights(maxLights, type);
			this.version++;
		}
		setPointLight(index, lightInfo) {
			const data = this.image.data;
			const halfFloat = this.type === PIXEL_TYPE.HALF_FLOAT;
			const start = index * LIGHT_STRIDE * 4;
			const {
				color,
				decay,
				position,
				distance
			} = lightInfo;

			// pixel 0 - R: lightType, G: -, B: -, A: -

			data[start + 0 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(1) : 1;

			// pixel 1 - R: color.r, G: color.g, B: color.b, A: decay

			data[start + 1 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(color[0]) : color[0];
			data[start + 1 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(color[1]) : color[1];
			data[start + 1 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(color[2]) : color[2];
			data[start + 1 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(decay) : decay;

			// pixel 2 - R: position.x, G: position.y, B: position.z, A: distance

			data[start + 2 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(position[0]) : position[0];
			data[start + 2 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(position[1]) : position[1];
			data[start + 2 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(position[2]) : position[2];
			data[start + 2 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(distance) : distance;

			// pixel 3 - R: -, G: -, B: -, A: -
		}
		setSpotLight(index, lightInfo) {
			const data = this.image.data;
			const halfFloat = this.type === PIXEL_TYPE.HALF_FLOAT;
			const start = index * LIGHT_STRIDE * 4;
			const {
				color,
				decay,
				position,
				distance,
				direction,
				coneCos,
				penumbraCos
			} = lightInfo;

			// pixel 0 - R: lightType, G: penumbraCos, B: -, A: -

			data[start + 0 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(2) : 2;
			data[start + 0 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(penumbraCos) : penumbraCos;

			// pixel 1 - R: color.r, G: color.g, B: color.b, A: decay

			data[start + 1 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(color[0]) : color[0];
			data[start + 1 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(color[1]) : color[1];
			data[start + 1 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(color[2]) : color[2];
			data[start + 1 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(decay) : decay;

			// pixel 2 - R: position.x, G: position.y, B: position.z, A: distance

			data[start + 2 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(position[0]) : position[0];
			data[start + 2 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(position[1]) : position[1];
			data[start + 2 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(position[2]) : position[2];
			data[start + 2 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(distance) : distance;

			// pixel 3 - R: direction.x, G: direction.y, B: direction.z, A: coneCos

			data[start + 3 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(direction[0]) : direction[0];
			data[start + 3 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(direction[1]) : direction[1];
			data[start + 3 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(direction[2]) : direction[2];
			data[start + 3 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(coneCos) : coneCos;
		}
	}
	const LIGHT_STRIDE = 4;
	const _lightSphere = new Sphere();
	const _cellsRange = new Box3();
	const _vec3_1 = new Vector3();
	function getPointLightBoundingSphere(light, sphere) {
		sphere.center.fromArray(light.position);
		sphere.radius = light.distance;
	}
	function getSpotLightBoundingSphere(light, sphere) {
		if (light.coneCos < 0.70710678118) {
			// obtuse angle
			_vec3_1.fromArray(light.direction).multiplyScalar(light.distance * light.coneCos);
			sphere.center.fromArray(light.position).add(_vec3_1);
			sphere.radius = light.distance * Math.sqrt(1 - light.coneCos * light.coneCos);
		} else {
			_vec3_1.fromArray(light.direction).multiplyScalar(light.distance / (light.coneCos * 2));
			sphere.center.fromArray(light.position).add(_vec3_1);
			sphere.radius = light.distance / (light.coneCos * 2);
		}
	}
	function lightsTextureSize(maxLights) {
		return Math.max(MathUtils.nextPowerOfTwo(Math.ceil(Math.sqrt(maxLights * LIGHT_STRIDE))), LIGHT_STRIDE);
	}
	function _isPerspectiveMatrix(m) {
		return m.elements[11] === -1;
	}
	function getCellsRange(lightSphere, cellsTable, cellsTransform, cellsRange) {
		const {
			center,
			radius
		} = lightSphere;
		const {
			clips,
			factors,
			perspective
		} = cellsTransform;
		let zMin = center.z - radius;
		const zMax = center.z + radius;
		if (zMin > clips[1] || zMax < clips[0]) {
			return false;
		}
		zMin = Math.max(zMin, clips[0]);
		const zStart = Math.floor(Math.log(zMin) * factors[0] + factors[1]);
		const zEnd = Math.min(Math.floor(Math.log(zMax) * factors[0] + factors[1]), cellsTable[2] - 1);
		const halfFrustumHeight = (perspective ? Math.abs(center.z) : -1) * factors[2];
		const invH = 1 / (2 * halfFrustumHeight);
		const yMin = (center.y - radius) * invH + 0.5;
		const yMax = (center.y + radius) * invH + 0.5;
		if (yMin > 1 || yMax < 0) {
			return false;
		}
		const yStart = Math.max(Math.floor(yMin * cellsTable[1]), 0);
		const yEnd = Math.min(Math.floor(yMax * cellsTable[1]), cellsTable[1] - 1);
		const halfFrustumWidth = halfFrustumHeight * factors[3];
		const invW = 1 / (2 * halfFrustumWidth);
		const xMin = (center.x - radius) * invW + 0.5;
		const xMax = (center.x + radius) * invW + 0.5;
		if (xMin > 1 || xMax < 0) {
			return false;
		}
		const xStart = Math.max(Math.floor(xMin * cellsTable[0]), 0);
		const xEnd = Math.min(Math.floor(xMax * cellsTable[0]), cellsTable[0] - 1);
		cellsRange.min.set(xStart, yStart, zStart);
		cellsRange.max.set(xEnd, yEnd, zEnd);
		return true;
	}

	class WebGLLights extends PropertyMap {
		constructor(prefix, capabilities, textures) {
			super(prefix);
			const that = this;
			function onLightingGroupDispose(event) {
				const lightingGroup = event.target;
				const lightingProperties = that.get(lightingGroup);
				lightingGroup.removeEventListener('dispose', onLightingGroupDispose);
				if (lightingProperties.clustered) {
					lightingProperties.clustered.dispose();
				}
				that.delete(lightingGroup);
			}
			this._onLightingGroupDispose = onLightingGroupDispose;
			this._capabilities = capabilities;
			this._textures = textures;
		}
		setLightingGroup(lightingGroup, passInfo, options, cameraData) {
			const lightingProperties = this.get(lightingGroup);

			// Skip early if this lighting group has been set in this pass.
			if (lightingProperties.pass === passInfo.count) {
				return lightingProperties;
			}
			lightingProperties.pass = passInfo.count;
			if (lightingProperties.state === undefined) {
				lightingGroup.addEventListener('dispose', this._onLightingGroupDispose);
				lightingProperties.state = new LightingState();
				lightingProperties.uploadVersion = 0;
			}

			// Skip early if this lighting group is empty
			if (lightingGroup.totalNum === 0) {
				return lightingProperties;
			}
			const clusteredOptions = options.clustered;
			const clusteredEnabled = clusteredOptions.enabled;
			let clusteredLightsChanged = false;
			if (lightingProperties.lightingVersion !== lightingGroup.version || lightingProperties.clusteredEnabled !== clusteredEnabled) {
				lightingProperties.state.update(lightingGroup, clusteredEnabled);
				lightingProperties.uploadVersion++;
				const hasClusteredLights = lightingProperties.state._factor[10] > 0;
				lightingProperties.lightingVersion = lightingGroup.version;
				lightingProperties.clusteredEnabled = clusteredEnabled;
				lightingProperties.hasClusteredLights = hasClusteredLights;
				clusteredLightsChanged = hasClusteredLights;

				// prepare clustered lighting

				if (hasClusteredLights && !lightingProperties.clustered) {
					lightingProperties.clustered = new WebGLClusteredLighting(clusteredOptions);
					lightingProperties.clusteredOptionVersion = clusteredOptions.version;
				} else if (!clusteredEnabled && lightingProperties.clustered) {
					lightingProperties.clustered.dispose();
					delete lightingProperties.clustered;
				}
			}
			if (lightingProperties.hasClusteredLights) {
				if (lightingProperties.clusteredOptionVersion !== clusteredOptions.version) {
					lightingProperties.clustered.setOptions(clusteredOptions);
					lightingProperties.clusteredOptionVersion = clusteredOptions.version;
					clusteredLightsChanged = true;
				}
				let cameraChanged = false;
				if (lightingProperties.cameraId !== cameraData.id || lightingProperties.cameraVersion !== cameraData.version) {
					lightingProperties.cameraId = cameraData.id;
					lightingProperties.cameraVersion = cameraData.version;
					cameraChanged = true;
				}
				if (clusteredLightsChanged || cameraChanged) {
					lightingProperties.clustered.update(lightingGroup, cameraData, clusteredLightsChanged);
				}
			}
			return lightingProperties;
		}
		uploadUniforms(program, lightingGroup, disableShadowSampler) {
			const lightingGroupProperties = this.get(lightingGroup);
			let refresh = false;
			if (program.lightId !== lightingGroup.id || program.lightVersion !== lightingGroupProperties.uploadVersion) {
				refresh = true;
				program.lightId = lightingGroup.id;
				program.lightVersion = lightingGroupProperties.uploadVersion;
			}
			const uniforms = program.getUniforms();
			const capabilities = this._capabilities;
			const textures = this._textures;
			const lightingFactor = lightingGroupProperties.state._factor;
			if (lightingFactor[0] && refresh) {
				uniforms.set('u_AmbientLightColor', lightingGroup.ambient);
			}
			if (lightingFactor[1] && refresh) {
				uniforms.set('u_SphericalHarmonicsLightData', lightingGroup.sh);
			}
			if (lightingFactor[2] > 0 && refresh) {
				uniforms.set('u_Hemi', lightingGroup.hemisphere);
			}
			if (lightingFactor[3] > 0) {
				if (refresh) uniforms.set('u_Directional', lightingGroup.directional);
				if (lightingFactor[7] > 0) {
					if (refresh) uniforms.set('u_DirectionalShadow', lightingGroup.directionalShadow);
					if (uniforms.has('directionalShadowMap')) {
						if (capabilities.version >= 2 && !disableShadowSampler) {
							uniforms.set('directionalShadowMap', lightingGroup.directionalShadowDepthMap, textures);
						} else {
							uniforms.set('directionalShadowMap', lightingGroup.directionalShadowMap, textures);
						}
						uniforms.set('directionalShadowMatrix', lightingGroup.directionalShadowMatrix);
					}
					if (uniforms.has('directionalDepthMap')) {
						uniforms.set('directionalDepthMap', lightingGroup.directionalShadowMap, textures);
					}
				}
			}
			if (lightingFactor[4] > 0) {
				if (refresh) uniforms.set('u_Point', lightingGroup.point);
				if (lightingFactor[8] > 0) {
					if (refresh) uniforms.set('u_PointShadow', lightingGroup.pointShadow);
					if (uniforms.has('pointShadowMap')) {
						uniforms.set('pointShadowMap', lightingGroup.pointShadowMap, textures);
						uniforms.set('pointShadowMatrix', lightingGroup.pointShadowMatrix);
					}
				}
			}
			if (lightingFactor[5] > 0) {
				if (refresh) uniforms.set('u_Spot', lightingGroup.spot);
				if (lightingFactor[9] > 0) {
					if (refresh) uniforms.set('u_SpotShadow', lightingGroup.spotShadow);
					if (uniforms.has('spotShadowMap')) {
						if (capabilities.version >= 2 && !disableShadowSampler) {
							uniforms.set('spotShadowMap', lightingGroup.spotShadowDepthMap, textures);
						} else {
							uniforms.set('spotShadowMap', lightingGroup.spotShadowMap, textures);
						}
						uniforms.set('spotShadowMatrix', lightingGroup.spotShadowMatrix);
					}
					if (uniforms.has('spotDepthMap')) {
						uniforms.set('spotDepthMap', lightingGroup.spotShadowMap, textures);
					}
				}
			}
			if (lightingFactor[6] > 0) {
				if (refresh) uniforms.set('u_RectArea', lightingGroup.rectArea);
				if (lightingGroup.LTC1 && lightingGroup.LTC2) {
					uniforms.set('ltc_1', lightingGroup.LTC1, textures);
					uniforms.set('ltc_2', lightingGroup.LTC2, textures);
				} else {
					console.warn('WebGLRenderer: RectAreaLight.LTC1 and LTC2 need to be set before use.');
				}
			}
			if (lightingFactor[10] > 0) {
				const clusteredLighting = lightingGroupProperties.clustered;
				const cellsInfo = clusteredLighting.cellsTexture.cellsInfo;
				uniforms.set('maxLightsPerCell', cellsInfo.maxLightsPerCell);
				uniforms.set('cells', cellsInfo.table);
				uniforms.set('cellsDotData', cellsInfo.dotData);
				uniforms.set('cellsTextureSize', cellsInfo.textureSize);
				uniforms.set('cellsTransformFactors', clusteredLighting.cellsTransform.factors);
				uniforms.set('lightsTexture', clusteredLighting.lightsTexture, textures);
				uniforms.set('cellsTexture', clusteredLighting.cellsTexture, textures);
			}
		}
	}
	class LightingState {
		constructor() {
			this._factor = new Uint16Array(11);
			this._totalNum = 0;
			this._shadowsNum = 0;
		}
		update(lightingGroup, clusteredEnabled) {
			const selfFactor = this._factor;
			selfFactor[0] = lightingGroup.useAmbient ? 1 : 0;
			selfFactor[1] = lightingGroup.useSphericalHarmonics ? 1 : 0;
			selfFactor[2] = lightingGroup.hemisNum;
			selfFactor[3] = lightingGroup.directsNum;
			selfFactor[4] = lightingGroup.pointsNum;
			selfFactor[5] = lightingGroup.spotsNum;
			selfFactor[6] = lightingGroup.rectAreaNum;
			selfFactor[7] = lightingGroup.directShadowNum;
			selfFactor[8] = lightingGroup.pointShadowNum;
			selfFactor[9] = lightingGroup.spotShadowNum;
			selfFactor[10] = 0;
			this._totalNum = lightingGroup.totalNum;
			this._shadowsNum = lightingGroup.shadowsNum;
			if (clusteredEnabled) {
				const clusteredPointsNum = selfFactor[4] - selfFactor[8];
				const clusteredSpotsNum = selfFactor[5] - selfFactor[9];
				selfFactor[4] = selfFactor[8];
				selfFactor[5] = selfFactor[9];
				selfFactor[10] = clusteredPointsNum + clusteredSpotsNum > 0 ? 1 : 0;
			}
		}
		compare(factor) {
			if (!factor) {
				return false;
			}
			const selfFactor = this._factor;
			for (let i = 0, l = factor.length; i < l; i++) {
				if (selfFactor[i] !== factor[i]) {
					return false;
				}
			}
			return true;
		}
		copyTo(factor) {
			const selfFactor = this._factor;
			if (!factor) {
				factor = new selfFactor.constructor(this._factor.length);
			}
			factor.set(selfFactor);
			return factor;
		}
		hasLight() {
			return this._totalNum > 0;
		}
		hasShadow() {
			return this._shadowsNum > 0;
		}
		setProgramProps(props, receiveShadow) {
			const selfFactor = this._factor;
			props.useAmbientLight = selfFactor[0];
			props.useSphericalHarmonicsLight = selfFactor[1];
			props.hemisphereLightNum = selfFactor[2];
			props.directLightNum = selfFactor[3];
			props.pointLightNum = selfFactor[4];
			props.spotLightNum = selfFactor[5];
			props.rectAreaLightNum = selfFactor[6];
			props.directShadowNum = receiveShadow ? selfFactor[7] : 0;
			props.pointShadowNum = receiveShadow ? selfFactor[8] : 0;
			props.spotShadowNum = receiveShadow ? selfFactor[9] : 0;
			props.useClusteredLights = selfFactor[10];
			props.useShadow = this._shadowsNum > 0 && receiveShadow;
		}
	}

	const helpVector4 = new Vector4();
	const helpMatrix4 = new Matrix4();
	const influencesList = new WeakMap();
	const morphInfluences = new Float32Array(8);
	const _envData = {
		map: null,
		diffuse: 1,
		specular: 1
	};
	let _clippingPlanesData = new Float32Array([]);
	function defaultGetGeometry(renderable) {
		return renderable.geometry;
	}
	function defaultGetMaterial(renderable) {
		return renderable.material;
	}
	function defaultIfRender(renderable) {
		return true;
	}
	const _emptyLightingGroup = new LightingGroup();
	function getLightingGroup(lighting, material) {
		if (!material.acceptLight) {
			return _emptyLightingGroup;
		}
		const lightingGroup = lighting.getGroup(material.lightingGroup);
		if (lightingGroup && lightingGroup.totalNum > 0) {
			return lightingGroup;
		}
		return _emptyLightingGroup;
	}

	/**
	 * The WebGL renderer.
	 * @extends ThinRenderer
	 */
	class WebGLRenderer extends ThinRenderer {
		/**
		 * Create a WebGL renderer.
		 * @param {WebGLRenderingContext} context - The Rendering Context privided by canvas.
		 */
		constructor(context) {
			super(context);

			/**
			 * An object containing details about the capabilities of the current RenderingContext.
			 * @type {WebGLCapabilities}
			 */
			this.capabilities = {};
			this._textures = null;
			this._renderBuffers = null;
			this._renderTargets = null;
			this._buffers = null;
			this._geometries = null;
			this._lights = null;
			this._programs = null;
			this._materials = null;
			this._state = null;
			this._vertexArrayBindings = null;
			this._queries = null;
			this.init();

			// Cache current material if beginRender is called.
			this._currentMaterial = null;
		}

		/**
		 * Initialize the renderer.
		 * This method will be called automatically by the constructor.
		 * In the case of context lost, you can call this function to restart the renderer.
		 */
		init() {
			const gl = this.context;
			const prefix = `_gl${this.increaseId()}`;
			const capabilities = new WebGLCapabilities(gl);
			const constants = new WebGLConstants(gl, capabilities);
			const state = new WebGLState(gl, capabilities);
			const textures = new WebGLTextures(prefix, gl, state, capabilities, constants);
			const renderBuffers = new WebGLRenderBuffers(prefix, gl, capabilities, constants);
			const renderTargets = new WebGLRenderTargets(prefix, gl, state, capabilities, textures, renderBuffers, constants);
			const buffers = new WebGLBuffers(prefix, gl, capabilities);
			const vertexArrayBindings = new WebGLVertexArrayBindings(prefix, gl, capabilities, buffers);
			const geometries = new WebGLGeometries(prefix, gl, buffers, vertexArrayBindings);
			const lights = new WebGLLights(prefix, capabilities, textures);
			const programs = new WebGLPrograms(gl, state, capabilities);
			const materials = new WebGLMaterials(prefix, programs, vertexArrayBindings);
			const queries = new WebGLQueries(prefix, gl, capabilities);
			this.capabilities = capabilities;
			this._textures = textures;
			this._renderBuffers = renderBuffers;
			this._renderTargets = renderTargets;
			this._buffers = buffers;
			this._geometries = geometries;
			this._lights = lights;
			this._programs = programs;
			this._materials = materials;
			this._state = state;
			this._vertexArrayBindings = vertexArrayBindings;
			this._queries = queries;
		}
		endRender() {
			super.endRender();
			this._currentMaterial = null;

			// Ensure depth buffer writing is enabled so it can be cleared on next render

			const state = this._state;
			state.depthBuffer.setTest(true);
			state.depthBuffer.setMask(true);
			state.colorBuffer.setMask(true);
		}
		clear(color, depth, stencil) {
			const gl = this.context;
			let bits = 0;
			if (color === undefined || color) bits |= gl.COLOR_BUFFER_BIT;
			if (depth === undefined || depth) bits |= gl.DEPTH_BUFFER_BIT;
			if (stencil === undefined || stencil) bits |= gl.STENCIL_BUFFER_BIT;
			if (bits > 0) {
				// Prevent warning when bits is equal to zero
				gl.clear(bits);
			}
		}
		setClearColor(r, g, b, a, premultipliedAlpha) {
			this._state.colorBuffer.setClear(r, g, b, a, premultipliedAlpha);
		}
		getClearColor() {
			return this._state.colorBuffer.getClear();
		}
		setRenderTarget(renderTarget) {
			this._renderTargets.setRenderTarget(renderTarget);
		}
		getRenderTarget() {
			return this._state.currentRenderTarget;
		}
		blitRenderTarget(read, draw, color = true, depth = true, stencil = true) {
			this._renderTargets.blitRenderTarget(read, draw, color, depth, stencil);
		}
		readRenderTargetPixels(x, y, width, height, buffer) {
			if (this.asyncReadPixel) {
				return this._renderTargets.readRenderTargetPixelsAsync(x, y, width, height, buffer);
			} else {
				this._renderTargets.readRenderTargetPixels(x, y, width, height, buffer);
				return Promise.resolve(buffer);
			}
		}
		updateRenderTargetMipmap(renderTarget) {
			this._renderTargets.updateRenderTargetMipmap(renderTarget);
		}
		setTextureExternal(texture, webglTexture) {
			this._textures.setTextureExternal(texture, webglTexture);
		}
		setRenderBufferExternal(renderBuffer, webglRenderbuffer) {
			this._renderBuffers.setRenderBufferExternal(renderBuffer, webglRenderbuffer);
		}
		setBufferExternal(buffer, webglBuffer) {
			this._buffers.setBufferExternal(buffer, webglBuffer);
		}
		resetVertexArrayBindings(force) {
			this._vertexArrayBindings.reset(force);
		}
		resetState() {
			this._state.reset();
		}
		beginQuery(query, target) {
			this._queries.begin(query, target);
		}
		endQuery(query) {
			this._queries.end(query);
		}
		queryCounter(query) {
			this._queries.counter(query);
		}
		isTimerQueryDisjoint(query) {
			return this._queries.isTimerDisjoint(query);
		}
		isQueryResultAvailable(query) {
			return this._queries.isResultAvailable(query);
		}
		getQueryResult(query) {
			return this._queries.getResult(query);
		}
		renderRenderableItem(renderable, renderStates, options) {
			const state = this._state;
			const capabilities = this.capabilities;
			const vertexArrayBindings = this._vertexArrayBindings;
			const textures = this._textures;
			const passInfo = this._passInfo;
			const getGeometry = options.getGeometry || defaultGetGeometry;
			const getMaterial = options.getMaterial || defaultGetMaterial;
			const beforeRender = options.beforeRender;
			const afterRender = options.afterRender;
			const ifRender = options.ifRender || defaultIfRender;
			const renderInfo = options.renderInfo;
			const sceneData = renderStates.scene;
			const cameraData = renderStates.camera;
			const currentRenderTarget = state.currentRenderTarget;
			if (!ifRender(renderable)) {
				return;
			}
			if (!passInfo.enabled) {
				console.warn('WebGLRenderer: beginRender must be called before renderRenderableItem.');
				return;
			}
			const object = renderable.object;
			const material = getMaterial.call(this, renderable);
			const geometry = getGeometry.call(this, renderable);
			const group = renderable.group;
			const fog = material.fog ? sceneData.fog : null;
			const lightingGroup = getLightingGroup(renderStates.lighting, material);
			const lightingState = this._lights.setLightingGroup(lightingGroup, passInfo, this.lightingOptions, cameraData).state;
			const hasLighting = lightingState.hasLight();
			const hasShadow = lightingState.hasShadow() && object.receiveShadow;
			_envData.map = material.envMap !== undefined ? material.envMap || sceneData.environment : null;
			_envData.diffuse = sceneData.envDiffuseIntensity * material.envMapIntensity;
			_envData.specular = sceneData.envSpecularIntensity * material.envMapIntensity;
			let clippingPlanesData = sceneData.clippingPlanesData;
			let numClippingPlanes = sceneData.numClippingPlanes;
			if (material.clippingPlanes && material.clippingPlanes.length > 0) {
				if (_clippingPlanesData.length < material.clippingPlanes.length * 4) {
					_clippingPlanesData = new Float32Array(material.clippingPlanes.length * 4);
				}
				clippingPlanesData = sceneData.setClippingPlanesData(material.clippingPlanes, _clippingPlanesData);
				numClippingPlanes = material.clippingPlanes.length;
			}
			object.onBeforeRender(renderable, material);
			beforeRender && beforeRender.call(this, renderable, material);

			// Check material version

			const materialProperties = this._materials.setMaterial(material);
			if (material.needsUpdate === false) {
				if (materialProperties.currentProgram === undefined) {
					material.needsUpdate = true;
				} else if (materialProperties.fog !== fog) {
					material.needsUpdate = true;
				} else if (materialProperties.envMap !== _envData.map) {
					material.needsUpdate = true;
				} else if (materialProperties.numClippingPlanes !== numClippingPlanes) {
					material.needsUpdate = true;
				} else if (materialProperties.logarithmicDepthBuffer !== sceneData.logarithmicDepthBuffer) {
					material.needsUpdate = true;
				} else if (renderStates.outputEncoding !== materialProperties.outputEncoding || renderStates.gammaFactor !== materialProperties.gammaFactor) {
					material.needsUpdate = true;
				} else if (capabilities.version > 1 && sceneData.disableShadowSampler !== materialProperties.disableShadowSampler) {
					material.needsUpdate = true;
				} else {
					if (hasLighting !== materialProperties.hasLighting) {
						material.needsUpdate = true;
					} else if (hasLighting) {
						if (!lightingState.compare(materialProperties.lightingFactors)) {
							material.needsUpdate = true;
						} else if (hasShadow !== materialProperties.hasShadow) {
							material.needsUpdate = true;
						} else if (hasShadow) {
							material.needsUpdate = materialProperties.shadowType !== object.shadowType;
						}
					}
				}
			}

			// Update program if needed.

			if (material.needsUpdate) {
				this._materials.updateProgram(material, object, lightingState, renderStates, this.shaderCompileOptions);
				materialProperties.fog = fog;
				materialProperties.envMap = _envData.map;
				materialProperties.logarithmicDepthBuffer = sceneData.logarithmicDepthBuffer;
				materialProperties.hasLighting = hasLighting;
				materialProperties.lightingFactors = lightingState.copyTo(materialProperties.lightingFactors);
				materialProperties.hasShadow = hasShadow;
				materialProperties.shadowType = object.shadowType;
				materialProperties.numClippingPlanes = numClippingPlanes;
				materialProperties.outputEncoding = renderStates.outputEncoding;
				materialProperties.gammaFactor = renderStates.gammaFactor;
				materialProperties.disableShadowSampler = sceneData.disableShadowSampler;
				material.needsUpdate = false;
			}
			const program = materialProperties.currentProgram;
			if (options.onlyCompile || !program.isReady(capabilities.parallelShaderCompileExt)) return;
			state.setProgram(program);
			this._geometries.setGeometry(geometry, passInfo);

			// update morph targets
			if (object.morphTargetInfluences) {
				this._updateMorphtargets(object, geometry, program);
			}
			vertexArrayBindings.setup(object, geometry, program);
			let refreshCamera = false;
			if (program.cameraId !== cameraData.id || program.cameraVersion !== cameraData.version) {
				refreshCamera = true;
				program.cameraId = cameraData.id;
				program.cameraVersion = cameraData.version;
			}
			let refreshScene = false;
			if (program.sceneId !== sceneData.id || program.sceneVersion !== sceneData.version) {
				refreshScene = true;
				program.sceneId = sceneData.id;
				program.sceneVersion = sceneData.version;
			}
			let refreshMaterial = true;
			if (!material.forceUpdateUniforms) {
				if (materialProperties.pass !== passInfo.count) {
					materialProperties.pass = passInfo.count;
				} else {
					refreshMaterial = this._currentMaterial !== material;
				}
			}
			this._currentMaterial = material;
			const uniforms = program.getUniforms();

			// upload light uniforms
			if (hasLighting) {
				this._lights.uploadUniforms(program, lightingGroup, sceneData.disableShadowSampler);
			}

			// upload bone matrices
			if (object.isSkinnedMesh) {
				this._uploadSkeleton(uniforms, object, sceneData);
			}

			// upload other uniforms
			for (let n = 0, ll = uniforms.seq.length; n < ll; n++) {
				const uniform = uniforms.seq[n];
				const key = uniform.id;
				const internalGroup = uniform.internalGroup;

				// upload custom uniforms
				if (material.uniforms && material.uniforms[key] !== undefined) {
					uniform.set(material.uniforms[key], textures);
					continue;
				}

				// u_Model: always upload this matrix
				if (internalGroup === 1) {
					let modelMatrix = object.worldMatrix;
					if (sceneData.useAnchorMatrix) {
						modelMatrix = helpMatrix4.copy(modelMatrix).premultiply(sceneData.anchorMatrixInverse);
					}
					uniform.set(modelMatrix.elements);
					continue;
				}

				// uniforms about camera data
				if (internalGroup === 2 && refreshCamera) {
					uniform.internalFun(cameraData);
					continue;
				}

				// uniforms about scene data
				if (internalGroup === 3 && refreshScene) {
					uniform.internalFun(sceneData);
					continue;
				}

				// uniforms about material
				if (internalGroup === 4 && refreshMaterial) {
					uniform.internalFun(material, textures);
					continue;
				}

				// uniforms about environment map
				if (internalGroup === 5) {
					uniform.internalFun(_envData, textures);
					continue;
				}

				// other internal uniforms
				if (key === 'u_PointScale') {
					// TODO: remove this after 0.5.0, use u_RenderTargetSize instead
					const scale = currentRenderTarget.height * 0.5;
					uniform.set(scale);
				} else if (key === 'clippingPlanes') {
					uniform.set(clippingPlanesData);
				} else if (key === 'u_RenderTargetSize') {
					uniform.setValue(currentRenderTarget.width, currentRenderTarget.height);
				}
			}
			const frontFaceCW = object.worldMatrix.determinant() < 0;
			state.setMaterial(material, frontFaceCW);
			const viewport = helpVector4.set(currentRenderTarget.width, currentRenderTarget.height, currentRenderTarget.width, currentRenderTarget.height).multiply(cameraData.rect);
			viewport.z -= viewport.x;
			viewport.w -= viewport.y;
			state.viewport(viewport.round());
			this._draw(geometry, material, group, renderInfo);
			textures.resetTextureUnits();
			afterRender && afterRender.call(this, renderable);
			object.onAfterRender(renderable);
		}
		_uploadSkeleton(uniforms, object, sceneData) {
			if (object.skeleton && object.skeleton.bones.length > 0) {
				const skeleton = object.skeleton;
				const capabilities = this.capabilities;
				if (capabilities.maxVertexTextures > 0 && (!!capabilities.getExtension('OES_texture_float') || capabilities.version >= 2)) {
					if (skeleton.boneTexture === undefined) {
						skeleton.generateBoneTexture(capabilities.version >= 2);
					}
					uniforms.set('boneTexture', skeleton.boneTexture, this._textures);
					uniforms.set('boneTextureSize', skeleton.boneTexture.image.width);
				} else {
					uniforms.set('boneMatrices', skeleton.boneMatrices);
				}
				uniforms.set('bindMatrix', object.bindMatrix.elements);
				helpMatrix4.copy(object.bindMatrixInverse);
				if (sceneData.useAnchorMatrix) {
					helpMatrix4.multiply(sceneData.anchorMatrix); // convert to anchor space
				}
				uniforms.set('bindMatrixInverse', helpMatrix4.elements);
			}
		}
		_updateMorphtargets(object, geometry, program) {
			const objectInfluences = object.morphTargetInfluences;
			if (!influencesList.has(geometry)) {
				influencesList.set(geometry, objectInfluences.slice(0));
			}
			const morphTargets = geometry.morphAttributes.position;
			const morphNormals = geometry.morphAttributes.normal;

			// Remove current morphAttributes

			const influences = influencesList.get(geometry);
			for (let i = 0; i < influences.length; i++) {
				const influence = influences[i];
				if (influence !== 0) {
					if (morphTargets) geometry.removeAttribute('morphTarget' + i);
					if (morphNormals) geometry.removeAttribute('morphNormal' + i);
				}
			}

			// Collect influences

			for (let i = 0; i < objectInfluences.length; i++) {
				influences[i] = objectInfluences[i];
			}
			influences.length = objectInfluences.length;

			// Add morphAttributes

			let count = 0;
			for (let i = 0; i < influences.length; i++) {
				const influence = influences[i];
				if (influence > 0) {
					if (morphTargets) geometry.addAttribute('morphTarget' + count, morphTargets[i]);
					if (morphNormals) geometry.addAttribute('morphNormal' + count, morphNormals[i]);
					morphInfluences[count] = influence;
					count++;
				}
			}
			for (; count < 8; count++) {
				morphInfluences[count] = 0;
			}
			program.getUniforms().set('morphTargetInfluences', morphInfluences);
		}
		_draw(geometry, material, group, renderInfo) {
			const gl = this.context;
			const capabilities = this.capabilities;
			const buffers = this._buffers;
			const instanceCount = geometry.instanceCount;
			const useInstancing = instanceCount >= 0;
			const useGroup = !!group;
			const useMultiDraw = useGroup && group.multiDrawCount !== undefined;
			const useIndexBuffer = geometry.index !== null;
			let drawStart = 0;
			let drawCount = Infinity;
			if (!useMultiDraw) {
				const position = geometry.getAttribute('a_Position');
				if (useIndexBuffer) {
					drawCount = geometry.index.buffer.count;
				} else if (position) {
					drawCount = position.buffer.count;
				}
				if (useGroup) {
					drawStart = Math.max(drawStart, group.start);
					drawCount = Math.min(drawCount, group.count);
				}
				if (drawCount < 0 || drawCount === Infinity) return;
			}
			if (useIndexBuffer) {
				const indexBufferProperties = buffers.get(geometry.index.buffer);
				const bytesPerElement = indexBufferProperties.bytesPerElement;
				const type = indexBufferProperties.type;
				if (type === gl.UNSIGNED_INT) {
					if (capabilities.version < 2 && !capabilities.getExtension('OES_element_index_uint')) {
						console.warn('WebGLRenderer: draw elements type not support UNSIGNED_INT!');
					}
				}
				if (useInstancing) {
					if (instanceCount <= 0) return;
					if (capabilities.version >= 2) {
						gl.drawElementsInstanced(material.drawMode, drawCount, type, drawStart * bytesPerElement, instanceCount);
					} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
						capabilities.getExtension('ANGLE_instanced_arrays').drawElementsInstancedANGLE(material.drawMode, drawCount, type, drawStart * bytesPerElement, instanceCount);
					} else {
						console.warn('WebGLRenderer: using instanced draw but hardware does not support.');
						return;
					}
				} else if (useMultiDraw) {
					if (group.multiDrawCount <= 0) return;
					const extension = capabilities.getExtension('WEBGL_multi_draw');
					if (!extension) {
						console.warn('WebGLRenderer: using multi draw but hardware does not support extension WEBGL_multi_draw.');
						return;
					}
					extension.multiDrawElementsWEBGL(material.drawMode, group.multiDrawCounts, 0, type, group.multiDrawStarts, 0, group.multiDrawCount);
				} else {
					gl.drawElements(material.drawMode, drawCount, type, drawStart * bytesPerElement);
				}
			} else {
				if (useInstancing) {
					if (instanceCount <= 0) return;
					if (capabilities.version >= 2) {
						gl.drawArraysInstanced(material.drawMode, drawStart, drawCount, instanceCount);
					} else if (capabilities.getExtension('ANGLE_instanced_arrays')) {
						capabilities.getExtension('ANGLE_instanced_arrays').drawArraysInstancedANGLE(material.drawMode, drawStart, drawCount, instanceCount);
					} else {
						console.warn('WebGLRenderer: using instanced draw but hardware does not support.');
						return;
					}
				} else if (useMultiDraw) {
					if (group.multiDrawCount <= 0) return;
					const extension = capabilities.getExtension('WEBGL_multi_draw');
					if (!extension) {
						console.warn('WebGLRenderer: using multi draw but hardware does not support extension WEBGL_multi_draw.');
						return;
					}
					extension.multiDrawArraysWEBGL(material.drawMode, group.multiDrawStarts, 0, group.multiDrawCounts, 0, group.multiDrawCount);
				} else {
					gl.drawArrays(material.drawMode, drawStart, drawCount);
				}
			}
			if (renderInfo) {
				if (useMultiDraw) {
					drawCount = 0;
					for (let i = 0; i < group.multiDrawCount; i++) {
						drawCount += group.multiDrawCounts[i];
					}
				}
				renderInfo.update(drawCount, material.drawMode, instanceCount < 0 ? 1 : instanceCount);
			}
		}
	}

	// deprecated since 0.1.2, add warning since 0.3.0
	class CubeGeometry extends BoxGeometry {
		constructor(width, height, depth, widthSegments, heightSegments, depthSegments) {
			super(width, height, depth, widthSegments, heightSegments, depthSegments);
			console.warn('CubeGeometry has been deprecated, use BoxGeometry instead.');
		}
	}

	// deprecated since 0.1.2, add warning since 0.3.0
	class Group extends Object3D {
		constructor() {
			super();
			console.warn('Group has been deprecated, use Object3D instead.');
		}
	}
	Group.prototype.isGroup = true;
	Object.defineProperties(WebGLRenderer.prototype, {
		// deprecated since 0.2.0, add warning since 0.3.0
		gl: {
			configurable: true,
			get: function () {
				console.warn('WebGLRenderer: .gl has been deprecated, use .context instead.');
				return this.context;
			}
		}
	});

	// deprecated since 0.1.6, add warning since 0.3.0
	WebGLRenderer.prototype.render = function (renderable, renderStates, options) {
		console.warn('WebGLRenderer: .render() has been renamed to .renderRenderableItem().');
		this.renderRenderableItem(renderable, renderStates, options);
	};

	// Renderer, as an alias of WebGLRenderer, will exist for a long time.
	// When the compatibility of renderPass is removed, it can be moved to main.js
	class Renderer extends WebGLRenderer {
		// deprecated since 0.2.0, add warning since 0.3.0
		get renderPass() {
			console.warn('Renderer: .renderPass has been deprecated, use WebGLRenderer instead.');
			return this;
		}
	}
	Object.defineProperties(Scene.prototype, {
		// deprecated since 0.2.7, add warning since 0.4.0
		environmentLightIntensity: {
			configurable: true,
			get: function () {
				console.warn('Scene: .environmentLightIntensity has been deprecated, use .envDiffuseIntensity instead.');
				return this.envDiffuseIntensity;
			},
			set: function (value) {
				console.warn('Scene: .environmentLightIntensity has been deprecated, use .envDiffuseIntensity instead.');
				this.envDiffuseIntensity = value;
			}
		},
		// deprecated since 0.4.0
		_lightData: {
			configurable: true,
			get: function () {
				console.warn('Scene: ._lightData has been deprecated since v0.4.0, use .collector.lightingData.getGroup(0) instead.');
				return this.collector.lightingData.getGroup(0);
			}
		},
		// deprecated since 0.4.4
		_sceneData: {
			configurable: true,
			get: function () {
				// console.warn('Scene: ._sceneData has been deprecated since v0.4.4, use .collector.sceneData instead.');
				return this.collector.sceneData;
			}
		},
		// deprecated since 0.4.4
		_lightingData: {
			configurable: true,
			get: function () {
				// console.warn('Scene: ._lightingData has been deprecated since v0.4.4, use .collector.lightingData instead.');
				return this.collector.lightingData;
			}
		}
	});
	Object.defineProperties(RenderStates.prototype, {
		// deprecated since 0.4.0
		lights: {
			configurable: true,
			get: function () {
				console.warn('RenderStates: .lights has been deprecated since v0.4.0, use .lighting.getGroup(0) instead.');
				return this.lighting.getGroup(0);
			}
		}
	});

	// deprecated since 0.2.8

	const generateUUID = MathUtils.generateUUID;
	const isPowerOfTwo = MathUtils.isPowerOfTwo;
	const nearestPowerOfTwo = MathUtils.nearestPowerOfTwo;
	const nextPowerOfTwo = MathUtils.nextPowerOfTwo;

	// deprecated since 0.4.3
	Matrix4.prototype.inverse = function () {
		return this.invert();
	};

	// deprecated since 0.4.3
	Matrix4.prototype.getInverse = function (m) {
		return this.copy(m).invert();
	};

	// deprecated since 0.4.3
	Matrix4.prototype.transform = function (position, scale, quaternion) {
		return this.compose(position, quaternion, scale);
	};

	// deprecated since 0.4.3
	Matrix3.prototype.inverse = function () {
		return this.invert();
	};

	// deprecated since 0.4.3
	Matrix3.prototype.getInverse = function (m) {
		return this.copy(m).invert();
	};

	// deprecated since 0.4.3
	Vector3.prototype.subtract = function (a, target = new Vector3()) {
		return target.set(this.x - a.x, this.y - a.y, this.z - a.z);
	};

	exports.ATTACHMENT = ATTACHMENT;
	exports.AmbientLight = AmbientLight;
	exports.AnimationAction = AnimationAction;
	exports.AnimationMixer = AnimationMixer;
	exports.Attribute = Attribute;
	exports.BLEND_EQUATION = BLEND_EQUATION;
	exports.BLEND_FACTOR = BLEND_FACTOR;
	exports.BLEND_TYPE = BLEND_TYPE;
	exports.BUFFER_USAGE = BUFFER_USAGE;
	exports.BasicMaterial = BasicMaterial;
	exports.Bone = Bone;
	exports.BooleanKeyframeTrack = BooleanKeyframeTrack;
	exports.Box2 = Box2;
	exports.Box3 = Box3;
	exports.BoxGeometry = BoxGeometry;
	exports.Buffer = Buffer;
	exports.COMPARE_FUNC = COMPARE_FUNC;
	exports.CULL_FACE_TYPE = CULL_FACE_TYPE;
	exports.Camera = Camera;
	exports.Color3 = Color3;
	exports.Color4 = Color4;
	exports.ColorKeyframeTrack = ColorKeyframeTrack;
	exports.CubeGeometry = CubeGeometry;
	exports.CubicSplineInterpolant = CubicSplineInterpolant;
	exports.CylinderGeometry = CylinderGeometry;
	exports.DRAW_MODE = DRAW_MODE;
	exports.DRAW_SIDE = DRAW_SIDE;
	exports.DefaultLoadingManager = DefaultLoadingManager;
	exports.DepthMaterial = DepthMaterial;
	exports.DirectionalLight = DirectionalLight;
	exports.DirectionalLightShadow = DirectionalLightShadow;
	exports.DistanceMaterial = DistanceMaterial;
	exports.ENVMAP_COMBINE_TYPE = ENVMAP_COMBINE_TYPE;
	exports.Euler = Euler;
	exports.EventDispatcher = EventDispatcher;
	exports.FileLoader = FileLoader;
	exports.Fog = Fog;
	exports.FogExp2 = FogExp2;
	exports.Frustum = Frustum;
	exports.Geometry = Geometry;
	exports.Group = Group;
	exports.HemisphereLight = HemisphereLight;
	exports.ImageLoader = ImageLoader;
	exports.KeyframeClip = KeyframeClip;
	exports.KeyframeInterpolant = KeyframeInterpolant;
	exports.KeyframeTrack = KeyframeTrack;
	exports.LambertMaterial = LambertMaterial;
	exports.Light = Light;
	exports.LightShadow = LightShadow;
	exports.LineMaterial = LineMaterial;
	exports.LinearInterpolant = LinearInterpolant;
	exports.Loader = Loader;
	exports.LoadingManager = LoadingManager;
	exports.MATERIAL_TYPE = MATERIAL_TYPE;
	exports.Material = Material;
	exports.MathUtils = MathUtils;
	exports.Matrix3 = Matrix3;
	exports.Matrix4 = Matrix4;
	exports.Mesh = Mesh;
	exports.NumberKeyframeTrack = NumberKeyframeTrack;
	exports.OPERATION = OPERATION;
	exports.Object3D = Object3D;
	exports.PBR2Material = PBR2Material;
	exports.PBRMaterial = PBRMaterial;
	exports.PIXEL_FORMAT = PIXEL_FORMAT;
	exports.PIXEL_TYPE = PIXEL_TYPE;
	exports.PhongMaterial = PhongMaterial;
	exports.Plane = Plane;
	exports.PlaneGeometry = PlaneGeometry;
	exports.PointLight = PointLight;
	exports.PointLightShadow = PointLightShadow;
	exports.PointsMaterial = PointsMaterial;
	exports.PropertyBindingMixer = PropertyBindingMixer;
	exports.PropertyMap = PropertyMap;
	exports.QUERY_TYPE = QUERY_TYPE;
	exports.Quaternion = Quaternion;
	exports.QuaternionCubicSplineInterpolant = QuaternionCubicSplineInterpolant;
	exports.QuaternionKeyframeTrack = QuaternionKeyframeTrack;
	exports.QuaternionLinearInterpolant = QuaternionLinearInterpolant;
	exports.Query = Query;
	exports.Ray = Ray;
	exports.Raycaster = Raycaster;
	exports.RectAreaLight = RectAreaLight;
	exports.RenderBuffer = RenderBuffer;
	exports.RenderInfo = RenderInfo;
	exports.RenderQueue = RenderQueue;
	exports.RenderQueueLayer = RenderQueueLayer;
	exports.RenderStates = RenderStates;
	exports.RenderTarget2D = RenderTarget2D;
	exports.RenderTarget2DArray = RenderTarget2DArray;
	exports.RenderTarget3D = RenderTarget3D;
	exports.RenderTargetBack = RenderTargetBack;
	exports.RenderTargetBase = RenderTargetBase;
	exports.RenderTargetCube = RenderTargetCube;
	exports.Renderer = Renderer;
	exports.SHADING_TYPE = SHADING_TYPE;
	exports.SHADOW_TYPE = SHADOW_TYPE;
	exports.Scene = Scene;
	exports.SceneData = SceneData;
	exports.ShaderChunk = ShaderChunk;
	exports.ShaderLib = ShaderLib;
	exports.ShaderMaterial = ShaderMaterial;
	exports.ShaderPostPass = ShaderPostPass;
	exports.ShadowMapPass = ShadowMapPass;
	exports.Skeleton = Skeleton;
	exports.SkinnedMesh = SkinnedMesh;
	exports.Sphere = Sphere;
	exports.SphereGeometry = SphereGeometry;
	exports.Spherical = Spherical;
	exports.SphericalHarmonics3 = SphericalHarmonics3;
	exports.SphericalHarmonicsLight = SphericalHarmonicsLight;
	exports.SpotLight = SpotLight;
	exports.SpotLightShadow = SpotLightShadow;
	exports.StepInterpolant = StepInterpolant;
	exports.StringKeyframeTrack = StringKeyframeTrack;
	exports.TEXEL_ENCODING_TYPE = TEXEL_ENCODING_TYPE;
	exports.TEXTURE_FILTER = TEXTURE_FILTER;
	exports.TEXTURE_WRAP = TEXTURE_WRAP;
	exports.Texture2D = Texture2D;
	exports.Texture2DArray = Texture2DArray;
	exports.Texture3D = Texture3D;
	exports.TextureBase = TextureBase;
	exports.TextureCube = TextureCube;
	exports.ThinRenderer = ThinRenderer;
	exports.TorusKnotGeometry = TorusKnotGeometry;
	exports.TransformUV = TransformUV;
	exports.Triangle = Triangle;
	exports.VERTEX_COLOR = VERTEX_COLOR;
	exports.Vector2 = Vector2;
	exports.Vector3 = Vector3;
	exports.Vector4 = Vector4;
	exports.VectorKeyframeTrack = VectorKeyframeTrack;
	exports.WebGLAttribute = WebGLAttribute;
	exports.WebGLCapabilities = WebGLCapabilities;
	exports.WebGLGeometries = WebGLGeometries;
	exports.WebGLProgram = WebGLProgram;
	exports.WebGLPrograms = WebGLPrograms;
	exports.WebGLQueries = WebGLQueries;
	exports.WebGLRenderBuffers = WebGLRenderBuffers;
	exports.WebGLRenderer = WebGLRenderer;
	exports.WebGLState = WebGLState;
	exports.WebGLTextures = WebGLTextures;
	exports.WebGLUniforms = WebGLUniforms;
	exports.cloneJson = cloneJson;
	exports.cloneUniforms = cloneUniforms;
	exports.generateUUID = generateUUID;
	exports.isPowerOfTwo = isPowerOfTwo;
	exports.nearestPowerOfTwo = nearestPowerOfTwo;
	exports.nextPowerOfTwo = nextPowerOfTwo;

}));
