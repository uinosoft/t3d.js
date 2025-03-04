import { ShaderLib, PBRMaterial, MATERIAL_TYPE } from 't3d';

const batching_pars_vert = `
#ifdef USE_BATCHING
	#extension GL_ANGLE_multi_draw: require

	uniform usampler2D batchingIdTexture;
	uniform sampler2D batchingTexture;

	float getIndirectIndex(const in int i) {
		int size = textureSize(batchingIdTexture, 0).x;
		int x = i % size;
		int y = i / size;
		return float(texelFetch(batchingIdTexture, ivec2(x, y), 0).r);
	}

	mat4 getBatchingMatrix(const in float i) {
		int size = textureSize(batchingTexture, 0).x;
		int j = int(i) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch(batchingTexture, ivec2(x, y), 0);
		vec4 v2 = texelFetch(batchingTexture, ivec2(x + 1, y), 0);
		vec4 v3 = texelFetch(batchingTexture, ivec2(x + 2, y), 0);
		vec4 v4 = texelFetch(batchingTexture, ivec2(x + 3, y), 0);
		return mat4(v1, v2, v3, v4);
	}

	#ifdef USE_BATCHING_COLOR
		uniform sampler2D batchingColorTexture;
		vec4 getBatchingColor(const in float i) {
			int size = textureSize(batchingColorTexture, 0).x;
			int j = int(i);
			int x = j % size;
			int y = j / size;
			return texelFetch(batchingColorTexture, ivec2(x, y), 0);
		}

		varying vec4 v_BatchingColor;
	#endif
#endif
`;

const batching_position_vert = `
#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix(getIndirectIndex(gl_DrawID));
	vec4 worldPosition = u_Model * batchingMatrix * vec4(transformed, 1.0);
#else
	vec4 worldPosition = u_Model * vec4(transformed, 1.0);
#endif
gl_Position = u_ProjectionView * worldPosition;
`;

const batching_normal_vert = `
#ifdef USE_BATCHING
	mat4 batchingNormalMatrix = transposeMat4(inverseMat4(batchingMatrix));

	objectNormal = (batchingNormalMatrix * vec4(objectNormal, 0.0)).xyz;

	#ifdef USE_TANGENT
		objectTangent = (batchingNormalMatrix * vec4(objectTangent, 0.0)).xyz;
	#endif
#endif
`;

const batching_color_vert = `
#if defined(USE_BATCHING) && defined(USE_BATCHING_COLOR)
	v_BatchingColor = getBatchingColor(getIndirectIndex(gl_DrawID));
#endif
`;

const batching_pars_frag = `
#if defined(USE_BATCHING) && defined(USE_BATCHING_COLOR)
	varying vec4 v_BatchingColor;
#endif
`;

const batching_color_frag = `
#if defined(USE_BATCHING) && defined(USE_BATCHING_COLOR)
	outColor *= v_BatchingColor;
#endif
`;

// BatchedPBRMaterial

let pbr_vert = ShaderLib.pbr_vert;

pbr_vert = pbr_vert.replace('#include <logdepthbuf_pars_vert>', `
#include <logdepthbuf_pars_vert>
${batching_pars_vert}
`);

pbr_vert = pbr_vert.replace('#include <pvm_vert>', batching_position_vert);

pbr_vert = pbr_vert.replace('#include <normal_vert>', `
${batching_normal_vert}
#include <normal_vert>
`);

pbr_vert = pbr_vert.replace('#include <color_vert>', `
#include <color_vert>
${batching_color_vert}
`);

let pbr_frag = ShaderLib.pbr_frag;

pbr_frag = pbr_frag.replace('#include <color_pars_frag>', `
#include <color_pars_frag>
${batching_pars_frag}
`);

pbr_frag = pbr_frag.replace('#include <color_frag>', `
#include <color_frag>
${batching_color_frag}
`);

class BatchedPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'BatchedPBR';

		this.vertexShader = pbr_vert;
		this.fragmentShader = pbr_frag;

		this.defines.USE_BATCHING = true;
		this.defines.USE_BATCHING_COLOR = false;

		this.uniforms.batchingIdTexture = null;
		this.uniforms.batchingTexture = null;
		this.uniforms.batchingColorTexture = null;
	}

}

// TODO BatchedDepthMaterial

export {
	BatchedPBRMaterial,
	batching_pars_vert,
	batching_position_vert, batching_normal_vert, batching_color_vert,
	batching_pars_frag, batching_color_frag
};