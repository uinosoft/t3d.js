import { MathUtils } from 't3d';

QUnit.module('MathUtils');

QUnit.test('generateUUID', assert => {
	const a = MathUtils.generateUUID();
	const regex = /[A-Z0-9]{8}-[A-Z0-9]{4}-4[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{12}/i;
	// note the fixed '4' here ----------^

	assert.ok(regex.test(a), 'Generated UUID matches the expected pattern');
});

QUnit.test('clamp', assert => {
	assert.strictEqual(MathUtils.clamp(0.5, 0, 1), 0.5, 'Value already within limits');
	assert.strictEqual(MathUtils.clamp(0, 0, 1), 0, 'Value equal to one limit');
	assert.strictEqual(MathUtils.clamp(-0.1, 0, 1), 0, 'Value too low');
	assert.strictEqual(MathUtils.clamp(1.1, 0, 1), 1, 'Value too high');
});

QUnit.test('euclideanModulo', assert => {
	assert.ok(isNaN(MathUtils.euclideanModulo(6, 0)), 'Division by zero returns NaN');
	assert.strictEqual(MathUtils.euclideanModulo(6, 1), 0, 'Division by trivial divisor');
	assert.strictEqual(MathUtils.euclideanModulo(6, 2), 0, 'Division by non-trivial divisor');
	assert.strictEqual(MathUtils.euclideanModulo(6, 5), 1, 'Division by itself - 1');
	assert.strictEqual(MathUtils.euclideanModulo(6, 6), 0, 'Division by itself');
	assert.strictEqual(MathUtils.euclideanModulo(6, 7), 6, 'Division by itself + 1');
});

QUnit.test('mapLinear', assert => {
	assert.strictEqual(MathUtils.mapLinear(0.5, 0, 1, 0, 10), 5, 'Value within range');
	assert.strictEqual(MathUtils.mapLinear(0.0, 0, 1, 0, 10), 0, 'Value equal to lower boundary');
	assert.strictEqual(MathUtils.mapLinear(1.0, 0, 1, 0, 10), 10, 'Value equal to upper boundary');
});

QUnit.test('lerp', assert => {
	assert.strictEqual(MathUtils.lerp(1, 2, 0), 1, 'Value equal to lower boundary');
	assert.strictEqual(MathUtils.lerp(1, 2, 1), 2, 'Value equal to upper boundary');
	assert.strictEqual(MathUtils.lerp(1, 2, 0.4), 1.4, 'Value within range');
});

QUnit.todo('isPowerOfTwo', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.todo('nearestPowerOfTwo', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.todo('nextPowerOfTwo', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.todo('nextPowerOfTwoSquareSize', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.todo('denormalize/normalize', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.todo('toHalfFloat/fromHalfFloat', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});