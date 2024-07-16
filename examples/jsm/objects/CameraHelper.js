import {
	Attribute,
	Buffer,
	Geometry,
	LineMaterial,
	Mesh,
	Color3,
	Matrix4,
	Vector3,
	VERTEX_COLOR
} from 't3d';

class CameraHelper extends Mesh {

	constructor(camera) {
		const geometry = new Geometry();
		const material = new LineMaterial();
		material.vertexColors = VERTEX_COLOR.RGB;

		const vertices = [];
		const colors = [];
		const pointsMap = {};

		const colorFrustum = new Color3(0xffaa00);
		const colorCone = new Color3(0xff0000);
		const colorUp = new Color3(0x00aaff);
		const colorTarget = new Color3(0xffffff);
		const colorCross = new Color3(0x333333);

		// near
		addLine('n1', 'n2', colorFrustum);
		addLine('n2', 'n4', colorFrustum);
		addLine('n4', 'n3', colorFrustum);
		addLine('n3', 'n1', colorFrustum);

		// far
		addLine('f1', 'f2', colorFrustum);
		addLine('f2', 'f4', colorFrustum);
		addLine('f4', 'f3', colorFrustum);
		addLine('f3', 'f1', colorFrustum);

		// sides
		addLine('n1', 'f1', colorFrustum);
		addLine('n2', 'f2', colorFrustum);
		addLine('n3', 'f3', colorFrustum);
		addLine('n4', 'f4', colorFrustum);

		// cone
		addLine('p', 'n1', colorCone);
		addLine('p', 'n2', colorCone);
		addLine('p', 'n3', colorCone);
		addLine('p', 'n4', colorCone);

		// up
		addLine('u1', 'u2', colorUp);
		addLine('u2', 'u3', colorUp);
		addLine('u3', 'u1', colorUp);

		// target
		addLine('c', 't', colorTarget);
		addLine('p', 'c', colorTarget);

		// cross
		addLine('cn1', 'cn2', colorCross);
		addLine('cn3', 'cn4', colorCross);

		addLine('cf1', 'cf2', colorCross);
		addLine('cf3', 'cf4', colorCross);

		function addLine(a, b, color) {
			addPoint(a, color);
			addPoint(b, color);
		}

		function addPoint(id, color) {
			if (pointsMap[id] === undefined) {
				pointsMap[id] = [];
			}
			pointsMap[id].push(vertices.length);

			vertices.push(0, 0, 0);
			colors.push(color.r, color.g, color.b);
		}

		geometry.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
		geometry.addAttribute('a_Color', new Attribute(new Buffer(new Float32Array(colors), 3)));

		super(geometry, material);

		this.camera = camera;
		this.pointsMap = pointsMap;
		this.update();
	}

	update() {
		const geometry = this.geometry;
		_mat4.copy(this.camera.projectionMatrixInverse);
		const positionBuffer = this.geometry.attributes.a_Position.buffer;

		const w = 1, h = 1;

		// center / target
		this._setPoint('c', positionBuffer, _mat4, 0, 0, -1);
		this._setPoint('t', positionBuffer, _mat4, 0, 0, 1);

		// near
		this._setPoint('n1', positionBuffer, _mat4, -w, -h, -1);
		this._setPoint('n2', positionBuffer, _mat4, w, -h, -1);
		this._setPoint('n3', positionBuffer, _mat4, -w, h, -1);
		this._setPoint('n4', positionBuffer, _mat4, w, h, -1);

		// far
		this._setPoint('f1', positionBuffer, _mat4, -w, -h, 1);
		this._setPoint('f2', positionBuffer, _mat4, w, -h, 1);
		this._setPoint('f3', positionBuffer, _mat4, -w, h, 1);
		this._setPoint('f4', positionBuffer, _mat4, w, h, 1);

		// up
		this._setPoint('u1', positionBuffer, _mat4, w * 0.7, h * 1.1, -1);
		this._setPoint('u2', positionBuffer, _mat4, -w * 0.7, h * 1.1, -1);
		this._setPoint('u3', positionBuffer, _mat4, 0, h * 2, -1);

		// cross
		this._setPoint('cf1', positionBuffer, _mat4, -w, 0, 1);
		this._setPoint('cf2', positionBuffer, _mat4, w, 0, 1);
		this._setPoint('cf3', positionBuffer, _mat4, 0, -h, 1);
		this._setPoint('cf4', positionBuffer, _mat4, 0, h, 1);

		this._setPoint('cn1', positionBuffer, _mat4, -w, 0, -1);
		this._setPoint('cn2', positionBuffer, _mat4, w, 0, -1);
		this._setPoint('cn3', positionBuffer, _mat4, 0, -h, -1);
		this._setPoint('cn4', positionBuffer, _mat4, 0, h, -1);

		positionBuffer.version++;
		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();
	}

	_setPoint(point, position, projectionMatrixInverse, x, y, z) {
		_vec3.set(x, y, z).applyMatrix4(projectionMatrixInverse);
		const points = this.pointsMap[point];

		if (points !== undefined) {
			const array = position.array;
			for (let i = 0, l = points.length; i < l; i++) {
				const index = points[i];
				array[index] = _vec3.x;
				array[index + 1] = _vec3.y;
				array[index + 2] = _vec3.z;
			}
		}
	}

}

CameraHelper.prototype.isCameraHelper = true;

const _vec3 = new Vector3();
const _mat4 = new Matrix4();

export { CameraHelper };