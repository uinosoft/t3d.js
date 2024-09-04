/* eslint-disable no-undef */

QUnit.module('Vector3');

QUnit.test('fromArray', assert => {
	const array = new Float32Array([1, 2, 3]);
	const a = new t3d.Vector3();
	a.fromArray(array, 0, true);
	assert.ok(a.x == 1, 'Passed!');
	assert.ok(a.y == 2, 'Passed!');
	assert.ok(a.z == 3, 'Passed!');
});

QUnit.test('toArray', assert => {
	const array = new Float32Array(3);
	const a = new t3d.Vector3(1, 2, 3);
	a.toArray(array, 0, true);
	assert.ok(array[0] == 1, 'Passed!');
	assert.ok(array[1] == 2, 'Passed!');
	assert.ok(array[2] == 3, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new t3d.Vector3().clone();
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');
	assert.ok(a.z == 0, 'Passed!');

	const b = a.set(x, y, z).clone();
	assert.ok(b.x == x, 'Passed!');
	assert.ok(b.y == y, 'Passed!');
	assert.ok(b.z === z, 'Passed!');
});