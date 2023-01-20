import { DRAW_SIDE } from '../../const.js';
import { DepthMaterial } from '../../resources/materials/DepthMaterial.js';
import { DistanceMaterial } from '../../resources/materials/DistanceMaterial.js';
import { Vector4 } from '../../math/Vector4.js';

/**
 * Shadow map pass.
 * @memberof t3d
 */
class ShadowMapPass {

	constructor() {
		/**
		 * Get depth material function.
		 * Override this to use custom depth material.
		 * @type {Function}
		 */
		this.getDepthMaterial = _getDepthMaterial;

		/**
		 * Get distance material function.
		 * Override this to use custom distance material.
		 * @type {Function}
		 */
		this.getDistanceMaterial = _getDistanceMaterial;

		/**
		 * Get geometry function for shadow render options.
		 * @type {Null|Function}
		 */
		this.getGeometry = null;

		/**
		 * Define which render layers will produce shadows.
		 * If the value is Null, it means that all render layers will produce shadows.
		 * @type {Null|Array}
		 * @default null
		 */
		this.shadowLayers = null;

		/**
		 * Whether transparent objects can cast shadows.
		 * @type {Boolean}
		 * @default false
		 */
		this.transparentShadow = false;
	}

	/**
	 * Render shadow map.
	 * @param {t3d.Renderer} renderer
	 * @param {t3d.Scene} scene
	 */
	render(renderer, scene) {
		const renderPass = renderer.renderPass;

		const getGeometry = this.getGeometry;
		const getDepthMaterial = this.getDepthMaterial;
		const getDistanceMaterial = this.getDistanceMaterial;

		oldClearColor.copy(renderPass.getClearColor());
		renderPass.setClearColor(1, 1, 1, 1);

		const lights = scene._lightData.lights;
		const shadowsNum = scene._lightData.shadowsNum;

		for (let i = 0; i < shadowsNum; i++) {
			const light = lights[i];
			const shadow = light.shadow;

			if (shadow.autoUpdate === false && shadow.needsUpdate === false) continue;

			const camera = shadow.camera;
			const shadowTarget = shadow.renderTarget;
			const isPointLight = light.isPointLight;
			const faces = isPointLight ? 6 : 1;

			shadow.prepareDepthMap(!scene.disableShadowSampler, renderPass.capabilities);

			for (let j = 0; j < faces; j++) {
				if (isPointLight) {
					shadow.update(light, j);
					shadowTarget.activeCubeFace = j;
				}

				renderPass.setRenderTarget(shadowTarget);
				renderPass.clear(true, true);

				const renderStates = scene.updateRenderStates(camera, j === 0);
				const renderQueue = scene.updateRenderQueue(camera, false, false);

				for (let k = 0; k < renderQueue.layerList.length; k++) {
					const renderQueueLayer = renderQueue.layerList[k];

					if (this.shadowLayers !== null && this.shadowLayers.indexOf(renderQueueLayer.id) === -1) continue;

					const renderOptions = {
						getGeometry: getGeometry,
						getMaterial: function(renderable) {
							return isPointLight ? getDistanceMaterial(renderable, light) : getDepthMaterial(renderable, light);
						},
						ifRender: function(renderable) {
							return renderable.object.castShadow;
						}
					};

					renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, renderOptions);

					if (this.transparentShadow) {
						renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, renderOptions);
					}
				}
			}

			// set generateMipmaps false
			// renderPass.updateRenderTargetMipmap(shadowTarget);

			shadow.needsUpdate = false;
		}

		renderPass.setClearColor(oldClearColor.x, oldClearColor.y, oldClearColor.z, oldClearColor.w);
	}

}

const oldClearColor = new Vector4();

const shadowSide = { "front": DRAW_SIDE.BACK, "back": DRAW_SIDE.FRONT, "double": DRAW_SIDE.DOUBLE };

const depthMaterials = {};
const distanceMaterials = {};

function _getDepthMaterial(renderable, light) {
	const useSkinning = !!renderable.object.skeleton;
	const useMorphing = renderable.geometry.morphAttributes.position && renderable.geometry.morphAttributes.position.length > 0;

	const clippingPlanes = renderable.material.clippingPlanes;
	const numClippingPlanes = (clippingPlanes && clippingPlanes.length > 0) ? clippingPlanes.length : 0;

	const index = useMorphing << 0 | useSkinning << 1;

	let materials = depthMaterials[index];

	if (materials === undefined) {
		materials = {};
		depthMaterials[index] = materials;
	}

	let material = materials[numClippingPlanes];

	if (material === undefined) {
		material = new DepthMaterial();
		material.packToRGBA = true;

		materials[numClippingPlanes] = material;
	}

	material.side = shadowSide[renderable.material.side];
	material.clippingPlanes = renderable.material.clippingPlanes;
	material.drawMode = renderable.material.drawMode;

	return material;
}

function _getDistanceMaterial(renderable, light) {
	const useSkinning = !!renderable.object.skeleton;
	const useMorphing = renderable.geometry.morphAttributes.position && renderable.geometry.morphAttributes.position.length > 0;

	const clippingPlanes = renderable.material.clippingPlanes;
	const numClippingPlanes = (clippingPlanes && clippingPlanes.length > 0) ? clippingPlanes.length : 0;

	const index = useMorphing << 0 | useSkinning << 1;

	let materials = distanceMaterials[index];

	if (materials === undefined) {
		materials = {};
		distanceMaterials[index] = materials;
	}

	let material = materials[numClippingPlanes];

	if (material === undefined) {
		material = new DistanceMaterial();

		materials[numClippingPlanes] = material;
	}

	material.side = shadowSide[renderable.material.side];
	material.uniforms["nearDistance"] = light.shadow.cameraNear;
	material.uniforms["farDistance"] = light.shadow.cameraFar;

	material.clippingPlanes = renderable.material.clippingPlanes;
	material.drawMode = renderable.material.drawMode;

	return material;
}

export { ShadowMapPass };