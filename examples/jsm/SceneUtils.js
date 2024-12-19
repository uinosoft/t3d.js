import { Box3, Matrix4, Vector3 } from 't3d';

class SceneUtils {

	static getRelativeMatrixFromRoot(node, root, target = new Matrix4()) {
		target.identity();

		let tempNode = node;

		while (tempNode !== root && tempNode !== null) {
			if (tempNode.matrixAutoUpdate || tempNode.matrixNeedsUpdate) {
				tempNode.matrix.transform(tempNode.position, tempNode.scale, tempNode.quaternion);
				tempNode.matrixNeedsUpdate = false;
				tempNode.worldMatrixNeedsUpdate = true;
			}

			target.premultiply(tempNode.matrix);

			tempNode = tempNode.parent;
		}

		return target;
	}

	static expandBox3ByObject(object, root, target, precise) {
		const geometry = object.geometry;

		if (geometry) {
			const matrix = root ?
				this.getRelativeMatrixFromRoot(object, root, _mat4_1)
				: object.worldMatrix;

			const box = precise ?
				this.computeMeshAccurateBoundings(object, _box3_1)
				: _box3_1.copy(geometry.boundingBox);

			box.applyMatrix4(matrix);

			target.expandByBox3(box);
		}

		const children = object.children;

		for (let i = 0, l = children.length; i < l; i++) {
			this.expandBox3ByObject(children[i], root, target, precise);
		}

		return target;
	}

	static setBox3FromObject(object, root, target = new Box3(), precise = false) {
		target.makeEmpty();
		return this.expandBox3ByObject(object, root, target, precise);
	}

	static computeMeshAccurateBoundings(mesh, target) {
		target.makeEmpty();

		const positionAttribute = mesh.geometry.attributes.a_Position;

		for (let i = 0; i < positionAttribute.buffer.count; i++) {
			mesh.getVertexPosition(i, _vec3_1);
			target.expandByPoint(_vec3_1);
		}

		return target;
	}

}

const _box3_1 = new Box3();
const _mat4_1 = new Matrix4();
const _vec3_1 = new Vector3();

export { SceneUtils };