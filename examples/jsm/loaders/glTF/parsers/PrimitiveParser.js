import { Geometry, PBRMaterial, VERTEX_COLOR, SHADING_TYPE, PointsMaterial, Material, LineMaterial } from 't3d';
import { GLTFUtils } from "../GLTFUtils.js";
import { ATTRIBUTES, ACCESSOR_COMPONENT_TYPES, WEBGL_DRAW_MODES } from "../Constants.js";
import { KHR_draco_mesh_compression as _KHR_draco_mesh_compression } from '../extensions/KHR_draco_mesh_compression.js';

export class PrimitiveParser {

	static parse(context, loader) {
		const { gltf, accessors, materials, bufferViews } = context;

		if (!gltf.meshes) return;

		const materialCache = new Map();
		const geometryPromiseCache = new Map();

		const meshPromises = [];
		for (let i = 0; i < gltf.meshes.length; i++) {
			const gltfMesh = gltf.meshes[i];

			const primitivePromises = [];
			for (let j = 0; j < gltfMesh.primitives.length; j++) {
				const gltfPrimitive = gltfMesh.primitives[j];
				const {
					extensions = {},
					mode,
					material
				} = gltfPrimitive;
				const { KHR_draco_mesh_compression } = extensions;

				let geometryPromise;

				const geometryKey = createGeometryKey(gltfPrimitive);
				if (geometryPromiseCache.has(geometryKey)) {
					geometryPromise = geometryPromiseCache.get(geometryKey);
				} else {
					if (KHR_draco_mesh_compression) {
						geometryPromise = _KHR_draco_mesh_compression.getGeometry(KHR_draco_mesh_compression, bufferViews, loader.getDRACOLoader());
					} else {
						geometryPromise = Promise.resolve(new Geometry());
					}

					geometryPromise = geometryPromise.then(geometry => {
						parseGeometryFromGLTFPrimitive(geometry, gltfPrimitive, gltf, accessors);
						return geometry;
					});

					geometryPromiseCache.set(geometryKey, geometryPromise);
				}

				const primitivePromise = geometryPromise.then(geometry => {
					const primitive = {
						mode,
						geometry,
						material: material === undefined ? new PBRMaterial() : materials[material],
						weights: (Object.keys(geometry.morphAttributes).length > 0 && gltfMesh.weights) ? gltfMesh.weights.slice(0) : undefined,
						skinned: gltfMesh.isSkinned
					};
					assignFinalMaterial(primitive, materialCache);
					return primitive;
				});

				primitivePromises.push(primitivePromise);
			}
			meshPromises.push(Promise.all(primitivePromises));
		}

		materialCache.clear();
		geometryPromiseCache.clear();

		return Promise.all(meshPromises).then(primitives => {
			context.primitives = primitives;
		});
	}

}

function parseGeometryFromGLTFPrimitive(geometry, gltfPrimitive, gltf, accessors) {
	const { attributes, indices, targets } = gltfPrimitive;

	// set attributes

	for (const attributeSemantic in attributes) {
		const accessorIdx = attributes[attributeSemantic];

		const attributeName = ATTRIBUTES[attributeSemantic] === undefined ? attributeSemantic : ATTRIBUTES[attributeSemantic];
		// Skip attributes already provided by e.g. Draco extension.
		if (attributeName in geometry.attributes) continue;

		geometry.addAttribute(attributeName, accessors[accessorIdx]);
	}

	// set index

	if (indices !== undefined && !geometry.index) {
		geometry.setIndex(accessors[indices]);
	}

	// compute bounds

	const { boundingBox, boundingSphere } = geometry;
	if (attributes.POSITION !== undefined) {
		const accessorIdx = attributes.POSITION;
		const accessor = gltf.accessors[accessorIdx];

		if (accessor.min && accessor.max) {
			boundingBox.min.fromArray(accessor.min);
			boundingBox.max.fromArray(accessor.max);

			if (accessor.normalized) {
				const boxScale = GLTFUtils.getNormalizedComponentScale(ACCESSOR_COMPONENT_TYPES[accessor.componentType]);
				boundingBox.min.multiplyScalar(boxScale);
				boundingBox.max.multiplyScalar(boxScale);
			}
		} else {
			geometry.computeBoundingBox();
		}
	} else {
		geometry.computeBoundingBox();
	}
	boundingBox.getCenter(boundingSphere.center);
	boundingSphere.radius = boundingBox.min.distanceTo(boundingBox.max) / 2;

	// set morph targets

	if (targets) {
		let hasMorphPosition = false;
		let hasMorphNormal = false;

		for (let i = 0, il = targets.length; i < il; i++) {
			const target = targets[i];

			if (target.POSITION !== undefined) hasMorphPosition = true;
			if (target.NORMAL !== undefined) hasMorphNormal = true;

			if (hasMorphPosition && hasMorphNormal) break;
		}

		if (hasMorphPosition || hasMorphNormal) {
			const morphPositions = [];
			const morphNormals = [];

			for (let i = 0, il = targets.length; i < il; i++) {
				const target = targets[i];

				if (hasMorphPosition) {
					morphPositions.push(target.POSITION !== undefined ? accessors[target.POSITION] : geometry.attributes[ATTRIBUTES.POSITION]);
				}
				if (hasMorphNormal) {
					morphNormals.push(target.NORMAL !== undefined ? accessors[target.NORMAL] : geometry.attributes[ATTRIBUTES.NORMAL]);
				}
			}

			if (hasMorphPosition) {
				geometry.morphAttributes.position = morphPositions;
			}
			if (hasMorphNormal) {
				geometry.morphAttributes.normal = morphNormals;
			}
		}
	}

	return geometry;
}

