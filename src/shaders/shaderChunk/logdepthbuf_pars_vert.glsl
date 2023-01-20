#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		uniform float logDepthCameraNear;
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
		uniform float logDepthCameraNear;
	#endif
#endif
