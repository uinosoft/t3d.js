import { GLTFUtils } from '../GLTFUtils.js';

export class ImageParser {

	static parse(context, loader) {
		const { gltf, bufferViews, path, loadItems } = context;

		if (!gltf.images) return;

		const basisuExt = loader.extensions.get('KHR_texture_basisu');

		return Promise.all(
			gltf.images.map((params, index) => {
				const { uri, bufferView: bufferViewIndex, mimeType, name: imageName } = params;
				let isObjectURL = false;
				let sourceUrl = uri || '';

				if (bufferViewIndex !== undefined) {
					const bufferViewData = bufferViews[bufferViewIndex];
					const blob = new Blob([bufferViewData], { type: mimeType });
					sourceUrl = URL.createObjectURL(blob);
					isObjectURL = true;
				}
				const imageUrl = GLTFUtils.resolveURL(sourceUrl, path);

				if (loader.detailLoadProgress) {
					loadItems.delete(imageUrl);
				}
				let promise;
				if (mimeType && mimeType.includes('ktx2') && basisuExt) {
					promise = basisuExt.loadTextureData(imageUrl, loader.getKTX2Loader()).then(transcodeResult => {
						if (loader.detailLoadProgress) {
							if (isObjectURL) {
								loader.manager.itemEnd(GLTFUtils.resolveURL('blob<' + index + '>', path));
							} else {
								loader.manager.itemEnd(imageUrl);
							}
						}
						return transcodeResult;
					});
				} else {
					const param = { loader, imageUrl, imageName, isObjectURL, sourceUrl, index, path };
					if (mimeType && (mimeType.includes('avif') || mimeType.includes('webp'))) {
						promise = detectSupport(mimeType).then(isSupported => {
							if (isSupported) return loadImage(param);
							throw new Error('GLTFLoader: WebP or AVIF required by asset but unsupported.');
						});
					} else {
						return loadImage(param);
					}
				}
				if (loader.detailLoadProgress) {
					promise.catch(() => loader.manager.itemEnd(imageUrl));
				}
				return promise;
			})
		).then(images => {
			context.images = images;
		});
	}

}

function detectSupport(mimeType) {
	const isSupported = new Promise(resolve => {
		// Lossy test image.
		const image = new Image();
		if (mimeType.includes('avif')) {
			image.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
		} else {
			image.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
		}
		image.onload = () => {
			resolve(image.height === 1);
		};
	});

	return isSupported;
}

function loadImage(param) {
	const { loader, imageUrl, imageName, isObjectURL, sourceUrl, index, path } = param;
	const promise = loader.loadImage(imageUrl).then(image => {
		image.__name = imageName;
		if (isObjectURL === true) {
			URL.revokeObjectURL(sourceUrl);
		}
		if (loader.detailLoadProgress) {
			if (isObjectURL) {
				loader.manager.itemEnd(GLTFUtils.resolveURL('blob<' + index + '>', path));
			} else {
				loader.manager.itemEnd(imageUrl);
			}
		}
		return image;
	});
	return promise;
}