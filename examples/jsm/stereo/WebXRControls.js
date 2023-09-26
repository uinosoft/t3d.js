class WebXRControl {

	constructor(camera) {
		this.camera = camera;

		this._session = null;
		this._referenceSpace = null;

		this._currentDepthNear = 0;
		this._currentDepthFar = 0;
	}

	enter(gl, type = 'immersive-vr') {
		if (navigator.xr) {
			const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };

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
					const attributes = gl.getContextAttributes();
					const layerInit = {
						antialias: attributes.antialias,
						alpha: attributes.alpha,
						depth: attributes.depth,
						stencil: attributes.stencil,
						framebufferScaleFactor: 1.0
					};
					// eslint-disable-next-line
					const baseLayer = new XRWebGLLayer(session, gl, layerInit);
					session.updateRenderState({ baseLayer });
					return session.requestReferenceSpace('local-floor');
				})
				.then(referenceSpace => {
					this._referenceSpace = referenceSpace;
					return Promise.resolve(this._session);
				});
		} else {
			return Promise.reject('xr not exist in navigator');
		}
	}

	exit() {
		// todo
	}

	update(frame, width, height) {
		const camera = this.camera;
		const session = this._session;
		const referenceSpace = this._referenceSpace;

		const cameraL = camera.cameraL;
		const cameraR = camera.cameraR;

		if (this._currentDepthNear !== camera.near || this._currentDepthFar !== camera.far) {
			// the new renderState won't apply until the next frame
			session.updateRenderState({
				depthNear: camera.near,
				depthFar: camera.far
			});
			this._currentDepthNear = camera.near;
			this._currentDepthFar = camera.far;
		}

		const pose = frame.getViewerPose(referenceSpace);
		if (pose !== null) {
			const views = pose.views;
			const baseLayer = session.renderState.baseLayer;

			// set cameras
			for (let i = 0; i < views.length; i++) {
				const view = views[i];
				const viewport = baseLayer.getViewport(view);

				const _camera = i === 0 ? cameraL : cameraR;
				_camera.matrix.fromArray(view.transform.matrix);
				_camera.matrix.decompose(_camera.position, _camera.quaternion, _camera.scale);
				_camera.position.add(camera.position);
				_camera.updateMatrix();
				_camera.projectionMatrix.fromArray(view.projectionMatrix);
				_camera.projectionMatrixInverse.getInverse(_camera.projectionMatrix);

				const x = viewport.x / width;
				const y = viewport.y / height;
				const _width = viewport.width / width;
				const _height = viewport.height / height;
				_camera.rect.set(x, y, x + _width, y + _height);
			}
		}
	}

	getContext() {
		return this._session;
	}

	getFramebuffer() {
		return this._session.renderState.baseLayer.framebuffer;
	}

}

export { WebXRControl };