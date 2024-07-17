import { Box3, Sphere, Spherical, Vector3 } from 't3d';

// TODO: implement LightShadowAdapter
// TODO: more precise shadow projection
// TODO: LightShadowAdapterHelper
export class LightShadowAdapter {

	constructor(light) {
		this.light = light;

		this.direction = new LightDirection();

		this.bindBox = new Box3();

		this.bindCamera = null;
		this.bindCameraDistance = 500;

		this.shadowNearFunction = null;
		this.shadowFarFunction = null;

		this.matrix = null;

		// some stats for debugging
		this.stats = {
			sphere: new Sphere()
		};
	}

	update() {
		const { bindBox, bindCamera, matrix, stats } = this;
		const { sphere } = stats;

		const hasBindBox = !bindBox.isEmpty();
		const hasBindCamera = !!bindCamera;

		if (hasBindBox && hasBindCamera) {
			// TODO: implement update method
		} else if (hasBindBox) {
			bindBox.getCenter(sphere.center);
			sphere.radius = sphere.center.distanceTo(bindBox.max);
		} else if (hasBindCamera) {
			// TODO: implement update method
		} else { // default
			sphere.center.set(0, 0, 0);
			sphere.radius = 1;
		}

		matrix && sphere.applyMatrix4(matrix);

		this._updateLightBySphere();
	}

	_updateLightBySphere() {
		const { light, direction, shadowNearFunction, shadowFarFunction, stats } = this;
		const { sphere } = stats;

		const baseSize = sphere.radius * 2;
		const baseDistance = sphere.radius * 2;

		const shadowNear = shadowNearFunction ? shadowNearFunction(baseDistance) : baseDistance / 250;
		const shadowFar = shadowFarFunction ? shadowFarFunction(baseDistance) : baseDistance;

		light.position.copy(direction)
			.multiplyScalar(sphere.radius + shadowNear)
			.add(sphere.center);

		light.lookAt(sphere.center, _defaultUp);

		light.shadow.windowSize = baseSize;
		light.shadow.cameraNear = shadowNear;
		light.shadow.cameraFar = shadowNear + shadowFar;
	}

}

const _spherical = new Spherical();
const _defaultUp = new Vector3(0, 1, 0);

class LightDirection extends Vector3 {

	setFromSphericalAngles(phi, theta) {
		_spherical.phi = phi;
		_spherical.theta = theta;
		_spherical.radius = 1; // normalize

		this.setFromSpherical(_spherical);
	}

}