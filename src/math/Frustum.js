import { Matrix3 } from './Matrix3.js';
import { Plane } from './Plane.js';
import { Vector3 } from './Vector3.js';

const _vec3_1 = new Vector3();
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

			_vec3_1.x = plane.normal.x > 0 ? box.max.x : box.min.x;
			_vec3_1.y = plane.normal.y > 0 ? box.max.y : box.min.y;
			_vec3_1.z = plane.normal.z > 0 ? box.max.z : box.min.z;

			// if both outside plane, no intersection

			if (plane.distanceToPoint(_vec3_1) < 0) {
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

		const normalMatrix = _mat3_1.setFromMatrix4(matrix).inverse().transpose();

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

export { Frustum };