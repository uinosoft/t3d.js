import {
	Attribute,
	Box3,
	Buffer,
	Color4,
	Frustum,
	Geometry,
	MathUtils,
	Matrix4,
	Mesh,
	PIXEL_FORMAT,
	PIXEL_TYPE,
	Sphere,
	TEXTURE_FILTER,
	Texture2D,
	Vector3
} from 't3d';
import { LargeStaticBatchMaterial } from '../materials/LargeStaticBatchMaterial.js';
import { StaticBVH } from '../utils/StaticBVH.js';

const _frustumMatrix = new Matrix4();
const _frustum = new Frustum();

class LargeStaticBatch extends Mesh {

	constructor(descriptors, options = {}) {
		const material = options.material || new LargeStaticBatchMaterial();

		super(new Geometry(), [material]);
		this.isLargeStaticBatch = true;

		this.frustumCulled = false;

		this.enableBVH = options.enableBVH !== false;
		this.enablePerObjectCulling = options.enablePerObjectCulling !== false;
		this.freezeCulling = false;
		this.leafSize = options.leafSize || 16;

		this.stageTimings = {
			buildMergedGeometryMs: 0,
			buildGPUDataTexturesMs: 0,
			buildBVHMs: 0
		};

		this.stats = {
			totalObjects: 0,
			visibleObjects: 0,
			totalTriangles: 0,
			visibleTriangles: 0,
			bvhBuildMs: 0,
			cpuCullingMs: 0,
			drawMode: 'multiDraw',
			materialCount: 0
		};

		this._indexed = false;
		this._indexBytesPerElement = 1;
		this._hasTangents = false;
		this._supportsNormalMap = false;
		this._hasDynamicSourceNodes = false;
		this._geometryUnits = [];
		this._objects = [];
		this._staticObjects = [];
		this._animatedObjects = [];
		this._visibleIds = [];
		this._drawIdTexture = null;
		this._staticMatrixTexture = null;
		this._dynamicMatrixTexture = null;
		this.bvh = null;

		this._build(descriptors, options.materials || []);
	}

	setBaseColorArray(texture) {
		this.material[0].uniforms.baseColorArray = texture;
		return this;
	}

	setNormalMapArray(texture) {
		this.material[0].uniforms.normalMapArray = texture;
		return this;
	}

	setORMMapArray(texture) {
		this.material[0].uniforms.ormMapArray = texture;
		return this;
	}

	setEmissiveMapArray(texture) {
		this.material[0].uniforms.emissiveMapArray = texture;
		return this;
	}

	rebuildBVH(leafSize = this.leafSize) {
		this.leafSize = leafSize;

		console.time('build BVH');
		const start = performance.now();
		this.bvh = new StaticBVH(this._objects, { leafSize: this.leafSize }).build();
		const duration = performance.now() - start;
		console.timeEnd('build BVH');

		this.stageTimings.buildBVHMs = duration;
		this.stats.bvhBuildMs = duration;

		return this;
	}

	update(camera) {
		this.updateAnimatedMatricesFromSource();

		if (this.freezeCulling) {
			return this.stats.visibleObjects;
		}

		const start = performance.now();
		let visibleCount = 0;

		if (!this.enablePerObjectCulling) {
			visibleCount = this._collectAllVisible();
		} else if (this.enableBVH && this.bvh && !this._hasDynamicSourceNodes) {
			visibleCount = this.bvh.frustumCull(camera, this.worldMatrix, this._visibleIds);
		} else {
			visibleCount = this._collectVisibleLinear(camera);
		}

		let visibleTriangles = 0;
		const group = this.geometry.groups[0];
		const multiDrawStarts = group.multiDrawStarts;
		const multiDrawCounts = group.multiDrawCounts;
		const drawIdData = this._drawIdTexture.image.data;

		for (let i = 0; i < visibleCount; i++) {
			const objectId = this._visibleIds[i];
			const object = this._objects[objectId];

			// WEBGL_multi_draw indexed path expects byte offsets, not index offsets.
			multiDrawStarts[i] = object.drawStart * this._indexBytesPerElement;
			multiDrawCounts[i] = object.drawCount;
			drawIdData[i * 4] = objectId;

			visibleTriangles += object.triangleCount;
		}

		group.multiDrawCount = visibleCount;
		this._drawIdTexture.version++;

		this.stats.visibleObjects = visibleCount;
		this.stats.visibleTriangles = visibleTriangles;
		this.stats.cpuCullingMs = performance.now() - start;

		return visibleCount;
	}

