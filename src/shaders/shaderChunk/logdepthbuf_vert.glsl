#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w - logDepthCameraNear;
		vIsPerspective = float( isPerspectiveMatrix( u_Projection ) );
	#else
		if ( isPerspectiveMatrix( u_Projection ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w - logDepthCameraNear + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif
