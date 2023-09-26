const MotionBlur2Shader = {
	name: 'motion_blur2',

	uniforms: {
		'tMotion': null,
		'tColor': null,
		'screenSize': [1024, 512],
		'velocityFactor': 1.0
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;

		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;
		uniform mat4 u_View;

		varying vec2 v_Uv;

		void main() {
			v_Uv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
		}
	`,

	fragmentShader: `
		#define SAMPLES 64.0
		
        varying vec2 v_Uv;

        uniform sampler2D tMotion;
        uniform sampler2D tColor;

        uniform float velocityFactor;
        uniform vec2 screenSize;

        void main() {
			vec2 texelSize = 1.0 / screenSize;
			vec4 velocityColor = texture2D(tMotion, v_Uv);
			velocityColor.rg = velocityColor.rg * 2.0 - vec2(1.0);
			vec2 velocity = vec2(velocityColor.r, velocityColor.g) * velocityColor.a;
			velocity *= velocityFactor;
			float speed = length(velocity / texelSize);
			int samplesCount = int(clamp(speed, 1.0, SAMPLES));
			velocity = normalize(velocity) * texelSize;
			float hlim = float(-samplesCount) * 0.5 + 0.5;
			vec4 result = texture2D(tColor, v_Uv);
			for (int i = 1; i < int(SAMPLES); ++i) {
				if (i >= samplesCount) {
					break;
				}
				vec2 offset = v_Uv+velocity * (hlim + float(i));
				result += texture2D(tColor, offset);
			}
			gl_FragColor = result / float(samplesCount);
			gl_FragColor.a = result.a;
        }
    `
};

export { MotionBlur2Shader };