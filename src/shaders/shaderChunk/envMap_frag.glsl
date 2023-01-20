#ifdef USE_ENV_MAP
    vec3 envDir;
    #ifdef USE_VERTEX_ENVDIR
        envDir = v_EnvDir;
    #else
        // Use v_modelPos from modelPos_pars_frag
        // Use N from normal_frag
        envDir = reflect(normalize(v_modelPos - u_CameraPosition), N);
    #endif

    vec4 envColor = textureCube(envMap, vec3(u_EnvMap_Flip * envDir.x, envDir.yz));

    envColor = envMapTexelToLinear( envColor );

    #ifdef ENVMAP_BLENDING_MULTIPLY
		outColor = mix(outColor, envColor * outColor, u_EnvMap_Intensity);
	#elif defined( ENVMAP_BLENDING_MIX )
		outColor = mix(outColor, envColor, u_EnvMap_Intensity);
	#elif defined( ENVMAP_BLENDING_ADD )
		outColor += envColor * u_EnvMap_Intensity;
	#endif
#endif