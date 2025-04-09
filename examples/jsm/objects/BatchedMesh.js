import { Mesh, Geometry, Attribute, Buffer, Box3, Sphere, Matrix4, Texture2D, PIXEL_FORMAT, PIXEL_TYPE, TEXTURE_FILTER, Frustum, Vector3, Color4, MathUtils } from 't3d';

/**
 * A special version of a mesh with multi draw batch rendering support. Use
 * this class if you have to render a large number of objects with the same
 * material but with different geometries or world transformations. The usage of
 * `BatchedMesh` will help you to reduce the number of draw calls and thus improve the overall
 * rendering performance in your application.
 * reference: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/objects/BatchedMesh.js
 * @extends Mesh
 */
class BatchedMesh extends Mesh {

	/**
	 * Constructs a new batched mesh.
	 * @param {number} maxInstanceCount - The maximum number of individual instances planned to be added and rendered.
	 * @param {number} maxVertexCount - The maximum number of vertices to be used by all unique geometries.
	 * @param {number} maxIndexCount - The maximum number of indices to be used by all unique geometries.
	 * @param {Material} material - The mesh material.
	 */
	constructor(maxInstanceCount, maxVertexCount, maxIndexCount, material) {
		super(new Geometry(), [material]);

		/**
		 * When set to `true`, the individual objects of a batch are frustum culled.
		 * @type {boolean}
		 * @default true
		 */
		this.perObjectFrustumCulled = true;

		/**
		 * When set to `true`, the individual objects of a batch are sorted to improve overdraw-related artifacts.
		 * If the material is marked as "transparent" objects are rendered back to front and if not then they are
		 * rendered front to back.
		 * @type {boolean}
		 * @default true
		 */
		this.sortObjects = true;

		/**
		 * The bounding box of the batched mesh. Can be computed via {@link BatchedMesh#computeBoundingBox}.
		 * @type {Box3}
		 * @default Box3()
		 */
		this.boundingBox = new Box3();

		/**
		 * The bounding sphere of the batched mesh. Can be computed via {@link BatchedMesh#computeBoundingSphere}.
		 * @type {Sphere}
		 * @default Sphere()
		 */
		this.boundingSphere = new Sphere();

		/**
		 * Takes a sort a function that is run before render. The function takes a list of instances to
		 * sort and a camera. The objects in the list include a "z" field to perform a depth-ordered
		 * sort with.
		 * @type {Function|null}
		 * @default null
		 */
		this.customSort = null;

		// stores visible, active, and geometry id per instance and reserved buffer ranges for geometries
		this._instanceInfo = [];
		this._geometryInfo = [];

		// instance, geometry ids that have been set as inactive, and are available to be overwritten
		this._availableInstanceIds = [];
		this._availableGeometryIds = [];

		// used to track where the next point is that geometry should be inserted
		this._nextIndexStart = 0;
		this._nextVertexStart = 0;

		// flags
		this._visibilityChanged = true;
		this._geometryInitialized = false;

		// cached user options
		this._maxInstanceCount = maxInstanceCount;
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		// init geometry
		this.geometry.groups = [{
			multiDrawStarts: new Int32Array(maxInstanceCount),
			multiDrawCounts: new Int32Array(maxInstanceCount),
			multiDrawCount: 0,
			materialIndex: 0
		}];

		// init material
		material.uniforms.batchingTexture = new BatchingTexture(maxInstanceCount);
		material.uniforms.batchingIdTexture = new BatchingIdTexture(maxInstanceCount);
	}

	/**
	 * The maximum number of individual instances that can be stored in the batch.
	 * @type {number}
	 * @readonly
	 */
	get maxInstanceCount() {
		return this._maxInstanceCount;
	}

	/**
	 * The instance count.
	 * @type {number}
	 * @readonly
	 */
	get instanceCount() {
		return this._instanceInfo.length - this._availableInstanceIds.length;
	}

	/**
	 * The number of unused vertices.
	 * @type {number}
	 * @readonly
	 */
	get unusedVertexCount() {
		return this._maxVertexCount - this._nextVertexStart;
	}

	/**
	 * The number of unused indices.
	 * @type {number}
	 * @readonly
	 */
	get unusedIndexCount() {
		return this._maxIndexCount - this._nextIndexStart;
	}

