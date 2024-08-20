import {
	Loader,
	FileLoader,
	TEXTURE_FILTER,
	PIXEL_FORMAT,
	PIXEL_TYPE,
	TEXEL_ENCODING_TYPE,
	Texture2D
} from 't3d';
import { WorkerPool } from '../WorkerPool.js';

const _taskCache = new WeakMap();

let _activeLoaders = 0;

let _ktxParser;
let _zstdDecoder;

let _zstd;

class KTX2Loader extends Loader {

	constructor(manager) {
		super(manager);

		this.transcoderPath = '';
		this.transcoderBinary = null;
		this.transcoderPending = null;

		this.workerPool = new WorkerPool();
		this.workerSourceURL = '';
		this.workerConfig = null;
	}

	static setKTXParser(ktxParser) {
		_ktxParser = ktxParser;
		setFORMAT_MAP();
		setTYPE_MAP();
		return this;
	}

	static setZSTDDecoder(zstdDecoder) {
		_zstdDecoder = zstdDecoder;
		return this;
	}

	setTranscoderPath(path) {
		this.transcoderPath = path;
		return this;
	}

	setWorkerLimit(num) {
		this.workerPool.setWorkerLimit(num);
		return this;
	}

	detectSupport(renderer) {
		const capabilities = renderer.capabilities;

		this.workerConfig = {
			astcSupported: capabilities.getExtension('WEBGL_compressed_texture_astc') ? true : false,
			etc1Supported: capabilities.getExtension('WEBGL_compressed_texture_etc1') ? true : false,
			etc2Supported: capabilities.getExtension('WEBGL_compressed_texture_etc') ? true : false,
			dxtSupported: capabilities.getExtension('WEBGL_compressed_texture_s3tc') ? true : false,
			bptcSupported: capabilities.getExtension('EXT_texture_compression_bptc') ? true : false,
			pvrtcSupported: capabilities.getExtension('WEBGL_compressed_texture_pvrtc') ? true : false
		};

		return this;
	}

	init() {
		if (!this.transcoderPending) {
			// Load transcoder wrapper.
			const jsLoader = new FileLoader(this.manager);
			jsLoader.setPath(this.transcoderPath);
			jsLoader.setWithCredentials(this.withCredentials);
			const jsContent = jsLoader.loadAsync('basis_transcoder.js');

			// Load transcoder WASM binary.
			const binaryLoader = new FileLoader(this.manager);
			binaryLoader.setPath(this.transcoderPath);
			binaryLoader.setResponseType('arraybuffer');
			binaryLoader.setWithCredentials(this.withCredentials);
			const binaryContent = binaryLoader.loadAsync('basis_transcoder.wasm');

			this.transcoderPending = Promise.all([jsContent, binaryContent])
				.then(([jsContent, binaryContent]) => {
					const fn = KTX2Loader.BasisWorker.toString();

					const body = [
						'/* constants */',
						'let _EngineFormat = ' + JSON.stringify(KTX2Loader.EngineFormat),
						'let _TranscoderFormat = ' + JSON.stringify(KTX2Loader.TranscoderFormat),
						'let _BasisFormat = ' + JSON.stringify(KTX2Loader.BasisFormat),
						'/* basis_transcoder.js */',
						jsContent,
						'/* worker */',
						fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
					].join('\n');

					this.workerSourceURL = URL.createObjectURL(new Blob([body]));
					this.transcoderBinary = binaryContent;

					this.workerPool.setWorkerCreator(() => {
						const worker = new Worker(this.workerSourceURL);
						const transcoderBinary = this.transcoderBinary.slice(0);

						worker.postMessage({ type: 'init', config: this.workerConfig, transcoderBinary }, [transcoderBinary]);

						return worker;
					});
				});

			if (_activeLoaders > 0) {
				// Each instance loads a transcoder and allocates workers, increasing network and memory cost.
				console.warn(
					'KTX2Loader: Multiple active KTX2 loaders may cause performance issues.'
					+ ' Use a single KTX2Loader instance, or call .dispose() on old instances.'
				);
			}

			_activeLoaders++;
		}

		return this.transcoderPending;
	}

