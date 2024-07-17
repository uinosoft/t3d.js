import { Box3, Frustum, Matrix3, Matrix4, Plane, Spherical, Vector3, Vector2 } from 't3d';

/**
 * LightShadowAdapter is a tool to help you calculate the shadow range of the light source.
 * It can automatically calculate the shadow range based on the bounding box of the object and the camera,
 * and update the light source and shadow range in real time.
 */
export class LightShadowAdapter {

	/**
	 * Create a LightShadowAdapter instance.
	 * @param {DirectionalLight} light - The light source to be adapted.
	 */
	constructor(light) {
		this.light = light;

		// The direction of the light source, which is used to calculate the position of the light source.
		this.direction = new LightDirection();
		// Whether to automatically correct the up direction of the light source to keep the y+ direction of the shadow map always facing the camera far away.
		// This is only valid when the bindCamera is not empty.
		this.autoCorrectUp = true;
		// If autoCorrectUp is false, you can set the up direction of the light source manually,
		// which is used to calculate the orientation of the light source.
		this.up = new Vector3(0, 1, 0);

		// The bounding box of the object to be adapted.
		this.bindBox = new Box3();
		// The rotation matrix of the bounding box
		this.bindBoxRotation = new Matrix3();

		// The camera to be adapted.
		this.bindCamera = null;
		// The distance from the camera to the shadow range.
		// When bindBox is not empty, the distance starts from the nearest point of the bounding box to the camera near plane.
		this.bindCameraDistance = 500;

		// In most cases, the shadow range should just wrap the object, so the default shadow range calculation function is like this.
		// But in some specific scenarios, we want the shadow range to be larger,
		// such as wanting objects outside the camera to cast shadows,
		// then you need to customize the shadow range calculation function
		this.shadowSizeFunction = function(size) { return size * 1.05 };
		this.shadowDepthFunction = function(depth, size) { return Math.max(depth * 1.1, size * 0.8) };
		this.shadowNearFunction = function(depth) { return depth * 0.1 };

		// The center offset factor of the shadow range to thinShadowBox.
		// If set to (0, 0), the shadow box center will be the same as the thinShadowBox center.
		this.shadowOffsetFactor = new Vector2(0.5, 0.25);

		this._polygonPool = new PolygonPool();

		// Some stats for debugging
		this.stats = {
			type: 0, // 1: box3 + camera, 2: box3, 3: camera, 4: null
			bindBoxRotated: false,
			lightUp: new Vector3(),
			shadowBox: new Box3(),
			thinShadowBox: new Box3().copy(UNIT_BOX3),
			shadowBoxRotation: new Matrix3(),
			shadowBoxRotationInverse: new Matrix3(),
			boundaryPoints: [], // when type is 2 or 3
			polygons: new Polygons(this._polygonPool) // when type is 1
		};

		// fill boundaryPoints with Vector3
		for (let i = 0; i < 8; i++) {
			this.stats.boundaryPoints.push(new Vector3());
		}
	}

	update() {
		this._setUpdateType();

		this._setShadowBoxRotation();

		const { type, thinShadowBox } = this.stats;

		if (type === SHADOW_UPDATE_TYPE.BOX3_CAMERA) {
			this._setShadowBoxByBox3Camera();
		} else if (type === SHADOW_UPDATE_TYPE.BOX3) {
			this._setShadowBoxByBox3();
		} else if (type === SHADOW_UPDATE_TYPE.CAMERA) {
			this._setShadowBoxByCamera();
		} else {
			thinShadowBox.copy(UNIT_BOX3);
		}

		this._updateLight();
	}

	_setUpdateType() {
		const { bindBox, bindBoxRotation, bindCamera, stats } = this;

		const hasBindBox = !bindBox.isEmpty();
		const bindBoxRotated = !bindBoxRotation.isIdentity();
		const hasBindCamera = !!bindCamera;

		if (hasBindBox && hasBindCamera) {
			stats.type = SHADOW_UPDATE_TYPE.BOX3_CAMERA;
		} else if (hasBindBox) {
			stats.type = SHADOW_UPDATE_TYPE.BOX3;
		} else if (hasBindCamera) {
			stats.type = SHADOW_UPDATE_TYPE.CAMERA;
		} else {
			stats.type = SHADOW_UPDATE_TYPE.NULL;
		}

		stats.bindBoxRotated = bindBoxRotated;
	}

