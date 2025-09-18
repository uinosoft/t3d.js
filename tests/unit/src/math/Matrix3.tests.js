import { Matrix3 } from 't3d';

QUnit.module('Matrix3');

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

QUnit.test('determinant', assert => {
	const a = new Matrix3();
	assert.ok(a.determinant() == 1, 'Passed!');

	a.elements[0] = 2;
	assert.ok(a.determinant() == 2, 'Passed!');

	a.elements[0] = 0;
	assert.ok(a.determinant() == 0, 'Passed!');

	// calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/threeD/index.htm
	a.set(2, 3, 4, 5, 13, 7, 8, 9, 11);
	assert.ok(a.determinant() == -73, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
	const b = a.clone();

	assert.ok(matrixEquals3(a, b), 'Passed!');

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok(!matrixEquals3(a, b), 'Passed!');
});