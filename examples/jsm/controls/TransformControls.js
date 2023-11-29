import {
	Object3D, Vector2, Vector3, Euler, Plane, Matrix4, Quaternion, Sphere,
	Mesh, BasicMaterial, CylinderGeometry, PlaneGeometry, BoxGeometry, SphereGeometry, Geometry, Attribute, Buffer, DRAW_SIDE, DRAW_MODE
} from 't3d';
import { TorusBuilder } from '../geometries/builders/TorusBuilder.js';
import { VirtualGroup } from '../math/VirtualGroup.js';
import { Raycaster } from '../Raycaster.js';

// TODO: Support snapping
// TODO: Optimize gizmo picking
// TODO: Optimize xyz rotate
class TransformControls extends Object3D {

	constructor(camera, domElement) {
		super();

		const group = new VirtualGroup();

		const controlMap = new Map();

		const translateControl = new TranslateControl(camera, group);
		const scaleControl = new ScaleControl(camera, group);
		const rotateControl = new RotateControl(camera, group);

		controlMap.set('translate', translateControl);
		controlMap.set('scale', scaleControl);
		controlMap.set('rotate', rotateControl);

		this.add(translateControl);
		this.add(scaleControl);
		this.add(rotateControl);

		this._domElement = domElement;

		this._mode = '';
		this._camera = camera;
		this._group = group;
		this._controlMap = controlMap;

		this._currentControl = [];
		this._currentDraggingControl = null;
		this._currentHoverControl = null;

		this._raycaster = new Raycaster();

		this.mode = 'translate';

		this._onPointDown = this._onPointDown.bind(this);
		this._onPointMove = this._onPointMove.bind(this);
		this._onPointUp = this._onPointUp.bind(this);

		this._addEventListeners();
	}

	get group() {
		return this._group;
	}

	// 'translate' | 'scale' | 'rotate' | 'all'
	set mode(value) {
		if (this._mode === value) return;

		this._mode = value;

		this._currentControl = [];
		if (value === 'all') {
			this._controlMap.forEach(control => {
				this._currentControl.push(control);
				control.visible = true;
			});
		} else {
			this._controlMap.forEach((control, key) => {
				if (key === value) {
					this._currentControl.push(control);
					control.visible = true;
				} else {
					control.visible = false;
				}
			});
		}
	}

	get mode() {
		return this._mode;
	}

	set size(value) {
		this._controlMap.forEach(control => control.size = value);
	}

	get size() {
		return this._controlMap.get('translate').size;
	}

	isDragging() {
		return !!this._currentDraggingControl;
	}

	update() {
		const isModify = this._mode === 'all';
		this._controlMap.forEach(control => control.update(isModify));
	}

	dispose() {
		this._removeEventListeners();

		this.traverse(child => {
			if (child.isMesh) {
				child.geometry.dispose();
				child.material.dispose();
			}
		});

		this._group.reset();
	}

	_addEventListeners() {
		const element = this._domElement;
		element.addEventListener('pointerdown', this._onPointDown);
		element.addEventListener('pointermove', this._onPointMove);
		element.addEventListener('pointerup', this._onPointUp);
	}

	_removeEventListeners() {
		const element = this._domElement;
		element.removeEventListener('pointerdown', this._onPointDown);
		element.removeEventListener('pointermove', this._onPointMove);
		element.removeEventListener('pointerup', this._onPointUp);
	}

	_onPointDown(e) {
		const selectedObject = this._selectGizmoMesh(e.clientX, e.clientY);
		if (selectedObject) {
			this._triggerGizmoStart(selectedObject.parent.name, selectedObject.name);
		}
	}

	_onPointMove(e) {
		if (!this._currentDraggingControl) {
			this._onGizmoHoverEnd();

			const selectedObject = this._selectGizmoMesh(e.clientX, e.clientY);
			if (selectedObject) {
				this._onGizmoHoverStart(selectedObject.parent.name, selectedObject.name);
			}
		} else {
			if (this._mode === 'all') {
				this._controlMap.forEach(control => {
					if (control !== this._currentDraggingControl) control.visible = false;
				});
			}

			this._setRaycaster(e.clientX, e.clientY);
			this._currentDraggingControl.onMove(this._raycaster.ray);
		}
	}

	_onPointUp(e) {
		if (this._currentDraggingControl) {
			this._triggerGizmoEnd();

			if (this._mode === 'all') {
				this._controlMap.forEach(control => control.visible = true);
			}
		}
	}

	_setRaycaster(clientX, clientY) {
		const element = this._domElement;

		_vec2_1.x = (clientX / element.clientWidth) * 2 - 1;
		_vec2_1.y = -(clientY / element.clientHeight) * 2 + 1;

		this._raycaster.setFromCamera(_vec2_1, this._camera);
	}

