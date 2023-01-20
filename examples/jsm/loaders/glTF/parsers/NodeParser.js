import { Bone, Camera, Object3D, Mesh, SkinnedMesh, Vector4 } from 't3d';
import { GLTFUtils } from "../GLTFUtils.js";
import { KHR_lights_punctual as _KHR_lights_punctual } from '../extensions/KHR_lights_punctual.js';

export class NodeParser {

	static parse(context) {
		const {
			gltf: { nodes: gltfNodes, cameras: gltfCameras, extensions: gltfExtensions },
		} = context;

		if (!gltfNodes) return;

		const nameCache = new Set();

		const cameras = [];
		const lights = [];
		const nodes = gltfNodes.map(gltfNode => {
			const {
				matrix, translation, rotation, scale,
				camera: cameraID, mesh: meshID,
				extensions = {}
			} = gltfNode;
			const { KHR_lights_punctual } = extensions;

			let node = null;

			if (gltfNode.isBone) {
				// .isBone isn't in glTF spec. Marked in IndexParser
				node = new Bone();
			} else if (meshID !== undefined) {
				node = createMesh(context, gltfNode);
			} else if (cameraID !== undefined) {
				node = createCamera(gltfCameras[cameraID]);
				cameras.push(node);
			} else if (KHR_lights_punctual) {
				const lightIndex = KHR_lights_punctual.light;
				const gltfLights = gltfExtensions.KHR_lights_punctual.lights;
				node = _KHR_lights_punctual.getLight(gltfLights[lightIndex]);
				lights.push(node);
			} else {
				node = new Object3D();
			}

			if (gltfNode.name !== undefined) {
				node.name = createUniqueName(gltfNode.name, nameCache);
				if (node.children.length > 0) {
					for (let i = 0; i < node.children.length; i++) {
						node.children[i].name = node.name + '_' + i;
					}
				}
			}

			if (matrix !== undefined) {
				node.matrix.fromArray(matrix);
				node.matrix.decompose(node.position, node.quaternion, node.scale);
			} else {
				if (translation !== undefined) {
					node.position.fromArray(translation);
				}

				if (rotation !== undefined) {
					node.quaternion.fromArray(rotation);
				}

				if (scale !== undefined) {
					node.scale.fromArray(scale);
				}
			}

			return node;
		});

		nameCache.clear();

		context.nodes = nodes;
		context.cameras = cameras;
		context.lights = lights;
	}

}

function createUniqueName(originalName, set) {
	const sanitizedName = GLTFUtils.sanitizeNodeName(originalName || '');

	let name = sanitizedName;

	for (let i = 1; set.has(name); ++i) {
		name = sanitizedName + '-' + i;
	}

	set.add(name);

	return name;
}

function createCamera(cameraDef) {
	const { orthographic, perspective, type } = cameraDef;

	const camera = new Camera();

	if (type == "perspective") {
		const { aspectRatio, yfov, zfar, znear } = perspective;
		camera.setPerspective(yfov, aspectRatio || 1, znear || 1, zfar || 2e6);
	} else if (type == "orthographic") {
		const { xmag, ymag, zfar, znear } = orthographic;
		// https:// github.com/KhronosGroup/glTF/issues/1663
		camera.setOrtho(-xmag, xmag, -ymag, ymag, znear || 1, zfar || 2e6);
	}

	return camera;
}

function createMesh(context, gltfNode) {
	const { primitives } = context;

	const { mesh: meshID, skin: skinID } = gltfNode;

	const meshes = primitives[meshID].map(primitive => {
		const { geometry, material, weights } = primitive;

		let mesh;

		if (skinID !== undefined) {
			mesh = new SkinnedMesh(geometry, material);

			if (geometry.attributes.skinWeight && !geometry.attributes.skinWeight.normalized) {
				normalizeSkinWeights(geometry.attributes.skinWeight);
			}
		} else {
			mesh = new Mesh(geometry, material);

			if (weights) {
				mesh.morphTargetInfluences = weights.slice();
			}
		}

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

const _vec4_1 = new Vector4();

function normalizeSkinWeights(skinWeight) {
	const offset = skinWeight.offset;
	const buffer = skinWeight.buffer;
	const stride = buffer.stride;
	for (let i = 0, l = buffer.count; i < l; i++) {
		_vec4_1.fromArray(buffer.array, i * stride + offset);
		const scale = 1.0 / _vec4_1.getManhattanLength();
		if (scale !== Infinity) {
			_vec4_1.multiplyScalar(scale);
		} else {
			_vec4_1.set(1, 0, 0, 0); // do something reasonable
		}
		_vec4_1.toArray(buffer.array, i * stride + offset);
	}
}