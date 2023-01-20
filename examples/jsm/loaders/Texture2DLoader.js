import { Loader, ImageLoader, Texture2D } from 't3d';

class Texture2DLoader extends Loader {

	constructor(manager) {
		super(manager);
	}

	load(url, onLoad, onProgress, onError) {
		const texture = new Texture2D();

		const loader = new ImageLoader(this.manager);
		loader.setCrossOrigin(this.crossOrigin);
		loader.setPath(this.path);

		loader.load(url, function(image) {
			texture.image = image;
			texture.version++;

			if (onLoad) onLoad(texture);
		}, onProgress, onError);

		return texture;
	}

}

export { Texture2DLoader };