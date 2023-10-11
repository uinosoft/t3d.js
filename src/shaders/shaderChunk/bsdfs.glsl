// About Cook-Torrance microfacet model, referenced to: https://en.wikipedia.org/wiki/Specular_highlight#Cook–Torrance_model

vec3 BRDF_Diffuse_Lambert(vec3 diffuseColor) {
    return RECIPROCAL_PI * diffuseColor;
}

vec3 F_Schlick(const in vec3 specularColor, const in float dotLH) {
	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotLH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2((-5.55473 * dotLH - 6.98316) * dotLH);

	return (1.0 - specularColor) * fresnel + specularColor;
}

float D_BlinnPhong(const in float shininess, const in float dotNH) {
    // normalized Blinn-Phong
	return RECIPROCAL_PI * (shininess * 0.5 + 1.0) * pow(dotNH, shininess);
}

float G_BlinnPhong_Implicit(/* const in float dotNL, const in float dotNV */) {
	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;
}

vec3 BRDF_Specular_BlinnPhong(vec3 specularColor, vec3 N, vec3 L, vec3 V, float shininess) {
    vec3 H = normalize(L + V);

    float dotNH = saturate(dot(N, H));
    float dotLH = saturate(dot(L, H));

    vec3 F = F_Schlick(specularColor, dotLH);

    float G = G_BlinnPhong_Implicit(/* dotNL, dotNV */);

    float D = D_BlinnPhong(shininess, dotNH);

    return F * G * D;
}

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float D_GGX(const in float alpha, const in float dotNH) {
	float a2 = pow2(alpha);
	float denom = pow2(dotNH) * (a2 - 1.0) + 1.0; // avoid alpha = 0 with dotNH = 1
	return RECIPROCAL_PI * a2 / pow2(denom);
}

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
float G_GGX_SmithCorrelated(const in float alpha, const in float dotNL, const in float dotNV) {
	float a2 = pow2(alpha);

	// dotNL and dotNV are explicitly swapped. This is not a mistake.
	float gv = dotNL * sqrt(a2 + (1.0 - a2) * pow2(dotNV));
	float gl = dotNV * sqrt(a2 + (1.0 - a2) * pow2(dotNL));

	return 0.5 / max(gv + gl, EPSILON);
}

// GGX Distribution, Schlick Fresnel, GGX-Smith Visibility
vec3 BRDF_Specular_GGX(vec3 specularColor, vec3 N, vec3 L, vec3 V, float roughness) {
	float alpha = pow2(roughness); // UE4's roughness

	vec3 H = normalize(L + V);

	float dotNL = saturate(dot(N, L));
	float dotNV = saturate(dot(N, V));
	float dotNH = saturate(dot(N, H));
	float dotLH = saturate(dot(L, H));

	vec3 F = F_Schlick(specularColor, dotLH);

	float G = G_GGX_SmithCorrelated(alpha, dotNL, dotNV);

	float D = D_GGX(alpha, dotNH);

	return F * G * D;
}

// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec2 integrateSpecularBRDF(const in float dotNV, const in float roughness) {
	const vec4 c0 = vec4(-1, -0.0275, -0.572, 0.022);

	const vec4 c1 = vec4(1, 0.0425, 1.04, -0.04);

	vec4 r = roughness * c0 + c1;

	float a004 = min(r.x * r.x, exp2(-9.28 * dotNV)) * r.x + r.y;

	return vec2(-1.04, 1.04) * a004 + r.zw;
}

vec3 F_Schlick_RoughnessDependent(const in vec3 F0, const in float dotNV, const in float roughness) {
	// See F_Schlick
	float fresnel = exp2((-5.55473 * dotNV - 6.98316) * dotNV);
	vec3 Fr = max(vec3(1.0 - roughness), F0) - F0;

	return Fr * fresnel + F0;
}

// ref: https://www.unrealengine.com/blog/physically-based-shading-on-mobile - environmentBRDF for GGX on mobile
vec3 BRDF_Specular_GGX_Environment(const in vec3 N, const in vec3 V, const in vec3 specularColor, const in float roughness) {
	float dotNV = saturate(dot(N, V));
	vec2 brdf = integrateSpecularBRDF(dotNV, roughness);
	return specularColor * brdf.x + brdf.y;
}

// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// Approximates multiscattering in order to preserve energy.
// http://www.jcgt.org/published/0008/01/03/
void BRDF_Specular_Multiscattering_Environment(const in vec3 N, const in vec3 V, const in vec3 specularColor, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter) {
	float dotNV = saturate(dot(N, V));

	vec3 F = F_Schlick_RoughnessDependent(specularColor, dotNV, roughness);
	vec2 brdf = integrateSpecularBRDF(dotNV, roughness);
	vec3 FssEss = F * brdf.x + brdf.y;

	float Ess = brdf.x + brdf.y;
	float Ems = 1.0 - Ess;

	vec3 Favg = specularColor + (1.0 - specularColor) * 0.047619; // 1/21
	vec3 Fms = FssEss * Favg / (1.0 - Ems * Favg);

	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}