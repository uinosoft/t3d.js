import {
	LineMaterial,
	Mesh,
	SphereGeometry,
	VERTEX_COLOR,
	Attribute,
	Buffer,
	Color3
} from 't3d';

const _color3_1 = new Color3();

class HemisphereLightHelper extends Mesh {

	constructor(light, sphereSize, color) {
		const geometry = new SphereGeometry(sphereSize, 4, 2);

		const positions = geometry.getAttribute('a_Position');
		const colorArray = new Float32Array(positions.buffer.array.length);
		for (let i = 0, l = colorArray.length; i < l; i++) {
			colorArray[i] = 1;
		}
		const colors = new Attribute(new Buffer(colorArray, 3));
		geometry.addAttribute('a_Color', colors);

		const material = new LineMaterial();
		material.vertexColors = VERTEX_COLOR.RGB;

		super(geometry, material);

		this.light = light;

		this.color = color;

		this.update();
	}

	update() {
		if (this.color !== undefined) {
			this.material.diffuse.setHex(this.color);
		} else {
			_color3_1.lerpColors(this.light.color, this.light.groundColor, 0.5);

			const colors = this.geometry.getAttribute('a_Color');
			const array = colors.buffer.array;
			for (let i = 0, l = array.length; i < l; i += 3) {
				if (i < 5 * 3) {
					this.light.color.toArray(array, i);
				} else if (i < 10 * 3) {
					_color3_1.toArray(array, i);
				} else {
					this.light.groundColor.toArray(array, i);
				}
			}
			colors.buffer.version++;
		}
	}

}

export { HemisphereLightHelper };