import {
	EventDispatcher
} from 't3d';

/**
 * The IndicesManager is a tool designed for managing various index states. 
 * It oversees three primary statuses: 'Assigned Active', 'Assigned Inactive', and 'Unassigned Inactive'.
 */
class IndicesManager extends EventDispatcher {

	constructor(maxLimitCount = 1000, isTriggering = false) {
		super();

		this._maxLimitCount = maxLimitCount;
		this._allocatedCount = 0;
		this._allocatedAndActiveTailIndex = -1;

		this._map = new Map();
		this._reverseMap = new Map();

		this._isTriggering = isTriggering;
		this._taskQueue = new Map();
	}

	set maxLimitCount(value) {
		this._maxLimitCount = value;
	}

	get maxLimitCount() {
		return this._maxLimitCount;
	}

	get allocatedCount() {
		return this._allocatedCount;
	}

	get activeCount() {
		return this._allocatedAndActiveTailIndex + 1;
	}

	getIndex(object) {
		if (!this._map.has(object)) {
			console.warn('IndicesManager: Index not found, will attempt to allocate..');
			return this.allocateIndex(object);
		}

		return this._map.get(object);
	}

	hasIndex(object) {
		return this._map.has(object);
	}

	allocateIndex(object, activate = false) {
		if (this._map.has(object)) {
			console.warn('IndicesManager: Index already allocated.');
			return this._map.get(object);
		}

		let index = this._allocatedCount;
		this._allocatedCount++;

		if (this._allocatedCount > this._maxLimitCount) {
			console.warn('IndicesManager: Max limit is <' + this._maxLimitCount + '> .');
			index--;
			this._allocatedCount--;
		}

		this._map.set(object, index);
		this._reverseMap.set(index, object);

		if (activate) {
			this.activateIndex(object);
		}
		else {
			this.deactivateIndex(object);
		}

		return index;
	}

	releaseIndex(object, isTriggering = false) {
		if (!this._map.has(object)) {
			return false;
		}

		if (this._isTriggering && isTriggering) {
			this._taskQueue.set(object, 'releaseIndex');
			return;
		}

		this.deactivateIndex(object);

		const sourceIndex = this._allocatedCount - 1;
		const targetIndex = this._map.get(object);
		this._map.delete(object);
		this._reverseMap.delete(targetIndex);
		this._allocatedCount--;

		this.moveIndex(sourceIndex, targetIndex);

		return true;
	}

	moveIndex(sourceIndex, targetIndex) {
		if (sourceIndex === targetIndex) {
			return false;
		}

		const sourceObject = this._reverseMap.get(sourceIndex);
		this._map.set(sourceObject, targetIndex);
		this._reverseMap.set(targetIndex, sourceObject);

		this.dispatchEvent({ type: EVENT_TYPES.INDEX_CHANGED, sourceIndex, targetIndex });

		return true;
	}

	swapIndex(sourceIndex, targetIndex) {
		if (sourceIndex === targetIndex) {
			return false;
		}

		const sourceObject = this._reverseMap.get(sourceIndex);
		const targetObject = this._reverseMap.get(targetIndex);
		this._map.set(sourceObject, targetIndex);
		this._map.set(targetObject, sourceIndex);
		this._reverseMap.set(sourceIndex, targetObject);
		this._reverseMap.set(targetIndex, sourceObject);

		this.dispatchEvent({ type: EVENT_TYPES.INDEX_CHANGED, sourceIndex, targetIndex });

		return true;
	}

	activateIndex(object, isTriggering = false) {
		if (!this._map.has(object)) {
			return false;
		}

		if (this._isTriggering && isTriggering) {
			this._taskQueue.set(object, 'activateIndex');
			return;
		}

		const index = this._map.get(object);
		if (index > this._allocatedAndActiveTailIndex) {
			this._allocatedAndActiveTailIndex++;
			const swapped = this.swapIndex(index, this._allocatedAndActiveTailIndex);
			if (!swapped) {	// If the swap failed, then the index was already at the tail.
				this.dispatchEvent({ type: EVENT_TYPES.ACTIVE_COUNT_CHANGED, activeCount: this.activeCount });
			}
		}

		return true;
	}

	deactivateIndex(object, isTriggering = false) {
		if (!this._map.has(object)) {
			return false;
		}

		if (this._isTriggering && isTriggering) {
			this._taskQueue.set(object, 'deactivateIndex');
			return;
		}

		const index = this._map.get(object);
		if (index <= this._allocatedAndActiveTailIndex) {
			this._allocatedAndActiveTailIndex--;
			const swapped = this.swapIndex(this._allocatedAndActiveTailIndex + 1, index);
			if (!swapped) {	// If the swap failed, then the index was already at the tail.
				this.dispatchEvent({ type: EVENT_TYPES.ACTIVE_COUNT_CHANGED, activeCount: this.activeCount });
			}
		}

		return true;
	}

	triggerQueue() {
		if (!this._isTriggering) {
			return;
		}

		this._taskQueue.forEach((task, object) => {
			switch (task) {
				case 'releaseIndex':
					this.releaseIndex(object);
					break;
				case 'activateIndex':
					this.activateIndex(object);
					break;
				case 'deactivateIndex':
					this.deactivateIndex(object);
					break;
			}
		});
		this._taskQueue.clear();
	}

	clear() {
		this._allocatedCount = 0;
		this._allocatedAndActiveTailIndex = -1;
		this._map.clear();
		this._reverseMap.clear();

		this.dispatchEvent({ type: EVENT_TYPES.ACTIVE_COUNT_CHANGED, activeCount: this.activeCount });
	}

}

const EVENT_TYPES = {
	INDEX_CHANGED: 'IndexChanged',
	ACTIVE_COUNT_CHANGED: 'ActiveCountChanged'
};

export { IndicesManager, EVENT_TYPES };