	_selectGizmoMesh(clientX, clientY) {
		this._setRaycaster(clientX, clientY);

		const array = this._raycaster.intersectObjects(this._currentControl, true);

		if (array.length === 0) return null;

		let selectedObject = array[0].object;

		// rotate xyz has lower priority
		if (array.length > 1) {
			for (let i = 0; i < array.length; i++) {
				const object = array[i].object;
				if (object.name !== 'xyz' || object.parent.name !== 'rotate') {
					selectedObject = object;
					break;
				}
			}
		}

		return selectedObject;
	}

	_onGizmoHoverEnd() {
		if (this._currentHoverControl) {
			this._currentHoverControl.onHoverEnd();
			this._currentHoverControl = null;
		}
	}

	_onGizmoHoverStart(currentType, axisName) {
		if (!this._currentHoverControl) {
			this._currentHoverControl = this._controlMap.get(currentType);
			this._currentHoverControl.onHoverStart(axisName);
		}
	}

	_triggerGizmoStart(currentType, axisName) {
		this._onGizmoHoverEnd();
		this._currentDraggingControl = this._controlMap.get(currentType);
		this._currentDraggingControl.onMoveStart(this._raycaster.ray, axisName);
	}

	_triggerGizmoEnd() {
		this._currentDraggingControl.onMoveEnd();
		this._currentDraggingControl = null;

		this._group.dirty();
	}

}

// Global variables

const _vec2_1 = new Vector2();

const _vec3_1 = new Vector3();
const _vec3_2 = new Vector3();
const _vec3_3 = new Vector3();

const _mat4_1 = new Matrix4();

const _quat_1 = new Quaternion();

const axisVector = {
	'x': new Vector3(1, 0, 0),
	'y': new Vector3(0, 1, 0),
	'z': new Vector3(0, 0, 1),
	'xyz': new Vector3(1, 1, 1),
	'xy': new Vector3(1, 1, 0),
	'yz': new Vector3(0, 1, 1),
	'xz': new Vector3(1, 0, 1)
};

const axisPlane = {
	'x': new Plane(new Vector3(1, 0, 0), 0),
	'y': new Plane(new Vector3(0, 1, 0), 0),
	'z': new Plane(new Vector3(0, 0, 1), 0),
	'xyz': new Plane(new Vector3(0, 0, 0), 0),
	'xy': new Plane(new Vector3(0, 0, 1), 0),
	'yz': new Plane(new Vector3(1, 0, 0), 0),
	'xz': new Plane(new Vector3(0, 1, 0), 0)
};

// Separate class for each control

class BaseControl extends Object3D {

	constructor(name, camera, group) {
		super();

		this.name = name;

		this._camera = camera;
		this._group = group;

		this.size = 1;
	}

	onHoverStart(axisName) {}

	onHoverEnd() {}

	onMoveStart(ray, axisName) {}

	onMove(ray) {}

	onMoveEnd() {}

	update(isModify) {}

}

class TranslateControl extends BaseControl {

	constructor(camera, group) {
		super('translate', camera, group);

		this._translateControlMap = new Map();
		this._helperMap = new Map();

		this._selectedAxis = null;

		this._scale = 1;

		this._plane = new Plane();
		this._startGroupMatrix = new Matrix4();
		this._startGroupMatrixInverse = new Matrix4();

		this._currPoint = new Vector3();
		this._startPoint = new Vector3();

		this._createAxis();
	}

	_createAxis() {
		const lineX = new GizmoMesh('line', 'x', [1.0, 0.25, 0.25], new Vector3(0.75, 0, 0), new Euler(0, 0, -Math.PI / 2), 1.5);
		const arrowX = new GizmoMesh('arrow', 'x', [1.0, 0.25, 0.25], new Vector3(1.5, 0, 0), new Euler(0, 0, -Math.PI / 2));
		this._translateControlMap.set('x', [lineX, arrowX]);
		this.add(lineX);
		this.add(arrowX);

		const lineY = new GizmoMesh('line', 'y', [0.5, 0.8, 0.2], new Vector3(0, 0.75, 0), new Euler(0, 0, 0), 1.5);
		const arrowY = new GizmoMesh('arrow', 'y', [0.5, 0.8, 0.2], new Vector3(0, 1.5, 0), new Euler(0, 0, 0));
		this._translateControlMap.set('y', [lineY, arrowY]);
		this.add(lineY);
		this.add(arrowY);

		const lineZ = new GizmoMesh('line', 'z', [0.3, 0.5, 1.0], new Vector3(0, 0, 0.75), new Euler(Math.PI / 2, 0, 0), 1.5);
		const arrowZ = new GizmoMesh('arrow', 'z', [0.3, 0.5, 1.0], new Vector3(0, 0, 1.5), new Euler(Math.PI / 2, 0, 0));
		this._translateControlMap.set('z', [lineZ, arrowZ]);
		this.add(lineZ);
		this.add(arrowZ);

		const planeXY = new GizmoMesh('plane', 'xy', [0.3, 0.5, 1.0], new Vector3(0.15, 0.15, 0), new Euler(Math.PI / 2, 0, 0));
		this._translateControlMap.set('xy', [planeXY]);
		this.add(planeXY);

		const planeYZ = new GizmoMesh('plane', 'yz', [1.0, 0.25, 0.25], new Vector3(0, 0.15, 0.15), new Euler(0, 0, Math.PI / 2));
		this._translateControlMap.set('yz', [planeYZ]);
		this.add(planeYZ);

		const planeXZ = new GizmoMesh('plane', 'xz', [0.5, 0.8, 0.2], new Vector3(0.15, 0, 0.15), null);
		this._translateControlMap.set('xz', [planeXZ]);
		this.add(planeXZ);

		const helperX = new GizmoMesh('axishelper', 'x', [1, 1, 0], new Vector3(-1e3, 0, 0), null);
		helperX.visible = false;
		this._helperMap.set('x', helperX);
		this.add(helperX);

		const helperY = new GizmoMesh('axishelper', 'y', [1, 1, 0], new Vector3(0, -1e3, 0), new Euler(0, 0, Math.PI / 2));
		helperY.visible = false;
		this._helperMap.set('y', helperY);
		this.add(helperY);

		const helperZ = new GizmoMesh('axishelper', 'z', [1, 1, 0], new Vector3(0, 0, -1e3), new Euler(0, -Math.PI / 2, 0));
		helperZ.visible = false;
		this._helperMap.set('z', helperZ);
		this.add(helperZ);
	}

