import { Vector3, Matrix3, Matrix4, Euler, Quaternion } from 't3d';
import { eps } from '../../utils/math-constants.js';

QUnit.module('Matrix4');

function matrixEquals4(a, b, tolerance) {
	tolerance = tolerance || 0.0001;
	if (a.elements.length != b.elements.length) {
		return false;
	}

	for (let i = 0, il = a.elements.length; i < il; i++) {
		const delta = Math.abs(a.elements[i] - b.elements[i]);
		if (delta > tolerance) {
			return false;
		}
	}

	return true;
}

function eulerEquals(a, b, tolerance) {
	tolerance = tolerance || 0.0001;
	const diff = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
	return (diff < tolerance);
}

QUnit.test('set', assert => {
	const b = new Matrix4();
	assert.ok(b.determinant() == 1, 'Passed!');

	b.set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
	assert.ok(b.elements[0] == 0);
	assert.ok(b.elements[1] == 4);
	assert.ok(b.elements[2] == 8);
	assert.ok(b.elements[3] == 12);
	assert.ok(b.elements[4] == 1);
	assert.ok(b.elements[5] == 5);
	assert.ok(b.elements[6] == 9);
	assert.ok(b.elements[7] == 13);
	assert.ok(b.elements[8] == 2);
	assert.ok(b.elements[9] == 6);
	assert.ok(b.elements[10] == 10);
	assert.ok(b.elements[11] == 14);
	assert.ok(b.elements[12] == 3);
	assert.ok(b.elements[13] == 7);
	assert.ok(b.elements[14] == 11);
	assert.ok(b.elements[15] == 15);
});

