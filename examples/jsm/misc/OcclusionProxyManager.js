import { QuerySet, QUERYSET_TYPE, Mesh } from 't3d';

export class OcclusionProxyManager {

	constructor(count = 2048) {
		this.querySet = new QuerySet(QUERYSET_TYPE.OCCLUSION, count);
		this.occludedArray = new Array(count).fill(0);
		this.proxies = [];
		this.indices = new IndicesManager(count);
		this.isReading = false;
	}

	addProxy(proxy) {
		const index = this.indices.getIndex();
		if (index === -1) {
			console.warn('OcclusionProxyManager: Reached the max count of occlusion proxies.');
			return;
		}
		proxy.$activate(index);
		this.proxies.push(proxy);
	}

	removeProxy(proxy) {
		const i = this.proxies.indexOf(proxy);
		if (i !== -1) {
			this.proxies.splice(i, 1);
			this.indices.freeIndex(proxy.$deactivate());
		}
	}

	update(renderer) {
		if (!this.isReading) {
			renderer.readQuerySetResults(
				this.querySet, this.occludedArray,
				0, this.indices.maxIndex + 1
			).then(results => {
				this.proxies.forEach(proxy => {
					proxy.$syncOcclusion(results);
				});
				this.isReading = false;
			});
			this.isReading = true;
		}
	}

}

export class OcclusionProxy extends Mesh {

	constructor(geometry, material) {
		super(geometry, material);

		// Set renderLayer to 1 by default.
		// This can be changed by user
		// to make sure the occlusion tester is rendered after other objects.
		this.renderLayer = 1;

		this.onOcclusionChange = null;

		this._index = -1;
		this._occluded = false;
	}

	get active() {
		return this._index !== -1;
	}

	get index() {
		return this._index;
	}

	get occluded() {
		return this._occluded;
	}

	$activate(index) {
		this._index = index;
	}

	$deactivate() {
		const index = this._index;

		this._index = -1;
		this._occluded = false;

		return index;
	}

	$syncOcclusion(occludedArray) {
		if (this._index === -1) return;
		const occluded = !occludedArray[this._index];
		if (this._occluded !== occluded) {
			this._occluded = occluded;
			this.onOcclusionChange && this.onOcclusionChange(occluded);
		}
	}

}

OcclusionProxy.prototype.isOcclusionProxy = true;

class IndicesManager {

	constructor(maxCount) {
		this.maxIndex = -1;
		this.freeIndices = [];
		this.maxCount = maxCount;
	}

	getIndex() {
		let index;
		if (this.freeIndices.length > 0) {
			// Get the smallest index from freeIndices
			index = this.freeIndices.pop();
		} else {
			if (this.maxIndex + 1 >= this.maxCount) {
				// Reached the max count of occlusion proxies.
				return -1;
			}
			index = ++this.maxIndex;
		}
		return index;
	}

	freeIndex(index) {
		if (index < 0 || index > this.maxIndex) {
			return;
		}

		if (index === this.maxIndex) {
			this.maxIndex--;
		}

		// Insert index back to freeIndices, keeping the array sorted in descending order
		let left = 0, right = this.freeIndices.length;
		while (left < right) {
			const mid = Math.floor((left + right) / 2);
			if (this.freeIndices[mid] > index) {
				left = mid + 1;
			} else {
				right = mid;
			}
		}
		this.freeIndices.splice(left, 0, index);
	}

}

export const OcclusionRenderOptions = {
	ifRender: function(renderable) {
		return renderable.object.active;
	},
	beforeRender: function(renderable) {
		this.beginOcclusionQuery(renderable.object.index);
	},
	afterRender: function() {
		this.endOcclusionQuery();
	}
};