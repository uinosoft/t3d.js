import { KeyframeClip } from 't3d';

/**
 * SkeletonUtils
 */
const SkeletonUtils = {

	clone: function(source, clips, outputClips) {
		const sourceLookup = new Map();
		const cloneLookup = new Map();

		const clone = source.clone();

		parallelTraverse(source, clone, function(sourceNode, clonedNode) {
			sourceLookup.set(clonedNode, sourceNode);
			cloneLookup.set(sourceNode, clonedNode);
		});

		clone.traverse(function (node) {
			if (!node.skeleton) return;
			const clonedMesh = node;
			const sourceMesh = sourceLookup.get(node);
			const sourceBones = sourceMesh.skeleton.bones;
			clonedMesh.skeleton = sourceMesh.skeleton.clone();
			clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);
			clonedMesh.skeleton.bones = sourceBones.map(function (bone) {
				return cloneLookup.get(bone);
			});
			// clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
		});

		// console.time('clone');

		if (clips && clips.length > 0) {
			clips.forEach(function(clip) {
				const tracks = clip.tracks.map(function(track) {
					return new track.constructor(
						cloneLookup.get(track.target),
						track.propertyPath,
						track.times,
						track.values,
						track.interpolant
					);
				});
				const newClip = new KeyframeClip(clip.name, tracks, clip.duration);
				outputClips.push(newClip);
			});
		}

		// console.timeEnd('clone');

		return clone;
	}

}

function parallelTraverse(a, b, callback) {
	callback(a, b);

	for (let i = 0; i < a.children.length; i++) {
		parallelTraverse(a.children[i], b.children[i], callback);
	}
}

export { SkeletonUtils };