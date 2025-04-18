import { Box3, Vector3, Matrix4, Sphere } from 't3d';
import { zero3, one3, two3, eps } from '../../utils/math-constants.js';

QUnit.module('Box3');

QUnit.test('constructor', assert => {
	let a = new Box3();
	assert.ok(a.min.x == Infinity, 'Passed!');
	assert.ok(a.min.y == Infinity, 'Passed!');
	assert.ok(a.min.z == Infinity, 'Passed!');
	assert.ok(a.max.x == -Infinity, 'Passed!');
	assert.ok(a.max.y == -Infinity, 'Passed!');
	assert.ok(a.max.z == -Infinity, 'Passed!');

	a = new Box3(zero3.clone(), one3.clone());
	assert.ok(a.min.equals(zero3), 'Passed!');
	assert.ok(a.max.equals(one3), 'Passed!');
});

QUnit.test('set', assert => {
	const a = new Box3();

	a.set(zero3, one3);
	assert.ok(a.min.equals(zero3), 'Passed!');
	assert.ok(a.max.equals(one3), 'Passed!');
});

QUnit.test('setFromPoints', assert => {
	const a = new Box3();

	a.setFromPoints([zero3, one3, two3]);
	assert.ok(a.min.equals(zero3), 'Passed!');
	assert.ok(a.max.equals(two3), 'Passed!');

	a.setFromPoints([]);
	assert.ok(a.isEmpty(), 'Passed!');
});

QUnit.test('makeEmpty', assert => {
	const a = new Box3();

	a.set(zero3, one3);
	a.makeEmpty();
	assert.ok(a.isEmpty(), 'Passed!');
});

QUnit.test('expandByPoint', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const point = new Vector3(2, 2, 2);
	const expectedResult = new Box3(zero3.clone(), point.clone());

	a.expandByPoint(point);
	assert.ok(a.equals(expectedResult), 'Passed!');
});

QUnit.test('expandByScalar', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const scalar = 1;
	const expectedResult = new Box3(
		new Vector3(-1, -1, -1),
		new Vector3(2, 2, 2)
	);

	a.expandByScalar(scalar);
	assert.ok(a.equals(expectedResult), 'Passed!');
});

QUnit.test('expandByBox3', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const b = new Box3(
		new Vector3(-1, -1, -1),
		new Vector3(2, 2, 2)
	);
	const expectedResult = new Box3(
		new Vector3(-1, -1, -1),
		new Vector3(2, 2, 2)
	);

	a.expandByBox3(b);
	assert.ok(a.equals(expectedResult), 'Passed!');
});

QUnit.test('setFromArray', assert => {
	const a = new Box3();
	const array = [0, 0, 0, 1, 1, 1, 2, 2, 2];

	a.setFromArray(array);
	assert.ok(a.min.equals(zero3), 'Passed!');
	assert.ok(a.max.equals(two3), 'Passed!');

	a.setFromArray(array, 3);
	assert.ok(a.min.equals(zero3), 'Passed!');
	assert.ok(a.max.equals(two3), 'Passed!');

	a.setFromArray(array, 3, 0);
	assert.ok(a.min.equals(zero3), 'Passed!');
	assert.ok(a.max.equals(two3), 'Passed!');

	a.setFromArray([]);
	assert.ok(a.isEmpty(), 'Passed!');
});

QUnit.test('clampPoint', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const point = new Vector3(-1, -1, -1);
	const expectedResult = zero3.clone();
	const result = new Vector3();

	a.clampPoint(point, result);
	assert.ok(result.equals(expectedResult), 'Clamped point should be min boundary when point is below min');

	const point2 = new Vector3(2, 2, 2);
	const expectedResult2 = one3.clone();

	a.clampPoint(point2, result);
	assert.ok(result.equals(expectedResult2), 'Clamped point should be max boundary when point is above max');

	const point3 = new Vector3(0.5, 0.5, 0.5);
	const expectedResult3 = point3.clone();

	a.clampPoint(point3, result);
	assert.ok(result.equals(expectedResult3), 'Clamped point should be unchanged when point is inside box');
});

QUnit.test('distanceToPoint', assert => {
	const a = new Box3(zero3.clone(), one3.clone());

	assert.ok(a.distanceToPoint(new Vector3(2, 2, 2)) === Math.sqrt(3), 'Correct distance to point outside box');
	assert.ok(a.distanceToPoint(new Vector3(0.5, 0.5, 0.5)) === 0, 'Distance to point inside box should be 0');
	assert.ok(a.distanceToPoint(new Vector3(1, 1, 1)) === 0, 'Distance to point on box boundary should be 0');
	assert.ok(a.distanceToPoint(new Vector3(1.5, 1.5, 1.5)) === Math.sqrt(0.75), 'Correct distance to point outside box');
	assert.ok(a.distanceToPoint(new Vector3(-0.5, -0.5, -0.5)) === Math.sqrt(0.75), 'Correct distance to point outside box');
});