QUnit.test('identity', assert => {
	const b = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
	assert.ok(b.elements[0] == 0);
	assert.ok(b.elements[1] == 4);
	assert.ok(b.elements[2] == 8);
	assert.ok(b.elements[3] == 12);
	assert.ok(b.elements[4] == 1);
	assert.ok(b.elements[5] == 5);
	assert.ok(b.elements[6] == 9);
	assert.ok(b.elements[7] == 13);
	assert.ok(b.elements[8] == 2);
	assert.ok(b.elements[9] == 6);
	assert.ok(b.elements[10] == 10);
	assert.ok(b.elements[11] == 14);
	assert.ok(b.elements[12] == 3);
	assert.ok(b.elements[13] == 7);
	assert.ok(b.elements[14] == 11);
	assert.ok(b.elements[15] == 15);

	const a = new Matrix4();
	assert.ok(!matrixEquals4(a, b), 'Passed!');

	b.identity();
	assert.ok(matrixEquals4(a, b), 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
	const b = a.clone();

	assert.ok(matrixEquals4(a, b), 'Passed!');

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok(!matrixEquals4(a, b), 'Passed!');
});

QUnit.test('copy', assert => {
	const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
	const b = new Matrix4().copy(a);

	assert.ok(matrixEquals4(a, b), 'Passed!');

	// ensure that it is a true copy
	a.elements[0] = 2;
	assert.ok(!matrixEquals4(a, b), 'Passed!');
});

QUnit.test('setFromMatrix3', assert => {
	const a = new Matrix3().set(
		0, 1, 2,
		3, 4, 5,
		6, 7, 8
	);
	const b = new Matrix4();
	const c = new Matrix4().set(
		0, 1, 2, 0,
		3, 4, 5, 0,
		6, 7, 8, 0,
		0, 0, 0, 1
	);
	b.setFromMatrix3(a);
	assert.ok(b.equals(c));
});

QUnit.test('makeBasis/extractBasis', assert => {
	const identityBasis = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
	const a = new Matrix4().makeBasis(identityBasis[0], identityBasis[1], identityBasis[2]);
	const identity = new Matrix4();
	assert.ok(matrixEquals4(a, identity), 'Passed!');

	const testBases = [[new Vector3(0, 1, 0), new Vector3(-1, 0, 0), new Vector3(0, 0, 1)]];
	for (let i = 0; i < testBases.length; i++) {
		const testBasis = testBases[i];
		const b = new Matrix4().makeBasis(testBasis[0], testBasis[1], testBasis[2]);
		const outBasis = [new Vector3(), new Vector3(), new Vector3()];
		b.extractBasis(outBasis[0], outBasis[1], outBasis[2]);
		// check what goes in, is what comes out.
		for (let j = 0; j < outBasis.length; j++) {
			assert.ok(outBasis[j].equals(testBasis[j]), 'Passed!');
		}

		// get the basis out the hard war
		for (let j = 0; j < identityBasis.length; j++) {
			outBasis[j].copy(identityBasis[j]);
			outBasis[j].applyMatrix4(b);
		}

		// did the multiply method of basis extraction work?
		for (let j = 0; j < outBasis.length; j++) {
			assert.ok(outBasis[j].equals(testBasis[j]), 'Passed!');
		}
	}
});

QUnit.test('makeRotationFromEuler/extractRotation', assert => {
	const testValues = [
		new Euler(0, 0, 0, 'XYZ'),
		new Euler(1, 0, 0, 'XYZ'),
		new Euler(0, 1, 0, 'ZYX'),
		new Euler(0, 0, 0.5, 'YZX'),
		new Euler(0, 0, -0.5, 'YZX')
	];

	for (let i = 0; i < testValues.length; i++) {
		const v = testValues[i];

		const m = new Matrix4().makeRotationFromEuler(v);

		const v2 = new Euler().setFromRotationMatrix(m, v.order);
		const m2 = new Matrix4().makeRotationFromEuler(v2);

		assert.ok(matrixEquals4(m, m2, eps), 'makeRotationFromEuler #' + i + ': original and Euler-derived matrices are equal');
		assert.ok(eulerEquals(v, v2, eps), 'makeRotationFromEuler #' + i + ': original and matrix-derived Eulers are equal');

		const m3 = new Matrix4().extractRotation(m2);
		const v3 = new Euler().setFromRotationMatrix(m3, v.order);

		assert.ok(matrixEquals4(m, m3, eps), 'extractRotation #' + i + ': original and extracted matrices are equal');
		assert.ok(eulerEquals(v, v3, eps), 'extractRotation #' + i + ': original and extracted Eulers are equal');
	}
});

QUnit.todo('makeRotationFromQuaternion', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.test('lookAtRH', assert => {
	const a = new Matrix4();
	const expected = new Matrix4().identity();
	const eye = new Vector3(0, 0, 0);
	const target = new Vector3(0, 1, -1);
	const up = new Vector3(0, 1, 0);

	a.lookAtRH(eye, target, up);
	const rotation = new Euler().setFromRotationMatrix(a);
	assert.ok(Math.abs(rotation.x * (180 / Math.PI) - 45) < eps, 'Check the rotation');

	// eye and target are in the same position
	eye.copy(target);
	a.lookAtRH(eye, target, up);
	assert.ok(matrixEquals4(a, expected), 'Check the result for eye == target');

	// up and z are parallel
	eye.set(0, 1, 0);
	target.set(0, 0, 0);
	a.lookAtRH(eye, target, up);
	expected.set(
		1, 0, 0, 0,
		0, 0.0001, 1, 0,
		0, -1, 0.0001, 0,
		0, 0, 0, 1
	);
	assert.ok(matrixEquals4(a, expected), 'Check the result for when up and z are parallel');
});

QUnit.test('multiply', assert => {
	const lhs = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);
	const rhs = new Matrix4().set(59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131);

	lhs.multiply(rhs);

	assert.ok(lhs.elements[0] == 1585);
	assert.ok(lhs.elements[1] == 5318);
	assert.ok(lhs.elements[2] == 10514);
	assert.ok(lhs.elements[3] == 15894);
	assert.ok(lhs.elements[4] == 1655);
	assert.ok(lhs.elements[5] == 5562);
	assert.ok(lhs.elements[6] == 11006);
	assert.ok(lhs.elements[7] == 16634);
	assert.ok(lhs.elements[8] == 1787);
	assert.ok(lhs.elements[9] == 5980);
	assert.ok(lhs.elements[10] == 11840);
	assert.ok(lhs.elements[11] == 17888);
	assert.ok(lhs.elements[12] == 1861);
	assert.ok(lhs.elements[13] == 6246);
	assert.ok(lhs.elements[14] == 12378);
	assert.ok(lhs.elements[15] == 18710);
});

QUnit.test('premultiply', assert => {
	const lhs = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);
	const rhs = new Matrix4().set(59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131);

	rhs.premultiply(lhs);

	assert.ok(rhs.elements[0] == 1585);
	assert.ok(rhs.elements[1] == 5318);
	assert.ok(rhs.elements[2] == 10514);
	assert.ok(rhs.elements[3] == 15894);
	assert.ok(rhs.elements[4] == 1655);
	assert.ok(rhs.elements[5] == 5562);
	assert.ok(rhs.elements[6] == 11006);
	assert.ok(rhs.elements[7] == 16634);
	assert.ok(rhs.elements[8] == 1787);
	assert.ok(rhs.elements[9] == 5980);
	assert.ok(rhs.elements[10] == 11840);
	assert.ok(rhs.elements[11] == 17888);
	assert.ok(rhs.elements[12] == 1861);
	assert.ok(rhs.elements[13] == 6246);
	assert.ok(rhs.elements[14] == 12378);
	assert.ok(rhs.elements[15] == 18710);
});

