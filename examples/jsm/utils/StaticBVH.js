import { Box3, Frustum, Matrix4 } from 't3d';

const _frustumMatrix = new Matrix4();
const _frustum = new Frustum();

class StaticBVH {

	constructor(items = [], options = {}) {
		this.items = items;
		this.leafSize = options.leafSize || 16;
		this.indices = [];
		this.nodes = [];
		this.root = -1;
		this._stack = [];
	}

	build() {
		const itemCount = this.items.length;

		this.indices.length = itemCount;
		for (let i = 0; i < itemCount; i++) {
			this.indices[i] = i;
		}

		this.nodes.length = 0;
		this.root = itemCount > 0 ? this._buildRange(0, itemCount) : -1;

		return this;
	}

	frustumCull(camera, worldMatrix, visibleIds) {
		if (Array.isArray(visibleIds)) {
			visibleIds.length = 0;
		}

		if (this.root === -1) {
			return 0;
		}

		_frustumMatrix.multiplyMatrices(camera.projectionMatrix, camera.viewMatrix).multiply(worldMatrix);
		_frustum.setFromMatrix(_frustumMatrix);

		const stack = this._stack;
		stack.length = 0;
		stack.push(this.root);

		let visibleCount = 0;

		while (stack.length > 0) {
			const node = this.nodes[stack.pop()];

			if (!_frustum.intersectsBox(node.bounds)) {
				continue;
			}

			if (node.left === -1) {
				for (let i = 0; i < node.count; i++) {
					const item = this.items[this.indices[node.start + i]];

					if (_frustum.intersectsSphere(item.boundingSphere)) {
						visibleIds[visibleCount++] = item.objectId;
					}
				}
			} else {
				stack.push(node.left, node.right);
			}
		}

		if (Array.isArray(visibleIds)) {
			visibleIds.length = visibleCount;
		}

		return visibleCount;
	}

	_buildRange(start, end) {
		const nodeIndex = this.nodes.length;
		const node = {
			bounds: new Box3(),
			left: -1,
			right: -1,
			start: start,
			count: end - start
		};

		this.nodes.push(node);

		for (let i = start; i < end; i++) {
			node.bounds.union(this.items[this.indices[i]].boundingBox);
		}

		if (node.count <= this.leafSize) {
			return nodeIndex;
		}

		const sizeX = node.bounds.max.x - node.bounds.min.x;
		const sizeY = node.bounds.max.y - node.bounds.min.y;
		const sizeZ = node.bounds.max.z - node.bounds.min.z;
		const axis = sizeX >= sizeY && sizeX >= sizeZ ? 'x' : (sizeY >= sizeZ ? 'y' : 'z');
		const mid = (start + end) >> 1;

		this.indices
			.slice(start, end)
			.sort((a, b) => this.items[a].boundingSphere.center[axis] - this.items[b].boundingSphere.center[axis])
			.forEach((value, offset) => {
				this.indices[start + offset] = value;
			});

		node.left = this._buildRange(start, mid);
		node.right = this._buildRange(mid, end);
		node.start = -1;
		node.count = 0;

		return nodeIndex;
	}

}

export { StaticBVH };
