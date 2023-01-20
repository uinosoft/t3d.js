import { GLTFUtils } from '../GLTFUtils.js';

// Marks the special nodes/meshes in json for efficient parse.
export class ReferenceParser {

	static parse(context, loader) {
		const { gltf, path } = context;
		const { nodes = [], skins = [], meshes = [], buffers, images } = gltf;

		// Nothing in the node definition indicates whether it is a Bone or an
		// Object3D. Use the skins' joint references to mark bones.
		skins.forEach(skin => {
			const { joints = [] } = skin;
			joints.forEach(joint => {
				nodes[joint].isBone = true;
			});
		});

		// Nothing in the mesh definition indicates whether it is
		// a SkinnedMesh or Mesh. Use the node's mesh reference
		// to mark SkinnedMesh if node has skin.
		nodes.forEach(node => {
			if (node.mesh !== undefined) {
				if (node.skin !== undefined) {
					meshes[node.mesh].isSkinned = true;
				}
			}
		});

		// setup loading list for detail load progress
		if (loader.detailLoadProgress) {
			const loadItems = new Set();

			if (buffers) {
				buffers.forEach(buffer => {
					if (!buffer.uri) {
						// glb or other
						return;
					}
					const bufferUrl = GLTFUtils.resolveURL(buffer.uri, path);
					loadItems.add(bufferUrl);
				});
			}

			if (images) {
				images.forEach((image, index) => {
					const { uri, bufferView: bufferViewIndex } = image;

					let imageUrl = uri;

					if (bufferViewIndex !== undefined) {
						imageUrl = 'blob<' + index + '>'; // fake url for blob image
					}

					imageUrl = GLTFUtils.resolveURL(imageUrl, path);

					loadItems.add(imageUrl);
				});
			}

			loadItems.forEach(item => loader.manager.itemStart(item));

			context.loadItems = loadItems;
		}
	}

}