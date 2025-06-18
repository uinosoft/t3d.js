import { Matrix4 } from '../math/Matrix4.js';
import { Plane } from '../math/Plane.js';

const _plane_1 = new Plane();

let _sceneDataId = 0;

/**
 * SceneData collect all render states about scene, Including lights.
 */
class SceneData {

	constructor() {
		this.id = _sceneDataId++;
		this.version = 0;

		this.useAnchorMatrix = false;
		this.anchorMatrix = new Matrix4();
		this.anchorMatrixInverse = new Matrix4();

		this.disableShadowSampler = false;

		this.logarithmicDepthBuffer = false;

		this.fog = null;
		this.environment = null;
		this.envDiffuseIntensity = 1;
		this.envSpecularIntensity = 1;
		this.clippingPlanesData = new Float32Array([]);
		this.numClippingPlanes = 0;
	}

	/**
	 * Update scene data.
	 * @param {Scene} scene
	 */
	update(scene) {
		this.useAnchorMatrix = !scene.anchorMatrix.isIdentity();
		this.anchorMatrix.copy(scene.anchorMatrix);
		this.anchorMatrixInverse.copy(scene.anchorMatrix).invert();

		this.disableShadowSampler = scene.disableShadowSampler;

		this.logarithmicDepthBuffer = scene.logarithmicDepthBuffer;

		this.fog = scene.fog;

		this.environment = scene.environment;
		this.envDiffuseIntensity = scene.envDiffuseIntensity;
		this.envSpecularIntensity = scene.envSpecularIntensity;

		if (this.clippingPlanesData.length < scene.clippingPlanes.length * 4) {
			this.clippingPlanesData = new Float32Array(scene.clippingPlanes.length * 4);
		}
		this.setClippingPlanesData(scene.clippingPlanes, this.clippingPlanesData);
		this.numClippingPlanes = scene.clippingPlanes.length;

		this.version++;
	}

	setClippingPlanesData(clippingPlanes, clippingPlanesData) {
		for (let i = 0; i < clippingPlanes.length; i++) {
			_plane_1.copy(clippingPlanes[i]);
			if (this.useAnchorMatrix) {
				_plane_1.applyMatrix4(this.anchorMatrixInverse);
			}
			clippingPlanesData[i * 4 + 0] = _plane_1.normal.x;
			clippingPlanesData[i * 4 + 1] = _plane_1.normal.y;
			clippingPlanesData[i * 4 + 2] = _plane_1.normal.z;
			clippingPlanesData[i * 4 + 3] = _plane_1.constant;
		}

		return clippingPlanesData;
	}

}

export { SceneData };