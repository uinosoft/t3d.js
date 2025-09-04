// Reference: https://stackblitz.com/edit/fft-2d?file=ocean%2Fprograms%2Fhk.ts

export const HkShader = {
	name: 'ocean_fft_hk',
	defines: {},
	uniforms: {
		resolution: 256,
		sizes: [0, 0, 0]
	},
	vertexShader: /* glsl */`
		attribute vec3 a_Position;
		void main() {
			gl_Position = vec4(a_Position, 1.0);
		}
	`,
	fragmentShader: /* glsl */`
		#define g 9.81

		uniform int resolution; // N
		uniform float sizes[3]; // L
		uniform float t;
		uniform sampler2D h0Texture0;
		uniform sampler2D h0Texture1;
		uniform sampler2D h0Texture2;

		// --
		struct complex {
			float re;
			float im;
		};

		const complex i = complex(0.0, 1.0);

		complex add(complex a, complex b) {
			return complex(a.re + b.re, a.im + b.im);
		}

		complex mult(complex a, complex b) {
			return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
		}

		complex eix(float x) {
			return complex(cos(x), sin(x));
		}

		complex conj(complex a) {
			return complex(a.re, -a.im);
		}

		complex scale(complex v, float s) {
			return complex(v.re * s, v.im * s);
		}

		complex negate(complex v) {
			return complex(-v.re, -v.im);
		}

		const float RATIO = 0.618033989036;

		// --
		struct spectrum {
			complex dx;
			complex hy;
			complex dz;
			complex sx;
			complex sz;
			complex dxdx;
			complex dxdz;
			complex dzdz;
		};

		spectrum getSpectrum(in sampler2D h0Texture, in vec2 x, float size) {
			complex hy = complex(0.0, 0.0);
			complex sx = complex(0.0, 0.0);
			complex sz = complex(0.0, 0.0);
			complex dx = complex(0.0, 0.0);
			complex dz = complex(0.0, 0.0);
			complex dxdx = complex(0.0, 0.0);
			complex dzdz = complex(0.0, 0.0);
			complex dxdz = complex(0.0, 0.0);

			if(size <= 1.0e-3) {
				return spectrum(dx, hy, dz, sx, sz, dxdx, dxdz, dzdz);
			}

			vec2 k = vec2(2.0 * PI * x.x / size, 2.0 * PI * x.y / size);
			float kLen = length(k);

			if(kLen > 1.0e-6) {
				float w = sqrt(g * kLen);
				vec4 h0Texel = texelFetch(h0Texture, ivec2(gl_FragCoord.xy), 0).rgba;

				complex e = eix(w * t);
				complex h0 = complex(h0Texel.x, h0Texel.y);
				complex h0MinConj = complex(h0Texel.z, h0Texel.w);
				hy = add(mult(h0, e), mult(h0MinConj, conj(e)));

				if(int(gl_FragCoord.x) != 0) {
					sx = mult(complex(0.0, k.x), hy);
					dx = mult(complex(0.0, -k.x / kLen), hy);
					dxdx = scale(hy, k.x * k.x / kLen);
				}

				if(int(gl_FragCoord.y) != 0) {
					sz = mult(complex(0.0, k.y), hy);
					dz = mult(complex(0.0, -k.y / kLen), hy);
					dzdz = scale(hy, k.y * k.y / kLen);

					if(int(gl_FragCoord.x) != 0) {
						dxdz = scale(hy, k.y * k.x / kLen);
					}
				}
			}

			return spectrum(dx, hy, dz, sx, sz, dxdx, dxdz, dzdz);
		}

		void compressSpectrum(in spectrum spec, out vec4 part0, out vec4 part1) {
			complex dx_hy = add(spec.dx, mult(i, spec.hy));
			complex dz_dxdz = add(spec.dz, mult(i, spec.dxdz));
			complex sx_sz = add(spec.sx, mult(i, spec.sz));
			complex dxdx_dzdz = add(spec.dxdx, mult(i, spec.dzdz));

			part0 = vec4(dx_hy.re, dx_hy.im, dz_dxdz.re, dz_dxdz.im);
			part1 = vec4(sx_sz.re, sx_sz.im, dxdx_dzdz.re, dxdx_dzdz.im);
		}

		void main() {
			vec2 x = vec2(ivec2(gl_FragCoord.xy) - ivec2(resolution / 2)); // [-N/2, N/2)

			spectrum spec0 = getSpectrum(h0Texture0, x, sizes[0]);
			spectrum spec1 = getSpectrum(h0Texture1, x, sizes[1]);
			spectrum spec2 = getSpectrum(h0Texture2, x, sizes[2]);

			compressSpectrum(spec0, gl_FragData[0], gl_FragData[1]);
			compressSpectrum(spec1, gl_FragData[2], gl_FragData[3]);
			compressSpectrum(spec2, gl_FragData[4], gl_FragData[5]);
		}
	`
};