import { RenderQueueLayer } from './RenderQueueLayer.js';
import { Vector3 } from '../math/Vector3.js';

/**
 * RenderQueue is used to collect all renderable items, lights and skeletons from the scene.
 * Renderable items will be dispatched to the corresponding RenderQueueLayer according to the object's renderLayer property.
 * @memberof t3d
 */
class RenderQueue {

	constructor() {
		this.layerMap = new Map();
		this.layerList = [];

		this.lightsArray = [];

		this.skeletons = new Set();

		// to optimize the performance of the next push, cache the last layer used
		this._lastLayer = this.createLayer(0);
	}

	begin() {
		for (let i = 0, l = this.layerList.length; i < l; i++) {
			this.layerList[i].begin();
		}

		this.lightsArray.length = 0;

		this.skeletons.clear();
	}

	end() {
		for (let i = 0, l = this.layerList.length; i < l; i++) {
			this.layerList[i].end();
			this.layerList[i].sort();
		}
	}

	push(object, camera) {
		// collect skeleton if exists
		if (object.skeleton) {
			this.skeletons.add(object.skeleton);
		}

		// calculate depth for sorting
		helpVector3.setFromMatrixPosition(object.worldMatrix);
		helpVector3.applyMatrix4(camera.projectionViewMatrix);
		const depth = helpVector3.z;

		const layerId = object.renderLayer || 0;

		let layer = this._lastLayer;
		if (layer.id !== layerId) {
			layer = this.layerMap.get(layerId);
			if (!layer) {
				layer = this.createLayer(layerId);
			}
			this._lastLayer = layer;
		}

		if (Array.isArray(object.material)) {
			const groups = object.geometry.groups;

			for (let i = 0; i < groups.length; i++) {
				const group = groups[i];
				const groupMaterial = object.material[group.materialIndex];
				if (groupMaterial) {
					layer.addRenderable(object, object.geometry, groupMaterial, depth, group);
				}
			}
		} else {
			layer.addRenderable(object, object.geometry, object.material, depth);
		}
	}

	pushLight(light) {
		this.lightsArray.push(light);
	}

	/**
     * Set a render queue layer.
	 * @param {Number} id - The layer id.
     * @param {t3d.RenderQueueLayer} layer - The layer to set.
     */
	setLayer(id, layer) {
		this.layerMap.set(id, layer);
		this.layerList.push(layer);
		this.layerList.sort(sortLayer);
	}

	/**
     * Create and set a render queue layer.
	 * @param {Number} id - The layer id.
	 * @return {t3d.RenderQueueLayer}
     */
	createLayer(id) {
		const layer = new RenderQueueLayer(id);
		this.setLayer(id, layer);
		return layer;
	}

	/**
     * Get the render queue layer.
	 * @param {Number} id - The layer id.
	 * @return {t3d.RenderQueueLayer}
     */
	getLayer(id) {
		return this.layerMap.get(id);
	}

	/**
     * Remove the render queue layer.
	 * @param {Number} id - The layer id.
     */
	removeLayer(id) {
		const layer = this.layerMap.get(id);

		if (layer) {
			this.layerMap.delete(id);

			const index = this.layerList.indexOf(layer);
			if (index !== -1) {
				this.layerList.splice(index, 1);
			}

			if (this._lastLayer === id) {
				this._lastLayer = null;
			}
		}
	}

}

const helpVector3 = new Vector3();

function sortLayer(a, b) {
	return a.id - b.id;
}

export { RenderQueue };