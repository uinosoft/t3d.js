import { Mesh } from './Mesh.js';
import { Matrix4 } from '../math/Matrix4.js';

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

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
SkinnedMesh.prototype.isSkinnedMesh = true;

export { SkinnedMesh };