import { Ray } from '../math/Ray.js';

/**
 * This class is designed to assist with raycasting. Raycasting is used for
 * mouse picking (working out what objects in the 3d space the mouse is over)
 * amongst other things.
 */
class Raycaster {

	/**
	 * Constructs a new raycaster.
	 * @param {Vector3} origin — The origin vector where the ray casts from.
	 * @param {Vector3} direction — The (normalized) direction vector that gives direction to the ray.
	 */
	constructor(origin, direction) {
		/**
		 * The ray used for raycasting.
		 * @type {Ray}
		 */
		this.ray = new Ray(origin, direction);
	}

	/**
	 * Updates the ray with a new origin and direction by copying the values from the arguments.
	 * @param {Vector3} origin — The origin vector where the ray casts from.
	 * @param {Vector3} direction — The (normalized) direction vector that gives direction to the ray.
	 */
	set(origin, direction) {
		// direction is assumed to be normalized (for accurate distance calculations)
		this.ray.set(origin, direction);
	}

	/**
	 * Uses the given coordinates and camera to compute a new origin and direction for the internal ray.
	 * @param {Vector2} coords — 2D coordinates of the mouse, in normalized device coordinates (NDC).
	 * X and Y components should be between `-1` and `1`.
	 * @param {Camera} camera — The camera from which the ray should originate.
	 */
	setFromCamera(coords, camera) {
		if (camera.projectionMatrix.elements[11] === -1.0) { // perspective
			this.ray.origin.setFromMatrixPosition(camera.worldMatrix);
			this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(this.ray.origin).normalize();
		} else { // orthographic
			// set origin in plane of camera
			// projectionMatrix.elements[14] = (near + far) / (near - far)
			this.ray.origin.set(coords.x, coords.y, camera.projectionMatrix.elements[14]).unproject(camera);

			this.ray.direction.set(0, 0, -1).transformDirection(camera.worldMatrix);
		}
	}

	/**
	 * Checks all intersection between the ray and the object with or without the
	 * descendants. Intersections are returned sorted by distance, closest first.
	 * An array of intersections is returned: [ { distance, point, face, faceIndex, object, uv }, ... ]
	 * @param {Object3D} object — The 3D object to check for intersection with the ray.
	 * @param {boolean} [recursive=false] — If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 * @param {object[]} [intersects=[]] - The target array that holds the result of the method.
	 * @returns {object[]} An array holding the intersection points.
	 */
	intersectObject(object, recursive = false, intersects = []) {
		intersect(object, this, intersects, recursive);

		intersects.sort(ascSort);

		return intersects;
	}

	/**
	 * Checks all intersection between the ray and the objects with or without
	 * the descendants. Intersections are returned sorted by distance, closest first.
	 * An array of intersections is returned: [ { distance, point, face, faceIndex, object, uv }, ... ]
	 * @param {Object3D[]} objects — The 3D objects to check for intersection with the ray.
	 * @param {boolean} [recursive=false] — If set to `true`, it also checks all descendants.
	 * Otherwise it only checks intersection with the object.
	 * @param {object[]} [intersects=[]] - The target array that holds the result of the method.
	 * @returns {object[]} An array holding the intersection points.
	 */
	intersectObjects(objects, recursive = false, intersects = []) {
		for (let i = 0, l = objects.length; i < l; i++) {
			intersect(objects[i], this, intersects, recursive);
		}

		intersects.sort(ascSort);

		return intersects;
	}

}

function ascSort(a, b) {
	return a.distance - b.distance;
}

function intersect(object, raycaster, intersects, recursive) {
	let propagate = true;

	const result = object.raycast(raycaster.ray, intersects);

	if (result === false) propagate = false;

	if (propagate === true && recursive === true) {
		const children = object.children;

		for (let i = 0, l = children.length; i < l; i++) {
			intersect(children[i], raycaster, intersects, true);
		}
	}
}

export { Raycaster };