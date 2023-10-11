#ifdef USE_EMISSIVEMAP
	#if (USE_EMISSIVEMAP == 2)
        vEmissiveMapUV = (emissiveMapUVTransform * vec3(a_Uv2, 1.)).xy;
    #else
        vEmissiveMapUV = (emissiveMapUVTransform * vec3(a_Uv, 1.)).xy;
    #endif
#endif