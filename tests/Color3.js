/* eslint-disable no-undef */

QUnit.module('Color3');

QUnit.test('setHex', assert => {
	const a = new t3d.Color3();
	a.setHex(0xff0000);
	assert.ok(a.r == 1, 'Passed!');
	assert.ok(a.g == 0, 'Passed!');
	assert.ok(a.b == 0, 'Passed!');
});

QUnit.test('setRGB', assert => {
	const a = new t3d.Color3();
	a.setRGB(0.5, 0.5, 0.5);
	assert.ok(a.r == 0.5, 'Passed!');
	assert.ok(a.g == 0.5, 'Passed!');
	assert.ok(a.b == 0.5, 'Passed!');
});

QUnit.test('setHSL', assert => {
	const a = new t3d.Color3();
	a.setHSL(0, 1, 0.5);
	assert.ok(Math.abs(a.r - 1) < eps, 'Passed!');
	assert.ok(Math.abs(a.g - 0) < eps, 'Passed!');
	assert.ok(Math.abs(a.b - 0) < eps, 'Passed!');
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

QUnit.test('copy', assert => {
	const a = new t3d.Color3(0.5, 0.5, 0.5);
	const b = new t3d.Color3().copy(a);
	assert.ok(b.r == 0.5, 'Passed!');
	assert.ok(b.g == 0.5, 'Passed!');
	assert.ok(b.b == 0.5, 'Passed!');
});

QUnit.test('convertSRGBToLinear', assert => {
	const a = new t3d.Color3(0.5, 0.5, 0.5).convertSRGBToLinear();
	assert.ok(a.r < 0.5, 'Passed!');
	assert.ok(a.g < 0.5, 'Passed!');
	assert.ok(a.b < 0.5, 'Passed!');
});

QUnit.test('convertLinearToSRGB', assert => {
	const a = new t3d.Color3(0.5, 0.5, 0.5).convertLinearToSRGB();
	assert.ok(a.r > 0.5, 'Passed!');
	assert.ok(a.g > 0.5, 'Passed!');
	assert.ok(a.b > 0.5, 'Passed!');
});

QUnit.test('getHex', assert => {
	const a = new t3d.Color3(1, 0, 0);
	assert.ok(a.getHex() == 0xff0000, 'Passed!');
});

QUnit.test('lerp', assert => {
	const a = new t3d.Color3(0, 0, 0);
	const b = new t3d.Color3(1, 1, 1);
	a.lerp(b, 0.5);
	assert.ok(a.r == 0.5, 'Passed!');
	assert.ok(a.g == 0.5, 'Passed!');
	assert.ok(a.b == 0.5, 'Passed!');
});

QUnit.test('lerpColors', assert => {
	const a = new t3d.Color3();
	const b = new t3d.Color3(0, 0, 0);
	const c = new t3d.Color3(1, 1, 1);
	a.lerpColors(b, c, 0.5);
	assert.ok(a.r == 0.5, 'Passed!');
	assert.ok(a.g == 0.5, 'Passed!');
	assert.ok(a.b == 0.5, 'Passed!');
});

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