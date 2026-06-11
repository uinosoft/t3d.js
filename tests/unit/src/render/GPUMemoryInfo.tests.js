import { GPUMemoryInfo } from '../../../../src/render/GPUMemoryInfo.js';
import { PIXEL_FORMAT } from '../../../../src/const.js';
import { RenderBuffer } from '../../../../src/resources/RenderBuffer.js';
import { Buffer } from '../../../../src/resources/geometries/Buffer.js';
import { Texture2D } from '../../../../src/resources/textures/Texture2D.js';

QUnit.module('GPUMemoryInfo');

QUnit.test('initial state', assert => {
	const info = new GPUMemoryInfo();

	assert.strictEqual(info.buffers, 0, 'buffers starts at 0');
	assert.strictEqual(info.textures, 0, 'textures starts at 0');
	assert.strictEqual(info.renderBuffers, 0, 'renderBuffers starts at 0');
	assert.strictEqual(info.frameBuffers, 0, 'frameBuffers starts at 0');
	assert.strictEqual(info.programs, 0, 'programs starts at 0');
	assert.strictEqual(info.bufferBytes, 0, 'bufferBytes starts at 0');
	assert.strictEqual(info.textureBytes, 0, 'textureBytes starts at 0');
	assert.strictEqual(info.renderBufferBytes, 0, 'renderBufferBytes starts at 0');
	assert.strictEqual(info.readBufferBytes, 0, 'readBufferBytes starts at 0');
	assert.strictEqual(info.totalBytes, 0, 'totalBytes starts at 0');
});

QUnit.test('updates buffer statistics by delta', assert => {
	const info = new GPUMemoryInfo();

	info._updateBuffer(0, 128);
	assert.strictEqual(info.buffers, 1, 'buffer count increments on allocation');
	assert.strictEqual(info.bufferBytes, 128, 'buffer bytes are added');
	assert.strictEqual(info.totalBytes, 128, 'total bytes include buffer bytes');

	info._updateBuffer(128, 256);
	assert.strictEqual(info.buffers, 1, 'buffer count is unchanged on resize');
	assert.strictEqual(info.bufferBytes, 256, 'buffer bytes are updated by delta');
	assert.strictEqual(info.totalBytes, 256, 'total bytes are updated by delta');

	info._updateBuffer(256, 0);
	assert.strictEqual(info.buffers, 0, 'buffer count decrements on release');
	assert.strictEqual(info.bufferBytes, 0, 'buffer bytes are removed');
	assert.strictEqual(info.totalBytes, 0, 'total bytes are removed');
});

QUnit.test('updates texture and renderbuffer statistics by delta', assert => {
	const info = new GPUMemoryInfo();

	info._updateTexture(0, 64);
	info._updateRenderBuffer(0, 32);
	assert.strictEqual(info.textures, 1, 'texture count increments on allocation');
	assert.strictEqual(info.renderBuffers, 1, 'renderbuffer count increments on allocation');
	assert.strictEqual(info.textureBytes, 64, 'texture bytes are added');
	assert.strictEqual(info.renderBufferBytes, 32, 'renderbuffer bytes are added');
	assert.strictEqual(info.totalBytes, 96, 'total bytes include texture and renderbuffer bytes');

	info._updateTexture(64, 96);
	info._updateRenderBuffer(32, 16);
	assert.strictEqual(info.textures, 1, 'texture count is unchanged on resize');
	assert.strictEqual(info.renderBuffers, 1, 'renderbuffer count is unchanged on resize');
	assert.strictEqual(info.textureBytes, 96, 'texture bytes are updated by delta');
	assert.strictEqual(info.renderBufferBytes, 16, 'renderbuffer bytes are updated by delta');
	assert.strictEqual(info.totalBytes, 112, 'total bytes are updated by delta');

	info._updateTexture(96, 0);
	info._updateRenderBuffer(16, 0);
	assert.strictEqual(info.textures, 0, 'texture count decrements on release');
	assert.strictEqual(info.renderBuffers, 0, 'renderbuffer count decrements on release');
	assert.strictEqual(info.totalBytes, 0, 'total bytes are removed');
});

