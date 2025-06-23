import { Vector3, Matrix3, Matrix4, Quaternion, Spherical } from 't3d';
import { x, y, z, eps } from '../../utils/math-constants.js';

QUnit.module('Vector3');

QUnit.test('Instancing', assert => {
	let a = new Vector3();
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');
	assert.ok(a.z == 0, 'Passed!');

	a = new Vector3(x, y, z);
	assert.ok(a.x === x, 'Passed!');
	assert.ok(a.y === y, 'Passed!');
	assert.ok(a.z === z, 'Passed!');
});

QUnit.test('set', assert => {
	const a = new Vector3();
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');
	assert.ok(a.z == 0, 'Passed!');

	a.set(x, y, z);
	assert.ok(a.x == x, 'Passed!');
	assert.ok(a.y == y, 'Passed!');
	assert.ok(a.z == z, 'Passed!');
});

QUnit.test('clone', assert => {
	const a = new Vector3().clone();
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');
	assert.ok(a.z == 0, 'Passed!');

	const b = a.set(x, y, z).clone();
	assert.ok(b.x == x, 'Passed!');
	assert.ok(b.y == y, 'Passed!');
	assert.ok(b.z === z, 'Passed!');
});

QUnit.test('copy', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3().copy(a);
	assert.ok(b.x == x, 'Passed!');
	assert.ok(b.y == y, 'Passed!');
	assert.ok(b.z == z, 'Passed!');

	// ensure that it is a true copy
	a.x = 0;
	a.y = -1;
	a.z = -2;
	assert.ok(b.x == x, 'Passed!');
	assert.ok(b.y == y, 'Passed!');
	assert.ok(b.z == z, 'Passed!');
});

QUnit.test('add', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3(-x, -y, -z);

	a.add(b);
	assert.ok(a.x == 0, 'Passed!');
	assert.ok(a.y == 0, 'Passed!');
	assert.ok(a.z == 0, 'Passed!');

	const c = new Vector3().addVectors(b, b);
	assert.ok(c.x == -2 * x, 'Passed!');
	assert.ok(c.y == -2 * y, 'Passed!');
	assert.ok(c.z == -2 * z, 'Passed!');
});

QUnit.todo('addVectors', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.test('addScaledVector', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3(2, 3, 4);
	const s = 3;

	a.addScaledVector(b, s);
	assert.strictEqual(a.x, x + b.x * s, 'Check x');
	assert.strictEqual(a.y, y + b.y * s, 'Check y');
	assert.strictEqual(a.z, z + b.z * s, 'Check z');
});

QUnit.test('sub', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3(-x, -y, -z);

	a.sub(b);
	assert.ok(a.x == 2 * x, 'Passed!');
	assert.ok(a.y == 2 * y, 'Passed!');
	assert.ok(a.z == 2 * z, 'Passed!');

	const c = new Vector3().subVectors(a, a);
	assert.ok(c.x == 0, 'Passed!');
	assert.ok(c.y == 0, 'Passed!');
	assert.ok(c.z == 0, 'Passed!');
});

