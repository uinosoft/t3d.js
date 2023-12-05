/**
 * Enum for material Type.
 * @memberof t3d
 * @readonly
 * @enum {String}
 */
const MATERIAL_TYPE = {
	BASIC: 'basic',
	LAMBERT: 'lambert',
	PHONG: 'phong',
	PBR: 'pbr',
	PBR2: 'pbr2',
	POINT: 'point',
	LINE: 'line',
	SHADER: 'shader',
	DEPTH: 'depth',
	DISTANCE: 'distance'
};

export { MATERIAL_TYPE };

/**
 * Enum for blend Type.
 * @memberof t3d
 * @readonly
 * @enum {String}
 */
const BLEND_TYPE = {
	NONE: 'none',
	NORMAL: 'normal',
	ADD: 'add',
	SUB: 'sub',
	MUL: 'mul',
	CUSTOM: 'custom'
};

export { BLEND_TYPE };

/**
 * Enum for blend equation.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const BLEND_EQUATION = {
	ADD: 100,
	SUBTRACT: 101,
	REVERSE_SUBTRACT: 102,
	/** Only webgl2 */
	MIN: 103,
	MAX: 104
};

export { BLEND_EQUATION };

/**
 * Enum for blend factor.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const BLEND_FACTOR = {
	ZERO: 200,
	ONE: 201,
	SRC_COLOR: 202,
	SRC_ALPHA: 203,
	SRC_ALPHA_SATURATE: 204,
	DST_COLOR: 205,
	DST_ALPHA: 206,
	ONE_MINUS_SRC_COLOR: 207,
	ONE_MINUS_SRC_ALPHA: 208,
	ONE_MINUS_DST_COLOR: 209,
	ONE_MINUS_DST_ALPHA: 210
};

export { BLEND_FACTOR };

/**
 * Enum for cull face Type.
 * @memberof t3d
 * @readonly
 * @enum {String}
 */
const CULL_FACE_TYPE = {
	NONE: 'none',
	FRONT: 'front',
	BACK: 'back',
	FRONT_AND_BACK: 'front_and_back'
};

export { CULL_FACE_TYPE };

/**
 * Enum for draw side.
 * @memberof t3d
 * @readonly
 * @enum {String}
 */
const DRAW_SIDE = {
	FRONT: 'front',
	BACK: 'back',
	DOUBLE: 'double'
};

export { DRAW_SIDE };

/**
 * Enum for shading side.
 * @memberof t3d
 * @readonly
 * @enum {String}
 */
const SHADING_TYPE = {
	SMOOTH_SHADING: 'smooth_shading',
	FLAT_SHADING: 'flat_shading'
};

export { SHADING_TYPE };

/**
 * Enum for pixel format.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const PIXEL_FORMAT = {
	DEPTH_COMPONENT: 1000,
	DEPTH_STENCIL: 1001,
	STENCIL_INDEX8: 1002,
	ALPHA: 1003,
	RED: 1004,
	RGB: 1005,
	RGBA: 1006,
	LUMINANCE: 1007,
	LUMINANCE_ALPHA: 1008,
	/** Only webgl2 */
	RED_INTEGER: 1010,
	RG: 1011,
	RG_INTEGER: 1012,
	RGB_INTEGER: 1013,
	RGBA_INTEGER: 1014,
	/** Only internal formats and webgl2 */
	R32F: 1100,
	R16F: 1101,
	R8: 1102,
	RG32F: 1103,
	RG16F: 1104,
	RG8: 1105,
	RGB32F: 1106,
	RGB16F: 1107,
	RGB8: 1108,
	RGBA32F: 1109,
	RGBA16F: 1110,
	RGBA8: 1111,
	RGBA4: 1112,
	RGB5_A1: 1113,
	DEPTH_COMPONENT32F: 1114,
	DEPTH_COMPONENT24: 1115,
	DEPTH_COMPONENT16: 1116,
	DEPTH24_STENCIL8: 1117,
	DEPTH32F_STENCIL8: 1118,
	/** For compressed texture formats */
	RGB_S3TC_DXT1: 1200,
	RGBA_S3TC_DXT1: 1201,
	RGBA_S3TC_DXT3: 1202,
	RGBA_S3TC_DXT5: 1203,
	RGB_PVRTC_4BPPV1: 1204,
	RGB_PVRTC_2BPPV1: 1205,
	RGBA_PVRTC_4BPPV1: 1206,
	RGBA_PVRTC_2BPPV1: 1207,
	RGB_ETC1: 1208,
	RGBA_ASTC_4x4: 1209,
	RGBA_BPTC: 1210
};

export { PIXEL_FORMAT };

