#define MATCAP

varying vec3 vViewPosition;

#include <common_vert>
#include <normal_pars_vert>
#include <uv_pars_vert>
#include <color_pars_vert>
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
    #include <alphamap_vert>
    #include <modelPos_vert>

    vec4 mvPosition = u_View * worldPosition;
    vViewPosition = - mvPosition.xyz;
}