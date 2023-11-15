import { Attribute } from './Attribute.js';
import { Buffer } from './Buffer.js';
import { EventDispatcher } from '../../EventDispatcher.js';
import { generateUUID } from '../../base.js';
import { Box3 } from '../../math/Box3.js';
import { Sphere } from '../../math/Sphere.js';
import { Vector3 } from '../../math/Vector3.js';

let _geometryId = 0;

const _vector = new Vector3();
const _offset = new Vector3();
const _sum = new Vector3();
const _box3 = new Box3();
const _boxMorphTargets = new Box3();

/**
 * An efficient representation of mesh, line, or point geometry.
 * Includes vertex positions, face indices, normals, colors, UVs, and custom attributes within buffers, reducing the cost of passing all this data to the GPU.
 * To read and edit data in {@link t3d.Geometry#attributes}.
 * @memberof t3d
 * @extends t3d.EventDispatcher
 */
class Geometry extends EventDispatcher {

	/**
	 * Create a geometry.
	 */
	constructor() {
		super();

		/**
		 * Unique number for this geometry instance.
		 * @readonly
		 * @type {Number}
		 */
		this.id = _geometryId++;

		/**
		 * UUID of this geometry instance.
		 * This gets automatically assigned, so this shouldn't be edited.
		 * @readonly
		 * @type {String}
		 */
		this.uuid = generateUUID();

		/**
		 * This hashmap has as id the name of the attribute to be set and as value the buffer to set it to.
		 * Rather than accessing this property directly, use {@link t3d.Geometry#addAttribute} and {@link t3d.Geometry#getAttribute} to access attributes of this geometry.
		 * @type {Object}
		 */
		this.attributes = {};

		/**
		 * Hashmap of Attributes Array for morph targets.
		 * @type {Object}
		 */
		this.morphAttributes = {};

		/**
		 * Allows for vertices to be re-used across multiple triangles; this is called using "indexed triangles" and each triangle is associated with the indices of three vertices.
		 * This attribute therefore stores the index of each vertex for each triangular face.
		 * If this attribute is not set, the renderer assumes that each three contiguous positions represent a single triangle.
		 * @type {t3d.Attribute|Null}
		 */
		this.index = null;

		/**
		 * Bounding box for the bufferGeometry, which can be calculated with {@link t3d.Geometry#computeBoundingBox}.
		 * @type {t3d.Box3}
		 * @default t3d.Box3()
		 */
		this.boundingBox = new Box3();

		/**
		 * Bounding sphere for the bufferGeometry, which can be calculated with {@link t3d.Geometry#computeBoundingSphere}.
		 * @type {t3d.Sphere}
		 * @default t3d.Sphere()
		 */
		this.boundingSphere = new Sphere();

		/**
		 * Split the geometry into groups, each of which will be rendered in a separate WebGL draw call. This allows an array of materials to be used with the geometry.
		 * Each group is an object of the form: { start: Integer, count: Integer, materialIndex: Integer },
		 * or { multiDrawStarts: Integer[], multiDrawCounts: Integer[], multiDrawCount: Integer, materialIndex: Integer } if multiDraw is available.
		 * @type {Array}
		 * @default []
		 */
		this.groups = [];

		/**
		 * @type {Number}
		 * @default -1
		 */
		this.instanceCount = -1;

		/**
		 * A version number, incremented every time the attribute object or index object changes to mark VAO drity.
		 * @type {Number}
		 * @default 0
		 */
		this.version = 0;
	}

	/**
	 * Adds an attribute to this geometry.
	 * Use this rather than the attributes property.
	 * @param {String} name
	 * @param {t3d.Attribute} attribute
	 */
	addAttribute(name, attribute) {
		this.attributes[name] = attribute;
	}

	/**
	 * Returns the attribute with the specified name.
	 * @param {String} name
	 * @return {t3d.Attribute}
	 */
	getAttribute(name) {
		return this.attributes[name];
	}

	/**
	 * Removes the attribute with the specified name.
	 * @param {String} name
	 */
	removeAttribute(name) {
		delete this.attributes[name];
	}

	/**
	 * Set the {@link t3d.Geometry#index} buffer.
	 * @param {Array|t3d.Attribute|Null} index
	 */
	setIndex(index) {
		if (Array.isArray(index)) {
			const typedArray = new (arrayMax(index) > 65535 ? Uint32Array : Uint16Array)(index);
			this.index = new Attribute(new Buffer(typedArray, 1));
		} else {
			this.index = index;
		}
	}

	/**
	 * Adds a group to this geometry; see the {@link t3d.Geometry#groups} for details.
	 * @param {Number} start
	 * @param {Number} count
	 * @param {Number} [materialIndex=0]
	 */
	addGroup(start, count, materialIndex = 0) {
		this.groups.push({
			start: start,
			count: count,
			materialIndex: materialIndex
		});
	}

	/**
	 * Clears all groups.
	 */
	clearGroups() {
		this.groups = [];
	}

