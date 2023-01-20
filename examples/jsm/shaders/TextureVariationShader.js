/**
 * TextureVariation Shader
 * Modified from https://www.shadertoy.com/view/Xtl3zf
 */

var TextureVariationShader = {

	uniforms: {
		map: null,
		randomMap: null,
		factor: 0.4,
		scaleFactor: 10,
		noiseFactor: 0.05
	},

	vertexShader: [
		"attribute vec3 a_Position;",
		"attribute vec2 a_Uv;",

		"uniform mat4 u_ProjectionView;",
		"uniform mat4 u_Model;",

		"varying vec2 v_Uv;",

		"void main() {",
		"	v_Uv = a_Uv;",
		"	vec4 worldPosition = u_Model * vec4(a_Position, 1.0);",
		"	gl_Position = u_ProjectionView * worldPosition;",
		"}"
	].join("\n"),

	fragmentShader: [
		"uniform sampler2D map;",
		"uniform sampler2D randomMap;",
		"uniform float factor;",
		"uniform float scaleFactor;",
		"uniform float noiseFactor;",

		"varying vec2 v_Uv;",

		"float sum( vec3 v ) { return v.x + v.y + v.z; }",

		"vec3 textureNoTile( in vec2 x, float v ) {",
		// sample variation pattern
		"   float k = texture( randomMap, noiseFactor * x ).x; // cheap (cache friendly) lookup",

		// compute index
		"   float index = k * 8.0;",
		"	float i = floor( index );",
		"   float f = fract( index );",

		// offsets for the different virtual patterns
		"   vec2 offa = sin(vec2(3.0, 7.0) * (i + 0.0)); // can replace with any other hash",
		"	vec2 offb = sin(vec2(3.0, 7.0) * (i + 1.0)); // can replace with any other hash",

		// compute derivatives for mip-mapping
		"   vec2 dx = dFdx(x), dy = dFdy(x);",

		// sample the two closest virtual patterns
		"	vec3 cola = textureGrad( map, x + v * offa, dx, dy ).xyz;",
		"	vec3 colb = textureGrad( map, x + v * offb, dx, dy ).xyz;",

		// interpolate between the two virtual patterns
		"	return mix( cola, colb, smoothstep(0.2, 0.8, f - 0.1 * sum(cola - colb)) );",
		"}",

		"void main() {",
		"	vec3 col = textureNoTile(scaleFactor * v_Uv, factor);",
		"	gl_FragColor = vec4( col, 1.0 );",
		"}",
	].join("\n")
}

export { TextureVariationShader };