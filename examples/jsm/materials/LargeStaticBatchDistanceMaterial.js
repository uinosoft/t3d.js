import { DRAW_SIDE, ShaderMaterial } from 't3d';

const distanceVertexShader = `
#extension GL_ANGLE_multi_draw : require

uniform sampler2D drawIdTexture;
uniform sampler2D staticMatrixTexture;
uniform sampler2D dynamicMatrixTexture;
uniform sampler2D objectDataTexture;

attribute vec3 a_Position;

uniform mat4 u_Model;
uniform mat4 u_ProjectionView;

varying vec3 v_modelPos;

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

void main() {
	int objectId = int(getBatchTextureValue(drawIdTexture, gl_DrawID) + 0.5);
	vec4 objectData = getBatchTextureTexel(objectDataTexture, objectId);
	int matrixId = int(objectData.g + 0.5);
	float objectFlags = objectData.a;
	bool batchIsAnimated = mod(floor(objectFlags), 2.0) > 0.5;
	mat4 batchingMatrix = batchIsAnimated ? getBatchMatrix(dynamicMatrixTexture, matrixId) : getBatchMatrix(staticMatrixTexture, matrixId);
	vec4 worldPosition = u_Model * batchingMatrix * vec4(a_Position, 1.0);
	v_modelPos = worldPosition.xyz;
	gl_Position = u_ProjectionView * worldPosition;
}
`;

const distanceFragmentShader = `
precision highp float;
precision highp sampler2DArray;

uniform sampler2D materialDataTexture;
uniform sampler2DArray baseColorArray;
uniform float u_UseAlphaTest;
uniform float nearDistance;
uniform float farDistance;

varying vec3 v_modelPos;

#include <common_frag>
#include <packing>
#include <clippingPlanes_pars_frag>

void main() {
	#include <clippingPlanes_frag>

	float dist = length(v_modelPos - u_CameraPosition);
	dist = (dist - nearDistance) / (farDistance - nearDistance);
	dist = saturate(dist);
	gl_FragColor = packDepthToRGBA(dist);
}
`;

class LargeStaticBatchDistanceMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: 'LargeStaticBatchDistance',
			uniforms: {
				drawIdTexture: null,
				staticMatrixTexture: null,
				dynamicMatrixTexture: null,
				objectDataTexture: null,
				materialDataTexture: null,
				baseColorArray: null,
				u_UseAlphaTest: 0,
				nearDistance: 1,
				farDistance: 1000
			},
			vertexShader: distanceVertexShader,
			fragmentShader: distanceFragmentShader
		});

		this.shaderName = 'LargeStaticBatchDistance';
		this.side = DRAW_SIDE.DOUBLE;
		this.acceptLight = false;
	}

}

export { LargeStaticBatchDistanceMaterial };
