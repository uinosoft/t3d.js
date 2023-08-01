// ref: github.com/mrdoob/three.js/blob/dev/examples/jsm/shaders/LuminosityHighPassShader.js

const LuminosityHighPassShader = {
	name: 'luminosityHighPass',

	uniforms: {
		'tDiffuse': null,
		'luminosityThreshold': 1.0,
		'smoothWidth': 0.01,
		'defaultColor': [0, 0, 0],
		'defaultOpacity': 0.0
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;
		
		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;
		
		varying vec2 v_Uv;
		
		void main() {
			v_Uv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );
		}
	`,

	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 v_Uv;
		
		void main() {
			vec4 texel = texture2D(tDiffuse, v_Uv);
			vec3 luma = vec3(0.299, 0.587, 0.114);
			float v = dot(texel.xyz, luma);
			vec4 outputColor = vec4(defaultColor.rgb, defaultOpacity);
			float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, v);
			gl_FragColor = mix(outputColor, texel, alpha);
		}
	`
};

export { LuminosityHighPassShader };