#ifdef USE_DIFFUSE_MAP
    outColor *= mapTexelToLinear(texture2D(diffuseMap, vDiffuseMapUV));
#endif