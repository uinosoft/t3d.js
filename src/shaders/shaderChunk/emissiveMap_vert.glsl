#ifdef USE_EMISSIVEMAP
	vEmissiveMapUV = (emissiveMapUVTransform * vec3(EMISSIVEMAP_UV, 1.)).xy;
#endif