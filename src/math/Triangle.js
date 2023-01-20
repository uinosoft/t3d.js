import { Vector3 } from './Vector3.js';

const _v0 = new Vector3();
const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();

/**
 * A geometric triangle as defined by three Vector3s representing its three corners.
 * @memberof t3d
 */
class Triangle {

	/**
	 * @param {t3d.Vector3} [a=] - the first corner of the triangle. Default is a Vector3 at (0, 0, 0).
	 * @param {t3d.Vector3} [b=] - the second corner of the triangle. Default is a Vector3 at (0, 0, 0).
	 * @param {t3d.Vector3} [c=] - the final corner of the triangle. Default is a Vector3 at (0, 0, 0).
	 */
	constructor(a = new Vector3(), b = new Vector3(), c = new Vector3()) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	/**
	 * Calculate the normal vector of the triangle.
	 * @param {t3d.Vector3} a
	 * @param {t3d.Vector3} b
	 * @param {t3d.Vector3} c
	 * @param {t3d.Vector3} [optionalTarget]
	 * @return {t3d.Vector3}
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
	 * @param {t3d.Vector3} point - Vector3
	 * @param {t3d.Vector3} a
	 * @param {t3d.Vector3} b
	 * @param {t3d.Vector3} c
	 * @param {t3d.Vector3} [target] - the result will be copied into this Vector3.
	 * @return {t3d.Vector3}
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

		const denom = (dot00 * dot11 - dot01 * dot01);

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
	 * @param {t3d.Vector3} point
	 * @param {t3d.Vector3} a
	 * @param {t3d.Vector3} b
	 * @param {t3d.Vector3} c
	 * @return {t3d.Vector3}
	 */
	static containsPoint(point, a, b, c) {
		this.barycoordFromPoint(point, a, b, c, _v3);
		return (_v3.x >= 0) && (_v3.y >= 0) && ((_v3.x + _v3.y) <= 1);
	}

	/**
	 * Sets the triangle's a, b and c properties to the passed vector3s.
	 * @param {t3d.Vector3} a
	 * @param {t3d.Vector3} b
	 * @param {t3d.Vector3} c
	 * @return {t3d.Triangle}
	 */
	set(a, b, c) {
		this.a.copy(a);
		this.b.copy(b);
		this.c.copy(c);

		return this;
	}

}

export { Triangle };