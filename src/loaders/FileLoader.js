import { Loader } from './Loader.js';

/**
 * A low level class for loading resources with Fetch, used internaly by most loaders.
 * It can also be used directly to load any file type that does not have a loader.
 * @memberof t3d
 * @extends t3d.Loader
 */
class FileLoader extends Loader {

	constructor(manager) {
		super(manager);

		/**
		 * The expected response type. See {@link t3d.FileLoader.setResponseType}.
		 * @type {String}
		 * @default undefined
		 */
		this.responseType = undefined;

		/**
		 * The expected mimeType. See {@link t3d.FileLoader.setMimeType}.
		 * @type {String}
		 * @default undefined
		 */
		this.mimeType = undefined;
	}

	/**
	 * Load the URL and pass the response to the onLoad function.
	 * @param {String} url — the path or URL to the file. This can also be a Data URI.
	 * @param {Function} [onLoad=] — Will be called when loading completes. The argument will be the loaded response.
	 * @param {Function} [onProgress=] — Will be called while load progresses. The argument will be the XMLHttpRequest instance, which contains .total and .loaded bytes.
	 * @param {Function} [onError=] — Will be called if an error occurs.
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
						console.warn('t3d.FileLoader: HTTP Status 0 received.');
					}

					// Workaround: Checking if response.body === undefined for Alipay browser #23548

					if (typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined) {
						return response;
					}

					const reader = response.body.getReader();
					const contentLength = response.headers.get('Content-Length');
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

										if (onProgress !== undefined) {
											onProgress(new ProgressEvent('progress', { lengthComputable, loaded, total }));
										}

										controller.enqueue(value);
										readData();
									}
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
						if (mimeType === undefined) {
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
	 * Change the response type. Valid values are:
	 * text or empty string (default) - returns the data as string.
	 * arraybuffer - loads the data into a ArrayBuffer and returns that.
	 * blob - returns the data as a Blob.
	 * document - parses the file using the DOMParser.
	 * json - parses the file using JSON.parse.
	 * @param {String} value
	 * @return {t3d.FileLoader}
	 */
	setResponseType(value) {
		this.responseType = value;
		return this;
	}

	/**
	 * Set the expected mimeType of the file being loaded.
	 * Note that in many cases this will be determined automatically, so by default it is undefined.
	 * @param {String} value
	 * @return {t3d.FileLoader}
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