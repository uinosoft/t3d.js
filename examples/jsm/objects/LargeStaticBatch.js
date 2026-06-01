import {
	Attribute,
	Buffer,
	Color4,
	Frustum,
	Geometry,
	MathUtils,
	Matrix4,
	Mesh,
	PIXEL_FORMAT,
	PIXEL_TYPE,
	TEXTURE_FILTER,
	Texture2D
} from 't3d';
import { LargeStaticBatchMaterial } from '../materials/LargeStaticBatchMaterial.js';
import { StaticBVH } from '../utils/StaticBVH.js';

const _frustumMatrix = new Matrix4();
const _frustum = new Frustum();

class LargeStaticBatch extends Mesh {

	constructor(descriptors, options = {}) {
		const material = options.material || new LargeStaticBatchMaterial();

		super(new Geometry(), [material]);

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
		this._objects = [];
		this._visibleIds = [];
		this._drawIdTexture = null;
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
		if (this.freezeCulling) {
			return this.stats.visibleObjects;
		}

		const start = performance.now();
		let visibleCount = 0;

		if (!this.enablePerObjectCulling) {
			visibleCount = this._collectAllVisible();
		} else if (this.enableBVH && this.bvh) {
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
		this.stats.totalObjects = normalized.length;
		this.stats.materialCount = Math.max(materials.length, 1);
		this._visibleIds = new Array(normalized.length);

		console.time('build merged geometry');
		const mergeStart = performance.now();
		this._buildMergedGeometry(normalized);
		this.stageTimings.buildMergedGeometryMs = performance.now() - mergeStart;
		console.timeEnd('build merged geometry');

		console.time('build GPU data textures');
		const textureStart = performance.now();
		this._buildDataTextures(normalized, materials);
		this.stageTimings.buildGPUDataTexturesMs = performance.now() - textureStart;
		console.timeEnd('build GPU data textures');

		this.rebuildBVH(this.leafSize);
		this.updateAllVisible();
	}

	updateAllVisible() {
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
			if (_frustum.intersectsSphere(this._objects[i].boundingSphere)) {
				this._visibleIds[visibleCount++] = this._objects[i].objectId;
			}
		}

		return visibleCount;
	}

	_normalizeDescriptors(descriptors) {
		if (!Array.isArray(descriptors) || descriptors.length === 0) {
			throw new Error('LargeStaticBatch: descriptors must be a non-empty array.');
		}

		let hasIndex = null;
		let totalTriangles = 0;

		const normalized = descriptors.map((descriptor, objectId) => {
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
			const triangleCount = Math.floor(indexCount / 3);

			totalTriangles += triangleCount;

			return {
				objectId,
				geometry,
				matrix,
				materialId: descriptor.materialId ?? 0,
				textureLayerId: descriptor.textureLayerId ?? 0,
				vertexCount,
				indexCount,
				triangleCount
			};
		});

		this._indexed = hasIndex;
		this.stats.totalTriangles = totalTriangles;

		return normalized;
	}

	_buildMergedGeometry(descriptors) {
		const geometry = this.geometry;
		let totalVertices = 0;
		let totalIndices = 0;

		for (let i = 0; i < descriptors.length; i++) {
			totalVertices += descriptors[i].vertexCount;
			totalIndices += descriptors[i].indexCount;
		}

		const positions = new Float32Array(totalVertices * 3);
		const normals = new Float32Array(totalVertices * 3);
		const uvs = new Float32Array(totalVertices * 2);
		const indices = this._indexed
			? (totalVertices > 65535 ? new Uint32Array(totalIndices) : new Uint16Array(totalIndices))
			: null;

		let vertexOffset = 0;
		let indexOffset = 0;

		for (let i = 0; i < descriptors.length; i++) {
			const descriptor = descriptors[i];
			const sourceGeometry = descriptor.geometry;
			const position = sourceGeometry.getAttribute('a_Position');
			const normal = sourceGeometry.getAttribute('a_Normal');
			const uv = sourceGeometry.getAttribute('a_Uv');

			copyAttribute(position, positions, vertexOffset, descriptor.vertexCount, 3);
			copyAttribute(normal, normals, vertexOffset, descriptor.vertexCount, 3, [0, 1, 0]);
			copyAttribute(uv, uvs, vertexOffset, descriptor.vertexCount, 2, [0, 0]);

			const drawStart = this._indexed ? indexOffset : vertexOffset;
			const drawCount = this._indexed ? descriptor.indexCount : descriptor.vertexCount;

			if (this._indexed) {
				const sourceIndex = sourceGeometry.index.buffer.array;
				for (let j = 0; j < sourceIndex.length; j++) {
					indices[indexOffset + j] = sourceIndex[j] + vertexOffset;
				}
				indexOffset += sourceIndex.length;
			}

			const boundingBox = sourceGeometry.boundingBox.clone().applyMatrix4(descriptor.matrix);
			const boundingSphere = sourceGeometry.boundingSphere.clone().applyMatrix4(descriptor.matrix);

			this._objects.push({
				objectId: descriptor.objectId,
				drawStart,
				drawCount,
				triangleCount: descriptor.triangleCount,
				boundingBox,
				boundingSphere,
				materialId: descriptor.materialId,
				textureLayerId: descriptor.textureLayerId,
				matrix: descriptor.matrix.clone()
			});

			vertexOffset += descriptor.vertexCount;
		}

		geometry.addAttribute('a_Position', new Attribute(new Buffer(positions, 3)));
		geometry.addAttribute('a_Normal', new Attribute(new Buffer(normals, 3)));
		geometry.addAttribute('a_Uv', new Attribute(new Buffer(uvs, 2)));

		if (this._indexed) {
			geometry.setIndex(new Attribute(new Buffer(indices, 1)));
			this._indexBytesPerElement = indices.BYTES_PER_ELEMENT;
		}

		geometry.groups = [{
			multiDrawStarts: new Int32Array(descriptors.length),
			multiDrawCounts: new Int32Array(descriptors.length),
			multiDrawCount: 0,
			materialIndex: 0
		}];
	}

	_buildDataTextures(descriptors, materials) {
		const material = this.material[0];
		const matrixTexture = createFloatTexture(descriptors.length * 4);
		const objectDataTexture = createFloatTexture(descriptors.length);
		const materialDataTexture = createFloatTexture(Math.max(materials.length, 1) * 5);
		const drawIdTexture = createFloatTexture(descriptors.length);

		const matrixData = matrixTexture.image.data;
		const objectData = objectDataTexture.image.data;
		const materialData = materialDataTexture.image.data;

		for (let i = 0; i < this._objects.length; i++) {
			const object = this._objects[i];

			object.matrix.toArray(matrixData, i * 16);

			const objectOffset = i * 4;
			objectData[objectOffset + 0] = object.materialId;
			objectData[objectOffset + 1] = i;
			objectData[objectOffset + 2] = object.textureLayerId;
			objectData[objectOffset + 3] = 0;
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
		material.uniforms.matrixTexture = matrixTexture;
		material.uniforms.objectDataTexture = objectDataTexture;
		material.uniforms.materialDataTexture = materialDataTexture;

		this._drawIdTexture = drawIdTexture;
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

function copyAttribute(attribute, target, vertexOffset, vertexCount, itemSize, fallback = null) {
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

	for (let i = 0; i < count; i++) {
		const sourceOffset = i * stride + offset;
		const targetOffset = start + i * itemSize;

		for (let j = 0; j < itemSize; j++) {
			target[targetOffset + j] = source[sourceOffset + j];
		}
	}
}

export { LargeStaticBatch };
