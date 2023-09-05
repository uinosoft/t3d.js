import { LightShadow } from './LightShadow.js';
import { TEXTURE_FILTER } from '../../const.js';
import { RenderTargetCube } from '../../resources/targets/RenderTargetCube.js';
import { Vector3 } from '../../math/Vector3.js';

/**
 * This is used internally by PointLights for calculating shadows.
 * @memberof t3d
 * @extends t3d.LightShadow
 */
class PointLightShadow extends LightShadow {

	constructor() {
		super();

		this.renderTarget = new RenderTargetCube(this.mapSize.x, this.mapSize.y);

		const map = this.renderTarget.texture;
		map.generateMipmaps = false;
		map.minFilter = TEXTURE_FILTER.NEAREST;
		map.magFilter = TEXTURE_FILTER.NEAREST;
		this.map = map;

		this._targets = [
			new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0),
			new Vector3(0, -1, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1)
		];

		this._ups = [
			new Vector3(0, -1, 0), new Vector3(0, -1, 0), new Vector3(0, 0, 1),
			new Vector3(0, 0, -1), new Vector3(0, -1, 0), new Vector3(0, -1, 0)
		];

		this._lookTarget = new Vector3();
	}

	update(light, face) {
		this._updateCamera(light, face);

		if (this.mapSize.x !== this.renderTarget.width || this.mapSize.y !== this.renderTarget.height) {
			this.renderTarget.resize(this.mapSize.x, this.mapSize.y);
		}
	}

	_updateCamera(light, face) {
		const camera = this.camera;
		const lookTarget = this._lookTarget;
		const targets = this._targets;
		const ups = this._ups;

		// set camera position and lookAt(rotation)
		camera.position.setFromMatrixPosition(light.worldMatrix);
		lookTarget.set(targets[face].x + camera.position.x, targets[face].y + camera.position.y, targets[face].z + camera.position.z);
		camera.lookAt(lookTarget, ups[face]);

		// update view matrix
		camera.updateMatrix();

		// update projection
		camera.setPerspective(90 / 180 * Math.PI, 1, this.cameraNear, this.cameraFar);
	}

}

export { PointLightShadow };