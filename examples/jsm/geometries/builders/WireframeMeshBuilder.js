import { BasicMaterial, Texture2D, MATERIAL_TYPE, TEXTURE_FILTER, PIXEL_TYPE, ShaderLib } from 't3d';

/**
 * WireframeMeshBuilder
 */
const MAX_TEXTURE_ROWS = 512;
const WireframeMeshBuilder = {
	getMeshData: function(mesh) {
		const geometry = mesh.geometry;
		const positions = geometry.attributes.a_Position.buffer.array;

		const positionMap = creatTexture(positions, 3);
		const index = geometry.index.buffer.array;

		const indexMap = creatTexture(index, 3);
		let skinIndexMap;
		let skinWeightMap;
		if (geometry.attributes.skinIndex) {
			const skinIndex = geometry.attributes.skinIndex.buffer.array;
			skinIndexMap = creatTexture(skinIndex, 4);
		}
		if (geometry.attributes.skinWeight) {
			const skinWeight = geometry.attributes.skinWeight.buffer.array;
			skinWeightMap = creatTexture(skinWeight, 4);
		}

		if (index.length > 65536) {
			geometry.index.buffer.array = new Uint32Array(index.length);
		} else {
			geometry.index.buffer.array = new Uint16Array(index.length);
		}

		// Fill an array with continuous integers from 0 to N-1
		for (let i = 0; i < index.length; i++) {
			geometry.index.buffer.array[i] = i;
		}

		const material = new BasicMaterial();

		material.uniforms = {
			positionMap: positionMap,
			indexMap: indexMap,
			skinIndexMap: skinIndexMap,
			skinWeightMap: skinWeightMap,
			time: 0,
			thickness: 0.01,
			secondThickness: 0.05,
			dashRepeats: 2,
			dashLength: 0.55,
			dashOverlap: true,
			dashEnabled: false,
			dashAnimate: false,
			seeThrough: true,
			insideAltColor: true,
			dualStroke: false,
			noiseA: false,
			noiseB: false,
			squeeze: false,
			removeEdge: false,
			squeezeMin: 0.1,
			squeezeMax: 1.0,
			stroke: [0.1255, 0.1255, 0.1255],
			fill: [0.7725, 0.7725, 0.7725]

		};
		material.fragmentShader = fragmentShader;
		material.vertexShader = vertexShader;
		material.type = MATERIAL_TYPE.SHADER;
		material.transparent = true;
		mesh.material = material;
	}

};
function creatTexture(data, type = 3) {
	const vertexCount = data.length / type;
	const width = MAX_TEXTURE_ROWS;
	const height = Math.ceil(vertexCount / MAX_TEXTURE_ROWS);
	const newPositions = new Float32Array(width * height * 4);
	for (let i = 0; i < vertexCount; i++) {
		const index = i * type;
		const subarray = data.subarray(index, index + type);
		const offset = i * 4;
		newPositions.set(subarray, offset);
		if (type === 3) {
			if (i % 3 === 2) {
				newPositions.fill(0, offset + 3, offset + 4); // Insert the number zero after every three numbers
			}
		}
	}
	const image = { data: newPositions, width: width, height: height };
	const texture = new Texture2D();
	texture.generateMipmaps = false;
	texture.magFilter = TEXTURE_FILTER.LINEAR;
	texture.minFilter = TEXTURE_FILTER.LINEAR;
	texture.flipY = false;
	texture.image = image;
	texture.type = PIXEL_TYPE.FLOAT;
	return texture;
}
let fragmentShader = ShaderLib.pbr_frag;
// pars
fragmentShader = fragmentShader.replace('#include <clippingPlanes_pars_frag>', `
    #include <clippingPlanes_pars_frag>
	uniform float time;
	uniform float thickness;
	uniform float secondThickness;
	uniform float dashRepeats;
	uniform float dashLength;
	uniform bool dashOverlap;
	uniform bool dashEnabled;
	uniform bool dashAnimate;
	uniform bool seeThrough;
	uniform bool insideAltColor;
	uniform bool dualStroke;
	uniform bool noiseA;
	uniform bool noiseB;
	uniform bool squeeze;
	uniform float squeezeMin;
	uniform float squeezeMax;
	uniform vec3 stroke;
	uniform vec3 fill;
    uniform sampler2D positionMap;
	varying vec3 v_baryCenter;
	varying vec3 v_pos;

	vec4 mod289(vec4 x) {
		return x - floor(x * (1.0 / 289.0)) * 289.0;
	}
	float mod289(float x) {
		return x - floor(x * (1.0 / 289.0)) * 289.0;
	}
	vec4 permute(vec4 x) {
		return mod289(((x*34.0)+1.0)*x);
	}
	float permute(float x) {
		return mod289(((x*34.0)+1.0)*x);
	}
	vec4 taylorInvSqrt(vec4 r) {
		return 1.79284291400159 - 0.85373472095314 * r;
	}
	float taylorInvSqrt(float r) {
		return 1.79284291400159 - 0.85373472095314 * r;
	}
	vec4 grad4(float j, vec4 ip) {
		const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
		vec4 p, s;
		p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
		p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
		s = vec4(lessThan(p, vec4(0.0)));
		p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;
		return p;
	}
	// (sqrt(5) - 1)/4 = F4, used once below
	#define F4 0.309016994374947451
	
	float snoise(vec4 v) {
		const vec4  C = vec4( 0.138196601125011, // (5 - sqrt(5))/20  G4
		0.276393202250021, // 2 * G4
		0.414589803375032, // 3 * G4
		-0.447213595499958); // -1 + 4 * G4
		
		
		// First corner
		vec4 i = floor(v + dot(v, vec4(F4)) );
		vec4 x0 = v -   i + dot(i, C.xxxx);
		
		// Other corners
		
		
		// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
		vec4 i0;
		vec3 isX = step( x0.yzw, x0.xxx );
		vec3 isYZ = step( x0.zww, x0.yyz );
		//  i0.x = dot( isX, vec3( 1.0 ) );
		
		i0.x = isX.x + isX.y + isX.z;
		i0.yzw = 1.0 - isX;
		//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
		
		i0.y += isYZ.x + isYZ.y;
		i0.zw += 1.0 - isYZ.xy;
		i0.z += isYZ.z;
		i0.w += 1.0 - isYZ.z;
		
		// i0 now contains the unique values 0, 1, 2, 3 in each channel
		
		vec4 i3 = clamp( i0, 0.0, 1.0 );
		vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
		vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );
		
		//  x0 = x0 - 0.0 + 0.0 * C.xxxx
		
		//  x1 = x0 - i1  + 1.0 * C.xxxx
		//  x2 = x0 - i2  + 2.0 * C.xxxx
		//  x3 = x0 - i3  + 3.0 * C.xxxx
		//  x4 = x0 - 1.0 + 4.0 * C.xxxx
		vec4 x1 = x0 - i1 + C.xxxx;
		vec4 x2 = x0 - i2 + C.yyyy;
		vec4 x3 = x0 - i3 + C.zzzz;
		vec4 x4 = x0 + C.wwww;
		
		// Permutations
		
		i = mod289(i);
		float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
		vec4 j1 = permute( permute( permute( permute (
		i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
		+ i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
		+ i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
		+ i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
		
		// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
		
		// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
		vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;
		vec4 p0 = grad4(j0, ip);
		vec4 p1 = grad4(j1.x, ip);
		vec4 p2 = grad4(j1.y, ip);
		vec4 p3 = grad4(j1.z, ip);
		vec4 p4 = grad4(j1.w, ip);
		
		// Normalise gradients
		
		vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
		p0 *= norm.x;
		p1 *= norm.y;
		p2 *= norm.z;
		p3 *= norm.w;
		p4 *= taylorInvSqrt(dot(p4, p4));
		
		// Mix contributions from the five corners
		
		vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
		vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)            ), 0.0);
		m0 = m0 * m0;
		m1 = m1 * m1;
		return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
		+ dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;
	}
	
	// This is like
	
	float aastep (float threshold, float dist) {
		float afwidth = fwidth(dist) * 0.5;
		return smoothstep(threshold - afwidth, threshold + afwidth, dist);
	}
	// This function is not currently used, but it can be useful
	// to achieve a fixed width wireframe regardless of z-depth
	float computeScreenSpaceWireframe (vec3 barycentric, float lineWidth) {
		vec3 dist = fwidth(barycentric);
		vec3 smoothed = smoothstep(dist * ((lineWidth * 0.5) - 0.5), dist * ((lineWidth * 0.5) + 0.5), barycentric);
		return 1.0 - min(min(smoothed.x, smoothed.y), smoothed.z);
	}
	// This function returns the fragment color for our styled wireframe effect
	// based on the barycentric coordinates for this fragment
	vec4 getStyledWireframe (vec3 barycentric) {
		// this will be our signed distance for the wireframe edge
		float d = min(min(barycentric.x, barycentric.y), barycentric.z);
		
		// we can modify the distance field to create interesting effects & masking
		
		float noiseOff = 0.0;
		if (noiseA) noiseOff += snoise(vec4(v_pos.xyz * 1.0, time * 0.35)) * 0.15;
		if (noiseB) noiseOff += snoise(vec4(v_pos.xyz * 80.0, time * 0.5)) * 0.12;
		d += noiseOff;
		
		// for dashed rendering, we can use this to get the 0 .. 1 value of the line length
		
		float positionAlong = max(barycentric.x, barycentric.y);
		if (barycentric.y < barycentric.x && barycentric.y < barycentric.z) {
			positionAlong = 1.0 - positionAlong;
		}
		// the thickness of the stroke
		float computedThickness = thickness;
		
		// if we want to shrink the thickness toward the center of the line segment
		
		if (squeeze) {
			computedThickness *= mix(squeezeMin, squeezeMax, (1.0 - sin(positionAlong * PI)));
		}
		// if we should create a dash pattern
		if (dashEnabled) {
			// here we offset the stroke position depending on whether it
			// should overlap or not
			float offset = 1.0 / dashRepeats * dashLength / 2.0;
			if (!dashOverlap) {
				offset += 1.0 / dashRepeats / 2.0;
			}
			// if we should animate the dash or not
			if (dashAnimate) {
				offset += time * 0.22;
			}
			// create the repeating dash pattern
			float pattern = fract((positionAlong + offset) * dashRepeats);
			computedThickness *= 1.0 - aastep(dashLength, pattern);
		}
		// compute the anti-aliased stroke edge  
		float edge = 1.0 - aastep(computedThickness, d);
		
		// now compute the final color of the mesh
		
		vec4 outColor = vec4(0.0);
		if (seeThrough) {
			outColor = vec4(stroke, edge);
			if (insideAltColor && !gl_FrontFacing) {
				outColor.rgb = fill;
			}
	
		}
		else {
			vec3 mainStroke = mix(fill, stroke, edge);
			outColor.a = 1.0;
			if (dualStroke) {
				float inner = 1.0 - aastep(secondThickness, d);
				vec3 wireColor = mix(fill, stroke, abs(inner - edge));
				outColor.rgb = wireColor;
			}
			else {
				outColor.rgb = mainStroke;
			}
	
		}
		return outColor;
	}

`);
// frag code
fragmentShader = fragmentShader.replace('#include <end_frag>', `
#include <end_frag>
gl_FragColor = getStyledWireframe(v_baryCenter);

`);

