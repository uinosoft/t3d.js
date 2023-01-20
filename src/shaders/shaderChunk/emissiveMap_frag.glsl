#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D(emissiveMap, vEmissiveMapUV);

	emissiveColor.rgb = emissiveMapTexelToLinear( emissiveColor ).rgb;

	totalEmissiveRadiance *= emissiveColor.rgb;

#endif