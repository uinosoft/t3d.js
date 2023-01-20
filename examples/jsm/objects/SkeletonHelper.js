import {
	Attribute,
	Buffer,
	Color3,
	Geometry,
	LineMaterial,
	Matrix4,
	Mesh,
	VERTEX_COLOR,
	Vector3
} from 't3d';

class SkeletonHelper extends Mesh {

	constructor(object) {
		const bones = getBoneList(object);

		const geometry = new Geometry();

		const vertices = [];
		const colors = [];

		const color1 = new Color3(0, 0, 1);
		const color2 = new Color3(0, 1, 0);

		for (let i = 0; i < bones.length; i++) {
			const bone = bones[i];

			if (bone.parent && bone.parent.isBone) {
				vertices.push(0, 0, 0);
				vertices.push(0, 0, 0);
				colors.push(color1.r, color1.g, color1.b, 1);
				colors.push(color2.r, color2.g, color2.b, 1);
			}
		}

		geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
		geometry.addAttribute('a_Color', new Attribute(new Buffer(new Float32Array(colors), 4)));

		const material = new LineMaterial();
		material.vertexColors = VERTEX_COLOR.RGBA;
		material.depthTest = false;
		material.depthWrite = false;
		material.transparent = true;

		super(geometry, material);

		this.frustumCulled = false;

		this.root = object;
		this.bones = bones;
	}

	updateMatrix(force) {
		const bones = this.bones;

		const geometry = this.geometry;
		const position = geometry.getAttribute('a_Position');

		worldMatrixInv.getInverse(this.root.worldMatrix);

		for (let i = 0, j = 0; i < bones.length; i++) {
			const bone = bones[i];

			if (bone.parent && bone.parent.isBone) {
				boneMatrix.multiplyMatrices(worldMatrixInv, bone.worldMatrix);
				vector.setFromMatrixPosition(boneMatrix);

				position.buffer.array[j * position.size + 0] = vector.x;
				position.buffer.array[j * position.size + 1] = vector.y;
				position.buffer.array[j * position.size + 2] = vector.z;

				boneMatrix.multiplyMatrices(worldMatrixInv, bone.parent.worldMatrix);
				vector.setFromMatrixPosition(boneMatrix);

				position.buffer.array[(j + 1) * position.size + 0] = vector.x;
				position.buffer.array[(j + 1) * position.size + 1] = vector.y;
				position.buffer.array[(j + 1) * position.size + 2] = vector.z;

				j += 2;
			}
		}

		position.buffer.version++;

		super.updateMatrix(force);
	}

}

const vector = new Vector3();
const boneMatrix = new Matrix4();
const worldMatrixInv = new Matrix4();

function getBoneList(object) {
	const boneList = [];

	if (object && object.isBone) {
		boneList.push(object);
	}

	for (let i = 0; i < object.children.length; i++) {
		boneList.push.apply(boneList, getBoneList(object.children[i]));
	}

	return boneList;
}

export { SkeletonHelper };