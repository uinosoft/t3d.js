#ifdef USE_DIFFUSE_MAP
    vDiffuseMapUV = (uvTransform * vec3(DIFFUSEMAP_UV, 1.)).xy;
#endif