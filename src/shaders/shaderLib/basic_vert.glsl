#include <common_vert>
#include <uv_pars_vert>
#include <color_pars_vert>
#include <modelPos_pars_vert>

#if defined(USE_ENV_MAP) && !defined(USE_VERTEX_ENVDIR)
    #include <normal_pars_vert>
#endif

#include <envMap_pars_vert>
#include <aoMap_pars_vert>
#include <alphamap_pars_vert>
#include <morphtarget_pars_vert>
#include <skinning_pars_vert>
#include <logdepthbuf_pars_vert>
void main() {
    #include <begin_vert>
    #include <morphtarget_vert>
    #include <skinning_vert>
    #include <pvm_vert>
    #include <logdepthbuf_vert>
    #include <uv_vert>
    #include <color_vert>
    #include <modelPos_vert>

    #ifdef USE_ENV_MAP
        #include <morphnormal_vert>
        #include <skinnormal_vert>

        #ifndef USE_VERTEX_ENVDIR
            #include <normal_vert>
        #endif  
    #endif

    #include <envMap_vert>
    #include <aoMap_vert>
    #include <alphamap_vert>
}