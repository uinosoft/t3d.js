import { GLTFUtils } from "../GLTFUtils.js";

export class BufferParser {

	static parse(context, loader) {
		const { gltf, loadItems } = context;

		if (context.buffers !== null) {
			// buffers have been parsed
			return null;
		} else {
			return Promise.all(
				gltf.buffers.map(buffer => {
					const bufferUrl = GLTFUtils.resolveURL(buffer.uri, context.path);
					if (loader.detailLoadProgress) {
						loadItems.delete(bufferUrl);
					}
					const promise = loader.loadFile(bufferUrl, 'arraybuffer').then(buffer => {
						if (loader.detailLoadProgress) {
							loader.manager.itemEnd(bufferUrl);
						}
						return buffer;
					});
					if (loader.detailLoadProgress) {
						promise.catch(() => loader.manager.itemEnd(bufferUrl));
					}
					return promise;
				})
			).then((buffers) => {
				context.buffers = buffers;
			});
		}
	}

}