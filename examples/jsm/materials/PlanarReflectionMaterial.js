import { ShaderLib, PBRMaterial, MATERIAL_TYPE } from 't3d';

export class PlanarReflectionMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'PlanarReflection';

		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;

		this.defines.USE_PLANAR_REFLECT = true;

		this.uniforms.reflectIntensity = 1.0;
		this.uniforms.reflectTexture = null;
		this.uniforms.reflectTextureMatrix = new Float32Array(16);
		this.uniforms.reflectNormalScale = 1.0;
	}

}

const reflection_pars_vertex = `
    #ifdef USE_PLANAR_REFLECT
        uniform mat4 reflectTextureMatrix;
        varying vec4 v_reflectionUV;
    #endif
`;

const reflection_vertex = `
    #ifdef USE_PLANAR_REFLECT
        v_reflectionUV = reflectTextureMatrix * vec4(worldPosition.xyz, 1.0);
    #endif
`;

const reflection_pars_fragment = `
    #ifdef USE_PLANAR_REFLECT
        uniform sampler2D reflectTexture;
        uniform float reflectIntensity;

        #ifdef USE_NORMAL_MAP
            uniform float reflectNormalScale;
        #endif

        varying vec4 v_reflectionUV;
    #endif
`;

const reflection_fragment = `
    #ifdef USE_PLANAR_REFLECT
        vec4 reflectionUV = v_reflectionUV;
        reflectionUV.xyz = reflectionUV.xyz / reflectionUV.w;

        #ifdef USE_NORMAL_MAP
            reflectionUV.xyz += ((texture2D(normalMap, v_Uv).rgb - 0.5) * reflectNormalScale) / 50.;
        #endif

        vec4 reflectionColor = sRGBToLinear(texture2D(reflectTexture, reflectionUV.xy));
        float refectFactor = clamp(1.0 - reflectIntensity * reflectionColor.a, 0.0, 1.0);
        outColor.rgb = mix(reflectionColor.rgb, outColor.rgb, refectFactor);
    #endif
`;

let fragmentShader = ShaderLib.pbr_frag;
let vertexShader = ShaderLib.pbr_vert;

fragmentShader = fragmentShader.replace('#include <emissiveMap_pars_frag>', `
    #include <emissiveMap_pars_frag>
    ${reflection_pars_fragment}
`);

fragmentShader = fragmentShader.replace('#include <emissiveMap_frag>', `
    #include <emissiveMap_frag>
    ${reflection_fragment}
`);

vertexShader = vertexShader.replace('#include <modelPos_pars_vert>', `
    #include <modelPos_pars_vert>
    ${reflection_pars_vertex}
`);

vertexShader = vertexShader.replace('#include <modelPos_vert>', `
    #include <modelPos_vert>
    ${reflection_vertex}
`);