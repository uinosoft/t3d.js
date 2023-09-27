/**
 * VOXMeshBuilder
 */

import {
	Attribute,
	Buffer,
	Color3,
	Geometry,
	Matrix3,
	Matrix4,
	Mesh,
	PhongMaterial,
	VERTEX_COLOR,
	Vector2,
	Vector3
} from 't3d';

/**
 * VOXMeshBuilder
 * Reference https://github.com/daishihmr/vox.js
 */
class VOXMeshBuilder {

	/**
	 * @param {VoxelData} voxelData
	 * @param {Object=} param
	 * @param {number=} param.voxelSize default = 1.0.
	 * @param {boolean=} param.vertexColor default = false.
	 * @param {boolean=} param.optimizeFaces dafalue = true.
	 * @param {boolean=} param.originToBottom dafalue = true.
	 */
	constructor(voxelData, param) {
		if (!VOXMeshBuilder.textureFactory) {
			// eslint-disable-next-line
			if (!vox || !vox.TextureFactory) {
				console.error('VOXMeshBuilder relies on vox.js');
			}
			// eslint-disable-next-line
			VOXMeshBuilder.textureFactory = new vox.TextureFactory();
		}

		param = param || {};
		this.voxelData = voxelData;
		this.voxelSize = param.voxelSize || VOXMeshBuilder.DEFAULT_PARAM.voxelSize;
		this.vertexColor = (param.vertexColor === undefined) ? VOXMeshBuilder.DEFAULT_PARAM.vertexColor : param.vertexColor;
		this.optimizeFaces = (param.optimizeFaces === undefined) ? VOXMeshBuilder.DEFAULT_PARAM.optimizeFaces : param.optimizeFaces;
		this.originToBottom = (param.originToBottom === undefined) ? VOXMeshBuilder.DEFAULT_PARAM.originToBottom : param.originToBottom;

		this.geometry = null;
		this.material = null;

		this._build();
	}

	_build() {
		this.geometry = new Geometry();
		this.material = new PhongMaterial();

		const geometry = new VOXGeometry();

		this.hashTable = createHashTable(this.voxelData.voxels);

		const offsetX = (this.voxelData.size.x - 1) * -0.5;
		const offsetY = (this.voxelData.size.y - 1) * -0.5;
		const offsetZ = (this.originToBottom) ? 0 : (this.voxelData.size.z - 1) * -0.5;
		const matrix = new Matrix4();
		this.voxelData.voxels.forEach(voxel => {
			const voxGeometry = this._createVoxGeometry(voxel);
			if (voxGeometry) {
				matrix.makeTranslation((voxel.x + offsetX) * this.voxelSize, (voxel.z + offsetZ) * this.voxelSize, -(voxel.y + offsetY) * this.voxelSize);
				geometry.merge(voxGeometry, matrix);
			}
		});

		if (this.optimizeFaces) {
			geometry.mergeVertices();
		}
		geometry.computeFaceNormals();

		this.geometry = geometry.createGeometry();

		if (this.vertexColor) {
			this.material.vertexColors = VERTEX_COLOR.RGBA;
		} else {
			this.material.diffuseMap = VOXMeshBuilder.textureFactory.getTexture(this.voxelData);
		}
	}

