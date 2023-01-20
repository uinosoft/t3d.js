#define MATCAP

uniform sampler2D matcap;
varying vec3 vViewPosition;

#include <common_frag>
#include <dithering_pars_frag>
#include <uv_pars_frag>
#include <color_pars_frag>
#include <diffuseMap_pars_frag>
#include <alphamap_pars_frag>
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

    #ifdef USE_MATCAP
		vec4 matcapColor = texture2D(matcap, uv);
		matcapColor = matcapTexelToLinear(matcapColor);
	#else
		vec4 matcapColor = vec4(1.0);
	#endif

	outColor.rgb *= matcapColor.rgb;

    #include <end_frag>
    #include <encodings_frag>
    #include <premultipliedAlpha_frag>
    #include <fog_frag>
    #include <dithering_frag>
}