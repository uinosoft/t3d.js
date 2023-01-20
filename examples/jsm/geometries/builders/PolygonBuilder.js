import { Earcut } from './Earcut.js';
import { GeometryBuilderUtils } from './GeometryBuilderUtils.js';

/**
 * PolygonBuilder
 */
var PolygonBuilder = {

	/**
     * @param {Object} shape - The shape.
     * @param {Array} shape.contour - The holes of this shape, for example: [[0, 0], [0, 5], [5, 5], [5, 0]]
     * @param {Array} shape.holes - The holes of this shape, for example: [[[1, 3], [1, 4], [4, 4], [4, 3]], [[1, 1], [1, 2], [4, 1]]]
     */
	getGeometryData: function(shape) {
		var vertices = []; // flat array of vertices like [ x0,y0, x1,y1, x2,y2, ... ]
		var holeIndices = []; // array of hole indices

		GeometryBuilderUtils.convertShapeDataToEarcut(shape, vertices, holeIndices);

		var indices = Earcut.triangulate(vertices, holeIndices);

		// build vertex data

		var positions = [];
		var normals = [];
		var uvs = [];

		for (let i = 0, l = vertices.length; i < l; i += 2) {
			positions.push(vertices[i], vertices[i + 1], 0); // x-y plane
			normals.push(0, 0, 1); // positive z
			uvs.push(vertices[i], vertices[i + 1]); // world uvs
		}

		// return

		return {
			positions,
			normals,
			uvs,
			indices
		};
	}

}

export { PolygonBuilder };