// Reference: https://stackblitz.com/edit/fft-2d?file=ocean%2Fprograms%2Fpost-fft2.ts

export const PostFFT2Shader = {
	name: 'ocean_fft2_post',
	defines: {},
	uniforms: {
		N2: 1.0,
		ifft0: null,
		ifft1: null,
		ifft2: null,
		ifft3: null,
		ifft4: null,
		ifft5: null
	},
	vertexShader: /* glsl */`
		attribute vec3 a_Position;
		void main() {
			gl_Position = vec4(a_Position, 1.0);
		}
	`,
	fragmentShader: /* glsl */`
		uniform float N2;
		uniform sampler2D ifft0; // dx_hy_dz_dxdz
		uniform sampler2D ifft1; // sx_sz_dxdx_dzdz
		uniform sampler2D ifft2; // dx_hy_dz_dxdz
		uniform sampler2D ifft3; // sx_sz_dxdx_dzdz
		uniform sampler2D ifft4; // dx_hy_dz_dxdz
		uniform sampler2D ifft5; // sx_sz_dxdx_dzdz

		void main() {
			const float sign[] = float[2](1.0, -1.0);
			float p = float(int(gl_FragCoord.x) + int(gl_FragCoord.y));
			float s = sign[int(mod(p, 2.0))];
			float m = s * N2;
			ivec2 uv = ivec2(gl_FragCoord.xy);

			gl_FragData[0] = texelFetch(ifft0, uv, 0).rgba * m; //dx_hy_dz_dxdz0
			gl_FragData[1] = texelFetch(ifft1, uv, 0).rgba * m; //sx_sz_dxdx_dzdz0

			gl_FragData[2] = texelFetch(ifft2, uv, 0).rgba * m; //dx_hy_dz_dxdz1
			gl_FragData[3] = texelFetch(ifft3, uv, 0).rgba * m; //sx_sz_dxdx_dzdz1

			gl_FragData[4] = texelFetch(ifft4, uv, 0).rgba * m; //dx_hy_dz_dxdz2
			gl_FragData[5] = texelFetch(ifft5, uv, 0).rgba * m; //sx_sz_dxdx_dzdz2
		}
	`
};