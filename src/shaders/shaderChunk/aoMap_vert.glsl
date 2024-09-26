#ifdef USE_AOMAP
	vAOMapUV = (aoMapUVTransform * vec3(AOMAP_UV, 1.)).xy;
#endif