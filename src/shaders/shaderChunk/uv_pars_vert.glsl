#if defined(USE_UV) || defined(USE_UV1)
    uniform mat3 uvTransform;
#endif

#ifdef USE_UV1
    attribute vec2 a_Uv;
    varying vec2 v_Uv;
#endif