
import {
	Mesh,
	PlaneGeometry
} from 't3d';
import { ShaderLib, PBRMaterial, MATERIAL_TYPE, DepthMaterial }	from 't3d';

// https://github.com/agargaro/octahedral-impostor
export class OctahedralImpostor extends Mesh {

	constructor() {
		super(new PlaneGeometry(), new OctahedralImpostorMaterial());
		this.frustumCulled = false;
	}

}

export class OctahedralImpostorMaterial extends PBRMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'oct_impostor_pbr';

		this.vertexShader = vertexShader;
		this.fragmentShader = fragmentShader;

		this.defines.EZ_USE_HEMI_OCTAHEDRON = true;
		this.uniforms.impostorTransform = new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);

		this.uniforms.spritesPerSide = 32;
		this.uniforms.alphaClamp = 0.5;
		this.uniforms.octahedralWeightSharpness = 1.5;
	}

}
let fragmentShader = ShaderLib.pbr_frag;
let vertexShader = ShaderLib.pbr_vert;

const octahedral_pars_vert = `
	#if defined USE_INSTANCING
		attribute mat4 instanceMatrix;
	#endif

	uniform mat4 impostorTransform;
	uniform float spritesPerSide;

	varying vec2 vSpriteUV1;
	varying vec2 vSpriteUV2;
	varying vec2 vSpriteUV3;
	varying mat4 v_normalMatrix;

	flat varying vec4 vSpritesWeight;
	flat varying vec2 vSprite1;
	flat varying vec2 vSprite2;
	flat varying vec2 vSprite3;

	vec2 encodeDirection(vec3 direction) {
		#ifdef EZ_USE_HEMI_OCTAHEDRON
			vec3 octahedron = direction / dot(direction, sign(direction));
			return vec2(1.0 + octahedron.x + octahedron.z, 1.0 + octahedron.z - octahedron.x) * 0.5;
		#else
			// TODO: Implement full octahedral encoding
		#endif
	}

	vec3 decodeDirection(vec2 gridIndex, vec2 spriteCountMinusOne) {
		vec2 gridUV = gridIndex / spriteCountMinusOne;
		#ifdef EZ_USE_HEMI_OCTAHEDRON
			vec3 position = vec3(gridUV.x - gridUV.y, 0.0, -1.0 + gridUV.x + gridUV.y);
			position.y = 1.0 - abs(position.x) - abs(position.z);
		#else
			// TODO: Implement full octahedral decoding
		#endif
		return normalize(position);
	}

	void computePlaneBasis(vec3 normal, out vec3 tangent, out vec3 bitangent) {
		vec3 up = vec3(0.0, 1.0, 0.0);
		if(normal.y > 0.9999)
			up = vec3(-1.0, 0.0, 0.0);
		#ifndef EZ_USE_HEMI_OCTAHEDRON
			if(normal.y < -0.9999)
				up = vec3(1.0, 0.0, 0.0);
		#endif
		tangent = normalize(cross(up, normal));
		bitangent = cross(normal, tangent);
	}

	vec3 projectVertex(vec3 normal) {
		vec3 x, y;
		computePlaneBasis(normal, x, y);
		return x * a_Position.z + y * a_Position.x;
	}

	void computeSpritesWeight(vec2 gridFract) {
		vSpritesWeight = vec4(min(1.0 - gridFract.x, 1.0 - gridFract.y), abs(gridFract.x - gridFract.y), min(gridFract.x, gridFract.y), ceil(gridFract.x - gridFract.y));
	}

	vec2 projectToPlaneUV(vec3 normal, vec3 tangent, vec3 bitangent, vec3 cameraPosition, vec3 viewDir) {
		float denom = dot(viewDir, normal);
		float t = -dot(cameraPosition, normal) / denom;
		vec3 hit = cameraPosition + viewDir * t;
		vec2 uv = vec2(dot(tangent, hit), dot(bitangent, hit));
		return uv + 0.5;
	}

	vec3 projectDirectionToBasis(vec3 dir, vec3 normal, vec3 tangent, vec3 bitangent) {
		return vec3(dot(dir, tangent), dot(dir, bitangent), dot(dir, normal));
	}
`;

