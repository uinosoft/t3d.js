#include <common_frag>
uniform float nearDistance;
uniform float farDistance;
#include <modelPos_pars_frag>
#include <packing>
#include <clippingPlanes_pars_frag>
void main() {
    #include <clippingPlanes_frag>
    
    float dist = length( v_modelPos - u_CameraPosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist ); // clamp to [ 0, 1 ]

    gl_FragColor = packDepthToRGBA(dist);
}