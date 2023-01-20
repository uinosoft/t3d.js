import { Material } from './Material.js';
import { MATERIAL_TYPE, DRAW_MODE } from '../../const.js';

/**
 * The default material used by Points.
 * @extends t3d.Material
 * @memberof t3d
 */
class PointsMaterial extends Material {

	/**
	 * Create a PointsMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.POINT;

		/**
		 * Sets the size of the points.
		 * @type {Number}
		 * @default 1
		 */
		this.size = 1;

		/**
		 * Specify whether points' size is attenuated by the camera depth. (Perspective camera only.)
		 * @type {Boolean}
		 * @default true
		 */
		this.sizeAttenuation = true;

		/**
		 * Set draw mode to POINTS.
		 * @type {t3d.DRAW_MODE}
		 * @default t3d.DRAW_MODE.POINTS
		 */
		this.drawMode = DRAW_MODE.POINTS;
	}

	copy(source) {
		super.copy(source);

		this.size = source.size;
		this.sizeAttenuation = source.sizeAttenuation;

		return this;
	}

}

export { PointsMaterial };