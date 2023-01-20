import { Loader } from './Loader.js';

/**
 * A loader for loading an Image.
 * @memberof t3d
 * @extends t3d.Loader
 */
class ImageLoader extends Loader {

	constructor(manager) {
		super(manager);
	}

	/**
	 * Begin loading from url and return the image object that will contain the data.
	 * @param {String} url — the path or URL to the file. This can also be a Data URI.
	 * @param {Function} [onLoad=] — Will be called when loading completes. The argument will be the loaded response.
	 * @param {Function} [onProgress=] — Will be called while load progresses. The argument will be the XMLHttpRequest instance, which contains .total and .loaded bytes.
	 * @param {Function} [onError=] — Will be called if an error occurs.
	 * @return {HTMLImageElement}
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