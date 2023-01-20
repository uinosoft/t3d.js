// Use worldPosition from pvm_vert

#ifdef USE_SHADOW
	#if NUM_DIR_SHADOWS > 0 || NUM_POINT_SHADOWS > 0 || NUM_SPOT_SHADOWS > 0
		vec3 shadowWorldNormal = (transposeMat4(inverseMat4(u_Model)) * vec4(objectNormal, 0.0)).xyz;
		shadowWorldNormal = normalize(shadowWorldNormal);
		vec4 shadowWorldPosition;
	#endif

	#if NUM_DIR_SHADOWS > 0
		#pragma unroll_loop_start
		for (int i = 0; i < NUM_DIR_SHADOWS; i++) {
			shadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_DirectionalShadow[i].shadowBias[1], 0);
			vDirectionalShadowCoord[i] = directionalShadowMatrix[i] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif

	#if NUM_POINT_SHADOWS > 0
		#pragma unroll_loop_start
		for (int i = 0; i < NUM_POINT_SHADOWS; i++) {
			shadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_PointShadow[i].shadowBias[1], 0);
			vPointShadowCoord[i] = pointShadowMatrix[i] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif

	#if NUM_SPOT_SHADOWS > 0
		#pragma unroll_loop_start
		for (int i = 0; i < NUM_SPOT_SHADOWS; i++) {
			shadowWorldPosition = worldPosition + vec4(shadowWorldNormal * u_SpotShadow[i].shadowBias[1], 0);
			vSpotShadowCoord[i] = spotShadowMatrix[i] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif