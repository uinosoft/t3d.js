import { Attribute, Vector2, Buffer, DRAW_SIDE, Mesh, Geometry, ShaderMaterial, Texture2D, TEXTURE_FILTER, PIXEL_TYPE, Vector3, MathUtils } from 't3d';
import { CurvePath2 } from '../math/curves/CurvePath2.js';

class LineChartFillMesh extends Mesh {

	constructor() {
		const geometry = new Geometry();

		const material = new ShaderMaterial(LineChartFillShader);
		material.transparent = true;
		material.side = DRAW_SIDE.DOUBLE;

		super(geometry, material);

		this.curvePath = new CurvePath2();
	}

	/**
	 * @param {Vector3[]} points - Base points(x axis) of this chart in 3D space.
	 * @param {number[]} values - Values of each point in the path, which should be in the range of [0, 1].
	 * @param {object} [options={}] - Options object.
	 * @param {Vector3[]|Vector3} [options.up=Vector3(0, 1, 0)] - Up direction of each point in the path, or a single up for all points.
	 * @param {number} [options.height=1] - The height of the chart.
	 * @param {number} [options.smooth=0.3] - The smoothness of the lines.
	 */
	setPositionAndValue(points, values, options = {}) {
		this.clear();

		const { up = _defaultUp, height = 1, smooth = 0.3 } = options;

		const xCoords = calculateCumulativeDistances(points, 1 / height);
		const useUpArray = Array.isArray(up);

		// Set geometry

		const geometry = this.geometry;

		const positions = [];
		const uvs = [];
		const indices = [];
		const pids = [];

		points.forEach((point, i) => {
			const upVector = useUpArray ? up[i] : up;
			const topPoint = _vec3_1.copy(point).addScaledVector(upVector, height);

			positions.push(point.x, point.y, point.z);
			positions.push(topPoint.x, topPoint.y, topPoint.z);

			uvs.push(xCoords[i], 0);
			uvs.push(xCoords[i], 1);

			pids.push(i + 1, i + 1);
		});

		for (let i = 0, l = points.length - 1; i < l; i++) {
			const offset = i * 2;
			indices.push(offset, offset + 1, offset + 2);
			indices.push(offset + 2, offset + 1, offset + 3);
		}

		const positionBuffer = new Buffer(new Float32Array(positions), 3);
		const uvBuffer = new Buffer(new Float32Array(uvs), 2);
		const pidBuffer = new Buffer(new Float32Array(pids), 1);
		const indexBuffer = new Buffer(new Uint16Array(indices), 1);

		geometry.addAttribute('a_Position', new Attribute(positionBuffer));
		geometry.addAttribute('a_Uv', new Attribute(uvBuffer));
		geometry.addAttribute('a_Info', new Attribute(pidBuffer));
		geometry.setIndex(new Attribute(indexBuffer));
		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		// Set curve path

		const curvePath = this.curvePath;
		const curvePts = xCoords.map((xCoord, i) => new Vector2(xCoord, values[i]));
		curvePath.setSmoothCurves(curvePts, { smooth });

		// Set material
		const infoMap = createCurveTexture(curvePath);
		this.material.uniforms.infoMap = infoMap;
		this.material.defines.INFO_TEXTURE_SIZE = infoMap.image.width;
	}

	clear() {
		this.geometry.dispose();
		if (this.material.uniforms.infoMap) {
			this.material.uniforms.infoMap.dispose();
		}
		this.material.dispose();
		this.curvePath.curves.length = 0;
	}

}

const _defaultUp = new Vector3(0, 1, 0);

const _vec3_1 = new Vector3();