	onHoverStart(axisName) {
		this._selectedAxis = axisName;
		const currentAxis = this._translateControlMap.get(this._selectedAxis);
		currentAxis.forEach(axis => axis.highlight());
	}

	onHoverEnd() {
		const currentAxis = this._translateControlMap.get(this._selectedAxis);
		currentAxis.forEach(axis => axis.unhighlight());
		this._selectedAxis = null;
	}

	onMoveStart(ray, axisName) {
		this._selectedAxis = axisName;

		this._group.getWorldMatrix(this._startGroupMatrix);
		this._startGroupMatrixInverse.getInverse(this._startGroupMatrix);

		this._startScale = this._scale;

		this._getHitPlane();
		this._calRayIntersection(ray, this._startPoint);

		this._translateControlMap.forEach((value, key) => {
			if (key === axisName) {
				value.forEach(axis => axis.yellow());
			} else {
				value.forEach(axis => axis.visible = false);
			}
		});
	}

	onMove(ray) {
		this._calRayIntersection(ray, this._currPoint);
		const currScale = this._scale;
		const { _startScale } = this;

		this._helperMap.forEach((value, key) => {
			if (this._selectedAxis.indexOf(key) !== -1) {
				value.visible = true;
			}
		});

		_vec3_1.x = this._currPoint.x - (this._startPoint.x / _startScale) * currScale;
		_vec3_1.y = this._currPoint.y - (this._startPoint.y / _startScale) * currScale;
		_vec3_1.z = this._currPoint.z - (this._startPoint.z / _startScale) * currScale;

		const localAxis = axisVector[this._selectedAxis];

		_mat4_1.identity();
		_mat4_1.elements[12] = _vec3_1.x * localAxis.x;
		_mat4_1.elements[13] = _vec3_1.y * localAxis.y;
		_mat4_1.elements[14] = _vec3_1.z * localAxis.z;

		_mat4_1.premultiply(this._startGroupMatrix);

		this._group.setWorldMatrix(_mat4_1);
	}

	onMoveEnd() {
		this._translateControlMap.forEach(control => {
			control.forEach(axis => {
				axis.material.diffuse.copy(axis.material._color);
				axis.material.opacity = axis.material._opacity;
				axis.visible = true;
			});
		});

		this._helperMap.forEach(value => {
			value.visible = false;
		});
	}

	_getHitPlane() {
		switch (this._selectedAxis) {
			case 'x':
			case 'y':
			case 'z': {
				_vec3_1.setFromMatrixPosition(this._camera.worldMatrix);
				_vec3_1.applyMatrix4(this._startGroupMatrixInverse);
				const localAxis = axisVector[this._selectedAxis];

				_vec3_2.crossVectors(_vec3_1, localAxis);

				this._plane.setFromCoplanarPoints(localAxis, _vec3_1.set(0, 0, 0), _vec3_2);
				break;
			}
			case 'xy':
			case 'yz':
			case 'xz': {
				this._plane.copy(axisPlane[this._selectedAxis]);
				break;
			}
		}
	}

	_calRayIntersection(ray, out) {
		// transform ray to local space
		ray.origin.applyMatrix4(this._startGroupMatrixInverse);
		ray.direction.transformDirection(this._startGroupMatrixInverse);
		ray.intersectPlane(this._plane, out);
	}

	update() {
		this._resizeControl();
	}

