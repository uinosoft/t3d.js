import {
	Box2,
	Matrix3
} from 't3d';

class Object2D {

	constructor() {
		this.width = 0;
		this.height = 0;

		// bla bla ...
		this.x = 0;
		this.y = 0;
		this.rotation = 0;
		this.scaleX = 1;
		this.scaleY = 1;
		this.anchorX = 0;
		this.anchorY = 0;

		// a 3x3 transform matrix
		this.matrix = new Matrix3();
		// used to cache world transform
		this.worldMatrix = new Matrix3();

		// children
		this.children = new Array();
		// parent
		this.parent = null;

		this.boundingBox = new Box2();
	}

	/**
	 * add child to object2d
	 */
	add(object) {
		this.children.push(object);
		object.parent = this;
	}

	/**
	 * remove child from object2d
	 */
	remove(object) {
		const index = this.children.indexOf(object);
		if (index !== -1) {
			this.children.splice(index, 1);
		}
		object.parent = null;
	}

	/**
	 * get object by name
	 */
	getObjectByName(name) {
		return this.getObjectByProperty('name', name);
	}

	/**
	 * get object by property
	 */
	getObjectByProperty(name, value) {
		if (this[name] === value) return this;

		for (let i = 0, l = this.children.length; i < l; i++) {
			const child = this.children[i];
			const object = child.getObjectByProperty(name, value);

			if (object !== undefined) {
				return object;
			}
		}

		return undefined;
	}

	/**
	 * update matrix
	 */
	updateMatrix() {
		const matrix = this.matrix.transform(this.x, this.y, this.scaleX, this.scaleY, this.rotation, this.anchorX * this.width, this.anchorY * this.height);

		this.worldMatrix.copy(matrix);

		if (this.parent) {
			const parentMatrix = this.parent.worldMatrix;
			this.worldMatrix.premultiply(parentMatrix);
		}

		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) {
			children[i].updateMatrix();
		}
	}

	computeBoundingBox() {
		this.boundingBox.set(this.x, this.y, this.x + this.width, this.y + this.height);
	}

}

export { Object2D };