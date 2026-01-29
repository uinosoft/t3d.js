import { Matrix4 } from '../../math/Matrix4.js';

/**
 * Base camera projection class. All projection types should inherit from this.
 * Should not be instantiated directly; subclasses must implement matrix calculation.
 * @abstract
 */
class CameraProjection {

	/**
	 * Creates a CameraProjection instance.
	 */
	constructor() {
		this._matrix = new Matrix4();
		this._dirty = true;
	}

	/**
	 * Get the current projection matrix.
	 * @returns {Matrix4} The projection matrix.
	 */
	get matrix() {
		if (this._dirty) {
			this._updateMatrix();
		}

		return this._matrix;
	}

	/**
	 * Copy parameters from another CameraProjection. Should be implemented by subclasses.
	 * @param {CameraProjection} source The source projection object.
	 * @returns {CameraProjection} this
	 */
	copy(source) {
		console.warn('CameraProjection: copy() must be implemented in subclass.');
		return this;
	}

	/**
	 * Clone this projection object.
	 * @returns {CameraProjection} A new projection object.
	 */
	clone() {
		return new this.constructor().copy(this);
	}

	/**
	 * Update the projection matrix. Should be implemented by subclasses.
	 * @protected
	 */
	_updateMatrix() {
		console.warn('CameraProjection: _updateMatrix() must be implemented in subclass.');
		this._dirty = false;
	}

}

export { CameraProjection };