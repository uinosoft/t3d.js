import { Vector3, Box3, Triangle } from "t3d";

class Octree {

	static generateOctreeFromNode(node, maxDepth = 5) {
		const triangles = [], box = new Box3();

		function addTriangle(triangle) {
			box.min.x = Math.min(box.min.x, triangle.a.x, triangle.b.x, triangle.c.x);
			box.min.y = Math.min(box.min.y, triangle.a.y, triangle.b.y, triangle.c.y);
			box.min.z = Math.min(box.min.z, triangle.a.z, triangle.b.z, triangle.c.z);
			box.max.x = Math.max(box.max.x, triangle.a.x, triangle.b.x, triangle.c.x);
			box.max.y = Math.max(box.max.y, triangle.a.y, triangle.b.y, triangle.c.y);
			box.max.z = Math.max(box.max.z, triangle.a.z, triangle.b.z, triangle.c.z);

			triangles.push(triangle);
		}

		node.traverse(child => {
			if (child.isMesh) {
				const geometry = child.geometry;
				const isIndexed = !!geometry.index;

				const positionBuffer = geometry.getAttribute('a_Position').buffer;
				const positionArray = positionBuffer.array;

				if (isIndexed) {
					const indexArray = geometry.index.buffer.array;
					for (let i = 0; i < indexArray.length; i += 3) {
						const a = indexArray[i];
						const b = indexArray[i + 1];
						const c = indexArray[i + 2];

						const v1 = new Vector3().fromArray(positionArray, a * 3);
						const v2 = new Vector3().fromArray(positionArray, b * 3);
						const v3 = new Vector3().fromArray(positionArray, c * 3);

						v1.applyMatrix4(child.worldMatrix);
						v2.applyMatrix4(child.worldMatrix);
						v3.applyMatrix4(child.worldMatrix);

						const triangle = new Triangle(v1, v2, v3);
						triangle._belong = child;

						addTriangle(triangle);
					}
				} else {
					for (let i = 0; i < positionBuffer.count; i += 3) {
						const v1 = new Vector3().fromArray(positionArray, i * 3);
						const v2 = new Vector3().fromArray(positionArray, (i + 1) * 3);
						const v3 = new Vector3().fromArray(positionArray, (i + 2) * 3);

						v1.applyMatrix4(child.worldMatrix);
						v2.applyMatrix4(child.worldMatrix);
						v3.applyMatrix4(child.worldMatrix);

						const triangle = new Triangle(v1, v2, v3);
						triangle._belong = child;

						addTriangle(triangle);
					}
				}
			}
		});

		// offset small amount to account for regular grid
		box.min.x -= 0.01;
		box.min.y -= 0.01;
		box.min.z -= 0.01;

		const octree = new Octree(box, maxDepth);
		octree.triangles = triangles;

		return octree.split(0);
	}

	constructor(box, maxDepth = 5) {
		this.box = box;
		this.maxDepth = maxDepth;

		this.triangles = [];
		this.subTrees = [];
	}

	split(level) {
		const subTrees = [];
		const halfSize = vec_0.copy(this.box.max).sub(this.box.min).multiplyScalar(0.5);

		for (let x = 0; x < 2; x++) {
			for (let y = 0; y < 2; y++) {
				for (let z = 0; z < 2; z++) {
					const box = new Box3();
					const v = vec_1.set(x, y, z);

					box.min.copy(this.box.min).add(v.multiply(halfSize));
					box.max.copy(box.min).add(halfSize);

					subTrees.push(new Octree(box, this.maxDepth));
				}
			}
		}

		let triangle;

		while (triangle = this.triangles.pop()) {
			for (let i = 0; i < subTrees.length; i++) {
				if (subTrees[i].box.intersectsTriangle(triangle)) {
					subTrees[i].triangles.push(triangle);
				}
			}
		}

		for (let i = 0; i < subTrees.length; i++) {
			const len = subTrees[i].triangles.length;

			if (len > 8 && level < this.maxDepth) {
				subTrees[i].split(level + 1);
			}

			if (len !== 0) {
				this.subTrees.push(subTrees[i]);
			}
		}

		return this;
	}

	getRayTriangles(ray, triangles) {
		for (let i = 0; i < this.subTrees.length; i++) {
			const subTree = this.subTrees[i];
			if (!ray.intersectsBox(subTree.box)) continue;

			if (subTree.triangles.length > 0) {
				for (let j = 0; j < subTree.triangles.length; j++) {
					if (triangles.indexOf(subTree.triangles[j]) === -1) triangles.push(subTree.triangles[j]);
				}
			} else {
				subTree.getRayTriangles(ray, triangles);
			}
		}

		return triangles;
	}

	rayIntersect(ray) {
		if (ray.direction.getLength() === 0) return;

		const triangles = [];
		let triangle, position, distance = 1e100;

		this.getRayTriangles(ray, triangles);

		for (let i = 0; i < triangles.length; i++) {
			const result = ray.intersectTriangle(triangles[i].a, triangles[i].b, triangles[i].c, true, vec_1);

			if (result) {
				const tempDistnce = result.sub(ray.origin).getLength();

				if (distance > tempDistnce) {
					position = result.clone().add(ray.origin);
					distance = tempDistnce;
					triangle = triangles[i];
				}
			}
		}

		return distance < 1e100 ? { distance: distance, triangle: triangle, position: position, target: triangle.belong  } : null;
	}

}

const vec_0 = new Vector3();
const vec_1 = new Vector3();

export { Octree };