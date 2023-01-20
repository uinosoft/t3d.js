QUnit.module("Sphere");

QUnit.test("constructor", assert => {
	let a = new t3d.Sphere();
	assert.ok(a.center.equals(zero3), "Passed!");
	assert.ok(a.radius == -1, "Passed!");

	a = new t3d.Sphere(one3.clone(), 1);
	assert.ok(a.center.equals(one3), "Passed!");
	assert.ok(a.radius == 1, "Passed!");
});

QUnit.test("set", assert => {
	const a = new t3d.Sphere();
	assert.ok(a.center.equals(zero3), "Passed!");
	assert.ok(a.radius == -1, "Passed!");

	a.set(one3, 1);
	assert.ok(a.center.equals(one3), "Passed!");
	assert.ok(a.radius == 1, "Passed!");
});

QUnit.test("setFromArray", assert => {
	const a = new t3d.Sphere();
	const expectedCenter = new t3d.Vector3(0.9330126941204071, 0, 0);
	const expectedRadius = 1.3676668773461689;
	const array = [
		1, 1, 0, 1, 1, 0,
		1, 1, 0, 1, 1, 0,
		1, 1, 0, 0.8660253882408142, 0.5, 0,
		-0, 0.5, 0.8660253882408142, 1.8660253882408142, 0.5, 0,
		0, 0.5, -0.8660253882408142, 0.8660253882408142, 0.5, -0,
		0.8660253882408142, -0.5, 0, -0, -0.5, 0.8660253882408142,
		1.8660253882408142, -0.5, 0, 0, -0.5, -0.8660253882408142,
		0.8660253882408142, -0.5, -0, -0, -1, 0,
		-0, -1, 0, 0, -1, 0,
		0, -1, -0, -0, -1, -0
	];

	a.setFromArray(array);
	assert.ok(Math.abs(a.center.x - expectedCenter.x) <= eps, "Default center: check center.x");
	assert.ok(Math.abs(a.center.y - expectedCenter.y) <= eps, "Default center: check center.y");
	assert.ok(Math.abs(a.center.z - expectedCenter.z) <= eps, "Default center: check center.z");
	assert.ok(Math.abs(a.radius - expectedRadius) <= eps, "Default center: check radius");
});

QUnit.test("applyMatrix4", assert => {
	const a = new t3d.Sphere(one3.clone(), 1);
	const m = new t3d.Matrix4().makeTranslation(1, -2, 1);
	const aabb1 = new t3d.Box3();
	const aabb2 = new t3d.Box3();

	a.clone().applyMatrix4(m).getBoundingBox(aabb1);
	a.getBoundingBox(aabb2);

	assert.ok(aabb1.equals(aabb2.applyMatrix4(m)), "Passed!");
});

QUnit.test("getBoundingBox", assert => {
	const a = new t3d.Sphere(one3.clone(), 1);
	const aabb = new t3d.Box3();

	a.getBoundingBox(aabb);
	assert.ok(aabb.equals(new t3d.Box3(zero3, two3)), "Passed!");

	a.set(zero3, 0);
	a.getBoundingBox(aabb);
	assert.ok(aabb.equals(new t3d.Box3(zero3, zero3)), "Passed!");

	// Empty sphere produces empty bounding box
	a.makeEmpty();
	a.getBoundingBox(aabb);
	assert.ok(aabb.isEmpty(), 'Passed!');
});

QUnit.test("isEmpty", assert => {
	const a = new t3d.Sphere();
	assert.ok(a.isEmpty(), 'Passed!');

	a.set(one3, 1);
	assert.ok(!a.isEmpty(), 'Passed!');

	// Negative radius contains no points
	a.set(one3, -1);
	assert.ok(a.isEmpty(), 'Passed!');

	// Zero radius contains only the center point
	a.set(one3, 0);
	assert.ok(!a.isEmpty(), 'Passed!');
});

QUnit.test("makeEmpty", assert => {
	const a = new t3d.Sphere(one3.clone(), 1);
	assert.ok(!a.isEmpty(), 'Passed!');

	a.makeEmpty();
	assert.ok(a.isEmpty(), 'Passed!');
	assert.ok(a.center.equals(zero3), 'Passed!');
});

QUnit.todo("clone", assert => {
	assert.ok(false, "everything's gonna be alright");
});

QUnit.test("copy", assert => {
	const a = new t3d.Sphere(one3.clone(), 1);
	const b = new t3d.Sphere().copy(a);

	assert.ok(b.center.equals(one3), "Passed!");
	assert.ok(b.radius == 1, "Passed!");

	// ensure that it is a true copy
	a.center = zero3;
	a.radius = 0;
	assert.ok(b.center.equals(one3), "Passed!");
	assert.ok(b.radius == 1, "Passed!");
});