import { Object3D, Mesh, SkinnedMesh, Matrix4, Vector3, Quaternion, Attribute, Buffer } from 't3d';
import { GLTFUtils } from '../GLTFUtils.js';
import { InstancedPBRMaterial } from '../../../materials/InstancedPBRMaterial.js';

/**
 * EXT_mesh_gpu_instancing
 * https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Vendor/EXT_mesh_gpu_instancing/README.md
 */
export class EXT_mesh_gpu_instancing {

	static getInstancedMesh(context, gltfNode) {
		const { primitives, accessors } = context;

		const { mesh: meshID, skin: skinID, extensions } = gltfNode;
		const { EXT_mesh_gpu_instancing } = extensions;

		const meshes = primitives[meshID].map(primitive => {
			const { geometry, material, weights } = primitive;

			const instancedGeometry = geometry.clone();
			setInstancedAttributes(instancedGeometry, EXT_mesh_gpu_instancing, accessors);

			const instancedMaterial = new InstancedPBRMaterial(material);

			let mesh;

			if (skinID !== undefined) {
				mesh = new SkinnedMesh(instancedGeometry, instancedMaterial);

				if (geometry.attributes.skinWeight && !geometry.attributes.skinWeight.normalized) {
					GLTFUtils.normalizeSkinWeights(geometry.attributes.skinWeight);
				}
			} else {
				mesh = new Mesh(instancedGeometry, instancedMaterial);

				if (weights) {
					mesh.morphTargetInfluences = weights.slice();
				}
			}

			mesh.frustumCulled = false;

			return mesh;
		});

		if (meshes.length > 1) {
			const parent = new Object3D();
			meshes.forEach(mesh => parent.add(mesh));
			return parent;
		} else {
			return meshes[0];
		}
	}

}

const m = new Matrix4();
const p = new Vector3();
const q = new Quaternion();
const s = new Vector3(1, 1, 1);

function setInstancedAttributes(geometry, instancingDef, accessors) {
	const { attributes: attributesDef } = instancingDef;

	// get instance count
	// all attributes should have the same count
	const attributes = {};
	let count = 0;
	for (const key in attributesDef) {
		attributes[key] = accessors[attributesDef[key]];
		count = attributes[key].buffer.count;
	}

	if (count < 1) return;

	const matrices = new Array(count * 16);

	m.identity();
	p.set(0, 0, 0);
	q.set(0, 0, 0, 1);
	s.set(1, 1, 1);

	const { TRANSLATION, ROTATION, SCALE } = attributes;

	for (let i = 0; i < count; i++) {
		if (TRANSLATION) {
			p.fromArray(
				TRANSLATION.buffer.array,
				i * TRANSLATION.buffer.stride + TRANSLATION.offset,
				TRANSLATION.normalized
			);
		}

		if (ROTATION) {
			q.fromArray(
				ROTATION.buffer.array,
				i * ROTATION.buffer.stride + ROTATION.offset,
				ROTATION.normalized
			);
		}

		if (SCALE) {
			s.fromArray(
				SCALE.buffer.array,
				i * SCALE.buffer.stride + SCALE.offset,
				SCALE.normalized
			);
		}

		m.transform(p, s, q).toArray(matrices, i * 16);
	}

	const instanceMatrixAttribute = new Attribute(new Buffer(new Float32Array(matrices), 16));
	instanceMatrixAttribute.divisor = 1;
	geometry.addAttribute('instanceMatrix', instanceMatrixAttribute);

	geometry.instanceCount = count;

	return geometry;
}