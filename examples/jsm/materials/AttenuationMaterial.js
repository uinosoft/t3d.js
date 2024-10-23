import { MATERIAL_TYPE, PBRMaterial, ShaderLib } from 't3d';

const fresnel_pars_frag = `
#include <inverse>
#include <transpose>
#ifdef FRESNEL
	uniform float fresnelPower;
	uniform bool fresnelInverse;
#endif
`;

const fresnel_frag = `
#ifdef FRESNEL
    vec3 normal = (transposeMat4(inverseMat4(u_View)) * vec4(N, 0.0)).xyz;
    normal = normalize(normal);
	if (fresnelInverse) {
		gl_FragColor.a *= pow(abs(dot(normal, vec3(0., 0., 1.))), fresnelPower);
	} else {
		gl_FragColor.a *= pow(1.0 - abs(dot(normal, vec3(0., 0., 1.))), fresnelPower);
	}
#endif
`;

let pbr_frag = ShaderLib.pbr_frag;

pbr_frag = pbr_frag.replace('#include <clippingPlanes_pars_frag>', `
    #include <clippingPlanes_pars_frag>
    ${fresnel_pars_frag}
`);

pbr_frag = pbr_frag.replace('#include <end_frag>', `
    #include <end_frag>
    ${fresnel_frag}
`);

class AttenuationPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'AttenuationPBR';

		this.vertexShader = ShaderLib.pbr_vert;
		this.fragmentShader = pbr_frag;

		this.defines.FRESNEL = true;

		this.uniforms.fresnelPower = 0.9;
		this.uniforms.fresnelInverse = false;

		this.transparent = true;
	}

}

export { AttenuationPBRMaterial, fresnel_pars_frag, fresnel_frag };
