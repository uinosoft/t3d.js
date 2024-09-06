import { Vector3 } from './Vector3.js';
import { Matrix3 } from './Matrix3.js';

const _vec3_1 = new Vector3();
const _vec3_2 = new Vector3();
const _mat3_1 = new Matrix3();

/**
 * A two dimensional surface that extends infinitely in 3d space,
 * represented in Hessian normal form by a unit length normal vector and a constant.
 * @memberof t3d
 */
class Plane {

	/**
	 * Constructs a new Plane.
	 * @param {t3d.Vector3} [normal=Vector3(1, 0, 0)] - A unit length Vector3 defining the normal of the plane.
	 * @param {Number} [constant=0] - The signed distance from the origin to the plane.
	 */
	constructor(normal = new Vector3(1, 0, 0), constant = 0) {
		this.normal = normal;
		this.constant = constant;
	}

	/**
	 * Solve a system of equations to find the point where the three planes intersect.
	 * @param {t3d.Plane} p1 - The first plane.
	 * @param {t3d.Plane} p2 - The second plane.
	 * @param {t3d.Plane} p3 - The third plane.
	 * @param {t3d.Vector3} target - The result will be copied into this Vector3.
	 */
	static intersectPlanes(p1, p2, p3, target) {
		// Create the matrix using the normals of the planes as rows
		_mat3_1.set(
			p1.normal.x, p1.normal.y, p1.normal.z,
			p2.normal.x, p2.normal.y, p2.normal.z,
			p3.normal.x, p3.normal.y, p3.normal.z
		);

		// Create the vector using the constants of the planes
		target.set(-p1.constant, -p2.constant, -p3.constant);

		// Solve for X by applying the inverse matrix to vector
		target.applyMatrix3(_mat3_1.inverse());

		return target;
	}

	/**
	 * Sets this plane's normal and constant properties by copying the values from the given normal.
	 * @param {t3d.Vector3} normal - a unit length Vector3 defining the normal of the plane.
	 * @param {Number} constant - the signed distance from the origin to the plane. Default is 0.
	 */
	set(normal, constant) {
		this.normal.copy(normal);
		this.constant = constant;

		return this;
	}

	/**
	 * Set the individual components that define the plane.
	 * @param {Number} x - x value of the unit length normal vector.
	 * @param {Number} y - y value of the unit length normal vector.
	 * @param {Number} z - z value of the unit length normal vector.
	 * @param {Number} w - the value of the plane's constant property.
	 * @return {t3d.Plane}
	 */
	setComponents(x, y, z, w) {
		this.normal.set(x, y, z);
		this.constant = w;

		return this;
	}

	/**
	 * Sets the plane's properties as defined by a normal and an arbitrary coplanar point.
	 * @param {t3d.Vector3} normal - a unit length Vector3 defining the normal of the plane.
	 * @param {t3d.Vector3} point - Vector3
	 */
	setFromNormalAndCoplanarPoint(normal, point) {
		this.normal.copy(normal);
		this.constant = -point.dot(this.normal);

		return this;
	}

	/**
	 * Defines the plane based on the 3 provided points.
	 * The winding order is assumed to be counter-clockwise, and determines the direction of the normal.
	 * @param {t3d.Vector3} a - first point on the plane.
	 * @param {t3d.Vector3} b - second point on the plane.
	 * @param {t3d.Vector3} c - third point on the plane.
	 * @return {t3d.Plane}
	 */
	setFromCoplanarPoints(a, b, c) {
		const normal = _vec3_1.subVectors(c, b).cross(_vec3_2.subVectors(a, b)).normalize();
		// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?
		this.setFromNormalAndCoplanarPoint(normal, a);
		return this;
	}

	/**
	 * Normalizes the normal vector, and adjusts the constant value accordingly.
	 * @return {t3d.Plane}
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
	 * @param {t3d.Vector3} point
	 * @return {Number}
	 */
	distanceToPoint(point) {
		return this.normal.dot(point) + this.constant;
	}

	/**
	 * Projects a point onto the plane.
	 * @param {t3d.Vector3} point - the Vector3 to project onto the plane.
	 * @param {t3d.Vector3} [target] - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
	 */
	projectPoint(point, target = new Vector3()) {
		return target.copy(point).addScaledVector(this.normal, -this.distanceToPoint(point));
	}

	/**
	 * Reflects a point through the plane.
	 * @param {t3d.Vector3} point - the Vector3 to reflect through the plane.
	 * @param {t3d.Vector3} [target] - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
	 */
	mirrorPoint(point, target = new Vector3()) {
		const distance = this.distanceToPoint(point);
		return target.copy(point).addScaledVector(this.normal, -2 * distance);
	}

	/**
	 * Returns a Vector3 coplanar to the plane, by calculating the projection of the normal vector at the origin onto the plane.
	 * @param {t3d.Vector3} [target]
	 * @return {t3d.Vector3}
	 */
	coplanarPoint(target = new Vector3()) {
		return target.copy(this.normal).multiplyScalar(-this.constant);
	}

	/**
	 * Returns a new plane with the same normal and constant as this one.
	 * @return {t3d.Plane}
	 */
	clone() {
		return new Plane().copy(this);
	}

	/**
	 * Copies the values of the passed plane's normal and constant properties to this plane.
	 * @param {t3d.Plane} plane
	 * @return {t3d.Plane}
	 */
	copy(plane) {
		this.normal.copy(plane.normal);
		this.constant = plane.constant;
		return this;
	}

	/**
	 * Apply a Matrix4 to the plane. The matrix must be an affine, homogeneous transform.
	 * @param {t3d.Matrix4} matrix - the Matrix4 to apply.
	 * @param {t3d.Matrix3} [optionalNormalMatrix] - (optional) pre-computed normal Matrix3 of the Matrix4 being applied.
	 */
	applyMatrix4(matrix, optionalNormalMatrix) {
		const normalMatrix = optionalNormalMatrix || _mat3_1.setFromMatrix4(matrix).inverse().transpose();

		const referencePoint = this.coplanarPoint(_vec3_1).applyMatrix4(matrix);

		const normal = this.normal.applyMatrix3(normalMatrix).normalize();

		this.constant = -referencePoint.dot(normal);

		return this;
	}

}

export { Plane };