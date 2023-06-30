
/**
 * DistanceTransform is a class for creating distance fields from image data.
 * ref: https://github.com/mapbox/tiny-sdf
 */
class DistanceTransform {

	/**
	 * Create a new DistanceTransform instance.
	 * @param {Number} [maxPixelCount=64*64] - The maximum pixel count to handle.
	 * @param {Number} [maxGridSize=64] - The maximum grid size to handle.
	 */
	constructor(maxPixelCount = 64 * 64, maxGridSize = 64) {
		this._gridOuter = new Float64Array(maxPixelCount);
		this._gridInner = new Float64Array(maxPixelCount);
		this._f = new Float64Array(maxGridSize);
		this._z = new Float64Array(maxGridSize + 1);
		this._v = new Uint16Array(maxGridSize);
		this._uint8Clamper = new Uint8ClampedArray(1);

		this._maxPixelCount = maxPixelCount;
		this._maxGridSize = maxGridSize;
	}

	/**
	 * Transform an image data to a distance field, which is stored in a Uint8Array.
     * @param {Object} imageData - The image data to transform.
     * @param {Uint8Array|Uint8ClampedArray} imageData.data - The pixel data.
     * @param {Number} imageData.width - The width of the image.
     * @param {Number} imageData.height - The height of the image.
     * @param {Object} [options] - The options.
     * @param {Number} [options.radius=8] - The radius of the distance field.
     * @param {Number} [options.cutoff=0.25] - The cutoff value.
	 * @param {Number} [options.inputChannel=3] - The input channel to use.
	 * @param {Number} [options.targetArray] - The target array to store the result.
     * @return {Uint8Array}
     */
	transform(imageData, options = {}) {
		const { data, width, height } = imageData;

		const pixelCount = width * height;

		if (pixelCount > this._maxPixelCount || Math.max(width, height) > this._maxGridSize) {
			console.warn('DistanceTransform: Max pixel count or max grid size exceeded.');
			return null;
		}

		const pixelSize = data.length / pixelCount;

		const {
			radius = 8, cutoff = 0.25, inputChannel = 3,
			targetArray = new Uint8Array(pixelCount)
		} = options;

		const gridOuter = this._gridOuter;
		const gridInner = this._gridInner;
		const f = this._f;
		const z = this._z;
		const v = this._v;
		const uint8Clamper = this._uint8Clamper;

		gridOuter.fill(INF, 0, pixelCount);
		gridInner.fill(0, 0, pixelCount);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const a = data[(y * width + x) * pixelSize + inputChannel] / 255; // alpha value
				if (a === 0) continue; // empty pixels

				const i = y * width + x;

				if (a === 1) { // fully drawn pixels
					gridOuter[i] = 0;
					gridInner[i] = INF;
				} else { // aliased pixels
					const d = 0.5 - a;
					gridOuter[i] = d > 0 ? d * d : 0;
					gridInner[i] = d < 0 ? d * d : 0;
				}
			}
		}

		edt(gridOuter, 0, 0, width, height, width, f, v, z);
		edt(gridInner, 0, 0, width, height, width, f, v, z);

		for (let i = 0; i < pixelCount; i++) {
			const d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i]);
			uint8Clamper[0] = Math.round(255 - 255 * (d / radius + cutoff));
			targetArray[i] = uint8Clamper[0];
		}

		return targetArray;
	}

}

const INF = 1e20;

// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
function edt(data, x0, y0, width, height, gridSize, f, v, z) {
	for (let x = x0; x < x0 + width; x++) edt1d(data, y0 * gridSize + x, gridSize, height, f, v, z);
	for (let y = y0; y < y0 + height; y++) edt1d(data, y * gridSize + x0, 1, width, f, v, z);
}

// 1D squared distance transform
function edt1d(grid, offset, stride, length, f, v, z) {
	v[0] = 0;
	z[0] = -INF;
	z[1] = INF;
	f[0] = grid[offset];

	for (let q = 1, k = 0, s = 0; q < length; q++) {
		f[q] = grid[offset + q * stride];
		const q2 = q * q;

		do {
			const r = v[k];
			s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
		} while (s <= z[k] && --k > -1);

		k++;
		v[k] = q;

		z[k] = s;
		z[k + 1] = INF;
	}

	for (let q = 0, k = 0; q < length; q++) {
		while (z[k + 1] < q) k++;
		const r = v[k];
		const qr = q - r;
		grid[offset + q * stride] = f[r] + qr * qr;
	}
}

export { DistanceTransform };