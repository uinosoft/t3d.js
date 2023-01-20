#define USE_PBR
#define USE_PBR2

#include <common_frag>
#include <dithering_pars_frag>

// if no light> this will not active
uniform vec3 u_SpecularColor;
#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif

uniform float glossiness;
#ifdef USE_GLOSSINESSMAP
	uniform sampler2D glossinessMap;
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

    vec3 specularFactor = u_SpecularColor;
    #ifdef USE_SPECULARMAP
        vec4 texelSpecular = texture2D(specularMap, v_Uv);
        texelSpecular = sRGBToLinear(texelSpecular);
        // reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture
        specularFactor *= texelSpecular.rgb;
    #endif

    float glossinessFactor = glossiness;
    #ifdef USE_GLOSSINESSMAP
        vec4 texelGlossiness = texture2D(glossinessMap, v_Uv);
        // reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture
        glossinessFactor *= texelGlossiness.a;
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