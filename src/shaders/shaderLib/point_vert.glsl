#include <common_vert>
#include <color_pars_vert>
#include <logdepthbuf_pars_vert>
uniform float u_PointSize;
uniform float u_PointScale;
void main() {
    #include <begin_vert>
    #include <pvm_vert>
    #include <color_vert>
    vec4 mvPosition = u_View * u_Model * vec4(transformed, 1.0);
    #ifdef USE_SIZEATTENUATION
        gl_PointSize = u_PointSize * ( u_PointScale / - mvPosition.z );
    #else
        gl_PointSize = u_PointSize;
    #endif

    #include <logdepthbuf_vert>
}