	_setShadowBoxRotation() {
		const { direction, autoCorrectUp, up, bindCamera, stats } = this;
		const { lightUp, shadowBoxRotation, shadowBoxRotationInverse } = stats;

		if (autoCorrectUp && !!bindCamera) {
			_vec3_1.setFromMatrixColumn(bindCamera.worldMatrix, 0).normalize();
			_vec3_2.copy(direction).normalize();
			lightUp.crossVectors(_vec3_2, _vec3_1);
		} else {
			lightUp.copy(up);
		}
		lightUp.normalize();

		_vec3_1.copy(direction).normalize().negate().toArray(shadowBoxRotation.elements, 6); // axis-z
		_vec3_2.crossVectors(lightUp, _vec3_1).normalize().toArray(shadowBoxRotation.elements, 0); // axis-x
		_vec3_1.cross(_vec3_2).toArray(shadowBoxRotation.elements, 3); // axis-y
		shadowBoxRotationInverse.copy(shadowBoxRotation).inverse();
	}

	_setShadowBoxByBox3Camera() {
		const { bindBox, bindBoxRotation, bindCamera, bindCameraDistance, stats, _polygonPool } = this;
		const { bindBoxRotated, thinShadowBox, shadowBoxRotationInverse, polygons } = stats;

		let frustumInBoxSpace = bindCamera.frustum;
		if (bindBoxRotated) {
			_mat4_1.setFromMatrix3(bindBoxRotation).premultiply(bindCamera.projectionViewMatrix);
			frustumInBoxSpace = _frustum_1.setFromMatrix(_mat4_1);
		}

		if (frustumInBoxSpace.intersectsBox(bindBox)) {
			// Reset polygons
			_polygonPool.reset();
			polygons.clear();

			// Set the polygons by box3
			polygons.setFromBox3(bindBox, bindBoxRotated ? bindBoxRotation : undefined);

			// Clip the polygons using the frustum (not including the near and far planes)
			const frustumPlanes = bindCamera.frustum.planes;
			for (let i = 0, l = frustumPlanes.length - 2; i < l; i++) {
				const plane = frustumPlanes[i];
				polygons.clipByPlane(plane);
			}

			// Convert the intersection point to view space and find the closest intersection point to the camera
			let minZ = -Infinity;
			polygons.polygons.forEach(polygon => {
				for (let i = 0, l = polygon.verticesIndex; i < l; i++) {
					_vec3_1.copy(polygon.vertices[i]).applyMatrix4(bindCamera.viewMatrix);
					minZ = Math.max(minZ, _vec3_1.z);
				}
			});

			// Based on the nearest intersection point of the near plane,
			// push back the length of distance, determine the position of the far plane,
			// and convert the far plane to the world coordinate system.
			const { near } = extractCameraNearFar(bindCamera);
			_plane_1.constant = Math.max(Math.abs(minZ), near) + bindCameraDistance;
			_plane_1.normal.set(0, 0, 1);
			_plane_1.applyMatrix4(bindCamera.worldMatrix);

			// Using the far plane determined in the previous step, cut the curPolygons.
			polygons.clipByPlane(_plane_1);

			// Calculate shadow box by polygon vertices
			thinShadowBox.makeEmpty();
			polygons.polygons.forEach(polygon => {
				for (let i = 0, l = polygon.verticesIndex; i < l; i++) {
					_vec3_1.copy(polygon.vertices[i]).applyMatrix3(shadowBoxRotationInverse);
					thinShadowBox.expandByPoint(_vec3_1);
				}
			});
		}
	}

