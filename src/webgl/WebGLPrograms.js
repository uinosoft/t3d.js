import { WebGLProgram } from './WebGLProgram.js';
import { MATERIAL_TYPE, TEXEL_ENCODING_TYPE, SHADOW_TYPE, SHADING_TYPE, VERTEX_COLOR, DRAW_SIDE } from '../const.js';
import { ShaderChunk } from '../shaders/ShaderChunk.js';
import { ShaderLib } from '../shaders/ShaderLib.js';

class WebGLPrograms {

	constructor(gl, state, capabilities) {
		this._gl = gl;
		this._state = state;
		this._capabilities = capabilities;

		this._programs = [];
	}

	getProgram(material, props, programCode, compileOptions) {
		const programs = this._programs;

		let program;

		for (let p = 0, pl = programs.length; p < pl; p++) {
			const programInfo = programs[p];
			if (programInfo.code === programCode) {
				program = programInfo;
				++program.usedTimes;
				break;
			}
		}

		if (program === undefined) {
			const customDefines = generateDefines(material.defines);

			const vertexShader = ShaderLib[material.type + '_vert'] || material.vertexShader || ShaderLib.basic_vert;
			const fragmentShader = ShaderLib[material.type + '_frag'] || material.fragmentShader || ShaderLib.basic_frag;

			program = createProgram(this._gl, customDefines, props, vertexShader, fragmentShader);
			program.name = props.shaderName;
			program.compile(compileOptions);
			program.code = programCode;

			programs.push(program);
		}

		return program;
	}

	releaseProgram(program) {
		if (--program.usedTimes === 0) {
			const programs = this._programs;

			// Remove from unordered set
			const index = programs.indexOf(program);
			programs[index] = programs[programs.length - 1];
			programs.pop();

			// Free WebGL resources
			program.dispose(this._gl);
		}
	}

