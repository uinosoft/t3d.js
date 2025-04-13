import { Loader } from './Loader.js';

/**
 * A loader for loading images. The class loads images with the HTML `Image` API.
 * Please note that 'ImageLoader' not support progress events.
 * ```js
 * const loader = new ImageLoader();
 * const image = await loader.loadAsync('image.png');
 * ```
 * @extends Loader
 */
class ImageLoader extends Loader {

	/**
	 * Constructs a new image loader.
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor(manager) {
		super(manager);
	}

	/**
	 * Starts loading from the given URL and passes the loaded image
	 * to the `onLoad()` callback. The method also returns a new `Image` object which can
	 * directly be used for texture creation. If you do it this way, the texture
	 * may pop up in your scene once the respective loading process is finished.
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {Function} [onLoad] - Executed when the loading process has been finished. The argument is an `HTMLImageElement`.
	 * @param {onProgressCallback} [onProgress] - Unsupported in this loader.
	 * @param {onErrorCallback} [onError] - Executed when errors occur.
	 * @returns {HTMLImageElement} The image.
	 */
	load(url, onLoad, onProgress, onError) {
		if (url === undefined) url = '';
		if (this.path !== undefined) url = this.path + url;

		url = this.manager.resolveURL(url);

		const scope = this;

		const image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');

		function onImageLoad() {
			removeEventListeners();

			if (onLoad) onLoad(this);

			scope.manager.itemEnd(url);
		}

		function onImageError(event) {
			removeEventListeners();

			if (onError) onError(event);

			scope.manager.itemError(url);
			scope.manager.itemEnd(url);
		}

		function removeEventListeners() {
			image.removeEventListener('load', onImageLoad, false);
			image.removeEventListener('error', onImageError, false);
		}

		image.addEventListener('load', onImageLoad, false);
		image.addEventListener('error', onImageError, false);

		if (url.slice(0, 5) !== 'data:') {
			if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin;
		}

		scope.manager.itemStart(url);

		image.src = url;

		return image;
	}

}

export { ImageLoader };