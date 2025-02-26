import {
    Mesh,
    Geometry,
    Texture2D,
    Buffer,
    Attribute,
    Matrix4,
    Vector3,
    Frustum,
    Sphere,
    Box3,
    Color3,
    PIXEL_FORMAT,
    PIXEL_TYPE,
    TEXTURE_FILTER,
    DRAW_SIDE,
    Ray,
    Triangle,
    Vector2
} from 't3d';

// reference: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/BatchedMesh.js
/**
 * BatchedMesh - An efficient mesh implementation for rendering many objects with the same material
 * 
 * Features:
 * - Efficiently renders many objects with the same material
 * - Supports instancing with individual transformations and colors
 * - Allows dynamic addition/removal of geometries and instances
 * - Optional per-object frustum culling
 * - Optional depth sorting for transparent materials
 * BatchedMesh can be used with BatchedPBRMaterial
 */

const _mat4_1 = new Matrix4();
const _mat4_2 = new Matrix4();
const _vec3_1 = new Vector3();
const _vec3_2 = new Vector3();
const _vec3_3 = new Vector3();
const _frustum = new Frustum();
const _sphere_1 = new Sphere();
const _sphere_2 = new Sphere();
const _renderList = [];

const _sphere = new Sphere();
const _inverseMatrix = new Matrix4();
const _ray = new Ray();
const _instanceMatrix = new Matrix4();
const _tempMatrix = new Matrix4();

const _barycoord = new Vector3();

const _vA = new Vector3();
const _vB = new Vector3();
const _vC = new Vector3();

const _uvA = new Vector2();
const _uvB = new Vector2();
const _uvC = new Vector2();

const _intersectionPoint = new Vector3();
const _intersectionPointWorld = new Vector3();

/**
 * Sort function to arrange IDs in ascending order
 * @param {number} a - First ID
 * @param {number} b - Second ID
 * @returns {number} - Comparison result
 */
function ascIdSort( a, b ) {
    return a - b;
}

/**
 * Sort function for opaque objects (front-to-back)
 * @param {Object} a - First render item
 * @param {Object} b - Second render item
 * @returns {number} - Comparison result
 */
function sortOpaque( a, b ) {
    return a.z - b.z;
}

/**
 * Sort function for transparent objects (back-to-front)
 * @param {Object} a - First render item
 * @param {Object} b - Second render item
 * @returns {number} - Comparison result
 */
function sortTransparent( a, b ) {
    return b.z - a.z;
}

/**
 * Updates the update range of a buffer
 * @param {Buffer} buffer - The buffer to update
 * @param {number} offset - Start offset of the range
 * @param {number} count - Number of elements to update (defaults to buffer.stride)
 */
function updateBufferRange(buffer, offset, count = buffer.stride) {
	const updateRange = buffer.updateRange;
	if (updateRange.count === -1) {
		updateRange.offset = offset;
		updateRange.count = count;
		return;
	}

	const prevOffset = updateRange.offset;
	const endOffset = prevOffset + updateRange.count;
	updateRange.offset = Math.min(prevOffset, offset);
	updateRange.count = Math.max(endOffset, offset + count) - updateRange.offset;
}

/**
 * Copies attribute data from source to target at specified vertex offset
 * @param {Attribute} targetAttribute - Target attribute
 * @param {Attribute} sourceAttribute - Source attribute
 * @param {number} vertexStart - Starting vertex index in target
 */
function copyAttribute(targetAttribute, sourceAttribute, vertexStart) {
	const targetAttributeOffset = targetAttribute.offset;
	const sourceAttributeOffset = sourceAttribute.offset;
	const targetAttributeSize = targetAttribute.size;
	const targetAttributeStride = targetAttribute.buffer.stride;
	const sourceAttributeStride = sourceAttribute.buffer.stride;

	const targetArray = targetAttribute.buffer.array;
	const sourceArray = sourceAttribute.buffer.array;

	const sourceCount = sourceAttribute.buffer.count;

	for(let i = 0; i < sourceCount; i++){
		const targetIndex = (vertexStart + i) * targetAttributeStride + targetAttributeOffset;
		const sourceIndex = i * sourceAttributeStride + sourceAttributeOffset;

		for(let j = 0; j < targetAttributeSize; j++){
			targetArray[targetIndex + j] = sourceArray[sourceIndex + j];
		}
	}
	
}

/**
 * Copies array contents from source to target
 * @param {TypedArray} source - Source array
 * @param {TypedArray} target - Target array
 */
function copyArrayContents(source, target) {
	if(source.constructor !== target.constructor){
		const len = Math.min(source.length, target.length);
		for(let i = 0; i < len; i++){
			target[i] = source[i];
		}
	}
	else {
		const len = Math.min(source.length, target.length);
		target.set(new source.constructor(source.buffer, 0, len));
	}
}


class BatchedMesh extends Mesh {

	/**
	 * Get the number of active instances
	 * @returns {number} Number of active instances
	 */
	get instanceCount() {
		return this._instanceInfo.length - this._availableInstanceIds.length;
	}

	/**
	 * Get the number of unused vertices in the combined geometry
	 * @returns {number} Number of unused vertices
	 */
	get unusedVertexCount() {
		return this._maxVertexCount - this._nextVertexStart;
	}

	/**
	 * Get the number of unused indices in the combined geometry
	 * @returns {number} Number of unused indices
	 */
	get unusedIndexCount() {
		return this._maxIndexCount - this._nextIndexStart;
	}

