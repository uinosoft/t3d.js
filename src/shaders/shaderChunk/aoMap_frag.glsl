// Use V, roughness from light_frag
// Use N from normal_frag

#ifdef USE_AOMAP
    // reads channel R, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
    float ambientOcclusion = (texture2D(aoMap, vAOMapUV).r - 1.0) * aoMapIntensity + 1.0;
    
    reflectedLight.indirectDiffuse *= ambientOcclusion;

    #if defined(USE_ENV_MAP) && defined(USE_PBR)
        float dotNV = saturate(dot(N, V));
        reflectedLight.indirectSpecular *= computeSpecularOcclusion(dotNV, ambientOcclusion, roughness);
    #endif
#endif