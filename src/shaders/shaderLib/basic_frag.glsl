#include <common_frag>
#include <uv_pars_frag>
#include <color_pars_frag>
#include <diffuseMap_pars_frag>
#include <alphamap_pars_frag>
#include <modelPos_pars_frag>

#if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)
    #include <normalMap_pars_frag>
    #include <normal_pars_frag>    
#endif

#include <envMap_pars_frag>
#include <aoMap_pars_frag>
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

    ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
    reflectedLight.indirectDiffuse += vec3(1.0);
    #include <aoMap_frag>
    reflectedLight.indirectDiffuse *= outColor.xyz;
    outColor.xyz = reflectedLight.indirectDiffuse;

    #if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)
        #include <normal_frag>
    #endif

    #include <envMap_frag>
    #include <end_frag>
    #include <encodings_frag>
    #include <premultipliedAlpha_frag>
    #include <fog_frag>
}