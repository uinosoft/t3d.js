#ifdef USE_AMBIENT_LIGHT
    uniform vec3 u_AmbientLightColor;
#endif

#ifdef USE_SPHERICALHARMONICS_LIGHT
    uniform vec3 u_SphericalHarmonicsLightData[9];
#endif

#ifdef USE_CLEARCOAT
    // Clear coat directional hemishperical reflectance (this approximation should be improved)
    float clearcoatDHRApprox(const in float roughness, const in float dotNL) {
        return 0.04 + (1.0 - 0.16) * (pow(1.0 - dotNL, 5.0) * pow(1.0 - roughness, 2.0));
    }
#endif

#if NUM_HEMI_LIGHTS > 0
    struct HemisphereLight {
        vec3 direction;
        vec3 skyColor;
		vec3 groundColor;
    };
    uniform HemisphereLight u_Hemi[NUM_HEMI_LIGHTS];
#endif

#if NUM_DIR_LIGHTS > 0
    struct DirectLight {
        vec3 direction;
        vec3 color;
    };
    uniform DirectLight u_Directional[NUM_DIR_LIGHTS];
#endif

#if NUM_POINT_LIGHTS > 0
    struct PointLight {
        vec3 position;
        vec3 color;
        float distance;
        float decay;
    };
    uniform PointLight u_Point[NUM_POINT_LIGHTS];
#endif

#if NUM_SPOT_LIGHTS > 0
    struct SpotLight {
        vec3 position;
        vec3 color;
        float distance;
        float decay;
        float coneCos;
        float penumbraCos;
        vec3 direction;
    };
    uniform SpotLight u_Spot[NUM_SPOT_LIGHTS];
#endif

#if defined(USE_PBR) && defined(USE_ENV_MAP)
    vec3 getLightProbeIndirectIrradiance(const in int maxMIPLevel, const in vec3 N) {
        // TODO: replace with properly filtered cubemaps and access the irradiance LOD level, be it the last LOD level
    	// of a specular cubemap, or just the default level of a specially created irradiance cubemap.

        vec3 coordVec = vec3(u_EnvMap_Flip * N.x, N.yz);

    	#ifdef TEXTURE_LOD_EXT
    		vec4 envMapColor = textureCubeLodEXT(envMap, coordVec, float(maxMIPLevel));
    	#else
    		// force the bias high to get the last LOD level as it is the most blurred.
    		vec4 envMapColor = textureCube(envMap, coordVec, float(maxMIPLevel));
    	#endif

        envMapColor = envMapTexelToLinear(envMapColor);

        return PI * envMapColor.rgb * u_EnvMap_Intensity * u_EnvMapLight_Intensity;
    }

    // taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
    float getSpecularMIPLevel(const in float blinnShininessExponent, const in int maxMIPLevel) {
    	//float envMapWidth = pow(2.0, maxMIPLevelScalar);
    	//float desiredMIPLevel = log2(envMapWidth * sqrt(3.0)) - 0.5 * log2(pow2(blinnShininessExponent) + 1.0);

    	float maxMIPLevelScalar = float(maxMIPLevel);
    	float desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2(pow2(blinnShininessExponent) + 1.0);

    	// clamp to allowable LOD ranges.
    	return clamp(desiredMIPLevel, 0.0, maxMIPLevelScalar);
    }

    vec3 getLightProbeIndirectRadiance(const in float blinnShininessExponent, const in int maxMIPLevel, const in vec3 envDir) {
        float specularMIPLevel = getSpecularMIPLevel(blinnShininessExponent, maxMIPLevel);

        vec3 coordVec = vec3(u_EnvMap_Flip * envDir.x, envDir.yz);

        #ifdef TEXTURE_LOD_EXT
    		vec4 envMapColor = textureCubeLodEXT(envMap, coordVec, specularMIPLevel);
    	#else
    		vec4 envMapColor = textureCube(envMap, coordVec, specularMIPLevel);
    	#endif

        envMapColor = envMapTexelToLinear(envMapColor);

        return envMapColor.rgb * u_EnvMap_Intensity;
    }

    // ref: https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
    float computeSpecularOcclusion(const in float dotNV, const in float ambientOcclusion, const in float roughness) {
    	return saturate(pow(dotNV + ambientOcclusion, exp2(-16.0 * roughness - 1.0)) - 1.0 + ambientOcclusion);
    }
#endif

#ifdef USE_SPHERICALHARMONICS_LIGHT
    vec3 shGetIrradianceAt(in vec3 normal, in vec3 shCoefficients[9]) {
        float x = normal.x, y = normal.y, z = normal.z;
        vec3 result = shCoefficients[0] * 0.886227;
        result += shCoefficients[1] * 2.0 * 0.511664 * y;
        result += shCoefficients[2] * 2.0 * 0.511664 * z;
        result += shCoefficients[3] * 2.0 * 0.511664 * x;
        result += shCoefficients[4] * 2.0 * 0.429043 * x * y;
        result += shCoefficients[5] * 2.0 * 0.429043 * y * z;
        result += shCoefficients[6] * (0.743125 * z * z - 0.247708);
        result += shCoefficients[7] * 2.0 * 0.429043 * x * z;
        result += shCoefficients[8] * 0.429043 * (x * x - y * y);
        return result;
    }

    vec3 getLightProbeIrradiance(const in vec3 lightProbe[9], const in vec3 normal) {
        vec3 irradiance = shGetIrradianceAt(normal, lightProbe);
        return irradiance;
    }
#endif