vec4 LinearToLinear(in vec4 value) {
	return value;
}

vec4 GammaToLinear(in vec4 value, in float gammaFactor) {
	return vec4(pow(value.xyz, vec3(gammaFactor)), value.w);
}

vec4 LinearToGamma(in vec4 value, in float gammaFactor) {
	return vec4(pow(value.xyz, vec3(1.0 / gammaFactor)), value.w);
}

vec4 sRGBToLinear(in vec4 value) {
	return vec4(mix(pow(value.rgb * 0.9478672986 + vec3(0.0521327014), vec3(2.4)), value.rgb * 0.0773993808, vec3(lessThanEqual(value.rgb, vec3(0.04045)))), value.w);
}

vec4 LinearTosRGB(in vec4 value) {
	return vec4(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))), value.w);
}