#ifdef USE_ENV_MAP
    vec3 envDir;
    #ifdef USE_VERTEX_ENVDIR
        envDir = v_EnvDir;
    #else
        // Use v_modelPos from modelPos_pars_frag
        // Use N from normal_frag
        envDir = reflect(normalize(v_modelPos - u_CameraPosition), N);
    #endif

    vec4 envColor = textureCube(envMap, vec3(envMapParams.z * envDir.x, envDir.yz));

    envColor = envMapTexelToLinear( envColor );

    #ifdef ENVMAP_BLENDING_MULTIPLY
		outColor = mix(outColor, envColor * outColor, envMapParams.y);
	#elif defined( ENVMAP_BLENDING_MIX )
		outColor = mix(outColor, envColor, envMapParams.y);
	#elif defined( ENVMAP_BLENDING_ADD )
		outColor += envColor * envMapParams.y;
	#endif
#endif