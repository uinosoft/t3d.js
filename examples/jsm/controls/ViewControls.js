import { Vector3, Quaternion, Euler, MathUtils, Object3D } from 't3d';

class ViewControls {

	constructor(camera, options) {
		this.camera = camera;

		this.target = options.target || new Vector3(0, 0, 0);
		this.up = options.up || new Vector3(0, 1, 0);

		this.interactive = options.interactive !== undefined ? options.interactive : true;

		this.size = options.size || 100;

		this.padding = options.padding || 10;
		this.pointRadius = options.pointRadius || 10;

		this.font = options.font || 'bold 16px Arial';
		this.fontColor = options.fontColor || '#ffffff';

		this.lineWidth = options.lineWidth || 2;

		const canvas = document.createElement('canvas');
		canvas.width = this.size;
		canvas.height = this.size;
		canvas.style.cssText = options.style || 'position:fixed;top:0;right:0;opacity:0.9;z-index:10000;user-select:none;';

		this.domElement = canvas;

		this._context = canvas.getContext('2d', { alpha: true });

		this._points = [
			{ axisIndex: 0, position: new Vector3(0, 0, 0), linePosition: new Vector3(0, 0, 0) },
			{ axisIndex: 0, position: new Vector3(0, 0, 0), linePosition: new Vector3(0, 0, 0) },
			{ axisIndex: 0, position: new Vector3(0, 0, 0), linePosition: new Vector3(0, 0, 0) },
			{ axisIndex: 0, position: new Vector3(0, 0, 0), linePosition: new Vector3(0, 0, 0) },
			{ axisIndex: 0, position: new Vector3(0, 0, 0), linePosition: new Vector3(0, 0, 0) },
			{ axisIndex: 0, position: new Vector3(0, 0, 0), linePosition: new Vector3(0, 0, 0) }
		];

		this._animating = false;
		this._targetPosition = new Vector3();
		this._targetQuaternion = new Quaternion();
		this._q1 = new Quaternion();
		this._q2 = new Quaternion();
		this._lastQuaternion = new Quaternion();

		this.needsUpdate = true;

		const scope = this;

		this._onContextMenu = function(event) { event.preventDefault() };

		let isDragging = false;
		let pointerDownPosition = null;
		this._onPointerDown = function(event) {
			if (!scope.interactive) return;
			isDragging = false;
			pointerDownPosition = { x: event.clientX, y: event.clientY };
		};
		this._onPointerMove = function(event) {
			if (!scope.interactive) return;
			if (pointerDownPosition) {
				const dx = event.clientX - pointerDownPosition.x;
				const dy = event.clientY - pointerDownPosition.y;
				if (dx * dx + dy * dy > 20) {
					isDragging = true;
				}
			}
		};
		this._onPointerUp = function(event) {
			if (!scope.interactive) return;
			if (!isDragging && !scope._animating) {
				const pointer = event.changedTouches ? event.changedTouches[0] : event;
				const point = scope._raycast(pointer);
				if (point) {
					scope._prepareAnimationData(point.axisIndex);
					scope._animating = true;
				}
			}
			pointerDownPosition = null;
		};

		this.domElement.addEventListener('contextmenu', this._onContextMenu);
		this.domElement.addEventListener('pointerdown', this._onPointerDown);
		this.domElement.addEventListener('pointermove', this._onPointerMove);
		this.domElement.addEventListener('pointerup', this._onPointerUp);
	}

	dispose() {
		this.domElement.removeEventListener('contextmenu', this._onContextMenu);
		this.domElement.removeEventListener('pointerdown', this._onPointerDown);
		this.domElement.removeEventListener('pointermove', this._onPointerMove);
		this.domElement.removeEventListener('pointerup', this._onPointerUp);
	}

