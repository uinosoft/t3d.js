// Characters [].:/ are reserved for track binding syntax.
const RESERVED_CHARS_RE = '\\[\\]\\.:\\/';
const reservedRe = new RegExp('[' + RESERVED_CHARS_RE + ']', 'g');

export class GLTFUtils {

	constructor() {}

	static sanitizeNodeName(name) {
		return name.replace(/\s/g, '_').replace(reservedRe, '');
	}

	static extractUrlBase(url) {
		const parts = url.split('/');
		parts.pop();
		return (parts.length < 1 ? '.' : parts.join('/')) + '/';
	}

	// url: aa.bin ;  path:example/resource/model/     (for example)example/resource/model/aa.bin
	static resolveURL(url, path) {
		// Invalid URL
		if (typeof url !== 'string' || url === '') return '';

		// Absolute URL http://,https://,//
		if (/^(https?:)?\/\//i.test(url)) return url;

		// Data URI
		if (/^data:.*,.*$/i.test(url)) return url;

		// Blob URL
		if (/^blob:.*$/i.test(url)) return url;

		// Relative URL
		return path + url;
	}

	static decodeText(array) {
		if (typeof TextDecoder !== 'undefined') {
			return new TextDecoder().decode(array);
		}

		// Avoid the String.fromCharCode.apply(null, array) shortcut, which
		// throws a "maximum call stack size exceeded" error for large arrays.

		let s = '';

		for (let i = 0, il = array.length; i < il; i++) {
			// Implicitly assumes little-endian.
			s += String.fromCharCode(array[i]);
		}

		try {
			// merges multi-byte utf-8 characters.

			return decodeURIComponent(escape(s));
		} catch (e) { // see #16358
			return s;
		}
	}

	static parseGLB(glb) {
		const UINT32_LENGTH = 4;
		const GLB_HEADER_MAGIC = 0x46546C67; // 'glTF'
		const GLB_HEADER_LENGTH = 12;
		const GLB_CHUNK_TYPES = { JSON: 0x4E4F534A, BIN: 0x004E4942 };

		const dataView = new DataView(glb);

		const header = {
			magic: dataView.getUint32(0, true),
			version: dataView.getUint32(UINT32_LENGTH, true),
			length: dataView.getUint32(2 * UINT32_LENGTH, true)
		};

		if (header.magic !== GLB_HEADER_MAGIC) {
			console.error('Invalid glb magic number. Expected 0x46546C67, found 0x' + header.magic.toString(16));
			return null;
		} else if (header.version < 2.0) {
			console.error('GLTFLoader: Legacy binary file detected.');
		}

		let chunkLength = dataView.getUint32(GLB_HEADER_LENGTH, true);
		let chunkType = dataView.getUint32(GLB_HEADER_LENGTH + UINT32_LENGTH, true);

		if (chunkType !== GLB_CHUNK_TYPES.JSON) {
			console.error('Invalid glb chunk type. Expected 0x4E4F534A, found 0x' + chunkType.toString(16));
			return null;
		}

		const glTFData = new Uint8Array(glb, GLB_HEADER_LENGTH + 2 * UINT32_LENGTH, chunkLength);
		const gltf = JSON.parse(GLTFUtils.decodeText(glTFData));

		const buffers = [];
		let byteOffset = GLB_HEADER_LENGTH + 2 * UINT32_LENGTH + chunkLength;

		while (byteOffset < header.length) {
			chunkLength = dataView.getUint32(byteOffset, true);
			chunkType = dataView.getUint32(byteOffset + UINT32_LENGTH, true);

			if (chunkType !== GLB_CHUNK_TYPES.BIN) {
				console.error('Invalid glb chunk type. Expected 0x004E4942, found 0x' + chunkType.toString(16));
				return null;
			}

			const currentOffset = byteOffset + 2 * UINT32_LENGTH;
			const buffer = glb.slice(currentOffset, currentOffset + chunkLength);
			buffers.push(buffer);

			byteOffset += chunkLength + 2 * UINT32_LENGTH;
		}

		return { gltf, buffers };
	}

	static getNormalizedComponentScale(constructor) {
		if (constructor === Int8Array) {
			return 1 / 127;
		} else if (constructor === Uint8Array) {
			return 1 / 255;
		} else if (constructor === Int16Array) {
			return 1 / 32767;
		} else if (constructor === Uint16Array) {
			return 1 / 65535;
		} else {
			throw new Error('Unsupported normalized accessor component type.');
		}
	}

}