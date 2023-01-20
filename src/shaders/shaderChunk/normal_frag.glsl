// Use v_modelPos from modelPos_pars_frag

#ifdef FLAT_SHADED
    // Workaround for Adreno/Nexus5 not able able to do dFdx( Vec3 ) ...
    vec3 fdx = vec3( dFdx( v_modelPos.x ), dFdx( v_modelPos.y ), dFdx( v_modelPos.z ) );
    vec3 fdy = vec3( dFdy( v_modelPos.x ), dFdy( v_modelPos.y ), dFdy( v_modelPos.z ) );
    vec3 N = normalize( cross( fdx, fdy ) );
#else
    vec3 N = normalize(v_Normal);
    #ifdef DOUBLE_SIDED
        N = N * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    #endif  
#endif

// non perturbed normal
vec3 geometryNormal = N;

#ifdef USE_NORMAL_MAP
    vec3 mapN = texture2D(normalMap, v_Uv).rgb * 2.0 - 1.0;
    mapN.xy *= normalScale;
    #if defined(USE_TANGENT) && !defined(FLAT_SHADED)
        vec3 tangent = normalize(v_Tangent);
        vec3 bitangent = normalize(v_Bitangent);
        #ifdef DOUBLE_SIDED
            tangent = tangent * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
            bitangent = bitangent * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
        #endif  
        mat3 tspace = mat3(tangent, bitangent, N);
    #else
        mat3 tspace = tsn(N, v_modelPos, v_Uv);
        mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    #endif
    N = normalize(tspace * mapN);
#elif defined(USE_BUMPMAP)
    N = perturbNormalArb(v_modelPos, N, dHdxy_fwd(v_Uv));
#endif