import { Earcut } from './Earcut.js';
import { GeometryBuilderUtils } from './GeometryBuilderUtils.js';
import { Vector3 } from 't3d';

const normal = new Vector3();
const binormal = new Vector3();
const pos = new Vector3();

/**
 * ExtrudeShapeBuilder
 */
const ExtrudeShapeBuilder = {

	/**
     * @param {Object} shape - The shape.
     * @param {Array} shape.contour - The holes of this shape, for example: [[0, 0], [0, 5], [5, 5], [5, 0]]
     * @param {Array} shape.holes - The holes of this shape, for example: [[[1, 3], [1, 4], [4, 4], [4, 3]], [[1, 1], [1, 2], [4, 1]]]
	 * @param {Array} [shape.depth=1] - The depth of this shape. If it is a negative number, extrude in the positive direction of the z-axis, otherwise, extrude in the negative direction of the z-axis,
	 * @param {Object} [shape.extrudePath=false]
     */
	getGeometryData: function(shape) {
		const depth = (shape.depth !== undefined) ? shape.depth : 1;
		const extrudePath = (shape.extrudePath !== undefined) ? shape.extrudePath : false;
		const negativeDepth = depth < 0;
		const vertices = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
		const holeIndices = []; // array of hole indices

		GeometryBuilderUtils.convertShapeDataToEarcut(shape, vertices, holeIndices);

		const faces = Earcut.triangulate(vertices, holeIndices);

		// build vertex data

		const positions = [];
		const uvs = [];
		const indices = [];

		const frameLength = (shape.extrudePath !== undefined) ? extrudePath.points.length : 0;
		const lastIndex = (shape.extrudePath !== undefined) ? frameLength - 1 : 0;

		let vertexCount = 0;

		// top

		for (let i = 0, l = vertices.length; i < l; i += 2) {
			if (extrudePath) {
				setPosFromExtrudePath(extrudePath, vertices[i], vertices[i + 1], 0, positions);
			} else {
				positions.push(vertices[i], vertices[i + 1], 0); // x-y plane
			}
			uvs.push(negativeDepth ? -vertices[i] : vertices[i], vertices[i + 1]); // world uvs
		}

		for (let i = 0, l = faces.length; i < l; i += 3) {
			if (negativeDepth) {
				indices.push(faces[i + 0], faces[i + 2], faces[i + 1]);
			} else {
				indices.push(faces[i + 0], faces[i + 1], faces[i + 2]);
			}
		}

		// bottom

		vertexCount = positions.length / 3;

		for (let i = 0, l = vertices.length; i < l; i += 2) {
			if (extrudePath) {
				setPosFromExtrudePath(extrudePath, vertices[i], vertices[i + 1], lastIndex, positions);
			} else {
				positions.push(vertices[i], vertices[i + 1], -depth); // x-y plane
			}
			uvs.push(negativeDepth ? vertices[i] : -vertices[i], vertices[i + 1]); // world uvs
		}

		for (let i = 0, l = faces.length; i < l; i += 3) {
			if (negativeDepth) {
				indices.push(vertexCount + faces[i + 1], vertexCount + faces[i + 2], vertexCount + faces[i + 0]);
			} else {
				indices.push(vertexCount + faces[i + 2], vertexCount + faces[i + 1], vertexCount + faces[i + 0]);
			}
		}

		// side

		vertexCount = positions.length / 3;
		const hasHoles = holeIndices.length;

		const loop = [];
		if (hasHoles) {
			loop.push([0, holeIndices[0] * 2]);
			for (let i = 0; i < holeIndices.length - 1; i++) {
				loop.push([holeIndices[i] * 2, holeIndices[i + 1] * 2]);
			}
			loop.push([holeIndices[holeIndices.length - 1] * 2, vertices.length]);
		} else {
			loop.push([0, vertices.length]);
		}
		for (let i = 0; i < loop.length; i++) {
			let dist = 0;
			const sideStart = loop[i][0];
			const sideFinish = loop[i][1];
			for (let j = sideStart; j < sideFinish; j += 2) {
				if (extrudePath) {
					const _index1 = j;
					const _index2 = (j + 2 >= sideFinish) ? sideStart : (j + 2);
					const _dist1 = dist;
					dist -= getLength(vertices[_index1 + 0], vertices[_index1 + 1], vertices[_index2 + 0], vertices[_index2 + 1]);
					const _dist2 = dist;
					for (let k = 0; k < lastIndex; k++) {
						if (k === 0) {
							setPosFromExtrudePath(extrudePath, vertices[_index1 + 0], vertices[_index1 + 1], k, positions);
							setPosFromExtrudePath(extrudePath, vertices[_index2 + 0], vertices[_index2 + 1], k, positions);
							uvs.push(0, extrudePath.lengths[k]);
							uvs.push(1, extrudePath.lengths[k]);
							vertexCount += 2;
						}

						setPosFromExtrudePath(extrudePath, vertices[_index1 + 0], vertices[_index1 + 1], k + 1, positions);
						setPosFromExtrudePath(extrudePath, vertices[_index2 + 0], vertices[_index2 + 1], k + 1, positions);
						uvs.push(_dist1, extrudePath.lengths[k + 1]);
						uvs.push(_dist2, extrudePath.lengths[k + 1]);
						indices.push(vertexCount - 2, vertexCount, vertexCount - 1);
						indices.push(vertexCount - 1, vertexCount, vertexCount + 1);

						vertexCount += 2;
					}
				} else {
					const _index1 = j;
					const _index2 = (j + 2 >= sideFinish) ? sideStart : (j + 2);

					positions.push(vertices[_index1 + 0], vertices[_index1 + 1], 0);
					positions.push(vertices[_index1 + 0], vertices[_index1 + 1], -depth);

					uvs.push(dist, 0);
					uvs.push(dist, -depth);

					positions.push(vertices[_index2 + 0], vertices[_index2 + 1], 0);
					positions.push(vertices[_index2 + 0], vertices[_index2 + 1], -depth);
					dist -= getLength(vertices[_index1 + 0], vertices[_index1 + 1], vertices[_index2 + 0], vertices[_index2 + 1]);

					uvs.push(dist, 0);
					uvs.push(dist, -depth);

					if (negativeDepth) {
						indices.push(vertexCount + 0, vertexCount + 1, vertexCount + 2);
						indices.push(vertexCount + 1, vertexCount + 3, vertexCount + 2);
					} else {
						indices.push(vertexCount + 0, vertexCount + 2, vertexCount + 1);
						indices.push(vertexCount + 1, vertexCount + 2, vertexCount + 3);
					}

					vertexCount += 4;
				}
			}
		}

		// return

		return {
			positions,
			uvs,
			indices
		};
	}

};

function getLength(x0, y0, x1, y1) {
	const x = x1 - x0;
	const y = y1 - y0;
	return Math.sqrt(x * x + y * y);
}

function setPosFromExtrudePath(extrudePath, x, y, index, positions) {
	normal.copy(extrudePath.normals[index]).multiplyScalar(x);
	binormal.copy(extrudePath.binormals[index]).multiplyScalar(y);
	pos.copy(extrudePath.points[index]).add(normal).add(binormal);
	positions.push(pos.x, pos.y, pos.z);
}
export { ExtrudeShapeBuilder };