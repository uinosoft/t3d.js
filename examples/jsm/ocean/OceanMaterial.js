import { ShaderMaterial } from 't3d';

export class OceanMaterial extends ShaderMaterial {

	constructor() {
		super(OceanShader);
		this.defines.SHORELINE = false;
	}

	setOceanField(oceanField) {
		const uniforms = this.uniforms;

		const cascades = oceanField.params.cascades;
		const dataMaps = oceanField.dataMaps;

		uniforms.sizes[0] = cascades[0].size;
		uniforms.sizes[1] = cascades[1].size;
		uniforms.sizes[2] = cascades[2].size;

		uniforms.croppinesses[0] = cascades[0].croppiness;
		uniforms.croppinesses[1] = cascades[1].croppiness;
		uniforms.croppinesses[2] = cascades[2].croppiness;

		uniforms.dx_hy_dz_dxdz0 = dataMaps[0];
		uniforms.sx_sz_dxdx_dzdz0 = dataMaps[1];
		uniforms.dx_hy_dz_dxdz1 = dataMaps[2];
		uniforms.sx_sz_dxdx_dzdz1 = dataMaps[3];
		uniforms.dx_hy_dz_dxdz2 = dataMaps[4];
		uniforms.sx_sz_dxdx_dzdz2 = dataMaps[5];
	}

}