const octahedral_vertex = `
	vec2 spritesMinusOne = vec2(spritesPerSide - 1.0);

	#if defined USE_INSTANCING
		mat4 transformedInstanceMatrix = instanceMatrix;
		vec3 cameraPosLocal = (inverse(transformedInstanceMatrix * u_Model) * vec4(u_CameraPosition, 1.0)).xyz;
	#else
		vec3 cameraPosLocal = (inverse( u_Model) * vec4(u_CameraPosition, 1.0)).xyz;
	#endif
	vec3 cameraDir = normalize(cameraPosLocal);
	vec3 projectedVertex = projectVertex(cameraDir);
	vec3 viewDirLocal = normalize(projectedVertex - cameraPosLocal);
	vec2 grid = encodeDirection(cameraDir) * spritesMinusOne;
	vec2 gridFloor = min(floor(grid), spritesMinusOne);
	vec2 gridFract = fract(grid);
	computeSpritesWeight(gridFract);

	vSprite1 = gridFloor;
	vSprite2 = min(vSprite1 + mix(vec2(0.0, 1.0), vec2(1.0, 0.0), vSpritesWeight.w), spritesMinusOne);
	vSprite3 = min(vSprite1 + vec2(1.0), spritesMinusOne);

	vec3 spriteNormal1 = decodeDirection(vSprite1, spritesMinusOne);
	vec3 spriteNormal2 = decodeDirection(vSprite2, spritesMinusOne);
	vec3 spriteNormal3 = decodeDirection(vSprite3, spritesMinusOne);

	vec3 planeX1, planeY1, planeX2, planeY2, planeX3, planeY3;
	computePlaneBasis(spriteNormal1, planeX1, planeY1);
	computePlaneBasis(spriteNormal2, planeX2, planeY2);
	computePlaneBasis(spriteNormal3, planeX3, planeY3);

	vSpriteUV1 = projectToPlaneUV(spriteNormal1, planeX1, planeY1, cameraPosLocal, viewDirLocal);
	vSpriteUV2 = projectToPlaneUV(spriteNormal2, planeX2, planeY2, cameraPosLocal, viewDirLocal);
	vSpriteUV3 = projectToPlaneUV(spriteNormal3, planeX3, planeY3, cameraPosLocal, viewDirLocal);

	vec4 mvPosition = vec4(projectedVertex, 1.0);

	#if defined USE_INSTANCING
		mvPosition = transformedInstanceMatrix * impostorTransform * mvPosition;
	#else
		mvPosition = impostorTransform * mvPosition;
	#endif

	transformed = mvPosition.xyz;
	vec4 worldPosition = u_Model * vec4(transformed, 1.0);
	v_normalMatrix = inverse(u_View);
	gl_Position = u_ProjectionView * worldPosition;
`;

