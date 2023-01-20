#ifdef USE_NORMAL_MAP

    #if !defined(USE_TANGENT) || defined(FLAT_SHADED)
        #include <tsn>
    #endif

    uniform sampler2D normalMap;
    uniform vec2 normalScale;

#endif