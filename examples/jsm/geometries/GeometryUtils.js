import {
	Attribute,
	Buffer,
	Geometry,
	Matrix3,
	Vector2,
	Vector3
} from 't3d';

class GeometryUtils {

	/**
	 * @param {Geometry} geometry
	 */
	static computeNormals(geometry) {
		const index = geometry.index;
		const attributes = geometry.attributes;

		const positionAttribute = attributes.a_Position;

		if (positionAttribute === undefined) {
			return;
		}

		let normalAttribute = attributes.a_Normal;

		if (normalAttribute === undefined) {
			normalAttribute = new Attribute(new Buffer(new Float32Array(positionAttribute.buffer.count * 3), 3));
			geometry.addAttribute('a_Normal', normalAttribute);
		} else {
			for (let i = 0; i < normalAttribute.buffer.array.length; i++) {
				normalAttribute.buffer.array[i] = 0; // reset existing normals to zero
			}
			normalAttribute.buffer.version++;
		}

		const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
		const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
		const cb = new Vector3(), ab = new Vector3();

		if (index) {
			// indexed elements
			for (let i = 0, il = index.buffer.count; i < il; i += 3) {
				const vA = index.buffer.array[i + 0];
				const vB = index.buffer.array[i + 1];
				const vC = index.buffer.array[i + 2];

				pA.fromArray(positionAttribute.buffer.array, vA * 3);
				pB.fromArray(positionAttribute.buffer.array, vB * 3);
				pC.fromArray(positionAttribute.buffer.array, vC * 3);

				cb.subVectors(pC, pB);
				ab.subVectors(pA, pB);
				cb.cross(ab);

				nA.fromArray(normalAttribute.buffer.array, vA * 3);
				nB.fromArray(normalAttribute.buffer.array, vB * 3);
				nC.fromArray(normalAttribute.buffer.array, vC * 3);

				nA.add(cb);
				nB.add(cb);
				nC.add(cb);

				nA.toArray(normalAttribute.buffer.array, vA * 3);
				nB.toArray(normalAttribute.buffer.array, vB * 3);
				nC.toArray(normalAttribute.buffer.array, vC * 3);
			}
		} else {
			// non-indexed elements (unconnected triangle soup)
			for (let i = 0, il = positionAttribute.buffer.count * 3; i < il; i += 9) {
				pA.fromArray(positionAttribute.buffer.array, i + 0);
				pB.fromArray(positionAttribute.buffer.array, i + 3);
				pC.fromArray(positionAttribute.buffer.array, i + 6);

				cb.subVectors(pC, pB);
				ab.subVectors(pA, pB);
				cb.cross(ab);

				cb.toArray(normalAttribute.buffer.array, i + 0);
				cb.toArray(normalAttribute.buffer.array, i + 3);
				cb.toArray(normalAttribute.buffer.array, i + 6);
			}
		}

		this.normalizeNormals(geometry);
	}

	/**
	 * @param {Geometry} geometry
	 */
	static normalizeNormals(geometry) {
		const normals = geometry.attributes.a_Normal.buffer;

		for (let i = 0; i < normals.array.length; i += 3) {
			_vec3_1.fromArray(normals.array, i);
			_vec3_1.normalize();
			_vec3_1.toArray(normals.array, i);
		}
	}

