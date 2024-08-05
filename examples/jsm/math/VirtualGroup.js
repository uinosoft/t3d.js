import { Matrix4, Box3, Vector3 } from 't3d';

/**
 * This is a virtual group for objects.
 * With this, you can manipulate all objects as if they were a single object.
 */
class VirtualGroup {

	constructor() {
		this._objects = [];

		this._anchorType = 'center'; // 'center' or 'pivot'
		this._coordinateType = 'local'; // 'local' or 'global'

		this._dirtyFlag = DirtyFlag.All;

		this._worldMatrix = new Matrix4();
	}

	set anchorType(value) {
		if (this._anchorType === value) return;
		this._anchorType = value;
		this._dirtyFlag |= DirtyFlag.AnchorDirty;
	}

	get anchorType() {
		return this._anchorType;
	}

	set coordinateType(value) {
		if (this._coordinateType === value) return;
		this._coordinateType = value;
		this._dirtyFlag |= DirtyFlag.CoordinateDirty;
	}

	get coordinateType() {
		return this._coordinateType;
	}

	get objects() {
		return this._objects;
	}

	addObject(object, checkRelationship = false) {
		let canAdd = true;

		for (let i = this._objects.length - 1; i >= 0; i--) {
			const existingObject = this._objects[i];

			if (existingObject === object) {
				canAdd = false;
				break;
			}

			if (checkRelationship) {
				if (isChildOf(existingObject, object)) {
					canAdd = false;
					break;
				} else if (isChildOf(object, existingObject)) {
					this.deleteObject(existingObject);
				}
			}
		}

		if (canAdd) {
			this._objects.push(object);
			this._dirtyFlag |= DirtyFlag.All;
		}

		return canAdd;
	}

	deleteObject(object) {
		const index = this._objects.indexOf(object);
		if (index === -1) return false;
		this._objects.splice(index, 1);
		this._dirtyFlag |= DirtyFlag.All;
		return true;
	}

	reset() {
		this._objects = [];
		this._dirtyFlag |= DirtyFlag.All;
	}

	dirty(anchor = true, coordinate = true) {
		if (anchor) this._dirtyFlag |= DirtyFlag.AnchorDirty;
		if (coordinate) this._dirtyFlag |= DirtyFlag.CoordinateDirty;
	}

	getWorldMatrix(matrix) {
		const e = this._worldMatrix.elements;

		if (this._objects.length === 0) {
			this._worldMatrix.identity();
			return matrix.copy(this._worldMatrix);
		}

		if (this._dirtyFlag & DirtyFlag.AnchorDirty) {
			this._anchorDirty = false;

			if (this._anchorType === 'center') {
				this._getCenter(_vec3_1);
			} else if (this._anchorType === 'pivot') {
				this._getPivot(_vec3_1);
			}
			e[12] = _vec3_1.x; e[13] = _vec3_1.y; e[14] = _vec3_1.z;

			this._dirtyFlag &= ~DirtyFlag.AnchorDirty;
		}

		if (this._dirtyFlag & DirtyFlag.CoordinateDirty) {
			if (this._coordinateType === 'local') {
				// align to first entity
				const wE = this._objects[0].worldMatrix.elements;
				const sx = 1 / Math.sqrt(wE[0] * wE[0] + wE[1] * wE[1] + wE[2] * wE[2]);
				const sy = 1 / Math.sqrt(wE[4] * wE[4] + wE[5] * wE[5] + wE[6] * wE[6]);
				const sz = 1 / Math.sqrt(wE[8] * wE[8] + wE[9] * wE[9] + wE[10] * wE[10]);
				e[0] = wE[0] * sx; e[4] = wE[4] * sy; e[8] = wE[8] * sz;
				e[1] = wE[1] * sx; e[5] = wE[5] * sy; e[9] = wE[9] * sz;
				e[2] = wE[2] * sx; e[6] = wE[6] * sy; e[10] = wE[10] * sz;
			} else if (this._coordinateType === 'global') {
				e[0] = 1; e[4] = 0; e[8] = 0;
				e[1] = 0; e[5] = 1; e[9] = 0;
				e[2] = 0; e[6] = 0; e[10] = 1;
			}

			this._dirtyFlag &= ~DirtyFlag.CoordinateDirty;
		}

		return matrix.copy(this._worldMatrix);
	}

	setWorldMatrix(matrix) {
		const worldMatrixInverse = this.getWorldMatrix(_mat4_1).inverse();
		this._worldMatrix.copy(matrix);
		const offsetMatrix = _mat4_2.multiplyMatrices(matrix, worldMatrixInverse);
		this._objects.forEach(object => {
			object.worldMatrix.multiplyMatrices(offsetMatrix, object.worldMatrix);
			const parentMatrixInverse = _mat4_1.getInverse(object.parent.worldMatrix);
			object.matrix.multiplyMatrices(parentMatrixInverse, object.worldMatrix);
			object.matrix.decompose(object.position, object.quaternion, object.scale);
		});
		this._dirtyFlag = DirtyFlag.None;
	}

	_getCenter(center) {
		_box3_1.makeEmpty();
		this._objects.forEach(object => {
			object.traverse(child => {
				if (child.isMesh) {
					_box3_2.copy(child.geometry.boundingBox);
					_box3_2.applyMatrix4(child.worldMatrix);
					_box3_1.expandByBox3(_box3_2);
				} else {
					_vec3_1.setFromMatrixPosition(child.worldMatrix);
					_box3_1.expandByPoint(_vec3_1);
				}
			});
		});
		return _box3_1.getCenter(center);
	}

	_getPivot(pivot) {
		_box3_1.makeEmpty();
		this._objects.forEach(object => {
			_vec3_1.setFromMatrixPosition(object.worldMatrix);
			_box3_1.expandByPoint(_vec3_1);
		});
		return _box3_1.getCenter(pivot);
	}

}

const DirtyFlag = {
	None: 0,
	AnchorDirty: 1,
	CoordinateDirty: 2,
	All: 3
};

const _vec3_1 = new Vector3();
const _box3_1 = new Box3();
const _box3_2 = new Box3();
const _mat4_1 = new Matrix4();
const _mat4_2 = new Matrix4();

function isChildOf(parent, child) {
	while (child.parent) {
		if (parent === child.parent) return true;
		child = child.parent;
	}
	return false;
}

export { VirtualGroup };