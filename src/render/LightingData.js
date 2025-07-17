import { LightingGroup } from './LightingGroup.js';

class LightingData {

	constructor() {
		this.lightsArray = [];
		this.shadowsNum = 0;

		this.groupList = [];
		this.groupList.push(new LightingGroup()); // create default group 0

		this._locked = true;
	}

	getGroup(id) {
		return this.groupList[id];
	}

	setMaxGroupCount(max) {
		max = Math.max(1, max); // at least one group

		const groupList = this.groupList;
		const oldMax = groupList.length;

		if (max < oldMax) {
			for (let i = max; i < oldMax; i++) {
				groupList[i].dispose();
			}
			groupList.length = max;
		} else if (max > oldMax) {
			for (let i = oldMax; i < max; i++) {
				groupList.push(new LightingGroup());
			}
		}
	}

	begin() {
		if (!this._locked) {
			console.warn('LightingData: begin() called without end().');
		}

		this.lightsArray.length = 0;
		this.shadowsNum = 0;

		this._locked = false;
	}

	collect(light) {
		if (this._locked) return;

		this.lightsArray.push(light);

		if (castShadow(light)) {
			this.shadowsNum++;
		}
	}

	end(sceneData) {
		const lightsArray = this.lightsArray;
		const shadowsNum = this.shadowsNum;
		const groupList = this.groupList;

		lightsArray.sort(shadowCastingLightsFirst);

		let i, l;

		for (i = 0, l = groupList.length; i < l; i++) {
			groupList[i].begin();
		}

		for (i = 0, l = lightsArray.length; i < l; i++) {
			this._distribute(lightsArray[i], i < shadowsNum);
		}

		for (i = 0, l = groupList.length; i < l; i++) {
			groupList[i].end(sceneData);
		}

		this._locked = true;
	}

	_distribute(light, shadow) {
		const groupMask = light.groupMask;
		const groupList = this.groupList;

		// optimize for single group
		if (groupList.length === 1 && (groupMask & 1)) {
			groupList[0].push(light, shadow);
			return;
		}

		for (let i = 0, l = groupList.length; i < l; i++) {
			const mask = 1 << i;

			if (groupMask < mask) break;

			if (groupMask & mask) {
				groupList[i].push(light, shadow);
			}
		}
	}

}

function shadowCastingLightsFirst(lightA, lightB) {
	const a = castShadow(lightA) ? 1 : 0;
	const b = castShadow(lightB) ? 1 : 0;
	return b - a;
}

function castShadow(light) {
	return light.shadow && light.castShadow;
}

export { LightingData };