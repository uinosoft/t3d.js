/**
 * LuminosityHighPass Shader
 */



var LuminosityHighPassShader = {

	uniforms: {

		"tDiffuse": null,
		"luminosityThreshold": 1.0

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

		"uniform float luminosityThreshold;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 v_Uv;",

		"void main() {",

		"	vec4 texel = texture2D( tDiffuse, v_Uv );",

		"	vec3 luma = vec3( 0.299, 0.587, 0.114 );",

		"	float v = dot( texel.xyz, luma );",

		"	gl_FragColor = step(luminosityThreshold, v) * texel;",

		"}"

	].join("\n")

};

export { LuminosityHighPassShader };