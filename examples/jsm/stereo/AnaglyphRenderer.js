import {
	TEXTURE_FILTER,
	RenderTarget2D,
	Matrix4,
	Matrix3,
	ShaderPostPass
} from 't3d';
import { ForwardRenderer } from '../render/ForwardRenderer.js';

class AnaglyphRenderer extends ForwardRenderer {

	constructor(view, options) {
		super(view, options);

		const _colorMatrixLeft = new Matrix3().fromArray([
			0.456100, -0.0400822, -0.0152161,
			0.500484, -0.0378246, -0.0205971,
			0.176381, -0.0157589, -0.00546856
		]);
		const _colorMatrixRight = new Matrix3().fromArray([
			-0.0434706, 0.378476, -0.0721527,
			-0.0879388, 0.73364, -0.112961,
			-0.00155529, -0.0184503, 1.2264
		]);

		this.eyeSep = 0.064;
		this.focus = 10;

		this._cache = {
			projection: new Matrix4(),
			eyeSep: null,
			focus: null
		};

		const width = view.width;
		const height = view.height;

		const _renderTargetL = this._renderTargetL = new RenderTarget2D(width, height);
		_renderTargetL.texture.minFilter = TEXTURE_FILTER.LINEAR;
		_renderTargetL.texture.magFilter = TEXTURE_FILTER.NEAREST;

		const _renderTargetR = this._renderTargetR = new RenderTarget2D(width, height);
		_renderTargetR.texture.minFilter = TEXTURE_FILTER.LINEAR;
		_renderTargetR.texture.magFilter = TEXTURE_FILTER.NEAREST;

		const _shaderPostPass = this._shaderPostPass = new ShaderPostPass(AnaglyphShader);
		_shaderPostPass.uniforms.mapLeft = _renderTargetL.texture;
		_shaderPostPass.uniforms.mapRight = _renderTargetR.texture;
		_shaderPostPass.uniforms.colorMatrixLeft = _colorMatrixLeft.elements;
		_shaderPostPass.uniforms.colorMatrixRight = _colorMatrixRight.elements;
		_shaderPostPass.material.transparent = true;
	}

	resize(width, height) {
		this._renderTargetL.resize(width, height);
		this._renderTargetR.resize(width, height);
	}

	render(scene, camera, stereoCamera) {
		const cameraL = stereoCamera.cameraL;
		const cameraR = stereoCamera.cameraR;

		this.matrixAutoUpdate && scene.updateMatrix();

		this.updateCamera(camera, stereoCamera);

		scene.updateRenderStates(cameraL);
		scene.updateRenderQueue(cameraL);

		if (this.shadowAutoUpdate || this.shadowNeedsUpdate) {
			this.shadowMapPass.render(this, scene);
			this.shadowNeedsUpdate = false;
		}

		this.setRenderTarget(this._renderTargetL);
		this.clear(true, true, true);
		this.renderScene(scene, cameraL);

		scene.updateRenderStates(cameraR, false);
		scene.updateRenderQueue(cameraR, false, false);

		this.setRenderTarget(this._renderTargetR);
		this.clear(true, true, true);
		this.renderScene(scene, cameraR);

		if (this._renderTargetL.texture) {
			this.updateRenderTargetMipmap(this._renderTargetL);
		}
		if (this._renderTargetR.texture) {
			this.updateRenderTargetMipmap(this._renderTargetR);
		}

		this.setRenderTarget(this.backRenderTarget);
		this.clear(true, true, true);
		this._shaderPostPass.render(this);
	}

