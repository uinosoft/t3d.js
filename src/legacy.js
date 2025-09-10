import { WebGLRenderer } from './webgl/WebGLRenderer.js';
import { BoxGeometry } from './resources/geometries/BoxGeometry.js';
import { Object3D } from './scenes/Object3D.js';
import { Scene } from './scenes/Scene.js';
import { MathUtils } from './math/MathUtils.js';
import { RenderStates } from './render/RenderStates.js';
import { Matrix4 } from './math/Matrix4.js';
import { Matrix3 } from './math/Matrix3.js';
import { Vector3 } from './math/Vector3.js';
import { EventDispatcher } from './EventDispatcher.js';
import { PropertyMap } from './render/PropertyMap.js';

// deprecated since 0.1.2, add warning since 0.3.0
export class CubeGeometry extends BoxGeometry {

	constructor(width, height, depth, widthSegments, heightSegments, depthSegments) {
		super(width, height, depth, widthSegments, heightSegments, depthSegments);
		console.warn('CubeGeometry has been deprecated, use BoxGeometry instead.');
	}

}

// deprecated since 0.1.2, add warning since 0.3.0
export class Group extends Object3D {

	constructor() {
		super();
		console.warn('Group has been deprecated, use Object3D instead.');
	}

}

Group.prototype.isGroup = true;

Object.defineProperties(WebGLRenderer.prototype, {
	// deprecated since 0.2.0, add warning since 0.3.0
	gl: {
		configurable: true,
		get: function() {
			console.warn('WebGLRenderer: .gl has been deprecated, use .context instead.');
			return this.context;
		}
	},
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

// deprecated since 0.1.6, add warning since 0.3.0
WebGLRenderer.prototype.render = function(renderable, renderStates, options) {
	console.warn('WebGLRenderer: .render() has been renamed to .renderRenderableItem().');
	this.renderRenderableItem(renderable, renderStates, options);
};

// deprecated since 0.4.5, use readTexturePixels instead
WebGLRenderer.prototype.readRenderTargetPixels = function(x, y, width, height, buffer) {
	const state = this._state;
	const renderTarget = state.currentRenderTarget;

	const zIndex = renderTarget.activeCubeFace || renderTarget.activeLayer || 0;
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

// Renderer, as an alias of WebGLRenderer, will exist for a long time.
// When the compatibility of renderPass is removed, it can be moved to main.js
export class Renderer extends WebGLRenderer {

	// deprecated since 0.2.0, add warning since 0.3.0
	get renderPass() {
		console.warn('Renderer: .renderPass has been deprecated, use WebGLRenderer instead.');
		return this;
	}

}

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
			// console.warn('Scene: ._sceneData has been deprecated since v0.4.4, use .collector.sceneData instead.');
			return this.collector.sceneData;
		}
	},
	// deprecated since 0.4.4
	_lightingData: {
		configurable: true,
		get: function() {
			// console.warn('Scene: ._lightingData has been deprecated since v0.4.4, use .collector.lightingData instead.');
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