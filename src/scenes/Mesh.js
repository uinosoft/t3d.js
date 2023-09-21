import { Object3D } from './Object3D.js';
import { DRAW_SIDE } from '../const.js';
import { Sphere } from '../math/Sphere.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Ray } from '../math/Ray.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector4 } from '../math/Vector4.js';
import { Triangle } from '../math/Triangle.js';

const _sphere = new Sphere();
const _inverseMatrix = new Matrix4();
const _ray = new Ray();

const _barycoord = new Vector3();

const _vA = new Vector3();
const _vB = new Vector3();
const _vC = new Vector3();

const _tempA = new Vector3();
const _tempB = new Vector3();
const _tempC = new Vector3();

const _morphA = new Vector3();
const _morphB = new Vector3();
const _morphC = new Vector3();

const _basePosition = new Vector3();
const _skinIndex = new Vector4();
const _skinWeight = new Vector4();

const _vector = new Vector3();
const _matrix = new Matrix4();

const _uvA = new Vector2();
const _uvB = new Vector2();
const _uvC = new Vector2();

const _intersectionPoint = new Vector3();
const _intersectionPointWorld = new Vector3();

/**
 * Class representing triangular polygon mesh based objects.
 * Also serves as a base for other classes such as {@link t3d.SkinnedMesh}.
 * @memberof t3d
 * @extends t3d.Object3D
 */
class Mesh extends Object3D {

	/**
	 * @param {t3d.Geometry} geometry — an instance of {@link t3d.Geometry}.
	 * @param {t3d.Material} material - a single or an array of {@link t3d.Material}.
	 */
	constructor(geometry, material) {
		super();

		/**
		 * an instance of {@link t3d.Geometry}.
		 * @type {t3d.Geometry}
		 */
		this.geometry = geometry;

		/**
		 * a single or an array of {@link t3d.Material}.
		 * @type {t3d.Material|t3d.Material[]}
		 */
		this.material = material;

		/**
		 * An array of weights typically from 0-1 that specify how much of the morph is applied.
		 * @type {Number[]|null}
		 * @default null
		 */
		this.morphTargetInfluences = null;
	}

	raycast(ray, intersects) {
		const geometry = this.geometry;
		const worldMatrix = this.worldMatrix;

		_sphere.copy(geometry.boundingSphere);
		_sphere.applyMatrix4(worldMatrix);
		if (!ray.intersectsSphere(_sphere)) {
			return;
		}

		_inverseMatrix.getInverse(worldMatrix);
		_ray.copy(ray).applyMatrix4(_inverseMatrix);

		if (!_ray.intersectsBox(geometry.boundingBox)) {
			return;
		}

		const position = geometry.getAttribute('a_Position');

		if (!position) {
			return;
		}

		const uv = geometry.getAttribute('a_Uv');

		const morphPosition = geometry.morphAttributes.position;

		let intersection;

		if (geometry.index) {
			const index = geometry.index.buffer.array;

			for (let i = 0; i < index.length; i += 3) {
				const a = index[i];
				const b = index[i + 1];
				const c = index[i + 2];

				intersection = checkGeometryIntersection(this, ray, _ray, position, morphPosition, uv, a, b, c);

				if (intersection) {
					intersection.faceIndex = Math.floor(i / 3);
					intersects.push(intersection);
				}
			}
		} else {
			for (let i = 0; i < position.buffer.count; i += 3) {
				const a = i;
				const b = i + 1;
				const c = i + 2;

				intersection = checkGeometryIntersection(this, ray, _ray, position, morphPosition, uv, a, b, c);

				if (intersection) {
					intersection.faceIndex = Math.floor(i / 3);
					intersects.push(intersection);
				}
			}
		}
	}

	copy(source) {
		super.copy(source);
		if (source.morphTargetInfluences) {
			this.morphTargetInfluences = source.morphTargetInfluences.slice();
		}
		return this;
	}