	_build(descriptors, materials) {
		const normalized = this._normalizeDescriptors(descriptors);
		this._hasTangents = normalized.allHaveTangents;
		this._supportsNormalMap = normalized.supportsNormalMap;
		this._hasDynamicSourceNodes = normalized.hasDynamicSourceNodes;
		this._geometryUnits = normalized.geometryUnits;
		this.stats.totalObjects = normalized.drawItems.length;
		this.stats.materialCount = Math.max(materials.length, 1);
		this._visibleIds = new Array(normalized.drawItems.length);
		this._configureMaterialFeatures();

		console.time('build merged geometry');
		const mergeStart = performance.now();
		this._buildMergedGeometry(normalized.geometryUnits, normalized.drawItems);
		this.stageTimings.buildMergedGeometryMs = performance.now() - mergeStart;
		console.timeEnd('build merged geometry');

		console.time('build GPU data textures');
		const textureStart = performance.now();
		this._buildDataTextures(materials);
		this.stageTimings.buildGPUDataTexturesMs = performance.now() - textureStart;
		console.timeEnd('build GPU data textures');

		this.rebuildBVH(this.leafSize);
		this.updateAllVisible();
	}

	updateAllVisible() {
		this.updateAnimatedMatricesFromSource();

		const group = this.geometry.groups[0];
		const multiDrawStarts = group.multiDrawStarts;
		const multiDrawCounts = group.multiDrawCounts;
		const drawIdData = this._drawIdTexture.image.data;

		let triangleCount = 0;
		for (let i = 0; i < this._objects.length; i++) {
			const object = this._objects[i];
			multiDrawStarts[i] = object.drawStart * this._indexBytesPerElement;
			multiDrawCounts[i] = object.drawCount;
			drawIdData[i * 4] = object.objectId;
			this._visibleIds[i] = object.objectId;
			triangleCount += object.triangleCount;
		}

		group.multiDrawCount = this._objects.length;
		this._drawIdTexture.version++;

		this.stats.visibleObjects = this._objects.length;
		this.stats.visibleTriangles = triangleCount;
	}

	_collectAllVisible() {
		for (let i = 0; i < this._objects.length; i++) {
			this._visibleIds[i] = this._objects[i].objectId;
		}

		return this._objects.length;
	}

	_collectVisibleLinear(camera) {
		_frustumMatrix.multiplyMatrices(camera.projectionMatrix, camera.viewMatrix).multiply(this.worldMatrix);
		_frustum.setFromMatrix(_frustumMatrix);

		let visibleCount = 0;

		for (let i = 0; i < this._objects.length; i++) {
			if (_frustum.intersectsSphere(this._objects[i].currentBoundingSphere)) {
				this._visibleIds[visibleCount++] = this._objects[i].objectId;
			}
		}

		return visibleCount;
	}

	updateAnimatedMatricesFromSource() {
		if (!this._dynamicMatrixTexture || this._animatedObjects.length === 0) {
			return;
		}

		const matrixData = this._dynamicMatrixTexture.image.data;

		for (let i = 0; i < this._animatedObjects.length; i++) {
			const object = this._animatedObjects[i];
			object.currentMatrix.copy(object.sourceNode.worldMatrix);
			object.currentBoundingBox.copy(object.localBoundingBox).applyMatrix4(object.currentMatrix);
			object.currentBoundingSphere.copy(object.localBoundingSphere).applyMatrix4(object.currentMatrix);
			object.boundingBox.copy(object.currentBoundingBox);
			object.boundingSphere.copy(object.currentBoundingSphere);
			object.currentMatrix.toArray(matrixData, object.matrixId * 16);
		}

		this._dynamicMatrixTexture.version++;
	}

