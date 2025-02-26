import { Material } from './Material.js';
import { MATERIAL_TYPE, DRAW_MODE } from '../../const.js';

/**
 * A material for drawing wireframe-style geometries.
 * @extends Material
 */
class LineMaterial extends Material {

	/**
	 * Create a LineMaterial.
	 */
	constructor() {
		super();

		this.type = MATERIAL_TYPE.LINE;

		/**
		 * Controls line thickness.
		 * Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms linewidth will always be 1 regardless of the set value.
		 * @type {number}
		 * @default 1
		 */
		this.lineWidth = 1;

		/**
		 * Set draw mode to LINES / LINE_LOOP / LINE_STRIP
		 * @type {DRAW_MODE}
		 * @default DRAW_MODE.LINES
		 */
		this.drawMode = DRAW_MODE.LINES;
	}

	copy(source) {
		super.copy(source);

		this.lineWidth = source.lineWidth;

		return this;
	}

}

export { LineMaterial };