/**
 * CubicBezierCurve3
 */

import {
	Vector3
} from 't3d';
import { Curve } from './Curve.js';
import { MathUtils } from '../MathUtils.js';

class CubicBezierCurve3 extends Curve {

	constructor(v0 = new Vector3(), v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3()) {
		super();

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
		this.v3 = v3;
	}

	getPoint(t, optionalTarget = new Vector3()) {
		const point = optionalTarget;

		const v0 = this.v0, v1 = this.v1, v2 = this.v2, v3 = this.v3;

		point.set(
			MathUtils.cubicBezier(t, v0.x, v1.x, v2.x, v3.x),
			MathUtils.cubicBezier(t, v0.y, v1.y, v2.y, v3.y),
			MathUtils.cubicBezier(t, v0.z, v1.z, v2.z, v3.z)
		);

		return point;
	}

}

CubicBezierCurve3.prototype.isCubicBezierCurve3 = true;

export { CubicBezierCurve3 };