import { Box2, Vector2 } from 't3d';

// Define 2D constants for tests
const zero2 = new Vector2(0, 0);
const one2 = new Vector2(1, 1);

QUnit.module('Box2');

QUnit.test('constructor', assert => {
	let a = new Box2();
	assert.ok(a.min.x == Infinity, 'Default min.x is Infinity');
	assert.ok(a.min.y == Infinity, 'Default min.y is Infinity');
	assert.ok(a.max.x == -Infinity, 'Default max.x is -Infinity');
	assert.ok(a.max.y == -Infinity, 'Default max.y is -Infinity');

	a = new Box2(zero2.clone(), one2.clone());
	assert.ok(a.min.equals(zero2), 'Min vector set correctly');
	assert.ok(a.max.equals(one2), 'Max vector set correctly');
});

QUnit.test('set', assert => {
	const a = new Box2();

	a.set(0, 1, 2, 3);
	assert.strictEqual(a.min.x, 0, 'min.x set correctly');
	assert.strictEqual(a.min.y, 1, 'min.y set correctly');
	assert.strictEqual(a.max.x, 2, 'max.x set correctly');
	assert.strictEqual(a.max.y, 3, 'max.y set correctly');
});

QUnit.test('clone', assert => {
	const a = new Box2(zero2.clone(), one2.clone());
	const b = a.clone();

	assert.ok(b.min.equals(zero2), 'Min cloned correctly');
	assert.ok(b.max.equals(one2), 'Max cloned correctly');
	assert.ok(b !== a, 'New instance created via clone');

	// Ensure it's a deep copy
	a.min.set(1, 1);
	a.max.set(2, 2);

	assert.ok(!b.min.equals(a.min), 'Changes to original do not affect clone (min)');
	assert.ok(!b.max.equals(a.max), 'Changes to original do not affect clone (max)');
});

QUnit.test('copy', assert => {
	const a = new Box2(zero2.clone(), one2.clone());
	const b = new Box2().copy(a);

	assert.ok(b.min.equals(zero2), 'Min copied correctly');
	assert.ok(b.max.equals(one2), 'Max copied correctly');
	assert.ok(b !== a, 'Different instances');

	// Ensure it's a deep copy
	a.min.set(1, 1);
	a.max.set(2, 2);

	assert.ok(!b.min.equals(a.min), 'Changes to original do not affect copy (min)');
	assert.ok(!b.max.equals(a.max), 'Changes to original do not affect copy (max)');
});