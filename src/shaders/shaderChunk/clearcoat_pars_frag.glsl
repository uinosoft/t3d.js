#ifdef USE_CLEARCOAT
	uniform float u_Clearcoat;
	uniform float u_ClearcoatRoughness;
#endif

#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif

#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif

#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif