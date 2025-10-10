import { WebGLRenderer } from './webgl/WebGLRenderer.js';
import { WebGLTextures } from './webgl/WebGLTextures.js';
import { Scene } from './scenes/Scene.js';
import { MathUtils } from './math/MathUtils.js';
import { RenderStates } from './render/RenderStates.js';
import { Matrix4 } from './math/Matrix4.js';
import { Matrix3 } from './math/Matrix3.js';
import { Vector3 } from './math/Vector3.js';
import { EventDispatcher } from './EventDispatcher.js';
import { PropertyMap } from './render/PropertyMap.js';
import { ScreenRenderTarget } from './resources/targets/ScreenRenderTarget.js';
import { OffscreenRenderTarget } from './resources/targets/OffscreenRenderTarget.js';
import { RenderBuffer } from './resources/RenderBuffer.js';
import { Texture2D } from './resources/textures/Texture2D.js';
import { TextureCube } from './resources/textures/TextureCube.js';
import { Texture3D } from './resources/textures/Texture3D.js';
import { Texture2DArray } from './resources/textures/Texture2DArray.js';
import { ATTACHMENT, PIXEL_FORMAT } from './const.js';

Object.defineProperties(WebGLRenderer.prototype, {
	// deprecated since 0.4.5
	asyncReadPixel: {
		configurable: true,
		get: function() {
			if (this._asyncReadPixel === undefined) {
				this._asyncReadPixel = false;
			}
			return this._asyncReadPixel;
		},
		set: function(value) {
			this._asyncReadPixel = value;
		}
	}
});

// deprecated since 0.4.5, use readTexturePixels instead
WebGLRenderer.prototype.readRenderTargetPixels = function(x, y, width, height, buffer) {
	const state = this._state;
	const renderTarget = state.currentRenderTarget;

	const zIndex = renderTarget.activeLayer || renderTarget.activeLayer || 0;
	const mipLevel = renderTarget.activeMipmapLevel || 0;

	if (renderTarget && renderTarget.texture) {
		if ((x >= 0 && x <= (renderTarget.width - width)) && (y >= 0 && y <= (renderTarget.height - height))) {
			if (this.asyncReadPixel) {
				return this.readTexturePixels(renderTarget.texture, x, y, width, height, buffer, zIndex, mipLevel);
			} else {
				this.readTexturePixelsSync(renderTarget.texture, x, y, width, height, buffer, zIndex, mipLevel);
				return Promise.resolve(buffer);
			}
		}
	}

	console.warn('WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed.');
	return Promise.reject();
};

// deprecated since 0.5.1
WebGLTextures.prototype.setTexture2D = function(texture, slot) {
	// console.warn('WebGLTextures: .setTexture2D() has been deprecated, use .setTexture() instead.');
	return this.setTexture(texture, slot);
};
WebGLTextures.prototype.setTextureCube = function(texture, slot) {
	// console.warn('WebGLTextures: .setTextureCube() has been deprecated, use .setTexture() instead.');
	return this.setTexture(texture, slot);
};
WebGLTextures.prototype.setTexture3D = function(texture, slot) {
	// console.warn('WebGLTextures: .setTexture3D() has been deprecated, use .setTexture() instead.');
	return this.setTexture(texture, slot);
};
WebGLTextures.prototype.setTexture2DArray = function(texture, slot) {
	// console.warn('WebGLTextures: .setTexture2DArray() has been deprecated, use .setTexture() instead.');
	return this.setTexture(texture, slot);
};

