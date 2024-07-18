const XRayShader = {
	name: 'xray',

	defines: {},

	uniforms: {
		power: 1.0,
		glowInverse: false,
		glowColor: [0, 200 / 255, 1]
	},

	vertexShader: `
        #include <common_vert>

		#include <skinning_pars_vert>

		uniform float power;
		uniform bool glowInverse;
		
		varying float intensity;

		void main() {
            #include <begin_vert>
			#include <skinning_vert>
			#include <skinnormal_vert>
			#include <pvm_vert>

			mat4 normalMatrix = transposeMat4(inverseMat4(u_View * u_Model));
			vec3 viewSpaceNormal = normalize((normalMatrix * vec4(objectNormal, 0.0)).xyz);
			float normalFactor = abs(dot(viewSpaceNormal, vec3(0, 0, 1.)));
			if (glowInverse) {
				intensity = pow(normalFactor, power);
			} else {
				intensity = pow(1.0 - normalFactor, power);
			}
		}
    `,

	fragmentShader: `
        uniform float u_Opacity;

        uniform vec3 glowColor;

        varying float intensity;

		void main() {
            gl_FragColor = vec4(glowColor, intensity * u_Opacity);
		}
    `
};

export { XRayShader };