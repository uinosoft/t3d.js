import { TransmissionPBRMaterial } from '../../../materials/TransmissionPBRMaterial.js';

/**
 * KHR_materials_transmission extension
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
export class KHR_materials_transmission {

	static getMaterial() {
		return new TransmissionPBRMaterial();
	}

	static parseParams(material, extension, textures) {
		if (material.constructor !== TransmissionPBRMaterial) return;

		const { transmissionFactor, transmissionTexture } = extension;

		if (transmissionFactor !== undefined) {
			material.uniforms.transmission = transmissionFactor;
		}

		if (transmissionTexture !== undefined) {
			material.uniforms.transmissionMap = textures[transmissionTexture.index];
			material.defines.USE_TRANSMISSIONMAP = true;
			material.extUvCoordMask = material.extUvCoordMask | (1 << 0);
		}
	}

}