Object.defineProperties(Scene.prototype, {
	// deprecated since 0.2.7, add warning since 0.4.0
	environmentLightIntensity: {
		configurable: true,
		get: function() {
			console.warn('Scene: .environmentLightIntensity has been deprecated, use .envDiffuseIntensity instead.');
			return this.envDiffuseIntensity;
		},
		set: function(value) {
			console.warn('Scene: .environmentLightIntensity has been deprecated, use .envDiffuseIntensity instead.');
			this.envDiffuseIntensity = value;
		}
	},
	// deprecated since 0.4.0
	_lightData: {
		configurable: true,
		get: function() {
			console.warn('Scene: ._lightData has been deprecated since v0.4.0, use .collector.lightingData.getGroup(0) instead.');
			return this.collector.lightingData.getGroup(0);
		}
	},
	// deprecated since 0.4.4
	_sceneData: {
		configurable: true,
		get: function() {
			console.warn('Scene: ._sceneData has been deprecated since v0.4.4, use .collector.sceneData instead.');
			return this.collector.sceneData;
		}
	},
	// deprecated since 0.4.4
	_lightingData: {
		configurable: true,
		get: function() {
			console.warn('Scene: ._lightingData has been deprecated since v0.4.4, use .collector.lightingData instead.');
			return this.collector.lightingData;
		}
	}
});

Object.defineProperties(RenderStates.prototype, {
	// deprecated since 0.4.0
	lights: {
		configurable: true,
		get: function() {
			console.warn('RenderStates: .lights has been deprecated since v0.4.0, use .lighting.getGroup(0) instead.');
			return this.lighting.getGroup(0);
		}
	}
});

// deprecated since 0.2.8

export const generateUUID = MathUtils.generateUUID;
export const isPowerOfTwo = MathUtils.isPowerOfTwo;
export const nearestPowerOfTwo = MathUtils.nearestPowerOfTwo;
export const nextPowerOfTwo = MathUtils.nextPowerOfTwo;

// deprecated since 0.4.3
Matrix4.prototype.inverse = function() {
	return this.invert();
};

// deprecated since 0.4.3
Matrix4.prototype.getInverse = function(m) {
	return this.copy(m).invert();
};

// deprecated since 0.4.3
Matrix4.prototype.transform = function(position, scale, quaternion) {
	return this.compose(position, quaternion, scale);
};

// deprecated since 0.4.3
Matrix3.prototype.inverse = function() {
	return this.invert();
};

// deprecated since 0.4.3
Matrix3.prototype.getInverse = function(m) {
	return this.copy(m).invert();
};

// deprecated since 0.4.3
Vector3.prototype.subtract = function(a, target = new Vector3()) {
	return target.set(this.x - a.x, this.y - a.y, this.z - a.z);
};

// The old version of Query API has been deprecated since 0.4.4

export const QUERY_TYPE = {
	ANY_SAMPLES_PASSED: 7000,
	ANY_SAMPLES_PASSED_CONSERVATIVE: 7001,
	TIME_ELAPSED: 7002
};

let _queryId = 0;
export class Query extends EventDispatcher {

	constructor() {
		super();
		this.id = _queryId++;
	}

	dispose() {
		this.dispatchEvent({ type: 'dispose' });
	}

}

WebGLRenderer.prototype.beginQuery = function(query, target) {
	this._queries.begin(query, target);
};

WebGLRenderer.prototype.endQuery = function(query) {
	this._queries.end(query);
};

WebGLRenderer.prototype.queryCounter = function(query) {
	this._queries.counter(query);
};

WebGLRenderer.prototype.isTimerQueryDisjoint = function(query) {
	return this._queries.isTimerDisjoint(query);
};

WebGLRenderer.prototype.isQueryResultAvailable = function(query) {
	return this._queries.isResultAvailable(query);
};

WebGLRenderer.prototype.getQueryResult = function(query) {
	return this._queries.getResult(query);
};

Object.defineProperties(WebGLRenderer.prototype, {
	_queries: {
		configurable: true,
		get: function() {
			if (this.__queries === undefined) {
				this.__queries = new WebGLQueries(`_gl${this.id}`, this.context, this.capabilities);
			}
			return this.__queries;
		}
	}
});

export class WebGLQueries extends PropertyMap {

