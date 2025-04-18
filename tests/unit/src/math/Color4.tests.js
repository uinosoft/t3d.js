import { Color4 } from 't3d';

QUnit.module('Color4');

QUnit.test('setRGBA', assert => {
	const a = new Color4();
	a.setRGBA(0.5, 0.5, 0.5, 0.5);
	assert.ok(a.r == 0.5, 'Passed!');
	assert.ok(a.g == 0.5, 'Passed!');
	assert.ok(a.b == 0.5, 'Passed!');
	assert.ok(a.a == 0.5, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new Color4().clone();
	assert.ok(a.r == 0, 'Passed!');
	assert.ok(a.g == 0, 'Passed!');
	assert.ok(a.b == 0, 'Passed!');
	assert.ok(a.a == 1, 'Passed!');

	const b = a.setRGBA(0.3, 0.3, 0.3, 0.3).clone();
	assert.ok(b.r == 0.3, 'Passed!');
	assert.ok(b.g == 0.3, 'Passed!');
	assert.ok(b.b == 0.3, 'Passed!');
	assert.ok(b.a == 0.3, 'Passed!');
});

QUnit.test('copy', assert => {
	const a = new Color4(0.5, 0.5, 0.5, 0.5);
	const b = new Color4().copy(a);
	assert.ok(b.r == 0.5, 'Passed!');
	assert.ok(b.g == 0.5, 'Passed!');
	assert.ok(b.b == 0.5, 'Passed!');
	assert.ok(b.a == 0.5, 'Passed!');
});

QUnit.test('fromArray', assert => {
	const array = new Uint8Array([255, 255, 0, 128]);
	const a = new Color4();
	a.fromArray(array, 0, true);
	assert.ok(a.r == 1, 'Passed!');
	assert.ok(a.g == 1, 'Passed!');
	assert.ok(a.b == 0, 'Passed!');
	assert.ok(a.a == 0.5019607843137255, 'Passed!');
});

QUnit.test('toArray', assert => {
	const array = new Uint8Array(4);
	const a = new Color4(1, 1, 0, 0.5);
	a.toArray(array, 0, true);
	assert.ok(array[0] == 255, 'Passed!');
	assert.ok(array[1] == 255, 'Passed!');
	assert.ok(array[2] == 0, 'Passed!');
	assert.ok(array[3] == 128, 'Passed!');
});