	generateProps(material, object, lightingState, renderStates) {
		const state = this._state;
		const capabilities = this._capabilities;

		const fog = material.fog ? renderStates.scene.fog : null;
		const envMap = material.envMap !== undefined ? (material.envMap || renderStates.scene.environment) : null;
		const logarithmicDepthBuffer = renderStates.scene.logarithmicDepthBuffer;
		const disableShadowSampler = renderStates.scene.disableShadowSampler;
		const numClippingPlanes = (material.clippingPlanes && material.clippingPlanes.length > 0) ? material.clippingPlanes.length : renderStates.scene.numClippingPlanes;

		const HAS_CLEARCOAT = material.clearcoat > 0;

		const HAS_DIFFUSEMAP = !!material.diffuseMap;
		const HAS_ALPHAMAP = !!material.alphaMap;
		const HAS_EMISSIVEMAP = !!material.emissiveMap;
		const HAS_AOMAP = !!material.aoMap;
		const HAS_NORMALMAP = !!material.normalMap;
		const HAS_BUMPMAP = !!material.bumpMap;
		const HAS_SPECULARMAP = !!material.specularMap;
		const HAS_ROUGHNESSMAP = !!material.roughnessMap;
		const HAS_METALNESSMAP = !!material.metalnessMap;
		const HAS_GLOSSINESSMAP = !!material.glossinessMap;

		const HAS_ENVMAP = !!envMap;

		const HAS_CLEARCOATMAP = HAS_CLEARCOAT && !!material.clearcoatMap;
		const HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !!material.clearcoatRoughnessMap;
		const HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !!material.clearcoatNormalMap;

		_activeMapCoords = material.extUvCoordMask; // reset

		const props = {}; // cache this props?

		props.shaderName = (material.type === MATERIAL_TYPE.SHADER && material.shaderName) ? material.shaderName : material.type;

		// capabilities

		props.version = capabilities.version;
		props.precision = material.precision || capabilities.maxPrecision;
		props.useStandardDerivatives = capabilities.version >= 2 || !!capabilities.getExtension('OES_standard_derivatives') || !!capabilities.getExtension('GL_OES_standard_derivatives');
		props.useShaderTextureLOD = capabilities.version >= 2 || !!capabilities.getExtension('EXT_shader_texture_lod');

		// maps

		props.useDiffuseMap = HAS_DIFFUSEMAP;
		props.useAlphaMap = HAS_ALPHAMAP;
		props.useEmissiveMap = HAS_EMISSIVEMAP;
		props.useAOMap = HAS_AOMAP;
		props.useNormalMap = HAS_NORMALMAP;
		props.useBumpMap = HAS_BUMPMAP;
		props.useSpecularMap = HAS_SPECULARMAP;
		props.useRoughnessMap = HAS_ROUGHNESSMAP;
		props.useMetalnessMap = HAS_METALNESSMAP;
		props.useGlossinessMap = HAS_GLOSSINESSMAP;

		props.useEnvMap = HAS_ENVMAP;
		props.envMapCombine = HAS_ENVMAP && material.envMapCombine;

		props.useClearcoat = HAS_CLEARCOAT;
		props.useClearcoatMap = HAS_CLEARCOATMAP;
		props.useClearcoatRoughnessMap = HAS_CLEARCOAT_ROUGHNESSMAP;
		props.useClearcoatNormalMap = HAS_CLEARCOAT_NORMALMAP;

		props.diffuseMapUv = HAS_DIFFUSEMAP && getUVChannel(material.diffuseMapCoord);
		props.alphaMapUv = HAS_ALPHAMAP && getUVChannel(material.alphaMapCoord);
		props.emissiveMapUv = HAS_EMISSIVEMAP && getUVChannel(material.emissiveMapCoord);
		props.aoMapUv = HAS_AOMAP && getUVChannel(material.aoMapCoord);

		if (HAS_NORMALMAP || HAS_BUMPMAP || HAS_SPECULARMAP || HAS_ROUGHNESSMAP || HAS_METALNESSMAP || HAS_GLOSSINESSMAP || HAS_CLEARCOATMAP || HAS_CLEARCOAT_ROUGHNESSMAP || HAS_CLEARCOAT_NORMALMAP) {
			_activeMapCoords |= 1 << 0; // these maps use uv coord 0 by default
		}

		props.activeMapCoords = _activeMapCoords;

		// lights

		lightingState.setProgramProps(props, object.receiveShadow);

		props.useShadowSampler = capabilities.version >= 2 && !disableShadowSampler;
		props.shadowType = object.shadowType;
		if (!props.useShadowSampler &&
			(
				props.shadowType == SHADOW_TYPE.PCF3_SOFT ||
				props.shadowType == SHADOW_TYPE.PCF5_SOFT ||
				props.shadowType == SHADOW_TYPE.PCSS16_SOFT ||
				props.shadowType == SHADOW_TYPE.PCSS32_SOFT ||
				props.shadowType == SHADOW_TYPE.PCSS64_SOFT
			)
		) {
			props.shadowType = SHADOW_TYPE.VOGEL5_SOFT;

			if (props.useShadow) {
				console.warn('WebGLPrograms: PCF and PCSS shadow type need shadow sampler support, falling back to VOGEL5_SOFT.');
			}
		}

		props.dithering = material.dithering;

		// encoding

		const currentRenderTarget = state.currentRenderTarget;
		props.gammaFactor = renderStates.gammaFactor;
		props.outputEncoding = currentRenderTarget.texture ? getTextureEncodingFromMap(currentRenderTarget.texture) : renderStates.outputEncoding;
		props.diffuseMapEncoding = getTextureEncodingFromMap(material.diffuseMap || material.cubeMap);
		props.envMapEncoding = getTextureEncodingFromMap(envMap);
		props.emissiveMapEncoding = getTextureEncodingFromMap(material.emissiveMap);

		// other

		props.alphaTest = material.alphaTest > 0;
		props.premultipliedAlpha = material.premultipliedAlpha;
		props.useVertexColors = material.vertexColors;
		props.useVertexTangents = !!material.normalMap && material.vertexTangents;
		props.numClippingPlanes = numClippingPlanes;
		props.flatShading = material.shading === SHADING_TYPE.FLAT_SHADING;
		props.fog = !!fog;
		props.fogExp2 = !!fog && fog.isFogExp2;
		props.sizeAttenuation = material.sizeAttenuation;
		props.doubleSided = material.side === DRAW_SIDE.DOUBLE;
		props.flipSided = material.side === DRAW_SIDE.BACK;
		props.packDepthToRGBA = material.packToRGBA;
		props.logarithmicDepthBuffer = !!logarithmicDepthBuffer;
		props.rendererExtensionFragDepth = capabilities.version >= 2 || !!capabilities.getExtension('EXT_frag_depth');

		// morph targets

		props.morphTargets = !!object.morphTargetInfluences;
		props.morphNormals = !!object.morphTargetInfluences && object.geometry.morphAttributes.normal;

		// skinned mesh

		const useSkinning = object.isSkinnedMesh && object.skeleton;
		const maxVertexUniformVectors = capabilities.maxVertexUniformVectors;
		const useVertexTexture = capabilities.maxVertexTextures > 0 && (!!capabilities.getExtension('OES_texture_float') || capabilities.version >= 2);
		let maxBones = 0;
		if (useVertexTexture) {
			maxBones = 1024;
		} else {
			maxBones = object.skeleton ? object.skeleton.bones.length : 0;
			if (maxBones * 16 > maxVertexUniformVectors) {
				console.warn('Program: too many bones (' + maxBones + '), current cpu only support ' + Math.floor(maxVertexUniformVectors / 16) + ' bones!!');
				maxBones = Math.floor(maxVertexUniformVectors / 16);
			}
		}
		props.useSkinning = useSkinning;
		props.bonesNum = maxBones;
		props.useVertexTexture = useVertexTexture;

		return props;
	}