QUnit.test('updates read buffers, framebuffers, and programs', assert => {
	const info = new GPUMemoryInfo();

	info._updateReadBuffer(0, 512);
	assert.strictEqual(info.readBufferBytes, 512, 'read buffer bytes are added');
	assert.strictEqual(info.totalBytes, 512, 'total bytes include read buffer bytes');

	info._updateReadBuffer(512, 128);
	assert.strictEqual(info.readBufferBytes, 128, 'read buffer bytes are updated by delta');
	assert.strictEqual(info.totalBytes, 128, 'total bytes are updated by delta');

	info._updateFramebuffer(1);
	info._updateFramebuffer(1);
	info._updateFramebuffer(-1);
	assert.strictEqual(info.frameBuffers, 1, 'framebuffer count tracks deltas');

	info._updateProgram(1);
	info._updateProgram(1);
	info._updateProgram(-1);
	assert.strictEqual(info.programs, 1, 'program count tracks deltas');
});

QUnit.test('reset', assert => {
	const info = new GPUMemoryInfo();

	info._updateBuffer(0, 128);
	info._updateTexture(0, 64);
	info._updateRenderBuffer(0, 32);
	info._updateReadBuffer(0, 16);
	info._updateFramebuffer(1);
	info._updateProgram(1);

	info.reset();

	assert.strictEqual(info.buffers, 0, 'buffers reset to 0');
	assert.strictEqual(info.textures, 0, 'textures reset to 0');
	assert.strictEqual(info.renderBuffers, 0, 'renderBuffers reset to 0');
	assert.strictEqual(info.frameBuffers, 0, 'frameBuffers reset to 0');
	assert.strictEqual(info.programs, 0, 'programs reset to 0');
	assert.strictEqual(info.bufferBytes, 0, 'bufferBytes reset to 0');
	assert.strictEqual(info.textureBytes, 0, 'textureBytes reset to 0');
	assert.strictEqual(info.renderBufferBytes, 0, 'renderBufferBytes reset to 0');
	assert.strictEqual(info.readBufferBytes, 0, 'readBufferBytes reset to 0');
	assert.strictEqual(info.totalBytes, 0, 'totalBytes reset to 0');
});

QUnit.test('buffer records are disabled by default', assert => {
	const info = new GPUMemoryInfo();
	const buffer = new Buffer(new Float32Array(6), 3);
	const properties = { bytesPerElement: 4, __external: false };

	info._updateBuffer(0, 24, buffer, properties);

	assert.strictEqual(info.buffers, 1, 'buffer count is updated');
	assert.strictEqual(info.bufferBytes, 24, 'buffer bytes are updated');
	assert.deepEqual(info.getBufferRecords(), [], 'no buffer records are stored');
});

QUnit.test('tracks buffer records when enabled', assert => {
	const info = new GPUMemoryInfo();
	const smallBuffer = new Buffer(new Uint16Array(6), 3);
	const largeBuffer = new Buffer(new Float32Array(12), 3);

	smallBuffer.userData.label = 'small';
	largeBuffer.userData.gpuMemoryLabel = 'large';

	info.records = true;
	info._updateBuffer(0, 12, smallBuffer, { bytesPerElement: 2, __external: false });
	info._updateBuffer(0, 48, largeBuffer, { bytesPerElement: 4, __external: false });

	const records = info.getBufferRecords();

	assert.strictEqual(records.length, 2, 'two buffer records are stored');
	assert.strictEqual(records[0].id, largeBuffer.id, 'records are sorted by bytes descending');
	assert.strictEqual(records[0].bytes, 48, 'record bytes are stored');
	assert.strictEqual(records[0].label, 'large', 'gpuMemoryLabel is preferred');
	assert.strictEqual(records[0].external, false, 'external flag is stored');
	assert.strictEqual(records[0].version, largeBuffer.version, 'version is stored');
	assert.strictEqual(records[1].label, 'small', 'label fallback is used');
});

QUnit.test('updates and removes buffer records', assert => {
	const info = new GPUMemoryInfo();
	const buffer = new Buffer(new Float32Array(6), 3);

	info.setRecordsEnabled(true);
	info._updateBuffer(0, 24, buffer, { bytesPerElement: 4, __external: false });

	buffer.array = new Float32Array(12);
	buffer.count = 4;
	buffer.version++;
	info._updateBuffer(24, 48, buffer, { bytesPerElement: 4, __external: false });

	let records = info.getBufferRecords();
	assert.strictEqual(records.length, 1, 'record is updated instead of duplicated');
	assert.strictEqual(records[0].bytes, 48, 'record bytes are updated');
	assert.strictEqual(records[0].version, 1, 'record version is updated');

	info._updateBuffer(48, 0, buffer, { bytesPerElement: 4, __external: false });
	records = info.getBufferRecords();
	assert.strictEqual(records.length, 0, 'record is removed when buffer bytes become zero');
});

