const SDFTextShader = {
	name: 'sdf_text',

	defines: {
		DEBUG: false,
		SHADOW: false,
		OUTLINE: false,
		IS_SUPERSAMPLING: true,
		IS_MSDF: false
	},

	uniforms: {
		gamma: 1,
		halo: 0.75,
		shadowColor: [0.3, 0.3, 0.3],
		shadowOffset: [0.016, -0.016],
		shadowGamma: 1,
		outlineColor: [1, 0, 0],
		outlineWidth: 0.04,
		outlineGamma: 1,
		fontSize: 72
	},

	vertexShader: `
		#include <common_vert>

		attribute vec2 a_Uv;

		uniform mat3 uvTransform;

		varying vec2 v_Uv;
		varying float v_gammaScale;

		void main() {
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
			v_gammaScale = gl_Position.w;
			v_Uv = (uvTransform * vec3(a_Uv, 1.)).xy;
		}
	`,

	fragmentShader: `
		uniform vec3 u_Color;
		uniform float u_Opacity;
		uniform sampler2D diffuseMap;

		uniform float halo;
		uniform float gamma;
		uniform float fontSize;

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
		varying float v_gammaScale;

		void sdfSupersample(in sampler2D tex, in vec2 uv, out float dist) {
			float dscale = 0.354; // half of 1/sqrt2; you can play with this
			vec2 duv = dscale * (dFdx(uv) + dFdy(uv));
			vec4 box = vec4(uv-duv, uv+duv);
			dist *= 0.5;
			dist += texture2D(tex, box.xy).r * 0.125;
			dist += texture2D(tex, box.zw).r * 0.125;
			dist += texture2D(tex, box.xw).r * 0.125;
			dist += texture2D(tex, box.zy).r * 0.125;
		}

		void msdfSupersample(in sampler2D tex,in vec2 uv, out vec3 dist) {
			float dscale = 0.354; // half of 1/sqrt2; you can play with this
			vec2 duv = dscale * (dFdx(uv) + dFdy(uv));
			vec4 box = vec4(uv-duv, uv+duv);
			dist *= 0.5;
			dist += texture2D(tex, box.xy).rgb * 0.125;
			dist += texture2D(tex, box.zw).rgb * 0.125;
			dist += texture2D(tex, box.xw).rgb * 0.125;
			dist += texture2D(tex, box.zy).rgb * 0.125;
		}

		float median(float r, float g, float b) {
			return max(min(r, g), min(max(r, g), b));
		}

		void main() {
			#ifdef IS_MSDF
				vec3 dist = texture2D(diffuseMap, v_Uv ).rgb;
			#else
				float dist = texture2D(diffuseMap, v_Uv ).r;
			#endif

			float GammaCorrect = 1.0;
			#ifdef IS_MSDF
				GammaCorrect = 0.00832 * v_gammaScale / fontSize;
			#else
				GammaCorrect = 0.00592 * v_gammaScale / fontSize;
			#endif	

			#ifdef IS_SUPERSAMPLING
				#ifdef IS_MSDF
					msdfSupersample(diffuseMap, v_Uv, dist);
				#else
					sdfSupersample(diffuseMap, v_Uv, dist);
				#endif	
			#endif
			
			#ifdef IS_MSDF
				float sigDist = median(dist.r, dist.g, dist.b) - 0.5;;
				float gammaSize = 0.12 +  gamma * GammaCorrect;
				float threshold = halo / 150.;
			#else
				float sigDist = dist;
				float gammaSize = gamma *  GammaCorrect;
				float threshold = halo;
			#endif

			float alpha = smoothstep(threshold - gammaSize, threshold + gammaSize, sigDist);
			vec4 textColor = vec4(u_Color, alpha * u_Opacity);
			
			#ifdef OUTLINE
				#ifdef IS_MSDF
					float outlineAlpha = smoothstep(threshold - outlineWidth * 2.0 - outlineGamma * 0.146 * GammaCorrect, threshold - outlineWidth * 2.0 + outlineGamma * 0.146 * GammaCorrect, sigDist);
				#else
					float outlineAlpha = smoothstep(threshold - outlineWidth - outlineGamma * 0.046, threshold - outlineWidth + outlineGamma * 0.046, sigDist);
				#endif	
				vec4 outlineColor4 = vec4(outlineColor, outlineAlpha * u_Opacity);
				textColor = mix(outlineColor4, textColor, textColor.a);
			#endif

			#ifdef SHADOW
				vec2 ShadowUV = v_Uv - shadowOffset;
				float fontShadowGamma  = shadowGamma * GammaCorrect;
				
				#ifdef IS_MSDF
					vec3  mapdist = texture2D(diffuseMap, v_Uv - shadowOffset).rgb;
					float shadowDist = median(mapdist.r, mapdist.g, mapdist.b) - 0.5;
				#else
					float shadowDist = texture2D(diffuseMap, v_Uv - shadowOffset).r;
					fontShadowGamma = fontShadowGamma * 10.;
				#endif	
				float shadowAlpha = smoothstep(threshold - fontShadowGamma, threshold + fontShadowGamma, shadowDist);
				vec4 shadowColor4 = vec4(shadowColor, shadowAlpha * u_Opacity);
				textColor = mix(shadowColor4, textColor, textColor.a);
			#endif

			#ifdef DEBUG
				#ifdef IS_MSDF
					gl_FragColor = vec4( texture2D(diffuseMap, v_Uv ).rgb, 1.0);
				#else
					gl_FragColor = vec4(sigDist, sigDist, sigDist, 1.0);
				#endif
			#else
				gl_FragColor = textColor;
			#endif
		}
	`
};

export { SDFTextShader };