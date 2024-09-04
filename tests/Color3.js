/* eslint-disable no-undef */

QUnit.module('Color3');

QUnit.test('fromArray', assert => {
	const array = new Uint8Array([255, 255, 0]);
	const a = new t3d.Color3();
	a.fromArray(array, 0, true);
	assert.ok(a.r == 1, 'Passed!');
	assert.ok(a.g == 1, 'Passed!');
	assert.ok(a.b == 0, 'Passed!');
});

QUnit.test('toArray', assert => {
	const array = new Uint8Array(3);
	const a = new t3d.Color3(1, 1, 0);
	a.toArray(array, 0, true);
	assert.ok(array[0] == 255, 'Passed!');
	assert.ok(array[1] == 255, 'Passed!');
	assert.ok(array[2] == 0, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new t3d.Color3().clone();
	assert.ok(a.r == 0, 'Passed!');
	assert.ok(a.g == 0, 'Passed!');
	assert.ok(a.b == 0, 'Passed!');

	const b = a.setRGB(0.3, 0.3, 0.3).clone();
	assert.ok(b.r == 0.3, 'Passed!');
	assert.ok(b.g == 0.3, 'Passed!');
	assert.ok(b.b == 0.3, 'Passed!');
});