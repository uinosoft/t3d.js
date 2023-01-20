import {
	Attribute,
	Buffer,
	Geometry,
	LineMaterial,
	Mesh,
} from 't3d';

class Box3Helper extends Mesh {

	constructor(box, color = 0xffff00) {
		const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);

		const positions = [1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1];

		const geometry = new Geometry();

		geometry.setIndex(new Attribute(new Buffer(indices, 1)));

		geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(positions), 3)));

		// Skip update bounding box
		// Because we may not want to consider Box3Helper's bounding box
		geometry.computeBoundingSphere();

		const material = new LineMaterial();
		material.diffuse.setHex(color);

		super(geometry, material);

		this.box = box;
	}

	updateMatrix(force) {
		const box = this.box;

		if (box.isEmpty()) return;

		box.getCenter(this.position);

		getSize(box, this.scale);

		this.scale.multiplyScalar(0.5);

		super.updateMatrix(force);
	}

}

Box3Helper.prototype.isBox3Helper = true;

function getSize(box, target) {
	return box.isEmpty() ? target.set(0, 0, 0) : target.subVectors(box.max, box.min);
}

export { Box3Helper };
