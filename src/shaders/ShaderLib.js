import basic_frag from './shaderLib/basic_frag.glsl';
import basic_vert from './shaderLib/basic_vert.glsl';
import depth_frag from './shaderLib/depth_frag.glsl';
import depth_vert from './shaderLib/depth_vert.glsl';
import distance_frag from './shaderLib/distance_frag.glsl';
import distance_vert from './shaderLib/distance_vert.glsl';
import lambert_frag from './shaderLib/lambert_frag.glsl';
import lambert_vert from './shaderLib/lambert_vert.glsl';
import normaldepth_frag from './shaderLib/normaldepth_frag.glsl';
import normaldepth_vert from './shaderLib/normaldepth_vert.glsl';
import pbr_frag from './shaderLib/pbr_frag.glsl';
import pbr2_frag from './shaderLib/pbr2_frag.glsl';
import pbr_vert from './shaderLib/pbr_vert.glsl';
import phong_frag from './shaderLib/phong_frag.glsl';
import phong_vert from './shaderLib/phong_vert.glsl';
import point_frag from './shaderLib/point_frag.glsl';
import point_vert from './shaderLib/point_vert.glsl';

export const ShaderLib = {
	basic_frag: basic_frag,
	basic_vert: basic_vert,
	depth_frag: depth_frag,
	depth_vert: depth_vert,
	distance_frag: distance_frag,
	distance_vert: distance_vert,
	lambert_frag: lambert_frag,
	lambert_vert: lambert_vert,
	normaldepth_frag: normaldepth_frag,
	normaldepth_vert: normaldepth_vert,
	pbr_frag: pbr_frag,
	pbr_vert: pbr_vert,
	pbr2_frag: pbr2_frag,
	pbr2_vert: pbr_vert,
	phong_frag: phong_frag,
	phong_vert: phong_vert,
	point_frag: point_frag,
	point_vert: point_vert
};