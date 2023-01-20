/**
 * Sprite
 */

import {
	Attribute,
	Buffer,
	Geometry,
	Mesh,
	ShaderMaterial
} from 't3d';

class Sprite extends Mesh {

	constructor() {
		super(sharedGeometry, new ShaderMaterial(spriteShader));
		this.frustumCulled = false;
	}

	set rotation(value) {
		this.material.uniforms["rotation"] = value;
	}

	get rotation() {
		return this.material.uniforms["rotation"];
	}

}

const sharedGeometry = new Geometry();

const array = new Float32Array([
	-0.5, -0.5, 0, 0,
	0.5, -0.5, 1, 0,
	0.5, 0.5, 1, 1,
	-0.5, 0.5, 0, 1
]);

const buffer = new Buffer(array, 4);
sharedGeometry.addAttribute("position", new Attribute(buffer, 2, 0));
sharedGeometry.addAttribute("uv", new Attribute(buffer, 2, 2));
sharedGeometry.setIndex(
	new Attribute(new Buffer(new Uint16Array([
		0, 1, 2,
		0, 2, 3
	]), 1))
);
sharedGeometry.computeBoundingBox();
sharedGeometry.computeBoundingSphere();

const spriteShader = {

	defines: {
		USE_SIZEATTENUATION: true
	},

	uniforms: {
		rotation: 0,
		center: [0.5, 0.5]
	},

	vertexShader: `
		#include <common_vert>
		#include <logdepthbuf_pars_vert>

		attribute vec2 position;
		attribute vec2 uv;

		uniform float rotation;
		uniform vec2 center;

		#ifdef USE_DIFFUSE_MAP
			varying vec2 vUV;
			uniform mat3 uvTransform;
		#endif

		void main() {
			#ifdef USE_DIFFUSE_MAP
				vUV = (uvTransform * vec3(uv, 1.)).xy;
			#endif

			vec4 mvPosition = u_View * u_Model * vec4( 0.0, 0.0, 0.0, 1.0 );

			vec2 scale;
			scale.x = length(vec3(u_Model[0].x, u_Model[0].y, u_Model[0].z));
			scale.y = length(vec3(u_Model[1].x, u_Model[1].y, u_Model[1].z));

			#ifndef USE_SIZEATTENUATION
				bool isPerspective = isPerspectiveMatrix(u_Projection);
				if (isPerspective) scale *= - mvPosition.z;
			#endif

			vec2 alignedPosition = (position.xy - (center - vec2(0.5))) * scale;

			vec2 rotatedPosition;
			rotatedPosition.x = cos(rotation) * alignedPosition.x - sin(rotation) * alignedPosition.y;
			rotatedPosition.y = sin(rotation) * alignedPosition.x + cos(rotation) * alignedPosition.y;

			mvPosition.xy += rotatedPosition;

			gl_Position = u_Projection * mvPosition;

			#include <logdepthbuf_vert>
		}
	`,

	fragmentShader: `
		uniform vec3 u_Color;
		uniform float u_Opacity;

		#ifdef USE_DIFFUSE_MAP
			uniform sampler2D diffuseMap;
			varying vec2 vUV;
		#endif

		#include <fog_pars_frag>
		#include <logdepthbuf_pars_frag>

		void main() {
			#include <logdepthbuf_frag>
			
			vec4 outColor = vec4(u_Color, u_Opacity);

			#ifdef USE_DIFFUSE_MAP
				outColor *= texture2D(diffuseMap, vUV);
			#endif

			#ifdef ALPHATEST
				if (outColor.a < ALPHATEST) discard;
			#endif

			gl_FragColor = outColor;

			#include <fog_frag>
		}
	`

};

Sprite.SpriteGeometry = sharedGeometry;
Sprite.SpriteShader = spriteShader;

export { Sprite };