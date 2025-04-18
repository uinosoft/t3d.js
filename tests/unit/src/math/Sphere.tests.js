import { Sphere, Vector3, Matrix4, Box3 } from 't3d';
import { zero3, one3, two3, eps } from '../../utils/math-constants.js';

QUnit.module('Sphere');

QUnit.test('constructor', assert => {
	let a = new Sphere();
	assert.ok(a.center.equals(zero3), 'Passed!');
	assert.ok(a.radius == -1, 'Passed!');

	a = new Sphere(one3.clone(), 1);
	assert.ok(a.center.equals(one3), 'Passed!');
	assert.ok(a.radius == 1, 'Passed!');
});

QUnit.test('set', assert => {
	const a = new Sphere();
	assert.ok(a.center.equals(zero3), 'Passed!');
	assert.ok(a.radius == -1, 'Passed!');

	a.set(one3, 1);
	assert.ok(a.center.equals(one3), 'Passed!');
	assert.ok(a.radius == 1, 'Passed!');
});

QUnit.test('setFromArray', assert => {
	const a = new Sphere();
	const expectedCenter = new Vector3(0.9330126941204071, 0, 0);
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
	assert.ok(Math.abs(a.center.x - expectedCenter.x) <= eps, 'Default center: check center.x');
	assert.ok(Math.abs(a.center.y - expectedCenter.y) <= eps, 'Default center: check center.y');
	assert.ok(Math.abs(a.center.z - expectedCenter.z) <= eps, 'Default center: check center.z');
	assert.ok(Math.abs(a.radius - expectedRadius) <= eps, 'Default center: check radius');
});

QUnit.test('setFromPoints', assert => {
	const a = new Sphere();
	const points = [
		new Vector3(1, 1, 1),
		new Vector3(2, 2, 2),
		new Vector3(-1, -1, -1)
	];

	// Setting from points with automatic center calculation
	a.setFromPoints(points);
	assert.ok(a.center.equals(new Vector3(0.5, 0.5, 0.5)), 'Auto-center: check center');
	assert.ok(Math.abs(a.radius - Math.sqrt(1.5 * 1.5 + 1.5 * 1.5 + 1.5 * 1.5)) <= eps, 'Auto-center: check radius');
	console.log(a.radius);

	// Setting from points with specified center
	const center = new Vector3(0, 0, 0);
	a.setFromPoints(points, center);
	assert.ok(a.center.equals(center), 'Specified center: check center');
	assert.ok(Math.abs(a.radius - Math.sqrt(2 * 2 + 2 * 2 + 2 * 2)) <= eps, 'Specified center: check radius');
	console.log(a.radius);
});

QUnit.test('applyMatrix4', assert => {
	const a = new Sphere(one3.clone(), 1);
	const m = new Matrix4().makeTranslation(1, -2, 1);
	const aabb1 = new Box3();
	const aabb2 = new Box3();

	a.clone().applyMatrix4(m).getBoundingBox(aabb1);
	a.getBoundingBox(aabb2);

	assert.ok(aabb1.equals(aabb2.applyMatrix4(m)), 'Passed!');
});

QUnit.test('getBoundingBox', assert => {
	const a = new Sphere(one3.clone(), 1);
	const aabb = new Box3();

	a.getBoundingBox(aabb);
	assert.ok(aabb.equals(new Box3(zero3, two3)), 'Passed!');

	a.set(zero3, 0);
	a.getBoundingBox(aabb);
	assert.ok(aabb.equals(new Box3(zero3, zero3)), 'Passed!');

	// Empty sphere produces empty bounding box
	a.makeEmpty();
	a.getBoundingBox(aabb);
	assert.ok(aabb.isEmpty(), 'Passed!');
});

