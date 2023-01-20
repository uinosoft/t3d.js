/**
 * volume shader
 * https://github.com/modelo/API_samples/tree/master/samples/volume-rendering
 */



var VolumeShader = {

	defines: {

	},

	uniforms: {
		platteTexture: null,
		densityTexture: null,
		uInvTransform: new Float32Array(16),
		uAlphaCorrection: 0.09
	},

	vertexShader: [
		'#include <common_vert>',
		'#include <modelPos_pars_vert>',
		'#include <morphtarget_pars_vert>',
		'#include <skinning_pars_vert>',
		'void main() {',
		'	#include <begin_vert>',
		'	#include <morphtarget_vert>',
		'	#include <skinning_vert>',
		'	#include <pvm_vert>',
		'	#include <modelPos_vert>',
		'}'
	].join("\n"),

	fragmentShader: [
		'precision highp sampler3D;',

		'#include <common_frag>',
		'#include <modelPos_pars_frag>',

		'uniform sampler2D platteTexture;',
		'uniform sampler3D densityTexture;',
		'uniform mat4 uInvTransform;',
		'uniform float uAlphaCorrection;',
		'const float STEP = 1.73205081 / 256.0;',

		// http://iquilezles.org/www/articles/intersectors/intersectors.htm
		// axis aligned box centered at the origin, with size boxSize
		'vec2 boxIntersection(vec3 ro, vec3 rd, vec3 boxSize) {',
		'	vec3 m = 1.0 / rd;', // can precompute if traversing a set of aligned boxes
		'	vec3 n = m * ro;',   // can precompute if traversing a set of aligned boxes
		'	vec3 k = abs(m) * boxSize;',
		'	vec3 t1 = -n - k;',
		'	vec3 t2 = -n + k;',
		'	float tN = max(max(t1.x, t1.y), t1.z);',
		'	float tF = min(min(t2.x, t2.y), t2.z);',
		'	if( tN > tF || tF < 0.0) return vec2(-1.0);', // no intersection
		'	return vec2( tN, tF );',
		'}',

		'vec4 getColor(float intensity) {',
		// makes the volume looks brighter;
		'	intensity = min(0.46, intensity) / 0.46;',
		'	vec2 _uv = vec2(intensity, 0);',
		'	vec4 color = texture2D(platteTexture, _uv);',
		'	float alpha = intensity;',
		'	if (alpha < 0.03) {',
		'		alpha = 0.01;',
		'	}',
		'	return vec4(color.r, color.g, color.b, alpha);',
		'}',

		'vec4 sampleAs3DTexture(vec3 texCoord) {',
		'	texCoord += vec3(0.5);',
		'	return getColor(texture(densityTexture, texCoord).r);',
		'}',

		'vec3 shade(inout float transparent, in vec3 P, in vec3 V) {',
		// Transform to model space.
		'	vec3 frontPos = (uInvTransform * vec4(P.xyz, 1.0)).xyz;',
		'	vec3 cameraPos = (uInvTransform * vec4(u_CameraPosition.xyz, 1.0)).xyz;',
		'	vec3 rayDir = normalize(frontPos - cameraPos);',
		'	vec3 backPos = frontPos;',
		'	vec2 t = boxIntersection(cameraPos, rayDir, vec3(0.5));',
		'	if (t.x > -1.0 && t.y > -1.0) {',
		'		backPos = cameraPos + rayDir * t.y;',
		'	}',
		'	float rayLength = length(backPos - frontPos);',
		'	int steps = int(max(1.0, floor(rayLength / STEP)));',
		// Calculate how long to increment in each step.
		'	float delta = rayLength / float(steps);',
		// The increment in each direction for each step.
		'	vec3 deltaDirection = rayDir * delta;',
		// Start the ray casting from the front position.
		'	vec3 currentPosition = frontPos;',
		// The color accumulator.
		'	vec4 accumulatedColor = vec4(0.0);',
		// The alpha value accumulated so far.
		'	float accumulatedAlpha = 0.0;',
		'	vec4 colorSample;',
		'	float alphaSample;',
		// Perform the ray marching iterations
		'	for (int i = 0; i < steps; i++) {',
		'		colorSample = sampleAs3DTexture(currentPosition);',
		'		alphaSample = colorSample.a * uAlphaCorrection;',
		'		alphaSample *= (1.0 - accumulatedAlpha);',
		// Perform the composition.
		'		accumulatedColor += colorSample * alphaSample;',
		// Store the alpha accumulated so far.
		'		accumulatedAlpha += alphaSample;',
		// Advance the ray.
		'		currentPosition += deltaDirection;',
		'	}',
		'	transparent = accumulatedAlpha;',
		'	return accumulatedColor.xyz;',
		'}',

		'void main() {',
		'	vec3 V = normalize(v_modelPos - u_CameraPosition);',
		'	vec3 P = v_modelPos;',
		'	float transparent;',
		'	vec3 color = shade(transparent, P, V);',
		'	gl_FragColor = vec4(color, transparent);',
		'}'
	].join("\n")

};

export { VolumeShader };