	generateProgramCode(props, material) {
		let code = '';

		for (const key in props) {
			code += props[key] + '_';
		}

		for (const name in material.defines) {
			code += name + '_' + material.defines[name] + '_';
		}

		// If the material type is SHADER and there is no shader Name,
		// use the entire shader code as part of the signature
		if (material.type === MATERIAL_TYPE.SHADER && !material.shaderName) {
			code += material.vertexShader;
			code += material.fragmentShader;
		}

		return code;
	}

}

// Helper functions

function generateDefines(defines) {
	const chunks = [];

	for (const name in defines) {
		const value = defines[name];
		if (value === false) continue;
		chunks.push('#define ' + name + ' ' + value);
	}

	return chunks.join('\n');
}

let _activeMapCoords = 0; // bit mask

function getUVChannel(coord) {
	_activeMapCoords |= (1 << coord);

	if (coord === 0) return 'a_Uv';

	return `a_Uv${coord + 1}`; // a_Uv2, a_Uv3, a_Uv4, ...
}

function getTextureEncodingFromMap(map) {
	let encoding;

	if (!map) {
		encoding = TEXEL_ENCODING_TYPE.LINEAR;
	} else if (map.encoding) {
		encoding = map.encoding;
	}

	return encoding;
}

function getEncodingComponents(encoding) {
	switch (encoding) {
		case TEXEL_ENCODING_TYPE.LINEAR:
			return ['Linear', '(value)'];
		case TEXEL_ENCODING_TYPE.SRGB:
			return ['sRGB', '(value)'];
		case TEXEL_ENCODING_TYPE.GAMMA:
			return ['Gamma', '(value, float(GAMMA_FACTOR))'];
		default:
			console.error('unsupported encoding: ' + encoding);
	}
}

function getTexelDecodingFunction(functionName, encoding) {
	const components = getEncodingComponents(encoding);
	return 'vec4 ' + functionName + '(vec4 value) { return ' + components[0] + 'ToLinear' + components[1] + '; }';
}

