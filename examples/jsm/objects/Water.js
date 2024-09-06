import {
	Color3,
	DRAW_SIDE,
	Mesh,
	ShaderMaterial,
	Vector3
} from 't3d';
import { PlanarReflectionProbe } from '../probes/PlanarReflectionProbe.js';


/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */
class Water extends Mesh {

	constructor(geometry, options = {}) {
		const alpha = options.alpha !== undefined ? options.alpha : 1.0;
		const time = options.time !== undefined ? options.time : 0.0;
		const normalSampler = options.waterNormals !== undefined ? options.waterNormals : null;
		const sunDirection = options.sunDirection !== undefined ? options.sunDirection : new Vector3(0.70707, 0.70707, 0.0);
		const sunColor = new Color3(options.sunColor !== undefined ? options.sunColor : 0xffffff);
		const waterColor = new Color3(options.waterColor !== undefined ? options.waterColor : 0x7F7F7F);
		const distortionScale = options.distortionScale !== undefined ? options.distortionScale : 20.0;
		const side = options.side !== undefined ? options.side : DRAW_SIDE.FRONT;

		const material = new ShaderMaterial(mirrorShader);
		material.side = side;

		material.uniforms['alpha'] = alpha;
		material.uniforms['time'] = time;
		material.uniforms['normalSampler'] = normalSampler;
		material.uniforms['sunColor'] = sunColor.toArray();
		material.uniforms['waterColor'] = waterColor.toArray();
		material.uniforms['sunDirection'] = sunDirection.toArray();
		material.uniforms['distortionScale'] = distortionScale;

		super(geometry, material);

		const planarReflectionProbe = new PlanarReflectionProbe();

		material.uniforms['mirrorSampler'] = planarReflectionProbe.renderTarget.texture;
		material.uniforms['textureMatrix'] = planarReflectionProbe.textureMatrix.elements;

		this.skipReflectionProbe = true;

		const planeNormal = new Vector3(0, 1, 0);
		const coplanarPoint = new Vector3();

		const scope = this;
		scope.updateReflect = function(renderer, scene, camera) {
			planeNormal.setFromMatrixColumn(scope.worldMatrix, 1).normalize();
			coplanarPoint.setFromMatrixPosition(scope.worldMatrix);
			planarReflectionProbe.plane.setFromNormalAndCoplanarPoint(planeNormal, coplanarPoint);
			planarReflectionProbe.render(renderer, scene, camera);
		};
	}

}

const mirrorShader = {
	name: 'water_mirror',

	uniforms: {
		u_FogColor: [1, 1, 1],
		u_FogDensity: 0.2,
		u_FogNear: 0.1,
		u_FogFar: 1000,

		normalSampler: null,
		mirrorSampler: null,
		alpha: 1.0,
		time: 0.0,
		size: 1.0,
		distortionScale: 20.0,
		textureMatrix: new Float32Array(16),
		sunColor: [0.8, 0.8, 0.8],
		sunDirection: [0.70707, 0.70707, 0],
		waterColor: [0.4, 0.4, 0.4]
	},

	vertexShader: [
		'uniform mat4 textureMatrix;',
		'uniform float time;',

		'varying vec4 mirrorCoord;',
		'varying vec4 worldPosition;',

		'#include <common_vert>',

		'void main() {',
		'	mirrorCoord = u_Model * vec4(a_Position, 1.0);',
		'	worldPosition = mirrorCoord.xyzw;',
		'	mirrorCoord = textureMatrix * mirrorCoord;',
		'	gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);',
		'}'
	].join('\n'),

	fragmentShader: [
		'uniform sampler2D mirrorSampler;',
		'uniform float alpha;',
		'uniform float time;',
		'uniform float size;',
		'uniform float distortionScale;',
		'uniform sampler2D normalSampler;',
		'uniform vec3 sunColor;',
		'uniform vec3 sunDirection;',
		'uniform vec3 u_CameraPosition;',
		'uniform vec3 waterColor;',

		'varying vec4 mirrorCoord;',
		'varying vec4 worldPosition;',

		'vec4 getNoise( vec2 uv ) {',
		'	vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);',
		'	vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );',
		'	vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );',
		'	vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );',
		'	vec4 noise = texture2D( normalSampler, uv0 ) +',
		'		texture2D( normalSampler, uv1 ) +',
		'		texture2D( normalSampler, uv2 ) +',
		'		texture2D( normalSampler, uv3 );',
		'	return noise * 0.5 - 1.0;',
		'}',

		'void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {',
		'	vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );',
		'	float direction = max( 0.0, dot( eyeDirection, reflection ) );',
		'	specularColor += pow( direction, shiny ) * sunColor * spec;',
		'	diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;',
		'}',

		'#include <fog_pars_frag>',

		'void main() {',
		'	vec4 noise = getNoise( worldPosition.xz * size );',
		'	vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',

		'	vec3 diffuseLight = vec3(0.0);',
		'	vec3 specularLight = vec3(0.0);',

		'	vec3 worldToEye = u_CameraPosition - worldPosition.xyz;',
		'	vec3 eyeDirection = normalize( worldToEye );',
		'	sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );',

		'	float distance = length(worldToEye);',

		'	vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;',
		'	vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );',

		'	float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );',
		'	float rf0 = 0.3;',
		'	float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
		'	vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;',
		'	vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);',
		'	vec3 outgoingLight = albedo;',
		'	gl_FragColor = vec4( outgoingLight, alpha );',

		'   #include <fog_frag>',
		'}'
	].join('\n')
};

export { Water };