const LineChartFillShader = {
	name: 'line_chart_fill',
	defines: {
		INFO_TEXTURE_SIZE: 32,
		UV_TYPE: 0,
		EDGE_GAMMA: 0.003
	},
	uniforms: {
		infoMap: null
	},
	vertexShader: `
    	attribute vec3 a_Position;
		attribute vec2 a_Uv;
		attribute float a_Info;

		varying vec2 v_Uv;
		varying float v_Info;

		uniform mat4 u_ProjectionView;
		uniform mat4 u_Model;

		void main() {
			gl_Position = u_ProjectionView * u_Model * vec4(a_Position, 1.0);

			v_Uv = a_Uv;
			v_Info = a_Info;
		}
    `,
	fragmentShader: `
		uniform float u_Opacity;
		uniform vec3 u_Color;

		#ifdef USE_DIFFUSE_MAP
			uniform sampler2D diffuseMap;
		#endif

		#ifdef USE_ALPHA_MAP
			uniform sampler2D alphaMap;
		#endif

		uniform sampler2D infoMap;

		varying vec2 v_Uv;
		varying float v_Info;

		vec2 Cubic(float t, vec2 p0, vec2 p1, vec2 p2, vec2 p3) {
			float k = 1.0 - t;
			float k2 = k * k;
			float k3 = k2 * k;
			float t2 = t * t;
			float t3 = t2 * t;
			return k3 * p0 + 3.0 * k2 * t * p1 + 3.0 * k * t2 * p2 + t3 * p3;
		}

		vec2 CubicDerivative(float t, vec2 p0, vec2 p1, vec2 p2, vec2 p3) {
            float k = 1.0 - t;
            return 3.0 * k * k * (p1 - p0) + 6.0 * k * t * (p2 - p1) + 3.0 * t * t * (p3 - p2);
        }

		float findTforCoord(float target, float p0, float p1, float p2, float p3) {
			float a = -p0 + 3.0 * p1 - 3.0 * p2 + p3;
			float b = 3.0 * p0 - 6.0 * p1 + 3.0 * p2;
			float c = -3.0 * p0 + 3.0 * p1;
			float d = p0 - target;

			float t = 0.5;
			for(int i = 0; i < 3; i++) {
				float ft = ((a * t + b) * t + c) * t + d;  // f(t)
				float ft_prime = (3.0 * a * t + 2.0 * b) * t + c; // f'(t)

				if(abs(ft_prime) < 1e-6) break;

				t = t - ft / ft_prime;
				t = clamp(t, 0.0, 1.0);
			}

			return t;
		}

		vec4 getCurveInfo(int index) {
			return texelFetch(infoMap, ivec2((index % INFO_TEXTURE_SIZE), index / INFO_TEXTURE_SIZE), 0);
		}

		void main() {
			int index = int(v_Info);
			float u = fract(v_Info);

			vec4 info1 = getCurveInfo(index - 1);
            vec4 info2 = getCurveInfo(index);

			vec2 coord = vec2(mix(info1.x, info2.x, u), v_Uv.y);

			if(coord.y > max(info1.y, info2.y)) {
				discard;
			}

			vec4 outColor = vec4(u_Color, u_Opacity);

			#ifdef USE_ALPHA_MAP
				outColor.a *= texture2D(alphaMap, vec2(v_Uv.y, 0.5)).g;
			#endif

			#if defined(USE_DIFFUSE_MAP) && UV_TYPE == 0
				outColor *= texture2D(diffuseMap, v_Uv.yx);
			#endif

			#if !defined(USE_DIFFUSE_MAP) || UV_TYPE == 0
				if(coord.y < min(info1.y, info2.y)) {
					gl_FragColor = outColor;
					return;
				}
			#endif

			vec2 pos1 = info1.xy;
			vec2 pos2 = info2.xy;

			vec4 info0 = getCurveInfo(index - 2);

			vec2 pos0 = info0.xy;

			vec2 v11 =  info1.zw;
			vec2 v22 =  info2.zw;

			vec2 p0 = info1.xy;
			vec2 p3 = info2.xy;

			float ctrlLength1 = length(pos1 - pos0);
			float ctrlLength2 = length(pos2 - pos1);

			vec2 p1 = p0 + (p0 - v11) * ctrlLength2 / ctrlLength1;
			vec2 p2 = v22;

			float t = findTforCoord(coord.x, p0.x, p1.x, p2.x, p3.x);

			vec2 curvePoint = Cubic(t, p0, p1, p2, p3);

			#if defined(USE_DIFFUSE_MAP) && UV_TYPE == 1
				outColor *= texture2D(diffuseMap, vec2(curvePoint.y, 0.5));
			#endif

			float gamma = EDGE_GAMMA * abs(info1.y - info2.y);
			float fillAlpha = 1.0 - smoothstep(curvePoint.y - gamma, curvePoint.y + gamma, coord.y);

			if(fillAlpha < 0.001) {
				discard;
			}

			gl_FragColor = vec4(outColor.rgb, outColor.a * fillAlpha);
		}
    `
};

function createCurveTexture(curvePath) {
	const curveData = [];

	const firstCurve = curvePath.curves[0];

	if (firstCurve.isLineCurve2) {
		curveData.push(
			curvePath.curves[0].v1.x,
			curvePath.curves[0].v1.y,
			curvePath.curves[0].v1.x,
			curvePath.curves[0].v1.y
		);
	} else {
		curveData.push(
			curvePath.curves[0].v0.x,
			curvePath.curves[0].v0.y,
			curvePath.curves[0].v0.x,
			curvePath.curves[0].v0.y
		);
	}

	curvePath.curves.forEach(curve => {
		if (curve.isLineCurve2) {
			curveData.push(
				curve.v2.x,
				curve.v2.y,
				curve.v2.x,
				curve.v2.y
			);
		} else {
			curveData.push(
				curve.v3.x,
				curve.v3.y,
				curve.v2.x,
				curve.v2.y
			);
		}
	});

	const size = MathUtils.nextPowerOfTwoSquareSize(curveData.length / 4);

	const data = new Float32Array(size * size * 4);
	data.set(curveData);

	const texture = new Texture2D();
	texture.generateMipmaps = false;
	texture.magFilter = TEXTURE_FILTER.NEAREST;
	texture.minFilter = TEXTURE_FILTER.NEAREST;
	texture.flipY = false;
	texture.image = { data, width: size, height: size };
	texture.type = PIXEL_TYPE.FLOAT;

	return texture;
}

function calculateCumulativeDistances(points, scalar = 1) {
	let totalDist = 0;
	return points.map((point, i, arr) => {
		if (i > 0) totalDist += point.distanceTo(arr[i - 1]);
		return totalDist * scalar;
	});
}

export { LineChartFillMesh };