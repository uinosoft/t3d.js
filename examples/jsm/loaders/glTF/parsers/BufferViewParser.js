export class BufferViewParser {

	static parse(context, loader) {
		const { buffers, gltf } = context;

		if (!gltf.bufferViews) return;

		const meshoptExt = loader.extensions.get('EXT_meshopt_compression');

		return Promise.all(
			gltf.bufferViews.map(bufferView => {
				const { buffer, byteOffset = 0, byteLength = 0 } = bufferView;

				if (bufferView.extensions) {
					const { EXT_meshopt_compression } = bufferView.extensions;
					if (EXT_meshopt_compression && meshoptExt) {
						return meshoptExt.loadBufferView(EXT_meshopt_compression, buffers, loader.getMeshoptDecoder());
					}
				}

				const arrayBuffer = buffers[buffer];
				return arrayBuffer.slice(byteOffset, byteOffset + byteLength);
			})
		).then(bufferViews => {
			context.bufferViews = bufferViews;
		});
	}

}