import { Vector2, Vector3, MathUtils } from 't3d';

/**
 * LatheBuilder
 */
const LatheBuilder = {
	/**
	 * @param {Array} points - The points of the lathe, for example: [[0, -0.5], [0.5, 0], [0, 0.5]]
	 * @param {number} [segments=12] - The number of circumference segments to generate
	 * @param {number} [phiStart=0] - The starting angle in radians
	 * @param {number} [phiLength=Math.PI*2] - The radian (0 to 2PI) range of the lathed section, less than 2PI is a portion
	 * @returns {object} The geometry data.
	 */
	getGeometryData: function(points, segments = 12, phiStart = 0, phiLength = Math.PI * 2) {
		segments = Math.floor(segments);

		// clamp phiLength so it's in range of [ 0, 2PI ]

		phiLength = MathUtils.clamp(phiLength, 0, Math.PI * 2);

		// buffers

		const indices = [];
		const positions = [];
		const uvs = [];
		const initNormals = [];
		const normals = [];

		// helper variables

		const inverseSegments = 1.0 / segments;
		const vertex = new Vector3();
		const uv = new Vector2();
		const normal = new Vector3();
		const curNormal = new Vector3();
		const prevNormal = new Vector3();
		let dx = 0;
		let dy = 0;

		// pre-compute normals for initial "meridian"

		for (let j = 0; j <= (points.length - 1); j++) {
			switch (j) {
				case 0: // special handling for 1st vertex on path
					dx = points[j + 1][0] - points[j][0];
					dy = points[j + 1][1] - points[j][1];

					normal.x = dy * 1.0;
					normal.y = -dx;
					normal.z = dy * 0.0;

					prevNormal.copy(normal);

					normal.normalize();

					initNormals.push(normal.x, normal.y, normal.z);

					break;
				case points.length - 1: // special handling for last Vertex on path
					initNormals.push(prevNormal.x, prevNormal.y, prevNormal.z);

					break;
				default: // default handling for all positions in between
					dx = points[j + 1][0] - points[j][0];
					dy = points[j + 1][1] - points[j][1];

					normal.x = dy * 1.0;
					normal.y = -dx;
					normal.z = dy * 0.0;

					curNormal.copy(normal);

					normal.x += prevNormal.x;
					normal.y += prevNormal.y;
					normal.z += prevNormal.z;

					normal.normalize();

					initNormals.push(normal.x, normal.y, normal.z);

					prevNormal.copy(curNormal);
			}
		}

		// generate positions, uvs and normals

		for (let i = 0; i <= segments; i++) {
			const phi = phiStart + i * inverseSegments * phiLength;

			const sin = Math.sin(phi);
			const cos = Math.cos(phi);

			for (let j = 0; j <= (points.length - 1); j++) {
				// vertex

				vertex.x = points[j][0] * sin;
				vertex.y = points[j][1];
				vertex.z = points[j][0] * cos;

				positions.push(vertex.x, vertex.y, vertex.z);

				// uv

				uv.x = i / segments;
				uv.y = j / (points.length - 1);

				uvs.push(uv.x, uv.y);

				// normal

				const x = initNormals[3 * j + 0] * sin;
				const y = initNormals[3 * j + 1];
				const z = initNormals[3 * j + 0] * cos;

				normals.push(x, y, z);
			}
		}

		// indices

		for (let i = 0; i < segments; i++) {
			for (let j = 0; j < points.length - 1; j++) {
				const base = j + i * points.length;

				const a = base;
				const b = base + points.length;
				const c = base + points.length + 1;
				const d = base + 1;

				// faces

				indices.push(a, b, d);
				indices.push(c, d, b);
			}
		}

		// return

		return {
			positions,
			normals,
			uvs,
			indices
		};
	}
};

export { LatheBuilder };