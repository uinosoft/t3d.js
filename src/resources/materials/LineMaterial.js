import { Material } from './Material.js';
import { MATERIAL_TYPE, DRAW_MODE } from '../../const.js';

/**
 * A material for drawing wireframe-style geometries.
 * @extends t3d.Material
 * @memberof t3d
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
		 * @type {Number}
		 * @default 1
		 */
		this.lineWidth = 1;

		/**
		 * Set draw mode to LINES / LINE_LOOP / LINE_STRIP
		 * @type {t3d.DRAW_MODE}
		 * @default t3d.DRAW_MODE.LINES
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