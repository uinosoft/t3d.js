/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
export class KHR_materials_volume {

	static parseParams(material, extension, textures) {
		const { thicknessFactor, thicknessTexture, attenuationDistance, attenuationColor } = extension;
		if (thicknessFactor) {
			material.uniforms.thickness = thicknessFactor;
		}

		if (thicknessTexture) {
			material.uniforms.thicknessMap = textures[thicknessTexture.index];
		}

		if (attenuationDistance) {
			material.uniforms.attenuationDistance = attenuationDistance;
		}

		if (attenuationColor) {
			material.uniforms.attenuationColor = attenuationColor;
		}
	}

}