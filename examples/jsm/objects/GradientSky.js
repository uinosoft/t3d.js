import {
	BoxGeometry,
	DRAW_SIDE,
	Mesh,
	ShaderMaterial
} from 't3d';

class GradientSky extends Mesh {

	constructor() {
		const geometry = new BoxGeometry(1, 1, 1);

		const material = new ShaderMaterial(GradientSky.GradientSkyShader);
		material.side = DRAW_SIDE.BACK;

		super(geometry, material);

		this.frustumCulled = false;
	}

}

GradientSky.GradientSkyShader = {
	name: 'gradient_sky',

	defines: {},

	uniforms: {
		topColor: [93 / 255, 163 / 255, 254 / 255],
		middleColor: [181 / 255, 222 / 255, 247 / 255],
		bottomColor: [208 / 255, 189 / 255, 93 / 255],
		diffusion: 1.0
	},

	vertexShader: `
		#include <common_vert>

		varying vec3 vDir;

        mat4 clearMat4Translate(mat4 m) {
            mat4 outMatrix = m;
            outMatrix[3].xyz = vec3(0., 0., 0.);
            return outMatrix;
		}

		void main() {
            mat4 modelMatrix = clearMat4Translate(u_Model);
			mat4 viewMatrix = clearMat4Translate(u_View);

			vDir = normalize((modelMatrix * vec4(a_Position, 0.0)).xyz);

            gl_Position = u_Projection * viewMatrix * modelMatrix * vec4(a_Position, 1.0);
			gl_Position.z = gl_Position.w;
		}
	`,

	fragmentShader: `
		#include <common_frag>

		uniform vec3 topColor;
		uniform vec3 bottomColor;
        uniform vec3 middleColor;
        uniform float diffusion;

		varying vec3 vDir;

		void main() {
            vec3 viewDir = normalize(vDir);

            vec3 mixColor = step(0.0, viewDir.y) * topColor + step(viewDir.y, 0.0) * bottomColor;
            vec3 color = mix(mixColor, middleColor, 1.0 - abs(viewDir.y) * diffusion);
			
            gl_FragColor = vec4(color, 1.0);
		}
	`
};

export { GradientSky };