	_resizeControl() {
		this._group.getWorldMatrix(_mat4_1);

		const ele = this._camera.projectionMatrix.elements;
		let factor;
		if (ele[15] > 0) {
			factor = 2 / ele[5];
		} else {
			_vec3_1.setFromMatrixPosition(_mat4_1);
			_vec3_2.setFromMatrixPosition(this._camera.worldMatrix);
			factor = _vec3_1.distanceTo(_vec3_2) * Math.min(1.9 / ele[5], 7);
		}
		factor *= this.size / 8;

		this._scale = factor;

		this.worldMatrix.copy(_mat4_1);
		const parentMatrixInverse = _mat4_1.getInverse(this.parent.worldMatrix);
		this.matrix.multiplyMatrices(parentMatrixInverse, this.worldMatrix);
		this.matrix.decompose(this.position, this.quaternion, this.scale);

		this.scale.multiplyScalar(factor);
	}

}

class ScaleControl extends BaseControl {

	constructor(camera, group) {
		super('scale', camera, group);

		this._scaleControlMap = new Map();

		this._selectedAxis = null;

		this._plane = new Plane();
		this._startGroupMatrix = new Matrix4();
		this._startGroupMatrixInverse = new Matrix4();

		this._currPoint = new Vector3();
		this._startPoint = new Vector3();

		this._factorVec = new Vector3();

		this._createAxis();
	}

	_createAxis() {
		const lineX = new GizmoMesh('line', 'x', [1.0, 0.25, 0.25], new Vector3(0.75, 0, 0), new Euler(0, 0, -Math.PI / 2), 1.3);
		const cubeX = new GizmoMesh('box', 'x', [1.0, 0.25, 0.25], new Vector3(1.3, 0, 0), new Euler(0, 0, 0), 0.25);
		this._scaleControlMap.set('x', [lineX, cubeX]);
		this.add(lineX);
		this.add(cubeX);

		const lineY = new GizmoMesh('line', 'y', [0.5, 0.8, 0.2], new Vector3(0, 0.75, 0), new Euler(0, 0, 0), 1.3);
		const cubeY = new GizmoMesh('box', 'y', [0.5, 0.8, 0.2], new Vector3(0, 1.3, 0), new Euler(0, 0, 0), 0.25);
		this._scaleControlMap.set('y', [lineY, cubeY]);
		this.add(lineY);
		this.add(cubeY);

		const lineZ = new GizmoMesh('line', 'z', [0.3, 0.5, 1.0], new Vector3(0, 0, 0.75), new Euler(Math.PI / 2, 0, 0), 1.3);
		const cubeZ = new GizmoMesh('box', 'z', [0.3, 0.5, 1.0], new Vector3(0, 0, 1.3), new Euler(0, 0, 0), 0.25);
		this._scaleControlMap.set('z', [lineZ, cubeZ]);
		this.add(lineZ);
		this.add(cubeZ);

		const cubeXYZ = new GizmoMesh('box', 'xyz', [0.75, 0.75, 0.75], new Vector3(0, 0, 0), new Euler(0, 0, 0), 0.32);
		this._scaleControlMap.set('xyz', [cubeXYZ]);
		this.add(cubeXYZ);
	}

	onHoverStart(axisName) {
		this._selectedAxis = axisName;
		const currentAxis = this._scaleControlMap.get(this._selectedAxis);
		currentAxis.forEach(axis => axis.highlight());
	}

	onHoverEnd() {
		const currentAxis = this._scaleControlMap.get(this._selectedAxis);
		currentAxis.forEach(axis => axis.unhighlight());
		this._selectedAxis = null;
	}

	onMoveStart(ray, axisName) {
		this._selectedAxis = axisName;

		this._group.getWorldMatrix(this._startGroupMatrix);
		this._startGroupMatrixInverse.getInverse(this._startGroupMatrix);

		this._getHitPlane();
		this._calRayIntersection(ray, this._startPoint);

		const localAxis = axisVector[this._selectedAxis];
		this._factorVec.set(
			this._startPoint.x === 0 ? 0 : localAxis.x / this._startPoint.x,
			this._startPoint.y === 0 ? 0 : localAxis.y / this._startPoint.y,
			this._startPoint.z === 0 ? 0 : localAxis.z / this._startPoint.z
		);

		this._scaleControlMap.forEach((value, key) => {
			if (key === axisName) {
				value.forEach(axis => axis.yellow());
			} else {
				value.forEach(axis => axis.visible = false);
			}
		});
	}

	onMove(ray) {
		this._calRayIntersection(ray, this._currPoint);
		const { _factorVec: factorVec } = this;

		if (this._selectedAxis === 'xyz') {
			const start = this._startPoint.getLength();
			const end = this._currPoint.getLength();

			_vec3_1.x = end / start;
			_vec3_1.y = end / start;
			_vec3_1.z = end / start;
		} else { // x y z
			_vec3_1.subVectors(this._currPoint, this._startPoint);
			_vec3_1.x = _vec3_1.x * factorVec.x + 1;
			_vec3_1.y = _vec3_1.y * factorVec.y + 1;
			_vec3_1.z = _vec3_1.z * factorVec.z + 1;
		}

		_mat4_1.identity();
		_mat4_1.elements[0] = _vec3_1.x;
		_mat4_1.elements[5] = _vec3_1.y;
		_mat4_1.elements[10] = _vec3_1.z;

		_mat4_1.premultiply(this._startGroupMatrix);

		this._group.setWorldMatrix(_mat4_1);
	}

