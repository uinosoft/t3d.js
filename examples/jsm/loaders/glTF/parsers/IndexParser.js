import { GLTFUtils } from '../GLTFUtils.js';

export class IndexParser {

	static parse(context, loader) {
		const { url } = context;

		return loader.loadFile(url, 'arraybuffer').then(data => {
			const magic = GLTFUtils.decodeText(new Uint8Array(data, 0, 4));

			if (magic === 'glTF') {
				const glbData = GLTFUtils.parseGLB(data);
				context.gltf = glbData.gltf;
				context.buffers = glbData.buffers;
			} else {
				const gltfString = GLTFUtils.decodeText(new Uint8Array(data));
				context.gltf = JSON.parse(gltfString);
			}
		});
	}

}