function getTexelEncodingFunction(functionName, encoding) {
	const components = getEncodingComponents(encoding);
	return 'vec4 ' + functionName + '(vec4 value) { return LinearTo' + components[0] + components[1] + '; }';
}

function uvAttributes(activeMapCoords) {
	let str = '';
	for (let i = 1; i < 8; i++) { // skip uv0
		if (activeMapCoords & (1 << i)) {
			str += 'attribute vec2 a_Uv' + (i + 1) + ';';
			if (i !== 7) str += '\n';
		}
	}
	return str;
}

const shadowDefines = {
	[SHADOW_TYPE.HARD]: '#define USE_HARD_SHADOW',
	[SHADOW_TYPE.POISSON_SOFT]: '#define USE_POISSON_SOFT_SHADOW',
	[SHADOW_TYPE.VOGEL5_SOFT]: '#define USE_VOGEL5_SOFT_SHADOW',
	[SHADOW_TYPE.PCF3_SOFT]: '#define USE_PCF3_SOFT_SHADOW',
	[SHADOW_TYPE.PCF5_SOFT]: '#define USE_PCF5_SOFT_SHADOW',
	[SHADOW_TYPE.PCSS16_SOFT]: [
		'#define USE_PCSS16_SOFT_SHADOW',
		'#define USE_PCSS_SOFT_SHADOW'
	].join('\n'),
	[SHADOW_TYPE.PCSS32_SOFT]: [
		'#define USE_PCSS32_SOFT_SHADOW',
		'#define USE_PCSS_SOFT_SHADOW'
	].join('\n'),
	[SHADOW_TYPE.PCSS64_SOFT]: [
		'#define USE_PCSS64_SOFT_SHADOW',
		'#define USE_PCSS_SOFT_SHADOW'
	].join('\n')
};

function getShadowTypeDefines(shadowType) {
	if (shadowDefines[shadowType]) {
		return shadowDefines[shadowType];
	} else {
		console.warn('unsupported shadow type: ' + shadowType);
		return shadowDefines[SHADOW_TYPE.HARD];
	}
}

function createProgram(gl, defines, props, vertex, fragment) {
	let prefixVertex = [
		'precision ' + props.precision + ' float;',
		'precision ' + props.precision + ' int;',
		// depth texture may have precision problem on iOS device.
		'precision ' + props.precision + ' sampler2D;',
		(props.version >= 2) ? 'precision ' + props.precision + ' isampler2D;' : '',
		(props.version >= 2) ? 'precision ' + props.precision + ' usampler2D;' : '',

		'#define SHADER_NAME ' + props.shaderName,

		defines,

		(props.version >= 2) ? '#define WEBGL2' : '',

		// maps

		props.useDiffuseMap ? '#define USE_DIFFUSE_MAP' : '',
		props.useAlphaMap ? '#define USE_ALPHA_MAP' : '',
		props.useEmissiveMap ? '#define USE_EMISSIVEMAP' : '',
		props.useAOMap ? '#define USE_AOMAP' : '',
		props.useNormalMap ? '#define USE_NORMAL_MAP' : '',
		props.useBumpMap ? '#define USE_BUMPMAP' : '',
		props.useSpecularMap ? '#define USE_SPECULARMAP' : '',
		props.useRoughnessMap ? '#define USE_ROUGHNESSMAP' : '',
		props.useMetalnessMap ? '#define USE_METALNESSMAP' : '',
		props.useGlossinessMap ? '#define USE_GLOSSINESSMAP' : '',

		props.useEnvMap ? '#define USE_ENV_MAP' : '',

		props.diffuseMapUv ? '#define DIFFUSEMAP_UV ' + props.diffuseMapUv : '',
		props.alphaMapUv ? '#define ALPHAMAP_UV ' + props.alphaMapUv : '',
		props.emissiveMapUv ? '#define EMISSIVEMAP_UV ' + props.emissiveMapUv : '',
		props.aoMapUv ? '#define AOMAP_UV ' + props.aoMapUv : '',

		props.activeMapCoords > 0 ? '#define USE_UV' : '',
		props.activeMapCoords & 1 ? '#define USE_UV1' : '',

		uvAttributes(props.activeMapCoords),

		// lights

		props.useAmbientLight ? '#define USE_AMBIENT_LIGHT' : '',
		props.useSphericalHarmonicsLight ? '#define USE_SPHERICALHARMONICS_LIGHT' : '',
		props.useShadow ? '#define USE_SHADOW' : '',

		// other

		props.useVertexColors == VERTEX_COLOR.RGB ? '#define USE_VCOLOR_RGB' : '',
		props.useVertexColors == VERTEX_COLOR.RGBA ? '#define USE_VCOLOR_RGBA' : '',
		props.useVertexTangents ? '#define USE_TANGENT' : '',
		props.flatShading ? '#define FLAT_SHADED' : '',
		props.fog ? '#define USE_FOG' : '',
		props.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',
		props.flipSided ? '#define FLIP_SIDED' : '',
		props.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
		(props.logarithmicDepthBuffer && props.rendererExtensionFragDepth) ? '#define USE_LOGDEPTHBUF_EXT' : '',

		// morph targets

		props.morphTargets ? '#define USE_MORPHTARGETS' : '',
		props.morphNormals && props.flatShading === false ? '#define USE_MORPHNORMALS' : '',

		// skinned mesh

		props.useSkinning ? '#define USE_SKINNING' : '',
		(props.bonesNum > 0) ? ('#define MAX_BONES ' + props.bonesNum) : '',
		props.useVertexTexture ? '#define BONE_TEXTURE' : '',
		'\n'
	].filter(filterEmptyLine).join('\n');

	let prefixFragment = [
		// use dfdx and dfdy must enable OES_standard_derivatives
		(props.useStandardDerivatives && props.version < 2) ? '#extension GL_OES_standard_derivatives : enable' : '',
		(props.useShaderTextureLOD && props.version < 2) ? '#extension GL_EXT_shader_texture_lod : enable' : '',
		(props.logarithmicDepthBuffer && props.rendererExtensionFragDepth && props.version < 2) ? '#extension GL_EXT_frag_depth : enable' : '',

		'precision ' + props.precision + ' float;',
		'precision ' + props.precision + ' int;',
		// depth texture may have precision problem on iOS device.
		'precision ' + props.precision + ' sampler2D;',
		(props.version >= 2) ? 'precision ' + props.precision + ' isampler2D;' : '',
		(props.version >= 2) ? 'precision ' + props.precision + ' usampler2D;' : '',
		(props.version >= 2) ? 'precision ' + props.precision + ' sampler2DShadow;' : '',
		(props.version >= 2) ? 'precision ' + props.precision + ' samplerCubeShadow;' : '',

		'#define SHADER_NAME ' + props.shaderName,

		'#define PI 3.14159265359',
		'#define EPSILON 1e-6',
		'float pow2(const in float x) { return x * x; }',
		'#define LOG2 1.442695',
		'#define RECIPROCAL_PI 0.31830988618',
		'#define saturate(a) clamp(a, 0.0, 1.0)',
		'#define whiteCompliment(a) (1.0 - saturate(a))',

		// expects values in the range of [0,1] x [0,1], returns values in the [0,1] range.
		// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
		'highp float rand(const in vec2 uv) {',
		'	const highp float a = 12.9898, b = 78.233, c = 43758.5453;',
		'	highp float dt = dot(uv.xy, vec2(a, b)), sn = mod(dt, PI);',
		'	return fract(sin(sn) * c);',
		'}',

		defines,

		(props.version >= 2) ? '#define WEBGL2' : '',
		props.useShadowSampler ? '#define USE_SHADOW_SAMPLER' : '#define sampler2DShadow sampler2D',
		props.useShaderTextureLOD ? '#define TEXTURE_LOD_EXT' : '',

		// maps

		props.useDiffuseMap ? '#define USE_DIFFUSE_MAP' : '',
		props.useAlphaMap ? '#define USE_ALPHA_MAP' : '',
		props.useEmissiveMap ? '#define USE_EMISSIVEMAP' : '',
		props.useAOMap ? '#define USE_AOMAP' : '',
		props.useNormalMap ? '#define USE_NORMAL_MAP' : '',
		props.useBumpMap ? '#define USE_BUMPMAP' : '',
		props.useSpecularMap ? '#define USE_SPECULARMAP' : '',
		props.useRoughnessMap ? '#define USE_ROUGHNESSMAP' : '',
		props.useMetalnessMap ? '#define USE_METALNESSMAP' : '',
		props.useGlossinessMap ? '#define USE_GLOSSINESSMAP' : '',

		props.useEnvMap ? '#define USE_ENV_MAP' : '',
		props.envMapCombine ? '#define ' + props.envMapCombine : '',

		props.useClearcoat ? '#define USE_CLEARCOAT' : '',
		props.useClearcoatMap ? '#define USE_CLEARCOATMAP' : '',
		props.useClearcoatRoughnessMap ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
		props.useClearcoatNormalMap ? '#define USE_CLEARCOAT_NORMALMAP' : '',

		props.activeMapCoords & 1 ? '#define USE_UV1' : '',

		// lights

		props.useAmbientLight ? '#define USE_AMBIENT_LIGHT' : '',
		props.useSphericalHarmonicsLight ? '#define USE_SPHERICALHARMONICS_LIGHT' : '',
		props.useClusteredLights ? '#define USE_CLUSTERED_LIGHTS' : '',
		props.useShadow ? '#define USE_SHADOW' : '',
		getShadowTypeDefines(props.shadowType),

		props.dithering ? '#define DITHERING' : '',

		// encoding

		ShaderChunk['encodings_pars_frag'],
		'#define GAMMA_FACTOR ' + props.gammaFactor,
		getTexelEncodingFunction('linearToOutputTexel', props.outputEncoding),
		getTexelDecodingFunction('mapTexelToLinear', props.diffuseMapEncoding),
		props.useEnvMap ? getTexelDecodingFunction('envMapTexelToLinear', props.envMapEncoding) : '',
		props.useEmissiveMap ? getTexelDecodingFunction('emissiveMapTexelToLinear', props.emissiveMapEncoding) : '',

		// other

		props.alphaTest ? '#define ALPHATEST' : '',
		props.premultipliedAlpha ? '#define USE_PREMULTIPLIED_ALPHA' : '',
		props.useVertexColors == VERTEX_COLOR.RGB ? '#define USE_VCOLOR_RGB' : '',
		props.useVertexColors == VERTEX_COLOR.RGBA ? '#define USE_VCOLOR_RGBA' : '',
		props.useVertexTangents ? '#define USE_TANGENT' : '',
		props.flatShading ? '#define FLAT_SHADED' : '',
		props.fog ? '#define USE_FOG' : '',
		props.fogExp2 ? '#define USE_EXP2_FOG' : '',
		props.doubleSided ? '#define DOUBLE_SIDED' : '',
		props.packDepthToRGBA ? '#define DEPTH_PACKING_RGBA' : '',
		props.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
		(props.logarithmicDepthBuffer && props.rendererExtensionFragDepth) ? '#define USE_LOGDEPTHBUF_EXT' : '',
		'\n'
	].filter(filterEmptyLine).join('\n');

	let vshader = vertex;
	let fshader = fragment;

	vshader = parseIncludes(vshader);
	fshader = parseIncludes(fshader);

	vshader = replaceLightNums(vshader, props);
	fshader = replaceLightNums(fshader, props);

	vshader = replaceClippingPlaneNums(vshader, props);
	fshader = replaceClippingPlaneNums(fshader, props);

	vshader = unrollLoops(vshader);
	fshader = unrollLoops(fshader);

	// enable glsl version 300 es for webgl ^2.0
	if (props.version > 1) {
		// extract vertex extensions and insert after version strings later
		// because it must be at the top of the shader
		const vertexExtensions = vshader.match(extensionPattern);
		if (vertexExtensions) {
			vshader = vshader.replace(extensionPattern, '');
		}

		prefixVertex = [
			'#version 300 es',
			vertexExtensions ? vertexExtensions.join('\n') : '',
			'#define attribute in',
			'#define varying out',
			'#define texture2D texture'
		].join('\n') + '\n' + prefixVertex;

		fshader = fshader.replace('#extension GL_EXT_draw_buffers : require', '');

		// replace gl_FragData by layout
		let i = 0;
		const layout = [];
		while (fshader.indexOf('gl_FragData[' + i + ']') > -1) {
			fshader = fshader.replace('gl_FragData[' + i + ']', 'pc_fragData' + i);
			layout.push('layout(location = ' + i + ') out highp vec4 pc_fragData' + i + ';');
			i++;
		}

		prefixFragment = [
			'#version 300 es',
			'#define varying in',
			(fshader.indexOf('layout') > -1 || layout.length > 0) ? '' : 'out highp vec4 pc_fragColor;',
			'#define gl_FragColor pc_fragColor',
			'#define gl_FragDepthEXT gl_FragDepth',
			'#define texture2D texture',
			'#define textureCube texture',
			'#define texture2DProj textureProj',
			'#define texture2DLodEXT textureLod',
			'#define texture2DProjLodEXT textureProjLod',
			'#define textureCubeLodEXT textureLod',
			'#define texture2DGradEXT textureGrad',
			'#define texture2DProjGradEXT textureProjGrad',
			'#define textureCubeGradEXT textureGrad',
			layout.join('\n')
		].join('\n') + '\n' + prefixFragment;
	}

	vshader = prefixVertex + vshader;
	fshader = prefixFragment + fshader;

	return new WebGLProgram(gl, vshader, fshader);
}

