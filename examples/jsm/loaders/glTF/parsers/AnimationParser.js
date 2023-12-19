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
import { PATH_PROPERTIES } from '../Constants.js';

export class AnimationParser {

	static parse(context) {
		const { gltf, nodes, accessors } = context;
		const { animations } = gltf;

		if (!animations) return;

		const animationClips = animations.map((gltfAnimation, index) => {
			const { channels, samplers, name = `animation_${index}` } = gltfAnimation;

			const tracks = [];
			let duration = 0;

			for (let i = 0; i < channels.length; i++) {
				const gltfChannel = channels[i];
				const gltfSampler = samplers[gltfChannel.sampler];
				if (gltfSampler) {
					const target = gltfChannel.target;
					const name = target.node !== undefined ? target.node : target.id; // Note: target.id is deprecated.
					const inputAccessor = accessors[gltfSampler.input];
					const outputAccessor = accessors[gltfSampler.output];

					const node = nodes[name];

					if (!node) continue;

					node.updateMatrix();
					node.matrixAutoUpdate = true;

					let TypedKeyframeTrack;

					switch (PATH_PROPERTIES[target.path]) {
						case PATH_PROPERTIES.rotation:
							TypedKeyframeTrack = QuaternionKeyframeTrack;
							break;
						case PATH_PROPERTIES.weights:
							TypedKeyframeTrack = NumberKeyframeTrack;
							break;
						case PATH_PROPERTIES.position:
						case PATH_PROPERTIES.scale:
						default:
							TypedKeyframeTrack = VectorKeyframeTrack;
							break;
					}

					if (!TypedKeyframeTrack) {
						continue;
					}

					const input = new inputAccessor.buffer.array.constructor(inputAccessor.buffer.array);
					const output = new Float32Array(outputAccessor.buffer.array);

					if (outputAccessor.normalized) {
						const scale = GLTFUtils.getNormalizedComponentScale(outputAccessor.buffer.array.constructor);
						for (let j = 0, jl = output.length; j < jl; j++) {
							output[j] *= scale;
						}
					}

					const targetNodes = [];
					if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
						// Node may be a Object3D (glTF mesh with several primitives) or a Mesh.
						node.traverse(function(object) {
							if (object.isMesh && object.morphTargetInfluences) {
								targetNodes.push(object);
							}
						});
					} else {
						targetNodes.push(node);
					}

					for (let j = 0, jl = targetNodes.length; j < jl; j++) {
						const interpolant = getInterpolant(gltfSampler.interpolation, TypedKeyframeTrack === QuaternionKeyframeTrack);
						const track = new TypedKeyframeTrack(targetNodes[j], PATH_PROPERTIES[target.path], input, output, interpolant);
						tracks.push(track);
					}

					const maxTime = input[input.length - 1];
					if (duration < maxTime) {
						duration = maxTime;
					}
				}
			}

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