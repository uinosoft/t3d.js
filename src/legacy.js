import { WebGLRenderer } from './webgl/WebGLRenderer.js';
import { BoxGeometry } from './resources/geometries/BoxGeometry.js';
import { Object3D } from './scenes/Object3D.js';
import { Scene } from './scenes/Scene.js';
import { MathUtils } from './math/MathUtils.js';
import { RenderStates } from './render/RenderStates.js';
import { Matrix4 } from './math/Matrix4.js';
import { Matrix3 } from './math/Matrix3.js';

// deprecated since 0.1.2, add warning since 0.3.0
export class CubeGeometry extends BoxGeometry {

	constructor(width, height, depth, widthSegments, heightSegments, depthSegments) {
		super(width, height, depth, widthSegments, heightSegments, depthSegments);
		console.warn('CubeGeometry has been deprecated, use BoxGeometry instead.');
	}

}

// deprecated since 0.1.2, add warning since 0.3.0
export class Group extends Object3D {

	constructor() {
		super();
		console.warn('Group has been deprecated, use Object3D instead.');
	}

}

Group.prototype.isGroup = true;

Object.defineProperties(WebGLRenderer.prototype, {
	// deprecated since 0.2.0, add warning since 0.3.0
	gl: {
		configurable: true,
		get: function() {
			console.warn('WebGLRenderer: .gl has been deprecated, use .context instead.');
			return this.context;
		}
	}
});

// deprecated since 0.1.6, add warning since 0.3.0
WebGLRenderer.prototype.render = function(renderable, renderStates, options) {
	console.warn('WebGLRenderer: .render() has been renamed to .renderRenderableItem().');
	this.renderRenderableItem(renderable, renderStates, options);
};

// Renderer, as an alias of WebGLRenderer, will exist for a long time.
// When the compatibility of renderPass is removed, it can be moved to main.js
export class Renderer extends WebGLRenderer {

	// deprecated since 0.2.0, add warning since 0.3.0
	get renderPass() {
		console.warn('Renderer: .renderPass has been deprecated, use WebGLRenderer instead.');
		return this;
	}

}

Object.defineProperties(Scene.prototype, {
	// deprecated since 0.2.7, add warning since 0.4.0
	environmentLightIntensity: {
		configurable: true,
		get: function() {
			console.warn('Scene: .environmentLightIntensity has been deprecated, use .envDiffuseIntensity instead.');
			return this.envDiffuseIntensity;
		},
		set: function(value) {
			console.warn('Scene: .environmentLightIntensity has been deprecated, use .envDiffuseIntensity instead.');
			this.envDiffuseIntensity = value;
		}
	},
	// deprecated since 0.4.0
	_lightData: {
		configurable: true,
		get: function() {
			console.warn('Scene: ._lightData has been deprecated since v0.4.0, use ._lightingData.getGroup(0) instead.');
			return this._lightingData.getGroup(0);
		}
	}
});

Object.defineProperties(RenderStates.prototype, {
	// deprecated since 0.4.0
	lights: {
		configurable: true,
		get: function() {
			console.warn('RenderStates: .lights has been deprecated since v0.4.0, use .lighting.getGroup(0) instead.');
			return this.lighting.getGroup(0);
		}
	}
});

// deprecated since 0.2.8

export const generateUUID = MathUtils.generateUUID;
export const isPowerOfTwo = MathUtils.isPowerOfTwo;
export const nearestPowerOfTwo = MathUtils.nearestPowerOfTwo;
export const nextPowerOfTwo = MathUtils.nextPowerOfTwo;

// deprecated since 0.4.3
Matrix4.prototype.inverse = function() {
	return this.invert();
};

// deprecated since 0.4.3
Matrix4.prototype.getInverse = function(m) {
	return this.copy(m).invert();
};

// deprecated since 0.4.3
Matrix3.prototype.inverse = function() {
	return this.invert();
};

// deprecated since 0.4.3
Matrix3.prototype.getInverse = function(m) {
	return this.copy(m).invert();
};