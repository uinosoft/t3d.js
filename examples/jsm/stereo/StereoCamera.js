import {
	Camera,
	Object3D,
	TEXEL_ENCODING_TYPE
} from 't3d';

class StereoCamera extends Object3D {

	constructor() {
		super();

		this.cameraL = new Camera();
		this.cameraR = new Camera();

		this.near = 1;
		this.far = 1000;
	}

}

Object.defineProperties(StereoCamera.prototype, {
	gammaFactor: {
		get: function() {
			return this.cameraL.gammaFactor;
		},
		set: function(value) {
			this.cameraL.gammaFactor = value;
			this.cameraR.gammaFactor = value;
		}
	},
	gammaInput: {
		get: function() {
			console.warn("StereoCamera: .gammaInput has been removed. Use texture.encoding instead.");
			return false;
		},
		set: function(value) {
			console.warn("StereoCamera: .gammaInput has been removed. Use texture.encoding instead.");
		}
	},
	gammaOutput: {
		get: function() {
			console.warn("StereoCamera: .gammaOutput has been removed. Use .outputEncoding or renderTarget.texture.encoding instead.");
			return this.cameraL.outputEncoding == TEXEL_ENCODING_TYPE.GAMMA;
		},
		set: function(value) {
			console.warn("StereoCamera: .gammaOutput has been removed. Use .outputEncoding or renderTarget.texture.encoding instead.");
			if (value) {
				this.cameraL.outputEncoding = TEXEL_ENCODING_TYPE.GAMMA;
				this.cameraR.outputEncoding = TEXEL_ENCODING_TYPE.GAMMA;
			} else {
				this.cameraL.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;
				this.cameraR.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;
			}
		}
	},
	outputEncoding: {
		get: function() {
			return this.cameraL.outputEncoding;
		},
		set: function(value) {
			this.cameraL.outputEncoding = value;
			this.cameraR.outputEncoding = value;
		}
	}
});

export { StereoCamera };