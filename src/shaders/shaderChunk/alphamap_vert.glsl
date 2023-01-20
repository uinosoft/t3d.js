#ifdef USE_ALPHA_MAP

	#if (USE_ALPHA_MAP == 2)
        vAlphaMapUV = (alphaMapUVTransform * vec3(a_Uv2, 1.)).xy;
    #else
        vAlphaMapUV = (alphaMapUVTransform * vec3(a_Uv, 1.)).xy;
    #endif

#endif