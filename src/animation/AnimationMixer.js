import { PropertyBindingMixer } from './PropertyBindingMixer.js';
import { BLEND_TYPE } from '../const.js';

/**
 * The AnimationMixer is a player for animations on a particular object in the scene.
 * When multiple objects in the scene are animated independently, one AnimationMixer may be used for each object.
 * @memberof t3d
 */
class AnimationMixer {

	constructor() {
		this._actions = [];
		this._bindings = {};
	}

	/**
	 * Add an action to this mixer.
	 * @param {t3d.AnimationAction} action - The action to add.
	 */
	addAction(action) {
		if (this._actions.indexOf(action) !== -1) {
			console.warn('AnimationMixer.addAction(): already has the action, clip name is <' + action.clip.name + '>.');
			return;
		}

		this._actions.push(action);

		const tracks = action.clip.tracks;

		for (let i = 0; i < tracks.length; i++) {
			const track = tracks[i];
			const trackName = track.name;

			if (!this._bindings[trackName]) {
				const binding = new PropertyBindingMixer(track.target, track.propertyPath, track.valueTypeName, track.valueSize);
				this._bindings[trackName] = { binding, referenceCount: 0, active: false, cachedActive: false };
			}

			this._bindings[trackName].referenceCount++;
		}
	}

	/**
	 * Remove an action from this mixer.
	 * @param {t3d.AnimationAction} action - The action to be removed.
	 */
	removeAction(action) {
		const index = this._actions.indexOf(action);

		if (index === -1) {
			console.warn('AnimationMixer.removeAction(): action not found in this mixer, clip name is <' + action.clip.name + '>.');
			return;
		}

		if (action.weight > 0) {
			console.warn('AnimationMixer.removeAction(): make sure action\'s weight is zero before removing it.');
			return;
		}

		this._actions.splice(index, 1);

		const tracks = action.clip.tracks;

		for (let i = 0; i < tracks.length; i++) {
			const trackName = tracks[i].name;
			const bindingInfo = this._bindings[trackName];

			if (bindingInfo) {
				if (--bindingInfo.referenceCount <= 0) {
					if (bindingInfo.cachedActive) {
						bindingInfo.binding.restoreOriginalState();
					}
					delete this._bindings[trackName];
				}
			}
		}
	}

	/**
	 * Whether has this action.
	 * @param {t3d.AnimationAction} action - The action.
	 * @return {Boolean}
	 */
	hasAction(action) {
		return this._actions.indexOf(action) > -1;
	}

	/**
	 * Get all actions.
	 * @return {t3d.AnimationAction[]}
	 */
	getActions() {
		return this._actions;
	}

	/**
	 * Advances the global mixer time and updates the animation.
	 * @param {Number} deltaTime - The delta time in seconds.
	 */
	update(deltaTime) {
		// Mark active to false for all bindings.

		for (const bindingName in this._bindings) {
			this._bindings[bindingName].active = false;
		}

		// Update the time of actions with a weight greater than 1
		// And accumulate those bindings

		for (let i = 0, l = this._actions.length; i < l; i++) {
			const action = this._actions[i];
			if (action.weight > 0) {
				action.update(deltaTime);

				const tracks = action.clip.tracks;

				for (let j = 0, tl = tracks.length; j < tl; j++) {
					const track = tracks[j];
					const bindingInfo = this._bindings[track.name];
					const binding = bindingInfo.binding;

					bindingInfo.active = true;

					if (!bindingInfo.cachedActive) {
						bindingInfo.binding.saveOriginalState();
						bindingInfo.cachedActive = true;
					}

					track.getValue(action.time, binding.buffer);

					if (action.blendMode === BLEND_TYPE.ADD) {
						binding.accumulateAdditive(action.weight);
					} else {
						binding.accumulate(action.weight);
					}
				}
			}
		}

		// Apply all bindings.

		for (const bindingName in this._bindings) {
			const bindingInfo = this._bindings[bindingName];
			if (bindingInfo.active) {
				bindingInfo.binding.apply();
			} else {
				if (bindingInfo.cachedActive) {
					bindingInfo.binding.restoreOriginalState();
					bindingInfo.cachedActive = false;
				}
			}
		}
	}

}

export { AnimationMixer };