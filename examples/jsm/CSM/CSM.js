import {
	Vector3,
	DirectionalLight,
	ShaderChunk,
	Matrix4,
	Box3,
	Object3D
} from 't3d';
import { CSMFrustum } from './CSMFrustum.js';
import { CSMShader } from './CSMShader.js';
const _cameraToLightMatrix = new Matrix4();
const _lightSpaceFrustum = new CSMFrustum();
const _center = new Vector3();
const _bbox = new Box3();
const _uniformArray = [];
const _logArray = [];
const _lightOrientationMatrix = new Matrix4();
const _lightOrientationMatrixInverse = new Matrix4();
const _up = new Vector3(0, 1, 0);

const _mat4_1 = new Matrix4();
Object3D.prototype.attach = function(object) {
	// adds object as a child of this, while maintaining the object's world transform
	// Note: This method does not support scene graphs having non-uniformly-scaled nodes(s)
	this.updateWorldMatrix(true, false);

	_mat4_1.getInverse(this.worldMatrix);

	if (object.parent !== null) {
		object.parent.updateWorldMatrix(true, false);

		_mat4_1.multiply(object.parent.worldMatrix);
	}

	object.applyMatrix4(_mat4_1);

	this.add(object);

	object.updateWorldMatrix(false, true);

	return this;
}
Object3D.prototype.applyMatrix4 = function(matrix) {
	if (this.matrixAutoUpdate) this.updateMatrix();

	this.matrix.premultiply(matrix);

	this.matrix.decompose(this.position, this.quaternion, this.scale);
}
Object3D.prototype.updateWorldMatrix = function(updateParents, updateChildren) {
	const parent = this.parent;

	if (updateParents === true && parent !== null && parent.worldMatrixNeedsUpdate === true) {
		parent.updateWorldMatrix(true, false);
	}

	if (this.matrixAutoUpdate) this.updateMatrix();

	if (this.parent === null) {
		this.worldMatrix.copy(this.matrix);
	} else {
		this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.matrix);
	}

	// update children

	if (updateChildren === true) {
		const children = this.children;

		for (let i = 0, l = children.length; i < l; i++) {
			const child = children[i];

			if (child.worldMatrixNeedsUpdate === true) {
				child.updateWorldMatrix(false, true);
			}
		}
	}
}
export class CSM {

	constructor(data) {
		data = data || {};

		this.camera = data.camera;
		this.parent = data.parent;
		this.cascades = data.cascades || 3;
		this.maxFar = data.maxFar || 1000;
		this.mode = data.mode || 'practical';
		this.shadowMapSize = data.shadowMapSize || 2048;
		this.shadowBias = data.shadowBias || 0.000001;
		this.lightDirection = data.lightDirection || new Vector3(1, -1, 1).normalize();
		this.lightIntensity = data.lightIntensity  || 1;
		this.lightNear = data.lightNear || 1;
		this.lightFar = data.lightFar || 2000;
		this.lightMargin = data.lightMargin || 200;
		this.customSplitsCallback = data.customSplitsCallback;
		this.fade = data.fade;
		this.mainFrustum = new CSMFrustum();
		this.frustums = [];
		this.breaks = [];
		this.debug = true;

		this.lights = [];
		this.shaders = new Map();

		this.createLights();
		this.updateFrustums();
		this.injectInclude();
	}

	createLights() {
		for (let i = 0; i < this.cascades; i++) {
			const light = new DirectionalLight(0xffffff, this.lightIntensity);
			light.castShadow = true;
			light.shadow.mapSize.set(this.shadowMapSize, this.shadowMapSize);

			light.shadow.camera.near = this.lightNear;
			light.shadow.camera.far = this.lightFar;
			light.shadow.bias = this.shadowBias;
			this.parent.add(light);
			this.lights.push(light);
		}
	}

	initCascades() {
		const camera = this.camera;
		camera.updateMatrix();
		this.mainFrustum.setFromProjectionMatrix(camera.projectionMatrix, this.maxFar);
		this.mainFrustum.split(this.breaks, this.frustums);
		console.log(this.frustums)
	}