	_normalizeDescriptors(descriptors) {
		if (!Array.isArray(descriptors) || descriptors.length === 0) {
			throw new Error('LargeStaticBatch: descriptors must be a non-empty array.');
		}

		let hasIndex = null;
		let totalTriangles = 0;
		const geometryUnitMap = new Map();
		const geometryUnits = [];
		const drawItems = descriptors.map((descriptor, objectId) => {
			const geometry = descriptor.geometry;

			if (!geometry || !geometry.getAttribute('a_Position')) {
				throw new Error(`LargeStaticBatch: descriptor ${objectId} is missing geometry or a_Position.`);
			}

			const indexed = geometry.index !== null;

			if (hasIndex === null) {
				hasIndex = indexed;
			} else if (hasIndex !== indexed) {
				throw new Error('LargeStaticBatch: mixing indexed and non-indexed geometry is not supported in v1.');
			}

			if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) {
				geometry.computeBoundingBox();
			}

			if (!geometry.boundingSphere || geometry.boundingSphere.isEmpty()) {
				geometry.computeBoundingSphere();
			}

			const matrix = descriptor.matrix ? descriptor.matrix.clone() : new Matrix4();
			const position = geometry.getAttribute('a_Position');
			const vertexCount = position.buffer.count;
			const indexCount = indexed ? geometry.index.buffer.count : vertexCount;
			const drawStart = descriptor.drawStart !== undefined ? descriptor.drawStart : 0;
			const drawCount = descriptor.drawCount !== undefined ? descriptor.drawCount : indexCount;
			const triangleCount = Math.floor(drawCount / 3);
			const sourceId = descriptor.sourceId || `descriptor-${objectId}`;
			const flipWinding = descriptor.flipWinding === true;
			const hasTangent = descriptor.hasTangent === true;
			const normalMapEnabled = descriptor.normalMapEnabled === true;
			const sourceNode = descriptor.sourceNode || null;
			const normalizeMatrix = descriptor.normalizeMatrix ? descriptor.normalizeMatrix.clone() : new Matrix4();

			totalTriangles += triangleCount;

			let geometryUnitId = geometryUnitMap.get(sourceId);
			if (geometryUnitId === undefined) {
				geometryUnitId = geometryUnits.length;
				geometryUnitMap.set(sourceId, geometryUnitId);
				geometryUnits.push({
					geometryUnitId,
					sourceId,
					geometry,
					matrix,
					sourceNode,
					normalizeMatrix,
					vertexCount,
					indexCount,
					hasTangent,
					flipWinding,
					drawBaseStart: 0
				});
			}

			return {
				objectId,
				geometryUnitId,
				materialId: descriptor.materialId ?? 0,
				textureLayerId: descriptor.textureLayerId ?? 0,
				normalMapEnabled,
				isAnimated: descriptor.isAnimated === true,
				sourceNode,
				normalizeMatrix,
				drawStart,
				drawCount,
				triangleCount
			};
		});

		const allHaveTangents = geometryUnits.length > 0 && geometryUnits.every(unit => unit.hasTangent);
		const supportsNormalMap = allHaveTangents && drawItems.some(item => item.normalMapEnabled);
		const hasDynamicSourceNodes = drawItems.some(item => item.isAnimated === true);

		this._indexed = hasIndex;
		this.stats.totalTriangles = totalTriangles;

