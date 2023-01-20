#ifdef USE_UV1
    v_Uv = (uvTransform * vec3(a_Uv, 1.)).xy;
#endif

#ifdef USE_UV2
    v_Uv2 = (uvTransform * vec3(a_Uv2, 1.)).xy;
#endif