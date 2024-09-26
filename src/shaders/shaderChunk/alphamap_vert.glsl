#ifdef USE_ALPHA_MAP
	vAlphaMapUV = (alphaMapUVTransform * vec3(ALPHAMAP_UV, 1.)).xy;
#endif