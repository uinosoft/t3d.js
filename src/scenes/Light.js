import { Object3D } from './Object3D.js';
import { Color3 } from '../math/Color3.js';
import { Matrix4 } from '../math/Matrix4.js';

/**
 * Abstract base class for lights
 * - The light's direction is defined as the 3-vector (0.0, 0,0, -1.0), that is, an untransformed light points down the -Z axis.
 * - all other light types inherit the properties and methods described here.
 * @abstract
 * @extends Object3D
 */
class Light extends Object3D {

	/**
	 * @param {number} [color=0xffffff]
	 * @param {number} [intensity=1]
	 */
	constructor(color = 0xffffff, intensity = 1) {
		super();

		/**
		 * Color of the light.
		 * @type {Color3}
		 * @default Color3(0xffffff)
		 */
		this.color = new Color3(color);

		/**
		 * The light's intensity, or strength.
		 * @type {number}
		 * @default 1
		 */
		this.intensity = intensity;

		/**
		 * Group mask of the light, indicating which lighting group the light belongs to. Default is 1 (binary 0001), meaning the light belongs to lighting group 0.
		 * For example, to make the light effective in both lighting group 0 and lighting group 1, set groupMask to 3 (binary 0011).
		 * Used in conjunction with {@link Material#lightingGroup}.
		 * @type {number}
		 * @default 1
		 */
		this.groupMask = 1;
	}

	/**
	 * Set light direction, this func will set quaternion of this light.
	 * @param {Vector3} target - The target that the light look at.
	 * @param {Vector3} up - The up direction of the light.
	 */
	lookAt(target, up) {
		_mat4_1.lookAtRH(this.position, target, up);
		this.quaternion.setFromRotationMatrix(_mat4_1);
	}

	/**
	 * Copies properties from the source light into this one.
	 * @param {Light} source - The source light.
	 * @returns {Light} - This light.
	 */
	copy(source) {
		super.copy(source);

		this.color.copy(source.color);
		this.intensity = source.intensity;
		this.groupMask = source.groupMask;

		return this;
	}

}

/**
 * @readonly
 * @type {boolean}
 * @default true
 */
Light.prototype.isLight = true;

const _mat4_1 = new Matrix4();

export { Light };
