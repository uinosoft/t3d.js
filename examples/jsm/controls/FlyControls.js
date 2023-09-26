import {
	Quaternion,
	Vector3
} from 't3d';

/**
 * reference: https://github.com/mrdoob/three.js/blob/dev/examples/jsm/controls/FlyControls.js
 */
class FlyControls {

	constructor(object, domElement = document) {
		this.object = object;
		this.domElement = domElement;

		// API

		this.enabled = true;

		this.movementSpeed = 1.0;
		this.rollSpeed = 0.005;

		this.dragToLook = false;
		this.autoForward = false;

		// disable default target object behavior

		// internals

		const EPS = 0.000001;
		const lastQuaternion = new Quaternion();
		const lastPosition = new Vector3();

		this.tmpQuaternion = new Quaternion();
		const tempVector = new Vector3();

		this.mouseStatus = 0;

		this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
		this.moveVector = new Vector3(0, 0, 0);
		this.rotationVector = new Vector3(0, 0, 0);

		this.keydown = function(event) {
			if (event.altKey || this.enabled === false) {
				return;
			}

			switch (event.code) {
				case 'ShiftLeft':
				case 'ShiftRight': this.movementSpeedMultiplier = .1; break;

				case 'KeyW': this.moveState.forward = 1; break;
				case 'KeyS': this.moveState.back = 1; break;

				case 'KeyA': this.moveState.left = 1; break;
				case 'KeyD': this.moveState.right = 1; break;

				case 'KeyR': this.moveState.up = 1; break;
				case 'KeyF': this.moveState.down = 1; break;

				case 'ArrowUp': this.moveState.pitchUp = 1; break;
				case 'ArrowDown': this.moveState.pitchDown = 1; break;

				case 'ArrowLeft': this.moveState.yawLeft = 1; break;
				case 'ArrowRight': this.moveState.yawRight = 1; break;

				case 'KeyQ': this.moveState.rollLeft = 1; break;
				case 'KeyE': this.moveState.rollRight = 1; break;
			}

			this.updateMovementVector();
			this.updateRotationVector();
		};

		this.keyup = function(event) {
			if (this.enabled === false) return;

			switch (event.code) {
				case 'ShiftLeft':
				case 'ShiftRight': this.movementSpeedMultiplier = 1; break;

				case 'KeyW': this.moveState.forward = 0; break;
				case 'KeyS': this.moveState.back = 0; break;

				case 'KeyA': this.moveState.left = 0; break;
				case 'KeyD': this.moveState.right = 0; break;

				case 'KeyR': this.moveState.up = 0; break;
				case 'KeyF': this.moveState.down = 0; break;

				case 'ArrowUp': this.moveState.pitchUp = 0; break;
				case 'ArrowDown': this.moveState.pitchDown = 0; break;

				case 'ArrowLeft': this.moveState.yawLeft = 0; break;
				case 'ArrowRight': this.moveState.yawRight = 0; break;

				case 'KeyQ': this.moveState.rollLeft = 0; break;
				case 'KeyE': this.moveState.rollRight = 0; break;
			}

			this.updateMovementVector();
			this.updateRotationVector();
		};

		this.pointerdown = function(event) {
			if (this.enabled === false) return;

			if (this.dragToLook) {
				this.mouseStatus++;
			} else {
				switch (event.button) {
					case 0: this.moveState.forward = 1; break;
					case 2: this.moveState.back = 1; break;
				}

				this.updateMovementVector();
			}
		};

		this.pointermove = function(event) {
			if (this.enabled === false) return;

			if (!this.dragToLook || this.mouseStatus > 0) {
				const container = this.getContainerDimensions();
				const halfWidth = container.size[0] / 2;
				const halfHeight = container.size[1] / 2;

				this.moveState.yawLeft = -((event.pageX - container.offset[0]) - halfWidth) / halfWidth;
				this.moveState.pitchDown = ((event.pageY - container.offset[1]) - halfHeight) / halfHeight;

				this.updateRotationVector();
			}
		};

		this.pointerup = function(event) {
			if (this.enabled === false) return;

			if (this.dragToLook) {
				this.mouseStatus--;

				this.moveState.yawLeft = this.moveState.pitchDown = 0;
			} else {
				switch (event.button) {
					case 0: this.moveState.forward = 0; break;
					case 2: this.moveState.back = 0; break;
				}

				this.updateMovementVector();
			}

			this.updateRotationVector();
		};

		this.contextMenu = function(event) {
			if (this.enabled === false) return;
			event.preventDefault();
		};

		this.update = function(delta = 0.0166) {
			if (this.enabled === false) return;

			const moveMult = delta * this.movementSpeed / 0.0166;
			const rotMult = delta * this.rollSpeed / 0.0166;

			tempVector.set(1, 0, 0).applyQuaternion(this.object.quaternion).multiplyScalar(this.moveVector.x * moveMult);
			this.object.position.add(tempVector);
			tempVector.set(0, 1, 0).applyQuaternion(this.object.quaternion).multiplyScalar(this.moveVector.y * moveMult);
			this.object.position.add(tempVector);
			tempVector.set(0, 0, 1).applyQuaternion(this.object.quaternion).multiplyScalar(this.moveVector.z * moveMult);
			this.object.position.add(tempVector);

			this.tmpQuaternion.set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1).normalize();
			this.object.quaternion.multiply(this.tmpQuaternion);

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

		this.updateMovementVector = function() {
			const forward = (this.moveState.forward || (this.autoForward && !this.moveState.back)) ? 1 : 0;

			this.moveVector.x = (-this.moveState.left + this.moveState.right);
			this.moveVector.y = (-this.moveState.down + this.moveState.up);
			this.moveVector.z = (-forward + this.moveState.back);

			// console.log('move:', [this.moveVector.x, this.moveVector.y, this.moveVector.z]);
		};

		this.updateRotationVector = function() {
			this.rotationVector.x = (-this.moveState.pitchDown + this.moveState.pitchUp);
			this.rotationVector.y = (-this.moveState.yawRight + this.moveState.yawLeft);
			this.rotationVector.z = (-this.moveState.rollRight + this.moveState.rollLeft);

			// console.log('rotate:', [this.rotationVector.x, this.rotationVector.y, this.rotationVector.z]);
		};

		this.getContainerDimensions = function() {
			if (this.domElement != document) {
				return {
					size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
					offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
				};
			} else {
				return {
					size: [window.innerWidth, window.innerHeight],
					offset: [0, 0]
				};
			}
		};

		this.dispose = function() {
			this.domElement.removeEventListener('contextmenu', _contextmenu);
			this.domElement.removeEventListener('pointerdown', _pointerdown);
			this.domElement.removeEventListener('pointermove', _pointermove);
			this.domElement.removeEventListener('pointerup', _pointerup);

			window.removeEventListener('keydown', _keydown);
			window.removeEventListener('keyup', _keyup);
		};

		const _contextmenu = this.contextMenu.bind(this);
		const _pointermove = this.pointermove.bind(this);
		const _pointerdown = this.pointerdown.bind(this);
		const _pointerup = this.pointerup.bind(this);
		const _keydown = this.keydown.bind(this);
		const _keyup = this.keyup.bind(this);

		this.domElement.addEventListener('contextmenu', _contextmenu);
		this.domElement.addEventListener('mousemove', _pointermove);
		this.domElement.addEventListener('mousedown', _pointerdown);
		this.domElement.addEventListener('mouseup', _pointerup);

		window.addEventListener('keydown', _keydown);
		window.addEventListener('keyup', _keyup);

		this.updateMovementVector();
		this.updateRotationVector();
	}

}

export { FlyControls };