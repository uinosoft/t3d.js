import {
	Loader,
	FileLoader
} from 't3d';

import UTIF from '../../libs/utif.module.js';

class TIFFLoader extends Loader {

	constructor(manager) {
		super(manager);
	}

	load(url, onLoad, onProgress, onError) {
		const scope = this;

		const loader = new FileLoader(this.manager);
		loader.setResponseType('arraybuffer');
		loader.setRequestHeader(this.requestHeader);
		loader.setPath(this.path);
		loader.setWithCredentials(this.withCredentials);

		loader.load(url, function(buffer) {
			if (onLoad !== undefined) {
				onLoad(scope.parse(buffer));
			}
		}, onProgress, onError);
	}

	parse(buffer) {
		const ifds = UTIF.decode(buffer);
		UTIF.decodeImage(buffer, ifds[0]);
		const rgba = UTIF.toRGBA8(ifds[0]);

		return {
			width: ifds[0].width,
			height: ifds[0].height,
			data: rgba
		};
	}

}

export { TIFFLoader };