let vertexShader = ShaderLib.pbr_vert;
// pars
vertexShader = vertexShader.replace('#include <logdepthbuf_pars_vert>', `
			#include <logdepthbuf_pars_vert>
			uniform sampler2D positionMap;
			uniform sampler2D indexMap;
			uniform sampler2D skinIndexMap;
			uniform sampler2D skinWeightMap;
			uniform bool removeEdge;
			varying vec3 v_baryCenter;
			varying vec3 v_pos;
		`);
// vert code
vertexShader = vertexShader.replace('#include <begin_vert>', `
			#include <begin_vert>
			int pixelX = (gl_VertexID / 3 % 512) ;
			int pixelY =  gl_VertexID  / 512 / 3;
			int triangleIndex = gl_VertexID  % 3 ;
			ivec3 index = ivec3(texelFetch(indexMap, ivec2(pixelX, pixelY), 0).rgb);
			int ddzz = index[triangleIndex];
	
			int pixelX2 = ddzz % 512  ;
			int pixelY2 = ddzz / 512  ;
			vec3 poss = texelFetch(positionMap, ivec2(pixelX2 , pixelY2),0).rgb;
			transformed = vec3(poss);
			int subIndex = gl_VertexID % 3;
			v_baryCenter = vec3(0.0, removeEdge ,.0);
			v_baryCenter[subIndex] = 1.0;
			transformed = vec3(poss);
			v_pos = transformed;

		`);


vertexShader = vertexShader.replace('#include <skinning_vert>', `
			#ifdef USE_SKINNING
			vec4 mapSkinIndex = texelFetch(skinIndexMap,ivec2(pixelX2, pixelY2),0);
			mat4 boneMatX = getBoneMatrix( mapSkinIndex.x );
			mat4 boneMatY = getBoneMatrix( mapSkinIndex.y );
			mat4 boneMatZ = getBoneMatrix( mapSkinIndex.z );
			mat4 boneMatW = getBoneMatrix( mapSkinIndex.w );

			vec4 skinVertex = bindMatrix * vec4(transformed, 1.0);

			vec4 skinned = vec4( 0.0 );
			vec4 mapSkinWeight = texelFetch(skinWeightMap,ivec2(pixelX2, pixelY2),0);

			skinned += boneMatX * skinVertex * mapSkinWeight.x;
			skinned += boneMatY * skinVertex * mapSkinWeight.y;
			skinned += boneMatZ * skinVertex * mapSkinWeight.z;
			skinned += boneMatW * skinVertex * mapSkinWeight.w;
			skinned = bindMatrixInverse * skinned;

			transformed = skinned.xyz / skinned.w;
			v_pos = transformed;

#endif`);
export { WireframeMeshBuilder };