#ifdef USE_ALPHA_MAP

	outColor.a *= texture2D(alphaMap, vAlphaMapUV).g;

#endif