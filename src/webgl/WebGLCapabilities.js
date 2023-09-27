class WebGLCapabilities {

	constructor(gl) {
		this._gl = gl;
		this._extensions = {};

		// webgl version

		this.version = parseFloat(/^WebGL (\d)/.exec(gl.getParameter(gl.VERSION))[1]);

		// texture filter anisotropic extension
		// this extension is available to both, WebGL1 and WebGL2 contexts.

		const anisotropyExt = this.getExtension('EXT_texture_filter_anisotropic');
		this.anisotropyExt = anisotropyExt;
		this.maxAnisotropy = (anisotropyExt !== null) ? gl.getParameter(anisotropyExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 1;

		// query extension

		let timerQuery = null, canUseTimestamp = false;
		try {
			if (this.version > 1) {
				timerQuery = this.getExtension('EXT_disjoint_timer_query_webgl2');
				if (timerQuery) {
					canUseTimestamp = !!gl.getQuery(timerQuery.TIMESTAMP_EXT, timerQuery.QUERY_COUNTER_BITS_EXT);
				}
			} else {
				timerQuery = this.getExtension('EXT_disjoint_timer_query');
				if (timerQuery) {
					canUseTimestamp = !!timerQuery.getQueryEXT(timerQuery.TIMESTAMP_EXT, timerQuery.QUERY_COUNTER_BITS_EXT);
				}
			}
		} catch (err) {
			console.warn(err);
		}
		this.timerQuery = timerQuery;
		this.canUseTimestamp = canUseTimestamp;

		// parallel_shader_compile

		this.parallelShaderCompileExt = this.getExtension('KHR_parallel_shader_compile');

		// others

		this.maxPrecision = getMaxPrecision(gl, 'highp');
		this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
		this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
		this.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
		this.maxSamples = this.version > 1 ? gl.getParameter(gl.MAX_SAMPLES) : 1;
		this.lineWidthRange = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
	}

	getExtension(name) {
		const gl = this._gl;
		const extensions = this._extensions;

		if (extensions[name] !== undefined) {
			return extensions[name];
		}

		let ext = null;
		for (const prefix of vendorPrefixes) {
			ext = gl.getExtension(prefix + name);
			if (ext) {
				break;
			}
		}

		extensions[name] = ext;

		return ext;
	}

}

const vendorPrefixes = ['', 'WEBKIT_', 'MOZ_'];

function getMaxPrecision(gl, precision) {
	if (precision === 'highp') {
		if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 &&
			gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
			return 'highp';
		}
		precision = 'mediump';
	}
	if (precision === 'mediump') {
		if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
			gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
			return 'mediump';
		}
	}
	return 'lowp';
}

export { WebGLCapabilities };