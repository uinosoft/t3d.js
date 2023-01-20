/**
 * DRACOLoader.js
 */

import {
	Attribute,
	Buffer,
	DRAW_MODE,
	FileLoader,
	Geometry
} from 't3d';

/**
 * @param {t3d.LoadingManager} manager
 */
var DRACOLoader = function(manager) {
	this.timeLoaded = 0;
	this.manager = manager;
	this.materials = null;
	this.verbosity = 0;
	this.attributeOptions = {};
	this.drawMode = DRAW_MODE.TRIANGLES;
	// Native Draco attribute type to t3d attribute type.
	this.nativeAttributeMap = {
		'a_Position': 'POSITION',
		'a_Normal': 'NORMAL',
		'a_Color': 'COLOR',
		'a_Uv': 'TEX_COORD'
	};
};

DRACOLoader.prototype = {

	constructor: DRACOLoader,

	load: function(url, onLoad, onProgress, onError) {
		var scope = this;
		var loader = new FileLoader(scope.manager);
		loader.setPath(this.path);
		loader.setResponseType('arraybuffer');
		loader.load(url, function(blob) {
			scope.decodeDracoFile(blob, onLoad);
		}, onProgress, onError);
	},

	setPath: function(value) {
		this.path = value;
		return this;
	},

	setVerbosity: function(level) {
		this.verbosity = level;
		return this;
	},

	/**
     *  Sets desired mode for generated geometry indices.
     *  Can be either:
     *      DRAW_MODE.TRIANGLES
     *      DRAW_MODE.TRIANGLE_STRIP
     */
	setDrawMode: function(drawMode) {
		this.drawMode = drawMode;
		return this;
	},

	/**
     * Skips dequantization for a specific attribute.
     * |attributeName| is the t3d name of the given attribute type.
     * The only currently supported |attributeName| is 'position', more may be
     * added in future.
     */
	setSkipDequantization: function(attributeName, skip) {
		var skipDequantization = true;
		if (typeof skip !== 'undefined') { skipDequantization = skip; }
		this.getAttributeOptions(attributeName).skipDequantization =
            skipDequantization;
		return this;
	},

	/**
     * |attributeUniqueIdMap| specifies attribute unique id for an attribute in
     * the geometry to be decoded. The name of the attribute must be one of the
     * supported attribute type in t3d, including:
     *     'a_Position',
     *     'a_Color',
     *     'a_Normal',
     *     'a_Uv',
     *     'a_Uv2',
     *     'skinIndex',
     *     'skinWeight'.
     * The format is:
     *     attributeUniqueIdMap[attributeName] = attributeId
     */
	decodeDracoFile: function(rawBuffer, callback, attributeUniqueIdMap,
		attributeTypeMap) {
		var scope = this;
		DRACOLoader.getDecoderModule()
			.then(function (module) {
				scope.decodeDracoFileInternal(rawBuffer, module.decoder, callback,
					attributeUniqueIdMap || {}, attributeTypeMap || {});
			});
	},

	decodeDracoFileInternal: function(rawBuffer, dracoDecoder, callback,
		attributeUniqueIdMap, attributeTypeMap) {
		/*
       	 * Here is how to use Draco Javascript decoder and get the geometry.
       	 */
		var buffer = new dracoDecoder.DecoderBuffer();
		buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
		var decoder = new dracoDecoder.Decoder();

		/*
         * Determine what type is this file: mesh or point cloud.
         */
		var geometryType = decoder.GetEncodedGeometryType(buffer);
		if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
			if (this.verbosity > 0) {
				console.log('Loaded a mesh.');
			}
		} else if (geometryType == dracoDecoder.POINT_CLOUD) {
			if (this.verbosity > 0) {
				console.log('Loaded a point cloud.');
			}
		} else {
			var errorMsg = 't3d.DRACOLoader: Unknown geometry type.';
			console.error(errorMsg);
			throw new Error(errorMsg);
		}
		callback(this.convertDracoGeometryTot3d(dracoDecoder, decoder,
			geometryType, buffer, attributeUniqueIdMap, attributeTypeMap));
	},

	addAttributeToGeometry: function(dracoDecoder, decoder, dracoGeometry,
		attributeName, attributeType, attribute,
		geometry, geometryBuffer) {
		if (attribute.ptr === 0) {
			var errorMsg = 't3d.DRACOLoader: No attribute ' + attributeName;
			console.error(errorMsg);
			throw new Error(errorMsg);
		}

		var numComponents = attribute.num_components();
		var numPoints = dracoGeometry.num_points();
		var numValues = numPoints * numComponents;
		var attributeData;

		switch (attributeType) {
			case Float32Array:
				attributeData = new dracoDecoder.DracoFloat32Array();
				decoder.GetAttributeFloatForAllPoints(
					dracoGeometry, attribute, attributeData);
				geometryBuffer[attributeName] = new Float32Array(numValues);
				break;

			case Int8Array:
				attributeData = new dracoDecoder.DracoInt8Array();
				decoder.GetAttributeInt8ForAllPoints(
					dracoGeometry, attribute, attributeData);
				geometryBuffer[attributeName] = new Int8Array(numValues);
				break;

			case Int16Array:
				attributeData = new dracoDecoder.DracoInt16Array();
				decoder.GetAttributeInt16ForAllPoints(
					dracoGeometry, attribute, attributeData);
				geometryBuffer[attributeName] = new Int16Array(numValues);
				break;

			case Int32Array:
				attributeData = new dracoDecoder.DracoInt32Array();
				decoder.GetAttributeInt32ForAllPoints(
					dracoGeometry, attribute, attributeData);
				geometryBuffer[attributeName] = new Int32Array(numValues);
				break;

			case Uint8Array:
				attributeData = new dracoDecoder.DracoUInt8Array();
				decoder.GetAttributeUInt8ForAllPoints(
					dracoGeometry, attribute, attributeData);
				geometryBuffer[attributeName] = new Uint8Array(numValues);
				break;

			case Uint16Array:
				attributeData = new dracoDecoder.DracoUInt16Array();
				decoder.GetAttributeUInt16ForAllPoints(
					dracoGeometry, attribute, attributeData);
				geometryBuffer[attributeName] = new Uint16Array(numValues);
				break;

			case Uint32Array:
				attributeData = new dracoDecoder.DracoUInt32Array();
				decoder.GetAttributeUInt32ForAllPoints(
					dracoGeometry, attribute, attributeData);
				geometryBuffer[attributeName] = new Uint32Array(numValues);
				break;

			default:
				var errorMsg = 't3d.DRACOLoader: Unexpected attribute type.';
				console.error(errorMsg);
				throw new Error(errorMsg);
		}

		// Copy data from decoder.
		for (var i = 0; i < numValues; i++) {
			geometryBuffer[attributeName][i] = attributeData.GetValue(i);
		}
		// Add attribute to t3d geometry for rendering.
		geometry.addAttribute(attributeName,
			new Attribute(new Buffer(geometryBuffer[attributeName],
				numComponents)));
		dracoDecoder.destroy(attributeData);
	},

	convertDracoGeometryTot3d: function(dracoDecoder, decoder, geometryType,
		buffer, attributeUniqueIdMap,
		attributeTypeMap) {
		if (this.getAttributeOptions('a_Position').skipDequantization === true) {
			decoder.SkipAttributeTransform(dracoDecoder.POSITION);
		}
		var dracoGeometry;
		var decodingStatus;
		const start_time = performance.now();
		if (geometryType === dracoDecoder.TRIANGULAR_MESH) {
			dracoGeometry = new dracoDecoder.Mesh();
			decodingStatus = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
		} else {
			dracoGeometry = new dracoDecoder.PointCloud();
			decodingStatus =
              decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
		}
		if (!decodingStatus.ok() || dracoGeometry.ptr == 0) {
			var errorMsg = 't3d.DRACOLoader: Decoding failed: ';
			errorMsg += decodingStatus.error_msg();
			console.error(errorMsg);
			dracoDecoder.destroy(decoder);
			dracoDecoder.destroy(dracoGeometry);
			throw new Error(errorMsg);
		}

		var decode_end = performance.now();
		dracoDecoder.destroy(buffer);
		/*
         * Example on how to retrieve mesh and attributes.
         */
		var numFaces;
		if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
			numFaces = dracoGeometry.num_faces();
			if (this.verbosity > 0) {
				console.log('Number of faces loaded: ' + numFaces.toString());
			}
		} else {
			numFaces = 0;
		}

		var numPoints = dracoGeometry.num_points();
		var numAttributes = dracoGeometry.num_attributes();
		if (this.verbosity > 0) {
			console.log('Number of points loaded: ' + numPoints.toString());
			console.log('Number of attributes loaded: ' +
              numAttributes.toString());
		}

		// Verify if there is position attribute.
		var posAttId = decoder.GetAttributeId(dracoGeometry,
			dracoDecoder.POSITION);
		if (posAttId == -1) {
			var errorMsg = 't3d.DRACOLoader: No position attribute found.';
			console.error(errorMsg);
			dracoDecoder.destroy(decoder);
			dracoDecoder.destroy(dracoGeometry);
			throw new Error(errorMsg);
		}
		var posAttribute = decoder.GetAttribute(dracoGeometry, posAttId);

		// Structure for converting to t3d geometry later.
		var geometryBuffer = {};
		// Import data to t3d geometry.
		var geometry = new Geometry();

		// Add native Draco attribute type to geometry.
		for (var attributeName in this.nativeAttributeMap) {
			// The native attribute type is only used when no unique Id is
			// provided. For example, loading .drc files.
			if (attributeUniqueIdMap[attributeName] === undefined) {
				var attId = decoder.GetAttributeId(dracoGeometry,
					dracoDecoder[this.nativeAttributeMap[attributeName]]);
				if (attId !== -1) {
					if (this.verbosity > 0) {
						console.log('Loaded ' + attributeName + ' attribute.');
					}
					var attribute = decoder.GetAttribute(dracoGeometry, attId);
					this.addAttributeToGeometry(dracoDecoder, decoder, dracoGeometry,
						attributeName, Float32Array, attribute, geometry, geometryBuffer);
				}
			}
		}

		// Add attributes of user specified unique id. E.g. GLTF models.
		for (var attributeName in attributeUniqueIdMap) {
			var attributeType = attributeTypeMap[attributeName] || Float32Array;
			var attributeId = attributeUniqueIdMap[attributeName];
			var attribute = decoder.GetAttributeByUniqueId(dracoGeometry,
				attributeId);
			this.addAttributeToGeometry(dracoDecoder, decoder, dracoGeometry,
				attributeName, attributeType, attribute, geometry, geometryBuffer);
		}

		// For mesh, we need to generate the faces.
		if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
			if (this.drawMode === DRAW_MODE.TRIANGLE_STRIP) {
				var stripsArray = new dracoDecoder.DracoInt32Array();
				// var numStrips = decoder.GetTriangleStripsFromMesh(
				// 	dracoGeometry, stripsArray);
				geometryBuffer.indices = new Array(stripsArray.size());
				for (var i = 0; i < stripsArray.size(); ++i) {
					geometryBuffer.indices[i] = stripsArray.GetValue(i);
				}
				dracoDecoder.destroy(stripsArray);
			} else {
				var numIndices = numFaces * 3;
				geometryBuffer.indices = new Array(numIndices);
				var ia = new dracoDecoder.DracoInt32Array();
				for (var i = 0; i < numFaces; ++i) {
					decoder.GetFaceFromMesh(dracoGeometry, i, ia);
					var index = i * 3;
					geometryBuffer.indices[index] = ia.GetValue(0);
					geometryBuffer.indices[index + 1] = ia.GetValue(1);
					geometryBuffer.indices[index + 2] = ia.GetValue(2);
				}
				dracoDecoder.destroy(ia);
			}
		}

		geometry.drawMode = this.drawMode;
		if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
			geometry.setIndex(geometryBuffer.indices.length > 65535 ?
				new Attribute(new Buffer(new Uint16Array(geometryBuffer.indices), 1)) :
				new Attribute(new Buffer(new Uint32Array(geometryBuffer.indices), 1))
			);
		}
		var posTransform = new dracoDecoder.AttributeQuantizationTransform();
		if (posTransform.InitFromAttribute(posAttribute)) {
			// Quantized attribute. Store the quantization parameters into the
			// t3d attribute.
			geometry.attributes['a_Position'].isQuantized = true;
			geometry.attributes['a_Position'].maxRange = posTransform.range();
			geometry.attributes['a_Position'].numQuantizationBits =
              posTransform.quantization_bits();
			geometry.attributes['a_Position'].minValues = new Float32Array(3);
			for (var i = 0; i < 3; ++i) {
				geometry.attributes['a_Position'].minValues[i] =
                posTransform.min_value(i);
			}
		}
		dracoDecoder.destroy(posTransform);
		dracoDecoder.destroy(decoder);
		dracoDecoder.destroy(dracoGeometry);

		this.decode_time = decode_end - start_time;
		this.import_time = performance.now() - decode_end;

		if (this.verbosity > 0) {
			console.log('Decode time: ' + this.decode_time);
			console.log('Import time: ' + this.import_time);
		}
		return geometry;
	},

	isVersionSupported: function(version, callback) {
		DRACOLoader.getDecoderModule()
			.then(function (module) {
				callback(module.decoder.isVersionSupported(version));
			});
	},

	getAttributeOptions: function(attributeName) {
		if (typeof this.attributeOptions[attributeName] === 'undefined') { this.attributeOptions[attributeName] = {}; }
		return this.attributeOptions[attributeName];
	}
};