	/**
	 * Creates a BatchedMesh instance
	 * @param {number} _maxInstanceCount - Maximum number of instances to support
	 * @param {number} maxVertexCount - Maximum number of vertices in the combined geometry
	 * @param {number} maxIndexCount - Maximum number of indices in the combined geometry
	 * @param {Material} material - Material to use for rendering
	 */
	constructor(_maxInstanceCount, maxVertexCount, maxIndexCount, material) {
		super(new Geometry(), [material]);

		this._maxInstanceCount = _maxInstanceCount;
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		// Instance management
		this._instanceInfo = [];
		this._availableInstanceIds = [];
		this._nextInstanceId = 0;

		// Geometry management 
		this._geometryInfo = [];
		this._availableGeometryIds = [];
		this._nextGeometryId = 0;
		this._nextVertexStart = 0;
		this._nextIndexStart = 0;     

		// Rendering properties
		this.perObjectFrustumCulled = true;
		this.sortObjects = true;

		this._initMatricesTexture();
		this._initIndirectTexture();

		// Update material
		material.defines.USE_BATCHING = true;
		material.uniforms.matricesTexture = this._matricesTexture;
		material.uniforms.indirectTexture = this._indirectTexture;

		// Add bounding volume properties
		this.boundingBox = null;
		this.boundingSphere = null;

		this._multiDrawCounts = new Uint32Array(_maxInstanceCount);
		this._multiDrawStarts = new Uint32Array(_maxInstanceCount);

		this._geometryInitialized = false;
		this._visibilityChanged = true;
	}

	/**
	 * Initializes the matrices texture for instance transformations
	 * @private
	 */
	_initMatricesTexture() {
		// Create matrices texture
		let matricesTextureSize = Math.sqrt( this._maxInstanceCount * 4 ); // 4 pixels needed for 1 matrix
		matricesTextureSize = Math.ceil( matricesTextureSize / 4 ) * 4;
		matricesTextureSize = Math.max( matricesTextureSize, 4 );
		this._matricesTexture = new Texture2D();
		this._matricesTexture.image = {
			data: new Float32Array(matricesTextureSize * matricesTextureSize * 4),
			width: matricesTextureSize,
			height: matricesTextureSize
		};
		this._matricesTexture.format = PIXEL_FORMAT.RGBA;
		this._matricesTexture.type = PIXEL_TYPE.FLOAT;
		this._matricesTexture.magFilter = TEXTURE_FILTER.NEAREST;
		this._matricesTexture.minFilter = TEXTURE_FILTER.NEAREST;
		this._matricesTexture.generateMipmaps = false;
		this._matricesTexture.flipY = false;
	}

	/**
	 * Initializes the indirect texture for instance indexing
	 * @private
	 */
	_initIndirectTexture() {
		// Create indirect texture
		let size = Math.sqrt( this._maxInstanceCount );
		size = Math.ceil( size );
		this._indirectTexture = new Texture2D();
		this._indirectTexture.image = {
			data: new Uint32Array(size * size),
			width: size,
			height: size
		};
		this._indirectTexture.format = PIXEL_FORMAT.RED_INTEGER;
		this._indirectTexture.internalformat = 'R32UI';
		this._indirectTexture.type = PIXEL_TYPE.UNSIGNED_INT;
		this._indirectTexture.magFilter = TEXTURE_FILTER.NEAREST;
		this._indirectTexture.minFilter = TEXTURE_FILTER.NEAREST;
		this._indirectTexture.generateMipmaps = false;
		this._indirectTexture.flipY = false;
	}

	/**
	 * Initializes the colors texture for instance colors
	 * @private
	 */
	_initColorsTexture() {
		// Create colors texture on first use
		let size = Math.sqrt( this._maxInstanceCount );
		size = Math.ceil( size );
		this._colorsTexture = new Texture2D();
		this._colorsTexture.image = {
			data: new Float32Array(size * size * 4).fill(1),
			width: size,
			height: size
		};
		this._colorsTexture.format = PIXEL_FORMAT.RGBA;
		this._colorsTexture.type = PIXEL_TYPE.FLOAT;
		this._colorsTexture.magFilter = TEXTURE_FILTER.NEAREST;
		this._colorsTexture.minFilter = TEXTURE_FILTER.NEAREST;
		this._colorsTexture.generateMipmaps = false;
		this._colorsTexture.flipY = false;
	}

	/**
	 * Initializes the geometry based on an input geometry
	 * @private
	 * @param {Geometry} geometry - Reference geometry for attributes setup
	 */
	_initializeGeometry(geometry) {
		if(this._geometryInitialized) return;

		const targetGeometry = this.geometry;
		const maxVertexCount = this._maxVertexCount;
		const maxIndexCount = this._maxIndexCount;

		const sourceIndex = geometry.index;
		if(sourceIndex){
			const indexArray = maxVertexCount > 65535 ? new Uint32Array(maxIndexCount) : new Uint16Array(maxIndexCount);
			targetGeometry.index = new Attribute(new Buffer(indexArray, 1), 1, 0, sourceIndex.normalized);
		}

		const attributes = geometry.attributes;
		for(const name in attributes){
			const attribute = attributes[name];
			const stride = attribute.buffer.stride;
			const itemSize = attribute.size;
			const offset = attribute.offset;
			const normalized = attribute.normalized;
			const array = attribute.buffer.array;

			const targetArray = new array.constructor(maxVertexCount * stride);
			targetGeometry.addAttribute(name, new Attribute(new Buffer(targetArray, stride), itemSize, offset, normalized));
		}

		this._geometryInitialized = true;
	}
	
	/**
	 * Validates if a geometry is compatible with the batch
	 * @private
	 * @param {Geometry} geometry - Geometry to validate
	 * @returns {boolean} True if the geometry is compatible
	 */
	_validateGeometry(geometry){
		const targetGeometry = this.geometry;
		if(!!targetGeometry.index !== !!geometry.index){
			console.error('BatchedMesh: Geometry must have an index attribute');
			return false;
		}

		const targetAttributes = targetGeometry.attributes;
		const sourceAttributes = geometry.attributes;

		for(const name in targetAttributes){
			if(!sourceAttributes[name]){
				console.error('BatchedMesh: Geometry must have the same attributes');
				return false;
			}

			const targetAttribute = targetAttributes[name];
			const sourceAttribute = sourceAttributes[name];

			if(targetAttribute.size !== sourceAttribute.size || targetAttribute.normalized !== sourceAttribute.normalized){
				console.error('BatchedMesh: Attribute size or normalized mismatch');
				return false;
			}
		}

		return true;
	}

	/**
	 * Validates if an instance ID is valid and active
	 * @private
	 * @param {number} instanceId - Instance ID to validate
	 * @returns {boolean} True if the instance ID is valid
	 */
	_validateInstanceId(instanceId) {
		const instance = this._instanceInfo[instanceId];
		if (!instance?.active) {
			return false;
		}

		return true;
	}

