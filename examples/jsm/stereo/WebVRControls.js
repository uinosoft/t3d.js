class WebVRControl {

	constructor(camera) {
		this.camera = camera;

		this._vrDisplay = null;
		this._frameData = null;

		this._currentDepthNear = 0;
		this._currentDepthFar = 0;
	}

	enter() {
		if (navigator.getVRDisplays) {
			return navigator.getVRDisplays().then(displays => {
				if (displays.length > 0) {
					this._vrDisplay = displays[0];
					return Promise.resolve();
				} else {
					return Promise.reject('WebVRControl: displays.length = 0.');
				}
			}).then(() => {
				if ('VRFrameData' in window) {
					this._frameData = new window.VRFrameData();
					return Promise.resolve(this._vrDisplay);
				} else {
					return Promise.reject('WebVRControl: VRFrameData not exist in global.');
				}
			});
		} else {
			return Promise.reject('WebVRControl: getVRDisplays not exist in navigator.');
		}
	}

	exit() {
		this._vrDisplay = null;
		this._frameData = null;
	}

	update() {
		const camera = this.camera;
		const vrDisplay = this._vrDisplay;
		const frameData = this._frameData;

		if (!vrDisplay || !frameData) {
			return;
		}

		const cameraL = camera.cameraL;
		const cameraR = camera.cameraR;

		if (this._currentDepthNear !== camera.near || this._currentDepthFar !== camera.far) {
			// read from camera
			vrDisplay.depthNear = camera.near;
			vrDisplay.depthFar = camera.far;

			this._currentDepthNear = camera.near;
			this._currentDepthFar = camera.far;
		}

		vrDisplay.getFrameData(frameData);

		// set Left Camera
		cameraL.projectionMatrix.elements = frameData.leftProjectionMatrix;
		cameraL.viewMatrix.elements = frameData.leftViewMatrix;
		cameraL.viewMatrix.inverse().decompose(cameraL.position, cameraL.quaternion, cameraL.scale);
		cameraL.position.add(camera.position);
		cameraL.updateMatrix();
		cameraL.rect.set(0, 0, 0.5, 1);

		// set Right Camera
		cameraR.projectionMatrix.elements = frameData.leftProjectionMatrix;
		cameraR.viewMatrix.elements = frameData.rightViewMatrix;
		cameraR.viewMatrix.inverse().decompose(cameraR.position, cameraR.quaternion, cameraR.scale);
		cameraR.position.add(camera.position);
		cameraR.updateMatrix();
		cameraR.rect.set(0.5, 0, 1, 1);
	}

	getContext() {
		return this._vrDisplay;
	}

	submit() {
		if (this._vrDisplay) {
			this._vrDisplay.submitFrame();
		}
	}

}

export { WebVRControl };