DRACOLoader.decoderPath = './';
DRACOLoader.decoderConfig = {};
DRACOLoader.decoderModulePromise = null;

/**
 * Sets the base path for decoder source files.
 * @param {String} path
 */
DRACOLoader.setDecoderPath = function (path) {
	DRACOLoader.decoderPath = path;
};

/**
 * Sets decoder configuration and releases singleton decoder module. Module
 * will be recreated with the next decoding call.
 * @param {Object} config
 */
DRACOLoader.setDecoderConfig = function (config) {
	var wasmBinary = DRACOLoader.decoderConfig.wasmBinary;
	DRACOLoader.decoderConfig = config || {};
	DRACOLoader.releaseDecoderModule();

	// Reuse WASM binary.
	if (wasmBinary) DRACOLoader.decoderConfig.wasmBinary = wasmBinary;
};

/**
 * Releases the singleton DracoDecoderModule instance. Module will be recreated
 * with the next decoding call.
 */
DRACOLoader.releaseDecoderModule = function () {
	DRACOLoader.decoderModulePromise = null;
};

/**
 * Gets WebAssembly or asm.js singleton instance of DracoDecoderModule
 * after testing for browser support. Returns Promise that resolves when
 * module is available.
 * @return {Promise<{decoder: DracoDecoderModule}>}
 */
