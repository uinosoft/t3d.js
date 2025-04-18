import { Vector2 } from 't3d';
import { x, y } from '../../utils/math-constants.js';

QUnit.module('Vector2');

QUnit.test('fromArray', assert => {
	const array = new Float32Array([1, 2]);
	const a = new Vector2();
	a.fromArray(array, 0, true);
	assert.ok(a.x == 1, 'Passed!');
	assert.ok(a.y == 2, 'Passed!');
});

QUnit.test('toArray', assert => {
	const array = new Float32Array(2);
	const a = new Vector2(1, 2);
	a.toArray(array, 0, true);
	assert.ok(array[0] == 1, 'Passed!');
	assert.ok(array[1] == 2, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new Vector2().clone();
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');

	const b = a.set(x, y).clone();
	assert.ok(b.x == x, 'Passed!');
	assert.ok(b.y == y, 'Passed!');
});