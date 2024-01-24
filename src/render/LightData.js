import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { RectAreaLight } from '../scenes/lights/RectAreaLight.js';

const helpVector3 = new Vector3();
const helpMatrix4 = new Matrix4();

const tempDirectionalShadowMatrices = [];
const tempPointShadowMatrices = [];
const tempSpotShadowMatrices = [];

let _lightDataId = 0;

/**
 * The LightData class is used to collect lights,
 * and process them into a data format suitable for uploading to the GPU.
 * @ignore
 */
class LightData {

	constructor() {
		this.id = _lightDataId++;
		this.version = 0;

		// Light collection array

		this.lights = [];

		// Data caches

		this.ambient = new Float32Array([0, 0, 0]);

		this.sh = new Float32Array(27);

		this.hemisphere = [];

		this.directional = [];
		this.directionalShadow = [];
		this.directionalShadowMap = [];
		this.directionalShadowDepthMap = [];
		this.directionalShadowMatrix = new Float32Array(0);

		this.point = [];
		this.pointShadow = [];
		this.pointShadowMap = [];
		this.pointShadowMatrix = new Float32Array(0);

		this.spot = [];
		this.spotShadow = [];
		this.spotShadowMap = [];
		this.spotShadowDepthMap = [];
		this.spotShadowMatrix = new Float32Array(0);

		this.rectArea = [];
		this.LTC1 = null;
		this.LTC2 = null;

		// Status

		this.useAmbient = false;
		this.useSphericalHarmonics = false;
		this.hemisNum = 0;
		this.directsNum = 0;
		this.pointsNum = 0;
		this.spotsNum = 0;
		this.rectAreaNum = 0;
		this.directShadowNum = 0;
		this.pointShadowNum = 0;
		this.spotShadowNum = 0;

		this.totalNum = 0;
		this.shadowsNum = 0;

		// Hash

		this.hash = new LightHash();
	}

	begin() {
		this.totalNum = 0;
		this.shadowsNum = 0;
	}

	push(light) {
		this.lights[this.totalNum++] = light;

		if (castShadow(light)) {
			this.shadowsNum++;
		}
	}

	end(sceneData) {
		this.lights.length = this.totalNum;
		this.lights.sort(shadowCastingLightsFirst);

		this._setupCache(sceneData);

		this.hash.update(this);

		this.version++;
	}

	_setupCache(sceneData) {
		for (let i = 0; i < 3; i++) {
			this.ambient[i] = 0;
		}
		for (let i = 0; i < this.sh.length; i++) {
			this.sh[i] = 0;
		}
		this.useAmbient = false;
		this.useSphericalHarmonics = false;
		this.hemisNum = 0;
		this.directsNum = 0;
		this.pointsNum = 0;
		this.spotsNum = 0;
		this.rectAreaNum = 0;
		this.directShadowNum = 0;
		this.pointShadowNum = 0;
		this.spotShadowNum = 0;

		this.LTC1 = null;
		this.LTC2 = null;

		// Setup Uniforms

		for (let i = 0, l = this.lights.length; i < l; i++) {
			const light = this.lights[i];
			if (light.isAmbientLight) {
				this._doAddAmbientLight(light);
			} else if (light.isHemisphereLight) {
				this._doAddHemisphereLight(light, sceneData);
			} else if (light.isDirectionalLight) {
				this._doAddDirectLight(light, sceneData);
			} else if (light.isPointLight) {
				this._doAddPointLight(light, sceneData);
			} else if (light.isSpotLight) {
				this._doAddSpotLight(light, sceneData);
			} else if (light.isSphericalHarmonicsLight) {
				this._doAddSphericalHarmonicsLight(light);
			} else if (light.isRectAreaLight) {
				this._doAddRectAreaLight(light, sceneData);
			}
		}

		const directShadowNum = this.directShadowNum;
		if (directShadowNum > 0) {
			this.directionalShadowMap.length = directShadowNum;
			this.directionalShadowDepthMap.length = directShadowNum;
			tempDirectionalShadowMatrices.length = directShadowNum;
			if (this.directionalShadowMatrix.length !== directShadowNum * 16) {
				this.directionalShadowMatrix = new Float32Array(directShadowNum * 16);
			}
			for (let i = 0; i < directShadowNum; i++) {
				tempDirectionalShadowMatrices[i].toArray(this.directionalShadowMatrix, i * 16);
			}
		}

		const pointShadowNum = this.pointShadowNum;
		if (pointShadowNum > 0) {
			this.pointShadowMap.length = pointShadowNum;
			tempPointShadowMatrices.length = pointShadowNum;
			if (this.pointShadowMatrix.length !== pointShadowNum * 16) {
				this.pointShadowMatrix = new Float32Array(pointShadowNum * 16);
			}
			for (let i = 0; i < pointShadowNum; i++) {
				tempPointShadowMatrices[i].toArray(this.pointShadowMatrix, i * 16);
			}
		}

		const spotShadowNum = this.spotShadowNum;
		if (spotShadowNum > 0) {
			this.spotShadowMap.length = spotShadowNum;
			this.spotShadowDepthMap.length = spotShadowNum;
			tempSpotShadowMatrices.length = spotShadowNum;
			if (this.spotShadowMatrix.length !== spotShadowNum * 16) {
				this.spotShadowMatrix = new Float32Array(spotShadowNum * 16);
			}
			for (let i = 0; i < spotShadowNum; i++) {
				tempSpotShadowMatrices[i].toArray(this.spotShadowMatrix, i * 16);
			}
		}

		if (this.rectAreaNum > 0) {
			this.LTC1 = RectAreaLight.LTC1;
			this.LTC2 = RectAreaLight.LTC2;
		}
	}

