import {
	Attribute,
	Buffer,
	Color3,
	Geometry,
	LineMaterial,
	Mesh,
	VERTEX_COLOR
} from 't3d';

class PolarGridHelper extends Mesh {

	constructor(radius, sectors, rings, divisions, color1, color2) {
		radius = radius || 10;
		sectors = sectors || 16;
		rings = rings || 8;
		divisions = divisions || 64;
		color1 = new Color3(color1 !== undefined ? color1 : 0x444444);
		color2 = new Color3(color2 !== undefined ? color2 : 0x888888);

		const vertices = [];
		const colors = [];

		// create the sectors
		if (sectors > 1) {
			for (let i = 0; i < sectors; i++) {
				const v = (i / sectors) * (Math.PI * 2);

				const x = Math.sin(v) * radius;
				const z = Math.cos(v) * radius;

				vertices.push(0, 0, 0);
				vertices.push(x, 0, z);

				const color = (i & 1) ? color1 : color2;

				colors.push(color.r, color.g, color.b, 1);
				colors.push(color.r, color.g, color.b, 1);
			}
		}

		// create the rings
		for (let i = 0; i < rings; i++) {
			const color = (i & 1) ? color1 : color2;

			const r = radius - (radius / rings * i);

			for (let j = 0; j < divisions; j++) {
				// first vertex
				let v = (j / divisions) * (Math.PI * 2);

				let x = Math.sin(v) * r;
				let z = Math.cos(v) * r;

				vertices.push(x, 0, z);
				colors.push(color.r, color.g, color.b, 1);

				// second vertex
				v = ((j + 1) / divisions) * (Math.PI * 2);

				x = Math.sin(v) * r;
				z = Math.cos(v) * r;

				vertices.push(x, 0, z);
				colors.push(color.r, color.g, color.b, 1);
			}
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

PolarGridHelper.prototype.isPolarGridHelper = true;

export { PolarGridHelper };