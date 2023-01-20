import { Loader, ImageLoader, TextureCube } from 't3d';

class TextureCubeLoader extends Loader {

	constructor(manager) {
		super(manager);
	}

	load(urls, onLoad, _onProgress, onError) {
		const texture = new TextureCube();

		const loader = new ImageLoader(this.manager);
		loader.setCrossOrigin(this.crossOrigin);
		loader.setPath(this.path);

		const promiseArray = [];
		for (let i = 0; i < 6; i++) {
			promiseArray.push(loader.loadAsync(urls[i]));
		}

		Promise.all(promiseArray).then(function(images) {
			texture.images = images;
			texture.version++;

			if (onLoad) onLoad(texture);
		}).catch(function (e) {
			if (onError) onError(e);
		});

		return texture;
	}

}

export { TextureCubeLoader };