QUnit.todo('subVectors', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.test('applyMatrix3', assert => {
	const a = new Vector3(x, y, z);
	const m = new Matrix3().set(2, 3, 5, 7, 11, 13, 17, 19, 23);

	a.applyMatrix3(m);
	assert.strictEqual(a.x, 33, 'Check x');
	assert.strictEqual(a.y, 99, 'Check y');
	assert.strictEqual(a.z, 183, 'Check z');
});

QUnit.todo('applyMatrix4', assert => {
	 assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.test('applyQuaternion', assert => {
	const a = new Vector3(x, y, z);

	a.applyQuaternion(new Quaternion());
	assert.strictEqual(a.x, x, 'Identity rotation: check x');
	assert.strictEqual(a.y, y, 'Identity rotation: check y');
	assert.strictEqual(a.z, z, 'Identity rotation: check z');
});

QUnit.todo('project', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.todo('unproject', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.test('transformDirection', assert => {
	const a = new Vector3(x, y, z);
	const m = new Matrix4();
	const transformed = new Vector3(0.3713906763541037, 0.5570860145311556, 0.7427813527082074);

	a.transformDirection(m);
	assert.ok(Math.abs(a.x - transformed.x) <= eps, 'Check x');
	assert.ok(Math.abs(a.y - transformed.y) <= eps, 'Check y');
	assert.ok(Math.abs(a.z - transformed.z) <= eps, 'Check z');
});

QUnit.test('negate', assert => {
	const a = new Vector3(x, y, z);

	a.negate();
	assert.ok(a.x == -x, 'Passed!');
	assert.ok(a.y == -y, 'Passed!');
	assert.ok(a.z == -z, 'Passed!');
});

QUnit.test('dot', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3(-x, -y, -z);
	const c = new Vector3();

	let result = a.dot(b);
	assert.ok(result == (-x * x - y * y - z * z), 'Passed!');

	result = a.dot(c);
	assert.ok(result == 0, 'Passed!');
});

QUnit.test('normalize', assert => {
	const a = new Vector3(x, 0, 0);
	const b = new Vector3(0, -y, 0);
	const c = new Vector3(0, 0, z);

	a.normalize();
	assert.ok(a.getLength() == 1, 'Passed!');
	assert.ok(a.x == 1, 'Passed!');

	b.normalize();
	assert.ok(b.getLength() == 1, 'Passed!');
	assert.ok(b.y == -1, 'Passed!');

	c.normalize();
	assert.ok(c.getLength() == 1, 'Passed!');
	assert.ok(c.z == 1, 'Passed!');
});

QUnit.todo('lerpVectors', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.test('cross', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3(2 * x, -y, 0.5 * z);
	const crossed = new Vector3(18, 12, -18);

	a.cross(b);
	assert.ok(Math.abs(a.x - crossed.x) <= eps, 'Check x');
	assert.ok(Math.abs(a.y - crossed.y) <= eps, 'Check y');
	assert.ok(Math.abs(a.z - crossed.z) <= eps, 'Check z');
});

QUnit.test('crossVectors', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3(x, -y, z);
	const c = new Vector3();
	const crossed = new Vector3(24, 0, -12);

	c.crossVectors(a, b);
	assert.ok(Math.abs(c.x - crossed.x) <= eps, 'Check x');
	assert.ok(Math.abs(c.y - crossed.y) <= eps, 'Check y');
	assert.ok(Math.abs(c.z - crossed.z) <= eps, 'Check z');
});

QUnit.test('reflect', assert => {
	const a = new Vector3();
	const normal = new Vector3(0, 1, 0);
	const b = new Vector3();

	a.set(0, -1, 0);
	assert.ok(b.copy(a).reflect(normal).equals(new Vector3(0, 1, 0)), 'Passed!');

	a.set(1, -1, 0);
	assert.ok(b.copy(a).reflect(normal).equals(new Vector3(1, 1, 0)), 'Passed!');

	a.set(1, -1, 0);
	normal.set(0, -1, 0);
	assert.ok(b.copy(a).reflect(normal).equals(new Vector3(1, 1, 0)), 'Passed!');
});

QUnit.test('angleTo', assert => {
	const a = new Vector3(0, -0.18851655680720186, 0.9820700116639124);
	const b = new Vector3(0, 0.18851655680720186, -0.9820700116639124);

	assert.equal(a.angleTo(a), 0);
	assert.equal(a.angleTo(b), Math.PI);

	const x = new Vector3(1, 0, 0);
	const y = new Vector3(0, 1, 0);
	const z = new Vector3(0, 0, 1);

	assert.equal(x.angleTo(y), Math.PI / 2);
	assert.equal(x.angleTo(z), Math.PI / 2);
	assert.equal(z.angleTo(x), Math.PI / 2);

	assert.ok(Math.abs(x.angleTo(new Vector3(1, 1, 0)) - (Math.PI / 4)) < 0.0000001);
});

QUnit.test('setFromSpherical', assert => {
	const a = new Vector3();
	const phi = Math.acos(-0.5);
	const theta = Math.sqrt(Math.PI) * phi;
	const sph = new Spherical(10, phi, theta);
	const expected = new Vector3(-4.677914006701843, -5, -7.288149322420796);

	a.setFromSpherical(sph);
	assert.ok(Math.abs(a.x - expected.x) <= eps, 'Check x');
	assert.ok(Math.abs(a.y - expected.y) <= eps, 'Check y');
	assert.ok(Math.abs(a.z - expected.z) <= eps, 'Check z');
});

QUnit.test('setFromMatrixPosition', assert => {
	const a = new Vector3();
	const m = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);

	a.setFromMatrixPosition(m);
	assert.strictEqual(a.x, 7, 'Check x');
	assert.strictEqual(a.y, 19, 'Check y');
	assert.strictEqual(a.z, 37, 'Check z');
});

QUnit.test('setFromMatrixScale', assert => {
	const a = new Vector3();
	const m = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);
	const expected = new Vector3(25.573423705088842, 31.921779399024736, 35.70714214271425);

	a.setFromMatrixScale(m);
	assert.ok(Math.abs(a.x - expected.x) <= eps, 'Check x');
	assert.ok(Math.abs(a.y - expected.y) <= eps, 'Check y');
	assert.ok(Math.abs(a.z - expected.z) <= eps, 'Check z');
});

QUnit.test('setFromMatrixColumn', assert => {
	const a = new Vector3();
	const m = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);

	a.setFromMatrixColumn(m, 0);
	assert.strictEqual(a.x, 2, 'Index 0: check x');
	assert.strictEqual(a.y, 11, 'Index 0: check y');
	assert.strictEqual(a.z, 23, 'Index 0: check z');

	a.setFromMatrixColumn(m, 2);
	assert.strictEqual(a.x, 5, 'Index 2: check x');
	assert.strictEqual(a.y, 17, 'Index 2: check y');
	assert.strictEqual(a.z, 31, 'Index 2: check z');
});

