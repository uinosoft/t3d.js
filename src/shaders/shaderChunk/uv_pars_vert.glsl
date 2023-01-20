#if defined(USE_UV1) || defined(USE_UV2)
    uniform mat3 uvTransform;
#endif

#ifdef USE_UV1
    attribute vec2 a_Uv;
    varying vec2 v_Uv;
#endif

#ifdef USE_UV2
    attribute vec2 a_Uv2;
    varying vec2 v_Uv2;
#endif