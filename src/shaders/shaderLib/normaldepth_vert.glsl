#include <common_vert>

#include <morphtarget_pars_vert>
#include <skinning_pars_vert>
#include <normal_pars_vert>
#include <uv_pars_vert>
#include <logdepthbuf_pars_vert>
void main() {
    #include <uv_vert>
    #include <begin_vert>
    #include <morphtarget_vert>
    #include <morphnormal_vert>
    #include <skinning_vert>
    #include <skinnormal_vert>
    #include <normal_vert>
    #include <pvm_vert>
    #include <logdepthbuf_vert>
}