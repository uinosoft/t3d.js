import { Object3D } from './Object3D.js';

/**
 * A bone which is part of a Skeleton.
 * The skeleton in turn is used by the SkinnedMesh.
 * Bones are almost identical to a blank Object3D.
 * Bone acturely is a joint.
 * The position means joint position.
 * Mesh transform is based this joint space.
 * @memberof t3d
 * @extends t3d.Object3D
 */
class Bone extends Object3D {

	constructor() {
		super();
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
Bone.prototype.isBone = true;

export { Bone };