import { LightShadow } from './LightShadow.js';
import { TEXTURE_FILTER, PIXEL_FORMAT, PIXEL_TYPE, ATTACHMENT, COMPARE_FUNC } from '../../const.js';
import { Texture2D } from '../../resources/textures/Texture2D.js';
import { RenderTarget2D } from '../../resources/targets/RenderTarget2D.js';
import { RenderBuffer } from '../../resources/RenderBuffer.js';
import { Vector3 } from '../../math/Vector3.js';

/**
 * This is used internally by DirectionalLights for calculating shadows.
 * @memberof t3d
 * @extends t3d.LightShadow
 */
class DirectionalLightShadow extends LightShadow {

	constructor() {
		super();

		/**
		 * The cast shadow window size.
		 * @type {Number}
		 * @default 500
		 */
		this.windowSize = 500;

		/**
		 * Controls the extent to which the shadows fade out at the edge of the frustum.
		 * @type {Number}
		 * @default 0
		 */
		this.frustumEdgeFalloff = 0.0;

		// direct light is just a direction
		// we would not do camera frustum cull, because this light could be any where
		this.camera.frustumCulled = false;

		this.renderTarget = new RenderTarget2D(this.mapSize.x, this.mapSize.y);

		const map = this.renderTarget.texture;
		map.generateMipmaps = false;
		map.minFilter = TEXTURE_FILTER.NEAREST;
		map.magFilter = TEXTURE_FILTER.NEAREST;

		const depthTexture = new Texture2D();
		depthTexture.type = PIXEL_TYPE.UNSIGNED_INT;
		depthTexture.format = PIXEL_FORMAT.DEPTH_COMPONENT;
		depthTexture.magFilter = TEXTURE_FILTER.LINEAR;
		depthTexture.minFilter = TEXTURE_FILTER.LINEAR;
		depthTexture.compare = COMPARE_FUNC.LESS;
		depthTexture.generateMipmaps = false;

		const depthBuffer = new RenderBuffer(this.mapSize.x, this.mapSize.y, PIXEL_FORMAT.DEPTH_COMPONENT16);

		this.renderTarget.detach(ATTACHMENT.DEPTH_STENCIL_ATTACHMENT);
		this.renderTarget.attach(depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);

		this.map = map;
		this.depthMap = depthTexture;

		this._depthBuffer = depthBuffer;

		this._lookTarget = new Vector3();

		this._up = new Vector3(0, 1, 0);
	}

	update(light) {
		this._updateCamera(light);

		if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
			this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
		}
	}

	_updateCamera(light) {
		const camera = this.camera;
		const lookTarget = this._lookTarget;

		// set camera position and lookAt(rotation)
		light.getWorldDirection(lookTarget);
		camera.position.setFromMatrixPosition(light.worldMatrix);
		lookTarget.multiplyScalar(-1).add(camera.position);
		camera.lookAt(lookTarget, this._up);

		// update view matrix
		camera.updateMatrix();

		// update projection
		const halfWindowSize = this.windowSize / 2;
		camera.setOrtho(-halfWindowSize, halfWindowSize, -halfWindowSize, halfWindowSize, this.cameraNear, this.cameraFar);
	}

	copy(source) {
		super.copy(source);

		this.windowSize = source.windowSize;
		this.frustumEdgeFalloff = source.frustumEdgeFalloff;

		return this;
	}

	prepareDepthMap(enable, capabilities) {
		const useDepthMap = enable && capabilities.version >= 2;
		const renderTarget = this.renderTarget;
		const attachments = renderTarget._attachments;
		const depthMapAttached = attachments[ATTACHMENT.DEPTH_ATTACHMENT] === this.depthMap;

		if (useDepthMap === depthMapAttached) return;

		if (useDepthMap) {
			if (capabilities.getExtension('OES_texture_float_linear')) {
				this.depthMap.type = PIXEL_TYPE.FLOAT;
			}

			renderTarget.dispose();
			renderTarget.attach(this.depthMap, ATTACHMENT.DEPTH_ATTACHMENT);
		} else {
			renderTarget.dispose();
			renderTarget.attach(this._depthBuffer, ATTACHMENT.DEPTH_ATTACHMENT);
		}
	}

}

export { DirectionalLightShadow };