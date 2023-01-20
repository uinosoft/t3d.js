/**
 * MathUtils
 */

import {
	Vector3
} from 't3d';

class MathUtils {

	/**
	 * Generates 2D-Coordinates in a very fast way.
	 *
	 * Based on work by:
	 * @link http://www.openprocessing.org/sketch/15493
	 *
	 * @param center     Center of Hilbert curve.
	 * @param size       Total width of Hilbert curve.
	 * @param iterations Number of subdivisions.
	 * @param v0         Corner index -X, -Z.
	 * @param v1         Corner index -X, +Z.
	 * @param v2         Corner index +X, +Z.
	 * @param v3         Corner index +X, -Z.
	 */
	static hilbert2D(center = new Vector3(0, 0, 0), size = 10, iterations = 1, v0 = 0, v1 = 1, v2 = 2, v3 = 3) {
		const half = size / 2;

		const vec_s = [
			new Vector3(center.x - half, center.y, center.z - half),
			new Vector3(center.x - half, center.y, center.z + half),
			new Vector3(center.x + half, center.y, center.z + half),
			new Vector3(center.x + half, center.y, center.z - half)
		];

		const vec = [
			vec_s[v0],
			vec_s[v1],
			vec_s[v2],
			vec_s[v3]
		];

		// Recurse iterations
		if (0 <= --iterations) {
			const tmp = [];

			Array.prototype.push.apply(tmp, this.hilbert2D(vec[0], half, iterations, v0, v3, v2, v1));
			Array.prototype.push.apply(tmp, this.hilbert2D(vec[1], half, iterations, v0, v1, v2, v3));
			Array.prototype.push.apply(tmp, this.hilbert2D(vec[2], half, iterations, v0, v1, v2, v3));
			Array.prototype.push.apply(tmp, this.hilbert2D(vec[3], half, iterations, v2, v1, v0, v3));

			// Return recursive call
			return tmp;
		}

		// Return complete Hilbert Curve.
		return vec;
	}

	/**
     * Generates 3D-Coordinates in a very fast way.
     *
     * Based on work by:
     * @link http://www.openprocessing.org/visuals/?visualID=15599
     *
     * @param center     Center of Hilbert curve.
     * @param size       Total width of Hilbert curve.
     * @param iterations Number of subdivisions.
     * @param v0         Corner index -X, +Y, -Z.
     * @param v1         Corner index -X, +Y, +Z.
     * @param v2         Corner index -X, -Y, +Z.
     * @param v3         Corner index -X, -Y, -Z.
     * @param v4         Corner index +X, -Y, -Z.
     * @param v5         Corner index +X, -Y, +Z.
     * @param v6         Corner index +X, +Y, +Z.
     * @param v7         Corner index +X, +Y, -Z.
     */
	static hilbert3D(center = new Vector3(0, 0, 0), size = 10, iterations = 1, v0 = 0, v1 = 1, v2 = 2, v3 = 3, v4 = 4, v5 = 5, v6 = 6, v7 = 7) {
		// Default Vars
		const half = size / 2;

		const vec_s = [
			new Vector3(center.x - half, center.y + half, center.z - half),
			new Vector3(center.x - half, center.y + half, center.z + half),
			new Vector3(center.x - half, center.y - half, center.z + half),
			new Vector3(center.x - half, center.y - half, center.z - half),
			new Vector3(center.x + half, center.y - half, center.z - half),
			new Vector3(center.x + half, center.y - half, center.z + half),
			new Vector3(center.x + half, center.y + half, center.z + half),
			new Vector3(center.x + half, center.y + half, center.z - half)
		];

		const vec = [
			vec_s[v0],
			vec_s[v1],
			vec_s[v2],
			vec_s[v3],
			vec_s[v4],
			vec_s[v5],
			vec_s[v6],
			vec_s[v7]
		];

		// Recurse iterations
		if (--iterations >= 0) {
			const tmp = [];

			Array.prototype.push.apply(tmp, this.hilbert3D(vec[0], half, iterations, v0, v3, v4, v7, v6, v5, v2, v1));
			Array.prototype.push.apply(tmp, this.hilbert3D(vec[1], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3));
			Array.prototype.push.apply(tmp, this.hilbert3D(vec[2], half, iterations, v0, v7, v6, v1, v2, v5, v4, v3));
			Array.prototype.push.apply(tmp, this.hilbert3D(vec[3], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5));
			Array.prototype.push.apply(tmp, this.hilbert3D(vec[4], half, iterations, v2, v3, v0, v1, v6, v7, v4, v5));
			Array.prototype.push.apply(tmp, this.hilbert3D(vec[5], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7));
			Array.prototype.push.apply(tmp, this.hilbert3D(vec[6], half, iterations, v4, v3, v2, v5, v6, v1, v0, v7));
			Array.prototype.push.apply(tmp, this.hilbert3D(vec[7], half, iterations, v6, v5, v2, v1, v0, v3, v4, v7));

			// Return recursive call
			return tmp;
		}

		// Return complete Hilbert Curve.
		return vec;
	}

	static quadraticBezier(t, p0, p1, p2) {
		return quadraticBezierP0(t, p0) + quadraticBezierP1(t, p1) +
			quadraticBezierP2(t, p2);
	}

	static cubicBezier(t, p0, p1, p2, p3) {
		return cubicBezierP0(t, p0) + cubicBezierP1(t, p1) + cubicBezierP2(t, p2) +
			cubicBezierP3(t, p3);
	}

}

function quadraticBezierP0(t, p) {
	const k = 1 - t;
	return k * k * p;
}

function quadraticBezierP1(t, p) {
	return 2 * (1 - t) * t * p;
}

function quadraticBezierP2(t, p) {
	return t * t * p;
}

function cubicBezierP0(t, p) {
	const k = 1 - t;
	return k * k * k * p;
}

function cubicBezierP1(t, p) {
	const k = 1 - t;
	return 3 * k * k * t * p;
}

function cubicBezierP2(t, p) {
	return 3 * (1 - t) * t * t * p;
}

function cubicBezierP3(t, p) {
	return t * t * t * p;
}

export { MathUtils };