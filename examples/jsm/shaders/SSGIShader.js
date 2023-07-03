/**
 * SSAO Shader
 */



var SSGIShader = {

	uniforms: {
		sceneDiffuse: null,
		sceneDepth: null,
		projMat: new Float32Array(16),
		viewMat: new Float32Array(16),
		projViewMat: new Float32Array(16),
		projectionMatrixInv: new Float32Array(16),
		viewMatrixInv: new Float32Array(16),
		cameraPos: [0, 0, 0],
		resolution: [1024, 512],
		samples: 16,
		time: 0,
	},

	vertexShader: [
		"attribute vec3 a_Position;",
		"attribute vec2 a_Uv;",

		"uniform mat4 u_ProjectionView;",
		"uniform mat4 u_Model;",

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = a_Uv;",

		"	gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

		"}"
	].join("\n"),

	fragmentShader: [
		`
		uniform sampler2D sceneDiffuse;
        uniform sampler2D sceneDepth;
        uniform mat4 projectionMatrixInv;
        uniform mat4 viewMatrixInv;
        uniform mat4 projMat;
        uniform mat4 viewMat;
        uniform mat4 projViewMat;
        uniform vec3 cameraPos;
        uniform vec2 resolution;
        uniform float time;
        uniform float samples;
        varying vec2 vUv;
        highp float linearize_depth(highp float d, highp float zNear,highp float zFar)
        {
            highp float z_n = 2.0 * d - 1.0;
            return 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
        }
        vec3 getWorldPos(float depth, vec2 coord) {
            float z = depth * 2.0 - 1.0;
            vec4 clipSpacePosition = vec4(coord * 2.0 - 1.0, z, 1.0);
            vec4 viewSpacePosition = projectionMatrixInv * clipSpacePosition;
            // Perspective division
            vec4 worldSpacePosition = viewMatrixInv * viewSpacePosition;
            worldSpacePosition.xyz /= worldSpacePosition.w;
            return worldSpacePosition.xyz;
        }
        vec3 computeNormal(vec3 worldPos, vec2 vUv) {
            vec2 downUv = vUv + vec2(0.0, 1.0 / resolution.y);
            vec3 downPos = getWorldPos( texture2D(sceneDepth, downUv).x, downUv).xyz;
            vec2 rightUv = vUv + vec2(1.0 / resolution.x, 0.0);
            vec3 rightPos = getWorldPos(texture2D(sceneDepth, rightUv).x, rightUv).xyz;
            vec2 upUv = vUv - vec2(0.0, 1.0 / resolution.y);
            vec3 upPos = getWorldPos(texture2D(sceneDepth, upUv).x, upUv).xyz;
            vec2 leftUv = vUv - vec2(1.0 / resolution.x, 0.0);;
            vec3 leftPos = getWorldPos(texture2D(sceneDepth, leftUv).x, leftUv).xyz;
            int hChoice;
            int vChoice;
            if (length(leftPos - worldPos) < length(rightPos - worldPos)) {
                hChoice = 0;
            } else {
                hChoice = 1;
            }
            if (length(upPos - worldPos) < length(downPos - worldPos)) {
                vChoice = 0;
            } else {
                vChoice = 1;
            }
            vec3 hVec;
            vec3 vVec;
            if (hChoice == 0 && vChoice == 0) {
                hVec = leftPos - worldPos;
                vVec = upPos - worldPos;
            } else if (hChoice == 0 && vChoice == 1) {
                hVec = leftPos - worldPos;
                vVec = worldPos - downPos;
            } else if (hChoice == 1 && vChoice == 1) {
                hVec = rightPos - worldPos;
                vVec = downPos - worldPos;
            } else if (hChoice == 1 && vChoice == 0) {
                hVec = rightPos - worldPos;
                vVec = worldPos - upPos;
            }
            return normalize(cross(hVec, vVec));
            }
            float rand(float n){
                return fract(sin(n) * 43758.5453123);
            }
            // float rand(vec2 n) { 
            //     return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            // }
        
            float noise(float p){
                float fl = floor(p);
            float fc = fract(p);
                return mix(rand(fl), rand(fl + 1.0), fc);
            }
                
            float noise(vec2 n) {
                const vec2 d = vec2(0.0, 1.0);
            vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
                return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
            }
            highp float random(vec2 co)
            {
                highp float a = 12.9898;
                highp float b = 78.233;
                highp float c = 43758.5453;
                highp float dt= dot(co.xy ,vec2(a,b));
                highp float sn= mod(dt,3.14);
                return fract(sin(sn) * c);
            }
            float seed = 0.0;
            float rand()
            {
                /*float result = fract(sin(seed + mod(time, 1000.0) + dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
                //_Seed += 1.0;
                seed += 1.0;
                return result;*/
                float result = random(vUv + seed / 10.0/* + mod(time / 100.0, 100.0)*/);
                seed += 1.0;
                return result;
            }

            void main() {
            vec4 diffuse = texture2D(sceneDiffuse, vUv);
            diffuse.a = 1.;
            float depth = texture2D(sceneDepth, vUv).x;
            vec3 worldPos = getWorldPos(depth, vUv);
            vec3 normal = computeNormal(worldPos, vUv);
            vec3 occluded = vec3(0.0);
            float factor = 0.0;
            for(float i = 0.0; i < samples; i++) {
                vec3 sampleDirection = normalize(vec3(
                rand() /*rand (vUv.x + vUv.y + i)*/ - 0.5,
                rand() /*rand (vUv.x + vUv.y + i * (i + 1.0))*/ - 0.5,
                rand() /*rand (vUv.x + vUv.y + i * (i + 1.0) * (i + 2.0))*/ - 0.5
                ));
                if (dot(normal, sampleDirection) < 0.0) {
                sampleDirection *= -1.0;
                }
                float radius = 15.0 + (150.0 - 15.0) * (i / samples);
                float moveAmt = rand() * rand() /*rand(vUv.x + vUv.y + i) * rand(2.0 * (vUv.x + vUv.y + i))*/;
                vec3 samplePos = worldPos + radius * moveAmt * sampleDirection;
                vec4 offset = projViewMat * vec4(samplePos, 1.0);
                offset.xyz /= offset.w;
                offset.xyz = offset.xyz * 0.5 + 0.5;
                float sampleDepth = texture2D(sceneDepth, offset.xy).x;
                float distSample =linearize_depth(sampleDepth, 0.1, 1000.0);// length(getWorldPos(sampleDepth, vUv) - cameraPos);
                float distWorld = linearize_depth(offset.z, 0.1, 1000.0);//length(samplePos - cameraPos);
                float rangeCheck = smoothstep(0.0, 1.0, radius / abs(distSample - distWorld));
                vec3 lightPos = getWorldPos(sampleDepth, offset.xy);
                occluded += rangeCheck * texture2D(sceneDiffuse, offset.xy).rgb * max(dot(normal, normalize(lightPos - worldPos)), 0.0) * max(dot(computeNormal(lightPos, offset.xy), normalize(worldPos - lightPos)), 0.0);
                factor += rangeCheck;
            }
            occluded /= factor;
            gl_FragColor = vec4(10.0 * vec3(occluded), 1.0);
            }`
	].join("\n")

}

export { SSGIShader };