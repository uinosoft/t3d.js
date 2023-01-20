/**
 * Deferred Renderer
 */

import {
	BLEND_TYPE,
	Matrix4,
	RenderTargetBack,
	ShaderPostPass,
	ShadowMapPass,
	Vector3,
	Renderer
} from 't3d';
import { GBuffer } from "../GBuffer.js";

var matProjViewInverse = new Matrix4();
var eyePosition = new Vector3();

class DeferredRenderer extends Renderer {

	constructor(view, options) {
		var defaultContextParams = {
			antialias: true, // antialias
			alpha: false, // effect performance, default false
			// premultipliedAlpha: false, // effect performance, default false
			stencil: true
		};

		var gl = view.getContext("webgl2", options || defaultContextParams) || view.getContext("webgl", options || defaultContextParams);

		super(gl);

		console.info("DeferredRenderer use WebGL Version: " + this.renderPass.capabilities.version);

		this.shadowMapPass = new ShadowMapPass();

		this.backRenderTarget = new RenderTargetBack(view);

		var width = this.backRenderTarget.width;
		var height = this.backRenderTarget.height;

		this.gBuffer = new GBuffer(width, height);

		var directionalLightPass = new ShaderPostPass(DeferredRenderer.DeferredShader.directionalLight);
		directionalLightPass.material.transparent = true;
		directionalLightPass.material.blending = BLEND_TYPE.ADD;
		directionalLightPass.material.depthWrite = false;
		directionalLightPass.material.depthTest = false;
		this.directionalLightPass = directionalLightPass;

		var directionalShadowLightPass = new ShaderPostPass(DeferredRenderer.DeferredShader.directionalLight);
		directionalShadowLightPass.material.transparent = true;
		directionalShadowLightPass.material.blending = BLEND_TYPE.ADD;
		directionalShadowLightPass.material.depthWrite = false;
		directionalShadowLightPass.material.depthTest = false;
		directionalShadowLightPass.material.defines["SHADOW"] = 1;
		this.directionalShadowLightPass = directionalShadowLightPass;

		var pointLightPass = new ShaderPostPass(DeferredRenderer.DeferredShader.pointLight);
		pointLightPass.material.transparent = true;
		pointLightPass.material.blending = BLEND_TYPE.ADD;
		pointLightPass.material.depthWrite = false;
		pointLightPass.material.depthTest = false;
		this.pointLightPass = pointLightPass;

		var pointShadowLightPass = new ShaderPostPass(DeferredRenderer.DeferredShader.pointLight);
		pointShadowLightPass.material.transparent = true;
		pointShadowLightPass.material.blending = BLEND_TYPE.ADD;
		pointShadowLightPass.material.depthWrite = false;
		pointShadowLightPass.material.depthTest = false;
		pointShadowLightPass.material.defines["SHADOW"] = 1;
		this.pointShadowLightPass = pointShadowLightPass;

		var spotLightPass = new ShaderPostPass(DeferredRenderer.DeferredShader.spotLight);
		spotLightPass.material.transparent = true;
		spotLightPass.material.blending = BLEND_TYPE.ADD;
		spotLightPass.material.depthWrite = false;
		spotLightPass.material.depthTest = false;
		this.spotLightPass = spotLightPass;

		var spotShadowLightPass = new ShaderPostPass(DeferredRenderer.DeferredShader.spotLight);
		spotShadowLightPass.material.transparent = true;
		spotShadowLightPass.material.blending = BLEND_TYPE.ADD;
		spotShadowLightPass.material.depthWrite = false;
		spotShadowLightPass.material.depthTest = false;
		spotShadowLightPass.material.defines["SHADOW"] = 1;
		this.spotShadowLightPass = spotShadowLightPass;

		var ambientCubemapLightPass = new ShaderPostPass(DeferredRenderer.DeferredShader.ambientCubemapLight);
		ambientCubemapLightPass.material.transparent = true;
		ambientCubemapLightPass.material.blending = BLEND_TYPE.ADD;
		ambientCubemapLightPass.material.depthWrite = false;
		ambientCubemapLightPass.material.depthTest = false;
		this.ambientCubemapLightPass = ambientCubemapLightPass;

		this.ambientCubemap = null;
		this.ambientCubemapIntensity = 1.0;
	}

