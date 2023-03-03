class WebGLProperties {

	constructor(passId) {
		this._key = '__webgl$' + passId;
		this._count = 0;
	}

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

	delete(object) {
		const key = this._key;
		const properties = object[key];
		if (properties) {
			this._count--;
			delete object[key];
		}
	}

	size() {
		return this._count;
	}

}

export { WebGLProperties };