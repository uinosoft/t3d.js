import { PIXEL_FORMAT } from '../../../../src/const.js';
import { RenderBuffer } from '../../../../src/resources/RenderBuffer.js';

QUnit.module('RenderBuffer');

QUnit.test('id', assert => {
	const a = new RenderBuffer(1, 1);
	const b = new RenderBuffer(1, 1);

	assert.ok(Number.isInteger(a.id), 'id is an integer');
	assert.strictEqual(b.id, a.id + 1, 'id increments per instance');
});

QUnit.test('userData', assert => {
	const renderBuffer = new RenderBuffer(1, 1);

	assert.deepEqual(renderBuffer.userData, {}, 'userData defaults to an empty object');
});

QUnit.test('copy', assert => {
	const source = new RenderBuffer(2, 3, PIXEL_FORMAT.DEPTH_COMPONENT16, 4);
	const target = new RenderBuffer(1, 1);

	source.userData.label = 'source';
	source.userData.nested = { value: 1 };

	target.copy(source);

	assert.strictEqual(target.width, source.width, 'width is copied');
	assert.strictEqual(target.height, source.height, 'height is copied');
	assert.strictEqual(target.format, source.format, 'format is copied');
	assert.strictEqual(target.multipleSampling, source.multipleSampling, 'multipleSampling is copied');
	assert.deepEqual(target.userData, source.userData, 'userData is copied');
	assert.notStrictEqual(target.userData, source.userData, 'userData object is cloned');
	assert.notStrictEqual(target.userData.nested, source.userData.nested, 'nested userData object is cloned');
});

QUnit.test('clone', assert => {
	const source = new RenderBuffer(2, 3, PIXEL_FORMAT.DEPTH_COMPONENT16, 4);
	source.userData.label = 'source';

	const cloned = source.clone();

	assert.notStrictEqual(cloned, source, 'renderbuffer is cloned');
	assert.notStrictEqual(cloned.id, source.id, 'clone has a unique id');
	assert.strictEqual(cloned.width, source.width, 'width is cloned');
	assert.strictEqual(cloned.height, source.height, 'height is cloned');
	assert.strictEqual(cloned.format, source.format, 'format is cloned');
	assert.strictEqual(cloned.multipleSampling, source.multipleSampling, 'multipleSampling is cloned');
	assert.deepEqual(cloned.userData, source.userData, 'userData is cloned');
	assert.notStrictEqual(cloned.userData, source.userData, 'userData object is not shared');
});