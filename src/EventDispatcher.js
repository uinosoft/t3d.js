/**
 * JavaScript events for custom objects.
 * @memberof t3d
 */
class EventDispatcher {

	/**
	 * Adds a listener to an event type.
	 * @param {String} type - The type of event to listen to.
	 * @param {Function} listener - The function that gets called when the event is fired.
	 * @param {Object} [thisObject = this] - The Object of calling listener method.
	 */
	addEventListener(type, listener, thisObject) {
		if (this._eventMap === undefined) this._eventMap = {};

		const eventMap = this._eventMap;

		if (eventMap[type] === undefined) {
			eventMap[type] = [];
		}

		eventMap[type].push({ listener: listener, thisObject: thisObject || this });
	}

	/**
	 * Removes a listener from an event type.
	 * @param {String} type - The type of the listener that gets removed.
	 * @param {Function} listener - The listener function that gets removed.
	 * @param {Object} [thisObject = this] thisObject - The Object of calling listener method.
	 */
	removeEventListener(type, listener, thisObject) {
		if (this._eventMap === undefined) return;

		const eventMap = this._eventMap;
		const eventArray = eventMap[type];

		if (eventArray !== undefined) {
			for (let i = 0, len = eventArray.length; i < len; i++) {
				const bin = eventArray[i];
				if (bin.listener === listener && bin.thisObject === (thisObject || this)) {
					eventArray.splice(i, 1);
					break;
				}
			}
		}
	}

	/**
	 * Fire an event.
	 * @param {Object} event - The event that gets fired.
	 */
	dispatchEvent(event) {
		if (this._eventMap === undefined) return;

		const eventMap = this._eventMap;
		const eventArray = eventMap[event.type];

		if (eventArray !== undefined) {
			event.target = this;

			// Make a copy, in case listeners are removed while iterating.
			const array = eventArray.slice(0);

			for (let i = 0, len = array.length; i < len; i++) {
				const bin = array[i];
				bin.listener.call(bin.thisObject, event);
			}

			event.target = null;
		}
	}

}

export { EventDispatcher };