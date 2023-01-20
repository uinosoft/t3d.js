import { Ray } from 't3d';

class Raycaster {

	/**
	 * This creates a new raycaster object.
	 * @param {t3d.Vector3} origin — The origin vector where the ray casts from.
	 * @param {t3d.Vector3} direction — The direction vector that gives direction to the ray. Should be normalized.
	 */
	constructor(origin, direction) {
		/**
		 * The Ray used for the raycasting.
		 * @type {t3d.Ray}
		 */
		this.ray = new Ray(origin, direction);
	}

	/**
     * Updates the ray with a new origin and direction.
     * @param {t3d.Vector3} origin — The origin vector where the ray casts from.
     * @param {t3d.Vector3} direction — The normalized direction vector that gives direction to the ray.
     */
	set(origin, direction) {
		this.ray.set(origin, direction);
	}

	/**
     * Updates the ray with a new origin and direction.
     * @param {t3d.Vector2} coords — 2D coordinates of the mouse, in normalized device coordinates (NDC)---X and Y components should be between -1 and 1.
     * @param {t3d.Camera} camera — camera from which the ray should originate.
	 * @param {String} type - camera type: 'perspective' or 'orthographic'
     */
	setFromCamera(coords, camera, type) {
		type = type || 'perspective';
		if (type == 'orthographic') {
			// set origin in plane of camera
			// projectionMatrix.elements[14] = (near + far) / (near - far)
			this.ray.origin.set(coords.x, coords.y, camera.projectionMatrix.elements[14]).unproject(camera);
			this.ray.direction.set(0, 0, -1).transformDirection(camera.worldMatrix);
		} else {
			this.ray.origin.setFromMatrixPosition(camera.worldMatrix);
			this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(this.ray.origin).normalize();
		}
	}

	/**
     * Checks all intersection between the ray and the object with or without the descendants. Intersections are returned sorted by distance, closest first. An array of intersections is returned:
     * [ { distance, point, face, faceIndex, object }, ... ]
     * @param {t3d.Object3D} object — The object to check for intersection with the ray.
     * @param {Boolean} [recursive=] — If true, it also checks all descendants. Otherwise it only checks intersecton with the object.
     * @return {Object[]} An array of intersections
     */
	intersectObject(object, recursive) {
		const intersects = [];

		intersectObject(object, this, intersects, recursive);

		intersects.sort(ascSort);

		return intersects;
	}

	/**
     * Checks all intersection between the ray and the objects with or without the descendants. Intersections are returned sorted by distance, closest first. An array of intersections is returned:
     * [ { distance, point, face, faceIndex, object }, ... ]
     * @param {t3d.Object3D[]} objects — The objects to check for intersection with the ray.
     * @param {Boolean} [recursive=] — If true, it also checks all descendants. Otherwise it only checks intersecton with the object.
     * @return {Object[]} An array of intersections
     */
	intersectObjects(objects, recursive) {
		const intersects = [];

		if (Array.isArray(objects) === false) {
			console.warn('Raycaster.intersectObjects: objects is not an Array.');
			return intersects;
		}

		for (let i = 0, l = objects.length; i < l; i++) {
			intersectObject(objects[i], this, intersects, recursive);
		}

		intersects.sort(ascSort);

		return intersects;
	}

}

function ascSort(a, b) {
	return a.distance - b.distance;
}

function intersectObject(object, raycaster, intersects, recursive) {
	object.raycast(raycaster.ray, intersects);

	if (recursive === true) {
		const children = object.children;

		for (let i = 0, l = children.length; i < l; i++) {
			intersectObject(children[i], raycaster, intersects, true);
		}
	}
}

export { Raycaster };