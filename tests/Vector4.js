QUnit.module("Vector4");

QUnit.test("clone", assert => {
	const a = new t3d.Vector4().clone();
	assert.ok(a.x == 0, "Passed!");
	assert.ok(a.y == 0, "Passed!");
	assert.ok(a.z == 0, "Passed!");
	assert.ok(a.w == 1, "Passed!");

	const b = a.set(x, y, z, w).clone();
	assert.ok(b.x == x, "Passed!");
	assert.ok(b.y == y, "Passed!");
	assert.ok(b.z === z, "Passed!");
	assert.ok(b.w === w, "Passed!");
});