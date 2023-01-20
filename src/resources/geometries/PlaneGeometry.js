import { Geometry } from './Geometry.js';
import { Attribute } from './Attribute.js';
import { Buffer } from './Buffer.js';

/**
 * A class for generating plane geometries.
 * @memberof t3d
 * @extends t3d.Geometry
 */
class PlaneGeometry extends Geometry {

	/**
	 * @param {Number} [width=1] — Width along the X axis.
	 * @param {Number} [height=1] — Height along the Y axis.
	 * @param {Number} [widthSegments=1]
	 * @param {Number} [heightSegments=1]
	 */
	constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
		super();

		const width_half = width / 2;
		const height_half = height / 2;

		const gridX = Math.floor(widthSegments);
		const gridY = Math.floor(heightSegments);

		const gridX1 = gridX + 1;
		const gridY1 = gridY + 1;

		const segment_width = width / gridX;
		const segment_height = height / gridY;

		let ix, iy;

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// generate vertices, normals and uvs

		for (iy = 0; iy < gridY1; iy++) {
			const y = iy * segment_height - height_half;

			for (ix = 0; ix < gridX1; ix++) {
				const x = ix * segment_width - width_half;

				vertices.push(x, 0, y);

				normals.push(0, 1, 0);

				uvs.push(ix / gridX);
				uvs.push(1 - (iy / gridY));
			}
		}

		// indices

		for (iy = 0; iy < gridY; iy++) {
			for (ix = 0; ix < gridX; ix++) {
				const a = ix + gridX1 * iy;
				const b = ix + gridX1 * (iy + 1);
				const c = (ix + 1) + gridX1 * (iy + 1);
				const d = (ix + 1) + gridX1 * iy;

				// faces

				indices.push(a, b, d);
				indices.push(b, c, d);
			}
		}

		// build geometry

		this.setIndex(new Attribute(new Buffer(
			(vertices.length / 3) > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
			1
		)));
		this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
		this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
		this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));

		this.computeBoundingBox();
		this.computeBoundingSphere();
	}

}

export { PlaneGeometry };
