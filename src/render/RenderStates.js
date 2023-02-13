import { TEXEL_ENCODING_TYPE } from '../const.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector4 } from '../math/Vector4.js';

function _isPerspectiveMatrix(m) {
	return m.elements[11] === -1.0;
}

let _cameraDataId = 0;

/**
 * RenderStates collect all render states about scene and camera.
 * @memberof t3d
 */
class RenderStates {

	constructor(sceneData, lightsData) {
		this.scene = sceneData;
		this.lights = lightsData;

		this.camera = {
			id: _cameraDataId++,
			version: 0,
			near: 0,
			far: 0,
			position: new Vector3(),
			logDepthCameraNear: 0,
			logDepthBufFC: 0,
			viewMatrix: new Matrix4(),
			projectionMatrix: new Matrix4(),
			projectionViewMatrix: new Matrix4(),
			rect: new Vector4(0, 0, 1, 1)
		};

		this.gammaFactor = 2.0;
		this.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;
	}

	/**
	 * Update render states about camera.
	 * @param {t3d.Camera}
	 */
	updateCamera(camera) {
		const sceneData = this.scene;
		const cameraData = this.camera;
		const projectionMatrix = camera.projectionMatrix;

		let cameraNear = 0, cameraFar = 0;
		if (_isPerspectiveMatrix(projectionMatrix)) {
			cameraNear = projectionMatrix.elements[14] / (projectionMatrix.elements[10] - 1);
			cameraFar = projectionMatrix.elements[14] / (projectionMatrix.elements[10] + 1);
		} else {
			cameraNear = (projectionMatrix.elements[14] + 1) / projectionMatrix.elements[10];
			cameraFar = (projectionMatrix.elements[14] - 1) / projectionMatrix.elements[10];
		}

		cameraData.near = cameraNear;
		cameraData.far = cameraFar;

		if (sceneData.logarithmicDepthBuffer) {
			cameraData.logDepthCameraNear = cameraNear;
			cameraData.logDepthBufFC = 2.0 / (Math.log(cameraFar - cameraNear + 1.0) * Math.LOG2E);
		} else {
			cameraData.logDepthCameraNear = 0;
			cameraData.logDepthBufFC = 0;
		}

		cameraData.position.setFromMatrixPosition(camera.worldMatrix);
		if (sceneData.useAnchorMatrix) {
			cameraData.position.applyMatrix4(sceneData.anchorMatrixInverse);
		}

		cameraData.viewMatrix.copy(camera.viewMatrix);
		if (sceneData.useAnchorMatrix) {
			cameraData.viewMatrix.multiply(sceneData.anchorMatrix);
		}

		cameraData.projectionMatrix.copy(projectionMatrix);
		cameraData.projectionViewMatrix.copy(projectionMatrix).multiply(cameraData.viewMatrix);

		cameraData.rect.copy(camera.rect);

		cameraData.version++;

		this.gammaFactor = camera.gammaFactor;
		this.outputEncoding = camera.outputEncoding;
	}

}

export { RenderStates };