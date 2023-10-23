import { PIXEL_FORMAT, PIXEL_TYPE, TEXTURE_FILTER, TEXTURE_WRAP, COMPARE_FUNC, OPERATION, MATERIAL_TYPE } from './const.js';
import { WebGLRenderer } from './webgl/WebGLRenderer.js';
import { BoxGeometry } from './resources/geometries/BoxGeometry.js';
import { Object3D } from './scenes/Object3D.js';
import { BasicMaterial } from './resources/materials/BasicMaterial.js';

// since 0.1.2
export { PIXEL_FORMAT as WEBGL_PIXEL_FORMAT };
export { PIXEL_TYPE as WEBGL_PIXEL_TYPE };
export { TEXTURE_FILTER as WEBGL_TEXTURE_FILTER };
export { TEXTURE_WRAP as WEBGL_TEXTURE_WRAP };
export { COMPARE_FUNC as WEBGL_COMPARE_FUNC };
export { OPERATION as WEBGL_OP };

// since 0.1.2
export { BoxGeometry as CubeGeometry };

// since 0.1.2
export class Group extends Object3D {

	constructor() {
		super();
		// console.warn("Group has been removed, use Object3D instead.");
	}

}

Group.prototype.isGroup = true;

Object.defineProperties(WebGLRenderer.prototype, {
	// since 0.2.0
	gl: {
		configurable: true,
		get: function() {
			// console.warn("WebGLRenderer: .gl has been deprecated, use .context instead.");
			return this.context;
		}
	},
	// since 0.1.2
	renderTarget: {
		configurable: true,
		get: function() {
			console.warn('WebGLRenderer: .renderTarget has been deprecated. All methods are moved to WebGLRenderer.');
			return this._renderTargets;
		}
	},
	// since 0.1.2
	state: {
		configurable: true,
		get: function() {
			console.warn('WebGLRenderer: .state has been deprecated. All methods are moved to WebGLRenderer.');
			return this._state;
		}
	},
	// since 0.1.2
	vertexArrayBindings: {
		configurable: true,
		get: function() {
			console.warn('WebGLRenderer: .vertexArrayBindings has been deprecated. All methods are moved to WebGLRenderer.');
			return this._vertexArrayBindings;
		}
	}
});

// since 0.1.6
WebGLRenderer.prototype.render = function(renderable, renderStates, options) {
	// console.warn('WebGLRenderer: .render() has been renamed to .renderRenderableItem().');
	this.renderRenderableItem(renderable, renderStates, options);
};

// since 0.2.0
// WebGLRenderPass is renamed to WebGLRenderer.
export const WebGLRenderPass = WebGLRenderer;

// Renderer, as an alias of WebGLRenderer, will exist for a long time.
// When the compatibility of renderPass is removed, it can be moved to main.js
export class Renderer extends WebGLRenderer {

	// since 0.2.0
	// renderer.renderPass is deprecated, use WebGLRenderer instead.
	get renderPass() {
		return this;
	}

}

// since 0.2.0
export class WebGLProperties {

	constructor(passId) {
		this._key = '__webgl$' + passId;
		this._count = 0;
	}

	get(object) {
		const key = this._key;
		let properties = object[key];
		if (properties === undefined) {
			properties = {};
			object[key] = properties;
			this._count++;
		}
		return properties;
	}

	delete(object) {
		const key = this._key;
		const properties = object[key];
		if (properties) {
			this._count--;
			delete object[key];
		}
	}

	size() {
		return this._count;
	}

}

// since 0.2.1, moved matcap shader to addons.

MATERIAL_TYPE.MATCAP = 'matcap';

export class MatcapMaterial extends BasicMaterial {

	constructor() {
		super();
		console.warn('MatcapMaterial has been removed and fallback to BasicMaterial, use addons/shaders/MatcapShader instead.');
	}

}