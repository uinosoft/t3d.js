import { Mesh, Geometry, Texture2D, Buffer, Attribute, Matrix4, MathUtils, PIXEL_FORMAT, PIXEL_TYPE, TEXTURE_FILTER } from 't3d';

// reference: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/BatchedMesh.js
// TODO: Implement geometry sorting for transparent and opaque materials
// TODO: Add an "optimize" function to pack geometry and remove data gaps
// TODO: Support boundings
// TODO: Support frustum culling
// TODO: Support raycast
// BatchedMesh can be used with BatchedPBRMaterial
class BatchedMesh extends Mesh {

	constructor(maxGeometryCount, maxVertexCount, maxIndexCount = maxVertexCount * 2, material) {
		super(new Geometry(), [material]);

		this._drawRanges = [];
		this._reservedRanges = [];

		this._visible = [];
		this._active = [];

		this._maxGeometryCount = maxGeometryCount;
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		const geometryGroup = {
			multiDrawCounts: new Int32Array(maxGeometryCount),
			multiDrawStarts: new Int32Array(maxGeometryCount),
			multiDrawCount: 0,
			materialIndex: 0
		};

		this._geometryInitialized = false;
		this._geometryCount = 0;
		this._geometryGroup = geometryGroup;

		this._matricesTexture = null;

		this._initMatricesTexture();

		this.geometry.groups[0] = geometryGroup;
		this.material[0].uniforms.batchingTexture = this._matricesTexture;
		this.frustumCulled = false;
	}

	_initMatricesTexture() {
		// layout (1 matrix = 4 pixels)
		//      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
		//  with  8x8  pixel texture max   16 matrices * 4 pixels =  (8 * 8)
		//       16x16 pixel texture max   64 matrices * 4 pixels = (16 * 16)
		//       32x32 pixel texture max  256 matrices * 4 pixels = (32 * 32)
		//       64x64 pixel texture max 1024 matrices * 4 pixels = (64 * 64)

		let size = Math.sqrt(this._maxGeometryCount * 4); // 4 pixels needed for 1 matrix
		size = MathUtils.nextPowerOfTwo(Math.ceil(size));
		size = Math.max(4, size);

		const matricesArray = new Float32Array(size * size * 4); // 4 floats per RGBA pixel

		const matricesTexture = new Texture2D();
		matricesTexture.image = { data: matricesArray, width: size, height: size };
		matricesTexture.format = PIXEL_FORMAT.RGBA;
		matricesTexture.type = PIXEL_TYPE.FLOAT;
		matricesTexture.magFilter = TEXTURE_FILTER.NEAREST;
		matricesTexture.minFilter = TEXTURE_FILTER.NEAREST;
		matricesTexture.generateMipmaps = false;
		matricesTexture.flipY = false;

		this._matricesTexture = matricesTexture;
	}

	_initializeGeometry(reference) {
		if (this._geometryInitialized) return;

		const geometry = this.geometry;
		const maxVertexCount = this._maxVertexCount;
		const maxGeometryCount = this._maxGeometryCount;
		const maxIndexCount = this._maxIndexCount;

		const buffers = new WeakMap(); // used for storing cloned, shared buffers

		for (const attributeName in reference.attributes) {
			const srcAttribute = reference.getAttribute(attributeName);
			const { buffer, size, offset, normalized } = srcAttribute;

			let dstBuffer = buffers.get(buffer);
			if (!dstBuffer) {
				const dstArray = new buffer.array.constructor(maxVertexCount * buffer.stride);
				dstBuffer = new Buffer(dstArray, buffer.stride);
				dstBuffer.usage = buffer.usage;
				buffers.set(buffer, dstBuffer);
			}

			const dstAttribute = new Attribute(dstBuffer, size, offset, normalized);

			geometry.addAttribute(attributeName, dstAttribute);
		}

		if (reference.index !== null) {
			const indexArray = maxVertexCount > 65536
				? new Uint32Array(maxIndexCount)
				: new Uint16Array(maxIndexCount);

			geometry.setIndex(new Attribute(new Buffer(indexArray, 1)));
		}

		const idArray = maxGeometryCount > 65536
			? new Uint32Array(maxVertexCount)
			: new Uint16Array(maxVertexCount);
		geometry.addAttribute(ID_ATTR_NAME, new Attribute(new Buffer(idArray, 1)));

		this._geometryInitialized = true;
	}

