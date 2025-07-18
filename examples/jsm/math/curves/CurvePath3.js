import { Vector3, Matrix4, MathUtils } from 't3d';
import { CurvePath } from './CurvePath.js';

class CurvePath3 extends CurvePath {

	/**
	 * Computes the frames data of the path.
	 * TODO: move this to CurvePath.
	 * @param {object} [options={}] - Options object.
	 * @param {Vector3|null} [options.up=null] - The input up vector.
	 * @param {number} [options.divisions=12] - The number of divisions.
	 * @param {boolean} [options.frenet=true] - Whether to use Frenet frames.
	 * @param {boolean} [options.fixLine=true] - Whether to fix line tangent types.
	 * @param {boolean} [options.close=false] - Whether auto-close the path.
	 * @returns {object} - The frames data.
	 */
	computeFrames(options = {}) {
		const up = options.up;
		const divisions = options.divisions !== undefined ? options.divisions : 12;
		const frenet = options.frenet !== undefined ? options.frenet : true;
		const fixLine = options.fixLine !== undefined ? options.fixLine : true;
		const close = options.close !== undefined ? options.close : false;

		const points = [];
		const tangents = [];
		const normals = [];
		const binormals = [];
		const bisectors = [];
		const lengths = [];
		const widthScales = [];
		const sharps = [];

		const tangentTypes = [];

		// get points

		let tangentType = 0;

		for (let i = 0, curves = this.curves; i < curves.length; i++) {
			const curve = curves[i];
			const isLine = curve.isLineCurve2 || curve.isLineCurve3;
			const resolution = isLine ? 1 : divisions;

			const pts = curve.getPoints(resolution);

			const isLast = i === (curves.length - 1);

			if (fixLine && isLine && !isLast) {
				const nextCurve = curves[i + 1];
				const isNextLine = nextCurve.isLineCurve2 || nextCurve.isLineCurve3;
				if (!isNextLine) {
					tangentType = 1;
				}
			}

			for (let j = 0, l = isLast ? pts.length : pts.length - 1; j < l; j++) {
				const point = pts[j];
				points.push(point);
				tangentTypes.push(tangentType);

				if (tangentType === 1) {
					tangentType++;
				} else {
					if (tangentType === 2) {
						tangentType = 0;
					}
				}
			}
		}

		// first point

		tangents[0] = new Vector3();
		normals[0] = new Vector3();
		binormals[0] = new Vector3();
		bisectors[0] = new Vector3();

		tangents[0].subVectors(points[1], points[0]).normalize();

		if (up) {
			normals[0].copy(up);
		} else {
			// select an initial normal vector perpendicular to the first tangent vector,
			// and in the direction of the minimum tangent xyz component
			let min = Number.MAX_VALUE;
			const tx = Math.abs(tangents[0].x);
			const ty = Math.abs(tangents[0].y);
			const tz = Math.abs(tangents[0].z);
			if (tx < min) {
				min = tx;
				normals[0].set(1, 0, 0);
			}
			if (ty < min) {
				min = ty;
				normals[0].set(0, 1, 0);
			}
			if (tz < min) {
				normals[0].set(0, 0, 1);
			}
		}

		binormals[0].crossVectors(tangents[0], normals[0]).normalize();
		normals[0].crossVectors(binormals[0], tangents[0]).normalize();
		bisectors[0].copy(binormals[0]);

		lengths[0] = 0;
		widthScales[0] = 1;
		sharps[0] = false;

		// other points

		const lastDir = new Vector3();
		const nextDir = new Vector3();

		for (let i = 1; i < points.length - 1; i++) {
			const tangent = new Vector3();
			const normal = new Vector3();
			const binormal = new Vector3();
			const bisector = new Vector3();

			lastDir.subVectors(points[i], points[i - 1]);
			nextDir.subVectors(points[i + 1], points[i]);

			const lastLength = lastDir.getLength();

			lastDir.normalize();
			nextDir.normalize();

			bisector.subVectors(nextDir, lastDir).normalize();

			const tangentType = tangentTypes[i];
			if (tangentType === 1) {
				tangent.copy(nextDir);
			} else if (tangentType === 2) {
				tangent.copy(lastDir);
			} else {
				tangent.addVectors(lastDir, nextDir).normalize();
			}

			if (frenet) {
				normal.copy(normals[i - 1]);

				const vec = binormal.crossVectors(tangents[i - 1], tangent);
				if (vec.getLength() > Number.EPSILON) {
					vec.normalize();
					const theta = Math.acos(MathUtils.clamp(tangents[i - 1].dot(tangent), -1, 1)); // clamp for floating pt errors
					normal.applyMatrix4(_mat4_1.makeRotationAxis(vec, theta));
				}

				binormal.crossVectors(tangent, normal).normalize();
			} else {
				normal.copy(up || normals[i - 1]);

				if (tangent.dot(normal) === 1) {
					binormal.crossVectors(nextDir, normal).normalize();
				} else {
					binormal.crossVectors(tangent, normal).normalize();
				}

				normal.crossVectors(binormal, tangent).normalize();
			}

			tangents[i] = tangent;
			normals[i] = normal;
			binormals[i] = binormal;
			bisectors[i] = bisector;

			const _cos = lastDir.dot(nextDir);

			lengths[i] = lengths[i - 1] + lastLength;
			widthScales[i] = Math.min(1 / Math.sqrt((1 + _cos) / 2), 1.415) || 1;
			sharps[i] = (Math.abs(_cos - 1) > 0.05);
		}

		// last point

		const lastIndex = points.length - 1;

		const tangent = new Vector3();
		const normal = new Vector3();
		const binormal = new Vector3();
		const bisector = new Vector3();

		tangent.subVectors(points[lastIndex], points[lastIndex - 1]);
		const dist = tangent.getLength();

		if (close) {
			tangent.copy(tangents[0]);
		} else {
			tangent.normalize();
		}

		normal.copy(normals[lastIndex - 1]);

		const vec = binormal.crossVectors(tangents[lastIndex - 1], tangent);
		if (vec.getLength() > Number.EPSILON) { // see http://www.cs.indiana.edu/pub/techreports/TR425.pdf
			vec.normalize();
			const theta = Math.acos(MathUtils.clamp(tangents[lastIndex - 1].dot(tangent), -1, 1)); // clamp for floating pt errors
			normal.applyMatrix4(_mat4_1.makeRotationAxis(vec, theta));
		}

		binormal.crossVectors(tangent, normal).normalize();
		bisector.copy(binormal);

		tangents[lastIndex] = tangent;
		normals[lastIndex] = normal;
		binormals[lastIndex] = binormal;
		bisectors[lastIndex] = bisector;

		lengths[lastIndex] = lengths[lastIndex - 1] + dist;
		widthScales[lastIndex] = 1;
		sharps[lastIndex] = false;

		// fix first if close

		if (close) {
			tangents[0].copy(tangent);
			normals[0].copy(normal);
			binormals[0].copy(binormal);
			bisectors[0].copy(bisector);
		}

		return {
			points,
			tangents,
			normals,
			binormals,
			bisectors,
			lengths,
			widthScales,
			sharps,
			tangentTypes
		};
	}

	// deprecated since 0.4.0
	setFromPoints(points, options = {}) {
		// console.warn('CurvePath3: setFromPoints() has been deprecated. Use setBeveledCurves() instead.');
		super.setBeveledCurves(points, options);
	}

}

CurvePath3.prototype.isCurvePath3 = true;

const _mat4_1 = new Matrix4();

export { CurvePath3 };