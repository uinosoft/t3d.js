import {
	LineMaterial,
	Mesh,
	SphereGeometry
} from 't3d';

class PointLightHelper extends Mesh {

	constructor(light, sphereSize, color) {
		const geometry = new SphereGeometry(sphereSize, 4, 2);
		const material = new LineMaterial();

		super(geometry, material);

		this.light = light;

		this.color = color;

		this.update();
	}

	update() {
		if (this.color !== undefined) {
			this.material.diffuse.setHex(this.color);
		} else {
			this.material.diffuse.copy(this.light.color);
		}
	}

}

export { PointLightHelper };