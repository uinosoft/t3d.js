// Reference: https://stackblitz.com/edit/fft-2d?file=ocean%2Fprograms%2Fh0.ts

export const H0Shader = {
	name: 'ocean_fft_h0',
	defines: {},
	uniforms: {
		noise: null,
		resolution: 0,
		wind: [0, 0],
		alignment: 0,
		cascades: [
			{ size: 0, strength: 0, minK: 0, maxK: 0 },
			{ size: 0, strength: 0, minK: 0, maxK: 0 },
			{ size: 0, strength: 0, minK: 0, maxK: 0 }
		]
	},
	vertexShader: /* glsl */`
		attribute vec3 a_Position;
		void main() {
			gl_Position = vec4(a_Position, 1.0);
		}
	`,
	fragmentShader: /* glsl */`
		#define PI2 6.2831853071
		#define g 9.81

		uniform sampler2D noise;
		uniform int resolution; // N
		uniform vec2 wind;
		uniform float alignment;

		uniform struct FieldCascade {
			float size;
			float strength;
			float minK;
			float maxK;
		} cascades[3];

		vec4 gauss() {
			vec2 uv = vec2(ivec2(gl_FragCoord.xy)) / float(resolution);

			vec2 noise0 = texture2D(noise, uv).rg;
			vec2 noise1 = texture2D(noise, -uv).rg;

			float u0 = 2.0 * PI * noise0.x;
			float v0 = sqrt(-2.0 * log(noise0.y));

			float u1 = 2.0 * PI * noise1.x;
			float v1 = sqrt(-2.0 * log(noise1.y));

			return vec4(v0 * cos(u0), v0 * sin(u0), v1 * cos(u1), -v1 * sin(u1));
		}

		vec4 phillips(in vec2 k, float A, float minK, float maxK) {
			float k2 = dot(k, k);

			if(k2 <= minK * minK || k2 >= maxK * maxK) {
				return vec4(0.0);
			}

			float L = dot(wind, wind) / g;
			float L2 = L * L;
			float h0k = (A / k2 / k2) * exp(-1.0 / (k2 * L2)) * 0.5, h0mk = h0k;

			if(alignment > 0.0) {
				h0k *=  pow(max(0.0, dot(normalize(wind), normalize(k))), alignment);
				h0mk *=  pow(max(0.0, dot(normalize(wind), normalize(-k))), alignment);
			}

			return sqrt(vec4(h0k, h0k, h0mk, h0mk));
		}

		void main() {
			vec2 x = vec2(ivec2(gl_FragCoord.xy) - ivec2(resolution / 2)); // [-N/2, N/2]
			vec2 k = vec2(PI2) * x;
			vec4 rnd = gauss();

			gl_FragData[0] = phillips(k / cascades[0].size, cascades[0].strength, cascades[0].minK, cascades[0].maxK) * rnd;
			gl_FragData[1] = phillips(k / cascades[1].size, cascades[1].strength, cascades[1].minK, cascades[1].maxK) * rnd;
			gl_FragData[2] = phillips(k / cascades[2].size, cascades[2].strength, cascades[2].minK, cascades[2].maxK) * rnd;
		}
	`
};