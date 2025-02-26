import { Material } from './Material.js';
import { MATERIAL_TYPE, DRAW_MODE } from '../../const.js';

/**
 * The default material used by Points.
 * @extends Material
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
		 * @type {number}
		 * @default 1
		 */
		this.size = 1;

		/**
		 * Specify whether points' size is attenuated by the camera depth. (Perspective camera only.)
		 * @type {boolean}
		 * @default true
		 */
		this.sizeAttenuation = true;

		/**
		 * Set draw mode to POINTS.
		 * @type {DRAW_MODE}
		 * @default DRAW_MODE.POINTS
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