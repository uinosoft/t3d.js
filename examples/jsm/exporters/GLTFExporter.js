import { Attribute, Buffer, CubicSplineInterpolant, DRAW_MODE, DRAW_SIDE, MATERIAL_TYPE, Matrix4, Object3D, PIXEL_FORMAT, Quaternion, QuaternionCubicSplineInterpolant, StepInterpolant, TEXEL_ENCODING_TYPE, TEXTURE_FILTER, TEXTURE_WRAP, Vector3 } from 't3d';

/**
 * GLTF Exporter
 * ref: https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/GLTFExporter.js
 * more:
 * - add wrapRoot option
 * - add draco compression option
 * - add support for `GLTF_SEPARATE` format
 * - add support for ignoreForExport flag on Object3D
 * todo:
 * - export cameras
 * - support compressed texture
 * - support GLTFMaterialsClearcoatExtension
 * - support GLTFMaterialsSpecularExtension
 */
class GLTFExporter {

	constructor() {
		this.extensions = [];

		this.dracoOptions = {};
		this._dracoExporter = null;

		this.register(GLTFMaterialsUnlitExtension);
		this.register(GLTFMeshGpuInstancingExtension);
	}

	register(extension) {
		if (this.extensions.indexOf(extension) === -1) {
			this.extensions.push(extension);
		}
		return this;
	}

	unregister(extension) {
		const index = this.extensions.indexOf(extension);
		if (index !== -1) {
			this.extensions.splice(index, 1);
		}
		return this;
	}

	setDRACOExporter(dracoExporter) {
		this._dracoExporter = dracoExporter;
		return this;
	}

	getDRACOExporter() {
		return this._dracoExporter;
	}

	/**
	 * Parse input root object(s) and generate GLTF output
	 * @param {Object3D|Object3D[]} input root object(s)
	 * @param {Function} onDone Callback on completed
	 * @param {Function} onError Callback on errors
	 * @param {object} options options
	 */
	parse(input, onDone, onError, options) {
		const writer = new GLTFWriter();

		const plugins = this.extensions.map(_ext => new _ext(writer));

		writer.setPlugins(plugins);

		writer.dracoOptions = this.dracoOptions;
		writer.setDRACOExporter(this._dracoExporter);

		writer.writeAsync(input, onDone, options).catch(onError);
	}

	parseAsync(input, options) {
		return new Promise((resolve, reject) => {
			this.parse(input, resolve, reject, options);
		});
	}

}

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

const GLTF_FORMAT = {
	GLTF: 'GLTF',
	GLTF_SEPARATE: 'GLTF_SEPARATE',
	GLB: 'GLB'
};

const GLTF_CONSTANTS = {
	BYTE: 0x1400,
	UNSIGNED_BYTE: 0x1401,
	SHORT: 0x1402,
	UNSIGNED_SHORT: 0x1403,
	INT: 0x1404,
	UNSIGNED_INT: 0x1405,
	FLOAT: 0x1406,

	ARRAY_BUFFER: 0x8892,
	ELEMENT_ARRAY_BUFFER: 0x8893,

	NEAREST: 0x2600,
	LINEAR: 0x2601,
	NEAREST_MIPMAP_NEAREST: 0x2700,
	LINEAR_MIPMAP_NEAREST: 0x2701,
	NEAREST_MIPMAP_LINEAR: 0x2702,
	LINEAR_MIPMAP_LINEAR: 0x2703,

	CLAMP_TO_EDGE: 33071,
	MIRRORED_REPEAT: 33648,
	REPEAT: 10497
};

