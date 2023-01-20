let resourceId = 0;

export class GLTFResource {

	constructor() {
		this.id = ++resourceId;
		this.url = ''; // url string
		this.path = ''; // path string
		this.options = null; // load options
		this.gltf = null; // gltf json after IndexParser
		this.loadItems = null; // String[] after IndexParser. Store all urls that need to load.
		this.buffers = null; // ArrayBuffer[] after BufferParser
		this.bufferViews = null; // ArrayBuffer[] after BufferViewParser
		this.images = null; // Image[] after ImageParser
		this.textures = null; // Texture2D[] after TextureParser
		this.materials = null; // Material[] after MaterialParser
		this.accessors = null; // Attribute[] after AccessorParser
		this.primitives = null; // { mode, geometry, material, weights, skinned }[] after PrimitiveParser
		this.nodes = null; // Object3D[] after NodeParser
		this.cameras = null; // Camera[] after NodeParser
		this.lights = null; // Light[] after NodeParser
		this.skins = null; // Skeleton[] after SkinParser
		this.root = null; // root after SceneParser
		this.roots = null; // root[] after SceneParser
		this.animations = null; // KeyframeClip[] after AnimationParser
	}

}
