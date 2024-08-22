import { Loader, FileLoader, TextureCube, ImageLoader, PIXEL_TYPE, PIXEL_FORMAT } from 't3d';
import { ImageBitmapLoader } from './ImageBitmapLoader.js';
import { RGBDDecoder } from '../textures/RGBDDecoder.js';

class EnvLoader extends Loader {

	constructor(manager) {
		super(manager);

		this._fileLoader = new FileLoader(manager);

		const userAgent = navigator.userAgent;

		const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) === true;
		const safariMatch = userAgent.match(/Version\/(\d+)/);
		const safariVersion = isSafari && safariMatch ? parseInt(safariMatch[1], 10) : -1;

		const isFirefox = userAgent.indexOf('Firefox') > -1;
		const firefoxVersion = isFirefox ? userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1;

		if (typeof createImageBitmap === 'undefined' || (isSafari && safariVersion < 17) || (isFirefox && firefoxVersion < 98)) {
			this._imageLoader = new ImageLoader(manager);
		} else {
			this._imageLoader = new ImageBitmapLoader(manager);
		}
	}

	load(url, onLoad, onProgress, onError) {
		this._fileLoader
			.setResponseType('arraybuffer')
			.setRequestHeader(this.requestHeader)
			.setPath(this.path)
			.setWithCredentials(this.withCredentials)
			.load(url, buffer => {
				this.parse(buffer).then(envData => {
					onLoad && onLoad(envData);
				}).catch(err => {
					onError && onError(err);
				});
			}, onProgress, onError);
	}

	parse(buffer) {
		const headerByteLength = 8;

		const bufferView = new DataView(buffer);
		const version = bufferView.getUint32(0);
		const jsonByteLength = bufferView.getUint32(4);

		const jsonString = new TextDecoder().decode(buffer.slice(headerByteLength, headerByteLength + jsonByteLength));
		const jsonData = JSON.parse(jsonString);

		const { imageSize, mipmaps } = jsonData;

		// Double checks the mipmaps length
		let mipmapsCount = Math.log(imageSize) * Math.LOG2E;
		mipmapsCount = Math.round(mipmapsCount) + 1;
		if (mipmaps.length !== 6 * mipmapsCount) {
			throw new Error(`EnvLoader: Unsupported mipmaps number "${mipmaps.length}".`);
		}

		const promises = mipmaps.map(mipmap => {
			const mipmapBuffer = new Uint8Array(
				buffer,
				headerByteLength + jsonByteLength + mipmap.position,
				mipmap.length
			);

			const blob = new Blob([mipmapBuffer], { type: 'image/png' });
			const url = URL.createObjectURL(blob);
			return this._imageLoader.loadAsync(url).then(image => {
				URL.revokeObjectURL(url);
				return image;
			});
		});

		return Promise.all(promises).then(images => ({ version, json: jsonData, images }));
	}

}

class EnvTextureCubeLoader extends EnvLoader {

	constructor(manager) {
		super(manager);

		this._rgbdDecoder = new RGBDDecoder();
		this._renderer = null;
	}

	setRenderer(renderer) {
		this._renderer = renderer;
		return this;
	}

	load(url, onLoad, onProgress, onError) {
		const rgbdDecoder = this._rgbdDecoder;
		const renderer = this._renderer;

		if (!renderer) {
			throw new Error('EnvTextureCubeLoader: Renderer is not set.');
		}

		const texture = new TextureCube();

		super.load(url, ({ version, json, images }) => {
			const tempCubeTexture = new TextureCube();

			tempCubeTexture.type = PIXEL_TYPE.UNSIGNED_BYTE;
			tempCubeTexture.format = PIXEL_FORMAT.RGBA;
			tempCubeTexture.generateMipmaps = false;

			const mipmapCount = images.length / 6;
			for (let level = 0; level < mipmapCount; level++) {
				const subImages = images.slice(level * 6, level * 6 + 6);
				if (level === 0) {
					tempCubeTexture.images = subImages;
				}
				tempCubeTexture.mipmaps.push(subImages);
			}
			tempCubeTexture.version++;

			rgbdDecoder.decode(renderer, tempCubeTexture, texture);

			tempCubeTexture.dispose();

			// Attach the environment information to the texture
			texture.userData = { envInfo: { version, json } };

			onLoad && onLoad(texture);
		}, onProgress, onError);

		return texture;
	}

}

export { EnvLoader, EnvTextureCubeLoader };