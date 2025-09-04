// Reference: https://stackblitz.com/edit/fft-2d?file=ocean%2Fprograms%2Ffft2-v.ts

export const FFT2VShader = {
	name: 'ocean_fft2_v',
	defines: {},
	uniforms: {
		spectrum0: null,
		spectrum1: null,
		spectrum2: null,
		spectrum3: null,
		spectrum4: null,
		spectrum5: null,
		butterfly: null,
		phase: 0
	},
	vertexShader: /* glsl */`
		attribute vec3 a_Position;
		void main() {
			gl_Position = vec4(a_Position, 1.0);
		}
	`,
	fragmentShader: /* glsl */`
		uniform sampler2D spectrum0;
		uniform sampler2D spectrum1;
		uniform sampler2D spectrum2;
		uniform sampler2D spectrum3;
		uniform sampler2D spectrum4;
		uniform sampler2D spectrum5;
		uniform sampler2D butterfly;
		uniform int phase;

		struct complex {
			float re;
			float im;
		};

		complex add(complex a, complex b) {
			return complex(a.re + b.re, a.im + b.im);
		}

		complex mult(complex a, complex b) {
			return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
		}

		complex scale(complex a, float v) {
			return complex(a.re * v, a.im * v);
		}

		vec2 twiddleXY(in sampler2D source, in vec4 texelButt) {
			vec4 texelA = texelFetch(source, ivec2(gl_FragCoord.x, texelButt.b), 0).xyzw;
			vec4 texelB = texelFetch(source, ivec2(gl_FragCoord.x, texelButt.a), 0).xyzw;
			complex a = complex(texelA.x, texelA.y);
			complex b = complex(texelB.x, texelB.y);
			complex w = complex(texelButt.r, texelButt.g);
			complex r = scale(add(a, mult(b, w)), 0.5);

			return vec2(r.re, r.im);
		}

		vec2 twiddleZW(in sampler2D source, in vec4 texelButt) {
			vec4 texelA = texelFetch(source, ivec2(gl_FragCoord.x, texelButt.b), 0).xyzw;
			vec4 texelB = texelFetch(source, ivec2(gl_FragCoord.x, texelButt.a), 0).xyzw;
			complex a = complex(texelA.z, texelA.w);
			complex b = complex(texelB.z, texelB.w);
			complex w = complex(texelButt.r, texelButt.g);
			complex r = scale(add(a, mult(b, w)), 0.5);

			return vec2(r.re, r.im);
		}

		void main() {
			vec4 texelButt = texelFetch(butterfly, ivec2(phase,  gl_FragCoord.y), 0).rgba;
			gl_FragData[0] = vec4(twiddleXY(spectrum0, texelButt), twiddleZW(spectrum0, texelButt)); //ifft0
			gl_FragData[1] = vec4(twiddleXY(spectrum1, texelButt), twiddleZW(spectrum1, texelButt)); //ifft1
			gl_FragData[2] = vec4(twiddleXY(spectrum2, texelButt), twiddleZW(spectrum2, texelButt)); //ifft2
			gl_FragData[3] = vec4(twiddleXY(spectrum3, texelButt), twiddleZW(spectrum3, texelButt)); //ifft3
			gl_FragData[4] = vec4(twiddleXY(spectrum4, texelButt), twiddleZW(spectrum4, texelButt)); //ifft4
			gl_FragData[5] = vec4(twiddleXY(spectrum5, texelButt), twiddleZW(spectrum5, texelButt)); //ifft5
		}
	`
};
