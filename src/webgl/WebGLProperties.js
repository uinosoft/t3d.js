class WebGLProperties {

	constructor() {
		this._count = 0;
	}

	get(object) {
		let properties = object.__webgl;
		if (properties === undefined) {
			properties = {};
			object.__webgl = properties;
			this._count++;
		}
		return properties;
	}

	delete(object) {
		const properties = object.__webgl;
		if (properties) {
			this._count--;
			delete object.__webgl;
		}
	}

	size() {
		return this._count;
	}

}

export { WebGLProperties };