	load(url, onLoad, onProgress, onError) {
		if (this.workerConfig === null) {
			throw new Error('KTX2Loader: Missing initialization with `.detectSupport(renderer)`.');
		}

		const loader = new FileLoader(this.manager);

		loader.setResponseType('arraybuffer');
		loader.setWithCredentials(this.withCredentials);

		loader.load(url, buffer => {
			// Check for an existing task using this buffer. A transferred buffer cannot be transferred
			// again from this thread.
			if (_taskCache.has(buffer)) {
				const cachedTask = _taskCache.get(buffer);
				return cachedTask.promise.then(onLoad).catch(onError);
			}

			this._createTextureData(buffer)
				.then(textureData => onLoad ? onLoad(textureData) : null)
				.catch(onError);
		}, onProgress, onError);
	}

	/**
	 * @param {ArrayBuffer} buffer
	 * @param {object?} config
	 * @return {Promise<Object>}
	 */
	async _createTextureData(buffer, config = {}) {
		const { read, VK_FORMAT_UNDEFINED, KHR_DF_FLAG_ALPHA_PREMULTIPLIED } = _ktxParser;

		const container = read(new Uint8Array(buffer));

		if (container.vkFormat !== VK_FORMAT_UNDEFINED) {
			return createTextureData(container);
		}

		const taskConfig = config;
		const texturePending = this.init().then(() => {
			return this.workerPool.postMessage({ type: 'transcode', buffer, taskConfig: taskConfig }, [buffer]);
		}).then(e => {
			const { faces, width, height, format, type, error, dfdFlags } = e.data;

			if (type === 'error') return Promise.reject(error);

			const mipmaps = faces[0].mipmaps;

			const textureData = {};

			textureData.faces = faces;
			textureData.layerCount = container.layerCount;

			textureData.image = container.layerCount > 1
				? { data: null, isCompressed: true, width: width, height: height, depth: container.layerCount }
				: { data: null, isCompressed: true, width: width, height: height };
			textureData.mipmaps = mipmaps;

			textureData.format = format;
			textureData.type = PIXEL_TYPE.UNSIGNED_BYTE;
			textureData.minFilter = mipmaps.length === 1 ? TEXTURE_FILTER.LINEAR : TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR;
			textureData.magFilter = TEXTURE_FILTER.LINEAR;
			textureData.generateMipmaps = false;
			textureData.encoding = parseTextureEncoding(container);
			textureData.premultiplyAlpha = !!(dfdFlags & KHR_DF_FLAG_ALPHA_PREMULTIPLIED);

			return textureData;
		});

		// Cache the task result.
		_taskCache.set(buffer, { promise: texturePending });

		return texturePending;
	}

	dispose() {
		this.workerPool.dispose();
		if (this.workerSourceURL) URL.revokeObjectURL(this.workerSourceURL);

		_activeLoaders--;

		return this;
	}

}

/* CONSTANTS */

KTX2Loader.BasisFormat = {
	ETC1S: 0,
	UASTC_4x4: 1
};

KTX2Loader.TranscoderFormat = {
	ETC1: 0,
	ETC2: 1,
	BC1: 2,
	BC3: 3,
	BC4: 4,
	BC5: 5,
	BC7_M6_OPAQUE_ONLY: 6,
	BC7_M5: 7,
	PVRTC1_4_RGB: 8,
	PVRTC1_4_RGBA: 9,
	ASTC_4x4: 10,
	ATC_RGB: 11,
	ATC_RGBA_INTERPOLATED_ALPHA: 12,
	RGBA32: 13,
	RGB565: 14,
	BGR565: 15,
	RGBA4444: 16
};

KTX2Loader.EngineFormat = {
	RGBAFormat: PIXEL_FORMAT.RGBA,
	RGBA_ASTC_4x4_Format: PIXEL_FORMAT.RGBA_ASTC_4x4,
	RGBA_BPTC_Format: PIXEL_FORMAT.RGBA_BPTC,
	// RGBA_ETC2_EAC_Format: RGBA_ETC2_EAC_Format, TODO
	RGBA_PVRTC_4BPPV1_Format: PIXEL_FORMAT.RGBA_PVRTC_4BPPV1,
	RGBA_S3TC_DXT5_Format: PIXEL_FORMAT.RGBA_S3TC_DXT5,
	RGB_ETC1_Format: PIXEL_FORMAT.RGB_ETC1,
	// RGB_ETC2_Format: RGB_ETC2_Format, TODO
	RGB_PVRTC_4BPPV1_Format: PIXEL_FORMAT.RGB_PVRTC_4BPPV1,
	RGB_S3TC_DXT1_Format: PIXEL_FORMAT.RGB_S3TC_DXT1
};