const DRAW_MODE_TO_GLTF = {
	[DRAW_MODE.POINTS]: 0,
	[DRAW_MODE.LINES]: 1,
	[DRAW_MODE.LINE_LOOP]: 2,
	[DRAW_MODE.LINE_STRIP]: 3,
	[DRAW_MODE.TRIANGLES]: 4,
	[DRAW_MODE.TRIANGLE_STRIP]: 5,
	[DRAW_MODE.TRIANGLE_FAN]: 6
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

const INTERPOLANT_TO_GLTF = new WeakMap([
	[QuaternionCubicSplineInterpolant, 'CUBICSPLINE'],
	[CubicSplineInterpolant, 'CUBICSPLINE'],
	[StepInterpolant, 'STEP']
]);

// Prefix all geometry attributes except the ones specifically
// listed in the spec; non-spec attributes are considered custom.
const validVertexAttributes = /^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/;

const KHR_MESH_QUANTIZATION = 'KHR_mesh_quantization';

// The KHR_mesh_quantization extension allows these extra attribute component types
// https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_mesh_quantization/README.md#extending-mesh-attributes
const KHR_mesh_quantization_ExtraAttrTypes = {
	POSITION: [
		'byte',
		'byte normalized',
		'unsigned byte',
		'unsigned byte normalized',
		'short',
		'short normalized',
		'unsigned short',
		'unsigned short normalized'
	],
	NORMAL: [
		'byte normalized',
		'short normalized'
	],
	TANGENT: [
		'byte normalized',
		'short normalized'
	],
	TEXCOORD: [
		'byte',
		'byte normalized',
		'unsigned byte',
		'short',
		'short normalized',
		'unsigned short'
	]
};

const PATH_PROPERTIES = {
	scale: 'scale',
	position: 'translation',
	quaternion: 'rotation',
	morphTargetInfluences: 'weights'
};

const T3D_TO_GLTF = {};

T3D_TO_GLTF[TEXTURE_FILTER.NEAREST] = GLTF_CONSTANTS.NEAREST;
T3D_TO_GLTF[TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST] = GLTF_CONSTANTS.NEAREST_MIPMAP_NEAREST;
T3D_TO_GLTF[TEXTURE_FILTER.NEAREST_MIPMAP_LINEAR] = GLTF_CONSTANTS.NEAREST_MIPMAP_LINEAR;
T3D_TO_GLTF[TEXTURE_FILTER.LINEAR] = GLTF_CONSTANTS.LINEAR;
T3D_TO_GLTF[TEXTURE_FILTER.LINEAR_MIPMAP_NEAREST] = GLTF_CONSTANTS.LINEAR_MIPMAP_NEAREST;
T3D_TO_GLTF[TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR] = GLTF_CONSTANTS.LINEAR_MIPMAP_LINEAR;

T3D_TO_GLTF[TEXTURE_WRAP.CLAMP_TO_EDGE] = GLTF_CONSTANTS.CLAMP_TO_EDGE;
T3D_TO_GLTF[TEXTURE_WRAP.REPEAT] = GLTF_CONSTANTS.REPEAT;
T3D_TO_GLTF[TEXTURE_WRAP.MIRRORED_REPEAT] = GLTF_CONSTANTS.MIRRORED_REPEAT;

// GLB constants
// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

const GLB_HEADER_BYTES = 12;
const GLB_HEADER_MAGIC = 0x46546C67;
const GLB_VERSION = 2;

const GLB_CHUNK_PREFIX_BYTES = 8;
const GLB_CHUNK_TYPE_JSON = 0x4E4F534A;
const GLB_CHUNK_TYPE_BIN = 0x004E4942;

// ------------------------------------------------------------------------------
// Utility functions
// ------------------------------------------------------------------------------

function createAttributesKey(attributes) {
	let attributesKey = '';

	const keys = Object.keys(attributes).sort();

	for (let i = 0, il = keys.length; i < il; i++) {
		attributesKey += keys[i] + ':' + attributes[keys[i]] + ';';
	}

	return attributesKey;
}

function decompose(matrix3) {
	const tx = matrix3.elements[2];
	const ty = matrix3.elements[5];

	const sx = Math.sqrt(matrix3.elements[0] * matrix3.elements[0] + matrix3.elements[1] * matrix3.elements[1]);
	const sy = Math.sqrt(matrix3.elements[3] * matrix3.elements[3] + matrix3.elements[4] * matrix3.elements[4]);

	const rotation = Math.atan2(matrix3.elements[1], matrix3.elements[0]);

	const cx = 0;
	const cy = 0;

	return { tx, ty, sx, sy, rotation, cx, cy };
}

/**
 * Compare two arrays
 * @param  {Array} array1 Array 1 to compare
 * @param  {Array} array2 Array 2 to compare
 * @returns {boolean}        Returns true if both arrays are equal
 */
function equalArray(array1, array2) {
	return (array1.length === array2.length) && array1.every(function(element, index) {
		return element === array2[index];
	});
}

/**
 * Converts a string to an ArrayBuffer.
 * @param  {string} text
 * @returns {ArrayBuffer}
 */
function stringToArrayBuffer(text) {
	return new TextEncoder().encode(text).buffer;
}

/**
 * Is identity matrix
 * @param {Matrix4} matrix
 * @returns {boolean} Returns true, if parameter is identity matrix
 */
function isIdentityMatrix(matrix) {
	return equalArray(matrix.elements, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

/**
 * Get the min and max vectors from the given attribute
 * @param  {Attribute} attribute Attribute to find the min/max in range from start to start + count
 * @param  {Integer} start
 * @param  {Integer} count
 * @returns {object} Object containing the `min` and `max` values (As an array of attribute.size components)
 */
function getMinMax(attribute, start, count) {
	const output = {
		min: new Array(attribute.size).fill(Number.POSITIVE_INFINITY),
		max: new Array(attribute.size).fill(Number.NEGATIVE_INFINITY)
	};

	for (let i = start; i < start + count; i++) {
		for (let a = 0; a < attribute.size; a++) {
			const value = attribute.buffer.array[i * attribute.size + a];

			output.min[a] = Math.min(output.min[a], value);
			output.max[a] = Math.max(output.max[a], value);
		}
	}

	return output;
}

/**
 * Get the required size + padding for a buffer, rounded to the next 4-byte boundary.
 * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
 * @param {Integer} bufferSize The size the original buffer.
 * @returns {Integer} new buffer size with required padding.
 */
function getPaddedBufferSize(bufferSize) {
	return Math.ceil(bufferSize / 4) * 4;
}

/**
 * Returns a buffer aligned to 4-byte boundary.
 * @param {ArrayBuffer} arrayBuffer Buffer to pad
 * @param {Integer} paddingByte (Optional)
 * @returns {ArrayBuffer} The same buffer if it's already aligned to 4-byte boundary or a new buffer
 */
function getPaddedArrayBuffer(arrayBuffer, paddingByte = 0) {
	const paddedLength = getPaddedBufferSize(arrayBuffer.byteLength);

	if (paddedLength !== arrayBuffer.byteLength) {
		const array = new Uint8Array(paddedLength);
		array.set(new Uint8Array(arrayBuffer));

		if (paddingByte !== 0) {
			for (let i = arrayBuffer.byteLength; i < paddedLength; i++) {
				array[i] = paddingByte;
			}
		}

		return array.buffer;
	}

	return arrayBuffer;
}

function getCanvas() {
	if (typeof document === 'undefined' && typeof OffscreenCanvas !== 'undefined') {
		return new OffscreenCanvas(1, 1);
	}

	return document.createElement('canvas');
}

function getToBlobPromise(canvas, mimeType) {
	if (canvas.toBlob !== undefined) {
		return new Promise(resolve => canvas.toBlob(resolve, mimeType));
	}

	let quality;

	// Blink's implementation of convertToBlob seems to default to a quality level of 100%
	// Use the Blink default quality levels of toBlob instead so that file sizes are comparable.
	if (mimeType === 'image/jpeg') {
		quality = 0.92;
	} else if (mimeType === 'image/webp') {
		quality = 0.8;
	}

	return canvas.convertToBlob({
		type: mimeType,
		quality: quality
	});
}

/**
 * Writer
 */
class GLTFWriter {

	constructor() {
		this.plugins = [];

		this.options = {};
		this.pending = [];
		this.buffers = [];

		this.byteOffset = 0;
		this.buffers = [];
		this.nodeMap = new Map();
		this.skins = [];

		this.extensionsUsed = {};
		this.extensionsRequired = {};

		this.uids = new Map();
		this.uid = 0;

		this.json = {
			asset: {
				version: '2.0',
				generator: 'T3D GLTFExporter'
			}
		};

		this.cache = {
			meshes: new Map(),
			attributes: new Map(),
			bufferViews: new Map(),
			materials: new Map(),
			textures: new Map(),
			images: new Map()
		};

		this.resources = [];

		// Track file names, to ensure no duplicates
		this.fileNamesUsed = {};

		this.dracoOptions = null;
		this.dracoExporter = null;
	}

	setPlugins(plugins) {
		this.plugins = plugins;
	}

	setDRACOExporter(dracoExporter) {
		this.dracoExporter = dracoExporter;
	}

	/**
	 * Parse input root object(s) and generate GLTF output
	 * @param {Object3D|Object3D[]} input root object(s)
	 * @param {Function} onDone Callback on completed
	 * @param {object} options options
	 */
	async writeAsync(input, onDone, options) {
		this.options = Object.assign({
			// Export format
			format: GLTF_FORMAT.GLTF,
			// Draco compression
			draco: false,
			// Resource directory, defualt is './'
			resourcePath: './',
			// Export position, rotation and scale instead of matrix per node. Default is false
			trs: false,
			// Export only visible objects.
			onlyVisible: true,
			// Restricts the image maximum size (both width and height) to the given value.
			maxTextureSize: Infinity,
			// Array<AnimationClip>. List of animations to be included in the export.
			animations: [],
			// Export custom glTF extensions defined on an object's userData.gltfExtensions property.
			includeCustomExtensions: false,
			// If true, wrap the root object(s) with an Object3D named "AuxRoot".
			// Otherwise, directly export the root object(s) as glTF scene(s).
			// It is recommended to set this to true if the root object(s) have transformations.
			wrapRoot: false
		}, options);

		if (this.options.draco && this.dracoExporter === null) {
			console.warn('GLTFExporter: DRACOExporter is not set but options.draco is true. Ignoring Draco compression.');
			this.options.draco = false;
		}

		if (this.options.animations.length > 0) {
			// Only TRS properties, and not matrices, may be targeted by animation.
			this.options.trs = true;
		}

		await this.processInputAsync(input);

		await Promise.all(this.pending);

		const writer = this;
		const buffers = writer.buffers;
		const json = writer.json;
		options = writer.options;

		const extensionsUsed = writer.extensionsUsed;
		const extensionsRequired = writer.extensionsRequired;

		// Merge buffers.
		const blob = new Blob(buffers, { type: 'application/octet-stream' });

		// Declare extensions.
		const extensionsUsedList = Object.keys(extensionsUsed);
		const extensionsRequiredList = Object.keys(extensionsRequired);

		if (extensionsUsedList.length > 0) json.extensionsUsed = extensionsUsedList;
		if (extensionsRequiredList.length > 0) json.extensionsRequired = extensionsRequiredList;

		if (extensionsUsedList.length > 0) json.extensionsUsed = extensionsUsedList;
		if (extensionsRequiredList.length > 0) json.extensionsRequired = extensionsRequiredList;

		// Update bytelength of the single buffer.
		if (json.buffers && json.buffers.length > 0) json.buffers[0].byteLength = blob.size;

		if (options.format === GLTF_FORMAT.GLB) {
			// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#glb-file-format-specification

			const reader = new FileReader();
			reader.readAsArrayBuffer(blob);
			reader.onloadend = function() {
				// Binary chunk.
				const binaryChunk = getPaddedArrayBuffer(reader.result);
				const binaryChunkPrefix = new DataView(new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES));
				binaryChunkPrefix.setUint32(0, binaryChunk.byteLength, true);
				binaryChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_BIN, true);

				// JSON chunk.
				const jsonChunk = getPaddedArrayBuffer(stringToArrayBuffer(JSON.stringify(json)), 0x20);
				const jsonChunkPrefix = new DataView(new ArrayBuffer(GLB_CHUNK_PREFIX_BYTES));
				jsonChunkPrefix.setUint32(0, jsonChunk.byteLength, true);
				jsonChunkPrefix.setUint32(4, GLB_CHUNK_TYPE_JSON, true);

				// GLB header.
				const header = new ArrayBuffer(GLB_HEADER_BYTES);
				const headerView = new DataView(header);
				headerView.setUint32(0, GLB_HEADER_MAGIC, true);
				headerView.setUint32(4, GLB_VERSION, true);
				const totalByteLength = GLB_HEADER_BYTES
					+ jsonChunkPrefix.byteLength + jsonChunk.byteLength
					+ binaryChunkPrefix.byteLength + binaryChunk.byteLength;
				headerView.setUint32(8, totalByteLength, true);

				const glbBlob = new Blob([
					header,
					jsonChunkPrefix,
					jsonChunk,
					binaryChunkPrefix,
					binaryChunk
				], { type: 'application/octet-stream' });

				const glbReader = new FileReader();
				glbReader.readAsArrayBuffer(glbBlob);
				glbReader.onloadend = function() {
					onDone(glbReader.result);
				};
			};
		} else if (options.format === GLTF_FORMAT.GLTF_SEPARATE) {
			const reader = new FileReader();
			reader.readAsArrayBuffer(blob);
			reader.onloadend = function() {
				const resources = writer.resources;

				const ext = 'bin';
				const name = writer.getUniqueFileName('all', ext);
				resources.push({ name, ext, content: getPaddedArrayBuffer(reader.result) });

				json.buffers[0].uri = options.resourcePath + name + '.' + ext;

				onDone({ json, resources });
			};
		} else {
			if (json.buffers && json.buffers.length > 0) {
				const reader = new FileReader();
				reader.readAsDataURL(blob);
				reader.onloadend = function() {
					const base64data = reader.result;
					json.buffers[0].uri = base64data;
					onDone(json);
				};
			} else {
				onDone(json);
			}
		}
	}

	/**
	 * @param {Object3D|Array<Object3D>} input
	 */
	async processInputAsync(input) {
		const options = this.options;

		input = input instanceof Array ? input : [input];

		await this._invokeAllAsync(function(ext) {
			ext.beforeParse && ext.beforeParse(input);
		});

		const roots = [];

		if (options.wrapRoot) {
			const root = new Object3D();
			root.name = 'AuxRoot';

			for (let i = 0; i < input.length; i++) {
				// We push directly to children instead of calling `add` to prevent
				// modify the .parent and break its original root and hierarchy
				root.children.push(input[i]);
			}

			roots.push(root);
		} else {
			roots.push(...input);
		}

		for (let i = 0; i < roots.length; i++) {
			roots[i].updateMatrix(); // ensure matrix is up to date
			await this.processSceneAsync(roots[i]);
		}

		for (let i = 0; i < this.skins.length; ++i) {
			this.processSkin(this.skins[i]);
		}

		for (let i = 0; i < options.animations.length; ++i) {
			this.processAnimation(options.animations[i]);
		}

		await this._invokeAllAsync(function(ext) {
			ext.afterParse && ext.afterParse(input);
		});
	}

	/**
	 * Process Scene
	 * @param  {Object3D} root Root object to process
	 */
	async processSceneAsync(root) {
		const json = this.json;
		const options = this.options;

		if (!json.scenes) {
			json.scenes = [];
			json.scene = 0;
		}

		const sceneDef = {};

		if (root.name !== '') sceneDef.name = root.name;

		json.scenes.push(sceneDef);

		const nodes = [];

		for (let i = 0, l = root.children.length; i < l; i++) {
			const child = root.children[i];

			if ((child.visible || options.onlyVisible === false) && !child.ignoreForExport) {
				const nodeIndex = await this.processNodeAsync(child);
				if (nodeIndex !== null) nodes.push(nodeIndex);
			}
		}

		if (nodes.length > 0) sceneDef.nodes = nodes;

		this.serializeUserData(root, sceneDef);
	}

	/**
	 * Process Object3D node
	 * @param  {Object3D} object Object3D to processNodeAsync
	 * @returns {Integer} Index of the node in the nodes list
	 */
	async processNodeAsync(object) {
		const json = this.json;
		const options = this.options;
		const nodeMap = this.nodeMap;

		if (!json.nodes) json.nodes = [];

		const nodeDef = {};

		if (options.trs) {
			const rotation = object.quaternion.toArray();
			const position = object.position.toArray();
			const scale = object.scale.toArray();

			if (!equalArray(rotation, [0, 0, 0, 1])) {
				nodeDef.rotation = rotation;
			}

			if (!equalArray(position, [0, 0, 0])) {
				nodeDef.translation = position;
			}

			if (!equalArray(scale, [1, 1, 1])) {
				nodeDef.scale = scale;
			}
		} else {
			if (isIdentityMatrix(object.matrix) === false) {
				nodeDef.matrix = object.matrix.elements;
			}
		}

		// We don't export empty strings name.
		if (object.name !== '') nodeDef.name = String(object.name);

		this.serializeUserData(object, nodeDef);

		if (object.isMesh) {
			const meshIndex = await this.processMeshAsync(object);
			if (meshIndex !== null) nodeDef.mesh = meshIndex;
		}

		if (object.isSkinnedMesh) this.skins.push(object);

		if (object.children.length > 0) {
			const children = [];

			for (let i = 0, l = object.children.length; i < l; i++) {
				const child = object.children[i];

				if ((child.visible || options.onlyVisible === false) && !child.ignoreForExport) {
					const nodeIndex = await this.processNodeAsync(child);
					if (nodeIndex !== null) children.push(nodeIndex);
				}
			}

			if (children.length > 0) nodeDef.children = children;
		}

		await this._invokeAllAsync(function(ext) {
			ext.writeNode && ext.writeNode(object, nodeDef);
		});

		const nodeIndex = json.nodes.push(nodeDef) - 1;
		nodeMap.set(object, nodeIndex);
		return nodeIndex;
	}

	/**
	 * Process mesh
	 * @param {Mesh} mesh Mesh to process
	 * @returns {Integer|null} Index of the processed mesh in the "meshes" array
	 */
	async processMeshAsync(mesh) {
		const cache = this.cache;
		const json = this.json;

		const meshCacheKeyParts = [mesh.geometry.uuid];

		if (Array.isArray(mesh.material)) {
			for (let i = 0, l = mesh.material.length; i < l; i++) {
				meshCacheKeyParts.push(mesh.material[i].uuid);
			}
		} else {
			meshCacheKeyParts.push(mesh.material.uuid);
		}

		const meshCacheKey = meshCacheKeyParts.join(':');

		if (cache.meshes.has(meshCacheKey)) return cache.meshes.get(meshCacheKey);

		const geometry = mesh.geometry;

		// If material is an array, we only get drawMode from the first material for now
		const drawMode = Array.isArray(mesh.material) ? mesh.material[0].drawMode : mesh.material.drawMode;
		const mode = DRAW_MODE_TO_GLTF[drawMode];

		const morphTargets = mesh.morphTargetInfluences !== null && mesh.morphTargetInfluences.length > 0;

		// KHR_draco_mesh_compression
		// Only TRIANGLES and TRIANGLE_STRIP are supported.
		// Morph targets are not supported because glTF does not support Draco compression with morph targets.
		const draco = this.options.draco &&
			(drawMode === DRAW_MODE.TRIANGLES || drawMode === DRAW_MODE.TRIANGLE_STRIP) &&
			!morphTargets;

		const meshDef = {};
		const attributes = {};
		const primitives = [];
		const targets = [];

		for (let attributeName in geometry.attributes) {
			const attribute = geometry.attributes[attributeName];
			attributeName = ATTRIBUTE_NAME_TO_GLTF[attributeName] || attributeName;

			// Skip custom attributes
			if (validVertexAttributes.test(attributeName) === false) {
				continue;
			}

			if (cache.attributes.has(this.getUID(attribute))) {
				attributes[attributeName] = cache.attributes.get(this.getUID(attribute));
				continue;
			}

			// TODO Enforce glTF vertex attribute requirements:
			// - JOINTS_0 must be UNSIGNED_BYTE or UNSIGNED_SHORT
			// - Only custom attributes may be INT or UNSIGNED_INT

			const accessor = this.processAccessor(attribute, geometry, undefined, undefined, draco);

			if (accessor !== null) {
				this.detectMeshQuantization(attributeName, attribute);

				attributes[attributeName] = accessor;
				cache.attributes.set(this.getUID(attribute), accessor);
			}
		}

		// Skip if no exportable attributes found
		if (Object.keys(attributes).length === 0) return null;

		// Morph targets
		if (morphTargets) {
			// glTF 2.0 Specification:
			// https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#morph-targets

			const weights = [];

			for (let i = 0; i < mesh.morphTargetInfluences.length; ++i) {
				const target = {};
				let warned = false;

				for (const attributeName in geometry.morphAttributes) {
					// glTF 2.0 morph supports only POSITION/NORMAL/TANGENT.
					// t3d doesn't support TANGENT yet.

					if (attributeName !== 'position' && attributeName !== 'normal') {
						if (!warned) {
							console.warn('GLTFExporter: Only POSITION and NORMAL morph are supported.');
							warned = true;
						}
						continue;
					}

					const attribute = geometry.morphAttributes[attributeName][i];
					const gltfAttributeName = attributeName.toUpperCase();

					target[gltfAttributeName] = this.processAccessor(attribute, geometry);
					cache.attributes.set(this.getUID(attribute), target[gltfAttributeName]);
				}

				targets.push(target);

				weights.push(mesh.morphTargetInfluences[i]);
			}

			meshDef.weights = weights;
		}

		const isMultiMaterial = Array.isArray(mesh.material);

		if (isMultiMaterial && geometry.groups.length === 0) return null;

		const materials = isMultiMaterial ? mesh.material : [mesh.material];
		const groups = isMultiMaterial ? geometry.groups : [{ materialIndex: 0, start: undefined, count: undefined }];

		let extensions;
		if (draco) {
			let dracoBufferView;

			const attributesKey = createAttributesKey(attributes);
			if (cache.bufferViews.has(attributesKey)) {
				dracoBufferView = cache.bufferViews.get(attributesKey);
			} else {
				dracoBufferView = this.processDracoBufferView(geometry);
				cache.bufferViews.set(attributesKey, dracoBufferView);
			}

			extensions = { KHR_draco_mesh_compression: dracoBufferView };
		}

		for (let i = 0, il = groups.length; i < il; i++) {
			const primitive = {
				mode: mode,
				attributes: attributes
			};

			this.serializeUserData(geometry, primitive);

			if (targets.length > 0) primitive.targets = targets;

			if (extensions) primitive.extensions = extensions;

			if (geometry.index !== null) {
				let cacheKey = this.getUID(geometry.index);

				if (groups[i].start !== undefined || groups[i].count !== undefined) {
					cacheKey += ':' + groups[i].start + ':' + groups[i].count;
				}

				if (cache.attributes.has(cacheKey)) {
					primitive.indices = cache.attributes.get(cacheKey);
				} else {
					primitive.indices = this.processAccessor(geometry.index, geometry, groups[i].start, groups[i].count);
					cache.attributes.set(cacheKey, primitive.indices);
				}

				if (primitive.indices === null) delete primitive.indices;
			}

			const material = await this.processMaterialAsync(materials[groups[i].materialIndex]);

			if (material !== null) primitive.material = material;

			primitives.push(primitive);
		}

		meshDef.primitives = primitives;

		if (!json.meshes) json.meshes = [];

		await this._invokeAllAsync(function(ext) {
			ext.writeMesh && ext.writeMesh(mesh, meshDef);
		});

		const index = json.meshes.push(meshDef) - 1;
		cache.meshes.set(meshCacheKey, index);
		return index;
	}

	/**
	 * Process attribute to generate an accessor
	 * @param  {Attribute} attribute Attribute to process
	 * @param  {Geometry} geometry (Optional) Geometry used for truncated draw range
	 * @param  {Integer} start (Optional)
	 * @param  {Integer} count (Optional)
	 * @param  {boolean} skipBufferView (Optional) Skip creating a bufferView and return the accessor
	 * @returns {Integer|null} Index of the processed accessor on the "accessors" array
	 */
	processAccessor(attribute, geometry, start, count, skipBufferView = false) {
		const json = this.json;

		const types = {
			1: 'SCALAR',
			2: 'VEC2',
			3: 'VEC3',
			4: 'VEC4',
			9: 'MAT3',
			16: 'MAT4'
		};

		let componentType;

		// Detect the component type of the attribute array
		if (attribute.buffer.array.constructor === Float32Array) {
			componentType = GLTF_CONSTANTS.FLOAT;
		} else if (attribute.buffer.array.constructor === Int32Array) {
			componentType = GLTF_CONSTANTS.INT;
		} else if (attribute.buffer.array.constructor === Uint32Array) {
			componentType = GLTF_CONSTANTS.UNSIGNED_INT;
		} else if (attribute.buffer.array.constructor === Int16Array) {
			componentType = GLTF_CONSTANTS.SHORT;
		} else if (attribute.buffer.array.constructor === Uint16Array) {
			componentType = GLTF_CONSTANTS.UNSIGNED_SHORT;
		} else if (attribute.buffer.array.constructor === Int8Array) {
			componentType = GLTF_CONSTANTS.BYTE;
		} else if (attribute.buffer.array.constructor === Uint8Array) {
			componentType = GLTF_CONSTANTS.UNSIGNED_BYTE;
		} else {
			throw new Error('GLTFExporter: Unsupported bufferAttribute component type: ' + attribute.buffer.array.constructor.name);
		}

		if (start === undefined) start = 0;
		if (count === undefined || count === Infinity) count = attribute.buffer.count;

		// Skip creating an accessor if the attribute doesn't have data to export
		if (count === 0) return null;

		const minMax = getMinMax(attribute, start, count);

		const accessorDef = {
			componentType: componentType,
			count: count,
			max: minMax.max,
			min: minMax.min,
			type: types[attribute.size]
		};

		if (!skipBufferView) {
			let bufferViewTarget;

			// If geometry isn't provided, don't infer the target usage of the bufferView. For
			// animation samplers, target must not be set.
			if (geometry !== undefined) {
				bufferViewTarget = attribute === geometry.index ? GLTF_CONSTANTS.ELEMENT_ARRAY_BUFFER : GLTF_CONSTANTS.ARRAY_BUFFER;
			}

			accessorDef.bufferView = this.processBufferView(attribute, componentType, start, count, bufferViewTarget);
			// accessorDef.byteOffset = 0;
		}

		if (attribute.normalized === true) accessorDef.normalized = true;
		if (!json.accessors) json.accessors = [];

		return json.accessors.push(accessorDef) - 1;
	}

	/**
	 * Process and generate a BufferView
	 * @param  {Attribute} attribute
	 * @param  {number} componentType
	 * @param  {number} start
	 * @param  {number} count
	 * @param  {number} target (Optional) Target usage of the BufferView
	 * @returns {Integer|null} Index of the processed BufferView on the "bufferViews" array
	 */
	processBufferView(attribute, componentType, start, count, target) {
		const json = this.json;

		if (!json.bufferViews) json.bufferViews = [];

		// Create a new dataview and dump the attribute's array into it

		let componentSize;

		switch (componentType) {
			case GLTF_CONSTANTS.BYTE:
			case GLTF_CONSTANTS.UNSIGNED_BYTE:
				componentSize = 1;
				break;
			case GLTF_CONSTANTS.SHORT:
			case GLTF_CONSTANTS.UNSIGNED_SHORT:
				componentSize = 2;
				break;
			default:
				componentSize = 4;
		}

		let byteStride = attribute.size * componentSize;

		if (target === GLTF_CONSTANTS.ARRAY_BUFFER) {
			// Each element of a vertex attribute MUST be aligned to 4-byte boundaries
			// inside a bufferView
			byteStride = Math.ceil(byteStride / 4) * 4;
		}

		const byteLength = getPaddedBufferSize(count * byteStride);
		const dataView = new DataView(new ArrayBuffer(byteLength));
		let offset = 0;

		for (let i = start; i < start + count; i++) {
			for (let a = 0; a < attribute.size; a++) {
				const value = attribute.buffer.array[i * attribute.size + a];

				if (componentType === GLTF_CONSTANTS.FLOAT) {
					dataView.setFloat32(offset, value, true);
				} else if (componentType === GLTF_CONSTANTS.INT) {
					dataView.setInt32(offset, value, true);
				} else if (componentType === GLTF_CONSTANTS.UNSIGNED_INT) {
					dataView.setUint32(offset, value, true);
				} else if (componentType === GLTF_CONSTANTS.SHORT) {
					dataView.setInt16(offset, value, true);
				} else if (componentType === GLTF_CONSTANTS.UNSIGNED_SHORT) {
					dataView.setUint16(offset, value, true);
				} else if (componentType === GLTF_CONSTANTS.BYTE) {
					dataView.setInt8(offset, value);
				} else if (componentType === GLTF_CONSTANTS.UNSIGNED_BYTE) {
					dataView.setUint8(offset, value);
				}

				offset += componentSize;
			}

			if ((offset % byteStride) !== 0) {
				offset += byteStride - (offset % byteStride);
			}
		}

		const bufferViewDef = {
			buffer: this.processBuffer(dataView.buffer),
			byteOffset: this.byteOffset,
			byteLength: byteLength
		};

		if (target !== undefined) bufferViewDef.target = target;

		if (target === GLTF_CONSTANTS.ARRAY_BUFFER) {
			// Only define byteStride for vertex attributes.
			bufferViewDef.byteStride = byteStride;
		}

		this.byteOffset += byteLength;

		return json.bufferViews.push(bufferViewDef) - 1;
	}

	/**
	 * Process and generate a draco compressed BufferView
	 * @param  {Geometry} geometry
	 * @returns {object}
	 */
	processDracoBufferView(geometry) {
		const json = this.json;

		if (!json.bufferViews) json.bufferViews = [];

		const { buffer, attributes } = this.dracoExporter.parse(geometry, this.dracoOptions);

		const paddedBuffer = getPaddedArrayBuffer(buffer);
		const byteLength = paddedBuffer.byteLength;

		const bufferViewDef = {
			buffer: this.processBuffer(paddedBuffer),
			byteOffset: this.byteOffset,
			byteLength: byteLength
		};

		this.byteOffset += byteLength;

		this.extensionsUsed['KHR_draco_mesh_compression'] = true;
		this.extensionsRequired['KHR_draco_mesh_compression'] = true;

		return {
			bufferView: json.bufferViews.push(bufferViewDef) - 1,
			attributes
		};
	}

	/**
	 * Process a buffer to append to the default one.
	 * @param  {ArrayBuffer} buffer
	 * @returns {Integer}
	 */
	processBuffer(buffer) {
		const json = this.json;
		const buffers = this.buffers;

		if (!json.buffers) json.buffers = [{ byteLength: 0 }];

		// All buffers are merged before export.
		buffers.push(buffer);

		return 0;
	}

	/**
	 * Process material
	 * @param  {Material} material Material to process
	 * @returns {Integer|null} Index of the processed material in the "materials" array
	 */
	async processMaterialAsync(material) {
		const cache = this.cache;
		const json = this.json;

		if (cache.materials.has(material)) return cache.materials.get(material);

		if (!json.materials) json.materials = [];

		const materialDef = { pbrMetallicRoughness: {} };

		// pbrMetallicRoughness.baseColorFactor
		const color = material.diffuse.toArray().concat([material.opacity]);

		if (!equalArray(color, [1, 1, 1, 1])) {
			materialDef.pbrMetallicRoughness.baseColorFactor = color;
		}

		materialDef.pbrMetallicRoughness.metallicFactor = material.metalness !== undefined ? material.metalness : 0;
		materialDef.pbrMetallicRoughness.roughnessFactor = material.roughness !== undefined ? material.roughness : 1;

		// pbrMetallicRoughness.metallicRoughnessTexture
		if (material.metalnessMap || material.roughnessMap) {
			const metalRoughTexture = await this.buildMetalRoughTextureAsync(material.metalnessMap, material.roughnessMap);

			const metalRoughMapDef = {
				index: await this.processTextureAsync(metalRoughTexture)
			};
			materialDef.pbrMetallicRoughness.metallicRoughnessTexture = metalRoughMapDef;
		}

		// pbrMetallicRoughness.baseColorTexture
		if (material.diffuseMap) {
			const baseColorMapDef = {
				index: await this.processTextureAsync(material.diffuseMap),
				texCoord: material.diffuseMapCoord
			};
			this.applyTextureTransform(baseColorMapDef, material.diffuseMapTransform);
			materialDef.pbrMetallicRoughness.baseColorTexture = baseColorMapDef;
		}

		if (material.emissive) {
			const emissive = material.emissive;
			const maxEmissiveComponent = Math.max(emissive.r, emissive.g, emissive.b);

			if (maxEmissiveComponent > 0) {
				materialDef.emissiveFactor = material.emissive.toArray();
			}

			// emissiveTexture
			if (material.emissiveMap) {
				const emissiveMapDef = {
					index: await this.processTextureAsync(material.emissiveMap),
					texCoord: material.emissiveMapCoord
				};
				this.applyTextureTransform(emissiveMapDef, material.emissiveMapTransform);
				materialDef.emissiveTexture = emissiveMapDef;
			}
		}

		// normalTexture
		if (material.normalMap) {
			const normalMapDef = {
				index: await this.processTextureAsync(material.normalMap)
			};

			if (material.normalScale && material.normalScale.x !== 1) {
				// glTF normal scale is univariate. Ignore `y`, which may be flipped.
				normalMapDef.scale = material.normalScale.x;
			}

			materialDef.normalTexture = normalMapDef;
		}

		// occlusionTexture
		if (material.aoMap) {
			const occlusionMapDef = {
				index: await this.processTextureAsync(material.aoMap),
				texCoord: material.aoMapCoord
			};

			if (material.aoMapIntensity !== 1.0) {
				occlusionMapDef.strength = material.aoMapIntensity;
			}

			this.applyTextureTransform(occlusionMapDef, material.aoMapTransform);
			materialDef.occlusionTexture = occlusionMapDef;
		}

		// alphaMode
		if (material.transparent) {
			materialDef.alphaMode = 'BLEND';
		} else {
			if (material.alphaTest > 0.0) {
				materialDef.alphaMode = 'MASK';
				materialDef.alphaCutoff = material.alphaTest;
			}
		}

		// doubleSided.
		// Since BackSide is not a valid glTF value, it is currently ignored.
		// TODO: Implement opposite drawing indices order for backface rendering.
		if (material.side === DRAW_SIDE.DOUBLE) materialDef.doubleSided = true;
		if (material.name !== '') materialDef.name = material.name;

		this.serializeUserData(material, materialDef);

		await this._invokeAllAsync(async function(ext) {
			ext.writeMaterialAsync && await ext.writeMaterialAsync(material, materialDef);
		});

		const index = json.materials.push(materialDef) - 1;
		cache.materials.set(material, index);
		return index;
	}

	/**
	 * Process texture
	 * @param  {TextureBase} map Map to process
	 * @returns {Integer} Index of the processed texture in the "textures" array
	 */
	async processTextureAsync(map) {
		const cache = this.cache;
		const json = this.json;

		if (cache.textures.has(map)) return cache.textures.get(map);

		if (!json.textures) json.textures = [];

		// TODO compressed texture

		let mimeType = map.userData.mimeType;

		if (mimeType === 'image/webp') mimeType = 'image/png';

		const textureDef = {
			sampler: this.processSampler(map),
			source: this.processImage(map.image, map.format, map.flipY, mimeType)
		};

		if (map.name) textureDef.name = map.name;

		await this._invokeAllAsync(async function(ext) {
			ext.writeTexture && await ext.writeTexture(map, textureDef);
		});

		const index = json.textures.push(textureDef) - 1;
		cache.textures.set(map, index);
		return index;
	}

	/**
	 * Process image
	 * @param  {Image} image to process
	 * @param  {Integer} format of the image (RGBAFormat)
	 * @param  {boolean} flipY before writing out the image
	 * @param  {string} mimeType export format
	 * @returns {Integer} Index of the processed texture in the "images" array
	 */
	processImage(image, format, flipY, mimeType = 'image/png') {
		if (image === null) {
			throw new Error('GLTFExporter: No valid image data found. Unable to process texture.');
		}

		const cache = this.cache;
		const json = this.json;
		const options = this.options;
		const pending = this.pending;

		if (!cache.images.has(image)) cache.images.set(image, {});

		const cachedImages = cache.images.get(image);

		const key = mimeType + ':flipY/' + flipY.toString();

		if (cachedImages[key] !== undefined) return cachedImages[key];

		if (!json.images) json.images = [];

		const imageDef = { mimeType: mimeType };

		if (image.__name) imageDef.name = image.__name;

		const canvas = getCanvas();

		canvas.width = Math.min(image.width, options.maxTextureSize);
		canvas.height = Math.min(image.height, options.maxTextureSize);

		const ctx = canvas.getContext('2d', {
			willReadFrequently: true
		});

		if (flipY === true) {
			ctx.translate(0, canvas.height);
			ctx.scale(1, -1);
		}

		if (image.data !== undefined) {
			if (format !== PIXEL_FORMAT.RGBA) {
				console.error('GLTFExporter: Only RGBA Format is supported.', format);
			}

			if (image.width > options.maxTextureSize || image.height > options.maxTextureSize) {
				console.warn('GLTFExporter: Image size is bigger than maxTextureSize', image);
			}

			const data = new Uint8ClampedArray(image.height * image.width * 4);

			for (let i = 0; i < data.length; i += 4) {
				data[i + 0] = image.data[i + 0];
				data[i + 1] = image.data[i + 1];
				data[i + 2] = image.data[i + 2];
				data[i + 3] = image.data[i + 3];
			}

			ctx.putImageData(new ImageData(data, image.width, image.height), 0, 0);
		} else {
			if ((typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement) ||
				(typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement) ||
				(typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) ||
				(typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas)) {
				ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			} else {
				throw new Error('GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.');
			}
		}

		if (options.format === GLTF_FORMAT.GLB) {
			pending.push(
				getToBlobPromise(canvas, mimeType)
					.then(blob => this.processBufferViewImage(blob))
					.then(bufferViewIndex => {
						imageDef.bufferView = bufferViewIndex;
					})
			);
		} else {
			if (canvas.toDataURL !== undefined) {
				const dataURL = canvas.toDataURL(mimeType);
				this.setImageUri(imageDef, dataURL);
			} else {
				pending.push(
					getToBlobPromise(canvas, mimeType)
						.then(blob => new FileReader().readAsDataURL(blob))
						.then(dataURL => {
							this.setImageUri(imageDef, dataURL);
						})
				);
			}
		}

		const index = json.images.push(imageDef) - 1;
		cachedImages[key] = index;
		return index;
	}

	/**
	 * Process sampler
	 * @param  {Texture} map Texture to process
	 * @returns {Integer} Index of the processed texture in the "samplers" array
	 */
	processSampler(map) {
		const json = this.json;

		if (!json.samplers) json.samplers = [];

		const samplerDef = {
			magFilter: T3D_TO_GLTF[map.magFilter],
			minFilter: T3D_TO_GLTF[map.minFilter],
			wrapS: T3D_TO_GLTF[map.wrapS],
			wrapT: T3D_TO_GLTF[map.wrapT]
		};

		return json.samplers.push(samplerDef) - 1;
	}

	/**
	 * Process and generate a BufferView from an image Blob.
	 * @param {Blob} blob
	 * @returns {Promise<Integer>}
	 */
	processBufferViewImage(blob) {
		const writer = this;
		const json = writer.json;

		if (!json.bufferViews) json.bufferViews = [];

		return new Promise(function(resolve) {
			const reader = new FileReader();
			reader.readAsArrayBuffer(blob);
			reader.onloadend = function() {
				const buffer = getPaddedArrayBuffer(reader.result);

				const bufferViewDef = {
					buffer: writer.processBuffer(buffer),
					byteOffset: writer.byteOffset,
					byteLength: buffer.byteLength
				};

				writer.byteOffset += buffer.byteLength;
				resolve(json.bufferViews.push(bufferViewDef) - 1);
			};
		});
	}

	/**
	 * @param {Object3D} object
	 * @returns {number|null}
	 */
	processSkin(object) {
		const json = this.json;
		const nodeMap = this.nodeMap;

		const node = json.nodes[nodeMap.get(object)];

		const skeleton = object.skeleton;

		if (skeleton === undefined) return null;

		const rootJoint = object.skeleton.bones[0];

		if (rootJoint === undefined) return null;

		const joints = [];
		const inverseBindMatrices = new Float32Array(skeleton.bones.length * 16);
		const temporaryBoneInverse = new Matrix4();

		for (let i = 0; i < skeleton.bones.length; ++i) {
			joints.push(nodeMap.get(skeleton.bones[i]));
			temporaryBoneInverse.copy(skeleton.boneInverses[i]);
			temporaryBoneInverse.multiply(object.bindMatrix).toArray(inverseBindMatrices, i * 16);
		}

		if (json.skins === undefined) json.skins = [];

		json.skins.push({
			inverseBindMatrices: this.processAccessor(new Attribute(new Buffer(new Float32Array(inverseBindMatrices), 16))),
			joints: joints,
			skeleton: nodeMap.get(rootJoint)
		});

		const skinIndex = node.skin = json.skins.length - 1;

		return skinIndex;
	}

	/**
	 * Creates glTF animation entry from AnimationClip object.
	 *
	 * Status:
	 * - Only properties listed in PATH_PROPERTIES may be animated.
	 * @param {AnimationClip} clip
	 * @returns {number|null}
	 */
	processAnimation(clip) {
		const json = this.json;
		const nodeMap = this.nodeMap;

		if (!json.animations) json.animations = [];

		const tracks = clip.tracks;
		const channels = [];
		const samplers = [];

		for (let i = 0; i < tracks.length; ++i) {
			const track = tracks[i];
			const trackNode = track.target;
			const trackProperty = PATH_PROPERTIES[track.propertyPath];

			if (!trackNode || !trackProperty) {
				console.warn('GLTFExporter: Could not export animation track "%s".', track.name);
				return null;
			}

			const inputItemSize = 1;
			let outputItemSize = track.valueSize;

			if (trackProperty === PATH_PROPERTIES.morphTargetInfluences) {
				outputItemSize = 1;
			}

			const interpolation = INTERPOLANT_TO_GLTF.get(track.interpolant.constructor) || 'LINEAR';

			samplers.push({
				input: this.processAccessor(new Attribute(new Buffer(new Float32Array(track.times), inputItemSize))),
				output: this.processAccessor(new Attribute(new Buffer(new Float32Array(track.values), outputItemSize))),
				interpolation: interpolation
			});

			channels.push({
				sampler: samplers.length - 1,
				target: {
					node: nodeMap.get(trackNode),
					path: trackProperty
				}
			});
		}

		json.animations.push({
			name: clip.name || 'clip_' + json.animations.length,
			samplers: samplers,
			channels: channels
		});

		return json.animations.length - 1;
	}

	applyTextureTransform(mapDef, matrix) {
		let didTransform = false;
		const transformDef = {};

		const { tx, ty, sx, sy, rotation } = decompose(matrix);

		if (tx !== 0 || ty !== 0) {
			transformDef.offset = [tx, ty];
			didTransform = true;
		}

		if (rotation !== 0) {
			transformDef.rotation = rotation;
			didTransform = true;
		}

		if (sx !== 1 || sy !== 1) {
			transformDef.scale = [sx, sy];
			didTransform = true;
		}

		if (didTransform) {
			mapDef.extensions = mapDef.extensions || {};
			mapDef.extensions['KHR_texture_transform'] = transformDef;
			this.extensionsUsed['KHR_texture_transform'] = true;
		}
	}

	async buildMetalRoughTextureAsync(metalnessMap, roughnessMap) {
		if (metalnessMap === roughnessMap) return metalnessMap;

		function getEncodingConversion(map) {
			if (map.encoding === TEXEL_ENCODING_TYPE.SRGB) {
				return function SRGBToLinear(c) {
					return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
				};
			}

			return function LinearToLinear(c) {
				return c;
			};
		}

		const metalness = metalnessMap ? metalnessMap.image : null;
		const roughness = roughnessMap ? roughnessMap.image : null;

		const width = Math.max(metalness ? metalness.width : 0, roughness ? roughness.width : 0);
		const height = Math.max(metalness ? metalness.height : 0, roughness ? roughness.height : 0);

		const canvas = getCanvas();
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d', {
			willReadFrequently: true
		});
		context.fillStyle = '#00ffff';
		context.fillRect(0, 0, width, height);

		const composite = context.getImageData(0, 0, width, height);

		if (metalness) {
			context.drawImage(metalness, 0, 0, width, height);

			const convert = getEncodingConversion(metalnessMap);
			const data = context.getImageData(0, 0, width, height).data;

			for (let i = 2; i < data.length; i += 4) {
				composite.data[i] = convert(data[i] / 256) * 256;
			}
		}

		if (roughness) {
			context.drawImage(roughness, 0, 0, width, height);

			const convert = getEncodingConversion(roughnessMap);
			const data = context.getImageData(0, 0, width, height).data;

			for (let i = 1; i < data.length; i += 4) {
				composite.data[i] = convert(data[i] / 256) * 256;
			}
		}

		context.putImageData(composite, 0, 0);

		//

		const reference = metalnessMap || roughnessMap;

		const texture = reference.clone();

		texture.image = canvas;
		texture.encoding = TEXEL_ENCODING_TYPE.LINEAR;

		console.warn('GLTFExporter: Merged metalnessMap and roughnessMap textures.');

		return texture;
	}

	/**
	 * Serializes a userData.
	 * @param {Object3D|Material} object
	 * @param {object} objectDef
	 */
	serializeUserData(object, objectDef) {
		if (!object.userData) return;
		if (Object.keys(object.userData).length === 0) return;

		const options = this.options;
		const extensionsUsed = this.extensionsUsed;

		const json = JSON.parse(JSON.stringify(object.userData));

		if (options.includeCustomExtensions && json.gltfExtensions) {
			if (objectDef.extensions === undefined) objectDef.extensions = {};

			for (const extensionName in json.gltfExtensions) {
				objectDef.extensions[extensionName] = json.gltfExtensions[extensionName];
				extensionsUsed[extensionName] = true;
			}

			delete json.gltfExtensions;
		}

		if (Object.keys(json).length > 0) objectDef.extras = json;
	}

	/**
	 * Returns ids for buffer attributes.
	 * @param  {object} attribute
	 * @returns {Integer}
	 */
	getUID(attribute) {
		if (this.uids.has(attribute) === false) {
			this.uids.set(attribute, this.uid++);
		}

		return this.uids.get(attribute);
	}

	/**
	 * Returns unique file names.
	 * @param {string} originalName
	 * @param {string} ext
	 * @returns {string} unique name
	 */
	getUniqueFileName(originalName, ext) {
		if (!this.fileNamesUsed[ext]) this.fileNamesUsed[ext] = {};

		const namesUsed = this.fileNamesUsed[ext];

		if (originalName in namesUsed) {
			return originalName + '_' + (++namesUsed[originalName]);
		} else {
			namesUsed[originalName] = 0;
			return originalName;
		}
	}

	/**
	 * Set uri to imageDef by dataURL.
	 * @param {object} imageDef
	 * @param {string} dataURL
	 */
	setImageUri(imageDef, dataURL) {
		const options = this.options;

		if (options.format !== GLTF_FORMAT.GLTF_SEPARATE) {
			imageDef.uri = dataURL;
			return;
		}

		const ext = imageDef.mimeType === 'image/jpeg' ? 'jpg' : 'png';
		const name = this.getUniqueFileName(imageDef.name || 'image', ext);

		this.resources.push({ name, ext, content: dataURL });

		imageDef.uri = options.resourcePath + name + '.' + ext;
	}

	/**
	 * If a vertex attribute with a
	 * [non-standard data type](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#meshes-overview)
	 * is used, it is checked whether it is a valid data type according to the
	 * [KHR_mesh_quantization](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_mesh_quantization/README.md)
	 * extension.
	 * In this case the extension is automatically added to the list of used extensions.
	 * @param {string} attributeName
	 * @param {Attribute} attribute
	 */
	detectMeshQuantization(attributeName, attribute) {
		if (this.extensionsUsed[KHR_MESH_QUANTIZATION]) return;

		let attrType = undefined;

		switch (attribute.buffer.array.constructor) {
			case Int8Array:
				attrType = 'byte';
				break;
			case Uint8Array:
				attrType = 'unsigned byte';
				break;
			case Int16Array:
				attrType = 'short';
				break;
			case Uint16Array:
				attrType = 'unsigned short';
				break;
			default:
				return;
		}

		if (attribute.normalized) attrType += ' normalized';

		const attrNamePrefix = attributeName.split('_', 1)[0];

		if (KHR_mesh_quantization_ExtraAttrTypes[attrNamePrefix] && KHR_mesh_quantization_ExtraAttrTypes[attrNamePrefix].includes(attrType)) {
			this.extensionsUsed[KHR_MESH_QUANTIZATION] = true;
			this.extensionsRequired[KHR_MESH_QUANTIZATION] = true;
		}
	}

	async _invokeAllAsync(func) {
		for (let i = 0, il = this.plugins.length; i < il; i++) {
			await func(this.plugins[i]);
		}
	}

}

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
class GLTFLightExtension {