		return { geometryUnits, drawItems, allHaveTangents, supportsNormalMap, hasDynamicSourceNodes };
	}

	_buildMergedGeometry(geometryUnits, drawItems) {
		const geometry = this.geometry;
		let totalVertices = 0;
		let totalIndices = 0;

		for (let i = 0; i < geometryUnits.length; i++) {
			totalVertices += geometryUnits[i].vertexCount;
			totalIndices += geometryUnits[i].indexCount;
		}

		const positions = new Float32Array(totalVertices * 3);
		const normals = new Float32Array(totalVertices * 3);
		const uvs = new Float32Array(totalVertices * 2);
		const tangents = this._hasTangents ? new Float32Array(totalVertices * 4) : null;
		const indices = this._indexed
			? (totalVertices > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices))
			: null;

		let vertexOffset = 0;
		let indexOffset = 0;

		for (let i = 0; i < geometryUnits.length; i++) {
			const geometryUnit = geometryUnits[i];
			const sourceGeometry = geometryUnit.geometry;
			const position = sourceGeometry.getAttribute('a_Position');
			const normal = sourceGeometry.getAttribute('a_Normal');
			const uv = sourceGeometry.getAttribute('a_Uv');
			const tangent = sourceGeometry.getAttribute('a_Tangent');

			copyAttribute(position, positions, vertexOffset, geometryUnit.vertexCount, 3, null, geometryUnit.flipWinding && !this._indexed);
			copyAttribute(normal, normals, vertexOffset, geometryUnit.vertexCount, 3, [0, 1, 0], geometryUnit.flipWinding && !this._indexed);
			copyAttribute(uv, uvs, vertexOffset, geometryUnit.vertexCount, 2, [0, 0], geometryUnit.flipWinding && !this._indexed);
			if (tangents) {
				copyAttribute(tangent, tangents, vertexOffset, geometryUnit.vertexCount, 4, [1, 0, 0, 1], geometryUnit.flipWinding && !this._indexed);
			}

			geometryUnit.drawBaseStart = this._indexed ? indexOffset : vertexOffset;

			if (this._indexed) {
				copyIndexAttribute(sourceGeometry.index, indices, indexOffset, vertexOffset, geometryUnit.indexCount, geometryUnit.flipWinding);
				indexOffset += geometryUnit.indexCount;
			}

			vertexOffset += geometryUnit.vertexCount;
		}

		for (let i = 0; i < drawItems.length; i++) {
			const descriptor = drawItems[i];
			const geometryUnit = geometryUnits[descriptor.geometryUnitId];
			const sourceGeometry = geometryUnit.geometry;
			const drawBounds = computeDrawRangeLocalBounds(sourceGeometry, descriptor.drawStart, descriptor.drawCount);

			this._objects.push({
				objectId: descriptor.objectId,
				geometryUnitId: descriptor.geometryUnitId,
				matrixId: -1,
				drawStart: geometryUnit.drawBaseStart + descriptor.drawStart,
				drawCount: descriptor.drawCount,
				triangleCount: descriptor.triangleCount,
				isAnimated: descriptor.isAnimated === true,
				sourceNode: descriptor.sourceNode,
				normalizeMatrix: descriptor.normalizeMatrix.clone(),
				baseMatrix: geometryUnit.matrix.clone(),
				currentMatrix: geometryUnit.matrix.clone(),
				localBoundingBox: drawBounds.boundingBox.clone(),
				localBoundingSphere: drawBounds.boundingSphere.clone(),
				currentBoundingBox: drawBounds.boundingBox.clone().applyMatrix4(geometryUnit.matrix),
				currentBoundingSphere: drawBounds.boundingSphere.clone().applyMatrix4(geometryUnit.matrix),
				boundingBox: drawBounds.boundingBox.clone().applyMatrix4(geometryUnit.matrix),
				boundingSphere: drawBounds.boundingSphere.clone().applyMatrix4(geometryUnit.matrix),
				materialId: descriptor.materialId,
				textureLayerId: descriptor.textureLayerId,
				normalMapEnabled: descriptor.normalMapEnabled,
				matrix: geometryUnit.matrix.clone()
			});
		}

		geometry.addAttribute('a_Position', new Attribute(new Buffer(positions, 3)));
		geometry.addAttribute('a_Normal', new Attribute(new Buffer(normals, 3)));
		geometry.addAttribute('a_Uv', new Attribute(new Buffer(uvs, 2)));
		if (tangents) {
			geometry.addAttribute('a_Tangent', new Attribute(new Buffer(tangents, 4)));
		}

		if (this._indexed) {
			geometry.setIndex(new Attribute(new Buffer(indices, 1)));
			this._indexBytesPerElement = indices.BYTES_PER_ELEMENT;
		}

		geometry.groups = [{
			multiDrawStarts: new Int32Array(drawItems.length),
			multiDrawCounts: new Int32Array(drawItems.length),
			multiDrawCount: 0,
			materialIndex: 0
		}];
	}

	_buildDataTextures(materials) {
		const material = this.material[0];
		const objectDataTexture = createFloatTexture(this._objects.length);
		const materialDataTexture = createFloatTexture(Math.max(materials.length, 1) * 5);
		const drawIdTexture = createFloatTexture(this._objects.length);
		const staticObjects = [];
		const animatedObjects = [];

		for (let i = 0; i < this._objects.length; i++) {
			const object = this._objects[i];
			if (object.isAnimated) {
				object.matrixId = animatedObjects.length;
				animatedObjects.push(object);
			} else {
				object.matrixId = staticObjects.length;
				staticObjects.push(object);
			}
		}

		const staticMatrixTexture = createFloatTexture(Math.max(staticObjects.length, 1) * 4);
		const dynamicMatrixTexture = createFloatTexture(Math.max(animatedObjects.length, 1) * 4);

		const staticMatrixData = staticMatrixTexture.image.data;
		const dynamicMatrixData = dynamicMatrixTexture.image.data;
		const objectData = objectDataTexture.image.data;
		const materialData = materialDataTexture.image.data;

		for (let i = 0; i < staticObjects.length; i++) {
			staticObjects[i].baseMatrix.toArray(staticMatrixData, i * 16);
		}

		for (let i = 0; i < animatedObjects.length; i++) {
			animatedObjects[i].currentMatrix.toArray(dynamicMatrixData, i * 16);
		}

		for (let i = 0; i < this._objects.length; i++) {
			const object = this._objects[i];
			const objectOffset = i * 4;
			objectData[objectOffset + 0] = object.materialId;
			objectData[objectOffset + 1] = object.matrixId;
			objectData[objectOffset + 2] = object.textureLayerId;
			objectData[objectOffset + 3] = (object.isAnimated ? 1 : 0) | (object.normalMapEnabled ? 2 : 0);
		}

		const materialCount = Math.max(materials.length, 1);
		for (let i = 0; i < materialCount; i++) {
			const definition = materials[i] || {};
			const baseColor = normalizeColor(definition.baseColor);
			const uvScale = definition.uvScale || { x: 1, y: 1 };
			const uvOffset = definition.uvOffset || { x: 0, y: 0 };
			const emissive = normalizeColor(definition.emissive || [0, 0, 0, 1]);
			const normalScale = definition.normalScale || { x: 1, y: 1 };
			const aoMapIntensity = definition.aoMapIntensity !== undefined ? definition.aoMapIntensity : 1;
			const texelOffset = i * 20;

			baseColor.toArray(materialData, texelOffset + 0);
			materialData[texelOffset + 4] = definition.roughness !== undefined ? definition.roughness : 1;
			materialData[texelOffset + 5] = definition.metalness !== undefined ? definition.metalness : 0;
			materialData[texelOffset + 6] = definition.alphaCutoff !== undefined ? definition.alphaCutoff : 0;
			materialData[texelOffset + 7] = aoMapIntensity;
			materialData[texelOffset + 8] = uvScale.x;
			materialData[texelOffset + 9] = uvScale.y;
			materialData[texelOffset + 10] = uvOffset.x;
			materialData[texelOffset + 11] = uvOffset.y;
			emissive.toArray(materialData, texelOffset + 12);
			materialData[texelOffset + 16] = normalScale.x;
			materialData[texelOffset + 17] = normalScale.y;
			materialData[texelOffset + 18] = 0;
			materialData[texelOffset + 19] = 0;
		}

		material.uniforms.drawIdTexture = drawIdTexture;
		material.uniforms.staticMatrixTexture = staticMatrixTexture;
		material.uniforms.dynamicMatrixTexture = dynamicMatrixTexture;
		material.uniforms.objectDataTexture = objectDataTexture;
		material.uniforms.materialDataTexture = materialDataTexture;

		this._staticObjects = staticObjects;
		this._animatedObjects = animatedObjects;
		this._drawIdTexture = drawIdTexture;
		this._staticMatrixTexture = staticMatrixTexture;
		this._dynamicMatrixTexture = dynamicMatrixTexture;
	}

	_configureMaterialFeatures() {
		const material = this.material[0];

		if (this._hasTangents) {
			material.defines.USE_TANGENT = true;
		} else {
			delete material.defines.USE_TANGENT;
		}

		if (this._supportsNormalMap) {
			material.defines.USE_NORMAL_MAP = true;
		} else {
			delete material.defines.USE_NORMAL_MAP;
		}

		material.needsUpdate = true;
	}

}

