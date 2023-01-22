import {
	RenderTarget2D,
	ShaderPostPass,
	Texture2D,
	TEXTURE_FILTER,
	PIXEL_TYPE,
	PIXEL_FORMAT,
	ATTACHMENT,
	nextPowerOfTwo
} from 't3d';

/**
 * This class is used to generate idwmap textures.
 */
class IDWMapGenerator {

	/**
	 * Create a idwmap generator.
	 * @param {Number} [width=1024] The initial width of the idwmap textures.
	 * @param {Number} [height=1024] The initial height of the idwmap textures.
	 */
	constructor(width = 1024, height = 1024) {
		// Gray pass

		this._grayRenderTarget = new RenderTarget2D(width, height);
		this._grayRenderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		const pointTexture = new Texture2D();
		pointTexture.type = PIXEL_TYPE.FLOAT;
		pointTexture.magFilter = TEXTURE_FILTER.NEAREST;
		pointTexture.minFilter = TEXTURE_FILTER.NEAREST;
		pointTexture.generateMipmaps = false;
		pointTexture.format = PIXEL_FORMAT.RGBA;
		pointTexture.flipY = false;

		this._grayPass = new ShaderPostPass(idwmapPointsShader);
		this._grayPass.material.depthTest = false;
		this._grayPass.material.depthWrite = false;
		this._grayPass.material.uniforms.pointTexture = pointTexture;

		this._pointTexture = pointTexture;
		this._dataLength = 0;
		this._pointTextureSize = 0;

		// Colorize pass

		this._colorizeRenderTarget = new RenderTarget2D(width, height);
		this._colorizeRenderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		this._colorizePass = new ShaderPostPass(idwmapColorizeShader);
		this._colorizePass.material.depthTest = false;
		this._colorizePass.material.depthWrite = false;
		this._colorizePass.material.uniforms.tDiffuse = this._grayRenderTarget.texture;

		//

		this._capabilitiesChecked = false;
	}

	_checkCapabilities(capabilities) {
		if (this._capabilitiesChecked) return;

		const isWebGL2 = capabilities.version > 1;

		let type;

		if (isWebGL2) {
			if (capabilities.getExtension("EXT_color_buffer_float") && capabilities.getExtension("OES_texture_float_linear")) {
				type = PIXEL_TYPE.FLOAT;
			} else {
				type = PIXEL_TYPE.HALF_FLOAT;
			}
		} else {
			if (capabilities.getExtension("OES_texture_float") && capabilities.getExtension("OES_texture_float_linear")) {
				type = PIXEL_TYPE.FLOAT;
			} else if (capabilities.getExtension("OES_texture_half_float") && capabilities.getExtension("OES_texture_half_float_linear")) {
				type = PIXEL_TYPE.HALF_FLOAT;
			} else {
				type = PIXEL_TYPE.UNSIGNED_BYTE;
			}
		}

		this._grayRenderTarget.texture.type = type;

		if (!isWebGL2 && !capabilities.getExtension('OES_texture_float')) {
			this._pointTexture.type = PIXEL_TYPE.HALF_FLOAT;
		}

		this._capabilitiesChecked = true;
	}

	/**
	 * Resize idwmap textures.
	 * The idwmap texture size only affects the image resolution, and generally does not affect the drawing results.
	 * Note: resize will clear the content in the texture, so you need to re-execute rendering after resize.
	 * @param {Number} width
	 * @param {Number} height
	 * @return this
	 */
	resize(width, height) {
		this._grayRenderTarget.resize(width, height);
		this._colorizeRenderTarget.resize(width, height);
		return this;
	}

