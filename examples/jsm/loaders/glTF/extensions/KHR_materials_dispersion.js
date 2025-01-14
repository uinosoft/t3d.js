import { TransmissionPBRMaterial } from '../../../materials/TransmissionPBRMaterial.js';

/**
 * KHR_materials_dispersion extension
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_dispersion
 */
export class KHR_materials_dispersion {

	static getMaterial() {
		return new TransmissionPBRMaterial();
	}

	static parseParams(material, extension) {
		if (material.constructor !== TransmissionPBRMaterial) return;

		const { dispersion } = extension;

		if (dispersion !== undefined) {
			material.uniforms.dispersion = dispersion;
			material.defines.USE_DISPERSION = true;
		}
	}

}