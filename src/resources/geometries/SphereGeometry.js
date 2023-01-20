import { Geometry } from './Geometry.js';
import { Attribute } from './Attribute.js';
import { Buffer } from './Buffer.js';
import { Vector3 } from '../../math/Vector3.js';

/**
 * A class for generating sphere geometries.
 * The geometry is created by sweeping and calculating vertexes around the Y axis (horizontal sweep) and the Z axis (vertical sweep).
 * Thus, incomplete spheres (akin to 'sphere slices') can be created through the use of different values of phiStart, phiLength, thetaStart and thetaLength, in order to define the points in which we start (or end) calculating those vertices.
 * @memberof t3d
 * @extends t3d.Geometry
 */
class SphereGeometry extends Geometry {

	/**
	 * @param {Number} [radius=1] — sphere radius. Default is 1.
	 * @param {Number} [widthSegments=8] — number of horizontal segments. Minimum value is 3, and the default is 8.
	 * @param {Number} [heightSegments=6] — number of vertical segments. Minimum value is 2, and the default is 6.
	 * @param {Number} [phiStart=0] — specify horizontal starting angle. Default is 0.
	 * @param {Number} [phiLength=Math.PI*2] — specify horizontal sweep angle size. Default is Math.PI * 2.
	 * @param {Number} [thetaStart=0] — specify vertical starting angle. Default is 0.
	 * @param {Number} [thetaLength=Math.PI] — specify vertical sweep angle size. Default is Math.PI.
	 */
	constructor(radius = 1, widthSegments = 8, heightSegments = 6, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
		super();

		widthSegments = Math.max(3, Math.floor(widthSegments));
		heightSegments = Math.max(2, Math.floor(heightSegments));

		const thetaEnd = thetaStart + thetaLength;

		let ix, iy;

		let index = 0;
		const grid = [];

		const vertex = new Vector3();
		const normal = new Vector3();

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// generate vertices, normals and uvs

		for (iy = 0; iy <= heightSegments; iy++) {
			const verticesRow = [];

			const v = iy / heightSegments;

			// special case for the poles
			// https://github.com/mrdoob/three.js/pull/16043

			let uOffset = 0;

			if (iy == 0 && thetaStart == 0) {
				uOffset = 0.5 / widthSegments;
			} else if (iy == heightSegments && thetaEnd == Math.PI) {
				uOffset = -0.5 / widthSegments;
			}

			for (ix = 0; ix <= widthSegments; ix++) {
				const u = ix / widthSegments;

				// vertex

				vertex.x = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
				vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
				vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

				vertices.push(vertex.x, vertex.y, vertex.z);

				// normal

				normal.copy(vertex).normalize();
				normals.push(normal.x, normal.y, normal.z);

				// uv

				uvs.push(u + uOffset, 1 - v);

				verticesRow.push(index++);
			}

			grid.push(verticesRow);
		}

		// indices

		for (iy = 0; iy < heightSegments; iy++) {
			for (ix = 0; ix < widthSegments; ix++) {
				const a = grid[iy][ix + 1];
				const b = grid[iy][ix];
				const c = grid[iy + 1][ix];
				const d = grid[iy + 1][ix + 1];

				if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
				if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
			}
		}

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

export { SphereGeometry };