	// Make sure the geometry is compatible with the existing combined geometry atributes
	_validateGeometry(geometry) {
		// check that the geometry doesn't have a version of our reserved id attribute
		if (geometry.getAttribute(ID_ATTR_NAME)) {
			throw new Error(`BatchedMesh: Geometry cannot use attribute "${ID_ATTR_NAME}"`);
		}

		// check to ensure the geometries are using consistent attributes and indices
		const batchGeometry = this.geometry;
		if (Boolean(geometry.index) !== Boolean(batchGeometry.index)) {
			throw new Error('BatchedMesh: All geometries must consistently have "index".');
		}

		for (const attributeName in batchGeometry.attributes) {
			if (attributeName === ID_ATTR_NAME) {
				continue;
			}

			if (!geometry.attributes[attributeName]) {
				throw new Error(`BatchedMesh: Added geometry missing "${attributeName}". All geometries must have consistent attributes.`);
			}

			const srcAttribute = geometry.getAttribute(attributeName);
			const dstAttribute = batchGeometry.getAttribute(attributeName);
			if (srcAttribute.size !== dstAttribute.size || srcAttribute.normalized !== dstAttribute.normalized) {
				throw new Error('BatchedMesh: All attributes must have a consistent size and normalized value.');
			}
		}
	}

	getGeometryCount() {
		return this._geometryCount;
	}

	addGeometry(geometry, vertexCount = -1, indexCount = -1) {
		this._initializeGeometry(geometry);

		this._validateGeometry(geometry);

		// ensure we're not over geometry
		if (this._geometryCount >= this._maxGeometryCount) {
			throw new Error('BatchedMesh: Maximum geometry count reached.');
		}

		// get the necessary range fo the geometry
		const reservedRange = {
			vertexStart: -1,
			vertexCount: -1,
			indexStart: -1,
			indexCount: -1
		};

		let lastRange = null;
		const reservedRanges = this._reservedRanges;
		const drawRanges = this._drawRanges;
		if (this._geometryCount !== 0) {
			lastRange = reservedRanges[reservedRanges.length - 1];
		}

		if (vertexCount === -1) {
			reservedRange.vertexCount = geometry.getAttribute('a_Position').buffer.count;
		} else {
			reservedRange.vertexCount = vertexCount;
		}

		if (lastRange === null) {
			reservedRange.vertexStart = 0;
		} else {
			reservedRange.vertexStart = lastRange.vertexStart + lastRange.vertexCount;
		}

		const index = geometry.index;
		const hasIndex = !!index;
		if (hasIndex) {
			if (indexCount === -1) {
				reservedRange.indexCount = index.buffer.count;
			} else {
				reservedRange.indexCount = indexCount;
			}

			if (lastRange === null) {
				reservedRange.indexStart = 0;
			} else {
				reservedRange.indexStart = lastRange.indexStart + lastRange.indexCount;
			}
		}

		if (
			reservedRange.indexStart !== -1 &&
			reservedRange.indexStart + reservedRange.indexCount > this._maxIndexCount ||
			reservedRange.vertexStart + reservedRange.vertexCount > this._maxVertexCount
		) {
			throw new Error('BatchedMesh: Reserved space request exceeds the maximum buffer size.');
		}

		const visible = this._visible;
		const active = this._active;
		const matricesTexture = this._matricesTexture;
		const matricesArray = this._matricesTexture.image.data;

		// push new visibility states
		visible.push(true);
		active.push(true);

		// update id
		const geometryId = this._geometryCount;
		this._geometryCount++;

		// initialize matrix information
		_identityMatrix.toArray(matricesArray, geometryId * 16);
		matricesTexture.version++;

		// add the reserved range and draw range objects
		reservedRanges.push(reservedRange);
		drawRanges.push({
			start: hasIndex ? reservedRange.indexStart : reservedRange.vertexStart,
			count: -1
		});

		// set the id for the geometry
		const idAttribute = this.geometry.getAttribute(ID_ATTR_NAME);
		for (let i = 0; i < reservedRange.vertexCount; i++) {
			idAttribute.buffer.array[reservedRange.vertexStart + i] = geometryId;
		}

		idAttribute.buffer.version++;

		// update the geometry
		this.setGeometryAt(geometryId, geometry);

		return geometryId;
	}

