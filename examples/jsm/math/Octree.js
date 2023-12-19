import { Vector3, Box3 } from 't3d';

class Octree {

	constructor(box = new Box3(), depth = 0) {
		this.box = box;
		this.depth = depth;

		this.subTrees = [];

		this.elements = [];

		this.elementTest = function(box, element) {
			return box.containsPoint(element);
		};
	}

	isEmpty() {
		return this.elements.length === 0 && this.subTrees.length === 0;
	}

	divideElements(maxDepth = 5, capacity = 8) {
		const { depth, subTrees, elements, elementTest } = this;

		if (depth >= maxDepth || elements.length <= capacity) return;

		this.subdivide();

		// distribute elements to subTrees
		let element = this.elements.pop();
		while (element) {
			for (let i = 0; i < subTrees.length; i++) {
				if (elementTest(subTrees[i].box, element)) {
					subTrees[i].elements.push(element);
				}
			}
			element = this.elements.pop();
		}

		// recursive call
		subTrees.forEach(subTree => subTree.divideElements(maxDepth, capacity));
	}

	addElement(element, maxDepth = 5, capacity = 8) {
		const { box, depth, subTrees, elements, elementTest } = this;

		if (!elementTest(box, element)) {
			return false;
		}

		if (subTrees.length === 0) {
			elements.push(element);

			if (elements.length > capacity && depth < maxDepth) {
				this.divideElements(maxDepth, capacity);
			}

			return true;
		}

		for (let i = 0; i < subTrees.length; i++) {
			if (subTrees[i].addElement(element, maxDepth, capacity)) {
				return true;
			}
		}
	}

	removeElement(element) {
		const elements = this.elements;
		const index = elements.indexOf(element);

		if (index !== -1) {
			elements.splice(index, 1);
			return true;
		}

		const subTrees = this.subTrees;

		for (let i = 0; i < subTrees.length; i++) {
			if (subTrees[i].removeElement(element)) {
				return true;
			}
		}

		return false;
	}

	subdivide() {
		const halfSize = _vec3_1.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);
		_subdivideArray.forEach((v, i) => {
			const box = new Box3();

			box.min.copy(this.box.min).add(_vec3_2.copy(v).multiply(halfSize));
			box.max.copy(box.min).add(halfSize);

			this.subTrees[i] = new this.constructor(box, this.depth + 1);
		});
	}

	count() {
		let count = 1;

		for (let i = 0; i < this.subTrees.length; i++) {
			count += this.subTrees[i].count();
		}

		return count;
	}

	dispose() {
		this.subTrees.forEach(subTree => subTree.dispose());
		this.subTrees.length = 0;
		this.elements.length = 0;
	}

}

const _subdivideArray = [
	new Vector3(0, 0, 0),
	new Vector3(0, 0, 1),
	new Vector3(0, 1, 0),
	new Vector3(0, 1, 1),
	new Vector3(1, 0, 0),
	new Vector3(1, 0, 1),
	new Vector3(1, 1, 0),
	new Vector3(1, 1, 1)
];

const _vec3_1 = new Vector3();
const _vec3_2 = new Vector3();

export { Octree };