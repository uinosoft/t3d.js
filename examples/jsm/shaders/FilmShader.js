/**
 * Film Shader
 */



var FilmShader = {

	uniforms: {

		"tDiffuse": null,
		"time": 0.0,
		"nIntensity": 0.8,
		"sIntensity": 0.3,
		"sCount": 4096,
		"grayscale": 0

	},

	vertexShader: [

		"attribute vec3 a_Position;",
		"attribute vec2 a_Uv;",

		"uniform mat4 u_ProjectionView;",
		"uniform mat4 u_Model;",

		"varying vec2 v_Uv;",

		"void main() {",

		"   v_Uv = a_Uv;",
		"   gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"#define PI 3.14159265359",

		// "#include <common>",
		// "highp float rand( const in vec2 uv ) {",
		//     "const highp float a = 12.9898, b = 78.233, c = 43758.5453;",
		//     "highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );",
		//     "return fract(sin(sn) * c);",
		// "}",

		// control parameter
		"uniform float time;",

		"uniform bool grayscale;",

		// noise effect intensity value (0 = no effect, 1 = full effect)
		"uniform float nIntensity;",

		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		"uniform float sIntensity;",

		// scanlines effect count value (0 = no effect, 4096 = full effect)
		"uniform float sCount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 v_Uv;",

		"void main() {",

		// sample the source
		"   vec4 cTextureScreen = texture2D( tDiffuse, v_Uv );",

		// make some noise
		"   float dx = rand( v_Uv + time );",

		// add noise
		"   vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );",

		// get us a sine and cosine
		"   vec2 sc = vec2( sin( v_Uv.y * sCount ), cos( v_Uv.y * sCount ) );",

		// add scanlines
		"   cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

		// interpolate between source and result by intensity
		"   cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

		// convert to grayscale if desired
		"   if( grayscale ) {",

		"       cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

		"   }",

		"   gl_FragColor =  vec4( cResult, cTextureScreen.a );",

		"}"

	].join("\n")

};

export { FilmShader };