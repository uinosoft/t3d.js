import { Camera, RenderTarget2D, Vector3, Vector4, Plane, Matrix4, TEXTURE_FILTER } from 't3d';


/**
 * A planar reflection probe.
 */
class PlanarReflectionProbe {

	/**
	 * @param {t3d.RenderTarget2D} [renderTarget] - The reflection render is done to the renderTarget (if specified).
	 */
	constructor(renderTarget) {
		this.plane = new Plane();

		if (!renderTarget) {
			renderTarget = new RenderTarget2D(1024, 1024);
			renderTarget.texture.minFilter = TEXTURE_FILTER.LINEAR;
			renderTarget.texture.generateMipmaps = false;
		}

		this.renderTarget = renderTarget;
		this.renderTexture = renderTarget.texture;

		this.textureMatrix = new Matrix4();
		this.clipBias = 0.0;

		this.mirrorCamera = new Camera();

		this.renderOption = {
			ifRender: function(renderable) {
				return !renderable.object.skipReflectionProbe;
			}
		};
	}

	/**
	 * Render the reflection.
	 * Need update scene data and collect light data before calling this method.
	 * @param {t3d.ThinRenderer} renderer
	 * @param {t3d.Scene} scene
	 * @param {t3d.Camera} camera
	 */
	render(renderer, scene, camera) {
		const mirrorCamera = this.mirrorCamera;

		// Calculate the mirror camera transformation

		cameraPosition.setFromMatrixPosition(camera.worldMatrix);
		this.plane.mirrorPoint(cameraPosition, mirrorCameraPosition);

		cameraTarget.setFromMatrixColumn(camera.worldMatrix, 2).normalize().negate().add(cameraPosition);
		this.plane.mirrorPoint(cameraTarget, mirrorCameraTarget);

		mirrorCameraUp.setFromMatrixColumn(camera.worldMatrix, 1).normalize().reflect(this.plane.normal);

		mirrorCamera.position.copy(mirrorCameraPosition);
		mirrorCamera.lookAt(mirrorCameraTarget, mirrorCameraUp);

		// Copy projection matrix to the mirror camera

		mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);
		mirrorCamera.updateMatrix();

		// Copy other camera properties

		mirrorCamera.outputEncoding = camera.outputEncoding;

		// Update the texture matrix

		this.textureMatrix.set(
			0.5, 0.0, 0.0, 0.5,
			0.0, 0.5, 0.0, 0.5,
			0.0, 0.0, 0.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		);
		this.textureMatrix.multiply(mirrorCamera.projectionViewMatrix);

		// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
		// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf

		mirrorPlane.copy(this.plane);
		mirrorPlane.applyMatrix4(mirrorCamera.viewMatrix);

		clipPlane.set(mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant);

		const projectionMatrix = mirrorCamera.projectionMatrix;

		q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
		q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
		q.z = -1.0;
		q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

		// Calculate the scaled plane vector
		clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));

		// Replacing the third row of the projection matrix
		projectionMatrix.elements[2] = clipPlane.x;
		projectionMatrix.elements[6] = clipPlane.y;
		projectionMatrix.elements[10] = clipPlane.z + 1.0 - this.clipBias;
		projectionMatrix.elements[14] = clipPlane.w;

		// Render

		renderer.setRenderTarget(this.renderTarget);

		renderer.clear(true, true, true);

		const renderStates = scene.updateRenderStates(mirrorCamera, false);
		const renderQueue = scene.updateRenderQueue(mirrorCamera, false, false);

		renderer.beginRender();

		let renderQueueLayer;
		for (let i = 0, l = renderQueue.layerList.length; i < l; i++) {
			renderQueueLayer = renderQueue.layerList[i];
			renderer.renderRenderableList(renderQueueLayer.opaque, renderStates, this.renderOption);
			renderer.renderRenderableList(renderQueueLayer.transparent, renderStates, this.renderOption);
		}

		renderer.endRender();

		renderer.updateRenderTargetMipmap(this.renderTarget);
	}

}

const cameraPosition = new Vector3();
const mirrorCameraPosition = new Vector3();

const cameraTarget = new Vector3();
const mirrorCameraTarget = new Vector3();

const mirrorCameraUp = new Vector3();

const mirrorPlane = new Plane();
const q = new Vector4();
const clipPlane = new Vector4();

export { PlanarReflectionProbe };