const octahedral_pars_frag = `
	uniform float spritesPerSide;
	uniform float alphaClamp;
	uniform float octahedralWeightSharpness;
	uniform mat4 transformedInstanceMatrix;
	uniform mat4 impostorTransform;

	flat varying vec4 vSpritesWeight;
	flat varying vec2 vSprite1;
	flat varying vec2 vSprite2;
	flat varying vec2 vSprite3;

	varying vec2 vSpriteUV1;
	varying vec2 vSpriteUV2;
	varying vec2 vSpriteUV3;
	varying mat4 v_normalMatrix;

	vec3 octahedronToUnitVector(vec2 p) {
		vec3 v = vec3(p.x, 1.0 - dot(abs(p), vec2(1.0)), p.y);
		v.xz = mix(v.xz, (1.0 - abs(v.zx)) * sign(v.xz), step(0.0, -v.y));
		return normalize(v);
	}

	vec3 blendNormals(vec2 uv1, vec2 uv2, vec2 uv3, out vec2 roughnessMetalness) {
		vec4 value1 = texture2D(normalMap, uv1);
		vec4 value2 = texture2D(normalMap, uv2);
		vec4 value3 = texture2D(normalMap, uv3);
		vec3 normal1 = octahedronToUnitVector(value1.rg * 2.0 - 1.0); // we're reading twice if parallax enabled
		vec3 normal2 = octahedronToUnitVector(value2.rg * 2.0 - 1.0);
		vec3 normal3 = octahedronToUnitVector(value3.rg * 2.0 - 1.0);
		vec2 roughnessMetalness1 = value1.ab;
		vec2 roughnessMetalness2 = value2.ab;
		vec2 roughnessMetalness3 = value3.ab;
		float w1 = vSpritesWeight.x;
		float w2 = vSpritesWeight.y;
		float w3 = vSpritesWeight.z;

		w1 = pow(w1, octahedralWeightSharpness);
		w2 = pow(w2, octahedralWeightSharpness);
		w3 = pow(w3, octahedralWeightSharpness);

		float sumW = max(w1 + w2 + w3, 1e-6);
		w1 /= sumW;
		w2 /= sumW;
		w3 /= sumW;

		// Blend roughnessMetalness
		roughnessMetalness = roughnessMetalness1 * w1 + roughnessMetalness2 * w2 + roughnessMetalness3 * w3;

		// Fix normal if blended bad
		return normalize(normal1.xyz * w1 + normal2.xyz * w2 + normal3.xyz * w3);

		// return normalize(normal1.xyz );
	}

	vec2 getUV(vec2 uv_f, vec2 frame, float frame_size) {
		uv_f = clamp(uv_f, vec2(0), vec2(1));
		vec2 uv_quad = frame_size * (frame + uv_f);
		uv_f =  frame_size * (frame + uv_f);
		return clamp(uv_f, vec2(0), vec2(1));
	}
`;

const octahedral_map_frag = `
	float spriteSize = 1.0 / spritesPerSide;

	// todo remove if we want parallax
	vec2 uv1 = getUV(vSpriteUV1, vSprite1, spriteSize);
	vec2 uv2 = getUV(vSpriteUV2, vSprite2, spriteSize);
	vec2 uv3 = getUV(vSpriteUV3, vSprite3, spriteSize);

	vec4 sprite1, sprite2, sprite3;
	float test = 1.0 - alphaClamp;

	if (vSpritesWeight.x >=  test) {
		sprite1 = texture2D(diffuseMap, uv1);
		if (sprite1.a <= alphaClamp) discard;
		sprite2 = texture2D(diffuseMap, uv2);
		sprite3 = texture2D(diffuseMap, uv3);
	} else if (vSpritesWeight.y >=  test) {
		sprite2 = texture2D(diffuseMap, uv2);
		if (sprite2.a <= alphaClamp) discard;
		sprite1 = texture2D(diffuseMap, uv1);
		sprite3 = texture2D(diffuseMap, uv3);
	} else if (vSpritesWeight.z >=  test) {
		sprite3 = texture2D(diffuseMap, uv3);
		if (sprite3.a <= alphaClamp) discard;
		sprite1 = texture2D(diffuseMap, uv1);
		sprite2 = texture2D(diffuseMap, uv2);
	} else {
		sprite1 = texture2D(diffuseMap, uv1);
		sprite2 = texture2D(diffuseMap, uv2);
		sprite3 = texture2D(diffuseMap, uv3);
	}

	// vec4 blendedColor = sprite1 * vSpritesWeight.x + sprite2 * vSpritesWeight.y + sprite3 * vSpritesWeight.z;
	float w1 = vSpritesWeight.x;
	float w2 = vSpritesWeight.y;
	float w3 = vSpritesWeight.z;

	w1 = pow(w1, octahedralWeightSharpness);
	w2 = pow(w2, octahedralWeightSharpness);
	w3 = pow(w3, octahedralWeightSharpness);

	float sumW = max(w1 + w2 + w3, 1e-6);
	w1 /= sumW;
	w2 /= sumW;
	w3 /= sumW;

	vec4 blendedColor = sprite1 * w1 + sprite2 * w2 + sprite3 * w3;
	if (blendedColor.a <= alphaClamp) discard;

	#ifndef EZ_TRANSPARENT
		blendedColor = vec4(vec3(blendedColor.rgb) / blendedColor.a, 1.0);
	#endif
	outColor = blendedColor;
`;

