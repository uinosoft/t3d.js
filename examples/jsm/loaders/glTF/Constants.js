import {
	TEXTURE_FILTER,
	TEXTURE_WRAP,
} from 't3d';

export const ATTRIBUTES = {
	POSITION: 'a_Position',
	NORMAL: 'a_Normal',
	TANGENT: 'a_Tangent',
	TEXCOORD_0: 'a_Uv',
	TEXCOORD_1: 'a_Uv2',
	TEXCOORD_2: 'a_Uv3',
	TEXCOORD_3: 'a_Uv4',
	TEXCOORD_4: 'a_Uv5',
	TEXCOORD_5: 'a_Uv6',
	TEXCOORD_6: 'a_Uv7',
	TEXCOORD_7: 'a_Uv8',
	COLOR_0: 'a_Color',
	WEIGHTS_0: 'skinWeight',
	JOINTS_0: 'skinIndex',

	TEXCOORD0: 'a_Uv', // deprecated
	TEXCOORD: 'a_Uv', // deprecated
	COLOR0: 'a_Color', // deprecated
	COLOR: 'a_Color', // deprecated
	WEIGHT: 'skinWeight', // deprecated
	JOINT: 'skinIndex' // deprecated
};

export const ALPHA_MODES = {
	OPAQUE: 'OPAQUE',
	MASK: 'MASK',
	BLEND: 'BLEND'
};

export const PATH_PROPERTIES = {
	scale: 'scale',
	translation: 'position',
	rotation: 'quaternion',
	weights: 'morphTargetInfluences'
};

export const ACCESSOR_TYPE_SIZES = {
	'SCALAR': 1,
	'VEC2': 2,
	'VEC3': 3,
	'VEC4': 4,
	'MAT2': 4,
	'MAT3': 9,
	'MAT4': 16
};

export const ACCESSOR_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};

export const WEBGL_FILTERS = {
	9728: TEXTURE_FILTER.NEAREST,
	9729: TEXTURE_FILTER.LINEAR,
	9984: TEXTURE_FILTER.NEAREST_MIPMAP_NEAREST,
	9985: TEXTURE_FILTER.LINEAR_MIPMAP_NEAREST,
	9986: TEXTURE_FILTER.NEAREST_MIPMAP_LINEAR,
	9987: TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR
};

export const WEBGL_WRAPPINGS = {
	33071: TEXTURE_WRAP.CLAMP_TO_EDGE,
	33648: TEXTURE_WRAP.MIRRORED_REPEAT,
	10497: TEXTURE_WRAP.REPEAT
};

export const WEBGL_DRAW_MODES = {
	POINTS: 0,
	LINES: 1,
	LINE_LOOP: 2,
	LINE_STRIP: 3,
	TRIANGLES: 4,
	TRIANGLE_STRIP: 5,
	TRIANGLE_FAN: 6,
};