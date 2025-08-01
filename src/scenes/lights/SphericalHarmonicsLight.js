import { Light } from '../Light.js';
import { SphericalHarmonics3 } from '../../math/SphericalHarmonics3.js';

/**
 * This light globally all objects in the scene equally.
 * This light depends on spherical harmonics.
 * @extends Light
 */
class SphericalHarmonicsLight extends Light {

	/**
	 * Creates a new SphericalHarmonicsLight.
	 * @param {SphericalHarmonics3} [sh = new SphericalHarmonics3()]
	 * @param {number} [intensity = 1]
	 */
	constructor(sh = new SphericalHarmonics3(), intensity = 1) {
		super(undefined, intensity);

		/**
		 * An instance of SphericalHarmonics3.
		 * @type {SphericalHarmonics3}
		 */
		this.sh = sh;
	}

	copy(source) {
		super.copy(source);

		this.sh.copy(source.sh);

		return this;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
SphericalHarmonicsLight.prototype.isSphericalHarmonicsLight = true;

export { SphericalHarmonicsLight };