	clone() {
		return new this.constructor(this.geometry, this.material).copy(this);
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
Mesh.prototype.isMesh = true;

function checkGeometryIntersection(object, ray, _ray, position, morphPosition, uv, a, b, c) {
	let array;
	let bufferStride;
	let attributeOffset;

	array = position.buffer.array;
	bufferStride = position.buffer.stride;
	attributeOffset = position.offset;
	_vA.fromArray(array, a * bufferStride + attributeOffset);
	_vB.fromArray(array, b * bufferStride + attributeOffset);
	_vC.fromArray(array, c * bufferStride + attributeOffset);

	const morphInfluences = object.morphTargetInfluences;

	if (morphPosition && morphInfluences) {
		_morphA.set(0, 0, 0);
		_morphB.set(0, 0, 0);
		_morphC.set(0, 0, 0);

		for (let i = 0; i < morphPosition.length; i++) {
			const influence = morphInfluences[i];
			const morphAttribute = morphPosition[i];

			if (influence === 0) continue;

			array = morphAttribute.buffer.array;
			bufferStride = morphAttribute.buffer.stride;
			attributeOffset = morphAttribute.offset;
			_tempA.fromArray(array, a * bufferStride + attributeOffset);
			_tempB.fromArray(array, b * bufferStride + attributeOffset);
			_tempC.fromArray(array, c * bufferStride + attributeOffset);

			_morphA.addScaledVector(_tempA, influence);
			_morphB.addScaledVector(_tempB, influence);
			_morphC.addScaledVector(_tempC, influence);
		}

		_vA.add(_morphA);
		_vB.add(_morphB);
		_vC.add(_morphC);
	}

	// Skinning : only raycast in incorrect skinnedMesh boundingBox!

	if (object.isSkinnedMesh) {
		boneTransform(object, a, _vA);
		boneTransform(object, b, _vB);
		boneTransform(object, c, _vC);
	}

	const intersection = checkIntersection(object, ray, _ray, _vA, _vB, _vC, _intersectionPoint);

	if (intersection) {
		if (uv) {
			array = uv.buffer.array;
			bufferStride = uv.buffer.stride;
			attributeOffset = uv.offset;
			_uvA.fromArray(array, a * bufferStride + attributeOffset);
			_uvB.fromArray(array, b * bufferStride + attributeOffset);
			_uvC.fromArray(array, c * bufferStride + attributeOffset);

			intersection.uv = uvIntersection(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC);
		}

		const face = {
			a: a,
			b: b,
			c: c,
			normal: new Vector3()
		};

		Triangle.normal(_vA, _vB, _vC, face.normal);

		intersection.face = face;
	}

	return intersection;
}

function uvIntersection(point, p1, p2, p3, uv1, uv2, uv3) {
	Triangle.barycoordFromPoint(point, p1, p2, p3, _barycoord);

	uv1.multiplyScalar(_barycoord.x);
	uv2.multiplyScalar(_barycoord.y);
	uv3.multiplyScalar(_barycoord.z);

	uv1.add(uv2).add(uv3);

	return uv1.clone();
}

function checkIntersection(object, ray, localRay, pA, pB, pC, point) {
	let intersect;
	const material = object.material;

	if (material.side === DRAW_SIDE.BACK) {
		intersect = localRay.intersectTriangle(pC, pB, pA, true, point);
	} else {
		intersect = localRay.intersectTriangle(pA, pB, pC, material.side !== DRAW_SIDE.DOUBLE, point);
	}

	if (intersect === null) return null;

	_intersectionPointWorld.copy(point);
	_intersectionPointWorld.applyMatrix4(object.worldMatrix);

	const distance = ray.origin.distanceTo(_intersectionPointWorld);

	return {
		distance: distance,
		point: _intersectionPointWorld.clone(),
		object: object
	};
}

function boneTransform(object, index, target) {
	const skeleton = object.skeleton;

	const skinIndex = object.geometry.attributes['skinIndex'];
	const skinWeight = object.geometry.attributes['skinWeight'];

	_skinIndex.fromArray(skinIndex.buffer.array, index * skinIndex.size);
	_skinWeight.fromArray(skinWeight.buffer.array, index * skinWeight.size);

	_basePosition.copy(target).applyMatrix4(object.bindMatrix);

	target.set(0, 0, 0);

	for (let i = 0; i < 4; i++) {
		const weight = getComponent(_skinWeight, i);

		if (weight < Number.EPSILON) continue;

		const boneIndex = getComponent(_skinIndex, i);

		if (!skeleton.bones[boneIndex]) continue;

		_matrix.multiplyMatrices(skeleton.bones[boneIndex].worldMatrix, skeleton.boneInverses[boneIndex]);
		target.addScaledVector(_vector.copy(_basePosition).applyMatrix4(_matrix), weight);
	}

	return target.applyMatrix4(object.bindMatrixInverse);
}

function getComponent(vec, index) {
	switch (index) {
		case 0: return vec.x;
		case 1: return vec.y;
		case 2: return vec.z;
		case 3: return vec.w;
		default: throw new Error('index is out of range: ' + index);
	}
}

export { Mesh };