const WaterShader = {

	uniforms: {
		'normalMap': null,
		'opacity': 1.0,
		'size': [0.3, 0.3],
		'distortionScale': 15.0,
		'sunColor': [1, 1, 1],
		'LightPosition': [0.70707, 0.70707, 0],
		'time': 0.0,
		'offset': [0, 0],
		'waterColor': [0, 0.3, 0.5],
		'waveStrength': 1.0,
		'reflectWeight': 1.0,
		'envMap': null,
		'envMapFlip': -1,
		'envQuaternion': [0, 0, 0, 1],
	},

	vertexShader: [
		"#include <common_vert>",
		"attribute vec2 a_Uv;",
		"varying vec2 vUv;",
		"varying vec3 vObjectNormal;",
		"varying vec3 vNormal;",
		"varying vec3 vViewPosition;",
		"#include <logdepthbuf_pars_vert>",

		"void main() {",
		"   vUv=a_Uv;",

		"   vec3 transformedNormal = normalize(a_Normal);",
		"   vObjectNormal = transformedNormal;",
		"   transformedNormal = (transposeMat4(inverseMat4(u_View * u_Model)) * vec4(vObjectNormal, 0.0)).xyz;",
		"   vNormal= transformedNormal;",

		"   vec4 mvPosition = u_View * u_Model * vec4(a_Position, 1.0);",
		"   vViewPosition = mvPosition.xyz;",
		"   gl_Position = u_Projection * mvPosition;",

		"   #include <logdepthbuf_vert>",
		"}",
	].join("\n"),

	fragmentShader: [
		"#include <common_frag>",

		"uniform vec3 waterColor;",
		"uniform float opacity;",

		"uniform vec2 size;",
		"uniform float distortionScale;",
		"uniform float waveStrength;",
		"uniform float time;",
		"uniform vec2 offset;",
		"uniform sampler2D normalMap;",
		"uniform samplerCube envMap;",
		"uniform float envMapFlip;",
		"uniform vec4 envQuaternion;",
		"uniform float reflectWeight;",

		"uniform vec3 sunColor;",
		"uniform vec3 LightPosition;",

		"uniform mat4 u_Model;",

		"varying vec2 vUv;",
		"varying vec3 vObjectNormal;",
		"varying vec3 vNormal;",
		"varying vec3 vViewPosition;",
		"#include <logdepthbuf_pars_frag>",
		"#include <fog_pars_frag>",

		"vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {",

		// dir can be either a direction vector or a normal vector
		// upper-left 3x3 of matrix is assumed to be orthogonal

		"   return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );",

		"}",

		"vec4 getNoise(vec2 uv) {",
		"   vec2 uv0 = (uv / 103.0) + vec2(time / 17.0, time / 29.0);",
		"   vec2 uv1 = uv / 107.0 - vec2(time / -19.0, time / 31.0);",
		"   vec2 uv2 = uv / vec2(8907.0, 9803.0) + vec2(time / 101.0, time / 97.0);",
		"   vec2 uv3 = uv / vec2(1091.0, 1027.0) - vec2(time / 109.0, time / -113.0);",
		"   vec4 noise = texture2D(normalMap, uv0) +",
		"   texture2D(normalMap, uv1) +",
		"   texture2D(normalMap, uv2) +",
		"   texture2D(normalMap, uv3);",
		"   return noise * 0.5 - 1.0;",
		"}",

		"void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, const vec3 sunDirection, float Shininess, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor) {",
		"   vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));",
		"   float direction = max(0.0, dot(eyeDirection, reflection));",
		"   specularColor += pow(direction, Shininess) * spec;",
		"   diffuseColor += max(dot(sunDirection, surfaceNormal), 0.0) * diffuse;",
		"}",

		"vec3 applyQuaternionV3 ( vec3 v, vec4 q ) {",
		"   float ix = q.w * v.x + q.y * v.z - q.z * v.y;",
		"   float iy = q.w * v.y + q.z * v.x - q.x * v.z;",
		"   float iz = q.w * v.z + q.x * v.y - q.y * v.x;",
		"   float iw = - q.x * v.x - q.y * v.y - q.z * v.z;",
		"   return vec3( ix * q.w + iw * ( -q.x ) + iy * ( -q.z ) - iz * ( -q.y ),",
		"       iy * q.w + iw * ( -q.y ) + iz * ( -q.x ) - ix * ( -q.z ),",
		"       iz * q.w + iw * ( -q.z ) + ix * ( -q.y ) - iy * ( -q.x ) );",
		"}",

		"void main() {",
		"   #include <logdepthbuf_frag>",
		// Get noise normal from normal map.
		// TODO: remove magic number?
		"   vec4 noise = getNoise(vUv * size + offset);",
		"   vec3 surfaceNormal = normalize(noise.xzy * vec3(3.5, 1.0, 3.5));",

		// Use waveStrength to control water face peaceful or not.
		"   surfaceNormal = mix(vObjectNormal, surfaceNormal.xzy, waveStrength);",

		// Sun light
		// TODO Get light color and direction from three.js
		"   vec3 diffuseLight = vec3(0.0);",
		"   vec3 specularLight = vec3(0.0);",
		"   vec3 LightPosition2=(u_View * u_Model * vec4(LightPosition,0.)).xyz;",
		"   vec3 sunDirection = normalize(LightPosition2 - vViewPosition);",
		"   vec3 eyeDirection = normalize(-vViewPosition);",
		"   sunLight(surfaceNormal, eyeDirection, sunDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight);",

		// Get reflect color
		"   float distance = length(vViewPosition);",
		"   vec2 distortion = surfaceNormal.xy * (0.001 + 1.0 / distance) * distortionScale;",
		"   vec3 reflectVec = reflect(normalize(vViewPosition), normalize(vNormal));",
		"   reflectVec = inverseTransformDirection(reflectVec, u_View);",
		"   reflectVec = vec3(envMapFlip * reflectVec.x, reflectVec.yz + distortion);",
		"   reflectVec = applyQuaternionV3(reflectVec, envQuaternion);",
		"   vec4 reflectColor = textureCube(envMap, reflectVec);",

		// Output
		"   float theta = max(dot(eyeDirection, surfaceNormal), 0.0);",
		"   float reflectance = 0.3 + 0.7 * pow((1.0 - theta), 5.0);",
		"   vec3 scatter = theta * waterColor;",
		"   vec3 albedo = mix((sunColor * diffuseLight * 0.3 + scatter) , (vec3(0.1) + reflectColor.rgb  * 0.9 + reflectColor.rgb * specularLight), reflectance * reflectWeight);",
		"   gl_FragColor = vec4(albedo, opacity);",
		"   #include <fog_frag>",
		"}"
	].join("\n")

}

export { WaterShader };