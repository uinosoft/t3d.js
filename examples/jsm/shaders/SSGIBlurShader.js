/**
 * SSAO Shader
 */



var SSGIBlurShader = {
	defines: { DEBUG: false },

	uniforms: {
		sceneDiffuse: null,
		sceneDepth: null,
		tDiffuse: null,
		projMat: new Float32Array(16),
		viewMat: new Float32Array(16),
		projViewMat: new Float32Array(16),
		projectionMatrixInv: new Float32Array(16),
		viewMatrixInv: new Float32Array(16),
		cameraPos: [0, 0, 0],
		resolution: [1024, 512],
		time: 0,
		strength: 3.0,
		quality: 6.0,
		blur: 30,
		length: 5.0,
		debug: true
	},

	vertexShader: [
		"attribute vec3 a_Position;",
		"attribute vec2 a_Uv;",

		"uniform mat4 u_ProjectionView;",
		"uniform mat4 u_Model;",

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = a_Uv;",

		"	gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0 );",

		"}"
	].join("\n"),

	fragmentShader: [
		`
        uniform sampler2D sceneDiffuse;
        uniform sampler2D sceneDepth;
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float blur;
        uniform float strength;
        uniform float quality;
        uniform float length;

        varying vec2 vUv;
        highp float linearize_depth(highp float d, highp float zNear,highp float zFar)
        {
            highp float z_n = 2.0 * d - 1.0;
            return 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
        }
        void main() {
            const float directions = 16.0;
            const float pi = 3.14159;
            float size = blur;//1000.0 * (1.0 - texture2D(sceneDepth, vUv).x);
            vec2 radius = vec2(size) / resolution;
            vec3 texel = texture2D(tDiffuse, vUv).rgb;
            float count = 0.0;
            float initialDepth = linearize_depth(texture2D(sceneDepth, vUv).x, 0.1, 1000.0);
            for(float d =0.0; d < pi * 2.0; d+=(pi * 2.0) / directions) {
                for(float i = 1.0/quality; i<=1.0; i+=1.0/quality) {
                    vec2 sampleUv = vUv+vec2(cos(d), sin(d)) * radius * i;
                    if (abs(linearize_depth(texture2D(sceneDepth, sampleUv).x, 0.1, 1000.0) - initialDepth) < length) {
                        texel += texture2D(tDiffuse, sampleUv).rgb;
                        count += 1.0;
                    }
                }
            }
            texel /= count;
            if (abs(vUv.x - 0.0) <= 1.0 / resolution.x) {
                gl_FragColor = vec4(1.0);
            } else if (vUv.x < 0.0) {
                gl_FragColor = vec4(texture2D(sceneDiffuse, vUv).rgb, 1.0);
            } else {
                gl_FragColor = vec4(texture2D(sceneDiffuse, vUv).rgb + strength * texel.rgb * texture2D(sceneDiffuse, vUv).rgb, 1.0);
            }
            #ifdef DEBUG
				gl_FragColor = texture2D(tDiffuse, vUv);
			#endif
        }`
	].join("\n")

}

export { SSGIBlurShader };