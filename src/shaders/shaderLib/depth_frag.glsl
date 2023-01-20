#include <common_frag>
#include <diffuseMap_pars_frag>

#include <modelPos_pars_frag>
#include <uv_pars_frag>

#include <packing>

#include <logdepthbuf_pars_frag>
#include <clippingPlanes_pars_frag>

void main() {
    #include <clippingPlanes_frag>

    #if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)
        vec4 texelColor = texture2D( diffuseMap, v_Uv );

        float alpha = texelColor.a * u_Opacity;
        if(alpha < ALPHATEST) discard;
    #endif

    #include <logdepthbuf_frag>
    
    #ifdef DEPTH_PACKING_RGBA
        gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
    #else
        gl_FragColor = vec4( vec3( 1.0 - gl_FragCoord.z ), u_Opacity );
    #endif
}