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

		const state = { isPointLight: false, light: null };
		this._state = state;

		const that = this;
		this._renderOptions = {
			getGeometry: null,
			getMaterial: function(renderable) {
				return state.isPointLight ? that.getDistanceMaterial(renderable, state.light) : that.getDepthMaterial(renderable, state.light);
			},
			ifRender: function(renderable) {
				return renderable.object.castShadow;
			}
		};
	}

	/**
	 * Get geometry function for shadow render options.
	 * @type {Null|Function}
	 */
	set getGeometry(func) {
		if (func) {
			this._renderOptions.getGeometry = func;
		} else {
			delete this._renderOptions.getGeometry;
		}
	}
	get getGeometry() {
		return this._renderOptions.getGeometry;
	}

	/**
	 * The if render function for shadow render options.
	 * @type {Function}
	 */
	set ifRender(func) {
		if (func) {
			this._renderOptions.ifRender = func;
		} else {
			delete this._renderOptions.ifRender;
		}
	}
	get ifRender() {
		return this._renderOptions.ifRender;
	}

	/**
	 * Render shadow map.
	 * @param {t3d.ThinRenderer} renderer
	 * @param {t3d.Scene} scene
	 */
	render(renderer, scene) {
		oldClearColor.copy(renderer.getClearColor());
		renderer.setClearColor(1, 1, 1, 1);

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

			this._state.isPointLight = isPointLight;
			this._state.light = light;
			const renderOptions = this._renderOptions;

			shadow.prepareDepthMap(!scene.disableShadowSampler, renderer.capabilities);

			for (let j = 0; j < faces; j++) {
				if (isPointLight) {
					shadow.update(light, j);
					shadowTarget.activeCubeFace = j;
				}

				renderer.setRenderTarget(shadowTarget);
				renderer.clear(true, true);

				const renderStates = scene.updateRenderStates(camera, j === 0);
				const renderQueue = scene.updateRenderQueue(camera, false, false);

				renderer.beginRender();

				for (let k = 0; k < renderQueue.layerList.length; k++) {
					const renderQueueLayer = renderQueue.layerList[k];

					if (this.shadowLayers !== null && this.shadowLayers.indexOf(renderQueueLayer.id) === -1) continue;

					renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, renderOptions);

					if (this.transparentShadow) {
						renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, renderOptions);
					}
				}

				renderer.endRender();
			}

			// set generateMipmaps false
			// renderer.updateRenderTargetMipmap(shadowTarget);

			shadow.needsUpdate = false;
		}

		renderer.setClearColor(oldClearColor.x, oldClearColor.y, oldClearColor.z, oldClearColor.w);
	}

}

const oldClearColor = new Vector4();

const shadowSide = { 'front': DRAW_SIDE.BACK, 'back': DRAW_SIDE.FRONT, 'double': DRAW_SIDE.DOUBLE };

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
	material.uniforms['nearDistance'] = light.shadow.cameraNear;
	material.uniforms['farDistance'] = light.shadow.cameraFar;

	material.clippingPlanes = renderable.material.clippingPlanes;
	material.drawMode = renderable.material.drawMode;

	return material;
}

export { ShadowMapPass };