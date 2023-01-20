import {
	Attribute,
	Buffer,
	Geometry,
	LineMaterial,
	Mesh,
	Vector3
} from 't3d';

const _v1 = new Vector3();
const _v2 = new Vector3();

class VertexTangentsHelper extends Mesh {

	constructor(object, size = 1, color = 0x00ffff) {
		const geometry = new Geometry();

		const nTangents = object.geometry.attributes.a_Tangent.buffer.count;
		const positions = new Attribute(new Buffer(new Float32Array(nTangents * 2 * 3), 3));

		geometry.addAttribute('a_Position', positions);

		const material = new LineMaterial();
		material.diffuse.setHex(color);

		super(geometry, material);

		this.object = object;
		this.size = size;

		this.update();
	}

	update() {
		this.object.updateMatrix(true);

		const objGeometry = this.object.geometry;

		if (objGeometry) {
			const matrixWorld = this.object.worldMatrix;

			const position = this.geometry.attributes.a_Position.buffer;

			const objPos = objGeometry.attributes.a_Position.buffer;
			const objTan = objGeometry.attributes.a_Tangent.buffer;

			let idx = 0;

			for (let j = 0, jl = objPos.count; j < jl; j++) {
				_v1.fromArray(objPos.array, j * 3).applyMatrix4(matrixWorld);

				_v2.fromArray(objTan.array, j * 3);

				_v2.transformDirection(matrixWorld).multiplyScalar(this.size).add(_v1);

				position.array[idx++] = _v1.x;
				position.array[idx++] = _v1.y;
				position.array[idx++] = _v1.z;

				position.array[idx++] = _v2.x;
				position.array[idx++] = _v2.y;
				position.array[idx++] = _v2.z;
			}

			// Skip update bounding box
			// Because we may not want to consider the helper's bounding box
			this.geometry.computeBoundingSphere();

			position.version++;
		}
	}

}

VertexTangentsHelper.prototype.isVertexTangentsHelper = true;

export { VertexTangentsHelper };