QUnit.test('getBoundingSphere', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const sphere = new Sphere();
	const expectedCenter = new Vector3(0.5, 0.5, 0.5);

	a.getBoundingSphere(sphere);

	assert.ok(Math.abs(sphere.radius - Math.sqrt(3) * 0.5) <= eps, 'Bounding sphere radius is correct');
	assert.ok(sphere.center.equals(expectedCenter), 'Bounding sphere center is correct');

	const emptyBox = new Box3();
	emptyBox.makeEmpty();
	emptyBox.getBoundingSphere(sphere);

	assert.ok(sphere.isEmpty(), 'Bounding sphere for empty box should be empty');
});

QUnit.test('isEmpty', assert => {
	const a = new Box3();

	assert.ok(a.isEmpty(), 'Empty box should report isEmpty() === true');

	const b = new Box3(zero3.clone(), one3.clone());
	assert.ok(!b.isEmpty(), 'Non-empty box should report isEmpty() === false');

	// Edge cases
	const c = new Box3(one3.clone(), zero3.clone()); // min > max
	assert.ok(c.isEmpty(), 'Box with min > max should be considered empty');

	const d = new Box3(zero3.clone(), zero3.clone()); // min === max
	assert.ok(!d.isEmpty(), 'Box with min === max should not be considered empty (contains one point)');
});

QUnit.test('equals', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const b = new Box3(zero3.clone(), one3.clone());

	assert.ok(a.equals(b), 'Identical boxes should be equal');

	const c = new Box3(zero3.clone(), two3.clone());
	assert.ok(!a.equals(c), 'Different boxes should not be equal');
});

QUnit.test('getCenter', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const expectedCenter = new Vector3(0.5, 0.5, 0.5);
	const result = new Vector3();

	a.getCenter(result);

	assert.ok(result.equals(expectedCenter), 'Center is correct for non-empty box');

	const emptyBox = new Box3();
	emptyBox.makeEmpty();
	emptyBox.getCenter(result);

	assert.ok(result.equals(new Vector3(0, 0, 0)), 'Center defaults to (0,0,0) for empty box');
});

QUnit.test('getSize', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const expectedSize = new Vector3(1, 1, 1);
	const result = new Vector3();

	a.getSize(result);

	assert.ok(result.equals(expectedSize), 'Size is correct for non-empty box');

	const emptyBox = new Box3();
	emptyBox.makeEmpty();
	emptyBox.getSize(result);

	assert.ok(result.equals(new Vector3(0, 0, 0)), 'Size defaults to (0,0,0) for empty box');
});

QUnit.test('getPoints', assert => {
	const a = new Box3(
		new Vector3(-1, -2, -3),
		new Vector3(2, 3, 4)
	);

	const points = Array(8).fill().map(() => new Vector3());
	a.getPoints(points);

	assert.ok(points[0].equals(new Vector3(2, 3, 4)), 'Corner point 0 is correct');
	assert.ok(points[1].equals(new Vector3(2, -2, 4)), 'Corner point 1 is correct');
	assert.ok(points[2].equals(new Vector3(2, -2, -3)), 'Corner point 2 is correct');
	assert.ok(points[3].equals(new Vector3(2, 3, -3)), 'Corner point 3 is correct');
	assert.ok(points[4].equals(new Vector3(-1, 3, 4)), 'Corner point 4 is correct');
	assert.ok(points[5].equals(new Vector3(-1, -2, 4)), 'Corner point 5 is correct');
	assert.ok(points[6].equals(new Vector3(-1, -2, -3)), 'Corner point 6 is correct');
	assert.ok(points[7].equals(new Vector3(-1, 3, -3)), 'Corner point 7 is correct');
});

QUnit.test('union', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const b = new Box3(
		new Vector3(-1, -1, -1),
		new Vector3(2, 2, 2)
	);
	const expectedResult = new Box3(
		new Vector3(-1, -1, -1),
		new Vector3(2, 2, 2)
	);

	a.union(b);
	assert.ok(a.equals(expectedResult), 'Union of overlapping boxes is correct');

	const c = new Box3(
		new Vector3(3, 3, 3),
		new Vector3(4, 4, 4)
	);
	const expectedResult2 = new Box3(
		new Vector3(-1, -1, -1),
		new Vector3(4, 4, 4)
	);

	a.union(c);
	assert.ok(a.equals(expectedResult2), 'Union of non-overlapping boxes is correct');
});

