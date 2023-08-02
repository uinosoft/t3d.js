import { TEXEL_ENCODING_TYPE, PIXEL_FORMAT, PIXEL_TYPE, TEXTURE_FILTER, TEXTURE_WRAP, COMPARE_FUNC, OPERATION } from './const.js';
import { Fog } from './resources/fogs/Fog.js';
import { FogExp2 } from './resources/fogs/FogExp2.js';
import { TextureBase } from './resources/textures/TextureBase.js';
import { Texture2D } from './resources/textures/Texture2D.js';
import { Texture3D } from './resources/textures/Texture3D.js';
import { TextureCube } from './resources/textures/TextureCube.js';
import { Material } from './resources/materials/Material.js';
import { Vector3 } from './math/Vector3.js';
import { WebGLRenderer } from './webgl/WebGLRenderer.js';
import { WebGLVertexArrayBindings } from './webgl/WebGLVertexArrayBindings.js';
import { WebGLGeometries } from './webgl/WebGLGeometries.js';
import { Camera } from './scenes/Camera.js';
import { Light } from './scenes/Light.js';
import { AmbientLight } from './scenes/lights/AmbientLight.js';
import { DirectionalLight } from './scenes/lights/DirectionalLight.js';
import { HemisphereLight } from './scenes/lights/HemisphereLight.js';
import { PointLight } from './scenes/lights/PointLight.js';
import { SpotLight } from './scenes/lights/SpotLight.js';
import { BoxGeometry } from './resources/geometries/BoxGeometry.js';
import { Mesh } from './scenes/Mesh.js';
import { SkinnedMesh } from './scenes/SkinnedMesh.js';
import { Scene } from './scenes/Scene.js';
import { Object3D } from './scenes/Object3D.js';
import { ImageLoader } from './loaders/ImageLoader.js';

export { PIXEL_FORMAT as WEBGL_PIXEL_FORMAT };
export { PIXEL_TYPE as WEBGL_PIXEL_TYPE };
export { TEXTURE_FILTER as WEBGL_TEXTURE_FILTER };
export { TEXTURE_WRAP as WEBGL_TEXTURE_WRAP };
export { COMPARE_FUNC as WEBGL_COMPARE_FUNC };
export { OPERATION as WEBGL_OP };

export { BoxGeometry as CubeGeometry };

export class Group extends Object3D {

	constructor() {
		super();
		// console.warn("Group has been removed, use Object3D instead.");
	}

}

Group.prototype.isGroup = true;

export class EnvironmentMapPass {

	constructor() {
		console.error("EnvironmentMapPass has been removed, use ReflectionProbe(jsm) instead.");
	}

}

Vector3.prototype.applyProjection = function(_m) {
	console.error("t3d.Vector3: .applyProjection has been removed. Use .applyMatrix4 instead.");
}

Object.defineProperties(Camera.prototype, {
	gammaInput: {
		configurable: true,
		get: function() {
			console.warn("t3d.Camera: .gammaInput has been removed. Use texture.encoding instead.");
			return false;
		},
		set: function(_value) {
			console.warn("t3d.Camera: .gammaInput has been removed. Use texture.encoding instead.");
		}
	},
	gammaOutput: {
		configurable: true,
		get: function() {
			console.warn("t3d.Camera: .gammaOutput has been removed. Use .outputEncoding or renderTarget.texture.encoding instead.");
			return this.outputEncoding == TEXEL_ENCODING_TYPE.GAMMA;
		},
		set: function(value) {
			console.warn("t3d.Camera: .gammaOutput has been removed. Use .outputEncoding or renderTarget.texture.encoding instead.");
			if (value) {
				this.outputEncoding = TEXEL_ENCODING_TYPE.GAMMA;
			} else {
				this.outputEncoding = TEXEL_ENCODING_TYPE.LINEAR;
			}
		}
	}
});

Object.defineProperties(Material.prototype, {
	emissiveIntensity: {
		configurable: true,
		get: function() {
			console.warn("t3d.Material: .emissiveIntensity has been removed. Use material.emissive instead.");
			return false;
		},
		set: function(_value) {
			console.warn("t3d.Material: .emissiveIntensity has been removed. Use material.emissive instead.");
		}
	}
});