QUnit.test('equals', assert => {
	const a = new Vector3(x, 0, z);
	const b = new Vector3(0, -y, 0);

	assert.ok(a.x != b.x, 'Passed!');
	assert.ok(a.y != b.y, 'Passed!');
	assert.ok(a.z != b.z, 'Passed!');

	assert.ok(!a.equals(b), 'Passed!');
	assert.ok(!b.equals(a), 'Passed!');

	a.copy(b);
	assert.ok(a.x == b.x, 'Passed!');
	assert.ok(a.y == b.y, 'Passed!');
	assert.ok(a.z == b.z, 'Passed!');

	assert.ok(a.equals(b), 'Passed!');
	assert.ok(b.equals(a), 'Passed!');
});

QUnit.test('fromArray', assert => {
	const a = new Vector3();
	const array = [1, 2, 3, 4, 5, 6];

	a.fromArray(array);
	assert.strictEqual(a.x, 1, 'No offset: check x');
	assert.strictEqual(a.y, 2, 'No offset: check y');
	assert.strictEqual(a.z, 3, 'No offset: check z');

	a.fromArray(array, 3);
	assert.strictEqual(a.x, 4, 'With offset: check x');
	assert.strictEqual(a.y, 5, 'With offset: check y');
	assert.strictEqual(a.z, 6, 'With offset: check z');
});

QUnit.test('toArray', assert => {
	const a = new Vector3(x, y, z);

	let array = a.toArray();
	assert.strictEqual(array[0], x, 'No array, no offset: check x');
	assert.strictEqual(array[1], y, 'No array, no offset: check y');
	assert.strictEqual(array[2], z, 'No array, no offset: check z');

	array = [];
	a.toArray(array);
	assert.strictEqual(array[0], x, 'With array, no offset: check x');
	assert.strictEqual(array[1], y, 'With array, no offset: check y');
	assert.strictEqual(array[2], z, 'With array, no offset: check z');

	array = [];
	a.toArray(array, 1);
	assert.strictEqual(array[0], undefined, 'With array and offset: check [0]');
	assert.strictEqual(array[1], x, 'With array and offset: check x');
	assert.strictEqual(array[2], y, 'With array and offset: check y');
	assert.strictEqual(array[3], z, 'With array and offset: check z');
});

