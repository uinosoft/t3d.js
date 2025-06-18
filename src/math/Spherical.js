import { MathUtils } from './MathUtils.js';

/**
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The poles (phi) are at the positive and negative y axis.
 * The equator starts at positive z.
 */
class Spherical {

	/**
	 * @param {number} [radius=1] - the radius, or the Euclidean distance (straight-line distance) from the point to the origin. Default is 1.0.
	 * @param {number} [phi=0] - - polar angle in radians from the y (up) axis. Default is 0.
	 * @param {number} [theta=0] - - equator angle in radians around the y (up) axis. Default is 0.
	 */
	constructor(radius = 1, phi = 0, theta = 0) {
		this.radius = radius;
		this.phi = phi; // up / down towards top and bottom pole
		this.theta = theta; // around the equator of the sphere
	}

	/**
	 * Sets values of this spherical's radius, phi and theta properties.
	 * @param {number} radius
	 * @param {number} phi
	 * @param {number} theta
	 * @returns {Spherical}
	 */
	set(radius, phi, theta) {
		this.radius = radius;
		this.phi = phi;
		this.theta = theta;

		return this;
	}

	/**
	 * Copies the values of the passed Spherical's radius, phi and theta properties to this spherical.
	 * @param {Spherical} other
	 * @returns {Spherical}
	 */
	copy(other) {
		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;

		return this;
	}

	/**
	 * Returns a new spherical with the same radius, phi and theta properties as this one.
	 * @returns {Spherical}
	 */
	clone() {
		return new Spherical().copy(this);
	}

	/**
	 * Restrict phi to be betwee EPS and PI-EPS.
	 * @returns {Spherical}
	 */
	makeSafe() {
		const EPS = 0.000001;
		this.phi = MathUtils.clamp(this.phi, EPS, Math.PI - EPS);

		return this;
	}

	/**
	 * Sets values of this spherical's radius, phi and theta properties from the Vector3.
	 * @param {Vector3} vec3
	 * @returns {Spherical}
	 */
	setFromVector3(vec3) {
		this.radius = vec3.getLength();

		if (this.radius === 0) {
			this.theta = 0;
			this.phi = 0;
		} else {
			this.theta = Math.atan2(vec3.x, vec3.z); // equator angle around y-up axis
			this.phi = Math.acos(MathUtils.clamp(vec3.y / this.radius, -1, 1)); // polar angle
		}

		return this;
	}

}

/**
 * This flag can be used for type testing.
 * @readonly
 * @type {boolean}
 * @default true
 */
Spherical.prototype.isSpherical = true;

export { Spherical };