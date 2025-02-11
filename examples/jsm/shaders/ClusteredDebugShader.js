const ClusteredDebugShader = {
	name: 'clustered_debug',

	vertexShader: `
		#include <common_vert>
		#include <morphtarget_pars_vert>
		#include <skinning_pars_vert>
		#include <modelPos_pars_vert>
		#include <logdepthbuf_pars_vert>
		void main() {
			#include <begin_vert>
			#include <morphtarget_vert>
			#include <skinning_vert>
			#include <pvm_vert>
			#include <logdepthbuf_vert>
			#include <modelPos_vert>
		}
	`,

	fragmentShader: `
		#include <common_frag>

		#include <modelPos_pars_frag>

		#include <logdepthbuf_pars_frag>
		#include <clippingPlanes_pars_frag>

		#include <light_pars_frag>

		void main() {
			#include <clippingPlanes_frag>
			#include <logdepthbuf_frag>

			gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

			#ifdef USE_CLUSTERED_LIGHTS
				vec4 positionView = u_View * vec4(v_modelPos, 1.0);

				float perspectiveFactor = step(0.0, cellsTransformFactors.z);
				float halfFrustumHeight = -cellsTransformFactors.z * mix(1.0, positionView.z, perspectiveFactor);
				float halfFrustumWidth = halfFrustumHeight * cellsTransformFactors.w;

				vec3 cellCoords;
				cellCoords.z = floor(log(-positionView.z) * cellsTransformFactors.x + cellsTransformFactors.y);
				cellCoords.y = floor((positionView.y / (2.0 * halfFrustumHeight) + 0.5) * cells.y);
				cellCoords.x = floor((positionView.x / (2.0 * halfFrustumWidth) + 0.5) * cells.x);

				if(!(any(lessThan(cellCoords, vec3(0.0))) || any(greaterThanEqual(cellCoords, cells)))) {
					float cellIndex = dot(cellsDotData, cellCoords);
					float clusterV = floor(cellIndex * cellsTextureSize.y);
					float clusterU = cellIndex - (clusterV * cellsTextureSize.x);

					int size = textureSize(lightsTexture, 0).x;

					ClusteredPointLight clusteredPointLight;
					ClusteredSpotLight clusteredSpotLight;

					vec3 clusteredLightColor;
					float clusteredLightDistance;
					float clusteredAngleCos;

					vec3 debugColor = vec3(0.0);

					for (int lightCellIndex = 0; lightCellIndex < maxLightsPerCell; lightCellIndex++) {
						float lightIndex = texelFetch(cellsTexture, ivec2(int(clusterU) + lightCellIndex, clusterV), 0).x;

						if (lightIndex <= 0.0) break;

						debugColor = mix(vec3(0., 0., 1.), vec3(1., 0., 0.), float(lightCellIndex + 1) / float(maxLightsPerCell));
					}

					gl_FragColor = vec4(debugColor, 1.0);
				}
			#endif
		}
	`
};

export { ClusteredDebugShader };