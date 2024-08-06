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

		const positions = this.getPositions();

		geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(positions), 3)));

		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		const material = new LineMaterial();

		this.cone = new Mesh(geometry, material);
		this.add(this.cone);

		this.update();
	}

	getPositions() {
		const angle = this.light.angle;
		const radius = Math.sin(angle);
		const z = Math.cos(angle);
		this.angle = angle;

		const positions = [
			0, 0, 0, 	0, 0, -1,
			0, 0, 0, 	radius, 0, -z,
			0, 0, 0,	-radius, 0, -z,
			0, 0, 0, 	0, radius, -z,
			0, 0, 0, 	0, -radius, -z
		];

		for (let i = 0, j = 1, l = 32; i < l; i++, j++) {
			const p1 = (i / l) * Math.PI * 2;
			const p2 = (j / l) * Math.PI * 2;

			positions.push(
				Math.cos(p1) * radius, Math.sin(p1) * radius, -z,
				Math.cos(p2) * radius, Math.sin(p2) * radius, -z
			);
		}

		const startRadian = -Math.PI / 2 - angle;
		for (let i = 0, j = 1, l = 32; i < l; i++, j++) {
			const p1 = (i / l) * angle * 2 + startRadian;
			const p2 = (j / l) * angle * 2 + startRadian;

			positions.push(
				0, Math.cos(p1), Math.sin(p1),
				0, Math.cos(p2), Math.sin(p2),
				Math.cos(p1), 0, Math.sin(p1),
				Math.cos(p2), 0, Math.sin(p2)
			);
		}

		return positions;
	}

	update() {
		if (this.angle !== this.light.angle) {
			const positions = this.getPositions();

			const geometry = this.cone.geometry;
			const positionBuffer = geometry.attributes.a_Position.buffer;
			const array = positionBuffer.array;

			for (let i = 0, l = positions.length; i < l; i++) {
				array[i] = positions[i];
			}

			positionBuffer.version++;
			geometry.computeBoundingBox();
			geometry.computeBoundingSphere();
		}

		const scaleFactor = this.light.distance ? this.light.distance : 1000;

		this.cone.scale.set(scaleFactor, scaleFactor, scaleFactor);

		if (this.color !== undefined) {
			this.cone.material.diffuse.setHex(this.color);
		} else {
			this.cone.material.diffuse.copy(this.light.color);
		}
	}

}

export { SpotLightHelper };