	_doAddAmbientLight(object) {
		const intensity = object.intensity;
		const color = object.color;

		this.ambient[0] += color.r * intensity;
		this.ambient[1] += color.g * intensity;
		this.ambient[2] += color.b * intensity;

		this.useAmbient = true;
	}

	_doAddSphericalHarmonicsLight(object) {
		const intensity = object.intensity;
		const sh = object.sh.coefficients;
		for (let i = 0; i < sh.length; i += 1) {
			this.sh[i * 3] += sh[i].x * intensity;
			this.sh[i * 3 + 1] += sh[i].y * intensity;
			this.sh[i * 3 + 2] += sh[i].z * intensity;
		}

		this.useSphericalHarmonics = true;
	}

	_doAddHemisphereLight(object, sceneData) {
		const intensity = object.intensity;
		const skyColor = object.color;
		const groundColor = object.groundColor;

		const useAnchorMatrix = sceneData.useAnchorMatrix;

		const cache = getLightCache(object);

		cache.skyColor[0] = skyColor.r * intensity;
		cache.skyColor[1] = skyColor.g * intensity;
		cache.skyColor[2] = skyColor.b * intensity;

		cache.groundColor[0] = groundColor.r * intensity;
		cache.groundColor[1] = groundColor.g * intensity;
		cache.groundColor[2] = groundColor.b * intensity;

		const e = object.worldMatrix.elements;
		const direction = helpVector3.set(e[4], e[5], e[6]).normalize();
		if (useAnchorMatrix) {
			direction.transformDirection(sceneData.anchorMatrixInverse);
		}

		direction.toArray(cache.direction);

		this.hemisphere[this.hemisNum++] = cache;
	}

	_doAddDirectLight(object, sceneData) {
		const intensity = object.intensity;
		const color = object.color;

		const useAnchorMatrix = sceneData.useAnchorMatrix;

		const cache = getLightCache(object);

		cache.color[0] = color.r * intensity;
		cache.color[1] = color.g * intensity;
		cache.color[2] = color.b * intensity;

		const direction = object.getWorldDirection(helpVector3);
		if (useAnchorMatrix) {
			direction.transformDirection(sceneData.anchorMatrixInverse);
		}

		direction.multiplyScalar(-1).toArray(cache.direction);

		if (object.castShadow) {
			const shadow = object.shadow;
			const shadowCache = getShadowCache(object);

			shadowCache.shadowBias[0] = shadow.bias;
			shadowCache.shadowBias[1] = shadow.normalBias;
			shadowCache.shadowMapSize[0] = shadow.mapSize.x;
			shadowCache.shadowMapSize[1] = shadow.mapSize.y;
			shadowCache.shadowParams[0] = shadow.radius;
			shadowCache.shadowParams[1] = shadow.frustumEdgeFalloff;

			this.directionalShadow[this.directShadowNum++] = shadowCache;

			shadow.update(object);
			shadow.updateMatrix();
			if (useAnchorMatrix) {
				shadow.matrix.multiply(sceneData.anchorMatrix);
			}

			this.directionalShadowMap[this.directsNum] = shadow.map;
			this.directionalShadowDepthMap[this.directsNum] = shadow.depthMap;
			tempDirectionalShadowMatrices[this.directsNum] = shadow.matrix;
		}

		this.directional[this.directsNum++] = cache;
	}

