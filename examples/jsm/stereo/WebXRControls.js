var WebXRControl = function(camera) {
	this.camera = camera;

	this._session = null;
	this._referenceSpace = null;

	this._currentDepthNear = 0;
	this._currentDepthFar = 0;
}

Object.assign(WebXRControl.prototype, {
	enter: function(gl, type) {
		type = type || 'immersive-vr';

		if (navigator.xr) {
			var sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };

			return navigator.xr.isSessionSupported(type)
				.then(supported => {
					if (supported) {
						return Promise.resolve();
					} else {
						return Promise.reject('WebXR: ' + type + ' is not supported');
					}
				})
				.then(() => {
					return navigator.xr.requestSession(type, sessionInit);
				})
				.then(session => {
					this._session = session;
					var attributes = gl.getContextAttributes();
					var layerInit = {
						antialias: attributes.antialias,
						alpha: attributes.alpha,
						depth: attributes.depth,
						stencil: attributes.stencil,
						framebufferScaleFactor: 1.0
					};
					var baseLayer = new XRWebGLLayer(session, gl, layerInit);
					session.updateRenderState({ baseLayer: baseLayer });
					return session.requestReferenceSpace('local-floor');
				})
				.then(referenceSpace => {
					this._referenceSpace = referenceSpace;
					return Promise.resolve(this._session);
				});
		} else {
			return Promise.reject('xr not exist in navigator');
		}
	},

	exit: function() {
		// todo
	},

	update: function(frame, width, height) {
		var camera = this.camera;
		var session = this._session;
		var referenceSpace = this._referenceSpace;

		var cameraL = camera.cameraL;
		var cameraR = camera.cameraR;

		if (this._currentDepthNear !== camera.near || this._currentDepthFar !== camera.far) {
			// the new renderState won't apply until the next frame
			session.updateRenderState({
				depthNear: camera.near,
				depthFar: camera.far
			});
			this._currentDepthNear = camera.near;
			this._currentDepthFar = camera.far;
		}

		var pose = frame.getViewerPose(referenceSpace);
		if (pose !== null) {
			var views = pose.views;
			var baseLayer = session.renderState.baseLayer;

			// set cameras
			for (var i = 0; i < views.length; i++) {
				var view = views[i];
				var viewport = baseLayer.getViewport(view);

				var _camera = i === 0 ? cameraL : cameraR;
				_camera.matrix.fromArray(view.transform.matrix);
				_camera.matrix.decompose(_camera.position, _camera.quaternion, _camera.scale);
				_camera.position.add(camera.position);
				_camera.updateMatrix();
				_camera.projectionMatrix.fromArray(view.projectionMatrix);
				_camera.projectionMatrixInverse.getInverse(_camera.projectionMatrix);

				var x = viewport.x / width;
				var y = viewport.y / height;
				var _width = viewport.width / width;
				var _height = viewport.height / height;
				_camera.rect.set(x, y, x + _width, y + _height);
			}
		}
	},

	getContext() {
		return this._session;
	},

	getFramebuffer: function() {
		return this._session.renderState.baseLayer.framebuffer;
	}
});

export { WebXRControl };