	onMoveEnd() {
		this._scaleControlMap.forEach(control => {
			control.forEach(axis => {
				axis.material.diffuse.copy(axis.material._color);
				axis.material.opacity = axis.material._opacity;
				axis.visible = true;
			});
		});
	}

	update(isModify) {
		this._resizeControl(isModify);
	}

	_getHitPlane() {
		_vec3_1.setFromMatrixPosition(this._camera.worldMatrix);
		_vec3_1.applyMatrix4(this._startGroupMatrixInverse);
		const localAxis = axisVector[this._selectedAxis];

		_vec3_2.crossVectors(_vec3_1, localAxis);

		this._plane.setFromCoplanarPoints(localAxis, _vec3_1.set(0, 0, 0), _vec3_2);
	}

	_calRayIntersection(ray, out) {
		ray.origin.applyMatrix4(this._startGroupMatrixInverse);
		ray.direction.transformDirection(this._startGroupMatrixInverse);
		ray.intersectPlane(this._plane, out);
	}

	_resizeControl(isModify) {
		this._group.getWorldMatrix(_mat4_1);

		const ele = this._camera.projectionMatrix.elements;
		let factor;
		if (ele[15] > 0) {
			factor = 2 / ele[5];
		} else {
			_vec3_1.setFromMatrixPosition(_mat4_1);
			_vec3_2.setFromMatrixPosition(this._camera.worldMatrix);
			factor = _vec3_1.distanceTo(_vec3_2) * Math.min(1.9 / ele[5], 7);
		}
		factor *= this.size / 8;

		if (isModify) {
			factor *= 0.8;
		}

		this.worldMatrix.copy(_mat4_1);
		const parentMatrixInverse = _mat4_1.getInverse(this.parent.worldMatrix);
		this.matrix.multiplyMatrices(parentMatrixInverse, this.worldMatrix);
		this.matrix.decompose(this.position, this.quaternion, this.scale);

		this.scale.multiplyScalar(factor);

		// fix scale?
		if (ele[15] === 0) {
			const el = this.worldMatrix.elements;
			const sx = 1 / Math.sqrt(el[0] * el[0] + el[1] * el[1] + el[2] * el[2]);
			const sy = 1 / Math.sqrt(el[4] * el[4] + el[5] * el[5] + el[6] * el[6]);
			const sz = 1 / Math.sqrt(el[8] * el[8] + el[9] * el[9] + el[10] * el[10]);

			this.scale.x *= sx;
			this.scale.y *= sy;
			this.scale.z *= sz;
		}
	}

}

class RotateControl extends BaseControl {

	constructor(camera, group) {
		super('rotate', camera, group);

		this.rotateCircleRadius = 1.4;
		this.rotateCircleRadiusE = 1.4;

		this._rotateControlMap = new Map();
		this._lineHelperE = null;
		this._lineHelperS = null;
		this._rotateHelper = null;

		this._selectedAxis = null;

		this._plane = new Plane();
		this._sphere = new Sphere();
		this._startGroupMatrix = new Matrix4();
		this._startGroupMatrixInverse = new Matrix4();

		this._startPointUnit = new Vector3();
		this._currPointUnit = new Vector3();

		this._needsUpdate = true;

		this._finalRad = 0;
		this._previousRad = 0;

		this._eye = new Vector3();

		this._createAxis();
	}

	_createAxis() {
		const axisE = new GizmoMesh('torus', 'e', [0.7, 0.7, 0.7], new Vector3(0, 0, 0), new Euler(0, 0, 0), this.rotateCircleRadiusE, Math.PI * 2);
		this._rotateControlMap.set('e', axisE);
		this.add(axisE);
		const axisZ = new GizmoMesh('torus', 'z', [0.3, 0.5, 1.0], new Vector3(0, 0, 0), new Euler(0, 0, -Math.PI / 2), this.rotateCircleRadius);
		this._rotateControlMap.set('z', axisZ);
		this.add(axisZ);
		this._axisZQuaternionStart = axisZ.quaternion.clone();
		const axisY = new GizmoMesh('torus', 'y', [0.5, 0.8, 0.2], new Vector3(0, 0, 0), new Euler(Math.PI / 2, 0, 0), this.rotateCircleRadius);
		this._rotateControlMap.set('y', axisY);
		this.add(axisY);
		this._axisYQuaternionStart = axisY.quaternion.clone();
		const axisX = new GizmoMesh('torus', 'x', [1.0, 0.25, 0.25], new Vector3(0, 0, 0), new Euler(0, Math.PI / 2, Math.PI / 2), this.rotateCircleRadius);
		this._rotateControlMap.set('x', axisX);
		this.add(axisX);
		this._axisXQuaternionStart = axisX.quaternion.clone();
		const center = new GizmoMesh('sphere', 'xyz', [1.0, 1.0, 1.0], new Vector3(0, 0, 0), new Euler(0, 0, 0), this.rotateCircleRadius);
		this._rotateControlMap.set('xyz', center);
		this.add(center);

		this._lineHelperS = new GizmoMesh('linehelper', 'helperS', [1.0, 0.95, 0.0]);
		this._lineHelperS.visible = false;
		this.add(this._lineHelperS);
		this._lineHelperE = new GizmoMesh('linehelper', 'helperE', [1.0, 0.95, 0.0]);
		this._lineHelperE.visible = false;
		this.add(this._lineHelperE);
		this._rotateHelper = new GizmoMesh('rotatehelper', 'rotatehelper', [1.0, 0.95, 0.0]);
		this._rotateHelper.visible = false;
		this.add(this._rotateHelper);
	}

