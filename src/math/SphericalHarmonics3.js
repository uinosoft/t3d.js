import { Vector3 } from './Vector3.js';

/**
 * Primary reference: https://graphics.stanford.edu/papers/envmap/envmap.pdf
 * Secondary reference: https://www.ppsloan.org/publications/StupidSH36.pdf
 * 3-band SH defined by 9 coefficients.
 * @memberof t3d
 */
class SphericalHarmonics3 {

	/**
	 * Creates a new instance of SphericalHarmonics3.
	 */
	constructor() {
		/**
		 * An array holding the (9) SH coefficients.
		 * A single coefficient is represented as an instance of Vector3.
		 * @type {Array}
		 */
		this.coefficients = [];

		for (let i = 0; i < 9; i++) {
			this.coefficients.push(new Vector3());
		}
	}

	/**
	 * Set this sphericalHarmonics3 value.
	 * @param {t3d.Vector3[]} coefficients An array of SH coefficients.
	 * @return {t3d.SphericalHarmonics3}
	 */
	set(coefficients) {
		for (let i = 0; i < 9; i++) {
			this.coefficients[i].copy(coefficients[i]);
		}
		return this;
	}

	/**
	 * Sets all SH coefficients to 0.
	 * @return {t3d.SphericalHarmonics3}
	 */
	zero() {
		for (let i = 0; i < 9; i++) {
			this.coefficients[i].set(0, 0, 0);
		}
		return this;
	}

	/**
	 * Returns the radiance in the direction of the given normal.
	 * @param {t3d.Vector3} normal - The normal vector (assumed to be unit length).
	 * @param {t3d.Vector3} target - The result vector.
	 * @return {t3d.Vector3}
	 */
	getAt(normal, target) {
		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		const coeff = this.coefficients;

		// band 0
		target.copy(coeff[0]).multiplyScalar(0.282095);

		// band 1
		target.addScaledVector(coeff[1], 0.488603 * y);
		target.addScaledVector(coeff[2], 0.488603 * z);
		target.addScaledVector(coeff[3], 0.488603 * x);

		// band 2
		target.addScaledVector(coeff[4], 1.092548 * (x * y));
		target.addScaledVector(coeff[5], 1.092548 * (y * z));
		target.addScaledVector(coeff[6], 0.315392 * (3.0 * z * z - 1.0));
		target.addScaledVector(coeff[7], 1.092548 * (x * z));
		target.addScaledVector(coeff[8], 0.546274 * (x * x - y * y));

		return target;
	}

	/**
	 * Reference: https://graphics.stanford.edu/papers/envmap/envmap.pdf
	 * Returns the irradiance (radiance convolved with cosine lobe) in the direction of the given normal.
	 * @param {t3d.Vector3} normal - The normal vector (assumed to be unit length).
	 * @param {t3d.Vector3} target - The result vector.
	 * @return {t3d.Vector3}
	 */
	getIrradianceAt(normal, target) {
		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		const coeff = this.coefficients;

		// band 0
		target.copy(coeff[0]).multiplyScalar(0.886227); // π * 0.282095

		// band 1
		target.addScaledVector(coeff[1], 2.0 * 0.511664 * y); // ( 2 * π / 3 ) * 0.488603
		target.addScaledVector(coeff[2], 2.0 * 0.511664 * z);
		target.addScaledVector(coeff[3], 2.0 * 0.511664 * x);

		// band 2
		target.addScaledVector(coeff[4], 2.0 * 0.429043 * x * y); // ( π / 4 ) * 1.092548
		target.addScaledVector(coeff[5], 2.0 * 0.429043 * y * z);
		target.addScaledVector(coeff[6], 0.743125 * z * z - 0.247708); // ( π / 4 ) * 0.315392 * 3
		target.addScaledVector(coeff[7], 2.0 * 0.429043 * x * z);
		target.addScaledVector(coeff[8], 0.429043 * (x * x - y * y)); // ( π / 4 ) * 0.546274

		return target;
	}

	/**
	 * Adds the given SH to this instance.
	 * @param {t3d.SphericalHarmonics3} sh - The SH to add.
	 * @return {t3d.SphericalHarmonics3}
	 */
	add(sh) {
		for (let i = 0; i < 9; i++) {
			this.coefficients[i].add(sh.coefficients[i]);
		}
		return this;
	}

