/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
export class EXT_meshopt_compression {

	static loadBufferView(extensionDef, buffers, meshoptDecoder) {
		const buffer = buffers[extensionDef.buffer];

		if (!meshoptDecoder || !meshoptDecoder.supported) {
			throw new Error('GLTFLoader: setMeshoptDecoder must be called before loading compressed files.');
		}

		const byteOffset = extensionDef.byteOffset || 0;
		const byteLength = extensionDef.byteLength || 0;

		const count = extensionDef.count;
		const stride = extensionDef.byteStride;

		const source = new Uint8Array(buffer, byteOffset, byteLength);

		if (meshoptDecoder.decodeGltfBufferAsync) {
			return meshoptDecoder.decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter).then(res => res.buffer);
		} else {
			// Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
			return meshoptDecoder.ready.then(() => {
				const result = new ArrayBuffer(count * stride);
				meshoptDecoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
				return result;
			});
		}
	}

}