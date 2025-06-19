import { MathUtils } from './MathUtils.js';

/**
 * The vector 3 class.
 */
class Vector3 {

	/**
	 * @param {number} [x=0] - the x value of this vector. Default is 0.
	 * @param {number} [y=0] - the y value of this vector. Default is 0.
	 * @param {number} [z=0] - the z value of this vector. Default is 0.
	 */
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	/**
	 * Sets this vector to be the vector linearly interpolated between v1 and v2
	 * where ratio is the percent distance along the line connecting the two vectors
	 * - ratio = 0 will be v1, and ratio = 1 will be v2.
	 * @param {Vector3} v1
	 * @param {Vector3} v2
	 * @param {number} ratio
	 * @returns {Vector3}
	 */
	lerpVectors(v1, v2, ratio) {
		return this.subVectors(v2, v1).multiplyScalar(ratio).add(v1);
	}

	/**
	 * Linearly interpolate between this vector and v,
	 * where alpha is the percent distance along the line
	 * - alpha = 0 will be this vector, and alpha = 1 will be v.
	 * @param {Vector3} v
	 * @param {number} alpha
	 * @returns {Vector3}
	 */
	lerp(v, alpha) {
		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		this.z += (v.z - this.z) * alpha;

		return this;
	}

	/**
	 * Sets the x, y and z components of this vector.
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @returns {Vector3}
	 */
	set(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	}

	/**
	 * Set the x, y and z values of this vector both equal to scalar.
	 * @param {number} scalar
	 * @returns {Vector3}
	 */
	setScalar(scalar) {
		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;
	}

	/**
	 * If this vector's x, y or z value is greater than v's x, y or z value, replace that value with the corresponding min value.
	 * @param {Vector3} v
	 * @returns {Vector3}
	 */
	min(v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		this.z = Math.min(this.z, v.z);

		return this;
	}

	/**
	 * If this vector's x, y or z value is less than v's x, y or z value, replace that value with the corresponding max value.
	 * @param {Vector3} v
	 * @returns {Vector3}
	 */
	max(v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		this.z = Math.max(this.z, v.z);

		return this;
	}

	/**
	 * Computes the Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
	 * @returns {number}
	 */
	getLength() {
		return Math.sqrt(this.getLengthSquared());
	}

	/**
	 * Computes the square of the Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
	 * If you are comparing the lengths of vectors, you should compare the length squared instead as it is slightly
	 * more efficient to calculate.
	 * @returns {number}
	 */
	getLengthSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	/**
	 * Convert this vector to a unit vector - that is, sets it equal to a vector with the same direction as this one, but length 1.
	 * @param {number} [thickness=1]
	 * @returns {Vector3}
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
	 * Subtracts a from this vector.
	 * @param {Vector3} a
	 * @param {Vector3} [target]
	 * @returns {Vector3}
	 */
	subtract(a, target = new Vector3()) {
		return target.set(this.x - a.x, this.y - a.y, this.z - a.z);
	}

	/**
	 * Multiplies this vector by v.
	 * @param {Vector3} v
	 * @returns {Vector3}
	 */
	multiply(v) {
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;
	}

	/**
	 * Sets this vector to cross product of a and b.
	 * @param {Vector3} a
	 * @param {Vector3} b
	 * @returns {Vector3}
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
	 * Sets this vector to cross product of itself and v.
	 * @param {Vector3} v
	 * @returns {Vector3}
	 */
	cross(v) {
		return this.crossVectors(this, v);
	}

	/**
	 * Inverts this vector - i.e. sets x = -x, y = -y and z = -z.
	 * @returns {Vector3}
	 */
	negate() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;

