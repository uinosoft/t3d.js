import { TEXTURE_FILTER, Camera, Vector3, RenderTargetCube } from 't3d';

/**
 * A Reflection Probe is rather like a camera that captures a spherical view of its surroundings in all directions.
 * The captured image is then stored as a Cubemap that can be used by objects with environment map.
 */
class ReflectionProbe {

	/**
	 * @param {t3d.RenderTargetCube} [renderTarget=] - The reflection render is done to the renderTarget (if specified).
	 */
	constructor(renderTarget) {
		this.camera = new Camera();

		this.targets = [
			new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0),
			new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1)
		];
		this.ups = [
			new Vector3(0, -1, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1),
			new Vector3(0, 0, -1), new Vector3(0, -1, 0), new Vector3(0, -1, 0)
		];

		this.camera.setPerspective(90 / 180 * Math.PI, 1, 1, 1000);

		this.position = new Vector3();
		this.lookTarget = new Vector3();

		this.renderTarget = renderTarget || new RenderTargetCube(512, 512);
		this.renderTexture = this.renderTarget.texture;
		this.renderTexture.minFilter = TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;

		this.renderOption = {
			ifRender: function(renderable) {
				return !renderable.object.skipReflectionProbe;
			}
		};
	}

	/**
	 * Render the reflection.
	 * Need update scene data and collect light data before calling this method.
	 * @param {t3d.Renderer} renderer
	 * @param {t3d.Scene} scene
	 */
	render(renderer, scene) {
		const renderPass = renderer.renderPass;

		this.camera.position.copy(this.position);

		for (let i = 0; i < 6; i++) {
			this.lookTarget.set(this.targets[i].x + this.camera.position.x, this.targets[i].y + this.camera.position.y, this.targets[i].z + this.camera.position.z);
			this.camera.lookAt(this.lookTarget, this.ups[i]);
			this.camera.updateMatrix();

			this.renderTarget.activeCubeFace = i;
			renderPass.setRenderTarget(this.renderTarget);

			renderPass.clear(true, true, true); // TODO depth bug here?

			const renderStates = scene.updateRenderStates(this.camera, false);
			const renderQueue = scene.updateRenderQueue(this.camera, false, false);

			let renderQueueLayer;

			for (let i = 0, l = renderQueue.layerList.length; i < l; i++) {
				renderQueueLayer = renderQueue.layerList[i];
				renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, this.renderOption);
				renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, this.renderOption);
			}

			renderPass.updateRenderTargetMipmap(this.renderTarget);
		}
	}

}

export { ReflectionProbe };