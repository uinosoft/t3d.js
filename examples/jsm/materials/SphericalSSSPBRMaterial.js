import { ShaderLib, PBRMaterial, MATERIAL_TYPE, ShaderChunk } from 't3d';

// TODO KHR_materials_volume_scatter
// TODO spot light

// Shader Chunks

const sss_direct = `
	#if defined(SUBSURFACE) && defined(USE_UV1)
		RE_Direct_Scattering(u_Directional[i].color, u_Directional[i].direction, v_Uv, N, normalize(-v_modelPos), v_modelPos, reflectedLight, BRDF_Diffuse_Lambert(diffuseColor));
	#endif
`;

const sss_point = `
	#if defined(SUBSURFACE) && defined(USE_UV1)
		RE_Direct_Scattering(u_Point[i].color, normalize(u_Point[i].position - v_modelPos), v_Uv, N, normalize(-v_modelPos), v_modelPos, reflectedLight, BRDF_Diffuse_Lambert(diffuseColor));
	#endif
`;

const sss_normal = `
	#if defined(SUBSURFACE) && defined(USE_UV1)
		vec4 worldSphereCenter = u_Model * vec4(uSphereCenter, 1.0);
		N = normalize(v_modelPos - worldSphereCenter.xyz/worldSphereCenter.w);
		geometryNormal = N;
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
	uniform vec3 thicknessColor;
	uniform vec3 uSphereCenter;
	uniform float uDensity;
	uniform mat4 u_Model;

	float getSphereSSS(vec3 worldPos, vec3 lightDir) {
		vec3 viewDir = normalize(u_CameraPosition - worldPos);
		vec4 worldSphereCenter = u_Model * vec4(uSphereCenter, 1.0);
		vec3 normalDir = normalize(worldPos - worldSphereCenter.xyz/worldSphereCenter.w);
		vec3 backLitDir = normalDir  - lightDir;
		float backSSS = saturate(dot(viewDir, -backLitDir));
		backSSS =  backSSS * uDensity;
		return backSSS;
	}

	void RE_Direct_Scattering(const in vec3 directLightColor, const in vec3 directLightDirection, const in vec2 uv, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryPos, inout ReflectedLight reflectedLight, const in vec3 diffuseColor) {
		float sphereSSS = getSphereSSS(geometryPos, directLightDirection);
		reflectedLight.directDiffuse +=  sphereSSS * diffuseColor * thicknessColor;
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

pbr_frag = pbr_frag.replace(
	'#include <normal_frag>',
	`#include <normal_frag>
	${sss_normal}`
);

class SphericalSSSPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'SSSPBR';

		this.vertexShader = ShaderLib.pbr_vert;
		this.fragmentShader = pbr_frag;

		this.uniforms.thicknessColor = [1, 1, 1];
		this.uniforms.uSphereCenter = [0, 0, 0];
		this.uniforms.uDensity = 1.4;

		this.defines.SUBSURFACE = true;
	}

}

export { SphericalSSSPBRMaterial };