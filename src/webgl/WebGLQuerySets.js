import { QUERYSET_TYPE } from '../const.js';
import { PropertyMap } from '../render/PropertyMap.js';

class WebGLQuerySets extends PropertyMap {

	constructor(prefix, gl, capabilities) {
		super(prefix);

		this._gl = gl;
		this._capabilities = capabilities;

		const timerQuery = capabilities.timerQuery;
		const that = this;

		function onQuerySetDispose(event) {
			const querySet = event.target;
			const querySetProperties = that.get(querySet);

			querySet.removeEventListener('dispose', onQuerySetDispose);

			if (querySetProperties._queriesGL) {
				const queriesGL = querySetProperties._queriesGL;
				queriesGL.forEach(queryGL => {
					if (queryGL) {
						if (capabilities.version > 1) {
							gl.deleteQuery(queryGL);
						} else {
							timerQuery.deleteQueryEXT(queryGL);
						}
					}
				});
			}

			querySetProperties._isDisposed = true;

			that.delete(querySet);
		}

		this._onQuerySetDispose = onQuerySetDispose;

		this._checkResultAvailable = capabilities.version > 1
			? queryGL => gl.getQueryParameter(queryGL, gl.QUERY_RESULT_AVAILABLE)
			: queryGL => timerQuery.getQueryObjectEXT(queryGL, timerQuery.QUERY_RESULT_AVAILABLE_EXT);

		this._getQueryResult = capabilities.version > 1
			? queryGL => gl.getQueryParameter(queryGL, gl.QUERY_RESULT)
			: queryGL => timerQuery.getQueryObjectEXT(queryGL, timerQuery.QUERY_RESULT_EXT);
	}

	setQuerySet(querySet) {
		const querySetProperties = this.get(querySet);

		if (querySetProperties._queriesGL === undefined) {
			querySet.addEventListener('dispose', this._onQuerySetDispose);

			querySetProperties._queriesGL = new Array(querySet.count).fill(null);
			querySetProperties._valueCache = new Array(querySet.count).fill(0);
			querySetProperties._valueCacheValid = new Array(querySet.count).fill(true);

			const gl = this._gl;
			const capabilities = this._capabilities;

			if (querySet.type === QUERYSET_TYPE.OCCLUSION) {
				querySetProperties._targetGL = querySet.conservative
					? gl.ANY_SAMPLES_PASSED_CONSERVATIVE
					: gl.ANY_SAMPLES_PASSED;
			} else {
				// If timestamp is supported, this variable will not be used,
				// so it is okay to set it to TIME_ELAPSED_EXT here.
				querySetProperties._targetGL = capabilities.timerQuery.TIME_ELAPSED_EXT;
			}

			querySetProperties._activeIndex = -1;
			querySetProperties._reading = false;
		}
	}

	beginQuery(querySet, index) {
		const gl = this._gl;

		const querySetProperties = this.get(querySet);

		if (querySetProperties._reading) {
			return;
		}

		const queryGL = this._getQueryGLByIndex(querySetProperties._queriesGL, index);

		if (this._capabilities.version > 1) {
			gl.beginQuery(querySetProperties._targetGL, queryGL);
		} else {
			this._capabilities.timerQuery.beginQueryEXT(querySetProperties._targetGL, queryGL);
		}

		querySetProperties._activeIndex = index;
	}

	endQuery(querySet) {
		const querySetProperties = this.get(querySet);

		if (querySetProperties._reading || querySetProperties._activeIndex < 0) {
			return;
		}

		if (this._capabilities.version > 1) {
			this._gl.endQuery(querySetProperties._targetGL);
		} else {
			this._capabilities.timerQuery.endQueryEXT(querySetProperties._targetGL);
		}

		querySetProperties._valueCacheValid[querySetProperties._activeIndex] = false;
		querySetProperties._activeIndex = -1;
	}

	queryCounter(querySet, index) {
		const capabilities = this._capabilities;
		const timerQuery = capabilities.timerQuery;

		const querySetProperties = this.get(querySet);

		if (querySetProperties._reading) {
			return;
		}

		const queryGL = this._getQueryGLByIndex(querySetProperties._queriesGL, index);
		timerQuery.queryCounterEXT(queryGL, timerQuery.TIMESTAMP_EXT);

		querySetProperties._valueCacheValid[index] = false;
	}

	readQuerySetResults(querySet, dstBuffer, firstQuery, queryCount) {
		const querySetProperties = this.get(querySet);

		querySetProperties._reading = true;

		return new Promise((resolve, reject) => {
			const checkQueries = () => {
				if (querySetProperties._isDisposed) {
					reject(new Error('QuerySet has been disposed'));
					return;
				}

				let completed = true;

				try {
					for (let i = firstQuery; i < queryCount; i++) {
						const queryGL = querySetProperties._queriesGL[i];
						const valueCacheValid = querySetProperties._valueCacheValid[i];
						if (!valueCacheValid) {
							if (this._checkResultAvailable(queryGL)) {
								const result = this._getQueryResult(queryGL);
								querySetProperties._valueCache[i] = result;
								querySetProperties._valueCacheValid[i] = true;
							} else {
								completed = false;
								break;
							}
						}
					}
				} catch (e) {
					for (let i = firstQuery; i < queryCount; i++) {
						querySetProperties._valueCacheValid[i] = true;
					}
					querySetProperties._reading = false;
					reject(e);
					return;
				}

				if (completed) {
					for (let i = firstQuery; i < queryCount; i++) {
						dstBuffer[i - firstQuery] = querySetProperties._valueCache[i];
					}

					querySetProperties._reading = false;
					resolve(dstBuffer);
				} else {
					requestAnimationFrame(checkQueries);
				}
			};

			checkQueries();
		});
	}

	_getQueryGLByIndex(queriesGL, index) {
		let queryGL = queriesGL[index];
		if (!queryGL) {
			const gl = this._gl;
			const capabilities = this._capabilities;

			queryGL = capabilities.version > 1
				? gl.createQuery()
				: capabilities.timerQuery.createQueryEXT();
			queriesGL[index] = queryGL;
		}
		return queryGL;
	}

}

export { WebGLQuerySets };