	_setShadowBoxByBox3() {
		const { bindBox, bindBoxRotation, stats } = this;
		const { bindBoxRotated, thinShadowBox, shadowBoxRotationInverse, boundaryPoints } = stats;

		thinShadowBox.makeEmpty();
		getBox3Points(bindBox, bindBoxRotated ? bindBoxRotation : undefined, boundaryPoints).forEach(point => {
			_vec3_1.copy(point).applyMatrix3(shadowBoxRotationInverse);
			thinShadowBox.expandByPoint(_vec3_1);
		});
	}

	_setShadowBoxByCamera() {
		const { bindCamera, bindCameraDistance, stats } = this;
		const { thinShadowBox, shadowBoxRotationInverse, boundaryPoints } = stats;

		const { near, far } = extractCameraNearFar(bindCamera);

		// Get the vertices of the frustum in view space, considering the bindCameraDistance
		getClipedViewVertices(bindCamera, near, Math.min(near + bindCameraDistance, far), boundaryPoints);

		// Convert vertices to world space
		boundaryPoints.forEach(point => point.applyMatrix4(bindCamera.worldMatrix));

		thinShadowBox.makeEmpty();
		boundaryPoints.forEach(point => {
			_vec3_1.copy(point).applyMatrix3(shadowBoxRotationInverse);
			thinShadowBox.expandByPoint(_vec3_1);
		});
	}

	_updateLight() {
		const { light, direction, shadowSizeFunction, shadowDepthFunction, shadowNearFunction, shadowOffsetFactor, stats } = this;
		const { lightUp, shadowBox, thinShadowBox, shadowBoxRotation } = stats;

		const boxCenter = thinShadowBox.getCenter(_vec3_1);
		const boxSize = thinShadowBox.getSize(_vec3_2);

		const shadowSize = shadowSizeFunction(Math.max(boxSize.x, boxSize.y));
		const shadowDepth = shadowDepthFunction(boxSize.z, shadowSize);
		const shadowNear = shadowNearFunction(shadowDepth);

		const { min, max } = shadowBox;

		min.x = boxCenter.x - shadowSize * 0.5;
		max.x = boxCenter.x + shadowSize * 0.5;
		min.y = boxCenter.y - shadowSize * 0.5;
		max.y = boxCenter.y + shadowSize * 0.5;
		min.z = boxCenter.z - shadowDepth * 0.5;
		max.z = boxCenter.z + shadowDepth * 0.5;

		if (shadowOffsetFactor.x > 0) {
			const maxOffsetY = (shadowSize - boxSize.y) * 0.5;
			min.y += maxOffsetY * shadowOffsetFactor.x;
			max.y += maxOffsetY * shadowOffsetFactor.x;
		}

		if (shadowOffsetFactor.y > 0) {
			const maxOffsetZ = (shadowDepth - boxSize.z) * 0.5;
			min.z += maxOffsetZ * shadowOffsetFactor.y;
			max.z += maxOffsetZ * shadowOffsetFactor.y;
		}

		// light shadow range
		light.shadow.windowSize = shadowSize;
		light.shadow.cameraNear = shadowNear;
		light.shadow.cameraFar = shadowNear + shadowDepth;

		// light position
		shadowBox.getCenter(light.position);
		light.position.z = min.z - shadowNear;
		light.position.applyMatrix3(shadowBoxRotation);

		// light rotation
		const target = _vec3_1.copy(light.position).sub(direction);
		light.lookAt(target, lightUp);
	}

}

const _vec3_1 = new Vector3();
const _vec3_2 = new Vector3();
const _mat4_1 = new Matrix4();
const _frustum_1 = new Frustum();
const _plane_1 = new Plane();

const EPSILON = 1e-5;
const UNIT_BOX3 = new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5));

const SHADOW_UPDATE_TYPE = {
	BOX3_CAMERA: 1,
	BOX3: 2,
	CAMERA: 3,
	NULL: 4
};

function isPerspectiveMatrix(m) {
	return m.elements[11] === -1.0;
}

const frustumNearFar = { near: 0, far: 0 };