	_createVoxGeometry(voxel) {
		// find neighboring voxels and ignore coincident faces
		const ignoreFaces = [];
		if (this.optimizeFaces) {
			six.forEach(s => {
				if (this.hashTable.has(voxel.x + s.x, voxel.y + s.y, voxel.z + s.z)) {
					ignoreFaces.push(s.ignoreFace);
				}
			});
		}

		// returns null if adjacent in all 6 directions
		if (ignoreFaces.length === 6) return null;

		// vertex data
		const voxVertices = voxVerticesSource.map(voxel => {
			return new Vector3(voxel.x * this.voxelSize * 0.5, voxel.y * this.voxelSize * 0.5, voxel.z * this.voxelSize * 0.5);
		});

		// face data
		const voxFaces = voxFacesSource.map(f => {
			return {
				faceA: new VOXFace3(f.faceA.a, f.faceA.b, f.faceA.c),
				faceB: new VOXFace3(f.faceB.a, f.faceB.b, f.faceB.c)
			};
		});

		// vertex color
		let color;
		if (this.vertexColor) {
			const c = this.voxelData.palette[voxel.colorIndex];
			color = new Color3(c.r / 255, c.g / 255, c.b / 255);
		}

		const vox = new VOXGeometry();
		vox.faceVertexUvs[0] = [];

		// push faces
		voxFaces.forEach((faces, i) => {
			if (ignoreFaces.indexOf(i) >= 0) return;

			if (this.vertexColor) {
				faces.faceA.color = color;
				faces.faceB.color = color;
			} else {
				const uv = new Vector2((voxel.colorIndex + 0.5) / 256, 0.5);
				vox.faceVertexUvs[0].push([uv, uv, uv], [uv, uv, uv]);
			}
			vox.faces.push(faces.faceA, faces.faceB);
		});

		// extract used vertices
		const usingVertices = {};
		vox.faces.forEach(function(face) {
			usingVertices[face.a] = true;
			usingVertices[face.b] = true;
			usingVertices[face.c] = true;
		});

		// processing to fill up the vertex index of the face
		function splice(index) {
			vox.faces.forEach(face => {
				if (face.a > index) face.a -= 1;
				if (face.b > index) face.b -= 1;
				if (face.c > index) face.c -= 1;
			});
		}

		// add only used vertices
		let j = 0;
		voxVertices.forEach((vertex, i) => {
			if (usingVertices[i]) {
				vox.vertices.push(vertex);
			} else {
				splice(i - j);
				j += 1;
			}
		});

		return vox;
	}

	/**
	 * @return {Texture2D}
	 */
	getTexture() {
		return VOXMeshBuilder.textureFactory.getTexture(this.voxelData);
	}

	/**
	 * @return {Mesh}
	 */
	createMesh() {
		return new Mesh(this.geometry, this.material);
	}

	/**
	 * is it an outward facing voxel?
	 * @return {Boolean}
	 */
	isOuterVoxel(voxel) {
		return six.filter(s => {
			return this.hashTable.has(voxel.x + s.x, voxel.y + s.y, voxel.z + s.z);
		}).length < 6;
	}

}

VOXMeshBuilder.DEFAULT_PARAM = {
	voxelSize: 1.0,
	vertexColor: false,
	optimizeFaces: true,
	originToBottom: true
};

VOXMeshBuilder.textureFactory = undefined;


// correspondence table between adjacent directions and ignored surfaces
const six = [
	{ x: -1, y: 0, z: 0, ignoreFace: 0 },
	{ x: 1, y: 0, z: 0, ignoreFace: 1 },
	{ x: 0, y: -1, z: 0, ignoreFace: 5 },
	{ x: 0, y: 1, z: 0, ignoreFace: 4 },
	{ x: 0, y: 0, z: -1, ignoreFace: 2 },
	{ x: 0, y: 0, z: 1, ignoreFace: 3 }
];

// vertex data source
const voxVerticesSource = [
	{ x: -1, y: 1, z: -1 },
	{ x: 1, y: 1, z: -1 },
	{ x: -1, y: 1, z: 1 },
	{ x: 1, y: 1, z: 1 },
	{ x: -1, y: -1, z: -1 },
	{ x: 1, y: -1, z: -1 },
	{ x: -1, y: -1, z: 1 },
	{ x: 1, y: -1, z: 1 }
];

