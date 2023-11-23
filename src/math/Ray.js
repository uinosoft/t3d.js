import { Vector3 } from './Vector3.js';

const _vec3_1 = new Vector3();

const _diff = new Vector3();
const _edge1 = new Vector3();
const _edge2 = new Vector3();
const _normal = new Vector3();

/**
 * A ray that emits from an origin in a certain direction.
 * This is used by the Raycaster to assist with raycasting.
 * Raycasting is used for mouse picking (working out what objects in the 3D space the mouse is over) amongst other things.
 * @memberof t3d
 */
class Ray {

	/**
	 * @param {t3d.Vector3} [origin=] - the origin of the Ray.
	 * @param {t3d.Vector3} [direction=] - the direction of the Ray. This must be normalized (with Vector3.normalize) for the methods to operate properly.
	 */
	constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1)) {
		this.origin = origin;
		this.direction = direction;
	}

	/**
	 * Sets this ray's origin and direction properties by copying the values from the given objects.
	 * @param {t3d.Vector3} origin - the origin of the Ray.
	 * @param {t3d.Vector3} direction - the direction of the Ray. This must be normalized (with Vector3.normalize) for the methods to operate properly.
	 * @return {t3d.Ray}
	 */
	set(origin, direction) {
		this.origin.copy(origin);
		this.direction.copy(direction);
		return this;
	}

	/**
	 * Copies the origin and direction properties of ray into this ray.
	 * @param {t3d.Ray} ray
	 * @return {t3d.Ray}
	 */
	copy(ray) {
		this.origin.copy(ray.origin);
		this.direction.copy(ray.direction);

		return this;
	}

	/**
	 * Transform this Ray by the Matrix4.
	 * @param {t3d.Matrix4} matrix4 - the Matrix4 to apply to this Ray.
	 * @return {t3d.Ray}
	 */
	applyMatrix4(matrix4) {
		this.origin.applyMatrix4(matrix4);
		this.direction.transformDirection(matrix4);

		return this;
	}

	/**
	 * Get a Vector3 that is a given distance along this Ray.
	 * @param {Number} t - the distance along the Ray to retrieve a position for.
	 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
	 */
	at(t, optionalTarget = new Vector3()) {
		return optionalTarget.copy(this.direction).multiplyScalar(t).add(this.origin);
	}

	/**
	 * Get the squared distance of the closest approach between the Ray and the Vector3.
	 * @param {t3d.Vector3} point - the Vector3 to compute a distance to.
	 * @return {Number}
	 */
	distanceSqToPoint(point) {
		const directionDistance = _vec3_1.subVectors(point, this.origin).dot(this.direction);

		if (directionDistance < 0) {
			return this.origin.distanceToSquared(point);
		}

		_vec3_1.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);

		return _vec3_1.distanceToSquared(point);
	}

	/**
	 * Get the distance of the closest approach between the Ray and the Plane.
	 * @param {t3d.Plane} plane - the Plane to compute a distance to.
	 * @return {Number}
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
	 * Intersect this Ray with a Plane, returning the intersection point or null if there is no intersection.
	 * @param {t3d.Plane} plane - the Plane to intersect with.
	 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
	 */
	intersectPlane(plane, optionalTarget = new Vector3()) {
		const t = this.distanceToPlane(plane);

		if (t === null) {
			return null;
		}

		return this.at(t, optionalTarget);
	}

	/**
	 * Return true if this Ray intersects with the Plane.
	 * @param {t3d.Plane} plane - the plane to intersect with.
	 * @return {Boolean}
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
	 * Return true if this Ray intersects with the Box3.
	 * @param {t3d.Box3} box - the Box3 to intersect with.
	 * @return {Boolean}
	 */
	intersectsBox(box) {
		return this.intersectBox(box, _vec3_1) !== null;
	}

	/**
	 * Intersect this Ray with a Box3, returning the intersection point or null if there is no intersection.
	 * @param {t3d.Box3} box - the Box3 to intersect with.
	 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
	 */
	intersectBox(box, optionalTarget) {
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

		if ((tmin > tymax) || (tymin > tmax)) return null;

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

		if ((tmin > tzmax) || (tzmin > tmax)) return null;

		if (tzmin > tmin || tmin !== tmin) tmin = tzmin;

		if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

		// return point closest to the ray (positive side)

		if (tmax < 0) return null;

		return this.at(tmin >= 0 ? tmin : tmax, optionalTarget);
	}

	/**
	 * Return true if this Ray intersects with the Sphere.
	 * @param {t3d.Sphere} sphere - the Sphere to intersect with.
	 * @return {Boolean}
	 */
	intersectsSphere(sphere) {
		return this.distanceSqToPoint(sphere.center) <= (sphere.radius * sphere.radius);
	}

	/**
	 * Intersect this Ray with a Sphere, returning the intersection point or null if there is no intersection.
	 * @param {t3d.Sphere} sphere - the Sphere to intersect with.
	 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
	 */
	intersectSphere(sphere, optionalTarget) {
		_vec3_1.subVectors(sphere.center, this.origin);
		const tca = _vec3_1.dot(this.direction);
		const d2 = _vec3_1.dot(_vec3_1) - tca * tca;
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
			return this.at(t1, optionalTarget);
		}

		// else t0 is in front of the ray, so return the first collision point scaled by t0
		return this.at(t0, optionalTarget);
	}

	/**
	 * Intersect this Ray with a triangle, returning the intersection point or null if there is no intersection.
	 * @param {t3d.Vector3} a - The Vector3 point making up the triangle.
	 * @param {t3d.Vector3} b - The Vector3 point making up the triangle.
	 * @param {t3d.Vector3} c - The Vector3 point making up the triangle.
	 * @param {Boolean} backfaceCulling - whether to use backface culling.
	 * @param {t3d.Vector3} [optionalTarget=] - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
	 */
	intersectTriangle(a, b, c, backfaceCulling, optionalTarget) {
		// Compute the offset origin, edges, and normal.

		// from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

		_edge1.subVectors(b, a);
		_edge2.subVectors(c, a);
		_normal.crossVectors(_edge1, _edge2);

		// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
		// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
		//   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
		//   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
		//   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
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
		return this.at(QdN / DdN, optionalTarget);
	}

}

export { Ray };