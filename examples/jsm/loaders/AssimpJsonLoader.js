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

var AssimpJsonLoader = function() {
	this.texturePath = "./";
	this.textureLoader = new Texture2DLoader();
}

AssimpJsonLoader.prototype.load = function(url, onLoad, onProgress, onError) {
	this.texturePath = this.extractUrlBase(url);

	var loader = new FileLoader();
	loader.setResponseType("json").load(url, function(json) {
		console.log(json)
		var result = this.parse(json);
		onLoad(result.object, result.animation);
	}.bind(this), onProgress, onError);
}

AssimpJsonLoader.prototype.parseNodeTree = function(node) {
	var object = new Object3D();
	object.name = node.name;

	// save local matrix
	object.matrix.fromArray(node.transformation).transpose();

	if (node.children) {
		for (var i = 0; i < node.children.length; i++) {
			var child = this.parseNodeTree(node.children[i]);

			object.add(child);
		}
	}

	return object;
}

AssimpJsonLoader.prototype.cloneNodeToBones = function(node, boneMap) {
	var bone = new Bone();
	bone.name = node.name;
	bone.matrix.copy(node.matrix);
	bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);

	if (!boneMap[node.name]) {
		boneMap[node.name] = [];
	}
	boneMap[node.name].push(bone);

	if (node.children) {
		for (var i = 0; i < node.children.length; i++) {
			var child = this.cloneNodeToBones(node.children[i], boneMap);
			bone.add(child);
		}
	}

	return bone;
}

