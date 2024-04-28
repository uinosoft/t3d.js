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

	struct ClusteredPointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	void getPointLightFromTexture(int index, int size, inout ClusteredPointLight pointLight) {
		int j = index * 4;
		int x = j % size;
		int y = j / size;
		vec4 lightData1 = texelFetch(lightsTexture, ivec2(x + 1, y), 0);
		vec4 lightData2 = texelFetch(lightsTexture, ivec2(x + 2, y), 0);
		// vec4 lightData3 = texelFetch(lightsTexture, ivec2(x + 3, y), 0);
		pointLight.color = lightData1.xyz;
		pointLight.decay = lightData1.w;
		pointLight.position = lightData2.xyz;
		pointLight.distance = lightData2.w;
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

		ClusteredPointLight clusteredPointLight;
		vec3 pointV;

		for (int lightCellIndex = 0; lightCellIndex < maxLightsPerCell; lightCellIndex++) {
			float lightIndex = texelFetch(cellsTexture, ivec2(int(clusterU) + lightCellIndex, clusterV), 0).x;

			if (lightIndex <= 0.0) break;

			#ifdef CLUSTER_DEBUG
				reflectedLight.directDiffuse = mix(vec3(0., 0., 1.), vec3(1., 0., 0.), float(lightCellIndex + 1) / float(maxLightsPerCell));
				continue;
			#endif

			getPointLightFromTexture(int(lightIndex - 1.), size, clusteredPointLight);

			pointV = v_modelPos - clusteredPointLight.position;

			L = -pointV;
			falloff = pow(clamp(1. - length(L) / clusteredPointLight.distance, 0.0, 1.0), clusteredPointLight.decay);
			L = normalize(L);

			dotNL = saturate(dot(N, L));
			irradiance = clusteredPointLight.color * falloff * dotNL * PI;

			#ifdef USE_CLEARCOAT
				ccDotNL = saturate(dot(clearcoatNormal, L));
				ccIrradiance = ccDotNL * clusteredPointLight.color * falloff  * PI;
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