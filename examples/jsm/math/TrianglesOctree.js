import { Vector3, Box3, Triangle } from 't3d';
import { Octree } from './Octree.js';

class TrianglesOctree extends Octree {

	static fromNode(node, maxDepth = 5, capacity = 8) {
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
						triangle.belong = child;

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
						triangle.belong = child;

						addTriangle(triangle);
					}
				}
			}
		});

		// offset small amount to account for regular grid
		box.min.x -= 0.01;
		box.min.y -= 0.01;
		box.min.z -= 0.01;

		const octree = new TrianglesOctree(box);
		octree.elements = triangles;
		octree.divideElements(maxDepth, capacity);

		return octree;
	}

	constructor(box, depth) {
		super(box, depth);

		this.elementTest = function(box, triangle) {
			return box.intersectsTriangle(triangle);
		};
	}

	getRayTriangles(ray, triangles) {
		const subTrees = this.subTrees;

		for (let i = 0; i < subTrees.length; i++) {
			const subTree = subTrees[i];

			if (!ray.intersectsBox(subTree.box)) continue;

			if (subTree.elements.length > 0) {
				for (let j = 0; j < subTree.elements.length; j++) {
					if (triangles.indexOf(subTree.elements[j]) === -1) triangles.push(subTree.elements[j]);
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
			const result = ray.intersectTriangle(triangles[i].a, triangles[i].b, triangles[i].c, true, _vec3_1);

			if (result) {
				const tempDistnce = result.sub(ray.origin).getLength();

				if (distance > tempDistnce) {
					position = result.clone().add(ray.origin);
					distance = tempDistnce;
					triangle = triangles[i];
				}
			}
		}

		return distance < 1e100 ? { distance: distance, triangle: triangle, position: position, target: triangle.belong } : null;
	}

}

const _vec3_1 = new Vector3();

export { TrianglesOctree };