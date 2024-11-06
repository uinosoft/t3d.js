import { LightShadow } from './LightShadow.js';
import { TEXTURE_FILTER, PIXEL_FORMAT, PIXEL_TYPE, ATTACHMENT, COMPARE_FUNC } from '../../const.js';
import { Texture2D } from '../../resources/textures/Texture2D.js';
import { RenderTarget2D } from '../../resources/targets/RenderTarget2D.js';
import { RenderBuffer } from '../../resources/RenderBuffer.js';

/**
 * This is used internally by SpotLights for calculating shadows.
 * @memberof t3d
 * @extends t3d.LightShadow
 */
class SpotLightShadow extends LightShadow {

	constructor() {
		super();

		/**
		 * Controls the extent to which the shadows fade out at the edge of the frustum.
		 * @type {Number}
		 * @default 0
		 */
		this.frustumEdgeFalloff = 0.0;

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
	}

	update(light) {
		this._updateCamera(light);

		if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
			this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
		}
	}

	_updateCamera(light) {
		const camera = this.camera;

		camera.matrix.copy(light.worldMatrix);
		camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
		camera.updateMatrix();

		camera.setPerspective(light.angle * 2, 1, this.cameraNear, this.cameraFar);
	}

	copy(source) {
		super.copy(source);

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

export { SpotLightShadow };