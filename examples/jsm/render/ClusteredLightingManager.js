import { PIXEL_TYPE, PIXEL_FORMAT, Texture2D, TEXTURE_FILTER, MathUtils, Sphere, Box3, Vector3 } from 't3d';

console.warn('ClusteredLightingManager is deprecated since v0.4.0, use renderer.lightingOptions to enable clustered lighting instead.');

/**
 * ClusteredLightingManager.
 * Supports point and spot lights.
 */
class ClusteredLightingManager {

	/**
	 * Constructs a new ClusteredLightingManager.
	 * @param {object} [options] - The options.
	 * @param {number} [options.maxLights=256] - The maximum number of lights.
	 * @param {boolean} [options.floatLights=false] - Whether the lights are stored as floats.
	 * @param {number[]} [options.cells=[16, 8, 32]] - The number of cells in each dimension.
	 * @param {number} [options.maxLightsPerCell=256] - The maximum number of lights per cell.
	 * @param {number} [options.clipNear=-1] - The near clipping plane for the cells.
	 * @param {number} [options.clipFar=-1] - The far clipping plane for the cells.
	 */
	constructor({
		maxLights = 256,
		floatLights = false,
		cells = [16, 8, 32],
		maxLightsPerCell = 256,
		clipNear = -1,
		clipFar = -1
	}) {
		this.lightsTexture = new LightsTexture(maxLights, floatLights ? PIXEL_TYPE.FLOAT : PIXEL_TYPE.HALF_FLOAT);

		this.cellsTexture = new CellsTexture();
		this.cellsTexture.initCells(cells, maxLightsPerCell);

		this.clipNear = clipNear;
		this.clipFar = clipFar;

		this._cellsTextureEmpty = false;

		this._cellsTransform = {
			clips: [0, 0], // near, far
			factors: [0, 0, 0, 0], // logFactor1, logFactor2, persp:tan(fov/2)|ortho:-height/2, aspect
			perspective: true
		};
	}

	get cells() {
		return this.cellsTexture.cellsInfo.table;
	}

	get maxLightsPerCell() {
		return this.cellsTexture.cellsInfo.maxLightsPerCell;
	}

	get cellsDotData() {
		return this.cellsTexture.cellsInfo.dotData;
	}

	get cellsTextureSize() {
		return this.cellsTexture.cellsInfo.textureSize;
	}

	get cellsTransformFactors() {
		return this._cellsTransform.factors;
	}

	dispose() {
		this._cellsTextureEmpty = false;
		this.cellsTexture.dispose();
		this.lightsTexture.dispose();
	}

	update(cameraData, lightingGroup, lightsNeedsUpdate = true) {
		this._updateCellsTransform(cameraData);

		this.cellsTexture.resetLightIndices();

		const cellsTable = this.cellsTexture.cellsInfo.table;
		const cellsTransform = this._cellsTransform;

		let lightIndicesWritten = false;

		for (let i = 0; i < lightingGroup.pointsNum; i++) {
			const pointLight = lightingGroup.point[i];

			getPointLightBoundingSphere(pointLight, _lightSphere);
			_lightSphere.center.applyMatrix4(cameraData.viewMatrix);
			_lightSphere.center.z *= -1;

			if (getCellsRange(_lightSphere, cellsTable, cellsTransform, _cellsRange)) {
				lightIndicesWritten = this.cellsTexture.setLightIndex(_cellsRange, i) || lightIndicesWritten;
				lightsNeedsUpdate && this.lightsTexture.setPointLight(i, pointLight);
			}
		}

		for (let i = 0; i < lightingGroup.spotsNum; i++) {
			const spotLight = lightingGroup.spot[i];

			getSpotLightBoundingSphere(spotLight, _lightSphere);
			_lightSphere.center.applyMatrix4(cameraData.viewMatrix);
			_lightSphere.center.z *= -1;

			if (getCellsRange(_lightSphere, cellsTable, cellsTransform, _cellsRange)) {
				lightIndicesWritten = this.cellsTexture.setLightIndex(_cellsRange, i + lightingGroup.pointsNum) || lightIndicesWritten;
				lightsNeedsUpdate && this.lightsTexture.setSpotLight(i + lightingGroup.pointsNum, spotLight);
			}
		}

		(lightIndicesWritten && lightsNeedsUpdate) && this.lightsTexture.version++;

		(lightIndicesWritten || !this._cellsTextureEmpty) && this.cellsTexture.version++;
		this._cellsTextureEmpty = !lightIndicesWritten;
	}

