const GroundProjectedSkyboxShader = {
	name: 'ground_projected_skybox',

	defines: {
		GAMMA: false,
		PANORAMA: false
	},

	uniforms: {
		level: 0,
		flip: -1,
		height: 15,
		radius: 100
	},

	vertexShader: `
		#include <common_vert>

		varying vec3 vDir;

		mat4 clearMat4Translate(mat4 m) {
			mat4 outMatrix = m;
			outMatrix[3].xyz = vec3(0., 0., 0.);
			return outMatrix;
		}

		void main() {
			mat4 modelMatrix = clearMat4Translate(u_Model);
			mat4 viewMatrix = clearMat4Translate(u_View);

			vDir = normalize((modelMatrix * vec4(a_Position, 0.0)).xyz);

			gl_Position = u_Projection * viewMatrix * modelMatrix * vec4(a_Position, 1.0);
			gl_Position.z = gl_Position.w;
		}
    `,

	fragmentShader: `
        #include <common_frag>

		#ifdef PANORAMA
			uniform sampler2D diffuseMap; 
        #else
			uniform samplerCube cubeMap;
		#endif

		uniform float flip;
		uniform float level;

		varying vec3 vDir;

		uniform float radius;
        uniform float height;

        // From: https://www.shadertoy.com/view/4tsBD7
        float diskIntersectWithBackFaceCulling(vec3 ro, vec3 rd, vec3 c, vec3 n, float r) {
            float d = dot (rd, n);

            if(d > 0.0) { return 1e6; }

            vec3 o = ro - c;
            float t = - dot(n, o) / d;
            vec3 q = o + rd * t;

            return (dot(q, q) < r * r) ? t : 1e6;
        }

        // From: https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
        float sphereIntersect(vec3 ro, vec3 rd, vec3 ce, float ra) {
            vec3 oc = ro - ce;
            float b = dot(oc, rd);
            float c = dot(oc, oc) - ra * ra;
            float h = b * b - c;

            if(h < 0.0) { return -1.0; }

            h = sqrt(h);

            return - b + h;
        }

        vec3 project() {
            vec3 p = normalize(vDir);
            vec3 camPos = u_CameraPosition;
            camPos.y -= height;

            float intersection = sphereIntersect(camPos, p, vec3(0.0), radius);
            if (intersection > 0.0) {
                vec3 h = vec3(0.0, - height, 0.0);
                float intersection2 = diskIntersectWithBackFaceCulling(camPos, p, h, vec3(0.0, 1.0, 0.0), radius);
                p = (camPos + min(intersection, intersection2) * p) / radius;
            } else {
                p = vec3(0.0, 0.0, 0.0);
            }

            return p;
        }

        void main() {
			#include <begin_frag>

            vec3 projectedWorldPosition = project();
			vec3 V = normalize(projectedWorldPosition);

            #ifdef PANORAMA
				float phi = acos(V.y);
				// consistent with cubemap.
				// atan(y, x) is same with atan2 ?
				float theta = flip * atan(V.x, V.z) + PI * 0.5;
				vec2 uv = vec2(theta / 2.0 / PI, -phi / PI);
				#ifdef TEXTURE_LOD_EXT
					outColor *= mapTexelToLinear(texture2DLodEXT(diffuseMap, fract(uv), level));
				#else
					outColor *= mapTexelToLinear(texture2D(diffuseMap, fract(uv), level));
				#endif
			#else
				vec3 coordVec = vec3(flip * V.x, V.yz);
				#ifdef TEXTURE_LOD_EXT
					outColor *= mapTexelToLinear(textureCubeLodEXT(cubeMap, coordVec, level));
				#else
					outColor *= mapTexelToLinear(textureCube(cubeMap, coordVec, level));
				#endif
			#endif

			#include <end_frag>
			#ifdef GAMMA
				#include <encodings_frag>
			#endif
        }

    `
};

export { GroundProjectedSkyboxShader };