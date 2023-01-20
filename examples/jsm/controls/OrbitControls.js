import {
	Quaternion,
	Spherical,
	Vector2,
	Vector3
} from 't3d';

// Modified from https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js
// At present, the 'Dolly' operation does not affect the effect of the orthographic camera,
// because OrbitControls does not change the camera's projection matrix.

// This set of controls performs orbiting, dollying, and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Dolly - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or arrow keys / touch: two-finger move

class OrbitControls {

	constructor(object, domElement) {
		this.object = object;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; // disable touch scroll

		// Set to false to disable this control
		this.enabled = true;

		// "target" sets the location of focus, where the object orbits around
		this.target = new Vector3();

		// The orbit axis
		this.up = new Vector3(0, 1, 0);

		// How far you can dolly in and out
		this.minDistance = 0;
		this.maxDistance = Infinity;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.minPolarAngle = 0; // radians
		this.maxPolarAngle = Math.PI; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
		this.minAzimuthAngle = -Infinity; // radians
		this.maxAzimuthAngle = Infinity; // radians

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.enableDamping = true;
		this.dampingFactor = 0.1;

		// This option enables dollying in and out.
		// Set to false to disable dollying
		this.enableDollying = true;
		this.dollyingSpeed = 1.0;

		// Set to false to disable rotating
		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.enablePan = true;
		this.panSpeed = 1.0;
		this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

		// Set to true to automatically rotate around the target
		// If auto-rotate is enabled, you must call controls.update() in your animation loop
		this.autoRotate = false;
		this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

		// The four arrow keys
		this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

		// Mouse buttons
		this.mouseButtons = { ORBIT: 0, DOLLY: 1, PAN: 2 };

		// Touch fingers
		this.touches = { ORBIT: 1, DOLLY_PAN: 2 };

		// for reset
		this.target0 = this.target.clone();
		this.position0 = this.object.position.clone();

		// the target DOM element for key events
		this._domElementKeyEvents = null;

		//
		// public methods
		//

		this.getPolarAngle = function () {
			return spherical.phi;
		};

		this.getAzimuthalAngle = function () {
			return spherical.theta;
		};

		this.listenToKeyEvents = function (domElement) {
			domElement.addEventListener('keydown', onKeyDown);
			scope._domElementKeyEvents = domElement;
		};

		this.saveState = function () {
			scope.target0.copy(scope.target);
			scope.position0.copy(scope.object.position);
		};

		this.reset = function () {
			scope.target.copy(scope.target0);
			scope.object.position.copy(scope.position0);

			// scope.update();

			state = STATE.NONE;
		};

		this.update = function() {
			const offset = new Vector3();

			const yAxis = new Vector3(0, 1, 0);
			const quat = new Quaternion();
			const quatInverse = quat.clone();

			const lastPosition = new Vector3();
			const lastQuaternion = new Quaternion();

			const twoPI = 2 * Math.PI;

			return function update() {
				quat.setFromUnitVectors(scope.up, yAxis);
				quatInverse.copy(quat).conjugate();

				const position = scope.object.position;

				offset.copy(position).sub(scope.target);

				// rotate offset to "y-axis-is-up" space
				offset.applyQuaternion(quat);

				// angle from z-axis around y-axis
				spherical.setFromVector3(offset);

				if (scope.autoRotate && state === STATE.NONE) {
					rotateLeft(getAutoRotationAngle());
				}

				if (scope.enableDamping) {
					spherical.theta += sphericalDelta.theta * scope.dampingFactor;
					spherical.phi += sphericalDelta.phi * scope.dampingFactor;
				} else {
					spherical.theta += sphericalDelta.theta;
					spherical.phi += sphericalDelta.phi;
				}

				// restrict theta to be between desired limits

				let min = scope.minAzimuthAngle;
				let max = scope.maxAzimuthAngle;

				if (isFinite(min) && isFinite(max)) {
					if (min < -Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;

					if (max < -Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

					if (min <= max) {
						spherical.theta = Math.max(min, Math.min(max, spherical.theta));
					} else {
						spherical.theta = (spherical.theta > (min + max) / 2) ?
							Math.max(min, spherical.theta) :
							Math.min(max, spherical.theta);
					}
				}

				// restrict phi to be between desired limits
				spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

				spherical.makeSafe();

				spherical.radius *= scale;

				// restrict radius to be between desired limits
				spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

				// move target to panned location

				if (scope.enableDamping === true) {
					scope.target.addScaledVector(panOffset, scope.dampingFactor);
				} else {
					scope.target.add(panOffset);
				}

				offset.setFromSpherical(spherical);

				// rotate offset back to "camera-up-vector-is-up" space
				offset.applyQuaternion(quatInverse);

				position.copy(scope.target).add(offset);

				scope.object.lookAt(scope.target, scope.up);

				if (scope.enableDamping === true) {
					sphericalDelta.theta *= (1 - scope.dampingFactor);
					sphericalDelta.phi *= (1 - scope.dampingFactor);

					panOffset.multiplyScalar(1 - scope.dampingFactor);
				} else {
					sphericalDelta.set(0, 0, 0);

					panOffset.set(0, 0, 0);
				}

				scale = 1;

				// update condition is:
				// min(camera displacement, camera rotation in radians)^2 > EPS
				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

				if (lastPosition.distanceToSquared(scope.object.position) > EPS ||
                8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
					lastPosition.copy(scope.object.position);
					lastQuaternion.copy(scope.object.quaternion);

					return true;
				}

				return false;
			}
		}();

		this.dispose = function() {
			scope.domElement.removeEventListener('contextmenu', onContextMenu);

			scope.domElement.removeEventListener('pointerdown', onPointerDown);
			scope.domElement.removeEventListener('pointercancel', onPointerCancel);
			scope.domElement.removeEventListener('wheel', onMouseWheel);

			scope.domElement.removeEventListener('pointermove', onPointerMove);
			scope.domElement.removeEventListener('pointerup', onPointerUp);

			if (scope._domElementKeyEvents !== null) {
				scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
			}
		};

		//
		// internals
		//

		const scope = this;

		const STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };

		let state = STATE.NONE;

		const EPS = 0.000001;

		// current position in spherical coordinates
		const spherical = new Spherical();
		const sphericalDelta = new Spherical();

		let scale = 1;
		const panOffset = new Vector3();

		const rotateStart = new Vector2();
		const rotateEnd = new Vector2();
		const rotateDelta = new Vector2();

		const panStart = new Vector2();
		const panEnd = new Vector2();
		const panDelta = new Vector2();

		const dollyStart = new Vector2();
		const dollyEnd = new Vector2();
		const dollyDelta = new Vector2();

		const pointers = [];
		const pointerPositions = {};

		function getAutoRotationAngle() {
			return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
		}

		function getDollyingScale() {
			return Math.pow(0.95, scope.dollyingSpeed);
		}

		function rotateLeft(angle) {
			sphericalDelta.theta -= angle;
		}

		function rotateUp(angle) {
			sphericalDelta.phi -= angle;
		}

		const panLeft = function () {
			const v = new Vector3();

			return function panLeft(distance, objectMatrix) {
				v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
				v.multiplyScalar(-distance);

				panOffset.add(v);
			};
		}();

		const panUp = function () {
			const v = new Vector3();

			return function panUp(distance, objectMatrix) {
				if (scope.screenSpacePanning === true) {
					v.setFromMatrixColumn(objectMatrix, 1);
				} else {
					v.setFromMatrixColumn(objectMatrix, 0);
					v.crossVectors(scope.up, v);
				}

				v.multiplyScalar(distance);

				panOffset.add(v);
			};
		}();

		// deltaX and deltaY are in pixels; right and down are positive
		const pan = function () {
			const offset = new Vector3();

			const p = new Vector3();

			return function pan(deltaX, deltaY) {
				const element = scope.domElement;

				const position = scope.object.position;
				offset.copy(position).sub(scope.target);
				const targetDistance = offset.getLength();

				const depth = p.set(0, 0, targetDistance).applyMatrix4(scope.object.projectionMatrix).z;

				// full-screen to world distance
				let distance = p.set(0, -1, depth).applyMatrix4(scope.object.projectionMatrixInverse).y;
				// distance *= 2;

				// we use only clientHeight here so aspect ratio does not distort speed
				panLeft(2 * deltaX * distance / element.clientHeight, scope.object.matrix);
				panUp(2 * deltaY * distance / element.clientHeight, scope.object.matrix);
			};
		}();

		function dollyOut(dollyScale) {
			scale /= dollyScale;
		}

		function dollyIn(dollyScale) {
			scale *= dollyScale;
		}

		//
		// event callbacks - update the object state
		//

		function handleMouseDownRotate(event) {
			rotateStart.set(event.clientX, event.clientY);
		}

		function handleMouseDownDolly(event) {
			dollyStart.set(event.clientX, event.clientY);
		}

		function handleMouseDownPan(event) {
			panStart.set(event.clientX, event.clientY);
		}

		function handleMouseMoveRotate(event) {
			rotateEnd.set(event.clientX, event.clientY);

			rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

			const element = scope.domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // use clientHeight to prevent aspect from affecting rotate speed

			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

			rotateStart.copy(rotateEnd);
		}

		function handleMouseMoveDolly(event) {
			dollyEnd.set(event.clientX, event.clientY);

			dollyDelta.subVectors(dollyEnd, dollyStart);

			if (dollyDelta.y > 0) {
				dollyOut(getDollyingScale());
			} else if (dollyDelta.y < 0) {
				dollyIn(getDollyingScale());
			}

			dollyStart.copy(dollyEnd);
		}

		function handleMouseMovePan(event) {
			panEnd.set(event.clientX, event.clientY);

			panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

			pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);
		}

		function handleMouseWheel(event) {
			if (event.deltaY < 0) {
				dollyIn(getDollyingScale());
			} else if (event.deltaY > 0) {
				dollyOut(getDollyingScale());
			}
		}

		function handleKeyDown(event) {
			let needsUpdate = false;

			switch (event.keyCode) {
				case scope.keys.UP:
					pan(0, scope.keyPanSpeed);
					needsUpdate = true;
					break;

				case scope.keys.BOTTOM:
					pan(0, -scope.keyPanSpeed);
					needsUpdate = true;
					break;

				case scope.keys.LEFT:
					pan(scope.keyPanSpeed, 0);
					needsUpdate = true;
					break;

				case scope.keys.RIGHT:
					pan(-scope.keyPanSpeed, 0);
					needsUpdate = true;
					break;
			}

			if (needsUpdate) {
				event.preventDefault(); // prevent the browser from scrolling on cursor keys
				// scope.update();
			}
		}

		function handleTouchStartRotate() {
			if (pointers.length === 1) {
				rotateStart.set(pointers[0].pageX, pointers[0].pageY);
			} else {
				const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				rotateStart.set(x, y);
			}
		}

		function handleTouchStartPan() {
			if (pointers.length === 1) {
				panStart.set(pointers[0].pageX, pointers[0].pageY);
			} else {
				const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
				const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

				panStart.set(x, y);
			}
		}

		function handleTouchStartDolly() {
			const dx = pointers[0].pageX - pointers[1].pageX;
			const dy = pointers[0].pageY - pointers[1].pageY;

			const distance = Math.sqrt(dx * dx + dy * dy);

			dollyStart.set(0, distance);
		}

		function handleTouchStartDollyPan() {
			if (scope.enableDollying) handleTouchStartDolly();
			if (scope.enablePan) handleTouchStartPan();
		}

		function handleTouchMoveRotate(event) {
			if (pointers.length == 1) {
				rotateEnd.set(event.pageX, event.pageY);
			} else {
				const position = getSecondPointerPosition(event);

				const x = 0.5 * (event.pageX + position.x);
				const y = 0.5 * (event.pageY + position.y);

				rotateEnd.set(x, y);
			}

			rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

			const element = scope.domElement;

			rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight);  // prevent the browser from scrolling on cursor keys

			rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

			rotateStart.copy(rotateEnd);
		}