/* WEB WORKER */

KTX2Loader.BasisWorker = function() {
	let config;
	let transcoderPending;
	let BasisModule;

	const EngineFormat = _EngineFormat; // eslint-disable-line no-undef
	const TranscoderFormat = _TranscoderFormat; // eslint-disable-line no-undef
	const BasisFormat = _BasisFormat; // eslint-disable-line no-undef

	self.addEventListener('message', function(e) {
		const message = e.data;

		switch (message.type) {
			case 'init':
				config = message.config;
				init(message.transcoderBinary);
				break;

			case 'transcode':
				transcoderPending.then(() => {
					try {
						const { faces, buffers, width, height, hasAlpha, format, dfdFlags } = transcode(message.buffer);

						self.postMessage({ type: 'transcode', id: message.id, faces, width, height, hasAlpha, format, dfdFlags }, buffers);
					} catch (error) {
						console.error(error);

						self.postMessage({ type: 'error', id: message.id, error: error.message });
					}
				});
				break;
		}
	});

	function init(wasmBinary) {
		transcoderPending = new Promise(resolve => {
			BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
			BASIS(BasisModule); // eslint-disable-line no-undef
		}).then(() => {
			BasisModule.initializeBasis();

			if (BasisModule.KTX2File === undefined) {
				console.warn('KTX2Loader: Please update Basis Universal transcoder.');
			}
		});
	}

	function transcode(buffer) {
		const ktx2File = new BasisModule.KTX2File(new Uint8Array(buffer));

		function cleanup() {
			ktx2File.close();
			ktx2File.delete();
		}

		if (!ktx2File.isValid()) {
			cleanup();
			throw new Error('KTX2Loader: Invalid or unsupported .ktx2 file');
		}

		const basisFormat = ktx2File.isUASTC() ? BasisFormat.UASTC_4x4 : BasisFormat.ETC1S;
		const width = ktx2File.getWidth();
		const height = ktx2File.getHeight();
		const layerCount = ktx2File.getLayers() || 1;
		const levelCount = ktx2File.getLevels();
		const faceCount = ktx2File.getFaces();
		const hasAlpha = ktx2File.getHasAlpha();
		const dfdFlags = ktx2File.getDFDFlags();

		const { transcoderFormat, engineFormat } = getTranscoderFormat(basisFormat, width, height, hasAlpha);

		if (!width || !height || !levelCount) {
			cleanup();
			throw new Error('KTX2Loader: Invalid texture');
		}

		if (!ktx2File.startTranscoding()) {
			cleanup();
			throw new Error('KTX2Loader: .startTranscoding failed');
		}

		const faces = [];
		const buffers = [];

		for (let face = 0; face < faceCount; face++) {
			const mipmaps = [];

			for (let mip = 0; mip < levelCount; mip++) {
				const layerMips = [];

				let mipWidth, mipHeight;

				for (let layer = 0; layer < layerCount; layer++) {
					const levelInfo = ktx2File.getImageLevelInfo(mip, layer, face);

					if (face === 0 && mip === 0 && layer === 0 && (levelInfo.origWidth % 4 !== 0 || levelInfo.origHeight % 4 !== 0)) {
						console.warn('KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions.');
					}

					if (levelCount > 1) {
						mipWidth = levelInfo.origWidth;
						mipHeight = levelInfo.origHeight;
					} else {
						// refer to: github.com/mrdoob/three.js/issues/25908
						mipWidth = levelInfo.width;
						mipHeight = levelInfo.height;
					}

					const dst = new Uint8Array(ktx2File.getImageTranscodedSizeInBytes(mip, layer, 0, transcoderFormat));
					const status = ktx2File.transcodeImage(dst, mip, layer, face, transcoderFormat, 0, -1, -1);

					if (!status) {
						cleanup();
						throw new Error('KTX2Loader: .transcodeImage failed.');
					}

					layerMips.push(dst);
				}

				const mipData = concat(layerMips);

				mipmaps.push({ data: mipData, width: mipWidth, height: mipHeight });
				buffers.push(mipData.buffer);
			}

			faces.push({ mipmaps, width, height, format: engineFormat });
		}

		cleanup();

		return { faces, buffers, width, height, hasAlpha, format: engineFormat, dfdFlags };
	}

	//

	// Optimal choice of a transcoder target format depends on the Basis format (ETC1S or UASTC),
	// device capabilities, and texture dimensions. The list below ranks the formats separately
	// for ETC1S and UASTC.
	//
	// In some cases, transcoding UASTC to RGBA32 might be preferred for higher quality (at
	// significant memory cost) compared to ETC1/2, BC1/3, and PVRTC. The transcoder currently
	// chooses RGBA32 only as a last resort and does not expose that option to the caller.
	const FORMAT_OPTIONS = [
		{
			if: 'astcSupported',
			basisFormat: [BasisFormat.UASTC_4x4],
			transcoderFormat: [TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4],
			engineFormat: [EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format],
			priorityETC1S: Infinity,
			priorityUASTC: 1,
			needsPowerOfTwo: false
		},
		{
			if: 'bptcSupported',
			basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
			transcoderFormat: [TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5],
			engineFormat: [EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format],
			priorityETC1S: 3,
			priorityUASTC: 2,
			needsPowerOfTwo: false
		},
		{
			if: 'dxtSupported',
			basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
			transcoderFormat: [TranscoderFormat.BC1, TranscoderFormat.BC3],
			engineFormat: [EngineFormat.RGB_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format],
			priorityETC1S: 4,
			priorityUASTC: 5,
			needsPowerOfTwo: false
		},
		{
			if: 'etc2Supported',
			basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
			transcoderFormat: [TranscoderFormat.ETC1, TranscoderFormat.ETC2],
			engineFormat: [EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format],
			priorityETC1S: 1,
			priorityUASTC: 3,
			needsPowerOfTwo: false
		},
		{
			if: 'etc1Supported',
			basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
			transcoderFormat: [TranscoderFormat.ETC1],
			engineFormat: [EngineFormat.RGB_ETC1_Format],
			priorityETC1S: 2,
			priorityUASTC: 4,
			needsPowerOfTwo: false
		},
		{
			if: 'pvrtcSupported',
			basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
			transcoderFormat: [TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA],
			engineFormat: [EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format],
			priorityETC1S: 5,
			priorityUASTC: 6,
			needsPowerOfTwo: true
		}
	];

	const ETC1S_OPTIONS = FORMAT_OPTIONS.sort(function(a, b) {
		return a.priorityETC1S - b.priorityETC1S;
	});
	const UASTC_OPTIONS = FORMAT_OPTIONS.sort(function(a, b) {
		return a.priorityUASTC - b.priorityUASTC;
	});

	function getTranscoderFormat(basisFormat, width, height, hasAlpha) {
		let transcoderFormat;
		let engineFormat;

		const options = basisFormat === BasisFormat.ETC1S ? ETC1S_OPTIONS : UASTC_OPTIONS;

		for (let i = 0; i < options.length; i++) {
			const opt = options[i];

			if (!config[opt.if]) continue;
			if (!opt.basisFormat.includes(basisFormat)) continue;
			if (hasAlpha && opt.transcoderFormat.length < 2) continue;
			if (opt.needsPowerOfTwo && !(isPowerOfTwo(width) && isPowerOfTwo(height))) continue;

			transcoderFormat = opt.transcoderFormat[hasAlpha ? 1 : 0];
			engineFormat = opt.engineFormat[hasAlpha ? 1 : 0];

			return { transcoderFormat, engineFormat };
		}

		console.warn('KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32.');

		transcoderFormat = TranscoderFormat.RGBA32;
		engineFormat = EngineFormat.RGBAFormat;

		return { transcoderFormat, engineFormat };
	}

	function isPowerOfTwo(value) {
		if (value <= 2) return true;
		return (value & (value - 1)) === 0 && value !== 0;
	}

	/** Concatenates N byte arrays. */
	function concat(arrays) {
		if (arrays.length === 1) return arrays[0];

		let totalByteLength = 0;

		for (const array of arrays) {
			totalByteLength += array.byteLength;
		}

		const result = new Uint8Array(totalByteLength);

		let byteOffset = 0;

		for (const array of arrays) {
			result.set(array, byteOffset);
			byteOffset += array.byteLength;
		}

		return result;
	}
};