	/**
	 * To render a grayscale idwmap.
	 * This method needs to be executed before executing colorize to generate the final idwmap.
	 * @param {Renderer} renderer
	 * @param {Array} data [[x0, y0, value0], [x1, y1, value1], ...]
	 * @param {Object} options
	 * @param {Array} options.size Dimensions in the data coordinate system with the origin at the center.
	 * @param {String} exponent (Optional) The exponent for idwmap, default is 2.
	 * @param {Array} range (Optional) The range of data values, default is [0, 1].
	 * @return this
	 */
	render(renderer, data, options = {}) {
		this._checkCapabilities(renderer.renderPass.capabilities);

		const size = options.size;

		const exponent = options.exponent || 2;

		const rangeMin = options.range !== undefined ? options.range[0] : 0;
		const rangeMax = options.range !== undefined ? options.range[1] : 1;
		const rangeDist = rangeMax - rangeMin;

		const dataLength = data.length;

		let textureSize = this._pointTextureSize;
		if (this._dataLength !== dataLength) {
			this._dataLength = dataLength;
			textureSize = Math.sqrt(dataLength);
			textureSize = nextPowerOfTwo(Math.ceil(textureSize));
			textureSize = Math.max(4, textureSize);
			this._pointTextureSize = textureSize;
		}
		let pointMatrices;
		if (this._pointTexture.type === PIXEL_TYPE.FLOAT) {
			pointMatrices = new Float32Array(textureSize * textureSize * 4);

			for (let i = 0; i < dataLength; i++) {
				pointMatrices[4 * i] = data[i][0] / size[0];
				pointMatrices[4 * i + 1] = data[i][1] / size[1];
				pointMatrices[4 * i + 2] = (data[i][2] - rangeMin) / rangeDist;
				pointMatrices[4 * i + 3] = 1;
			}
		} else {
			pointMatrices = new Uint16Array(textureSize * textureSize * 4);

			for (let i = 0; i < dataLength; i++) {
				pointMatrices[4 * i] = toHalf(data[i][0] / size[0]);
				pointMatrices[4 * i + 1] = toHalf(data[i][1] / size[1]);
				pointMatrices[4 * i + 2] = toHalf((data[i][2] - rangeMin) / rangeDist);
				pointMatrices[4 * i + 3] = toHalf(1);
			}
		}

		this._pointTexture.image = {
			data: pointMatrices,
			width: textureSize,
			height: textureSize
		};
		this._pointTexture.version++;

		// Render gray texture

		renderer.renderPass.getClearColor().toArray(_tempClearColor); // save clear color

		renderer.renderPass.setRenderTarget(this._grayRenderTarget);
		renderer.renderPass.setClearColor(0, 0, 0, 1);
		renderer.renderPass.clear(true, true, true);

		if (this._grayPass.material.defines.POINTS_NUM !== dataLength) {
			this._grayPass.material.defines.POINTS_NUM = dataLength;
			this._grayPass.material.needsUpdate = true;
		}
		this._grayPass.material.uniforms.pointTexture = this._pointTexture;
		this._grayPass.material.uniforms.idw_exponent = exponent;
		this._grayPass.material.uniforms.pointTextureSize = textureSize;

		this._grayPass.render(renderer);

		renderer.renderPass.updateRenderTargetMipmap(this._grayRenderTarget);

		renderer.renderPass.setClearColor(..._tempClearColor);

		return this;
	}

	/**
	 * Colorize the grayscale texture according to the color gradient ribbon map.
	 * @param {Renderer} renderer
	 * @param {Texture2D} gradientTexture
	 * @param {Object} options (Optional)
	 * @param {Boolean} options.isoline (Optional) Whether to show isoline, default is false.
	 */
	colorize(renderer, gradientTexture, options = {}) {
		renderer.renderPass.getClearColor().toArray(_tempClearColor); // save clear color

		renderer.renderPass.setRenderTarget(this._colorizeRenderTarget);
		renderer.renderPass.setClearColor(0, 0, 0, 0);
		renderer.renderPass.clear(true, false, false);

		if (this._colorizePass.material.defines.ISOLINE !== !!options.isoline) {
			this._colorizePass.material.defines.ISOLINE = !!options.isoline;
			this._colorizePass.material.needsUpdate = true;
		}
		this._colorizePass.material.uniforms.colormap = gradientTexture;
		this._colorizePass.render(renderer);

		renderer.renderPass.updateRenderTargetMipmap(this._colorizeRenderTarget);

		renderer.renderPass.setClearColor(..._tempClearColor);

		return this;
	}

	/**
	 * Get idwmap gray texture.
	 * @return {Texture2D}
	 */
	getGrayTexture() {
		return this._grayRenderTarget.texture;
	}

	/**
	 * Get the colored idwmap texture.
	 * @return {Texture2D}
	 */
	getTexture() {
		return this._colorizeRenderTarget.texture;
	}

	/**
	 * Release the idwmap generator, including the textures it holds.
	 */
	dispose() {
		this._grayRenderTarget.dispose();
		this._colorizeRenderTarget.dispose();
		this._points.geometry.dispose();
		this._points.material.dispose();
	}

}

const _tempClearColor = [0, 0, 0, 1];

