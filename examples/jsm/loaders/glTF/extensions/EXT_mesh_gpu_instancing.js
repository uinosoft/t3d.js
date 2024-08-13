import { Attribute, Buffer, Matrix4, Vector3, Quaternion } from 't3d';
/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 *
 */

export class EXT_mesh_gpu_instancing {

	static getMesh(params, accessors, node, options) {
		if (!options || !options.InstancedPBRMaterial) {
			throw new Error('GLTFLoader: instancing need InstancedPBRMaterial.');
		}

		if (node.geometry.instanceCount > 0) {
			node.geometry = node.geometry.clone();
			node.geometry.removeAttribute(options.InstancedPBRValue.matrices);
			node.geometry.removeAttribute(options.InstancedPBRValue.color);
		}

		const attributesDef = params.attributes;

		const attributes = [];
		let count = 0;
		for (const key in attributesDef) {
			attributes[key] = accessors[attributesDef[key]];
			count = attributes[key].buffer.count;
		}
		if (count < 1) {
			return node;
		}

		const geometry = node.geometry;
		node.material = new options.InstancedPBRMaterial(node.material);
		node.frustumCulled = false;

		const m = new Matrix4();
		const p = new Vector3();
		const q = new Quaternion();
		const s = new Vector3(1, 1, 1);
		const matrices = [];

		for (let i = 0; i < count; i++) {
			if (attributes.TRANSLATION) {
				fromBufferAttribute(p, attributes.TRANSLATION, i);
			}

			if (attributes.ROTATION) {
				fromBufferAttribute(q, attributes.ROTATION, i);
			}

			if (attributes.SCALE) {
				fromBufferAttribute(s, attributes.SCALE, i);
			}

			m.transform(p, s, q);
			m.toArray(matrices, i * 16);
		}

		const instanceMatrixAttribute = new Attribute(new Buffer(new Float32Array(matrices), 16));
		instanceMatrixAttribute.divisor = 1;

		geometry.addAttribute(options.InstancedPBRValue.matrices, instanceMatrixAttribute);
		if (attributes._COLOR_0) {
			geometry.addAttribute(options.InstancedPBRValue.color, attributes._COLOR_0);
		}

		geometry.instanceCount = count;
		return node;
	}

}

function fromBufferAttribute(value, attribute, index) {
	value.x = getX(attribute, index);
	value.y = getY(attribute, index);
	value.z = getZ(attribute, index);
	if (value.w) {
		value.w = getW(attribute, index);
	}

	return value;
}

function getX(value, index) {
	let x = value.buffer.array[index * value.size];

	if (value.normalized) x = denormalize(x, value.array);

	return x;
}

function getY(value, index) {
	let y = value.buffer.array[index * value.size + 1];

	if (value.normalized) y = denormalize(y, value.array);

	return y;
}

function getZ(value, index) {
	let z = value.buffer.array[index * value.size + 2];

	if (value.normalized) z = denormalize(z, value.array);

	return z;
}

function getW(value, index) {
	let w = value.buffer.array[index * value.size + 3];

	if (value.normalized) w = denormalize(w, value.array);

	return w;
}

function denormalize(value, array) {
	switch (array.constructor) {
		case Float32Array:

			return value;

		case Uint32Array:

			return value / 4294967295.0;

		case Uint16Array:

			return value / 65535.0;

		case Uint8Array:

			return value / 255.0;

		case Int32Array:

			return Math.max(value / 2147483647.0, -1.0);

		case Int16Array:

			return Math.max(value / 32767.0, -1.0);

		case Int8Array:

			return Math.max(value / 127.0, -1.0);

		default:

			throw new Error('Invalid component type.');
	}
}