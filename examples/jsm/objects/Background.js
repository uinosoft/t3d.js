import {
	Quaternion,
	Euler,
	PlaneGeometry,
	Mesh,
	ShaderMaterial
} from 't3d';
import { GeometryUtils } from '../geometries/GeometryUtils.js';

class Background extends Mesh {

	constructor(texture = null, layout = BACKGROUND_LAYOUT.Fill, screenAspect = 1, textureAspect = 1) {
		const geometry = new PlaneGeometry(2, 2);
		GeometryUtils.applyMatrix4(geometry, _mat4, true);

		const material = new ShaderMaterial(BackgroundShader);

		super(geometry, material);

		this.frustumCulled = false;

		this.material.diffuseMap = texture;
		this._layout = layout;
		this._screenAspect = screenAspect;
		this._textureAspect = textureAspect;
		this._update();
	}

	get gamma() {
		return this.material.defines.GAMMA;
	}

	set gamma(value) {
		this.material.defines.GAMMA = value;
		this.material.needsUpdate = true;
	}

	get texture() {
		return this.material.diffuseMap;
	}

	set texture(value) {
		if (value.isTexture2D) {
			this.material.diffuseMap = value;
			this.material.needsUpdate = true;
		} else {
			console.error('Background: texture must be a Texture2D');
		}
	}

	set layout(type) {
		this._layout = type;
		this._update();
	}

	get layout() {
		return this._layout;
	}

	set textureAspect(aspect) {
		this._textureAspect = aspect;
		this._update();
	}

	get textureAspect() {
		return this._textureAspect;
	}

	set screenAspect(aspect) {
		this._screenAspect = aspect;
		this._update();
	}

	get screenAspect() {
		return this._screenAspect;
	}

	_fill() {
		this.material.diffuseMapTransform.setUvTransform(0, 0, 1, 1, 0, 0, 0);
	}

	_contain() {
		const textureAspect = this._textureAspect, screenAspect = this._screenAspect;

		let repeatX, repeatY, offsetX, offsetY;

		if (textureAspect > screenAspect) {
			repeatX = 1;
			repeatY = textureAspect / screenAspect;

			offsetX = 0;
			offsetY = (1 - repeatY) / 2;
		} else {
			repeatX = screenAspect / textureAspect;
			repeatY = 1;

			offsetX = (1 - repeatX) / 2;
			offsetY = 0;
		}

		this.material.diffuseMapTransform.setUvTransform(offsetX, offsetY, repeatX, repeatY, 0, 0, 0);
	}

	_cover() {
		const textureAspect = this._textureAspect, screenAspect = this._screenAspect;

		let repeatX, repeatY, offsetX, offsetY;

		if (textureAspect > screenAspect) {
			repeatX = screenAspect / textureAspect;
			repeatY = 1;

			offsetX = (1 - repeatX) / 2;
			offsetY = 0;
		} else {
			repeatX = 1;
			repeatY = textureAspect / screenAspect;

			offsetX = 0;
			offsetY = (1 - repeatY) / 2;
		}

		this.material.diffuseMapTransform.setUvTransform(offsetX, offsetY, repeatX, repeatY, 0, 0, 0);
	}

	_update() {
		if (!this.texture) return;

		switch (this._layout) {
			case BACKGROUND_LAYOUT.Fill:
				this._fill();
				break;
			case BACKGROUND_LAYOUT.Contain:
				this._contain();
				break;
			case BACKGROUND_LAYOUT.Cover:
				this._cover();
				break;
		}
	}

}

Background.prototype.isBackground = true;

const _mat4 = new Quaternion().setFromEuler(new Euler(Math.PI / 2, 0, 0)).toMatrix4();

const BACKGROUND_LAYOUT = {
	Fill: 'fill',
	Contain: 'contain',
	Cover: 'cover'
};

const BackgroundShader = {
	name: 'background',
	defines: {
		'GAMMA': false
	},
	uniforms: {},
	vertexShader: `
        attribute vec2 a_Uv;
        attribute vec3 a_Position;

        uniform mat3 uvTransform;

        varying vec2 v_Uv;

        void main() {
            v_Uv = (uvTransform * vec3(a_Uv, 1.)).xy;
            gl_Position = vec4(a_Position.xy, 1.0, 1.0);
        }
    `,
	fragmentShader: `
		uniform sampler2D diffuseMap;

		varying vec2 v_Uv;

		void main() {
			gl_FragColor = mapTexelToLinear(texture2D(diffuseMap, v_Uv));

			#ifdef GAMMA
				#include <encodings_frag>
			#endif
		}`
};

export { Background, BACKGROUND_LAYOUT, BackgroundShader };