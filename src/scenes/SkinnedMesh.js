import { Mesh } from './Mesh.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';

/**
 * A mesh that has a {@link t3d.Skeleton} with bones that can then be used to animate the vertices of the geometry.
 * The material must support skinning.
 * @memberof t3d
 * @extends t3d.Mesh
 */
class SkinnedMesh extends Mesh {

	constructor(geometry, material) {
		super(geometry, material);

		/**
		 * Skeleton created from the bones of the Geometry.
		 * @type {t3d.Skeleton}
		 */
		this.skeleton = undefined;

		/**
		 * Either "attached" or "detached".
		 * "attached" uses the {@link t3d.SkinnedMesh#worldMatrix} property for the base transform matrix of the bones.
		 * "detached" uses the {@link t3d.SkinnedMesh#bindMatrix}.
		 * @type {String}
		 * @default "attached"
		 */
		this.bindMode = 'attached';

		/**
		 * The base matrix that is used for the bound bone transforms.
		 * @type {t3d.Matrix4}
		 */
		this.bindMatrix = new Matrix4();

		/**
		 * The base matrix that is used for resetting the bound bone transforms.
		 * @type {t3d.Matrix4}
		 */
		this.bindMatrixInverse = new Matrix4();
	}

	/**
	 * Bind a skeleton to the skinned mesh.
	 * The bindMatrix gets saved to .bindMatrix property and the .bindMatrixInverse gets calculated.
	 * @param {t3d.Skeleton} skeleton - Skeleton created from a Bones tree.
	 * @param {t3d.Matrix4} [bindMatrix=] - Matrix4 that represents the base transform of the skeleton.
	 */
	bind(skeleton, bindMatrix) {
		this.skeleton = skeleton;

		if (bindMatrix === undefined) {
			this.updateMatrix();

			bindMatrix = this.worldMatrix;
		}

		this.bindMatrix.copy(bindMatrix);
		this.bindMatrixInverse.getInverse(bindMatrix);
	}

	updateMatrix(force) {
		super.updateMatrix(force);

		if (this.bindMode === 'attached') {
			this.bindMatrixInverse.getInverse(this.worldMatrix);
		} else if (this.bindMode === 'detached') {
			this.bindMatrixInverse.getInverse(this.bindMatrix);
		} else {
			console.warn('t3d.SkinnedMesh: Unrecognized bindMode: ' + this.bindMode);
		}
	}

	copy(source) {
		super.copy(source);

		this.bindMode = source.bindMode;
		this.bindMatrix.copy(source.bindMatrix);
		this.bindMatrixInverse.copy(source.bindMatrixInverse);

		this.skeleton = source.skeleton;

		return this;
	}

	getVertexPosition(index, target) {
		super.getVertexPosition(index, target);

		this.applyBoneTransform(index, target);

		return target;
	}

	/**
	 * Applies the bone transform associated with the given index to the given position vector.
	 * Returns the updated vector.
	 * @param {Number} index - The index of the vertex.
	 * @param {t3d.Vector3} target - The target vector.
	 * @return {t3d.Vector3} The target vector.
	 */
	applyBoneTransform(index, target) {
		const skeleton = this.skeleton;
		const geometry = this.geometry;

		const skinIndex = geometry.attributes.skinIndex;
		const skinWeight = geometry.attributes.skinWeight;

		_skinIndex.fromArray(skinIndex.buffer.array, index * skinIndex.size);
		_skinWeight.fromArray(skinWeight.buffer.array, index * skinWeight.size);

		_basePosition.copy(target).applyMatrix4(this.bindMatrix);

		target.set(0, 0, 0);

		for (let i = 0; i < 4; i++) {
			const weight = getComponent(_skinWeight, i);

			if (weight < Number.EPSILON) continue;

			const boneIndex = getComponent(_skinIndex, i);

			if (!skeleton.bones[boneIndex]) continue;

			_matrix.multiplyMatrices(skeleton.bones[boneIndex].worldMatrix, skeleton.boneInverses[boneIndex]);
			target.addScaledVector(_vector.copy(_basePosition).applyMatrix4(_matrix), weight);
		}

		return target.applyMatrix4(this.bindMatrixInverse);
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
SkinnedMesh.prototype.isSkinnedMesh = true;

const _basePosition = new Vector3();
const _skinIndex = new Vector4();
const _skinWeight = new Vector4();

const _vector = new Vector3();
const _matrix = new Matrix4();

function getComponent(vec, index) {
	switch (index) {
		case 0: return vec.x;
		case 1: return vec.y;
		case 2: return vec.z;
		case 3: return vec.w;
		default: throw new Error('index is out of range: ' + index);
	}
}

export { SkinnedMesh };