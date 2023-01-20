#ifdef USE_ENV_MAP
    #ifdef USE_VERTEX_ENVDIR
        varying vec3 v_EnvDir;
    #endif

    uniform samplerCube envMap;
    uniform float u_EnvMap_Flip;
    uniform float u_EnvMap_Intensity;
    uniform float u_EnvMapLight_Intensity;
    uniform int maxMipLevel;
#endif