Object.defineProperties(WebGLRenderer.prototype, {
	// since 0.2.0
	gl: {
		configurable: true,
		get: function() {
			// console.warn("WebGLRenderer: .gl has been deprecated, use .context instead.");
			return this.context;
		}
	},
	textures: {
		configurable: true,
		get: function() {
			console.warn("WebGLRenderer: .textures has been deprecated. All methods are moved to WebGLRenderer.");
			return this._textures;
		}
	},
	renderBuffers: {
		configurable: true,
		get: function() {
			console.warn("WebGLRenderer: .renderBuffers has been deprecated. All methods are moved to WebGLRenderer.");
			return this._renderBuffers;
		}
	},
	renderTarget: {
		configurable: true,
		get: function() {
			// console.warn("WebGLRenderer: .renderTarget has been deprecated. All methods are moved to WebGLRenderer.");
			return this._renderTargets;
		}
	},
	state: {
		configurable: true,
		get: function() {
			// console.warn("WebGLRenderer: .state has been deprecated. All methods are moved to WebGLRenderer.");
			return this._state;
		}
	},
	vertexArrayBindings: {
		configurable: true,
		get: function() {
			console.warn("WebGLRenderer: .vertexArrayBindings has been deprecated. All methods are moved to WebGLRenderer.");
			return this._vertexArrayBindings;
		}
	}
});

// since 0.1.6
WebGLRenderer.prototype.render = function(renderable, renderStates, options) {
	// console.warn('WebGLRenderer: .render() has been renamed to .renderRenderableItem().');
	this.renderRenderableItem(renderable, renderStates, options);
}

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

WebGLVertexArrayBindings.prototype.resetBinding = function() {
	console.error("WebGLVertexArrayBindings: .resetBinding() has been removed. Use WebGLRenderer.resetVertexArrayBindings() instead.");
}

WebGLGeometries.prototype.setBufferExternal = function(buffer, webglBuffer) {
	console.warn("WebGLGeometries: .setBufferExternal has been removed. Use WebGLRenderer.setBufferExternal instead.");
	this._buffers.setBufferExternal(buffer, webglBuffer);
}

// Enum for WebGL Texture Type.
export const WEBGL_TEXTURE_TYPE = {
	TEXTURE_2D: 0x0DE1,
	TEXTURE_CUBE_MAP: 0x8513,
	/** Only webgl2 */
	TEXTURE_3D: 0x806F
};

Object.defineProperties(TextureBase.prototype, {
	textureType: {
		configurable: true,
		get: function() {
			console.warn("TextureBase: .textureType has been removed.");
			return "";
		},
		set: function(_value) {
			console.warn("TextureBase: .textureType has been removed.");
		}
	}
});

Object.defineProperties(Texture2D, {
	textureType: {
		configurable: true,
		get: function() {
			console.warn("Texture2D: .textureType has been removed.");
			return WEBGL_TEXTURE_TYPE.TEXTURE_2D;
		},
		set: function(_value) {
			console.warn("Texture2D: .textureType has been removed.");
		}
	}
});

Object.defineProperties(Texture3D, {
	textureType: {
		configurable: true,
		get: function() {
			console.warn("Texture3D: .textureType has been removed.");
			return WEBGL_TEXTURE_TYPE.TEXTURE_3D;
		},
		set: function(_value) {
			console.warn("Texture3D: .textureType has been removed.");
		}
	}
});

Object.defineProperties(TextureCube, {
	textureType: {
		configurable: true,
		get: function() {
			console.warn("TextureCube: .textureType has been removed.");
			return WEBGL_TEXTURE_TYPE.TEXTURE_CUBE_MAP;
		},
		set: function(_value) {
			console.warn("TextureCube: .textureType has been removed.");
		}
	}
});

// Enum for light Type.
export const LIGHT_TYPE = {
	AMBIENT: "ambient",
	HEMISPHERE: "hemisphere",
	DIRECT: "direct",
	POINT: "point",
	SPOT: "spot"
};

Object.defineProperties(Light.prototype, {
	lightType: {
		configurable: true,
		get: function() {
			console.warn("Light: .lightType has been removed.");
			return "";
		},
		set: function(_value) {
			console.warn("Light: .lightType has been removed.");
		}
	}
});


Object.defineProperties(AmbientLight.prototype, {
	lightType: {
		configurable: true,
		get: function() {
			console.warn("AmbientLight: .lightType has been removed.");
			return LIGHT_TYPE.AMBIENT;
		},
		set: function(_value) {
			console.warn("AmbientLight: .lightType has been removed.");
		}
	}
});

Object.defineProperties(DirectionalLight.prototype, {
	lightType: {
		configurable: true,
		get: function() {
			console.warn("DirectionalLight: .lightType has been removed.");
			return LIGHT_TYPE.DIRECT;
		},
		set: function(_value) {
			console.warn("DirectionalLight: .lightType has been removed.");
		}
	}
});


Object.defineProperties(HemisphereLight.prototype, {
	lightType: {
		configurable: true,
		get: function() {
			console.warn("HemisphereLight: .lightType has been removed.");
			return LIGHT_TYPE.HEMISPHERE;
		},
		set: function(_value) {
			console.warn("HemisphereLight: .lightType has been removed.");
		}
	}
});

Object.defineProperties(PointLight.prototype, {
	lightType: {
		configurable: true,
		get: function() {
			console.warn("PointLight: .lightType has been removed.");
			return LIGHT_TYPE.POINT;
		},
		set: function(_value) {
			console.warn("PointLight: .lightType has been removed.");
		}
	}
});