QUnit.test('applyMatrix4', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const m = new Matrix4().makeTranslation(1, 2, 3);
	const expectedResult = new Box3(
		new Vector3(1, 2, 3),
		new Vector3(2, 3, 4)
	);

	a.applyMatrix4(m);
	assert.ok(a.equals(expectedResult), 'Box translated correctly');

	const b = new Box3(zero3.clone(), one3.clone());
	// Create a scale matrix
	const m2 = new Matrix4().makeScale(2, 3, 4);
	const expectedResult2 = new Box3(
		new Vector3(0, 0, 0),
		new Vector3(2, 3, 4)
	);

	b.applyMatrix4(m2);
	assert.ok(b.equals(expectedResult2), 'Box scaled correctly');

	const emptyBox = new Box3();
	emptyBox.makeEmpty();
	emptyBox.applyMatrix4(m);
	assert.ok(emptyBox.isEmpty(), 'Empty box remains empty after transformation');
});

QUnit.test('containsPoint', assert => {
	const a = new Box3(zero3.clone(), one3.clone());

	assert.ok(a.containsPoint(new Vector3(0.5, 0.5, 0.5)), 'Point inside box should return true');
	assert.ok(a.containsPoint(zero3), 'Point on min boundary should return true');
	assert.ok(a.containsPoint(one3), 'Point on max boundary should return true');
	assert.ok(!a.containsPoint(new Vector3(2, 2, 2)), 'Point outside box should return false');

	const emptyBox = new Box3();
	emptyBox.makeEmpty();
	assert.ok(!emptyBox.containsPoint(zero3), 'Empty box should not contain any points');
});

QUnit.test('intersectsTriangle', assert => {
	const a = new Box3(zero3.clone(), one3.clone());

	// Triangle completely inside box
	const insideTriangle = {
		a: new Vector3(0.1, 0.1, 0.1),
		b: new Vector3(0.5, 0.5, 0.5),
		c: new Vector3(0.9, 0.9, 0.9)
	};
	assert.ok(a.intersectsTriangle(insideTriangle), 'Triangle inside box should intersect');

	// Triangle intersecting box
	const intersectingTriangle = {
		a: new Vector3(0.5, 0.5, 0.5),
		b: new Vector3(1.5, 0.5, 0.5),
		c: new Vector3(0.5, 1.5, 0.5)
	};
	assert.ok(a.intersectsTriangle(intersectingTriangle), 'Triangle intersecting box should intersect');

	// Triangle completely outside box
	const outsideTriangle = {
		a: new Vector3(2, 2, 2),
		b: new Vector3(3, 2, 2),
		c: new Vector3(2, 3, 2)
	};
	assert.ok(!a.intersectsTriangle(outsideTriangle), 'Triangle outside box should not intersect');

	// Empty box should not intersect any triangle
	const emptyBox = new Box3();
	emptyBox.makeEmpty();
	assert.ok(!emptyBox.intersectsTriangle(insideTriangle), 'Empty box should not intersect any triangle');
});

QUnit.test('clone', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const b = a.clone();

	assert.ok(b.min.equals(zero3), 'Min cloned correctly');
	assert.ok(b.max.equals(one3), 'Max cloned correctly');
	assert.ok(b !== a, 'New instance created via clone');

	// Ensure it's a deep copy
	a.min.set(1, 1, 1);
	a.max.set(2, 2, 2);

	assert.ok(!b.min.equals(a.min), 'Changes to original do not affect clone (min)');
	assert.ok(!b.max.equals(a.max), 'Changes to original do not affect clone (max)');
});

QUnit.test('copy', assert => {
	const a = new Box3(zero3.clone(), one3.clone());
	const b = new Box3().copy(a);

	assert.ok(b.min.equals(zero3), 'Min copied correctly');
	assert.ok(b.max.equals(one3), 'Max copied correctly');
	assert.ok(b !== a, 'Different instances');

	// Ensure it's a deep copy
	a.min.set(1, 1, 1);
	a.max.set(2, 2, 2);

	assert.ok(!b.min.equals(a.min), 'Changes to original do not affect copy (min)');
	assert.ok(!b.max.equals(a.max), 'Changes to original do not affect copy (max)');
});