import { TransmissionPBRMaterial } from '../../../materials/TransmissionPBRMaterial.js';

/**
 * KHR_materials_ior extension
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
export class KHR_materials_ior {

	static getMaterial() {
		return new TransmissionPBRMaterial();
	}

	static parseParams(material, extension) {
		if (material.constructor !== TransmissionPBRMaterial) return;

		const { ior } = extension;

		if (ior !== undefined) {
			material.uniforms.ior = ior;
		}
	}

}