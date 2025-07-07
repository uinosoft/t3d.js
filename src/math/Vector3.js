import { MathUtils } from './MathUtils.js';

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
		const x = this.x, y = this.y, z = this.z;
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
		const x = this.x, y = this.y, z = this.z;
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
		const x = this.x, y = this.y, z = this.z;
		const qx = q._x, qy = q._y, qz = q._z, qw = q._w;

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

		const x = this.x, y = this.y, z = this.z;
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
	 * Computes the  Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
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
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

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
		return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
	}

	/**
	 * Scales this vector along the given direction vector by the given scale factor.
	 * @param {Vector3} direction - The (normalized) direction vector to scale along.
	 * @param {number} scale - The scale factor.
	 * @returns {Vector3} A reference to this vector.
	 */
	scaleAlong(direction, scale) {
		_vector.copy(direction).multiplyScalar(this.dot(direction));
		return this.sub(_vector).addScaledVector(_vector, scale);
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
		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
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
		return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
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
		let x = array[offset], y = array[offset + 1], z = array[offset + 2];

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
		let x = this.x, y = this.y, z = this.z;

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

	* [Symbol.iterator]() {
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

const _vector = new Vector3();

export { Vector3 };