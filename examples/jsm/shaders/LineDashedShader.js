/**
 * Line Dashed Shader
 */



var LineDashedShader = {

	uniforms: {
		'scale': 1, // The scale of the dashed part of a line.
		'dashSize': 2, // The size of the dash. This is both the gap with the stroke.
		'totalSize': 4 // The size of the gap.
	},

	vertexShader: [
		'#include <common_vert>',

		'uniform float scale;',
		'attribute float lineDistance;',

		'varying float vLineDistance;',

		'void main() {',
		'	vLineDistance = scale * lineDistance;',

		'	vec3 transformed = vec3(a_Position);',

		'	#include <pvm_vert>',
		'}'
	].join("\n"),

	fragmentShader: [
		'#include <common_frag>',
		'#include <fog_pars_frag>',

		'uniform float dashSize;',
		'uniform float totalSize;',

		'varying float vLineDistance;',

		'void main() {',
		'	if ( mod( vLineDistance, totalSize ) > dashSize ) {',
		'		discard;',
		'	}',

		'	#include <begin_frag>',
		'	#include <end_frag>',
		'	#include <premultipliedAlpha_frag>',
		'	#include <fog_frag>',
		'}'
	].join("\n")

}

export { LineDashedShader };