import {
	Scene,
	Geometry,
	Mesh,
	Camera,
	DRAW_MODE,
	BLEND_TYPE,
	ShaderMaterial,
	RenderTarget2D,
	Attribute,
	Buffer,
	ShaderPostPass,
	ATTACHMENT
} from 't3d';

/**
 * This class is used to generate heatmap textures.
 */
class HeatmapGenerator {

	/**
	 * Create a heatmap generator.
	 * @param {Number} [width=1024] The initial width of the heatmap textures.
	 * @param {Number} [height=1024] The initial height of the heatmap textures.
	 */
	constructor(width = 1024, height = 1024) {
		// Gray pass

		this._grayRenderTarget = new RenderTarget2D(width, height);
		this._grayRenderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		const scene = new Scene();

		const pointsGeometry = new Geometry();
		pointsGeometry.computeBoundingBox = function() {}; // hack for bounding box
		pointsGeometry.computeBoundingSphere = function() {}; // hack for bounding sphere
		const pointsMaterial = new ShaderMaterial(heatmapPointsShader);
		pointsMaterial.transparent = true;
		pointsMaterial.blending = BLEND_TYPE.ADD;
		pointsMaterial.drawMode = DRAW_MODE.POINTS;
		pointsMaterial.depthTest = false;
		pointsMaterial.depthWrite = false;
		const points = new Mesh(pointsGeometry, pointsMaterial);
		points.raycast = function raycast() { return null }; // hack for raycast
		points.frustumCulled = false;
		scene.add(points);

		const camera = new Camera();
		camera.frustumCulled = false;
		scene.add(camera);

		scene.updateMatrix();

		this._renderStates = scene.updateRenderStates(camera);

		const renderQueue = scene.updateRenderQueue(camera, false, false);
		this._renderQueueLayer = renderQueue.layerList[0];

		this._points = points;

		// Colorize pass

		this._colorizeRenderTarget = new RenderTarget2D(width, height);
		this._colorizeRenderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);

		this._colorizePass = new ShaderPostPass(heatmapColorizeShader);
		this._colorizePass.material.depthTest = false;
		this._colorizePass.material.depthWrite = false;
		this._colorizePass.material.uniforms.tDiffuse = this._grayRenderTarget.texture;
	}

	/**
	 * Resize heatmap textures.
	 * The heatmap texture size only affects the image resolution, and generally does not affect the drawing results.
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
	 * To render a grayscale heatmap.
	 * This method needs to be executed before executing colorize to generate the final heatmap.
	 * @param {Renderer} renderer
	 * @param {Array} data [[x0, y0, value0], [x1, y1, value1], ...]
	 * @param {Object} options
	 * @param {Array} options.size Dimensions in the data coordinate system with the origin at the center.
	 * @param {Number} radius The diffusion radius of the data point, the unit is 1 in the data coordinate system.
	 * @param {String} interpolation (Optional) The interpolation method of the spread of data points, 'gaussian'(default) | 'linear' | 'cos'.
	 * @param {Number} gaussianSigma (Optional) Only effective in Gaussian interpolation mode. default is 0.158.
	 * @param {Array} range (Optional) The range of data values, default is [0, 1].
	 * @return this
	 */
	render(renderer, data, options = {}) {
		const size = options.size;

		const radius = options.radius || 1;
		const interpolation = options.interpolation || 'gaussian';
		const gaussianSigma = options.gaussianSigma !== undefined ? options.gaussianSigma : 0.158;

		const rangeMin = options.range !== undefined ? options.range[0] : 0;
		const rangeMax = options.range !== undefined ? options.range[1] : 1;
		const rangeDist = rangeMax - rangeMin;

		const pixelWidth = this._grayRenderTarget.width;
		const pixelHeight = this._grayRenderTarget.height;

		const pointSizeX = radius / size[0] * pixelWidth * 2;
		const pointSizeY = radius / size[1] * pixelHeight * 2;

		const pointSize = Math.max(pointSizeX, pointSizeY);

		// When the width and height of the size are different,
		// in order to ensure that the spread is circular,
		// the following variables need to be introduced:
		const xAxisFactor = Math.min(pointSizeX / pointSizeY, 1.0);
		const yAxisFactor = Math.min(pointSizeY / pointSizeX, 1.0);

		// Update points geometry

		const pointsGeometry = this._points.geometry;
		const dataLength = data.length;

		let attribute = pointsGeometry.getAttribute('a_Position');
		let typedArray;

		if (attribute && attribute.buffer.count === dataLength) {
			typedArray = attribute.buffer.array;
			attribute.buffer.version++;
		} else {
			pointsGeometry.dispose();

			typedArray = new Float32Array(dataLength * 3);

			attribute = new Attribute(new Buffer(typedArray, 3));
			pointsGeometry.addAttribute('a_Position', attribute);
			pointsGeometry.version++;
		}

		for (let i = 0; i < dataLength; i++) {
			typedArray[i * 3 + 0] = data[i][0] / size[0] * 2;
			typedArray[i * 3 + 1] = data[i][1] / size[1] * 2;
			typedArray[i * 3 + 2] = (data[i][2] - rangeMin) / rangeDist;
		}

		// Update points material

		const pointsMaterial = this._points.material;
		pointsMaterial.uniforms.pointSize = pointSize;
		pointsMaterial.uniforms.axisFactors[0] = xAxisFactor;
		pointsMaterial.uniforms.axisFactors[1] = yAxisFactor;
		pointsMaterial.uniforms.gaussianSigma = gaussianSigma;

		const defines = pointsMaterial.defines;
		for (let key in defines) {
			defines[key] = (key === interpolationMap[interpolation]);
			pointsMaterial.needsUpdate = true;
		}

		// Render gray texture

		renderer.renderPass.getClearColor().toArray(_tempClearColor); // save clear color

		renderer.renderPass.setRenderTarget(this._grayRenderTarget);
		renderer.renderPass.setClearColor(0, 0, 0, 1);
		renderer.renderPass.clear(true, true, true);
		renderer.renderRenderableList(this._renderQueueLayer.transparent, this._renderStates);

		renderer.renderPass.updateRenderTargetMipmap(this._grayRenderTarget);

		renderer.renderPass.setClearColor(..._tempClearColor);

		return this;
	}

	/**
	 * Colorize the grayscale texture according to the color gradient ribbon map.
	 * @param {Renderer} renderer
	 * @param {Texture2D} gradientTexture
	 * @param {Object} options (Optional)
	 * @param {Boolean} options.alpha (Optional) Whether to generate images with alpha gradients, default is false.
	 */
	colorize(renderer, gradientTexture, options = {}) {
		renderer.renderPass.getClearColor().toArray(_tempClearColor); // save clear color

		renderer.renderPass.setRenderTarget(this._colorizeRenderTarget);
		renderer.renderPass.setClearColor(0, 0, 0, 0);
		renderer.renderPass.clear(true, false, false);

		this._colorizePass.material.uniforms.colormap = gradientTexture;
		this._colorizePass.material.uniforms.alphaLerp = options.alpha ? 1 : 0;
		this._colorizePass.render(renderer);

		renderer.renderPass.updateRenderTargetMipmap(this._colorizeRenderTarget);

		renderer.renderPass.setClearColor(..._tempClearColor);

		return this;
	}

	/**
	 * Get heatmap gray texture.
	 * @return {Texture2D}
	 */
	getGrayTexture() {
		return this._grayRenderTarget.texture;
	}

	/**
	 * Get the colored heatmap texture.
	 * @return {Texture2D}
	 */
	getTexture() {
		return this._colorizeRenderTarget.texture;
	}

	/**
	 * Release the heatmap generator, including the textures it holds.
	 */
	dispose() {
		this._grayRenderTarget.dispose();
		this._colorizeRenderTarget.dispose();
		this._points.geometry.dispose();
		this._points.material.dispose();
	}

}

