#define USE_PBR

#include <common_vert>
#include <normal_pars_vert>
#include <uv_pars_vert>
#include <color_pars_vert>
#include <modelPos_pars_vert>
#include <envMap_pars_vert>
#include <aoMap_pars_vert>
#include <alphamap_pars_vert>
#include <emissiveMap_pars_vert>
#include <shadowMap_pars_vert>
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
    #include <modelPos_vert>
    #include <envMap_vert>
    #include <aoMap_vert>
    #include <alphamap_vert>
    #include <emissiveMap_vert>
    #include <shadowMap_vert>
}