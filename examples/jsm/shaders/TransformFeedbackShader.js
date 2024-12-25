/**
 * Blend Shader.
 */
const TransformFeedbackShader = {
	name: 'texture_transformFeedback',

	uniforms: {
		u_Offset: [1.0, 0.0, 0.0]
	},

	vertexShader: `
		in vec3 a_Position;
		out vec3 out_Position;

		uniform vec3 u_Offset;
		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;
		void main() {
			gl_PointSize = 1.0;
			out_Position = a_Position.xyz + u_Offset + sin(out_Position.y * 43758.5453123);
			if(out_Position.x > 100.0) {
				out_Position.x = -100.0 + sin(out_Position.y * 43758.5453123);
			}else if(out_Position.x < -100.0) {
				out_Position.x = 100.0 + sin(out_Position.y * 43758.5453123);
			}
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
		}
	`,

	fragmentShader: `
		void main() {
			gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
		}
	`
};

export { TransformFeedbackShader };
