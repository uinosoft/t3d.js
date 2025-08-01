import { cloneJson } from '../base.js';
import { SHADOW_TYPE } from '../const.js';
import { Vector3 } from '../math/Vector3.js';
import { Euler } from '../math/Euler.js';
import { Quaternion } from '../math/Quaternion.js';
import { Matrix4 } from '../math/Matrix4.js';
import { MathUtils } from '../math/MathUtils.js';

let _object3DId = 0;

const _mat4_1 = new Matrix4();

/**
 * This is the base class for most objects,
 * and provides a set of properties and methods for manipulating objects in 3D space.
 */
class Object3D {

	constructor() {
		/**
		 * Unique number for this object instance.
		 * @readonly
		 * @type {number}
		 */
		this.id = _object3DId++;

		/**
		 * UUID of this object instance.
		 * This gets automatically assigned, so this shouldn't be edited.
		 * @type {string}
		 */
		this.uuid = MathUtils.generateUUID();

		/**
		 * Optional name of the object (doesn't need to be unique).
		 * @type {string}
		 * @default ""
		 */
		this.name = '';

		/**
		 * A Vector3 representing the object's local position.
		 * @type {Vector3}
		 * @default Vector3(0, 0, 0)
		 */
		this.position = new Vector3();

		/**
		 * The object's local scale.
		 * @type {Vector3}
		 * @default Vector3(1, 1, 1)
		 */
		this.scale = new Vector3(1, 1, 1);

		/**
		 * Object's local rotation as an {@link Euler}, in radians.
		 * @type {Euler}
		 * @default Euler(0, 0, 0)
		 */
		this.euler = new Euler();

		/**
		 * Object's local rotation as a {@link Quaternion}.
		 * @type {Quaternion}
		 * @default Quaternion(0, 0, 0, 1)
		 */
		this.quaternion = new Quaternion();

		// bind euler and quaternion
		const euler = this.euler, quaternion = this.quaternion;
		euler.onChange(function() {
			quaternion.setFromEuler(euler, false);
		});
		quaternion.onChange(function() {
			euler.setFromQuaternion(quaternion, undefined, false);
		});

		/**
		 * The local transform matrix.
		 * @type {Matrix4}
		 */
		this.matrix = new Matrix4();

		/**
		 * The global transform of the object.
		 * If the Object3D has no parent, then it's identical to the local transform {@link Object3D#matrix}.
		 * @type {Matrix4}
		 */
		this.worldMatrix = new Matrix4();

		/**
		 * Object's parent in the scene graph.
		 * An object can have at most one parent.
		 * @type {Object3D[]}
		 */
		this.children = new Array();

		/**
		 * Object's parent in the scene graph.
		 * An object can have at most one parent.
		 * @type {Object3D}
		 */
		this.parent = null;

		/**
		 * Whether the object gets rendered into shadow map.
		 * @type {boolean}
		 * @default false
		 */
		this.castShadow = false;

		/**
		 * Whether the material receives shadows.
		 * @type {boolean}
		 * @default false
		 */
		this.receiveShadow = false;

		/**
		 * Defines shadow map type.
		 * Note: In webgl1 or {@link Scene#disableShadowSampler} is true, soft shadow types will fallback to POISSON_SOFT without warning.
		 * Note: Point light only support POISSON_SOFT for now.
		 * @type {SHADOW_TYPE}
		 * @default SHADOW_TYPE.PCF3_SOFT
		 */
		this.shadowType = SHADOW_TYPE.PCF3_SOFT;

		/**
		 * When this is set, it checks every frame if the object is in the frustum of the camera before rendering the object.
		 * Otherwise the object gets rendered every frame even if it isn't visible.
		 * @type {boolean}
		 * @default true
		 */
		this.frustumCulled = true;

		/**
		 * Object gets rendered if true.
		 * @type {boolean}
		 * @default true
		 */
		this.visible = true;

		/**
		 * This value allows the default rendering order of scene graph objects to be overridden although opaque and transparent objects remain sorted independently.
		 * Sorting is from lowest to highest renderOrder.
		 * @type {number}
		 * @default 0
		 */
		this.renderOrder = 0;

		/**
		 * Render layer of this object.
		 * RenderQueue will dispatch all renderable objects to the corresponding RenderQueueLayer according to object.renderLayer.
		 * @type {number}
		 * @default 0
		 */
		this.renderLayer = 0;

		/**
		 * Whether it can be collected into the Render Queue.
		 * @type {boolean}
		 * @default true
		 */
		this.renderable = true;

		/**
		 * An object that can be used to store custom data about the {@link Object3D}.
		 * It should not hold references to functions as these will not be cloned.
		 * @type {object}
		 * @default {}
		 */
		this.userData = {};

		/**
		 * When this is set, it calculates the matrix of position, (rotation or quaternion) and scale every frame and also recalculates the worldMatrix property.
		 * @type {boolean}
		 * @default true
		 */
		this.matrixAutoUpdate = true;

		/**
		 * When this is set, it calculates the matrix in that frame and resets this property to false.
		 * @type {boolean}
		 * @default true
		 */
		this.matrixNeedsUpdate = true;

		/**
		 * When this is set, it calculates the world matrix in that frame and resets this property to false.
		 * @type {boolean}
		 * @default true
		 */
		this.worldMatrixNeedsUpdate = true;
	}

