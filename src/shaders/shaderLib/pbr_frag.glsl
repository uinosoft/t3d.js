#define USE_PBR

#include <common_frag>
#include <dithering_pars_frag>

// if no light> this will not active
uniform float u_Metalness;
#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif

uniform float u_Roughness;
#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif

uniform vec3 emissive;

#include <uv_pars_frag>
#include <color_pars_frag>
#include <diffuseMap_pars_frag>
#include <alphamap_pars_frag>
#include <normalMap_pars_frag>
#include <bumpMap_pars_frag>
#include <envMap_pars_frag>
#include <aoMap_pars_frag>
#include <light_pars_frag>
#include <normal_pars_frag>
#include <clearcoat_pars_frag>
#include <modelPos_pars_frag>
#include <bsdfs>
#include <shadowMap_pars_frag>
#include <fog_pars_frag>
#include <emissiveMap_pars_frag>
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

    float roughnessFactor = u_Roughness;
    #ifdef USE_ROUGHNESSMAP
    	vec4 texelRoughness = texture2D( roughnessMap, v_Uv );
    	// reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
    	roughnessFactor *= texelRoughness.g;
    #endif

    float metalnessFactor = u_Metalness;
    #ifdef USE_METALNESSMAP
    	vec4 texelMetalness = texture2D( metalnessMap, v_Uv );
    	// reads channel B, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
    	metalnessFactor *= texelMetalness.b;
    #endif

    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    #include <light_frag>
    #include <aoMap_frag>
    outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;

    #include <shadowMap_frag>

    vec3 totalEmissiveRadiance = emissive;
    #include <emissiveMap_frag>
    outColor.xyz += totalEmissiveRadiance;

    #include <end_frag>
    #include <encodings_frag>
    #include <premultipliedAlpha_frag>
    #include <fog_frag>
    #include <dithering_frag>
}