	/**
	 * Computes bounding box of the geometry, updating {@link t3d.Geometry#boundingBox}.
	 * Bounding boxes aren't computed by default. They need to be explicitly computed.
	 */
	computeBoundingBox() {
		const position = this.attributes['a_Position'] || this.attributes['position'];

		if (position) {
			this.boundingBox.setFromArray(position.buffer.array, position.buffer.stride, position.offset);
		}

		const morphAttributesPosition = this.morphAttributes.position;

		if (morphAttributesPosition) {
			for (let i = 0; i < morphAttributesPosition.length; i++) {
				const morphAttribute = morphAttributesPosition[i];

				_box3.setFromArray(morphAttribute.buffer.array, morphAttribute.buffer.stride, morphAttribute.offset);

				_vector.addVectors(this.boundingBox.min, _box3.min);
				this.boundingBox.expandByPoint(_vector);

				_vector.addVectors(this.boundingBox.max, _box3.max);
				this.boundingBox.expandByPoint(_vector);
			}
		}
	}

	/**
	 * Computes bounding sphere of the geometry, updating {@link t3d.Geometry#boundingSphere}.
	 * Bounding spheres aren't computed by default. They need to be explicitly computed.
	 */
	computeBoundingSphere() {
		const position = this.attributes['a_Position'] || this.attributes['position'];
		const morphAttributesPosition = this.morphAttributes.position;

		if (!position) {
			return;
		}

		const bufferStride = position.buffer.stride;
		const positionOffset = position.offset;

		if (morphAttributesPosition) {
			_box3.setFromArray(position.buffer.array, bufferStride, positionOffset);

			for (let i = 0; i < morphAttributesPosition.length; i++) {
				const morphAttribute = morphAttributesPosition[i];

				_boxMorphTargets.setFromArray(morphAttribute.buffer.array, morphAttribute.buffer.stride, morphAttribute.offset);

				_vector.addVectors(_box3.min, _boxMorphTargets.min);
				_box3.expandByPoint(_vector);

				_vector.addVectors(_box3.max, _boxMorphTargets.max);
				_box3.expandByPoint(_vector);
			}

			const center = this.boundingSphere.center;
			_box3.getCenter(center);

			let maxRadiusSq = 0;

			for (let i = 0; i < position.buffer.count; i++) {
				_offset.fromArray(position.buffer.array, i * bufferStride + positionOffset);

				maxRadiusSq = center.distanceToSquared(_offset);

				for (let j = 0; j < morphAttributesPosition.length; j++) {
					const morphAttribute = morphAttributesPosition[j];

					_vector.fromArray(morphAttribute.buffer.array, i * morphAttribute.buffer.stride + morphAttribute.offset);

					_sum.addVectors(_offset, _vector);

					const offsetLengthSq = center.distanceToSquared(_sum);

					// TODO The maximum radius cannot be obtained here
					if (offsetLengthSq > maxRadiusSq) {
						maxRadiusSq = offsetLengthSq;
						_offset.add(_vector);
					}
				}
			}

			this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
		} else {
			this.boundingSphere.setFromArray(position.buffer.array, bufferStride, positionOffset);
		}
	}

	/**
	 * Disposes the object from memory.
	 * You need to call this when you want the BufferGeometry removed while the application is running.
	 */
	dispose() {
		this.dispatchEvent({ type: 'dispose' });
	}

	/**
	 * Copies another Geometry to this Geometry.
	 * @param {t3d.Geometry} source - The geometry to be copied.
	 * @return {t3d.Geometry}
	 */
	copy(source) {
		let name, i, l;

		// reset

		this.index = null;
		this.attributes = {};
		this.morphAttributes = {};
		this.groups = [];
		const buffers = new WeakMap(); // used for storing cloned, shared buffers

		// index

		const index = source.index;

		if (index !== null) {
			this.setIndex(index.clone(buffers));
		}

		// attributes

		const attributes = source.attributes;

		for (name in attributes) {
			const attribute = attributes[name];
			this.addAttribute(name, attribute.clone(buffers));
		}

		// morph attributes

		const morphAttributes = source.morphAttributes;

		for (name in morphAttributes) {
			const array = [];
			const morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

			for (i = 0, l = morphAttribute.length; i < l; i++) {
				array.push(morphAttribute[i].clone(buffers));
			}

			this.morphAttributes[name] = array;
		}

		// groups

		const groups = source.groups;

		for (i = 0, l = groups.length; i < l; i++) {
			const group = groups[i];
			this.addGroup(group.start, group.count, group.materialIndex);
		}

		// boundings
		this.boundingBox.copy(source.boundingBox);
		this.boundingSphere.copy(source.boundingSphere);

		// instance count
		this.instanceCount = source.instanceCount;

		return this;
	}

	/**
	 * Creates a clone of this Geometry.
	 * @return {t3d.Geometry}
	 */
	clone() {
		return new Geometry().copy(this);
	}

}

function arrayMax(array) {
	if (array.length === 0) return -Infinity;

	let max = array[0];

	for (let i = 1, l = array.length; i < l; ++i) {
		if (array[i] > max) max = array[i];
	}

	return max;
}

export { Geometry };