import { Loader } from './Loader.js';

/**
 * A low level class for loading resources with the Fetch API, used internally by
 * most loaders. It can also be used directly to load any file type that does
 * not have a loader.
 * ```js
 * const loader = new FileLoader();
 * const data = await loader.loadAsync('example.txt');
 * ```
 * @extends Loader
 */
class FileLoader extends Loader {

	/**
	 * Constructs a new file loader.
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor(manager) {
		super(manager);

		/**
		 * The expected response type. See {@link FileLoader.setResponseType}.
		 * @type {'arraybuffer'|'blob'|'document'|'json'|''}
		 * @default ''
		 */
		this.responseType = '';

		/**
		 * The expected mimeType. See {@link FileLoader.setMimeType}.
		 * @type {string}
		 * @default ''
		 */
		this.mimeType = '';
	}

	/**
	 * Starts loading from the given URL and pass the loaded response to the `onLoad()` callback.
	 * @param {string} url — The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {Function} [onLoad] — Executed when the loading process has been finished. The argument is the loaded data.
	 * @param {onProgressCallback} [onProgress] — Executed while the loading is in progress.
	 * @param {onErrorCallback} [onError] — Executed when errors occur.
	 */
	load(url, onLoad, onProgress, onError) {
		if (url === undefined) url = '';
		if (this.path != undefined) url = this.path + url;

		url = this.manager.resolveURL(url);

		// create request
		const req = new Request(url, {
			headers: new Headers(this.requestHeader),
			credentials: this.withCredentials ? 'include' : 'same-origin'
			// An abort controller could be added within a future PR
		});

		// record states ( avoid data race )
		const mimeType = this.mimeType;
		const responseType = this.responseType;

		// start the fetch
		fetch(req)
			.then(response => {
				if (response.status === 200 || response.status === 0) {
					// Some browsers return HTTP Status 0 when using non-http protocol
					// e.g. 'file://' or 'data://'. Handle as success.

					if (response.status === 0) {
						console.warn('FileLoader: HTTP Status 0 received.');
					}

					// Workaround: Checking if response.body === undefined for Alipay browser #23548

					if (typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined) {
						return response;
					}

					const reader = response.body.getReader();

					// Nginx needs X-File-Size check
					// https://serverfault.com/questions/482875/why-does-nginx-remove-content-length-header-for-chunked-content
					const contentLength = response.headers.get('X-File-Size') || response.headers.get('Content-Length');
					const total = contentLength ? parseInt(contentLength) : 0;
					const lengthComputable = total !== 0;
					let loaded = 0;

					// periodically read data into the new stream tracking while download progress
					const stream = new ReadableStream({
						start(controller) {
							readData();

							function readData() {
								reader.read().then(({ done, value }) => {
									if (done) {
										controller.close();
									} else {
										loaded += value.byteLength;

										const event = new ProgressEvent('progress', { lengthComputable, loaded, total });
										if (onProgress) onProgress(event);

										controller.enqueue(value);
										readData();
									}
								}, error => {
									controller.error(error);
								});
							}
						}

					});

					return new Response(stream);
				} else {
					throw new HttpError(`fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`, response);
				}
			})
			.then(response => {
				switch (responseType) {
					case 'arraybuffer':
						return response.arrayBuffer();
					case 'blob':
						return response.blob();
					case 'document':
						return response.text()
							.then(text => {
								const parser = new DOMParser();
								return parser.parseFromString(text, mimeType);
							});
					case 'json':
						return response.json();
					default:
						if (mimeType === '') {
							return response.text();
						} else {
							// sniff encoding
							const re = /charset="?([^;"\s]*)"?/i;
							const exec = re.exec(mimeType);
							const label = exec && exec[1] ? exec[1].toLowerCase() : undefined;
							const decoder = new TextDecoder(label);
							return response.arrayBuffer().then(ab => decoder.decode(ab));
						}
				}
			})
			.then(data => {
				if (onLoad) onLoad(data);
			})
			.catch(err => {
				onError && onError(err);

				this.manager.itemError(url);
			})
			.finally(() => {
				this.manager.itemEnd(url);
			});

		this.manager.itemStart(url);
	}

	/**
	 * Sets the expected response type.
	 * @param {'arraybuffer'|'blob'|'document'|'json'|''} value - The response type.
	 * @returns {FileLoader} A reference to this file loader.
	 */
	setResponseType(value) {
		this.responseType = value;
		return this;
	}

	/**
	 * Sets the expected mime type of the loaded file.
	 * @param {string} value - The mime type.
	 * @returns {FileLoader} A reference to this file loader.
	 */
	setMimeType(value) {
		this.mimeType = value;
		return this;
	}

}

class HttpError extends Error {

	constructor(message, response) {
		super(message);
		this.response = response;
	}

}

export { FileLoader };