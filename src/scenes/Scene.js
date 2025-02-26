import { Object3D } from './Object3D.js';
import { Matrix4 } from '../math/Matrix4.js';
import { LightingData } from '../render/LightingData.js';
import { RenderQueue } from '../render/RenderQueue.js';
import { SceneData } from '../render/SceneData.js';
import { RenderStates } from '../render/RenderStates.js';
import { Sphere } from '../math/Sphere.js';

/**
 * Scenes allow you to set up what and where is to be rendered,
 * this is where you place objects, lights and cameras.
 * @extends Object3D
 */
class Scene extends Object3D {

	/**
	 * Create a scene.
	 */
	constructor() {
		super();

		/**
		 * A {@link Fog} instance defining the type of fog that affects everything rendered in the scene.
		 * @type {Fog}
		 * @default null
		 */
		this.fog = null;

		/**
		 * Sets the environment map for all materials in the scene.
		 * However, it's not possible to overwrite an existing texture assigned to Material.envMap.
		 * @type {TextureCube | null}
		 * @default null
		 */
		this.environment = null;

		/**
		 * The diffuse intensity of the environment map.
		 * @type {number}
		 * @default 1
		 */
		this.envDiffuseIntensity = 1;

		/**
		 * The specular intensity of the environment map.
		 * This value is multiplied with the envMapIntensity of the material to get the final intensity.
		 * @type {number}
		 * @default 1
		 */
		this.envSpecularIntensity = 1;

		/**
		 * User-defined clipping planes specified as {@link Plane} objects in world space.
		 * These planes apply to the scene.
		 * Points in space whose dot product with the plane is negative are cut away.
		 * @type {Plane[]}
		 * @default []
		 */
		this.clippingPlanes = [];

		/**
		 * Defines whether disable shadow sampler feature.
		 * Shader with sampler2DShadow uniforms may cause unknown error on some android phones, set disableShadowSampler to true to avoid these bugs.
		 * When this property is set to true, soft shadow types will fallback to POISSON_SOFT without warning.
		 * @type {boolean}
		 * @default false
		 */
		this.disableShadowSampler = false;

		/**
		 * whether to use a logarithmic depth buffer. It may be neccesary to use this if dealing with huge differences in scale in a single scene.
		 * Note that this setting uses gl_FragDepth if available which disables the Early Fragment Test optimization and can cause a decrease in performance.
		 * @type {boolean}
		 * @default false
		 */
		this.logarithmicDepthBuffer = false;

		/**
		 * The anchor matrix of the world coordinate system.
		 * If it is not an identity matrix, the actual lighting calculating and the world position in the shader, will be in the anchor coordinate system.
		 * By setting this property, you can solve the floating point precision problem caused by the rendering object far away from the origin of the world coordinate system.
		 * In addition, by setting the rotation, it can also repair the direction of the reflection.
		 * @type {Matrix4}
		 */
		this.anchorMatrix = new Matrix4();

		this._sceneData = new SceneData();
		this._lightingData = new LightingData();

		this._renderQueueMap = new WeakMap();
		this._renderStatesMap = new WeakMap();

		this._skeletonVersion = 0;
	}

	/**
	 * The maximum number of lighting groups.
	 * @type {number}
	 * @default 1
	 */
	set maxLightingGroups(value) {
		this._lightingData.setMaxGroupCount(value);
	}
	get maxLightingGroups() {
		return this._lightingData.groupList.length;
	}

	/**
	 * Update {@link RenderStates} for the scene and camera.
	 * The lighting data in RenderStates will be empty unless calling {@link Scene#updateRenderQueue}.
	 * @param {Camera} camera - The camera.
	 * @param {boolean} [updateScene=true] - Whether to update scene data.
	 * @returns {RenderStates} - The result render states.
	 */
	updateRenderStates(camera, updateScene = true) {
		if (!this._renderStatesMap.has(camera)) {
			this._renderStatesMap.set(camera, new RenderStates(this._sceneData, this._lightingData));
		}

		const renderStates = this._renderStatesMap.get(camera);

		if (updateScene) {
			this._sceneData.update(this);
		}

		renderStates.updateCamera(camera);

		return renderStates;
	}

	/**
	 * Get {@link RenderStates} for the scene and camera.
	 * The RenderStates will be updated by calling {@link Scene#updateRenderStates}.
	 * The light data in RenderStates will be empty unless calling {@link Scene#updateRenderQueue}.
	 * @param {Camera} camera - The camera.
	 * @returns {RenderQueue} - The target render queue.
	 */
	getRenderStates(camera) {
		return this._renderStatesMap.get(camera);
	}

	/**
	 * Update {@link RenderQueue} for the scene and camera.
	 * Collect all visible meshes (and lights) from scene graph, and push meshes to render queue.
	 * Light data will be stored in RenderStates.
	 * @param {Camera} camera - The camera.
	 * @param {boolean} [collectLights=true] - Whether to collect light data.
	 * @param {boolean} [updateSkeletons=true] - Whether to update skeletons.
	 * @returns {RenderQueue} - The result render queue.
	 */
	updateRenderQueue(camera, collectLights = true, updateSkeletons = true) {
		if (!this._renderQueueMap.has(camera)) {
			this._renderQueueMap.set(camera, new RenderQueue());
		}

		const renderQueue = this._renderQueueMap.get(camera);
		const lightingData = this._lightingData;

		lightingData.begin(!collectLights);
		renderQueue.begin();

		this._pushToRenderQueue(this, camera, renderQueue);

		renderQueue.end();
		lightingData.end(this._sceneData);

		if (updateSkeletons) {
			this._skeletonVersion++;
		}

		// Since skeletons may be referenced by different mesh, it is necessary to collect skeletons in the scene in order to avoid repeated updates.
		// For IOS platform, we should try to avoid repeated texture updates within one frame, otherwise the performance will be seriously degraded.
		for (const skeleton of renderQueue.skeletons) {
			if (skeleton._version !== this._skeletonVersion) {
				skeleton.updateBones(this._sceneData);
				skeleton._version = this._skeletonVersion;
			}
		}

		return renderQueue;
	}

	/**
	 * Get {@link RenderQueue} for the scene and camera.
	 * The RenderQueue will be updated by calling {@link Scene#updateRenderQueue}.
	 * @param {Camera} camera - The camera.
	 * @returns {RenderQueue} - The target render queue.
	 */
	getRenderQueue(camera) {
		return this._renderQueueMap.get(camera);
	}

	_pushToRenderQueue(object, camera, renderQueue) {
		if (!object.visible) {
			return;
		}

		if (object.geometry && object.material && object.renderable) {
			if (object.frustumCulled && camera.frustumCulled) {
				// frustum test, only test bounding sphere
				_boundingSphere.copy(object.geometry.boundingSphere).applyMatrix4(object.worldMatrix);
				if (camera.frustum.intersectsSphere(_boundingSphere)) {
					renderQueue.push(object, camera);
				}
			} else {
				renderQueue.push(object, camera);
			}
		} else if (object.isLight) {
			this._lightingData.collect(object);
		}

		const children = object.children;
		for (let i = 0, l = children.length; i < l; i++) {
			this._pushToRenderQueue(children[i], camera, renderQueue);
		}
	}

}

/**
 * @readonly
 * @type {boolean}
 * @default true
 */
Scene.prototype.isScene = true;

const _boundingSphere = new Sphere();

export { Scene };
