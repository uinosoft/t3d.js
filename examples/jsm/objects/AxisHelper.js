import {
	Attribute,
	Buffer,
	Color3,
	Geometry,
	LineMaterial,
	Mesh,
	VERTEX_COLOR
} from 't3d';

class AxisHelper extends Mesh {

	constructor(size = 1) {
		const vertices = [
			0, 0, 0, size, 0, 0,
			0, 0, 0, 0, size, 0,
			0, 0, 0, 0, 0, size
		];

		const colors = [
			1, 0, 0, 1, 1, 0.6, 0, 1,
			0, 1, 0, 1, 0.6, 1, 0, 1,
			0, 0, 1, 1, 0, 0.6, 1, 1
		];

		const geometry = new Geometry();
		geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
		geometry.addAttribute('a_Color', new Attribute(new Buffer(new Float32Array(colors), 4)));

		// Skip update bounding box
		// Because we may not want to consider the helper's bounding box
		geometry.computeBoundingSphere();

		const material = new LineMaterial();
		material.vertexColors = VERTEX_COLOR.RGBA;

		super(geometry, material);
	}

	setColors(xAxisColor, yAxisColor, zAxisColor) {
		const array = this.geometry.attributes.a_Color.buffer.array;

		_col_1.setHex(xAxisColor);
		_col_1.toArray(array, 0);
		_col_1.toArray(array, 3);

		_col_1.setHex(yAxisColor);
		_col_1.toArray(array, 6);
		_col_1.toArray(array, 9);

		_col_1.setHex(zAxisColor);
		_col_1.toArray(array, 12);
		_col_1.toArray(array, 15);

		this.geometry.attributes.a_Color.buffer.version++;

		return this;
	}

	dispose() {
		this.geometry.dispose();
		this.material.dispose();
	}

}

AxisHelper.prototype.isAxisHelper = true;

const _col_1 = new Color3();

export { AxisHelper };