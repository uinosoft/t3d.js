/**
 * Sketch Shader
 */



var SketchShader = {

	defines: {

	},

	uniforms: {
		normalTexture: null,
		depthTexture: null,
		invResolution: new Float32Array([1 / 512, 1 / 512]),
		uThreshold: 0.55,
		uContrast: 0.5,
		matProjViewInverse: new Float32Array(16),
		uColor: [0, 0, 0]
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

		"uniform sampler2D normalTexture;",
		"uniform sampler2D depthTexture;",
		"uniform vec2 invResolution;",
		"uniform float uThreshold;",
		"uniform float uContrast;",
		"uniform mat4 matProjViewInverse;",

		"void getNormalPosition(in vec2 coord, out vec3 position, out vec3 normal) {",
		"	normal.xyz = texture2D(normalTexture, coord).xyz * 2.0 - 1.0;",
		"	float z = texture2D(depthTexture, coord).r * 2.0 - 1.0;",
		"	vec2 xy = coord * 2.0 - 1.0;",
		"	vec4 p4 = vec4(xy, z, 1.0);",
		"	p4 = matProjViewInverse * p4;",
		"	p4.xyz /= p4.w;",
		"	position.xyz = p4.xyz;",
		"}",

		"float planeDistance(vec3 posA, vec3 norA, vec3 posB, vec3 norB) {",
		"	vec3 posDelta = normalize(posB - posA);",
		"	float planeDist = max(abs(dot(posDelta, norA)), abs(dot(posDelta, norB)));",
		"	float normalDist = max(1.0 - dot(norA, norB), 0.0);",
		"	float test = dot(norA, vec3(1.0)) + dot(norB, vec3(1.0));",
		"	return max(planeDist, normalDist) * step(-5.9, test);",
		"}",

		"uniform vec3 uColor;",

		"vec4 shade() {",
		"	vec2 vFragCoord = v_Uv;",
		"	vec2 coordUp = vFragCoord - vec2(0.0, invResolution.y);",
		"	vec2 coordDown = vFragCoord + vec2(0.0, invResolution.y);",
		"	vec2 coordLeft = vFragCoord - vec2(invResolution.x, 0.0);",
		"	vec2 coordRight = vFragCoord + vec2(invResolution.x, 0.0);",
		"	vec3 posUp, norUp;",
		"	vec3 posDown, norDown;",
		"	vec3 posLeft, norLeft;",
		"	vec3 posRight, norRight;",
		"	getNormalPosition(coordUp, posUp, norUp);",
		"	getNormalPosition(coordDown, posDown, norDown);",
		"	getNormalPosition(coordLeft, posLeft, norLeft);",
		"	getNormalPosition(coordRight, posRight, norRight);",
		"	vec2 planeDist = vec2(planeDistance(posLeft, norLeft, posRight, norRight), planeDistance(posUp, norUp, posDown, norDown));",
		"	float edge = length(planeDist);",
		"	float sketch = step(edge, uThreshold);",
		"	sketch = clamp(uContrast * (1.0 - sketch), 0.0, 1.0);",
		"	return vec4(uColor, sketch);",
		"}",

		"void main() {",
		"	gl_FragColor = shade();",
		"}"
	].join("\n")

};

export { SketchShader };