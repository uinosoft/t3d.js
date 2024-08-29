import { Vector3, Vector2 } from 't3d';

class PolyhedronBuilder {

	static getGeometryData(vertices, indices, radius = 1, detail = 0) {
		// default buffer data

		const vertexBuffer = [];
		const uvBuffer = [];

		// the subdivision creates the vertex buffer data

		subdivide(detail);

		// all vertices should lie on a conceptual sphere with a given radius

		applyRadius(radius);

		// finally, create the uv data

		generateUVs();

		// helper functions

		function subdivide(detail) {
			const a = new Vector3();
			const b = new Vector3();
			const c = new Vector3();

			// iterate over all faces and apply a subdivision with the given detail value

			for (let i = 0; i < indices.length; i += 3) {
				// get the vertices of the face

				getVertexByIndex(indices[i + 0], a);
				getVertexByIndex(indices[i + 1], b);
				getVertexByIndex(indices[i + 2], c);

				// perform subdivision

				subdivideFace(a, b, c, detail);
			}
		}

		function subdivideFace(a, b, c, detail) {
			const cols = detail + 1;

			// we use this multidimensional array as a data structure for creating the subdivision

			const v = [];

			// construct all of the vertices for this subdivision

			for (let i = 0; i <= cols; i++) {
				v[i] = [];

				const aj = a.clone().lerp(c, i / cols);
				const bj = b.clone().lerp(c, i / cols);

				const rows = cols - i;

				for (let j = 0; j <= rows; j++) {
					if (j === 0 && i === cols) {
						v[i][j] = aj;
					} else {
						v[i][j] = aj.clone().lerp(bj, j / rows);
					}
				}
			}

			// construct all of the faces

			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < 2 * (cols - i) - 1; j++) {
					const k = Math.floor(j / 2);

					if (j % 2 === 0) {
						pushVertex(v[i][k + 1]);
						pushVertex(v[i + 1][k]);
						pushVertex(v[i][k]);
					} else {
						pushVertex(v[i][k + 1]);
						pushVertex(v[i + 1][k + 1]);
						pushVertex(v[i + 1][k]);
					}
				}
			}
		}

		function applyRadius(radius) {
			const vertex = new Vector3();

			// iterate over the entire buffer and apply the radius to each vertex

			for (let i = 0; i < vertexBuffer.length; i += 3) {
				vertex.x = vertexBuffer[i + 0];
				vertex.y = vertexBuffer[i + 1];
				vertex.z = vertexBuffer[i + 2];

				vertex.normalize().multiplyScalar(radius);

				vertexBuffer[i + 0] = vertex.x;
				vertexBuffer[i + 1] = vertex.y;
				vertexBuffer[i + 2] = vertex.z;
			}
		}

		function generateUVs() {
			const vertex = new Vector3();

			for (let i = 0; i < vertexBuffer.length; i += 3) {
				vertex.x = vertexBuffer[i + 0];
				vertex.y = vertexBuffer[i + 1];
				vertex.z = vertexBuffer[i + 2];

				const u = azimuth(vertex) / 2 / Math.PI + 0.5;
				const v = inclination(vertex) / Math.PI + 0.5;
				uvBuffer.push(u, 1 - v);
			}

			correctUVs();

			correctSeam();
		}

		function correctSeam() {
			// handle case when face straddles the seam, see #3269

			for (let i = 0; i < uvBuffer.length; i += 6) {
				// uv data of a single face

				const x0 = uvBuffer[i + 0];
				const x1 = uvBuffer[i + 2];
				const x2 = uvBuffer[i + 4];

				const max = Math.max(x0, x1, x2);
				const min = Math.min(x0, x1, x2);

				// 0.9 is somewhat arbitrary

				if (max > 0.9 && min < 0.1) {
					if (x0 < 0.2) uvBuffer[i + 0] += 1;
					if (x1 < 0.2) uvBuffer[i + 2] += 1;
					if (x2 < 0.2) uvBuffer[i + 4] += 1;
				}
			}
		}

		function pushVertex(vertex) {
			vertexBuffer.push(vertex.x, vertex.y, vertex.z);
		}

		function getVertexByIndex(index, vertex) {
			const stride = index * 3;

			vertex.x = vertices[stride + 0];
			vertex.y = vertices[stride + 1];
			vertex.z = vertices[stride + 2];
		}

		function correctUVs() {
			const a = new Vector3();
			const b = new Vector3();
			const c = new Vector3();

			const centroid = new Vector3();

			const uvA = new Vector2();
			const uvB = new Vector2();
			const uvC = new Vector2();

			for (let i = 0, j = 0; i < vertexBuffer.length; i += 9, j += 6) {
				a.set(vertexBuffer[i + 0], vertexBuffer[i + 1], vertexBuffer[i + 2]);
				b.set(vertexBuffer[i + 3], vertexBuffer[i + 4], vertexBuffer[i + 5]);
				c.set(vertexBuffer[i + 6], vertexBuffer[i + 7], vertexBuffer[i + 8]);

				uvA.set(uvBuffer[j + 0], uvBuffer[j + 1]);
				uvB.set(uvBuffer[j + 2], uvBuffer[j + 3]);
				uvC.set(uvBuffer[j + 4], uvBuffer[j + 5]);

				centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3);

				const azi = azimuth(centroid);

				correctUV(uvA, j + 0, a, azi);
				correctUV(uvB, j + 2, b, azi);
				correctUV(uvC, j + 4, c, azi);
			}
		}

		function correctUV(uv, stride, vector, azimuth) {
			if ((azimuth < 0) && (uv.x === 1)) {
				uvBuffer[stride] = uv.x - 1;
			}

			if ((vector.x === 0) && (vector.z === 0)) {
				uvBuffer[stride] = azimuth / 2 / Math.PI + 0.5;
			}
		}

		// Angle around the Y axis, counter-clockwise when looking from above.

		function azimuth(vector) {
			return Math.atan2(vector.z, -vector.x);
		}


		// Angle above the XZ plane.

		function inclination(vector) {
			return Math.atan2(-vector.y, Math.sqrt((vector.x * vector.x) + (vector.z * vector.z)));
		}

		return {
			positions: vertexBuffer,
			uvs: uvBuffer
		};
	}

	static getTetrahedronGeometryData(radius = 1, detail = 0) {
		const vertices = [
			1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1
		];

		const indices = [
			2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1
		];

		return this.getGeometryData(vertices, indices, radius, detail);
	}

	static getOctahedronGeometryData(radius = 1, detail = 0) {
		const vertices = [
			1, 0, 0, -1, 0, 0, 0, 1, 0,
			0, -1, 0, 0, 0, 1, 0, 0, -1
		];

		const indices = [
			0, 2, 4, 0, 4, 3, 0, 3, 5,
			0, 5, 2, 1, 2, 5, 1, 5, 3,
			1, 3, 4, 1, 4, 2
		];

		return this.getGeometryData(vertices, indices, radius, detail);
	}

	static getIcosahedronGeometryData(radius = 1, detail = 0) {
		const t = (1 + Math.sqrt(5)) / 2;

		const vertices = [
			-1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0,
			0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t,
			t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1
		];

		const indices = [
			0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
			1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
			3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
			4, 9, 5, 2, 4, 11, 6, 2, 10,	8, 6, 7, 9, 8, 1
		];

		return this.getGeometryData(vertices, indices, radius, detail);
	}

	static getDodecahedronGeometryData(radius = 1, detail = 0) {
		const t = (1 + Math.sqrt(5)) / 2;
		const r = 1 / t;

		const vertices = [
			// (±1, ±1, ±1)
			-1, -1, -1,	-1, -1, 1,
			-1, 1, -1, -1, 1, 1,
			1, -1, -1, 1, -1, 1,
			1, 1, -1, 1, 1, 1,

			// (0, ±1/φ, ±φ)
			0, -r, -t, 0, -r, t,
			0, r, -t, 0, r, t,

			// (±1/φ, ±φ, 0)
			-r, -t, 0, -r, t, 0,
			r, -t, 0, r, t, 0,

			// (±φ, 0, ±1/φ)
			-t, 0, -r, t, 0, -r,
			-t, 0, r, t, 0, r
		];

		const indices = [
			3, 11, 7, 	3, 7, 15, 	3, 15, 13,
			7, 19, 17, 	7, 17, 6, 	7, 6, 15,
			17, 4, 8, 	17, 8, 10, 	17, 10, 6,
			8, 0, 16, 	8, 16, 2, 	8, 2, 10,
			0, 12, 1, 	0, 1, 18, 	0, 18, 16,
			6, 10, 2, 	6, 2, 13, 	6, 13, 15,
			2, 16, 18, 	2, 18, 3, 	2, 3, 13,
			18, 1, 9, 	18, 9, 11, 	18, 11, 3,
			4, 14, 12, 	4, 12, 0, 	4, 0, 8,
			11, 9, 5, 	11, 5, 19, 	11, 19, 7,
			19, 5, 14, 	19, 14, 4, 	19, 4, 17,
			1, 12, 14, 	1, 14, 5, 	1, 5, 9
		];

		return this.getGeometryData(vertices, indices, radius, detail);
	}

}

export { PolyhedronBuilder };