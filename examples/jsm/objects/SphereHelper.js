import {
	Geometry,
	Buffer,
	Attribute,
	Mesh,
	LineMaterial,
	Vector3
} from 't3d';

class SphereHelper extends Mesh {

	constructor(sphere, color = 0xffff00, angleSteps = 40) {
		const positions = [];
		for (let i = 0; i < 3; i++) {
			const axis1 = axes[i];
			const axis2 = axes[(i + 1) % 3];
			_vector.set(0, 0, 0);

			for (let a = 0; a < angleSteps; a++) {
				let angle;
				angle = 2 * Math.PI * a / (angleSteps - 1);
				_vector[axis1] = Math.sin(angle);
				_vector[axis2] = Math.cos(angle);

				positions.push(_vector.x, _vector.y, _vector.z);

				angle = 2 * Math.PI * (a + 1) / (angleSteps - 1);
				_vector[axis1] = Math.sin(angle);
				_vector[axis2] = Math.cos(angle);

				positions.push(_vector.x, _vector.y, _vector.z);
			}
		}

		const geometry = new Geometry();
		geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(positions), 3)));
		geometry.computeBoundingSphere();

		const lineMaterial = new LineMaterial();
		lineMaterial.diffuse.setHex(color);

		super(geometry, lineMaterial);

		this.sphere = sphere;
	}

	updateMatrix(force) {
		const sphere = this.sphere;

		this.position.copy(sphere.center);

		if (sphere.isEmpty()) {
			this.scale.setScalar(0);
		} else {
			this.scale.setScalar(sphere.radius);
		}

		super.updateMatrix(force);
	}

}

SphereHelper.prototype.isSphereHelper = true;

const _vector = new Vector3();
const axes = ['x', 'y', 'z'];

export { SphereHelper };