// face data source
const voxFacesSource = [
	{ faceA: { a: 6, b: 2, c: 0 }, faceB: { a: 6, b: 0, c: 4 } },
	{ faceA: { a: 5, b: 1, c: 3 }, faceB: { a: 5, b: 3, c: 7 } },
	{ faceA: { a: 5, b: 7, c: 6 }, faceB: { a: 5, b: 6, c: 4 } },
	{ faceA: { a: 2, b: 3, c: 1 }, faceB: { a: 2, b: 1, c: 0 } },
	{ faceA: { a: 4, b: 0, c: 1 }, faceB: { a: 4, b: 1, c: 5 } },
	{ faceA: { a: 7, b: 3, c: 2 }, faceB: { a: 7, b: 2, c: 6 } }
];

function hash(x, y, z) {
	return 'x' + x + 'y' + y + 'z' + z;
}

function createHashTable(voxels) {
	const hashTable = {};
	voxels.forEach(function(v) {
		hashTable[hash(v.x, v.y, v.z)] = true;
	});

	hashTable.has = function(x, y, z) {
		return hash(x, y, z) in this;
	};
	return hashTable;
}

class VOXFace3 {

	constructor(a, b, c, normal = new Vector3(), color = new Color3(), materialIndex = 0) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.normal = normal;
		this.color = color;
		this.materialIndex = materialIndex;
	}

	copy(source) {
		this.a = source.a;
		this.b = source.b;
		this.c = source.c;

		this.normal.copy(source.normal);
		this.color.copy(source.color);
		this.materialIndex = source.materialIndex;

		return this;
	}

	clone() {
		return new VOXFace3().copy(this);
	}

}

class VOXGeometry {

	constructor() {
		this.vertices = [];
		this.faces = [];
		this.faceVertexUvs = [[]];
	}

	computeFaceNormals() {
		const cb = new Vector3(), ab = new Vector3();

		for (let f = 0, fl = this.faces.length; f < fl; f++) {
			const face = this.faces[f];

			const vA = this.vertices[face.a];
			const vB = this.vertices[face.b];
			const vC = this.vertices[face.c];

			cb.subVectors(vC, vB);
			ab.subVectors(vA, vB);
			cb.cross(ab);

			cb.normalize();

			face.normal.copy(cb);
		}
	}

	merge(geometry, matrix, materialIndexOffset) {
		let normalMatrix;
		const vertexOffset = this.vertices.length,
			vertices1 = this.vertices,
			vertices2 = geometry.vertices,
			faces1 = this.faces,
			faces2 = geometry.faces,
			uvs1 = this.faceVertexUvs[0],
			uvs2 = geometry.faceVertexUvs[0];

		if (materialIndexOffset === undefined) materialIndexOffset = 0;

		if (matrix !== undefined) {
			normalMatrix = new Matrix3().setFromMatrix4(matrix).inverse().transpose();
		}

		// vertices

		for (let i = 0, il = vertices2.length; i < il; i++) {
			const vertex = vertices2[i];
			const vertexCopy = vertex.clone();
			if (matrix !== undefined) vertexCopy.applyMatrix4(matrix);
			vertices1.push(vertexCopy);
		}

		// faces

		for (let i = 0, il = faces2.length; i < il; i++) {
			const face = faces2[i];

			const faceCopy = new VOXFace3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset);
			faceCopy.normal.copy(face.normal);

			if (normalMatrix !== undefined) {
				faceCopy.normal.applyMatrix3(normalMatrix).normalize();
			}

			faceCopy.color.copy(face.color);

			faceCopy.materialIndex = face.materialIndex + materialIndexOffset;

			faces1.push(faceCopy);
		}

		// uvs