const octahedral_normal_begin_frag = `
	vec2 roughnessMetalness;
	vec3 N = blendNormals(uv1, uv2, uv3, roughnessMetalness);
	vec3 geometryNormal = N;
`;

vertexShader = vertexShader.replace('#include <logdepthbuf_pars_vert>', `
	#include <logdepthbuf_pars_vert>
	${octahedral_pars_vert}
`);
vertexShader = vertexShader.replace('#include <pvm_vert>', `
	${octahedral_vertex}
`);

fragmentShader = fragmentShader.replace('#include <clippingPlanes_pars_frag>', `
	#include <clippingPlanes_pars_frag>
	${octahedral_pars_frag}
`);

fragmentShader = fragmentShader.replace('#include <diffuseMap_frag>', `
	${octahedral_map_frag}
`);

fragmentShader = fragmentShader.replace('#include <normal_frag>', `
	${octahedral_normal_begin_frag}
`);

fragmentShader = fragmentShader.replace('float roughnessFactor = u_Roughness;',
	'float roughnessFactor = roughnessMetalness.x;'
);

fragmentShader = fragmentShader.replace('float metalnessFactor = u_Metalness;',
	'float metalnessFactor = roughnessMetalness.y;'
);

export class OctahedralImpostorDepthMaterial extends DepthMaterial {

	constructor(sourceMaterial) {
		super();

		this.type = MATERIAL_TYPE.SHADER;

		if (sourceMaterial) {
			this.copy(sourceMaterial);
		}

		this.shaderName = 'oct_impostor_depth';

		this.vertexShader = depth_vert;
		this.fragmentShader = depth_frag;

		this.defines.EZ_USE_HEMI_OCTAHEDRON = true;
		this.uniforms.impostorTransform = new Float32Array([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);

		this.uniforms.spritesPerSide = 32;
		this.uniforms.alphaClamp = 0.3;
	}

}

let depth_vert = ShaderLib.depth_vert;

const depth_frag = `
	uniform float spritesPerSide;
	uniform sampler2D diffuseMap;
	uniform mat4 u_ProjectionView;
	uniform float alphaClamp;

	flat varying vec2 vSprite1;
	flat varying vec2 vSprite2;
	flat varying vec2 vSprite3;

	varying vec2 vSpriteUV1;
	varying vec2 vSpriteUV2;
	varying vec2 vSpriteUV3;

	flat varying vec4 vSpritesWeight;

	vec2 getUV(vec2 uv_f, vec2 frame, float frame_size) {
		uv_f = clamp(uv_f, vec2(0), vec2(1));
		vec2 uv_quad = frame_size * (frame + uv_f);
		uv_f =  frame_size * (frame + uv_f);
		return clamp(uv_f, vec2(0), vec2(1));
	}

	const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
	const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)

	const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256.,  256. );
	const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );

	const float ShiftRight8 = 1. / 256.;

	vec4 packDepthToRGBA( const in float v ) {
		vec4 r = vec4( fract( v * PackFactors ), v );
		r.yzw -= r.xyz * ShiftRight8; // tidy overflow
		return r * PackUpscale;
	}

	void main() {
		float spriteSize = 1.0 / spritesPerSide;
		vec2 uv1 = getUV(vSpriteUV1, vSprite1, spriteSize);
		float depth1 = texture2D(diffuseMap, uv1).a;
		if(depth1 <= alphaClamp) discard;
		gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
	}
`;

depth_vert = vertexShader.replace('#include <logdepthbuf_pars_vert>', `
	#include <logdepthbuf_pars_vert>
	${octahedral_pars_vert}
`);

depth_vert = vertexShader.replace('#include <pvm_vert>', `
	${octahedral_vertex}
`);