	_doAddPointLight(object, sceneData) {
		const intensity = object.intensity;
		const color = object.color;
		const distance = object.distance;
		const decay = object.decay;

		const useAnchorMatrix = sceneData.useAnchorMatrix;

		const cache = getLightCache(object);

		cache.color[0] = color.r * intensity;
		cache.color[1] = color.g * intensity;
		cache.color[2] = color.b * intensity;

		cache.distance = distance;
		cache.decay = decay;

		const position = helpVector3.setFromMatrixPosition(object.worldMatrix);
		if (useAnchorMatrix) {
			position.applyMatrix4(sceneData.anchorMatrixInverse);
		}

		cache.position[0] = position.x;
		cache.position[1] = position.y;
		cache.position[2] = position.z;

		if (object.castShadow) {
			const shadow = object.shadow;
			const shadowCache = getShadowCache(object);

			shadowCache.shadowBias[0] = shadow.bias;
			shadowCache.shadowBias[1] = shadow.normalBias;
			shadowCache.shadowMapSize[0] = shadow.mapSize.x;
			shadowCache.shadowMapSize[1] = shadow.mapSize.y;
			shadowCache.shadowParams[0] = shadow.radius;
			shadowCache.shadowParams[1] = 0;
			shadowCache.shadowCameraRange[0] = shadow.cameraNear;
			shadowCache.shadowCameraRange[1] = shadow.cameraFar;

			this.pointShadow[this.pointShadowNum++] = shadowCache;

			shadow.update(object, 0);
			shadow.matrix.makeTranslation(-position.x, -position.y, -position.z); // for point light

			this.pointShadowMap[this.pointsNum] = shadow.map;
			tempPointShadowMatrices[this.pointsNum] = shadow.matrix;
		}

		this.point[this.pointsNum++] = cache;
	}

	_doAddSpotLight(object, sceneData) {
		const intensity = object.intensity;
		const color = object.color;
		const distance = object.distance;
		const decay = object.decay;

		const useAnchorMatrix = sceneData.useAnchorMatrix;

		const cache = getLightCache(object);

		cache.color[0] = color.r * intensity;
		cache.color[1] = color.g * intensity;
		cache.color[2] = color.b * intensity;

		cache.distance = distance;
		cache.decay = decay;

		const position = helpVector3.setFromMatrixPosition(object.worldMatrix);
		if (useAnchorMatrix) {
			position.applyMatrix4(sceneData.anchorMatrixInverse);
		}

		cache.position[0] = position.x;
		cache.position[1] = position.y;
		cache.position[2] = position.z;

		const direction = object.getWorldDirection(helpVector3);
		if (useAnchorMatrix) {
			direction.transformDirection(sceneData.anchorMatrixInverse);
		}

		direction.multiplyScalar(-1).toArray(cache.direction);

		const coneCos = Math.cos(object.angle);
		const penumbraCos = Math.cos(object.angle * (1 - object.penumbra));

		cache.coneCos = coneCos;
		cache.penumbraCos = penumbraCos;

		if (object.castShadow) {
			const shadow = object.shadow;
			const shadowCache = getShadowCache(object);

			shadowCache.shadowBias[0] = shadow.bias;
			shadowCache.shadowBias[1] = shadow.normalBias;
			shadowCache.shadowMapSize[0] = shadow.mapSize.x;
			shadowCache.shadowMapSize[1] = shadow.mapSize.y;
			shadowCache.shadowParams[0] = shadow.radius;
			shadowCache.shadowParams[1] = shadow.frustumEdgeFalloff;

			this.spotShadow[this.spotShadowNum++] = shadowCache;

			shadow.update(object);
			shadow.updateMatrix();
			if (useAnchorMatrix) {
				shadow.matrix.multiply(sceneData.anchorMatrix);
			}

			this.spotShadowMap[this.spotsNum] = shadow.map;
			this.spotShadowDepthMap[this.spotsNum] = shadow.depthMap;
			tempSpotShadowMatrices[this.spotsNum] = shadow.matrix;
		}

		this.spot[this.spotsNum++] = cache;
	}

	_doAddRectAreaLight(object, sceneData) {
		const intensity = object.intensity;
		const color = object.color;
		const halfHeight = object.height;
		const halfWidth = object.width;

		const useAnchorMatrix = sceneData.useAnchorMatrix;

		const cache = getLightCache(object);

		cache.color[0] = color.r * intensity;
		cache.color[1] = color.g * intensity;
		cache.color[2] = color.b * intensity;

		const position = helpVector3.setFromMatrixPosition(object.worldMatrix);
		if (useAnchorMatrix) {
			position.applyMatrix4(sceneData.anchorMatrixInverse);
		}

		cache.position[0] = position.x;
		cache.position[1] = position.y;
		cache.position[2] = position.z;

		// extract rotation of light to derive width/height half vectors
		helpMatrix4.copy(object.worldMatrix);
		if (useAnchorMatrix) {
			helpMatrix4.premultiply(sceneData.anchorMatrixInverse);
		}
		helpMatrix4.extractRotation(helpMatrix4);

		const halfWidthPos = helpVector3.set(halfWidth * 0.5, 0.0, 0.0);
		halfWidthPos.applyMatrix4(helpMatrix4);
		cache.halfWidth[0] = halfWidthPos.x;
		cache.halfWidth[1] = halfWidthPos.y;
		cache.halfWidth[2] = halfWidthPos.z;

		const halfHeightPos = helpVector3.set(0.0, halfHeight * 0.5, 0.0);
		halfHeightPos.applyMatrix4(helpMatrix4);
		cache.halfHeight[0] = halfHeightPos.x;
		cache.halfHeight[1] = halfHeightPos.y;
		cache.halfHeight[2] = halfHeightPos.z;

		this.rectArea[this.rectAreaNum++] = cache;
	}

}

