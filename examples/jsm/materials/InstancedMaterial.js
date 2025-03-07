import { ShaderLib, PBRMaterial, BasicMaterial, DepthMaterial, MATERIAL_TYPE } from 't3d';

const instancing_pars_vert = `
#ifdef USE_INSTANCING
	attribute mat4 instanceMatrix;
	uniform mat4 instanceOffset;
#endif
`;

const instancing_position_vert = `
#ifdef USE_INSTANCING
	mat4 instancingMatrix = inverseMat4(instanceOffset) * instanceMatrix * instanceOffset;
	transformed = (instancingMatrix * vec4(transformed, 1.0)).xyz;
#endif
`;

const instancing_normal_vert = `
#ifdef USE_INSTANCING
	mat4 instancingNormalMatrix = transposeMat4(inverseMat4(instancingMatrix));

	objectNormal = (instancingNormalMatrix * vec4(objectNormal, 0.0)).xyz;

	#ifdef USE_TANGENT
		objectTangent = (instancingNormalMatrix * vec4(objectTangent, 0.0)).xyz;
	#endif
#endif
`;

// InstancedPBRMaterial

let pbr_vert = ShaderLib.pbr_vert;

pbr_vert = pbr_vert.replace('#include <logdepthbuf_pars_vert>', `
#include <logdepthbuf_pars_vert>
${instancing_pars_vert}
`);
pbr_vert = pbr_vert.replace('#include <pvm_vert>', `
${instancing_position_vert}
#include <pvm_vert>
`);
pbr_vert = pbr_vert.replace('#include <normal_vert>', `
${instancing_normal_vert}
#include <normal_vert>
`);

class InstancedPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'InstancedPBR';

		this.vertexShader = pbr_vert;
		this.fragmentShader = ShaderLib.pbr_frag;

		this.defines.USE_INSTANCING = true;
		this.uniforms.instanceOffset = new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

}

// InstancedBasicMaterial

let basic_vert = ShaderLib.basic_vert;

basic_vert = basic_vert.replace('#include <logdepthbuf_pars_vert>', `
	#include <logdepthbuf_pars_vert>
	${instancing_pars_vert}
`);

basic_vert = basic_vert.replace('#include <pvm_vert>', `
	${instancing_position_vert}
	#include <pvm_vert>
`);

class InstancedBasicMaterial extends BasicMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'InstancedBasic';

		this.vertexShader = basic_vert;
		this.fragmentShader = ShaderLib.basic_frag;

		this.defines.USE_INSTANCING = true;
		this.uniforms.instanceOffset = new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

}

// InstancedDepthMaterial

let depth_vert = ShaderLib.depth_vert;

depth_vert = depth_vert.replace('#include <logdepthbuf_pars_vert>', `
	#include <logdepthbuf_pars_vert>
	${instancing_pars_vert}
`);

depth_vert = depth_vert.replace('#include <pvm_vert>', `
	${instancing_position_vert}
	#include <pvm_vert>
`);

class InstancedDepthMaterial extends DepthMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'InstancedDepth';

		this.vertexShader = depth_vert;
		this.fragmentShader = ShaderLib.depth_frag;

		this.defines.USE_INSTANCING = true;
		this.uniforms.instanceOffset = new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

}

export {
	InstancedPBRMaterial, InstancedBasicMaterial, InstancedDepthMaterial,
	instancing_pars_vert, instancing_position_vert, instancing_normal_vert
};