	/**
	 * Adds the given geometry to the batch and returns the associated
	 * geometry id referring to it to be used in other functions.
	 * @param {Geometry} geometry - The geometry to add.
	 * @param {number} [reservedVertexCount=-1] - Optional parameter specifying the amount of
	 * vertex buffer space to reserve for the added geometry. This is necessary if it is planned
	 * to set a new geometry at this index at a later time that is larger than the original geometry.
	 * Defaults to the length of the given geometry vertex buffer.
	 * @param {number} [reservedIndexCount=-1] - Optional parameter specifying the amount of index
	 * buffer space to reserve for the added geometry. This is necessary if it is planned to set a
	 * new geometry at this index at a later time that is larger than the original geometry. Defaults to
	 * the length of the given geometry index buffer.
	 * @returns {number} The geometry ID, or -1 on failure.
	 */
	addGeometry(geometry, reservedVertexCount = -1, reservedIndexCount = -1) {
		this._initializeGeometry(geometry);

		if (!this._validateGeometry(geometry)) {
			return -1;
		}

		reservedVertexCount = reservedVertexCount === -1 ? geometry.attributes.a_Position.buffer.count : reservedVertexCount;
		reservedIndexCount = reservedIndexCount === -1 ? (geometry.index ? geometry.index.buffer.count : 0) : reservedIndexCount;

		// validate space
		if (this._nextVertexStart + reservedVertexCount > this._maxVertexCount ||
			this._nextIndexStart + reservedIndexCount > this._maxIndexCount) {
			console.error('BatchedMesh: Reserved space request exceeds the maximum buffer size.');
			return -1;
		}

		const hasIndex = !!this.geometry.index;

		// setup geometry info
		const geometryInfo = {
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

		let geometryId;
		if (this._availableGeometryIds.length > 0) {
			// this._availableGeometryIds.sort(ascIdSort);
			geometryId = this._availableGeometryIds.shift();
			this._geometryInfo[geometryId] = geometryInfo;
		} else {
			geometryId = this._geometryInfo.length;
			this._geometryInfo.push(geometryInfo);
		}

		this._copyGeometryData(geometry, geometryId);

		// update offsets
		this._nextVertexStart += reservedVertexCount;
		this._nextIndexStart += reservedIndexCount;

		return geometryId;
	}

	/**
	 * Deletes the geometry defined by the given ID from this batch. Any instances referencing
	 * this geometry will also be removed as a side effect.
	 * @param {number} geometryId - The ID of the geomtry to remove from the batch.
	 * @returns {BatchedMesh} A reference to this batched mesh.
	 */
	deleteGeometry(geometryId) {
		if (!this._validateGeometryId(geometryId)) {
			return this;
		}

		this._geometryInfo[geometryId].active = false;

		for (let i = 0; i < this._instanceInfo.length; i++) {
			const instanceInfo = this._instanceInfo[i];
			if (instanceInfo && instanceInfo.geometryId === geometryId) {
				this.deleteInstance(i);
			}
		}

		this._availableGeometryIds.push(geometryId);

		this._visibilityChanged = true;

		return this;
	}

	/**
	 * Replaces the geometry at the given ID with the provided geometry. Throws an error if there
	 * is not enough space reserved for geometry. Calling this will change all instances that are
	 * rendering that geometry.
	 * @param {number} geometryId - The ID of the geomtry that should be replaced with the given geometry.
	 * @param {Geometry} geometry - The new geometry.
	 * @returns {number} The geometry ID, or -1 on failure.
	 */
	setGeometryAt(geometryId, geometry) {
		if (!this._geometryInfo[geometryId]) {
			console.error('BatchedMesh: Maximum geometry count reached.');
			return -1;
		}

		if (!this._validateGeometry(geometry)) {
			return -1;
		}

		const batchGeometry = this.geometry;
		const hasIndex = !!batchGeometry.index;
		const srcIndex = geometry.index;
		const geometryInfo = this._geometryInfo[geometryId];
		const srcVertexCount = geometry.attributes.a_Position.buffer.count;
		const srcIndexCount = hasIndex ? srcIndex.buffer.count : -1;
		if (
			hasIndex &&
			srcIndexCount > geometryInfo.reservedIndexCount ||
			srcVertexCount > geometryInfo.reservedVertexCount
		) {
			console.error('BatchedMesh: Reserved space not large enough for provided geometry.');
			return -1;
		}

		// update geometry info
		geometryInfo.vertexCount = srcVertexCount;
		geometryInfo.indexCount = srcIndexCount;

		this._copyGeometryData(geometry, geometryId);

		this._visibilityChanged = true;

		return geometryId;
	}

	/**
	 * Get the range representing the subset of triangles related to the attached geometry,
	 * indicating the starting offset and count, or `null` if invalid.
	 * @param {number} geometryId - The id of the geometry to get the range of.
	 * @param {object} [target] - The target object that is used to store the method's result.
	 * @returns {{
	 * 	vertexStart:number,vertexCount:number,reservedVertexCount:number,
	 * 	indexStart:number,indexCount:number,reservedIndexCount:number,
	 * 	drawStart:number,drawCount:number
	 * }|null} The result object with range data.
	 */
	getGeometryRangeAt(geometryId, target = {}) {
		if (!this._validateGeometryId(geometryId)) {
			return null;
		}

		const geometryInfo = this._geometryInfo[geometryId];

		target.vertexStart = geometryInfo.vertexStart;
		target.vertexCount = geometryInfo.vertexCount;
		target.reservedVertexCount = geometryInfo.reservedVertexCount;
		target.indexStart = geometryInfo.indexStart;
		target.indexCount = geometryInfo.indexCount;
		target.reservedIndexCount = geometryInfo.reservedIndexCount;
		target.drawStart = geometryInfo.drawStart;
		target.drawCount = geometryInfo.drawCount;

		return target;
	}

	/**
	 * Adds a new instance to the batch using the geometry of the given ID and returns
	 * a new id referring to the new instance to be used by other functions.
	 * @param {number} geometryId - The ID of a previously added geometry via {@link BatchedMesh#addGeometry}.
	 * @returns {number} The instance ID, or -1 on failure.
	 */
	addInstance(geometryId) {
		if (!this._validateGeometryId(geometryId)) {
			return -1;
		}

		const availableInstanceIds = this._availableInstanceIds;

		// If instance count exceeds max instance count, return error
		if ((this._instanceInfo.length >= this._maxInstanceCount) && availableInstanceIds.length === 0) {
			console.error('BatchedMesh: Maximum item count reached.');
			return -1;
		}

		const instanceInfo = {
			geometryId: geometryId,
			visible: true,
			active: true
		};

		let instanceId;
		if (availableInstanceIds.length > 0) {
			// availableInstanceIds.sort(ascIdSort);
			instanceId = availableInstanceIds.shift();
			this._instanceInfo[instanceId] = instanceInfo;
		} else {
			instanceId = this._instanceInfo.length;
			this._instanceInfo.push(instanceInfo);
		}

		const batchingTexture = this.material[0].uniforms.batchingTexture;
		batchingTexture.setInstanceData(instanceId, _mat4_1.identity());

		const batchingColorTexture = this.material[0].uniforms.batchingColorTexture;
		if (batchingColorTexture) {
			batchingColorTexture.setInstanceData(instanceId, _whiteColor);
		}

		this._visibilityChanged = true;

		return instanceId;
	}

	/**
	 * Deletes an existing instance from the batch using the given ID.
	 * @param {number} instanceId - The ID of the instance to remove from the batch.
	 * @returns {BatchedMesh} A reference to this batched mesh.
	 */
	deleteInstance(instanceId) {
		if (!this._validateInstanceId(instanceId)) {
			return this;
		}

		this._instanceInfo[instanceId].active = false;
		this._availableInstanceIds.push(instanceId);
		this._visibilityChanged = true;

		return this;
	}

	/**
	 * Sets the given local transformation matrix to the defined instance.
	 * Negatively scaled matrices are not supported.
	 * @param {number} instanceId - The ID of an instance to set the matrix of.
	 * @param {Matrix4} matrix - A 4x4 matrix representing the local transformation of a single instance.
	 * @returns {BatchedMesh} A reference to this batched mesh.
	 */
	setMatrixAt(instanceId, matrix) {
		if (!this._validateInstanceId(instanceId)) {
			return this;
		}

		const batchingTexture = this.material[0].uniforms.batchingTexture;
		batchingTexture.setInstanceData(instanceId, matrix);

		return this;
	}

	/**
	 * Returns the local transformation matrix of the defined instance.
	 * @param {number} instanceId - The ID of an instance to get the matrix of.
	 * @param {Matrix4} matrix - The target object that is used to store the method's result.
	 * @returns {Matrix4|null} The instance's local transformation matrix.
	 */
	getMatrixAt(instanceId, matrix) {
		if (!this._validateInstanceId(instanceId)) {
			return null;
		}

		const batchingTexture = this.material[0].uniforms.batchingTexture;
		batchingTexture.getInstanceData(instanceId, matrix);

		return matrix;
	}

	/**
	 * Sets the given color to the defined instance.
	 * @param {number} instanceId - The ID of an instance to set the color of.
	 * @param {Color3|Color4} color - The color to set the instance to.
	 * @returns {BatchedMesh} A reference to this batched mesh.
	 */
	setColorAt(instanceId, color) {
		if (!this._validateInstanceId(instanceId)) {
			return this;
		}

		let batchingColorTexture = this.material[0].uniforms.batchingColorTexture;

		if (!batchingColorTexture) {
			batchingColorTexture = new BatchingColorTexture(this._maxInstanceCount);
			this.material[0].uniforms.batchingColorTexture = batchingColorTexture;
			this.material[0].defines.USE_BATCHING_COLOR = true;
			this.material[0].needsUpdate = true;
		}

		batchingColorTexture.setInstanceData(instanceId, color);

		return this;
	}

	/**
	 * Returns the color of the defined instance.
	 * @param {number} instanceId - The ID of an instance to get the color of.
	 * @param {Color3|Color4} color - The target object that is used to store the method's result.
	 * @returns {Color3|Color4|null} The instance's color.
	 */
	getColorAt(instanceId, color) {
		if (!this._validateInstanceId(instanceId)) {
			return null;
		}

		const batchingColorTexture = this.material[0].uniforms.batchingColorTexture;
		if (!batchingColorTexture) {
			return null;
		}

		batchingColorTexture.getInstanceData(instanceId, color);

		return color;
	}

	/**
	 * Sets the visibility of the instance.
	 * @param {number} instanceId - The id of the instance to set the visibility of.
	 * @param {boolean} visible - Whether the instance is visible or not.
	 * @returns {BatchedMesh} A reference to this batched mesh.
	 */
	setVisibleAt(instanceId, visible) {
		if (!this._validateInstanceId(instanceId)) {
			return this;
		}

		const instanceInfo = this._instanceInfo[instanceId];
		if (instanceInfo.visible === visible) {
			return this;
		}

		instanceInfo.visible = visible;
		this._visibilityChanged = true;

		return this;
	}

	/**
	 * Returns the visibility state of the defined instance.
	 * @param {number} instanceId - The ID of an instance to get the visibility state of.
	 * @returns {boolean} Whether the instance is visible or not.
	 */
	getVisibleAt(instanceId) {
		if (!this._validateInstanceId(instanceId)) {
			return false;
		}

		return this._instanceInfo[instanceId].visible;
	}

	/**
	 * Sets the geometry ID of the instance at the given index.
	 * @param {number} instanceId - The ID of the instance to set the geometry ID of.
	 * @param {number} geometryId - The geometry ID to be use by the instance.
	 * @returns {BatchedMesh} A reference to this batched mesh.
	 */
	setGeometryIdAt(instanceId, geometryId) {
		if (!this._validateInstanceId(instanceId)) {
			return this;
		}

		if (!this._validateGeometryId(geometryId)) {
			return this;
		}

		this._instanceInfo[instanceId].geometryId = geometryId;

		return this;
	}

	/**
	 * Returns the geometry ID of the defined instance.
	 * @param {number} instanceId - The ID of an instance to get the geometry ID of.
	 * @returns {number} The instance's geometry ID, or -1 if invalid.
	 */
	getGeometryIdAt(instanceId) {
		if (!this._validateInstanceId(instanceId)) {
			return -1;
		}

		return this._instanceInfo[instanceId].geometryId;
	}

	/**
	 * Returns the bounding box of the instance at the given index.
	 * @param {number} instanceId - The ID of the instance to return the bounding box for.
	 * @param {Box3} target - The target object that is used to store the method's result.
	 * @returns {Box3|null} The instance's bounding box. Returns `null` if no geometry has been found for the given ID.
	 */
	getBoundingBoxAt(instanceId, target) {
		if (!this._validateInstanceId(instanceId)) {
			return null;
		}

		const geometryId = this._instanceInfo[instanceId].geometryId;

		if (!this._validateGeometryId(geometryId)) {
			return null;
		}

		const geometryInfo = this._geometryInfo[geometryId];

		const batchingTexture = this.material[0].uniforms.batchingTexture;
		batchingTexture.getInstanceData(instanceId, _mat4_1);

		return target.copy(geometryInfo.boundingBox).applyMatrix4(_mat4_1);
	}

	/**
	 * Returns the bounding sphere of the instance at the given index.
	 * @param {number} instanceId - The ID of the instance to return the bounding sphere for.
	 * @param {Sphere} target - The target object that is used to store the method's result.
	 * @returns {Sphere|null} The instance's bounding sphere. Returns `null` if no geometry has been found for the given ID.
	 */
	getBoundingSphereAt(instanceId, target) {
		if (!this._validateInstanceId(instanceId)) {
			return null;
		}

		const geometryId = this._instanceInfo[instanceId].geometryId;

		if (!this._validateGeometryId(geometryId)) {
			return null;
		}

		const geometryInfo = this._geometryInfo[geometryId];

		const batchingTexture = this.material[0].uniforms.batchingTexture;
		batchingTexture.getInstanceData(instanceId, _mat4_1);

		return target.copy(geometryInfo.boundingSphere).applyMatrix4(_mat4_1);
	}

	/**
	 * Resizes the available space in the batch's vertex and index buffer attributes to the provided sizes.
	 * If the provided arguments shrink the geometry buffers but there is not enough unused space at the
	 * end of the geometry attributes then an error is thrown.
	 * @param {number} maxVertexCount - The maximum number of vertices to be used by all unique geometries to resize to.
	 * @param {number} maxIndexCount - The maximum number of indices to be used by all unique geometries to resize to.
	 */
	setGeometrySize(maxVertexCount, maxIndexCount) {
		if (maxVertexCount < this._nextVertexStart || maxIndexCount < this._nextIndexStart) {
			console.error('BatchedMesh: New size is too small for existing geometry.');
			return;
		}

		// dispose of the previous geometry
		const oldGeometry = this.geometry;
		oldGeometry.dispose();

		// recreate the geometry needed based on the previous variant
		this._maxVertexCount = maxVertexCount;
		this._maxIndexCount = maxIndexCount;

		if (this._geometryInitialized) {
			this._geometryInitialized = false;
			this.geometry = new Geometry();
			this.geometry.groups = oldGeometry.groups;
			this._initializeGeometry(oldGeometry);
		}

		// copy data from the previous geometry
		const geometry = this.geometry;
		if (oldGeometry.index) {
			copyArrayContents(oldGeometry.index.buffer.array, geometry.index.buffer.array);
		}

		for (const name in oldGeometry.attributes) {
			copyArrayContents(oldGeometry.attributes[name].buffer.array, geometry.attributes[name].buffer.array);
		}
	}

	/**
	 * Resizes the necessary buffers to support the provided number of instances.
	 * If the provided arguments shrink the number of instances but there are not enough
	 * unused Ids at the end of the list then an error is thrown.
	 * @param {number} maxInstanceCount - The max number of individual instances that can be added and rendered by the batch.
	 */
	setInstanceCount(maxInstanceCount) {
		if (maxInstanceCount === this._maxInstanceCount) {
			return;
		}

		// shrink the available instances as much as possible
		const availableInstanceIds = this._availableInstanceIds;
		const instanceInfo = this._instanceInfo;
		availableInstanceIds.sort(ascIdSort);
		while (availableInstanceIds[availableInstanceIds.length - 1] === instanceInfo.length) {
			instanceInfo.pop();
			availableInstanceIds.pop();
		}

		if (maxInstanceCount < instanceInfo.length) {
			console.error(`BatchedMesh: Instance ids outside the range ${maxInstanceCount} are being used. Cannot shrink instance count.`);
			return;
		}

		// copy the multi draw counts
		const multiDrawCounts = new Int32Array(maxInstanceCount);
		const multiDrawStarts = new Int32Array(maxInstanceCount);
		const geometryGroup = this.geometry.groups[0];
		copyArrayContents(geometryGroup.multiDrawCounts, multiDrawCounts);
		copyArrayContents(geometryGroup.multiDrawStarts, multiDrawStarts);

		geometryGroup.multiDrawCounts = multiDrawCounts;
		geometryGroup.multiDrawStarts = multiDrawStarts;

		this._maxInstanceCount = maxInstanceCount;

		const batchingTexture = this.material[0].uniforms.batchingTexture;
		const batchingData = batchingTexture.image.data;
		batchingTexture.setInstanceCount(maxInstanceCount);
		copyArrayContents(batchingData, batchingTexture.image.data);
		batchingTexture.version++;

		const batchingIdTexture = this.material[0].uniforms.batchingIdTexture;
		const batchingIdData = batchingIdTexture.image.data;
		batchingIdTexture.setInstanceCount(maxInstanceCount);
		copyArrayContents(batchingIdData, batchingIdTexture.image.data);
		batchingIdTexture.version++;

		const batchingColorTexture = this.material[0].uniforms.batchingColorTexture;
		if (batchingColorTexture) {
			const batchingColorData = batchingColorTexture.image.data;
			batchingColorTexture.setInstanceCount(maxInstanceCount);
			copyArrayContents(batchingColorData, batchingColorTexture.image.data);
			batchingColorTexture.version++;
		}
	}

	/**
	 * Disposes of the batched mesh and its associated resources.
	 */
	dispose() {
		this.geometry.dispose();

		const material = this.material[0];

		material.uniforms.batchingTexture.dispose();
		material.uniforms.batchingIdTexture.dispose();

		if (material.uniforms.batchingColorTexture) {
			material.uniforms.batchingColorTexture.dispose();
		}
	}

	/**
	 * Updates the batch for rendering
	 * Performs visibility checks, frustum culling, and sorting if enabled
	 * @param {Camera} camera - Camera used for frustum culling and sorting
	 */
	update(camera) {
		const sortObjects = this.sortObjects;
		const perObjectFrustumCulled = this.perObjectFrustumCulled;
		const visibleChanged = this._visibilityChanged;

		// if visibility has not changed and frustum culling and object sorting is not required
		// then skip iterating over all items
		if (!visibleChanged && !sortObjects && !perObjectFrustumCulled) {
			return;
		}

		const geometry = this.geometry;
		const material = this.material[0];

		const index = geometry.index;
		const bytesPerElement = index === null ? 1 : index.buffer.array.BYTES_PER_ELEMENT;

		const instanceInfo = this._instanceInfo;
		const geometryInfo = this._geometryInfo;
		const batchingIdTexture = material.uniforms.batchingIdTexture;
		const indirectData = batchingIdTexture.image.data;

		// prepare the frustum in the local frame
		if (perObjectFrustumCulled) {
			_mat4_1.multiplyMatrices(camera.projectionMatrix, camera.viewMatrix).multiply(this.worldMatrix);
			_frustum.setFromMatrix(_mat4_1);
		}

		let multiDrawCount = 0;

		const { multiDrawStarts, multiDrawCounts } = geometry.groups[0];

		if (sortObjects) {
			// get the camera position in the local frame
			_mat4_1.copy(this.worldMatrix).inverse();
			_vec3_1.setFromMatrixPosition(camera.worldMatrix).applyMatrix4(_mat4_1);
			_vec3_2.set(0, 0, -1).transformDirection(camera.worldMatrix).transformDirection(_mat4_1);

			for (let i = 0, l = instanceInfo.length; i < l; i++) {
				if (!instanceInfo[i].active || !instanceInfo[i].visible) continue;

				this.getBoundingSphereAt(i, _sphere_1);

				// determine whether the batched geometry is within the frustum
				let culled = false;
				if (perObjectFrustumCulled) {
					culled = !_frustum.intersectsSphere(_sphere_1);
				}

				if (!culled) {
					// get the distance from camera used for sorting
					const z = _vec3_3.subVectors(_sphere_1.center, _vec3_1).dot(_vec3_2);
					const { drawStart, drawCount } = geometryInfo[instanceInfo[i].geometryId];
					_renderList.push(drawStart, drawCount, z, i);
				}
			}

			// sort the draw ranges and prep for rendering
			const list = _renderList.list;
			const customSort = this.customSort;
			if (customSort) {
				customSort.call(this, list, camera);
			} else {
				list.sort(material.transparent ? sortTransparent : sortOpaque);
			}

			for (let i = 0; i < list.length; i++) {
				const item = list[i];
				multiDrawStarts[multiDrawCount] = item.start * bytesPerElement;
				multiDrawCounts[multiDrawCount] = item.count;
				indirectData[multiDrawCount] = item.index;
				multiDrawCount++;
			}

			_renderList.reset();
		} else {
			for (let i = 0, l = instanceInfo.length; i < l; i++) {
				if (!instanceInfo[i].active || !instanceInfo[i].visible) continue;

				let culled = false;
				if (perObjectFrustumCulled) {
					this.getBoundingSphereAt(i, _sphere_1);
					culled = !_frustum.intersectsSphere(_sphere_1);
				}

				if (!culled) {
					const { drawStart, drawCount } = geometryInfo[instanceInfo[i].geometryId];
					multiDrawStarts[multiDrawCount] = drawStart * bytesPerElement;
					multiDrawCounts[multiDrawCount] = drawCount;
					indirectData[multiDrawCount] = i;
					multiDrawCount++;
				}
			}
		}

		batchingIdTexture.version++;
		this._visibilityChanged = false;

		geometry.groups[0].multiDrawCount = multiDrawCount;
	}

	/**
	 * Takes a sort a function that is run before render. The function takes a list of instances to
	 * sort and a camera. The objects in the list include a "z" field to perform a depth-ordered sort with.
	 * @param {Function} func - The custom sort function.
	 * @returns {BatchedMesh} A reference to this batched mesh.
	 */
	setCustomSort(func) {
		this.customSort = func;
		return this;
	}

	/**
	 * Repacks the sub geometries in [name] to remove any unused space remaining from
	 * previously deleted geometry, freeing up space to add new geometry.
	 * @returns {BatchedMesh} A reference to this batched mesh.
	 */
	optimize() {
		// track the next indices to copy data to
		let nextVertexStart = 0;
		let nextIndexStart = 0;

		// Iterate over all geometry ranges in order sorted from earliest in the geometry buffer to latest
		// in the geometry buffer. Because draw range objects can be reused there is no guarantee of their order.
		const geometryInfo = this._geometryInfo;
		const indices = geometryInfo.map((_, i) => i).sort((a, b) => {
			return geometryInfo[a].vertexStart - geometryInfo[b].vertexStart;
		});

		const geometry = this.geometry;
		const hasIndex = !!geometry.index;

		for (let i = 0; i < this._geometryInfo.length; i++) {
			const index = indices[i];
			const geometryInfo = this._geometryInfo[index];
			if (!geometryInfo || !geometryInfo.active) {
				continue;
			}

			// if a geometry contains an index buffer then shift it, as well
			if (hasIndex) {
				if (geometryInfo.indexStart !== nextIndexStart) {
					const { indexStart, vertexStart, reservedIndexCount } = geometryInfo;
					const array = geometry.index.buffer.array;

					// shift the index pointers based on how the vertex data will shift
					// adjusting the index must happen first so the original vertex start value is available
					const elementDelta = nextVertexStart - vertexStart;
					for (let j = 0; j < reservedIndexCount; j++) {
						array[nextIndexStart + j] = array[indexStart + j] + elementDelta;
					}

					updateBufferRange(geometry.index.buffer, nextIndexStart, reservedIndexCount);

					geometryInfo.indexStart = nextIndexStart;
				}

				nextIndexStart += geometryInfo.reservedIndexCount;
			}

			// if a geometry needs to be moved then copy attribute data to overwrite unused space
			if (geometryInfo.vertexStart !== nextVertexStart) {
				const { vertexStart, reservedVertexCount } = geometryInfo;
				const attributes = geometry.attributes;
				for (const name in attributes) {
					const attribute = attributes[name];
					const itemSize = attribute.size;
					const array = attribute.buffer.array;

					for (let j = 0; j < reservedVertexCount * itemSize; j++) {
						array[nextVertexStart * itemSize + j] = array[vertexStart * itemSize + j];
					}

					updateBufferRange(attribute.buffer, nextVertexStart * itemSize, reservedVertexCount * itemSize);
				}

				geometryInfo.vertexStart = nextVertexStart;
			}

			nextVertexStart += geometryInfo.reservedVertexCount;
			geometryInfo.drawStart = hasIndex ? geometryInfo.indexStart : geometryInfo.vertexStart;
		}

		this._nextVertexStart = nextVertexStart;
		this._nextIndexStart = nextIndexStart;

		this._visibilityChanged = true;

		return this;
	}

	/**
	 * Computes the bounding box, updating {@link BatchedMesh#boundingBox}.
	 * Bounding boxes aren't computed by default. They need to be explicitly computed,
	 * otherwise they are empty.
	 */
	computeBoundingBox() {
		const boundingBox = this.boundingBox;
		const instanceInfo = this._instanceInfo;

		boundingBox.makeEmpty();
		for (let i = 0, l = instanceInfo.length; i < l; i++) {
			if (!instanceInfo[i].active) continue;

			this.getBoundingBoxAt(i, _box3_1);

			boundingBox.union(_box3_1);
		}
	}

	/**
	 * Computes the bounding sphere, updating {@link BatchedMesh#boundingSphere}.
	 * Bounding spheres aren't computed by default. They need to be explicitly computed,
	 * otherwise they are empty.
	 */
	computeBoundingSphere() {
		const boundingSphere = this.boundingSphere;
		const instanceInfo = this._instanceInfo;

		boundingSphere.makeEmpty();
		for (let i = 0, l = instanceInfo.length; i < l; i++) {
			if (!instanceInfo[i].active) continue;

			this.getBoundingSphereAt(i, _sphere_1);

			boundingSphere.union(_sphere_1);
		}
	}

	raycast(ray, intersects) {
		const instanceInfo = this._instanceInfo;
		const geometryInfoList = this._geometryInfo;
		const wolrdMatrix = this.worldMatrix;
		const batchGeometry = this.geometry;

		// iterate over each instance
		_mesh.material = this.material;
		_mesh.geometry.index = batchGeometry.index;
		_mesh.geometry.attributes = batchGeometry.attributes;

		for (let i = 0, il = instanceInfo.length; i < il; i++) {
			if (!instanceInfo[i].active || !instanceInfo[i].visible) continue;

			const geometryInfo = geometryInfoList[instanceInfo[i].geometryId];
			_mesh.geometry.groups[0].start = geometryInfo.drawStart;
			_mesh.geometry.groups[0].count = geometryInfo.drawCount;

			this.getMatrixAt(i, _mesh.worldMatrix).premultiply(wolrdMatrix);
			_mesh.geometry.boundingBox.copy(geometryInfo.boundingBox);
			_mesh.geometry.boundingSphere.copy(geometryInfo.boundingSphere);
			_mesh.raycast(ray, _batchIntersects);

			// add batch id to the intersects
			for (let j = 0, jl = _batchIntersects.length; j < jl; j++) {
				const intersect = _batchIntersects[j];
				intersect.object = this;
				intersect.batchId = i;
				intersects.push(intersect);
			}

			_batchIntersects.length = 0;
		}

		_mesh.material = null;
		_mesh.geometry.index = null;
		_mesh.geometry.attributes = {};
		_mesh.geometry.groups[0].start = 0;
		_mesh.geometry.groups[0].count = Infinity;
	}

	// Initializes the geometry based on an input geometry
	_initializeGeometry(reference) {
		if (this._geometryInitialized) return;

		const geometry = this.geometry;
		const maxVertexCount = this._maxVertexCount;
		const maxIndexCount = this._maxIndexCount;

		for (const attributeName in reference.attributes) {
			const srcAttribute = reference.getAttribute(attributeName);

			const { size, normalized, buffer } = srcAttribute;
			const { array } = buffer;

			const dstArray = new array.constructor(maxVertexCount * size); // splite shared buffer here
			const dstAttribute = new Attribute(new Buffer(dstArray, size), size, 0, normalized);

			geometry.addAttribute(attributeName, dstAttribute);
		}

		if (reference.index) {
			const indexArray = maxVertexCount > 65535 ? new Uint32Array(maxIndexCount) : new Uint16Array(maxIndexCount);
			geometry.index = new Attribute(new Buffer(indexArray, 1));
		}

		this._geometryInitialized = true;
	}

	// Make sure the geometry is compatible with the existing combined geometry attributes
	_validateGeometry(geometry) {
		const batchGeometry = this.geometry;
		if (!!batchGeometry.index !== !!geometry.index) {
			console.error('BatchedMesh: All geometries must consistently have "index"');
			return false;
		}

		for (const attributeName in batchGeometry.attributes) {
			if (!geometry.attributes[attributeName]) {
				console.error(`BatchedMesh: Added geometry missing "${attributeName}". All geometries must have consistent attributes.`);
				return false;
			}

			const srcAttribute = geometry.getAttribute(attributeName);
			const dstAttribute = batchGeometry.getAttribute(attributeName);

			if (srcAttribute.size !== dstAttribute.size || srcAttribute.normalized !== dstAttribute.normalized) {
				console.error('BatchedMesh: All attributes must have a consistent itemSize and normalized value.');
				return false;
			}
		}

		return true;
	}

	// Copies geometry data from source to the batch
	_copyGeometryData(geometry, geometryId) {
		const info = this._geometryInfo[geometryId];
		const batchGeometry = this.geometry;

		const vertexStart = info.vertexStart;
		const reservedVertexCount = info.reservedVertexCount;
		const indexStart = info.indexStart;
		const reservedIndexCount = info.reservedIndexCount;

		for (const name in geometry.attributes) {
			const srcAttribute = geometry.attributes[name];
			const dstAttribute = batchGeometry.attributes[name];

			const itemSize = srcAttribute.size;
			const vertexCount = srcAttribute.buffer.count;

			const srcOffset = srcAttribute.offset;
			const srcStride = srcAttribute.buffer.stride;

			const dstArray = dstAttribute.buffer.array;
			const srcArray = srcAttribute.buffer.array;

			// copy attribute data
			for (let i = 0; i < vertexCount; i++) {
				const dstIndex = (vertexStart + i) * itemSize;
				const srcIndex = i * srcStride + srcOffset;
				for (let j = 0; j < itemSize; j++) {
					dstArray[dstIndex + j] = srcArray[srcIndex + j];
				}
			}

			// fill the rest in with zeroes
			for (let i = vertexCount; i < reservedVertexCount; i++) {
				const dstIndex = (vertexStart + i) * itemSize;
				for (let j = 0; j < itemSize; j++) {
					dstArray[dstIndex + j] = 0;
				}
			}

			// update buffer's update range
			updateBufferRange(dstAttribute.buffer, vertexStart * itemSize, reservedVertexCount * itemSize);
		}

		if (indexStart !== -1) {
			const srcIndex = geometry.index;
			const dstIndex = batchGeometry.index;

			const indexCount = srcIndex.buffer.count;

			const srcOffset = srcIndex.offset;
			const srcStride = srcIndex.buffer.stride;

			const dstArray = dstIndex.buffer.array;
			const srcArray = srcIndex.buffer.array;

			// copy index data
			for (let i = 0; i < indexCount; i++) {
				const sourceIndex = i * srcStride + srcOffset;
				dstArray[indexStart + i] = srcArray[sourceIndex] + vertexStart;
			}

			// fill the rest in with zeroes
			for (let i = indexCount; i < reservedIndexCount; i++) {
				dstArray[indexStart + i] = vertexStart;
			}

			// update buffer's update range
			updateBufferRange(dstIndex.buffer, indexStart, reservedIndexCount);
		}

		info.drawStart = indexStart !== -1 ? indexStart : vertexStart;
		info.drawCount = indexStart !== -1 ? info.indexCount : info.vertexCount;

		// copy bounding volumes
		info.boundingBox.copy(geometry.boundingBox);
		info.boundingSphere.copy(geometry.boundingSphere);
	}

	// Validates the geometry defined by the given ID
	_validateGeometryId(geometryId) {
		const geometryInfo = this._geometryInfo[geometryId];
		if (!geometryInfo || !geometryInfo.active) {
			console.error(`BatchedMesh: Invalid geometryId ${geometryId}. Geometry is either out of range or has been deleted.`);
			return false;
		}
		return true;
	}

	// Validates the instance defined by the given ID
	_validateInstanceId(instanceId) {
		const instanceInfo = this._instanceInfo[instanceId];
		if (!instanceInfo || !instanceInfo.active) {
			console.error(`BatchedMesh: Invalid instanceId ${instanceId}. Instance is either out of range or has been deleted.`);
			return false;
		}
		return true;
	}

}

const _vec3_1 = new Vector3();
const _vec3_2 = new Vector3();
const _vec3_3 = new Vector3();
const _mat4_1 = new Matrix4();
const _box3_1 = new Box3();
const _sphere_1 = new Sphere();
const _frustum = new Frustum();

const _whiteColor = new Color4(1, 1, 1, 1);

const _mesh = new Mesh(new Geometry(), undefined);
_mesh.geometry.addGroup(0, 0, 0);

const _batchIntersects = [];

class MultiDrawRenderList {