QUnit.test('multiplyMatrices', assert => {
	const lhs = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);
	const rhs = new Matrix4().set(59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131);
	const ans = new Matrix4();

	ans.multiplyMatrices(lhs, rhs);

	assert.ok(ans.elements[0] == 1585);
	assert.ok(ans.elements[1] == 5318);
	assert.ok(ans.elements[2] == 10514);
	assert.ok(ans.elements[3] == 15894);
	assert.ok(ans.elements[4] == 1655);
	assert.ok(ans.elements[5] == 5562);
	assert.ok(ans.elements[6] == 11006);
	assert.ok(ans.elements[7] == 16634);
	assert.ok(ans.elements[8] == 1787);
	assert.ok(ans.elements[9] == 5980);
	assert.ok(ans.elements[10] == 11840);
	assert.ok(ans.elements[11] == 17888);
	assert.ok(ans.elements[12] == 1861);
	assert.ok(ans.elements[13] == 6246);
	assert.ok(ans.elements[14] == 12378);
	assert.ok(ans.elements[15] == 18710);
});

QUnit.test('determinant', assert => {
	const a = new Matrix4();
	assert.ok(a.determinant() == 1, 'Passed!');

	a.elements[0] = 2;
	assert.ok(a.determinant() == 2, 'Passed!');

	a.elements[0] = 0;
	assert.ok(a.determinant() == 0, 'Passed!');

	a.set(2, 3, 4, 5, -1, -21, -3, -4, 6, 7, 8, 10, -8, -9, -10, -12);
	assert.ok(a.determinant() == 76, 'Passed!');
});

QUnit.test('transpose', assert => {
	const a = new Matrix4();
	let b = a.clone().transpose();
	assert.ok(matrixEquals4(a, b), 'Passed!');

	b = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
	const c = b.clone().transpose();
	assert.ok(!matrixEquals4(b, c), 'Passed!');
	c.transpose();
	assert.ok(matrixEquals4(b, c), 'Passed!');
});

QUnit.test('setPosition', assert => {
	const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
	const b = new Vector3(-1, -2, -3);
	const c = new Matrix4().set(0, 1, 2, -1, 4, 5, 6, -2, 8, 9, 10, -3, 12, 13, 14, 15);

	a.setPosition(b);
	assert.ok(matrixEquals4(a, c), 'Passed!');

	const d = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
	const e = new Matrix4().set(0, 1, 2, -1, 4, 5, 6, -2, 8, 9, 10, -3, 12, 13, 14, 15);

	d.setPosition(-1, -2, -3);
	assert.ok(matrixEquals4(d, e), 'Passed!');
});

