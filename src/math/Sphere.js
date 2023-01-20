import { Vector3 } from './Vector3.js';
import { Box3 } from './Box3.js';

const _box3_1 = new Box3();
const _vec3_1 = new Vector3();

/**
 * A sphere defined by a center and radius.
 * @memberof t3d
 */
class Sphere {

	/**
	 * @param {t3d.Vector3} [center=Vector3(0, 0, 0)] - center of the sphere.
	 * @param {Number} [radius=-1] - radius of the sphere.
	 */
	constructor(center = new Vector3(), radius = -1) {
		this.center = center;
		this.radius = radius;
	}

	/**
	 * Sets the center and radius properties of this sphere.
	 * @param {t3d.Vector3} center - center of the sphere.
	 * @param {Number} radius - radius of the sphere.
	 * @return {t3d.Sphere}
	 */
	set(center, radius) {
		this.center.copy(center);
		this.radius = radius;

		return this;
	}

	/**
	 * Computes the minimum bounding sphere for an array of points.
	 * @param {Number[]} array - an Array of Vector3 positions.
	 * @param {Number} [gap=3] - array gap.
	 * @param {Number} [offset=0] - array offset.
	 * @return {t3d.Sphere}
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
	 * @param {t3d.Matrix4} matrix - the Matrix4 to apply
	 * @return {t3d.Matrix4}
	 */
	applyMatrix4(matrix) {
		this.center.applyMatrix4(matrix);
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;
	}

	/**
	 * Returns aMinimum Bounding Box for the sphere.
	 * @param {t3d.Box3} target — the result will be copied into this Box3.
	 * @return {t3d.Box3}
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
	 * @return {Boolean}
	 */
	isEmpty() {
		return this.radius < 0;
	}

	/**
	 * Makes the sphere empty by setting center to (0, 0, 0) and radius to -1.
	 * @return {t3d.Sphere}
	 */
	makeEmpty() {
		this.center.set(0, 0, 0);
		this.radius = -1;

		return this;
	}

	/**
	 * Expands the boundaries of this sphere to include point.
	 * @param {t3d.Vector3} point - The vector3 that should be included in the sphere.
	 * @return {t3d.Sphere}
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
	 * @return {t3d.Sphere}
	 */
	clone() {
		return new Sphere().copy(this);
	}

	/**
	 * Copies the values of the passed sphere's center and radius properties to this sphere.
	 * @param {t3d.Sphere} sphere
	 * @return {t3d.Sphere}
	 */
	copy(sphere) {
		this.center.copy(sphere.center);
		this.radius = sphere.radius;

		return this;
	}

}

export { Sphere };