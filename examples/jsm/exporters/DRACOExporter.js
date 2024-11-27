/**
 * Export draco compressed files from t3d geometry objects.
 *
 * Draco files are compressed and usually are smaller than conventional 3D file formats.
 *
 * The exporter receives a options object containing
 *  - pointCloud, indicates if the geometry is a point cloud or a mesh
 *  - decodeSpeed, indicates how to tune the encoder regarding decode speed (0 gives better speed but worst quality)
 *  - encodeSpeed, indicates how to tune the encoder parameters (0 gives better speed but worst quality)
 *  - encoderMethod
 *  - quantization, indicates the presision of each type of data stored in the draco file in the order (POSITION, NORMAL, COLOR, TEX_COORD, GENERIC)
 */
class DRACOExporter {

	parse(geometry, options = {}) {
		options = Object.assign({
			pointCloud: false,
			decodeSpeed: 5,
			encodeSpeed: 5,
			encoderMethod: ENCODER_METHOD.EDGEBREAKER,
			quantization: [16, 8, 8, 8, 8]
		}, options);

		if (DracoEncoderModule === undefined) {
			throw new Error('DRACOExporter: required the draco_encoder to work.');
		}

		const dracoEncoder = DracoEncoderModule();
		const encoder = new dracoEncoder.Encoder();
		let builder;
		let dracoObject;

		const dracoAttributes = {};
		let darcoAttributeID = 0;

		const positionAttribute = geometry.getAttribute('a_Position');
		const positionBuffer = positionAttribute.buffer;

		if (options.pointCloud === true) {
			builder = new dracoEncoder.PointCloudBuilder();
			dracoObject = new dracoEncoder.PointCloud();
		} else {
			builder = new dracoEncoder.MeshBuilder();
			dracoObject = new dracoEncoder.Mesh();

			const faceAttribute = geometry.index;
			if (faceAttribute !== null) {
				const faceBuffer = faceAttribute.buffer;
				builder.AddFacesToMesh(dracoObject, faceBuffer.count / 3, faceBuffer.array);
			} else {
				const faces = new (positionBuffer.count > 65535 ? Uint32Array : Uint16Array)(positionBuffer.count);
				for (let i = 0; i < faces.length; i++) {
					faces[i] = i;
				}
				builder.AddFacesToMesh(dracoObject, positionBuffer.count, faces);
			}
		}

		builder.AddFloatAttribute(dracoObject, dracoEncoder.POSITION, positionBuffer.count, positionAttribute.size, positionBuffer.array);
		dracoAttributes.POSITION = darcoAttributeID++;

		for (const attributeName in geometry.attributes) {
			if (attributeName === 'a_Position') continue;

			const gltfAttributeName = ATTRIBUTE_NAME_TO_GLTF[attributeName] || attributeName;

			// Skip custom attributes
			if (validVertexAttributes.test(gltfAttributeName) === false) continue;

			let attributeType;
			if (attributeName === 'a_Normal') attributeType = dracoEncoder.NORMAL;
			else if (attributeName === 'a_Color') attributeType = dracoEncoder.COLOR;
			else if (attributeName.startsWith('a_Uv')) attributeType = dracoEncoder.TEX_COORD;
			else attributeType = dracoEncoder.GENERIC;

			const attribute = geometry.attributes[attributeName];
			const buffer = attribute.buffer;
			if (buffer.array instanceof Float32Array) {
				builder.AddFloatAttribute(dracoObject, attributeType, buffer.count, attribute.size, buffer.array);
			} else if (buffer.array instanceof Uint32Array) {
				builder.AddUInt32Attribute(dracoObject, attributeType, buffer.count, attribute.size, buffer.array);
			} else if (buffer.array instanceof Uint16Array) {
				builder.AddUInt16Attribute(dracoObject, attributeType, buffer.count, attribute.size, buffer.array);
			} else if (buffer.array instanceof Uint8Array) {
				builder.AddUInt8Attribute(dracoObject, attributeType, buffer.count, attribute.size, buffer.array);
			} else if (buffer.array instanceof Int32Array) {
				builder.AddInt32Attribute(dracoObject, attributeType, buffer.count, attribute.size, buffer.array);
			} else if (buffer.array instanceof Int16Array) {
				builder.AddInt16Attribute(dracoObject, attributeType, buffer.count, attribute.size, buffer.array);
			} else if (buffer.array instanceof Int8Array) {
				builder.AddInt8Attribute(dracoObject, attributeType, buffer.count, attribute.size, buffer.array);
			} else {
				builder.AddFloatAttribute(dracoObject, attributeType, buffer.count, attribute.size, buffer.array);
			}

			dracoAttributes[gltfAttributeName] = darcoAttributeID++;
		}

		// Compress using draco encoder

		const encodedData = new dracoEncoder.DracoInt8Array();

		// Sets the desired encoding and decoding speed for the given options from 0 (slowest speed, but the best compression) to 10 (fastest, but the worst compression).

		const { encodeSpeed, decodeSpeed } = options;

		encoder.SetSpeedOptions(encodeSpeed, decodeSpeed);

		// Sets the desired encoding method for a given geometry.

		encoder.SetEncodingMethod(options.encoderMethod);

		// Sets the quantization (number of bits used to represent) compression options for a named attribute.
		// The attribute values will be quantized in a box defined by the maximum extent of the attribute values.

		for (let i = 0; i < 5; i++) {
			if (options.quantization[i] !== undefined) {
				encoder.SetAttributeQuantization(i, options.quantization[i]);
			}
		}

		let length;

		if (options.pointCloud === true) {
			length = encoder.EncodePointCloudToDracoBuffer(dracoObject, true, encodedData);
		} else {
			length = encoder.EncodeMeshToDracoBuffer(dracoObject, encodedData);
		}

		dracoEncoder.destroy(dracoObject);

		if (length === 0) {
			throw new Error('DRACOExporter: Draco encoding failed.');
		}

		// Copy encoded data to buffer.
		const outputData = new Int8Array(new ArrayBuffer(length));

		for (let i = 0; i < length; i++) {
			outputData[i] = encodedData.GetValue(i);
		}

		dracoEncoder.destroy(encodedData);
		dracoEncoder.destroy(encoder);
		dracoEncoder.destroy(builder);

		return { buffer: outputData, attributes: dracoAttributes };
	}

}

/* global DracoEncoderModule */

const ENCODER_METHOD = {
	EDGEBREAKER: 1,
	SEQUENTIAL: 0
};

const ATTRIBUTE_NAME_TO_GLTF = {
	a_Position: 'POSITION',
	a_Normal: 'NORMAL',
	a_Tangent: 'TANGENT',
	a_Uv: 'TEXCOORD_0',
	a_Uv2: 'TEXCOORD_1',
	a_Uv3: 'TEXCOORD_2',
	a_Uv4: 'TEXCOORD_3',
	a_Uv5: 'TEXCOORD_4',
	a_Uv6: 'TEXCOORD_5',
	a_Uv7: 'TEXCOORD_6',
	a_Uv8: 'TEXCOORD_7',
	a_Color: 'COLOR_0',
	skinWeight: 'WEIGHTS_0',
	skinIndex: 'JOINTS_0'
};

// Prefix all geometry attributes except the ones specifically
// listed in the spec; non-spec attributes are considered custom.
const validVertexAttributes = /^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/;

export { DRACOExporter, ENCODER_METHOD };