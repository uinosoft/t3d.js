#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = emissiveMapTexelToLinear(texture2D(emissiveMap, vEmissiveMapUV));
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif