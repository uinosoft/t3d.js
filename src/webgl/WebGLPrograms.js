import { WebGLProgram } from './WebGLProgram.js';
import { MATERIAL_TYPE, TEXEL_ENCODING_TYPE, SHADOW_TYPE, SHADING_TYPE, VERTEX_COLOR, DRAW_SIDE } from '../const.js';
import { ShaderChunk } from '../shaders/ShaderChunk.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { HashStates } from '../render/HashStates.js';

class WebGLPrograms {

	constructor(gl, state, capabilities) {
		this._gl = gl;
		this._state = state;
		this._capabilities = capabilities;

		this._programs = [];
	}

	getProgram(material, object, renderStates, compileOptions) {
		const programs = this._programs;

		const parameters = generateParameters(this._state, this._capabilities, material, object, renderStates);
		const code = generateProgramCode(parameters, material);
		let program;

		for (let p = 0, pl = programs.length; p < pl; p++) {
			const programInfo = programs[p];
			if (programInfo.code === code) {
				program = programInfo;
				++program.usedTimes;
				break;
			}
		}

		if (program === undefined) {
			const customDefines = generateDefines(material.defines);

			const vertexShader = ShaderLib[material.type + '_vert'] || material.vertexShader || ShaderLib.basic_vert;
			const fragmentShader = ShaderLib[material.type + '_frag'] || material.fragmentShader || ShaderLib.basic_frag;

			program = createProgram(this._gl, customDefines, parameters, vertexShader, fragmentShader);
			program.compile(compileOptions);
			program.code = code;

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

}

// Program properties and code

function generateProgramCode(parameters, material) {
	let code = parameters.getHash() + '_';

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

function generateDefines(defines) {
	const chunks = [];

	for (const name in defines) {
		const value = defines[name];
		if (value === false) continue;
		chunks.push('#define ' + name + ' ' + value);
	}

	return chunks.join('\n');
}

const _parameters = new HashStates();

function generateParameters(state, capabilities, material, object, renderStates) {
	const lights = material.acceptLight ? renderStates.lights : null;
	const fog = material.fog ? renderStates.scene.fog : null;
	const envMap = material.envMap !== undefined ? (material.envMap || renderStates.scene.environment) : null;
	const logarithmicDepthBuffer = renderStates.scene.logarithmicDepthBuffer;
	const useShadowSampler = capabilities.version >= 2 && !renderStates.scene.disableShadowSampler;
	const shadowType = (!useShadowSampler && object.shadowType !== SHADING_TYPE.HARD) ? SHADOW_TYPE.POISSON_SOFT : object.shadowType;
	const numClippingPlanes = (material.clippingPlanes && material.clippingPlanes.length > 0) ? material.clippingPlanes.length : renderStates.scene.numClippingPlanes;

	const currentRenderTarget = state.currentRenderTarget;

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

	const parameters = _parameters
		// common
		.set('shaderName', (material.type === MATERIAL_TYPE.SHADER && material.shaderName) ? material.shaderName : material.type)
		// capabilities
		.set('version', capabilities.version)
		.set('precision', material.precision || capabilities.maxPrecision)
		.setBoolean('useStandardDerivatives', capabilities.version >= 2 || !!capabilities.getExtension('OES_standard_derivatives') || !!capabilities.getExtension('GL_OES_standard_derivatives'))
		.setBoolean('useShaderTextureLOD', capabilities.version >= 2 || !!capabilities.getExtension('EXT_shader_texture_lod'))
		// maps
		.set('useDiffuseMap', material.diffuseMap ? (material.diffuseMapCoord + 1) : 0)
		.set('useAlphaMap', material.alphaMap ? (material.alphaMapCoord + 1) : 0)
		.set('useEmissiveMap', material.emissiveMap ? (material.emissiveMapCoord + 1) : 0)
		.set('useAOMap', material.aoMap ? (material.aoMapCoord + 1) : 0)
		.setBoolean('useNormalMap', !!material.normalMap)
		.setBoolean('useBumpMap', !!material.bumpMap)
		.setBoolean('useSpecularMap', !!material.specularMap)
		.setBoolean('useRoughnessMap', !!material.roughnessMap)
		.setBoolean('useMetalnessMap', !!material.metalnessMap)
		.setBoolean('useGlossinessMap', !!material.glossinessMap)
		.setBoolean('useEnvMap', !!envMap)
		.set('envMapCombine', material.envMapCombine)
		// clearcoat
		.setBoolean('useClearcoat', material.clearcoat > 0)
		.setBoolean('useClearcoatMap', material.clearcoat > 0 && !!material.clearcoatMap)
		.setBoolean('useClearcoatRoughnessMap', material.clearcoat > 0 && !!material.clearcoatRoughnessMap)
		.setBoolean('useClearcoatNormalMap', material.clearcoat > 0 && !!material.clearcoatNormalMap)
		// lights
		.setBoolean('useAmbientLight', !!lights && lights.useAmbient)
		.setBoolean('useSphericalHarmonicsLight', !!lights && lights.useSphericalHarmonics)
		.set('hemisphereLightNum', lights ? lights.hemisNum : 0)
		.set('directLightNum', lights ? lights.directsNum : 0)
		.set('pointLightNum', lights ? lights.pointsNum : 0)
		.set('spotLightNum', lights ? lights.spotsNum : 0)
		.set('directShadowNum', (object.receiveShadow && !!lights) ? lights.directShadowNum : 0)
		.set('pointShadowNum', (object.receiveShadow && !!lights) ? lights.pointShadowNum : 0)
		.set('spotShadowNum', (object.receiveShadow && !!lights) ? lights.spotShadowNum : 0)
		.setBoolean('useShadow', object.receiveShadow && !!lights && lights.shadowsNum > 0)
		.setBoolean('useShadowSampler', useShadowSampler)
		.set('shadowType', shadowType)
		.setBoolean('dithering', material.dithering)
		// encoding
		.set('gammaFactor', renderStates.gammaFactor)
		.set('outputEncoding', currentRenderTarget.texture ? getTextureEncodingFromMap(currentRenderTarget.texture) : renderStates.outputEncoding)
		.set('diffuseMapEncoding', getTextureEncodingFromMap(material.diffuseMap || material.cubeMap))
		.set('envMapEncoding', getTextureEncodingFromMap(envMap))
		.set('emissiveMapEncoding', getTextureEncodingFromMap(material.emissiveMap))
		// other
		.set('alphaTest', material.alphaTest)
		.setBoolean('premultipliedAlpha', material.premultipliedAlpha)
		.set('useVertexColors', material.vertexColors)
		.setBoolean('useVertexTangents', !!material.normalMap && material.vertexTangents)
		.set('numClippingPlanes', numClippingPlanes)
		.setBoolean('flatShading', material.shading === SHADING_TYPE.FLAT_SHADING)
		.setBoolean('fog', !!fog)
		.setBoolean('fogExp2', !!fog && fog.isFogExp2)
		.setBoolean('sizeAttenuation', material.sizeAttenuation)
		.setBoolean('doubleSided', material.side === DRAW_SIDE.DOUBLE)
		.setBoolean('flipSided', material.side === DRAW_SIDE.BACK)
		.setBoolean('packDepthToRGBA', material.packToRGBA)
		.setBoolean('logarithmicDepthBuffer', !!logarithmicDepthBuffer)
		.setBoolean('rendererExtensionFragDepth', capabilities.version >= 2 || !!capabilities.getExtension('EXT_frag_depth'))
		// morph targets
		.setBoolean('morphTargets', !!object.morphTargetInfluences)
		.setBoolean('morphNormals', !!object.morphTargetInfluences && object.geometry.morphAttributes.normal)
		// skinned mesh
		.setBoolean('useSkinning', useSkinning)
		.set('bonesNum', maxBones)
		.setBoolean('useVertexTexture', useVertexTexture);

	const useUv1 = parameters.get('useDiffuseMap') === 1 ||
		parameters.get('useAlphaMap') === 1 ||
		parameters.get('useEmissiveMap') === 1 ||
		parameters.get('useAOMap') === 1 ||
		parameters.getBoolean('useNormalMap') ||
		parameters.getBoolean('useBumpMap') ||
		parameters.getBoolean('useSpecularMap') ||
		parameters.getBoolean('useRoughnessMap') ||
		parameters.getBoolean('useMetalnessMap') ||
		parameters.getBoolean('useGlossinessMap') ||
		parameters.getBoolean('useClearcoatMap') ||
		parameters.getBoolean('useClearcoatNormalMap') ||
		parameters.getBoolean('useClearcoatRoughnessMap');
	const useUv2 = parameters.get('useDiffuseMap') === 2 ||
		parameters.get('useAlphaMap') === 2 ||
		parameters.get('useEmissiveMap') === 2 ||
		parameters.get('useAOMap') === 2;

	parameters.setBoolean('useUv1', useUv1);
	parameters.setBoolean('useUv2', useUv2);

	// parameters.setBoolean('useVertexEnvDir', false);

	return parameters;
}

// Create program

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

function createProgram(gl, defines, parameters, vertex, fragment) {
	const shaderName = parameters.get('shaderName');
	const version = parameters.get('version');
	const precision = parameters.get('precision');

	const shadowType = parameters.get('shadowType');

	let prefixVertex = [
		'precision ' + precision + ' float;',
		'precision ' + precision + ' int;',
		// depth texture may have precision problem on iOS device.
		'precision ' + precision + ' sampler2D;',

		'#define SHADER_NAME ' + shaderName,

		defines,

		(version >= 2) ? '#define WEBGL2' : '',

		parameters.getBoolean('useRoughnessMap') ? '#define USE_ROUGHNESSMAP' : '',
		parameters.getBoolean('useMetalnessMap') ? '#define USE_METALNESSMAP' : '',
		parameters.getBoolean('useGlossinessMap') ? '#define USE_GLOSSINESSMAP' : '',

		parameters.getBoolean('useAmbientLight') ? '#define USE_AMBIENT_LIGHT' : '',
		parameters.getBoolean('useSphericalHarmonicsLight') ? '#define USE_SPHERICALHARMONICS_LIGHT' : '',
		parameters.getBoolean('useNormalMap') ? '#define USE_NORMAL_MAP' : '',
		parameters.getBoolean('useBumpMap') ? '#define USE_BUMPMAP' : '',
		parameters.getBoolean('useSpecularMap') ? '#define USE_SPECULARMAP' : '',
		parameters.get('useEmissiveMap') ? ('#define USE_EMISSIVEMAP ' + parameters.get('useEmissiveMap')) : '',
		parameters.getBoolean('useShadow') ? '#define USE_SHADOW' : '',
		parameters.getBoolean('flatShading') ? '#define FLAT_SHADED' : '',
		parameters.getBoolean('flipSided') ? '#define FLIP_SIDED' : '',

		parameters.get('useDiffuseMap') ? ('#define USE_DIFFUSE_MAP ' + parameters.get('useDiffuseMap')) : '',
		parameters.get('useAlphaMap') ? ('#define USE_ALPHA_MAP ' + parameters.get('useAlphaMap')) : '',
		parameters.getBoolean('useEnvMap') ? '#define USE_ENV_MAP' : '',
		parameters.getBoolean('sizeAttenuation') ? '#define USE_SIZEATTENUATION' : '',
		parameters.get('useAOMap') ? ('#define USE_AOMAP ' + parameters.get('useAOMap')) : '',
		parameters.get('useVertexColors') == VERTEX_COLOR.RGB ? '#define USE_VCOLOR_RGB' : '',
		parameters.get('useVertexColors') == VERTEX_COLOR.RGBA ? '#define USE_VCOLOR_RGBA' : '',
		parameters.getBoolean('useVertexTangents') ? '#define USE_TANGENT' : '',
		parameters.getBoolean('useUv1') ? '#define USE_UV1' : '',
		parameters.getBoolean('useUv2') ? '#define USE_UV2' : '',

		// (parameters.getBoolean('useVertexEnvDir') && !parameters.getBoolean('useNormalMap') && !parameters.getBoolean('useBumpMap')) ? '#define USE_VERTEX_ENVDIR' : '',

		parameters.getBoolean('fog') ? '#define USE_FOG' : '',

		parameters.getBoolean('morphTargets') ? '#define USE_MORPHTARGETS' : '',
		parameters.getBoolean('morphNormals') && !parameters.getBoolean('flatShading') ? '#define USE_MORPHNORMALS' : '',

		parameters.getBoolean('useSkinning') ? '#define USE_SKINNING' : '',
		(parameters.get('bonesNum') > 0) ? ('#define MAX_BONES ' + parameters.get('bonesNum')) : '',
		parameters.getBoolean('useVertexTexture') ? '#define BONE_TEXTURE' : '',
		parameters.getBoolean('logarithmicDepthBuffer') ? '#define USE_LOGDEPTHBUF' : '',
		(parameters.getBoolean('logarithmicDepthBuffer') && parameters.getBoolean('rendererExtensionFragDepth')) ? '#define USE_LOGDEPTHBUF_EXT' : '',

		'\n'
	].filter(filterEmptyLine).join('\n');

	let prefixFragment = [
		// use dfdx and dfdy must enable OES_standard_derivatives
		(parameters.getBoolean('useStandardDerivatives') && version < 2) ? '#extension GL_OES_standard_derivatives : enable' : '',
		(parameters.getBoolean('useShaderTextureLOD') && version < 2) ? '#extension GL_EXT_shader_texture_lod : enable' : '',
		(parameters.getBoolean('logarithmicDepthBuffer') && parameters.getBoolean('rendererExtensionFragDepth') && version < 2) ? '#extension GL_EXT_frag_depth : enable' : '',

		'precision ' + precision + ' float;',
		'precision ' + precision + ' int;',
		// depth texture may have precision problem on iOS device.
		'precision ' + precision + ' sampler2D;',
		(version >= 2) ? 'precision ' + precision + ' sampler2DShadow;' : '',
		(version >= 2) ? 'precision ' + precision + ' samplerCubeShadow;' : '',

		'#define SHADER_NAME ' + shaderName,

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

		(version >= 2) ? '#define WEBGL2' : '',
		parameters.getBoolean('useShadowSampler') ? '#define USE_SHADOW_SAMPLER' : '#define sampler2DShadow sampler2D',

		parameters.getBoolean('useRoughnessMap') ? '#define USE_ROUGHNESSMAP' : '',
		parameters.getBoolean('useMetalnessMap') ? '#define USE_METALNESSMAP' : '',
		parameters.getBoolean('useGlossinessMap') ? '#define USE_GLOSSINESSMAP' : '',

		parameters.getBoolean('useClearcoat') ? '#define USE_CLEARCOAT' : '',
		parameters.getBoolean('useClearcoatMap') ? '#define USE_CLEARCOATMAP' : '',
		parameters.getBoolean('useClearcoatRoughnessMap') ? '#define USE_CLEARCOAT_ROUGHNESSMAP' : '',
		parameters.getBoolean('useClearcoatNormalMap') ? '#define USE_CLEARCOAT_NORMALMAP' : '',

		parameters.getBoolean('useAmbientLight') ? '#define USE_AMBIENT_LIGHT' : '',
		parameters.getBoolean('useSphericalHarmonicsLight') ? '#define USE_SPHERICALHARMONICS_LIGHT' : '',
		parameters.getBoolean('useNormalMap') ? '#define USE_NORMAL_MAP' : '',
		parameters.getBoolean('useBumpMap') ? '#define USE_BUMPMAP' : '',
		parameters.getBoolean('useSpecularMap') ? '#define USE_SPECULARMAP' : '',
		parameters.get('useEmissiveMap') ? ('#define USE_EMISSIVEMAP ' + parameters.get('useEmissiveMap')) : '',
		parameters.getBoolean('useShadow') ? '#define USE_SHADOW' : '',
		shadowType === SHADOW_TYPE.HARD ? '#define USE_HARD_SHADOW' : '',
		shadowType === SHADOW_TYPE.POISSON_SOFT ? '#define USE_POISSON_SOFT_SHADOW' : '',
		shadowType === SHADOW_TYPE.PCF3_SOFT ? '#define USE_PCF3_SOFT_SHADOW' : '',
		shadowType === SHADOW_TYPE.PCF5_SOFT ? '#define USE_PCF5_SOFT_SHADOW' : '',
		shadowType === SHADOW_TYPE.PCSS16_SOFT ? '#define USE_PCSS16_SOFT_SHADOW' : '',
		shadowType === SHADOW_TYPE.PCSS32_SOFT ? '#define USE_PCSS32_SOFT_SHADOW' : '',
		shadowType === SHADOW_TYPE.PCSS64_SOFT ? '#define USE_PCSS64_SOFT_SHADOW' : '',
		(shadowType === SHADOW_TYPE.PCSS16_SOFT || shadowType === SHADOW_TYPE.PCSS32_SOFT || shadowType === SHADOW_TYPE.PCSS64_SOFT) ? '#define USE_PCSS_SOFT_SHADOW' : '',
		parameters.getBoolean('flatShading') ? '#define FLAT_SHADED' : '',
		parameters.getBoolean('doubleSided') ? '#define DOUBLE_SIDED' : '',
		parameters.getBoolean('useShaderTextureLOD') ? '#define TEXTURE_LOD_EXT' : '',

		parameters.get('useDiffuseMap') ? ('#define USE_DIFFUSE_MAP ' + parameters.get('useDiffuseMap')) : '',
		parameters.get('useAlphaMap') ? ('#define USE_ALPHA_MAP ' + parameters.get('useAlphaMap')) : '',
		parameters.getBoolean('useEnvMap') ? '#define USE_ENV_MAP' : '',
		parameters.get('useAOMap') ? ('#define USE_AOMAP ' + parameters.get('useAOMap')) : '',
		parameters.get('useVertexColors') == VERTEX_COLOR.RGB ? '#define USE_VCOLOR_RGB' : '',
		parameters.get('useVertexColors') == VERTEX_COLOR.RGBA ? '#define USE_VCOLOR_RGBA' : '',
		parameters.getBoolean('useVertexTangents') ? '#define USE_TANGENT' : '',
		parameters.getBoolean('premultipliedAlpha') ? '#define USE_PREMULTIPLIED_ALPHA' : '',
		parameters.getBoolean('fog') ? '#define USE_FOG' : '',
		parameters.getBoolean('fogExp2') ? '#define USE_EXP2_FOG' : '',
		parameters.get('alphaTest') ? ('#define ALPHATEST ' + parameters.get('alphaTest')) : '',
		parameters.getBoolean('useEnvMap') ? '#define ' + parameters.get('envMapCombine') : '',
		'#define GAMMA_FACTOR ' + parameters.get('gammaFactor'),

		parameters.getBoolean('useUv1') ? '#define USE_UV1' : '',
		parameters.getBoolean('useUv2') ? '#define USE_UV2' : '',

		// (parameters.getBoolean('useVertexEnvDir') && !parameters.getBoolean('useNormalMap') && !parameters.getBoolean('useBumpMap')) ? '#define USE_VERTEX_ENVDIR' : '',

		parameters.getBoolean('dithering') ? '#define DITHERING' : '',

		ShaderChunk['encodings_pars_frag'],
		getTexelDecodingFunction('mapTexelToLinear', parameters.get('diffuseMapEncoding')),
		parameters.getBoolean('useEnvMap') ? getTexelDecodingFunction('envMapTexelToLinear', parameters.get('envMapEncoding')) : '',
		parameters.get('useEmissiveMap') ? getTexelDecodingFunction('emissiveMapTexelToLinear', parameters.get('emissiveMapEncoding')) : '',
		getTexelEncodingFunction('linearToOutputTexel', parameters.get('outputEncoding')),

		parameters.getBoolean('packDepthToRGBA') ? '#define DEPTH_PACKING_RGBA' : '',

		parameters.getBoolean('logarithmicDepthBuffer') ? '#define USE_LOGDEPTHBUF' : '',
		(parameters.getBoolean('logarithmicDepthBuffer') && parameters.getBoolean('rendererExtensionFragDepth')) ? '#define USE_LOGDEPTHBUF_EXT' : '',

		'\n'
	].filter(filterEmptyLine).join('\n');

	let vshader = vertex;
	let fshader = fragment;

	vshader = parseIncludes(vshader);
	fshader = parseIncludes(fshader);

	vshader = replaceLightNums(vshader, parameters);
	fshader = replaceLightNums(fshader, parameters);

	vshader = replaceClippingPlaneNums(vshader, parameters);
	fshader = replaceClippingPlaneNums(fshader, parameters);

	vshader = unrollLoops(vshader);
	fshader = unrollLoops(fshader);

	// support glsl version 300 es for webgl ^2.0
	if (version > 1) {
		prefixVertex = [
			'#version 300 es\n',
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
			'#version 300 es\n',
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
		.replace(/NUM_HEMI_LIGHTS/g, parameters.get('hemisphereLightNum'))
		.replace(/NUM_DIR_LIGHTS/g, parameters.get('directLightNum'))
		.replace(/NUM_SPOT_LIGHTS/g, parameters.get('spotLightNum'))
		.replace(/NUM_POINT_LIGHTS/g, parameters.get('pointLightNum'))
		.replace(/NUM_DIR_SHADOWS/g, parameters.get('directShadowNum'))
		.replace(/NUM_SPOT_SHADOWS/g, parameters.get('spotShadowNum'))
		.replace(/NUM_POINT_SHADOWS/g, parameters.get('pointShadowNum'));
}

function replaceClippingPlaneNums(string, parameters) {
	return string
		.replace(/NUM_CLIPPING_PLANES/g, parameters.get('numClippingPlanes'));
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

export { WebGLPrograms };