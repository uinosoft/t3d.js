#ifdef ALPHATEST
	if (outColor.a < u_AlphaTest) discard;

	// prevent alpha test edge gradient
	outColor.a = u_Opacity;
#endif