/**
 * Enum for pixel Type.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const PIXEL_TYPE = {
	UNSIGNED_BYTE: 1500,
	UNSIGNED_SHORT_5_6_5: 1501,
	UNSIGNED_SHORT_4_4_4_4:	1502,
	UNSIGNED_SHORT_5_5_5_1: 1503,
	UNSIGNED_SHORT: 1504,
	UNSIGNED_INT: 1505,
	UNSIGNED_INT_24_8: 1506,
	FLOAT: 1507,
	HALF_FLOAT: 1508,
	FLOAT_32_UNSIGNED_INT_24_8_REV: 1509,
	BYTE: 1510,
	SHORT: 1511,
	INT: 1512
};

export { PIXEL_TYPE };

/**
 * Enum for texture filter.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const TEXTURE_FILTER = {
	NEAREST: 1600,
	LINEAR: 1601,
	NEAREST_MIPMAP_NEAREST: 1602,
	LINEAR_MIPMAP_NEAREST: 1603,
	NEAREST_MIPMAP_LINEAR: 1604,
	LINEAR_MIPMAP_LINEAR: 1605
};

export { TEXTURE_FILTER };

/**
 * Enum for texture wrap.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const TEXTURE_WRAP = {
	REPEAT:	1700,
	CLAMP_TO_EDGE: 1701,
	MIRRORED_REPEAT: 1702
};

export { TEXTURE_WRAP };

/**
 * Enum for compare function.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const COMPARE_FUNC = {
	LEQUAL: 0x0203,
	GEQUAL: 0x0206,
	LESS: 0x0201,
	GREATER: 0x0204,
	EQUAL: 0x0202,
	NOTEQUAL: 0x0205,
	ALWAYS: 0x0207,
	NEVER: 0x0200
};

export { COMPARE_FUNC };

/**
 * Enum for operation.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const OPERATION = {
	KEEP: 0x1E00,
	REPLACE: 0x1E01,
	INCR: 0x1E02,
	DECR: 0x1E03,
	INVERT: 0x150A,
	INCR_WRAP: 0x8507,
	DECR_WRAP: 0x8508
};

export { OPERATION };

/**
 * Enum for Shadow Type.
 * @memberof t3d
 * @readonly
 * @enum {String}
 */
const SHADOW_TYPE = {
	HARD: 'hard',
	POISSON_SOFT: 'poisson_soft',
	PCF3_SOFT: 'pcf3_soft',
	PCF5_SOFT: 'pcf5_soft',
	/** Only webgl2 */
	PCSS16_SOFT: 'pcss16_soft',
	PCSS32_SOFT: 'pcss32_soft',
	PCSS64_SOFT: 'pcss64_soft'
};

export { SHADOW_TYPE };

/**
 * Enum for Texel Encoding Type.
 * @memberof t3d
 * @readonly
 * @enum {String}
 */
const TEXEL_ENCODING_TYPE = {
	LINEAR: 'linear',
	SRGB: 'sRGB',
	GAMMA: 'Gamma'
};

export { TEXEL_ENCODING_TYPE };

/**
 * Enum for Envmap Combine Type.
 * @memberof t3d
 * @readonly
 * @enum {String}
 */
const ENVMAP_COMBINE_TYPE = {
	MULTIPLY: 'ENVMAP_BLENDING_MULTIPLY',
	MIX: 'ENVMAP_BLENDING_MIX',
	ADD: 'ENVMAP_BLENDING_ADD'
};

export { ENVMAP_COMBINE_TYPE };

/**
 * Enum for Draw Mode.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const DRAW_MODE = {
	POINTS: 0,
	LINES: 1,
	LINE_LOOP: 2,
	LINE_STRIP: 3,
	TRIANGLES: 4,
	TRIANGLE_STRIP: 5,
	TRIANGLE_FAN: 6
};

export { DRAW_MODE };

/**
 * Enum for Vertex Color.
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const VERTEX_COLOR = {
	NONE: 0,
	RGB: 1,
	RGBA: 2
};

export { VERTEX_COLOR };

/**
 * Enum for ATTACHMENT
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const ATTACHMENT = {
	COLOR_ATTACHMENT0: 2000,
	COLOR_ATTACHMENT1: 2001,
	COLOR_ATTACHMENT2: 2002,
	COLOR_ATTACHMENT3: 2003,
	COLOR_ATTACHMENT4: 2004,
	COLOR_ATTACHMENT5: 2005,
	COLOR_ATTACHMENT6: 2006,
	COLOR_ATTACHMENT7: 2007,
	COLOR_ATTACHMENT8: 2008,
	COLOR_ATTACHMENT9: 2009,
	COLOR_ATTACHMENT10: 2010,
	COLOR_ATTACHMENT11: 2011,
	COLOR_ATTACHMENT12: 2012,
	COLOR_ATTACHMENT13: 2013,
	COLOR_ATTACHMENT14: 2014,
	COLOR_ATTACHMENT15: 2015,
	DEPTH_ATTACHMENT: 2020,
	STENCIL_ATTACHMENT: 2021,
	DEPTH_STENCIL_ATTACHMENT: 2030
};

export { ATTACHMENT };

/**
 * Enum for BUFFER_USAGE
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const BUFFER_USAGE = {
	STREAM_DRAW: 35040,
	STREAM_READ: 35041,
	STREAM_COPY: 35042,
	STATIC_DRAW: 35044,
	STATIC_READ: 35045,
	STATIC_COPY: 35046,
	DYNAMIC_DRAW: 35048,
	DYNAMIC_READ: 35049,
	DYNAMIC_COPY: 35050
};

export { BUFFER_USAGE };

/**
 * Enum for QUERY_TYPE
 * @memberof t3d
 * @readonly
 * @enum {Number}
 */
const QUERY_TYPE = {
	ANY_SAMPLES_PASSED: 7000,
	ANY_SAMPLES_PASSED_CONSERVATIVE: 7001,
	TIME_ELAPSED: 7002
};

export { QUERY_TYPE };