	constructor() {
		this.index = 0;
		this.pool = [];
		this.list = [];
	}

	push(start, count, z, index) {
		const pool = this.pool;
		const list = this.list;
		if (this.index >= pool.length) {
			pool.push({
				start: -1,
				count: -1,
				z: -1,
				index: -1
			});
		}

		const item = pool[this.index];
		list.push(item);
		this.index++;

		item.start = start;
		item.count = count;
		item.z = z;
		item.index = index;
	}

	reset() {
		this.list.length = 0;
		this.index = 0;
	}

}

const _renderList = new MultiDrawRenderList();

// Sort function to arrange IDs in ascending order
function ascIdSort(a, b) {
	return a - b;
}

// Sort function for opaque objects (front-to-back)
function sortOpaque(a, b) {
	return a.z - b.z;
}

// Sort function for transparent objects (back-to-front)
function sortTransparent(a, b) {
	return b.z - a.z;
}

function updateBufferRange(buffer, offset, count) {
	const updateRange = buffer.updateRange;

	if (updateRange.count === -1) {
		updateRange.offset = offset;
		updateRange.count = count;
		return;
	}

	const start = updateRange.offset;
	const end = start + updateRange.count;
	updateRange.offset = Math.min(start, offset);
	updateRange.count = Math.max(end, offset + count) - updateRange.offset;

	buffer.version++;
}

// safely copies array contents to a potentially smaller array
function copyArrayContents(src, target) {
	if (src.constructor !== target.constructor) {
		// if arrays are of a different type (eg due to index size increasing) then data must be per-element copied
		const len = Math.min(src.length, target.length);
		for (let i = 0; i < len; i++) {
			target[i] = src[i];
		}
	} else {
		const len = Math.min(src.length, target.length);
		target.set(new src.constructor(src.buffer, 0, len));
	}
}

class BatchingTexture extends Texture2D {

