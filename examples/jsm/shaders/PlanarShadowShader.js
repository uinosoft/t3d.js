const PlanarShadowShader = {
	name: 'planar_shadow',
	defines: {},
	uniforms: {
		lightDir: [1, 1, 1],
		shadowColor: [0, 0, 0],
		shadowFalloff: 0.02,
		height: 0.1
	},
	vertexShader: `
        attribute vec3 a_Position;

        uniform mat4 u_ProjectionView;
        uniform mat4 u_Model;

        uniform vec3 lightDir;
        uniform vec3 shadowColor;
        uniform float shadowFalloff;
        uniform float height;

        varying vec4 v_Color;

        vec3 shadowProjectPos(vec4 pos) {
            vec3 worldPos = (u_Model * pos).xyz;

            vec3 shadowPos;

            vec3 lightDir = normalize(lightDir);

            shadowPos.xz = worldPos.xz - lightDir.xz * max(0.0, worldPos.y - height) / lightDir.y;
            shadowPos.y = min(worldPos.y, height);

            return shadowPos;
        }

        void main() {
            vec4 position = vec4(a_Position, 1.0);
            vec3 shadowPos = shadowProjectPos(position);
            vec3 center = vec3(u_Model[3].x, height, u_Model[3].z);
            float falloff =  1.0 - clamp(distance(shadowPos , center) * shadowFalloff, 0.0, 1.0);

            v_Color = vec4(shadowColor, falloff);

            gl_Position = u_ProjectionView * vec4(shadowPos, 1.0);
        }
    `,
	fragmentShader: `
        varying vec4 v_Color;

        void main() {
            gl_FragColor = v_Color;
        }

    `
};

export { PlanarShadowShader };