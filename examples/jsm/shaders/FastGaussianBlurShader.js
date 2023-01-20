/**
 * @author shawn0326 / https://github.com/shawn0326
 *
 * https://github.com/Jam3/glsl-fast-gaussian-blur
 * http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
 *
 */



var FastGaussianBlurShader = {

	defines: {
		"SAMPLERS": 9
	},

	uniforms: {
		"tDiffuse": null,
		"resolution": [1 / 1024, 1 / 512],
		"direction": [1, 0]
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

	fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform vec2 direction;
        varying vec2 v_Uv;

        #if (SAMPLERS == 5) 
            vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
                vec4 color = vec4(0.0);
                vec2 off1 = vec2(1.3333333333333333) * direction;
                color += texture2D(image, uv) * 0.29411764705882354;
                color += texture2D(image, uv + (off1 * resolution)) * 0.35294117647058826;
                color += texture2D(image, uv - (off1 * resolution)) * 0.35294117647058826;
                return color; 
            }
        #endif
        #if (SAMPLERS == 9)
            vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
                vec4 color = vec4(0.0);
                vec2 off1 = vec2(1.3846153846) * direction;
                vec2 off2 = vec2(3.2307692308) * direction;
                color += texture2D(image, uv) * 0.2270270270;
                color += texture2D(image, uv + (off1 * resolution)) * 0.3162162162;
                color += texture2D(image, uv - (off1 * resolution)) * 0.3162162162;
                color += texture2D(image, uv + (off2 * resolution)) * 0.0702702703;
                color += texture2D(image, uv - (off2 * resolution)) * 0.0702702703;
                return color;
            }
        #endif
        #if (SAMPLERS == 13)
            vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
                vec4 color = vec4(0.0);
                vec2 off1 = vec2(1.411764705882353) * direction;
                vec2 off2 = vec2(3.2941176470588234) * direction;
                vec2 off3 = vec2(5.176470588235294) * direction;
                color += texture2D(image, uv) * 0.1964825501511404;
                color += texture2D(image, uv + (off1 * resolution)) * 0.2969069646728344;
                color += texture2D(image, uv - (off1 * resolution)) * 0.2969069646728344;
                color += texture2D(image, uv + (off2 * resolution)) * 0.09447039785044732;
                color += texture2D(image, uv - (off2 * resolution)) * 0.09447039785044732;
                color += texture2D(image, uv + (off3 * resolution)) * 0.010381362401148057;
                color += texture2D(image, uv - (off3 * resolution)) * 0.010381362401148057;
                return color;
            }
        #endif

        void main() {
            gl_FragColor = blur(tDiffuse, v_Uv, resolution, direction);
        }
    `

};

export { FastGaussianBlurShader };