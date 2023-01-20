import { Matrix4, Skeleton } from 't3d';

export class SkinParser {

	static parse(context) {
		const { gltf, accessors, nodes } = context;

		const gltfSkins = gltf.skins;

		if (!gltfSkins) return;

		const skins = gltfSkins.map(skin => {
			const { inverseBindMatrices, joints } = skin;

			const attribute = accessors[inverseBindMatrices];

			const bones = [];
			const boneInverses = [];
			joints.forEach((jointId, index) => {
				const jointNode = nodes[jointId];

				if (jointNode) {
					bones.push(jointNode);

					const boneInverse = new Matrix4();
					if (attribute) {
						boneInverse.fromArray(attribute.buffer.array, index * 16);
					}
					boneInverses.push(boneInverse);
				} else {
					console.warn('Joint ' + jointId + ' could not be found.');
				}
			});

			return new Skeleton(bones, boneInverses);
		});

		context.skins = skins;

		// Bind all skined meshes
		nodes.forEach((node, index) => {
			const { skin: skinID } = gltf.nodes[index];

			if (skinID !== undefined) {
				node.traverse(function(mesh) {
					if (!mesh.isSkinnedMesh) return;
					mesh.bind(skins[skinID], mesh.worldMatrix); // TODO need updateMatrix ?
				});
			}
		});
	}

}