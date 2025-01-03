import { Object3D } from './Object3D.js';
import { Matrix4 } from '../math/Matrix4.js';
import { LightData } from '../render/LightData.js';
import { RenderQueue } from '../render/RenderQueue.js';
import { SceneData } from '../render/SceneData.js';
import { RenderStates } from '../render/RenderStates.js';
import { Sphere } from '../math/Sphere.js';

/**
 * Scenes allow you to set up what and where is to be rendered by t3d.
 * This is where you place objects, lights and cameras.
 * @constructor
 * @memberof t3d
 * @extends t3d.Object3D
 */
class Scene extends Object3D {

	/**
	 * Create a scene.
	 */
	constructor() {
		super();

		/**
		 * A {@link t3d.Fog} instance defining the type of fog that affects everything rendered in the scene.
		 * @type {t3d.Fog}
		 * @default null
		 */
		this.fog = null;

		/**
		 * Sets the environment map for all materials in the scene.
		 * However, it's not possible to overwrite an existing texture assigned to Material.envMap.
		 * @type {t3d.TextureCube | Null}
		 * @default null
		 */
		this.environment = null;

		/**
		 * The diffuse intensity of the environment map.
		 * @type {Number}
		 * @default 1
		 */
		this.envDiffuseIntensity = 1;

		/**
		 * The specular intensity of the environment map.
		 * This value is multiplied with the envMapIntensity of the material to get the final intensity.
		 * @type {Number}
		 * @default 1
		 */
		this.envSpecularIntensity = 1;

		/**
		 * User-defined clipping planes specified as {@link t3d.Plane} objects in world space.
		 * These planes apply to the scene.
		 * Points in space whose dot product with the plane is negative are cut away.
		 * @type {t3d.Plane[]}
		 * @default []
		 */
		this.clippingPlanes = [];

		/**
		 * Defines whether disable shadow sampler feature.
		 * Shader with sampler2DShadow uniforms may cause unknown error on some android phones, set disableShadowSampler to true to avoid these bugs.
		 * When this property is set to true, soft shadow types will fallback to POISSON_SOFT without warning.
		 * @type {Boolean}
		 * @default false
		 */
		this.disableShadowSampler = false;

		/**
		 * whether to use a logarithmic depth buffer. It may be neccesary to use this if dealing with huge differences in scale in a single scene.
		 * Note that this setting uses gl_FragDepth if available which disables the Early Fragment Test optimization and can cause a decrease in performance.
		 * @type {Boolean}
		 * @default false
		 */
		this.logarithmicDepthBuffer = false;

		/**
		 * The anchor matrix of the world coordinate system.
		 * If it is not an identity matrix, the actual lighting calculating and the world position in the shader, will be in the anchor coordinate system.
		 * By setting this property, you can solve the floating point precision problem caused by the rendering object far away from the origin of the world coordinate system.
		 * In addition, by setting the rotation, it can also repair the direction of the reflection.
		 * @type {t3d.Matrix4}
		 */
		this.anchorMatrix = new Matrix4();

		this._sceneData = new SceneData();
		this._lightData = new LightData();

		this._renderQueueMap = new WeakMap();
		this._renderStatesMap = new WeakMap();

		this._skeletonVersion = 0;
	}

	/**
	 * Update {@link t3d.RenderStates} for the scene and camera.
	 * The light data in RenderStates will be empty unless calling {@link t3d.Scene#updateRenderQueue}.
	 * @param {t3d.Camera} camera - The camera.
	 * @param {Boolean} [updateScene=true] - Whether to update scene data.
	 * @return {t3d.RenderStates} - The result render states.
	 */
	updateRenderStates(camera, updateScene = true) {
		if (!this._renderStatesMap.has(camera)) {
			this._renderStatesMap.set(camera, new RenderStates(this._sceneData, this._lightData));
		}

		const renderStates = this._renderStatesMap.get(camera);

		if (updateScene) {
			this._sceneData.update(this);
		}

		renderStates.updateCamera(camera);

		return renderStates;
	}

	/**
	 * Get {@link t3d.RenderStates} for the scene and camera.
	 * The RenderStates will be updated by calling {@link t3d.Scene#updateRenderStates}.
	 * The light data in RenderStates will be empty unless calling {@link t3d.Scene#updateRenderQueue}.
	 * @param {t3d.Camera} camera - The camera.
	 * @return {t3d.RenderQueue} - The target render queue.
	 */
	getRenderStates(camera) {
		return this._renderStatesMap.get(camera);
	}

	/**
	 * Update {@link t3d.RenderQueue} for the scene and camera.
	 * Collect all visible meshes (and lights) from scene graph, and push meshes to render queue.
	 * Light data will be stored in RenderStates.
	 * @param {t3d.Camera} camera - The camera.
	 * @param {Boolean} [collectLights=true] - Whether to collect light data.
	 * @param {Boolean} [updateSkeletons=true] - Whether to update skeletons.
	 * @return {t3d.RenderQueue} - The result render queue.
	 */
	updateRenderQueue(camera, collectLights = true, updateSkeletons = true) {
		if (!this._renderQueueMap.has(camera)) {
			this._renderQueueMap.set(camera, new RenderQueue());
		}

		const renderQueue = this._renderQueueMap.get(camera);

		renderQueue.begin();
		this._pushToRenderQueue(this, camera, renderQueue);
		renderQueue.end();

		if (collectLights) {
			this._lightData.begin();
			for (const light of renderQueue.lightsArray) {
				this._lightData.push(light);
			}
			this._lightData.end(this._sceneData);
		}

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
	 * Get {@link t3d.RenderQueue} for the scene and camera.
	 * The RenderQueue will be updated by calling {@link t3d.Scene#updateRenderQueue}.
	 * @param {t3d.Camera} camera - The camera.
	 * @return {t3d.RenderQueue} - The target render queue.
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
			renderQueue.pushLight(object);
		}

		const children = object.children;
		for (let i = 0, l = children.length; i < l; i++) {
			this._pushToRenderQueue(children[i], camera, renderQueue);
		}
	}

}

/**
 * @readonly
 * @type {Boolean}
 * @default true
 */
Scene.prototype.isScene = true;

const _boundingSphere = new Sphere();

export { Scene };
