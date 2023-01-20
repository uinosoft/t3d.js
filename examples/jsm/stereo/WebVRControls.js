var WebVRControl = function(camera) {
	this.camera = camera;

	this._vrDisplay = null;
	this._frameData = null;

	this._currentDepthNear = 0;
	this._currentDepthFar = 0;
}

Object.assign(WebVRControl.prototype, {
	enter: function() {
		var that = this;
		if (navigator.getVRDisplays) {
			return navigator.getVRDisplays().then(function(displays) {
				if (displays.length > 0) {
					that._vrDisplay = displays[0];
					return Promise.resolve();
				} else {
					return Promise.reject('WebVRControl: displays.length = 0.');
				}
			}).then(function() {
				if ('VRFrameData' in window) {
					that._frameData = new window.VRFrameData();
					return Promise.resolve(that._vrDisplay);
				} else {
					return Promise.reject('WebVRControl: VRFrameData not exist in global.');
				}
			});
		} else {
			return Promise.reject('WebVRControl: getVRDisplays not exist in navigator.');
		}
	},

	exit: function() {
		this._vrDisplay = null;
		this._frameData = null;
	},

	update: function() {
		var camera = this.camera;
		var vrDisplay = this._vrDisplay;
		var frameData = this._frameData;

		if (!vrDisplay || !frameData) {
			return;
		}

		var cameraL = camera.cameraL;
		var cameraR = camera.cameraR;

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
	},

	getContext() {
		return this._vrDisplay;
	},

	submit: function() {
		if (this._vrDisplay) {
			this._vrDisplay.submitFrame();
		}
	}
});

export { WebVRControl };