class WebGLProperties {

	constructor() {
		this._map = new WeakMap();
	}

	get(object) {
		let properties = this._map.get(object);
		if (properties === undefined) {
			properties = {};
			this._map.set(object, properties);
		}
		return properties;
	}

	delete(object) {
		this._map.delete(object);
	}

	clear() {
		this._map = new WeakMap();
	}

}

export { WebGLProperties };