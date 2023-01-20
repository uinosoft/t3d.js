/**
 * Bokeh Shader
 */



var BokehShader = {

	defines: {
		"RINGS": 3,
		"SAMPLES": 4
	},
	uniforms: {
		'tColor': null,
		'tDepth': null,

		'resolution': [1 / 512, 1 / 512],

		'znear': 0.1,
		'zfar': 100,

		'focalDepth': 1.0,
		'focalLength': 24,
		'fstop': 0.9,

		'maxblur': 1.0,
		'threshold': 0.5,
		'gain': 2.0,
		'bias': 0.5,

		'dithering': 0.0001
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

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"uniform vec2 resolution;",

		"uniform float znear;",
		"uniform float zfar;",

		"uniform float focalDepth;",
		"uniform float focalLength;",
		"uniform float fstop;",

		"uniform float maxblur;", // clamp value of max blur (0.0 = no blur, 1.0 default)
		"uniform float threshold;", // highlight threshold
		"uniform float gain;", // highlight gain
		"uniform float bias;", // bokeh edge bias
		"uniform float dithering;",

		"const int samples = SAMPLES;",
		"const int rings = RINGS;",
		"const int maxringsamples = rings * samples;",

		"float CoC = 0.03;", // circle of confusion size in mm (35mm film = 0.03mm)

		"vec3 color(vec2 coords, float blur) {",
		"    vec3 col = texture2D(tColor, coords).rgb;",
		"    vec3 lumcoeff = vec3(0.299,0.587,0.114);",
		"    float lum = dot(col.rgb, lumcoeff);",
		"    float thresh = max((lum - threshold) * gain, 0.0);",
		"    return col + mix(vec3(0.0), col, thresh * blur);",
		"}",

		"float linearize(float depth) {",
		"    return -zfar * znear / (depth * (zfar - znear) - zfar);",
		"}",

		"float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {",
		"    float rings2 = float(rings);",
		"    float step = PI * 2.0 / float(ringsamples);",
		"    float pw = cos(j * step) * i;",
		"    float ph = sin(j * step) * i;",
		"    col += color(v_Uv + vec2(pw * w, ph * h), blur) * mix(1.0, i / rings2, bias);",
		"    return mix(1.0, i / rings2, bias);",
		"}",

		"void main() {",
		"   float depth = linearize(texture2D(tDepth, v_Uv).x);",
		"   float fDepth = focalDepth;",

		// dof blur factor calculation

		"   float f = focalLength;", // focal length in mm
		"   float d = fDepth * 1000.;", // focal plane in mm
		"   float o = depth * 1000.;", // depth in mm

		"   float a = (o * f) / (o - f);",
		"   float b = (d * f) / (d - f);",
		"   float c = (d - f) / (d * fstop * CoC);",

		"   float blur = abs(a - b) * c;",
		"   blur = clamp(blur, 0.0, 1.0);",

		// calculation of pattern for dithering

		"   vec2 noise = vec2(rand(v_Uv), rand(v_Uv + vec2(0.4, 0.6))) * dithering * blur;",

		// getting blur x and y step factor

		"   float w = resolution.x * blur * maxblur + noise.x;",
		"   float h = resolution.y * blur * maxblur + noise.y;",

		// calculation of final color

		"   vec3 col = vec3(0.0);",

		"   if (blur < 0.05) {",
		"       col = texture2D(tColor, v_Uv).rgb;",
		"   } else {",
		"       col = texture2D(tColor, v_Uv).rgb;",

		"       float s = 1.0;",
		"       int ringsamples;",

		"       for(int i = 1; i <= rings; i++) {",
		"           ringsamples = i * samples;",

		"           for (int j = 0; j < maxringsamples; j++) {",
		"               if (j >= ringsamples) break;",
		"               s += gather(float(i), float(j), ringsamples, col, w, h, blur);",
		"           }",
		"       }",

		"       col /= s;", // divide by sample count
		"   }",

		"   gl_FragColor = vec4(col, 1.0);",
		"}"

	].join("\n")

};

export { BokehShader };