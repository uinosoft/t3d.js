import { GLTFUtils } from "../GLTFUtils.js";
import { KHR_texture_basisu as _KHR_texture_basisu } from '../extensions/KHR_texture_basisu.js';

export class ImageParser {

	static parse(context, loader) {
		const { gltf, bufferViews, path, loadItems } = context;

		if (!gltf.images) return;

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
				if (mimeType === 'image/ktx2') {
					promise = _KHR_texture_basisu.loadTextureData(imageUrl, loader.getKTX2Loader()).then(transcodeResult => {
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
					promise = loader.loadImage(imageUrl).then(image => {
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