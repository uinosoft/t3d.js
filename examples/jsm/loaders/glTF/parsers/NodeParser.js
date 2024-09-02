import { Bone, Camera, Object3D, Mesh, SkinnedMesh } from 't3d';
import { GLTFUtils } from '../GLTFUtils.js';

export class NodeParser {

	static parse(context, loader) {
		const {
			gltf: { nodes: gltfNodes, cameras: gltfCameras, extensions: gltfExtensions }
		} = context;

		if (!gltfNodes) return;

		const lightsExt = loader.extensions.get('KHR_lights_punctual');
		const instancingExt = loader.extensions.get('EXT_mesh_gpu_instancing');

		const cameras = [];
		const lights = [];
		const nodes = gltfNodes.map(gltfNode => {
			const {
				matrix, translation, rotation, scale,
				camera: cameraID, mesh: meshID,
				extensions = {}
			} = gltfNode;
			const { KHR_lights_punctual, EXT_mesh_gpu_instancing } = extensions;

			let node = null;

			if (gltfNode.isBone) {
				// .isBone isn't in glTF spec. Marked in IndexParser
				node = new Bone();
			} else if (meshID !== undefined) {
				if (EXT_mesh_gpu_instancing && instancingExt) {
					node = instancingExt.getInstancedMesh(context, gltfNode);
				} else {
					node = createMesh(context, gltfNode);
				}
			} else if (cameraID !== undefined) {
				node = createCamera(gltfCameras[cameraID]);
				cameras.push(node);
			} else if (KHR_lights_punctual && lightsExt) {
				const lightIndex = KHR_lights_punctual.light;
				const gltfLights = gltfExtensions.KHR_lights_punctual.lights;
				node = lightsExt.getLight(gltfLights[lightIndex]);
				lights.push(node);
			} else {
				node = new Object3D();
			}

			node.name = gltfNode.name || '';
			if (!!node.name && node.children.length > 0) {
				for (let i = 0; i < node.children.length; i++) {
					node.children[i].name = node.name + '_' + i;
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

		context.nodes = nodes;
		context.cameras = cameras;
		context.lights = lights;
	}

}

function createCamera(cameraDef) {
	const { orthographic, perspective, type } = cameraDef;

	const camera = new Camera();

	if (type == 'perspective') {
		const { aspectRatio, yfov, zfar, znear } = perspective;
		camera.setPerspective(yfov, aspectRatio || 1, znear || 1, zfar || 2e6);
	} else if (type == 'orthographic') {
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
				GLTFUtils.normalizeSkinWeights(geometry.attributes.skinWeight);
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