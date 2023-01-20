/**
 * Color Adjust Shader
 */



var ColorAdjustShader = {

	uniforms: {

		"tDiffuse": null,
		"brightness": 0.0,
		"contrast": 1.0,
		"exposure": 0.0,
		"gamma": 1.0,
		"saturation": 1.0

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

		"uniform float brightness;",
		"uniform float contrast;",
		"uniform float exposure;",
		"uniform float gamma;",
		"uniform float saturation;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 v_Uv;",

		// Values from "Graphics Shaders: Theory and Practice" by Bailey and Cunningham
		"const vec3 w = vec3(0.2125, 0.7154, 0.0721);",

		"void main() {",

		"	vec4 tex = texture2D( tDiffuse, v_Uv );",

		// brightness
		"	vec3 color = clamp(tex.rgb + vec3(brightness), 0.0, 1.0);",
		// contrast
		"	color = clamp( (color-vec3(0.5))*contrast+vec3(0.5), 0.0, 1.0);",
		// exposure
		"	color = clamp( color * pow(2.0, exposure), 0.0, 1.0);",
		// gamma
		"	color = clamp( pow(color, vec3(gamma)), 0.0, 1.0);",
		// saturation
		"	float luminance = dot( color, w );",
		"	color = mix(vec3(luminance), color, saturation);",

		"	gl_FragColor = vec4(color, tex.a);",

		"}"

	].join("\n")

};


export { ColorAdjustShader };