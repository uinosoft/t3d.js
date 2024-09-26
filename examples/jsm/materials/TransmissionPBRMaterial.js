import { ShaderLib, PBRMaterial, MATERIAL_TYPE } from 't3d';

export class TransmissionPBRMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'TransmissionPBR';

		this.vertexShader = ShaderLib.pbr_vert;
		this.fragmentShader = fragmentShader;

		// KHR_materials_transmission
		this.uniforms.transmission = 0;
		this.uniforms.transmissionMap = null;
		this.uniforms.transmissionSamplerMap = null;
		this.uniforms.transmissionSamplerSize = [512, 512];
		this.defines.USE_TRANSMISSIONMAP = false;

		// KHR_materials_volume
		this.uniforms.thickness = 0;
		this.uniforms.thicknessMap = null;
		this.uniforms.attenuationColor = [1, 1, 1];
		this.uniforms.attenuationDistance = Infinity;
		this.defines.USE_THICKNESSMAP = false;

		// KHR_materials_ior
		this.uniforms.ior = 1.5;
	}

}

let fragmentShader = ShaderLib.pbr_frag;

fragmentShader = fragmentShader.replace(
	'#include <clippingPlanes_pars_frag>',
	`
    #include <clippingPlanes_pars_frag>

    // Transmission code is based on glTF-Sampler-Viewer
    // https://github.com/KhronosGroup/glTF-Sample-Viewer

    uniform mat4 u_Model;
    uniform mat4 u_Projection;

    uniform float transmission;
    #ifdef USE_TRANSMISSIONMAP
        uniform sampler2D transmissionMap;
    #endif
    uniform vec2 transmissionSamplerSize;
    uniform sampler2D transmissionSamplerMap;

    uniform float thickness;
    #ifdef USE_THICKNESSMAP
        uniform sampler2D thicknessMap;
    #endif
    uniform float attenuationDistance;
    uniform vec3 attenuationColor;

    uniform float ior;

    struct ExtendMaterial {
        float specularF90;
        vec3  specularColor;
        float ior;
        float transmission;
        float transmissionAlpha;
        float thickness;
        float attenuationDistance;
        vec3 attenuationColor;
    };
    ExtendMaterial material;
    
    vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {
        return normalize((vec4(dir, 0.0) * matrix).xyz);
    }

    // Mipped Bicubic Texture Filtering by N8
    // https://www.shadertoy.com/view/Dl2SDW

    float w0( float a ) {
        return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
    }

    float w1( float a ) {
        return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
    }

    float w2( float a ){
        return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
    }

    float w3( float a ) {
        return ( 1.0 / 6.0 ) * ( a * a * a );
    }

    // g0 and g1 are the two amplitude functions
    float g0( float a ) {
        return w0( a ) + w1( a );
    }

    float g1( float a ) {
        return w2( a ) + w3( a );
    }

    // h0 and h1 are the two offset functions
    float h0( float a ) {
        return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
    }

    float h1( float a ) {
        return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
    }

    vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
        uv = uv * texelSize.zw + 0.5;

        vec2 iuv = floor( uv );
        vec2 fuv = fract( uv );

        float g0x = g0( fuv.x );
        float g1x = g1( fuv.x );
        float h0x = h0( fuv.x );
        float h1x = h1( fuv.x );
        float h0y = h0( fuv.y );
        float h1y = h1( fuv.y );

        vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
        vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
        vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
        vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;

        return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
            g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
    }

    vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
        vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
        vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
        vec2 fLodSizeInv = 1.0 / fLodSize;
        vec2 cLodSizeInv = 1.0 / cLodSize;
        vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
        vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
        return mix( fSample, cSample, fract( lod ) );
    }

    vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
        // Direction of refracted light.
        vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );

        // Compute rotation-independant scaling of the model matrix.
        vec3 modelScale;
        modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
        modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
        modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );

        // The thickness is specified in local space.
        return normalize( refractionVector ) * thickness * modelScale;
    }

    float applyIorToRoughness( const in float roughness, const in float ior ) {
        // Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
        // an IOR of 1.5 results in the default amount of microfacet refraction.
        return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
    }

    vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
        float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
        return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
    }

    vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
        if ( isinf( attenuationDistance ) ) {
            // Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
            return vec3( 1.0 );
        } else {
            // Compute light attenuation using Beer's law.
            vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
            vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); // Beer's law
            return transmittance;
        }
    }

    vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
        float dotNV = saturate( dot( normal, viewDir ) );
        const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
        const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
        vec4 r = roughness * c0 + c1;
        float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
        vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
        return fab;
    }

    vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
        vec2 fab = DFGApprox( normal, viewDir, roughness );
        return specularColor * fab.x + specularF90 * fab.y;
    }
    
    vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
        const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
        const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
        const in vec3 attenuationColor, const in float attenuationDistance ) {

        vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
        vec3 refractedRayExit = position + transmissionRay;

        // Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
        vec4 ndcPos = projMatrix  * viewMatrix *vec4( refractedRayExit, 1.0 );
        vec2 refractionCoords = ndcPos.xy / ndcPos.w;
        refractionCoords += 1.0;
        refractionCoords /= 2.0;

        // Sample framebuffer to get pixel the refracted ray hits.
        vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );

        vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
        vec3 attenuatedColor = transmittance * transmittedLight.rgb;

        // Get the specular component.
        vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );

        // As less light is transmitted, the opacity should be increased. This simple approximation does a decent job 
        // of modulating a CSS background, and has no effect when the buffer is opaque, due to a solid object or clear color.
        float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
        return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
    }
    `
);

fragmentShader = fragmentShader.replace(
	'#include <aoMap_frag>',
	`
    vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
    vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
    #include <aoMap_frag>

    material.ior = ior;
    float specularIntensityFactor = 1.0;
    vec3 specularColorFactor = vec3( 1.0 );
    material.specularF90 = 1.0;
    material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, u_Color.rgb, metalnessFactor );

    material.transmission = transmission;
    material.transmissionAlpha = 1.0;
    material.thickness = thickness;
    material.attenuationDistance = attenuationDistance;
    material.attenuationColor = attenuationColor;

    #ifdef USE_TRANSMISSIONMAP
        material.transmission *= texture2D( transmissionMap, v_Uv ).r;
    #endif

    #ifdef USE_THICKNESSMAP
        material.thickness *= texture2D( thicknessMap, v_Uv ).g;
    #endif

    vec3 pos = v_modelPos;
    vec3 v = normalize( u_CameraPosition - pos );
    vec3 n = N;

    vec4 transmitted = getIBLVolumeRefraction(
        n, v,roughness, u_Color, specularColor, material.specularF90,
        pos, u_Model, u_View, u_Projection, material.ior, material.thickness,
        material.attenuationColor, material.attenuationDistance );

    material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
    totalDiffuse  = mix(  totalDiffuse ,transmitted.rgb, material.transmission );
    `
);

fragmentShader = fragmentShader.replace(
	'outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;',
	`
    outColor.xyz = totalDiffuse + totalSpecular;
    outColor.a = outColor.a * material.transmissionAlpha;
    `
);