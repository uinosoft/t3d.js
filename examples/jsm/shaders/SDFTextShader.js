const SDFTextShader = {
	name: 'sdf_text',

	defines: {
		DEBUG: false,
		SHADOW: false,
		OUTLINE: false
	},

	uniforms: {
		gamma: 1,
		halo: 0.75,
		shadowColor: [0.3, 0.3, 0.3],
		shadowOffset: [0.016, -0.016],
		shadowGamma: 1,
		outlineColor: [1, 0, 0],
		outlineWidth: 0.04,
		outlineGamma: 1
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

		void main() {
			float dist = texture2D(diffuseMap, v_Uv).r;
			float gammaSize = gamma * 0.00003 * v_gammaScale;
			float alpha = smoothstep(halo - gammaSize, halo + gammaSize, dist);
			vec4 textColor = vec4(u_Color, alpha * u_Opacity);
			
			#ifdef OUTLINE
				float outlineAlpha = smoothstep(halo - outlineWidth - outlineGamma * 0.046, halo - outlineWidth + outlineGamma * 0.046, dist);
				vec4 outlineColor4 = vec4(outlineColor, outlineAlpha * u_Opacity);
				textColor = mix(outlineColor4, textColor, textColor.a);
			#endif

			#ifdef SHADOW
				float shadowDist = texture2D(diffuseMap, v_Uv - shadowOffset).r;
				float shadowAlpha = smoothstep(halo - shadowGamma * 0.05, halo + shadowGamma * 0.05, shadowDist);
				vec4 shadowColor4 = vec4(shadowColor, shadowAlpha * u_Opacity);
				textColor = mix(shadowColor4, textColor, textColor.a);
			#endif

			#ifdef DEBUG
				gl_FragColor = vec4(dist, dist, dist, 1.0);
			#else
				gl_FragColor = textColor;
			#endif
		}
	`
};

export { SDFTextShader };