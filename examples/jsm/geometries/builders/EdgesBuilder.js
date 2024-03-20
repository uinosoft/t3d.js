/**
 * EdgesBuilder is a helper for building edges geometry from given triangles data.
 */
const EdgesBuilder = {

	/**
	 * @param {Array} bufferArray - Flat buffer array containing vertex positions.
	 * @param {Array} [indices=] - Flat buffer array of indices, must be multiple of 3.
     * @param {Object} [options={}] - The options object.
	 * @param {Number} [options.thresholdAngle=1] - An edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value.
	 * @param {Number} [options.stride=3] - The number of values of the array that should be associated with a particular vertex.
	 * @param {Number} [options.offset=0] - The offset in the buffer array where the position starts.
	 * @return {Object} - The edges geometry data.
	 */
	getGeometryData: function(bufferArray, indices, options = {}) {
		const thresholdAngle = options.thresholdAngle !== undefined ? options.thresholdAngle : 1;
		const stride = options.stride !== undefined ? options.stride : 3;
		const offset = options.offset !== undefined ? options.offset : 0;

		let i, j, l, key, face;
		const result = [];

		/** merge vertices */

		const verticesMap = {};
		const unique = [], changes = [];

		const precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
		const precision = Math.pow(10, precisionPoints);

		let offsetIndex, x, y, z;
		l = bufferArray.length / stride;
		for (i = 0; i < l; i++) {
			offsetIndex = i * stride + offset;
			x = bufferArray[offsetIndex + 0];
			y = bufferArray[offsetIndex + 1];
			z = bufferArray[offsetIndex + 2];

			key = Math.round(x * precision) + '_' + Math.round(y * precision) + '_' + Math.round(z * precision);

			if (verticesMap[key] === undefined) {
				verticesMap[key] = i;
				unique.push(x, y, z);
				changes[i] = unique.length / 3 - 1;
			} else {
				changes[i] = changes[verticesMap[key]];
			}
		}

		/** get faces  (vertices and normal) */

		const faces = [];

		if (indices) {
			l = indices.length / 3;
			for (i = 0; i < l; i++) {
				face = { i: [0, 0, 0], n: [1, 1, 1] };
				face.i[0] = changes[indices[i * 3 + 0]];
				face.i[1] = changes[indices[i * 3 + 1]];
				face.i[2] = changes[indices[i * 3 + 2]];
				computeFaceNormal(face, unique);
				faces.push(face);
			}
		} else {
			for (i = 0; i < l; i++) {
				face = { i: [0, 0, 0], n: [1, 1, 1] };
				face.i[0] = changes[i * 3 + 0];
				face.i[1] = changes[i * 3 + 1];
				face.i[2] = changes[i * 3 + 2];
				computeFaceNormal(face, unique);
				faces.push(face);
			}
		}

		/**
         * get edges { index1: edge[ 0 ], index2: edge[ 1 ], face1: i, face2: undefined }
         */
		let edge1, edge2;
		const edge = [0, 0], edges = {};
		for (i = 0, l = faces.length; i < l; i++) {
			face = faces[i];
			for (j = 0; j < 3; j++) {
				edge1 = face.i[j];
				edge2 = face.i[(j + 1) % 3];
				edge[0] = Math.min(edge1, edge2);
				edge[1] = Math.max(edge1, edge2);

				key = edge[0] + ',' + edge[1];

				if (edges[key] === undefined) {
					edges[key] = { index1: edge[0], index2: edge[1], face1: i, face2: undefined };
				} else {
					edges[key].face2 = i;
				}
			}
		}

		/** edges filter */
		const thresholdDot = Math.cos(DEG2RAD * thresholdAngle);
		for (key in edges) {
			const e = edges[key];
			// an edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
			if (e.face2 === undefined || dot(faces[e.face1].n, faces[e.face2].n) <= thresholdDot) {
				result.push(
					unique[e.index1 * 3 + 0],
					unique[e.index1 * 3 + 1],
					unique[e.index1 * 3 + 2],
					unique[e.index2 * 3 + 0],
					unique[e.index2 * 3 + 1],
					unique[e.index2 * 3 + 2]
				);
			}
		}

		/** return */
		return {
			positions: result
		};
	}

};

function dot(v1, v2) {
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function computeFaceNormal(face, buffer) {
	const vAX = buffer[face.i[0] * 3 + 0];
	const vAY = buffer[face.i[0] * 3 + 1];
	const vAZ = buffer[face.i[0] * 3 + 2];

	const vBX = buffer[face.i[1] * 3 + 0];
	const vBY = buffer[face.i[1] * 3 + 1];
	const vBZ = buffer[face.i[1] * 3 + 2];

	const vCX = buffer[face.i[2] * 3 + 0];
	const vCY = buffer[face.i[2] * 3 + 1];
	const vCZ = buffer[face.i[2] * 3 + 2];

	const cbX = vCX - vBX; // ax
	const cbY = vCY - vBY; // ay
	const cbZ = vCZ - vBZ; // az

	const abX = vAX - vBX; // bx
	const abY = vAY - vBY; // by
	const abZ = vAZ - vBZ; // bz

	let nX = cbY * abZ - cbZ * abY;
	let nY = cbZ * abX - cbX * abZ;
	let nZ = cbX * abY - cbY * abX;

	const nLen = Math.sqrt(nX * nX + nY * nY + nZ * nZ);

	nX /= nLen;
	nY /= nLen;
	nZ /= nLen;

	face.n[0] = nX;
	face.n[1] = nY;
	face.n[2] = nZ;
}

const DEG2RAD = Math.PI / 180;

export { EdgesBuilder };