	/**
	 * @param {Geometry} geometry
	 */
	static computeTangents(geometry) {
		const index = geometry.index;
		const attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if (index === null ||
			attributes.a_Position === undefined ||
			attributes.a_Normal === undefined ||
			attributes.a_Uv === undefined) {
			console.warn('GeometryUtils: .computeTangents() failed. Missing required attributes (index, a_Position, a_Normal or a_Uv)');
			return;
		}

		const indices = index.buffer.array;
		const positions = attributes.a_Position.buffer.array;
		const normals = attributes.a_Normal.buffer.array;
		const uvs = attributes.a_Uv.buffer.array;

		const nVertices = positions.length / 3;

		if (!attributes.a_Tangent) {
			geometry.addAttribute('a_Tangent', new Attribute(new Buffer(new Float32Array(4 * nVertices), 4)));
		}

		const tangents = attributes.a_Tangent.buffer.array;

		const tan1 = [], tan2 = [];

		for (let i = 0; i < nVertices; i++) {
			tan1[i] = new Vector3();
			tan2[i] = new Vector3();
		}

		const vA = new Vector3(),
			vB = new Vector3(),
			vC = new Vector3(),

			uvA = new Vector2(),
			uvB = new Vector2(),
			uvC = new Vector2(),

			sdir = new Vector3(),
			tdir = new Vector3();

		function handleTriangle(a, b, c) {
			vA.fromArray(positions, a * 3);
			vB.fromArray(positions, b * 3);
			vC.fromArray(positions, c * 3);

			uvA.fromArray(uvs, a * 2);
			uvB.fromArray(uvs, b * 2);
			uvC.fromArray(uvs, c * 2);

			vB.sub(vA);
			vC.sub(vA);

			uvB.sub(uvA);
			uvC.sub(uvA);

			const r = 1.0 / (uvB.x * uvC.y - uvC.x * uvB.y);

			// silently ignore degenerate uv triangles having coincident or colinear vertices

			if (!isFinite(r)) return;

			sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, -uvB.y).multiplyScalar(r);
			tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, -uvC.x).multiplyScalar(r);

			tan1[a].add(sdir);
			tan1[b].add(sdir);
			tan1[c].add(sdir);

