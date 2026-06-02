import { DRAW_SIDE, Matrix3, ShaderLib, ShaderMaterial, Vector3 } from 't3d';

const batching_pars_vert = `
#extension GL_ANGLE_multi_draw : require

uniform sampler2D drawIdTexture;
uniform sampler2D staticMatrixTexture;
uniform sampler2D dynamicMatrixTexture;
uniform sampler2D objectDataTexture;
uniform sampler2D materialDataTexture;

#ifndef USE_UV1
attribute vec2 a_Uv;
#endif

varying vec4 vBatchBaseColorFactor;
varying vec4 vBatchSurfaceParams;
varying vec4 vBatchUvTransform;
varying vec4 vBatchEmissive;
varying vec4 vBatchExtraParams;
varying float vBatchTextureLayer;
varying float vBatchObjectFlags;
varying float vBatchObjectId;
varying vec2 vBatchUv;

float getBatchTextureValue(const in sampler2D tex, const in int index) {
	int width = textureSize(tex, 0).x;
	int x = index % width;
	int y = index / width;
	return texelFetch(tex, ivec2(x, y), 0).r;
}

vec4 getBatchTextureTexel(const in sampler2D tex, const in int index) {
	int width = textureSize(tex, 0).x;
	int x = index % width;
	int y = index / width;
	return texelFetch(tex, ivec2(x, y), 0);
}

mat4 getBatchMatrix(const in sampler2D tex, const in int matrixId) {
	int pixelIndex = matrixId * 4;
	vec4 c0 = getBatchTextureTexel(tex, pixelIndex + 0);
	vec4 c1 = getBatchTextureTexel(tex, pixelIndex + 1);
	vec4 c2 = getBatchTextureTexel(tex, pixelIndex + 2);
	vec4 c3 = getBatchTextureTexel(tex, pixelIndex + 3);
	return mat4(c0, c1, c2, c3);
}
`;

const batching_position_vert = `
int objectId = int(getBatchTextureValue(drawIdTexture, gl_DrawID) + 0.5);
vec4 objectData = getBatchTextureTexel(objectDataTexture, objectId);
int materialId = int(objectData.r + 0.5);
int matrixId = int(objectData.g + 0.5);
float objectFlags = objectData.a;
bool batchIsAnimated = mod(floor(objectFlags), 2.0) > 0.5;

mat4 batchingMatrix = batchIsAnimated ? getBatchMatrix(dynamicMatrixTexture, matrixId) : getBatchMatrix(staticMatrixTexture, matrixId);
vec4 worldPosition = u_Model * batchingMatrix * vec4(transformed, 1.0);

vBatchTextureLayer = objectData.b;
vBatchBaseColorFactor = getBatchTextureTexel(materialDataTexture, materialId * 5 + 0);
vBatchSurfaceParams = getBatchTextureTexel(materialDataTexture, materialId * 5 + 1);
vBatchUvTransform = getBatchTextureTexel(materialDataTexture, materialId * 5 + 2);
vBatchEmissive = getBatchTextureTexel(materialDataTexture, materialId * 5 + 3);
vBatchExtraParams = getBatchTextureTexel(materialDataTexture, materialId * 5 + 4);
vBatchObjectFlags = objectFlags;
vBatchObjectId = float(objectId);
vBatchUv = a_Uv;

gl_Position = u_ProjectionView * worldPosition;
`;

const batching_normal_vert = `
mat4 batchingNormalMatrix = transposeMat4(inverseMat4(batchingMatrix));
objectNormal = (batchingNormalMatrix * vec4(objectNormal, 0.0)).xyz;

#ifdef USE_TANGENT
	objectTangent = (batchingNormalMatrix * vec4(objectTangent, 0.0)).xyz;
#endif
`;

