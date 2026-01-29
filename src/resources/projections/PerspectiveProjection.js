import { CameraProjection } from './CameraProjection.js';

/**
 * Perspective projection camera class.
 * Generates a perspective projection matrix based on field of view, aspect ratio, near and far planes.
 * Field of view is specified in degrees.
 */
class PerspectiveProjection extends CameraProjection {

	/**
	 * Creates a PerspectiveProjection instance.
	 * @param {number} [fov=50] Vertical field of view in degrees.
	 * @param {number} [aspect=1] Aspect ratio (width / height).
	 * @param {number} [near=0.1] Near clipping plane.
	 * @param {number} [far=2000] Far clipping plane.
	 */
	constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
		super();

		this._fov = fov;
		this._aspect = aspect;
		this._near = near;
		this._far = far;
	}

	/**
	 * The vertical field of view in degrees.
	 * @type {number}
	 * @default 50
	 */
	set fov(value) {
		this._fov = value;
		this._dirty = true;
	}

	get fov() {
		return this._fov;
	}

	/**
	 * The aspect ratio (width / height).
	 * @type {number}
	 * @default 1
	 */
	set aspect(value) {
		this._aspect = value;
		this._dirty = true;
	}

	get aspect() {
		return this._aspect;
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
	 * Sets all perspective parameters at once.
	 * @param {number} fov Vertical field of view in degrees.
	 * @param {number} aspect Aspect ratio (width / height).
	 * @param {number} near Near clipping plane.
	 * @param {number} far Far clipping plane.
	 * @returns {PerspectiveProjection} this
	 */
	set(fov, aspect, near, far) {
		this._fov = fov;
		this._aspect = aspect;
		this._near = near;
		this._far = far;
		this._dirty = true;
		return this;
	}

	/**
	 * Copies the parameters from another PerspectiveProjection.
	 * @param {PerspectiveProjection} source
	 * @returns {PerspectiveProjection} this
	 */
	copy(source) {
		this._fov = source._fov;
		this._aspect = source._aspect;
		this._near = source._near;
		this._far = source._far;
		this._dirty = true;

		return this;
	}

	/**
	 * Updates the perspective projection matrix.
	 * @protected
	 */
	_updateMatrix() {
		const fov = this._fov * Math.PI / 180, aspect = this._aspect, near = this._near, far = this._far;
		const f = 1 / Math.tan(fov / 2);
		this._matrix.set(
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near) / (near - far), (2 * far * near) / (near - far),
			0, 0, -1, 0
		);
		this._dirty = false;
	}

}

export { PerspectiveProjection };