function extractCameraNearFar(camera) {
	const projectionMatrix = camera.projectionMatrix;
	if (isPerspectiveMatrix(projectionMatrix)) {
		frustumNearFar.near = projectionMatrix.elements[14] / (projectionMatrix.elements[10] - 1);
		frustumNearFar.far = projectionMatrix.elements[14] / (projectionMatrix.elements[10] + 1);
	} else {
		frustumNearFar.near = (projectionMatrix.elements[14] + 1) / projectionMatrix.elements[10];
		frustumNearFar.far = (projectionMatrix.elements[14] - 1) / projectionMatrix.elements[10];
	}
	return frustumNearFar;
}

function getBox3Points(box3, rotationMatrix, points) {
	const minX = box3.min.x, minY = box3.min.y, minZ = box3.min.z;
	const maxX = box3.max.x, maxY = box3.max.y, maxZ = box3.max.z;

	points[0].set(maxX, maxY, maxZ);
	points[1].set(maxX, minY, maxZ);
	points[2].set(maxX, minY, minZ);
	points[3].set(maxX, maxY, minZ);
	points[4].set(minX, maxY, maxZ);
	points[5].set(minX, minY, maxZ);
	points[6].set(minX, minY, minZ);
	points[7].set(minX, maxY, minZ);

	if (rotationMatrix) {
		for (let i = 0; i < 8; i++) {
			points[i].applyMatrix3(rotationMatrix);
		}
	}

	return points;
}

// LightDirection class

const _spherical = new Spherical();

class LightDirection extends Vector3 {

	setFromSphericalAngles(phi, theta) {
		_spherical.phi = phi;
		_spherical.theta = theta;
		_spherical.radius = 1; // normalize

		this.setFromSpherical(_spherical);
	}

}

// 3 --- 0  clipVertices.near/far order
// |     |
// 2 --- 1
// clip space spans from [-1, 1]

const clipVertices = {
	near: [
		new Vector3(1, 1, -1),
		new Vector3(1, -1, -1),
		new Vector3(-1, -1, -1),
		new Vector3(-1, 1, -1)
	],
	far: [
		new Vector3(1, 1, 1),
		new Vector3(1, -1, 1),
		new Vector3(-1, -1, 1),
		new Vector3(-1, 1, 1)
	]
};

function getClipedViewVertices(camera, clipNear, clipFar, points) {
	const projectionMatrix = camera.projectionMatrix;
	const projectionMatrixInverse = camera.projectionMatrixInverse;
	const isOrthographic = projectionMatrix.elements[2 * 4 + 3] === 0;

	clipVertices.near.forEach((v, i) => {
		const point = points[i];

		point.copy(v).applyMatrix4(projectionMatrixInverse);

		const absZ = Math.abs(point.z);
		if (isOrthographic) {
			point.z *= Math.min(clipNear / absZ, 1.0);
		} else {
			point.multiplyScalar(Math.min(clipNear / absZ, 1.0));
		}
	});

	clipVertices.far.forEach((v, i) => {
		const point = points[4 + i];

		point.copy(v).applyMatrix4(projectionMatrixInverse);

		const absZ = Math.abs(point.z);
		if (isOrthographic) {
			point.z *= Math.min(clipFar / absZ, 1.0);
		} else {
			point.multiplyScalar(Math.min(clipFar / absZ, 1.0));
		}
	});

	return points;
}

// Polygon classes

const boxPoints = [];
for (let i = 0; i < 8; i++) {
	boxPoints.push(new Vector3());
}

class Polygons {

	constructor(pool) {
		this.polygons = [];

		this._pool = pool;
		this._tempPolygons = [];
	}

	clear() {
		this.polygons.length = 0;
	}