	resize(width, height) {
		this.backRenderTarget.resize(width, height);
		this.gBuffer.resize(width, height);
	}

	render(scene, camera, renderTarget) {
		var renderPass = this.renderPass;
		var gBuffer = this.gBuffer;
		var width = this.backRenderTarget.width;
		var height = this.backRenderTarget.height;

		scene.updateMatrix();
		var renderStates = scene.updateRenderStates(camera);
		scene.updateRenderQueue(camera);

		this.shadowMapPass.render(this, scene);

		// Step 1: update GBuffer
		gBuffer.update(this, scene, camera);

		// Step 2: light accum

		renderPass.setRenderTarget(renderTarget || this.backRenderTarget);

		renderPass.setClearColor(0, 0, 0, 0);
		renderPass.clear(true, true, true);

		matProjViewInverse.copy(renderStates.camera.projectionViewMatrix).inverse();
		eyePosition.copy(renderStates.camera.position);

		function uploadCommonUniforms(pass) {
			pass.uniforms["normalGlossinessTexture"] = gBuffer.getNormalGlossinessTexture();
			pass.uniforms["depthTexture"] = gBuffer.getDepthTexture();
			pass.uniforms["albedoMetalnessTexture"] = gBuffer.getAlbedoMetalnessTexture();
			pass.uniforms["windowSize"][0] = width;
			pass.uniforms["windowSize"][1] = height;
			pass.uniforms["matProjViewInverse"].set(matProjViewInverse.elements);
			pass.uniforms["eyePosition"][0] = eyePosition.x;
			pass.uniforms["eyePosition"][1] = eyePosition.y;
			pass.uniforms["eyePosition"][2] = eyePosition.z;
		}

		// directional

		var lights = renderStates.lights.directional;
		var shadows = renderStates.lights.directionalShadow;
		var count = renderStates.lights.directsNum;
		var shadowCount = renderStates.lights.directShadowNum;

		for (var i = 0; i < count; i++) {
			var light = lights[i];

			var pass = i < shadowCount ? this.directionalShadowLightPass : this.directionalLightPass;
			uploadCommonUniforms(pass);

			pass.uniforms["lightColor"] = [light.color[0], light.color[1], light.color[2]];
			pass.uniforms["lightDirection"] = [light.direction[0], light.direction[1], light.direction[2]];

			if (i < shadowCount) {
				var shadow = shadows[i];

				pass.uniforms["shadowBias"][0] = shadow.shadowBias[0];
				pass.uniforms["shadowBias"][1] = shadow.shadowBias[1];
				pass.uniforms["shadowParams"][0] = shadow.shadowParams[0];
				pass.uniforms["shadowParams"][1] = shadow.shadowParams[1];
				pass.uniforms["shadowMapSize"][0] = shadow.shadowMapSize[0];
				pass.uniforms["shadowMapSize"][1] = shadow.shadowMapSize[1];

				pass.uniforms["shadowMap"] = renderPass.capabilities.version >= 2 ? renderStates.lights.directionalShadowDepthMap[i] : renderStates.lights.directionalShadowMap[i];
				pass.uniforms["shadowMatrix"].set(renderStates.lights.directionalShadowMatrix, i * 16);
			}

			pass.render(this);
		}

		// point

		var lights = renderStates.lights.point;
		var shadows = renderStates.lights.pointShadow;
		var count = renderStates.lights.pointsNum;
		var shadowCount = renderStates.lights.pointShadowNum;

		for (var i = 0; i < count; i++) {
			var light = lights[i];

			var pass = i < shadowCount ? this.pointShadowLightPass : this.pointLightPass;
			uploadCommonUniforms(pass);

			pass.uniforms["lightColor"] = [light.color[0], light.color[1], light.color[2]];
			pass.uniforms["lightPosition"] = [light.position[0], light.position[1], light.position[2]];
			pass.uniforms["lightRange"] = light.distance;
			// pass.uniforms["attenuationFactor"] = light.decay; 5.0?

			if (i < shadowCount) {
				var shadow = shadows[i];

				pass.uniforms["shadowBias"][0] = shadow.shadowBias[0];
				pass.uniforms["shadowBias"][1] = shadow.shadowBias[1];
				pass.uniforms["shadowParams"][0] = shadow.shadowParams[0];
				pass.uniforms["shadowParams"][1] = shadow.shadowParams[1];
				pass.uniforms["shadowMapSize"][0] = shadow.shadowMapSize[0];
				pass.uniforms["shadowMapSize"][1] = shadow.shadowMapSize[1];

				pass.uniforms["shadowMap"] = renderStates.lights.pointShadowMap[i];

				pass.uniforms["shadowCameraRange"][0] = shadow.shadowCameraRange[0];
				pass.uniforms["shadowCameraRange"][1] = shadow.shadowCameraRange[1];
			}

			pass.render(this);
		}

		// spot

		var lights = renderStates.lights.spot;
		var shadows = renderStates.lights.spotShadow;
		var count = renderStates.lights.spotsNum;
		var shadowCount = renderStates.lights.spotShadowNum;

		for (var i = 0; i < count; i++) {
			var light = lights[i];

			var pass = i < shadowCount ? this.spotShadowLightPass : this.spotLightPass;
			uploadCommonUniforms(pass);

			pass.uniforms["lightColor"] = [light.color[0], light.color[1], light.color[2]];
			pass.uniforms["lightPosition"] = [light.position[0], light.position[1], light.position[2]];
			pass.uniforms["lightDirection"] = [light.direction[0], light.direction[1], light.direction[2]];
			pass.uniforms["lightConeCos"] = light.coneCos;
			pass.uniforms["lightPenumbraCos"] = light.penumbraCos;
			pass.uniforms["lightRange"] = light.distance;
			// pass.uniforms["attenuationFactor"] = light.decay; 5.0?

			if (i < shadowCount) {
				var shadow = shadows[i];

				pass.uniforms["shadowBias"][0] = shadow.shadowBias[0];
				pass.uniforms["shadowBias"][1] = shadow.shadowBias[1];
				pass.uniforms["shadowParams"][0] = shadow.shadowParams[0];
				pass.uniforms["shadowParams"][1] = shadow.shadowParams[1];
				pass.uniforms["shadowMapSize"][0] = shadow.shadowMapSize[0];
				pass.uniforms["shadowMapSize"][1] = shadow.shadowMapSize[1];

				pass.uniforms["shadowMap"] = renderPass.capabilities.version >= 2 ? renderStates.lights.spotShadowDepthMap[i] : renderStates.lights.spotShadowMap[i];
				pass.uniforms["shadowMatrix"].set(renderStates.lights.spotShadowMatrix, i * 16);
			}

			pass.render(this);
		}

		// ambientCubemap

		if (this.ambientCubemap) {
			var pass = this.ambientCubemapLightPass;
			uploadCommonUniforms(pass);

			pass.uniforms["cubeMap"] = this.ambientCubemap;
			pass.uniforms["intensity"] = this.ambientCubemapIntensity;

			pass.render(this);
		}
	}

}

