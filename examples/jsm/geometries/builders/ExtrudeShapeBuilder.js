import { Vector3 } from 't3d';
import { Earcut } from './Earcut.js';
import { GeometryBuilderUtils } from './GeometryBuilderUtils.js';

/**
 * ExtrudeShapeBuilder
 */
const ExtrudeShapeBuilder = {

	/**
     * @param {Object} shape - The shape.
     * @param {Array} shape.contour - The holes of this shape, for example: [[0, 0], [0, 5], [5, 5], [5, 0]]
     * @param {Array} shape.holes - The holes of this shape, for example: [[[1, 3], [1, 4], [4, 4], [4, 3]], [[1, 1], [1, 2], [4, 1]]]
	 * @param {Array} [shape.depth=1] - The depth of this shape. If it is a negative number, extrude in the positive direction of the z-axis, otherwise, extrude in the negative direction of the z-axis.
	 * @param {Boolean} [shape.generateTop=true] - Whether to generate the top face.
	 * @param {Boolean} [shape.generateBottom=true] - Whether to generate the bottom face.
	 * @param {Object} [shape.pathFrames] - The path frames data. If it is not undefined, the shape will be extruded along the path.
     */
	getGeometryData: function(shape) {
		const depth = (shape.depth !== undefined) ? shape.depth : 1;
		const generateTop = (shape.generateTop !== undefined) ? shape.generateTop : true;
		const generateBottom = (shape.generateBottom !== undefined) ? shape.generateBottom : true;
		const pathFrames = shape.pathFrames;

		let negativeDepth = false;
		if (!pathFrames) {
			negativeDepth = depth < 0;
		}

		const vertices = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
		const holeIndices = []; // array of hole indices

		GeometryBuilderUtils.convertShapeDataToEarcut(shape, vertices, holeIndices);

		const faces = Earcut.triangulate(vertices, holeIndices);

		// build vertex data

		const positions = [];
		const uvs = [];
		const indices = [];

		let vertexCount = 0;

		// top

		if (generateTop) {
			for (let i = 0, l = vertices.length; i < l; i += 2) {
				if (pathFrames) {
					setPositionByPathFrames(pathFrames, 0, vertices[i], vertices[i + 1], positions);
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
		}

		// bottom

		if (generateBottom) {
			vertexCount = positions.length / 3;

			for (let i = 0, l = vertices.length; i < l; i += 2) {
				if (pathFrames) {
					setPositionByPathFrames(pathFrames, pathFrames.points.length - 1, vertices[i], vertices[i + 1], positions);
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

		const steps = pathFrames ? pathFrames.points.length - 1 : 1;

		for (let i = 0; i < loop.length; i++) {
			let dist = 0;

			const sideStart = loop[i][0];
			const sideFinish = loop[i][1];

			for (let j = sideStart; j < sideFinish; j += 2) {
				const _index1 = j;
				const _index2 = (j + 2 >= sideFinish) ? sideStart : (j + 2);

				const _dist1 = dist;
				const _dist2 = dist - getLength(vertices[_index1 + 0], vertices[_index1 + 1], vertices[_index2 + 0], vertices[_index2 + 1]);

				dist = _dist2;

				for (let s = 0; s <= steps; s++) {
					if (pathFrames) {
						setPositionByPathFrames(pathFrames, s, vertices[_index1 + 0], vertices[_index1 + 1], positions);
						setPositionByPathFrames(pathFrames, s, vertices[_index2 + 0], vertices[_index2 + 1], positions);

						uvs.push(_dist1, -pathFrames.lengths[s]);
						uvs.push(_dist2, -pathFrames.lengths[s]);
					} else {
						const _depth = -depth / steps * s;

						positions.push(vertices[_index1 + 0], vertices[_index1 + 1], _depth);
						positions.push(vertices[_index2 + 0], vertices[_index2 + 1], _depth);

						uvs.push(_dist1, _depth);
						uvs.push(_dist2, _depth);
					}

					if (s > 0) {
						if (negativeDepth) {
							indices.push(vertexCount - 2, vertexCount + 0, vertexCount - 1);
							indices.push(vertexCount - 1, vertexCount + 0, vertexCount + 1);
						} else {
							indices.push(vertexCount - 2, vertexCount - 1, vertexCount + 0);
							indices.push(vertexCount - 1, vertexCount + 1, vertexCount + 0);
						}
					}

					vertexCount += 2;
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

const normal = new Vector3();
const binormal = new Vector3();
const position = new Vector3();

function setPositionByPathFrames(frames, index, x, y, positions) {
	normal.copy(frames.normals[index]).multiplyScalar(y);
	binormal.copy(frames.binormals[index]).multiplyScalar(x);
	position.copy(frames.points[index]).add(normal).add(binormal);
	positions.push(position.x, position.y, position.z);
}

export { ExtrudeShapeBuilder };