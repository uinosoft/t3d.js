function defaultOpaqueSortCompare(a, b) {
	if (a.renderOrder !== b.renderOrder) {
		return a.renderOrder - b.renderOrder;
	} else if (a.material.id !== b.material.id) {
		return a.material.id - b.material.id;
	} else {
		return a.id - b.id;
	}
}

function defaultTransparentSortCompare(a, b) {
	if (a.renderOrder !== b.renderOrder) {
		return a.renderOrder - b.renderOrder;
	} else if (a.z !== b.z) {
		return b.z - a.z;
	} else if (a.material.id !== b.material.id) {
		// fix Unstable sort below chrome version 7.0
		// if render same object with different materials
		return a.material.id - b.material.id;
	} else {
		return a.id - b.id;
	}
}

/**
 * RenderQueueLayer holds all the renderable objects.
 * Now has an opaque list and a transparent list.
 * @memberof t3d
 */
class RenderQueueLayer {

	/**
	 * @param {Number} id - layer id.
	 */
	constructor(id) {
		this.id = id;

		this.opaque = [];
		this.opaqueCount = 0;

		this.transparent = [];
		this.transparentCount = 0;

		this._cache = [];
		this._cacheIndex = 0;
		this._lastCacheIndex = 0;

		this.opaqueSortCompareFn = defaultOpaqueSortCompare;
		this.transparentSortCompareFn = defaultTransparentSortCompare;
	}

	begin() {
		this._cacheIndex = 0;

		this.opaqueCount = 0;
		this.transparentCount = 0;
	}

	end() {
		this.opaque.length = this.opaqueCount;
		this.transparent.length = this.transparentCount;

		// Clear references from inactive renderables in the list
		const cacheIndex = this._cacheIndex,
			lastCacheIndex = this._lastCacheIndex;
		if (lastCacheIndex > cacheIndex) {
			const cache = this._cache;
			for (let i = cacheIndex; i < lastCacheIndex; i++) {
				const renderable = cache[i];
				renderable.object = null;
				renderable.geometry = null;
				renderable.material = null;
				renderable.group = null;
			}
		}
		this._lastCacheIndex = cacheIndex;
	}

	addRenderable(object, geometry, material, z, group) {
		const cache = this._cache;

		let renderable = cache[this._cacheIndex];

		if (renderable === undefined) {
			renderable = {
				object: object,
				geometry: geometry,
				material: material,
				z: z,
				renderOrder: object.renderOrder,
				group: group
			};
			cache[this._cacheIndex] = renderable;
		} else {
			renderable.object = object;
			renderable.geometry = geometry;
			renderable.material = material;
			renderable.z = z;
			renderable.renderOrder = object.renderOrder;
			renderable.group = group;
		}

		if (material.transparent) {
			this.transparent[this.transparentCount] = renderable;
			this.transparentCount++;
		} else {
			this.opaque[this.opaqueCount] = renderable;
			this.opaqueCount++;
		}

		this._cacheIndex++;
	}

	sort() {
		this.opaque.sort(this.opaqueSortCompareFn);
		this.transparent.sort(this.transparentSortCompareFn);
	}

}

export { RenderQueueLayer };