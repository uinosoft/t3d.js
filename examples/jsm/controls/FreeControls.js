/**
 * @author shawn0326 / http://halflab.me
 */

import {
	Quaternion,
	Vector2,
	Vector3
} from 't3d';

class FreeControls {

	constructor(object, domElement = document) {
		this.object = object;
		this.domElement = domElement;

		this.object.euler.order = 'YXZ'; // the right order?

		// API

		this.movementSpeed = 1.0;
		this.rotateSpeed = 0.25;

		this.enableMovementDamping = true;
		this.movementDampingFactor = 0.25;

		this.enableRotateDamping = true;
		this.rotateDampingFactor = 0.25;

		// internals

		const EPS = 0.000001;

		const tempVector = new Vector3();

		const lastPosition = new Vector3();
		const lastQuaternion = new Quaternion();

		const rotateStart = new Vector2();
		const rotateEnd = new Vector2();
		const rotateDelta = new Vector2();

		const moveDelta = new Vector3();

		const rotateVector = new Vector2();
		const moveVector = new Vector3();

		let mouseState = 0;
		const moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0 };

		const scope = this;

		this.update = function(delta = 0.0166) {
			const moveMult = delta * this.movementSpeed / 0.0166;

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

			if (
				lastPosition.distanceToSquared(this.object.position) > EPS ||
				8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS
			) {
				lastPosition.copy(this.object.position);
				lastQuaternion.copy(this.object.quaternion);

				return true;
			}

			return false;
		};

		function updateRotateVector() {
			const element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			const x = rotateDelta.x, y = rotateDelta.y;
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

}

export { FreeControls };