	setFromBox3(box3, rotationMatrix) {
		const { polygons, _pool } = this;

		const points = getBox3Points(box3, rotationMatrix, boxPoints);

		polygons[0] = _pool.allocate().begin().pushVertex(points[0]).pushVertex(points[1]).pushVertex(points[2]).pushVertex(points[3]).end();
		polygons[1] = _pool.allocate().begin().pushVertex(points[4]).pushVertex(points[7]).pushVertex(points[6]).pushVertex(points[5]).end();
		polygons[2] = _pool.allocate().begin().pushVertex(points[0]).pushVertex(points[3]).pushVertex(points[7]).pushVertex(points[4]).end();
		polygons[3] = _pool.allocate().begin().pushVertex(points[1]).pushVertex(points[2]).pushVertex(points[6]).pushVertex(points[5]).end();
		polygons[4] = _pool.allocate().begin().pushVertex(points[0]).pushVertex(points[4]).pushVertex(points[5]).pushVertex(points[1]).end();
		polygons[5] = _pool.allocate().begin().pushVertex(points[3]).pushVertex(points[7]).pushVertex(points[6]).pushVertex(points[2]).end();
	}

	clipByPlane(plane) {
		for (const polygon of this.polygons) {
			splitPolygon(plane, polygon, this._tempPolygons, this._pool);
		}

		this.polygons = this._tempPolygons;
		this._tempPolygons = [];
	}

}

const COPLANAR = 0;
const FRONT = 1;
const BACK = 2;
const SPANNING = 3;

const types = [];

function splitPolygon(plane, polygon, outPolygons, pool) {
	// Classify each point as well as the entire polygon into one of the above
	// four classes.
	let polygonType = 0;
	types.length = 0;

	for (let i = 0; i < polygon.verticesIndex; i++) {
		const t = plane.normal.dot(polygon.vertices[i]) + plane.constant;
		const type = t < -EPSILON ? BACK : t > EPSILON ? FRONT : COPLANAR;
		polygonType |= type;
		types.push(type);
	}

	// Put the polygon in the correct list, splitting it when necessary.
	switch (polygonType) {
		case COPLANAR:
			if (plane.normal.dot(polygon.plane.normal) > 0) {
				outPolygons.push(polygon);
			}
			break;
		case FRONT:
			outPolygons.push(polygon);
			break;
		case SPANNING: {
			const _polygon = pool.allocate();
			_polygon.begin();

			for (let i = 0; i < polygon.verticesIndex; i++) {
				const j = (i + 1) % polygon.verticesIndex;

				const ti = types[i],
					tj = types[j];
				const vi = polygon.vertices[i],
					vj = polygon.vertices[j];

				if (ti != BACK) _polygon.pushVertex(vi);
				if ((ti | tj) == SPANNING) {
					const t = -(plane.constant + plane.normal.dot(vi)) / plane.normal.dot(_vec3_1.copy(vj).sub(vi));
					const v = _vec3_1.lerpVectors(vi, vj, t);

					_polygon.pushVertex(v);
				}
			}

			if (_polygon.verticesIndex >= 3) {
				_polygon.end();
				outPolygons.push(_polygon);
			} else {
				pool.deallocate();
			}
			break;
		}
		default:
			break;
	}
}

class PolygonPool {

	constructor() {
		this.polygons = [];
		this.headIndex = 0;
	}

	allocate() {
		let polygon = this.polygons[this.headIndex];

		if (!polygon) {
			polygon = new Polygon();
			this.polygons[this.headIndex] = polygon;
		}

		this.headIndex++;

		return polygon;
	}

	deallocate() {
		this.headIndex--;
	}

	reset() {
		this.headIndex = 0;
	}

}

class Polygon {

	constructor() {
		this.plane = new Plane();
		this.vertices = [];
		this.verticesIndex = 0;
	}

	begin() {
		this.verticesIndex = 0;
		return this;
	}

	pushVertex(vector3) {
		let vertex = this.vertices[this.verticesIndex];

		if (!vertex) {
			vertex = new Vector3();
			this.vertices[this.verticesIndex] = vertex;
		}

		vertex.copy(vector3);
		this.verticesIndex++;

		return this;
	}

	end() {
		const plane = this.plane;
		const vertices = this.vertices;

		plane.normal.copy(vertices[1]).sub(vertices[0]).cross(_vec3_1.copy(vertices[2]).sub(vertices[0])).normalize();
		plane.constant = plane.normal.dot(vertices[0]);

		return this;
	}

}