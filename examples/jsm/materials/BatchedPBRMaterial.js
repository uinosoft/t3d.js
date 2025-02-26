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
		this.fragmentShader = fragmentShader;

		this.defines.USE_BATCHING = true;

		this.uniforms.batchingTexture = null;
	}

}

const batchingParsVert = `
    #ifdef USE_BATCHING
		#extension GL_ANGLE_multi_draw : require
		uniform sampler2D matricesTexture;
		uniform usampler2D indirectTexture;
		mat4 getBatchingMatrix(const in float i) {
			int size = textureSize(matricesTexture, 0).x;
			int j = int(i) * 4;
			int x = j % size;
			int y = j / size;
			vec4 v1 = texelFetch(matricesTexture, ivec2(x, y), 0);
			vec4 v2 = texelFetch(matricesTexture, ivec2(x + 1, y), 0);
			vec4 v3 = texelFetch(matricesTexture, ivec2(x + 2, y), 0);
			vec4 v4 = texelFetch(matricesTexture, ivec2(x + 3, y), 0);
			return mat4(v1, v2, v3, v4);
		}

		float getIndirectIndex( const in int i ) {
			int size = textureSize( indirectTexture, 0 ).x;
			int x = i % size;
			int y = i / size;
			return float( texelFetch( indirectTexture, ivec2( x, y ), 0 ).r );
		}

		#ifdef USE_BATCHING_COLOR
			uniform sampler2D colorsTexture;
			vec3 getBatchingColor( const in float i ) {
				int size = textureSize( colorsTexture, 0 ).x;
				int j = int( i );
				int x = j % size;
				int y = j / size;
				return texelFetch( colorsTexture, ivec2( x, y ), 0 ).rgb;
			}
		#endif
    #endif
`;

const batchingPositionVert = `
    #ifdef USE_BATCHING
		mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex(gl_DrawID) );
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

const batchingColorVert = `
	#ifdef USE_BATCHING_COLOR
		vec3 batchingColor = getBatchingColor( getIndirectIndex(gl_DrawID) );
		v_Color.rgb = batchingColor;
	#endif
`;

const batchingColorPerVert = `
	#ifdef USE_BATCHING_COLOR
		varying vec4 v_Color;
	#endif
`;

const batchingColorFrag = `
	#ifdef USE_BATCHING_COLOR
		outColor.rgb *= v_Color.rgb;
	#endif
`;

const batchingColorParsFrag = `
	#ifdef USE_BATCHING_COLOR
		varying vec4 v_Color;
	#endif
`;

let fragmentShader = ShaderLib.pbr_frag;

fragmentShader = fragmentShader.replace('#include <color_pars_frag>', `
	#include <color_pars_frag>
	${batchingColorParsFrag}
`);
fragmentShader = fragmentShader.replace('#include <color_frag>', `
	#include <color_frag>
	${batchingColorFrag}
`);

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
vertexShader = vertexShader.replace('#include <color_pars_vert>', `
	#include <color_pars_vert>
	${batchingColorPerVert}	
`);
vertexShader = vertexShader.replace('#include <color_vert>', `
	#include <color_vert>
	${batchingColorVert}	
`);