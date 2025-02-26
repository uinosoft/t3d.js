import { Vector2, Vector3 } from 't3d';
import { LineCurve2 } from './LineCurve2.js';
import { LineCurve3 } from './LineCurve3.js';
import { QuadraticBezierCurve2 } from './QuadraticBezierCurve2.js';
import { QuadraticBezierCurve3 } from './QuadraticBezierCurve3.js';
import { CubicBezierCurve2 } from './CubicBezierCurve2.js';
import { CubicBezierCurve3 } from './CubicBezierCurve3.js';

/**
 * CurvePath holds a series of curves that are connected end to end.
 */
class CurvePath {

	/**
	 * Constructs a new CurvePath.
	 */
	constructor() {
		this.curves = [];

		this.cacheLengths = null;
		this.needsUpdate = true;

		if (new.target === CurvePath) {
			console.error('CurvePath: Abstract classes can not be instantiated.');
		}
	}

	/**
	 * Constructs a smooth curved path from an array of path points using cubic Bezier curves.
	 * Ensures that all input points lie on the curve; inflection points should represent local extrema.
	 * Control points are computed to satisfy these conditions.
	 * @param {Vector2[]|Vector3[]} points - An array of path points.
	 * @param {object} [options={}] - Options object.
	 * @param {number} [options.smooth=0.3] - Smoothness factor; higher values yield a smoother curve.
	 */
	setSmoothCurves(points, options = {}) {
		const smooth = options.smooth || 0;

		const isCurvePath2 = this.isCurvePath2;

		if (points.length < 2) {
			console.warn(`CurvePath${isCurvePath2 ? 2 : 3}.setSmoothCurves: points length less than 2.`);
			return;
		}

		// Fall back to a polyline if smooth is 0.
		if (smooth === 0 || points.length === 2) {
			this.setPolylines(points, options);
			return;
		}

		const curves = this.curves;
		curves.length = 0;

		const CubicBezierCurve = isCurvePath2 ? CubicBezierCurve2 : CubicBezierCurve3;
		const Vector = isCurvePath2 ? Vector2 : Vector3;

		const cp0 = new Vector();
		const cp1 = new Vector();
		const prev = new Vector();
		const next = new Vector();
		const nextCp0 = new Vector();

		const _vec_1 = new Vector();
		const _vec_2 = new Vector();

		for (let i = 0, l = points.length; i < l; i++) {
			const current = points[i];

			if (i === 0) {
				cp0.copy(points[i]);
			} else if (i == l - 1) {
				const bezierCurve = new CubicBezierCurve();
				bezierCurve.v0.copy(points[i - 1]);
				bezierCurve.v1.copy(cp0);
				bezierCurve.v2.copy(current);
				bezierCurve.v3.copy(current);
				curves.push(bezierCurve);
			} else {
				next.copy(points[i + 1]);
				prev.copy(points[i - 1]);

				const lenPrevSeg = _vec_1.subVectors(current, prev).getLength();
				const lenNextSeg = _vec_2.subVectors(next, current).getLength();
				const ratioNextSeg = lenNextSeg / (lenNextSeg + lenPrevSeg);

				_vec_1.subVectors(next, prev);
				cp1.subVectors(current, _vec_2.copy(_vec_1).multiplyScalar(smooth * (1 - ratioNextSeg)));
				nextCp0.addVectors(current, _vec_2.copy(_vec_1).multiplyScalar(smooth * ratioNextSeg));
				nextCp0.min(_vec_1.copy(next).max(current));
				nextCp0.max(_vec_1.copy(next).min(current));

				_vec_1.subVectors(nextCp0, current);
				cp1.subVectors(current, _vec_1.multiplyScalar(lenPrevSeg / lenNextSeg));
				cp1.min(_vec_1.copy(prev).max(current));
				cp1.max(_vec_1.copy(prev).min(current));

				_vec_1.subVectors(current, cp1);
				nextCp0.addVectors(current, _vec_1.multiplyScalar(lenNextSeg / lenPrevSeg));

				const bezierCurve = new CubicBezierCurve();
				bezierCurve.v0.copy(prev);
				bezierCurve.v1.copy(cp0);
				bezierCurve.v2.copy(cp1);
				bezierCurve.v3.copy(current);
				curves.push(bezierCurve);

				cp0.copy(nextCp0);
			}
		}
	}

