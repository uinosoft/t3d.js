import {
	AnimationAction,
	AnimationMixer,
	Attribute,
	Bone,
	Buffer,
	FileLoader,
	Geometry,
	KeyframeClip,
	Matrix4,
	Mesh,
	Object3D,
	PhongMaterial,
	QuaternionKeyframeTrack,
	Skeleton,
	SkinnedMesh,
	VectorKeyframeTrack,
	TEXTURE_WRAP
} from 't3d';
import { Texture2DLoader } from '../loaders/Texture2DLoader.js';

/**
 * AssimpJsonLoader
 * @class
 *
 * Loader for models imported with Open Asset Import Library (http://assimp.sf.net)
 * through assimp2json (https://github.com/acgessler/assimp2json).
 *
 * Supports any input format that assimp supports, including 3ds, obj, dae, blend,
 * fbx, x, ms3d, lwo (and many more).
 */
class AssimpJsonLoader {

	constructor() {
		this.texturePath = './';
		this.textureLoader = new Texture2DLoader();
	}

	load(url, onLoad, onProgress, onError) {
		this.texturePath = this.extractUrlBase(url);

		const loader = new FileLoader();
		loader.setResponseType('json').load(url, json => {
			const result = this.parse(json);
			onLoad(result.object, result.animation);
		}, onProgress, onError);
	}

	parse(json) {
		const nodeTree = this.parseNodeTree(json.rootnode);

		const meshes = this.parseList(json.meshes, this.parseMesh);
		const materials = this.parseList(json.materials, this.parseMaterial);

		const boneMap = {};

		const skeletons = {};
		for (let i = 0; i < json.meshes.length; i++) {
			if (json.meshes[i].bones) {
				skeletons[i] = this.parseSkeleton(json.meshes[i].name, json.meshes[i].bones, nodeTree, boneMap);
			}
		}

		let animation;
		if (json.animations) {
			animation = this.parseAnimations(json.animations, boneMap);
		}

		return {
			object: this.parseObject(json, json.rootnode, meshes, materials, skeletons),
			animation: animation
		};
	}

	parseNodeTree(node) {
		const object = new Object3D();
		object.name = node.name;

		// save local matrix
		object.matrix.fromArray(node.transformation).transpose();

		if (node.children) {
			for (let i = 0; i < node.children.length; i++) {
				const child = this.parseNodeTree(node.children[i]);
				object.add(child);
			}
		}

		return object;
	}

	parseList(json, handler) {
		const arrays = new Array(json.length);
		for (let i = 0; i < json.length; i++) {
			arrays[i] = handler.call(this, json[i]);
		}
		return arrays;
	}

	parseSkeleton(meshName, bonesInfo, nodeTree, boneMap) {
		const meshParents = [];
		let mesh = nodeTree.getObjectByName(meshName);
		while (mesh.parent) {
			meshParents.push(mesh.parent.name);
			mesh = mesh.parent;
		}
		meshParents.push(mesh);

		// mark all of its parents as root until 1) find the mesh's node or 2) the parent of the mesh's node
		function getRoot(name) {
			let node = nodeTree.getObjectByName(name);
			let parent;
			while (node.parent) {
				parent = node.parent;

				if (meshParents.indexOf(parent.name) > -1) {
					break;
				} else {
					node = parent;
				}
			}
			return node.name;
		}

		const allbones = [];
		const boneInverses = [];
		const rootBones = [];

		let rootNode = nodeTree.getObjectByName(getRoot(bonesInfo[0].name));
		let rootBone = this.cloneNodeToBones(rootNode, boneMap);
		rootBones.push(rootBone);

		for (let i = 0; i < bonesInfo.length; i++) {
			const boneInfo = bonesInfo[i];

			// get bone & push
			let bone = rootBone.getObjectByName(boneInfo.name);

			if (!bone) {
				rootNode = nodeTree.getObjectByName(boneInfo.name);
				rootBone = this.cloneNodeToBones(rootNode, boneMap);
				rootBones.push(rootBone);
				bone = rootBone.getObjectByName(boneInfo.name);
			}

			const offset = new Matrix4();
			offset.fromArray(bonesInfo[i].offsetmatrix).transpose();
			boneInverses.push(offset);

			allbones.push(bone);
		}

		return {
			skeleton: new Skeleton(allbones, boneInverses),
			rootBones: rootBones
		};
	}

	cloneNodeToBones(node, boneMap) {
		const bone = new Bone();
		bone.name = node.name;
		bone.matrix.copy(node.matrix);
		bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);

		if (!boneMap[node.name]) {
			boneMap[node.name] = [];
		}
		boneMap[node.name].push(bone);

		if (node.children) {
			for (let i = 0; i < node.children.length; i++) {
				const child = this.cloneNodeToBones(node.children[i], boneMap);
				bone.add(child);
			}
		}

