import { EventDispatcher } from '../EventDispatcher.js';

let _queryId = 0;

/**
 * A Query object provides single unified API for using WebGL asynchronus queries,
 * which include query objects ('Occlusion' and 'Transform Feedback') and timer queries.
 * @memberof t3d
 * @extends t3d.EventDispatcher
 */
class Query extends EventDispatcher {

	constructor() {
		super();
		this.id = _queryId++;
	}

	/**
     * Disposes the Query object.
	 * Rejects any pending query.
     */
	dispose() {
		this.dispatchEvent({ type: 'dispose' });
	}

}

export { Query };