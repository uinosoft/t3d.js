import { TransmissionPBRMaterial } from '../../../materials/TransmissionPBRMaterial.js';

/**
 * KHR_materials_volume extension
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
export class KHR_materials_volume {

	static parseParams(material, extension, textures) {
		if (material.constructor !== TransmissionPBRMaterial) return;

		const { thicknessFactor, thicknessTexture, attenuationDistance, attenuationColor } = extension;

		if (thicknessFactor !== undefined) {
			material.uniforms.thickness = thicknessFactor;
		}

		if (thicknessTexture !== undefined) {
			material.uniforms.thicknessMap = textures[thicknessTexture.index];
			material.defines.USE_THICKNESSMAP = true;
			material.extUvCoordMask = material.extUvCoordMask | (1 << 0);
		}

		if (attenuationDistance !== undefined) {
			material.uniforms.attenuationDistance = attenuationDistance;
		}

		if (attenuationColor !== undefined) {
			material.uniforms.attenuationColor = attenuationColor;
		}
	}

}