import { ForwardRenderer } from '../render/ForwardRenderer.js';

class StereoRenderer extends ForwardRenderer {

	constructor(view, options) {
		super(view, options);
	}

	render(scene, camera, renderTarget) {
		const cameraL = camera.cameraL;
		const cameraR = camera.cameraR;

		this.matrixAutoUpdate && scene.updateMatrix();

		scene.updateRenderStates(cameraL);
		scene.updateRenderQueue(cameraL); // TODO generate render queue by combined camera

		if (this.shadowAutoUpdate || this.shadowNeedsUpdate) {
			this.shadowMapPass.render(this, scene);

			this.shadowNeedsUpdate = false;
		}

		renderTarget = renderTarget || this.screenRenderTarget;

		this.renderScene(scene, cameraL, renderTarget);

		scene.updateRenderStates(cameraR, false);
		scene.updateRenderQueue(cameraR, false, false);

		const oldClearColor = renderTarget.clearColor;
		const oldClearDepth = renderTarget.clearDepth;
		const oldClearStencil = renderTarget.clearStencil;

		renderTarget.setClear(false, false, false);
		this.renderScene(scene, cameraR, renderTarget);

		renderTarget.setClear(oldClearColor, oldClearDepth, oldClearStencil);
	}

}

export { StereoRenderer };