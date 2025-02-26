/**
 * An KeyframeClip is a reusable set of keyframe tracks which represent an animation.
 */
class KeyframeClip {

	/**
	 * @param {string} [name=''] - A name for this clip.
	 * @param {KeyframeTrack[]} [tracks=[]] - An array of KeyframeTracks.
	 * @param {number} [duration] - The duration of this clip (in seconds). If not passed, the duration will be calculated from the passed tracks array.
	 */
	constructor(name = '', tracks = [], duration = -1) {
		/**
		 * A name for this clip.
		 * @type {string}
		 */
		this.name = name;

		/**
		 * An array of KeyframeTracks.
		 * @type {KeyframeTrack[]}
		 */
		this.tracks = tracks;

		/**
		 * The duration of this clip (in seconds).
		 * If a negative value is passed, the duration will be calculated from the passed tracks array.
		 * @type {number}
		 */
		this.duration = duration;

		if (this.duration < 0) {
			this.resetDuration();
		}
	}

	/**
	 * Sets the duration of the clip to the duration of its longest KeyframeTrack.
	 * @returns {KeyframeClip}
	 */
	resetDuration() {
		const tracks = this.tracks;
		let duration = 0;

		for (let i = 0, l = tracks.length; i < l; i++) {
			const track = tracks[i];
			duration = Math.max(duration, track.times[track.times.length - 1]);
		}

		this.duration = duration;

		return this;
	}

}

export { KeyframeClip };