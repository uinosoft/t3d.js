const ShadowShader = {
	name: 'shadow_shader',

	defines: {},

	uniforms: {},

	vertexShader: `
		#include <common_vert>
		#include <modelPos_pars_vert>
		#include <shadowMap_pars_vert>
		#include <morphtarget_pars_vert>
		#include <skinning_pars_vert>
		void main() {
			#include <begin_vert>
			#include <morphtarget_vert>
			#include <skinning_vert>
			#include <pvm_vert>
			#include <modelPos_vert>
			#include <shadowMap_vert>
		}
	`,

	fragmentShader: `
		#include <common_frag>
		#include <modelPos_pars_frag>
		#include <light_pars_frag>
		#include <shadowMap_pars_frag>
		#include <fog_pars_frag>

		float getShadowMask() {
			float shadow = 1.0;

			#if NUM_DIR_LIGHTS > 0
				#pragma unroll_loop_start
				for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
					#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_DIR_SHADOWS)
						#ifdef USE_PCSS_SOFT_SHADOW
							shadow *= getShadowWithPCSS(directionalDepthMap[i], directionalShadowMap[i], vDirectionalShadowCoord[i], u_DirectionalShadow[i].shadowMapSize, u_DirectionalShadow[i].shadowBias, u_DirectionalShadow[i].shadowParams);
						#else
							shadow *= getShadow(directionalShadowMap[i], vDirectionalShadowCoord[i], u_DirectionalShadow[i].shadowMapSize, u_DirectionalShadow[i].shadowBias, u_DirectionalShadow[i].shadowParams);
						#endif
					#endif
				}
				#pragma unroll_loop_end
			#endif

			#if NUM_POINT_LIGHTS > 0
				#pragma unroll_loop_start
				for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
					#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_POINT_SHADOWS)
						shadow *= getPointShadow(pointShadowMap[i], vPointShadowCoord[i], u_PointShadow[i].shadowMapSize, u_PointShadow[i].shadowBias, u_PointShadow[i].shadowParams, u_PointShadow[i].shadowCameraRange);
					#endif
				}
				#pragma unroll_loop_end
			#endif

			#if NUM_SPOT_LIGHTS > 0
				float lightDistance;
				float angleCos;

				#pragma unroll_loop_start
				for (int i = 0; i < NUM_SPOT_LIGHTS; i++) {
					vec3 L = u_Spot[i].position - v_modelPos;
					lightDistance = length(L);
					L = normalize(L);
					angleCos = dot(L, -normalize(u_Spot[i].direction));
					if(all(bvec2(angleCos > u_Spot[i].coneCos, lightDistance < u_Spot[i].distance))) {
						#if defined(USE_SHADOW) && (UNROLLED_LOOP_INDEX < NUM_SPOT_SHADOWS)
							#ifdef USE_PCSS_SOFT_SHADOW
								shadow *= getShadowWithPCSS(spotDepthMap[i], spotShadowMap[i], vSpotShadowCoord[i], u_SpotShadow[i].shadowMapSize, u_SpotShadow[i].shadowBias, u_SpotShadow[i].shadowParams);
							#else
								shadow *= getShadow(spotShadowMap[i], vSpotShadowCoord[i], u_SpotShadow[i].shadowMapSize, u_SpotShadow[i].shadowBias, u_SpotShadow[i].shadowParams);
							#endif
						#endif
					}
				}
				#pragma unroll_loop_end
			#endif

			return shadow;
		}

		void main() {
			gl_FragColor = vec4(u_Color, u_Opacity * (1.0 - getShadowMask()));
			#include <fog_frag>
		}
	`
};

export { ShadowShader };