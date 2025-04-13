/**
 * Handles and keeps track of loaded and pending data. A default global
 * instance of this class is created and used by loaders if not supplied
 * manually.
 * In general that should be sufficient, however there are times when it can
 * be useful to have separate loaders - for example if you want to show
 * separate loading bars for objects and textures.
 * ```js
 * const manager = new LoadingManager(
 *   () => console.log('All items loaded!'),
 *   (url, itemsLoaded, itemsTotal) => {
 *     console.log(`Loaded ${itemsLoaded} of ${itemsTotal} items`);
 *   },
 *   url => console.error(`Error loading ${url}`)
 * );
 * ```
 */
class LoadingManager {

	/**
	 * Constructs a new loading manager.
	 * @param {Function} [onLoad] - Executes when all items have been loaded.
	 * @param {Function} [onProgress] - Executes when single items have been loaded.
	 * @param {Function} [onError] - Executes when an error occurs.
	 */
	constructor(onLoad, onProgress, onError) {
		this.isLoading = false;
		this.itemsLoaded = 0;
		this.itemsTotal = 0;
		this.urlModifier = undefined;

		/**
		 * Executes when an item starts loading.
		 * @type {Function|undefined}
		 * @default undefined
		 */
		this.onStart = undefined;

		/**
		 * Executes when all items have been loaded.
		 * @type {Function|undefined}
		 * @default undefined
		 */
		this.onLoad = onLoad;

		/**
		 * Executes when single items have been loaded.
		 * @type {Function|undefined}
		 * @default undefined
		 */
		this.onProgress = onProgress;

		/**
		 * Executes when an error occurs.
		 * @type {Function|undefined}
		 * @default undefined
		 */
		this.onError = onError;
	}

	/**
	 * This should be called by any loader using the manager when the loader
	 * starts loading an item.
	 * @param {string} url - The URL to load.
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
	 * This should be called by any loader using the manager when the loader
	 * ended loading an item.
	 * @param {string} url - The URL of the loaded item.
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
	 * This should be called by any loader using the manager when the loader
	 * encounters an error when loading an item.
	 * @param {string} url - The URL of the item that produces an error.
	 */
	itemError(url) {
		if (this.onError !== undefined) {
			this.onError(url);
		}
	}

	/**
	 * Given a URL, uses the URL modifier callback (if any) and returns a
	 * resolved URL. If no URL modifier is set, returns the original URL.
	 * @param {string} url - The URL to load.
	 * @returns {string} The resolved URL.
	 */
	resolveURL(url) {
		if (this.urlModifier) {
			return this.urlModifier(url);
		}

		return url;
	}

	/**
	 * If provided, the callback will be passed each resource URL before a
	 * request is sent. The callback may return the original URL, or a new URL to
	 * override loading behavior. This behavior can be used to load assets from
	 * .ZIP files, drag-and-drop APIs, and Data URIs.
	 * @param {Function} transform - URL modifier callback. Called with an URL and must return a resolved URL.
	 * @returns {LoadingManager} A reference to this loading manager.
	 * @example
	 * const blobs = { 'fish.gltf': blob1, 'diffuse.png': blob2, 'normal.png': blob3 };
	 *
	 * const manager = new LoadingManager();
	 *
	 * // Initialize loading manager with URL callback.
	 * const objectURLs = [];
	 * manager.setURLModifier(url => {
	 * 	 url = URL.createObjectURL(blobs[url]);
	 * 	 objectURLs.push(url);
	 * 	 return url;
	 * });
	 *
	 * // Load as usual, then revoke the blob URLs.
	 * const loader = new GLTFLoader(manager);
	 * loader.load('fish.gltf', gltf => {
	 * 	 scene.add(gltf.scene);
	 * 	 objectURLs.forEach(url => URL.revokeObjectURL(url));
	 * });
	 */
	setURLModifier(transform) {
		this.urlModifier = transform;
		return this;
	}

}

/**
 * The global default loading manager.
 * @type {LoadingManager}
 */
const DefaultLoadingManager = new LoadingManager();

export { DefaultLoadingManager, LoadingManager };