import { CameraProjection } from './CameraProjection.js';

/**
 * Orthographic projection camera class.
 * Generates an orthographic projection matrix based on left, right, top, bottom, near, and far planes.
 */
class OrthographicProjection extends CameraProjection {

	/**
	 * Creates an OrthographicProjection instance.
	 * @param {number} [left=-1] Left plane of the orthographic box.
	 * @param {number} [right=1] Right plane of the orthographic box.
	 * @param {number} [top=1] Top plane of the orthographic box.
	 * @param {number} [bottom=-1] Bottom plane of the orthographic box.
	 * @param {number} [near=0.1] Near clipping plane.
	 * @param {number} [far=2000] Far clipping plane.
	 */
	constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 2000) {
		super();

		this._left = left;
		this._right = right;
		this._top = top;
		this._bottom = bottom;
		this._near = near;
		this._far = far;
	}

	/**
	 * The left plane of the orthographic box.
	 * @type {number}
	 * @default -1
	 */
	set left(value) {
		this._left = value;
		this._dirty = true;
	}

	get left() {
		return this._left;
	}

	/**
	 * The right plane of the orthographic box.
	 * @type {number}
	 * @default 1
	 */
	set right(value) {
		this._right = value;
		this._dirty = true;
	}

	get right() {
		return this._right;
	}

	/**
	 * The top plane of the orthographic box.
	 * @type {number}
	 * @default 1
	 */
	set top(value) {
		this._top = value;
		this._dirty = true;
	}

	get top() {
		return this._top;
	}

	/**
	 * The bottom plane of the orthographic box.
	 * @type {number}
	 * @default -1
	 */
	set bottom(value) {
		this._bottom = value;
		this._dirty = true;
	}

	get bottom() {
		return this._bottom;
	}

	/**
	 * The near clipping plane.
	 * @type {number}
	 * @default 0.1
	 */
	set near(value) {
		this._near = value;
		this._dirty = true;
	}

	get near() {
		return this._near;
	}

	/**
	 * The far clipping plane.
	 * @type {number}
	 * @default 2000
	 */
	set far(value) {
		this._far = value;
		this._dirty = true;
	}

	get far() {
		return this._far;
	}

	/**
	 * Sets all orthographic parameters at once.
	 * @param {number} left The left plane of the orthographic box.
	 * @param {number} right The right plane of the orthographic box.
	 * @param {number} top The top plane of the orthographic box.
	 * @param {number} bottom The bottom plane of the orthographic box.
	 * @param {number} near The near clipping plane.
	 * @param {number} far The far clipping plane.
	 * @returns {OrthographicProjection} this
	 */
	set(left, right, top, bottom, near, far) {
		this._left = left;
		this._right = right;
		this._top = top;
		this._bottom = bottom;
		this._near = near;
		this._far = far;
		this._dirty = true;
		return this;
	}

	/**
	 * Sets the orthographic box size by width and height, centered at (0, 0).
	 * @param {number} width The width of the orthographic box.
	 * @param {number} height The height of the orthographic box.
	 * @returns {OrthographicProjection} this
	 */
	setSize(width, height) {
		this._left = -width / 2;
		this._right = width / 2;
		this._top = height / 2;
		this._bottom = -height / 2;
		this._dirty = true;
		return this;
	}

	/**
	 * Copies the parameters from another OrthographicProjection.
	 * @param {OrthographicProjection} source
	 * @returns {OrthographicProjection} this
	 */
	copy(source) {
		this._left = source._left;
		this._right = source._right;
		this._top = source._top;
		this._bottom = source._bottom;
		this._near = source._near;
		this._far = source._far;
		this._dirty = true;

		return this;
	}

	/**
	 * Updates the orthographic projection matrix.
	 * @protected
	 */
	_updateMatrix() {
		const left = this._left, right = this._right, bottom = this._bottom, top = this._top, near = this._near, far = this._far;
		this._matrix.set(
			2 / (right - left), 0, 0, -(right + left) / (right - left),
			0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
			0, 0, -2 / (far - near), -(far + near) / (far - near),
			0, 0, 0, 1
		);
		this._dirty = false;
	}

}

export { OrthographicProjection };