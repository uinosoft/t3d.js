QUnit.module("Matrix3");

function matrixEquals3(a, b, tolerance) {
	tolerance = tolerance || 0.0001;
	if (a.elements.length != b.elements.length) {
		return false;
	}

	for (let i = 0, il = a.elements.length; i < il; i++) {
		const delta = a.elements[i] - b.elements[i];
		if (delta > tolerance) {
			return false;
		}
	}

	return true;
}

QUnit.test("clone", assert => {
	const a = new t3d.Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
	const b = a.clone();

	assert.ok(matrixEquals3(a, b), "Passed!");

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok(!matrixEquals3(a, b), "Passed!");
});