#if defined(USE_NORMAL_MAP) || defined(USE_CLEARCOAT_NORMALMAP)

  #if !defined(USE_TANGENT) || defined(FLAT_SHADED)
        #include <tsn>
    #endif

#endif

#ifdef USE_NORMAL_MAP

    uniform sampler2D normalMap;
    uniform vec2 normalScale;

#endif