	onHoverStart(axisName) {
		this._selectedAxis = axisName;
		const currentAxis = this._rotateControlMap.get(this._selectedAxis);
		currentAxis.highlight();
	}

	onHoverEnd() {
		const currentAxis = this._rotateControlMap.get(this._selectedAxis);
		currentAxis.unhighlight();
		this._selectedAxis = null;
	}

	onMoveStart(ray, axisName) {
		this._selectedAxis = axisName;

		this._group.getWorldMatrix(this._startGroupMatrix);
		this._startGroupMatrixInverse.getInverse(this._startGroupMatrix);

		const cameraPos = _vec3_1.setFromMatrixPosition(this._camera.worldMatrix);
		const gizmoPos = _vec3_2.setFromMatrixPosition(this._startGroupMatrix);
		const eye = _vec3_3.subVectors(cameraPos, gizmoPos).normalize();
		eye.transformDirection(this._startGroupMatrixInverse);
		this._eye.copy(eye);

		this._calRayIntersection(ray, this._startPointUnit);
		if (this._selectedAxis !== 'xyz') {
			this._lineHelperS.visible = true;
			this._lineHelperS.geometry.updateLine(_vec3_1.set(0, 0, 0), this._startPointUnit);
		}

		this._rotateControlMap.forEach((value, key) => {
			if (key === axisName) {
				if (axisName === 'xyz') {
					value.highlight();
				} else {
					value.yellow();
				}
			} else {
				value.visible = false;
			}
		});

		if (this._selectedAxis !== 'e' && this._selectedAxis !== 'xyz') {
			this._rotateControlMap.get(this._selectedAxis).geometry.updateTorus(this.rotateCircleRadius, Math.PI * 2);
		}

		this._needsUpdate = false;
	}

	onMove(ray) {
		this._calRayIntersection(ray, this._currPointUnit);

		let localAxis, rad;
		if (this._selectedAxis === 'xyz') {
			_vec3_1.copy(this._startPointUnit).normalize();
			_vec3_2.copy(this._currPointUnit).normalize();
			_quat_1.setFromUnitVectors(_vec3_1, _vec3_2);
		} else {
			if (this._selectedAxis === 'e') {
				localAxis = this._eye;
				rad = this._getFinalRad(localAxis, this.rotateCircleRadiusE);
			} else {
				localAxis = axisVector[this._selectedAxis];
				rad = this._getFinalRad(localAxis, this.rotateCircleRadius);
			}

			this._rotateHelper.geometry.updateCircle(this._startPointUnit, localAxis, -rad);
			this._rotateHelper.visible = true;

			_quat_1.setFromAxisAngle(localAxis, -rad);
			_vec3_2.copy(this._startPointUnit).applyQuaternion(_quat_1);
			this._lineHelperE.geometry.updateLine(_vec3_1.set(0, 0, 0), _vec3_2);
			this._lineHelperE.visible = true;

			_quat_1.setFromAxisAngle(localAxis, rad);
		}

		_mat4_1.identity();
		_quat_1.toMatrix4(_mat4_1);

		_mat4_1.premultiply(this._startGroupMatrix);

		this._group.setWorldMatrix(_mat4_1);
	}

	onMoveEnd() {
		this._rotateHelper.visible = false;
		this._lineHelperS.visible = false;
		this._lineHelperE.visible = false;

		this._finalRad = 0;
		this._previousRad = 0;
		if (this._selectedAxis !== 'e' && this._selectedAxis !== 'xyz') {
			this._rotateControlMap.get(this._selectedAxis).geometry.updateTorus(this.rotateCircleRadius, Math.PI);
		}

		this._rotateControlMap.forEach(control => {
			control.material.diffuse.copy(control.material._color);
			control.material.opacity = control.material._opacity;
			control.visible = true;
		});

		this._needsUpdate = true;
	}

