import { BLEND_TYPE } from '../const.js';
import { EventDispatcher } from '../EventDispatcher.js';

/**
 * AnimationAction wraps AnimationClip and is mainly responsible for the update logic of time.
 * You can extend other functions by inheriting this class, such as repeat playback, pingpang, etc.
 * And since this class inherits from EventDispatcher, animation events can also be extended.
 * @memberof t3d
 * @extends t3d.EventDispatcher
 */
class AnimationAction extends EventDispatcher {

	/**
	 * @param {t3d.KeyframeClip} clip - The keyframe clip for this action.
	 */
	constructor(clip) {
		super();

		/**
         * The keyframe clip for this action.
		 * @type {t3d.KeyframeClip}
         */
		this.clip = clip;

		/**
         * The degree of influence of this action (in the interval [0, 1]).
         * Values can be used to blend between several actions.
		 * @type {Number}
         * @default 0
         */
		this.weight = 0;

		/**
         * The local time of this action (in seconds).
		 * @type {Number}
         */
		this.time = 0;

		/**
         * The blend mode for this action, currently only two values BLEND_TYPE.NORMAL and BLEND_TYPE.ADD are available.
		 * @type {t3d.BLEND_TYPE}
		 * @default {t3d.BLEND_TYPE.NORMAL}
         */
		this.blendMode = BLEND_TYPE.NORMAL;
	}

	/**
     * Update time.
     * @param {Number} deltaTime - The delta time in seconds.
     */
	update(deltaTime) {
		this.time += deltaTime;

		const endTime = this.clip.duration;

		if (endTime === 0) {
			this.time = 0;
			return;
		}

		if (this.time > endTime) {
			this.time = this.time % endTime;
		}

		if (this.time < 0) {
			this.time = this.time % endTime + endTime;
		}
	}

}

export { AnimationAction };