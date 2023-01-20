import { DefaultLoadingManager, FileLoader, ImageLoader } from 't3d';

import { ImageBitmapLoader } from "../ImageBitmapLoader.js";
import { IndexParser } from "./parsers/IndexParser.js";
import { ReferenceParser } from "./parsers/ReferenceParser.js";
import { Validator } from "./parsers/Validator.js";
import { BufferParser } from "./parsers/BufferParser.js";
import { BufferViewParser } from "./parsers/BufferViewParser.js";
import { ImageParser } from "./parsers/ImageParser.js";
import { TextureParser } from "./parsers/TextureParser.js";
import { MaterialParser } from "./parsers/MaterialParser.js";
import { AccessorParser } from "./parsers/AccessorParser.js";
import { PrimitiveParser } from "./parsers/PrimitiveParser.js";
import { NodeParser } from "./parsers/NodeParser.js";
import { SkinParser } from "./parsers/SkinParser.js";
import { SceneParser } from "./parsers/SceneParser.js";
import { AnimationParser } from "./parsers/AnimationParser.js";

import { GLTFResource } from "./GLTFResource.js";
import { GLTFUtils } from "./GLTFUtils.js";

const DefaultParsePipeline = [
	IndexParser,
	ReferenceParser,
	Validator,
	BufferParser,
	BufferViewParser,
	ImageParser,
	TextureParser,
	MaterialParser,
	AccessorParser,
	PrimitiveParser,
	NodeParser,
	SkinParser,
	SceneParser,
	AnimationParser
];

export class GLTFLoader {

	constructor(manager = DefaultLoadingManager, parsers = DefaultParsePipeline) {
		this.manager = manager;

		// If ture, loading manager will dispatch progress for every buffer and image.
		// otherwise, loading manager will only dispatch progress for the whole gltf resource.
		this.detailLoadProgress = true;

		// If set false, need add Promise.catch to catch errors.
		this.autoLogError = true;

		this._parsers = parsers.slice(0);

		this._dracoLoader = null;

		this._fileLoader = new FileLoader();

		const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) === true;
		const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
		const firefoxVersion = isFirefox ? navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1;

		if (typeof createImageBitmap === 'undefined' || isSafari || (isFirefox && firefoxVersion < 98)) {
			this._imageLoader = new ImageLoader();
		} else {
			this._imageLoader = new ImageBitmapLoader();
		}
	}

	load(url, options = {}) {
		this.manager.itemStart(url);

		return new Promise((resolve, reject) => {
			const resource = new GLTFResource();
			resource.url = url;
			resource.path = GLTFUtils.extractUrlBase(url);
			resource.options = options;

			this._parse(resource)
				.then(resolve)
				.then(() => this.manager.itemEnd(url))
				.catch(e => {
					if (this.autoLogError) {
						console.error(e);
					}

					if (this.detailLoadProgress && resource.loadItems) {
						resource.loadItems.forEach(item => {
							this.manager.itemEnd(item);
						})
					}

					this.manager.itemError(url);
					this.manager.itemEnd(url);

					reject(`Error loading glTF model from ${url} .`);
				})
		})
	}

	_parse(context) {
		let lastParser;
		return new Promise((resolve, reject) => {
			this._parsers.forEach(parser => {
				if (lastParser) {
					lastParser = lastParser.then(() => parser.parse(context, this));
				} else {
					lastParser = parser.parse(context, this);
				}
			});

			if (lastParser) {
				lastParser.then(() => resolve(context)).catch(reject);
			} else {
				resolve(context);
			}
		})
	}

	setDRACOLoader(dracoLoader) {
		this._dracoLoader = dracoLoader;
		return this;
	}

	getDRACOLoader() {
		return this._dracoLoader;
	}

	loadFile(url, type = 'json') {
		this._fileLoader.setResponseType(type);

		return new Promise((resolve, reject) => {
			url = this.manager.resolveURL(url);
			this._fileLoader.load(url, resolve, undefined, reject);
		});
	}

	loadImage(url) {
		return new Promise((resolve, reject) => {
			url = this.manager.resolveURL(url);
			this._imageLoader.load(url, resolve, undefined, reject);
		});
	}

	insertParser(parser, index) {
		this._parsers.splice(index, 0, parser);
	}

	replaceParser(parser, index) {
		this._parsers.splice(index, 1, parser);
	}

}