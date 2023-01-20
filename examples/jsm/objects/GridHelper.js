import {
	Attribute,
	Buffer,
	Color3,
	Geometry,
	LineMaterial,
	Mesh,
	VERTEX_COLOR
} from 't3d';

class GridHelper extends Mesh {

	constructor(size = 10, divisions = 10, color1 = 0x444444, color2 = 0x888888) {
		color1 = new Color3(color1);
		color2 = new Color3(color2);

		const center = divisions / 2;
		const step = size / divisions;
		const halfSize = size / 2;

		const vertices = [], colors = [];

		for (let i = 0, j = 0, k = -halfSize; i <= divisions; i++, k += step) {
			vertices.push(-halfSize, 0, k, halfSize, 0, k);
			vertices.push(k, 0, -halfSize, k, 0, halfSize);

			const color = i === center ? color1 : color2;

			color.toArray(colors, j); colors[j + 3] = 1; j += 4;
			color.toArray(colors, j); colors[j + 3] = 1; j += 4;
			color.toArray(colors, j); colors[j + 3] = 1; j += 4;
			color.toArray(colors, j); colors[j + 3] = 1; j += 4;
		}

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

}

export { GridHelper };