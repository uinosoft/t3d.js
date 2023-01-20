import { GLTFUtils } from "../GLTFUtils.js";

export class ImageParser {

	static parse(context, loader) {
		const { gltf, bufferViews, path, loadItems } = context;

		if (!gltf.images) return;

		return Promise.all(
			gltf.images.map(({ uri, bufferView: bufferViewIndex, mimeType, name: imageName }, index) => {
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

				const promise = loader.loadImage(imageUrl).then(image => {
					// mark name and alpha
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