import {
	Attribute,
	Buffer,
	DRAW_MODE,
	Geometry,
	BasicMaterial,
	Mesh,
	Object3D
} from 't3d';

class RectAreaLightHelper extends Object3D {

	constructor(light, color) {
		super();

		this.light = light;

		this.color = color;

		this.width = light.width;
		this.height = light.height;

		const planeGeometry = new Geometry();
		planeGeometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array([
			-this.width / 2, this.height / 2, 0,
			this.width / 2, this.height / 2, 0,
			this.width / 2, -this.height / 2, 0,
			-this.width / 2, -this.height / 2, 0,
			-this.width / 2, this.height / 2, 0,
			this.width / 2, this.height / 2, 0,
			-this.width / 2, this.height / 2, 0,
			this.width / 2, -this.height / 2, 0,
			-this.width / 2, -this.height / 2, 0,
			this.width / 2, this.height / 2, 0
		]), 3)));
		planeGeometry.computeBoundingBox();
		planeGeometry.computeBoundingSphere();

		const lineGeometry = new Geometry();
		lineGeometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array([
			0, 0, 0, 0, 0, -1
		]), 3)));
		lineGeometry.computeBoundingBox();
		lineGeometry.computeBoundingSphere();

		const material = new BasicMaterial();
		material.drawMode = DRAW_MODE.LINE_LOOP;

		this.lightPlane = new Mesh(planeGeometry, material);
		this.add(this.lightPlane);

		this.targetLine = new Mesh(lineGeometry, material);
		this.targetLine.scale.z = (this.height + this.width) / 10;
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

export { RectAreaLightHelper };