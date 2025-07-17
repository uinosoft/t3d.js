import { SceneData } from './SceneData.js';
import { LightingData } from './LightingData.js';
import { RenderStates } from './RenderStates.js';
import { RenderQueue } from './RenderQueue.js';
import { Sphere } from '../math/Sphere.js';

/**
 * RenderCollector traverses the scene graph and collects all necessary rendering information.
 * It manages scene data, lighting data, and per-camera render states/queues.
 */
class RenderCollector {

	/**
	 * Creates a new RenderCollector instance.
	 * In most cases, RenderCollector does not need to be created manually,
	 * as Scene will automatically create one. See {@link Scene#collector}.
	 */
	constructor() {
		// collects scene and lighting data for single scene

		this.sceneData = new SceneData();
		this.lightingData = new LightingData();

		// collects render states and render queues for each camera

		this._renderStatesMap = new WeakMap();
		this._renderQueueMap = new WeakMap();

		// internal states

		this._lightingNeedsUpdate = true;
		this._skeletonVersion = 1;

		const _boundingSphere = new Sphere();

		/**
		 * Visibility checking function called during scene traversal.
		 * Determines whether an object should be included in the render queue.
		 * Can be overridden to implement custom culling logic (LOD, distance, etc.).
		 * @param {Object3D} object - The object to test for visibility.
		 * @param {Camera} camera - The camera to test against.
		 * @returns {boolean} True if the object should be rendered, false to cull it.
		 * @type {Function}
		 * @example
		 * // Custom visibility check that always returns true
		 * collector.checkVisibility = function(object, camera) {
		 *     return true;
		 * };
		 */
		this.checkVisibility = function(object, camera) {
			if (!object.renderable) {
				return false;
			}

			if (!object.frustumCulled || !camera.frustumCulled) {
				return true;
			}

			_boundingSphere.copy(object.geometry.boundingSphere).applyMatrix4(object.worldMatrix);

			return camera.frustum.intersectsSphere(_boundingSphere);
		};
	}

	/**
	 * Setting this property to `true` indicates the lighting data needs to be updated.
	 * Lighting data updates are triggered by the {@link RenderCollector#traverseAndCollect} method.
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set lightingNeedsUpdate(value) {
		if (value) {
			this._lightingNeedsUpdate = true;
		}
	}

	/**
	 * Setting this property to `true` indicates all skeletons in the scene should be updated.
	 * Skeleton updates are triggered by the {@link RenderCollector#traverseAndCollect} method.
	 * @type {boolean}
	 * @default false
	 * @param {boolean} value
	 */
	set skeletonNeedsUpdate(value) {
		if (value) {
			this._skeletonVersion++;
		}
	}

	/**
	 * Get the RenderStates for the scene and camera.
	 * If the RenderStates for the camera does not exist, it will be created.
	 * @param {Camera} camera - The render camera.
	 * @returns {RenderStates} The target render states.
	 */
	getRenderStates(camera) {
		let renderStates = this._renderStatesMap.get(camera);
		if (!renderStates) {
			// every camera has its own RenderStates
			// but they share the same scene and lighting data
			renderStates = new RenderStates(this.sceneData, this.lightingData);
			this._renderStatesMap.set(camera, renderStates);
		}
		return renderStates;
	}

	/**
	 * Get the RenderQueue for the scene and camera.
	 * If the RenderQueue for the camera does not exist, it will be created.
	 * @param {Camera} camera - The render camera.
	 * @returns {RenderQueue} The target render queue.
	 */
	getRenderQueue(camera) {
		let renderQueue = this._renderQueueMap.get(camera);
		if (!renderQueue) {
			renderQueue = new RenderQueue();
			this._renderQueueMap.set(camera, renderQueue);
		}
		return renderQueue;
	}

	/**
	 * Traverse the scene and collect all renderable objects, lights and skeletons.
	 * This method will update the RenderQueue and RenderStates for the camera.
	 * @param {Scene} scene - The scene to traverse.
	 * @param {Camera} camera - The camera to collect renderable objects for.
	 * @returns {RenderQueue} The collected render queue.
	 */
	traverseAndCollect(scene, camera) {
		const sceneData = this.sceneData;
		const lightingData = this.lightingData;

		const lightingNeedsUpdate = this._lightingNeedsUpdate;

		const renderQueue = this.getRenderQueue(camera);

		if (lightingNeedsUpdate) {
			lightingData.begin();
		}

		renderQueue.begin();

		this._traverseAndCollect(scene, camera, renderQueue);

		renderQueue.end();

		if (lightingNeedsUpdate) {
			lightingData.end(sceneData);
			this._lightingNeedsUpdate = false;
		}

		// Since skeletons may be referenced by different mesh,
		// it is necessary to collect skeletons in the scene in order to avoid repeated updates.
		// For IOS platform, we should try to avoid repeated texture updates within one frame,
		// otherwise the performance will be seriously degraded.
		const skeletonVersion = this._skeletonVersion;
		for (const skeleton of _skeletons) {
			// Skeleton version ensures uncollected skeletons will be updated in subsequent frames
			if (skeleton._version !== skeletonVersion) {
				skeleton.updateBones(sceneData);
				skeleton._version = skeletonVersion;
			}
		}
		_skeletons.clear();

		return renderQueue;
	}

	_traverseAndCollect(object, camera, renderQueue) {
		if (!object.visible) {
			return;
		}

		if (object.isMesh) {
			if (this.checkVisibility(object, camera)) {
				renderQueue.push(object, camera);
				if (object.skeleton) {
					_skeletons.add(object.skeleton);
				}
			}
		} else if (object.isLight) {
			this.lightingData.collect(object);
		}

		const children = object.children;
		for (let i = 0, l = children.length; i < l; i++) {
			this._traverseAndCollect(children[i], camera, renderQueue);
		}
	}

}

const _skeletons = new Set();

export { RenderCollector };