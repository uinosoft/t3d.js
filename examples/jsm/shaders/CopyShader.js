/**
 * Copy Shader
 */



var CopyShader = {

	uniforms: {

		"tDiffuse": null,
		"opacity": 1.0

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

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 v_Uv;",

		"void main() {",

		"	vec4 texel = texture2D( tDiffuse, v_Uv );",
		"	gl_FragColor = opacity * texel;",

		"}"

	].join("\n")

};

export { CopyShader };