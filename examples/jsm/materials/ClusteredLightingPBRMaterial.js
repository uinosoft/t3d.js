import { ShaderLib, ShaderChunk, PBRMaterial, MATERIAL_TYPE } from 't3d';

class ClusteredLightingPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'ClusteredLightingPBR';

		this.vertexShader = ShaderLib.pbr_vert;
		this.fragmentShader = fragmentShader;

		this.uniforms.cells = new Float32Array(3);
		this.uniforms.maxLightsPerCell = 0;
		this.uniforms.cellsDotData = new Float32Array(3);
		this.uniforms.cellsTextureSize = new Float32Array(3);
		this.uniforms.cellsTransformFactors = new Float32Array(4);

		this.uniforms.cellsTexture = null;
		this.uniforms.lightsTexture = null;

		this.defines.CLUSTER_LIGHT = true;
		this.defines.CLUSTER_DEBUG = false;
	}

}

const clusterlight_pars_frag = `
#ifdef CLUSTER_LIGHT
	uniform vec3 cells;
	uniform int maxLightsPerCell;
	uniform vec3 cellsDotData;
	uniform vec3 cellsTextureSize;
	uniform vec4 cellsTransformFactors;

	uniform sampler2D cellsTexture;
	uniform sampler2D lightsTexture;

	struct ClusteredLight {
		float type;
		vec3 position;
		vec3 color;
		float distance;
		float decay;
		vec3 direction;
		float coneCos;
		float penumbraCos;
	};

	void getClusteredLightFromTexture(int index, int size, inout ClusteredLight light) {
		int j = index * 4;
		int x = j % size;
		int y = j / size;
		vec4 lightData = texelFetch(lightsTexture, ivec2(x + 0, y), 0);
		vec4 lightData1 = texelFetch(lightsTexture, ivec2(x + 1, y), 0);
		vec4 lightData2 = texelFetch(lightsTexture, ivec2(x + 2, y), 0);
		vec4 lightData3 = texelFetch(lightsTexture, ivec2(x + 3, y), 0);
		light.color = lightData1.xyz;
		light.decay = lightData1.w;
		light.position = lightData2.xyz;
		light.distance = lightData2.w;
		light.direction = lightData3.xyz;
		light.coneCos = lightData3.w;
		light.penumbraCos = lightData.y;
		light.type = lightData.x;
	}
#endif
`;

const clusterlight_frag = `
#ifdef CLUSTER_LIGHT
	vec4 positionView = u_View * vec4(v_modelPos, 1.0);

	float halfFrustumHeight = -positionView.z * cellsTransformFactors.z;
	float halfFrustumWidth = halfFrustumHeight * cellsTransformFactors.w;

	vec3 cellCoords;
	cellCoords.z = floor(log(-positionView.z) * cellsTransformFactors.x + cellsTransformFactors.y);
	cellCoords.y = floor((positionView.y + halfFrustumHeight) / (2.0 * halfFrustumHeight) * cells.y);
	cellCoords.x = floor((positionView.x + halfFrustumWidth) / (2.0 * halfFrustumWidth) * cells.x);

	if(!(any(lessThan(cellCoords, vec3(0.0))) || any(greaterThanEqual(cellCoords, cells)))) {
		float cellIndex = dot(cellsDotData, cellCoords);
		float clusterV = floor(cellIndex * cellsTextureSize.y);
		float clusterU = cellIndex - (clusterV * cellsTextureSize.x);

		int size = textureSize(lightsTexture, 0).x;

		ClusteredLight clusteredLight;
		float lightDistance;
    	float angleCos;

		for (int lightCellIndex = 0; lightCellIndex < maxLightsPerCell; lightCellIndex++) {
			float lightIndex = texelFetch(cellsTexture, ivec2(int(clusterU) + lightCellIndex, clusterV), 0).x;

			if (lightIndex <= 0.0) break;

			#ifdef CLUSTER_DEBUG
				reflectedLight.directDiffuse = mix(vec3(0., 0., 1.), vec3(1., 0., 0.), float(lightCellIndex + 1) / float(maxLightsPerCell));
				continue;
			#endif

			getClusteredLightFromTexture(int(lightIndex - 1.), size, clusteredLight);

			L = clusteredLight.position - v_modelPos;
			lightDistance = length(L);
			L = normalize(L);
			if(clusteredLight.type == 1.0) {
				falloff = pow(clamp(1. - lightDistance / clusteredLight.distance, 0.0, 1.0), clusteredLight.decay);
			} else {
				angleCos = dot(L, -normalize(clusteredLight.direction));
				falloff = smoothstep(clusteredLight.coneCos, clusteredLight.penumbraCos, angleCos);
				falloff *= pow(clamp(1. - lightDistance / clusteredLight.distance, 0.0, 1.0), clusteredLight.decay);
			}

			dotNL = saturate(dot(N, L));
			irradiance = clusteredLight.color * falloff * dotNL * PI;

			#ifdef USE_CLEARCOAT
				ccDotNL = saturate(dot(clearcoatNormal, L));
				ccIrradiance = ccDotNL * clusteredLight.color * falloff  * PI;
				clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);
				reflectedLight.directSpecular += ccIrradiance * clearcoat * BRDF_Specular_GGX(specularColor, clearcoatNormal, L, V, clearcoatRoughness);
			#else
				clearcoatDHR = 0.0;
			#endif

			reflectedLight.directDiffuse += (1.0 - clearcoatDHR) * irradiance * BRDF_Diffuse_Lambert(diffuseColor);

			#ifdef USE_PHONG
				reflectedLight.directSpecular += irradiance * BRDF_Specular_BlinnPhong(specularColor, N, L, V, shininess) * specularStrength;
			#endif

			#ifdef USE_PBR
				reflectedLight.directSpecular += (1.0 - clearcoatDHR) * irradiance * BRDF_Specular_GGX(specularColor, N, L, V, roughness);
			#endif
		}

		#ifdef CLUSTER_DEBUG
			gl_FragColor = vec4(reflectedLight.directDiffuse, 1.0);
			return;
		#endif
	}
#endif
`;

let fragmentShader = ShaderLib.pbr_frag;

fragmentShader = fragmentShader.replace(
	'#include <clippingPlanes_pars_frag>',
	`#include <clippingPlanes_pars_frag>
	${clusterlight_pars_frag}`);

const light_frag = ShaderChunk.light_frag.replace(
	'vec3 indirectIrradiance = vec3(0., 0., 0.);',
	`${clusterlight_frag}
    vec3 indirectIrradiance = vec3(0., 0., 0.);`
);

fragmentShader = fragmentShader.replace(
	'#include <light_frag>',
	`${light_frag}`
);

export { ClusteredLightingPBRMaterial, clusterlight_pars_frag, clusterlight_frag };