	_calRayIntersection(ray, out) {
		// transform ray to local space
		ray.origin.applyMatrix4(this._startGroupMatrixInverse);
		ray.direction.transformDirection(this._startGroupMatrixInverse);

		if (this._selectedAxis === 'e') {
			this._plane.normal.copy(this._eye);
			ray.intersectPlane(this._plane, out);
			out.normalize().multiplyScalar(this.rotateCircleRadiusE);
		} else if (this._selectedAxis === 'xyz') {
			this._sphere.radius = this.rotateCircleRadius;
			ray.intersectSphere(this._sphere, out);
		} else {
			ray.intersectPlane(axisPlane[this._selectedAxis], out);
			out.normalize().multiplyScalar(this.rotateCircleRadius);
		}
	}

	_getFinalRad(rotateAxis, radius) {
		const p1 = this._startPointUnit;
		const p2 = this._currPointUnit;

		const dot = p1.dot(p2);
		_vec3_1.crossVectors(p1, p2);
		const direction = _vec3_1.dot(rotateAxis);
		const currentRad = Math.sign(direction) * Math.acos(dot / (radius * radius));
		const incrementRad = currentRad - this._previousRad;
		if (this._previousRad * currentRad < 0) {
			Math.abs(currentRad) < Math.PI / 2
				? (this._finalRad += incrementRad)
				: (this._finalRad += -Math.sign(incrementRad) * (2 * Math.PI - Math.abs(incrementRad)));
		} else {
			this._finalRad += incrementRad;
		}
		this._previousRad = currentRad;
		return this._finalRad;
	}

	update() {
		this._resizeControl();
		this._updateAxisTransform();
	}

	_updateAxisTransform() {
		if (!this._needsUpdate) return;

		const cameraPos = _vec3_1.setFromMatrixPosition(this._camera.worldMatrix);
		const gizmoPos = _vec3_2.setFromMatrixPosition(this.worldMatrix);
		const eye = _vec3_3.subVectors(cameraPos, gizmoPos).normalize();

		eye.transformDirection(_mat4_1.getInverse(this.worldMatrix));

		this._eye.copy(eye);

		const { x, y, z } = eye;

		_quat_1.setFromAxisAngle(axisVector['z'], Math.atan2(-y, z));
		_quat_1.multiplyQuaternions(this._axisXQuaternionStart, _quat_1);
		this._rotateControlMap.get('x').quaternion.copy(_quat_1);

		_quat_1.setFromAxisAngle(axisVector['z'], Math.atan2(-x, z));
		_quat_1.multiplyQuaternions(this._axisYQuaternionStart, _quat_1);
		this._rotateControlMap.get('y').quaternion.copy(_quat_1);

		_quat_1.setFromAxisAngle(axisVector['z'], Math.atan2(y, x));
		_quat_1.multiplyQuaternions(this._axisZQuaternionStart, _quat_1);
		this._rotateControlMap.get('z').quaternion.copy(_quat_1);

		this._rotateControlMap.get('e').quaternion.setFromRotationMatrix(_mat4_1.lookAtRH(eye, _vec3_1.set(0, 0, 0), axisVector['z']));
	}

	_resizeControl() {
		this._group.getWorldMatrix(_mat4_1);

		const ele = this._camera.projectionMatrix.elements;
		let factor;
		if (ele[15] > 0) {
			factor = 2 / ele[5];
		} else {
			_vec3_1.setFromMatrixPosition(_mat4_1);
			_vec3_2.setFromMatrixPosition(this._camera.worldMatrix);
			factor = _vec3_1.distanceTo(_vec3_2) * Math.min(1.9 / ele[5], 7);
		}
		factor *= this.size / 8;

		this.worldMatrix.copy(_mat4_1);
		const parentMatrixInverse = _mat4_1.getInverse(this.parent.worldMatrix);
		this.matrix.multiplyMatrices(parentMatrixInverse, this.worldMatrix);
		this.matrix.decompose(this.position, this.quaternion, this.scale);

		this.scale.multiplyScalar(factor);
	}

}

// GizmoMesh and geometries

class GizmoMesh extends Mesh {

	constructor(type, name, color, position, rotation, size, arc) {
		const material = new BasicMaterial();
		let geometry;

		switch (type) {
			case 'line':
				geometry = new CylinderGeometry(0.02, 0.02, size);
				break;
			case 'arrow':
				geometry = new CylinderGeometry(0, 0.08, 0.3);
				break;
			case 'plane':
				geometry = new PlaneGeometry(0.3, 0.3);
				material.opacity = 0.9;
				break;
			case 'box':
				geometry = new BoxGeometry(size, size, size);
				break;
			case 'torus':
				geometry = new RotateTorusGeometry(size, arc);
				break;
			case 'sphere':
				geometry = new SphereGeometry(size, 32, 16);
				material.opacity = 0;
				break;
			case 'linehelper':
			case 'axishelper':
				geometry = new LineHelperGeometry(new Vector3(0, 0, 0), new Vector3(1, 0, 0));
				material.drawMode = DRAW_MODE.LINES;
				break;
			case 'rotatehelper':
				geometry = new RotateHelperGeometry();
				material.opacity = 0.2;
				break;
			default:
				break;
		}

		super(geometry, material);

		material.transparent = true;
		material.depthTest = false;
		material.side = DRAW_SIDE.DOUBLE;
		material.diffuse.fromArray(color);
		material._color = material.diffuse.clone();
		material._opacity = material.opacity;

		this.name = name;
		this.receiveShadows = false;
		this.castShadows = false;
		this.renderOrder = 100;

		if (type === 'axishelper') {
			this.frustumCulled = false;
			this.scale.x = 1e6;
		}

		rotation && this.euler.copy(rotation);
		position && this.position.copy(position);
	}

