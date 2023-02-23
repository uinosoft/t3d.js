#ifdef USE_SHADOW
	#if NUM_DIR_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[NUM_DIR_SHADOWS];
		varying vec4 vDirectionalShadowCoord[NUM_DIR_SHADOWS];

		struct DirectLightShadow {
			vec2 shadowBias;
			vec2 shadowMapSize;
			vec2 shadowParams;
		};
		uniform DirectLightShadow u_DirectionalShadow[NUM_DIR_SHADOWS];
	#endif

	#if NUM_POINT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[NUM_POINT_SHADOWS];
		varying vec4 vPointShadowCoord[NUM_POINT_SHADOWS];

		struct PointLightShadow {
			vec2 shadowBias;
			vec2 shadowMapSize;
			vec2 shadowParams;
			vec2 shadowCameraRange;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow u_PointShadow[NUM_POINT_SHADOWS];
	#endif

	#if NUM_SPOT_SHADOWS > 0
		uniform mat4 spotShadowMatrix[NUM_SPOT_SHADOWS];
		varying vec4 vSpotShadowCoord[NUM_SPOT_SHADOWS];

		struct SpotLightShadow {
			vec2 shadowBias;
			vec2 shadowMapSize;
			vec2 shadowParams;
		};
		uniform SpotLightShadow u_SpotShadow[NUM_SPOT_SHADOWS];
	#endif
#endif