		for (let i = 0, il = uvs2.length; i < il; i++) {
			const uv = uvs2[i], uvCopy = [];

			if (uv === undefined) {
				continue;
			}

			for (let j = 0, jl = uv.length; j < jl; j++) {
				uvCopy.push(uv[j].clone());
			}

			uvs1.push(uvCopy);
		}
	}

	mergeVertices() {
		const verticesMap = {}; // Hashmap for looking up vertices by position coordinates (and making sure they are unique)
		const unique = [], changes = [];

		let v, key;
		const precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
		const precision = Math.pow(10, precisionPoints);
		let i, il, face;
		let indices, j, jl;

		for (i = 0, il = this.vertices.length; i < il; i++) {
			v = this.vertices[i];
			key = Math.round(v.x * precision) + '_' + Math.round(v.y * precision) + '_' + Math.round(v.z * precision);

			if (verticesMap[key] === undefined) {
				verticesMap[key] = i;
				unique.push(this.vertices[i]);
				changes[i] = unique.length - 1;
			} else {
				// console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
				changes[i] = changes[verticesMap[key]];
			}
		}


		// if faces are completely degenerate after merging vertices, we
		// have to remove them from the geometry.
		const faceIndicesToRemove = [];

		for (i = 0, il = this.faces.length; i < il; i++) {
			face = this.faces[i];

			face.a = changes[face.a];
			face.b = changes[face.b];
			face.c = changes[face.c];

			indices = [face.a, face.b, face.c];

			// if any duplicate vertices are found in a Face3
			// we have to remove the face as nothing can be saved
			for (let n = 0; n < 3; n++) {
				if (indices[n] === indices[(n + 1) % 3]) {
					faceIndicesToRemove.push(i);
					break;
				}
			}
		}

		for (i = faceIndicesToRemove.length - 1; i >= 0; i--) {
			const idx = faceIndicesToRemove[i];

			this.faces.splice(idx, 1);

			for (j = 0, jl = this.faceVertexUvs.length; j < jl; j++) {
				this.faceVertexUvs[j].splice(idx, 1);
			}
		}

		// Use unique set of vertices

		const diff = this.vertices.length - unique.length;
		this.vertices = unique;
		return diff;
	}

	createGeometry() {
		const geometry = new Geometry();
		const verticesArray = [];

		function pushFaceData(posArray, normalArray, colorArray, uvArray) {
			for (let i = 0; i < 3; i++) {
				verticesArray.push(posArray[i].x, posArray[i].y, posArray[i].z);
				verticesArray.push(normalArray[i].x, normalArray[i].y, normalArray[i].z);
				verticesArray.push(colorArray[i].r, colorArray[i].g, colorArray[i].b, 1);
				if (uvArray) {
					verticesArray.push(uvArray[i].x, uvArray[i].y);
				} else {
					verticesArray.push(0, 0);
				}
			}
		}

		const faces = this.faces;
		const vertices = this.vertices;
		const faceVertexUvs = this.faceVertexUvs;

		const hasFaceVertexUv = faceVertexUvs[0] && faceVertexUvs[0].length > 0;

		for (let i = 0; i < faces.length; i++) {
			const face = faces[i];
			const normal = face.normal;
			const color = face.color;

			const posArray = [vertices[face.a], vertices[face.b], vertices[face.c]];
			const normalArray = [normal, normal, normal];
			const colorArray = [color, color, color];

			let uvArray;

			if (hasFaceVertexUv === true) {
				const vertexUvs = faceVertexUvs[0][i];

				if (vertexUvs !== undefined) {
					uvArray = [vertexUvs[0], vertexUvs[1], vertexUvs[2]];
				} else {
					console.warn('createGeometry(): Undefined vertexUv ', i);

					uvArray = [new Vector2(), new Vector2(), new Vector2()];
				}
			}

			pushFaceData(posArray, normalArray, colorArray, uvArray);
		}

		const buffer = new Buffer(new Float32Array(verticesArray), 12);
		let attribute;
		attribute = new Attribute(buffer, 3, 0);
		geometry.addAttribute('a_Position', attribute);
		attribute = new Attribute(buffer, 3, 3);
		geometry.addAttribute('a_Normal', attribute);
		attribute = new Attribute(buffer, 4, 6);
		geometry.addAttribute('a_Color', attribute);
		attribute = new Attribute(buffer, 2, 10);
		geometry.addAttribute('a_Uv', attribute);

		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		return geometry;
	}

}

export { VOXMeshBuilder };