//
// Parsing for non-Basis textures. These textures are may have supercompression
// like Zstd, but they do not require transcoding.

const UNCOMPRESSED_FORMATS = new Set([PIXEL_FORMAT.RGBA, PIXEL_FORMAT.RG, PIXEL_FORMAT.Red]);

let FORMAT_MAP = {};
function setFORMAT_MAP() {
	FORMAT_MAP = {
		[_ktxParser.VK_FORMAT_R32G32B32A32_SFLOAT]: PIXEL_FORMAT.RGBA,
		[_ktxParser.VK_FORMAT_R16G16B16A16_SFLOAT]: PIXEL_FORMAT.RGBA,
		[_ktxParser.VK_FORMAT_R8G8B8A8_UNORM]: PIXEL_FORMAT.RGBA,
		[_ktxParser.VK_FORMAT_R8G8B8A8_SRGB]: PIXEL_FORMAT.RGBA,

		[_ktxParser.VK_FORMAT_R32G32_SFLOAT]: PIXEL_FORMAT.RG,
		[_ktxParser.VK_FORMAT_R16G16_SFLOAT]: PIXEL_FORMAT.RG,
		[_ktxParser.VK_FORMAT_R8G8_UNORM]: PIXEL_FORMAT.RG,
		[_ktxParser.VK_FORMAT_R8G8_SRGB]: PIXEL_FORMAT.RG,

		[_ktxParser.VK_FORMAT_R32_SFLOAT]: PIXEL_FORMAT.Red,
		[_ktxParser.VK_FORMAT_R16_SFLOAT]: PIXEL_FORMAT.Red,
		[_ktxParser.VK_FORMAT_R8_SRGB]: PIXEL_FORMAT.Red,
		[_ktxParser.VK_FORMAT_R8_UNORM]: PIXEL_FORMAT.Red

		// TODO: support ASTC formats
	};
}