	constructor(prefix, gl, capabilities) {
		super(prefix);

		this._gl = gl;
		this._capabilities = capabilities;

		const timerQuery = capabilities.timerQuery;
		const that = this;

		const onQueryDispose = event => {
			const query = event.target;
			const queryProperties = that.get(query);

			query.removeEventListener('dispose', onQueryDispose);

			if (queryProperties._webglQuery) {
				if (capabilities.version > 1) {
					gl.deleteQuery(queryProperties._webglQuery);
				} else {
					timerQuery.deleteQueryEXT(queryProperties._webglQuery);
				}
			}

			that.delete(query);
		};

		this._onQueryDispose = onQueryDispose;

		this._typeToGL = {
			[QUERY_TYPE.ANY_SAMPLES_PASSED]: 0x8C2F,
			[QUERY_TYPE.ANY_SAMPLES_PASSED_CONSERVATIVE]: 0x8D6A,
			[QUERY_TYPE.TIME_ELAPSED]: 0x88BF
		};
	}

	_get(query) {
		const capabilities = this._capabilities;

		const queryProperties = this.get(query);

		if (queryProperties._webglQuery === undefined) {
			query.addEventListener('dispose', this._onQueryDispose);

			queryProperties._webglQuery = capabilities.version > 1 ? this._gl.createQuery() : capabilities.timerQuery.createQueryEXT();
			queryProperties._target = null;
			queryProperties._result = null;
		}

		return queryProperties;
	}

	begin(query, target) {
		const capabilities = this._capabilities;
		const typeToGL = this._typeToGL;

		const queryProperties = this._get(query);

		if (capabilities.version > 1) {
			this._gl.beginQuery(typeToGL[target], queryProperties._webglQuery);
		} else {
			capabilities.timerQuery.beginQueryEXT(typeToGL[target], queryProperties._webglQuery);
		}

		queryProperties._target = target;
		queryProperties._result = null; // clear the last result.
	}

	end(query) {
		const capabilities = this._capabilities;
		const typeToGL = this._typeToGL;

		const queryProperties = this._get(query);

		if (capabilities.version > 1) {
			this._gl.endQuery(typeToGL[queryProperties._target]);
		} else {
			capabilities.timerQuery.endQueryEXT(typeToGL[queryProperties._target]);
		}
	}

	counter(query) {
		const timerQuery = this._capabilities.timerQuery;

		const queryProperties = this._get(query);

		timerQuery.queryCounterEXT(queryProperties._webglQuery, timerQuery.TIMESTAMP_EXT);

		queryProperties._target = timerQuery.TIMESTAMP_EXT;
		queryProperties._result = null; // clear the last result.
	}

	isResultAvailable(query) {
		const gl = this._gl;
		const capabilities = this._capabilities;
		const timerQuery = capabilities.timerQuery;

		const queryProperties = this._get(query);

		let available;
		if (capabilities.version > 1) {
			available = gl.getQueryParameter(queryProperties._webglQuery, gl.QUERY_RESULT_AVAILABLE);
		} else {
			available = timerQuery.getQueryObjectEXT(queryProperties._webglQuery, timerQuery.QUERY_RESULT_AVAILABLE);
		}

		return available;
	}

	isTimerDisjoint() {
		return this._gl.getParameter(this._capabilities.timerQuery.GPU_DISJOINT_EXT);
	}

	getResult(query) {
		const gl = this._gl;
		const capabilities = this._capabilities;
		const timerQuery = capabilities.timerQuery;

		const queryProperties = this._get(query);

		if (queryProperties._result === null) {
			if (capabilities.version > 1) {
				queryProperties._result = gl.getQueryParameter(queryProperties._webglQuery, gl.QUERY_RESULT);
			} else {
				queryProperties._result = timerQuery.getQueryObjectEXT(queryProperties._webglQuery, timerQuery.QUERY_RESULT_EXT);
			}
		}

		return queryProperties._result;
	}

}

