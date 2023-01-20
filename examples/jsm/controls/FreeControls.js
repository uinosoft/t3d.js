/**
 * @author shawn0326 / http://halflab.me
 */

import {
	Quaternion,
	Vector2,
	Vector3
} from 't3d';

var FreeControls = function(object, domElement) {
	this.object = object;
	this.object.euler.order = 'YXZ'; // the right order?

	this.domElement = (domElement !== undefined) ? domElement : document;
	if (domElement) this.domElement.setAttribute('tabindex', -1);

	this.movementSpeed = 1.0;
	this.rotateSpeed = 0.25;

	this.enableMovementDamping = true;
	this.movementDampingFactor = 0.25;

	this.enableRotateDamping = true;
	this.rotateDampingFactor = 0.25;

	this.update = function(delta) {
		delta = delta || 0.0166;

		var moveMult = delta * this.movementSpeed / 0.0166;

		moveVector.add(moveDelta);
		rotateVector.add(rotateDelta);

		tempVector.set(1, 0, 0).applyQuaternion(this.object.quaternion).multiplyScalar(moveVector.x * moveMult);
		this.object.position.add(tempVector);
		tempVector.set(0, 1, 0).applyQuaternion(this.object.quaternion).multiplyScalar(moveVector.y * moveMult);
		this.object.position.add(tempVector);
		tempVector.set(0, 0, 1).applyQuaternion(this.object.quaternion).multiplyScalar(moveVector.z * moveMult);
		this.object.position.add(tempVector);

		this.object.euler.x += delta * rotateVector.x / 0.0166;
		this.object.euler.y += delta * rotateVector.y / 0.0166;

		if (this.enableMovementDamping) {
			moveVector.multiplyScalar(1 - this.movementDampingFactor);
		} else {
			moveVector.set(0, 0, 0);
		}

		if (this.enableRotateDamping) {
			rotateVector.multiplyScalar(1 - this.rotateDampingFactor);
		} else {
			rotateVector.set(0, 0);
		}

		rotateDelta.set(0, 0);

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if (lastPosition.distanceToSquared(this.object.position) > EPS ||
            8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {
			lastPosition.copy(this.object.position);
			lastQuaternion.copy(this.object.quaternion);

			return true;
		}

		return false;
	};

	var tempVector = new Vector3();

	var lastPosition = new Vector3();
	var lastQuaternion = new Quaternion();
	var EPS = 0.000001;

	var rotateStart = new Vector2();
	var rotateEnd = new Vector2();
	var rotateDelta = new Vector2();

	var moveDelta = new Vector3();

	var rotateVector = new Vector2();
	var moveVector = new Vector3();

	var mouseState = 0;
	var moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0 };

	var scope = this;

	function updateRotateVector() {
		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		var x = rotateDelta.x, y = rotateDelta.y;
		rotateDelta.x = (2 * Math.PI * y / element.clientHeight);
		rotateDelta.y = (2 * Math.PI * x / element.clientWidth);
	}

	function updateMovementVector() {
		moveDelta.x = (-moveState.left + moveState.right);
		moveDelta.y = (-moveState.down + moveState.up);
		moveDelta.z = (-moveState.forward + moveState.back);
	}

	function mousedown(event) {
		rotateStart.set(event.clientX, event.clientY);

		mouseState = 1;
	}

	function mousemove(event) {
		if (mouseState == 0) return;

		rotateEnd.set(event.clientX, event.clientY);

		rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(-scope.rotateSpeed);

		updateRotateVector();

		rotateStart.copy(rotateEnd);
	}

	function mouseup(event) {
		mouseState = 0;

		rotateDelta.set(0, 0);
	}

	function keydown(event) {
		switch (event.keyCode) {
			case 87: /* W */ moveState.forward = 1; break;
			case 83: /* S */ moveState.back = 1; break;

			case 65: /* A */ moveState.left = 1; break;
			case 68: /* D */ moveState.right = 1; break;

			case 82: /* R */ moveState.up = 1; break;
			case 70: /* F */ moveState.down = 1; break;

			case 69: /* E */ moveState.up = 1; break;
			case 81: /* Q */ moveState.down = 1; break;
		}

		updateMovementVector();
	}

	function keyup(event) {
		switch (event.keyCode) {
			case 87: /* W */ moveState.forward = 0; break;
			case 83: /* S */ moveState.back = 0; break;

			case 65: /* A */ moveState.left = 0; break;
			case 68: /* D */ moveState.right = 0; break;

			case 82: /* R */ moveState.up = 0; break;
			case 70: /* F */ moveState.down = 0; break;

			case 69: /* E */ moveState.up = 0; break;
			case 81: /* Q */ moveState.down = 0; break;
		}

		updateMovementVector();
	}

	this.domElement.addEventListener('mousemove', mousemove);
	this.domElement.addEventListener('mousedown', mousedown);
	this.domElement.addEventListener('mouseup', mouseup);

	window.addEventListener('keydown', keydown);
	window.addEventListener('keyup', keyup);

	updateMovementVector();
	updateRotateVector();
}

export { FreeControls };