import { BasicMaterial } from 't3d';

/**
 * KHR_materials_unlit extension
 * https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
export class KHR_materials_unlit {

	static getMaterial() {
		return new BasicMaterial();
	}

}