/**
 * Handles and keeps track of loaded and pending data. A default global instance of this class is created and used by loaders if not supplied manually - see {@link t3d.DefaultLoadingManager}.
 * In general that should be sufficient, however there are times when it can be useful to have seperate loaders - for example if you want to show seperate loading bars for objects and textures.
 * In addition to observing progress, a LoadingManager can be used to override resource URLs during loading. This may be helpful for assets coming from drag-and-drop events, WebSockets, WebRTC, or other APIs.
 * @memberof t3d
 */
class LoadingManager {

	/**
	 * Creates a new LoadingManager.
	 * @param {Function} [onLoad] — this function will be called when all loaders are done.
	 * @param {Function} [onProgress] — this function will be called when an item is complete.
	 * @param {Function} [onError] — this function will be called a loader encounters errors.
	 */
	constructor(onLoad, onProgress, onError) {
		this.isLoading = false;
		this.itemsLoaded = 0;
		this.itemsTotal = 0;
		this.urlModifier = undefined;

		/**
		 * This function will be called when loading starts.
		 * The arguments are:
		 * url — The url of the item just loaded.
		 * itemsLoaded — the number of items already loaded so far.
		 * itemsTotal — the total amount of items to be loaded.
		 * @type {Function}
		 * @default undefined
		 */
		this.onStart = undefined;

		this.onLoad = onLoad;
		this.onProgress = onProgress;
		this.onError = onError;
	}

	/**
	 * This should be called by any loader using the manager when the loader starts loading an url.
	 * @param {String} url - the url to load.
	 */
	itemStart(url) {
		this.itemsTotal++;

		if (this.isLoading === false) {
			if (this.onStart !== undefined) {
				this.onStart(url, this.itemsLoaded, this.itemsTotal);
			}
		}

		this.isLoading = true;
	}

	/**
	 * This should be called by any loader using the manager when the loader ended loading an url.
	 * @param {String} url - the loaded url.
	 */
	itemEnd(url) {
		this.itemsLoaded++;

		if (this.onProgress !== undefined) {
			this.onProgress(url, this.itemsLoaded, this.itemsTotal);
		}

		if (this.itemsLoaded === this.itemsTotal) {
			this.isLoading = false;

			if (this.onLoad !== undefined) {
				this.onLoad();
			}
		}
	}

	/**
	 * This should be called by any loader using the manager when the loader errors loading an url.
	 * @param {String} url - the loaded url.
	 */
	itemError(url) {
		if (this.onError !== undefined) {
			this.onError(url);
		}
	}

	/**
	 * Given a URL, uses the URL modifier callback (if any) and returns a resolved URL.
	 * If no URL modifier is set, returns the original URL.
	 * @param {String} url - the url to load.
	 */
	resolveURL(url) {
		if (this.urlModifier) {
			return this.urlModifier(url);
		}

		return url;
	}

	/**
	 * If provided, the callback will be passed each resource URL before a request is sent.
	 * The callback may return the original URL, or a new URL to override loading behavior.
	 * This behavior can be used to load assets from .ZIP files, drag-and-drop APIs, and Data URIs.
	 * @param {Function} callback - URL modifier callback. Called with url argument, and must return resolvedURL.
	 */
	setURLModifier(callback) {
		this.urlModifier = callback;
		return this;
	}

}

/**
 * A global instance of the {@link t3d.LoadingManager}, used by most loaders when no custom manager has been specified.
 * This will be sufficient for most purposes, however there may be times when you desire separate loading managers for say, textures and models.
 * @memberof t3d
 */
const DefaultLoadingManager = new LoadingManager();

export { DefaultLoadingManager, LoadingManager };