	/**
	 * An optional callback that is executed immediately before the Object3D is rendered.
	 */
	onBeforeRender() {}

	/**
	 * An optional callback that is executed immediately after the Object3D is rendered.
	 */
	onAfterRender() {}

	/**
	 * Add object as child of this object.
	 * @param {Object3D} object
	 */
	add(object) {
		if (object === this) {
			console.error('Object3D.add: object can\'t be added as a child of itself.', object);
			return;
		}

		if (object.parent !== null) {
			object.parent.remove(object);
		}

		object.parent = this;
		this.children.push(object);

		object.worldMatrixNeedsUpdate = true;
	}

	/**
	 * Remove object as child of this object.
	 * @param {Object3D} object
	 */
	remove(object) {
		const index = this.children.indexOf(object);
		if (index !== -1) {
			object.parent = null;
			this.children.splice(index, 1);

			object.worldMatrixNeedsUpdate = true;
		}
	}

	/**
	 * Searches through the object's children and returns the first with a matching name.
	 * Note that for most objects the name is an empty string by default.
	 * You will have to set it manually to make use of this method.
	 * @param {string} name - String to match to the children's {@link Object3D#name} property.
	 * @returns {Object3D}
	 */
	getObjectByName(name) {
		return this.getObjectByProperty('name', name);
	}

	/**
	 * Searches through the object's children and returns the first with a property that matches the value given.
	 * @param {string} name - the property name to search for.
	 * @param {number} value - value of the given property.
	 * @returns {Object3D}
	 */
	getObjectByProperty(name, value) {
		if (this[name] === value) return this;

		for (let i = 0, l = this.children.length; i < l; i++) {
			const child = this.children[i];
			const object = child.getObjectByProperty(name, value);

			if (object !== undefined) {
				return object;
			}
		}

		return undefined;
	}

	/**
	 * Update the local transform.
	 * @param {boolean} force
	 */
	updateMatrix(force) {
		if (this.matrixAutoUpdate || this.matrixNeedsUpdate) {
			this.matrix.compose(this.position, this.quaternion, this.scale);

			this.matrixNeedsUpdate = false;
			this.worldMatrixNeedsUpdate = true;
		}

		if (this.worldMatrixNeedsUpdate || force) {
			this.worldMatrix.copy(this.matrix);

			if (this.parent) {
				const parentMatrix = this.parent.worldMatrix;
				this.worldMatrix.premultiply(parentMatrix);
			}

			this.worldMatrixNeedsUpdate = false;
			force = true;
		}

		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) {
			children[i].updateMatrix(force);
		}
	}

	/**
	 * Returns a vector representing the direction of object's positive z-axis in world space.
	 * This call must be after {@link Object3D#updateMatrix}.
	 * @param {Vector3} [optionalTarget] — the result will be copied into this Vector3.
	 * @returns {Vector3} - the result.
	 */
	getWorldDirection(optionalTarget = new Vector3()) {
		const e = this.worldMatrix.elements;
		return optionalTarget.set(e[8], e[9], e[10]).normalize();
	}

	/**
	 * Rotates the object to face a point in local space.
	 * @param {Vector3} target - A vector representing a position in local space.
	 * @param {Vector3} up — A vector representing the up direction in local space.
	 */
	lookAt(target, up) {
		_mat4_1.lookAtRH(target, this.position, up);
		this.quaternion.setFromRotationMatrix(_mat4_1);
	}

	/**
	 * Method to get intersections between a casted ray and this object.
	 * @abstract
	 * @param {Ray} ray - The {@link Ray} instance.
	 * @param {Array} intersects - output intersects array.
	 */
	raycast(ray, intersects) {

	}

	/**
	 * Executes the callback on this object and all descendants.
	 * @param {Function} callback - A function with as first argument an object3D object.
	 */
	traverse(callback) {
		callback(this);

		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) {
			children[i].traverse(callback);
		}
	}

	/**
	 * Returns a clone of this object and optionally all descendants.
	 * @param {Function} [recursive=true] - if true, descendants of the object are also cloned.
	 * @returns {Object3D}
	 */
	clone(recursive) {
		return new this.constructor().copy(this, recursive);
	}

	/**
	 * Copy the given object into this object.
	 * @param {Object3D} source - The object to be copied.
	 * @param {boolean} [recursive=true] - if true, descendants of the object are also copied.
	 * @returns {Object3D}
	 */
	copy(source, recursive = true) {
		this.name = source.name;

		this.position.copy(source.position);
		this.quaternion.copy(source.quaternion);
		this.scale.copy(source.scale);

		this.matrix.copy(source.matrix);
		this.worldMatrix.copy(source.worldMatrix);

		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;
		this.shadowType = source.shadowType;

		this.frustumCulled = source.frustumCulled;
		this.visible = source.visible;
		this.renderOrder = source.renderOrder;
		this.renderLayer = source.renderLayer;
		this.renderable = source.renderable;

		this.userData = cloneJson(source.userData);

		if (recursive === true) {
			for (let i = 0; i < source.children.length; i++) {
				const child = source.children[i];
				this.add(child.clone());
			}
		}

		return this;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Object3D.prototype.isObject3D = true;

export { Object3D };