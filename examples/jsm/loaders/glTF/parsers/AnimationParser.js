import {
	QuaternionKeyframeTrack,
	NumberKeyframeTrack,
	VectorKeyframeTrack,
	KeyframeClip,
	StepInterpolant,
	LinearInterpolant,
	CubicSplineInterpolant,
	QuaternionLinearInterpolant,
	QuaternionCubicSplineInterpolant
} from 't3d';
import { GLTFUtils } from '../GLTFUtils.js';

export class AnimationParser {

	static parse(context, loader) {
		const { gltf, nodes, accessors } = context;
		const { animations } = gltf;

		if (!animations) return;

		const pointerExt = loader.extensions.get('KHR_animation_pointer');

		const animationClips = animations.map((gltfAnimation, index) => {
			const { channels, samplers, name = `animation_${index}` } = gltfAnimation;

			const trackInfos = [];
			let duration = 0;

			for (let i = 0; i < channels.length; i++) {
				const gltfChannel = channels[i];
				const gltfSampler = samplers[gltfChannel.sampler];

				if (!gltfSampler) continue;

				const targetDef = gltfChannel.target;

				const inputAccessor = accessors[gltfSampler.input];
				const input = new inputAccessor.buffer.array.constructor(inputAccessor.buffer.array);

				const outputAccessor = accessors[gltfSampler.output];
				const output = new Float32Array(outputAccessor.buffer.array);
				if (outputAccessor.normalized) {
					const scale = GLTFUtils.getNormalizedComponentScale(outputAccessor.buffer.array.constructor);
					for (let j = 0, jl = output.length; j < jl; j++) {
						output[j] *= scale;
					}
				}

				duration = Math.max(duration, input[input.length - 1]);

				if (pointerExt && targetDef.extensions && targetDef.extensions['KHR_animation_pointer']) {
					pointerExt.getTrackInfos(
						context, targetDef.extensions['KHR_animation_pointer'],
						input, output, gltfSampler.interpolation, trackInfos
					);
				} else {
					const target = nodes[targetDef.node !== undefined ? targetDef.node : targetDef.id]; // Note: targetDef.id is deprecated.

					if (!target) continue;

					let TypedKeyframeTrack, propertyPath;

					if (targetDef.path === 'rotation') {
						TypedKeyframeTrack = QuaternionKeyframeTrack;
						propertyPath = 'quaternion';
					} else if (targetDef.path === 'weights') {
						TypedKeyframeTrack = NumberKeyframeTrack;
						propertyPath = 'morphTargetInfluences';
					} else if (targetDef.path === 'translation') {
						TypedKeyframeTrack = VectorKeyframeTrack;
						propertyPath = 'position';
					} else if (targetDef.path === 'scale') {
						TypedKeyframeTrack = VectorKeyframeTrack;
						propertyPath = 'scale';
					} else {
						continue;
					}

					trackInfos.push({
						TypedKeyframeTrack,
						target,
						propertyPath,
						times: input,
						values: output,
						interpolation: gltfSampler.interpolation
					});
				}
			}

			const tracks = [];
			trackInfos.forEach(trackInfo => {
				const { TypedKeyframeTrack, target, propertyPath, times, values, interpolation } = trackInfo;

				const interpolant = getInterpolant(interpolation, TypedKeyframeTrack === QuaternionKeyframeTrack);

				if (propertyPath === 'morphTargetInfluences') {
					// node may be a Object3D (glTF mesh with several primitives) or a Mesh.
					target.traverse(object => {
						if (object.isMesh && object.morphTargetInfluences) {
							const track = new TypedKeyframeTrack(object, propertyPath, times, values, interpolant);
							tracks.push(track);
						}
					});
				} else {
					const track = new TypedKeyframeTrack(target, propertyPath, times, values, interpolant);
					tracks.push(track);
				}
			});

			return new KeyframeClip(name, tracks, duration);
		});

		context.animations = animationClips;
	}

}

function getInterpolant(type, quaternion) {
	switch (type) {
		case 'STEP':
			return StepInterpolant;
		case 'CUBICSPLINE':
			return quaternion ? QuaternionCubicSplineInterpolant : CubicSplineInterpolant;
		case 'LINEAR':
		default:
			return quaternion ? QuaternionLinearInterpolant : LinearInterpolant;
	}
}