let TYPE_MAP = {};
function setTYPE_MAP() {
	TYPE_MAP = {
		[_ktxParser.VK_FORMAT_R32G32B32A32_SFLOAT]: PIXEL_TYPE.FLOAT,
		[_ktxParser.VK_FORMAT_R16G16B16A16_SFLOAT]: PIXEL_TYPE.HALF_FLOAT,
		[_ktxParser.VK_FORMAT_R8G8B8A8_UNORM]: PIXEL_TYPE.UNSIGNED_BYTE,
		[_ktxParser.VK_FORMAT_R8G8B8A8_SRGB]: PIXEL_TYPE.UNSIGNED_BYTE,

		[_ktxParser.VK_FORMAT_R32G32_SFLOAT]: PIXEL_TYPE.FLOAT,
		[_ktxParser.VK_FORMAT_R16G16_SFLOAT]: PIXEL_TYPE.HALF_FLOAT,
		[_ktxParser.VK_FORMAT_R8G8_UNORM]: PIXEL_TYPE.UNSIGNED_BYTE,
		[_ktxParser.VK_FORMAT_R8G8_SRGB]: PIXEL_TYPE.UNSIGNED_BYTE,

		[_ktxParser.VK_FORMAT_R32_SFLOAT]: PIXEL_TYPE.FLOAT,
		[_ktxParser.VK_FORMAT_R16_SFLOAT]: PIXEL_TYPE.HALF_FLOAT,
		[_ktxParser.VK_FORMAT_R8_SRGB]: PIXEL_TYPE.UNSIGNED_BYTE,
		[_ktxParser.VK_FORMAT_R8_UNORM]: PIXEL_TYPE.UNSIGNED_BYTE
	};
}

