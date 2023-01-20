/**
 * Blur Shader
 */



var BlurShader = {

	defines: {
		"NORMALTEX_ENABLED": 0,
		"DEPTHTEX_ENABLED": 0,
		'DEPTH_PACKING': 0,
		'KERNEL_SIZE_INT': '5',
		'KERNEL_SIZE_FLOAT': '5.0',
	},
	uniforms: {
		'tDiffuse': null,
		'textureSize': [512, 512],
		'direction': 0, // 0 horizontal, 1 vertical
		'blurSize': 1,
		'kernel': [0.122581, 0.233062, 0.288713, 0.233062, 0.122581],
		'normalTex': null,
		'depthTex': null,
		'projection': new Float32Array(16),
		'viewInverseTranspose': new Float32Array(16),
		'depthRange': 1
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
		"varying vec2 v_Uv;",

		"uniform sampler2D tDiffuse;",

		"uniform vec2 textureSize;",

		// 0 horizontal, 1 vertical
		"uniform int direction;",

		"uniform float blurSize;",

		"uniform float kernel[KERNEL_SIZE_INT];",

		"#if NORMALTEX_ENABLED == 1",
		"	uniform sampler2D normalTex;",
		"	uniform mat4 viewInverseTranspose;",
		"	vec3 getViewNormal( const in vec2 screenPosition ) {",
		"		vec3 normal = texture2D( normalTex, screenPosition ).xyz * 2.0 - 1.0;",
		// Convert to view space
		"		return (viewInverseTranspose * vec4(normal, 0.0)).xyz;",
		"	}",
		"#endif",

		"#if DEPTHTEX_ENABLED == 1",
		"	#if DEPTH_PACKING == 1",
		"		#include <packing>",
		"	#endif",
		"	uniform sampler2D depthTex;",
		"	uniform mat4 projection;",
		"	uniform float depthRange;",
		"	float getDepth( const in vec2 screenPosition ) {",
		"		#if DEPTH_PACKING == 1",
		"			return unpackRGBAToDepth( texture2D( depthTex, screenPosition ) );",
		"		#else",
		"			return texture2D( depthTex, screenPosition ).r;",
		"		#endif",
		"	}",
		"	float getLinearDepth(vec2 coord) {",
		"		float depth = getDepth(coord) * 2.0 - 1.0;",
		"		return projection[3][2] / (depth * projection[2][3] - projection[2][2]);",
		"	}",
		"#endif",

		"void main() {",

		// "float kernel[5];",
		// "kernel[0] = 0.122581;",
		// "kernel[1] = 0.233062;",
		// "kernel[2] = 0.288713;",
		// "kernel[3] = 0.233062;",
		// "kernel[4] = 0.122581;",

		"	vec2 off = vec2(0.0);",
		"	if (direction == 0) {",
		"		off[0] = blurSize / textureSize.x;",
		"	} else {",
		"		off[1] = blurSize / textureSize.y;",
		"	}",

		"	vec4 sum = vec4(0.0);",
		"	float weightAll = 0.0;",

		"	#if NORMALTEX_ENABLED == 1",
		"		vec3 centerNormal = getViewNormal(v_Uv);",
		"	#endif",
		"	#if DEPTHTEX_ENABLED == 1",
		"		float centerDepth = getLinearDepth(v_Uv);",
		"	#endif",

		"	for (int i = 0; i < KERNEL_SIZE_INT; i++) {",
		"		vec2 coord = clamp(v_Uv + vec2(float(i) - (KERNEL_SIZE_FLOAT - 1.) / 2.) * off, vec2(0.0), vec2(1.0));",
		"		float w = kernel[i];",

		"		#if NORMALTEX_ENABLED == 1",
		"			vec3 normal = getViewNormal(coord);",
		"			w *= clamp(dot(normal, centerNormal), 0.0, 1.0);",
		"		#endif",
		"		#if DEPTHTEX_ENABLED == 1",
		"			float d = getLinearDepth(coord);",
		// PENDING Better equation?
		// "w *= (1.0 - smoothstep(abs(centerDepth - d) / depthRange, 0.0, 1.0));",
		"			w *= (1.0 - smoothstep(0.0, 1.0, abs(centerDepth - d) / depthRange));",
		"		#endif",

		"		weightAll += w;",
		"		sum += w * texture2D(tDiffuse, coord);",
		"	}",

		"	gl_FragColor = sum / weightAll;",

		"}"

	].join("\n")

};

export { BlurShader };