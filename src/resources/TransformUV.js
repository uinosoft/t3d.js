import { Matrix3 } from '../math/Matrix3.js';
import { Vector2 } from '../math/Vector2.js';

/**
 * A transform object for UV coordinates.
 * @extends Matrix3
 */
class TransformUV extends Matrix3 {

	/**
	 * Create a new TransformUV object.
	 */
	constructor() {
		super();

		this.offset = new Vector2(0, 0);
		this.scale = new Vector2(1, 1);
		this.center = new Vector2(0, 0);
		this.rotation = 0;

		this.needsUpdate = false;
	}

	/**
	 * Update the matrix for UV transformation based on the offset, scale, rotation and center.
	 * If needsUpdate is false, this method will do nothing.
	 * @returns {TransformUV} This object.
	 */
	update() {
		if (!this.needsUpdate) return this;

		this.needsUpdate = false;

		this.updateMatrix();

		return this;
	}

	/**
	 * Update the matrix for UV transformation based on the offset, scale, rotation and center.
	 * This method will always update the matrix regardless of the needsUpdate flag.
	 * @returns {TransformUV} This object.
	 */
	updateMatrix() {
		return this.setUvTransform(
			this.offset.x, this.offset.y,
			this.scale.x, this.scale.y,
			this.rotation,
			this.center.x, this.center.y
		);
	}

	/**
	 * Copy the properties of another TransformUV object.
	 * @param {TransformUV|Matrix3} source - The object to copy the properties from.
	 * @returns {TransformUV} This object.
	 */
	copy(source) {
		super.copy(source);

		// in case source is only a Matrix3 object (without additional properties)
		if (!source.isTransformUV) return this;

		this.offset.copy(source.offset);
		this.scale.copy(source.scale);
		this.center.copy(source.center);
		this.rotation = source.rotation;

		this.needsUpdate = source.needsUpdate;

		return this;
	}

	/**
	 * Clone this TransformUV object.
	 * @returns {TransformUV} The cloned object.
	 */
	clone() {
		return new this.constructor().copy(this);
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
TransformUV.prototype.isTransformUV = true;

export { TransformUV };