var DeferredShaderChunk = {

	light_vertex: [

		"attribute vec3 a_Position;",

		"uniform mat4 u_ProjectionView;",
		"uniform mat4 u_Model;",

		"void main() {",

		"gl_Position = u_ProjectionView * u_Model * vec4( a_Position, 1.0 );",

		"}"

	].join('\n'),

	light_head: [

		"uniform sampler2D normalGlossinessTexture;",
		"uniform sampler2D depthTexture;",
		"uniform sampler2D albedoMetalnessTexture;",

		"uniform vec2 windowSize;",

		"uniform mat4 matProjViewInverse;",

	].join('\n'),

	gbuffer_read: [
		// Extract
		// - N, z, position
		// - albedo, metalness, specularColor, diffuseColor

		"vec2 texCoord = gl_FragCoord.xy / windowSize;",

		"vec4 texel1 = texture2D(normalGlossinessTexture, texCoord);",
		"vec4 texel3 = texture2D(albedoMetalnessTexture, texCoord);",

		// Is empty
		"if (dot(texel1.rgb, vec3(1.0)) == 0.0) {",
		"discard;",
		"}",

		"float glossiness = texel1.a;",
		"float metalness = texel3.a;",

		"vec3 N = texel1.rgb * 2.0 - 1.0;",

		// Depth buffer range is 0.0 - 1.0
		"float z = texture2D(depthTexture, texCoord).r * 2.0 - 1.0;",

		"vec2 xy = texCoord * 2.0 - 1.0;",

		"vec4 projectedPos = vec4(xy, z, 1.0);",
		"vec4 p4 = matProjViewInverse * projectedPos;",

		"vec3 position = p4.xyz / p4.w;",

		"vec3 albedo = texel3.rgb;",

		"vec3 diffuseColor = albedo * (1.0 - metalness);",
		"vec3 specularColor = mix(vec3(0.04), albedo, metalness);",

	].join('\n'),

	calculate_attenuation: [

		"uniform float attenuationFactor;",

		"float lightAttenuation(float dist, float range)",
		"{",
		"float attenuation = 1.0;",
		"attenuation = dist*dist/(range*range+1.0);",
		"float att_s = attenuationFactor;",
		"attenuation = 1.0/(attenuation*att_s+1.0);",
		"att_s = 1.0/(att_s+1.0);",
		"attenuation = attenuation - att_s;",
		"attenuation /= 1.0 - att_s;",
		"return clamp(attenuation, 0.0, 1.0);",
		"}"

	].join('\n'),

	light_equation: [

		"float D_Phong(in float g, in float ndh) {",
		// from black ops 2
		"float a = pow(8192.0, g);",
		"return (a + 2.0) / 8.0 * pow(ndh, a);",
		"}",

		"float D_GGX(in float g, in float ndh) {",
		"float r = 1.0 - g;",
		"float a = r * r;",
		"float tmp = ndh * ndh * (a - 1.0) + 1.0;",
		"return a / (3.1415926 * tmp * tmp);",
		"}",

		// Fresnel
		"vec3 F_Schlick(in float ndv, vec3 spec) {",
		"return spec + (1.0 - spec) * pow(1.0 - ndv, 5.0);",
		"}",

		"vec3 lightEquation(",
		"in vec3 lightColor, in vec3 diffuseColor, in vec3 specularColor,",
		"in float ndl, in float ndh, in float ndv, in float g",
		")",
		"{",
		"return ndl * PI * lightColor",
		"* (diffuseColor + D_Phong(g, ndh) * F_Schlick(ndv, specularColor));",
		"}"

	].join('\n')

}