export const OceanShader = {
	name: 'ocean',
	defines: {},
	uniforms: {
		dx_hy_dz_dxdz0: null,
		sx_sz_dxdx_dzdz0: null,
		dx_hy_dz_dxdz1: null,
		sx_sz_dxdx_dzdz1: null,
		dx_hy_dz_dxdz2: null,
		sx_sz_dxdx_dzdz2: null,
		sizes: [0, 0, 0],
		croppinesses: [0, 0, 0],
		foamSpreading: 1.2,
		foamContrast: 7.2,
		// for shoreline
		tDepth: null,
		tNoise: null
	},
	vertexShader: /* glsl */`
		attribute vec3 a_Position;

		uniform mat4 u_Model;
		uniform mat4 u_ProjectionView;

		#include <transpose>
		#include <inverse>
		#include <logdepthbuf_pars_vert>

		uniform sampler2D dx_hy_dz_dxdz0;
		uniform sampler2D sx_sz_dxdx_dzdz0;
		uniform sampler2D dx_hy_dz_dxdz1;
		uniform sampler2D sx_sz_dxdx_dzdz1;
		uniform sampler2D dx_hy_dz_dxdz2;
		uniform sampler2D sx_sz_dxdx_dzdz2;
		uniform float sizes[3];
		uniform float croppinesses[3];
		uniform float foamSpreading;
		uniform float foamContrast;

		varying vec3 _position;
		varying vec2 _xz;

		vec3 getDisplacement(in vec2 xz) {
			vec2 uv0 = xz / sizes[0];
			vec2 uv1 = xz / sizes[1];
			vec2 uv2 = xz / sizes[2];
			return
				texture2D(dx_hy_dz_dxdz0, uv0).xyz * vec3(croppinesses[0], 1.0, croppinesses[0]) +
				texture2D(dx_hy_dz_dxdz1, uv1).xyz * vec3(croppinesses[1], 1.0, croppinesses[1]) +
				texture2D(dx_hy_dz_dxdz2, uv2).xyz * vec3(croppinesses[2], 1.0, croppinesses[2]);
		}

		void main() {
			vec4 worldPosition = u_Model * vec4(a_Position, 1.0);

			_xz = worldPosition.xz;
			_position = worldPosition.xyz + getDisplacement(_xz);

			gl_Position = u_ProjectionView * vec4(_position, 1.0);

			#include <logdepthbuf_vert>
		}
	`,
	fragmentShader: /* glsl */`
		uniform vec3 u_CameraPosition;
		uniform samplerCube envMap;

		#include <inverse>

		uniform sampler2D dx_hy_dz_dxdz0;
		uniform sampler2D sx_sz_dxdx_dzdz0;
		uniform sampler2D dx_hy_dz_dxdz1;
		uniform sampler2D sx_sz_dxdx_dzdz1;
		uniform sampler2D dx_hy_dz_dxdz2;
		uniform sampler2D sx_sz_dxdx_dzdz2;
		uniform float sizes[3];
		uniform float croppinesses[3];
		uniform float foamSpreading;
		uniform float foamContrast;

		#ifdef SHORELINE
			uniform mat4 u_Projection;

			uniform sampler2D tNoise;
			uniform sampler2D tDepth;
		#endif

		varying vec3 _position;
		varying vec2 _xz;

		vec4 jacobian(float dxdx, float dxdz, float dzdz) {
			float Jxx = 1.0 + dxdx;
			float Jxz = dxdz;
			float Jzz = 1.0 + dzdz;
			return vec4(Jxx, Jxz, Jxz, Jzz);
		}

		float det(vec4 jacobian) {
			return jacobian.x * jacobian.w - jacobian.y * jacobian.z;
		}

		vec3 getNormal(vec2 xz) {
			vec2 uv0 = xz / sizes[0];
			vec2 uv1 = xz / sizes[1];
			vec2 uv2 = xz / sizes[2];

			vec4 _sx_sz_dxdx_dzdz0 = texture2D(sx_sz_dxdx_dzdz0, uv0).xyzw;
			vec4 _sx_sz_dxdx_dzdz1 = texture2D(sx_sz_dxdx_dzdz1, uv1).xyzw;
			vec4 _sx_sz_dxdx_dzdz2 = texture2D(sx_sz_dxdx_dzdz2, uv2).xyzw;

			float sx = _sx_sz_dxdx_dzdz0.x + _sx_sz_dxdx_dzdz1.x + _sx_sz_dxdx_dzdz2.x;
			float sz = _sx_sz_dxdx_dzdz0.y + _sx_sz_dxdx_dzdz1.y + _sx_sz_dxdx_dzdz2.y;
			float dxdx = _sx_sz_dxdx_dzdz0.z * croppinesses[0] + _sx_sz_dxdx_dzdz1.z * croppinesses[1] + _sx_sz_dxdx_dzdz2.z * croppinesses[2];
			float dzdz = _sx_sz_dxdx_dzdz0.w * croppinesses[0] + _sx_sz_dxdx_dzdz1.w * croppinesses[1] + _sx_sz_dxdx_dzdz2.w * croppinesses[2];

			vec2 slope = vec2(sx / (1.0 + dxdx), sz / (1.0 + dzdz));
			return normalize(vec3(-slope.x, 1.0, -slope.y));
		}

		float getFoam(vec2 xz) {
			vec2 uv0 = xz / sizes[0];
			vec2 uv1 = xz / sizes[1];
			vec2 uv2 = xz / sizes[2];

			vec2 dxdx_dzdz0 = texture2D(sx_sz_dxdx_dzdz0, uv0).zw;
			vec2 dxdx_dzdz1 = texture2D(sx_sz_dxdx_dzdz1, uv1).zw;
			vec2 dxdx_dzdz2 = texture2D(sx_sz_dxdx_dzdz2, uv2).zw;

			float dxdz0 = texture2D(dx_hy_dz_dxdz0, uv0).w;
			float dxdz1 = texture2D(dx_hy_dz_dxdz1, uv1).w;
			float dxdz2 = texture2D(dx_hy_dz_dxdz2, uv2).w;

			vec2 dxdx_dzdz = dxdx_dzdz0 * croppinesses[0] + dxdx_dzdz1 * croppinesses[1] + dxdx_dzdz2 * croppinesses[2];
			float dxdz = dxdz0 * croppinesses[0] + dxdz1 * croppinesses[1] + dxdz2 * croppinesses[2];

			float val = det(jacobian(dxdx_dzdz.x, dxdz, dxdx_dzdz.y));
			return abs(pow(-min(0.0, val - foamSpreading), foamContrast));
		}

		vec3 gammaCorrection(const vec3 color) {
			return pow(color, vec3(1.0f / 2.2f));
		}

		vec3 ACESFilm(vec3 x){
			return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
		}

		float fresnelSchlick(vec3 view, vec3 normal){
			float cosTheta = dot(normal, normalize(view));
			float F0 = 0.02;
			return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
		}

		vec3 surface(in vec3 normal, in vec3 view) {
			const vec3 upwelling = vec3(0.0, 0.2, 0.3);
			const vec3 mist = vec3(0.34, 0.42, 0.5);
			const float nShell = 1.34f;
			const float kDiffuse = 1.0f;
			const vec3 sunIndensity = vec3(0.42f, 0.39f, 0.19f) * 1.0e2;
			vec3 sunDir = normalize(vec3(1.0f, 1.0f, -10.0f));

			vec3 ref = reflect(-view, normal);
			ref.y = max(ref.y, 1.0e-0);
			ref = normalize(ref);

			vec3 sky = ACESFilm(textureLod(envMap, ref, 0.0f).rgb) + pow(max(dot(ref, sunDir), 0.0f), 500.0f) * sunIndensity;
			sky = gammaCorrection(sky);
			// sky = vec3(0.69, 0.84, 1.0);

			float reflectivity;
			float costhetai = abs(dot(normal, normalize(view)));
			float thetai = acos(costhetai);
			float sinthetat = sin(thetai) / nShell;
			float thetat = asin(sinthetat);

			if(thetai == 0.0)
			{
				reflectivity = (nShell - 1.0f) / (nShell + 1.0f);
				reflectivity = reflectivity * reflectivity;
			}
			else
			{
				float fs = sin(thetat - thetai)  / sin(thetat + thetai);
				float ts = tan(thetat - thetai)  / tan(thetat + thetai);
				reflectivity = 0.5 * (fs * fs + ts * ts );
			}

			// reflectivity = fresnelSchlick(view,normal);

			float falloff = 1.0f; // min(exp(-(length(view) - 1000.0f) * 1.0e-2), 1.0f) * kDiffuse;
			vec3 surf =  reflectivity * sky + (1.0f - reflectivity) * upwelling;
			return falloff * surf  + (1.0f - falloff) * mist;
		}

		void main() {
			float f = getFoam(_xz);
			vec3 n = getNormal(_xz);
			float a = 1.0;

			#ifdef SHORELINE
				mat4 projectionInv = inverseMat4(u_Projection);

				ivec2 depthSize = textureSize(tDepth, 0);
				vec2 screenUV = gl_FragCoord.xy / vec2(depthSize);
				float depth = texture2D(tDepth, screenUV).r * 2.0 - 1.0;
				vec4 projectedPos = vec4(screenUV * 2.0 - 1.0, depth, 1.0);
				vec4 pos = projectionInv * projectedPos;
				vec3 rayOrigin = pos.xyz / pos.w;

				vec4 waterProjectedPos = vec4(screenUV * 2.0 - 1.0, gl_FragCoord.z * 2.0 - 1.0, 1.0);
				vec4 waterPos = projectionInv * waterProjectedPos;
				vec3 waterViewPos = waterPos.xyz / waterPos.w;

				float realDist = distance(rayOrigin, waterViewPos);

				// Shore Waves
				vec3 dPosDx = dFdx(_position);
				vec3 dPosDy = dFdy(_position);
				float dDistDx = dFdx(realDist);
				float dDistDy = dFdy(realDist);
				vec3 rawGrad = dPosDx * dDistDx + dPosDy * dDistDy;
				vec3 distGrad = length(rawGrad) > 1e-5 ? normalize(rawGrad) : vec3(0.0);

				float _uTime = 0.0;
				float shoreWaveSpeed = 1.0;
				float phase = 2.0 * pow(max(realDist, 0.0), 0.8) + _uTime * shoreWaveSpeed;
				float waveVal = sin(phase);
				float dPhase = 1.6 * pow(max(realDist, 0.1), -0.2);
				float waveHeight = exp(waveVal - 1.0);
				float waveSlope = waveHeight * cos(phase) * dPhase;
				float shoreMask = 1.0 - smoothstep(0.0, 30.0, realDist);
				vec3 waveNormal = -distGrad * waveSlope * 0.8 * shoreMask;

				n = normalize(n + waveNormal);

				float _NoiseScale = 3.0;
				float _EdgeSpeed = 0.9;
				float _EdgeAmount = 1.0;
				float _EdgeFoamDepth = 8.0;

				vec2 samplerUV = vec2(_uTime * 0.1, 0.0);
				float distortNoise = texture2D(tNoise, _xz / _NoiseScale + samplerUV).r * 2.3;
				float edgeFoamMask = 1.0 - smoothstep(0.0, _EdgeFoamDepth, realDist);
				edgeFoamMask = clamp(sin((edgeFoamMask - _uTime * _EdgeSpeed) * 3.14159 * _EdgeAmount), 0.0, 1.0) * edgeFoamMask * distortNoise;

				f = max(f, edgeFoamMask);

				float _DepthDensity = 0.1;
				a = 1.0 - exp(-_DepthDensity * realDist);
				a = mix(a, 1.0, clamp(f, 0.0, 0.4));
			#endif

			const vec3 foam = vec3(1.0f);
			vec3 water = surface(n, u_CameraPosition - _position);
			gl_FragColor = vec4(mix(water, foam, f), a);
		}
	`
};