DRACOLoader.getDecoderModule = function () {
	var scope = this;
	var path = DRACOLoader.decoderPath;
	var config = DRACOLoader.decoderConfig;
	var promise = DRACOLoader.decoderModulePromise;

	if (promise) return promise;

	// Load source files.
	if (typeof DracoDecoderModule !== 'undefined') {
		// Loaded externally.
		promise = Promise.resolve();
	} else if (typeof WebAssembly !== 'object' || config.type === 'js') {
		// Load with asm.js.
		promise = DRACOLoader._loadScript(path + 'draco_decoder.js');
	} else {
		// Load with WebAssembly.
		config.wasmBinaryFile = path + 'draco_decoder.wasm';
		promise = DRACOLoader._loadScript(path + 'draco_wasm_wrapper.js')
			.then(function () {
				return DRACOLoader._loadArrayBuffer(config.wasmBinaryFile);
			})
			.then(function (wasmBinary) {
				config.wasmBinary = wasmBinary;
			});
	}

	// Wait for source files, then create and return a decoder.
	promise = promise.then(function () {
		return new Promise(function (resolve) {
			config.onModuleLoaded = function (decoder) {
				scope.timeLoaded = performance.now();
				// Module is Promise-like. Wrap before resolving to avoid loop.
				resolve({ decoder: decoder });
			};
			DracoDecoderModule(config);
		});
	});

	DRACOLoader.decoderModulePromise = promise;
	return promise;
};

/**
 * @param {String} src
 * @return {Promise}
 */
DRACOLoader._loadScript = function (src) {
	var prevScript = document.getElementById('decoder_script');
	if (prevScript !== null) {
		prevScript.parentNode.removeChild(prevScript);
	}
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.id = 'decoder_script';
	script.type = 'text/javascript';
	script.src = src;
	return new Promise(function (resolve) {
		script.onload = resolve;
		head.appendChild(script);
	});
};

/**
 * @param {String} src
 * @return {Promise}
 */
DRACOLoader._loadArrayBuffer = function (src) {
	var loader = new FileLoader();
	loader.setResponseType('arraybuffer');
	return new Promise(function(resolve, reject) {
		loader.load(src, resolve, undefined, reject);
	});
};

export { DRACOLoader };