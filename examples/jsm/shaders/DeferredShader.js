/**
 * shaders for deferred renderer
 */



var DeferredShader = (function() {
	var DeferredShaderChunk = {

		packVector3: [

			"float vec3_to_float( vec3 data ) {",

			"	const float unit = 254.0/256.0;", // todo 255.0 / 256.0 error, why ?
			"	highp float compressed = fract( data.x * unit ) + floor( data.y * unit * 255.0 ) + floor( data.z * unit * 255.0 ) * 255.0;",
			"	return compressed;",

			"}"

		].join("\n"),

		unpackFloat: [

			"vec3 float_to_vec3( float data ) {",

			"	const float unit = 255.0;",
			"	vec3 uncompressed;",
			"	uncompressed.x = fract( data );",
			"	float zInt = floor( data / unit );",
			"	uncompressed.z = fract( zInt / unit );",
			"	uncompressed.y = fract( floor( data - ( zInt * unit ) ) / unit );",
			"	return uncompressed;",

			"}"

		].join("\n"),

		// Refer to http://aras-p.info/texts/CompactNormalStorage.html
		packNormal: [

			"vec2 normal_to_vec2( vec3 normal ) {",

			"	return normal.xy / sqrt( normal.z * 8.0 + 8.0 ) + 0.5;",

			"}"

		].join("\n"),

		unpackVector2: [

			"vec3 vec2_to_normal( vec2 data ) {",

			"	vec2 fenc = data * 4.0 - 2.0;",
			"	float f = dot( fenc, fenc );",
			"	float g = sqrt( 1.0 - f / 4.0 );",
			"	vec3 normal;",
			"	normal.xy = fenc * g;",
			"	normal.z = 1.0 - f / 2.0;",
			"	return normal;",

			"}"

		].join("\n"),

		computeTextureCoord: [

			"vec2 texCoord = gl_FragCoord.xy / vec2( viewWidth, viewHeight );"

		].join("\n"),

		packNormalDepth: [

			"vec4 packedNormalDepth;",
			"packedNormalDepth.xyz = normal * 0.5 + 0.5;",
			"packedNormalDepth.w = position.z / position.w;"

		].join("\n"),

		unpackNormalDepth: [

			"vec4 normalDepthMap = texture2D( samplerNormalDepth, texCoord );",
			"float depth = normalDepthMap.w;",

			"if ( depth == 0.0 ) discard;",

			"vec3 normal = normalDepthMap.xyz * 2.0 - 1.0;"

		].join("\n"),

		packNormalDepthShininess: [

			"vec4 packedNormalDepthShininess;",
			"packedNormalDepthShininess.xy = normal_to_vec2( normal );",
			"packedNormalDepthShininess.z = shininess;",
			"packedNormalDepthShininess.w = position.z / position.w;"

		].join("\n"),

		unpackNormalDepthShininess: [

			"vec4 normalDepthMap = texture2D( samplerNormalDepthShininess, texCoord );",
			"float depth = normalDepthMap.w;",

			"if ( depth == 0.0 ) discard;",

			"vec3 normal = vec2_to_normal( normalDepthMap.xy );",
			"float shininess = normalDepthMap.z;"

		].join("\n"),

		packColor: [

			"vec4 packedColor;",
			"packedColor.x = vec3_to_float( diffuseColor.rgb );",
			"packedColor.y = vec3_to_float( emissiveColor );",
			"packedColor.z = vec3_to_float( specularColor );",
			"packedColor.w = shininess;"

		].join("\n"),

		unpackColor: [

			"vec4 colorMap = texture2D( samplerColor, texCoord );",
			"vec3 diffuseColor = float_to_vec3( colorMap.x );",
			"vec3 emissiveColor = float_to_vec3( colorMap.y );",
			"vec3 specularColor = float_to_vec3( colorMap.z );",
			"float shininess = colorMap.w;"

		].join("\n"),

		packLight: [

			"vec4 packedLight;",
			"packedLight.xyz = lightIntensity * PI * lightColor * max( dot( lightVector, normal ), 0.0 ) * attenuation;",
			"packedLight.w = lightIntensity * PI * specular * max( dot( lightVector, normal ), 0.0 );"

		].join("\n"),

		computeVertexPositionVS: [

			"vec2 xy = texCoord * 2.0 - 1.0;",
			"vec4 vertexPositionProjected = vec4( xy, depth, 1.0 );",
			"vec4 vertexPositionVS = matProjViewInverse * vertexPositionProjected;",
			"vertexPositionVS.xyz /= vertexPositionVS.w;",
			"vertexPositionVS.w = 1.0;"

		].join("\n"),

		// TODO: calculate schlick
		computeSpecular: [

			"vec3 halfVector = normalize( lightVector + viewVector );",
			"float dotNormalHalf = max( dot( normal, halfVector ), 0.0 );",
			"float specular = D_BlinnPhong(shininess, dotNormalHalf);"

		].join("\n"),

		combine: [

			"gl_FragColor = vec4( lightIntensity * PI * lightColor * max( dot( lightVector, normal ), 0.0 ) * ( diffuseColor + specular * specularColor ) * attenuation, 1.0 );"

		].join("\n")

	};

	var DeferredShader = {

		// rgb: normal, a: depth
		normalDepth: {

			vertexShader: [

				"#include <common_vert>",
				"#include <morphtarget_pars_vert>",
				"#include <skinning_pars_vert>",
				"#include <normal_pars_vert>",
				"#include <uv_pars_vert>",
				"varying vec4 vPosition;",
				"void main() {",
				"#include <uv_vert>",
				"#include <begin_vert>",
				"#include <morphtarget_vert>",
				"#include <morphnormal_vert>",
				"#include <skinning_vert>",
				"#include <skinnormal_vert>",
				"#include <normal_vert>",
				"#include <pvm_vert>",
				"vPosition = gl_Position;",
				"}"

			].join("\n"),

			fragmentShader: [

				"#include <common_frag>",
				"#include <diffuseMap_pars_frag>",

				"#include <uv_pars_frag>",

				"#include <packing>",
				"#include <normal_pars_frag>",

				"varying vec4 vPosition;",

				"void main() {",
				"#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)",
				"vec4 texelColor = texture2D( diffuseMap, v_Uv );",

				"float alpha = texelColor.a * u_Opacity;",
				"if(alpha < ALPHATEST) discard;",
				"#endif",

				"vec3 normal = normalize(v_Normal);",
				"vec4 position = vPosition;",

				DeferredShaderChunk.packNormalDepth,

				"gl_FragColor = packedNormalDepth;",
				"}"

			].join("\n")

		},

		// r: diffuse, g: emissive, b: speculer, a: shininess
		color: {

			uniforms: {

				specular: [1, 1, 1],
				shininess: 30

			},

			vertexShader: [
				"#include <common_vert>",
				"#include <uv_pars_vert>",
				"#include <color_pars_vert>",
				"#include <envMap_pars_vert>",
				"#include <skinning_pars_vert>",
				"void main() {",
				"#include <begin_vert>",
				"#include <skinning_vert>",
				"#include <pvm_vert>",
				"#include <uv_vert>",
				"#include <color_vert>",
				"}"
			].join("\n"),

			fragmentShader: [

				"uniform vec3 u_Color;",
				"uniform vec3 emissive;",
				"uniform vec3 specular;",
				"uniform float shininess;",

				"#include <uv_pars_frag>",
				"#include <diffuseMap_pars_frag>",

				DeferredShaderChunk.packVector3,

				"void main() {",

				"vec4 outColor = vec4( u_Color, 1.0 );",
				"#include <diffuseMap_frag>",
				"vec4 diffuseColor = outColor;",
				"vec3 emissiveColor = emissive;",
				"vec3 specularColor = specular;",

				DeferredShaderChunk.packColor,

				"gl_FragColor = packedColor;",

				"}"

			].join("\n")

		},

		emissiveLight: {

			uniforms: {
				samplerColor: null,

				viewWidth: 800,
				viewHeight: 600
			},

			vertexShader: [

				"attribute vec3 a_Position;",

				"uniform mat4 u_ProjectionView;",
				"uniform mat4 u_Model;",

				"void main() {",

				"gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

				"}"

			].join('\n'),

			fragmentShader: [

				"uniform sampler2D samplerColor;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",

				DeferredShaderChunk.unpackFloat,

				"void main() {",

				DeferredShaderChunk.computeTextureCoord,
				DeferredShaderChunk.unpackColor,

				"gl_FragColor = vec4( emissiveColor, 1.0 );",

				"}"

			].join('\n')

		},

		directionalLight: {

			defines: {

				"SHADOW": 0

			},

			uniforms: {

				samplerNormalDepth: null,
				samplerColor: null,

				lightColor: [0, 0, 0],
				lightDirectionVS: [0, 1, 0],
				lightIntensity: 1,

				shadowMatrix: new Float32Array(16),
				shadowMap: null,
				shadowBias: 0,
				shadowRadius: 1,
				shadowMapSize: [1024, 1024],

				viewWidth: 800,
				viewHeight: 600,

				matProjViewInverse: new Float32Array(16),
				cameraPos: [0, 0, 0]

			},

			vertexShader: [

				"attribute vec3 a_Position;",

				"uniform mat4 u_ProjectionView;",
				"uniform mat4 u_Model;",

				"void main() {",

				"gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

				"}"

			].join('\n'),

			fragmentShader: [

				"#include <bsdfs>",

				"uniform sampler2D samplerNormalDepth;",
				"uniform sampler2D samplerColor;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",

				"uniform vec3 lightColor;",
				"uniform vec3 lightDirectionVS;",
				"uniform float lightIntensity;",

				"#if SHADOW == 1",

				"uniform sampler2D shadowMap;",
				"uniform mat4 shadowMatrix;",

				"uniform float shadowBias;",
				"uniform float shadowRadius;",
				"uniform vec2 shadowMapSize;",

				"#include <packing>",
				"#include <shadow>",

				"#endif",

				"uniform mat4 matProjViewInverse;",
				"uniform vec3 cameraPos;",

				DeferredShaderChunk.unpackFloat,

				"void main() {",

				DeferredShaderChunk.computeTextureCoord,
				DeferredShaderChunk.unpackNormalDepth,
				DeferredShaderChunk.computeVertexPositionVS,
				DeferredShaderChunk.unpackColor,

				"vec3 lightVector = normalize( lightDirectionVS );",
				"vec3 viewVector = normalize( cameraPos - vertexPositionVS.xyz );",

				DeferredShaderChunk.computeSpecular,

				"float attenuation = 1.0 / PI;",

				"#if SHADOW == 1",
				"attenuation *= getShadow(shadowMap, shadowMatrix * vertexPositionVS, shadowMapSize, vec2(shadowBias, 0.), vec2(shadowRadius, 0.));",
				"#endif",

				DeferredShaderChunk.combine,

				"}"

			].join('\n')

		},

		pointLight: {

			defines: {

				"SHADOW": 0

			},

			uniforms: {

				samplerNormalDepth: null,
				samplerColor: null,

				lightColor: [0, 0, 0],
				lightPositionVS: [0, 1, 0],
				lightRadius: 1,
				lightDecay: 1,
				lightIntensity: 1,

				shadowMap: null,
				shadowBias: 0,
				shadowRadius: 1,
				shadowMapSize: [1024, 1024],
				shadowCameraNear: 1,
				shadowCameraFar: 100,

				viewWidth: 800,
				viewHeight: 600,

				matProjViewInverse: new Float32Array(16),
				cameraPos: [0, 0, 0]

			},

			vertexShader: [

				"attribute vec3 a_Position;",

				"uniform mat4 u_ProjectionView;",
				"uniform mat4 u_Model;",

				"void main() {",

				"gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

				"}"

			].join('\n'),

			fragmentShader: [

				"#include <bsdfs>",

				"uniform sampler2D samplerNormalDepth;",
				"uniform sampler2D samplerColor;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",

				"uniform vec3 lightColor;",
				"uniform vec3 lightPositionVS;",
				"uniform float lightRadius;",
				"uniform float lightDecay;",
				"uniform float lightIntensity;",

				"#if SHADOW == 1",

				"uniform samplerCube shadowMap;",

				"uniform float shadowBias;",
				"uniform float shadowRadius;",
				"uniform vec2 shadowMapSize;",

				"uniform float shadowCameraNear;",
				"uniform float shadowCameraFar;",

				"#include <packing>",
				"#include <shadow>",

				"#endif",

				"uniform mat4 matProjViewInverse;",
				"uniform vec3 cameraPos;",

				DeferredShaderChunk.unpackFloat,

				"void main() {",

				DeferredShaderChunk.computeTextureCoord,
				DeferredShaderChunk.unpackNormalDepth,
				DeferredShaderChunk.computeVertexPositionVS,

				"vec3 lightVector = lightPositionVS - vertexPositionVS.xyz;",
				"float distance = length( lightVector );",

				"if ( distance > lightRadius ) discard;",

				"lightVector = normalize( lightVector );",
				"vec3 viewVector = normalize( cameraPos - vertexPositionVS.xyz );",

				DeferredShaderChunk.unpackColor,
				DeferredShaderChunk.computeSpecular,

				"float attenuation = pow(clamp(1. - distance / lightRadius, 0.0, 1.0), lightDecay) / PI;",

				"#if SHADOW == 1",
				"attenuation *= getPointShadow(shadowMap, vec4(vertexPositionVS.xyz - lightPositionVS, 1.0), shadowMapSize, vec2(shadowBias, 0.), vec2(shadowRadius, 0.), vec2(shadowCameraNear, shadowCameraFar));",
				"#endif",

				DeferredShaderChunk.combine,

				"}"

			].join('\n')

		},

		spotLight: {

			defines: {

				"SHADOW": 0

			},

			uniforms: {

				samplerNormalDepth: null,
				samplerColor: null,

				lightColor: [0, 0, 0],
				lightDirectionVS: [0, 1, 0],
				lightPositionVS: [0, 0, 0],
				lightConeCos: 1,
				lightPenumbraCos: 1,
				lightRadius: 1,
				lightDecay: 1,
				lightIntensity: 1,

				shadowMatrix: new Float32Array(16),
				shadowMap: null,
				shadowBias: 0,
				shadowRadius: 1,
				shadowMapSize: [1024, 1024],

				viewWidth: 800,
				viewHeight: 600,

				matProjViewInverse: new Float32Array(16),
				cameraPos: [0, 0, 0]

			},

			vertexShader: [

				"attribute vec3 a_Position;",

				"uniform mat4 u_ProjectionView;",
				"uniform mat4 u_Model;",

				"void main() {",

				"gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

				"}"

			].join('\n'),

			fragmentShader: [

				"#include <bsdfs>",

				"uniform sampler2D samplerNormalDepth;",
				"uniform sampler2D samplerColor;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",

				"uniform vec3 lightColor;",
				"uniform vec3 lightPositionVS;",
				"uniform vec3 lightDirectionVS;",
				"uniform float lightConeCos;",
				"uniform float lightPenumbraCos;",
				"uniform float lightRadius;",
				"uniform float lightDecay;",
				"uniform float lightIntensity;",

				"#if SHADOW == 1",

				"uniform sampler2D shadowMap;",
				"uniform mat4 shadowMatrix;",

				"uniform float shadowBias;",
				"uniform float shadowRadius;",
				"uniform vec2 shadowMapSize;",

				"#include <packing>",
				"#include <shadow>",

				"#endif",

				"uniform mat4 matProjViewInverse;",
				"uniform vec3 cameraPos;",

				DeferredShaderChunk.unpackFloat,

				"void main() {",

				DeferredShaderChunk.computeTextureCoord,
				DeferredShaderChunk.unpackNormalDepth,
				DeferredShaderChunk.computeVertexPositionVS,
				DeferredShaderChunk.unpackColor,

				"vec3 lightVector = lightPositionVS.xyz - vertexPositionVS.xyz;",
				"float distance = length( lightVector );",

				"lightVector = normalize( lightVector );",

				"float angleCos = dot( lightDirectionVS, lightVector );",

				"if ( angleCos <= lightConeCos ) discard;",
				"if ( distance > lightRadius ) discard;",

				"float spotEffect = smoothstep( lightConeCos, lightPenumbraCos, angleCos );",
				"float dist = pow(clamp(1. - distance / lightRadius, 0.0, 1.0), lightDecay);",

				"float spot = dist * spotEffect;",

				"diffuseColor *= spot;",
				"vec3 viewVector = normalize( cameraPos - vertexPositionVS.xyz );",

				DeferredShaderChunk.computeSpecular,

				"float attenuation = 1.0 / PI;",

				"#if SHADOW == 1",
				"attenuation *= getShadow(shadowMap, shadowMatrix * vertexPositionVS, shadowMapSize, vec2(shadowBias, 0.), vec2(shadowRadius, 0.));",
				"#endif",

				DeferredShaderChunk.combine,

				"}"

			].join('\n')

		},

		normalDepthShininess: {

			uniforms: {

				shininess: 30

			},

			vertexShader: [

				"#include <common_vert>",
				"#include <morphtarget_pars_vert>",
				"#include <skinning_pars_vert>",
				"#include <normal_pars_vert>",
				"#include <uv_pars_vert>",
				"varying vec4 vPosition;",
				"void main() {",
				"#include <uv_vert>",
				"#include <begin_vert>",
				"#include <morphtarget_vert>",
				"#include <morphnormal_vert>",
				"#include <skinning_vert>",
				"#include <skinnormal_vert>",
				"#include <normal_vert>",
				"#include <pvm_vert>",
				"vPosition = gl_Position;", // need this, but not gl_FragCoord.z / gl_FragCoord.w ?
				"}"

			].join('\n'),

			fragmentShader: [

				"#include <common_frag>",
				"#include <diffuseMap_pars_frag>",

				"#include <uv_pars_frag>",
				"#include <packing>",
				"#include <normal_pars_frag>",

				"varying vec4 vPosition;",

				"uniform float shininess;",

				DeferredShaderChunk.packNormal,

				"void main() {",
				"#if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)",
				"vec4 texelColor = texture2D( diffuseMap, v_Uv );",

				"float alpha = texelColor.a * u_Opacity;",
				"if(alpha < ALPHATEST) discard;",
				"#endif",

				"vec3 normal = normalize(v_Normal);",
				"vec4 position = vPosition;",

				DeferredShaderChunk.packNormalDepthShininess,

				"gl_FragColor = packedNormalDepthShininess;",
				"}"

			].join('\n')

		},

		pointLightPre: {

			defines: {

				"SHADOW": 0

			},

			uniforms: {

				samplerNormalDepthShininess: null,

				lightColor: [0, 0, 0],
				lightPositionVS: [0, 0, 0],
				lightRadius: 1,
				lightDecay: 1,
				lightIntensity: 1,

				shadowMap: null,
				shadowBias: 0,
				shadowRadius: 1,
				shadowMapSize: [1024, 1024],
				shadowCameraNear: 1,
				shadowCameraFar: 100,

				viewWidth: 800,
				viewHeight: 600,

				matProjViewInverse: new Float32Array(16),
				cameraPos: [0, 0, 0]

			},

			vertexShader: [

				"attribute vec3 a_Position;",

				"uniform mat4 u_ProjectionView;",
				"uniform mat4 u_Model;",

				"void main() {",

				"gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

				"}"

			].join('\n'),

			fragmentShader: [

				"#include <bsdfs>",

				"uniform sampler2D samplerNormalDepthShininess;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",

				"uniform vec3 lightColor;",
				"uniform vec3 lightPositionVS;",
				"uniform float lightRadius;",
				"uniform float lightDecay;",
				"uniform float lightIntensity;",

				"#if SHADOW == 1",

				"uniform samplerCube shadowMap;",

				"uniform float shadowBias;",
				"uniform float shadowRadius;",
				"uniform vec2 shadowMapSize;",

				"uniform float shadowCameraNear;",
				"uniform float shadowCameraFar;",

				"#include <packing>",
				"#include <shadow>",

				"#endif",

				"uniform mat4 matProjViewInverse;",
				"uniform vec3 cameraPos;",

				DeferredShaderChunk.unpackFloat,
				DeferredShaderChunk.unpackVector2,

				"void main() {",

				DeferredShaderChunk.computeTextureCoord,
				DeferredShaderChunk.unpackNormalDepthShininess,
				DeferredShaderChunk.computeVertexPositionVS,

				"vec3 lightVector = lightPositionVS - vertexPositionVS.xyz;",
				"float distance = length( lightVector );",

				"if ( distance > lightRadius ) discard;",

				"lightVector = normalize( lightVector );",
				"vec3 viewVector = normalize( cameraPos - vertexPositionVS.xyz );",

				DeferredShaderChunk.computeSpecular,

				"float attenuation = pow(clamp(1. - distance / lightRadius, 0.0, 1.0), lightDecay) / PI;",

				"#if SHADOW == 1",
				"attenuation *= getPointShadow(shadowMap, vec4(vertexPositionVS.xyz - lightPositionVS, 1.0), shadowMapSize, vec2(shadowBias, 0.), vec2(shadowRadius, 0.), vec2(shadowCameraNear, shadowCameraFar));",
				"#endif",

				DeferredShaderChunk.packLight,

				"gl_FragColor = packedLight;",

				"}"

			].join('\n')

		},

		spotLightPre: {

			defines: {

				"SHADOW": 0

			},

			uniforms: {

				samplerNormalDepth: null,

				lightColor: [0, 0, 0],
				lightDirectionVS: [0, 1, 0],
				lightPositionVS: [0, 0, 0],
				lightConeCos: 1,
				lightPenumbraCos: 1,
				lightRadius: 1,
				lightDecay: 1,
				lightIntensity: 1,

				shadowMatrix: new Float32Array(16),
				shadowMap: null,
				shadowBias: 0,
				shadowRadius: 1,
				shadowMapSize: [1024, 1024],

				viewWidth: 800,
				viewHeight: 600,

				matProjViewInverse: new Float32Array(16),
				cameraPos: [0, 0, 0]

			},

			vertexShader: [

				"attribute vec3 a_Position;",

				"uniform mat4 u_ProjectionView;",
				"uniform mat4 u_Model;",

				"void main() {",

				"gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

				"}"

			].join('\n'),

			fragmentShader: [

				"#include <bsdfs>",

				"uniform sampler2D samplerNormalDepthShininess;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",

				"uniform vec3 lightColor;",
				"uniform vec3 lightPositionVS;",
				"uniform vec3 lightDirectionVS;",
				"uniform float lightConeCos;",
				"uniform float lightPenumbraCos;",
				"uniform float lightRadius;",
				"uniform float lightDecay;",
				"uniform float lightIntensity;",

				"#if SHADOW == 1",

				"uniform sampler2D shadowMap;",
				"uniform mat4 shadowMatrix;",

				"uniform float shadowBias;",
				"uniform float shadowRadius;",
				"uniform vec2 shadowMapSize;",

				"#include <packing>",
				"#include <shadow>",

				"#endif",

				"uniform mat4 matProjViewInverse;",
				"uniform vec3 cameraPos;",

				DeferredShaderChunk.unpackFloat,
				DeferredShaderChunk.unpackVector2,

				"void main() {",

				DeferredShaderChunk.computeTextureCoord,
				DeferredShaderChunk.unpackNormalDepthShininess,
				DeferredShaderChunk.computeVertexPositionVS,

				"vec3 lightVector = lightPositionVS.xyz - vertexPositionVS.xyz;",
				"float distance = length( lightVector );",

				"lightVector = normalize( lightVector );",

				"float angleCos = dot( lightDirectionVS, lightVector );",

				"if ( angleCos <= lightConeCos ) discard;",
				"if ( distance > lightRadius ) discard;",

				"float spotEffect = smoothstep( lightConeCos, lightPenumbraCos, angleCos );",
				"float dist = pow(clamp(1. - distance / lightRadius, 0.0, 1.0), lightDecay);",

				"float spot = dist * spotEffect;",

				"vec3 viewVector = normalize( cameraPos - vertexPositionVS.xyz );",

				DeferredShaderChunk.computeSpecular,

				"float attenuation = 1.0 / PI;",

				"#if SHADOW == 1",
				"attenuation *= getShadow(shadowMap, shadowMatrix * vertexPositionVS, shadowMapSize, vec2(shadowBias, 0.), vec2(shadowRadius, 0.));",
				"#endif",

				DeferredShaderChunk.packLight,

				"gl_FragColor = spot * packedLight;",

				"}"

			].join("\n")

		},

		directionalLightPre: {

			defines: {

				"SHADOW": 0

			},

			uniforms: {

				samplerNormalDepthShininess: null,

				lightColor: [0, 0, 0],
				lightDirectionVS: [0, 1, 0],
				lightIntensity: 1,

				shadowMatrix: new Float32Array(16),
				shadowMap: null,
				shadowBias: 0,
				shadowRadius: 1,
				shadowMapSize: [1024, 1024],

				viewWidth: 800,
				viewHeight: 600,

				matProjViewInverse: new Float32Array(16),
				cameraPos: [0, 0, 0]

			},

			vertexShader: [

				"attribute vec3 a_Position;",

				"uniform mat4 u_ProjectionView;",
				"uniform mat4 u_Model;",

				"void main() {",

				"gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

				"}"

			].join('\n'),

			fragmentShader: [

				"#include <bsdfs>",

				"uniform sampler2D samplerNormalDepthShininess;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",

				"uniform vec3 lightColor;",
				"uniform vec3 lightDirectionVS;",
				"uniform float lightIntensity;",

				"#if SHADOW == 1",

				"uniform sampler2D shadowMap;",
				"uniform mat4 shadowMatrix;",

				"uniform float shadowBias;",
				"uniform float shadowRadius;",
				"uniform vec2 shadowMapSize;",

				"#include <packing>",
				"#include <shadow>",

				"#endif",

				"uniform mat4 matProjViewInverse;",
				"uniform vec3 cameraPos;",

				DeferredShaderChunk.unpackFloat,
				DeferredShaderChunk.unpackVector2,

				"void main() {",

				DeferredShaderChunk.computeTextureCoord,
				DeferredShaderChunk.unpackNormalDepthShininess,
				DeferredShaderChunk.computeVertexPositionVS,

				"vec3 lightVector = normalize( lightDirectionVS );",
				"vec3 viewVector = normalize( cameraPos - vertexPositionVS.xyz );",

				DeferredShaderChunk.computeSpecular,

				"float attenuation = 1.0 / PI;",

				"#if SHADOW == 1",
				"attenuation *= getShadow(shadowMap, shadowMatrix * vertexPositionVS, shadowMapSize, vec2(shadowBias, 0.), vec2(shadowRadius, 0.));",
				"#endif",

				DeferredShaderChunk.packLight,

				"gl_FragColor = packedLight;",

				"}"

			].join('\n')

		},

		reconstruction: {

			uniforms: {

				samplerLight: null,

				specular: [0, 0, 0],
				shininess: 30,

				viewWidth: 800,
				viewHeight: 600

			},

			vertexShader: [
				"#include <common_vert>",
				"#include <uv_pars_vert>",
				"#include <color_pars_vert>",
				"#include <envMap_pars_vert>",
				"#include <skinning_pars_vert>",
				"void main() {",
				"#include <begin_vert>",
				"#include <skinning_vert>",
				"#include <pvm_vert>",
				"#include <uv_vert>",
				"#include <color_vert>",
				"}"
			].join("\n"),

			fragmentShader: [

				"uniform sampler2D samplerLight;",

				"uniform vec3 u_Color;",
				"uniform vec3 emissive;",
				"uniform vec3 specular;",
				"uniform float shininess;",

				"uniform float viewHeight;",
				"uniform float viewWidth;",

				"#include <uv_pars_frag>",
				"#include <diffuseMap_pars_frag>",

				DeferredShaderChunk.unpackFloat,

				"void main() {",

				"vec4 outColor = vec4( u_Color, 1.0 );",
				"vec3 emissiveColor = emissive;",
				"vec3 specularColor = specular;",

				DeferredShaderChunk.computeTextureCoord,

				"vec4 light = texture2D( samplerLight, texCoord );",

				"#include <diffuseMap_frag>",
				"vec4 diffuseColor = outColor;",

				"vec3 diffuseFinal = diffuseColor.rgb * light.rgb;",
				"vec3 emissiveFinal = emissiveColor;",
				"vec3 specularFinal = specularColor * light.rgb * light.a;",

				"gl_FragColor = vec4( diffuseFinal + emissiveFinal + specularFinal, 1.0 );",

				"}"

			].join("\n")

		}

	};

	return DeferredShader;
})();



export { DeferredShader };