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
		quickSort(this.transparent, 0, this.transparent.length, this.transparentSortCompareFn);
	}

}

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

// Reference github.com/ant-galaxy/oasis-engine/blob/main/packages/core/src/RenderPipeline/RenderQueue.ts
// quickSort is faster when sorting highly randomized arrays,
// but for sorting lowly randomized arrays, Array.prototype.sort is faster,
// so quickSort is more suitable for transparent list sorting.

function quickSort(a, from, to, compareFunc) {
	while (true) {
		// Insertion sort is faster for short arrays.
		if (to - from <= 10) {
			insertionSort(a, from, to, compareFunc);
			return;
		}
		const third_index = (from + to) >> 1;
		// Find a pivot as the median of first, last and middle element.
		let v0 = a[from];
		let v1 = a[to - 1];
		let v2 = a[third_index];
		const c01 = compareFunc(v0, v1);
		if (c01 > 0) {
			const tmp = v0;
			v0 = v1;
			v1 = tmp;
		}
		const c02 = compareFunc(v0, v2);
		if (c02 >= 0) {
			const tmp = v0;
			v0 = v2;
			v2 = v1;
			v1 = tmp;
		} else {
			const c12 = compareFunc(v1, v2);
			if (c12 > 0) {
				const tmp = v1;
				v1 = v2;
				v2 = tmp;
			}
		}
		a[from] = v0;
		a[to - 1] = v2;
		const pivot = v1;
		let low_end = from + 1; // Upper bound of elements lower than pivot.
		let high_start = to - 1; // Lower bound of elements greater than pivot.
		a[third_index] = a[low_end];
		a[low_end] = pivot;

		// From low_end to i are elements equal to pivot.
		// From i to high_start are elements that haven't been compared yet.
		partition: for (let i = low_end + 1; i < high_start; i++) {
			let element = a[i];
			let order = compareFunc(element, pivot);
			if (order < 0) {
				a[i] = a[low_end];
				a[low_end] = element;
				low_end++;
			} else if (order > 0) {
				do {
					high_start--;
					if (high_start == i) break partition;
					const top_elem = a[high_start];
					order = compareFunc(top_elem, pivot);
				} while (order > 0);
				a[i] = a[high_start];
				a[high_start] = element;
				if (order < 0) {
					element = a[i];
					a[i] = a[low_end];
					a[low_end] = element;
					low_end++;
				}
			}
		}
		if (to - high_start < low_end - from) {
			quickSort(a, high_start, to, compareFunc);
			to = low_end;
		} else {
			quickSort(a, from, low_end, compareFunc);
			from = high_start;
		}
	}
}

function insertionSort(a, from, to, compareFunc) {
	for (let i = from + 1; i < to; i++) {
		let j;
		const element = a[i];
		for (j = i - 1; j >= from; j--) {
			const tmp = a[j];
			const order = compareFunc(tmp, element);
			if (order > 0) {
				a[j + 1] = tmp;
			} else {
				break;
			}
		}
		a[j + 1] = element;
	}
}

export { RenderQueueLayer };