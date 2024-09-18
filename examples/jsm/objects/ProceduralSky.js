import {
	BoxGeometry,
	DRAW_SIDE,
	Mesh,
	ShaderMaterial
} from 't3d';


class ProceduralSky extends Mesh {

	constructor(cubeTexture) {
		const geometry = new BoxGeometry(2, 2, 2);

		const material = new ShaderMaterial(ProceduralSky.SkyShader);
		material.side = DRAW_SIDE.BACK;
		material.cubeMap = cubeTexture;

		super(geometry, material);

		this.frustumCulled = false;
	}

}

// https://puluo.top/unity-shader01/
ProceduralSky.SkyShader = {
	name: 'sky_procedural',

	uniforms: {
		MoonDirSize: [0, 0, 0],
		SunDirSize: [0, 0, 0],
		sunRadius: 1.0,
		SunMaskRadius: 20,
		MoonRadius: 0.1,
		MoonMaskRadius: 10,
		MoonU: 0.35,
		MoonV: 0.0,
		MoonTex: null,
		SunViewGradTex: null,
		SunZenithGradTex: null,
		ViewZenithGradTex: null
	},

	vertexShader: `
		attribute vec3 a_Position;
		attribute vec2 a_Uv;
		
		uniform mat4 u_Model;
        uniform mat4 u_View;
        uniform mat4 u_Projection;

		varying vec3 v_Pos;

        mat4 clearMat4Translate(mat4 m) {
            mat4 outMatrix = m;
            outMatrix[3].xyz = vec3(0., 0., 0.);
            return outMatrix;
		}

		void main() {
            mat4 modelMatrix = clearMat4Translate(u_Model);
			mat4 viewMatrix = clearMat4Translate(u_View);

            gl_Position = u_Projection * viewMatrix * modelMatrix * vec4(a_Position, 1.0);
			gl_Position.z = gl_Position.w;
            v_Pos =a_Position.xyz;
		}
	`,

	fragmentShader: `
		uniform float SunMaskRadius;
        uniform float sunRadius;
		uniform float MoonRadius;
		uniform float MoonMaskRadius;
		uniform float MoonU;
		uniform float MoonV;

		uniform vec3 MoonDirSize;
		uniform vec3 SunDirSize;
		uniform vec3 cameraPosition;

        uniform samplerCube MoonTex;
		uniform sampler2D SunViewGradTex;
		uniform sampler2D SunZenithGradTex;
		uniform sampler2D ViewZenithGradTex;

		varying vec3 v_Pos;

		float sphIntersect(vec3 rayDir, vec3 spherePos, float radius){
			vec3 oc = -spherePos;
			float b = dot(oc, rayDir);
			float c = dot(oc, oc) - radius * radius;
			float h = b * b - c;
			if (h < 0.0) return -1.0;
			h = sqrt(h);
			return -b - h;
		}

		vec3 normalTransform(vec3 N, vec3 n){
			N = normalize(N);
			vec3 T = normalize(cross(N, vec3(0.5, 0.5, 0.5)));
			vec3 B = normalize(cross(N, T));
			mat3 TBN = mat3(T, B, N);
			mat3 TBN_inverse = transpose(TBN);
			return TBN_inverse * n ;
		}

		vec3 normalTransform2(float u, float v, vec3 n){
			vec3 N = vec3(sqrt(1. - u * u - v * v), u, v);
			vec3 T = normalize(cross(N, vec3(0.5, 0.5, 0.5)));
			vec3 B = normalize(cross(N, T));
			mat3 TBN = mat3(T, B, N);
			return TBN * n ;
		}


		void main() {
			vec3 viewDir = normalize(v_Pos - cameraPosition);
			vec3 lDir = normalize(MoonDirSize.xyz);

            float sunDist = distance(SunDirSize, viewDir);
            float sunArea = 1.0 - smoothstep(0.6, 1., sunDist * SunMaskRadius);

			float moonIntersect = sphIntersect(viewDir, lDir, MoonRadius);
			float moonDist = distance(MoonDirSize , viewDir);
			float moonMask = 1. - smoothstep(0.6, 1., moonDist * MoonMaskRadius);
			vec3 moonNormal = normalize(lDir - viewDir * moonIntersect);
			moonNormal = normalTransform(-lDir, moonNormal);
			moonNormal = normalTransform2(MoonU, MoonV, moonNormal);

            vec4 moonTex = textureCube(MoonTex, moonNormal);
			vec3 moonColor = moonMask * exp2(.2) * moonTex.rgb;

			float sunZenithDot01 = (SunDirSize.y + 1.) * 0.5;
			vec3 sunZenithColor = texture2D(SunZenithGradTex, vec2(sunZenithDot01, 0.5)).rgb;

			float viewZenithDot = viewDir.y;
			vec3 viewZenithColor = texture2D(ViewZenithGradTex, vec2(sunZenithDot01, 0.5)).rgb;
			float vzMask = pow(saturate(0.9 - viewZenithDot), 5.);

			float sunViewDot = dot(normalize(v_Pos.xyz),  SunDirSize );
			vec3 sunViewColor = texture2D(SunViewGradTex, vec2(sunZenithDot01, 0.5)).rgb;
			float svMask = pow(saturate(sunViewDot - 0.1), 4.);

			vec3 skyColor = sunZenithColor + vzMask * viewZenithColor + svMask * sunViewColor;
			vec3 col = sunArea + moonColor + (1. - sunArea - moonColor) * skyColor;

            gl_FragColor = vec4(col, 1.0);
		}
	`
};
export { ProceduralSky };