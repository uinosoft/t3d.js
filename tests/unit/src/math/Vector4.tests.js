import { Vector4 } from 't3d';
import { x, y, z, w } from '../../utils/math-constants.js';

QUnit.module('Vector4');

QUnit.test('fromArray', assert => {
	const array = new Float32Array([1, 2, 3, 4]);
	const a = new Vector4();
	a.fromArray(array, 0, true);
	assert.ok(a.x == 1, 'Passed!');
	assert.ok(a.y == 2, 'Passed!');
	assert.ok(a.z == 3, 'Passed!');
	assert.ok(a.w == 4, 'Passed!');
});

QUnit.test('toArray', assert => {
	const array = new Float32Array(4);
	const a = new Vector4(1, 2, 3, 4);
	a.toArray(array, 0, true);
	assert.ok(array[0] == 1, 'Passed!');
	assert.ok(array[1] == 2, 'Passed!');
	assert.ok(array[2] == 3, 'Passed!');
	assert.ok(array[3] == 4, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new Vector4().clone();
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