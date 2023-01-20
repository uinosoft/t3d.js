import { DirectionalLight, PointLight, SpotLight } from 't3d';

/**
 * KHR_lights_punctual extension
 * https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_lights_punctual/README.md
 */
export class KHR_lights_punctual {

	static getLight(params) {
		const { color, intensity = 1, type, range, spot } = params;

		let lightNode;

		if (type === 'directional') {
			lightNode = new DirectionalLight();
		} else if (type === 'point') {
			lightNode = new PointLight();

			if (range !== undefined) {
				lightNode.distance = range;
			}

			// https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_lights_punctual/README.md#range-property
			// lightNode.decay = 2;
		} else if (type === 'spot') {
			lightNode = new SpotLight();

			if (range !== undefined) {
				lightNode.distance = range;
			}

			// https://github.com/KhronosGroup/glTF/blob/master/extensions/2.0/Khronos/KHR_lights_punctual/README.md#range-property
			// lightNode.decay = 2;

			if (spot) {
				const { innerConeAngle = 0, outerConeAngle = Math.PI / 4 } = spot;
				lightNode.angle = outerConeAngle;
				lightNode.penumbra = 1.0 - innerConeAngle / outerConeAngle;
			}
		} else {
			throw new Error('Unexpected light type: ' + type);
		}

		if (color) {
			lightNode.color.fromArray(color);
		}

		lightNode.intensity = intensity;

		return lightNode;
	}

}