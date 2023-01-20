import { Geometry } from './Geometry.js';
import { Buffer } from './Buffer.js';
import { Attribute } from './Attribute.js';
import { Vector3 } from '../../math/Vector3.js';

/**
 * BoxGeometry is the quadrilateral primitive geometry class.
 * It is typically used for creating a cube or irregular quadrilateral of the dimensions provided with the 'width', 'height', and 'depth' constructor arguments.
 * @memberof t3d
 * @extends t3d.Geometry
 */
class BoxGeometry extends Geometry {

	/**
	 * @param {Number} [width=1] - Width of the sides on the X axis.
	 * @param {Number} [height=1] - Height of the sides on the Y axis.
	 * @param {Number} [depth=1] - Depth of the sides on the Z axis.
	 * @param {Number} [widthSegments=1] - Number of segmented faces along the width of the sides.
	 * @param {Number} [heightSegments=1] - Number of segmented faces along the height of the sides.
	 * @param {Number} [depthSegments=1] - Number of segmented faces along the depth of the sides.
	 */
	constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
		super();

		const scope = this;

		// segments

		widthSegments = Math.floor(widthSegments);
		heightSegments = Math.floor(heightSegments);
		depthSegments = Math.floor(depthSegments);

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// helper variables

		let numberOfVertices = 0;
		let groupStart = 0;

		// build each side of the box geometry

		buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, 0); // px
		buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, 1); // nx
		buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
		buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, 3); // ny
		buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, 4); // pz
		buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, 5); // nz

		// build geometry

		this.setIndex(new Attribute(new Buffer(
			(vertices.length / 3) > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
			1
		)));
		this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
		this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));
		this.addAttribute('a_Uv', new Attribute(new Buffer(new Float32Array(uvs), 2)));

		function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {
			const segmentWidth = width / gridX;
			const segmentHeight = height / gridY;

			const widthHalf = width / 2;
			const heightHalf = height / 2;
			const depthHalf = depth / 2;

			const gridX1 = gridX + 1;
			const gridY1 = gridY + 1;

			let vertexCounter = 0;
			let groupCount = 0;

			const vector = new Vector3();

			// generate vertices, normals and uvs

			for (let iy = 0; iy < gridY1; iy++) {
				const y = iy * segmentHeight - heightHalf;

				for (let ix = 0; ix < gridX1; ix++) {
					const x = ix * segmentWidth - widthHalf;

					// set values to correct vector component

					vector[u] = x * udir;
					vector[v] = y * vdir;
					vector[w] = depthHalf;

					// now apply vector to vertex buffer

					vertices.push(vector.x, vector.y, vector.z);

					// set values to correct vector component

					vector[u] = 0;
					vector[v] = 0;
					vector[w] = depth > 0 ? 1 : -1;

					// now apply vector to normal buffer

					normals.push(vector.x, vector.y, vector.z);

					// uvs

					uvs.push(ix / gridX);
					uvs.push(1 - (iy / gridY));

					// counters

					vertexCounter += 1;
				}
			}

			// indices

			// 1. you need three indices to draw a single face
			// 2. a single segment consists of two faces
			// 3. so we need to generate six (2*3) indices per segment

			for (let iy = 0; iy < gridY; iy++) {
				for (let ix = 0; ix < gridX; ix++) {
					const a = numberOfVertices + ix + gridX1 * iy;
					const b = numberOfVertices + ix + gridX1 * (iy + 1);
					const c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
					const d = numberOfVertices + (ix + 1) + gridX1 * iy;

					// faces

					indices.push(a, b, d);
					indices.push(b, c, d);

					// increase counter

					groupCount += 6;
				}
			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup(groupStart, groupCount, materialIndex);

			// calculate new start value for groups

			groupStart += groupCount;

			// update total number of vertices

			numberOfVertices += vertexCounter;
		}

		this.computeBoundingBox();
		this.computeBoundingSphere();
	}

}

export { BoxGeometry };