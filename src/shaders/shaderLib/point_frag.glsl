#include <common_frag>
#include <color_pars_frag>
#include <diffuseMap_pars_frag>
#include <fog_pars_frag>
#include <logdepthbuf_pars_frag>
void main() {
    #include <begin_frag>
    #include <color_frag>
    #include <logdepthbuf_frag>
    #ifdef USE_DIFFUSE_MAP
        outColor *= texture2D(diffuseMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
    #endif
    #include <end_frag>
    #include <encodings_frag>
    #include <premultipliedAlpha_frag>
    #include <fog_frag>
}