function assignFinalMaterial(primitive, materialCache) {
	let { geometry, material, skinned, mode } = primitive;

	// If the material will be modified later on, clone it now.
	const useVertexTangents = geometry.attributes[ATTRIBUTES.TANGENT] !== undefined;
	const useVertexColors = geometry.attributes[ATTRIBUTES.COLOR_0] !== undefined;
	const useFlatShading = geometry.attributes[ATTRIBUTES.NORMAL] === undefined;
	const useSkinning = skinned;

	if (mode === WEBGL_DRAW_MODES.POINTS) {
		const cacheKey = 'PointsMaterial:' + material.id;
		let pointsMaterial = materialCache.get(cacheKey);
		if (!pointsMaterial) {
			pointsMaterial = new PointsMaterial();
			Material.prototype.copy.call(pointsMaterial, material);
			pointsMaterial.diffuse.copy(material.diffuse);
			pointsMaterial.diffuseMap = material.map;
			pointsMaterial.acceptLight = false; // PointsMaterial doesn't support lights yet
			materialCache.set(cacheKey, pointsMaterial);
		}
		material = pointsMaterial;
	} else if (mode === WEBGL_DRAW_MODES.LINES || mode === WEBGL_DRAW_MODES.LINE_STRIP || mode === WEBGL_DRAW_MODES.LINE_LOOP) {
		const cacheKey = 'LineMaterial:' + material.id;
		let lineMaterial = materialCache.get(cacheKey);
		if (!lineMaterial) {
			lineMaterial = new LineMaterial();
			lineMaterial.lineWidth = material.lineWidth;
			lineMaterial.diffuse.copy(material.diffuse);
			lineMaterial.diffuseMap = material.diffuseMap;
			lineMaterial.lights = false; // LineMaterial doesn't support lights
			lineMaterial.drawMode = mode;
			materialCache.set(cacheKey, lineMaterial);
		}
	} else if (mode === WEBGL_DRAW_MODES.TRIANGLE_STRIP) {
		// TODO
		console.warn('TRIANGLE_STRIP will be removed later.');
		material.drawMode = WEBGL_DRAW_MODES.TRIANGLE_STRIP;
	} else if (mode === WEBGL_DRAW_MODES.TRIANGLE_FAN) {
		// TODO
		console.warn('TRIANGLE_FAN will be removed later.');
		material.drawMode = WEBGL_DRAW_MODES.TRIANGLE_FAN;
	}

	if (useVertexTangents || useVertexColors || useFlatShading || useSkinning) {
		let cacheKey = 'ClonedMaterial:' + material.id + ':';

		if (useVertexTangents) cacheKey += 'vertex-tangents:';
		if (useVertexColors) {
			if (geometry.attributes[ATTRIBUTES.COLOR_0].size === 3) {
				cacheKey += 'vertex-colors-rgb:';
			} else if (geometry.attributes[ATTRIBUTES.COLOR_0].size === 4) {
				cacheKey += 'vertex-colors-rgba:';
			}
		}
		if (useFlatShading) cacheKey += 'flat-shading:';

		let cachedMaterial = materialCache.get(cacheKey);

		if (!cachedMaterial) {
			cachedMaterial = material.clone();

			if (useVertexTangents) {
				cachedMaterial.vertexTangents = true;

				// revert flip y fix for tangents
				// https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
				if (cachedMaterial.normalMap) {
					cachedMaterial.normalScale.y *= -1;
				}
			}

			if (useVertexColors) {
				if (geometry.attributes[ATTRIBUTES.COLOR_0].size === 3) {
					cachedMaterial.vertexColors = VERTEX_COLOR.RGB;
				} else if (geometry.attributes[ATTRIBUTES.COLOR_0].size === 4) {
					cachedMaterial.vertexColors = VERTEX_COLOR.RGBA;
				} else {
					console.warn("Illegal vertex color size: " + geometry.attributes[ATTRIBUTES.COLOR_0].size);
				}
			}

			if (useFlatShading) {
				cachedMaterial.shading = SHADING_TYPE.FLAT_SHADING;
			}
		}

		material = cachedMaterial;
	}

	primitive.material = material;
}

function createGeometryKey(primitive) {
	const dracoExtension = primitive.extensions && primitive.extensions.KHR_draco_mesh_compression;
	let geometryKey;

	if (dracoExtension) {
		geometryKey = 'draco:' + dracoExtension.bufferView
				+ ':' + dracoExtension.indices
				+ ':' + createAttributesKey(dracoExtension.attributes);
	} else {
		geometryKey = primitive.indices + ':' + createAttributesKey(primitive.attributes) + ':' + primitive.mode;
	}

	if (primitive.targets) {
		for (let i = 0, il = primitive.targets.length; i < il; i++) {
			geometryKey += ':' + createAttributesKey(primitive.targets[i]);
		}
	}

	return geometryKey;
}

function createAttributesKey(attributes) {
	let attributesKey = '';

	const keys = Object.keys(attributes).sort();

	for (let i = 0, il = keys.length; i < il; i++) {
		attributesKey += keys[i] + ':' + attributes[keys[i]] + ';';
	}

	return attributesKey;
}