#include <common_frag>
#include <diffuseMap_pars_frag>

#include <uv_pars_frag>

#include <packing>
#include <normal_pars_frag>

#include <logdepthbuf_pars_frag>

void main() {
    #if defined(USE_DIFFUSE_MAP) && defined(ALPHATEST)
        vec4 texelColor = texture2D( diffuseMap, v_Uv );

        float alpha = texelColor.a * u_Opacity;
        if(alpha < ALPHATEST) discard;
    #endif

    #include <logdepthbuf_frag>

    vec4 packedNormalDepth;
    packedNormalDepth.xyz = normalize(v_Normal) * 0.5 + 0.5;
    packedNormalDepth.w = gl_FragCoord.z;
    gl_FragColor = packedNormalDepth;
}