import { ShaderLib, PBRMaterial, MATERIAL_TYPE } from 't3d';

// Only support WebGL2 for now.
export class BatchedPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'BatchedPBR';

		this.vertexShader = vertexShader;
		this.fragmentShader = ShaderLib.pbr_frag;

		this.defines.USE_BATCHING = true;

		this.uniforms.batchingTexture = null;
	}

}

const batchingParsVert = `
    #ifdef USE_BATCHING
		attribute float batchId;
		uniform sampler2D batchingTexture;
		mat4 getBatchingMatrix(const in float i) {
			int size = textureSize(batchingTexture, 0).x;
			int j = int(i) * 4;
			int x = j % size;
			int y = j / size;
			vec4 v1 = texelFetch(batchingTexture, ivec2(x, y), 0);
			vec4 v2 = texelFetch(batchingTexture, ivec2(x + 1, y), 0);
			vec4 v3 = texelFetch(batchingTexture, ivec2(x + 2, y), 0);
			vec4 v4 = texelFetch(batchingTexture, ivec2(x + 3, y), 0);
			return mat4(v1, v2, v3, v4);
		}
    #endif
`;

const batchingPositionVert = `
    #ifdef USE_BATCHING
		mat4 batchingMatrix = getBatchingMatrix(batchId);
		vec4 worldPosition = u_Model * batchingMatrix * vec4(transformed, 1.0);
		gl_Position = u_ProjectionView * worldPosition;
	#else
		vec4 worldPosition = u_Model * vec4(transformed, 1.0);
		gl_Position = u_ProjectionView * worldPosition;
    #endif
`;

const batchingNormalVert = `
    #ifdef USE_BATCHING
		objectNormal = (transposeMat4(inverseMat4(batchingMatrix)) * vec4(objectNormal, 0.0)).xyz;

		#ifdef USE_TANGENT
			objectTangent = (transposeMat4(inverseMat4(batchingMatrix)) * vec4(objectTangent, 0.0)).xyz;
		#endif
    #endif
`;

let vertexShader = ShaderLib.pbr_vert;

vertexShader = vertexShader.replace('#include <logdepthbuf_pars_vert>', `
    #include <logdepthbuf_pars_vert>
    ${batchingParsVert}
`);
vertexShader = vertexShader.replace('#include <pvm_vert>', batchingPositionVert);
vertexShader = vertexShader.replace('#include <normal_vert>', `
    ${batchingNormalVert}
    #include <normal_vert>
`);