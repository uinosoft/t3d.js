import { ShaderMaterial } from 't3d';

class BitmapTextMaterial extends ShaderMaterial {

	constructor() {
		super(BitmapTextShader);
		this.transparent = true;
	}

}

const BitmapTextShader = {
	name: 'bitmap_text',

	defines: {
		BITMAP_TYPE: 1,
		SHADOW: false,
		OUTLINE: false
	},

	uniforms: {
		gamma: 1,
		halo: 0.75,
		shadowColor: [0.3, 0.3, 0.3],
		shadowOffset: [0.001, -0.001],
		shadowGamma: 1,
		outlineColor: [1, 0, 0],
		outlineWidth: 0.05,
		outlineGamma: 1
	},

	vertexShader: `
		#include <common_vert>
		#include <logdepthbuf_pars_vert>

		attribute vec2 a_Uv;
		attribute vec2 a_Size;

		uniform mat3 uvTransform;

		varying vec2 v_Uv;
		varying vec2 v_Size;

		void main() {
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);

			v_Uv = (uvTransform * vec3(a_Uv, 1.)).xy;
			v_Size = a_Size;

			#include <logdepthbuf_vert>
		}
	`,

	fragmentShader: `
		uniform vec3 u_Color;
		uniform float u_Opacity;
		uniform sampler2D diffuseMap;

		uniform float halo;
		uniform float gamma;

		#ifdef SHADOW
			uniform vec3 shadowColor;
			uniform vec2 shadowOffset;
			uniform float shadowGamma;
		#endif

		#ifdef OUTLINE
			uniform vec3 outlineColor;
			uniform float outlineWidth;
			uniform float outlineGamma;
		#endif

		varying vec2 v_Uv;
		varying vec2 v_Size;

		vec4 blendColors(vec4 src, vec4 dst) {
			return vec4(src.rgb * src.a + dst.rgb * (1.0 - src.a), src.a + dst.a * (1.0 - src.a));
		}

		float getAlpha(float dist, float halo, float gamma) {
			return smoothstep(halo - gamma, halo + gamma, dist);
		}

		#if BITMAP_TYPE == 1
			float getSDFDist(vec2 uv) {
				return texture2D(diffuseMap, uv).r;
			}

		#elif BITMAP_TYPE == 2
			float median(float r, float g, float b) {
				return max(min(r, g), min(max(r, g), b));
			}
			float getSDFDist(vec2 uv) {
				vec3 cannels = texture2D(diffuseMap, uv).rgb;
				return median(cannels.r, cannels.g, cannels.b);
			}
		#endif

		#include <fog_pars_frag>
		#include <logdepthbuf_pars_frag>

		void main() {
			#include <logdepthbuf_frag>

			#if BITMAP_TYPE == 0
				gl_FragColor = texture2D(diffuseMap, v_Uv);
			#else
				float dist = getSDFDist(v_Uv);

				float gammaScalar = 1.5 * length(fwidth(v_Size));

				vec4 resultColor = vec4(0.0);

				#ifdef SHADOW
					float shadowDist = getSDFDist(v_Uv - shadowOffset);
					float shadowAlpha = getAlpha(shadowDist, halo, shadowGamma * gammaScalar);
					resultColor = blendColors(vec4(shadowColor, shadowAlpha), resultColor);
				#endif

				#ifdef OUTLINE
					float outlineAlpha = getAlpha(dist, halo - outlineWidth, outlineGamma * gammaScalar);
					resultColor = blendColors(vec4(outlineColor, outlineAlpha), resultColor);
				#endif

				float textAlpha = getAlpha(dist, halo, gamma * gammaScalar);
				resultColor = blendColors(vec4(u_Color, textAlpha), resultColor);

				resultColor.rgb /= resultColor.a;
				resultColor.a *= u_Opacity;

				gl_FragColor = resultColor;
			#endif

			#include <fog_frag>
		}
	`
};

export { BitmapTextMaterial, BitmapTextShader };