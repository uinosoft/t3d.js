/**
 * HashStates is a class that enables the storage of key/value pairs,
 * and provides a method, getHash(), to retrieve a hash of all the values.
 * Use this to store the states of program, and then get a hash as a key in program cache.
 * References: https://github.com/shawn0326/hash-states
 * @ignore
 */
class HashStates {

	constructor() {
		this._commonMap = new Map();
		this._booleanMap = new Map();
	}

	set(name, value) {
		this._commonMap.set(name, value);
		return this;
	}

	setBoolean(name, value) {
		this._booleanMap.set(name, value);
		return this;
	}

	get(name) {
		return this._commonMap.get(name);
	}

	getBoolean(name) {
		return this._booleanMap.get(name);
	}

	getHash() {
		return [
			Array.from(this._commonMap.values()).join('_'),
			getBooleanMaskHash(this._booleanMap)
		].join('_');
	}

	clear() {
		this._commonMap.clear();
		this._booleanMap.clear();
		return this;
	}

}

export { HashStates };

function getBooleanMaskHash(map) {
	const masks = [];
	let mask = 0,
		index = 0;
	map.forEach(value => {
		if (value) {
			mask |= 1 << index;
		}
		index++;
		if (index === 31) {
			masks.push(mask);
			mask = 0;
			index = 0;
		}
	});
	if (index > 0) {
		masks.push(mask);
	}
	return masks.join('_');
}