QUnit.test('distanceTo/distanceToSquared', assert => {
	const a = new Vector3(x, 0, 0);
	const b = new Vector3(0, -y, 0);
	const c = new Vector3(0, 0, z);
	const d = new Vector3();

	assert.ok(a.distanceTo(d) == x, 'Passed!');
	assert.ok(a.distanceToSquared(d) == x * x, 'Passed!');

	assert.ok(b.distanceTo(d) == y, 'Passed!');
	assert.ok(b.distanceToSquared(d) == y * y, 'Passed!');

	assert.ok(c.distanceTo(d) == z, 'Passed!');
	assert.ok(c.distanceToSquared(d) == z * z, 'Passed!');
});

QUnit.test('setScalar/addScalar', assert => {
	const a = new Vector3();
	const s = 3;

	a.setScalar(s);
	assert.strictEqual(a.x, s, 'setScalar: check x');
	assert.strictEqual(a.y, s, 'setScalar: check y');
	assert.strictEqual(a.z, s, 'setScalar: check z');

	a.addScalar(s);
	assert.strictEqual(a.x, 2 * s, 'addScalar: check x');
	assert.strictEqual(a.y, 2 * s, 'addScalar: check y');
	assert.strictEqual(a.z, 2 * s, 'addScalar: check z');
});

QUnit.test('multiply', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3(2 * x, 2 * y, 2 * z);

	a.multiply(b);
	assert.strictEqual(a.x, x * b.x, 'multiply: check x');
	assert.strictEqual(a.y, y * b.y, 'multiply: check y');
	assert.strictEqual(a.z, z * b.z, 'multiply: check z');
});

QUnit.test('multiplyScalar', assert => {
	const a = new Vector3(x, y, z);
	const b = new Vector3(-x, -y, -z);

	a.multiplyScalar(-2);
	assert.ok(a.x == x * -2, 'Passed!');
	assert.ok(a.y == y * -2, 'Passed!');
	assert.ok(a.z == z * -2, 'Passed!');

	b.multiplyScalar(-2);
	assert.ok(b.x == 2 * x, 'Passed!');
	assert.ok(b.y == 2 * y, 'Passed!');
	assert.ok(b.z == 2 * z, 'Passed!');
});

QUnit.todo('project/unproject', assert => {
	assert.ok(false, 'everything\'s gonna be alright');
});

QUnit.test('getLength/getLengthSquared', assert => {
	const a = new Vector3(x, 0, 0);
	const b = new Vector3(0, -y, 0);
	const c = new Vector3(0, 0, z);
	const d = new Vector3();

	assert.ok(a.getLength() == x, 'Passed!');
	assert.ok(a.getLengthSquared() == x * x, 'Passed!');
	assert.ok(b.getLength() == y, 'Passed!');
	assert.ok(b.getLengthSquared() == y * y, 'Passed!');
	assert.ok(c.getLength() == z, 'Passed!');
	assert.ok(c.getLengthSquared() == z * z, 'Passed!');
	assert.ok(d.getLength() == 0, 'Passed!');
	assert.ok(d.getLengthSquared() == 0, 'Passed!');

	a.set(x, y, z);
	assert.ok(a.getLength() == Math.sqrt(x * x + y * y + z * z), 'Passed!');
	assert.ok(a.getLengthSquared() == (x * x + y * y + z * z), 'Passed!');
});

QUnit.test('lerp/clone', assert => {
	const a = new Vector3(x, 0, z);
	const b = new Vector3(0, -y, 0);

	assert.ok(a.lerp(a, 0).equals(a.lerp(a, 0.5)), 'Passed!');
	assert.ok(a.lerp(a, 0).equals(a.lerp(a, 1)), 'Passed!');

	assert.ok(a.clone().lerp(b, 0).equals(a), 'Passed!');

	assert.ok(a.clone().lerp(b, 0.5).x == x * 0.5, 'Passed!');
	assert.ok(a.clone().lerp(b, 0.5).y == -y * 0.5, 'Passed!');
	assert.ok(a.clone().lerp(b, 0.5).z == z * 0.5, 'Passed!');

	assert.ok(a.clone().lerp(b, 1).equals(b), 'Passed!');
});

QUnit.test('iterable', assert => {
	const v = new Vector3(0, 0.5, 1);
	const array = [...v];
	assert.strictEqual(array[0], 0, 'Vector3 is iterable.');
	assert.strictEqual(array[1], 0.5, 'Vector3 is iterable.');
	assert.strictEqual(array[2], 1, 'Vector3 is iterable.');
});