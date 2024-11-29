import { QuaternionKeyframeTrack, NumberKeyframeTrack, VectorKeyframeTrack, ColorKeyframeTrack } from 't3d';

export class KHR_animation_pointer {

	static getTrackInfos(context, extensionDef, input, output, interpolation, trackInfos) {
		const { pointer } = extensionDef;

		const { type, index, property } = parseAnimationPointer(pointer);

		const searchArray = context[type];

		if (!searchArray) return;

		const target = searchArray[index];

		if (!target) return;

		let TypedKeyframeTrack, propertyPath,
			TypedKeyframeTrack2, propertyPath2;

		if (property === 'rotation') {
			TypedKeyframeTrack = QuaternionKeyframeTrack;
			propertyPath = 'quaternion';
		} else if (property === 'weights') {
			TypedKeyframeTrack = NumberKeyframeTrack;
			propertyPath = 'morphTargetInfluences';
		} else if (property === 'translation') {
			TypedKeyframeTrack = VectorKeyframeTrack;
			propertyPath = 'position';
		} else if (property === 'scale') {
			TypedKeyframeTrack = VectorKeyframeTrack;
			propertyPath = 'scale';
		} else if (property === 'baseColorFactor') {
			TypedKeyframeTrack = ColorKeyframeTrack;
			propertyPath = 'diffuse';
			TypedKeyframeTrack2 = NumberKeyframeTrack;
			propertyPath2 = 'opacity';
		} else if (property === 'metallicFactor') {
			TypedKeyframeTrack = NumberKeyframeTrack;
			propertyPath = 'metalness';
		} else if (property === 'roughnessFactor') {
			TypedKeyframeTrack = NumberKeyframeTrack;
			propertyPath = 'roughness';
		} else if (property === 'emissiveFactor') {
			TypedKeyframeTrack = VectorKeyframeTrack;
			propertyPath = 'emissive';
		} else {
			return;
		}

		if (property === 'baseColorFactor') {
			// Separate the alpha channel from the color
			const color3Output = new Float32Array(output.length / 4 * 3);
			const alphaOutput = new Float32Array(output.length / 4);
			for (let i = 0; i < output.length / 4; i++) {
				color3Output[i * 3] = output[i * 4];
				color3Output[i * 3 + 1] = output[i * 4 + 1];
				color3Output[i * 3 + 2] = output[i * 4 + 2];
				alphaOutput[i] = output[i * 4 + 3];
			}

			trackInfos.push({
				TypedKeyframeTrack,
				target,
				propertyPath,
				times: input,
				values: color3Output,
				interpolation
			});

			trackInfos.push({
				TypedKeyframeTrack: TypedKeyframeTrack2,
				target,
				propertyPath: propertyPath2,
				times: input,
				values: alphaOutput,
				interpolation
			});
		} else {
			trackInfos.push({
				TypedKeyframeTrack,
				target,
				propertyPath,
				times: input,
				values: output,
				interpolation
			});
		}
	}

}

function parseAnimationPointer(pointer) {
	const segments = pointer.replace(/^\//, '').split('/');

	return {
		type: segments[0],
		index: parseInt(segments[1]),
		property: segments[segments.length - 1]
	};
}