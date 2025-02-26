/**
 * JavaScript events for custom objects.
 */
class EventDispatcher {

	/**
	 * Adds a listener to an event type.
	 * @param {string} type - The type of event to listen to.
	 * @param {Function} listener - The function that gets called when the event is fired.
	 */
	addEventListener(type, listener) {
		if (this._listeners === undefined) this._listeners = {};

		const listeners = this._listeners;

		if (listeners[type] === undefined) {
			listeners[type] = [];
		}

		if (listeners[type].indexOf(listener) === -1) {
			listeners[type].push(listener);
		}
	}

	/**
	 * Removes a listener from an event type.
	 * @param {string} type - The type of the listener that gets removed.
	 * @param {Function} listener - The listener function that gets removed.
	 */
	removeEventListener(type, listener) {
		const listeners = this._listeners;

		if (listeners === undefined) return;

		const listenerArray = listeners[type];

		if (listenerArray !== undefined) {
			const index = listenerArray.indexOf(listener);

			if (index !== -1) {
				listenerArray.splice(index, 1);
			}
		}
	}

	/**
	 * Fire an event.
	 * @param {object} event - The event that gets fired.
	 */
	dispatchEvent(event) {
		const listeners = this._listeners;

		if (listeners === undefined) return;

		const listenerArray = listeners[event.type];

		if (listenerArray !== undefined) {
			event.target = this;

			// Make a copy, in case listeners are removed while iterating.
			const array = listenerArray.slice(0);

			for (let i = 0, l = array.length; i < l; i++) {
				array[i].call(this, event);
			}

			event.target = null;
		}
	}

}

export { EventDispatcher };