	highlight() {
		this.material.diffuse.r = this.material.diffuse.r + 0.3;
		this.material.diffuse.g = this.material.diffuse.g + 0.3;
		this.material.diffuse.b = this.material.diffuse.b + 0.3;
		this.material.opacity = this.material.opacity + 0.1;
	}

	unhighlight() {
		this.material.diffuse.copy(this.material._color);
		this.material.opacity = this.material._opacity;
	}

	yellow() {
		this.material.diffuse.fromArray([1.0, 0.95, 0.0]);
	}

}

class RotateTorusGeometry extends Geometry {

	constructor(radius = 1, arc = Math.PI) {
		super();

		const param = TorusBuilder.getGeometryData(radius, 0.02, 6, 48, arc);

		// build geometry

		this.setIndex(new Attribute(new Buffer(
			(param.positions.length / 3) > 65536 ? new Uint32Array(param.indices) : new Uint16Array(param.indices),
			1
		)));
		this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(param.positions), 3)));
		this.addAttribute('a_Normal', new Attribute(new Buffer(new Float32Array(param.normals), 3)));

		this.computeBoundingBox();
		this.computeBoundingSphere();
	}

	updateTorus(radius = 1, arc = Math.PI) {
		const param = TorusBuilder.getGeometryData(radius, 0.02, 6, 48, arc);

		this.getAttribute('a_Position').buffer.array.set(param.positions);
		this.getAttribute('a_Normal').buffer.array.set(param.normals);

		this.getAttribute('a_Position').buffer.version++;
		this.getAttribute('a_Normal').buffer.version++;

		this.computeBoundingBox();
		this.computeBoundingSphere();
	}

}

const _tempQuat = new Quaternion();
const _tempVect = new Vector3();

class RotateHelperGeometry extends Geometry {

	constructor() {
		super();

		this.defaultCenter = new Vector3(0, 0, 0);

		const param = this._generateData(new Vector3(0, 1, 0), new Vector3(1, 0, 0), Math.PI * 10, this.defaultCenter, 16);

		this.setIndex(new Attribute(new Buffer(
			(param.vertices.length / 3) > 65536 ? new Uint32Array(param.indices) : new Uint16Array(param.indices),
			1
		)));
		this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(param.vertices), 3)));
	}

	updateCircle(startPoint, normal, thetaLength) {
		if (Math.abs(thetaLength) > Math.PI * 10) return;

		const param = this._generateData(startPoint, normal, thetaLength, this.defaultCenter, 16);

		this.index.buffer.array.set(param.indices);
		this.index.buffer.count = param.indices.length;
		this.index.buffer.version++;
		this.getAttribute('a_Position').buffer.array.set(param.vertices);
		this.getAttribute('a_Position').buffer.count = param.vertices.length / 3;
		this.getAttribute('a_Position').buffer.version++;
	}

	_generateData(startPoint, normal, thetaLength, center, segmentFactor) {
		const newSegments = Math.abs(Math.ceil((segmentFactor * thetaLength) / Math.PI));
		const segments = Math.max(6, newSegments);

		const indices = [];
		const vertices = [];

		// indices
		for (let i = 1; i <= segments; i++) {
			indices.push(i, i + 1, 0);
		}

		vertices.push(center.x, center.y, center.z);
		// vertices
		for (let s = 0; s <= segments; s++) {
			const segment = (s / segments) * thetaLength;
			_tempQuat.setFromAxisAngle(normal, segment);
			_tempVect.copy(startPoint).applyQuaternion(_tempQuat);
			vertices.push(_tempVect.x, _tempVect.y, _tempVect.z);
		}

		return { indices, vertices };
	}

}

class LineHelperGeometry extends Geometry {

	constructor(startPoint, endPoint) {
		super();

		const vertices = [
			startPoint.x, startPoint.y, startPoint.z,
			endPoint.x, endPoint.y, endPoint.z
		];

		this.addAttribute('a_Position', new Attribute(new Buffer(new Float32Array(vertices), 3)));
	}

	updateLine(startPoint, endPoint) {
		const vertices = [
			startPoint.x, startPoint.y, startPoint.z,
			endPoint.x, endPoint.y, endPoint.z
		];

		this.getAttribute('a_Position').buffer.array.set(vertices);
		this.getAttribute('a_Position').buffer.version++;
	}

}

export { TransformControls };