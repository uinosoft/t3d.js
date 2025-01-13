import { QuaternionKeyframeTrack, NumberKeyframeTrack, VectorKeyframeTrack, ColorKeyframeTrack } from 't3d';

export class KHR_animation_pointer {

	static getTrackInfos(context, extensionDef, input, output, interpolation, trackInfos) {
		const { pointer } = extensionDef;

		const segments = pointer.replace(/^\//, '').split('/');

		const type = segments[0];
		const index = parseInt(segments[1]);
		const property = segments[segments.length - 1];

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
		} else if (segments[segments.length - 2] === 'KHR_texture_transform') {
			TypedKeyframeTrack = VectorKeyframeTrack;

			const textureProperty = segments[segments.length - 4];
			if (textureProperty === 'baseColorTexture') {
				propertyPath = 'diffuseMapTransform.' + property;
			} else if (textureProperty === 'emissiveTexture') {
				propertyPath = 'emissiveMapTransform.' + property;
			} else {
				return;
			}
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