// Use v_modelPos from modelPos_pars_frag
// Use geometryNormal, N from normal_frag

#if (defined(USE_PHONG) || defined(USE_PBR))
    vec3 V = normalize(u_CameraPosition - v_modelPos);
#endif

#ifdef USE_PBR
    #ifdef USE_PBR2
        vec3 diffuseColor = outColor.xyz;
        vec3 specularColor = specularFactor.xyz;
        float roughness = max(1.0 - glossinessFactor, 0.0525);
    #else
        vec3 diffuseColor = outColor.xyz * (1.0 - metalnessFactor);
        vec3 specularColor = mix(vec3(0.04), outColor.xyz, metalnessFactor);
        float roughness = max(roughnessFactor, 0.0525);
    #endif

    vec3 dxy = max(abs(dFdx(geometryNormal)), abs(dFdy(geometryNormal)));
    float geometryRoughness = max(max(dxy.x, dxy.y), dxy.z);
    roughness += geometryRoughness;

    roughness = min(roughness, 1.0);

    #ifdef USE_CLEARCOAT
        float clearcoat = u_Clearcoat;
        float clearcoatRoughness = u_ClearcoatRoughness;
        #ifdef USE_CLEARCOATMAP
		    clearcoat *= texture2D(clearcoatMap, v_Uv).x;
        #endif
        #ifdef USE_CLEARCOAT_ROUGHNESSMAP
		    clearcoatRoughness *= texture2D(clearcoatRoughnessMap, v_Uv).y;
	    #endif
        clearcoat = saturate(clearcoat);
        clearcoatRoughness = max(clearcoatRoughness, 0.0525);
	    clearcoatRoughness += geometryRoughness;
	    clearcoatRoughness = min(clearcoatRoughness, 1.0);
    #endif
#else
    vec3 diffuseColor = outColor.xyz;
    #ifdef USE_PHONG
        vec3 specularColor = u_SpecularColor.xyz;
        float shininess = u_Specular;
    #endif
#endif

vec3 L;
float falloff;
float dotNL;
vec3 irradiance;

float clearcoatDHR;

#ifdef USE_CLEARCOAT
    float ccDotNL;
    vec3 ccIrradiance;
#endif

#if NUM_DIR_LIGHTS > 0

    #pragma unroll_loop_start
    for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
        L = normalize(-u_Directional[i].direction);
        falloff = 1.0;

        #if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_DIR_SHADOWS)
            #ifdef USE_PCSS_SOFT_SHADOW
                falloff *= getShadowWithPCSS(directionalDepthMap[i], directionalShadowMap[i], vDirectionalShadowCoord[i], u_DirectionalShadow[i].shadowMapSize, u_DirectionalShadow[i].shadowBias, u_DirectionalShadow[i].shadowParams);
            #else
                falloff *= getShadow(directionalShadowMap[i], vDirectionalShadowCoord[i], u_DirectionalShadow[i].shadowMapSize, u_DirectionalShadow[i].shadowBias, u_DirectionalShadow[i].shadowParams);
            #endif
        #endif

        dotNL = saturate(dot(N, L));
        irradiance = u_Directional[i].color * falloff * dotNL * PI;

        #ifdef USE_CLEARCOAT        
            ccDotNL = saturate(dot(clearcoatNormal, L));
            ccIrradiance = ccDotNL * u_Directional[i].color * falloff  * PI;
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
    #pragma unroll_loop_end
#endif

#if NUM_POINT_LIGHTS > 0
    vec3 worldV;

    #pragma unroll_loop_start
    for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
        worldV = v_modelPos - u_Point[i].position;

        L = -worldV;
        falloff = pow(clamp(1. - length(L) / u_Point[i].distance, 0.0, 1.0), u_Point[i].decay);
        L = normalize(L);

        #if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_POINT_SHADOWS)
            falloff *= getPointShadow(pointShadowMap[i], vPointShadowCoord[i], u_PointShadow[i].shadowMapSize, u_PointShadow[i].shadowBias, u_PointShadow[i].shadowParams, u_PointShadow[i].shadowCameraRange);
        #endif

        dotNL = saturate(dot(N, L));
        irradiance = u_Point[i].color * falloff * dotNL * PI;

        #ifdef USE_CLEARCOAT        
            ccDotNL = saturate(dot(clearcoatNormal, L));
            ccIrradiance = ccDotNL *  u_Point[i].color * falloff  * PI;
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
    #pragma unroll_loop_end
#endif

