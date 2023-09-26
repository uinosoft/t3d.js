// https://www.shadertoy.com/view/MllBR2

export const SkyShader = {
	name: 'sky_bg',

	defines: {
		SAMPLES_NUMS: 16,
		DISPLAY_SUN: false
	},

	uniforms: {
		sunU: 1.55,
		sunV: 0.65,
		eyePos: 1500,
		sunRadius: 500.0, // = 500.0;
		sunRadiance: 10.0, // = 20.0;
		mieG: 0.96, // = 0.76;
		mieHeight: 1200, // = 1200;
		sunBrightness: 1.0 // = 1.0;
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;
		
		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;

		varying vec2 v_Uv;

		void main() {
			v_Uv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
		}
	`,

	fragmentShader: `
		uniform float sunU;
		uniform float sunV;
		uniform float eyePos;
		uniform float sunRadius;
		uniform float sunRadiance;
		uniform float mieG;
		uniform float mieHeight;
		uniform float sunBrightness;

		varying vec2 v_Uv;

		struct ScatteringParams {
			float sunRadius;
			float sunRadiance;

			float mieG;
			float mieHeight;
			float rayleighHeight;

			vec3 waveLambdaMie;
			vec3 waveLambdaOzone;
			vec3 waveLambdaRayleigh;

			float earthRadius;
			float earthAtmTopRadius;
			vec3 earthCenter;
		};

		vec3 transmittance;
		vec3 insctrMie;
		vec3 insctrRayleigh;

		vec3 ComputeSphereNormal(vec2 coord, float phiStart, float phiLength, float thetaStart, float thetaLength){
			vec3 normal = vec3(1.0);
			normal.x = -sin(thetaStart + coord.y * thetaLength) * sin(phiStart + coord.x * phiLength);
			normal.y = -cos(thetaStart + coord.y * thetaLength);
			normal.z = -sin(thetaStart + coord.y * thetaLength) * cos(phiStart + coord.x * phiLength);
			return normalize(normal);
		}

		vec2 ComputeRaySphereIntersection(vec3 position, vec3 dir, vec3 center, float radius) {
			vec3 origin = position - center;
			float B = dot(origin, dir);
			float C = dot(origin, origin) - radius * radius;
			float D = B * B - C;
			vec2 minimaxIntersections;
			if (D < 0.0)
			{
				minimaxIntersections = vec2(-1.0, -1.0);
			}
			else
			{
				D = sqrt(D);
				minimaxIntersections = vec2(-B - D, -B + D);
			}
			return minimaxIntersections;
		}

		vec3 ComputeWaveLambdaRayleigh(vec3 lambda) {
			float n = 1.0003;
			float N = 2.545E25;
			float pn = 0.035;
			float n2 = n * n;
			float pi3 = PI * PI * PI;
			float rayleighConst = (8.0 * pi3 * pow(n2 - 1.0,2.0)) / (3.0 * N) * ((6.0 + 3.0 * pn) / (6.0 - 7.0 * pn));
			return vec3(rayleighConst) / (lambda * lambda * lambda * lambda);
		}

		float ComputePhaseMie(float theta, float g) {
			float g2 = g * g;
			return (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * saturate(theta), 1.5) / (4.0 * PI);
		}

		float ComputePhaseRayleigh(float theta) {
			float theta2 = theta * theta;
			return (theta2 * 0.75 + 0.75) / (4.0 * PI);
		}

		float ChapmanApproximation(float X, float h, float cosZenith) {
			float c = sqrt(X + h);
			float c_exp_h = c * exp(-h);

			if (cosZenith >= 0.0)
			{
				return c_exp_h / (c * cosZenith + 1.0);
			}
			else
			{
				float x0 = sqrt(1.0 - cosZenith * cosZenith) * (X + h);
				float c0 = sqrt(x0);
				return 2.0 * c0 * exp(X - x0) - c_exp_h / (1.0 - c * cosZenith);
			}
		}

		float GetOpticalDepthSchueler(float h, float H, float earthRadius, float cosZenith) {
			return H * ChapmanApproximation(earthRadius / H, h / H, cosZenith);
		}

		vec3 GetTransmittance(ScatteringParams setting, vec3 L, vec3 V) {
			float ch = GetOpticalDepthSchueler(L.y, setting.rayleighHeight, setting.earthRadius, V.y);
			return exp(-(setting.waveLambdaMie + setting.waveLambdaRayleigh) * ch);
		}

		vec2 ComputeOpticalDepth(ScatteringParams setting, vec3 samplePoint, vec3 V, vec3 L, float neg) {
			float rl = length(samplePoint);
			float h = rl - setting.earthRadius;
			vec3 r = samplePoint / rl;

			float cos_chi_sun = dot(r, L);
			float cos_chi_ray = dot(r, V * neg);

			float opticalDepthSun = GetOpticalDepthSchueler(h, setting.rayleighHeight, setting.earthRadius, cos_chi_sun);
			float opticalDepthCamera = GetOpticalDepthSchueler(h, setting.rayleighHeight, setting.earthRadius, cos_chi_ray) * neg;

			return vec2(opticalDepthSun, opticalDepthCamera);
		}

		void AerialPerspective(ScatteringParams setting, vec3 start, vec3 end, vec3 V, vec3 L, int infinite) {
			float inf_neg = 1.0;
			if(infinite == 0){
				inf_neg = -1.0;
			}
			int a1 = SAMPLES_NUMS;
			float a= float(a1);
			vec3 sampleStep = (end - start) / a * 1.0;
			vec3 samplePoint = end - sampleStep;
			vec3 sampleLambda = setting.waveLambdaMie + setting.waveLambdaRayleigh + setting.waveLambdaOzone;

			float sampleLength = length(sampleStep);

			vec3 scattering = vec3(0.0);
			vec2 lastOpticalDepth = ComputeOpticalDepth(setting, end, V, L, inf_neg);

			for (int i = 1; i < a1; i = i + 1) {
				vec2 opticalDepth = ComputeOpticalDepth(setting, samplePoint, V, L, inf_neg);

				vec3 segment_s = exp(-sampleLambda * (opticalDepth.x + lastOpticalDepth.x));
				vec3 segment_t = exp(-sampleLambda * (opticalDepth.y - lastOpticalDepth.y));

				transmittance *= segment_t;

				scattering = scattering * segment_t;
				scattering += exp(-(length(samplePoint) - setting.earthRadius) / setting.rayleighHeight) * segment_s;

				lastOpticalDepth = opticalDepth;
				samplePoint = samplePoint - sampleStep;
			}

			insctrMie = scattering * setting.waveLambdaMie * sampleLength;
			insctrRayleigh = scattering * setting.waveLambdaRayleigh * sampleLength;
		}
			
		float ComputeSkyboxChapman(ScatteringParams setting, vec3 eye, vec3 V, vec3 L) {
			int neg = 1;
			vec2 outerIntersections = ComputeRaySphereIntersection(eye, V, setting.earthCenter, setting.earthAtmTopRadius);
			if (outerIntersections.y < 0.0){
				return 0.0;
			}
			vec2 innerIntersections = ComputeRaySphereIntersection(eye, V, setting.earthCenter, setting.earthRadius);
			if (innerIntersections.x > 0.0)
			{
				neg = 0;
				outerIntersections.y = innerIntersections.x;
			}

			vec3 eye0 = eye - setting.earthCenter;

			vec3 start = eye0 + V * max(0.0, outerIntersections.x);
			vec3 end = eye0 + V * outerIntersections.y;

			AerialPerspective(setting, start, end, V, L, neg);

			//bool intersectionTest = innerIntersections.x < 0.0 && innerIntersections.y < 0.0;
			//return intersectionTest ? 1.0 : 0.0;

			if(innerIntersections.x < 0.0 && innerIntersections.y < 0.0){
				return 1.0;
			}
			return 0.0;
		}
			
		vec4 ComputeSkyInscattering(ScatteringParams setting, vec3 eye, vec3 V, vec3 L) {
			transmittance = vec3(1.0);
			insctrMie = vec3(0.0);
			insctrRayleigh = vec3(0.0);
			float intersectionTest = ComputeSkyboxChapman(setting, eye, V, L);

			float phaseTheta = dot(V, L);
			float phaseMie = ComputePhaseMie(phaseTheta, setting.mieG);
			float phaseRayleigh = ComputePhaseRayleigh(phaseTheta);
			float phaseNight = 1.0 - saturate(transmittance.x * 0.00001);

			vec3 insctrTotalMie = insctrMie * phaseMie;
			vec3 insctrTotalRayleigh = insctrRayleigh * phaseRayleigh;

			vec3 sky = (insctrTotalMie + insctrTotalRayleigh) * setting.sunRadiance;
			#ifdef DISPLAY_SUN
				float angle = saturate((1.0 - phaseTheta) * setting.sunRadius);
				float cosAngle = cos(angle * PI * 0.5);
				float edge= 0.0;
				if(angle >= 0.9){
					edge = smoothstep(0.9, 1.0, angle);
				}

				vec3 limbDarkening = GetTransmittance(setting, -L, V);
				limbDarkening *= pow(vec3(cosAngle), vec3(0.420, 0.503, 0.652)) * mix(vec3(1.0), vec3(1.2, 0.9, 0.5), edge) * intersectionTest;
				sky += limbDarkening * sunBrightness; 
			#endif
			return vec4(sky, phaseNight * intersectionTest);
		}

		void main() {
			float eyePosition = eyePos;
			vec2 sun = vec2(sunU, sunV);
			float fpi = float(PI);
			float fpi2 = 2. * PI;

			vec3 V = ComputeSphereNormal(v_Uv, 0.0, fpi2, 0.0, fpi);
			vec3 L = ComputeSphereNormal(vec2(sun.x, sun.y), 0.0, fpi, 0.0, PI);

			ScatteringParams setting;
			setting.sunRadius = sunRadius;
			setting.sunRadiance = sunRadiance;
			setting.mieG = mieG;
			setting.mieHeight = mieHeight;
			setting.rayleighHeight = 8000.0;
			setting.earthRadius = 6360000.0;
			setting.earthAtmTopRadius = 6420000.0;
			setting.earthCenter = vec3(0, -setting.earthRadius, 0);
			setting.waveLambdaMie = vec3(0.0000002);

			// wavelength with 680nm, 550nm, 450nm
			setting.waveLambdaRayleigh = ComputeWaveLambdaRayleigh(vec3(0.000000680, 0.000000550, 0.000000450));

			setting.waveLambdaOzone = vec3(1.36820899679147, 3.31405330400124, 0.13601728252538)* 0.0000006 * 2.504;

			vec3 eye = vec3(0,eyePosition, 0);
			vec4 sky0 = ComputeSkyInscattering(setting, eye, V, L);
			vec3 sky = vec3(sky0.rgb);

			sky = pow(sky.rgb, vec3(1.0 / 2.2)); // gamma

			gl_FragColor = vec4(sky.rgb, 1.0);
		}
	`
};