	update(delta) {
		const camera = this.camera;

		// update canvas

		if (1 - this._lastQuaternion.dot(camera.quaternion) > 0.00001 || this.needsUpdate) {
			this._lastQuaternion.copy(camera.quaternion);
			this.needsUpdate = false;

			const halfSize = this.size / 2;

			for (let i = 0; i < _axisPoints.length; i++) {
				const _axisPoint = _axisPoints[i];
				const _point = this._points[i];

				_point.axisIndex = i;

				_quat_1.copy(camera.quaternion).conjugate();
				const distance = halfSize - this.pointRadius - this.padding;
				const distance2 = Math.max(halfSize - this.pointRadius * 2 - this.padding, 0.0001);
				_point.position.copy(_axisPoint.direction).multiplyScalar(distance).applyQuaternion(_quat_1);
				_point.linePosition.copy(_axisPoint.direction).multiplyScalar(distance2).applyQuaternion(_quat_1);

				_point.position.x = _point.position.x + halfSize;
				_point.position.y = -_point.position.y + halfSize;

				_point.linePosition.x = _point.linePosition.x + halfSize;
				_point.linePosition.y = -_point.linePosition.y + halfSize;
			}

			this._points.sort(depthSort);

			// clear canvas
			this._context.clearRect(0, 0, this.size, this.size);

			this._context.textAlign = 'center';
			this._context.textBaseline = 'middle';

			// draw front points
			for (let i = 0; i < 3; i++) {
				const point = this._points[i];
				this._drawPoint(point, _axisPoints[point.axisIndex]);
			}

			// draw lines
			for (let i = 0; i < 6; i++) {
				const _point = this._points[i];
				if (_point.axisIndex % 2 === 0) {
					this._drawLine(_point, _axisPoints[_point.axisIndex]);
				}
			}

			// draw back points
			for (let i = 3; i < 6; i++) {
				const point = this._points[i];
				this._drawPoint(point, _axisPoints[point.axisIndex]);
			}
		}

		// animate

		if (this._animating) {
			const step = delta * twoPI;

			rotateTowards(this._q2, step, this._q1);

			const radius = camera.position.distanceTo(this.target);
			camera.position.set(0, 0, 1).applyQuaternion(this._q1).multiplyScalar(radius).add(this.target);
			rotateTowards(this._targetQuaternion, step, camera.quaternion);

			if (angleTo(this._q1, this._q2) === 0) {
				this._animating = false;
			}
		}
	}

	_drawPoint(point, axisPoint) {
		const context = this._context;

		context.fillStyle = axisPoint.color;
		context.beginPath();
		context.arc(point.position.x, point.position.y, this.pointRadius, 0, twoPI);
		context.fill();

		context.fillStyle = this.fontColor;
		context.font = this.font;
		context.fillText(axisPoint.name, point.position.x, point.position.y);
	}

	_drawLine(point, axisPoint) {
		const context = this._context;
		const halfSize = this.size / 2;

		context.strokeStyle = axisPoint.color;
		context.lineWidth = this.lineWidth;
		context.lineCap = 'round';
		context.beginPath();
		context.moveTo(halfSize, halfSize);
		context.lineTo(point.linePosition.x, point.linePosition.y);
		context.stroke();
	}

	_raycast(event) {
		const rect = this.domElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		for (let i = this._points.length - 1; i >= 0; i--) {
			const _point = this._points[i];
			const distance = _point.position.distanceTo(_vec3_1.set(x, y, _point.position.z));
			if (distance <= this.pointRadius) {
				return _point;
			}
		}

		return null;
	}

	_prepareAnimationData(axisIndex) {
		const camera = this.camera;
		const target = this.target;
		const up = this.up;

		const targetPosition = this._targetPosition;
		const targetQuaternion = this._targetQuaternion;
		const q1 = this._q1;
		const q2 = this._q2;

		targetPosition.copy(_axisPoints[axisIndex].direction);
		targetQuaternion.setFromEuler(_rotationTargets[axisIndex]);

		const radius = camera.position.distanceTo(target);
		targetPosition.multiplyScalar(radius).add(target);

		dummy.position.copy(target);

		dummy.lookAt(camera.position, up);
		q1.copy(dummy.quaternion);

		dummy.lookAt(targetPosition, up);
		q2.copy(dummy.quaternion);
	}

}

const _axisPoints = [
	{ name: 'x', color: '#ff3653', direction: new Vector3(1, 0, 0) },
	{ name: '-x', color: '#ff3653', direction: new Vector3(-1, 0, 0) },
	{ name: 'y', color: '#8adb00', direction: new Vector3(0, 1, 0) },
	{ name: '-y', color: '#8adb00', direction: new Vector3(0, -1, 0) },
	{ name: 'z', color: '#2c8fff', direction: new Vector3(0, 0, 1) },
	{ name: '-z', color: '#2c8fff', direction: new Vector3(0, 0, -1) }
];

const _rotationTargets = [
	new Euler(0, Math.PI * 0.5, 0),
	new Euler(0, -Math.PI * 0.5, 0),
	new Euler(-Math.PI * 0.5, 0, 0),
	new Euler(Math.PI * 0.5, 0, 0),
	new Euler(),
	new Euler(0, Math.PI, 0)
];

const twoPI = Math.PI * 2;

const _vec3_1 = new Vector3();
const _quat_1 = new Quaternion();

function depthSort(a, b) {
	return a.position.z - b.position.z;
}

const dummy = new Object3D();

function rotateTowards(q, step, target) {
	const angle = angleTo(target, q);
	if (angle === 0) return target;
	const t = Math.min(1, step / angle);
	target.slerpQuaternions(target, q, t);
	return target;
}

function angleTo(q1, q2) {
	return 2 * Math.acos(Math.abs(MathUtils.clamp(q1.dot(q2), -1, 1)));
}

export { ViewControls };