	constructor(writer) {
		this.writer = writer;
		this.name = 'KHR_lights_punctual';
	}

	writeNode(light, nodeDef) {
		if (!light.isLight) return;

		if (!light.isDirectionalLight && !light.isPointLight && !light.isSpotLight) {
			console.warn('GLTFExporter: Only directional, point, and spot lights are supported.', light);
			return;
		}

		const writer = this.writer;
		const json = writer.json;
		const extensionsUsed = writer.extensionsUsed;

		const lightDef = {};

		if (light.name) lightDef.name = light.name;

		lightDef.color = light.color.toArray();

		lightDef.intensity = light.intensity;

		if (light.isDirectionalLight) {
			lightDef.type = 'directional';
		} else if (light.isPointLight) {
			lightDef.type = 'point';

			if (light.distance > 0) lightDef.range = light.distance;
		} else if (light.isSpotLight) {
			lightDef.type = 'spot';

			if (light.distance > 0) lightDef.range = light.distance;

			lightDef.spot = {};
			lightDef.spot.innerConeAngle = (1.0 - light.penumbra) * light.angle;
			lightDef.spot.outerConeAngle = light.angle;
		}

		if (light.decay !== undefined && light.decay !== 2) {
			console.warn('GLTFExporter: Light decay may be lost. glTF is physically-based, '
				+ 'and expects light.decay=2.');
		}

		if (!extensionsUsed[this.name]) {
			json.extensions = json.extensions || {};
			json.extensions[this.name] = { lights: [] };
			extensionsUsed[this.name] = true;
		}

		const lights = json.extensions[this.name].lights;
		lights.push(lightDef);

		nodeDef.extensions = nodeDef.extensions || {};
		nodeDef.extensions[this.name] = { light: lights.length - 1 };
	}

}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
class GLTFMaterialsUnlitExtension {

