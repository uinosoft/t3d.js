import { Mesh, Geometry, BasicMaterial, DRAW_MODE, BLEND_TYPE, Attribute, Buffer } from 't3d';

class OctreeHelper extends Mesh {

	constructor(color = 0x000900) {
		const geometry = new Geometry();

		const material = new BasicMaterial();
		material.drawMode = DRAW_MODE.LINES;
		material.transparent = true;
		material.blending = BLEND_TYPE.ADD;
		material.diffuse.setHex(color);
		material.envMap = undefined;
		material.fog = false;

		super(geometry, material);
	}

	update(octree, updateBoundings = true) {
		const vertices = [];

		const traverse = tree => {
			for (let i = 0; i < tree.length; i++) {
				if (tree[i].isEmpty()) continue;

				const min = tree[i].box.min;
				const max = tree[i].box.max;

				vertices.push(max.x, max.y, max.z); vertices.push(min.x, max.y, max.z); // 0, 1
				vertices.push(min.x, max.y, max.z); vertices.push(min.x, min.y, max.z); // 1, 2
				vertices.push(min.x, min.y, max.z); vertices.push(max.x, min.y, max.z); // 2, 3
				vertices.push(max.x, min.y, max.z); vertices.push(max.x, max.y, max.z); // 3, 0

				vertices.push(max.x, max.y, min.z); vertices.push(min.x, max.y, min.z); // 4, 5
				vertices.push(min.x, max.y, min.z); vertices.push(min.x, min.y, min.z); // 5, 6
				vertices.push(min.x, min.y, min.z); vertices.push(max.x, min.y, min.z); // 6, 7
				vertices.push(max.x, min.y, min.z); vertices.push(max.x, max.y, min.z); // 7, 4

				vertices.push(max.x, max.y, max.z); vertices.push(max.x, max.y, min.z); // 0, 4
				vertices.push(min.x, max.y, max.z); vertices.push(min.x, max.y, min.z); // 1, 5
				vertices.push(min.x, min.y, max.z); vertices.push(min.x, min.y, min.z); // 2, 6
				vertices.push(max.x, min.y, max.z); vertices.push(max.x, min.y, min.z); // 3, 7

				traverse(tree[i].subTrees);
			}
		};

		traverse(octree.subTrees);

		this.geometry.dispose();
		this.geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
		if (updateBoundings) {
			this.geometry.computeBoundingSphere();
			this.geometry.computeBoundingBox();
		}
		this.geometry.version++;
	}

}

export { OctreeHelper };