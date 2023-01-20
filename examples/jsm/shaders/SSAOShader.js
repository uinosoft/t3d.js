/**
 * SSAO Shader
 */



var SSAOShader = {

	defines: {
		'DEPTH_PACKING': 0
	},

	uniforms: {
		'normalTex': null,
		'depthTex': null,
		'texSize': [512, 512],
		'noiseTex': null,
		'noiseTexSize': [4, 4],
		'projection': new Float32Array(16),
		'projectionInv': new Float32Array(16),
		'viewInverseTranspose': new Float32Array(16),
		'kernel': null,
		'radius': 0.2,
		'power': 1,
		'bias': 0.0001,
		'intensity': 1
	},

	vertexShader: [
		"attribute vec3 a_Position;",
		"attribute vec2 a_Uv;",

		"uniform mat4 u_ProjectionView;",
		"uniform mat4 u_Model;",

		"varying vec2 v_Uv;",

		"void main() {",

		"	v_Uv = a_Uv;",

		"	gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

		"}"
	].join("\n"),

	fragmentShader: [
		"#include <packing>",

		"varying vec2 v_Uv;",

		"uniform sampler2D normalTex;",

		"uniform sampler2D depthTex;",

		"uniform vec2 texSize;",

		"uniform sampler2D noiseTex;",

		"uniform vec2 noiseTexSize;",

		"uniform mat4 projection;",

		"uniform mat4 projectionInv;",

		"uniform mat4 viewInverseTranspose;",

		"uniform vec3 kernel[KERNEL_SIZE];",

		"uniform float radius;",

		"uniform float power;",

		"uniform float bias;",

		"uniform float intensity;",

		"float getDepth( const in vec2 screenPosition ) {",
		"	#if DEPTH_PACKING == 1",
		"		return unpackRGBAToDepth( texture2D( depthTex, screenPosition ) );",
		"	#else",
		"		return texture2D( depthTex, screenPosition ).r;",
		"	#endif",
		"}",

		"vec3 getViewNormal( const in vec2 screenPosition ) {",
		"	vec3 normal = texture2D( normalTex, screenPosition ).xyz * 2.0 - 1.0;",
		// Convert to view space
		"	return (viewInverseTranspose * vec4(normal, 0.0)).xyz;",
		"}",

		"float ssaoEstimator(in mat3 kernelBasis, in vec3 originPos, in vec3 N) {",
		"	float occlusion = 0.0;",

		"	for (int i = 0; i < KERNEL_SIZE; i++) {",
		"		vec3 samplePos = kernel[i];",
		"		samplePos = kernelBasis * samplePos;",
		"		samplePos = samplePos * radius + originPos;",

		"		vec4 texCoord = projection * vec4(samplePos, 1.0);",
		"		texCoord.xy /= texCoord.w;",
		"		texCoord.xy = texCoord.xy * 0.5 + 0.5;",

		"		float sampleDepth = getDepth(texCoord.xy);",
		"		float z = sampleDepth * 2.0 - 1.0;",

		"		#ifdef ALCHEMY",
		// todo not work
		"			vec4 projectedPos = vec4(texCoord.xy * 2.0 - 1.0, z, 1.0);",
		"			vec4 p4 = projectionInv * projectedPos;",
		"			p4.xyz /= p4.w;",
		"			vec3 cDir = p4.xyz - originPos;",

		"			float vv = dot(cDir, cDir);",
		"			float vn = dot(cDir, N);",

		"			float radius2 = radius * radius;",

		"			vn = max(vn + p4.z * bias, 0.0);",
		"			float f = max(radius2 - vv, 0.0) / radius2;",
		"			occlusion += f * f * f * max(vn / (0.01 + vv), 0.0);",
		"		#else",
		// just for perspective camera
		"			if (projection[3][3] == 0.0) {",
		"				z = projection[3][2] / (z * projection[2][3] - projection[2][2]);",
		"			} else {",
		"				z = (z - projection[3][2]) / projection[2][2];",
		"			}",

		"			float factor = step(samplePos.z, z - bias);",
		"			float rangeCheck = smoothstep(0.0, 1.0, radius / abs(originPos.z - z));",
		"			occlusion += rangeCheck * factor;",

		"		#endif",
		"	}",
		"	occlusion = 1.0 - occlusion / float(KERNEL_SIZE);",
		// "	occlusion = 1.0 - clamp((occlusion / float(KERNEL_SIZE) - 0.6) * 2.5, 0.0, 1.0);",
		"	return pow(occlusion, power);",
		"}",

		"void main() {",

		"	float centerDepth = getDepth( v_Uv );",
		"	if( centerDepth >= ( 1.0 - EPSILON ) ) {",
		"		discard;",
		"	}",

		"	vec3 N = getViewNormal( v_Uv );",

		"	vec2 noiseTexCoord = texSize / vec2(noiseTexSize) * v_Uv;",
		"	vec3 rvec = texture2D(noiseTex, noiseTexCoord).rgb * 2.0 - 1.0;",

		// Tangent
		"	vec3 T = normalize(rvec - N * dot(rvec, N));",
		// Bitangent
		"	vec3 BT = normalize(cross(N, T));",
		"	mat3 kernelBasis = mat3(T, BT, N);",

		// view position
		"	float z = centerDepth * 2.0 - 1.0;",
		"	vec4 projectedPos = vec4(v_Uv * 2.0 - 1.0, z, 1.0);",
		"	vec4 p4 = projectionInv * projectedPos;",
		"	vec3 position = p4.xyz / p4.w;",

		"	float ao = ssaoEstimator(kernelBasis, position, N);",
		"	ao = clamp(1.0 - (1.0 - ao) * intensity, 0.0, 1.0);",
		"	gl_FragColor = vec4(vec3(ao), 1.0);",

		"}"
	].join("\n")

}

export { SSAOShader };