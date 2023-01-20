import {
	Attribute,
	Buffer,
	Geometry,
	LineMaterial,
	Mesh,
	Matrix3,
	Vector3
} from 't3d';

const _v1 = new Vector3();
const _v2 = new Vector3();
const _normalMatrix = new Matrix3();

class VertexNormalsHelper extends Mesh {

	constructor(object, size = 1, color = 0xff0000) {
		const geometry = new Geometry();

		const nNormals = object.geometry.attributes.a_Normal.buffer.count;
		const positions = new Attribute(new Buffer(new Float32Array(nNormals * 2 * 3), 3));

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
			_normalMatrix.setFromMatrix4(this.object.worldMatrix).inverse().transpose();

			const matrixWorld = this.object.worldMatrix;

			const positionBuffer = this.geometry.attributes.a_Position.buffer;

			const objPos = objGeometry.attributes.a_Position.buffer;
			const objNorm = objGeometry.attributes.a_Normal.buffer;

			let idx = 0;

			for (let j = 0, jl = objPos.count; j < jl; j++) {
				_v1.fromArray(objPos.array, j * 3).applyMatrix4(matrixWorld);

				_v2.fromArray(objNorm.array, j * 3);

				_v2.applyMatrix3(_normalMatrix).normalize().multiplyScalar(this.size).add(_v1);

				positionBuffer.array[idx++] = _v1.x;
				positionBuffer.array[idx++] = _v1.y;
				positionBuffer.array[idx++] = _v1.z;

				positionBuffer.array[idx++] = _v2.x;
				positionBuffer.array[idx++] = _v2.y;
				positionBuffer.array[idx++] = _v2.z;
			}

			// Skip update bounding box
			// Because we may not want to consider the helper's bounding box
			this.geometry.computeBoundingSphere();

			positionBuffer.version++;
		}
	}

}

VertexNormalsHelper.prototype.isVertexNormalsHelper = true;

export { VertexNormalsHelper };