QUnit.todo('invert', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.test('getMaxScaleOnAxis', assert => {
	const a = new Matrix4().set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
	const expected = Math.sqrt(3 * 3 + 7 * 7 + 11 * 11);

	assert.ok(Math.abs(a.getMaxScaleOnAxis() - expected) <= eps, 'Check result');
});

QUnit.test('makeTranslation', assert => {
	const a = new Matrix4();
	const b = new Vector3(2, 3, 4);
	const c = new Matrix4().set(1, 0, 0, 2, 0, 1, 0, 3, 0, 0, 1, 4, 0, 0, 0, 1);

	a.makeTranslation(b.x, b.y, b.z);
	assert.ok(matrixEquals4(a, c), 'Passed!');

	a.makeTranslation(b);
	assert.ok(matrixEquals4(a, c), 'Passed!');
});

QUnit.test('makeRotationAxis', assert => {
	const axis = new Vector3(1.5, 0.0, 1.0).normalize();
	const radians = 45 * (Math.PI / 180); // Convert degrees to radians
	const a = new Matrix4().makeRotationAxis(axis, radians);

	const expected = new Matrix4().set(
		0.9098790095958609, -0.39223227027636803, 0.13518148560620882, 0,
		0.39223227027636803, 0.7071067811865476, -0.588348405414552, 0,
		0.13518148560620882, 0.588348405414552, 0.7972277715906868, 0,
		0, 0, 0, 1
	);

	assert.ok(matrixEquals4(a, expected), 'Check numeric result');
});

QUnit.test('makeScale', assert => {
	const a = new Matrix4();
	const c = new Matrix4().set(2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1);

	a.makeScale(2, 3, 4);
	assert.ok(matrixEquals4(a, c), 'Passed!');
});

QUnit.test('compose/decompose', assert => {
	const tValues = [
		new Vector3(),
		new Vector3(3, 0, 0),
		new Vector3(0, 4, 0),
		new Vector3(0, 0, 5),
		new Vector3(-6, 0, 0),
		new Vector3(0, -7, 0),
		new Vector3(0, 0, -8),
		new Vector3(-2, 5, -9),
		new Vector3(-2, -5, -9)
	];

	const sValues = [
		new Vector3(1, 1, 1),
		new Vector3(2, 2, 2),
		new Vector3(1, -1, 1),
		new Vector3(-1, 1, 1),
		new Vector3(1, 1, -1),
		new Vector3(2, -2, 1),
		new Vector3(-1, 2, -2),
		new Vector3(-1, -1, -1),
		new Vector3(-2, -2, -2)
	];

	const rValues = [
		new Quaternion(),
		new Quaternion().setFromEuler(new Euler(1, 1, 0)),
		new Quaternion().setFromEuler(new Euler(1, -1, 1)),
		new Quaternion(0, 0.9238795292366128, 0, 0.38268342717215614)
	];

	for (let ti = 0; ti < tValues.length; ti++) {
		for (let si = 0; si < sValues.length; si++) {
			for (let ri = 0; ri < rValues.length; ri++) {
				const t = tValues[ti];
				const s = sValues[si];
				const r = rValues[ri];

				const m = new Matrix4().compose(t, r, s);
				const t2 = new Vector3();
				const r2 = new Quaternion();
				const s2 = new Vector3();

				m.decompose(t2, r2, s2);

				const m2 = new Matrix4().compose(t2, r2, s2);

				assert.ok(matrixEquals4(m, m2), 'Passed!');
			}
		}
	}
});

QUnit.test('equals', assert => {
	const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
	const b = new Matrix4().set(0, -1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

	assert.notOk(a.equals(b), 'Check that a does not equal b');
	assert.notOk(b.equals(a), 'Check that b does not equal a');

	a.copy(b);
	assert.ok(a.equals(b), 'Check that a equals b after copy()');
	assert.ok(b.equals(a), 'Check that b equals a after copy()');
});

QUnit.test('fromArray', assert => {
	const a = new Matrix4();
	const b = new Matrix4().set(1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16);

	a.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
	assert.ok(a.equals(b), 'Passed');
});

QUnit.test('toArray', assert => {
	const a = new Matrix4().set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
	const noOffset = [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16];
	const withOffset = [undefined, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16];

	let array = a.toArray();
	assert.deepEqual(array, noOffset, 'No array, no offset');

	array = [];
	a.toArray(array);
	assert.deepEqual(array, noOffset, 'With array, no offset');

	array = [];
	a.toArray(array, 1);
	assert.deepEqual(array, withOffset, 'With array, with offset');
});