// Use worldPosition from pvm_vert

#ifdef USE_ENV_MAP
    #ifdef USE_VERTEX_ENVDIR
        vec3 transformedNormal = (transposeMat4(inverseMat4(u_Model)) * vec4(objectNormal, 0.0)).xyz;
        transformedNormal = normalize(transformedNormal);
        v_EnvDir = reflect(normalize(worldPosition.xyz - u_CameraPosition), transformedNormal);
    #endif
#endif