QUnit.test('disabling buffer records clears existing records', assert => {
	const info = new GPUMemoryInfo();
	const buffer = new Buffer(new Float32Array(6), 3);

	info.setRecordsEnabled(true);
	info._updateBuffer(0, 24, buffer, { bytesPerElement: 4, __external: false });
	assert.strictEqual(info.getBufferRecords().length, 1, 'record is stored when enabled');

	info.setRecordsEnabled(false);
	assert.strictEqual(info.records, false, 'records are disabled');
	assert.deepEqual(info.getBufferRecords(), [], 'records are cleared when disabled');

	info._updateBuffer(24, 48, buffer, { bytesPerElement: 4, __external: false });
	assert.strictEqual(info.buffers, 1, 'aggregate statistics continue updating');
	assert.strictEqual(info.bufferBytes, 48, 'aggregate bytes continue updating');
	assert.deepEqual(info.getBufferRecords(), [], 'records are not recreated while disabled');
});

QUnit.test('texture records are disabled by default', assert => {
	const info = new GPUMemoryInfo();
	const texture = new Texture2D();
	const properties = { __external: false, __width: 4, __height: 4, __maxMipLevel: 0 };

	info._updateTexture(0, 64, texture, properties);

	assert.strictEqual(info.textures, 1, 'texture count is updated');
	assert.strictEqual(info.textureBytes, 64, 'texture bytes are updated');
	assert.deepEqual(info.getTextureRecords(), [], 'no texture records are stored');
});

QUnit.test('tracks texture records when enabled', assert => {
	const info = new GPUMemoryInfo();
	const smallTexture = new Texture2D();
	const largeTexture = new Texture2D();

	smallTexture.userData.label = 'smallTexture';
	largeTexture.userData.gpuMemoryLabel = 'largeTexture';
	largeTexture.version = 2;

	info.records = true;
	info._updateTexture(0, 16, smallTexture, { __external: false, __width: 2, __height: 2, __maxMipLevel: 0 });
	info._updateTexture(0, 64, largeTexture, { __external: false, __width: 4, __height: 4, __maxMipLevel: 1 });

	const records = info.getTextureRecords();

	assert.strictEqual(records.length, 2, 'two texture records are stored');
	assert.strictEqual(records[0].id, largeTexture.id, 'records are sorted by bytes descending');
	assert.strictEqual(records[0].bytes, 64, 'record bytes are stored');
	assert.strictEqual(records[0].label, 'largeTexture', 'gpuMemoryLabel is preferred');
	assert.strictEqual(records[0].external, false, 'external flag is stored');
	assert.strictEqual(records[0].version, largeTexture.version, 'version is stored');
	assert.strictEqual(records[0].type, 'Texture2D', 'texture type is stored');
	assert.strictEqual(records[0].width, 4, 'texture width is stored');
	assert.strictEqual(records[0].height, 4, 'texture height is stored');
	assert.strictEqual(records[0].maxMipLevel, 1, 'max mip level is stored');
	assert.strictEqual(records[1].label, 'smallTexture', 'label fallback is used');
});

QUnit.test('updates and removes texture records', assert => {
	const info = new GPUMemoryInfo();
	const texture = new Texture2D();

	info.records = true;
	info._updateTexture(0, 16, texture, { __external: false, __width: 2, __height: 2, __maxMipLevel: 0 });

	texture.version++;
	info._updateTexture(16, 64, texture, { __external: false, __width: 4, __height: 4, __maxMipLevel: 0 });

	let records = info.getTextureRecords();
	assert.strictEqual(records.length, 1, 'record is updated instead of duplicated');
	assert.strictEqual(records[0].bytes, 64, 'record bytes are updated');
	assert.strictEqual(records[0].version, 1, 'record version is updated');
	assert.strictEqual(records[0].width, 4, 'record width is updated');

	info._updateTexture(64, 0, texture, { __external: false, __width: 4, __height: 4, __maxMipLevel: 0 });
	records = info.getTextureRecords();
	assert.strictEqual(records.length, 0, 'record is removed when texture bytes become zero');
});