// deprecated since 0.5.0
WebGLRenderer.prototype.clear = function(color, depth, stencil) {
	const gl = this.context;

	let bits = 0;

	if (color === undefined || color) bits |= gl.COLOR_BUFFER_BIT;
	if (depth === undefined || depth) bits |= gl.DEPTH_BUFFER_BIT;
	if (stencil === undefined || stencil) bits |= gl.STENCIL_BUFFER_BIT;

	if (bits > 0) { // Prevent warning when bits is equal to zero
		gl.clear(bits);
	}
};

// deprecated since 0.5.0
WebGLRenderer.prototype.setClearColor = function(r, g, b, a, premultipliedAlpha) {
	this._state.colorBuffer.setClear(r, g, b, a, premultipliedAlpha);
};

// deprecated since 0.5.0
WebGLRenderer.prototype.getClearColor = function() {
	return this._state.colorBuffer.getClear();
};

// deprecated since 0.5.0
WebGLRenderer.prototype.setRenderTarget = function(renderTarget) {
	this._renderTargets.setRenderTarget(renderTarget);
};

// deprecated since 0.5.0
WebGLRenderer.prototype.getRenderTarget = function() {
	return this._state.currentRenderTarget;
};

// deprecated since 0.5.0
WebGLRenderer.prototype.setOcclusionQuerySet = function(querySet) {
	this._currentOcclusionQuerySet = querySet;
};

// deprecated since 0.5.0
WebGLRenderer.prototype.setTimestampWrites = function(querySet, beginIndex = 0, endIndex = 1) {
	this._currentTimestampWrites.querySet = querySet;
	this._currentTimestampWrites.beginningOfPassWriteIndex = beginIndex;
	this._currentTimestampWrites.endOfPassWriteIndex = endIndex;
};

// deprecated since 0.5.0
WebGLRenderer.prototype.updateRenderTargetMipmap = function(renderTarget) {
	if (renderTarget.texture) {
		this.generateMipmaps(renderTarget.texture);
	}
};

Object.defineProperties(OffscreenRenderTarget.prototype, {
	// deprecated since 0.5.0
	depth: {
		configurable: true,
		get: function() {
			console.warn('OffscreenRenderTarget: .depth property is deprecated.');
			return 1;
		}
	}
});

// deprecated since 0.5.0
export class RenderTarget2D extends OffscreenRenderTarget {

	constructor(width, height) {
		super(width, height);

		this.attach(new Texture2D(), ATTACHMENT.COLOR_ATTACHMENT0);
		this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
	}

}
RenderTarget2D.prototype.isRenderTarget2D = true;

// deprecated since 0.5.0
export class RenderTargetCube extends OffscreenRenderTarget {

	constructor(width, height) {
		super(width, height);

		this.attach(new TextureCube(), ATTACHMENT.COLOR_ATTACHMENT0);
		this.attach(new RenderBuffer(width, height, PIXEL_FORMAT.DEPTH_STENCIL), ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
	}

}
RenderTargetCube.prototype.isRenderTargetCube = true;

// deprecated since 0.5.0
export class RenderTarget3D extends OffscreenRenderTarget {

	constructor(width, height, depth) {
		super(width, height);

		const texture = new Texture3D();
		texture.resizeAsAttachment(width, height, depth);
		this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
	}

}
RenderTarget3D.prototype.isRenderTarget3D = true;

// deprecated since 0.5.0
export class RenderTarget2DArray extends OffscreenRenderTarget {

	constructor(width, height, depth) {
		super(width, height);

		const texture = new Texture2DArray();
		texture.resizeAsAttachment(width, height, depth);
		this.attach(texture, ATTACHMENT.COLOR_ATTACHMENT0);
	}

}
RenderTarget2DArray.prototype.isRenderTarget2DArray = true;

// deprecated since 0.5.0
ScreenRenderTarget.prototype.isRenderTargetBack = true;
export { ScreenRenderTarget as RenderTargetBack };