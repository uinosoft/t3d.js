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

#if NUM_RECT_AREA_LIGHTS > 0
    struct RectAreaLight {
        vec3 position;
        vec3 color;
		vec3 halfWidth;
		vec3 halfHeight;
    };
    uniform RectAreaLight u_RectArea[NUM_RECT_AREA_LIGHTS];

    // Pre-computed values of LinearTransformedCosine approximation of BRDF
	// BRDF approximation Texture is 64x64
	uniform sampler2D ltc_1; // RGBA Float
	uniform sampler2D ltc_2; // RGBA Float

    void LTC_RectCoords(const in vec3 lightPos, const in vec3 halfWidth, const in vec3 halfHeight, inout vec3 rectCoords[4]) {
        rectCoords[0] = lightPos + halfWidth - halfHeight; // counterclockwise; light shines in local neg z direction
        rectCoords[1] = lightPos - halfWidth - halfHeight;
        rectCoords[2] = lightPos - halfWidth + halfHeight;
        rectCoords[3] = lightPos + halfWidth + halfHeight;
    }

    vec2 LTC_Uv(const in vec3 N, const in vec3 V, const in float roughness) {
        const float LUT_SIZE = 64.0; 
        const float LUT_SCALE = (LUT_SIZE - 1.0) / LUT_SIZE;
        const float LUT_BIAS = 0.5 / LUT_SIZE;

        float dotNV = saturate(dot(N, V));

        // texture parameterized by sqrt( GGX alpha ) and sqrt( 1 - cos( theta ) )
        vec2 uv = vec2(roughness, sqrt(1.0 - dotNV));

        uv = uv * LUT_SCALE + LUT_BIAS;

        return uv;
    }

    vec3 LTC_EdgeVectorFormFactor(const in vec3 v1, const in vec3 v2) {
        float x = dot(v1, v2);

        float y = abs(x);

        // rational polynomial approximation to theta / sin( theta ) / 2PI
        float a = 0.8543985 + (0.4965155 + 0.0145206 * y) * y;
        float b = 3.4175940 + (4.1616724 + y) * y;
        float v = a / b;

        float theta_sintheta = (x > 0.0) ? v : 0.5 * inversesqrt(max(1.0 - x * x, 1e-7)) - v;

        return cross(v1, v2) * theta_sintheta;
    }

    float LTC_ClippedSphereFormFactor(const in vec3 f) {
        // Real-Time Area Lighting: a Journey from Research to Production (p.102)
        // An approximation of the form factor of a horizon-clipped rectangle.

        float l = length(f);

        return max((l * l + f.z) / (l + 1.0), 0.0);
    }

    vec3 LTC_Evaluate(const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[4]) {
        // bail if point is on back side of plane of light
        // assumes ccw winding order of light vertices
        vec3 v1 = rectCoords[1] - rectCoords[0];
        vec3 v2 = rectCoords[3] - rectCoords[0];
        vec3 lightNormal = cross(v1, v2);

        if(dot(lightNormal, P - rectCoords[0]) < 0.0) return vec3(0.0);

        // construct orthonormal basis around N
        vec3 T1, T2;
        T1 = normalize(V - N * dot(V, N));
        T2 = - cross(N, T1); // negated from paper; possibly due to a different handedness of world coordinate system

        // compute transform
        mat3 mat = mInv * mat3(
            T1.x, T2.x, N.x,
            T1.y, T2.y, N.y,
            T1.z, T2.z, N.z
        );

        // transform rect
        vec3 coords[4];
        coords[0] = mat * (rectCoords[0] - P);
        coords[1] = mat * (rectCoords[1] - P);
        coords[2] = mat * (rectCoords[2] - P);
        coords[3] = mat * (rectCoords[3] - P);

        // project rect onto sphere
        coords[0] = normalize(coords[0]);
        coords[1] = normalize(coords[1]);
        coords[2] = normalize(coords[2]);
        coords[3] = normalize(coords[3]);

        // calculate vector form factor
        vec3 vectorFormFactor = vec3(0.0);
        vectorFormFactor += LTC_EdgeVectorFormFactor(coords[0], coords[1]);
        vectorFormFactor += LTC_EdgeVectorFormFactor(coords[1], coords[2]);
        vectorFormFactor += LTC_EdgeVectorFormFactor(coords[2], coords[3]);
        vectorFormFactor += LTC_EdgeVectorFormFactor(coords[3], coords[0]);

        // adjust for horizon clipping
        float result = LTC_ClippedSphereFormFactor(vectorFormFactor);

        return vec3(result);
    }

    vec3 LTC_Diffuse(const in vec3 diffuseColor, const in vec3 N, const in vec3 V, const in vec3 P, const in vec3 rectCoords[4]) {
        return diffuseColor * LTC_Evaluate(N, V, P, mat3(1.0), rectCoords);
    }

    vec3 LTC_Specular(const in vec3 specularColor, const in vec3 N, const in vec3 V, const in vec3 P, const in vec3 rectCoords[4], const in float roughness) {
        vec2 ltc_uv = LTC_Uv(N, V, roughness);

        vec4 t1 = texture2D(ltc_1, ltc_uv);
        vec4 t2 = texture2D(ltc_2, ltc_uv);

        mat3 mInv = mat3(
            vec3(t1.x, 0, t1.y),
            vec3(0, 1, 0),
            vec3(t1.z, 0, t1.w)
        );

        // LTC Fresnel Approximation by Stephen Hill
        // http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
        vec3 fresnel = (specularColor * t2.x + (vec3(1.0) - specularColor) * t2.y);

        return fresnel * LTC_Evaluate(N, V, P, mInv, rectCoords);
    }
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

    // Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
    float getSpecularMIPLevel(const in float roughness, const in int maxMIPLevel) {
    	float maxMIPLevelScalar = float(maxMIPLevel);

        float sigma = PI * roughness * roughness / (1.0 + roughness);
        float desiredMIPLevel = maxMIPLevelScalar + log2(sigma);

    	// clamp to allowable LOD ranges.
    	return clamp(desiredMIPLevel, 0.0, maxMIPLevelScalar);
    }

    vec3 getLightProbeIndirectRadiance(const in float roughness, const in int maxMIPLevel, const in vec3 normal, const in vec3 envDir) {
        float specularMIPLevel = getSpecularMIPLevel(roughness, maxMIPLevel);

        // Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
        vec3 coordVec = normalize(mix(envDir, normal, roughness * roughness));

        coordVec.x *= u_EnvMap_Flip;

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