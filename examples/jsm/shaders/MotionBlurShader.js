/**
 * MotionBlur Shader
 */



var MotionBlurShader = {

	uniforms: {

		"tDepth": null,
		"tColor": null,

		"velocityFactor": 1.0,
		"delta": 16.67,

		"clipToWorldMatrix": new Float32Array(16),
		"worldToClipMatrix": new Float32Array(16),
		"previousWorldToClipMatrix": new Float32Array(16),

		"cameraMove": [0, 0, 0]

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

		"uniform sampler2D tDepth;",
		"uniform sampler2D tColor;",

		"uniform mat4 u_Projection;",

		"uniform mat4 clipToWorldMatrix;",
		"uniform mat4 worldToClipMatrix;",
		"uniform mat4 previousWorldToClipMatrix;",

		"uniform vec3 cameraMove;",

		"uniform float velocityFactor;",
		"uniform float delta;",

		"void main() {",

		"	float zOverW = texture2D(tDepth, v_Uv).x;",

		// clipPosition is the viewport position at this pixel in the range -1 to 1.
		"	vec4 clipPosition = vec4(v_Uv.x * 2. - 1., v_Uv.y * 2. - 1., zOverW * 2. - 1., 1.);",

		"	vec4 worldPosition = clipToWorldMatrix * clipPosition;",
		"	worldPosition /= worldPosition.w;",

		"	vec4 previousWorldPosition = worldPosition;",
		"	previousWorldPosition.xyz -= cameraMove;",

		"	vec4 previousClipPosition = previousWorldToClipMatrix * worldPosition;",
		"	previousClipPosition /= previousClipPosition.w;",

		"	vec4 translatedClipPosition = worldToClipMatrix * previousWorldPosition;",
		"	translatedClipPosition /= translatedClipPosition.w;",

		"	vec2 velocity = velocityFactor * (clipPosition - previousClipPosition).xy / delta * 16.67;",
		"	velocity *= clamp(zOverW, 0., 1.);",
		"	velocity += velocityFactor * (clipPosition - translatedClipPosition).xy / delta * 16.67;",

		"	vec4 finalColor = vec4(0.);",
		"	vec2 offset = vec2(0.);",
		"	float weight = 0.;",
		"	const int samples = 20;",
		"	for (int i = 0; i < samples; i++) {",
		"		offset = velocity * (float(i) / (float(samples) - 1.) - .5);",
		"		finalColor += texture2D(tColor, v_Uv + offset);",
		"	}",
		"	finalColor /= float(samples);",
		"	gl_FragColor = vec4(finalColor.rgb, 1.);",

		// debug: view velocity values
		// "	gl_FragColor = vec4(abs(velocity), 0., 1.);",

		"}"

	].join("\n")

}

export { MotionBlurShader };