const _tempClearColor = [0, 0, 0, 1];

const interpolationMap = {
	'gaussian': 'INTERPOLATION_GAUSSIAN',
	'linear': 'INTERPOLATION_LINEAR',
	'cos': 'INTERPOLATION_COS'
};

const heatmapPointsShader = {
	name: 'heatmap_points',
	defines: {
		INTERPOLATION_GAUSSIAN: true,
		INTERPOLATION_LINEAR: false,
		INTERPOLATION_COS: false
	},
	uniforms: {
		pointSize: 1,
		axisFactors: [1, 1],
		gaussianSigma: 0.158
	},
	vertexShader: `
		attribute vec3 a_Position;
		uniform float pointSize;
		varying float v_Strength;
		void main() {
			v_Strength = clamp(a_Position.z, 0.0, 1.0);
			gl_Position = vec4(a_Position.xy, 0.5, 1.0);
			gl_PointSize = pointSize;
		}
	`,
	fragmentShader: `
		uniform vec2 axisFactors;
		uniform float gaussianSigma;
		varying float v_Strength;
		void main() {
			float gray = v_Strength;

			float dx = gl_PointCoord.x - 0.5;
			float dy = gl_PointCoord.y - 0.5;

			dx /= axisFactors.x;
			dy /= axisFactors.y;

			#if defined(INTERPOLATION_GAUSSIAN)
				float sigma = gaussianSigma;
				float sigmaSquare = sigma * sigma;
				float gaussianKernel = exp(- (dx * dx + dy * dy) / (2. * sigmaSquare));

				gray *= gaussianKernel;
			#elif defined(INTERPOLATION_LINEAR)
				float rate = clamp(1.0 - 2.0 * sqrt(dx * dx + dy * dy), 0.0, 1.0);
				gray *= rate;
			#elif defined(INTERPOLATION_COS)
				float rate = clamp(1.0 - 2.0 * sqrt(dx * dx + dy * dy), 0.0, 1.0);
				gray *= 1. - cos(rate * 3.141592653 / 2.);
			#endif
			
			gl_FragColor = vec4(gray, gray, gray, 1.0);
		}
	`
};

const heatmapColorizeShader = {
	name: 'heatmap_colorize',
	uniforms: {
		alphaLerp: 0,
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
		uniform float alphaLerp;
		uniform sampler2D tDiffuse;
		uniform sampler2D colormap;
		varying vec2 vUv;
		void main() {
			float value = texture2D(tDiffuse, vUv).r;
			
			vec3 color = texture2D(colormap, vec2(value, 0.5)).rgb;
			float alpha = max(1.0 - alphaLerp, min(value * 2.0, 1.0));

			gl_FragColor = vec4(color, alpha);
		}
	`
}

export { HeatmapGenerator };