	/**
	 * Validates if a geometry ID is valid and active
	 * @private
	 * @param {number} geometryId - Geometry ID to validate
	 * @returns {boolean} True if the geometry ID is valid
	 */
	_validateGeometryId(geometryId) {
		const geometry = this._geometryInfo[geometryId];
		if (!geometry?.active) {
			return false;
		}

		return true;
	}

	/**
	 * Copies geometry data from source to the batch
	 * @private
	 * @param {Geometry} sourceGeometry - Source geometry to copy from
	 * @param {number} geometryId - Target geometry ID
	 */
	_copyGeometryData(sourceGeometry, geometryId) {
		const info = this._geometryInfo[geometryId];
		const targetGeometry = this.geometry;
		const vertexStart = info.vertexStart;
		const reservedVertexCount = info.reservedVertexCount;
		const indexStart = info.indexStart;
		const reservedIndexCount = info.reservedIndexCount;

		// Iterate through and copy all attributes
		const sourceAttributes = sourceGeometry.attributes;
		const targetAttributes = targetGeometry.attributes;
		for (const name in sourceAttributes) {
			const sourceAttribute = sourceAttributes[name];
			const targetAttribute = targetAttributes[name];
			
			copyAttribute(targetAttribute, sourceAttribute, vertexStart);

			// Fill remaining reserved space with zeros
			const targetArray = targetAttribute.buffer.array;
			const sourceCount = sourceAttribute.buffer.count;
			const sourceSize = sourceAttribute.size;
			const targetOffset = targetAttribute.offset;
			const targetStride = targetAttribute.buffer.stride;
			for(let i = sourceCount; i < reservedVertexCount; i++){
				const targetIndex = (vertexStart + i) * targetStride + targetOffset;
				for(let j = 0; j < sourceSize; j++){
					targetArray[targetIndex + j] = 0;
				}
			}

			// Update buffer's update range
			updateBufferRange(targetAttribute.buffer, vertexStart * targetStride, reservedVertexCount * targetStride);
			targetAttribute.buffer.version++;
		}

		// Copy indices
		if (indexStart !== -1) {

			const targetIndexArray = targetGeometry.index.buffer.array;
			const sourceIndexArray = sourceGeometry.index.buffer.array;
			const sourceIndexCount = sourceGeometry.index.buffer.count;
			const targetIndexStride = targetGeometry.index.buffer.stride;
			const targetIndexOffset = targetGeometry.index.offset;
			const sourceIndexStride = sourceGeometry.index.buffer.stride;
			const sourceIndexOffset = sourceGeometry.index.offset;

			for (let i = 0; i < sourceIndexCount; i++) {
				const targetIndex = (indexStart + i) * targetIndexStride + targetIndexOffset;
				const sourceIndex = i * sourceIndexStride + sourceIndexOffset;
				targetIndexArray[targetIndex] = sourceIndexArray[sourceIndex] + vertexStart;
			}

			// Fill remaining reserved space
			for (let i = sourceIndexCount; i < reservedIndexCount; i++) {
				const targetIndex = (indexStart + i) * targetIndexStride + targetIndexOffset;
				targetIndexArray[targetIndex] = vertexStart;
			}

			// Update buffer's update range
			updateBufferRange(targetGeometry.index.buffer, indexStart * targetIndexStride, reservedIndexCount * targetIndexStride);
			targetGeometry.index.buffer.version++;
		}

		info.drawStart = indexStart !== -1 ? indexStart : vertexStart;
		info.drawCount = indexStart !== -1 ? info.indexCount : info.vertexCount;

		// Calculate bounding volumes
		const positionArray = sourceGeometry.attributes.a_Position.buffer.array;
		info.boundingBox.setFromArray(positionArray);
		info.boundingSphere.setFromArray(positionArray);
	}

	/**
	 * Adds a new geometry to the batch
	 * @param {Geometry} geometry - Geometry to add
	 * @param {number} [reservedVertexCount=-1] - Number of vertices to reserve (defaults to geometry's vertex count)
	 * @param {number} [reservedIndexCount=-1] - Number of indices to reserve (defaults to geometry's index count)
	 * @returns {number} The ID of the added geometry, or -1 on failure
	 */
	addGeometry(geometry, reservedVertexCount = -1, reservedIndexCount = -1) {
		this._initializeGeometry(geometry);
		if(!this._validateGeometry(geometry)){
			return -1;
		}

		reservedVertexCount = reservedVertexCount === -1 ? geometry.attributes.a_Position.buffer.count : reservedVertexCount;
		reservedIndexCount = reservedIndexCount === -1 ? geometry.index ? geometry.index.buffer.count : 0 : reservedIndexCount;

		// Validate space
		if (this._nextVertexStart + reservedVertexCount > this._maxVertexCount ||
			this._nextIndexStart + reservedIndexCount > this._maxIndexCount) {
			console.error('BatchedMesh: Not enough space for new geometry');
			return -1;
		}

		// Get geometry ID
		const geometryId = this._availableGeometryIds.length > 0 
			? this._availableGeometryIds.pop() 
			: this._nextGeometryId++;

		const hasIndex = !!this.geometry.index;

		// Setup geometry info
		this._geometryInfo[geometryId] = {
			vertexStart: this._nextVertexStart,
			vertexCount: geometry.attributes.a_Position.buffer.count,
			reservedVertexCount: reservedVertexCount,
			
			indexStart: hasIndex ? this._nextIndexStart : -1,
			indexCount: hasIndex ? geometry.index.buffer.count : -1,
			reservedIndexCount: reservedIndexCount,

			drawStart: -1,
			drawCount: -1,

			boundingBox: new Box3(),
			boundingSphere: new Sphere(),
			
			active: true
		};

		// Copy geometry data
		this._copyGeometryData(geometry, geometryId);

		// Update offsets
		this._nextVertexStart += reservedVertexCount;
		this._nextIndexStart += reservedIndexCount;

		return geometryId;
	}