	updateCamera(camera, stereoCamera) {
		const cameraL = stereoCamera.cameraL;
		const cameraR = stereoCamera.cameraR;

		const needsUpdate = !this._cache.projection.equals(camera.projectionMatrix)
			|| this._cache.eyeSep !== this.eyeSep
			|| this._cache.focus !== this.focus;

		if (needsUpdate) {
			this._cache.projection.copy(camera.projectionMatrix);
			this._cache.eyeSep = this.eyeSep;
			this._cache.focus = this.focus;

			const focus = this.focus;
			const eyeSep = this.eyeSep;

			const fov = getFov(camera.projectionMatrix);
			const aspect = getAspect(camera.projectionMatrix);
			const near = getNear(camera.projectionMatrix);

			// Off-axis stereoscopic effect based on
			// http://paulbourke.net/stereographics/stereorender/

			_projectionMatrix.copy(camera.projectionMatrix);
			const eyeSepHalf = eyeSep / 2;
			const eyeSepOnProjection = eyeSepHalf * near / focus;

			const ymax = near * Math.tan(fov / 180 * Math.PI * 0.5);
			let xmin, xmax;

			// translate xOffset

			_eyeLeft.elements[12] = -eyeSepHalf;
			_eyeRight.elements[12] = eyeSepHalf;

			// for left eye

			xmin = -ymax * aspect + eyeSepOnProjection;
			xmax = ymax * aspect + eyeSepOnProjection;

			_projectionMatrix.elements[0] = 2 * near / (xmax - xmin);
			_projectionMatrix.elements[8] = (xmax + xmin) / (xmax - xmin);

			cameraL.projectionMatrix.copy(_projectionMatrix);

			// for right eye

			xmin = -ymax * aspect - eyeSepOnProjection;
			xmax = ymax * aspect - eyeSepOnProjection;

			_projectionMatrix.elements[0] = 2 * near / (xmax - xmin);
			_projectionMatrix.elements[8] = (xmax + xmin) / (xmax - xmin);

			cameraR.projectionMatrix.copy(_projectionMatrix);
		}

		updateStereoCamera(camera, cameraL, _eyeLeft);
		updateStereoCamera(camera, cameraR, _eyeRight);
	}

	dispose() {
		this._renderTargetL.dispose();
		this._renderTargetR.dispose();
		this._shaderPostPass.dispose();
	}

}

const _eyeRight = new Matrix4();
const _eyeLeft = new Matrix4();
const _projectionMatrix = new Matrix4();

function getFov(mat4) {
	return 180 / Math.PI * (2 * Math.atan(1 / mat4.elements[5]));
}

function getNear(mat4) {
	return mat4.elements[14] / (mat4.elements[13] - 1);
}

function getAspect(mat4) {
	return mat4.elements[5] / mat4.elements[0];
}

function updateStereoCamera(camera, stereoCamera, offsetMat) {
	stereoCamera.worldMatrix.copy(camera.worldMatrix);
	stereoCamera.worldMatrix.multiply(offsetMat);
	stereoCamera.viewMatrix.getInverse(stereoCamera.worldMatrix);
	stereoCamera.projectionMatrixInverse.getInverse(stereoCamera.projectionMatrix);
	stereoCamera.projectionViewMatrix.multiplyMatrices(stereoCamera.projectionMatrix, stereoCamera.viewMatrix);
	stereoCamera.frustum.setFromMatrix(stereoCamera.projectionViewMatrix);
}

const AnaglyphShader = {
	name: 'stereo_anaglyph',

	uniforms: {
		'mapLeft': null,
		'mapRight': null,
		'colorMatrixLeft': new Float32Array(9),
		'colorMatrixRight': new Float32Array(9)
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;

		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;

		varying vec2 v_Uv;

		void main() {
			v_Uv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );
		}`,

	fragmentShader: `
		uniform sampler2D mapLeft;
		uniform sampler2D mapRight;
		varying vec2 v_Uv;

		uniform mat3 colorMatrixLeft;
		uniform mat3 colorMatrixRight;

		// These functions implement sRGB linearization and gamma correction

		float lin( float c ) {
			return c <= 0.04045 ? c * 0.0773993808 :
					pow( c * 0.9478672986 + 0.0521327014, 2.4 );
		}

		vec4 lin( vec4 c ) {
			return vec4( lin( c.r ), lin( c.g ), lin( c.b ), c.a );
		}

		float dev( float c ) {
			return c <= 0.0031308 ? c * 12.92
					: pow( c, 0.41666 ) * 1.055 - 0.055;
		}

		void main() {
			vec2 uv = v_Uv;

			vec4 colorL = lin( texture2D( mapLeft, uv ) );
			vec4 colorR = lin( texture2D( mapRight, uv ) );

			vec3 color = clamp(
					colorMatrixLeft * colorL.rgb +
					colorMatrixRight * colorR.rgb, 0., 1. );

			gl_FragColor = vec4(
					dev( color.r ), dev( color.g ), dev( color.b ),
					max( colorL.a, colorR.a ) );
		}
		`
};

export { AnaglyphRenderer };
