/**
 * An KeyframeClip is a reusable set of keyframe tracks which represent an animation.
 * @memberof t3d
 */
class KeyframeClip {

	/**
	 * @param {String} name - A name for this clip.
	 * @param {t3d.KeyframeTrack[]} tracks - An array of KeyframeTracks.
	 * @param {Number} [duration] - The duration of this clip (in seconds). If not passed, the duration will be calculated from the passed tracks array.
	 */
	constructor(name, tracks, duration = -1) {
		/**
		 * A name for this clip.
		 * @type {String}
		 */
		this.name = name;

		/**
		 * An array of KeyframeTracks.
		 * @type {t3d.KeyframeTrack[]}
		 */
		this.tracks = tracks;

		/**
		 * The duration of this clip (in seconds).
		 * If a negative value is passed, the duration will be calculated from the passed tracks array.
		 * @type {Number}
		 */
		this.duration = duration;

		if (this.duration < 0) {
			this.resetDuration();
		}
	}

	/**
	 * Sets the duration of the clip to the duration of its longest KeyframeTrack.
	 * @return {t3d.KeyframeClip}
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