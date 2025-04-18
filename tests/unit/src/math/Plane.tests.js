import { Plane, Vector3 } from 't3d';
import { eps } from '../../utils/math-constants.js';

QUnit.module('Plane');

QUnit.test('intersectPlanes', assert => {
	const p1 = new Plane(new Vector3(1, 0, 0), -1);
	const p2 = new Plane(new Vector3(0, 1, 0), -1);
	const p3 = new Plane(new Vector3(0, 0, 1), -1);

	const point = Plane.intersectPlanes(p1, p2, p3, new Vector3());

	assert.ok(Math.abs(point.x - 1) <= eps, 'Passed!');
	assert.ok(Math.abs(point.y - 1) <= eps, 'Passed!');
	assert.ok(Math.abs(point.z - 1) <= eps, 'Passed!');
});