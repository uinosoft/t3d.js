import {
	PlaneGeometry,
	Attribute,
	Buffer,
	Mesh,
	ShaderMaterial,
	DRAW_SIDE
} from 't3d';

class LayeredVolumeMesh extends Mesh {

	constructor(options = {}) {
		const layer = options.layer || 10;
		const layers = [];
		for (let i = 0; i < layer; i++) {
			layers.push(i / (layer - 1));
		}

		const geometry = new PlaneGeometry();
		geometry.instanceCount = layer;

		const volumeLayerAttribute = new Attribute(new Buffer(new Float32Array(layers), 1));
		volumeLayerAttribute.divisor = 1;
		geometry.addAttribute('a_VolumeLayer', volumeLayerAttribute);

		const material = new ShaderMaterial(LayeredVolumeShader);
		material.transparent = true;
		material.depthTest = false;
		material.side = DRAW_SIDE.DOUBLE;
		material.uniforms.densityTexture = options.densityTexture || null;
		material.uniforms.platteTexture = options.platteTexture || null;
		material.uniforms.volumeDepth = options.depth || 1;
		material.uniforms.diskSize = options.diskSize || 0.018;
		material.uniforms.diskSpacing = options.diskSpacing || 0.002;

		super(geometry, material);

		this.scale.set(options.width || 1, 1, options.height || 1);

		this.frustumCulled = false;
	}

}

const LayeredVolumeShader = {
	name: 'layered_volume',

	defines: {
		'LAYER_RANDOM': 0.01
	},

	uniforms: {
		densityTexture: null,
		platteTexture: null,
		volumeDepth: 1,
		diskSize: 0.018,
		diskSpacing: 0.002
	},

	vertexShader: `
		#include <common_vert>

		attribute vec2 a_Uv;
		attribute float a_VolumeLayer;

		uniform float volumeDepth;

		varying vec2 v_Uv;
		varying float v_VolumeLayer;

		void main() {
			vec3 position = a_Position.xyz;
			position.y = volumeDepth * a_VolumeLayer;
			gl_Position = u_ProjectionView * u_Model * vec4(position, 1.0);

			v_Uv = a_Uv;
			v_VolumeLayer = a_VolumeLayer;
		}
	`,

	fragmentShader: `
		precision highp sampler3D;

		uniform sampler3D densityTexture;
		uniform sampler2D platteTexture;

		uniform float u_Opacity;

		uniform float diskSize;
		uniform float diskSpacing;

		varying vec2 v_Uv;
		varying float v_VolumeLayer;

        void main() {
			vec2 uv = v_Uv;
			#ifdef LAYER_RANDOM
				uv += sin(v_VolumeLayer * 43758.5453123) * vec2(LAYER_RANDOM);
			#endif

			float gridSize = diskSize + diskSpacing;
			vec2 diskCenter = (floor(uv / gridSize) + 0.5) * gridSize;
            float diskMask = 1.0 - step(diskSize * 0.5, length(uv - diskCenter));

			float intensity = texture(densityTexture, vec3(diskCenter, 1. - v_VolumeLayer)).r;
            vec4 color = texture2D(platteTexture, vec2(intensity, 0.5));
            float finalOpacity = intensity * u_Opacity * diskMask;

            gl_FragColor = vec4(color.rgb , finalOpacity);
		}
    `
};

export { LayeredVolumeMesh, LayeredVolumeShader };