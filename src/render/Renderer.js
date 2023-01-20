import { WebGLRenderPass } from '../webgl/WebGLRenderPass.js';

/**
 * Graph renderer.
 * @memberof t3d
 */
class Renderer {

	/**
     * @param {WebGLRenderingContext|WebGPURenderingContext} context - The Rendering Context privided by canvas. Only support WebGLRenderingContext for now.
     */
	constructor(context) {
		/**
         * Render Pass provides the core rendering method.
         * @type {t3d.WebGLRenderPass|t3d.WebGPURenderPass}
         */
		this.renderPass = new WebGLRenderPass(context);
	}

	/**
     * Render a scene.
     * This method will render all layers in scene's RenderQueue by default.
     * If you need a customized rendering process, it is recommended to use Renderer.renderRenderableList
     * @param {t3d.Scene} scene
     * @param {t3d.Camera} camera
     */
	renderScene(scene, camera) {
		const renderStates = scene.getRenderStates(camera);
		const renderQueue = scene.getRenderQueue(camera);

		let renderQueueLayer;

		for (let i = 0, l = renderQueue.layerList.length; i < l; i++) {
			renderQueueLayer = renderQueue.layerList[i];
			this.renderRenderableList(renderQueueLayer.opaque, renderStates);
			this.renderRenderableList(renderQueueLayer.transparent, renderStates);
		}
	}

	/**
     * Render a single renderable list in camera in sequence.
     * @param {Array} renderables - Array of renderables.
     * @param {t3d.RenderStates} renderStates - Render states.
     * @param {Object} [options=] - The options for this render.
     * @param {Function} [options.getGeometry=] - Get renderable geometry.
	 * @param {Function} [options.getMaterial=] - Get renderable material.
     * @param {Function} [options.beforeRender=] - Before render each renderable.
     * @param {Function} [options.afterRender=] - After render each renderable
     * @param {Function} [options.ifRender=] - If render the renderable.
	 * @param {t3d.RenderInfo} [options.renderInfo=] - Render info for collect information.
     */
	renderRenderableList(renderables, renderStates, options = {}) {
		const renderPass = this.renderPass;
		for (let i = 0, l = renderables.length; i < l; i++) {
			renderPass.render(renderables[i], renderStates, options);
		}
	}

}

export { Renderer };