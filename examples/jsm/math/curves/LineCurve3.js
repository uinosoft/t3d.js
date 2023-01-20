/**
 * LineCurve3
 */

import {
	Vector3
} from 't3d';
import { Curve } from './Curve.js';

class LineCurve3 extends Curve {

	constructor(v1 = new Vector3(), v2 = new Vector3()) {
		super();

		this.v1 = v1;
		this.v2 = v2;
	}

	getPoint(t, optionalTarget = new Vector3()) {
		const point = optionalTarget;

		if (t === 1) {
			point.copy(this.v2);
		} else {
			point.copy(this.v2).sub(this.v1);
			point.multiplyScalar(t).add(this.v1);
		}

		return point;
	}

	// Line curve is linear, so we can overwrite default getPointAt
	getPointAt(u, optionalTarget) {
		return this.getPoint(u, optionalTarget);
	}

}

LineCurve3.prototype.isLineCurve3 = true;

export { LineCurve3 };