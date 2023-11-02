import { ShaderPostPass } from 't3d';

class GBufferDebugger {

	constructor() {
		this._debugPass = new ShaderPostPass(debugShader);
	}

	render(renderer, gBuffer, type = DebugTypes.Normal) {
		const debugPass = this._debugPass;
		const gBufferRenderStates = gBuffer.getCurrentRenderStates();

		debugPass.uniforms.debug = type;
		debugPass.uniforms.textureA = gBuffer.getTextureA();
		debugPass.uniforms.textureB = gBuffer.getTextureB();
		debugPass.uniforms.textureC = gBuffer.getTextureC();
		debugPass.uniforms.depthTexture = gBuffer.getDepthTexture();
		gBufferRenderStates.camera.projectionViewMatrix.toArray(debugPass.uniforms.projectionView);

		debugPass.render(renderer);
	}

}

const DebugTypes = {
	Normal: 0,
	Metalness: 1,
	Roughness: 2,
	Depth: 3,
	Position: 4,
	Albedo: 5,
	Emissive: 6
};

GBufferDebugger.DebugTypes = DebugTypes;

const debugShader = {
	name: 'gbuffer_debug',
	defines: {},
	uniforms: {
		debug: 0,

		textureA: null,
		textureB: null,
		textureC: null,
		depthTexture: null,

		projectionView: new Float32Array(16)
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
        uniform int debug;

        uniform sampler2D textureA;
		uniform sampler2D textureB;
		uniform sampler2D textureC;
		uniform sampler2D depthTexture;

        uniform mat4 projectionView;

        varying vec2 v_Uv;

        vec3 octahedronToUnitVector(vec2 p) {
			vec3 v = vec3(p, 1.0 - dot(vec2(1.0), abs(p)));
			if (v.z < 0.0) v.xy = (1.0 - abs(v.yx)) * sign(v.xy);
			return normalize(v);
		}

        vec3 unpackBaseColor(vec3 packedColors) {
            vec3 baseColor;
            baseColor.r = float(int(packedColors.r) >> 8) / 255.0;
            baseColor.g = float(int(packedColors.g) >> 8) / 255.0;
            baseColor.b = float(int(packedColors.b) >> 8) / 255.0;
            return baseColor;
        }
        
        vec3 unpackEmissiveColor(vec3 packedColors) {
            vec3 emissiveColor;
            emissiveColor.r = float(int(packedColors.r) & 255) / 255.0;
            emissiveColor.g = float(int(packedColors.g) & 255) / 255.0;
            emissiveColor.b = float(int(packedColors.b) & 255) / 255.0;
            return emissiveColor;
        }

		void main() {
            vec2 texCoord = v_Uv;

            vec4 texelA = texture2D(textureA, texCoord);

            if (dot(texelA.xy, vec2(1.0)) == 0.0) {
                discard;
            }

            vec3 normal = octahedronToUnitVector(texelA.xy);

            float metalness = texelA.z;
            float roughness = texelA.w;

            float depth = texture2D(depthTexture, texCoord).r;
            
            vec2 xy = texCoord * 2.0 - 1.0;
            float z = depth * 2.0 - 1.0;
            vec4 projectedPos = vec4(xy, z, 1.0);
			vec4 p4 = inverse(projectionView) * projectedPos;
			vec3 position = p4.xyz / p4.w;

            vec4 texelB = texture2D(textureB, texCoord);

            vec3 albedo = unpackBaseColor(texelB.xyz);
            vec3 emissive = unpackEmissiveColor(texelB.xyz);

            if (debug == 0) {
                gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
            } else if (debug == 1) {
				gl_FragColor = vec4(vec3(metalness), 1.0);
			} else if (debug == 2) {
				gl_FragColor = vec4(vec3(roughness), 1.0);
			} else if (debug == 3) {
                gl_FragColor = vec4(vec3(depth), 1.0);
            } else if (debug == 4) {
				gl_FragColor = vec4(position, 1.0);
			} else if (debug == 5) {
				gl_FragColor = vec4(albedo, 1.0);
			} else if (debug == 6) {
				gl_FragColor = vec4(emissive, 1.0);
			}
        }
    `
};

export { GBufferDebugger };