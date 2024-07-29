// ref: https://github.com/galacean/engine-toolkit/blob/main/packages/custom-material/src/grid/Grid.shader
const InfiniteGridShader = {
	name: 'infinite_grid',

	defines: {
		USE_LINEARFADE: true
	},

	uniforms: {
		flipProgress: 0.0,
		axisIntensity: 0.7,
		gridIntensity: 0.2,
		primaryScale: 5,
		secondaryScale: 1,
		primaryFade: 0.7,
		secondaryFade: 0.4,
		start: 30,
		end: 100
	},

	vertexShader: `
        #include <common_vert>

        varying vec3 nearPoint;
        varying vec3 farPoint;

        vec3 unprojectPoint(float x, float y, float z, mat4 pvmInverse) {
            vec4 unprojectedPoint = pvmInverse * vec4(x, y, z, 1.0);
            return unprojectedPoint.xyz / unprojectedPoint.w;
        }

        void main() {
            mat4 pvmInverse = inverseMat4(u_Projection * u_View * u_Model);

            nearPoint = unprojectPoint(a_Position.x, a_Position.y, -1.0, pvmInverse); // unprojecting on the near plane
            farPoint = unprojectPoint(a_Position.x, a_Position.y, 1.0, pvmInverse); // unprojecting on the far plane

            gl_Position = vec4(a_Position, 1.0); // using directly the clipped coordinates
        }
    `,

	fragmentShader: `
        uniform mat4 u_ProjectionView;
        uniform mat4 u_View;
        uniform mat4 u_Model;

        uniform float flipProgress;
        uniform float axisIntensity;
        uniform float gridIntensity;
        uniform float primaryScale;
        uniform float secondaryScale;
        uniform float primaryFade;
        uniform float secondaryFade;
        uniform float start;
        uniform float end;

        varying vec3 nearPoint;
        varying vec3 farPoint;

        vec4 grid(vec3 fragPos3D, float scale, float alpha) {
            vec2 coord = mix(fragPos3D.xz, fragPos3D.xy, flipProgress) / scale; // use the scale variable to set the distance between the lines
            vec2 derivative = fwidth(coord);
            vec2 grid = abs(fract(coord - 0.5) - 0.5) / derivative;
            float line = min(grid.x, grid.y);
            float minimumz = min(derivative.y, 1.0);
            float minimumx = min(derivative.x, 1.0);
            vec4 color = vec4(gridIntensity, gridIntensity, gridIntensity, 1.0 - min(line, 1.0));

            // z axis
            if(fragPos3D.x >= -axisIntensity * minimumx && fragPos3D.x <= axisIntensity * minimumx) {
                color *= vec4(0.0, 0.0, 4.0, 1.0);
                color.b = clamp(color.b, 0.0, 1.0);
            }
                
            // x axis and y axis
            float xy = mix(fragPos3D.z, fragPos3D.y, flipProgress);
            if(xy >= -axisIntensity * minimumz && xy <= axisIntensity * minimumz) {
                color *= vec4(4.0, 0.0, 0.0, 1.0);
                color.r = clamp(color.r, 0.0, 1.0);
            }
                
            color.a *= alpha;

            return color;
        }

        float computeDepth(vec3 pos) {
            vec4 clip_space_pos = u_ProjectionView * u_Model * vec4(pos.xyz, 1.0);
            return (clip_space_pos.z / clip_space_pos.w) * 0.5 + 0.5;
        }

        float computeLinearDepth(vec3 pos) {
            vec4 view_space_pos = u_View * u_Model * vec4(pos.xyz, 1.0);
            float view_space_depth = abs(view_space_pos.z) / view_space_pos.w;
            float linearDepth = max(0., view_space_depth - start) / (end - start);
            return linearDepth;
        }

        void main() {
            float ty = -nearPoint.y / (farPoint.y - nearPoint.y);
            float tz = -nearPoint.z / (farPoint.z - nearPoint.z);
            float t = mix(ty, tz, flipProgress);
            vec3 fragPos3D = nearPoint + t * (farPoint - nearPoint);
            
            gl_FragDepthEXT = computeDepth(fragPos3D);

            gl_FragColor = (grid(fragPos3D, primaryScale, primaryFade) + grid(fragPos3D, secondaryScale, secondaryFade)) * float(t > 0.0);

            #ifdef USE_LINEARFADE
                float linearDepth = computeLinearDepth(fragPos3D);
                gl_FragColor.a *= max(0.0, 1.0 - linearDepth);
            #endif
        }
    `
};

export { InfiniteGridShader };