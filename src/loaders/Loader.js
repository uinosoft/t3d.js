import { DefaultLoadingManager } from './LoadingManager.js';

/**
 * Base class for implementing loaders.
 * @memberof t3d
 */
class Loader {

	/**
     * Creates a new Loader.
     * @param {t3d.LoadingManager} [manager=t3d.DefaultLoadingManager] - The loadingManager the loader is using.
     */
	constructor(manager) {
		/**
         * The loadingManager the loader is using.
         * @type {t3d.LoadingManager}
         * @default t3d.DefaultLoadingManager
         */
		this.manager = (manager !== undefined) ? manager : DefaultLoadingManager;

		/**
         * The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS.
         * @type {String}
         * @default 'anonymous'
         */
		this.crossOrigin = 'anonymous';

		/**
         * Whether the XMLHttpRequest uses credentials.
         * @type {Boolean}
         * @default false
         */
		this.withCredentials = false;

		/**
         * The base path from which the asset will be loaded.
         * @type {String}
         * @default ''
         */
		this.path = '';

		/**
         * The request header used in HTTP request.
         * @type {Object}
         * @default {}
         */
		this.requestHeader = {};
	}

	/**
     * This method needs to be implement by all concrete loaders.
     * It holds the logic for loading the asset from the backend.
     */
	load(/* url, onLoad, onProgress, onError */) {}

	/**
     * This method is equivalent to .load, but returns a Promise.
     * onLoad is handled by Promise.resolve and onError is handled by Promise.reject.
     * @param {String} url - A string containing the path/URL of the file to be loaded.
     * @param {Function} [onProgress] - A function to be called while the loading is in progress.
     * The argument will be the ProgressEvent instance, which contains .lengthComputable, .total and .loaded.
     * If the server does not set the Content-Length header; .total will be 0.
     * @return {Promise}
     */
	loadAsync(url, onProgress) {
		const scope = this;
		return new Promise(function(resolve, reject) {
			scope.load(url, resolve, onProgress, reject);
		});
	}

	/**
     * @param {String} crossOrigin - The crossOrigin string to implement CORS for loading the url from a different domain that allows CORS.
     * @return {this}
     */
	setCrossOrigin(crossOrigin) {
		this.crossOrigin = crossOrigin;
		return this;
	}

	/**
     * @param {Boolean} value - Whether the XMLHttpRequest uses credentials such as cookies, authorization headers or TLS client certificates.
     * Note that this has no effect if you are loading files locally or from the same domain.
     * @return {this}
     */
	setWithCredentials(value) {
		this.withCredentials = value;
		return this;
	}

	/**
     * @param {String} path - Set the base path for the asset.
     * @return {this}
     */
	setPath(path) {
		this.path = path;
		return this;
	}

	/**
     * @param {Object} requestHeader - key: The name of the header whose value is to be set. value: The value to set as the body of the header.
     * @return {this}
     */
	setRequestHeader(requestHeader) {
		this.requestHeader = requestHeader;
		return this;
	}

}

export { Loader };