	updateShadowBounds() {
		const frustums = this.frustums;
		for (let i = 0; i < frustums.length; i++) {
			const light = this.lights[i];
			const shadow = light.shadow;
			const shadowCam = light.shadow.camera;
			const frustum = this.frustums[i];

			// Get the two points that represent that furthest points on the frustum assuming
			// that's either the diagonal across the far plane or the diagonal across the whole
			// frustum itself.
			const nearVerts = frustum.vertices.near;
			const farVerts = frustum.vertices.far;
			const point1 = farVerts[0];
			let point2;
			if (point1.distanceTo(farVerts[2]) > point1.distanceTo(nearVerts[2])) {
				point2 = farVerts[2];
			} else {
				point2 = nearVerts[2];
			}

			let squaredBBWidth = point1.distanceTo(point2);
			if (this.fade) {
				// expand the shadow extents by the fade margin if fade is enabled.
				const camera = this.camera;
				const far = Math.max(camera.far, this.maxFar);
				const linearDepth = frustum.vertices.far[0].z / (far - camera.near);
				const margin = 0.25 * Math.pow(linearDepth, 2.0) * (far - camera.near);

				squaredBBWidth += margin;
			}

			shadowCam.left = -squaredBBWidth / 2;
			shadowCam.right = squaredBBWidth / 2;
			shadowCam.top = squaredBBWidth / 2;
			shadowCam.bottom = -squaredBBWidth / 2;
			shadow.windowSize = squaredBBWidth;
			shadow.cameraNear =  this.lightNear;
			shadow.cameraFar = this.lightFar;
		}
	}

	getBreaks() {
		const camera = this.camera;
		const far = Math.min(camera.far, this.maxFar);
		this.breaks.length = 0;

		switch (this.mode) {
			case 'uniform':
				uniformSplit(this.cascades, camera.near, far, this.breaks);
				break;
			case 'logarithmic':
				logarithmicSplit(this.cascades, camera.near, far, this.breaks);
				break;
			case 'practical':
				practicalSplit(this.cascades, camera.near, far, 0.5, this.breaks);
				break;
			case 'custom':
				if (this.customSplitsCallback === undefined) console.error('CSM: Custom split scheme callback not defined.');
				this.customSplitsCallback(this.cascades, camera.near, far, this.breaks);
				break;
		}

		function uniformSplit(amount, near, far, target) {
			for (let i = 1; i < amount; i++) {
				target.push((near + (far - near) * i / amount) / far);
			}

			target.push(1);
		}

		function logarithmicSplit(amount, near, far, target) {
			for (let i = 1; i < amount; i++) {
				target.push((near * (far / near) ** (i / amount)) / far);
			}

			target.push(1);
		}

		function practicalSplit(amount, near, far, lambda, target) {
			_uniformArray.length = 0;
			_logArray.length = 0;
			logarithmicSplit(amount, near, far, _logArray);
			uniformSplit(amount, near, far, _uniformArray);

			for (let i = 1; i < amount; i++) {
				target.push(lerp(_uniformArray[i - 1], _logArray[i - 1], lambda));
			}
			function lerp(x, y, t) {
				return (1 - t) * x + t * y;
			}
			target.push(1);
		}
	}