		return this;
	}

	/**
	 * Calculate the dot product of this vector and v.
	 * @param {Vector3} a
	 * @returns {number}
	 */
	dot(a) {
		return this.x * a.x + this.y * a.y + this.z * a.z;
	}

	/**
	 * Applies a Quaternion transform to this vector.
	 * @param {Quaternion} q
	 * @returns {Vector3}
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
	 * Multiplies this vector (with an implicit 1 in the 4th dimension) and m, and divides by perspective.
	 * @param {Matrix4} m
	 * @returns {Vector3}
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
	 * Multiplies this vector by m
	 * @param {Matrix3} m
	 * @returns {Vector3}
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
	 * Transforms the direction of this vector by a matrix (the upper left 3 x 3 subset of a m) and then
	 * @param {Matrix4} m
	 * @returns {Vector3}
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
	 * Sets this vector to the position elements of the transformation matrix m.
	 * @param {Matrix4} m
	 * @returns {Vector3}
	 */
	setFromMatrixPosition(m) {
		const e = m.elements;

		this.x = e[12];
		this.y = e[13];
		this.z = e[14];

		return this;
	}

	/**
	 * Sets this vector to the scale elements of the transformation matrix m.
	 * @param {Matrix4} m
	 * @returns {Vector3}
	 */
	setFromMatrixScale(m) {
		const sx = this.setFromMatrixColumn(m, 0).getLength();
		const sy = this.setFromMatrixColumn(m, 1).getLength();
		const sz = this.setFromMatrixColumn(m, 2).getLength();
		return this.set(sx, sy, sz);
	}

	/**
	 * Sets this vector's x, y and z components from index column of matrix.
	 * @param {Matrix3} m
	 * @param {number} index
	 * @returns {Vector3}
	 */
	setFromMatrixColumn(m, index) {
		return this.fromArray(m.elements, index * 4);
	}

	/**
	 * Sets this vector's x value to be array[ offset + 0 ], y value to be array[ offset + 1 ] and z value to be array[ offset + 2 ].
	 * @param {number[]} array - the source array.
	 * @param {number} [offset=0] - offset into the array.
	 * @param {boolean} [denormalize=false] - if true, denormalize the values, and array should be a typed array.
	 * @returns {Vector3}
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
	 * Returns an array [x, y, z], or copies x, y and z into the provided array.
	 * @param {number[]} [array] - array to store this vector to. If this is not provided a new array will be created.
	 * @param {number} [offset=0] - offset into the array.
	 * @param {boolean} [normalize=false] - if true, normalize the values, and array should be a typed array.
	 * @returns {number[]}
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

	/**
	 * Copies the values of the passed vector3's x, y and z properties to this vector3.
	 * @param {Vector3} v
	 * @returns {Vector3}
	 */
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;
	}

	/**
	 * Sets this vector to a + b.
	 * @param {Vector3} a
	 * @param {Vector3} b
	 * @returns {Vector3}
	 */
	addVectors(a, b) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;
	}

	/**
	 * Adds the scalar value s to this vector's x, y and z values.
	 * @param {number} s
	 * @returns {Vector3}
	 */
	addScalar(s) {
		this.x += s;
		this.y += s;
		this.z += s;

		return this;
	}

	/**
	 * Adds v to this vector.
	 * @param {Vector3} v
	 * @returns {Vector3}
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;
	}

	/**
	 * Adds the multiple of v and s to this vector.
	 * @param {Vector3} v
	 * @param {number} s
	 * @returns {Vector3}
	 */
	addScaledVector(v, s) {
		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;
	}

	/**
	 * Sets this vector to a - b.
	 * @param {Vector3} a
	 * @param {Vector3} b
	 * @returns {Vector3}
	 */
	subVectors(a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;
	}

	/**
	 * Subtracts v from this vector.
	 * @param {Vector3} v
	 * @returns {Vector3}
	 */
	sub(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;
	}

	/**
	 * Multiplies this vector by scalar s.
	 * @param {number} scalar
	 * @returns {Vector3}
	 */
	multiplyScalar(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;
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
	 * Computes the squared distance from this vector to v.
	 * If you are just comparing the distance with another distance,
	 * you should compare the distance squared instead as it is slightly more efficient to calculate.
	 * @param {Vector3} v
	 * @returns {number}
	 */
	distanceToSquared(v) {
		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;
	}

	/**
	 * Computes the distance from this vector to v.
	 * @param {Vector3} v
	 * @returns {number}
	 */
	distanceTo(v) {
		return Math.sqrt(this.distanceToSquared(v));
	}

	/**
	 * Sets this vector from the spherical coordinates s.
	 * @param {Spherical} s
	 * @returns {Vector3}
	 */
	setFromSpherical(s) {
		const sinPhiRadius = Math.sin(s.phi) * s.radius;

		this.x = sinPhiRadius * Math.sin(s.theta);
		this.y = Math.cos(s.phi) * s.radius;
		this.z = sinPhiRadius * Math.cos(s.theta);

		return this;
	}

	/**
	 * Projects this vector from world space into the camera's normalized device coordinate (NDC) space.
	 * @param {Camera} camera
	 * @returns {Vector3}
	 */
	project(camera) {
		return this.applyMatrix4(camera.projectionViewMatrix);
	}

	/**
	 * Projects this vector from the camera's normalized device coordinate (NDC) space into world space.
	 * @param {Camera} camera
	 * @returns {Vector3}
	 */
	unproject(camera) {
		return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.worldMatrix);
	}

	/**
	 * Reflect this vector off of plane orthogonal to normal. Normal is assumed to have unit length.
	 * @param {Vector3} normal - the normal to the reflecting plane
	 * @returns {Vector3}
	 */
	reflect(normal) {
		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length
		return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
	}

	/**
	 * Checks for strict equality of this vector and v.
	 * @param {Vector3} v
	 * @returns {boolean}
	 */
	equals(v) {
		return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
	}

	/**
	 * Returns a new vector3 with the same x, y and z values as this one.
	 * @returns {Vector3}
	 */
	clone() {
		return new Vector3(this.x, this.y, this.z);
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