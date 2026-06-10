import { GPUMemoryInfo } from '../../../../src/render/GPUMemoryInfo.js';

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
