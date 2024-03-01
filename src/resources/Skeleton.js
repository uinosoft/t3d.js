import { Texture2D } from './textures/Texture2D.js';
import { nextPowerOfTwo } from '../base.js';
import { PIXEL_FORMAT, PIXEL_TYPE, TEXTURE_FILTER } from '../const.js';
import { Matrix4 } from '../math/Matrix4.js';

const _offsetMatrix = new Matrix4();

/**
 * Use an array of bones to create a skeleton that can be used by a {@link t3d.SkinnedMesh}.
 * @memberof t3d
 */
class Skeleton {

	/**
	 * @param {t3d.Bone[]} bones
	 * @param {t3d.Matrix4[]} bones
	 */
	constructor(bones, boneInverses) {
		/**
		 * The array of bones.
		 * @type {t3d.Bone[]}
		 */
		this.bones = bones.slice(0);

		/**
		 * An array of Matrix4s that represent the inverse of the worldMatrix of the individual bones.
		 * @type {t3d.Matrix4[]}
		 */
		this.boneInverses = boneInverses;

		/**
		 * The array buffer holding the bone data.
		 * @type {Float32Array}
		 */
		this.boneMatrices = new Float32Array(16 * this.bones.length);

		/**
		 * The {@link t3d.Texture2D} holding the bone data when using a vertex texture.
		 * Use vertex texture to update boneMatrices, by that way, we can use more bones on phone.
		 * @type {t3d.Texture2D|undefined}
		 * @default undefined
		 */
		this.boneTexture = undefined;

		this._version = 0;
	}

	/**
	 * Returns the skeleton to the base pose.
	 */
	pose() {
		const boneInverses = this.boneInverses;

		for (let i = 0; i < this.bones.length; i++) {
			const bone = this.bones[i];
			bone.worldMatrix.getInverse(boneInverses[i]);
		}

		for (let i = 0; i < this.bones.length; i++) {
			const bone = this.bones[i];
			if (bone.parent && bone.parent.isBone) {
				bone.matrix.getInverse(bone.parent.worldMatrix);
				bone.matrix.multiply(bone.worldMatrix);
			} else {
				bone.matrix.copy(bone.worldMatrix);
			}

			bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);
		}
	}

	/**
	 * Clone skeleton.
	 * @return {t3d.Skeleton}
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
		let size = Math.sqrt(this.bones.length * 4);
		size = nextPowerOfTwo(Math.ceil(size));
		size = Math.max(4, size);

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