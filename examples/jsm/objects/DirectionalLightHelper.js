import {
	Attribute,
	Buffer,
	DRAW_MODE,
	Geometry,
	LineMaterial,
	Mesh,
	Object3D
} from 't3d';

class DirectionalLightHelper extends Object3D {

	constructor(light, size = 1, color) {
		super();

		this.light = light;

		this.color = color;

		const planeGeometry = new Geometry();
		planeGeometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array([
			-size, size, 0,
			size, size, 0,
			size, -size, 0,
			-size, -size, 0,
			-size, size, 0
		]), 3)));
		planeGeometry.computeBoundingBox();
		planeGeometry.computeBoundingSphere();

		const planeMaterial = new LineMaterial();
		planeMaterial.drawMode = DRAW_MODE.LINE_LOOP;

		this.lightPlane = new Mesh(planeGeometry, planeMaterial);
		this.add(this.lightPlane);

		const lineGeometry = new Geometry();
		lineGeometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array([
			0, 0, 0, 0, 0, -1
		]), 3)));
		lineGeometry.computeBoundingBox();
		lineGeometry.computeBoundingSphere();

		const lineMaterial = new LineMaterial();
		lineMaterial.drawMode = DRAW_MODE.LINE_LOOP;

		this.targetLine = new Mesh(lineGeometry, lineMaterial);
		this.targetLine.scale.z = size * 5;
		this.add(this.targetLine);

		this.update();
	}

	update() {
		if (this.color !== undefined) {
			this.lightPlane.material.diffuse.setHex(this.color);
			this.targetLine.material.diffuse.setHex(this.color);
		} else {
			this.lightPlane.material.diffuse.copy(this.light.color);
			this.targetLine.material.diffuse.copy(this.light.color);
		}
	}

}

export { DirectionalLightHelper };