	/**
	 * A convenience method for performing .add() and .scale() at once.
	 * @param {t3d.SphericalHarmonics3} sh - The SH to add.
	 * @param {t3d.Vector3} s - The scale factor.
	 * @return {t3d.SphericalHarmonics3}
	 */
	addScaledSH(sh, s) {
		for (let i = 0; i < 9; i++) {
			this.coefficients[i].addScaledVector(sh.coefficients[i], s);
		}
		return this;
	}

	/**
	 * Multiply the s to this SphericalHarmonics3.
	 * @param {Number} s - The scale factor.
	 * @return {t3d.SphericalHarmonics3}
	 */
	scale(s) {
		for (let i = 0; i < 9; i++) {
			this.coefficients[i].multiplyScalar(s);
		}
		return this;
	}

	/**
	 * Linear interpolates between the given SH and this instance by the given alpha factor.
	 * Sets this coefficients vector to be the vector linearly interpolated between v1 and v2
	 * where alpha is the percent distance along the line connecting the two vectors
	 * - alpha = 0 will be v1, and alpha = 1 will be v2.
	 * @param {t3d.SphericalHarmonics3} sh - The SH to interpolate with.
	 * @param {Number} alpha - The alpha factor.
	 * @return {t3d.SphericalHarmonics3}
	 */
	lerp(sh, alpha) {
		for (let i = 0; i < 9; i++) {
			this.coefficients[i].lerpVectors(this.coefficients[i], sh.coefficients[i], alpha);
		}
		return this;
	}

	/**
	 * Returns true if the given SH and this instance have equal coefficients.
	 * @param {t3d.SphericalHarmonics3} sh - The SH to compare with.
	 * @return {Boolean}
	 */
	equals(sh) {
		for (let i = 0; i < 9; i++) {
			if (!this.coefficients[i].equals(sh.coefficients[i])) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Copies the given SH to this instance.
	 * @param {t3d.SphericalHarmonics3} sh - The SH to compare with.
	 * @return {t3d.SphericalHarmonics3}
	 */
	copy(sh) {
		return this.set(sh.coefficients);
	}

	/**
	 * Returns a new instance of SphericalHarmonics3 with equal coefficients.
	 * @return {t3d.SphericalHarmonics3}
	 */
	clone() {
		return new this.constructor().copy(this);
	}

	/**
	 * Sets the coefficients of this instance from the given array.
	 * @param {Number[]} array - The array holding the numbers of the SH coefficients.
	 * @param {Number} [offset=0] - The array offset.
	 * @return {t3d.SphericalHarmonics3}
	 */
	fromArray(array, offset = 0) {
		const coefficients = this.coefficients;

		for (let i = 0; i < 9; i++) {
			coefficients[i].fromArray(array, offset + (i * 3));
		}

		return this;
	}

	/**
	 * Returns an array with the coefficients, or copies them into the provided array.
	 * The coefficients are represented as numbers.
	 * @param {Number[]} [array] - The target array.
	 * @param {Number} [offset=0] - The array offset.
	 * @return {Number[]}
	 */
	toArray(array = [], offset = 0) {
		const coefficients = this.coefficients;

		for (let i = 0; i < 9; i++) {
			coefficients[i].toArray(array, offset + (i * 3));
		}

		return array;
	}

	/**
	 * Computes the SH basis for the given normal vector.
	 * @param {t3d.Vector3} normal - The normal vector (assumed to be unit length).
	 * @param {Number[]} array - The resulting SH basis.
	 */
	static getBasisAt(normal, shBasis) {
		// normal is assumed to be unit length

		const x = normal.x, y = normal.y, z = normal.z;

		// band 0
		shBasis[0] = 0.282095;

		// band 1
		shBasis[1] = 0.488603 * y;
		shBasis[2] = 0.488603 * z;
		shBasis[3] = 0.488603 * x;

		// band 2
		shBasis[4] = 1.092548 * x * y;
		shBasis[5] = 1.092548 * y * z;
		shBasis[6] = 0.315392 * (3 * z * z - 1);
		shBasis[7] = 1.092548 * x * z;
		shBasis[8] = 0.546274 * (x * x - y * y);
	}

}

export { SphericalHarmonics3 };
