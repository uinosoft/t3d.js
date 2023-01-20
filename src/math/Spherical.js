/**
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The poles (phi) are at the positive and negative y axis.
 * The equator starts at positive z.
 * @memberof t3d
 */
class Spherical {

	/**
	 * @param {Number} [radius=1] - the radius, or the Euclidean distance (straight-line distance) from the point to the origin. Default is 1.0.
	 * @param {Number} [phi=0] - - polar angle in radians from the y (up) axis. Default is 0.
	 * @param {Number} [theta=0] - - equator angle in radians around the y (up) axis. Default is 0.
	 */
	constructor(radius = 1, phi = 0, theta = 0) {
		this.radius = radius;
		this.phi = phi; // up / down towards top and bottom pole
		this.theta = theta; // around the equator of the sphere
	}

	/**
	 * Sets values of this spherical's radius, phi and theta properties.
	 * @param {Number} radius
	 * @param {Number} phi
	 * @param {Number} theta
	 */
	set(radius, phi, theta) {
		this.radius = radius;
		this.phi = phi;
		this.theta = theta;

		return this;
	}

	/**
	 * Copies the values of the passed Spherical's radius, phi and theta properties to this spherical.
	 * @param {t3d.Spherical} other
	 * @return {t3d.Spherical}
	 */
	copy(other) {
		this.radius = other.radius;
		this.phi = other.phi;
		this.theta = other.theta;

		return this;
	}

	/**
	 * Returns a new spherical with the same radius, phi and theta properties as this one.
	 * @return {t3d.Spherical}
	 */
	clone() {
		return new Spherical().copy(this);
	}

	/**
	 * Restrict phi to be betwee EPS and PI-EPS.
	 * @return {t3d.Spherical}
	 */
	makeSafe() {
		const EPS = 0.000001;
		this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));

		return this;
	}

	/**
	 * Sets values of this spherical's radius, phi and theta properties from the Vector3.
	 * @param {t3d.Vector3} vec3
	 * @return {t3d.Spherical}
	 */
	setFromVector3(vec3) {
		this.radius = vec3.getLength();

		if (this.radius === 0) {
			this.theta = 0;
			this.phi = 0;
		} else {
			this.theta = Math.atan2(vec3.x, vec3.z); // equator angle around y-up axis
			this.phi = Math.acos(Math.min(1, Math.max(-1, vec3.y / this.radius))); // polar angle
		}

		return this;
	}

}

export { Spherical };