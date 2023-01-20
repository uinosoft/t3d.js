/**
 * Depth Linear Shader
 */



var DepthLinearShader = {

	defines: {

	},

	uniforms: {

		"depthTex": null,
		"cameraNear": 1.0,
		"cameraFar": 1000.0

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

		"float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {",
		"	return ( near * far ) / ( ( far - near ) * invClipZ - far );",
		"}",

		"float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {",
		"	return ( viewZ + near ) / ( near - far );",
		"}",

		"uniform sampler2D depthTex;",

		"uniform float cameraNear;",

		"uniform float cameraFar;",

		"varying vec2 v_Uv;",

		"void main() {",

		"	vec4 texel = texture2D( depthTex, v_Uv );",
		"	float depth = perspectiveDepthToViewZ(texel.r, cameraNear, cameraFar);",
		"	gl_FragColor = vec4( vec3( 1. - viewZToOrthographicDepth(depth, cameraNear, cameraFar) ), 1. );",

		"}"

	].join("\n")

};

export { DepthLinearShader };