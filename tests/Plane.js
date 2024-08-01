/* eslint-disable no-undef */

QUnit.module('Plane');

QUnit.test('intersectPlanes', assert => {
	const p1 = new t3d.Plane(new t3d.Vector3(1, 0, 0), -1);
	const p2 = new t3d.Plane(new t3d.Vector3(0, 1, 0), -1);
	const p3 = new t3d.Plane(new t3d.Vector3(0, 0, 1), -1);

	const point = t3d.Plane.intersectPlanes(p1, p2, p3, new t3d.Vector3());

	assert.ok(Math.abs(point.x - 1) <= eps, 'Passed!');
	assert.ok(Math.abs(point.y - 1) <= eps, 'Passed!');
	assert.ok(Math.abs(point.z - 1) <= eps, 'Passed!');
});