	/**
	 * Constructs a smooth curved path from an array of points using Quadratic Bezier curves and straight lines.
	 * At right-angle turns, it applies quadratic Bezier curves with inflection points serving as control points.
	 * @param {Vector2[]|Vector3[]} points - An array of path points.
	 * @param {object} [options={}] - Options.
	 * @param {number} [options.bevelRadius=0] - The bevel radius.
	 * @param {boolean} [options.close=false] - Whether to automatically close the path.
	 */
	setBeveledCurves(points, options = {}) {
		const bevelRadius = options.bevelRadius || 0;
		const close = options.close || false;

		const isCurvePath2 = this.isCurvePath2;

		if (points.length < 2) {
			console.warn(`CurvePath${isCurvePath2 ? 2 : 3}.setBeveledCurves: points length less than 2.`);
			return;
		}

		// Fall back to a polyline if bevelRadius is 0.
		if (bevelRadius === 0 || points.length === 2) {
			this.setPolylines(points, options);
			return;
		}

		const lastIndex = points.length - 1;
		// If closing is needed and first and last points are different, add a segment connecting last to first.
		const segments = close && !points[0].equals(points[lastIndex]) ? points.length : lastIndex;

		const curves = this.curves;
		curves.length = 0;

		const LineCurve = isCurvePath2 ? LineCurve2 : LineCurve3;
		const QuadraticBezierCurve = isCurvePath2 ? QuadraticBezierCurve2 : QuadraticBezierCurve3;
		const Vector = isCurvePath2 ? Vector2 : Vector3;

		const p0 = new Vector().copy(points[0]);
		const _vec_1 = new Vector();
		const _vec_2 = new Vector();

		for (let i = 0; i < segments; i++) {
			const p1 = points[(i + 1) % (lastIndex + 1)];
			const p2 = points[(i + 2) % (lastIndex + 1)];

			// The last open segment is a straight line.
			if (i === (segments - 1) && !close) {
				const lineCurve = new LineCurve();
				lineCurve.v1.copy(p0);
				lineCurve.v2.copy(p1);
				curves.push(lineCurve);

				p0.copy(p1);

				break;
			}

			const lastDir = _vec_1.subVectors(p1, p0);
			const nextDir = _vec_2.subVectors(p2, p1);

			const lastDirLength = lastDir.getLength();
			const nextDirLength = nextDir.getLength();

			const v0Dist = Math.min((i === 0 ? lastDirLength / 2 : lastDirLength) * 0.999999, bevelRadius); // fix
			const v2Dist = Math.min(nextDirLength / 2 * 0.999999, bevelRadius);

			lastDir.normalize();
			nextDir.normalize();

			const lineCurve = new LineCurve();
			lineCurve.v1.copy(p0);
			lineCurve.v2.copy(p1).sub(lastDir.multiplyScalar(v0Dist));
			curves.push(lineCurve);

			const bezierCurve = new QuadraticBezierCurve();
			bezierCurve.v0.copy(lineCurve.v2);
			bezierCurve.v1.copy(p1);
			bezierCurve.v2.copy(p1).add(nextDir.multiplyScalar(v2Dist));
			curves.push(bezierCurve);

			p0.copy(bezierCurve.v2);
		}

		// If closing is needed, fix the first point to the last.
		if (close) curves[0].v1.copy(p0);
	}

