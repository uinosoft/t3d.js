#ifdef USE_CLEARCOAT_NORMALMAP

	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, v_Uv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;

	#if defined(USE_TANGENT) && !defined(FLAT_SHADED)

		clearcoatNormal = normalize( tspace * clearcoatMapN );

	#else

		mat3 tBcN = tsn(clearcoatNormal, v_modelPos, v_Uv);
		clearcoatMapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );
		clearcoatNormal = normalize( tBcN * clearcoatMapN );

	#endif

#endif