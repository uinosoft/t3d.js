import { RenderTarget2D, PIXEL_TYPE, TEXTURE_FILTER, SHADING_TYPE, ShaderMaterial } from 't3d';

export default class PickBuffer {

	constructor(width, height) {
		this._rt = new RenderTarget2D(width, height);
		this._rt.texture.minFilter = TEXTURE_FILTER.NEAREST;
		this._rt.texture.magFilter = TEXTURE_FILTER.NEAREST;
		this._rt.texture.generateMipmaps = false;
		this._rt.texture.type = PIXEL_TYPE.FLOAT;

		this._renderOptions = {
			getMaterial: createGetMaterialFunction(),
			ifRender: function(renderable) {
				return !!renderable.geometry.getAttribute('a_Normal');
			}
		};

		this.layers = [0];

		this.meshes = new Map();
	}

	setMeshPickId(pickId, mesh) {
		mesh.pickId = pickId;
		this.meshes.set(pickId, mesh);
	}

	getMeshByPickId(pickId) {
		return this.meshes.get(pickId);
	}

	render(renderer, scene, camera) {
		renderer.setRenderTarget(this._rt);
		renderer.setClearColor(0, 0, 0, 0);
		renderer.clear(true, true, true);

		const renderOptions = this._renderOptions;

		const renderStates = scene.getRenderStates(camera);
		const renderQueue = scene.getRenderQueue(camera);

		renderer.beginRender();

		const layers = this.layers;
		for (let i = 0, l = layers.length; i < l; i++) {
			const renderQueueLayer = renderQueue.getLayer(layers[i]);
			renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, renderOptions);
			renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, renderOptions);
		}

		renderer.endRender();
	}

	output() {
		return this._rt;
	}

	resize(width, height) {
		this._rt.resize(width, height);
	}

	dispose() {
		this._rt.dispose();
	}

}

function createGetMaterialFunction(func = defaultMaterialReplaceFunction) {
	return function(renderable) {
		const material = func(renderable);
		material.uniforms['u_pickId'] = renderable.object.pickId || 0.0;
		material.side = renderable.material.side;
		return material;
	};
}

const materialMap = new Map();
const materialWeakMap = new WeakMap();

function defaultMaterialReplaceFunction(renderable) {
	let materialRef = materialWeakMap.get(renderable.material);
	if (!materialRef) {
		const useFlatShading = !renderable.geometry.attributes['a_Normal'] || (renderable.material.shading === SHADING_TYPE.FLAT_SHADING);
		const useSkinning = renderable.object.isSkinnedMesh && renderable.object.skeleton;
		const morphTargets = !!renderable.object.morphTargetInfluences;
		const morphNormals = !!renderable.object.morphTargetInfluences && renderable.object.geometry.morphAttributes.normal;
		const side = renderable.material.side;

		let maxBones = 0;
		if (useSkinning) {
			if (renderable.object.skeleton.boneTexture) {
				maxBones = 1024;
			} else {
				maxBones = renderable.object.skeleton.bones.length;
			}
		}

		const code = useFlatShading +
			'_' + useSkinning +
			'_' + maxBones +
			'_' + morphTargets +
			'_' + morphNormals +
			'_' + side;

		materialRef = materialMap.get(code);
		if (!materialRef) {
			const material = new ShaderMaterial(pickShader);
			material.shading = useFlatShading ? SHADING_TYPE.FLAT_SHADING : SHADING_TYPE.SMOOTH_SHADING;
			material.side = side;

			materialRef = { refCount: 0, material };
			materialMap.set(code, materialRef);
		}

		materialWeakMap.set(renderable.material, materialRef);
		materialRef.refCount++;

		function onDispose() {
			renderable.material.removeEventListener('dispose', onDispose);

			materialWeakMap.delete(renderable.material);
			materialRef.refCount--;

			if (materialRef.refCount <= 0) {
				materialMap.delete(code);
			}
		}
		renderable.material.addEventListener('dispose', onDispose);
	}

	return materialRef.material;
}

const pickShader = {
	name: 'gpu_pick',
	uniforms: {
		u_pickId: 1
	},
	vertexShader: `
        #include <common_vert>
        #include <morphtarget_pars_vert>
        #include <skinning_pars_vert>
        #include <normal_pars_vert>
		#include <logdepthbuf_pars_vert>
		varying float viewZ;
        void main() {
        	#include <begin_vert>
        	#include <morphtarget_vert>
        	#include <morphnormal_vert>
        	#include <skinning_vert>
        	#include <skinnormal_vert>
        	#include <normal_vert>
        	#include <pvm_vert>
			#include <logdepthbuf_vert>
			viewZ = (u_View * worldPosition).z;
        }
    `,
	fragmentShader: `
		#include <common_frag>
		#include <normal_pars_frag>
		#include <logdepthbuf_pars_frag>

		uniform highp float u_pickId;
		varying float viewZ;

		float atan2(float y, float x) {
			if (x > 0.0) {
			  return atan(y / x);
			} else if (x < 0.0) {
			  if (y >= 0.0) {
				return atan(y / x) + 3.141592653589793;
			  } else {
				return atan(y / x) - 3.141592653589793;
			  }
			} else {
			  if (y > 0.0) {
				return 1.5707963267948966;
			  } else if (y < 0.0) {
				return -1.5707963267948966;
			  } else {
				return 0.0;
			  }
			}
		}
	
        void main() {
     		#include <logdepthbuf_frag>
            vec3 normal = normalize(v_Normal);
			vec2 polar = vec2(acos(min(1., max(-1., normal.y))), atan2(normal.x, normal.z));
			vec4 pickInformation;
            pickInformation.xy = polar;
            pickInformation.z = viewZ;
			pickInformation.w = round(u_pickId);
            gl_FragColor = pickInformation;
        }
    `
};