// Light caches

const lightCaches = new WeakMap();

function getLightCache(light) {
	if (lightCaches.has(light)) {
		return lightCaches.get(light);
	}

	let cache;

	if (light.isHemisphereLight) {
		cache = {
			direction: new Float32Array(3),
			skyColor: new Float32Array([0, 0, 0]),
			groundColor: new Float32Array([0, 0, 0])
		};
	} else if (light.isDirectionalLight) {
		cache = {
			direction: new Float32Array(3),
			color: new Float32Array([0, 0, 0])
		};
	} else if (light.isPointLight) {
		cache = {
			position: new Float32Array(3),
			color: new Float32Array([0, 0, 0]),
			distance: 0,
			decay: 0
		};
	} else if (light.isSpotLight) {
		cache = {
			position: new Float32Array(3),
			direction: new Float32Array(3),
			color: new Float32Array([0, 0, 0]),
			distance: 0,
			coneCos: 0,
			penumbraCos: 0,
			decay: 0
		};
	} else if (light.isRectAreaLight) {
		cache = {
			position: new Float32Array(3),
			color: new Float32Array([0, 0, 0]),
			halfWidth: new Float32Array(3),
			halfHeight: new Float32Array(3)
		};
	}


	lightCaches.set(light, cache);

	return cache;
}

// Shadow caches

const shadowCaches = new WeakMap();

function getShadowCache(light) {
	if (shadowCaches.has(light)) {
		return shadowCaches.get(light);
	}

	let cache;

	if (light.isDirectionalLight) {
		cache = {
			shadowBias: new Float32Array(2), // [bias, normalBias]
			shadowMapSize: new Float32Array(2), // [width, height]
			shadowParams: new Float32Array(2) // [radius, frustumEdgeFalloff]
		};
	} else if (light.isPointLight) {
		cache = {
			shadowBias: new Float32Array(2), // [bias, normalBias]
			shadowMapSize: new Float32Array(2), // [width, height]
			shadowParams: new Float32Array(2), // [radius, 0]
			shadowCameraRange: new Float32Array(2) // [cameraNear, cameraFar]
		};
	} else if (light.isSpotLight) {
		cache = {
			shadowBias: new Float32Array(2), // [bias, normalBias]
			shadowMapSize: new Float32Array(2), // [width, height]
			shadowParams: new Float32Array(2) // [radius, frustumEdgeFalloff]
		};
	}

	shadowCaches.set(light, cache);

	return cache;
}

// Light hash

class LightHash {

	constructor() {
		this._factor = new Uint16Array(9);
	}

	update(lights) {
		this._factor[0] = lights.useAmbient ? 1 : 0;
		this._factor[1] = lights.useSphericalHarmonics ? 1 : 0;
		this._factor[2] = lights.hemisNum;
		this._factor[3] = lights.directsNum;
		this._factor[4] = lights.pointsNum;
		this._factor[5] = lights.spotsNum;
		this._factor[6] = lights.rectAreaNum;
		this._factor[7] = lights.directShadowNum;
		this._factor[8] = lights.pointShadowNum;
		this._factor[9] = lights.spotShadowNum;
	}

	compare(factor) {
		if (!factor) {
			return false;
		}

		for (let i = 0, l = factor.length; i < l; i++) {
			if (this._factor[i] !== factor[i]) {
				return false;
			}
		}

		return true;
	}

	copyTo(factor) {
		if (!factor) {
			factor = new this._factor.constructor(this._factor.length);
		}
		factor.set(this._factor);
		return factor;
	}

}

function shadowCastingLightsFirst(lightA, lightB) {
	const a = castShadow(lightA) ? 1 : 0;
	const b = castShadow(lightB) ? 1 : 0;
	return b - a;
}

function castShadow(light) {
	return light.shadow && light.castShadow;
}

export { LightData };