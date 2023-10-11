#ifdef USE_AOMAP
	#if (USE_AOMAP == 2)
        vAOMapUV = (aoMapUVTransform * vec3(a_Uv2, 1.)).xy;
    #else
        vAOMapUV = (aoMapUVTransform * vec3(a_Uv, 1.)).xy;
    #endif
#endif