DeferredRenderer.DeferredShader = {

	directionalLight: {

		defines: {

			"SHADOW": 0

		},

		uniforms: {

			normalGlossinessTexture: null,
			depthTexture: null,
			albedoMetalnessTexture: null,

			windowSize: [800, 600],

			matProjViewInverse: new Float32Array(16),

			lightColor: [0, 0, 0],
			lightDirection: [0, 1, 0],

			eyePosition: [0, 1, 0],

			shadowMatrix: new Float32Array(16),
			shadowMap: null,
			shadowBias: [0, 0],
			shadowParams: [1, 0],
			shadowMapSize: [1024, 1024]

		},

		vertexShader: DeferredShaderChunk.light_vertex,

		fragmentShader: [

			DeferredShaderChunk.light_head,
			DeferredShaderChunk.light_equation,

			"uniform vec3 lightDirection;",
			"uniform vec3 lightColor;",

			"uniform vec3 eyePosition;",

			"#if SHADOW == 1",

			"uniform sampler2DShadow shadowMap;",
			"uniform mat4 shadowMatrix;",

			"uniform vec2 shadowBias;",
			"uniform vec2 shadowParams;",
			"uniform vec2 shadowMapSize;",

			"#include <packing>",
			"#include <shadow>",

			"#endif",

			"void main() {",

			DeferredShaderChunk.gbuffer_read,

			"vec3 L = -normalize(lightDirection);",
			"vec3 V = normalize(eyePosition - position);",

			"vec3 H = normalize(L + V);",
			"float ndl = clamp(dot(N, L), 0.0, 1.0);",
			"float ndh = clamp(dot(N, H), 0.0, 1.0);",
			"float ndv = clamp(dot(N, V), 0.0, 1.0);",

			"gl_FragColor.rgb = lightEquation(",
			"lightColor, diffuseColor, specularColor, ndl, ndh, ndv, glossiness",
			");",

			"#if SHADOW == 1",
			"float shadowContrib = getShadow(shadowMap, shadowMatrix * vec4(position, 1.), shadowMapSize, shadowBias, shadowParams);",
			"gl_FragColor.rgb *= shadowContrib;",
			"#endif",

			"gl_FragColor.a = 1.0;",

			"}"

		].join('\n')

	},

	pointLight: {

		defines: {

			"SHADOW": 0

		},

		uniforms: {

			normalGlossinessTexture: null,
			depthTexture: null,
			albedoMetalnessTexture: null,

			windowSize: [800, 600],

			matProjViewInverse: new Float32Array(16),

			lightColor: [0, 0, 0],
			lightPosition: [0, 1, 0],
			lightRange: 1,

			attenuationFactor: 5.0,

			eyePosition: [0, 1, 0],

			shadowMap: null,
			shadowBias: [0, 0],
			shadowParams: [1, 0],
			shadowMapSize: [1024, 1024],
			shadowCameraRange: [1, 100]

		},

		vertexShader: DeferredShaderChunk.light_vertex,

		fragmentShader: [

			DeferredShaderChunk.light_head,
			DeferredShaderChunk.calculate_attenuation,
			DeferredShaderChunk.light_equation,

			"uniform vec3 lightPosition;",
			"uniform vec3 lightColor;",
			"uniform float lightRange;",

			"uniform vec3 eyePosition;",

			"#if SHADOW == 1",

			"uniform samplerCube shadowMap;",

			"uniform vec2 shadowBias;",
			"uniform vec2 shadowParams;",
			"uniform vec2 shadowMapSize;",
			"uniform vec2 shadowCameraRange;",

			"#include <packing>",
			"#include <shadow>",

			"#endif",

			"void main() {",

			DeferredShaderChunk.gbuffer_read,

			"vec3 L = lightPosition - position;",
			"vec3 V = normalize(eyePosition - position);",

			"float dist = length(L);",
			"L /= dist;",

			"vec3 H = normalize(L + V);",

			"float ndl = clamp(dot(N, L), 0.0, 1.0);",
			"float ndh = clamp(dot(N, H), 0.0, 1.0);",
			"float ndv = clamp(dot(N, V), 0.0, 1.0);",
			"float attenuation = lightAttenuation(dist, lightRange);",
			// Diffuse term
			"gl_FragColor.rgb = attenuation * lightEquation(",
			"lightColor, diffuseColor, specularColor, ndl, ndh, ndv, glossiness",
			");",

			"#if SHADOW == 1",
			"float shadowContrib = getPointShadow(shadowMap, vec4(-L * dist, 1.0), shadowMapSize, shadowBias, shadowParams, shadowCameraRange);",
			"gl_FragColor.rgb *= clamp(shadowContrib, 0.0, 1.0);",
			"#endif",

			"gl_FragColor.a = 1.0;",

			"}"

		].join('\n')

	},

	spotLight: {

		defines: {

			"SHADOW": 0

		},

		uniforms: {

			normalGlossinessTexture: null,
			depthTexture: null,
			albedoMetalnessTexture: null,

			windowSize: [800, 600],

			matProjViewInverse: new Float32Array(16),

			lightColor: [0, 0, 0],
			lightPosition: [0, 1, 0],
			lightDirection: [0, 1, 0],
			lightConeCos: 1,
			lightPenumbraCos: 1,
			lightRange: 1,
			falloffFactor: 1.,

			attenuationFactor: 5.0,

			eyePosition: [0, 1, 0],

			shadowMatrix: new Float32Array(16),
			shadowMap: null,
			shadowBias: [0, 0],
			shadowParams: [1, 0],
			shadowMapSize: [1024, 1024],

		},

		vertexShader: DeferredShaderChunk.light_vertex,

		fragmentShader: [

			DeferredShaderChunk.light_head,
			DeferredShaderChunk.calculate_attenuation,
			DeferredShaderChunk.light_equation,

			"uniform vec3 lightPosition;",
			"uniform vec3 lightDirection;",
			"uniform vec3 lightColor;",
			"uniform float lightConeCos;",
			"uniform float lightPenumbraCos;",
			"uniform float lightRange;",
			"uniform float falloffFactor;",

			"uniform vec3 eyePosition;",

			"#if SHADOW == 1",

			"uniform sampler2DShadow shadowMap;",
			"uniform mat4 shadowMatrix;",

			"uniform vec2 shadowBias;",
			"uniform vec2 shadowParams;",
			"uniform vec2 shadowMapSize;",

			"#include <packing>",
			"#include <shadow>",

			"#endif",

			"void main() {",

			DeferredShaderChunk.gbuffer_read,

			"vec3 L = lightPosition - position;",
			"vec3 V = normalize(eyePosition - position);",

			"float dist = length(L);",
			"L /= dist;",

			"float attenuation = lightAttenuation(dist, lightRange);",
			"float angleCos = dot( -normalize(lightDirection), L );",

			"if ( angleCos <= lightConeCos ) discard;",
			"if ( dist > lightRange ) discard;",

			"float spotEffect = smoothstep( lightConeCos, lightPenumbraCos, angleCos );",

			"vec3 H = normalize(L + V);",
			"float ndl = clamp(dot(N, L), 0.0, 1.0);",
			"float ndh = clamp(dot(N, H), 0.0, 1.0);",
			"float ndv = clamp(dot(N, V), 0.0, 1.0);",

			// Diffuse term
			"gl_FragColor.rgb = spotEffect * attenuation * lightEquation(",
			"lightColor, diffuseColor, specularColor, ndl, ndh, ndv, glossiness",
			");",

			"#if SHADOW == 1",
			"float shadowContrib = getShadow(shadowMap, shadowMatrix * vec4(position, 1.), shadowMapSize, shadowBias, shadowParams);",
			"gl_FragColor.rgb *= shadowContrib;",
			"#endif",

			"gl_FragColor.a = 1.0;",

			"}"

		].join('\n')

	},

	ambientCubemapLight: {

		defines: {

		},

		uniforms: {

			normalGlossinessTexture: null,
			depthTexture: null,
			albedoMetalnessTexture: null,

			windowSize: [800, 600],

			matProjViewInverse: new Float32Array(16),

			cubeMap: null,
			intensity: 1.0,

			eyePosition: [0, 1, 0]

		},

		vertexShader: DeferredShaderChunk.light_vertex,

		fragmentShader: [

			DeferredShaderChunk.light_head,
			DeferredShaderChunk.light_equation,

			"uniform samplerCube cubeMap;",
			"uniform float intensity;",

			"uniform vec3 eyePosition;",

			"void main() {",

			DeferredShaderChunk.gbuffer_read,

			"vec3 V = normalize(eyePosition - position);",
			"vec3 L = reflect(-V, N);",

			"vec3 H = normalize(L + V);",

			"float ndv = clamp(dot(N, V), 0.0, 1.0);",
			"float ndh = clamp(dot(N, H), 0.0, 1.0);",
			"float rough = clamp(1.0 - glossiness, 0.0, 1.0);",

			// FIXME fixed maxMipmapLevel ?
			"float level = rough * 5.0;",

			"#ifdef TEXTURE_LOD_EXT",

			"vec4 cubeMapColor1 = textureCubeLodEXT( cubeMap, L, 8. );",
			"vec4 cubeMapColor2 = textureCubeLodEXT( cubeMap, L, level );",

			"#else",

			// force the bias high to get the last LOD level as it is the most blurred.
			"vec4 cubeMapColor1 = textureCubeLodEXT( cubeMap, L, 8. );",
			"vec4 cubeMapColor2 = textureCube( cubeMap, L, level );",

			"#endif",

			// Diffuse term
			// TODO
			"gl_FragColor.rgb = intensity * (cubeMapColor2.xyz * F_Schlick(ndv, specularColor) + cubeMapColor1.xyz * diffuseColor / PI);",

			"gl_FragColor.a = 1.0;",

			"}"

		].join('\n')

	}

};

export { DeferredRenderer };