function createFloatTexture(pixelCount) {
	const size = Math.max(1, MathUtils.nextPowerOfTwoSquareSize(pixelCount));
	const texture = new Texture2D();

	texture.format = PIXEL_FORMAT.RGBA;
	texture.type = PIXEL_TYPE.FLOAT;
	texture.magFilter = TEXTURE_FILTER.NEAREST;
	texture.minFilter = TEXTURE_FILTER.NEAREST;
	texture.generateMipmaps = false;
	texture.flipY = false;
	texture.image = { data: new Float32Array(size * size * 4), width: size, height: size };

	return texture;
}

function normalizeColor(value) {
	if (value && value.isColor4) {
		return value;
	}

	if (Array.isArray(value)) {
		return new Color4(value[0], value[1], value[2], value[3] !== undefined ? value[3] : 1);
	}

	if (value && value.r !== undefined) {
		return new Color4(value.r, value.g, value.b, value.a !== undefined ? value.a : 1);
	}

	return new Color4(1, 1, 1, 1);
}

function copyAttribute(attribute, target, vertexOffset, vertexCount, itemSize, fallback = null, flipWinding = false) {
	const start = vertexOffset * itemSize;

	if (!attribute) {
		for (let i = 0; i < vertexCount; i++) {
			const targetOffset = start + i * itemSize;
			for (let j = 0; j < itemSize; j++) {
				target[targetOffset + j] = fallback ? fallback[j] : 0;
			}
		}
		return;
	}

	const source = attribute.buffer.array;
	const stride = attribute.buffer.stride;
	const offset = attribute.offset;
	const count = attribute.buffer.count;
	const triangleVertexCount = Math.floor(count / 3) * 3;

	if (flipWinding) {
		for (let i = 0; i < triangleVertexCount; i += 3) {
			copyAttributeElement(source, target, offset, stride, start, itemSize, i + 0, i + 0);
			copyAttributeElement(source, target, offset, stride, start, itemSize, i + 1, i + 2);
			copyAttributeElement(source, target, offset, stride, start, itemSize, i + 2, i + 1);
		}

		for (let i = triangleVertexCount; i < count; i++) {
			copyAttributeElement(source, target, offset, stride, start, itemSize, i, i);
		}
	} else {
		for (let i = 0; i < count; i++) {
			copyAttributeElement(source, target, offset, stride, start, itemSize, i, i);
		}
	}
}