	/**
	 * Constructs a polyline from an array of path points using straight segments.
	 * This method creates a continuous series of line segments and optionally closes the path.
	 * @param {Vector2[]|Vector3[]} points - An array of path points.
	 * @param {object} [options={}] - Options.
	 * @param {boolean} [options.close=false] - Whether to automatically close the path.
	 */
	setPolylines(points, options = {}) {
		const close = options.close === true;

		const isCurvePath2 = this.isCurvePath2;

		if (points.length < 2) {
			console.warn(`CurvePath${isCurvePath2 ? 2 : 3}.setPolylines: points length less than 2.`);
			return;
		}

		const lastIndex = points.length - 1;
		// If closing is needed and first and last points are different, add a segment connecting last to first.
		const segments = close && !points[0].equals(points[lastIndex]) ? points.length : lastIndex;

		const curves = this.curves;
		curves.length = 0;

		const LineCurve = isCurvePath2 ? LineCurve2 : LineCurve3;

		for (let i = 0; i < segments; i++) {
			const lineCurve = new LineCurve();
			lineCurve.v1.copy(points[i]);
			lineCurve.v2.copy(i === lastIndex ? points[0] : points[i + 1]);
			curves.push(lineCurve);
		}
	}

	/**
	 * Returns an array of points representing a sequence of curves.
	 * The division parameter defines the number of pieces each curve is divided into.
	 * However, for optimization and quality purposes, the actual sampling resolution for each curve depends on its type.
	 * For example, for a LineCurve, the returned number of points is always just 2.
	 * @param {number} [divisions=12] - Number of pieces to divide the curve into.
	 * @returns {Vector2[]|Vector3[]} - An array of points representing the curve.
	 */
	getPoints(divisions = 12) {
		const points = [];

		for (let i = 0, curves = this.curves; i < curves.length; i++) {
			const curve = curves[i];
			const resolution = (curve.isLineCurve2 || curve.isLineCurve3) ? 1 : divisions;

			const pts = curve.getPoints(resolution);

			const isLast = i === (curves.length - 1);
			for (let j = 0, l = isLast ? pts.length : pts.length - 1; j < l; j++) {
				const point = pts[j];
				points.push(point);
			}
		}

		return points;
	}

	/**
	 * This method returns a point for the given interpolation factor.
	 * @param {number} t - A interpolation factor representing a position on the curve. Must be in the range [0,1].
	 * @param {Vector2|Vector3} [optionalTarget] - An optional target point.
	 * @returns {Vector2|Vector3} - The resulting point.
	 */
	getPoint(t, optionalTarget) {
		const d = t * this.getLength();
		const curveLengths = this.getLengths();
		let i = 0;

		while (i < curveLengths.length) {
			if (curveLengths[i] >= d) {
				const diff = curveLengths[i] - d;
				const curve = this.curves[i];

				const segmentLength = curve.getLength();
				const u = segmentLength === 0 ? 0 : 1 - diff / segmentLength;

				return curve.getPointAt(u, optionalTarget);
			}

			i++;
		}

		return this.curves[this.curves.length - 1].getPointAt(1, optionalTarget);
	}

	/**
	 * Return total curve path length.
	 * @returns {number} The total length.
	 */
	getLength() {
		const lengths = this.getLengths();
		return lengths[lengths.length - 1];
	}

	/**
	 * Returns list of cumulative curve lengths of the defined curves.
	 * @returns {number[]} The curve lengths.
	 */
	getLengths() {
		if (this.cacheLengths && this.cacheLengths.length === this.curves.length && !this.needsUpdate) {
			return this.cacheLengths;
		}

		this.needsUpdate = false;

		const lengths = [];
		let sums = 0;

		for (let i = 0, l = this.curves.length; i < l; i++) {
			sums += this.curves[i].getLength();
			lengths.push(sums);
		}

		this.cacheLengths = lengths;

		return lengths;
	}

	/**
	 * Updates the cumulative curve lengths of the defined curves.
	 */
	updateArcLengths() {
		this.needsUpdate = true;
		this.cacheLengths = null;
		this.getLengths();
	}

}

export { CurvePath };