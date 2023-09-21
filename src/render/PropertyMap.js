/**
 * PropertyMap is a helper class for storing properties on objects.
 * Instead of using a Map, we store the property map directly on the object itself,
 * which provides better lookup performance.
 * This is generally used to store the gpu resources corresponding to objects.
 * @memberof t3d
 */
class PropertyMap {

	/**
     * Create a new PropertyMap.
     * @param {String} prefix - The prefix of the properties name.
     */
	constructor(prefix) {
		this._key = prefix + '$';
		this._count = 0;
	}

	/**
     * Get the properties of the object.
     * If the object does not have properties, create a new one.
     * @param {Object} object - The object to get properties.
     * @returns {Object} - The properties of the object.
     */
	get(object) {
		const key = this._key;
		let properties = object[key];
		if (properties === undefined) {
			properties = {};
			object[key] = properties;
			this._count++;
		}
		return properties;
	}

	/**
     * Delete the properties of the object.
     * @param {Object} object - The object to delete properties.
     */
	delete(object) {
		const key = this._key;
		const properties = object[key];
		if (properties) {
			this._count--;
			delete object[key];
		}
	}

	/**
     * Get the number of objects that have properties.
     * @returns {Number} - The number of objects that have properties.
     */
	size() {
		return this._count;
	}

}

export { PropertyMap };