const parseIncludes = function(string) {
	const pattern = /#include +<([\w\d.]+)>/g;

	function replace(match, include) {
		const replace = ShaderChunk[include];

		if (replace === undefined) {
			throw new Error('Can not resolve #include <' + include + '>');
		}

		return parseIncludes(replace);
	}

	return string.replace(pattern, replace);
};

function filterEmptyLine(string) {
	return string !== '';
}

function replaceLightNums(string, parameters) {
	return string
		.replace(/NUM_HEMI_LIGHTS/g, parameters.hemisphereLightNum)
		.replace(/NUM_DIR_LIGHTS/g, parameters.directLightNum)
		.replace(/NUM_SPOT_LIGHTS/g, parameters.spotLightNum)
		.replace(/NUM_POINT_LIGHTS/g, parameters.pointLightNum)
		.replace(/NUM_RECT_AREA_LIGHTS/g, parameters.rectAreaLightNum)
		.replace(/NUM_DIR_SHADOWS/g, parameters.directShadowNum)
		.replace(/NUM_SPOT_SHADOWS/g, parameters.spotShadowNum)
		.replace(/NUM_POINT_SHADOWS/g, parameters.pointShadowNum);
}

function replaceClippingPlaneNums(string, parameters) {
	return string
		.replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes);
}

const unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function loopReplacer(match, start, end, snippet) {
	let string = '';

	for (let i = parseInt(start); i < parseInt(end); i++) {
		string += snippet
			.replace(/\[\s*i\s*\]/g, '[' + i + ']')
			.replace(/UNROLLED_LOOP_INDEX/g, i);
	}

	return string;
}

function unrollLoops(string) {
	return string
		.replace(unrollLoopPattern, loopReplacer);
}

const extensionPattern = /#extension .*/g;

export { WebGLPrograms };