QUnit.test('tracks renderbuffer records when enabled', assert => {
	const info = new GPUMemoryInfo();
	const smallRenderBuffer = new RenderBuffer(2, 2, PIXEL_FORMAT.RGBA8, 0);
	const largeRenderBuffer = new RenderBuffer(4, 4, PIXEL_FORMAT.DEPTH_COMPONENT16, 4);

	smallRenderBuffer.userData.label = 'smallRenderBuffer';
	largeRenderBuffer.userData.gpuMemoryLabel = 'largeRenderBuffer';

	info.records = true;
	info._updateRenderBuffer(0, 16, smallRenderBuffer, { __external: false });
	info._updateRenderBuffer(0, 128, largeRenderBuffer, { __external: false });

	const records = info.getRenderBufferRecords();

	assert.strictEqual(records.length, 2, 'two renderbuffer records are stored');
	assert.strictEqual(records[0].id, largeRenderBuffer.id, 'records are sorted by bytes descending');
	assert.strictEqual(records[0].bytes, 128, 'record bytes are stored');
	assert.strictEqual(records[0].label, 'largeRenderBuffer', 'gpuMemoryLabel is preferred');
	assert.strictEqual(records[0].external, false, 'external flag is stored');
	assert.strictEqual(records[0].width, 4, 'renderbuffer width is stored');
	assert.strictEqual(records[0].height, 4, 'renderbuffer height is stored');
	assert.strictEqual(records[0].format, PIXEL_FORMAT.DEPTH_COMPONENT16, 'renderbuffer format is stored');
	assert.strictEqual(records[0].multipleSampling, 4, 'renderbuffer sample count is stored');
	assert.strictEqual(records[1].label, 'smallRenderBuffer', 'label fallback is used');
});

QUnit.test('updates and removes renderbuffer records', assert => {
	const info = new GPUMemoryInfo();
	const renderBuffer = new RenderBuffer(2, 2);

	info.records = true;
	info._updateRenderBuffer(0, 16, renderBuffer, { __external: false });

	renderBuffer.width = 4;
	renderBuffer.height = 4;
	info._updateRenderBuffer(16, 64, renderBuffer, { __external: false });

	let records = info.getRenderBufferRecords();
	assert.strictEqual(records.length, 1, 'record is updated instead of duplicated');
	assert.strictEqual(records[0].bytes, 64, 'record bytes are updated');
	assert.strictEqual(records[0].width, 4, 'record width is updated');
	assert.strictEqual(records[0].height, 4, 'record height is updated');

	info._updateRenderBuffer(64, 0, renderBuffer, { __external: false });
	records = info.getRenderBufferRecords();
	assert.strictEqual(records.length, 0, 'record is removed when renderbuffer bytes become zero');
});

QUnit.test('disabling records clears all record types', assert => {
	const info = new GPUMemoryInfo();
	const buffer = new Buffer(new Float32Array(6), 3);
	const texture = new Texture2D();
	const renderBuffer = new RenderBuffer(2, 2);

	info.records = true;
	info._updateBuffer(0, 24, buffer, { __external: false });
	info._updateTexture(0, 16, texture, { __external: false, __width: 2, __height: 2, __maxMipLevel: 0 });
	info._updateRenderBuffer(0, 16, renderBuffer, { __external: false });

	info.records = false;

	assert.deepEqual(info.getBufferRecords(), [], 'buffer records are cleared');
	assert.deepEqual(info.getTextureRecords(), [], 'texture records are cleared');
	assert.deepEqual(info.getRenderBufferRecords(), [], 'renderbuffer records are cleared');
});

QUnit.test('reset clears all record types', assert => {
	const info = new GPUMemoryInfo();
	const buffer = new Buffer(new Float32Array(6), 3);
	const texture = new Texture2D();
	const renderBuffer = new RenderBuffer(2, 2);

	info.records = true;
	info._updateBuffer(0, 24, buffer, { __external: false });
	info._updateTexture(0, 16, texture, { __external: false, __width: 2, __height: 2, __maxMipLevel: 0 });
	info._updateRenderBuffer(0, 16, renderBuffer, { __external: false });

	info.reset();

	assert.deepEqual(info.getBufferRecords(), [], 'buffer records are cleared');
	assert.deepEqual(info.getTextureRecords(), [], 'texture records are cleared');
	assert.deepEqual(info.getRenderBufferRecords(), [], 'renderbuffer records are cleared');
});
