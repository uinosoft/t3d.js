import {
	Quaternion,
	Vector3
} from 't3d';

// CCD Algorithm
// - https://sites.google.com/site/auraliusproject/ccd-algorithm
//
// ik parameter example
//
// target, effector, index in links are bone index in skeleton.bones.
// the bones relation should be
// <-- parent                                  child -->
// links[ n ], links[ n - 1 ], ..., links[ 0 ], effector
// iks = [ {
//	target: 1,
//	effector: 2,
//	links: [ { index: 5, limitation: new Vector3( 1, 0, 0 ) }, { index: 4, enabled: false }, { index : 3 } ],
//	iteration: 10,
//	minAngle: 0.0,
//	maxAngle: 1.0,
// } ];
class CCDIKSolver {

	/**
	 * @param {Array[Bone]} mesh
	 * @param {Array[Object]} iks
	 */
	constructor(bones, iks = []) {
		this.bones = bones;
		this.iks = iks;

		this.target = new Vector3();

		this._valid();
	}

	/**
	 * Update all IK bones.
	 * @return {CCDIKSolver}
	 */
	update() {
		const iks = this.iks;

		for (let i = 0, il = iks.length; i < il; i++) {
			this.updateOne(iks[i]);
		}

		return this;
	}

	/**
	 * Update one IK bone
	 * @param {Object} ik parameter
	 * @return {CCDIKSolver}
	 */
	updateOne(ik) {
		const bones = this.bones;

		// for reference overhead reduction in loop
		const math = Math;

		const effector = bones[ik.effector];

		const links = ik.links;
		const iteration = ik.iteration !== undefined ? ik.iteration : 1;

		for (let i = 0; i < iteration; i++) {
			let rotated = false;

			for (let j = 0, jl = links.length; j < jl; j++) {
				const link = bones[links[j].index];

				// skip this link and following links.
				// this skip is used for MMD performance optimization.
				if (links[j].enabled === false) break;

				const limitation = links[j].limitation;
				const rotationMin = links[j].rotationMin;
				const rotationMax = links[j].rotationMax;

				// don't use getWorldPosition/Quaternion() here for the performance
				// because they call updateMatrixWorld( true ) inside.
				link.worldMatrix.decompose(_linkPos, _invLinkQ, _linkScale);
				_invLinkQ.conjugate();
				_effectorPos.setFromMatrixPosition(effector.worldMatrix);

				// work in link world
				_effectorVec.subVectors(_effectorPos, _linkPos);
				_effectorVec.applyQuaternion(_invLinkQ);
				_effectorVec.normalize();

				_targetVec.subVectors(this.target, _linkPos);
				_targetVec.applyQuaternion(_invLinkQ);
				_targetVec.normalize();

				let angle = _targetVec.dot(_effectorVec);

				if (angle > 1.0) {
					angle = 1.0;
				} else if (angle < -1.0) {
					angle = -1.0;
				}

				angle = math.acos(angle);

				// skip if changing angle is too small to prevent vibration of bone
				if (angle < 1e-5) continue;

				if (ik.minAngle !== undefined && angle < ik.minAngle) {
					angle = ik.minAngle;
				}

				if (ik.maxAngle !== undefined && angle > ik.maxAngle) {
					angle = ik.maxAngle;
				}

				_axis.crossVectors(_effectorVec, _targetVec);
				_axis.normalize();

				_q.setFromAxisAngle(_axis, angle);
				link.quaternion.multiply(_q);

				// TODO: re-consider the limitation specification
				if (limitation !== undefined) {
					let c = link.quaternion.w;

					if (c > 1.0) {
						c = 1.0;
					}

					const c2 = math.sqrt(1 - c * c);
					link.quaternion.set(limitation.x * c2, limitation.y * c2, limitation.z * c2, c);
				}

				if (rotationMin !== undefined) {
					_vector.set(link.euler.x, link.euler.y, link.euler.z).max(rotationMin);
					link.euler.set(_vector.x, _vector.y, _vector.z);
				}

				if (rotationMax !== undefined) {
					_vector.set(link.euler.x, link.euler.y, link.euler.z).min(rotationMax);
					link.euler.set(_vector.x, _vector.y, _vector.z);
				}

				link.updateMatrix(true);

				rotated = true;
			}
			if (!rotated) break;
		}

		return this;
	}

	// private methods

	_valid() {
		const bones = this.bones;
		const iks = this.iks;

		for (let i = 0, il = iks.length; i < il; i++) {
			const ik = iks[i];
			const effector = bones[ik.effector];
			const links = ik.links;
			let link0, link1;

			link0 = effector;

			for (let j = 0, jl = links.length; j < jl; j++) {
				link1 = bones[links[j].index];

				if (link0.parent !== link1) {
					console.warn('CCDIKSolver: bone ' + link0.name + ' is not the child of bone ' + link1.name);
				}

				link0 = link1;
			}
		}
	}

}

const _q = new Quaternion();
const _targetVec = new Vector3();
const _effectorPos = new Vector3();
const _effectorVec = new Vector3();
const _linkPos = new Vector3();
const _invLinkQ = new Quaternion();
const _linkScale = new Vector3();
const _axis = new Vector3();
const _vector = new Vector3();

export { CCDIKSolver };