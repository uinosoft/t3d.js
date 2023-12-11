import { Box3, Matrix4 } from 't3d';

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

	static expandBox3ByObject(object, root, target) {
		const geometry = object.geometry;

		if (geometry) {
			const matrix = root ?
				this.getRelativeMatrixFromRoot(object, root, _mat4_1)
				: object.worldMatrix;

			_box3_1.copy(geometry.boundingBox);
			_box3_1.applyMatrix4(matrix);

			target.expandByBox3(_box3_1);
		}

		const children = object.children;

		for (let i = 0, l = children.length; i < l; i++) {
			this.expandBox3ByObject(children[i], root, target);
		}
	}

	static setBox3FromObject(object, root, target = new Box3()) {
		target.makeEmpty();
		return this.expandBox3ByObject(object, root, target);
	}

}

const _box3_1 = new Box3();
const _mat4_1 = new Matrix4();

export { SceneUtils };