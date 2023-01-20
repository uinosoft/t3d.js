export class BufferViewParser {

	static parse(context) {
		const { buffers, gltf } = context;

		if (!gltf.bufferViews) return;

		const bufferViews = gltf.bufferViews.map(bufferView => {
			const { buffer, byteOffset = 0, byteLength = 0 } = bufferView;
			const arrayBuffer = buffers[buffer];
			return arrayBuffer.slice(byteOffset, byteOffset + byteLength);
		});

		context.bufferViews = bufferViews;
	}

}