QUnit.test('isEmpty', assert => {
	const a = new Sphere();
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

QUnit.test('makeEmpty', assert => {
	const a = new Sphere(one3.clone(), 1);
	assert.ok(!a.isEmpty(), 'Passed!');

	a.makeEmpty();
	assert.ok(a.isEmpty(), 'Passed!');
	assert.ok(a.center.equals(zero3), 'Passed!');
});

QUnit.test('containsPoint', assert => {
	const a = new Sphere(one3.clone(), 1);

	// Point inside the sphere
	assert.ok(a.containsPoint(new Vector3(1.5, 1, 1)), 'Inside point: Passed!');

	// Point on the surface of the sphere
	const surfacePoint = new Vector3(1, 1, 2);
	assert.ok(a.containsPoint(surfacePoint), 'Surface point: Passed!');

	// Point outside the sphere
	assert.ok(!a.containsPoint(new Vector3(3, 1, 1)), 'Outside point: Passed!');

	// With an empty sphere
	a.makeEmpty();
	assert.ok(!a.containsPoint(one3), 'Empty sphere contains no points: Passed!');
});

QUnit.test('distanceToPoint', assert => {
	const a = new Sphere(one3.clone(), 1);

	// Point inside the sphere
	assert.ok(a.distanceToPoint(one3) === -1, 'Center point distance: Passed!');
	assert.ok(a.distanceToPoint(new Vector3(1.5, 1, 1)) < 0, 'Inside point distance is negative: Passed!');

	// Point on the surface of the sphere
	const surfacePoint = new Vector3(1, 1, 2);
	assert.ok(Math.abs(a.distanceToPoint(surfacePoint)) <= eps, 'Surface point distance is zero: Passed!');

	// Point outside the sphere
	const outsidePoint = new Vector3(1, 1, 3);
	assert.ok(Math.abs(a.distanceToPoint(outsidePoint) - 1) <= eps, 'Outside point distance: Passed!');
});

QUnit.test('expandByPoint', assert => {
	// Starting with default sphere
	const a = new Sphere();

	// Expand empty sphere by point
	a.expandByPoint(one3);
	assert.ok(a.center.equals(one3), 'First point becomes center: Passed!');
	assert.ok(a.radius === 0, 'Radius is 0 after first point: Passed!');

	// Expand by another point
	a.expandByPoint(new Vector3(3, 1, 1));
	assert.ok(Math.abs(a.radius - 1) <= eps, 'Radius updates correctly: Passed!');
	assert.ok(a.center.distanceTo(new Vector3(2, 1, 1)) <= eps, 'Center updates correctly: Passed!');

	// Test with third point inside existing sphere
	a.expandByPoint(new Vector3(1.5, 1, 1));
	assert.ok(Math.abs(a.radius - 1) <= eps, 'Radius unchanged for inside point: Passed!');
});

QUnit.test('union', assert => {
	// Test combining two non-empty spheres
	const a = new Sphere(zero3.clone(), 1);
	const b = new Sphere(new Vector3(2, 0, 0), 1);

	a.union(b);
	assert.ok(a.center.equals(new Vector3(1, 0, 0)), 'Union centers: Passed!');
	assert.ok(Math.abs(a.radius - 2) <= eps, 'Union radius: Passed!');

	// Test with an empty sphere
	const c = new Sphere();
	const d = new Sphere(one3.clone(), 1);

	c.union(d);
	assert.ok(c.center.equals(one3), 'Empty with non-empty center: Passed!');
	assert.ok(c.radius === 1, 'Empty with non-empty radius: Passed!');

	// Test with spheres having the same center
	const e = new Sphere(one3.clone(), 1);
	const f = new Sphere(one3.clone(), 2);

	e.union(f);
	assert.ok(e.center.equals(one3), 'Same center result: Passed!');
	assert.ok(e.radius === 2, 'Same center takes larger radius: Passed!');
});

QUnit.test('clone', assert => {
	const a = new Sphere(one3.clone(), 1);
	const b = a.clone();

	assert.ok(a.center.equals(b.center), 'Clone center: Passed!');
	assert.ok(a.radius === b.radius, 'Clone radius: Passed!');

	// Verify it's a true copy
	a.center.x = 0;
	a.radius = 0;
	assert.ok(!a.center.equals(b.center), 'Original change doesn\'t affect clone center: Passed!');
	assert.ok(a.radius !== b.radius, 'Original change doesn\'t affect clone radius: Passed!');
});

QUnit.test('copy', assert => {
	const a = new Sphere(one3.clone(), 1);
	const b = new Sphere().copy(a);

	assert.ok(b.center.equals(one3), 'Passed!');
	assert.ok(b.radius == 1, 'Passed!');

	// ensure that it is a true copy
	a.center = zero3;
	a.radius = 0;
	assert.ok(b.center.equals(one3), 'Passed!');
	assert.ok(b.radius == 1, 'Passed!');
});