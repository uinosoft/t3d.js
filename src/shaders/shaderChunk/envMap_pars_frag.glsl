#ifdef USE_ENV_MAP
    #ifdef USE_VERTEX_ENVDIR
        varying vec3 v_EnvDir;
    #endif

    uniform samplerCube envMap;
    uniform vec3 envMapParams;
    uniform int maxMipLevel;
#endif