	constructor(maxInstanceCount) {
		super();
		this.format = PIXEL_FORMAT.RGBA;
		this.type = PIXEL_TYPE.FLOAT;
		this.magFilter = TEXTURE_FILTER.NEAREST;
		this.minFilter = TEXTURE_FILTER.NEAREST;
		this.generateMipmaps = false;
		this.flipY = false;
		this.setInstanceCount(maxInstanceCount);
	}

	setInstanceCount(maxInstanceCount) {
		let size = MathUtils.nextPowerOfTwoSquareSize(maxInstanceCount * 4); // 4 pixels needed for 1 matrix
		size = Math.max(size, 4);

		this.image = { data: new Float32Array(size * size * 4), width: size, height: size };
	}

	setInstanceData(instanceId, matrix) {
		matrix.toArray(this.image.data, instanceId * 16);
		this.version++;
	}

	getInstanceData(instanceId, matrix) {
		matrix.fromArray(this.image.data, instanceId * 16);
	}

}

class BatchingIdTexture extends Texture2D {

	constructor(maxInstanceCount) {
		super();
		this.format = PIXEL_FORMAT.RED_INTEGER;
		this.internalformat = 'R32UI';
		this.type = PIXEL_TYPE.UNSIGNED_INT;
		this.magFilter = TEXTURE_FILTER.NEAREST;
		this.minFilter = TEXTURE_FILTER.NEAREST;
		this.generateMipmaps = false;
		this.flipY = false;
		this.setInstanceCount(maxInstanceCount);
	}

	setInstanceCount(maxInstanceCount) {
		let size = MathUtils.nextPowerOfTwoSquareSize(maxInstanceCount);
		size = Math.max(size, 4);

		this.image = { data: new Uint32Array(size * size), width: size, height: size };
	}

}

class BatchingColorTexture extends Texture2D {

	constructor(maxInstanceCount) {
		super();
		this.magFilter = TEXTURE_FILTER.NEAREST;
		this.minFilter = TEXTURE_FILTER.NEAREST;
		this.generateMipmaps = false;
		this.flipY = false;
		this.setInstanceCount(maxInstanceCount);
	}

	setInstanceCount(maxInstanceCount) {
		let size = MathUtils.nextPowerOfTwoSquareSize(maxInstanceCount);
		size = Math.max(size, 4);

		this.image = { data: new Uint8Array(size * size * 4).fill(255), width: size, height: size };
	}

	setInstanceData(instanceId, color) {
		color.toArray(this.image.data, instanceId * 4, true);
		this.version++;
	}

	getInstanceData(instanceId, color) {
		color.fromArray(this.image.data, instanceId * 4, true);
	}

}

export { BatchedMesh };