AssimpJsonLoader.prototype.parseSkeleton = function(meshName, bonesInfo, nodeTree, boneMap) {
	var meshParents = [];
	var mesh = nodeTree.getObjectByName(meshName);
	while (mesh.parent) {
		meshParents.push(mesh.parent.name);
		mesh = mesh.parent;
	}
	meshParents.push(mesh);

	// mark all of its parents as root until 1) find the mesh's node or 2) the parent of the mesh's node
	function getRoot(name) {
		var node = nodeTree.getObjectByName(name);
		var parent;
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

	var allbones = [];
	var boneInverses = [];
	var rootBones = [];

	var skeleton;

	var rootNode = nodeTree.getObjectByName(getRoot(bonesInfo[0].name));
	var rootBone = this.cloneNodeToBones(rootNode, boneMap);
	rootBones.push(rootBone);

	for (var i = 0; i < bonesInfo.length; i++) {
		var boneInfo = bonesInfo[i];

		// get bone & push
		var bone = rootBone.getObjectByName(boneInfo.name);

		if (!bone) {
			rootNode = nodeTree.getObjectByName(boneInfo.name);
			rootBone = this.cloneNodeToBones(rootNode, boneMap);
			rootBones.push(rootBone);
			bone = rootBone.getObjectByName(boneInfo.name);
		}

		var offset = new Matrix4();
		offset.fromArray(bonesInfo[i].offsetmatrix).transpose();
		boneInverses.push(offset);

		allbones.push(bone);
	}

	// generate skeleton
	skeleton = new Skeleton(allbones, boneInverses);

	return {
		skeleton: skeleton,
		rootBones: rootBones
	};
}

AssimpJsonLoader.prototype.parseAnimations = function(json, boneMap) {
	var animation = new AnimationMixer();

	for (var i = 0; i < json.length; i++) {
		var anim = json[i];
		var name = anim.name;
		var channels = anim.channels;

		var tracks = [];
		var duration = 0;

		for (var j = 0; j < channels.length; j++) {
			var channel = channels[j];
			var boneName = channel.name;

			if (!boneMap[boneName]) {
				console.log(boneName);
				continue;
			}

			for (var k = 0; k < boneMap[boneName].length; k++) {
				var bone = boneMap[boneName][k];

				var times = [], values = [];
				for (var k = 0; k < channel.positionkeys.length; k++) {
					var frame = channel.positionkeys[k];
					times.push(frame[0]);
					values.push(frame[1][0], frame[1][1], frame[1][2]);
					if (frame[0] > duration) {
						duration = frame[0];
					}
				}
				var positionTrack = new VectorKeyframeTrack(bone, "position", times, values);
				clip.tracks.push(positionTrack);

				var times = [], values = [];
				for (var k = 0; k < channel.rotationkeys.length; k++) {
					var frame = channel.rotationkeys[k];
					times.push(frame[0]);
					values.push(frame[1][1], frame[1][2], frame[1][3], frame[1][0]);
					if (frame[0] > duration) {
						duration = frame[0];
					}
				}
				var rotationTrack = new QuaternionKeyframeTrack(bone, "quaternion", times, values);
				clip.tracks.push(rotationTrack);

				var times = [], values = [];
				for (var k = 0; k < channel.scalingkeys.length; k++) {
					var frame = channel.scalingkeys[k];
					times.push(frame[0]);
					values.push(frame[1][0], frame[1][1], frame[1][2]);
					if (frame[0] > duration) {
						duration = frame[0];
					}
				}
				var scalingTrack = new VectorKeyframeTrack(bone, "scale", times, values);
				clip.tracks.push(scalingTrack);
			}
		}

		var clip = new KeyframeClip(name, tracks, duration);
		var action = new AnimationAction(clip);

		animation.addAction(action);
	}

	return animation;
}

AssimpJsonLoader.prototype.parse = function(json) {
	var nodeTree = this.parseNodeTree(json.rootnode);

	var meshes = this.parseList(json.meshes, this.parseMesh);
	var materials = this.parseList(json.materials, this.parseMaterial);

	var boneMap = {};

	var skeletons = {};
	for (var i = 0; i < json.meshes.length; i++) {
		if (json.meshes[i].bones) {
			skeletons[i] = this.parseSkeleton(json.meshes[i].name, json.meshes[i].bones, nodeTree, boneMap);
		}
	}

	// animation
	var animation;
	if (json.animations) {
		animation = this.parseAnimations(json.animations, boneMap);
	}

	return {
		object: this.parseObject(json, json.rootnode, meshes, materials, skeletons),
		animation: animation
	};
}

AssimpJsonLoader.prototype.parseList = function(json, handler) {
	var arrays = new Array(json.length);
	for (var i = 0; i < json.length; ++i) {
		arrays[i] = handler.call(this, json[i]);
	}
	return arrays;
}

AssimpJsonLoader.prototype.parseMaterial = function(json) {
	var material = new PhongMaterial();

	var diffuseMap = null;
	var normalMap = null;

	var prop;

	for (var key in json.properties) {
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
				var material_url = this.texturePath + prop.value;
				material_url = material_url.replace(/.\\/g, '');
				diffuseMap = this.textureLoader.load(material_url);
				// TODO: read texture settings from assimp.
				// Wrapping is the default, though.
				diffuseMap.wrapS = diffuseMap.wrapT = TEXTURE_WRAP.REPEAT;
			} else if (prop.semantic == 2) {

			} else if (prop.semantic == 5) {

			} else if (prop.semantic == 6) {
				var material_url = this.texturePath + prop.value;
				material_url = material_url.replace(/.\\/g, '');
				normalMap = this.textureLoader.load(material_url);
				// TODO: read texture settings from assimp.
				// Wrapping is the default, though.
				normalMap.wrapS = normalMap.wrapT = TEXTURE_WRAP.REPEAT;
			}
		} else if (prop.key === '?mat.name') {

		} else if (prop.key === '$clr.ambient') {

		} else if (prop.key === '$clr.diffuse') {
			var value = prop.value;
			material.diffuse.setRGB(value[0], value[1], value[2]);
		} else if (prop.key === '$clr.specular') {
			var value = prop.value;
			material.specular.setRGB(value[0], value[1], value[2]);
		} else if (prop.key === '$clr.emissive') {
			var value = prop.value;
			material.emissive.setRGB(value[0], value[1], value[2]);
		} else if (prop.key === '$mat.opacity') {
			material.transparent = prop.value < 1;
			material.opacity = prop.value;
		} else if (prop.key === '$mat.shadingm') {
			// Flat shading?
			if (prop.value === 1) {

			}
		} else if (prop.key === '$mat.shininess') {
			material.shininess = prop.value;
		}
	}

	material.diffuseMap = diffuseMap;
	material.normalMap = normalMap;

	return material;
}