async function createTextureData(container) {
	const { vkFormat, pixelWidth, pixelHeight, pixelDepth } = container;

	if (FORMAT_MAP[vkFormat] === undefined) {
		throw new Error('KTX2Loader: Unsupported vkFormat.');
	}

	let isCompressed = true;
	if (UNCOMPRESSED_FORMATS.has(FORMAT_MAP[vkFormat])) {
		isCompressed = false;
	}

	//

	if (container.supercompressionScheme === _ktxParser.KHR_SUPERCOMPRESSION_ZSTD) {
		if (!_zstd) {
			if (!_zstdDecoder) {
				throw new Error('KTX2Loader: ZSTDDecoder not set.');
			}

			_zstd = new _zstdDecoder();
			await _zstd.init();
		}
	}

	//

	const mipmaps = [];

	for (let levelIndex = 0; levelIndex < container.levels.length; levelIndex++) {
		const levelWidth = Math.max(1, pixelWidth >> levelIndex);
		const levelHeight = Math.max(1, pixelHeight >> levelIndex);
		const levelDepth = pixelDepth ? Math.max(1, pixelDepth >> levelIndex) : 0;

		const level = container.levels[levelIndex];

		let levelData;

		if (container.supercompressionScheme === _ktxParser.KHR_SUPERCOMPRESSION_NONE) {
			levelData = level.levelData;
		} else if (container.supercompressionScheme === _ktxParser.KHR_SUPERCOMPRESSION_ZSTD) {
			levelData = _zstd.decode(level.levelData, level.uncompressedByteLength);
		} else {
			throw new Error('KTX2Loader: Unsupported supercompressionScheme.');
		}

		let data;

		if (TYPE_MAP[vkFormat] === PIXEL_TYPE.FLOAT) {
			data = new Float32Array(
				levelData.buffer,
				levelData.byteOffset,
				levelData.byteLength / Float32Array.BYTES_PER_ELEMENT
			);
		} else if (TYPE_MAP[vkFormat] === PIXEL_TYPE.HALF_FLOAT) {
			data = new Uint16Array(
				levelData.buffer,
				levelData.byteOffset,
				levelData.byteLength / Uint16Array.BYTES_PER_ELEMENT
			);
		} else {
			data = levelData;
		}

		mipmaps.push({ data, isCompressed, width: levelWidth, height: levelHeight, depth: levelDepth });
	}

	const textureData = {};
	textureData.image = mipmaps[0];
	textureData.mipmaps = mipmaps.length > 1 ? mipmaps : [];
	textureData.type = TYPE_MAP[vkFormat];
	textureData.format = FORMAT_MAP[vkFormat];
	textureData.minFilter = mipmaps.length > 1 ? TEXTURE_FILTER.LINEAR_MIPMAP_LINEAR : TEXTURE_FILTER.LINEAR;
	textureData.magFilter = TEXTURE_FILTER.LINEAR;
	textureData.generateMipmaps = false;
	textureData.encoding = parseTextureEncoding(container);
	textureData.premultiplyAlpha = false;

	return Promise.resolve(textureData);
}

function parseTextureEncoding(container) {
	const { KHR_DF_PRIMARIES_BT709, KHR_DF_TRANSFER_SRGB, KHR_DF_PRIMARIES_DISPLAYP3, KHR_DF_PRIMARIES_UNSPECIFIED } = _ktxParser;

	const dfd = container.dataFormatDescriptor[0];

	if (dfd.colorPrimaries === KHR_DF_PRIMARIES_BT709) {
		return dfd.transferFunction === KHR_DF_TRANSFER_SRGB ? TEXEL_ENCODING_TYPE.SRGB : TEXEL_ENCODING_TYPE.LINEAR;
	} else if (dfd.colorPrimaries === KHR_DF_PRIMARIES_DISPLAYP3) {
		console.warn('KTX2Loader: DisplayP3 encoding is not supported.');
		return dfd.transferFunction === KHR_DF_TRANSFER_SRGB ? TEXEL_ENCODING_TYPE.SRGB : TEXEL_ENCODING_TYPE.LINEAR;
	} else if (dfd.colorPrimaries === KHR_DF_PRIMARIES_UNSPECIFIED) {
		return TEXEL_ENCODING_TYPE.LINEAR;
	} else {
		console.warn(`KTX2Loader: Unsupported color primaries, "${dfd.colorPrimaries}"`);
		return TEXEL_ENCODING_TYPE.LINEAR;
	}
}

class KTX2TextureLoader extends KTX2Loader {

	constructor(manager) {
		super(manager);
	}

	load(url, onLoad, onProgress, onError) {
		super.load(url, textureData => {
			const texture = new Texture2D();

			// TODO Texture3D or Texture2DArray
			// TODO TextureCube

			texture.image = textureData.image;
			texture.mipmaps = textureData.mipmaps;
			texture.type = textureData.type;
			texture.format = textureData.format;
			texture.minFilter = textureData.minFilter;
			texture.magFilter = textureData.magFilter;
			texture.generateMipmaps = textureData.generateMipmaps;
			texture.encoding = textureData.encoding;
			texture.premultiplyAlpha = textureData.premultiplyAlpha;

			texture.flipY = false;

			texture.version++;

			onLoad && onLoad(texture);
		}, onProgress, onError);
	}

}

export { KTX2Loader, KTX2TextureLoader };