Object.defineProperties(SpotLight.prototype, {
	lightType: {
		configurable: true,
		get: function() {
			console.warn("SpotLight: .lightType has been removed.");
			return LIGHT_TYPE.SPOT;
		},
		set: function(_value) {
			console.warn("SpotLight: .lightType has been removed.");
		}
	}
});

// Enum for object Type.
export const OBJECT_TYPE = {
	MESH: "mesh",
	SKINNED_MESH: "skinned_mesh",
	LIGHT: "light",
	CAMERA: "camera",
	SCENE: "scene",
	GROUP: "group"
};

Object.defineProperties(Mesh.prototype, {
	type: {
		configurable: true,
		get: function() {
			console.warn("Mesh: .type has been removed, use .isMesh instead.");
			return OBJECT_TYPE.MESH;
		},
		set: function(_value) {
			console.warn("Mesh: .type has been removed.");
		}
	}
});

Object.defineProperties(SkinnedMesh.prototype, {
	type: {
		configurable: true,
		get: function() {
			console.warn("SkinnedMesh: .type has been removed, use .isSkinnedMesh instead.");
			return OBJECT_TYPE.SKINNED_MESH;
		},
		set: function(_value) {
			console.warn("SkinnedMesh: .type has been removed.");
		}
	}
});

Object.defineProperties(Light.prototype, {
	type: {
		configurable: true,
		get: function() {
			console.warn("Light: .type has been removed, use .isLight instead.");
			return OBJECT_TYPE.LIGHT;
		},
		set: function(_value) {
			console.warn("Light: .type has been removed.");
		}
	}
});

Object.defineProperties(Camera.prototype, {
	type: {
		configurable: true,
		get: function() {
			console.warn("Camera: .type has been removed, use .isCamera instead.");
			return OBJECT_TYPE.CAMERA;
		},
		set: function(_value) {
			console.warn("Camera: .type has been removed.");
		}
	}
});

Object.defineProperties(Scene.prototype, {
	type: {
		configurable: true,
		get: function() {
			console.warn("Scene: .type has been removed, use .isScene instead.");
			return OBJECT_TYPE.SCENE;
		},
		set: function(_value) {
			console.warn("Scene: .type has been removed.");
		}
	}
});

Object.defineProperties(Group.prototype, {
	type: {
		configurable: true,
		get: function() {
			console.warn("Group: .type has been removed, use .isGroup instead.");
			return OBJECT_TYPE.GROUP;
		},
		set: function(_value) {
			console.warn("Group: .type has been removed.");
		}
	}
});

// Enum for fog Type.
export const FOG_TYPE = {
	NORMAL: "normal",
	EXP2: "exp2"
};

Object.defineProperties(Fog.prototype, {
	fogType: {
		configurable: true,
		get: function() {
			console.warn("Fog: .fogType has been removed, use .isFog instead.");
			return FOG_TYPE.NORMAL;
		},
		set: function(_value) {
			console.warn("Fog: .fogType has been removed.");
		}
	}
});

Object.defineProperties(FogExp2.prototype, {
	fogType: {
		configurable: true,
		get: function() {
			console.warn("FogExp2: .fogType has been removed, use .isFogExp2 instead.");
			return FOG_TYPE.EXP2;
		},
		set: function(_value) {
			console.warn("FogExp2: .fogType has been removed.");
		}
	}
});

Texture2D.fromImage = function(image) {
	console.warn("Texture2D.fromImage has been removed.");

	const texture = new Texture2D();

	texture.image = image;
	texture.version++;

	return texture;
}

Texture2D.fromSrc = function(src) {
	console.warn("Texture2D.fromSrc has been removed, use Texture2DLoader(jsm) instead.");

	const texture = new Texture2D();

	const loader = new ImageLoader();

	loader.load(src, function(image) {
		texture.image = image;
		texture.version++;
		texture.dispatchEvent({ type: 'onload' });
	});

	return texture;
}

TextureCube.fromImage = function(imageArray) {
	console.warn("TextureCube.fromImage has been removed.");

	const texture = new TextureCube();
	const images = texture.images;

	for (let i = 0; i < 6; i++) {
		images[i] = imageArray[i];
	}

	texture.version++;

	return texture;
}

TextureCube.fromSrc = function(srcArray) {
	console.warn("TextureCube.fromSrc has been removed, use TextureCubeLoader(jsm) instead.");

	const texture = new TextureCube();
	const images = texture.images;

	const loader = new ImageLoader();

	let count = 0;
	function next(image) {
		if (image) {
			images.push(image);
			count++;
		}
		if (count >= 6) {
			loaded();
			return;
		}
		loader.load(srcArray[count], next);
	}
	next();

	function loaded() {
		texture.version++;
		texture.dispatchEvent({ type: 'onload' });
	}

	return texture;
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