		return bone;
	}

	parseAnimations(json, boneMap) {
		const animation = new AnimationMixer();

		for (let i = 0; i < json.length; i++) {
			const anim = json[i];
			const name = anim.name;
			const channels = anim.channels;

			const tracks = [];
			let duration = 0;

			for (let j = 0; j < channels.length; j++) {
				const channel = channels[j];
				const boneName = channel.name;

				if (!boneMap[boneName]) {
					console.log(boneName);
					continue;
				}

				for (let n = 0; n < boneMap[boneName].length; n++) {
					const bone = boneMap[boneName][n];

					const times_p = [], values_p = [];
					for (let k = 0; k < channel.positionkeys.length; k++) {
						const frame = channel.positionkeys[k];
						times_p.push(frame[0]);
						values_p.push(frame[1][0], frame[1][1], frame[1][2]);
						if (frame[0] > duration) {
							duration = frame[0];
						}
					}
					const positionTrack = new VectorKeyframeTrack(bone, 'position', times_p, values_p);
					tracks.push(positionTrack);

					const times_r = [], values_r = [];
					for (let k = 0; k < channel.rotationkeys.length; k++) {
						const frame = channel.rotationkeys[k];
						times_r.push(frame[0]);
						values_r.push(frame[1][1], frame[1][2], frame[1][3], frame[1][0]);
						if (frame[0] > duration) {
							duration = frame[0];
						}
					}
					const rotationTrack = new QuaternionKeyframeTrack(bone, 'quaternion', times_r, values_r);
					tracks.push(rotationTrack);

					const times_s = [], values_s = [];
					for (let k = 0; k < channel.scalingkeys.length; k++) {
						const frame = channel.scalingkeys[k];
						times_s.push(frame[0]);
						values_s.push(frame[1][0], frame[1][1], frame[1][2]);
						if (frame[0] > duration) {
							duration = frame[0];
						}
					}
					const scalingTrack = new VectorKeyframeTrack(bone, 'scale', times_s, values_s);
					tracks.push(scalingTrack);
				}
			}

			const clip = new KeyframeClip(name, tracks, duration);
			const action = new AnimationAction(clip);

			animation.addAction(action);
		}

		return animation;
	}

	parseObject(json, node, meshes, materials, skeletons) {
		const group = new Object3D();

		group.name = node.name || '';
		group.matrix.fromArray(node.transformation).transpose();
		group.matrix.decompose(group.position, group.quaternion, group.scale);

		for (let i = 0, mesh; node.meshes && i < node.meshes.length; i++) {
			const idx = node.meshes[i];
			const material = materials[json.meshes[idx].materialindex];
			if (skeletons[idx]) {
				mesh = new SkinnedMesh(meshes[idx], material);
				const rootBones = skeletons[idx].rootBones;
				for (let j = 0, l = rootBones.length; j < l; j++) {
					group.add(rootBones[j]);
				}
				mesh.bind(skeletons[idx].skeleton, mesh.worldMatrix);
			} else {
				mesh = new Mesh(meshes[idx], material);
			}
			mesh.frustumCulled = false;
			group.add(mesh);
		}

		for (let i = 0; node.children && i < node.children.length; i++) {
			group.add(this.parseObject(json, node.children[i], meshes, materials, skeletons));
		}

		return group;
	}

	parseMaterial(json) {
		const material = new PhongMaterial();

		let diffuseMap = null;
		let normalMap = null;
		let prop;

		for (const key in json.properties) {
			prop = json.properties[key];

			if (prop.key === '$tex.file') {
				// prop.semantic gives the type of the texture
				// 1: diffuse
				// 2: specular map
				// 3: ambient map
				// 4: emissive map
				// 5: height map (bumps)
				// 6: normal map
				// 7: shininess(glow) map
				// 8: opacity map
				// 9: displacement map
				// 10: light map
				// 11: reflection map
				// 12: unknown map
				if (prop.semantic == 1) {
					let material_url = this.texturePath + prop.value;
					material_url = material_url.replace(/.\\/g, '');
					diffuseMap = this.textureLoader.load(material_url);
					// TODO: read texture settings from assimp.
					// Wrapping is the default, though.
					diffuseMap.wrapS = diffuseMap.wrapT = TEXTURE_WRAP.REPEAT;
				} else if (prop.semantic == 2) {
					// TODO
				} else if (prop.semantic == 5) {
					// TODO
				} else if (prop.semantic == 6) {
					let material_url = this.texturePath + prop.value;
					material_url = material_url.replace(/.\\/g, '');
					normalMap = this.textureLoader.load(material_url);
					// TODO: read texture settings from assimp.
					// Wrapping is the default, though.
					normalMap.wrapS = normalMap.wrapT = TEXTURE_WRAP.REPEAT;
				}
			} else if (prop.key === '?mat.name') {
				// TODO
			} else if (prop.key === '$clr.ambient') {
				// TODO
			} else if (prop.key === '$clr.diffuse') {
				material.diffuse.fromArray(prop.value);
			} else if (prop.key === '$clr.specular') {
				material.specular.fromArray(prop.value);
			} else if (prop.key === '$clr.emissive') {
				material.emissive.fromArray(prop.value);
			} else if (prop.key === '$mat.opacity') {
				material.transparent = prop.value < 1;
				material.opacity = prop.value;
			} else if (prop.key === '$mat.shadingm') {
				// Flat shading?
				if (prop.value === 1) {
					// TODO
				}
			} else if (prop.key === '$mat.shininess') {
				material.shininess = prop.value;
			}
		}

		material.diffuseMap = diffuseMap;
		material.normalMap = normalMap;

		return material;
	}

	parseMesh(json) {
		const geometry = new Geometry();

		const faces = json.faces;
		const vertices = json.vertices;
		const normals = json.normals;
		const texturecoords = json.texturecoords && json.texturecoords[0];
		const verticesCount = vertices.length / 3;
		const g_v = [];

		// bones
		const bones = json.bones;
		const bind = [];
		if (bones) {
			for (let i = 0; i < verticesCount; i++) {
				bind[i] = [];
			}

			let bone, weights, weight;
			for (let i = 0; i < bones.length; i++) {
				bone = bones[i];
				weights = bone.weights;
				for (let j = 0; j < weights.length; j++) {
					weight = weights[j];
					bind[weight[0]].push({
						index: i,
						weight: weight[1]
					});
				}
			}

			// every vertex bind 4 bones
			for (let i = 0; i < verticesCount; i++) {
				const ver = bind[i];

				ver.sort(function(a, b) {
					return b.weight - a.weight;
				});

				// identify
				let w1 = ver[0] ? ver[0].weight : 0;
				let w2 = ver[1] ? ver[1].weight : 0;
				let w3 = ver[2] ? ver[2].weight : 0;
				let w4 = ver[3] ? ver[3].weight : 0;
				const sum = w1 + w2 + w3 + w4;
				if (sum > 0) {
					w1 = w1 / sum;
					w2 = w2 / sum;
					w3 = w3 / sum;
					w4 = w4 / sum;
				}
				ver[0] && (ver[0].weight = w1);
				ver[1] && (ver[1].weight = w2);
				ver[2] && (ver[2].weight = w3);
				ver[3] && (ver[3].weight = w4);
			}
		}

		for (let i = 0; i < verticesCount; i++) {
			g_v.push(vertices[i * 3 + 0]);
			g_v.push(vertices[i * 3 + 1]);
			g_v.push(vertices[i * 3 + 2]);

			g_v.push(normals[i * 3 + 0]);
			g_v.push(normals[i * 3 + 1]);
			g_v.push(normals[i * 3 + 2]);

			g_v.push(0);
			g_v.push(0);
			g_v.push(0);

			if (bones) {
				const ver = bind[i];
				// bones index
				for (let k = 0; k < 4; k++) {
					if (ver[k]) {
						g_v.push(ver[k].index);
					} else {
						g_v.push(0);
					}
				}
			} else {
				// v color
				g_v.push(1);
				g_v.push(1);
				g_v.push(1);
				g_v.push(1);
			}

			// uv1
			if (texturecoords) {
				g_v.push(texturecoords[i * 2 + 0]);
				g_v.push(texturecoords[i * 2 + 1]);
			} else {
				g_v.push(0);
				g_v.push(0);
			}

			if (bones) {
				// bones weight
				const ver = bind[i];
				// bones index
				for (let k = 0; k < 4; k++) {
					if (ver[k]) {
						g_v.push(ver[k].weight);
					} else {
						g_v.push(0);
					}
				}
			} else {
				// uv2
				g_v.push(0);
				g_v.push(0);
			}
		}

		if (bones) {
			const buffer = new Buffer(new Float32Array(g_v), 19);
			let attribute;
			attribute = new Attribute(buffer, 3, 0);
			geometry.addAttribute('a_Position', attribute);
			attribute = new Attribute(buffer, 3, 3);
			geometry.addAttribute('a_Normal', attribute);
			attribute = new Attribute(buffer, 4, 9);
			geometry.addAttribute('skinIndex', attribute);
			attribute = new Attribute(buffer, 4, 15);
			geometry.addAttribute('skinWeight', attribute);
			attribute = new Attribute(buffer, 2, 13);
			geometry.addAttribute('a_Uv', attribute);
		} else {
			const buffer = new Buffer(new Float32Array(g_v), 17);
			let attribute;
			attribute = new Attribute(buffer, 3, 0);
			geometry.addAttribute('a_Position', attribute);
			attribute = new Attribute(buffer, 3, 3);
			geometry.addAttribute('a_Normal', attribute);
			attribute = new Attribute(buffer, 4, 9);
			geometry.addAttribute('a_Color', attribute);
			attribute = new Attribute(buffer, 2, 13);
			geometry.addAttribute('a_Uv', attribute);
		}

		const g_i = [];
		for (let i = 0; i < faces.length; i++) {
			g_i.push(faces[i][0]);
			g_i.push(faces[i][1]);
			g_i.push(faces[i][2]);
		}

		geometry.setIndex(g_i);

		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		return geometry;
	}

	extractUrlBase(url) {
		const parts = url.split('/');
		parts.pop();
		return (parts.length < 1 ? '.' : parts.join('/')) + '/';
	}

}

export { AssimpJsonLoader };