	constructor(writer) {
		this.writer = writer;
		this.name = 'KHR_materials_unlit';
	}

	async writeMaterialAsync(material, materialDef) {
		if (material.type !== MATERIAL_TYPE.BASIC) return;

		const writer = this.writer;
		const extensionsUsed = writer.extensionsUsed;

		materialDef.extensions = materialDef.extensions || {};
		materialDef.extensions[this.name] = {};

		extensionsUsed[this.name] = true;

		materialDef.pbrMetallicRoughness.metallicFactor = 0.0;
		materialDef.pbrMetallicRoughness.roughnessFactor = 0.9;
	}

}

/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 */

class GLTFMeshGpuInstancingExtension {

	constructor(writer) {
		this.writer = writer;
		this.name = 'EXT_mesh_gpu_instancing';
	}

	writeNode(object, nodeDef) {
		if (!object.isMesh) return;

		const geometry = object.geometry;

		if (geometry.instanceCount === -1) return;

		const instanceMatrixAttribute = geometry.attributes.instanceMatrix;

		if (!instanceMatrixAttribute || instanceMatrixAttribute.divisor === 0) return;

		const writer = this.writer;

		const count = geometry.instanceCount;

		const translationAttr = new Float32Array(count * 3);
		const rotationAttr = new Float32Array(count * 4);
		const scaleAttr = new Float32Array(count * 3);

		const matrix = new Matrix4();
		const position = new Vector3();
		const quaternion = new Quaternion();
		const scale = new Vector3();

		for (let i = 0; i < count; i++) {
			matrix.fromArray(instanceMatrixAttribute.buffer.array, i * 16);
			matrix.decompose(position, quaternion, scale);

			position.toArray(translationAttr, i * 3);
			quaternion.toArray(rotationAttr, i * 4);
			scale.toArray(scaleAttr, i * 3);
		}

		const attributes = {
			TRANSLATION: writer.processAccessor(new Attribute(new Buffer(translationAttr, 3))),
			ROTATION: writer.processAccessor(new Attribute(new Buffer(rotationAttr, 4))),
			SCALE: writer.processAccessor(new Attribute(new Buffer(scaleAttr, 3)))
		};

		nodeDef.extensions = nodeDef.extensions || {};
		nodeDef.extensions[this.name] = { attributes };

		writer.extensionsUsed[this.name] = true;
		writer.extensionsRequired[this.name] = true;
	}

}

export { GLTFExporter, GLTF_FORMAT, GLTFMaterialsUnlitExtension, GLTFMeshGpuInstancingExtension, GLTFLightExtension };