	/**
	 * Deletes a geometry from the batch and any instances using it
	 * @param {number} geometryId - ID of the geometry to delete
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	deleteGeometry(geometryId) {
		if(!this._validateGeometryId(geometryId)){
			return this;
		}

		const geometry = this._geometryInfo[geometryId];

		// Delete all instances using this geometry
		for (let i = 0; i < this._instanceInfo.length; i++) {
			if (this._instanceInfo[i]?.geometryId === geometryId) {
				this.deleteInstance(i);
			}
		}

		geometry.active = false;
		this._availableGeometryIds.push(geometryId);
		this._visibilityChanged = true;

		return this;
	}

	/**
	 * Gets the vertex and index range information for a geometry
	 * @param {number} geometryId - ID of the geometry
	 * @param {Object} [target={}] - Object to store the range information
	 * @returns {Object|null} The range information or null if invalid
	 */
	getGeometryRangeAt(geometryId, target = {}) {
		if (!this._validateGeometryId(geometryId)) {
			console.error('BatchedMesh: Invalid geometry ID');
			return null;
		}

		const geometry = this._geometryInfo[geometryId];
		target.vertexStart = geometry.vertexStart;
		target.vertexCount = geometry.vertexCount;
		target.reservedVertexCount = geometry.reservedVertexCount;
		target.indexStart = geometry.indexStart;
		target.indexCount = geometry.indexCount;
		target.reservedIndexCount = geometry.reservedIndexCount;
		target.drawStart = geometry.drawStart;
		target.drawCount = geometry.drawCount;

		return target;
	}

	/**
	 * Updates a geometry at the specified ID
	 * @param {number} geometryId - ID of the geometry to update
	 * @param {Geometry} geometry - New geometry data
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	setGeometryAt(geometryId, geometry) {
		if (!this._geometryInfo[geometryId]) {
			console.error('BatchedMesh: Invalid geometry ID');
			return this;
		}

		if (!this._validateGeometry(geometry)) {
			return this;
		}

		const targetGeometry = this.geometry;
		const geometryInfo = this._geometryInfo[geometryId];

		const hasIndex = !!targetGeometry.index;
		const srcIndex = geometry.index;
		if(hasIndex && (srcIndex.buffer.count > geometryInfo.reservedIndexCount) 
			|| geometry.attributes.a_Position.buffer.count > geometryInfo.reservedVertexCount) {
			console.error('BatchedMesh: New index count is too large');
			return this;
		}

		// Update geometry info
		geometryInfo.vertexCount = geometry.attributes.a_Position.buffer.count;
		geometryInfo.indexCount = hasIndex ? geometry.index.buffer.count : -1;

		// Copy geometry data
		this._copyGeometryData(geometry, geometryId);

		this._visibilityChanged = true;

		return this;

	}

	/**
	 * Resizes the batch's geometry capacity
	 * @param {number} maxVertexCount - New maximum vertex count
	 * @param {number} maxIndexCount - New maximum index count
	 */
	setGeometrySize(maxVertexCount, maxIndexCount) {
		if (maxVertexCount < this._nextVertexStart || maxIndexCount < this._nextIndexStart) {
			console.error('BatchedMesh: New size is too small for existing geometry');
			return;
		}

		const oldGeometry = this.geometry;
		oldGeometry.dispose();

		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		if(this._geometryInitialized) {
			this._geometryInitialized = false;
			this.geometry = new Geometry();
			this._initializeGeometry(oldGeometry);
		}

		const geometry = this.geometry;
		if(oldGeometry.index) {
			copyArrayContents(oldGeometry.index.buffer.array, geometry.index.buffer.array);
		}

		const oldAttributes = oldGeometry.attributes;
		const attributes = geometry.attributes;
		for(const name in oldAttributes){
			const oldAttribute = oldAttributes[name];
			const attribute = attributes[name];
			copyArrayContents(oldAttribute.buffer.array, attribute.buffer.array);
		}
	}

	/**
	 * Adds a new instance using the specified geometry
	 * @param {number} geometryId - ID of the geometry to use
	 * @returns {number} The ID of the added instance, or -1 on failure
	 */
	addInstance(geometryId) {
		if (!this._validateGeometryId(geometryId)) {
			console.error('BatchedMesh: Invalid geometry ID');
			return -1;
		}

		const availableInstanceIds = this._availableInstanceIds;

		// If instance count exceeds max instance count, return error
		if ((this._instanceInfo.length >= this._maxInstanceCount) && availableInstanceIds.length === 0) {
			console.error('BatchedMesh: Max instance count exceeded');
			return -1;
		}

		const instanceInfo = {
			geometryId: geometryId,
			visible: true,
			active: true
		};

		let instanceId;
		if(availableInstanceIds.length > 0) {
			availableInstanceIds.sort(ascIdSort);
			instanceId = availableInstanceIds.shift();
		} else {
			instanceId = this._instanceInfo.length;
		}

		this._instanceInfo[instanceId] = instanceInfo;

		// Initialize matrix
		this.setMatrixAt(instanceId, new Matrix4());

		// TODO: Initialize color

		this._visibilityChanged = true;

		return instanceId;
	}

