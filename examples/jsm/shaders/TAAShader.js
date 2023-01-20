/**
 * TAA Shader
 * Modified from https://github.com/Unity-Technologies/PostProcessing/blob/v2/PostProcessing/Shaders/Builtins/TemporalAntialiasing.shader
 */



var TAAShader = {

	uniforms: {
		prevTex: null,
		currTex: null,
		velocityTex: null,
		depthTex: null,
		texelSize: [1 / 512, 1 / 512],
		still: true,
		stillBlending: 0.95,
		motionBlending: 0.85
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
		"uniform sampler2D prevTex;",
		"uniform sampler2D currTex;",
		"uniform sampler2D velocityTex;",
		"uniform sampler2D depthTex;",

		"uniform vec2 texelSize;",

		"uniform bool still;",
		"uniform float stillBlending;",
		"uniform float motionBlending;",

		"varying vec2 v_Uv;",

		"float luminance(vec4 color) {",
		"	return dot(color.rgb, vec3(0.2125, 0.7154, 0.0721));",
		"}",

		// Tonemap and untonmap from "High Quality Temporal Supersampling"
		"vec4 tonemap(vec4 color) {",
		"	return vec4(color.rgb / (luminance(color) + 1.0), color.a);",
		"}",
		"vec4 untonemap(vec4 color) {",
		"	return vec4(color.rgb / max(1.0 - luminance(color), 0.0001), color.a);",
		"}",

		"float compareDepth(float a, float b) {",
		"	return step(a, b);",
		"}",

		"vec2 getClosestFragment(vec2 uv) {",
		"	vec2 k = texelSize.xy;",

		"	vec4 neighborhood = vec4(",
		"		texture2D(depthTex, uv - k).r,",
		"		texture2D(depthTex, uv + vec2(k.x, -k.y)).r,",
		"		texture2D(depthTex, uv + vec2(-k.x, k.y)).r,",
		"		texture2D(depthTex, uv + k).r",
		"	);",

		"	vec3 result = vec3(0.0, 0.0, texture2D(depthTex, uv));",
		"	result = mix(result, vec3(-1.0, -1.0, neighborhood.x), compareDepth(neighborhood.x, result.z));",
		"	result = mix(result, vec3( 1.0, -1.0, neighborhood.y), compareDepth(neighborhood.y, result.z));",
		"	result = mix(result, vec3(-1.0,  1.0, neighborhood.z), compareDepth(neighborhood.z, result.z));",
		"	result = mix(result, vec3( 1.0,  1.0, neighborhood.w), compareDepth(neighborhood.w, result.z));",

		"	return (uv + result.xy * k);",
		"}",

		"vec4 clipToAABB(vec4 color, vec3 minimum, vec3 maximum) {",
		// Note: only clips towards aabb center (but fast!)
		"	vec3 center = 0.5 * (maximum + minimum);",
		"	vec3 extents = 0.5 * (maximum - minimum);",

		// This is actually `distance`, however the keyword is reserved
		"	vec3 offset = color.rgb - center;",

		"	vec3 ts = abs(extents / (offset + 0.0001));",
		"	float t = clamp(min(min(ts.x, ts.y), ts.z), 0.0, 1.0);",
		"	color.rgb = center + offset * t;",
		"	return color;",
		"}",

		"void main() {",

		"	if (still) {",
		"		gl_FragColor = mix(texture2D(currTex, v_Uv), texture2D(prevTex, v_Uv), stillBlending);",
		"		return;",
		"	}",

		"	vec2 closest = getClosestFragment(v_Uv);",
		"	vec4 motionTexel = texture2D(velocityTex, closest);",
		"	if (motionTexel.a < 0.1) {",
		"		gl_FragColor = texture2D(currTex, v_Uv);",
		"		return;",
		"	}",

		"	vec2 motion = motionTexel.rg - 0.5;",
		"	float motionLength = length(motion);",

		"	vec4 color = texture2D(currTex, v_Uv);",
		"	vec4 history = texture2D(prevTex, v_Uv - motion);",

		// handle ghosting, clip history color to AABB
		"	vec2 k = texelSize.xy;",
		"	vec4 topLeft = texture2D(currTex, v_Uv - k * 0.5);",
		"	vec4 bottomRight = texture2D(currTex, v_Uv + k * 0.5);",
		"	vec4 corners = 4.0 * (topLeft + bottomRight) - 2.0 * color;",
		"	vec4 average = (corners + color) * 0.142857;",
		"	vec2 luma = vec2(luminance(average), luminance(color));",
		"	float nudge = 4.0 * abs(luma.x - luma.y);",
		// "	float nudge = mix(4.0, 0.25, clamp(motionLength * 100.0, 0.0, 1.0)) * abs(luma.x - luma.y);",
		"	vec4 minimum = min(bottomRight, topLeft) - nudge;",
		"	vec4 maximum = max(topLeft, bottomRight) + nudge;",
		"	history = clipToAABB(history, minimum.xyz, maximum.xyz);",

		// blend weight
		"	float weight = clamp(",
		"		mix(stillBlending, motionBlending, motionLength * 6000.),",
		"		motionBlending, stillBlending",
		"	);",
		// "	float weight = motionBlending;",

		// mix after tonemap
		"	color = mix(tonemap(color), tonemap(history), weight);",
		"	gl_FragColor = untonemap(color);",
		// "	color = mix(color, history, motionBlending);",
		// "	gl_FragColor = color;",

		"}",
	].join("\n")
}

export { TAAShader };