		function handleTouchMovePan(event) {
			if (pointers.length === 1) {
				panEnd.set(event.pageX, event.pageY);
			} else {
				const position = getSecondPointerPosition(event);

				const x = 0.5 * (event.pageX + position.x);
				const y = 0.5 * (event.pageY + position.y);

				panEnd.set(x, y);
			}

			panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

			pan(panDelta.x, panDelta.y);

			panStart.copy(panEnd);
		}

		function handleTouchMoveDolly(event) {
			const position = getSecondPointerPosition(event);

			const dx = event.pageX - position.x;
			const dy = event.pageY - position.y;

			const distance = Math.sqrt(dx * dx + dy * dy);

			dollyEnd.set(0, distance);

			dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.dollyingSpeed));

			dollyOut(dollyDelta.y);

			dollyStart.copy(dollyEnd);
		}

		function handleTouchMoveDollyPan(event) {
			if (scope.enableDollying) handleTouchMoveDolly(event);
			if (scope.enablePan) handleTouchMovePan(event);
		}

		//
		// event handlers - FSM: listen for events and reset state
		//

		function onPointerDown(event) {
			if (scope.enabled === false) return;

			if (pointers.length === 0) {
				scope.domElement.setPointerCapture(event.pointerId);

				scope.domElement.addEventListener('pointermove', onPointerMove);
				scope.domElement.addEventListener('pointerup', onPointerUp);
			}

			//

			addPointer(event);

			if (event.pointerType === 'touch') {
				onTouchStart(event);
			} else {
				onMouseDown(event);
			}
		}

		function onPointerMove(event) {
			if (scope.enabled === false) return;

			if (event.pointerType === 'touch') {
				onTouchMove(event);
			} else {
				onMouseMove(event);
			}
		}

		function onPointerUp(event) {
			removePointer(event);

			if (pointers.length === 0) {
				scope.domElement.releasePointerCapture(event.pointerId);

				scope.domElement.removeEventListener('pointermove', onPointerMove);
				scope.domElement.removeEventListener('pointerup', onPointerUp);
			}

			state = STATE.NONE;
		}

		function onPointerCancel(event) {
			removePointer(event);
		}

		function onMouseDown(event) {
			switch (event.button) {
				case scope.mouseButtons.ORBIT:
					if (scope.enableRotate === false) return;
					handleMouseDownRotate(event);
					state = STATE.ROTATE;
					break;
				case scope.mouseButtons.DOLLY:
					if (scope.enableDollying === false) return;
					handleMouseDownDolly(event);
					state = STATE.DOLLY;
					break;
				case scope.mouseButtons.PAN:
					if (scope.enablePan === false) return;
					handleMouseDownPan(event);
					state = STATE.PAN;
					break;
			}
		}

		function onMouseMove(event) {
			switch (state) {
				case STATE.ROTATE:
					if (scope.enableRotate === false) return;
					handleMouseMoveRotate(event);
					// scope.update();
					break;
				case STATE.DOLLY:
					if (scope.enableDollying === false) return;
					handleMouseMoveDolly(event);
					// scope.update();
					break;
				case STATE.PAN:
					if (scope.enablePan === false) return;
					handleMouseMovePan(event);
					// scope.update();
					break;
			}
		}

		function onMouseWheel(event) {
			if (scope.enabled === false || scope.enableDollying === false || state !== STATE.NONE) return;

			event.preventDefault();

			handleMouseWheel(event);

			// scope.update();
		}

		function onKeyDown(event) {
			if (scope.enabled === false || scope.enablePan === false) return;

			handleKeyDown(event);
		}

		function onTouchStart(event) {
			trackPointer(event);

			switch (pointers.length) {
				case scope.touches.ORBIT:
					if (scope.enableRotate === false) return;
					handleTouchStartRotate(event);
					state = STATE.TOUCH_ROTATE;
					break;
				case scope.touches.DOLLY_PAN:
					if (scope.enableDollying === false && scope.enablePan === false) return;
					handleTouchStartDollyPan(event);
					state = STATE.TOUCH_DOLLY_PAN;
					break;
				default:
					state = STATE.NONE;
			}
		}

		function onTouchMove(event) {
			trackPointer(event);

			switch (state) {
				case STATE.TOUCH_ROTATE:
					if (scope.enableRotate === false) return;
					handleTouchMoveRotate(event);
					// scope.update();
					break;
				case STATE.TOUCH_DOLLY_PAN:
					if (scope.enableDollying === false && scope.enablePan === false) return;
					handleTouchMoveDollyPan(event);
					// scope.update();
					break;
				default:
					state = STATE.NONE;
			}
		}

		function onContextMenu(event) {
			if (scope.enabled === false) return;

			event.preventDefault();
		}

		function addPointer(event) {
			pointers.push(event);
		}

		function removePointer(event) {
			delete pointerPositions[event.pointerId];

			for (let i = 0; i < pointers.length; i++) {
				if (pointers[i].pointerId == event.pointerId) {
					pointers.splice(i, 1);
					return;
				}
			}
		}

		function trackPointer(event) {
			let position = pointerPositions[event.pointerId];

			if (position === undefined) {
				position = new Vector2();
				pointerPositions[event.pointerId] = position;
			}

			position.set(event.pageX, event.pageY);
		}

		function getSecondPointerPosition(event) {
			const pointer = (event.pointerId === pointers[0].pointerId) ? pointers[1] : pointers[0];

			return pointerPositions[pointer.pointerId];
		}

		//

		scope.domElement.addEventListener('contextmenu', onContextMenu);

		scope.domElement.addEventListener('pointerdown', onPointerDown);
		scope.domElement.addEventListener('pointercancel', onPointerCancel);
		scope.domElement.addEventListener('wheel', onMouseWheel, { passive: false });

		// force an update at start

		this.update();
	}

}

export { OrbitControls };