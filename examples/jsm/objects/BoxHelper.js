import {
	Attribute,
	Buffer,
	Geometry,
	LineMaterial,
	Mesh,
	Box3
} from 't3d';
import { SceneUtils } from '../SceneUtils.js';

class BoxHelper extends Mesh {

	constructor(object, color = 0xffff00) {
		const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
		const positions = new Float32Array(8 * 3);

		const geometry = new Geometry();
		geometry.setIndex(new Attribute(new Buffer(indices, 1)));
		geometry.addAttribute('a_Position', new Attribute(new Buffer(positions, 3)));

		const material = new LineMaterial();
		material.diffuse.setHex(color);

		super(geometry, material);

		this.object = object;
		this.worldMatrix = this.object.worldMatrix;

		this.update();
	}

	update(object) {
		if (object !== undefined) {
			console.warn('BoxHelper: .update() has no longer arguments.');
		}

		if (this.object !== undefined) {
			SceneUtils.setBox3FromObject(this.object, this.object, _box3_1);
		}

		if (_box3_1.isEmpty()) return;

		const min = _box3_1.min;
		const max = _box3_1.max;

		const position = this.geometry.attributes.a_Position.buffer;
		const array = position.array;

		array[0] = max.x; array[1] = max.y; array[2] = max.z;
		array[3] = min.x; array[4] = max.y; array[5] = max.z;
		array[6] = min.x; array[7] = min.y; array[8] = max.z;
		array[9] = max.x; array[10] = min.y; array[11] = max.z;
		array[12] = max.x; array[13] = max.y; array[14] = min.z;
		array[15] = min.x; array[16] = max.y; array[17] = min.z;
		array[18] = min.x; array[19] = min.y; array[20] = min.z;
		array[21] = max.x; array[22] = min.y; array[23] = min.z;

		position.version++;

		// Skip update bounding box
		// Because we may not want to consider BoxHelper's bounding box
		this.geometry.computeBoundingSphere();
	}

	setFromObject(object) {
		this.object = object;
		this.worldMatrix = this.object.worldMatrix;

		this.update();

		return this;
	}

	updateMatrix(force) {
		// Remove matrix updating
		// Need decompose worldMatrix to matrix and RST ?

		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) {
			children[i].updateMatrix(force);
		}
	}

	copy(source, recursive) {
		super.copy(source, recursive);

		this.object = source.object;

		return this;
	}

}

BoxHelper.prototype.isBoxHelper = true;

const _box3_1 = new Box3();

export { BoxHelper };