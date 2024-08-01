/* eslint-disable no-undef */

QUnit.module('Vector2');

QUnit.test('clone', assert => {
	const a = new t3d.Vector2().clone();
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');

	const b = a.set(x, y).clone();
	assert.ok(b.x == x, 'Passed!');
	assert.ok(b.y == y, 'Passed!');
});