	_updateCellsTransform(cameraData) {
		const { clips, factors } = this._cellsTransform;

		const fixedNear = this.clipNear > 0 ? this.clipNear : cameraData.near,
			fixedFar = this.clipFar > 0 ? this.clipFar : cameraData.far;

		clips[0] = fixedNear;
		clips[1] = fixedFar;

		const cz = this.cellsTexture.cellsInfo.table[2];

		const _logFarNear = Math.log(fixedFar / fixedNear);
		factors[0] = cz / _logFarNear;
		factors[1] = -cz * Math.log(fixedNear) / _logFarNear;

		const perspective = _isPerspectiveMatrix(cameraData.projectionMatrix);
		const elements = cameraData.projectionMatrix.elements;

		factors[2] = (perspective ? 1 : -1) / elements[5]; // persp: tan(fov / 2), ortho: -height / 2
		factors[3] = elements[5] / elements[0]; // aspect: (width / height)

		this._cellsTransform.perspective = perspective;
	}

}

class CellsTexture extends Texture2D {

	constructor() {
		super();

		this.format = PIXEL_FORMAT.RED;
		this.type = PIXEL_TYPE.HALF_FLOAT;
		this.magFilter = TEXTURE_FILTER.NEAREST;
		this.minFilter = TEXTURE_FILTER.NEAREST;
		this.generateMipmaps = false;
		this.flipY = false;

		this.unpackAlignment = 1;

		this.cellsInfo = {
			table: [],
			maxLightsPerCell: 0,
			textureSize: [],
			dotData: []
		};

		this._counts = null;
	}

	initCells(cellTable, maxLightsPerCell) {
		const numCells = cellTable[0] * cellTable[1] * cellTable[2];
		const numPixels = numCells * maxLightsPerCell;

		// TODO - better texture size calculation
		let width = Math.ceil(Math.sqrt(numPixels));
		width = Math.ceil(width / maxLightsPerCell) * maxLightsPerCell;
		const height = Math.ceil(numPixels / width);

		const data = new Uint16Array(width * height);

		this.image = { data, width, height };

		this.cellsInfo.table[0] = cellTable[0];
		this.cellsInfo.table[1] = cellTable[1];
		this.cellsInfo.table[2] = cellTable[2];

		this.cellsInfo.maxLightsPerCell = maxLightsPerCell;

		this.cellsInfo.textureSize[0] = width;
		this.cellsInfo.textureSize[1] = 1 / width;
		this.cellsInfo.textureSize[2] = 1 / height;

		this.cellsInfo.dotData[0] = maxLightsPerCell;
		this.cellsInfo.dotData[1] = cellTable[0] * cellTable[2] * maxLightsPerCell;
		this.cellsInfo.dotData[2] = cellTable[0] * maxLightsPerCell;

		this._counts = new Int32Array(numCells);
	}

	updateCells(cellTable, maxLightsPerCell) {
		this.dispose();
		this.initCells(cellTable, maxLightsPerCell);
		this.version++;
	}

	resetLightIndices() {
		this.image.data.fill(0);
		this._counts.fill(0);
	}

	setLightIndex(cellsRange, index) {
		const data = this.image.data;
		const counts = this._counts;
		const { table, maxLightsPerCell } = this.cellsInfo;
		const { min, max } = cellsRange;

		let needsUpdate = false;

		for (let x = min.x; x <= max.x; x++) {
			for (let z = min.z; z <= max.z; z++) {
				for (let y = min.y; y <= max.y; y++) {
					const idx = x + table[0] * (z + y * table[2]);
					const count = counts[idx];
					if (count < maxLightsPerCell) {
						const offset = idx * maxLightsPerCell + count;
						data[offset] = MathUtils.toHalfFloat(index + 1); // 0 is reserved for empty cell, so we offset by 1
						counts[idx]++;
						needsUpdate = true;
					}
				}
			}
		}

		return needsUpdate;
	}

}

class LightsTexture extends Texture2D {

	constructor(maxLights = 256, type = PIXEL_TYPE.HALF_FLOAT) {
		super();

		const size = Math.max(textureSize(maxLights * LIGHT_STRIDE), LIGHT_STRIDE);
		const arrayType = type === PIXEL_TYPE.FLOAT ? Float32Array : Uint16Array;
		const data = new arrayType(size * size * 4); // eslint-disable-line new-cap

		this.image = { data, width: size, height: size };
		this.format = PIXEL_FORMAT.RGBA;
		this.type = type;
		this.magFilter = TEXTURE_FILTER.NEAREST;
		this.minFilter = TEXTURE_FILTER.NEAREST;
		this.generateMipmaps = false;
		this.flipY = false;
	}

