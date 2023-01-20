#ifdef USE_FOG
    float depth = gl_FragCoord.z / gl_FragCoord.w;

    #ifdef USE_EXP2_FOG
        float fogFactor = 1.0 - exp(-u_FogDensity * u_FogDensity * depth * depth);
    #else
        float fogFactor = smoothstep(u_FogNear, u_FogFar, depth);
    #endif

    gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, fogFactor);
#endif