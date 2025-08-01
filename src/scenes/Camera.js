import { Object3D } from './Object3D.js';
import { TEXEL_ENCODING_TYPE } from '../const.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Frustum } from '../math/Frustum.js';
import { Vector4 } from '../math/Vector4.js';
import { Vector3 } from '../math/Vector3.js';

/**
 * The camera used for rendering a 3D scene.
 * The camera's direction is defined as the 3-vector (0.0, 0,0, -1.0), that is, an untransformed camera points down the -Z axis.
 * @extends Object3D
 */
class Camera extends Object3D {

	/**
	 * Create a camera.
	 */
	constructor() {
		super();

		/**
		 * This is the inverse of worldMatrix.
		 * The matrix may be different from the value passed in the shader, scene.anchorMatrix is not considered here.
		 * @type {Matrix4}
		 */
		this.viewMatrix = new Matrix4();

		/**
		 * This is the matrix which contains the projection.
		 * @type {Matrix4}
		 */
		this.projectionMatrix = new Matrix4();

		/**
		 * This is the matrix which contains the projection.
		 * @type {Matrix4}
		 */
		this.projectionMatrixInverse = new Matrix4();

		/**
		 * This is the matrix which contains the projection and view matrix.
		 * The matrix may be different from the value passed in the shader, scene.anchorMatrix is not considered here.
		 * @type {Matrix4}
		 */
		this.projectionViewMatrix = new Matrix4();

		/**
		 * The frustum of the camera.
		 * @type {Frustum}
		 */
		this.frustum = new Frustum();

		/**
		 * The factor of gamma.
		 * @type {number}
		 * @default 2.0
		 */
		this.gammaFactor = 2.0;

		/**
		 * Output pixel encoding.
		 * @type {TEXEL_ENCODING_TYPE}
		 * @default TEXEL_ENCODING_TYPE.LINEAR
		 */
		this.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;

		/**
		 * Where on the screen is the camera rendered in normalized coordinates.
		 * The values in rect range from zero (left/bottom) to one (right/top).
		 * @type {Vector4}
		 * @default Vector4(0, 0, 1, 1)
		 */
		this.rect = new Vector4(0, 0, 1, 1);

		/**
		 * When this is set, it checks every frame if objects are in the frustum of the camera before rendering objects.
		 * Otherwise objects gets rendered every frame even if it isn't visible.
		 * @type {boolean}
		 * @default true
		 */
		this.frustumCulled = true;
	}

	/**
	 * Set view by look at, this func will set quaternion of this camera.
	 * @param {Vector3} target - The target that the camera look at.
	 * @param {Vector3} up - The up direction of the camera.
	 */
	lookAt(target, up) {
		_mat4_1.lookAtRH(this.position, target, up);
		this.quaternion.setFromRotationMatrix(_mat4_1);
	}

	/**
	 * Set orthographic projection matrix.
	 * @param {number} left — Camera frustum left plane.
	 * @param {number} right — Camera frustum right plane.
	 * @param {number} bottom — Camera frustum bottom plane.
	 * @param {number} top — Camera frustum top plane.
	 * @param {number} near — Camera frustum near plane.
	 * @param {number} far — Camera frustum far plane.
	 */
	setOrtho(left, right, bottom, top, near, far) {
		this.projectionMatrix.set(
			2 / (right - left), 0, 0, -(right + left) / (right - left),
			0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
			0, 0, -2 / (far - near), -(far + near) / (far - near),
			0, 0, 0, 1
		);
		this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}

	/**
	 * Set perspective projection matrix.
	 * @param {number} fov — Camera frustum vertical field of view.
	 * @param {number} aspect — Camera frustum aspect ratio.
	 * @param {number} near — Camera frustum near plane.
	 * @param {number} far — Camera frustum far plane.
	 */
	setPerspective(fov, aspect, near, far) {
		this.projectionMatrix.set(
			1 / (aspect * Math.tan(fov / 2)), 0, 0, 0,
			0, 1 / (Math.tan(fov / 2)), 0, 0,
			0, 0, -(far + near) / (far - near), -2 * far * near / (far - near),
			0, 0, -1, 0
		);
		this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}

	getWorldDirection(optionalTarget = new Vector3()) {
		return super.getWorldDirection(optionalTarget).negate();
	}

	updateMatrix(force) {
		Object3D.prototype.updateMatrix.call(this, force);

		this.viewMatrix.copy(this.worldMatrix).invert(); // update view matrix

		this.projectionViewMatrix.multiplyMatrices(this.projectionMatrix, this.viewMatrix); // get PV matrix
		this.frustum.setFromMatrix(this.projectionViewMatrix); // update frustum
	}

	copy(source, recursive) {
		Object3D.prototype.copy.call(this, source, recursive);

		this.viewMatrix.copy(source.viewMatrix);
		this.projectionMatrix.copy(source.projectionMatrix);
		this.projectionMatrixInverse.copy(source.projectionMatrixInverse);

		this.frustum.copy(source.frustum);
		this.gammaFactor = source.gammaFactor;
		this.outputEncoding = source.outputEncoding;
		this.rect.copy(source.rect);
		this.frustumCulled = source.frustumCulled;

		return this;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Camera.prototype.isCamera = true;

const _mat4_1 = new Matrix4();

export { Camera };