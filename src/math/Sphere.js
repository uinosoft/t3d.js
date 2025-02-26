import { Vector3 } from './Vector3.js';
import { Box3 } from './Box3.js';

const _box3_1 = new Box3();
const _vec3_1 = new Vector3();

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
			_vec3_1.fromArray(array, i + offset);
			maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vec3_1));
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
		return (point.distanceToSquared(this.center) <= (this.radius * this.radius));
	}

	/**
	 * Returns the closest distance from the boundary of the sphere to the point.
	 * If the sphere contains the point, the distance will be negative.
	 * @param {Vector3} point - The point to calculate the distance to.
	 * @returns {number}
	 */
	distanceToPoint(point) {
		return (point.distanceTo(this.center) - this.radius);
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

		_vec3_1.subVectors(point, this.center);

		const lengthSq = _vec3_1.getLengthSquared();

		if (lengthSq > (this.radius * this.radius)) {
			// calculate the minimal sphere
			const length = Math.sqrt(lengthSq);
			const delta = (length - this.radius) * 0.5;
			this.center.addScaledVector(_vec3_1, delta / length);
			this.radius += delta;
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

export { Sphere };