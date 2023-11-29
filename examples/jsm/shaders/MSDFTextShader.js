// reference - https://github.com/leochocolat/three-msdf-text-utils/tree/main/src/MSDFTextMaterial/shaders
const MSDFTextShader = {
	name: 'msdf_text',

	defines: {
		IS_SMALL: false,
		IS_STOKED: false
	},

	uniforms: {
		uMap: null,
		uAlphaTest: 0.01,
		uStrokeColor: [1, 0, 0],
		uStrokeOutsetWidth: 0,
		uStrokeInsetWidth: 0.3,
		uThreshold: 0.05
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;

		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;

		varying vec2 v_Uv;
		
		void main() {
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
			v_Uv = a_Uv;  
		}
	`,

	fragmentShader: `
		uniform vec3 u_Color;
		uniform float u_Opacity;

		uniform sampler2D uMap; 

		uniform float uAlphaTest;
		
		uniform vec3 uStrokeColor;
		uniform float uStrokeOutsetWidth;
		uniform float uStrokeInsetWidth;

		uniform float uThreshold;

		varying vec2 v_Uv;

		float median(float r, float g, float b) {
			return max(min(r, g), min(max(r, g), b));
		}

		void main() {
			vec3 s = texture2D(uMap, v_Uv).rgb;

			float sigDist = median(s.r, s.g, s.b) - 0.5;
			float afwidth = 1.4142135623730951 / 2.0;

			#ifdef IS_SMALL
				float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
			#else
				float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
			#endif

			if(alpha < uAlphaTest) discard;

			#ifdef IS_STOKED
				float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;
				float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;
				#ifdef IS_SMALL
					float outset = smoothstep(uThreshold-afwidth, uThreshold+afwidth, sigDistOutset);
					float inset = 1.0-smoothstep(uThreshold-afwidth, uThreshold+afwidth, sigDistInset);
				#else
					float outset = clamp(sigDistOutset/fwidth(sigDistOutset)+0.5, 0.0, 1.0);
					float inset = 1.0-clamp(sigDistInset/fwidth(sigDistInset)+0.5, 0.0, 1.0);
				#endif
				float border = outset * inset;
				gl_FragColor = vec4(uStrokeColor, u_Opacity * border);
			#else
				gl_FragColor = vec4(u_Color, u_Opacity * alpha);
			#endif
		}
	`
};

export { MSDFTextShader };