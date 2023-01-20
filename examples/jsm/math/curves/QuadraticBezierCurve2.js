/**
 * QuadraticBezierCurve2
 */

import {
	Vector2
} from 't3d';
import { Curve } from './Curve.js';
import { MathUtils } from '../MathUtils.js';

class QuadraticBezierCurve2 extends Curve {

	constructor(v0 = new Vector2(), v1 = new Vector2(), v2 = new Vector2()) {
		super();

		this.v0 = v0;
		this.v1 = v1;
		this.v2 = v2;
	}

	getPoint(t, optionalTarget = new Vector2()) {
		const point = optionalTarget;

		const v0 = this.v0, v1 = this.v1, v2 = this.v2;

		point.set(
			MathUtils.quadraticBezier(t, v0.x, v1.x, v2.x),
			MathUtils.quadraticBezier(t, v0.y, v1.y, v2.y)
		);

		return point;
	}

}

QuadraticBezierCurve2.prototype.isQuadraticBezierCurve2 = true;

export { QuadraticBezierCurve2 };