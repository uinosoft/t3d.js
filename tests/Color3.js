QUnit.module("Color3");

QUnit.test("clone", assert => {
	const a = new t3d.Color3().clone();
	assert.ok(a.r == 0, "Passed!");
	assert.ok(a.g == 0, "Passed!");
	assert.ok(a.b == 0, "Passed!");

	const b = a.setRGB(0.3, 0.3, 0.3).clone();
	assert.ok(b.r == 0.3, "Passed!");
	assert.ok(b.g == 0.3, "Passed!");
	assert.ok(b.b == 0.3, "Passed!");
});