import { Vector2 } from './Vector2.js';

/**
 * Represents an axis-aligned bounding box (AABB) in 2D space.
 * @memberof t3d
 */
class Box2 {

	/**
	 * @param {t3d.Vector2} min - (optional) Vector2 representing the lower (x, y) boundary of the box.
	 * 								Default is ( + Infinity, + Infinity ).
	 * @param {t3d.Vector2} max - (optional) Vector2 representing the upper (x, y) boundary of the box.
	 * 								Default is ( - Infinity, - Infinity ).
	 */
	constructor(min, max) {
		this.min = (min !== undefined) ? min : new Vector2(+Infinity, +Infinity);
		this.max = (max !== undefined) ? max : new Vector2(-Infinity, -Infinity);
	}

	/**
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 */
	set(x1, y1, x2, y2) {
		this.min.set(x1, y1);
		this.max.set(x2, y2);
	}

	/**
	 * Returns a new Box2 with the same min and max as this one.
	 * @return {t3d.Box2}
	 */
	clone() {
		return new Box2().copy(this);
	}

	/**
	 * Copies the min and max from box to this box.
	 * @param {t3d.Box2} box
	 * @return {t3d.Box2}
	 */
	copy(box) {
		this.min.copy(box.min);
		this.max.copy(box.max);

		return this;
	}

}

export { Box2 };