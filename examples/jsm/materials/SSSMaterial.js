import { ShaderLib, ShaderChunk, PBRMaterial, MATERIAL_TYPE } from 't3d';

// TODO KHR_materials_volume_scatter
// TODO spot light

// Shader Chunks

const sss_direct = `
	#if defined(SUBSURFACE) && defined(USE_UV1)
		RE_Direct_Scattering(u_Directional[i].color, u_Directional[i].direction, v_Uv, N, normalize(-v_modelPos), reflectedLight);
	#endif
`;

const sss_point = `
	#if defined(SUBSURFACE) && defined(USE_UV1)
		RE_Direct_Scattering(u_Point[i].color, u_Point[i].position, v_Uv, N, normalize(-v_modelPos), reflectedLight);
	#endif
`;

let sss_light_frag = ShaderChunk.light_frag;

sss_light_frag = sss_light_frag.replace(
	'reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);',
	`reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);
	${sss_direct}`
);

sss_light_frag = sss_light_frag.replace(
	'irradiance = u_Point[i].color * falloff * dotNL * PI;',
	`irradiance = u_Point[i].color * falloff * dotNL * PI;
	${sss_point}`
);

const sss_pars_frag = `
	uniform sampler2D thicknessMap;
	uniform float thicknessPower;
	uniform float thicknessScale;
	uniform float thicknessDistortion;
	uniform float thicknessAmbient;
	uniform float thicknessAttenuation;
	uniform vec3 thicknessColor;

	void RE_Direct_Scattering(const in vec3 directLightColor, const in vec3 directLightDirection, const in vec2 uv, const in vec3 geometryNormal, const in vec3 geometryViewDir, inout ReflectedLight reflectedLight) {
		vec3 thickness = thicknessColor * texture2D(thicknessMap, uv).r;
		vec3 scatteringHalf = normalize(directLightDirection + (geometryNormal * thicknessDistortion));
		float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
		vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * thickness;
		reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLightColor;
	}
`;

// PBR

let pbr_frag = ShaderLib.pbr_frag;

pbr_frag = pbr_frag.replace(
	'#include <clippingPlanes_pars_frag>',
	`#include <clippingPlanes_pars_frag>
	${sss_pars_frag}`
);

pbr_frag = pbr_frag.replace(
	'#include <light_frag>',
	sss_light_frag
);

class SSSPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'SSSPBR';

		this.vertexShader = ShaderLib.pbr_vert;
		this.fragmentShader = pbr_frag;

		this.uniforms.thicknessMap = null; //
		this.uniforms.thicknessColor = [0.3, 0.3, 0.3];
		this.uniforms.thicknessDistortion = 0.1;
		this.uniforms.thicknessAmbient = 0.0;
		this.uniforms.thicknessAttenuation = 0.1;
		this.uniforms.thicknessPower = 2.0;
		this.uniforms.thicknessScale = 10.0;

		this.defines.SUBSURFACE = true;
	}

}

// Export

export { sss_light_frag, sss_pars_frag, SSSPBRMaterial };