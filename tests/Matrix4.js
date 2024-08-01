/* eslint-disable no-undef */

QUnit.module('Matrix4');

function matrixEquals4(a, b, tolerance) {
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

QUnit.test('determinant', assert => {
	const a = new t3d.Matrix4();
	assert.ok(a.determinant() == 1, 'Passed!');

	a.elements[0] = 2;
	assert.ok(a.determinant() == 2, 'Passed!');

	a.elements[0] = 0;
	assert.ok(a.determinant() == 0, 'Passed!');

	a.set(2, 3, 4, 5, -1, -21, -3, -4, 6, 7, 8, 10, -8, -9, -10, -12);
	assert.ok(a.determinant() == 76, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new t3d.Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
	const b = a.clone();

	assert.ok(matrixEquals4(a, b), 'Passed!');

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok(!matrixEquals4(a, b), 'Passed!');
});