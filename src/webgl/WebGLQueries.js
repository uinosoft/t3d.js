import { QUERY_TYPE } from '../const.js';

class WebGLQueries {

	constructor(gl, capabilities) {
		this._gl = gl;
		this._capabilities = capabilities;

		const timerQuery = capabilities.timerQuery;

		this._map = new WeakMap();

		const onQueryDispose = (event) => {
			const query = event.target;

			const queryProperties = this._map.get(query);

			query.removeEventListener('dispose', onQueryDispose);

			if (queryProperties._webglQuery) {
				if (capabilities.version > 1) {
					gl.deleteQuery(queryProperties._webglQuery);
				} else {
					timerQuery.deleteQueryEXT(queryProperties._webglQuery);
				}
			}

			this._map.delete(query);
		}

		this._onQueryDispose = onQueryDispose;

		this._typeToGL = {
			[QUERY_TYPE.ANY_SAMPLES_PASSED]: 0x8C2F,
			[QUERY_TYPE.ANY_SAMPLES_PASSED_CONSERVATIVE]: 0x8D6A,
			[QUERY_TYPE.TIME_ELAPSED]: 0x88BF
		}
	}

	get(query) {
		const capabilities = this._capabilities;
		const map = this._map;

		let queryProperties = map.get(query);

		if (queryProperties === undefined) {
			queryProperties = {};
			query.addEventListener('dispose', this._onQueryDispose);

			queryProperties._webglQuery = capabilities.version > 1 ? this._gl.createQuery() : capabilities.timerQuery.createQueryEXT();
			queryProperties._target = null;
			queryProperties._result = null;

			map.set(query, queryProperties);
		}

		return queryProperties;
	}

	clear() {
		this._map = new WeakMap();
	}

	begin(query, target) {
		const capabilities = this._capabilities;
		const typeToGL = this._typeToGL;

		const queryProperties = this.get(query);

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

		const queryProperties = this.get(query);

		if (capabilities.version > 1) {
			this._gl.endQuery(typeToGL[queryProperties._target]);
		} else {
			capabilities.timerQuery.endQueryEXT(typeToGL[queryProperties._target]);
		}
	}

	counter(query) {
		const timerQuery = this._capabilities.timerQuery;

		const queryProperties = this.get(query);

		timerQuery.queryCounterEXT(queryProperties._webglQuery, timerQuery.TIMESTAMP_EXT);

		queryProperties._target = timerQuery.TIMESTAMP_EXT;
		queryProperties._result = null; // clear the last result.
	}

	isResultAvailable(query) {
		const gl = this._gl;
		const capabilities = this._capabilities;
		const timerQuery = capabilities.timerQuery;

		const queryProperties = this.get(query);

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

		const queryProperties = this.get(query);

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

export { WebGLQueries };