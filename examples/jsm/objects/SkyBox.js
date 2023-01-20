import {
	BoxGeometry,
	DRAW_SIDE,
	Mesh,
	ShaderMaterial
} from 't3d';

class SkyBox extends Mesh {

	constructor(texture) {
		const geometry = new BoxGeometry(1, 1, 1);

		const material = new ShaderMaterial(SkyBox.SkyBoxShader);
		material.side = DRAW_SIDE.BACK;

		super(geometry, material);

		this.material = material;

		if (texture) {
			this.texture = texture;
		}

		this.frustumCulled = false;
	}

	set level(val) {
		this.material.uniforms.level = val;
	}

	get level() {
		return this.material.uniforms.level;
	}

	set gamma(val) {
		this.material.defines.GAMMA = val;
		this.material.needsUpdate = true;
	}

	get gamma() {
		return this.material.defines.GAMMA;
	}

	set texture(val) {
		if (val.isTextureCube) {
			this.material.cubeMap = val;
			this.material.uniforms.flip = (val.images[0] && val.images[0].rtt) ? 1 : -1;
			this.material.defines['PANORAMA'] = false;
		} else {
			this.material.diffuseMap = val;
			this.material.uniforms.flip = -1;
			this.material.defines['PANORAMA'] = "";
		}
		this.material.needsUpdate = true;
	}

	get texture() {
		return this.material.diffuseMap || this.material.cubeMap;
	}

}

SkyBox.SkyBoxShader = {

	name: 'skybox',

	defines: {
		"GAMMA": false,
		"PANORAMA": false
	},

	uniforms: {
		"level": 0.,
		"flip": -1
	},

	vertexShader: [
		"#include <common_vert>",
		"varying vec3 vDir;",
		"void main() {",
		"	vDir = (u_Model * vec4(a_Position, 0.0)).xyz;",
		"	gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);",
		"	gl_Position.z = gl_Position.w;", // set z to camera.far
		"}"
	].join("\n"),

	fragmentShader: [
		"#include <common_frag>",

		"#ifdef PANORAMA",
		"	uniform sampler2D diffuseMap;",
		"#else",
		"	uniform samplerCube cubeMap;",
		"#endif",

		"uniform float flip;",
		"uniform float level;",
		"varying vec3 vDir;",

		"void main() {",

		"	#include <begin_frag>",

		"	vec3 V = normalize(vDir);",

		"	#ifdef PANORAMA",

		"		float phi = acos(V.y);",
		// consistent with cubemap.
		// atan(y, x) is same with atan2 ?
		"		float theta = flip * atan(V.x, V.z) + PI * 0.5;",
		"		vec2 uv = vec2(theta / 2.0 / PI, -phi / PI);",

		"		#ifdef TEXTURE_LOD_EXT",
		"			outColor *= mapTexelToLinear(texture2DLodEXT(diffuseMap, fract(uv), level));",
		"		#else",
		"			outColor *= mapTexelToLinear(texture2D(diffuseMap, fract(uv), level));",
		"		#endif",

		"	#else",

		"		vec3 coordVec = vec3(flip * V.x, V.yz);",

		"		#ifdef TEXTURE_LOD_EXT",
		"			outColor *= mapTexelToLinear(textureCubeLodEXT(cubeMap, coordVec, level));",
		"		#else",
		"			outColor *= mapTexelToLinear(textureCube(cubeMap, coordVec, level));",
		"		#endif",

		"	#endif",

		"	#include <end_frag>",
		"	#ifdef GAMMA",
		"		#include <encodings_frag>",
		"	#endif",
		"}"
	].join("\n")

};

export { SkyBox };