const idwmapPointsShader = {
	name: 'idwmap_points',
	defines: {
		POINTS_NUM: 0
	},
	uniforms: {
		idw_exponent: 2,
		pointTexture: null,
		pointTextureSize: 1,
	},
	vertexShader: `
        #include <common_vert>
        attribute vec2 a_Uv;
        varying vec2 v_Uv;
        void main() {
            v_Uv = a_Uv;
            gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
        }
    `,
	fragmentShader: `
        #include <common_frag>
        uniform float idw_exponent;
		uniform sampler2D pointTexture;
        uniform float pointTextureSize;
        varying vec2 v_Uv;

        struct Accumulator {
            float m_sumOfWeightedValues;
            float m_sumOfWeights;
        };

        float GetWeightedAverage(Accumulator acc) {
            return acc.m_sumOfWeightedValues / acc.m_sumOfWeights;
        }
            
        void main() {
            float exactThreshold = 0.01; // if we are very close to a point then avoid a divide by zero and set to exact weight of the point
    
            Accumulator acc = Accumulator(0.0, 0.0);
    
            vec2 fragCoord = v_Uv;
			fragCoord.x -= 0.5;
			fragCoord.y -= 0.5;

            float interpolatedValue = 0.;
            
            for (int i = 0; i < POINTS_NUM; ++i) {
                float i_float = float(i);
                float j = i_float * 1.0;
                float x = mod(j, pointTextureSize);
                float y = floor(j / pointTextureSize);
    
                float dx = 1.0 / pointTextureSize;
                float dy = 1.0 / pointTextureSize;
    
                vec4 pointSampler = texture2D(pointTexture, vec2(dx * (x + 0.5), dy * (y + 0.5)));
    
                float dist = max(exactThreshold, length(fragCoord.xy - pointSampler.xy));  

                float weight = 1.0 / pow(dist, idw_exponent);
    
                acc.m_sumOfWeights += weight;
                acc.m_sumOfWeightedValues += weight * pointSampler.z;
            }
    
            interpolatedValue = GetWeightedAverage(acc);
            
			interpolatedValue = clamp(interpolatedValue, 0.0, 1.0);

            gl_FragColor = vec4(interpolatedValue, interpolatedValue, interpolatedValue, 1.0);
        }
    `
};

const idwmapColorizeShader = {
	name: 'idwmap_colorize',
	defines: {
		ISOLINE: false
	},
	uniforms: {
		tDiffuse: null,
		colormap: null
	},
	vertexShader: `
		#include <common_vert>
		attribute vec2 a_Uv;
		varying vec2 vUv;
		void main() {
			vUv = a_Uv;
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);
		}
	`,
	fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform sampler2D colormap;
		
		varying vec2 vUv;

		#ifdef ISOLINE
			float isoline(float val, float lg, float ref, float pas, float thickness) {
				float v = abs(mod(val - ref + pas * .5, pas) - pas * .5) / lg - .1 * thickness;
				return smoothstep(.2, .8, v);
			}
		#endif

		void main() {
			float value = texture2D(tDiffuse, vUv).r;
			vec3 color = texture2D(colormap, vec2(value, 0.5)).rgb;

			#ifdef ISOLINE
				float lg = 2. * length(vec2(dFdx(value), dFdy(value)));
				float k1 = isoline(value, lg, .0, .2, 1.);
				float k2 = isoline(value, lg, .0, .05, .1);

				if (lg > 0.0001) {
					color *= step(0.0001, lg) * (.3 + (k1 * .7));
					color *= step(0.0001, lg) * (.7 + (k2 * .3));
				}
			#endif

			gl_FragColor = vec4(color, 1.0);
		}
	`
}

const floatView = new Float32Array(1);
const int32View = new Int32Array(floatView.buffer);

// stackoverflow.com/questions/32633585/how-do-you-convert-to-half-floats-in-javascript
function toHalf(fval) {
	floatView[0] = fval;
	const fbits = int32View[0];
	const sign = (fbits >> 16) & 0x8000;          // sign only
	let val = (fbits & 0x7fffffff) + 0x1000; // rounded value

	if (val >= 0x47800000) {             // might be or become NaN/Inf
		if ((fbits & 0x7fffffff) >= 0x47800000) {
			// is or must become NaN/Inf
			if (val < 0x7f800000) {          // was value but too large
				return sign | 0x7c00;           // make it +/-Inf
			}
			return sign | 0x7c00 |            // remains +/-Inf or NaN
				(fbits & 0x007fffff) >> 13; // keep NaN (and Inf) bits
		}
		return sign | 0x7bff;               // unrounded not quite Inf
	}
	if (val >= 0x38800000) {             // remains normalized value
		return sign | val - 0x38000000 >> 13; // exp - 127 + 15
	}
	if (val < 0x33000000)  {             // too small for subnormal
		return sign;                        // becomes +/-0
	}
	val = (fbits & 0x7fffffff) >> 23;   // tmp exp for subnormal calc
	return sign | ((fbits & 0x7fffff | 0x800000) // add subnormal bit
			+ (0x800000 >>> val - 102)     // round depending on cut off
			>> 126 - val);                  // div by 2^(1-(exp-127+15)) and >> 13 | exp=0
}

export { IDWMapGenerator };