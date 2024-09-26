import { WebGLRenderer } from './webgl/WebGLRenderer.js';
import { BoxGeometry } from './resources/geometries/BoxGeometry.js';
import { Object3D } from './scenes/Object3D.js';
import { Scene } from './scenes/Scene.js';
import { MathUtils } from './math/MathUtils.js';

// deprecated since 0.1.2, add warning since 0.3.0, will be removed in 0.4.0
export class CubeGeometry extends BoxGeometry {

	constructor(width, height, depth, widthSegments, heightSegments, depthSegments) {
		super(width, height, depth, widthSegments, heightSegments, depthSegments);
		console.warn('CubeGeometry has been deprecated, use BoxGeometry instead.');
	}

}

// deprecated since 0.1.2, add warning since 0.3.0, will be removed in 0.4.0
export class Group extends Object3D {

	constructor() {
		super();
		console.warn('Group has been deprecated, use Object3D instead.');
	}

}

Group.prototype.isGroup = true;

Object.defineProperties(WebGLRenderer.prototype, {
	// deprecated since 0.2.0, add warning since 0.3.0, will be removed in 0.4.0
	gl: {
		configurable: true,
		get: function() {
			console.warn('WebGLRenderer: .gl has been deprecated, use .context instead.');
			return this.context;
		}
	}
});

// deprecated since 0.1.6, add warning since 0.3.0, will be removed in 0.4.0
WebGLRenderer.prototype.render = function(renderable, renderStates, options) {
	console.warn('WebGLRenderer: .render() has been renamed to .renderRenderableItem().');
	this.renderRenderableItem(renderable, renderStates, options);
};

// Renderer, as an alias of WebGLRenderer, will exist for a long time.
// When the compatibility of renderPass is removed, it can be moved to main.js
export class Renderer extends WebGLRenderer {

	// deprecated since 0.2.0, add warning since 0.3.0, will be removed in 0.4.0
	get renderPass() {
		console.warn('Renderer: .renderPass has been deprecated, use WebGLRenderer instead.');
		return this;
	}

}

Object.defineProperties(Scene.prototype, {
	// deprecated since 0.2.7
	environmentLightIntensity: {
		configurable: true,
		get: function() {
			// console.warn("Scene: .environmentLightIntensity has been deprecated, use .envDiffuseIntensity instead.");
			return this.envDiffuseIntensity;
		},
		set: function(value) {
			// console.warn("Scene: .environmentLightIntensity has been deprecated, use .envDiffuseIntensity instead.");
			this.envDiffuseIntensity = value;
		}
	}
});

// deprecated since 0.2.8

export const generateUUID = MathUtils.generateUUID;
export const isPowerOfTwo = MathUtils.isPowerOfTwo;
export const nearestPowerOfTwo = MathUtils.nearestPowerOfTwo;
export const nextPowerOfTwo = MathUtils.nextPowerOfTwo;