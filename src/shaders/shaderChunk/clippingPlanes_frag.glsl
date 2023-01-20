// Use v_modelPos from modelPos_pars_frag

#if NUM_CLIPPING_PLANES > 0

    vec4 plane;

    #pragma unroll_loop_start
    for (int i = 0; i < NUM_CLIPPING_PLANES; i++) {

        plane = clippingPlanes[i];
        if ( dot( -v_modelPos, plane.xyz ) > plane.w ) discard;

    }
    #pragma unroll_loop_end

#endif