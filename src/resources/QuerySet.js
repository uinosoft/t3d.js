import { EventDispatcher } from '../EventDispatcher.js';

let _querySetId = 0;

/**
 * A QuerySet holds a set of queries of a particular type.
 * @extends EventDispatcher
 */
class QuerySet extends EventDispatcher {

	/**
	 * Creates a new QuerySet.
	 * @param {QUERYSET_TYPE} type - The type of the query set.
	 * @param {number} count - The number of queries in the set.
	 */
	constructor(type, count) {
		super();

		/**
		 * Unique number for this query set instance.
		 * @readonly
		 * @type {number}
		 */
		this.id = _querySetId++;

		/**
		 * The name of the query set.
		 * @type {string}
		 * @default ""
		 */
		this.name = '';

		/**
		 * The type of the query set.
		 * @readonly
		 * @type {QUERYSET_TYPE}
		 */
		this.type = type;

		/**
		 * The max number of queries in the set.
		 * @readonly
		 * @type {number}
		 */
		this.count = count;

		/**
		 * Indicates whether the query set operates in conservative mode.
		 * This property only applies to occlusion query sets in WebGL renderer.
		 * @type {boolean}
		 * @default true
		 */
		this.conservative = true;
	}

	/**
	 * Dispose this query set.
	 */
	dispose() {
		this.dispatchEvent({ type: 'dispose' });
	}

}

export { QuerySet };