#if NUM_SPOT_LIGHTS > 0
    float lightDistance;
    float angleCos;

    #pragma unroll_loop_start
    for (int i = 0; i < NUM_SPOT_LIGHTS; i++) {
        L = u_Spot[i].position - v_modelPos;
        lightDistance = length(L);
        L = normalize(L);
        angleCos = dot(L, -normalize(u_Spot[i].direction));

        falloff = smoothstep(u_Spot[i].coneCos, u_Spot[i].penumbraCos, angleCos);
        falloff *= pow(clamp(1. - lightDistance / u_Spot[i].distance, 0.0, 1.0), u_Spot[i].decay);

        #if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_SPOT_SHADOWS)
            #ifdef USE_PCSS_SOFT_SHADOW
                falloff *= getShadowWithPCSS(spotDepthMap[i], spotShadowMap[i], vSpotShadowCoord[i], u_SpotShadow[i].shadowMapSize, u_SpotShadow[i].shadowBias, u_SpotShadow[i].shadowParams);
            #else
                falloff *= getShadow(spotShadowMap[i], vSpotShadowCoord[i], u_SpotShadow[i].shadowMapSize, u_SpotShadow[i].shadowBias, u_SpotShadow[i].shadowParams);
            #endif
        #endif

        dotNL = saturate(dot(N, L));
        irradiance = u_Spot[i].color * falloff * dotNL * PI;

        #ifdef USE_CLEARCOAT        
            ccDotNL = saturate(dot(clearcoatNormal, L));
            ccIrradiance = ccDotNL *  u_Spot[i].color * falloff  * PI;
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
    #pragma unroll_loop_end
#endif

#if NUM_RECT_AREA_LIGHTS > 0
    vec3 RectAreaLightDirectSpecular;
    vec3 RectAreaLightDirectDiffuse;
    vec3 rectCoords[4];

    #pragma unroll_loop_start
    for (int i = 0; i < NUM_RECT_AREA_LIGHTS; i++) {
        LTC_RectCoords(u_RectArea[i].position, u_RectArea[i].halfWidth, u_RectArea[i].halfHeight, rectCoords);

        reflectedLight.directDiffuse += u_RectArea[i].color * LTC_Diffuse(diffuseColor, N, V, v_modelPos, rectCoords);

        #ifdef USE_PBR
            reflectedLight.directSpecular += u_RectArea[i].color * LTC_Specular(specularColor, N, V, v_modelPos, rectCoords, roughness);
        #endif
    }
    #pragma unroll_loop_end
#endif

vec3 indirectIrradiance = vec3(0., 0., 0.);   

#ifdef USE_AMBIENT_LIGHT
    indirectIrradiance += u_AmbientLightColor * PI;
#endif

#ifdef USE_SPHERICALHARMONICS_LIGHT
    indirectIrradiance += getLightProbeIrradiance(u_SphericalHarmonicsLightData, N);
#endif

#if NUM_HEMI_LIGHTS > 0
    float hemiDiffuseWeight;

    #pragma unroll_loop_start
    for (int i = 0; i < NUM_HEMI_LIGHTS; i++) {
        L = normalize(u_Hemi[i].direction);

        dotNL = dot(N, L);
        hemiDiffuseWeight = 0.5 * dotNL + 0.5;

        indirectIrradiance += mix(u_Hemi[i].groundColor, u_Hemi[i].skyColor, hemiDiffuseWeight) * PI;
    }
    #pragma unroll_loop_end
#endif

reflectedLight.indirectDiffuse += indirectIrradiance * BRDF_Diffuse_Lambert(diffuseColor);

// TODO light map

#if defined(USE_ENV_MAP) && defined(USE_PBR)
    vec3 iblIrradiance = vec3(0., 0., 0.);
    vec3 indirectRadiance = vec3(0., 0., 0.);
    vec3 clearcoatRadiance = vec3(0., 0., 0.);

    vec3 envDir;
    #ifdef USE_VERTEX_ENVDIR
        envDir = v_EnvDir;
    #else
        envDir = reflect(normalize(v_modelPos - u_CameraPosition), N);
    #endif
    iblIrradiance += getLightProbeIndirectIrradiance(maxMipLevel, N);
    indirectRadiance += getLightProbeIndirectRadiance(roughness, maxMipLevel, N, envDir);

    #ifdef USE_CLEARCOAT
        vec3 clearcoatDir = reflect(normalize(v_modelPos - u_CameraPosition), clearcoatNormal);
        clearcoatRadiance += getLightProbeIndirectRadiance(clearcoatRoughness, maxMipLevel, clearcoatNormal, clearcoatDir);
    #endif

    // reflectedLight.indirectSpecular += indirectRadiance * BRDF_Specular_GGX_Environment(N, V, specularColor, roughness);

    #ifdef USE_CLEARCOAT
        float ccDotNV = saturate(dot(clearcoatNormal, V));
        reflectedLight.indirectSpecular += clearcoatRadiance * clearcoat * BRDF_Specular_GGX_Environment(clearcoatNormal, V, specularColor, clearcoatRoughness);
        ccDotNL = ccDotNV;
        clearcoatDHR = clearcoat * clearcoatDHRApprox(clearcoatRoughness, ccDotNL);
    #else
        clearcoatDHR = 0.0;
    #endif

    float clearcoatInv = 1.0 - clearcoatDHR;

    // Both indirect specular and indirect diffuse light accumulate here

    vec3 singleScattering = vec3(0.0);
    vec3 multiScattering = vec3(0.0);

    vec3 cosineWeightedIrradiance = iblIrradiance * RECIPROCAL_PI;

    BRDF_Specular_Multiscattering_Environment(N, V, specularColor, roughness, singleScattering, multiScattering);

    vec3 diffuse = diffuseColor * (1.0 - (singleScattering + multiScattering));

    reflectedLight.indirectSpecular += clearcoatInv * indirectRadiance * singleScattering;
    reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;

    reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
#endif