			tan2[a].add(tdir);
			tan2[b].add(tdir);
			tan2[c].add(tdir);
		}

		let groups = geometry.groups;

		if (groups.length === 0) {
			groups = [{
				start: 0,
				count: indices.length
			}];
		}

		for (let i = 0, il = groups.length; i < il; i++) {
			const group = groups[i];

			const start = group.start;
			const count = group.count;

			for (let j = start, jl = start + count; j < jl; j += 3) {
				handleTriangle(
					indices[j + 0],
					indices[j + 1],
					indices[j + 2]
				);
			}
		}

		const tmp = new Vector3(), tmp2 = new Vector3();
		const n = new Vector3(), n2 = new Vector3();

		function handleVertex(v) {
			n.fromArray(normals, v * 3);
			n2.copy(n);

			const t = tan1[v];

			// Gram-Schmidt orthogonalize

			tmp.copy(t);
			tmp.sub(n.multiplyScalar(n.dot(t))).normalize();

			// Calculate handedness

			tmp2.crossVectors(n2, t);
			const test = tmp2.dot(tan2[v]);
			const w = (test < 0.0) ? -1.0 : 1.0;

			tangents[v * 4] = tmp.x;
			tangents[v * 4 + 1] = tmp.y;
			tangents[v * 4 + 2] = tmp.z;
			tangents[v * 4 + 3] = -w; // why negative?
		}

		for (let i = 0, il = groups.length; i < il; i++) {
			const group = groups[i];

			const start = group.start;
			const count = group.count;

			for (let j = start, jl = start + count; j < jl; j += 3) {
				handleVertex(indices[j + 0]);
				handleVertex(indices[j + 1]);
				handleVertex(indices[j + 2]);
			}
		}
	}

	/**
	 * @param {Array<Geometry>} geometries
	 * @param {Boolean} useGroups
	 * @return {Geometry}
	 */
	static mergeGeometries(geometries, useGroups = false) {
		const isIndexed = geometries[0].index !== null;

		const attributesUsed = new Set(Object.keys(geometries[0].attributes));
		const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));

		const attributes = {};
		const morphAttributes = {};

		const mergedGeometry = new Geometry();

		let offset = 0;

		for (let i = 0; i < geometries.length; i++) {
			const geometry = geometries[i];

			// ensure that all geometries are indexed, or none

			if (isIndexed !== (geometry.index !== null)) {
				console.error('GeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.');
				return null;
			}

			// gather attributes, exit early if they're different

			for (const name in geometry.attributes) {
				if (!attributesUsed.has(name)) {
					console.error('GeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.');
					return null;
				}

				if (attributes[name] === undefined) attributes[name] = [];

				attributes[name].push(geometry.attributes[name]);
			}

			// gather morph attributes, exit early they're different

			for (const name in geometry.morphAttributes) {
				if (!morphAttributesUsed.has(name)) {
					console.error('GeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. .morphAttributes must be consistent throughout all geometries.');
					return null;
				}

				if (morphAttributes[name] === undefined) morphAttributes[name] = [];

				morphAttributes[name].push(geometry.morphAttributes[name]);
			}

			if (useGroups) {
				let count;

				if (isIndexed) {
					count = geometry.index.buffer.count;
				} else if (geometry.attributes.a_Position !== undefined) {
					count = geometry.attributes.a_Position.buffer.count;
				} else {
					console.error('GeometryUtils: .mergeGeometries() failed with geometry at index ' + i + '. The geometry must have either an index or an a_Position attribute');
					return null;
				}

				mergedGeometry.addGroup(offset, count, i);

				offset += count;
			}
		}

		// merge indices

		if (isIndexed) {
			let indexOffset = 0;
			const mergedIndex = [];

			for (let i = 0; i < geometries.length; i++) {
				const index = geometries[i].index;

				for (let j = 0; j < index.buffer.count; j++) {
					mergedIndex.push(index.buffer.array[j] + indexOffset);
				}

				indexOffset += geometries[i].attributes.a_Position.buffer.count;
			}

			mergedGeometry.setIndex(mergedIndex);
		}

		// merge attributes

		for (const name in attributes) {
			const mergedAttribute = this.mergeAttributes(attributes[name]);

			if (!mergedAttribute) {
				console.error('GeometryUtils: .mergeGeometries() failed while trying to merge the ' + name + ' attribute.');
				return null;
			}

			mergedGeometry.addAttribute(name, mergedAttribute);
		}

		// merge morph attributes

		for (const name in morphAttributes) {
			const numMorphTargets = morphAttributes[name][0].length;

			if (numMorphTargets === 0) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[name] = [];

			for (let i = 0; i < numMorphTargets; i++) {
				const morphAttributesToMerge = [];

				for (let j = 0; j < morphAttributes[name].length; j++) {
					morphAttributesToMerge.push(morphAttributes[name][j][i]);
				}

				const mergedMorphAttribute = this.mergeAttributes(morphAttributesToMerge);

				if (!mergedMorphAttribute) {
					console.error('GeometryUtils: .mergeGeometries() failed while trying to merge the ' + name + ' morphAttribute.');
					return null;
				}

				mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
			}
		}

		return mergedGeometry;
	}

	/**
	 * @param {Array<Attribute>} attributes
	 * @return {Attribute}
	 */
	static mergeAttributes(attributes) {
		let TypedArray;
		let size;
		let normalized;
		let arrayLength = 0;

		for (let i = 0; i < attributes.length; i++) {
			const attribute = attributes[i];

			if (attribute.buffer.stride !== attribute.size) {
				console.error('GeometryUtils: .mergeAttributes() failed. Interleaved buffer attributes are not supported.');
				return null;
			}

			if (TypedArray === undefined) TypedArray = attribute.buffer.array.constructor;
			if (TypedArray !== attribute.buffer.array.constructor) {
				console.error('GeometryUtils: .mergeAttributes() failed. Buffer.array must be of consistent array types across matching attributes.');
				return null;
			}

			if (size === undefined) size = attribute.size;
			if (size !== attribute.size) {
				console.error('GeometryUtils: .mergeAttributes() failed. Attribute.size must be consistent across matching attributes.');
				return null;
			}

			if (normalized === undefined) normalized = attribute.normalized;
			if (normalized !== attribute.normalized) {
				console.error('GeometryUtils: .mergeAttributes() failed. Attribute.normalized must be consistent across matching attributes.');
				return null;
			}

			arrayLength += attribute.buffer.array.length;
		}

		const array = new TypedArray(arrayLength);
		let offset = 0;

		for (let i = 0; i < attributes.length; i++) {
			array.set(attributes[i].buffer.array, offset);
			offset += attributes[i].buffer.array.length;
		}

		return new Attribute(new Buffer(array, size), size, 0, normalized);
	}

	/**
	 * @param {Geometry} geometry
	 * @param {Matrix4} matrix
	 * @param {Boolean} updateBoundings
	 * @return {Geometry}
	 */
	static applyMatrix4(geometry, matrix, updateBoundings) {
		let array, count, offset;

		const position = geometry.attributes['a_Position'];
		if (position !== undefined) {
			array = position.buffer.array;
			count = position.buffer.count;
			offset = position.offset;
			for (let i = 0; i < count; i++) {
				_vec3_1.fromArray(array, i * 3 + offset);
				_vec3_1.applyMatrix4(matrix);
				_vec3_1.toArray(array, i * 3 + offset);
			}
			position.buffer.version++;
		}

		const normal = geometry.attributes['a_Normal'];
		if (normal !== undefined) {
			array = normal.buffer.array;
			count = normal.buffer.count;
			offset = normal.offset;
			const normalMatrix = _mat3_1.setFromMatrix4(matrix).inverse().transpose();
			for (let i = 0; i < count; i++) {
				_vec3_1.fromArray(array, i * 3 + offset);
				_vec3_1.applyMatrix3(normalMatrix).normalize();
				_vec3_1.toArray(array, i * 3 + offset);
			}
			normal.buffer.version++;
		}

		const tangent = geometry.attributes['a_Tangent'];
		if (tangent !== undefined) {
			array = tangent.buffer.array;
			count = tangent.buffer.count;
			offset = tangent.offset;
			for (let i = 0; i < count; i++) {
				_vec3_1.fromArray(array, i * 3 + offset);
				_vec3_1.transformDirection(matrix);
				_vec3_1.toArray(array, i * 3 + offset);
			}
			tangent.buffer.version++;
		}

		if (geometry.boundingBox !== null && updateBoundings) {
			geometry.computeBoundingBox();
		}

		if (geometry.boundingSphere !== null && updateBoundings) {
			geometry.computeBoundingSphere();
		}

		return geometry;
	}

	/**
	 * @param {Geometry} geometry
	 * @return {Attribute}
	 */
	static getWireframeAttribute(geometry) {
		const indices = [];

		const geometryIndex = geometry.index;
		const geometryPosition = geometry.attributes.a_Position;

		if (!geometryPosition) {
			console.error('GeometryUtils: .getWireframeAttribute() failed. The geometry must have an a_Position attribute');
			return null;
		}

		if (geometryIndex !== null) {
			const array = geometryIndex.buffer.array;
			for (let i = 0, l = array.length; i < l; i += 3) {
				const a = array[i + 0];
				const b = array[i + 1];
				const c = array[i + 2];

				indices.push(a, b, b, c, c, a);
			}
		} else {
			const array = geometryPosition.buffer.array;

			for (let i = 0, l = (array.length / 3) - 1; i < l; i += 3) {
				const a = i + 0;
				const b = i + 1;
				const c = i + 2;

				indices.push(a, b, b, c, c, a);
			}
		}

		return new Attribute(new Buffer(
			(geometryPosition.buffer.array.length / 3) > 65536 ? new Uint32Array(indices) : new Uint16Array(indices),
			1
		));
	}

	// deprecated since v0.2.0, add warning since v0.3.0, will be removed in v0.4.0
	static mergeBufferAttributes(attributes) {
		console.warn('GeometryUtils: mergeBufferAttributes() has been renamed to mergeAttributes().');
		return this.mergeAttributes(attributes);
	}

}

const _vec3_1 = new Vector3();
const _mat3_1 = new Matrix3();

export { GeometryUtils };