/* eslint-disable no-undef */

QUnit.module('Quaternion');

QUnit.test('constructor', assert => {
	const a = new t3d.Quaternion();
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');
	assert.ok(a.z == 0, 'Passed!');
	assert.ok(a.w == 1, 'Passed!');
});

QUnit.test('setFromUnitVectors', assert => {
	const a = new t3d.Quaternion();

	const b = new t3d.Vector3();
	const c = new t3d.Vector3();

	b.set(0, 0, 1);
	c.set(0, 0, -1);

	a.setFromUnitVectors(b, c);

	assert.ok(Math.abs(a.x - 0) < 0.000001, 'Passed!');
	assert.ok(Math.abs(a.y - (-1)) < 0.000001, 'Passed!');
	assert.ok(Math.abs(a.z - 0) < 0.000001, 'Passed!');
	assert.ok(Math.abs(a.w - 0) < 0.000001, 'Passed!');
});

QUnit.test('fromArray', assert => {
	const array = new Float32Array([1, 2, 3, 4]);
	const a = new t3d.Quaternion();
	a.fromArray(array, 0, true);
	assert.ok(a.x == 1, 'Passed!');
	assert.ok(a.y == 2, 'Passed!');
	assert.ok(a.z == 3, 'Passed!');
	assert.ok(a.w == 4, 'Passed!');
});

QUnit.test('toArray', assert => {
	const array = new Float32Array(4);
	const a = new t3d.Quaternion(1, 2, 3, 4);
	a.toArray(array, 0, true);
	assert.ok(array[0] == 1, 'Passed!');
	assert.ok(array[1] == 2, 'Passed!');
	assert.ok(array[2] == 3, 'Passed!');
	assert.ok(array[3] == 4, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new t3d.Quaternion().clone();
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');
	assert.ok(a.z == 0, 'Passed!');
	assert.ok(a.w == 1, 'Passed!');

	const b = a.set(x, y, z, w).clone();
	assert.ok(b.x == x, 'Passed!');
	assert.ok(b.y == y, 'Passed!');
	assert.ok(b.z === z, 'Passed!');
	assert.ok(b.w === w, 'Passed!');
});