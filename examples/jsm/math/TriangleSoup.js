import { Vector3, DRAW_MODE, MathUtils } from 't3d';

/**
 * TriangleSoup - A data structure for storing and manipulating triangle geometry
 * Useful for physics engines, navigation mesh generation, and other applications
 * that require raw triangle data with efficient operations.
 */
class TriangleSoup {

	/**
	 * Create a new TriangleSoup instance
	 */
	constructor() {
		/**
		 * Array of vertex positions [x1,y1,z1, x2,y2,z2, ...]
		 * @type {Array<number>}
		 */
		this.positions = [];

		/**
		 * Array of vertex indices, each triplet forms a triangle
		 * @type {Array<number>}
		 */
		this.indices = [];
	}

	/**
	 * Add a mesh to the TriangleSoup
	 * @param {Mesh} mesh - The mesh to add
	 * @param {Matrix4} [matrix=mesh.worldMatrix] - The transformation matrix to apply to the vertices
	 * @returns {TriangleSoup} - The TriangleSoup instance
	 */
	addMesh(mesh, matrix = mesh.worldMatrix) {
		const { positions, indices } = this;

		const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
		const isTriangleMesh = material && material.drawMode === DRAW_MODE.TRIANGLES;

		if (!isTriangleMesh) return;

		const geometry = mesh.geometry;

		const positionAttribute = geometry.attributes.a_Position;

		if (!positionAttribute) return;

		const positionArray = positionAttribute.buffer.array;
		const positionStart = positions.length;

		for (let i = 0, l = positionArray.length; i < l; i += 3) {
			_vec3_1.fromArray(positionArray, i, positionAttribute.normalized);
			_vec3_1.applyMatrix4(matrix);
			_vec3_1.toArray(positions, positionStart + i);
		}

		const indexAttribute = geometry.index;

		if (indexAttribute) {
			const indexArray = indexAttribute.buffer.array;

			for (let i = 0, l = indexArray.length; i < l; i++) {
				const copyIndex = indexAttribute.normalized ? MathUtils.denormalize(indexArray[i], indexArray) : indexArray[i];
				indices.push(positionStart / 3 + copyIndex);
			}
		} else {
			for (let i = 0, l = positionArray.length / 3; i < l; i++) {
				indices.push(positionStart / 3 + i);
			}
		}

		return this;
	}

	/**
	 * Merge vertices in the TriangleSoup
	 * @param {number} [tolerance=1e-4] - The tolerance for merging vertices
	 * @returns {TriangleSoup} - The TriangleSoup instance
	 */
	mergeVertices(tolerance = 1e-4) {
		tolerance = Math.max(tolerance, Number.EPSILON);

		const { positions, indices } = this;

		const hashToIndex = {};
		const newPositions = [];
		const newIndices = [];

		const halfTolerance = tolerance * 0.5;
		const exponent = Math.log10(1 / tolerance);
		const hashMultiplier = Math.pow(10, exponent);
		const hashAdditive = halfTolerance * hashMultiplier;

		for (let i = 0; i < indices.length; i++) {
			const index = indices[i];
			_vec3_1.fromArray(positions, index * 3);
			let hash = '';

			hash += `${~~(_vec3_1.x * hashMultiplier + hashAdditive)},`;
			hash += `${~~(_vec3_1.y * hashMultiplier + hashAdditive)},`;
			hash += `${~~(_vec3_1.z * hashMultiplier + hashAdditive)},`;

			if (hash in hashToIndex) {
				newIndices.push(hashToIndex[hash]);
			} else {
				const newIndex = newPositions.length / 3;
				newPositions.push(_vec3_1.x, _vec3_1.y, _vec3_1.z);
				hashToIndex[hash] = newIndex;
				newIndices.push(newIndex);
			}
		}

		this.positions = newPositions;
		this.indices = newIndices;

		return this;
	}

	/**
	 * Clear the TriangleSoup
	 */
	clear() {
		this.positions.length = 0;
		this.indices.length = 0;
	}

}

const _vec3_1 = new Vector3();

export { TriangleSoup };