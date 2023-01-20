import { ForwardRenderer } from "../render/ForwardRenderer.js";

class StereoRenderer extends ForwardRenderer {

	constructor(view, options) {
		super(view, options);
	}

	render(scene, camera, renderTarget, forceClear) {
		const cameraL = camera.cameraL;
		const cameraR = camera.cameraR;

		this.matrixAutoUpdate && scene.updateMatrix();

		scene.updateRenderStates(cameraL);
		scene.updateRenderQueue(cameraL); // TODO generate render queue by combined camera

		if (this.shadowAutoUpdate || this.shadowNeedsUpdate) {
			this.shadowMapPass.render(this, scene);

			this.shadowNeedsUpdate = false;
		}

		if (renderTarget === undefined || renderTarget === null || renderTarget.isRenderTarget) {
			if (renderTarget === undefined || renderTarget === null) {
				renderTarget = this.backRenderTarget;
			}
			this.renderPass.setRenderTarget(renderTarget);
		} else {
			// TODO remove this
			this.renderPass.gl.bindFramebuffer(this.renderPass.gl.FRAMEBUFFER, renderTarget);
			this.renderPass._state.currentRenderTarget = null;
		}

		if (this.autoClear || forceClear) {
			this.renderPass.clear(true, true, true);
		}

		this.renderScene(scene, cameraL);

		scene.updateRenderStates(cameraR, false);
		scene.updateRenderQueue(cameraR, false, false);
		this.renderScene(scene, cameraR);

		if (!!renderTarget.texture) {
			this.renderPass.updateRenderTargetMipmap(renderTarget);
		}
	}

}

export { StereoRenderer };