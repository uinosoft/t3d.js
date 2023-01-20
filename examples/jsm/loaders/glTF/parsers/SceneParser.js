import { Object3D } from 't3d';

export class SceneParser {

	static parse(context) {
		const { gltf, nodes } = context;

		const roots = gltf.scenes.map(sceneDef => {
			const { name: sceneName = '', nodes: nodeIds = [] } = sceneDef;

			const group = new Object3D();
			group.name = sceneName;

			for (let i = 0; i < nodeIds.length; i++) {
				buildNodeHierachy(nodeIds[i], group, gltf.nodes, nodes);
			}

			return group;
		});

		context.roots = roots;
		context.root = roots[gltf.scene];
	}

}

function buildNodeHierachy(nodeId, parentNode, gltfNodes, nodes) {
	const node = nodes[nodeId];
	const nodeDef = gltfNodes[nodeId];

	parentNode.add(node);

	if (nodeDef.children) {
		const children = nodeDef.children;

		for (let i = 0, il = children.length; i < il; i++) {
			const child = children[i];
			buildNodeHierachy(child, node, gltfNodes, nodes);
		}
	}
}