AssimpJsonLoader.prototype.parseMesh = function(json) {
	var geometry = new Geometry();

	var faces = json.faces;
	var vertices = json.vertices;
	var normals = json.normals;
	var texturecoords = json.texturecoords && json.texturecoords[0];
	var verticesCount = vertices.length / 3;
	var g_v = [];

	// bones
	var bones = json.bones;
	var bind = [];
	if (bones) {
		for (var i = 0; i < verticesCount; i++) {
			bind[i] = [];
		}

		var bone, weights, weight;
		for (var i = 0; i < bones.length; i++) {
			bone = bones[i];
			weights = bone.weights;
			for (var j = 0; j < weights.length; j++) {
				weight = weights[j];
				bind[weight[0]].push({
					index: i,
					weight: weight[1]
				});
			}
		}

		// every vertex bind 4 bones
		for (var i = 0; i < verticesCount; i++) {
			var ver = bind[i];

			ver.sort(function(a, b) {
				return b.weight - a.weight;
			});

			// identify
			var w1 = ver[0] ? ver[0].weight : 0;
			var w2 = ver[1] ? ver[1].weight : 0;
			var w3 = ver[2] ? ver[2].weight : 0;
			var w4 = ver[3] ? ver[3].weight : 0;
			var sum = w1 + w2 + w3 + w4;
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

	for (var i = 0; i < verticesCount; i++) {
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
			var ver = bind[i];
			// bones index
			for (var k = 0; k < 4; k++) {
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
			var ver = bind[i];
			// bones index
			for (var k = 0; k < 4; k++) {
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
		var buffer = new Buffer(new Float32Array(g_v), 19);
		var attribute;
		attribute = new Attribute(buffer, 3, 0);
		geometry.addAttribute("a_Position", attribute);
		attribute = new Attribute(buffer, 3, 3);
		geometry.addAttribute("a_Normal", attribute);
		attribute = new Attribute(buffer, 4, 9);
		geometry.addAttribute("skinIndex", attribute);
		attribute = new Attribute(buffer, 4, 15);
		geometry.addAttribute("skinWeight", attribute);
		attribute = new Attribute(buffer, 2, 13);
		geometry.addAttribute("a_Uv", attribute);
	} else {
		var buffer = new Buffer(new Float32Array(g_v), 17);
		var attribute;
		attribute = new Attribute(buffer, 3, 0);
		geometry.addAttribute("a_Position", attribute);
		attribute = new Attribute(buffer, 3, 3);
		geometry.addAttribute("a_Normal", attribute);
		attribute = new Attribute(buffer, 4, 9);
		geometry.addAttribute("a_Color", attribute);
		attribute = new Attribute(buffer, 2, 13);
		geometry.addAttribute("a_Uv", attribute);
	}

	var g_i = [];
	for (var i = 0; i < faces.length; i++) {
		g_i.push(faces[i][0]);
		g_i.push(faces[i][1]);
		g_i.push(faces[i][2]);
	}

	geometry.setIndex(g_i);

	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();

	return geometry;
}

AssimpJsonLoader.prototype.parseObject = function(json, node, meshes, materials, skeletons) {
	var group = new Object3D();

	group.name = node.name || "";
	group.matrix.fromArray(node.transformation).transpose();
	group.matrix.decompose(group.position, group.quaternion, group.scale);

	for (var i = 0, mesh; node.meshes && i < node.meshes.length; ++i) {
		var idx = node.meshes[i];
		var material = materials[json.meshes[idx].materialindex];
		if (skeletons[idx]) {
			mesh = new SkinnedMesh(meshes[idx], material);
			var rootBones = skeletons[idx].rootBones;
			for (var j = 0, l = rootBones.length; j < l; j++) {
				group.add(rootBones[j]);
			}
			mesh.bind(skeletons[idx].skeleton, mesh.worldMatrix);
		} else {
			mesh = new Mesh(meshes[idx], material);
		}
		mesh.frustumCulled = false;
		group.add(mesh);
	}

	for (var i = 0; node.children && i < node.children.length; ++i) {
		group.add(this.parseObject(json, node.children[i], meshes, materials, skeletons));
	}

	return group;
}

AssimpJsonLoader.prototype.extractUrlBase = function(url) {
	var parts = url.split('/');
	parts.pop();
	return (parts.length < 1 ? '.' : parts.join('/')) + '/';
}

export { AssimpJsonLoader };