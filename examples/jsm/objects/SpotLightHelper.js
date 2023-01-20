import {
	Attribute,
	Buffer,
	Geometry,
	LineMaterial,
	Mesh,
	Object3D
} from 't3d';

class SpotLightHelper extends Object3D {

	constructor(light, color) {
		super();

		this.light = light;

		this.color = color;

		const geometry = new Geometry();

		const positions = [
			0, 0, 0, 	0, 0, -1,
			0, 0, 0, 	1, 0, -1,
			0, 0, 0,	-1, 0, -1,
			0, 0, 0, 	0, 1, -1,
			0, 0, 0, 	0, -1, -1
		];

		for (let i = 0, j = 1, l = 32; i < l; i++, j++) {
			const p1 = (i / l) * Math.PI * 2;
			const p2 = (j / l) * Math.PI * 2;

			positions.push(
				Math.cos(p1), Math.sin(p1), -1,
				Math.cos(p2), Math.sin(p2), -1
			);
		}

		geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(positions), 3)));

		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		const material = new LineMaterial();

		this.cone = new Mesh(geometry, material);
		this.add(this.cone);

		this.update();
	}

	update() {
		const coneLength = this.light.distance ? this.light.distance : 1000;
		const coneWidth = coneLength * Math.tan(this.light.angle);

		this.cone.scale.set(coneWidth, coneWidth, coneLength);

		if (this.color !== undefined) {
			this.cone.material.diffuse.setHex(this.color);
		} else {
			this.cone.material.diffuse.copy(this.light.color);
		}
	}

}

export { SpotLightHelper };