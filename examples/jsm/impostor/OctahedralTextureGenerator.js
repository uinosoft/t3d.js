import {
	Scene,
	Texture2D,
	PBRMaterial,
	ShaderLib,
	Sphere,
	Camera,
	OffscreenRenderTarget,
	ATTACHMENT,
	TEXTURE_FILTER,
	MATERIAL_TYPE,
	Vector2,
	Vector3,
	Matrix4
} from 't3d';
import { SceneUtils } from '../SceneUtils.js';

// https://github.com/agargaro/octahedral-impostor
class OctahedralTextureGenerator {

	/**
	 * Constructor of OctahedralTextureGenerator.
	 * @param {number} [atlasSize = 4096] - The size of the atlas texture.
	 * @param {number} [countPerSide = 16] - The number of sprites per side of the atlas.
	 * @param {number} [cameraFactor = 1] - The factor to adjust the camera view size.
	 * @param {boolean} [useHemiOctahedron = true] - Whether to use hemi-octahedron mapping.
	 */
	constructor(atlasSize = 2048, countPerSide = 16, cameraFactor = 1, useHemiOctahedron = true) {
		this.countPerSide = countPerSide;
		this.atlasSize = atlasSize;
		this.cameraFactor = cameraFactor;
		this.useHemiOctahedron = useHemiOctahedron;

		this.countPerSideMinusOne = countPerSide - 1;
		this.spriteSize = atlasSize / countPerSide;

		this._renderTarget = OffscreenRenderTarget.create2D(atlasSize, atlasSize);

		this._albedoTexture = this._renderTarget.texture;
		this._albedoTexture.magFilter = TEXTURE_FILTER.LINEAR;
		this._albedoTexture.minFilter = TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;

		this._infoTexture = new Texture2D();
		this._infoTexture.magFilter = TEXTURE_FILTER.NEAREST;
		this._infoTexture.minFilter = TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST;
		this._renderTarget.attach(this._infoTexture, ATTACHMENT.COLOR_ATTACHMENT1);

		this._camera = new Camera();
		this._dummyScene = new Scene();
	}

	render(renderer, source) {
		this._dummyScene.add(source);
		this._dummyScene.updateMatrix(true);

		const boundingBox = SceneUtils.setBox3FromObject(source);
		const boundingSphere = new Sphere();
		boundingBox.getBoundingSphere(boundingSphere);

		this._camera.setOrtho(
			-boundingSphere.radius, boundingSphere.radius, -boundingSphere.radius, boundingSphere.radius,
			0.00001, boundingSphere.radius * 2 + 0.00001
		);

		const materialMap = new Map();
		const renderOption = {
			getMaterial: function(renderable) {
				if (materialMap.has(renderable.material)) {
					return materialMap.get(renderable.material);
				} else {
					const material = renderable.material;
					const impostorMaterial = new OctahedralBakeMaterial(material);
					materialMap.set(material, impostorMaterial);
					return impostorMaterial;
				}
			}
		};

		this._renderTarget.setColorClearValue(0, 0, 0, 1).setClear(false, false, false);
		for (let row = 0; row < this.countPerSide; row++) {
			for (let col = 0; col < this.countPerSide; col++) {
				this._renderView(col, row, boundingSphere, renderer, renderOption);
			}
		}

		materialMap.forEach(mat => mat.dispose());

		renderer.generateMipmaps(this._albedoTexture);
		renderer.generateMipmaps(this._infoTexture);

		const transform = new Matrix4();
		const scale = boundingSphere.radius * 2;
		transform.makeScale(scale, scale, scale).setPosition(boundingSphere.center);

		return {
			transform: transform,
			albedoTexture: this._albedoTexture,
			infoTexture: this._infoTexture
		};
	}