const batching_pars_frag = `
precision highp sampler2DArray;

uniform sampler2DArray baseColorArray;
uniform sampler2DArray normalMapArray;
uniform sampler2DArray ormMapArray;
uniform sampler2DArray emissiveMapArray;
uniform float u_UseBaseColorMap;
uniform float u_UseNormalMap;
uniform float u_UseORMMap;
uniform float u_UseAlphaTest;
uniform float u_ShowNormalMapOnly;
uniform float u_ShowTangentSpaceHealth;
uniform float u_ForceFlatNormal;
uniform float u_SelectedObjectId;
uniform float u_HighlightMix;
uniform vec3 u_HighlightColor;

varying vec4 vBatchBaseColorFactor;
varying vec4 vBatchSurfaceParams;
varying vec4 vBatchUvTransform;
varying vec4 vBatchEmissive;
varying vec4 vBatchExtraParams;
varying float vBatchTextureLayer;
varying float vBatchObjectFlags;
varying float vBatchObjectId;
varying vec2 vBatchUv;

vec2 getBatchUv() {
	return vBatchUv * vBatchUvTransform.xy + vBatchUvTransform.zw;
}

vec4 batchSRGBToLinear(vec4 value) {
	return vec4(pow(value.rgb, vec3(2.2)), value.a);
}
`;

const batching_diffuse_frag = `
vec2 batchUvDiffuse = getBatchUv();
vec4 batchBaseColor = vBatchBaseColorFactor;
if (u_UseBaseColorMap > 0.5) {
	batchBaseColor *= batchSRGBToLinear(texture(baseColorArray, vec3(batchUvDiffuse, vBatchTextureLayer)));
}
if (u_SelectedObjectId > -0.5 && abs(vBatchObjectId - u_SelectedObjectId) < 0.5) {
	batchBaseColor.rgb = mix(batchBaseColor.rgb, u_HighlightColor, u_HighlightMix);
}
outColor *= batchBaseColor;
`;

const batching_normal_frag = `
vec2 batchUvNormal = getBatchUv();

if (u_ShowTangentSpaceHealth > 0.5) {
	vec2 batchUvDx = dFdx(batchUvNormal);
	vec2 batchUvDy = dFdy(batchUvNormal);
	float uvDerivativeStrength = clamp((length(batchUvDx) + length(batchUvDy)) * 8.0, 0.0, 1.0);
	outColor = vec4(uvDerivativeStrength, 1.0 - uvDerivativeStrength, 0.0, 1.0);
	return;
}

if (u_ShowNormalMapOnly > 0.5) {
	outColor = vec4(texture(normalMapArray, vec3(batchUvNormal, vBatchTextureLayer)).rgb, 1.0);
	return;
}

#ifdef FLAT_SHADED
	vec3 fdx = dFdx(v_modelPos);
	vec3 fdy = dFdy(v_modelPos);
	vec3 N = normalize(cross(fdx, fdy));
#else
	vec3 N = normalize(v_Normal);
	#ifdef DOUBLE_SIDED
		N = N * (float(gl_FrontFacing) * 2.0 - 1.0);
	#endif
#endif

#ifdef USE_TBN
	vec3 tangent = normalize(v_Tangent);
	vec3 bitangent = normalize(v_Bitangent);
	#ifdef DOUBLE_SIDED
		tangent = tangent * (float(gl_FrontFacing) * 2.0 - 1.0);
		bitangent = bitangent * (float(gl_FrontFacing) * 2.0 - 1.0);
	#endif
	mat3 tspace = mat3(tangent, bitangent, N);
#endif

vec3 geometryNormal = N;
bool batchUseNormalMap = u_UseNormalMap > 0.5 && u_ForceFlatNormal < 0.5 && mod(floor(vBatchObjectFlags / 2.0), 2.0) > 0.5;

#ifdef USE_TANGENT
if (batchUseNormalMap) {
	vec3 mapN = texture(normalMapArray, vec3(batchUvNormal, vBatchTextureLayer)).rgb * 2.0 - 1.0;
	mapN.xy *= vBatchExtraParams.xy;
	N = normalize(tspace * mapN);
}
#endif

#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif
`;

