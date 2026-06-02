import { DRAW_SIDE, ShaderMaterial } from 't3d';

const pickVertexShader = `
#extension GL_ANGLE_multi_draw : require

uniform sampler2D drawIdTexture;
uniform sampler2D staticMatrixTexture;
uniform sampler2D dynamicMatrixTexture;
uniform sampler2D objectDataTexture;
uniform float u_PickIdOffset;

attribute vec3 a_Position;

uniform mat4 u_Model;
uniform mat4 u_ProjectionView;

varying float vPickId;

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
	gl_Position = u_ProjectionView * u_Model * batchingMatrix * vec4(a_Position, 1.0);
	vPickId = u_PickIdOffset + float(objectId) + 1.0;
}
`;

const pickFragmentShader = `
precision highp float;

varying float vPickId;

vec3 encodePickId(const in float pickId) {
	float r = mod(pickId, 256.0);
	float g = mod(floor(pickId / 256.0), 256.0);
	float b = mod(floor(pickId / 65536.0), 256.0);
	return vec3(r, g, b) / 255.0;
}

void main() {
	gl_FragColor = vec4(encodePickId(vPickId), 1.0);
}
`;

class LargeStaticBatchPickMaterial extends ShaderMaterial {

	constructor() {
		super({
			name: 'LargeStaticBatchPick',
			uniforms: {
				drawIdTexture: null,
				staticMatrixTexture: null,
				dynamicMatrixTexture: null,
				objectDataTexture: null,
				u_PickIdOffset: 0
			},
			vertexShader: pickVertexShader,
			fragmentShader: pickFragmentShader
		});

		this.shaderName = 'LargeStaticBatchPick';
		this.side = DRAW_SIDE.DOUBLE;
		this.acceptLight = false;
	}

}

export { LargeStaticBatchPickMaterial };
