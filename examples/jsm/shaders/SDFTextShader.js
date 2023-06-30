const SDFTextShader = {
	name: 'sdf_text',

	defines: {
		DEBUG: false
	},

	uniforms: {
		gamma: 4,
		halo: 0.75
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

		varying vec2 v_Uv;
		varying float v_gammaScale;

		void main() {
			float dist = texture2D(diffuseMap, v_Uv).r;
			float gammaSize = gamma * 0.00003 * v_gammaScale;
			float alpha = smoothstep(halo - gammaSize, halo + gammaSize, dist);
			gl_FragColor = vec4(u_Color, alpha * u_Opacity);

			#ifdef DEBUG
				gl_FragColor = vec4(dist, dist, dist, 1.0);
			#endif
		}
	`
};

export { SDFTextShader };