import { Object3D } from './Object3D.js';
import { Color3 } from '../math/Color3.js';
import { Matrix4 } from '../math/Matrix4.js';

/**
 * Abstract base class for lights
 * - The light's direction is defined as the 3-vector (0.0, 0,0, -1.0), that is, an untransformed light points down the -Z axis.
 * - all other light types inherit the properties and methods described here.
 * @abstract
 * @memberof t3d
 * @extends t3d.Object3D
 */
class Light extends Object3D {

	/**
	 * @param {Number} [color=0xffffff]
	 * @param {Number} [intensity=1]
	 */
	constructor(color = 0xffffff, intensity = 1) {
		super();

		/**
		 * Color of the light.
		 * @type {t3d.Color3}
		 * @default t3d.Color3(0xffffff)
		 */
		this.color = new Color3(color);

		/**
		 * The light's intensity, or strength.
		 * @type {Number}
		 * @default 1
		 */
		this.intensity = intensity;
	}

	/**
     * Set light direction, this func will set quaternion of this light.
     * @param {t3d.Vector3} target - The target that the light look at.
     * @param {t3d.Vector3} up - The up direction of the light.
     */
	lookAt(target, up) {
		_mat4_1.lookAtRH(this.position, target, up);
		this.quaternion.setFromRotationMatrix(_mat4_1);
	}

	/**
     * Copies properties from the source light into this one.
     * @param {t3d.Light} source - The source light.
     * @return {t3d.Light} - This light.
     */
	copy(source) {
		super.copy(source);

		this.color.copy(source.color);
		this.intensity = source.intensity;

		return this;
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
Light.prototype.isLight = true;

const _mat4_1 = new Matrix4();

export { Light };
