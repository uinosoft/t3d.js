import {
	Attribute,
	Buffer,
	Geometry,
	Matrix4,
	Mesh,
	Object3D,
	SphereGeometry,
	ShaderMaterial,
	Vector3
} from 't3d';

class SkeletonHelper extends Object3D {

	constructor(object) {
		super();

		const bones = getBoneList(object);

		this.root = object;
		this.bones = bones;

		this._midStep = 0.25;

		this.midWidthScale = 0.1;
		this.ballScale = 0.4;

		// create bone spheres and connectors

		const material = new ShaderMaterial(skeletonShader);
		material.depthTest = false;
		material.depthWrite = false;
		this._material = material;

		this._sphereGeometry = new SphereGeometry(0.25, 16, 12);
		this._connectorGeometry = new ConnectorGeometry();

		this._distanceMap = new WeakMap();

		for (let i = 0; i < bones.length; i++) {
			const bone = bones[i];

			if (bone.parent && bone.parent.isBone) {
				const boneSphere = new Mesh(this._sphereGeometry, this._material);
				boneSphere.receiveShadows = false;
				boneSphere.castShadows = false;
				boneSphere.renderOrder = 1;
				this.add(boneSphere);

				const boneConnector = new Mesh(this._connectorGeometry, this._material);
				boneConnector.receiveShadows = false;
				boneConnector.castShadows = false;
				this.add(boneConnector);

				this._distanceMap.set(bone.parent, 0);
			}
		}
	}

	set midStep(value) {
		this._midStep = value;
		this._connectorGeometry.updateMidStep(value);
	}

	get midStep() {
		return this._midStep;
	}

	set colorMin(value) {
		this._material.uniforms.u_colorMin = value;
	}

	get colorMin() {
		return this._material.uniforms.u_colorMin;
	}

	set colorMax(value) {
		this._material.uniforms.u_colorMax = value;
	}

	get colorMax() {
		return this._material.uniforms.u_colorMax;
	}

	updateMatrix(force) {
		const bones = this.bones;
		const midWidthScale = this.midWidthScale;
		const ballScale = this.ballScale;

		const distanceMap = this._distanceMap;

		_worldMatrixInv.getInverse(this.root.worldMatrix);

		for (let i = 0, j = 0; i < bones.length; i++) {
			const bone = bones[i];

			if (bone.parent && bone.parent.isBone) {
				_boneEndMatrix.multiplyMatrices(_worldMatrixInv, bone.worldMatrix);
				_boneStartMatrix.multiplyMatrices(_worldMatrixInv, bone.parent.worldMatrix);
				_boneEnd.setFromMatrixPosition(_boneEndMatrix);
				_boneStart.setFromMatrixPosition(_boneStartMatrix);

				_boneDirection.subVectors(_boneEnd, _boneStart);
				const boneDistance = _boneDirection.getLength();
				_boneDirection.normalize();

				bone._distance = boneDistance;
				distanceMap.set(bone, boneDistance);

				let minDistance = boneDistance;
				const parentDistance = distanceMap.get(bone.parent);
				if (parentDistance) {
					minDistance = Math.min(minDistance, parentDistance);
				}

				const sphere = this.children[j];
				sphere.position.copy(_boneStart);
				sphere.scale.set(1, 1, 1).multiplyScalar(minDistance * ballScale);

				const connector = this.children[j + 1];
				connector.position.copy(_boneStart);
				connector.scale.set(midWidthScale, midWidthScale, 1).multiplyScalar(boneDistance);
				connector.quaternion.setFromUnitVectors(new Vector3(0, 0, -1), _boneDirection);

				j += 2;
			}
		}

		super.updateMatrix(force);
	}

}

const _worldMatrixInv = new Matrix4();
const _boneStartMatrix = new Matrix4();
const _boneEndMatrix = new Matrix4();
const _boneStart = new Vector3();
const _boneEnd = new Vector3();
const _boneDirection = new Vector3();

function getBoneList(object) {
	const boneList = [];

	if (object.isBone) {
		boneList.push(object);
	}

	for (let i = 0; i < object.children.length; i++) {
		boneList.push.apply(boneList, getBoneList(object.children[i]));
	}

	return boneList;
}

class ConnectorGeometry extends Geometry {

	constructor(midStep = 0.25) {
		super();

		const vertexs = [
			new Vector3(0, 0, 0),
			new Vector3(1, -1, -midStep),
			new Vector3(1, 1, -midStep),
			new Vector3(-1, 1, -midStep),
			new Vector3(-1, -1, -midStep),
			new Vector3(1, -1, -midStep),
			new Vector3(0, 0, -1)
		];

		const normal = [
			new Vector3(1, 0, 1),
			new Vector3(0, 1, 1),
			new Vector3(-1, 0, 1),
			new Vector3(0, -1, 1),
			new Vector3(1, 0, -1),
			new Vector3(0, 1, -1),
			new Vector3(-1, 0, -1),
			new Vector3(0, -1, -1)
		];

		const positions = [];
		const normals = [];

		for (let i = 0; i < 4; i++) {
			positions.push(vertexs[0].x, vertexs[0].y, vertexs[0].z);
			positions.push(vertexs[i + 1].x, vertexs[i + 1].y, vertexs[i + 1].z);
			positions.push(vertexs[i + 2].x, vertexs[i + 2].y, vertexs[i + 2].z);
			normals.push(normal[i].x, normal[i].y, normal[i].z);
			normals.push(normal[i].x, normal[i].y, normal[i].z);
			normals.push(normal[i].x, normal[i].y, normal[i].z);

			positions.push(vertexs[6].x, vertexs[6].y, vertexs[6].z);
			positions.push(vertexs[i + 2].x, vertexs[i + 2].y, vertexs[i + 2].z);
			positions.push(vertexs[i + 1].x, vertexs[i + 1].y, vertexs[i + 1].z);
			normals.push(normal[i + 4].x, normal[i + 4].y, normal[i + 4].z);
			normals.push(normal[i + 4].x, normal[i + 4].y, normal[i + 4].z);
			normals.push(normal[i + 4].x, normal[i + 4].y, normal[i + 4].z);
		}

		this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(positions), 3)));
		this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(normals), 3)));

		this.computeBoundingSphere();
		this.computeBoundingBox();
	}

	updateMidStep(midStep) {
		const positions = this.getAttribute('a_Position').buffer.array;

		for (let i = 0; i < 8; i++) {
			positions[i * 9 + 5] = -midStep;
			positions[i * 9 + 8] = -midStep;
		}

		this.getAttribute('a_Position').buffer.version++;

		// boundings are not needed to be updated
	}

}

const skeletonShader = {
	name: 'skeleton_shader',

	uniforms: {
		'u_colorMin': [0.35, 0.35, 0.35],
		'u_colorMax': [0.7, 0.7, 0.7]
	},

	vertexShader: `
        #include <common_vert>

		varying vec3 v_Normal;

		void main() {
			v_Normal = (transposeMat4(inverseMat4(u_Model)) * vec4(a_Normal, 0.0)).xyz;
			gl_Position = u_Projection * u_View * u_Model * vec4(a_Position, 1.0);
		}
    `,

	fragmentShader: `
        #include <common_frag>

		uniform vec3 u_colorMin;
		uniform vec3 u_colorMax;

		varying vec3 v_Normal;

		void main() {
            vec3 N = normalize(v_Normal);
			float ndl = dot(N, vec3(0, 1, 0)) * 0.5 + 0.5;
			vec3 diffuse = mix(u_colorMin, u_colorMax, ndl);
			gl_FragColor = vec4(diffuse, 1.0);
		}
    `
};

export { SkeletonHelper };