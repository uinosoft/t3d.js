import { Attribute, Buffer } from 't3d';
import { ACCESSOR_COMPONENT_TYPES, ACCESSOR_TYPE_SIZES } from "../Constants.js";

export class AccessorParser {

	static parse(context) {
		const { bufferViews, gltf } = context;

		if (!gltf.accessors) return;

		const interleavedBufferCache = new Map();

		const accessors = gltf.accessors.map(accessor => {
			const { bufferView: bufferViewIndex, type, componentType, count, byteOffset = 0, normalized = false, sparse } = accessor;

			if (bufferViewIndex === undefined && sparse === undefined) {
				// Ignore empty accessors, which may be used to declare runtime
				// information about attributes coming from another source (e.g. Draco compression extension).
				return null;
			}

			// Get buffer view infos
			const bufferView = bufferViewIndex !== undefined ? bufferViews[bufferViewIndex] : null;
			const byteStride = bufferViewIndex !== undefined ? gltf.bufferViews[bufferViewIndex].byteStride : undefined;

			// Get accessor infos
			const itemSize = ACCESSOR_TYPE_SIZES[type];
			const TypedArray = ACCESSOR_COMPONENT_TYPES[componentType];
			const elementBytes = TypedArray.BYTES_PER_ELEMENT;
			const itemBytes = elementBytes * itemSize; // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.

			let array, attribute;

			if (byteStride && byteStride !== itemBytes) { // The buffer is interleaved if the stride equals the item size in bytes.
				const ibCacheKey = 'Buffer:' + bufferViewIndex + ':' + componentType;
				let ib = interleavedBufferCache.get(ibCacheKey);

				if (!ib) {
					// Use the full buffer if it's interleaved.
					array = new TypedArray(bufferView);

					// Integer parameters to IB/IBA are in array elements, not bytes.
					ib = new Buffer(array, byteStride / elementBytes);

					interleavedBufferCache.set(ibCacheKey, ib);
				}

				attribute = new Attribute(ib, itemSize, byteOffset / elementBytes, normalized);
			} else {
				if (bufferView === null) {
					array = new TypedArray(count * itemSize);
				} else {
					array = new TypedArray(bufferView, byteOffset, count * itemSize);
				}

				attribute = new Attribute(new Buffer(array, itemSize), itemSize, 0, normalized);
			}

			// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
			if (sparse) {
				const itemSizeIndices = ACCESSOR_TYPE_SIZES.SCALAR;
				const TypedArrayIndices = ACCESSOR_COMPONENT_TYPES[sparse.indices.componentType];

				const byteOffsetIndices = sparse.indices.byteOffset || 0;
				const byteOffsetValues = sparse.values.byteOffset || 0;

				const sparseIndices = new TypedArrayIndices(bufferViews[sparse.indices.bufferView], byteOffsetIndices, sparse.count * itemSizeIndices);
				const sparseValues = new TypedArray(bufferViews[sparse.values.bufferView], byteOffsetValues, sparse.count * itemSize);

				if (bufferView !== null) {
					// Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
					attribute = new Attribute(attribute.buffer.clone(), attribute.size, attribute.offset, attribute.normalized);
				}

				const buffer = attribute.buffer;

				for (let i = 0, il = sparseIndices.length; i < il; i++) {
					let index = sparseIndices[i];

					buffer.array[index * attribute.size] = sparseValues[i * itemSize];
					if (itemSize >= 2) buffer.array[index * attribute.size + 1] = sparseValues[i * itemSize + 1];
					if (itemSize >= 3) buffer.array[index * attribute.size + 2] = sparseValues[i * itemSize + 2];
					if (itemSize >= 4) buffer.array[index * attribute.size + 3] = sparseValues[i * itemSize + 3];
					if (itemSize >= 5) throw new Error('Unsupported itemSize in sparse Attribute.');
				}
			}

			return attribute;
		});

		interleavedBufferCache.clear();

		context.accessors = accessors;
	}

}