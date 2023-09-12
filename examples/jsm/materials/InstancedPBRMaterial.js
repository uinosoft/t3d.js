import { ShaderLib, PBRMaterial, MATERIAL_TYPE } from 't3d';

export class InstancedPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'InstancedPBR';

		this.vertexShader = vertexShader;
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

const instancingNormalVert = `
    #ifdef USE_INSTANCING
        #ifdef USE_INSTANCING
            objectNormal = (transposeMat4(inverseMat4(localInstanceMatrix)) * vec4(objectNormal, 0.0)).xyz;
        #endif

        #ifdef USE_TANGENT
            objectTangent = (transposeMat4(inverseMat4(localInstanceMatrix)) * vec4(objectTangent, 0.0)).xyz;
        #endif
    #endif
`;

let vertexShader = ShaderLib.pbr_vert;

vertexShader = vertexShader.replace('#include <logdepthbuf_pars_vert>', `
    #include <logdepthbuf_pars_vert>
    ${instancingParsVert}
`);
vertexShader = vertexShader.replace('#include <pvm_vert>', `
    ${instancingPositionVert}
    #include <pvm_vert>
`);
vertexShader = vertexShader.replace('#include <normal_vert>', `
    ${instancingNormalVert}
    #include <normal_vert>
`);