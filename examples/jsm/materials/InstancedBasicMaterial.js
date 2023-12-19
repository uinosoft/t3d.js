import { ShaderLib, BasicMaterial, MATERIAL_TYPE } from 't3d';

export class InstancedBasicMaterial extends BasicMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'InstancedBasic';

		this.vertexShader = vertexShader;
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

const instancingParsVert = `
	#ifdef USE_INSTANCING
		attribute mat4 instanceMatrix;
		uniform mat4 instanceOffset;
	#endif
`;

const instancingPositionVert = `
	#ifdef USE_INSTANCING
		mat4 localInstanceMatrix = inverseMat4(instanceOffset) * instanceMatrix * instanceOffset;
		transformed = (localInstanceMatrix * vec4(transformed, 1.0)).xyz;
	#endif
`;

let vertexShader = ShaderLib.basic_vert;

vertexShader = vertexShader.replace('#include <logdepthbuf_pars_vert>', `
	#include <logdepthbuf_pars_vert>
	${instancingParsVert}
`);
vertexShader = vertexShader.replace('#include <pvm_vert>', `
	${instancingPositionVert}
	#include <pvm_vert>
`);