	setGeometryAt(id, geometry) {
		if (id >= this._geometryCount) {
			throw new Error('BatchedMesh: Maximum geometry count reached.');
		}

		this._validateGeometry(geometry);

		const batchGeometry = this.geometry;
		const hasIndex = batchGeometry.index !== null;
		const dstIndex = batchGeometry.index;
		const srcIndex = geometry.index;
		const reservedRange = this._reservedRanges[id];
		if (
			hasIndex &&
			srcIndex.count > reservedRange.indexCount ||
			geometry.attributes.a_Position.buffer.count > reservedRange.vertexCount
		) {
			throw new Error('BatchedMesh: Reserved space not large enough for provided geometry.');
		}

		// copy geometry over
		const vertexStart = reservedRange.vertexStart;
		const vertexCount = reservedRange.vertexCount;

		const buffers = new Set();

		for (const attributeName in batchGeometry.attributes) {
			if (attributeName === ID_ATTR_NAME) {
				continue;
			}

			const srcBuffer = geometry.getAttribute(attributeName).buffer;
			const dstBuffer = batchGeometry.getAttribute(attributeName).buffer;

			if (buffers.has(srcBuffer)) {
				continue;
			}

			buffers.add(srcBuffer);

			dstBuffer.array.set(srcBuffer.array, vertexStart * dstBuffer.stride);

			// fill the rest in with zeroes
			const stride = srcBuffer.stride;
			for (let i = srcBuffer.count, l = vertexCount; i < l; i++) {
				const index = vertexStart + i;
				for (let c = 0; c < stride; c++) {
					dstBuffer.array[index * stride + c] = 0;
				}
			}

			dstBuffer.version++;
		}

		// copy index
		if (hasIndex) {
			const indexStart = reservedRange.indexStart;
			const srcIndexBuffer = srcIndex.buffer;
			const dstIndexBuffer = dstIndex.buffer;

			// copy index data over
			for (let i = 0; i < srcIndexBuffer.count; i++) {
				dstIndexBuffer.array[indexStart + i] = vertexStart + srcIndexBuffer.array[i];
			}

			// fill the rest in with zeroes
			for (let i = srcIndexBuffer.count, l = reservedRange.indexCount; i < l; i++) {
				dstIndexBuffer.array[indexStart + i] = vertexStart;
			}

			dstIndexBuffer.version++;
		}

		// set drawRange count
		const drawRange = this._drawRanges[id];
		const posAttr = geometry.getAttribute('a_Position');
		drawRange.count = hasIndex ? srcIndex.buffer.count : posAttr.buffer.count;

		return id;
	}

	deleteGeometry(geometryId) {
		const active = this._active;
		if (geometryId >= active.length || active[geometryId] === false) {
			return this;
		}

		active[geometryId] = false;

		return this;
	}

	setMatrixAt(geometryId, matrix) {
		const active = this._active;
		const matricesTexture = this._matricesTexture;
		const matricesArray = this._matricesTexture.image.data;
		const geometryCount = this._geometryCount;
		if (geometryId >= geometryCount || active[geometryId] === false) {
			return this;
		}

		matrix.toArray(matricesArray, geometryId * 16);
		matricesTexture.version++;

		return this;
	}

	getMatrixAt(geometryId, matrix) {
		const active = this._active;
		const matricesArray = this._matricesTexture.image.data;
		const geometryCount = this._geometryCount;
		if (geometryId >= geometryCount || active[geometryId] === false) {
			return null;
		}

		return matrix.fromArray(matricesArray, geometryId * 16);
	}

	setVisibleAt(geometryId, value) {
		const visible = this._visible;
		const active = this._active;
		const geometryCount = this._geometryCount;

		// if the geometry is out of range, not active, or visibility state
		// does not change then return early
		if (
			geometryId >= geometryCount ||
			active[geometryId] === false ||
			visible[geometryId] === value
		) {
			return this;
		}

		visible[geometryId] = value;
		return this;
	}

	getVisibleAt(geometryId) {
		const visible = this._visible;
		const active = this._active;
		const geometryCount = this._geometryCount;

		// return early if the geometry is out of range or not active
		if (geometryId >= geometryCount || active[geometryId] === false) {
			return false;
		}

		return visible[geometryId];
	}

	update() {
		const geometry = this.geometry;

		// the indexed version of the multi draw function requires specifying the start
		// offset in bytes.
		const index = geometry.index;
		const bytesPerElement = index ? index.buffer.array.BYTES_PER_ELEMENT : 1;

		const visible = this._visible;
		const geometryGroup = this._geometryGroup;
		const drawRanges = this._drawRanges;

		let count = 0;
		for (let i = 0, l = visible.length; i < l; i++) {
			if (visible[i]) {
				const range = drawRanges[i];
				geometryGroup.multiDrawStarts[count] = range.start * bytesPerElement;
				geometryGroup.multiDrawCounts[count] = range.count;
				count++;
			}
		}

		geometryGroup.multiDrawCount = count;
	}

}

const ID_ATTR_NAME = 'batchId';
const _identityMatrix = new Matrix4();

export { BatchedMesh };