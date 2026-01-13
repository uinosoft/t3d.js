import { Camera, Matrix4 } from 't3d';

/**
 * Camera that can switch between perspective and orthographic projection.
 * @extends Camera
 */
class CombinedCamera extends Camera {

	/**
	 * Create a CombinedCamera.
	 * @param {number} [fov=50] - Camera frustum vertical field of view, from bottom to top of view, in degrees.
	 * @param {number} [aspect=1] - Camera frustum aspect ratio, usually the canvas width / canvas height.
	 * @param {number} [near=0.1] - Camera frustum near plane.
	 * @param {number} [far=2000] - Camera frustum far plane.
	 */
	constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
		super();

		this._fov = fov;
		this._aspect = aspect;
		this._near = near;
		this._far = far;

		this._zoom = 1;	// Zoom factor 1 means no zoom

		this._projectionWeight = 1; // 0: orthographic -> 1: perspective
		this._orthographicDistance = near + (far - near) / 2;

		// Orthographic bounds (initialized for hidden class optimization)
		this._left = -1;
		this._right = 1;
		this._top = 1;
		this._bottom = -1;

		this.updateOrthographicRect();
		this.updateProjectionMatrix();
	}

	get isPerspectiveCamera() {
		return this._projectionWeight >= 0.5;
	}

	get isOrthographicCamera() {
		return this._projectionWeight < 0.5;
	}

	get fov() {
		return this._fov;
	}

	set fov(value) {
		this._fov = value;
		this.updateOrthographicRect();
		this.updateProjectionMatrix();
	}

	get aspect() {
		return this._aspect;
	}

	set aspect(value) {
		this._aspect = value;
		this.updateOrthographicRect();
		this.updateProjectionMatrix();
	}

	get near() {
		return this._near;
	}

	set near(value) {
		this._near = value;
		this.updateProjectionMatrix();
	}

	get far() {
		return this._far;
	}

	set far(value) {
		this._far = value;
		this.updateProjectionMatrix();
	}

	get zoom() {
		return this._zoom;
	}

	set zoom(value) {
		this._zoom = value;
		this.updateProjectionMatrix();
	}

	get left() {
		return this._left;
	}

	get right() {
		return this._right;
	}

	get top() {
		return this._top;
	}

	get bottom() {
		return this._bottom;
	}

	get orthographicDistance() {
		return this._orthographicDistance;
	}

	set orthographicDistance(value) {
		this._orthographicDistance = value;
		this.updateOrthographicRect();
		this.updateProjectionMatrix();
	}

	get projectionWeight() {
		return this._projectionWeight;
	}

	set projectionWeight(value) {
		this._projectionWeight = value;
		this.updateProjectionMatrix();
	}

	/**
	 * Get the effective FOV in degrees, accounting for zoom.
	 * @returns {number}
	 */
	getEffectiveFOV() {
		return 180 / Math.PI * 2 * Math.atan(
			Math.tan(Math.PI / 180 * 0.5 * this._fov) / this._zoom
		);
	}

	updateOrthographicRect() {
		const distance = this._orthographicDistance;
		const tanHalfFov = Math.tan(this._fov * Math.PI / 360); // fov is in degrees
		const halfHeight = tanHalfFov * distance;
		const halfWidth = this._aspect * halfHeight;

		this._left = -halfWidth;
		this._right = halfWidth;
		this._top = halfHeight;
		this._bottom = -halfHeight;
	}

	updateProjectionMatrix() {
		const weight = this._projectionWeight;

		if (weight === 0) {
			const zoom = this._zoom;
			this.setOrtho(
				this._left / zoom,
				this._right / zoom,
				this._bottom / zoom,
				this._top / zoom,
				this._near,
				this._far
			);
		} else if (weight === 1) {
			const effectiveFOV = this.getEffectiveFOV() * Math.PI / 180;
			this.setPerspective(effectiveFOV, this._aspect, this._near, this._far);
		} else {
			this._lerpMatrixUpdate(weight);
		}
	}

	_lerpMatrixUpdate(weight) {
		const zoom = this._zoom;

		// Calculate Orthographic Matrix
		const left = this._left;
		const right = this._right;
		const bottom = this._bottom;
		const top = this._top;
		const near = this._near;
		const far = this._far;

		// Note: The original implementation didn't apply zoom to the lerped matrices.
		// We apply zoom here by scaling the relevant terms.

		const dx = (right - left) / (2 * zoom);
		const dy = (top - bottom) / (2 * zoom);
		const cx = (right + left) / 2;
		const cy = (top + bottom) / 2;

		const orthoLeft = cx - dx;
		const orthoRight = cx + dx;
		const orthoTop = cy + dy;
		const orthoBottom = cy - dy;

		_orthoMatrix.set(
			2 / (orthoRight - orthoLeft), 0, 0, -(orthoRight + orthoLeft) / (orthoRight - orthoLeft),
			0, 2 / (orthoTop - orthoBottom), 0, -(orthoTop + orthoBottom) / (orthoTop - orthoBottom),
			0, 0, -2 / (far - near), -(far + near) / (far - near),
			0, 0, 0, 1
		);

		// Calculate Perspective Matrix
		const fov = this._fov * Math.PI / 180;
		const aspect = this._aspect;
		const halfTan = Math.tan(fov / 2) / zoom;

		_perspectiveMatrix.set(
			1 / (aspect * halfTan), 0, 0, 0,
			0, 1 / (halfTan), 0, 0,
			0, 0, -(far + near) / (far - near), -2 * far * near / (far - near),
			0, 0, -1, 0
		);

		this.projectionMatrix.lerpMatrices(_orthoMatrix, _perspectiveMatrix, weight);
		this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}

	copy(source) {
		super.copy(source);

		this.fov = source.fov;
		this.aspect = source.aspect;
		this.zoom = source.zoom;
		this.near = source.near;
		this.far = source.far;

		this.projectionWeight = source.projectionWeight;
		this.orthographicDistance = source.orthographicDistance;

		return this;
	}

}

const _orthoMatrix = new Matrix4();
const _perspectiveMatrix = new Matrix4();

export { CombinedCamera };