	/**
	 * Deletes an instance
	 * @param {number} instanceId - ID of the instance to delete
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	deleteInstance(instanceId) {
		if (!this._validateInstanceId(instanceId)) {
			return this;
		}
		
		const instance = this._instanceInfo[instanceId];
		instance.active = false;
		this._availableInstanceIds.push(instanceId);
		this._visibilityChanged = true;

		return this;
	}

	/**
	 * Sets the transformation matrix for an instance
	 * @param {number} instanceId - ID of the instance
	 * @param {Matrix4} matrix - The transformation matrix
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	setMatrixAt(instanceId, matrix) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return this;
		}

		const data = this._matricesTexture.image.data;
		const offset = instanceId * 16;

		// Copy matrix elements to texture data
		const elements = matrix.elements;
		for (let i = 0; i < 16; i++) {
			data[offset + i] = elements[i];
		}

		this._matricesTexture.version++;
		return this;
	}

	/**
	 * Gets the transformation matrix of an instance
	 * @param {number} instanceId - ID of the instance
	 * @param {Matrix4} target - Matrix to store the result
	 * @returns {Matrix4|null} The instance's transformation matrix or null if invalid
	 */
	getMatrixAt(instanceId, target) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return null;
		}

		const data = this._matricesTexture.image.data;
		const offset = instanceId * 16;

		target.fromArray(data, offset);
		return target;
	}

	/**
	 * Sets the color for an instance
	 * @param {number} instanceId - ID of the instance
	 * @param {Color3|Object} color - Color object with r,g,b,a components
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	setColorAt(instanceId, color) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return this;
		}

		if (!this._colorsTexture) {
			// Create colors texture on first use
			this._initColorsTexture();

			// Update material
			this.material[0].defines.USE_BATCHING_COLOR = true;
			this.material[0].uniforms.colorsTexture = this._colorsTexture;
		}

		const data = this._colorsTexture.image.data;
		const offset = instanceId * 4;
		
		data[offset] = color.r;
		data[offset + 1] = color.g;
		data[offset + 2] = color.b;
		data[offset + 3] = color.a !== undefined ? color.a : 1.0;

		this._colorsTexture.version++;
		return this;
	}

	/**
	 * Gets the color of an instance
	 * @param {number} instanceId - ID of the instance
	 * @param {Color3} [target=new Color3()] - Color object to store the result
	 * @returns {Color3|null} The instance's color or null if invalid
	 */
	getColorAt(instanceId, target = new Color3()) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return null;
		}

		if (!this._colorsTexture) {
			return null;
		}

		const data = this._colorsTexture.image.data;
		const offset = instanceId * 4;

		target.setRGB(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
		return target;
	}

	/**
	 * Sets the visibility of an instance
	 * @param {number} instanceId - ID of the instance
	 * @param {boolean} visible - Whether the instance should be visible
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	setVisibleAt(instanceId, visible) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return this;
		}

		const instance = this._instanceInfo[instanceId];
		if (instance.visible === visible) {
			return this;
		}

		instance.visible = visible;
		this._visibilityChanged = true;
		return this;
	}

	/**
	 * Gets the visibility of an instance
	 * @param {number} instanceId - ID of the instance
	 * @returns {boolean} Whether the instance is visible
	 */
	getVisibleAt(instanceId) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return false;
		}

		return this._instanceInfo[instanceId].visible;
	}

	/**
	 * Changes the geometry used by an instance
	 * @param {number} instanceId - ID of the instance
	 * @param {number} geometryId - ID of the geometry to use
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	setGeometryIdAt(instanceId, geometryId) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return this;
		}

		if (!this._validateGeometryId(geometryId)) {
			console.error('BatchedMesh: Invalid geometry ID');
			return this;
		}

		this._instanceInfo[instanceId].geometryId = geometryId;
		return this;
	}

	/**
	 * Gets the geometry ID used by an instance
	 * @param {number} instanceId - ID of the instance
	 * @returns {number} The geometry ID used by the instance, or -1 if invalid
	 */
	getGeometryIdAt(instanceId) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return -1;
		}

		return this._instanceInfo[instanceId].geometryId;
	}

	/**
	 * Gets the bounding sphere for an instance
	 * @param {number} instanceId - ID of the instance
	 * @param {Sphere} target - Sphere to store the result
	 * @returns {Sphere|null} The instance's bounding sphere or null if invalid
	 */
	getBoundingSphereAt(instanceId, target) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return null;
		}

		const geometryId = this._instanceInfo[instanceId].geometryId;
		if (!this._validateGeometryId(geometryId)) {
			console.error('BatchedMesh: Instance references invalid geometry');
			return null;
		}

		const geometry = this._geometryInfo[geometryId];

		// Get instance matrix
		const matrixData = this._matricesTexture.image.data;
		_mat4_1.fromArray(matrixData, instanceId * 16);

		// Transform geometry bounding sphere
		target.copy(geometry.boundingSphere);
		target.center.applyMatrix4(_mat4_1);
		const scale = _mat4_1.getMaxScaleOnAxis();
		target.radius *= scale;

		return target;
	}

	/**
	 * Gets the bounding box for an instance
	 * @param {number} instanceId - ID of the instance
	 * @param {Box3} target - Box to store the result
	 * @returns {Box3|null} The instance's bounding box or null if invalid
	 */
	getBoundingBoxAt(instanceId, target) {
		if (!this._validateInstanceId(instanceId)) {
			console.error('BatchedMesh: Invalid instance ID');
			return null;
		}

		const geometryId = this._instanceInfo[instanceId].geometryId;
		if (!this._validateGeometryId(geometryId)) {
			console.error('BatchedMesh: Instance references invalid geometry');
			return null;
		}

		const geometry = this._geometryInfo[geometryId];

		// Get instance matrix
		const matrixData = this._matricesTexture.image.data;
		_mat4_1.fromArray(matrixData, instanceId * 16);

		// Transform geometry bounding box
		target.copy(geometry.boundingBox).applyMatrix4(_mat4_1);

		return target;
	}

	/**
	 * Changes the maximum instance count
	 * @param {number} count - New maximum instance count
	 */
	setInstanceCount(count) {
		if (count === this._maxInstanceCount) return;

		const availableInstanceIds = this._availableInstanceIds;
		const instanceInfo = this._instanceInfo;
		availableInstanceIds.sort(ascIdSort);
		while (availableInstanceIds[availableInstanceIds.length - 1] === instanceInfo.length) {
			availableInstanceIds.pop();
			instanceInfo.pop();
		}

		if(count < this._instanceInfo.length){
			console.error('BatchedMesh: Cannot reduce instance count');
		}

		const multiDrawCounts = new Uint32Array(count);
		const multiDrawStarts = new Uint32Array(count);
		copyArrayContents(this._multiDrawCounts, multiDrawCounts);
		copyArrayContents(this._multiDrawStarts, multiDrawStarts);

		this._multiDrawCounts = multiDrawCounts;
		this._multiDrawStarts = multiDrawStarts;
		this._maxInstanceCount = count;

		const matricesTexture = this._matricesTexture;
		const indirectTexture = this._indirectTexture;
		const colorsTexture = this._colorsTexture;
		const matricesData = matricesTexture.image.data;
		const indicesData = indirectTexture.image.data;
		const colorsData = colorsTexture ? colorsTexture.image.data : null;

		matricesTexture.dispose();
		this._initMatricesTexture();
		copyArrayContents(matricesData, this._matricesTexture.image.data);

		indirectTexture.dispose();
		this._initIndirectTexture();
		copyArrayContents(indicesData, this._indirectTexture.image.data);

		if(colorsTexture){
			colorsTexture.dispose();
			this._initColorsTexture();
			copyArrayContents(colorsData, this._colorsTexture.image.data);
		}
	}

	/**
	 * Updates the batch for rendering
	 * Performs visibility checks, frustum culling, and sorting if enabled
	 * @param {Camera} camera - Camera used for frustum culling and sorting
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	update(camera) {
		const sortObjects = this.sortObjects;
		const perObjectFrustumCulled = this.perObjectFrustumCulled;
		const visibleChanged = this._visibilityChanged;

		if (!visibleChanged && !sortObjects && !perObjectFrustumCulled) {
			return this;
		}

		const geometry = this.geometry;
		const material = this.material[0];
		const index = geometry.index;
		const bytesPerElement = index === null ? 0 : index.buffer.array.BYTES_PER_ELEMENT;

		const geometryInfo = this._geometryInfo;
		const indirectTexture = this._indirectTexture;
		const indirectData = indirectTexture.image.data;

		// Calculate view frustum for culling
		if(perObjectFrustumCulled) {
			_mat4_1.multiplyMatrices(camera.projectionMatrix, camera.viewMatrix).multiply(this.worldMatrix);
			_frustum.setFromMatrix(_mat4_1);
		}

		let multiDrawCount = 0;
		let multiDrawStarts = this._multiDrawStarts;
		let multiDrawCounts = this._multiDrawCounts;

		if(sortObjects) {
			// Calculate camera position in local space
			_mat4_1.copy(this.worldMatrix).inverse();
			_vec3_1.setFromMatrixPosition(camera.worldMatrix).applyMatrix4(_mat4_1);
			_vec3_2.set(0, 0, -1).transformDirection(camera.worldMatrix).transformDirection(_mat4_1);

			// Collect visible instances
			for(let i = 0; i < this._instanceInfo.length; i++) {
				const instance = this._instanceInfo[i];
				if(!instance?.active || !instance.visible) continue;

				const geometry = geometryInfo[instance.geometryId];
				if(!geometry?.active) continue;

				// Get instance bounding sphere
				this.getBoundingSphereAt(i, _sphere_1);

				// Perform frustum culling
				let isCulled = false;
				if(perObjectFrustumCulled) {
					isCulled = !_frustum.intersectsSphere(_sphere_1);
				}

				if(!isCulled) {
					// Calculate distance to camera
					const z = _vec3_3.subVectors(_sphere_1.center, _vec3_1).dot(_vec3_2);
					_renderList.push({
						instanceId: i,
						z: z,
						start: geometry.drawStart,
						count: geometry.drawCount
					});
				}
			}

			// Sort instances
			_renderList.sort(material.transparent ? sortTransparent : sortOpaque);

			// Update draw data for sorted instances
			for(let i = 0; i < _renderList.length; i++) {
				const item = _renderList[i];
				multiDrawStarts[multiDrawCount] = item.start * bytesPerElement;
				multiDrawCounts[multiDrawCount] = item.count;
				indirectData[multiDrawCount] = item.instanceId;
				multiDrawCount++;
			}

			_renderList.length = 0;
		} else {
			// Handle non-sorted rendering
			for(let i = 0; i < this._instanceInfo.length; i++) {
				const instance = this._instanceInfo[i];
				if(!instance?.active || !instance.visible) continue;

				const geometry = geometryInfo[instance.geometryId];
				if(!geometry?.active) continue;

				let isCulled = false;
				if(perObjectFrustumCulled) {
					this.getBoundingSphereAt(i, _sphere_1);
					isCulled = !_frustum.intersectsSphere(_sphere_1);
				}

				if(!isCulled) {
					multiDrawStarts[multiDrawCount] = geometry.drawStart * bytesPerElement;
					multiDrawCounts[multiDrawCount] = geometry.drawCount;
					indirectData[multiDrawCount] = i;
					multiDrawCount++;
				}
			}

		}

		// Update texture and geometry for rendering
		indirectTexture.version++;
		geometry.groups[0] = {
			multiDrawStarts: multiDrawStarts,
			multiDrawCounts: multiDrawCounts,
			multiDrawCount: multiDrawCount,
			materialIndex: 0
		};

		geometry.version++;

		this._visibilityChanged = false;

		return this;
	}

	/**
	 * Computes the bounding box for the entire batch
	 * Takes into account all visible instances
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	computeBoundingBox() {
		if (!this.boundingBox) {
			this.boundingBox = new Box3();
		}

		const box = this.boundingBox;
		box.makeEmpty();

		const tempBox = new Box3();
		const tempMatrix = new Matrix4();

		for (let i = 0; i < this._instanceInfo.length; i++) {
			const instance = this._instanceInfo[i];
			if (!instance?.active || !instance.visible) continue;

			const geometry = this._geometryInfo[instance.geometryId];
			if (!geometry?.active) continue;

			// Get instance matrix
			const matrixData = this._matricesTexture.image.data;
			tempMatrix.fromArray(matrixData, i * 16);

			// Transform geometry bounding box
			tempBox.copy(geometry.boundingBox).applyMatrix4(tempMatrix);
			box.union(tempBox);
		}

		return this;
	}

	/**
	 * Computes the bounding sphere for the entire batch
	 * Takes into account all visible instances
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */
	computeBoundingSphere() {
		if (!this.boundingSphere) {
			this.boundingSphere = new Sphere();
		}

		this.computeBoundingBox();
		this.boundingBox.getCenter(this.boundingSphere.center);

		// Find the farthest point from the center
		let maxRadiusSq = 0;
		const tempMatrix = new Matrix4();
		const tempVec = new Vector3();

		for (let i = 0; i < this._instanceInfo.length; i++) {
			const instance = this._instanceInfo[i];
			if (!instance?.active || !instance.visible) continue;

			const geometry = this._geometryInfo[instance.geometryId];
			if (!geometry?.active) continue;

			// Get instance matrix
			const matrixData = this._matricesTexture.image.data;
			tempMatrix.fromArray(matrixData, i * 16);

			// Transform bounding sphere
			const radius = geometry.boundingSphere.radius;
			const scale = tempMatrix.getMaxScaleOnAxis();
			const scaledRadius = radius * scale;

			tempVec.copy(geometry.boundingSphere.center).applyMatrix4(tempMatrix);
			const distSq = this.boundingSphere.center.distanceToSquared(tempVec);
			
			maxRadiusSq = Math.max(maxRadiusSq, distSq + scaledRadius * scaledRadius);
		}

		this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
		return this;
	}  

	/**
	 * Optimizes the batch by compacting geometry data
	 * Removes gaps in vertex and index buffers
	 * @returns {BatchedMesh} This BatchedMesh instance
	 */  
	optimize() {
		// Compact geometry data
		let newVertexStart = 0;
		let newIndexStart = 0;

		const hasIndex = !!this.geometry.index;
		const geometryInfo = this._geometryInfo;
		// Sort geometries by vertex start position
		const indices = geometryInfo.map((_, i) => i).sort((a, b) => {
			return geometryInfo[a].vertexStart - geometryInfo[b].vertexStart;
		});

		for (let i = 0; i < this._geometryInfo.length; i++) {
			const index = indices[i];
			const geometry = this._geometryInfo[index];
			if (!geometry?.active) continue;

			// Move index data
			if (hasIndex) {
				const reservedIndexCount = geometry.reservedIndexCount;
				if ( geometry.indexStart !== newIndexStart ) {
					const buffer = this.geometry.index.buffer;
					const indices = this.geometry.index.buffer.array;
					const vertexOffset = newVertexStart - geometry.vertexStart;
					
					for (let j = 0; j < reservedIndexCount; j++) {
						indices[newIndexStart + j] = 
						indices[geometry.indexStart + j] + vertexOffset;
					}

					updateBufferRange(buffer, newIndexStart, reservedIndexCount);

					buffer.version++;

					geometry.indexStart = newIndexStart;
				}

				newIndexStart += reservedIndexCount;
			}

			// Move vertex data
			const reservedVertexCount = geometry.reservedVertexCount;
			if (geometry.vertexStart !== newVertexStart) {
				const attributes = this.geometry.attributes;
				for (const name in attributes) {
					const attribute = attributes[name];
					const buffer = attribute.buffer;
					const itemSize = attribute.buffer.stride;
					const array = buffer.array;
					
					for (let j = 0; j < reservedVertexCount * itemSize; j++) {
						array[newVertexStart * itemSize + j] = 
							array[geometry.vertexStart * itemSize + j];
					}

					updateBufferRange(buffer, newVertexStart * itemSize, reservedVertexCount * itemSize);

					buffer.version++;
				}
				
				geometry.vertexStart = newVertexStart;
			}

			newVertexStart += reservedVertexCount;

			geometry.drawStart = hasIndex ? geometry.indexStart : geometry.vertexStart;
		}

		this._nextVertexStart = newVertexStart;
		this._nextIndexStart = newIndexStart;
		this.geometry.version++;

		this._visibilityChanged = true;

		return this;
	}

	/**
	 * Checks if an instance exists
	 * @param {number} instanceId - ID of the instance
	 * @returns {boolean} True if the instance exists
	 */
	hasInstance(instanceId) {
		return this._validateInstanceId(instanceId);
	}

	/**
	 * Performs raycasting against all instances in the batch
	 * @param {Ray} ray - Ray in world space
	 * @param {Array} intersects - Array to receive intersection results
	 */
	raycast(ray, intersects) {
		if (!this.boundingSphere) {
			this.computeBoundingSphere();
		}
		
		// Test against the batch's bounding sphere first
		_sphere.copy(this.boundingSphere);
		_sphere.applyMatrix4(this.worldMatrix);
		if (!ray.intersectsSphere(_sphere)) {
			return;
		}
		
		const instanceInfo = this._instanceInfo;
		const geometryInfo = this._geometryInfo;
		
		// Get batch world matrix
		const batchWorldMatrix = this.worldMatrix;
		
		// Process each active instance
		for (let instanceId = 0; instanceId < instanceInfo.length; instanceId++) {
			const instance = instanceInfo[instanceId];
			if (!instance?.active || !instance.visible) continue;
			
			const geometryId = instance.geometryId;
			if (!this._validateGeometryId(geometryId)) continue;
			
			const geometry = this._geometryInfo[geometryId];
			
			// Get instance matrix
			this.getMatrixAt(instanceId, _instanceMatrix);
			
			// Create combined world matrix for this instance
			_tempMatrix.multiplyMatrices(batchWorldMatrix, _instanceMatrix);
			
			// Transform bounding sphere to world space
			_sphere.copy(geometry.boundingSphere).applyMatrix4(_tempMatrix);
			
			// Quick rejection test with bounding sphere
			if (!ray.intersectsSphere(_sphere)) continue;
			
			// Transform ray to local space of the instance
			_inverseMatrix.getInverse(_tempMatrix);
			_ray.copy(ray).applyMatrix4(_inverseMatrix);
			
			// Test against bounding box (in local space)
			if (!_ray.intersectsBox(geometry.boundingBox)) continue;
			
			// Check geometry intersections
			const position = this.geometry.getAttribute('a_Position');
			const uv = this.geometry.getAttribute('a_Uv');
			
			if (!position) continue;
			
			// Get material for this instance
			const material = this.material[0];
			let intersection;
			
			const vertexStart = geometry.vertexStart;
			
			// Check for indexed geometry
			if (this.geometry.index) {
				const index = this.geometry.index.buffer.array;
				const indexStart = geometry.indexStart;
				const indexCount = geometry.indexCount;
				
				// Only check indices in this geometry's range
				for (let i = 0; i < indexCount; i += 3) {
					const idx = indexStart + i;
					const a = index[idx] - vertexStart;
					const b = index[idx + 1] - vertexStart;
					const c = index[idx + 2] - vertexStart;
					
					// Get vertex positions (considering morph targets if any)
					getVertexPosition(this, position, vertexStart + a, _vA);
					getVertexPosition(this, position, vertexStart + b, _vB);
					getVertexPosition(this, position, vertexStart + c, _vC);
					
					intersection = checkIntersection(material, ray, _ray, _vA, _vB, _vC, _intersectionPoint, _tempMatrix);
					
					if (intersection) {
						// Add uv coordinates if available
						if (uv) {
							const array = uv.buffer.array;
							const bufferStride = uv.buffer.stride;
							const attributeOffset = uv.offset;
							
							_uvA.fromArray(array, (vertexStart + a) * bufferStride + attributeOffset);
							_uvB.fromArray(array, (vertexStart + b) * bufferStride + attributeOffset);
							_uvC.fromArray(array, (vertexStart + c) * bufferStride + attributeOffset);
							
							intersection.uv = uvIntersection(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC);
						}
						
						// Add face information
						const face = {
							a: a,
							b: b,
							c: c,
							normal: new Vector3(),
							materialIndex: 0
						};
						
						Triangle.normal(_vA, _vB, _vC, face.normal);
						
						intersection.face = face;
						intersection.faceIndex = Math.floor(i / 3);
						intersection.instanceId = instanceId;
						intersection.geometryId = geometryId;
						
						intersects.push(intersection);
					}
				}
			} else {
				// Non-indexed geometry
				const vertexCount = geometry.vertexCount;
				
				for (let i = 0; i < vertexCount; i += 3) {
					const a = i;
					const b = i + 1;
					const c = i + 2;
					
					// Get vertex positions
					getVertexPosition(this, position, vertexStart + a, _vA);
					getVertexPosition(this, position, vertexStart + b, _vB);
					getVertexPosition(this, position, vertexStart + c, _vC);
					
					intersection = checkIntersection(material, ray, _ray, _vA, _vB, _vC, _intersectionPoint, _tempMatrix);
					
					if (intersection) {
						// Add uv coordinates if available
						if (uv) {
							const array = uv.buffer.array;
							const bufferStride = uv.buffer.stride;
							const attributeOffset = uv.offset;
							
							_uvA.fromArray(array, (vertexStart + a) * bufferStride + attributeOffset);
							_uvB.fromArray(array, (vertexStart + b) * bufferStride + attributeOffset);
							_uvC.fromArray(array, (vertexStart + c) * bufferStride + attributeOffset);
							
							intersection.uv = uvIntersection(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC);
						}
						
						// Add face information
						const face = {
							a: a,
							b: b,
							c: c,
							normal: new Vector3(),
							materialIndex: 0
						};
						
						Triangle.normal(_vA, _vB, _vC, face.normal);
						
						intersection.face = face;
						intersection.faceIndex = Math.floor(i / 3);
						intersection.instanceId = instanceId;
						intersection.geometryId = geometryId;
						
						intersects.push(intersection);
					}
				}
			}
		}
	}

}