	update() {
		const camera = this.camera;
		const frustums = this.frustums;

		// for each frustum we need to find its min-max box aligned with the light orientation
		// the position in _lightOrientationMatrix does not matter, as we transform there and back
		_lightOrientationMatrix.lookAtRH(new Vector3(), this.lightDirection, _up);
		_lightOrientationMatrixInverse.getInverse(_lightOrientationMatrix);

		for (let i = 0; i < frustums.length; i++) {
			const light = this.lights[i];
			const shadowCam = light.shadow.camera;
			const texelWidth = (shadowCam.right - shadowCam.left) / this.shadowMapSize;
			const texelHeight = (shadowCam.top - shadowCam.bottom) / this.shadowMapSize;
			_cameraToLightMatrix.multiplyMatrices(_lightOrientationMatrixInverse, camera.worldMatrix);
			frustums[i].toSpace(_cameraToLightMatrix, _lightSpaceFrustum);

			const nearVerts = _lightSpaceFrustum.vertices.near;
			const farVerts = _lightSpaceFrustum.vertices.far;
			_bbox.makeEmpty();
			for (let j = 0; j < 4; j++) {
				_bbox.expandByPoint(nearVerts[j]);
				_bbox.expandByPoint(farVerts[j]);
			}

			_bbox.getCenter(_center);
			_center.z = _bbox.max.z + this.lightMargin;
			_center.x = Math.floor(_center.x / texelWidth) * texelWidth;
			_center.y = Math.floor(_center.y / texelHeight) * texelHeight;
			_center.applyMatrix4(_lightOrientationMatrix);
			light.target = new Vector3()
			light.position.copy(_center);
			light.target.copy(_center);

			light.target.x += this.lightDirection.x;
			light.target.y += this.lightDirection.y;
			light.target.z += this.lightDirection.z;
			light.lookAt(light.target, _up)
		}
	}

	injectInclude() {
		ShaderChunk.light_pars_frag = CSMShader.light_pars_frag;
		ShaderChunk.light_frag = CSMShader.light_frag;
	}

	setupMaterial(material) {
		material.defines = material.defines || {};
		material.defines.USE_CSM = 1;
		material.defines.CSM_CASCADES = this.cascades;

		if (this.fade) {
			material.defines.CSM_FADE = true;
		}

		const breaksVec2 = [];
		const scope = this;
		const shaders = this.shaders;

		const far = Math.min(scope.camera.far, scope.maxFar);
		scope.getExtendedBreaks(breaksVec2);

		material.uniforms.CSM_cascades = breaksVec2;
		material.uniforms.cameraNear = scope.camera.near;
		material.uniforms.shadowFar = far;
		material.uniforms.u_projectionMatrix = new Float32Array(16);
		material.uniforms.u_csmdebug = this.debug ? 1 : 0
		const projectionviewInverse = new Matrix4();
		projectionviewInverse.copy(scope.camera.viewMatrix);
		projectionviewInverse.toArray(material.uniforms.u_projectionMatrix);

		shaders.set(material, null);
	}

	updateUniforms() {
		const far = Math.min(this.camera.far, this.maxFar);
		const shaders = this.shaders;

		shaders.forEach(function (shader, material) {
			if (material.uniforms.shader !== null) {
				const uniforms = material.uniforms;
				this.getExtendedBreaks(uniforms.CSM_cascades);
				uniforms.cameraNear = this.camera.near;
				uniforms.shadowFar = far;
				uniforms.u_csmdebug = this.debug ? 1 : 0
			}

			if (!this.fade && 'CSM_FADE' in material.defines) {
				delete material.defines.CSM_FADE;
				material.needsUpdate = true;
			} else if (this.fade && !('CSM_FADE' in material.defines)) {
				material.defines.CSM_FADE = true;
				material.needsUpdate = true;
			}
		}, this);
	}

	getExtendedBreaks(target) {
		for (let i = 0; i < this.cascades; i++) {
			const amount = this.breaks[i];
			const prev = this.breaks[i - 1] || 0;
			target.push(prev);
			target.push(amount);
		}
	}

	updateFrustums() {
		this.getBreaks();
		this.initCascades();
		this.updateShadowBounds();
		this.updateUniforms();
	}

	remove() {
		for (let i = 0; i < this.lights.length; i++) {
			this.parent.remove(this.lights[i].target);
			this.parent.remove(this.lights[i]);
		}
	}

	dispose() {
		const shaders = this.shaders;
		shaders.forEach(function (shader, material) {
			delete material.onBeforeCompile;
			delete material.defines.USE_CSM;
			delete material.defines.CSM_CASCADES;
			delete material.defines.CSM_FADE;

			if (shader !== null) {
				delete shader.uniforms.CSM_cascades;
				delete shader.uniforms.cameraNear;
				delete shader.uniforms.shadowFar;
			}

			material.needsUpdate = true;
		});
		shaders.clear();
	}

}