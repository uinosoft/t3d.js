import { PlaneGeometry, Mesh, LambertMaterial, MATERIAL_TYPE, cloneUniforms } from 't3d';

// Reference: github.com/IceCreamYou/THREE.Terrains

class Terrain extends Mesh {

	constructor(options = {}) {
		const width = options.width || 1024;
		const height = options.height || 1024;
		const widthSegments = options.widthSegments || 63;
		const heightSegments = options.heightSegments || 63;

		const maxHeight = options.maxHeight || 100;
		const minHeight = options.minHeight || -100;

		const material = options.material || new TerrainMaterial();

		const geometry = new PlaneGeometry(width, height, widthSegments, heightSegments);

		super(geometry, material);

		this.width = width;
		this.height = height;
		this.widthSegments = widthSegments;
		this.heightSegments = heightSegments;

		this.maxHeight = maxHeight;
		this.minHeight = minHeight;

		this.heightmap = options.heightmap;

		this._fromHeightMap();
	}

	// url or image
	_fromHeightMap() {
		const vertices = this.geometry.getAttribute('a_Position').buffer.array;

		const canvas = document.createElement('canvas'),
			context = canvas.getContext('2d'),
			cols = this.widthSegments + 1,
			rows = this.heightSegments + 1,
			spread = this.maxHeight - this.minHeight;

		canvas.width = cols;
		canvas.height = rows;

		context.drawImage(this.heightmap, 0, 0, canvas.width, canvas.height);
		const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const i = row * cols + col, idx = i * 4;
				vertices[i * 3 + 1] = (data[idx] + data[idx + 1] + data[idx + 2]) / 765 * spread + this.minHeight;
			}
		}

		this.geometry.getAttribute('a_Position').buffer.version++;
		this.geometry.computeBoundingBox();
		this.geometry.computeBoundingSphere();
	}

	getHeightAt(x, z) {
		// transform coordinate origin
		x += this.width / 2;
		z += this.height / 2;

		const vertices = this.geometry.getAttribute('a_Position').buffer.array;

		const widthScalar = this.width / this.widthSegments;
		const heightScalar = this.height / this.heightSegments;

		const xS = x / widthScalar;
		const yS = z / heightScalar;

		if (x < 0 || x >= this.width || z < 0 || z >= this.height) {
			console.error('point outside of terrain boundary');
		}

		const ix = Math.floor(xS);
		const iz = Math.floor(yS);

		const rx = xS - ix;
		const rz = yS - iz;

		const wi = this.widthSegments + 1;

		const a = vertices[(iz * wi + ix) * 3 + 1];
		const b = vertices[(iz * wi + (ix + +1)) * 3 + 1];
		const c = vertices[((iz + 1) * wi + (ix + 1)) * 3 + 1];
		const d = vertices[((iz + 1) * wi + ix) * 3 + 1];

		// Interpolate
		const e = (a * (1 - rx) + b * rx);
		const f = (c * rx + d * (1 - rx));
		const y = (e * (1 - rz) + f * rz);

		return y;
	}

}

class TerrainMaterial extends LambertMaterial {

	constructor() {
		super();
		this.type = MATERIAL_TYPE.SHADER;
		this.shaderName = terrainShader.name;
		this.vertexShader = terrainShader.vertexShader;
		this.fragmentShader = terrainShader.fragmentShader;
		this.uniforms = cloneUniforms(terrainShader.uniforms);
	}

}

const terrainShader = {
	name: 'terrain',
	uniforms: {
		texture_0: null,
		texture_1: null,
		texture_2: null,
		texture_3: null,
		texture_4: null
	},
	vertexShader: `
		#define USE_UV1

		varying vec2 MyvUv;
		varying vec3 vPosition;
		varying vec3 myNormal;
		
		#include <common_vert>
		#include <normal_pars_vert>
		#include <uv_pars_vert>
		#include <color_pars_vert>
		#include <modelPos_pars_vert>
		#include <aoMap_pars_vert>
		#include <shadowMap_pars_vert>
		#include <logdepthbuf_pars_vert>
		void main() {
			#include <begin_vert>
			#include <pvm_vert>
			#include <normal_vert>
			#include <logdepthbuf_vert>
		
			MyvUv = a_Uv;
			vPosition = a_Position;
			myNormal = a_Normal;
		
			#include <uv_vert>
		
			#include <color_vert>
			#include <modelPos_vert>
			#include <aoMap_vert>
			#include <shadowMap_vert>
		}
	`,
	fragmentShader: `
		varying vec2 MyvUv;
		varying vec3 vPosition;
		varying vec3 myNormal;

		uniform sampler2D texture_0;
		uniform sampler2D texture_1;
		uniform sampler2D texture_2;
		uniform sampler2D texture_3;
		uniform sampler2D texture_4;

		#include <common_frag>
		#include <dithering_pars_frag>

		uniform vec3 emissive;

		#include <uv_pars_frag>
		#include <color_pars_frag>
		#include <diffuseMap_pars_frag>
		#include <alphaTest_pars_frag>
		#include <normalMap_pars_frag>
		#include <bumpMap_pars_frag>
		#include <light_pars_frag>
		#include <normal_pars_frag>
		#include <modelPos_pars_frag>
		#include <bsdfs>
		#include <aoMap_pars_frag>
		#include <shadowMap_pars_frag>
		#include <fog_pars_frag>
		#include <logdepthbuf_pars_frag>
		void main() {
			#include <logdepthbuf_frag>
			#include <begin_frag>
			#include <color_frag>

			float slope = acos(max(min(dot(myNormal, vec3(0.0, 1.0, 0.0)), 1.0), -1.0));
			vec4 color = texture2D( texture_0, MyvUv * vec2( 1.0, 1.0 ) + vec2( 0.0, 0.0 ) ); // base
			
			color = mix( texture2D( texture_1, MyvUv * vec2( 1.0, 1.0 ) + vec2( 0.0, 0.0 ) ), color, max(min(1.0 - smoothstep(-80.0, -35.0, vPosition.y) + smoothstep(20.0, 50.0, vPosition.y), 1.0), 0.0));
			color = mix( texture2D( texture_2, MyvUv * vec2( 1.0, 1.0 ) + vec2( 0.0, 0.0 ) ), color, max(min(1.0 - smoothstep(20.0, 50.0, vPosition.y) + smoothstep(60.0, 85.0, vPosition.y), 1.0), 0.0));
			color = mix( texture2D( texture_3, MyvUv * vec2( 1.0, 1.0 ) + vec2( 0.0, 0.0 ) ), color, max(min(1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.y), 1.0), 0.0));
			color = mix( texture2D( texture_4, MyvUv * vec2( 1.0, 1.0 ) + vec2( 0.0, 0.0 ) ), color, max(min(slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2, 1.0), 0.0));
			outColor *= color;

			#include <alphaTest_frag>
			#include <normal_frag>

			ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
			#include <light_frag>
			#include <aoMap_frag>
			outColor.xyz = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;

			#include <shadowMap_frag>

			vec3 totalEmissiveRadiance = emissive;
			outColor.xyz += totalEmissiveRadiance;

			#include <end_frag>
			#include <encodings_frag>
			#include <premultipliedAlpha_frag>
			#include <fog_frag>
			#include <dithering_frag>
		}
	`
};

export { Terrain };