// Per-Pixel Tangent Space Normal Mapping
// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html
mat3 tsn(vec3 N, vec3 V, vec2 uv) {
    vec3 q0 = dFdx(V.xyz);
    vec3 q1 = dFdy(V.xyz);
    vec2 st0 = dFdx(uv.xy);
    vec2 st1 = dFdy(uv.xy);

    float scale = sign(st1.y * st0.x - st0.y * st1.x);

    vec3 S = normalize((q0 * st1.y - q1 * st0.y) * scale);
    vec3 T = normalize((-q0 * st1.x + q1 * st0.x) * scale);
    // N has been normalized

    return mat3(S, T, N);
}