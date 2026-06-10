import { Buffer } from '../../../../../src/resources/geometries/Buffer.js';

QUnit.module('Buffer');

QUnit.test('id', assert => {
	const a = new Buffer(new Float32Array(3), 3);
	const b = new Buffer(new Float32Array(3), 3);

	assert.ok(Number.isInteger(a.id), 'id is an integer');
	assert.strictEqual(b.id, a.id + 1, 'id increments per instance');
});

QUnit.test('userData', assert => {
	const buffer = new Buffer(new Float32Array(3), 3);

	assert.deepEqual(buffer.userData, {}, 'userData defaults to an empty object');
});

QUnit.test('copy', assert => {
	const source = new Buffer(new Float32Array([1, 2, 3, 4, 5, 6]), 3);
	const target = new Buffer(new Float32Array(3), 3);

	source.userData.label = 'source';
	source.userData.nested = { value: 1 };

	target.copy(source);

	assert.notStrictEqual(target.array, source.array, 'array is copied');
	assert.deepEqual(Array.from(target.array), Array.from(source.array), 'array values are copied');
	assert.deepEqual(target.userData, source.userData, 'userData is copied');
	assert.notStrictEqual(target.userData, source.userData, 'userData object is cloned');
	assert.notStrictEqual(target.userData.nested, source.userData.nested, 'nested userData object is cloned');
	assert.strictEqual(target.stride, source.stride, 'stride is copied');
	assert.strictEqual(target.count, source.count, 'count is copied');
	assert.strictEqual(target.usage, source.usage, 'usage is copied');
});

QUnit.test('clone', assert => {
	const source = new Buffer(new Float32Array([1, 2, 3, 4, 5, 6]), 3);
	source.userData.label = 'source';

	const cloned = source.clone();

	assert.notStrictEqual(cloned, source, 'buffer is cloned');
	assert.notStrictEqual(cloned.id, source.id, 'clone has a unique id');
	assert.notStrictEqual(cloned.array, source.array, 'array is cloned');
	assert.deepEqual(Array.from(cloned.array), Array.from(source.array), 'array values are cloned');
	assert.deepEqual(cloned.userData, source.userData, 'userData is cloned');
	assert.notStrictEqual(cloned.userData, source.userData, 'userData object is not shared');
});