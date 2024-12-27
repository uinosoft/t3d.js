import { TransmissionPBRMaterial } from '../../../materials/TransmissionPBRMaterial.js';

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
export class KHR_materials_transmission {

	static getMaterial() {
		return new TransmissionPBRMaterial();
	}

	static parseParams(material, extension, textures) {
		const { transmissionFactor, transmissionTexture } = extension;

		if (transmissionFactor) {
			material.uniforms.transmission = transmissionFactor;
		}

		if (transmissionTexture) {
			material.uniforms.transmissionMap = textures[transmissionTexture.index];
		}
	}

}