	setPointLight(index, lightInfo) {
		const data = this.image.data;
		const halfFloat = this.type === PIXEL_TYPE.HALF_FLOAT;

		const start = index * LIGHT_STRIDE * 4;
		const { color, decay, position, distance } = lightInfo;

		// pixel 0 - R: lightType, G: -, B: -, A: -

		data[start + 0 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(1) : 1;

		// pixel 1 - R: color.r, G: color.g, B: color.b, A: decay

		data[start + 1 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(color[0]) : color[0];
		data[start + 1 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(color[1]) : color[1];
		data[start + 1 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(color[2]) : color[2];
		data[start + 1 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(decay) : decay;

		// pixel 2 - R: position.x, G: position.y, B: position.z, A: distance

		data[start + 2 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(position[0]) : position[0];
		data[start + 2 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(position[1]) : position[1];
		data[start + 2 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(position[2]) : position[2];
		data[start + 2 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(distance) : distance;

		// pixel 3 - R: -, G: -, B: -, A: -
	}

	setSpotLight(index, lightInfo) {
		const data = this.image.data;
		const halfFloat = this.type === PIXEL_TYPE.HALF_FLOAT;

		const start = index * LIGHT_STRIDE * 4;
		const { color, decay, position, distance, direction, coneCos, penumbraCos } = lightInfo;

		// pixel 0 - R: lightType, G: penumbraCos, B: -, A: -

		data[start + 0 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(2) : 2;
		data[start + 0 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(penumbraCos) : penumbraCos;

		// pixel 1 - R: color.r, G: color.g, B: color.b, A: decay

		data[start + 1 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(color[0]) : color[0];
		data[start + 1 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(color[1]) : color[1];
		data[start + 1 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(color[2]) : color[2];
		data[start + 1 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(decay) : decay;

		// pixel 2 - R: position.x, G: position.y, B: position.z, A: distance

		data[start + 2 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(position[0]) : position[0];
		data[start + 2 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(position[1]) : position[1];
		data[start + 2 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(position[2]) : position[2];
		data[start + 2 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(distance) : distance;

		// pixel 3 - R: direction.x, G: direction.y, B: direction.z, A: coneCos

		data[start + 3 * 4 + 0] = halfFloat ? MathUtils.toHalfFloat(direction[0]) : direction[0];
		data[start + 3 * 4 + 1] = halfFloat ? MathUtils.toHalfFloat(direction[1]) : direction[1];
		data[start + 3 * 4 + 2] = halfFloat ? MathUtils.toHalfFloat(direction[2]) : direction[2];
		data[start + 3 * 4 + 3] = halfFloat ? MathUtils.toHalfFloat(coneCos) : coneCos;
	}

}

const LIGHT_STRIDE = 4;

const _lightSphere = new Sphere();
const _cellsRange = new Box3();
const _vec3_1 = new Vector3();

function getPointLightBoundingSphere(light, sphere) {
	sphere.center.fromArray(light.position);
	sphere.radius = light.distance;
}

function getSpotLightBoundingSphere(light, sphere) {
	if (light.coneCos < 0.70710678118) { // obtuse angle
		_vec3_1.fromArray(light.direction).multiplyScalar(light.distance * light.coneCos);
		sphere.center.fromArray(light.position).add(_vec3_1);
		sphere.radius = light.distance * Math.sqrt(1 - light.coneCos * light.coneCos);
	} else {
		_vec3_1.fromArray(light.direction).multiplyScalar(light.distance / (light.coneCos * 2));
		sphere.center.fromArray(light.position).add(_vec3_1);
		sphere.radius = light.distance / (light.coneCos * 2);
	}
}

function textureSize(pixelCount) {
	return MathUtils.nextPowerOfTwo(Math.ceil(Math.sqrt(pixelCount)));
}

function _isPerspectiveMatrix(m) {
	return m.elements[11] === -1.0;
}

function getCellsRange(lightSphere, cellsTable, cellsTransform, cellsRange) {
	const { center, radius } = lightSphere;

	const { clips, factors, perspective } = cellsTransform;

	let zMin = center.z - radius;
	const zMax = center.z + radius;

	if (zMin > clips[1] || zMax < clips[0]) {
		return false;
	}

	zMin = Math.max(zMin, clips[0]);
	const zStart = Math.floor(Math.log(zMin) * factors[0] + factors[1]);
	const zEnd = Math.min(Math.floor(Math.log(zMax) * factors[0] + factors[1]), cellsTable[2] - 1);

	const halfFrustumHeight = (perspective ? Math.abs(center.z) : -1) * factors[2];
	const invH = 1 / (2 * halfFrustumHeight);

	const yMin = (center.y - radius) * invH + 0.5;
	const yMax = (center.y + radius) * invH + 0.5;
	if (yMin > 1 || yMax < 0) {
		return false;
	}

	const yStart = Math.max(Math.floor(yMin * cellsTable[1]), 0);
	const yEnd = Math.min(Math.floor(yMax * cellsTable[1]), cellsTable[1] - 1);

	const halfFrustumWidth = halfFrustumHeight * factors[3];
	const invW = 1 / (2 * halfFrustumWidth);

	const xMin = (center.x - radius) * invW + 0.5;
	const xMax = (center.x + radius) * invW + 0.5;
	if (xMin > 1 || xMax < 0) {
		return false;
	}

	const xStart = Math.max(Math.floor(xMin * cellsTable[0]), 0);
	const xEnd = Math.min(Math.floor(xMax * cellsTable[0]), cellsTable[0] - 1);

	cellsRange.min.set(xStart, yStart, zStart);
	cellsRange.max.set(xEnd, yEnd, zEnd);

	return true;
}

export { ClusteredLightingManager };