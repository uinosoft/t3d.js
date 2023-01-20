QUnit.module("Vector3");

QUnit.test("clone", assert => {
	const a = new t3d.Vector3().clone();
	assert.ok(a.x == 0, "Passed!");
	assert.ok(a.y == 0, "Passed!");
	assert.ok(a.z == 0, "Passed!");

	const b = a.set(x, y, z).clone();
	assert.ok(b.x == x, "Passed!");
	assert.ok(b.y == y, "Passed!");
	assert.ok(b.z === z, "Passed!");
});