	_renderView(col, row, sphere, renderer, renderOption) {
		_coords.set(col / (this.countPerSideMinusOne), row / (this.countPerSideMinusOne));
		if (this.useHemiOctahedron) {
			hemiOctaGridToDir(_coords, this._camera.position);
		} else {
			octaGridToDir(_coords, this._camera.position);
		}

		this._camera.position.normalize().multiplyScalar(sphere.radius * this.cameraFactor).add(sphere.center);
		this._camera.lookAt(sphere.center, new Vector3(0, 1, 0));

	    const xNorm = col / this.countPerSide;
		const yNorm = row / this.countPerSide;
		const wNorm = 1 / this.countPerSide;
		const hNorm = 1 / this.countPerSide;

		this._camera.rect.set(xNorm, yNorm, xNorm + wNorm, yNorm + hNorm);
		this._camera.updateMatrix();

		this._dummyScene.updateRenderStates(this._camera);
		this._dummyScene.updateRenderQueue(this._camera);

		renderer.renderScene(this._dummyScene, this._camera, this._renderTarget, renderOption);
	}

}

const _coords = new Vector2();

function hemiOctaGridToDir(grid, target = new Vector3()) {
	target.set(grid.x - grid.y, 0, -1 + grid.x + grid.y);
	target.y = 1 - Math.abs(target.x) - Math.abs(target.z);
	return target;
}

const absolute = new Vector3();
function octaGridToDir(grid, target = new Vector3()) {
	target.set(2 * (grid.x - 0.5), 0, 2 * (grid.y - 0.5));
	absolute.set(Math.abs(target.x), 0, Math.abs(target.z));
	target.y = 1 - absolute.x - absolute.z;

	if (target.y < 0) {
		target.x = Math.sign(target.x) * (1 - absolute.z);
		target.z = Math.sign(target.z) * (1 - absolute.x);
	}

	return target;
}

class OctahedralBakeMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'oct_bake';

		this.vertexShader = ShaderLib.pbr_vert;
		this.fragmentShader = octahedral_impostor_frag;
	}

}

const octahedral_impostor_frag = `
	#extension GL_EXT_draw_buffers : require
	#include <common_frag>

	uniform float u_Metalness;
	#ifdef USE_METALNESSMAP
		uniform sampler2D metalnessMap;
	#endif

	uniform float u_Roughness;
	#ifdef USE_ROUGHNESSMAP
		uniform sampler2D roughnessMap;
	#endif

	uniform vec3 emissive;

	#include <uv_pars_frag>
	#include <color_pars_frag>
	#include <diffuseMap_pars_frag>
	#include <alphamap_pars_frag>
	#include <alphaTest_pars_frag>
	#include <normalMap_pars_frag>
	#include <aoMap_pars_frag>
	#include <normal_pars_frag>
	#include <clearcoat_pars_frag>
	#include <modelPos_pars_frag>
	#include <emissiveMap_pars_frag>
	#include <logdepthbuf_pars_frag>
	#include <clippingPlanes_pars_frag>

	vec2 unitVectorToOctahedron(vec3 v) {
		vec2 up = v.xz / dot(vec3(1.0), abs(v));
		vec2 down = (1.0 - abs(up.yx)) * sign(up.xy);
		return mix(up, down, step(0.0, -v.y));
	}

	void main() {
		#include <clippingPlanes_frag>
		#include <logdepthbuf_frag>
		#include <begin_frag>
		#include <color_frag>
		#include <diffuseMap_frag>
		#include <alphamap_frag>
		#include <alphaTest_frag>
		#include <normal_frag>

		vec4 info = vec4(.0) ;
		info.rg = unitVectorToOctahedron(N) * 0.5 + 0.5;
		float roughnessFactor = u_Roughness;
		#ifdef USE_ROUGHNESSMAP
			vec4 texelRoughness = texture2D(roughnessMap, v_Uv);
			// reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
			roughnessFactor *= texelRoughness.g;
		#endif

		float metalnessFactor = u_Metalness;
		#ifdef USE_METALNESSMAP
			vec4 texelMetalness = texture2D(metalnessMap, v_Uv);
			// reads channel B, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
			metalnessFactor *= texelMetalness.b;
		#endif
		info.ba = vec2(metalnessFactor, roughnessFactor);

		gl_FragData[0] = outColor;
		gl_FragData[1] = info;
	}
`;

export { OctahedralTextureGenerator, OctahedralBakeMaterial };