/**
 * Gets vertex position from attribute
 * @private
 * @param {BatchedMesh} mesh - The BatchedMesh
 * @param {Attribute} position - Position attribute
 * @param {number} index - Vertex index
 * @param {Vector3} target - Target vector
 * @returns {Vector3} Target vector
 */
function getVertexPosition(mesh, position, index, target) {
    target.fromArray(position.buffer.array, index * position.buffer.stride + position.offset);
    
    // TODO: Handle morph targets if needed
    
    return target;
}

/**
 * Calculates UV coordinates for intersection point
 * @private
 * @param {Vector3} point - Intersection point
 * @param {Vector3} p1 - Vertex 1 position
 * @param {Vector3} p2 - Vertex 2 position
 * @param {Vector3} p3 - Vertex 3 position
 * @param {Vector2} uv1 - Vertex 1 UV
 * @param {Vector2} uv2 - Vertex 2 UV
 * @param {Vector2} uv3 - Vertex 3 UV
 * @returns {Vector2} Interpolated UV coordinates
 */
function uvIntersection(point, p1, p2, p3, uv1, uv2, uv3) {
	Triangle.barycoordFromPoint(point, p1, p2, p3, _barycoord);
	
	const uvResult = new Vector2();
	
	// Manually calculate weighted sum instead of using addScaledVector
	uvResult.x = uv1.x * _barycoord.x + uv2.x * _barycoord.y + uv3.x * _barycoord.z;
	uvResult.y = uv1.y * _barycoord.x + uv2.y * _barycoord.y + uv3.y * _barycoord.z;
	
	return uvResult;
}

