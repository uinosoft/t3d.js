const MatcapShader = {
	name: 'matcap',

	defines: {
		MATCAP_SRGB: false
	},

	uniforms: {
		mapcap: null
	},

	vertexShader: `
		varying vec3 vViewPosition;

		#include <common_vert>
		#include <normal_pars_vert>
		#include <uv_pars_vert>
		#include <color_pars_vert>
		#include <diffuseMap_pars_vert>
		#include <alphamap_pars_vert>
		#include <modelPos_pars_vert>
		#include <morphtarget_pars_vert>
		#include <skinning_pars_vert>
		#include <logdepthbuf_pars_vert>
		void main() {
			#include <begin_vert>
			#include <morphtarget_vert>
			#include <morphnormal_vert>
			#include <skinning_vert>
			#include <skinnormal_vert>
			#include <pvm_vert>
			#include <normal_vert>
			#include <logdepthbuf_vert>
			#include <uv_vert>
			#include <color_vert>
			#include <diffuseMap_vert>
			#include <alphamap_vert>
			#include <modelPos_vert>

			vec4 mvPosition = u_View * worldPosition;
			vViewPosition = - mvPosition.xyz;
		}
	`,

	fragmentShader: `
		uniform sampler2D matcap;
		varying vec3 vViewPosition;

		#include <common_frag>
		#include <dithering_pars_frag>
		#include <uv_pars_frag>
		#include <color_pars_frag>
		#include <diffuseMap_pars_frag>
		#include <alphamap_pars_frag>
		#include <alphaTest_pars_frag>
		#include <normalMap_pars_frag>
		#include <modelPos_pars_frag>
		#include <bumpMap_pars_frag>
		#include <normal_pars_frag>
		#include <fog_pars_frag>
		#include <logdepthbuf_pars_frag>
		#include <clippingPlanes_pars_frag>
		void main() {
			#include <clippingPlanes_frag>
			#include <logdepthbuf_frag>
			#include <begin_frag>
			#include <color_frag>
			#include <diffuseMap_frag>
			#include <alphamap_frag>
			#include <alphaTest_frag>
			#include <normal_frag>

			vec3 viewDir = normalize(vViewPosition);
			vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
			vec3 y = cross(viewDir, x);
			vec3 viewN = (u_View * vec4(N, 0.0)).xyz;
			vec2 uv = vec2(dot(x, viewN), dot(y, viewN)) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

			vec4 matcapColor = texture2D(matcap, uv);
			#ifdef MATCAP_SRGB
				matcapColor = sRGBToLinear(matcapColor);
			#endif
			outColor.rgb *= matcapColor.rgb;

			#include <end_frag>
			#include <encodings_frag>
			#include <premultipliedAlpha_frag>
			#include <fog_frag>
			#include <dithering_frag>
		}
	`
};

export { MatcapShader };