function copyIndexAttribute(attribute, target, indexOffset, vertexOffset, indexCount, flipWinding = false) {
	const source = attribute.buffer.array;
	const stride = attribute.buffer.stride;
	const offset = attribute.offset;
	const triangleIndexCount = Math.floor(indexCount / 3) * 3;

	if (flipWinding) {
		for (let i = 0; i < triangleIndexCount; i += 3) {
			target[indexOffset + i + 0] = source[(i + 0) * stride + offset] + vertexOffset;
			target[indexOffset + i + 1] = source[(i + 2) * stride + offset] + vertexOffset;
			target[indexOffset + i + 2] = source[(i + 1) * stride + offset] + vertexOffset;
		}

		for (let i = triangleIndexCount; i < indexCount; i++) {
			target[indexOffset + i] = source[i * stride + offset] + vertexOffset;
		}
	} else {
		for (let i = 0; i < indexCount; i++) {
			target[indexOffset + i] = source[i * stride + offset] + vertexOffset;
		}
	}
}

function copyAttributeElement(source, target, offset, stride, start, itemSize, sourceIndex, targetIndex) {
	const sourceOffset = sourceIndex * stride + offset;
	const targetOffset = start + targetIndex * itemSize;

	for (let j = 0; j < itemSize; j++) {
		target[targetOffset + j] = source[sourceOffset + j];
	}
}

function computeDrawRangeLocalBounds(geometry, drawStart, drawCount) {
	const boundingBox = new Box3();
	const boundingSphere = new Sphere();
	const position = geometry.getAttribute('a_Position');

	if (!position || drawCount <= 0) {
		boundingBox.makeEmpty();
		boundingSphere.makeEmpty();
		return { boundingBox, boundingSphere };
	}

	const sourcePositions = position.buffer.array;
	const positionStride = position.buffer.stride;
	const positionOffset = position.offset;
	const temp = new Vector3();
	const indexed = geometry.index !== null;

	if (indexed) {
		const indexAttribute = geometry.index;
		const indexSource = indexAttribute.buffer.array;
		const indexStride = indexAttribute.buffer.stride;
		const indexOffset = indexAttribute.offset;

		for (let i = 0; i < drawCount; i++) {
			const sourceIndex = indexSource[(drawStart + i) * indexStride + indexOffset];
			readPositionAt(sourcePositions, positionStride, positionOffset, sourceIndex, temp);
			boundingBox.expandByPoint(temp);
		}
	} else {
		for (let i = 0; i < drawCount; i++) {
			readPositionAt(sourcePositions, positionStride, positionOffset, drawStart + i, temp);
			boundingBox.expandByPoint(temp);
		}
	}

	if (boundingBox.isEmpty()) {
		boundingSphere.makeEmpty();
	} else {
		boundingBox.getBoundingSphere(boundingSphere);
	}

	return { boundingBox, boundingSphere };
}

function readPositionAt(source, stride, offset, vertexIndex, target) {
	const sourceOffset = vertexIndex * stride + offset;
	target.set(source[sourceOffset], source[sourceOffset + 1], source[sourceOffset + 2]);
}

export { LargeStaticBatch };
