import { Texture2D } from './textures/Texture2D.js';
import { PIXEL_FORMAT, PIXEL_TYPE, TEXTURE_FILTER } from '../const.js';
import { Matrix4 } from '../math/Matrix4.js';
import { MathUtils } from '../math/MathUtils.js';

const _offsetMatrix = new Matrix4();

/**
 * Use an array of bones to create a skeleton that can be used by a {@link SkinnedMesh}.
 */
class Skeleton {

	/**
	 * @param {Bone[]} bones
	 * @param {Matrix4[]} boneInverses
	 */
	constructor(bones, boneInverses) {
		/**
		 * The array of bones.
		 * @type {Bone[]}
		 */
		this.bones = bones.slice(0);

		/**
		 * An array of Matrix4s that represent the inverse of the worldMatrix of the individual bones.
		 * @type {Matrix4[]}
		 */
		this.boneInverses = boneInverses;

		/**
		 * The array buffer holding the bone data.
		 * @type {Float32Array}
		 */
		this.boneMatrices = new Float32Array(16 * this.bones.length);

		/**
		 * The {@link Texture2D} holding the bone data when using a vertex texture.
		 * Use vertex texture to update boneMatrices, by that way, we can use more bones on phone.
		 * @type {Texture2D|undefined}
		 * @default undefined
		 */
		this.boneTexture = undefined;
	}

	/**
	 * Returns the skeleton to the base pose.
	 */
	pose() {
		const boneInverses = this.boneInverses;

		for (let i = 0; i < this.bones.length; i++) {
			const bone = this.bones[i];
			bone.worldMatrix.copy(boneInverses[i]).invert();
		}

		for (let i = 0; i < this.bones.length; i++) {
			const bone = this.bones[i];
			if (bone.parent && bone.parent.isBone) {
				bone.matrix.copy(bone.parent.worldMatrix).invert();
				bone.matrix.multiply(bone.worldMatrix);
			} else {
				bone.matrix.copy(bone.worldMatrix);
			}

			bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);
		}
	}

	/**
	 * Clone skeleton.
	 * @returns {Skeleton}
	 */
	clone() {
		return new Skeleton(this.bones, this.boneInverses);
	}

	/**
	 * Updates the boneMatrices and boneTexture after changing the bones.
	 * This is called automatically if the skeleton is used with a SkinnedMesh.
	 * @ignore
	 */
	updateBones(sceneData) {
		const useAnchorMatrix = sceneData.useAnchorMatrix;
		const anchorMatrixInverse = sceneData.anchorMatrixInverse;
		const boneInverses = this.boneInverses;

		for (let i = 0; i < this.bones.length; i++) {
			const bone = this.bones[i];
			_offsetMatrix.multiplyMatrices(bone.worldMatrix, boneInverses[i]);
			if (useAnchorMatrix) {
				_offsetMatrix.premultiply(anchorMatrixInverse);
			}
			_offsetMatrix.toArray(this.boneMatrices, i * 16);
		}

		if (this.boneTexture !== undefined) {
			this.boneTexture.version++;
		}
	}

	generateBoneTexture() {
		let size = MathUtils.nextPowerOfTwoSquareSize(this.bones.length * 4);
		size = Math.max(size, 4);

		const boneMatrices = new Float32Array(size * size * 4);
		boneMatrices.set(this.boneMatrices);

		const boneTexture = new Texture2D();
		boneTexture.image = { data: boneMatrices, width: size, height: size };
		boneTexture.format = PIXEL_FORMAT.RGBA;
		boneTexture.type = PIXEL_TYPE.FLOAT;
		boneTexture.magFilter = TEXTURE_FILTER.NEAREST;
		boneTexture.minFilter = TEXTURE_FILTER.NEAREST;
		boneTexture.generateMipmaps = false;
		boneTexture.flipY = false;

		this.boneMatrices = boneMatrices;
		this.boneTexture = boneTexture;
	}

}

export { Skeleton };