const batching_alpha_test_frag = `
float batchAlphaCutoff = vBatchSurfaceParams.b;
if (u_UseAlphaTest > 0.5 && batchAlphaCutoff > 0.0 && outColor.a < batchAlphaCutoff) discard;
`;

const batching_surface_frag = `
vec2 batchUvSurface = getBatchUv();
vec4 batchOrmSample = u_UseORMMap > 0.5 ? texture(ormMapArray, vec3(batchUvSurface, vBatchTextureLayer)) : vec4(1.0);
float roughnessFactor = clamp(vBatchSurfaceParams.r, 0.04, 1.0) * batchOrmSample.g;
float metalnessFactor = clamp(vBatchSurfaceParams.g, 0.0, 1.0) * batchOrmSample.b;
`;

const batching_ao_frag = `
float ambientOcclusion = u_UseORMMap > 0.5 ? (batchOrmSample.r - 1.0) * vBatchSurfaceParams.a + 1.0 : 1.0;

reflectedLight.indirectDiffuse *= ambientOcclusion;

#if defined(USE_ENV_MAP) && defined(USE_PBR)
	float dotNV = saturate(dot(N, V));
	reflectedLight.indirectSpecular *= computeSpecularOcclusion(dotNV, ambientOcclusion, roughness);
#endif
`;

const batching_emissive_frag = `
vec2 batchUvEmissive = getBatchUv();
vec3 emissiveMapColor = batchSRGBToLinear(texture(emissiveMapArray, vec3(batchUvEmissive, vBatchTextureLayer))).rgb;
vec3 totalEmissiveRadiance = vBatchEmissive.rgb * emissiveMapColor;
`;

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

let pbr_frag = ShaderLib.pbr_frag;
pbr_frag = pbr_frag.replace('#include <dithering_pars_frag>', `
#include <dithering_pars_frag>
${batching_pars_frag}
`);
pbr_frag = pbr_frag.replace('#include <diffuseMap_frag>', batching_diffuse_frag);
pbr_frag = pbr_frag.replace('#include <normal_frag>', batching_normal_frag);
pbr_frag = pbr_frag.replace('#include <alphaTest_frag>', batching_alpha_test_frag);
pbr_frag = pbr_frag.replace(/float roughnessFactor = u_Roughness;[\s\S]*?float metalnessFactor = u_Metalness;[\s\S]*?#endif/g, batching_surface_frag);
pbr_frag = pbr_frag.replace('#include <aoMap_frag>', batching_ao_frag);
pbr_frag = pbr_frag.replace(/vec3 totalEmissiveRadiance = emissive;[\s\S]*?#include <emissiveMap_frag>/g, batching_emissive_frag);

class LargeStaticBatchMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: 'LargeStaticBatchPBR',
			defines: {
				USE_UV1: true,
				USE_NORMAL_MAP: true
			},
			uniforms: {
				drawIdTexture: null,
				staticMatrixTexture: null,
				dynamicMatrixTexture: null,
				objectDataTexture: null,
				materialDataTexture: null,
				baseColorArray: null,
				normalMapArray: null,
				ormMapArray: null,
				emissiveMapArray: null,
				u_UseBaseColorMap: 1,
				u_UseNormalMap: 1,
				u_UseORMMap: 1,
				u_UseAlphaTest: 1,
				u_ShowNormalMapOnly: 0,
				u_ShowTangentSpaceHealth: 0,
				u_ForceFlatNormal: 0,
				u_SelectedObjectId: -1,
				u_HighlightMix: 0.45,
				u_HighlightColor: new Vector3(1.0, 0.82, 0.18),
				uvTransform: new Matrix3().elements
			},
			vertexShader: pbr_vert,
			fragmentShader: pbr_frag
		});

		this.shaderName = 'LargeStaticBatchPBR';
		this.side = DRAW_SIDE.DOUBLE;
		this.acceptLight = true;
		this.envMap = undefined;
	}

}

export { LargeStaticBatchMaterial };
