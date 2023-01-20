import { Camera } from '../Camera.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Vector2 } from '../../math/Vector2.js';

/**
 * Serves as a base class for the other shadow classes.
 * @abstract
 * @memberof t3d
 */
class LightShadow {

	constructor() {
		/**
		 * The light's view of the world.
		 * This is used to generate a depth map of the scene; objects behind other objects from the light's perspective will be in shadow.
		 * @type {t3d.Camera}
		 */
		this.camera = new Camera();

		/**
		 * Model to shadow camera space, to compute location and depth in shadow map. Stored in a {@link t3d.Matrix4}.
		 * This is computed internally during rendering.
		 * @type {t3d.Matrix4}
		 */
		this.matrix = new Matrix4();

		/**
		 * Shadow map bias, how much to add or subtract from the normalized depth when deciding whether a surface is in shadow.
		 * Very tiny adjustments here (in the order of 0.0001) may help reduce artefacts in shadows.
		 * @type {Number}
		 * @default 0
		 */
		this.bias = 0;

		/**
		 * Defines how much the position used to query the shadow map is offset along the object normal.
		 * Increasing this value can be used to reduce shadow acne especially in large scenes where light shines onto geometry at a shallow angle.
		 * The cost is that shadows may appear distorted.
		 * @type {Number}
		 * @default 0
		 */
		this.normalBias = 0;

		/**
		 * Setting this to values greater than 1 will blur the edges of the shadow.
		 * High values will cause unwanted banding effects in the shadows - a greater mapSize will allow for a higher value to be used here before these effects become visible.
		 * Note that this has no effect if the {@link @t3d.Object3D#shadowType} is set to PCF or PCSS.
		 * @type {Number}
		 * @default 1
		 */
		this.radius = 1;

		/**
		 * Shadow camera near.
		 * @type {Number}
		 * @default 1
		 */
		this.cameraNear = 1;

		/**
		 * Shadow camera far.
		 * @type {Number}
		 * @default 500
		 */
		this.cameraFar = 500;

		/**
		 * A {@link t3d.Vector2} defining the width and height of the shadow map.
		 * Higher values give better quality shadows at the cost of computation time.
		 * Values must be powers of 2.
		 * @type {t3d.Vector2}
		 * @default t3d.Vector2(512, 512)
		 */
		this.mapSize = new Vector2(512, 512);

		/**
		 * Enables automatic updates of the light's shadow.
		 * If you do not require dynamic lighting / shadows, you may set this to false.
		 * @type {Boolean}
		 * @default true
		 */
		this.autoUpdate = true;

		/**
		 * When set to true, shadow maps will be updated in the next ShadowMapPass.render call.
		 * If you have set .autoUpdate to false, you will need to set this property to true and then make a ShadowMapPass.render call to update the light's shadow.
		 * @type {Boolean}
		 * @default false
		 */
		this.needsUpdate = false;

		this.renderTarget = null;
		this.map = null;
		this.depthMap = null;
	}

	update(light, face) {}

	updateMatrix() {
		const matrix = this.matrix;
		const camera = this.camera;

		// matrix * 0.5 + 0.5, after identity, range is 0 ~ 1 instead of -1 ~ 1
		matrix.set(
			0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.5, 0.5,
			0.0, 0.0, 0.0, 1.0
		);

		matrix.multiply(camera.projectionMatrix);
		matrix.multiply(camera.viewMatrix);
	}

	copy(source) {
		this.camera.copy(source.camera);
		this.matrix.copy(source.matrix);

		this.bias = source.bias;
		this.normalBias = source.normalBias;
		this.radius = source.radius;

		this.cameraNear = source.cameraNear;
		this.cameraFar = source.cameraFar;

		this.mapSize.copy(source.mapSize);

		return this;
	}

	clone() {
		return new this.constructor().copy(this);
	}

	prepareDepthMap(_enable, _capabilities) {}

}

export { LightShadow };