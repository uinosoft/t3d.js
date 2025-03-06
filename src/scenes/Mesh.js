import { Object3D } from './Object3D.js';
import { DRAW_SIDE } from '../const.js';
import { Sphere } from '../math/Sphere.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Ray } from '../math/Ray.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';
import { Triangle } from '../math/Triangle.js';

const _sphere = new Sphere();
const _inverseMatrix = new Matrix4();
const _ray = new Ray();

const _barycoord = new Vector3();

const _vA = new Vector3();
const _vB = new Vector3();
const _vC = new Vector3();

const _tempA = new Vector3();
const _morphA = new Vector3();

const _uvA = new Vector2();
const _uvB = new Vector2();
const _uvC = new Vector2();

const _intersectionPoint = new Vector3();
const _intersectionPointWorld = new Vector3();

/**
 * Class representing triangular polygon mesh based objects.
 * Also serves as a base for other classes such as {@link SkinnedMesh}.
 * @extends Object3D
 */
class Mesh extends Object3D {

	/**
	 * @param {Geometry} geometry — an instance of {@link Geometry}.
	 * @param {Material} material - a single or an array of {@link Material}.
	 */
	constructor(geometry, material) {
		super();

		/**
		 * an instance of {@link Geometry}.
		 * @type {Geometry}
		 */
		this.geometry = geometry;

		/**
		 * a single or an array of {@link Material}.
		 * @type {Material|Material[]}
		 */
		this.material = material;

		/**
		 * An array of weights typically from 0-1 that specify how much of the morph is applied.
		 * @type {number[] | null}
		 * @default null
		 */
		this.morphTargetInfluences = null;
	}

	/**
	 * Get the local-space position of the vertex at the given index,
	 * taking into account the current animation state of both morph targets and skinning.
	 * @param {number} index - The index of the vertex.
	 * @param {Vector3} target - The target vector.
	 * @returns {Vector3} The target vector.
	 */
	getVertexPosition(index, target) {
		const geometry = this.geometry;
		const position = geometry.getAttribute('a_Position');
		const morphPosition = geometry.morphAttributes.position;

		target.fromArray(position.buffer.array, index * position.buffer.stride + position.offset);

		const morphInfluences = this.morphTargetInfluences;

		if (morphPosition && morphInfluences) {
			_morphA.set(0, 0, 0);

			for (let i = 0, il = morphPosition.length; i < il; i++) {
				const influence = morphInfluences[i];
				const morphAttribute = morphPosition[i];

				if (influence === 0) continue;

				_tempA.fromArray(morphAttribute.buffer.array, index * morphAttribute.buffer.stride + morphAttribute.offset);

				_morphA.addScaledVector(_tempA, influence);
			}

			target.add(_morphA);
		}

		return target;
	}

	raycast(ray, intersects) {
		const geometry = this.geometry;
		const material = this.material;
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
		const groups = geometry.groups;

		let intersection;

		if (geometry.index) {
			const index = geometry.index.buffer.array;

			if (Array.isArray(material)) {
				for (let i = 0, il = groups.length; i < il; i++) {
					const group = groups[i];
					const groupMaterial = material[group.materialIndex];

					const start = group.start;
					const end = Math.min(index.length, group.start + group.count);

					for (let j = start, jl = end; j < jl; j += 3) {
						const a = index[j];
						const b = index[j + 1];
						const c = index[j + 2];

						intersection = checkGeometryIntersection(this, groupMaterial, ray, _ray, uv, a, b, c);

						if (intersection) {
							intersection.faceIndex = Math.floor(i / 3);
							intersection.face.materialIndex = group.materialIndex;
							intersects.push(intersection);
						}
					}
				}
			} else {
				for (let i = 0, il = index.length; i < il; i += 3) {
					const a = index[i];
					const b = index[i + 1];
					const c = index[i + 2];

					intersection = checkGeometryIntersection(this, material, ray, _ray, uv, a, b, c);

					if (intersection) {
						intersection.faceIndex = Math.floor(i / 3);
						intersects.push(intersection);
					}
				}
			}
		} else {
			if (Array.isArray(material)) {
				for (let i = 0, il = groups.length; i < il; i++) {
					const group = groups[i];
					const groupMaterial = material[group.materialIndex];

					const start = group.start;
					const end = Math.min(position.buffer.count, group.start + group.count);

					for (let j = start, jl = end; j < jl; j += 3) {
						const a = j;
						const b = j + 1;
						const c = j + 2;

						intersection = checkGeometryIntersection(this, groupMaterial, ray, _ray, uv, a, b, c);

						if (intersection) {
							intersection.faceIndex = Math.floor(i / 3);
							intersection.face.materialIndex = group.materialIndex;
							intersects.push(intersection);
						}
					}
				}
			} else {
				for (let i = 0, il = position.buffer.count; i < il; i += 3) {
					const a = i;
					const b = i + 1;
					const c = i + 2;

					intersection = checkGeometryIntersection(this, material, ray, _ray, uv, a, b, c);

					if (intersection) {
						intersection.faceIndex = Math.floor(i / 3);
						intersects.push(intersection);
					}
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
 * @type {boolean}
 * @default true
 */
Mesh.prototype.isMesh = true;

function checkGeometryIntersection(object, material, ray, _ray, uv, a, b, c) {
	object.getVertexPosition(a, _vA);
	object.getVertexPosition(b, _vB);
	object.getVertexPosition(c, _vC);

	const intersection = checkIntersection(object, material, ray, _ray, _vA, _vB, _vC, _intersectionPoint);

	if (intersection) {
		let array;
		let bufferStride;
		let attributeOffset;

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

function checkIntersection(object, material, ray, localRay, pA, pB, pC, point) {
	let intersect;

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

export { Mesh };