/**
 * Checks for intersection between a ray and a triangle
 * @private
 * @param {Material} material - Material determining draw side
 * @param {Ray} ray - Original ray in world space
 * @param {Ray} localRay - Ray in local space
 * @param {Vector3} pA - Vertex 1 position
 * @param {Vector3} pB - Vertex 2 position
 * @param {Vector3} pC - Vertex 3 position
 * @param {Vector3} point - Target vector for intersection point
 * @param {Matrix4} instanceMatrix - Instance's world matrix
 * @returns {Object|null} Intersection data or null
 */
function checkIntersection(material, ray, localRay, pA, pB, pC, point, instanceMatrix) {
    let intersect;
    
    if (material.side === DRAW_SIDE.BACK) {
        intersect = localRay.intersectTriangle(pC, pB, pA, true, point);
    } else {
        intersect = localRay.intersectTriangle(pA, pB, pC, material.side !== DRAW_SIDE.DOUBLE, point);
    }
    
    if (intersect === null) return null;
    
    _intersectionPointWorld.copy(point);
    _intersectionPointWorld.applyMatrix4(instanceMatrix);
    
    const distance = ray.origin.distanceTo(_intersectionPointWorld);
    
    return {
        distance: distance,
        point: _intersectionPointWorld.clone()
    };
}

export { BatchedMesh };